(function () {
  const IDENTITY_KEY = "officeos_identity";

  const qs = (name) => new URL(window.location.href).searchParams.get(name);
  const el = (sel, root = document) => root.querySelector(sel);
  const els = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHtml = (str) => String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = (str) => {
    if (!str) return "—";
    const date = new Date(str);
    if (Number.isNaN(date.getTime())) return str;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const debounce = (fn, ms = 300) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), ms);
    };
  };

  const setActiveNav = () => {
    const path = window.location.pathname.split("/").pop();
    els("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      const active = href === path || (path === "" && href === "index.html");
      link.classList.toggle("active", active);
    });
  };

  const storage = {
    get() {
      try {
        return JSON.parse(localStorage.getItem(IDENTITY_KEY) || "{}");
      } catch (err) {
        return {};
      }
    },
    set(data) {
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(data));
    }
  };

  const applyStoredIdentity = () => {
    const stored = storage.get();
    if (!stored || !window.APP_CONFIG) return;
    window.APP_CONFIG = {
      ...window.APP_CONFIG,
      COMPANY_ID: stored.COMPANY_ID || window.APP_CONFIG.COMPANY_ID,
      USER_ID: stored.USER_ID || window.APP_CONFIG.USER_ID,
      ROLE: stored.ROLE || window.APP_CONFIG.ROLE
    };
  };

  const toggleSidebar = () => {
    const sidebar = el(".sidebar");
    if (sidebar) sidebar.classList.toggle("open");
  };

  const renderLayout = () => {
    applyStoredIdentity();

    const app = el("#app");
    if (!app) return;

    const config = window.APP_CONFIG || {};

    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <div class="brand">
            <div class="logo">OS</div>
            <div>
              <div class="title">Office OS</div>
              <div class="sub">HR • Admin • Finance</div>
            </div>
          </div>
          <nav class="nav">
            <a data-nav href="index.html">🏠 Dashboard</a>
            <a data-nav href="employees.html">👥 Employees</a>
            <a data-nav href="leaves.html">🗓️ Leaves</a>
            <a data-nav href="attendance.html">🕒 Attendance</a>
            <a data-nav href="settings.html">⚙️ Settings</a>
            <div class="nav-divider">Office OS Modules</div>
            <a data-nav href="users.html">🧑‍💼 Users</a>
            <a data-nav href="roles.html">🛡️ Roles</a>
            <a data-nav href="approvals.html">✅ Approvals</a>
            <a data-nav href="notifications.html">🔔 Notifications</a>
            <a data-nav href="vault.html">🔐 Vault</a>
            <a data-nav href="audit.html">🧾 Audit</a>
          </nav>
          <div class="sidebar-foot">
            <div class="mini-card">
              <p><strong>API</strong>: ${escapeHtml(config.API_BASE_URL || "")}</p>
              <p><strong>Company</strong>: ${escapeHtml(config.COMPANY_ID || "")}</p>
              <p><strong>User</strong>: ${escapeHtml(config.USER_ID || "")}</p>
            </div>
          </div>
        </aside>
        <main class="main">
          <header class="topbar">
            <div class="topbar-left">
              <button class="icon-btn" id="btnSidebar" aria-label="Toggle sidebar">☰</button>
              <label class="search">
                <span>🔎</span>
                <input placeholder="Search people, approvals, notifications…" />
                <kbd>Ctrl K</kbd>
              </label>
            </div>
            <div class="topbar-right">
              <a class="icon-btn" href="notifications.html" aria-label="Notifications">🔔</a>
              <div class="dropdown">
                <button class="role-chip" id="roleMenuBtn" aria-expanded="false">${escapeHtml(config.ROLE || "ROLE")}</button>
                <div class="dropdown-menu" id="roleMenu" role="menu">
                  <div class="mini-card">
                    <p><strong>Current Role</strong>: ${escapeHtml(config.ROLE || "")}</p>
                    <p class="muted">Use Identity to switch role and company context.</p>
                  </div>
                </div>
              </div>
              <button class="btn small" id="btnIdentity">Identity</button>
            </div>
          </header>
          <section class="content" id="pageContent"></section>
        </main>
      </div>
    `;

    setActiveNav();

    el("#btnSidebar")?.addEventListener("click", toggleSidebar);

    els(".dropdown").forEach((dropdown) => {
      const button = dropdown.querySelector("button");
      const menu = dropdown.querySelector(".dropdown-menu");
      if (!button || !menu) return;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = menu.classList.toggle("open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    document.addEventListener("click", () => {
      els(".dropdown-menu").forEach((menu) => menu.classList.remove("open"));
    });

    el("#btnIdentity")?.addEventListener("click", () => {
      if (!window.Modal) return;
      const modalHtml = `
        <form id="identityForm" class="form-grid">
          <div>
            <label>Company ID</label>
            <input class="input" name="COMPANY_ID" value="${escapeHtml(config.COMPANY_ID || "")}" />
          </div>
          <div>
            <label>User ID</label>
            <input class="input" name="USER_ID" value="${escapeHtml(config.USER_ID || "")}" />
          </div>
          <div>
            <label>Role</label>
            <select name="ROLE">
              ${["MD", "HR", "ADMIN", "MANAGER", "EMPLOYEE"].map((role) => `
                <option value="${role}" ${role === config.ROLE ? "selected" : ""}>${role}</option>
              `).join("")}
            </select>
          </div>
        </form>
        <p class="hint">Identity updates are stored locally in your browser.</p>
      `;

      Modal.open("identity", modalHtml, {
        title: "Set Identity",
        footer: `
          <button class="btn" data-close>Cancel</button>
          <button class="btn primary" id="saveIdentity">Save Identity</button>
        `,
        onClose: () => {}
      });

      el("#saveIdentity")?.addEventListener("click", () => {
        const form = el("#identityForm");
        if (!form) return;
        const data = Object.fromEntries(new FormData(form).entries());
        window.APP_CONFIG.COMPANY_ID = data.COMPANY_ID || window.APP_CONFIG.COMPANY_ID;
        window.APP_CONFIG.USER_ID = data.USER_ID || window.APP_CONFIG.USER_ID;
        window.APP_CONFIG.ROLE = data.ROLE || window.APP_CONFIG.ROLE;
        storage.set({
          COMPANY_ID: window.APP_CONFIG.COMPANY_ID,
          USER_ID: window.APP_CONFIG.USER_ID,
          ROLE: window.APP_CONFIG.ROLE
        });
        Modal.close("identity");
        window.location.reload();
      });
    });
  };

  window.Utils = {
    qs,
    el,
    els,
    escapeHtml,
    formatDate,
    debounce,
    setActiveNav,
    storage,
    renderLayout
  };
})();
