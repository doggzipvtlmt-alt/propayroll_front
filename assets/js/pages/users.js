(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canAccess = Utils.hasRole(["MD", "SUPERUSER"]);

  const content = Layout.render({
    title: "User Administration",
    subtitle: "Manage user accounts, approval states, and role assignments.",
    breadcrumb: ["Administration", "Users"]
  });

  if (!content) return;

  if (!canAccess) {
    content.innerHTML += `
      <div class="card">
        <h3>Access Restricted</h3>
        <p class="muted">Only Superuser and MD roles can access user administration.</p>
      </div>
    `;
    return;
  }

  content.innerHTML += `
    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Users</h3><span class="hint">Active accounts</span></div>
        <div id="userTable"></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Help Panel</h3><span class="hint">Operational tips</span></div>
        <ul class="help-list">
          <li>Deactivate users during offboarding.</li>
          <li>Ensure role requests align with department approvals.</li>
          <li>Superuser approval required for elevated access.</li>
        </ul>
      </div>
    </div>
  `;

  const userTable = Utils.el("#userTable");
  const fallbackUsers = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    role: i % 2 === 0 ? "HR" : "EMPLOYEE",
    status: i % 3 === 0 ? "Inactive" : "Active",
    email: `user${i}@officeos.com`
  }));

  const renderTable = (rows) => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status), exportValue: (r) => r.status }
    ];
    Table.render(userTable, { columns, rows, emptyText: "No users found." });
  };

  Loader.show(userTable);
  const response = await api.get("/api/users", null, { fallbackData: fallbackUsers });
  const users = response.data || fallbackUsers;
  Loader.hide(userTable);
  renderTable(users);
})();
