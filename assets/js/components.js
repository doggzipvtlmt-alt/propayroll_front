(function () {
  const ensureRoot = () => {
    if (!document.getElementById("toast-root")) {
      const toastRoot = document.createElement("div");
      toastRoot.id = "toast-root";
      document.body.appendChild(toastRoot);
    }
    if (!document.getElementById("modal-root")) {
      const modalRoot = document.createElement("div");
      modalRoot.id = "modal-root";
      document.body.appendChild(modalRoot);
    }
  };

  const Toast = {
    show(type = "info", message = "", opts = {}) {
      ensureRoot();
      const root = document.getElementById("toast-root");
      const toast = document.createElement("div");
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <div>
          <strong>${Utils.escapeHtml(opts.title || type.toUpperCase())}</strong>
          <p>${Utils.escapeHtml(message)}</p>
        </div>
        <button class="icon-btn" aria-label="Close">✕</button>
      `;
      const remove = () => toast.remove();
      toast.querySelector("button")?.addEventListener("click", remove);
      root.appendChild(toast);
      setTimeout(remove, opts.ms || 3500);
    }
  };

  const Modal = {
    open(id, html, opts = {}) {
      ensureRoot();
      const root = document.getElementById("modal-root");
      const modal = document.createElement("div");
      modal.className = "modal open";
      modal.setAttribute("data-modal", id);
      modal.innerHTML = `
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-hd">
            <h3>${Utils.escapeHtml(opts.title || "Modal")}</h3>
            <button class="icon-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="modal-bd">${html}</div>
          <div class="modal-ft">${opts.footer || ""}</div>
        </div>
      `;
      root.appendChild(modal);

      modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target.closest("[data-close]")) {
          Modal.close(id);
        }
      });

      document.addEventListener("keydown", function onEsc(event) {
        if (event.key === "Escape") {
          Modal.close(id);
          document.removeEventListener("keydown", onEsc);
        }
      });
    },
    close(id) {
      const modal = document.querySelector(`.modal[data-modal='${id}']`);
      if (modal) modal.remove();
    }
  };

  const Confirm = {
    open({ title = "Confirm", message = "Are you sure?", confirmText = "Confirm", onConfirm }) {
      Modal.open("confirm", `
        <p>${Utils.escapeHtml(message)}</p>
      `, {
        title,
        footer: `
          <button class="btn" data-close>Cancel</button>
          <button class="btn primary" id="confirmAction">${Utils.escapeHtml(confirmText)}</button>
        `
      });

      Utils.el("#confirmAction")?.addEventListener("click", () => {
        if (typeof onConfirm === "function") onConfirm();
        Modal.close("confirm");
      });
    }
  };

  const Loader = {
    show(el) {
      if (!el) return;
      el.dataset.prev = el.innerHTML;
      el.innerHTML = `
        <div class="skeleton">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      `;
    },
    hide(el) {
      if (!el) return;
      if (el.dataset.prev !== undefined) {
        el.innerHTML = el.dataset.prev;
        delete el.dataset.prev;
      }
    }
  };

  const Badge = {
    render(status) {
      const normalized = String(status || "").toLowerCase();
      const map = {
        pending: "pending",
        approved: "approved",
        rejected: "rejected",
        active: "active",
        inactive: "inactive",
        completed: "approved"
      };
      const cls = map[normalized] || "info";
      return `<span class="badge ${cls}">${Utils.escapeHtml(status || "info")}</span>`;
    }
  };

  const Table = {
    toCsv(columns, rows) {
      const headers = columns.map((col) => `"${Utils.escapeHtml(col.label)}"`).join(",");
      const lines = rows.map((row) => columns.map((col) => {
        const raw = typeof col.exportValue === "function"
          ? col.exportValue(row)
          : typeof col.render === "function"
            ? col.render(row)
            : row[col.key];
        return `"${String(raw ?? "").replaceAll('"', '""')}"`;
      }).join(","));
      return [headers, ...lines].join("\n");
    },
    render(el, { columns = [], rows = [], rowActions = null, emptyText = "No data found.", dense = true, sticky = true } = {}) {
      if (!el) return;
      if (!rows || rows.length === 0) {
        EmptyState.render(el, "Nothing here yet", emptyText);
        return;
      }
      const head = columns.map((col) => `<th>${Utils.escapeHtml(col.label)}</th>`).join("");
      const actionHead = rowActions ? "<th>Actions</th>" : "";
      const body = rows.map((row) => {
        const cells = columns.map((col) => {
          const value = typeof col.render === "function" ? col.render(row) : row[col.key];
          return `<td>${value ?? "—"}</td>`;
        }).join("");
        const actions = rowActions ? `<td>${rowActions(row)}</td>` : "";
        return `<tr>${cells}${actions}</tr>`;
      }).join("");
      el.innerHTML = `
        <div class="table-tools">
          <span class="hint">Showing ${rows.length} rows</span>
          <button class="btn small" data-export>Export CSV</button>
        </div>
        <div class="table-wrap ${dense ? "dense" : ""} ${sticky ? "sticky" : ""}">
          <table>
            <thead><tr>${head}${actionHead}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
      el.querySelector("[data-export]")?.addEventListener("click", () => {
        const csv = Table.toCsv(columns, rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "export.csv";
        link.click();
      });
    }
  };

  const Pagination = {
    render(el, { page = 1, pageSize = 10, total = 0, onPageChange }) {
      if (!el) return;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      el.innerHTML = `
        <div class="pagination">
          <button class="btn small" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? "disabled" : ""}>Prev</button>
          <span>Page ${page} of ${totalPages}</span>
          <button class="btn small" data-page="${Math.min(totalPages, page + 1)}" ${page >= totalPages ? "disabled" : ""}>Next</button>
        </div>
      `;
      el.querySelectorAll("button[data-page]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          const next = Number(button.getAttribute("data-page"));
          if (typeof onPageChange === "function") onPageChange(next);
        });
      });
    }
  };

  const Tabs = {
    init(container) {
      if (!container) return;
      const buttons = container.querySelectorAll("[data-tab]");
      const panels = container.querySelectorAll("[data-tab-content]");
      const activate = (key) => {
        buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === key));
        panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.tabContent === key));
      };
      buttons.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.tab)));
      if (buttons[0]) activate(buttons[0].dataset.tab);
    }
  };

  const EmptyState = {
    render(el, title, description, actionHtml = "") {
      if (!el) return;
      el.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <div>
            <h4>${Utils.escapeHtml(title)}</h4>
            <p>${Utils.escapeHtml(description)}</p>
            ${actionHtml}
          </div>
        </div>
      `;
    }
  };

  const Breadcrumb = {
    render(items = []) {
      if (!items.length) return "";
      return `
        <div class="breadcrumb">
          ${items.map((item, idx) => `
            <span>${Utils.escapeHtml(item)}</span>${idx < items.length - 1 ? "<span class='sep'>/</span>" : ""}
          `).join("")}
        </div>
      `;
    }
  };

  const Marquee = {
    render(el, items = []) {
      if (!el) return;
      if (!items.length) {
        el.innerHTML = "";
        return;
      }
      el.innerHTML = `
        <div class="marquee">
          <span class="label">Important Notices</span>
          <div class="marquee-track">
            <div class="marquee-content">${items.map((item) => Utils.escapeHtml(item)).join(" • ")}</div>
          </div>
        </div>
      `;
    }
  };

  const Layout = {
    render({ title = "", subtitle = "", breadcrumb = [], actions = "" } = {}) {
      const app = Utils.el("#app");
      if (!app) return null;
      const session = Utils.getSession();
      const role = Utils.getRoleKey();
      const config = window.APP_CONFIG || {};
      const userName = session?.user?.name || session?.user?.identifier || "User";
      const companyId = session?.company_id || session?.user?.company_id || "—";

      const navItems = [
        { label: "Dashboard", href: "index.html", icon: "🏠", roles: ["SUPERUSER", "MD", "HR", "FINANCE", "EMPLOYEE"] },
        { label: "Employees", href: "employees.html", icon: "👥", roles: ["SUPERUSER", "MD", "HR"] },
        { label: "Leaves", href: "leaves.html", icon: "🗓️", roles: ["SUPERUSER", "MD", "HR", "EMPLOYEE"] },
        { label: "Attendance", href: "attendance.html", icon: "🕒", roles: ["SUPERUSER", "MD", "HR", "EMPLOYEE"] },
        { label: "Performance", href: "employee.html", icon: "📈", roles: ["SUPERUSER", "MD", "HR", "EMPLOYEE"] }
      ];
      const adminItems = [
        { label: "Users", href: "users.html", icon: "🧑‍💼", roles: ["SUPERUSER", "MD"] },
        { label: "Roles", href: "roles.html", icon: "🛡️", roles: ["SUPERUSER", "MD"] },
        { label: "Settings", href: "settings.html", icon: "⚙️", roles: ["SUPERUSER", "MD"] },
        { label: "Audit", href: "audit.html", icon: "🧾", roles: ["SUPERUSER", "MD"] }
      ];
      const hrItems = [
        { label: "Approvals", href: "approvals.html", icon: "✅", roles: ["SUPERUSER", "MD", "HR", "FINANCE"] },
        { label: "Onboarding", href: "employees.html", icon: "🧾", roles: ["SUPERUSER", "MD", "HR"] },
        { label: "Appraisals", href: "#", icon: "🏅", roles: ["SUPERUSER", "MD", "HR"] }
      ];
      const personalItems = [
        { label: "Notifications", href: "notifications.html", icon: "🔔", roles: ["SUPERUSER", "MD", "HR", "FINANCE", "EMPLOYEE"] },
        { label: "Vault", href: "vault.html", icon: "🔐", roles: ["SUPERUSER", "MD", "HR", "FINANCE", "EMPLOYEE"] }
      ];
      const financeItems = [
        { label: "Payroll", href: "#", icon: "💳", roles: ["SUPERUSER", "MD", "FINANCE"] },
        { label: "Expenses", href: "#", icon: "📒", roles: ["SUPERUSER", "MD", "FINANCE"] },
        { label: "Accounting", href: "#", icon: "🧾", roles: ["SUPERUSER", "MD", "FINANCE"] },
        { label: "Reports", href: "#", icon: "📊", roles: ["SUPERUSER", "MD", "FINANCE"] }
      ];
      const governanceItems = [
        { label: "MD Governance", href: "#", icon: "🏛️", roles: ["SUPERUSER", "MD"] },
        { label: "Superuser Desk", href: "#", icon: "🔒", roles: ["SUPERUSER"] }
      ];

      const renderNav = (items) => items.map((item) => {
        const allowed = item.roles.includes(role);
        if (!allowed) return "";
        return `<a data-nav href="${item.href}" ${item.href === "#" ? "class='disabled'" : ""}>${item.icon} ${Utils.escapeHtml(item.label)}</a>`;
      }).join("");

      app.innerHTML = `
        <div class="layout">
          <aside class="sidebar">
            <div class="brand">
              <div class="logo">OS</div>
              <div>
                <div class="title">${Utils.escapeHtml(config.APP_NAME || "Office OS")}</div>
                <div class="sub">${Utils.escapeHtml(config.COMPANY_NAME || "Enterprise Operations")}</div>
              </div>
            </div>
            <div class="nav-section">
              <div class="nav-title">HR Console</div>
              <nav class="nav">${renderNav(navItems)}${renderNav(hrItems)}</nav>
            </div>
            <div class="nav-section">
              <div class="nav-title">Finance</div>
              <nav class="nav">${renderNav(financeItems)}</nav>
            </div>
            <div class="nav-section">
              <div class="nav-title">Governance</div>
              <nav class="nav">${renderNav(governanceItems)}</nav>
            </div>
            <div class="nav-section">
              <div class="nav-title">Administration</div>
              <nav class="nav">${renderNav(adminItems)}</nav>
            </div>
            <div class="nav-section">
              <div class="nav-title">Personal</div>
              <nav class="nav">${renderNav(personalItems)}</nav>
            </div>
            <div class="sidebar-foot">
              <div class="mini-card">
                <p><strong>Company ID</strong>: ${Utils.escapeHtml(companyId)}</p>
                <p><strong>User</strong>: ${Utils.escapeHtml(userName)}</p>
                <p><strong>Role</strong>: ${Utils.escapeHtml(role || "—")}</p>
              </div>
            </div>
          </aside>
          <main class="main">
            <header class="topbar">
              <div class="topbar-left">
                <button class="icon-btn" id="btnSidebar" aria-label="Toggle sidebar">☰</button>
                <div class="topbar-title">
                  <span class="app-name">${Utils.escapeHtml(config.APP_NAME || "Office OS")}</span>
                  <span class="portal-tag">Enterprise Operations Portal</span>
                </div>
              </div>
              <div class="topbar-right">
                <button class="btn small" id="btnPrint">Print</button>
                <a class="icon-btn" href="notifications.html" aria-label="Notifications">🔔</a>
                <div class="dropdown">
                  <button class="role-chip" id="roleMenuBtn" aria-expanded="false">${Utils.escapeHtml(role || "ROLE")}</button>
                  <div class="dropdown-menu" id="roleMenu" role="menu">
                    <div class="mini-card">
                      <p><strong>${Utils.escapeHtml(userName)}</strong></p>
                      <p class="muted">Role: ${Utils.escapeHtml(role || "—")}</p>
                      <p class="muted">Company: ${Utils.escapeHtml(companyId)}</p>
                    </div>
                  </div>
                </div>
                <button class="btn small" id="btnLogout">Logout</button>
              </div>
            </header>
            <div class="subbar">
              <div class="subbar-left">${Breadcrumb.render(breadcrumb)}</div>
              <div class="subbar-right">${actions}</div>
            </div>
            <section class="content" id="pageContent">
              <div class="page-title">
                <div>
                  <h1>${Utils.escapeHtml(title)}</h1>
                  <p class="muted">${Utils.escapeHtml(subtitle)}</p>
                </div>
              </div>
            </section>
            <footer class="footer">
              <span>Request ID: <span id="requestId">${Utils.escapeHtml(window.LAST_REQUEST_ID || "—")}</span></span>
              <span class="muted">API: ${Utils.escapeHtml(config.API_BASE_URL || "")}</span>
            </footer>
          </main>
        </div>
      `;

      Utils.setActiveNav();
      Utils.el("#btnSidebar")?.addEventListener("click", () => {
        const sidebar = Utils.el(".sidebar");
        if (sidebar) sidebar.classList.toggle("open");
      });
      Utils.el("#btnLogout")?.addEventListener("click", Utils.logout);
      Utils.el("#btnPrint")?.addEventListener("click", () => window.print());

      Utils.els(".dropdown").forEach((dropdown) => {
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
        Utils.els(".dropdown-menu").forEach((menu) => menu.classList.remove("open"));
      });

      return Utils.el("#pageContent");
    },
    updateRequestId(value) {
      const el = Utils.el("#requestId");
      if (el) el.textContent = value || "—";
    }
  };

  window.Toast = Toast;
  window.Modal = Modal;
  window.Confirm = Confirm;
  window.Loader = Loader;
  window.Badge = Badge;
  window.Table = Table;
  window.Pagination = Pagination;
  window.Tabs = Tabs;
  window.EmptyState = EmptyState;
  window.Breadcrumb = Breadcrumb;
  window.Marquee = Marquee;
  window.Layout = Layout;
})();
