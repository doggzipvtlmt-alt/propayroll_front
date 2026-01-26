(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canAccess = Utils.hasRole(["ADMIN", "MD"]);

  const content = Layout.render({
    title: "System Settings",
    subtitle: "Maintain master data for departments, designations, and leave types.",
    breadcrumb: ["Admin", "Settings"]
  });

  if (!content) return;

  if (!canAccess) {
    content.innerHTML += `
      <div class="card">
        <h3>Access Restricted</h3>
        <p class="muted">Only ADMIN and MD roles can manage settings.</p>
      </div>
    `;
    return;
  }

  content.innerHTML += `
    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Departments</h3><span class="hint">/api/meta/departments</span></div>
        <div id="departmentsTable"></div>
        <button class="btn small" id="addDepartment">Add Department</button>
      </div>
      <div class="card">
        <div class="hd"><h3>Designations</h3><span class="hint">/api/meta/designations</span></div>
        <div id="designationsTable"></div>
        <button class="btn small" id="addDesignation">Add Designation</button>
      </div>
      <div class="card">
        <div class="hd"><h3>Leave Types</h3><span class="hint">/api/meta/leave-types</span></div>
        <div id="leaveTypesTable"></div>
        <button class="btn small" id="addLeaveType">Add Leave Type</button>
      </div>
      <div class="card">
        <div class="hd"><h3>Notes</h3><span class="hint">Governance</span></div>
        <ul class="help-list">
          <li>Changes are audited automatically.</li>
          <li>Publish new leave types before month close.</li>
          <li>Designations drive payroll bands.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackDepartments = ["Finance", "Engineering", "People Ops"];
  const fallbackDesignations = ["Analyst", "Manager", "Lead"];
  const fallbackLeaveTypes = ["Casual", "Sick", "Privilege"];

  const renderList = (el, items) => {
    Table.render(el, {
      columns: [{ key: "name", label: "Name" }],
      rows: items.map((item) => ({ name: item })),
      emptyText: "No entries"
    });
  };

  const loadMeta = async () => {
    const deptRes = await api.get("/api/meta/departments", null, { fallbackData: fallbackDepartments });
    const desRes = await api.get("/api/meta/designations", null, { fallbackData: fallbackDesignations });
    const leaveRes = await api.get("/api/meta/leave-types", null, { fallbackData: fallbackLeaveTypes });

    renderList(Utils.el("#departmentsTable"), deptRes.data || fallbackDepartments);
    renderList(Utils.el("#designationsTable"), desRes.data || fallbackDesignations);
    renderList(Utils.el("#leaveTypesTable"), leaveRes.data || fallbackLeaveTypes);
  };

  ["addDepartment", "addDesignation", "addLeaveType"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("click", () => Toast.show("info", "CRUD actions connect here."));
  });

  loadMeta();
})();
