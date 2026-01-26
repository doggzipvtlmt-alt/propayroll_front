(function () {
  Components.mountLayout({ activeNav: "roles" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Office OS / Roles</div>
        <h1>Role Control Center</h1>
        <p class="muted">Define access scopes and approval authority across modules.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnNewRole">➕ New Role</button>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Role Filters</h3><span class="hint">Access levels</span></div>
        <div class="bd form-grid">
          <div>
            <label>Search</label>
            <input class="input" id="roleSearch" placeholder="Role name" />
          </div>
          <div>
            <label>Scope</label>
            <select id="roleScope">
              <option value="">All Scopes</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Employee</option>
            </select>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="hd"><h3>Policy Highlights</h3><span class="hint">Summary</span></div>
        <div class="bd">
          <ul class="help-list">
            <li>Admins can view audit logs and vault records.</li>
            <li>Managers can approve leave and attendance changes.</li>
            <li>Employees have read access to their own profiles.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>Roles</h3><span class="hint" id="roleCount">0 roles</span></div>
      <div class="bd" id="roleTable">${Components.loader("Loading roles...")}</div>
    </div>
  `;

  const fallbackRoles = Utils.sampleRange(10, (i) => ({
    id: i + 1,
    name: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Manager" : "Employee",
    scope: i % 2 === 0 ? "Global" : "Department",
    approvals: i % 2 === 0 ? "All" : "Team",
    members: 8 + i
  }));

  let roles = [];

  const roleTable = document.getElementById("roleTable");
  const roleCount = document.getElementById("roleCount");

  function renderTable(rows) {
    const columns = [
      { key: "name", label: "Role" },
      { key: "scope", label: "Scope" },
      { key: "approvals", label: "Approvals" },
      { key: "members", label: "Members" }
    ];
    roleTable.innerHTML = Components.table({ columns, rows, emptyText: "No roles configured." });
  }

  function applyFilters() {
    const search = document.getElementById("roleSearch").value.toLowerCase();
    const scope = document.getElementById("roleScope").value;
    const filtered = roles.filter((row) => {
      const matchesSearch = !search || row.name.toLowerCase().includes(search);
      const matchesScope = !scope || row.name === scope || row.scope === scope;
      return matchesSearch && matchesScope;
    });
    roleCount.textContent = `${filtered.length} roles`;
    renderTable(filtered);
  }

  async function init() {
    try {
      const data = await API.request("/api/roles");
      roles = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackRoles;
    } catch (err) {
      roles = fallbackRoles;
    }
    applyFilters();
  }

  document.getElementById("btnNewRole").addEventListener("click", () => {
    Components.toast({ title: "Role template", message: "Role builder coming soon.", type: "info" });
  });

  ["roleSearch", "roleScope"].forEach((id) => {
    document.getElementById(id).addEventListener("input", applyFilters);
  });

  init();
})();
