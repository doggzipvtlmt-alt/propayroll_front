(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Settings</div>
        <h1>Organization Settings</h1>
        <p class="muted">Maintain core metadata lists for departments, roles, and leave types.</p>
      </div>
    </div>

    <div class="grid two">
      <div class="card" id="departmentsCard"></div>
      <div class="card" id="designationsCard"></div>
    </div>

    <div class="card" id="leaveTypesCard"></div>

    <div class="card">
      <div class="hd"><h3>Help Tips</h3><span class="hint">Administration guidance</span></div>
      <ul class="help-list">
        <li>Keep department names consistent with payroll cost centers.</li>
        <li>Designations map to access permissions in Office OS.</li>
        <li>Leave types drive entitlement calculations in payroll.</li>
      </ul>
    </div>
  `;

  const STORAGE_KEY = "officeos_settings";

  const fallbackState = {
    departments: ["Engineering", "People Ops", "Finance", "Sales"],
    designations: ["Analyst", "Lead", "Manager", "Director"],
    leaveTypes: ["Annual", "Sick", "Casual", "Remote Work"]
  };

  const loadState = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (err) {
      return {};
    }
  };

  const saveState = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const state = { ...fallbackState, ...loadState() };

  const renderListCard = (id, title, items, onAdd, onEdit, onDelete) => {
    const card = Utils.el(id);
    card.innerHTML = `
      <div class="hd">
        <h3>${title}</h3>
        <button class="btn small" data-add>Add</button>
      </div>
      <div data-table></div>
    `;

    const tableEl = card.querySelector("[data-table]");
    Table.render(tableEl, {
      columns: [
        { key: "name", label: title.replace("List", "") }
      ],
      rows: items.map((item) => ({ name: item })),
      rowActions: (row) => `
        <div style="display:flex; gap:6px;">
          <button class="btn small" data-edit="${row.name}">Edit</button>
          <button class="btn small" data-delete="${row.name}">Delete</button>
        </div>
      `,
      emptyText: `No ${title.toLowerCase()} available.`
    });

    card.querySelector("[data-add]")?.addEventListener("click", onAdd);
    tableEl.addEventListener("click", (event) => {
      const editValue = event.target.closest("button[data-edit]")?.dataset.edit;
      const deleteValue = event.target.closest("button[data-delete]")?.dataset.delete;
      if (editValue) onEdit(editValue);
      if (deleteValue) onDelete(deleteValue);
    });
  };

  const promptModal = (title, defaultValue, onSave) => {
    Modal.open("settings", `
      <form id="settingsForm">
        <label>Name</label>
        <input class="input" name="name" value="${Utils.escapeHtml(defaultValue || "")}" required />
      </form>
    `, {
      title,
      footer: `
        <button class="btn" data-close>Cancel</button>
        <button class="btn primary" id="saveSetting">Save</button>
      `
    });

    Utils.el("#saveSetting")?.addEventListener("click", () => {
      const name = new FormData(Utils.el("#settingsForm")).get("name");
      if (name) onSave(name);
      Modal.close("settings");
    });
  };

  const renderAll = () => {
    renderListCard("#departmentsCard", "Departments", state.departments,
      () => promptModal("Add Department", "", (name) => { state.departments.push(name); saveState(state); renderAll(); }),
      (value) => promptModal("Edit Department", value, (name) => {
        state.departments = state.departments.map((item) => item === value ? name : item);
        saveState(state); renderAll();
      }),
      (value) => {
        state.departments = state.departments.filter((item) => item !== value);
        saveState(state); renderAll();
      }
    );

    renderListCard("#designationsCard", "Designations", state.designations,
      () => promptModal("Add Designation", "", (name) => { state.designations.push(name); saveState(state); renderAll(); }),
      (value) => promptModal("Edit Designation", value, (name) => {
        state.designations = state.designations.map((item) => item === value ? name : item);
        saveState(state); renderAll();
      }),
      (value) => {
        state.designations = state.designations.filter((item) => item !== value);
        saveState(state); renderAll();
      }
    );

    renderListCard("#leaveTypesCard", "Leave Types", state.leaveTypes,
      () => promptModal("Add Leave Type", "", (name) => { state.leaveTypes.push(name); saveState(state); renderAll(); }),
      (value) => promptModal("Edit Leave Type", value, (name) => {
        state.leaveTypes = state.leaveTypes.map((item) => item === value ? name : item);
        saveState(state); renderAll();
      }),
      (value) => {
        state.leaveTypes = state.leaveTypes.filter((item) => item !== value);
        saveState(state); renderAll();
      }
    );
  };

  const loadMeta = async () => {
    const [departments, designations, leaveTypes] = await Promise.all([
      api.get("/api/meta/departments"),
      api.get("/api/meta/designations"),
      api.get("/api/meta/leave-types")
    ]);

    if (departments.ok) state.departments = departments.data;
    if (designations.ok) state.designations = designations.data;
    if (leaveTypes.ok) state.leaveTypes = leaveTypes.data;
    renderAll();
  };

  renderAll();
  loadMeta();
})();
