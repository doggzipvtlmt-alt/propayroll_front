(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canAccess = Utils.hasRole(["MD", "ADMIN"]);

  const content = Layout.render({
    title: "Roles & Permissions",
    subtitle: "Review role policies and assigned privileges.",
    breadcrumb: ["Admin", "Roles"]
  });

  if (!content) return;

  if (!canAccess) {
    content.innerHTML += `
      <div class="card">
        <h3>Access Restricted</h3>
        <p class="muted">Only ADMIN and MD roles can access role configuration.</p>
      </div>
    `;
    return;
  }

  content.innerHTML += `
    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Role List</h3><span class="hint">Policy matrix</span></div>
        <div id="roleTable"></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Role Notes</h3><span class="hint">Compliance</span></div>
        <ul class="help-list">
          <li>ADMIN and MD have audit visibility.</li>
          <li>HR can approve leave and manage employees.</li>
          <li>EMPLOYEE role is read-only for HR modules.</li>
        </ul>
      </div>
    </div>
  `;

  const roleTable = Utils.el("#roleTable");
  const fallbackRoles = [
    { id: 1, role: "MD", description: "Full governance access" },
    { id: 2, role: "ADMIN", description: "System administration" },
    { id: 3, role: "HR", description: "HR operations" },
    { id: 4, role: "EMPLOYEE", description: "Self-service" }
  ];

  const renderTable = (rows) => {
    const columns = [
      { key: "role", label: "Role" },
      { key: "description", label: "Description" }
    ];
    Table.render(roleTable, { columns, rows, emptyText: "No roles found." });
  };

  Loader.show(roleTable);
  const response = await api.get("/api/roles", null, { fallbackData: fallbackRoles });
  const roles = response.data || fallbackRoles;
  Loader.hide(roleTable);
  renderTable(roles);
})();
