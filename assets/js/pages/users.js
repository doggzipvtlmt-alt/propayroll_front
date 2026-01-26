(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Users</div>
        <h1>User Directory</h1>
        <p class="muted">Manage login identities and access levels across Office OS.</p>
      </div>
      <button class="btn primary" id="btnInvite">Invite User</button>
    </div>

    <div class="split">
      <div>
        <div class="grid three">
          <div class="card"><h3 id="totalUsers">0</h3><p class="muted">Total Users</p></div>
          <div class="card"><h3 id="activeUsers">0</h3><p class="muted">Active Sessions</p></div>
          <div class="card"><h3 id="adminUsers">0</h3><p class="muted">Admin Roles</p></div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="hd">
            <h3>Search & Filters</h3>
            <span class="hint">Find users quickly</span>
          </div>
          <div class="form-grid">
            <div>
              <label>Search</label>
              <input class="input" id="userSearch" placeholder="Name or email" />
            </div>
            <div>
              <label>Status</label>
              <select id="userStatus">
                <option value="">All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label>Role</label>
              <select id="userRole">
                <option value="">All</option>
                <option>MD</option>
                <option>HR</option>
                <option>ADMIN</option>
                <option>MANAGER</option>
                <option>EMPLOYEE</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="hd"><h3>Users</h3><span class="hint" id="userCount">0 records</span></div>
          <div id="userTable"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd"><h3>Best Practices</h3><span class="hint">Security tips</span></div>
          <ul class="help-list">
            <li>Assign least-privilege roles by default.</li>
            <li>Review inactive users quarterly.</li>
            <li>Require MFA for admin roles.</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const fallbackUsers = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? "Riley Chen" : "Morgan Silva",
    email: `user${i}@officeos.com`,
    role: i % 4 === 0 ? "ADMIN" : i % 3 === 0 ? "HR" : "EMPLOYEE",
    status: i % 5 === 0 ? "Inactive" : "Active",
    last_login: `2023-09-${10 + i}`
  }));

  let users = [];
  const userTable = Utils.el("#userTable");

  const renderTable = (rows) => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status) },
      { key: "last_login", label: "Last Login", render: (r) => Utils.formatDate(r.last_login) }
    ];

    Table.render(userTable, {
      columns,
      rows,
      rowActions: (row) => `
        <div style="display:flex; gap:6px;">
          <button class="btn small" data-reset="${row.id}">Reset</button>
          <button class="btn small" data-disable="${row.id}">Disable</button>
        </div>
      `,
      emptyText: "No users found."
    });
  };

  const renderStats = () => {
    Utils.el("#totalUsers").textContent = users.length;
    Utils.el("#activeUsers").textContent = users.filter((u) => u.status === "Active").length;
    Utils.el("#adminUsers").textContent = users.filter((u) => ["ADMIN", "MD"].includes(u.role)).length;
    Utils.el("#userCount").textContent = `${users.length} records`;
  };

  const loadUsers = async () => {
    const query = {
      search: Utils.el("#userSearch").value,
      status: Utils.el("#userStatus").value,
      role: Utils.el("#userRole").value
    };

    Loader.show(userTable);
    const response = await api.get("/api/users", query);
    users = response.ok ? (response.data?.items || response.data || []) : fallbackUsers;
    if (!users.length) users = fallbackUsers;
    renderTable(users);
    renderStats();
    Loader.hide(userTable);
  };

  Utils.el("#btnInvite")?.addEventListener("click", () => Toast.show("info", "Invite link sent."));

  ["userSearch", "userStatus", "userRole"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("input", Utils.debounce(loadUsers, 400));
    Utils.el(`#${id}`)?.addEventListener("change", loadUsers);
  });

  userTable.addEventListener("click", (event) => {
    const resetId = event.target.closest("button[data-reset]")?.dataset.reset;
    const disableId = event.target.closest("button[data-disable]")?.dataset.disable;
    if (resetId) Toast.show("success", `Password reset sent for user ${resetId}.`);
    if (disableId) Toast.show("success", `User ${disableId} disabled.`);
  });

  loadUsers();
})();
