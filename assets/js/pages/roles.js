(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Roles</div>
        <h1>Roles & Permissions</h1>
        <p class="muted">Define access levels and permission sets for Office OS.</p>
      </div>
      <button class="btn primary" id="btnAddRole">Add Role</button>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Role Summary</h3><span class="hint">Access overview</span></div>
        <div class="grid three">
          <div><strong id="roleCount">0</strong><p class="muted">Roles</p></div>
          <div><strong>24</strong><p class="muted">Permissions</p></div>
          <div><strong>8</strong><p class="muted">Admin Workflows</p></div>
        </div>
      </div>
      <div class="card">
        <div class="hd"><h3>Best Practices</h3><span class="hint">Security guidance</span></div>
        <ul class="help-list">
          <li>Review roles quarterly for least privilege.</li>
          <li>Separate approval and payroll permissions.</li>
          <li>Enable audit logging for privileged roles.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>Roles</h3><span class="hint">Role library</span></div>
      <div id="roleTable"></div>
    </div>
  `;

  const fallbackRoles = [
    { id: 1, name: "MD", scope: "All Modules", users: 2, status: "Active" },
    { id: 2, name: "HR", scope: "People + Leaves", users: 6, status: "Active" },
    { id: 3, name: "ADMIN", scope: "System", users: 3, status: "Active" },
    { id: 4, name: "MANAGER", scope: "Approvals", users: 12, status: "Active" },
    { id: 5, name: "EMPLOYEE", scope: "Self Service", users: 185, status: "Active" }
  ];

  let roles = [];
  const roleTable = Utils.el("#roleTable");

  const renderTable = () => {
    const columns = [
      { key: "name", label: "Role" },
      { key: "scope", label: "Scope" },
      { key: "users", label: "Users" },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status) }
    ];

    Table.render(roleTable, {
      columns,
      rows: roles,
      rowActions: (row) => `
        <div style="display:flex; gap:6px;">
          <button class="btn small" data-edit="${row.id}">Edit</button>
          <button class="btn small" data-archive="${row.id}">Archive</button>
        </div>
      `,
      emptyText: "No roles configured."
    });
    Utils.el("#roleCount").textContent = roles.length;
  };

  const loadRoles = async () => {
    Loader.show(roleTable);
    const response = await api.get("/api/roles");
    roles = response.ok ? (response.data?.items || response.data || []) : fallbackRoles;
    if (!roles.length) roles = fallbackRoles;
    renderTable();
    Loader.hide(roleTable);
  };

  Utils.el("#btnAddRole")?.addEventListener("click", () => Toast.show("info", "Role creation wizard coming soon."));

  roleTable.addEventListener("click", (event) => {
    if (event.target.closest("button[data-edit]")) {
      Toast.show("info", "Edit role permissions in the admin console.");
    }
    if (event.target.closest("button[data-archive]")) {
      Toast.show("success", "Role archived.");
    }
  });

  loadRoles();
})();
