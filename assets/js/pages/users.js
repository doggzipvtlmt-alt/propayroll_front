(function () {
  Components.mountLayout({ activeNav: "users" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Office OS / Users</div>
        <h1>Users Directory</h1>
        <p class="muted">Manage access and visibility for all system users.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnInvite">Invite User</button>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Filters</h3>
        <span class="hint">Search by role or department</span>
      </div>
      <div class="bd form-grid">
        <div>
          <label>Search</label>
          <input class="input" id="userSearch" placeholder="Name or email" />
        </div>
        <div>
          <label>Role</label>
          <select id="userRole">
            <option value="">All Roles</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Employee</option>
          </select>
        </div>
        <div>
          <label>Status</label>
          <select id="userStatus">
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Users</h3>
        <span class="hint" id="userCount">0 users</span>
      </div>
      <div class="bd" id="userTable">${Components.loader("Loading users...")}</div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Help Tips</h3>
        <span class="hint">Access management</span>
      </div>
      <div class="bd">
        <ul class="help-list">
          <li>Assign roles carefully to protect sensitive modules.</li>
          <li>Deactivate former employees immediately.</li>
          <li>Enable MFA for admin accounts.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackUsers = Utils.sampleRange(12, (i) => ({
    id: i + 1,
    name: i % 2 === 0 ? "Taylor Morgan" : "Jordan Lee",
    email: `user${i}@officeos.com`,
    role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Manager" : "Employee",
    department: i % 2 === 0 ? "Engineering" : "Finance",
    status: i % 4 === 0 ? "inactive" : "active",
    last_active: "2024-03-02 10:45"
  }));

  let users = [];

  const userTable = document.getElementById("userTable");
  const userCount = document.getElementById("userCount");

  function renderTable(rows) {
    const columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "status", label: "Status", render: (r) => Components.badge(r.status, r.status) },
      { key: "last_active", label: "Last Active" }
    ];

    userTable.innerHTML = Components.table({ columns, rows, emptyText: "No users found." });
  }

  function applyFilters() {
    const search = document.getElementById("userSearch").value.toLowerCase();
    const role = document.getElementById("userRole").value;
    const status = document.getElementById("userStatus").value;
    const filtered = users.filter((row) => {
      const matchesSearch = !search || row.name.toLowerCase().includes(search) || row.email.toLowerCase().includes(search);
      const matchesRole = !role || row.role === role;
      const matchesStatus = !status || row.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
    userCount.textContent = `${filtered.length} users`;
    renderTable(filtered);
  }

  async function init() {
    try {
      const data = await API.request("/api/users");
      users = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackUsers;
    } catch (err) {
      users = fallbackUsers;
    }
    applyFilters();
  }

  document.getElementById("btnInvite").addEventListener("click", () => {
    Components.toast({ title: "Invite sent", message: "User invitation email queued.", type: "success" });
  });

  ["userSearch", "userRole", "userStatus"].forEach((id) => {
    document.getElementById(id).addEventListener("input", applyFilters);
  });

  init();
})();
