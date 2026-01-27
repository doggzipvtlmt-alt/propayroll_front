function createBadge(label, variant = "success") {
  return `<span class="status-badge ${variant}">${label}</span>`;
}

function renderTable({ columns, rows, actions = [] }) {
  const header = columns.map((col) => `<th>${col.label}</th>`).join("");
  const body = rows
    .map((row) => {
      const cols = columns
        .map((col) => `<td>${row[col.key] ?? "-"}</td>`)
        .join("");
      const actionCells = actions.length
        ? `<td class="actions">${actions
            .map((action) => `<button class="${action.class}" data-action="${action.key}" data-id="${row.id || row.code}">${action.label}</button>`)
            .join("")}</td>`
        : "";
      return `<tr>${cols}${actionCells}</tr>`;
    })
    .join("");
  const actionHeader = actions.length ? "<th>Actions</th>" : "";
  return `
    <table class="table">
      <thead><tr>${header}${actionHeader}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderPagination(current = 1, total = 5) {
  let buttons = "";
  for (let i = 1; i <= total; i += 1) {
    buttons += `<button class="secondary" ${i === current ? "disabled" : ""}>${i}</button>`;
  }
  return `<div class="actions" aria-label="pagination">${buttons}</div>`;
}

function showToast(message, variant = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toast.style.borderLeftColor = variant === "error" ? "var(--danger)" : "var(--primary)";
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function showModal(title, message) {
  let backdrop = document.querySelector(".modal-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal">
        <h3>${title}</h3>
        <p style="margin: 12px 0; font-size: 14px; color: var(--muted);">${message}</p>
        <div style="text-align: right;">
          <button class="secondary" data-close="modal">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (event) => {
      if (event.target.dataset.close === "modal" || event.target === backdrop) {
        backdrop.style.display = "none";
      }
    });
  }
  backdrop.style.display = "flex";
}

function showLoader(target) {
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = "<span></span><span></span><span></span> Loading...";
  target.appendChild(loader);
  loader.style.display = "flex";
  return loader;
}

function hideLoader(loader) {
  if (loader) loader.remove();
}

function renderSidebar(role) {
  const menus = {
    MAKER: [
      { label: "Approvals", href: "maker-approvals.html" },
      { label: "Users", href: "maker-users.html" },
      { label: "Limits", href: "maker-limits.html" },
      { label: "Audit", href: "maker-approvals.html#activity" }
    ],
    HR: [
      { label: "Employees", href: "employees.html" },
      { label: "Appraisals", href: "appraisals.html" },
      { label: "Promotions", href: "promotions.html" },
      { label: "Requests", href: "employees.html#requests" }
    ],
    FINANCE: [
      { label: "Payroll Finance", href: "payroll-finance.html" },
      { label: "Revenue", href: "revenue.html" },
      { label: "Expenses", href: "expenses.html" },
      { label: "Reports", href: "reports.html" },
      { label: "Imports/Exports", href: "import-export.html" }
    ],
    MD: [
      { label: "Approvals", href: "maker-approvals.html" },
      { label: "Dashboards", href: "dashboard.html" },
      { label: "Limits", href: "maker-limits.html" },
      { label: "Reviews", href: "appraisals.html" }
    ],
    EMPLOYEE: [
      { label: "My Profile", href: "my-profile.html" },
      { label: "Attendance", href: "attendance.html" },
      { label: "Leaves", href: "leaves.html" },
      { label: "Payslips", href: "payslips.html" },
      { label: "Tickets", href: "tickets.html" },
      { label: "Notices", href: "notices.html" },
      { label: "Surveys", href: "surveys.html" }
    ]
  };
  const links = menus[role] || menus.EMPLOYEE;
  return `
    <aside class="sidebar">
      <h2>DOGGZI HRMS</h2>
      <div class="role-badge">${role}</div>
      <nav>
        <a href="dashboard.html">Dashboard</a>
        ${links
          .map((link) => `<a href="${link.href}">${link.label}</a>`)
          .join("")}
      </nav>
    </aside>
  `;
}

function renderTopbar(title) {
  const name = getUserName();
  return `
    <header class="topbar">
      <div class="title">${title}</div>
      <div class="actions">
        <span class="small">${name}</span>
        <button class="secondary" id="logoutBtn">Logout</button>
      </div>
    </header>
  `;
}

function renderHelpPanel() {
  return `
    <aside class="help-panel">
      <h4 style="margin-bottom: 8px;">Need Assistance?</h4>
      <p>Use the internal HRMS helpdesk for process guidance and escalation.</p>
      <ul style="margin: 10px 0 0 18px;">
        <li>Support email: helpdesk@doggzi.com</li>
        <li>Escalation: Maker &gt; MD oversight</li>
        <li>Policy updates: Intranet notices</li>
      </ul>
      <div style="margin-top: 12px;">
        ${createBadge("System Status: Stable", "success")}
      </div>
    </aside>
  `;
}

function initPage({ title, content, onReady }) {
  const role = getUserRole();
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <div class="page-wrapper">
      ${renderSidebar(role)}
      <div class="main-content">
        ${renderTopbar(title)}
        <div class="content-area">
          <div class="content-panel">${content}</div>
          ${renderHelpPanel()}
        </div>
      </div>
    </div>
  `;
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
  setActiveLink(window.location.pathname.split("/").pop());
  if (onReady) onReady();
}
