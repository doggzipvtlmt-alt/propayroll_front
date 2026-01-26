(function () {
  function ensureRoots() {
    if (!document.getElementById("toast-root")) {
      const t = document.createElement("div");
      t.id = "toast-root";
      document.body.appendChild(t);
    }
    if (!document.getElementById("modal-root")) {
      const m = document.createElement("div");
      m.id = "modal-root";
      m.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-card" tabindex="-1">
            <div class="modal-hd">
              <h3 id="modal-title">Modal</h3>
              <button class="icon-btn close" aria-label="Close">✕</button>
            </div>
            <div class="modal-bd" id="modal-body"></div>
            <div class="modal-ft" id="modal-footer"></div>
          </div>
        </div>
      `;
      document.body.appendChild(m);
    }
  }

  function mountLayout({ activeNav = "dashboard" } = {}) {
    const app = document.getElementById("app");
    if (!app) return;
    const config = window.APP_CONFIG || {};

    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <div class="brand">
            <div class="logo">OS</div>
            <div class="meta">
              <div class="title">Office OS</div>
              <div class="sub">Unified Operations Console</div>
            </div>
          </div>
          <nav class="nav">
            <a data-nav="dashboard" href="index.html"><span class="icon">🏠</span>Dashboard</a>
            <a data-nav="employees" href="employees.html"><span class="icon">👥</span>Employees</a>
            <a data-nav="leaves" href="leaves.html"><span class="icon">🗓️</span>Leaves</a>
            <a data-nav="attendance" href="attendance.html"><span class="icon">🕒</span>Attendance</a>
            <a data-nav="settings" href="settings.html"><span class="icon">⚙️</span>Settings</a>
            <div class="nav-divider">Office OS Modules</div>
            <a data-nav="users" href="users.html"><span class="icon">🧑‍💼</span>Users</a>
            <a data-nav="roles" href="roles.html"><span class="icon">🛡️</span>Roles</a>
            <a data-nav="approvals" href="approvals.html"><span class="icon">✅</span>Approvals</a>
            <a data-nav="notifications" href="notifications.html"><span class="icon">🔔</span>Notifications</a>
            <a data-nav="vault" href="vault.html"><span class="icon">🔐</span>Vault</a>
            <a data-nav="audit" href="audit.html"><span class="icon">🧾</span>Audit</a>
          </nav>
          <div class="sidebar-foot">
            <div class="mini-card">
              <h4>Environment</h4>
              <p>API: <strong>${Utils.escapeHtml(config.API_BASE_URL || "")}</strong></p>
              <p>Company: ${Utils.escapeHtml(config.COMPANY_ID || "")}</p>
            </div>
          </div>
        </aside>

        <main class="main">
          <header class="topbar">
            <div class="left">
              <button class="icon-btn hamburger" id="btnSidebar" aria-label="Toggle sidebar">☰</button>
              <label class="search">
                <span>🔎</span>
                <input id="globalSearch" placeholder="Search employees, approvals, notifications…" />
                <kbd>Ctrl K</kbd>
              </label>
            </div>
            <div class="right">
              <div class="dropdown">
                <button class="icon-btn" id="btnNoti" aria-expanded="false" aria-controls="notiMenu">🔔<span class="dot"></span></button>
                <div class="dropdown-menu" id="notiMenu" role="menu">
                  <h4>Notifications</h4>
                  <div class="empty">No new alerts</div>
                </div>
              </div>
              <div class="dropdown">
                <button class="user" id="btnUser" aria-expanded="false" aria-controls="userMenu">
                  <span class="avatar">${Utils.escapeHtml((config.USER_ID || "U").slice(0, 1))}</span>
                  <span>
                    <span class="name">${Utils.escapeHtml(config.USER_ID || "User")}</span>
                    <span class="role">${Utils.escapeHtml(config.ROLE || "Role")}</span>
                  </span>
                </button>
                <div class="dropdown-menu" id="userMenu" role="menu">
                  <div class="mini-card">
                    <p><strong>Company</strong>: ${Utils.escapeHtml(config.COMPANY_ID || "")}</p>
                    <p><strong>User</strong>: ${Utils.escapeHtml(config.USER_ID || "")}</p>
                    <p><strong>Role</strong>: ${Utils.escapeHtml(config.ROLE || "")}</p>
                    <p class="muted">Last Request: ${Utils.escapeHtml(window.APP_STATE?.last_request_id || "—")}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <section class="content" id="pageContent"></section>
        </main>
      </div>
    `;

    Utils.setActiveNav(activeNav);

    const btnSidebar = document.getElementById("btnSidebar");
    if (btnSidebar) {
      btnSidebar.addEventListener("click", () => Utils.toggleSidebar());
    }

    const dropdowns = Utils.qsa(".dropdown");
    dropdowns.forEach((dd) => {
      const button = dd.querySelector("button");
      const menu = dd.querySelector(".dropdown-menu");
      if (!button || !menu) return;
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = menu.classList.toggle("open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    document.addEventListener("click", () => {
      Utils.qsa(".dropdown-menu").forEach((menu) => menu.classList.remove("open"));
    });
  }

  function toast({ title = "Info", message = "", type = "info", ms = 3500 } = {}) {
    ensureRoots();
    const root = document.getElementById("toast-root");
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `
      <div>
        <strong>${Utils.escapeHtml(title)}</strong>
        <p>${Utils.escapeHtml(message)}</p>
      </div>
      <button class="icon-btn" aria-label="Close">✕</button>
    `;
    const remove = () => el.remove();
    el.querySelector("button").addEventListener("click", remove);
    root.appendChild(el);
    setTimeout(remove, ms);
  }

  function badge(text, variant = "info") {
    return `<span class="badge ${variant}">${Utils.escapeHtml(text)}</span>`;
  }

  function openModal({ title = "Modal", bodyHtml = "", footerHtml = "", onClose = null } = {}) {
    ensureRoots();
    const root = document.getElementById("modal-root");
    Utils.qs("#modal-title", root).textContent = title;
    Utils.qs("#modal-body", root).innerHTML = bodyHtml;
    Utils.qs("#modal-footer", root).innerHTML = footerHtml;

    const closeBtn = Utils.qs(".close", root);
    const modalCard = Utils.qs(".modal-card", root);

    const close = () => {
      root.classList.remove("open");
      if (typeof onClose === "function") onClose();
    };

    const trap = (e) => {
      if (e.key !== "Tab") return;
      const focusable = root.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    closeBtn.onclick = close;
    root.onclick = (e) => { if (e.target === root) close(); };
    document.onkeydown = (e) => { if (e.key === "Escape") close(); };
    root.addEventListener("keydown", trap);

    root.classList.add("open");
    modalCard.focus();
    return { close };
  }

  function table({ columns = [], rows = [], rowActions = null, emptyText = "No data found." } = {}) {
    if (!rows || rows.length === 0) {
      return emptyState({ title: "Nothing here yet", description: emptyText });
    }

    const th = columns.map((c) => `<th>${Utils.escapeHtml(c.label)}</th>`).join("");
    const actionTh = rowActions ? `<th>Actions</th>` : "";

    const tb = rows.map((r) => {
      const tds = columns.map((c) => {
        const raw = typeof c.render === "function" ? c.render(r) : r[c.key];
        return `<td>${raw ?? "—"}</td>`;
      }).join("");
      const acts = rowActions ? `<td>${rowActions(r)}</td>` : "";
      return `<tr>${tds}${acts}</tr>`;
    }).join("");

    return `<div class="table-wrap">
      <table>
        <thead><tr>${th}${actionTh}</tr></thead>
        <tbody>${tb}</tbody>
      </table>
    </div>`;
  }

  function loader(text = "Loading...") {
    return `
      <div class="loader">
        <div class="spinner"></div>
        <p>${Utils.escapeHtml(text)}</p>
      </div>
    `;
  }

  function pagination({ page = 1, totalPages = 1, onChange }) {
    const wrap = document.createElement("div");
    wrap.className = "pagination";
    wrap.innerHTML = `
      <button class="btn small" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? "disabled" : ""}>Prev</button>
      <span>Page ${page} of ${totalPages}</span>
      <button class="btn small" data-page="${Math.min(totalPages, page + 1)}" ${page >= totalPages ? "disabled" : ""}>Next</button>
    `;
    wrap.addEventListener("click", (e) => {
      const target = e.target.closest("button[data-page]");
      if (!target || target.disabled) return;
      const next = Number(target.getAttribute("data-page"));
      if (typeof onChange === "function") onChange(next);
    });
    return wrap;
  }

  function tabs({ tabs = [], active = "" } = {}) {
    const nav = tabs.map((tab) => `
      <button class="tab ${tab.key === active ? "active" : ""}" data-tab="${tab.key}">${Utils.escapeHtml(tab.label)}</button>
    `).join("");
    return `<div class="tabs">${nav}</div>`;
  }

  function emptyState({ title = "No data", description = "No records found." } = {}) {
    return `
      <div class="empty-state">
        <div class="icon">📭</div>
        <div>
          <h4>${Utils.escapeHtml(title)}</h4>
          <p>${Utils.escapeHtml(description)}</p>
        </div>
      </div>
    `;
  }

  window.Components = {
    mountLayout,
    toast,
    badge,
    openModal,
    table,
    loader,
    pagination,
    tabs,
    emptyState
  };
})();
