(function () {
  Components.mountLayout({ activeNav: "settings" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Settings</div>
        <h1>Workspace Settings</h1>
        <p class="muted">Manage organization metadata and workflow preferences.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnSaveSettings">Save Changes</button>
      </div>
    </div>

    <div class="grid two">
      <div class="card" id="departmentsCard"></div>
      <div class="card" id="designationsCard"></div>
    </div>

    <div class="grid two">
      <div class="card" id="leaveTypesCard"></div>
      <div class="card">
        <div class="hd">
          <h3>Workflow Defaults</h3>
          <span class="hint">Placeholder UI</span>
        </div>
        <div class="bd form-grid">
          <div>
            <label>Default Approver</label>
            <input class="input" value="HR Ops" />
          </div>
          <div>
            <label>Auto-Notify Managers</label>
            <select>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div>
            <label>Payroll Sync Window</label>
            <select>
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Help Tips</h3>
        <span class="hint">Configuration checklist</span>
      </div>
      <div class="bd">
        <ul class="help-list">
          <li>Align department names with payroll provider mapping.</li>
          <li>Keep leave types aligned to policy documents.</li>
          <li>Review designation lists quarterly.</li>
        </ul>
      </div>
    </div>
  `;

  const departmentsCard = document.getElementById("departmentsCard");
  const designationsCard = document.getElementById("designationsCard");
  const leaveTypesCard = document.getElementById("leaveTypesCard");

  const fallbackDepartments = ["Engineering", "People Ops", "Finance", "Sales"];
  const fallbackDesignations = ["Analyst", "Associate", "Lead", "Manager"];
  const fallbackLeaveTypes = ["Annual", "Sick", "WFH", "Maternity"];

  function renderList(card, title, items) {
    card.innerHTML = `
      <div class="hd">
        <h3>${Utils.escapeHtml(title)}</h3>
        <span class="hint">${items.length} items</span>
      </div>
      <div class="bd">
        ${items.map((item) => `<div class="mini-card" style="margin-bottom:10px;">${Utils.escapeHtml(item)}</div>`).join("")}
        <button class="btn small">+ Add ${Utils.escapeHtml(title.slice(0, -1))}</button>
      </div>
    `;
  }

  async function init() {
    let departments = fallbackDepartments;
    let designations = fallbackDesignations;
    let leaveTypes = fallbackLeaveTypes;

    try {
      const data = await API.request("/api/meta/departments");
      departments = Array.isArray(data) ? data : departments;
    } catch (err) {
      departments = fallbackDepartments;
    }

    try {
      const data = await API.request("/api/meta/designations");
      designations = Array.isArray(data) ? data : designations;
    } catch (err) {
      designations = fallbackDesignations;
    }

    try {
      const data = await API.request("/api/meta/leave-types");
      leaveTypes = Array.isArray(data) ? data : leaveTypes;
    } catch (err) {
      leaveTypes = fallbackLeaveTypes;
    }

    renderList(departmentsCard, "Departments", departments);
    renderList(designationsCard, "Designations", designations);
    renderList(leaveTypesCard, "Leave Types", leaveTypes);
  }

  document.getElementById("btnSaveSettings").addEventListener("click", () => {
    Components.toast({
      title: "Saved",
      message: "Settings saved locally. Backend update coming soon.",
      type: "success"
    });
  });

  init();
})();
