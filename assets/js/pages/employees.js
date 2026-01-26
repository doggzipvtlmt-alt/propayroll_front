(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canManage = Utils.hasRole(["HR", "MD", "ADMIN"]);

  const content = Layout.render({
    title: "Employee Directory",
    subtitle: "Search, onboard, and manage employee records across departments.",
    breadcrumb: ["People", "Employees"],
    actions: canManage ? "<button class='btn small' id='btnAddEmployee'>Add Employee</button>" : ""
  });

  if (!content) return;

  content.innerHTML += `
    <div class="card">
      <div class="hd">
        <h3>Filters & Search</h3>
        <span class="hint">Structured employee filters</span>
      </div>
      <div class="form-grid">
        <div>
          <label>Search</label>
          <input class="input" id="searchInput" placeholder="Name, email, employee code" />
        </div>
        <div>
          <label>Department</label>
          <select id="departmentFilter">
            <option value="">All Departments</option>
            <option>Engineering</option>
            <option>People Ops</option>
            <option>Finance</option>
            <option>Sales</option>
          </select>
        </div>
        <div>
          <label>Designation</label>
          <select id="designationFilter">
            <option value="">All Designations</option>
            <option>Manager</option>
            <option>Analyst</option>
            <option>Lead</option>
            <option>Associate</option>
          </select>
        </div>
        <div>
          <label>Status</label>
          <select id="statusFilter">
            <option value="">Any Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label>Sort By</label>
          <select id="sortBy">
            <option value="name">Name</option>
            <option value="department">Department</option>
            <option value="join_date">Join Date</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid two" style="margin-top:16px;">
      <div class="card">
        <div class="hd">
          <h3>Employee List</h3>
          <span class="hint" id="employeeCount">0 records</span>
        </div>
        <div id="employeeTable"></div>
        <div id="employeePagination"></div>
      </div>
      <div class="card">
        <div class="hd">
          <h3>HR Notes</h3>
          <span class="hint">Operational guidance</span>
        </div>
        <div class="form-row">
          <label>Last Sync</label>
          <div>Today, 09:45 AM</div>
        </div>
        <div class="form-row">
          <label>Onboarding Queue</label>
          <div>6 pending profiles</div>
        </div>
        <div class="form-row">
          <label>Audit Flagged</label>
          <div>2 employees</div>
        </div>
        <ul class="help-list" style="margin-top:12px;">
          <li>Keep employee codes aligned with payroll.</li>
          <li>Inactive employees remain searchable for audit history.</li>
          <li>Verify manager assignments quarterly.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackEmployees = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    emp_code: `EMP-${1000 + i}`,
    name: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    department: i % 3 === 0 ? "Engineering" : i % 3 === 1 ? "Finance" : "People Ops",
    designation: i % 2 === 0 ? "Lead" : "Analyst",
    manager: i % 2 === 0 ? "Maria Thomas" : "Chen Wu",
    join_date: `2022-0${(i % 9) + 1}-15`,
    status: i % 4 === 0 ? "Inactive" : "Active",
    email: `user${i}@officeos.com`,
    phone: "+1-202-555-01" + String(i).padStart(2, "0")
  }));

  let employees = [];
  let page = 1;
  const pageSize = 10;
  let total = 0;

  const employeeTable = Utils.el("#employeeTable");
  const employeePagination = Utils.el("#employeePagination");
  const employeeCount = Utils.el("#employeeCount");

  const renderTable = (rows) => {
    const columns = [
      { key: "emp_code", label: "Emp Code" },
      { key: "name", label: "Name" },
      { key: "department", label: "Dept" },
      { key: "designation", label: "Designation" },
      { key: "manager", label: "Manager" },
      { key: "join_date", label: "Join Date", render: (r) => Utils.formatDate(r.join_date), exportValue: (r) => r.join_date },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status), exportValue: (r) => r.status },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" }
    ];

    const rowActions = (row) => {
      const viewBtn = `<a class="btn small" href="employee.html?id=${row.id}">View Profile</a>`;
      if (!canManage) return viewBtn;
      return `
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${viewBtn}
          <button class="btn small" data-edit="${row.id}">Edit</button>
          <button class="btn small" data-delete="${row.id}">Delete</button>
        </div>
      `;
    };

    Table.render(employeeTable, { columns, rows, rowActions, emptyText: "No employees found." });
  };

  const renderPagination = () => {
    Pagination.render(employeePagination, {
      page,
      pageSize,
      total,
      onPageChange: (next) => {
        page = next;
        loadEmployees();
      }
    });
  };

  const openEmployeeModal = ({ mode = "add", data = {} } = {}) => {
    const isEdit = mode === "edit";
    Modal.open("employee", `
      <form id="employeeForm">
        <fieldset class="card" style="margin-bottom:12px;">
          <legend><strong>Primary Details</strong></legend>
          <div class="form-grid">
            <div>
              <label>Employee Code</label>
              <input class="input" name="emp_code" value="${Utils.escapeHtml(data.emp_code || "")}" required />
            </div>
            <div>
              <label>Name</label>
              <input class="input" name="name" value="${Utils.escapeHtml(data.name || "")}" required />
            </div>
            <div>
              <label>Department</label>
              <input class="input" name="department" value="${Utils.escapeHtml(data.department || "")}" />
            </div>
            <div>
              <label>Designation</label>
              <input class="input" name="designation" value="${Utils.escapeHtml(data.designation || "")}" />
            </div>
          </div>
        </fieldset>
        <fieldset class="card">
          <legend><strong>Work & Contact</strong></legend>
          <div class="form-grid">
            <div>
              <label>Manager</label>
              <input class="input" name="manager" value="${Utils.escapeHtml(data.manager || "")}" />
            </div>
            <div>
              <label>Join Date</label>
              <input class="input" type="date" name="join_date" value="${data.join_date || ""}" />
            </div>
            <div>
              <label>Status</label>
              <select name="status">
                <option value="Active" ${data.status === "Active" ? "selected" : ""}>Active</option>
                <option value="Inactive" ${data.status === "Inactive" ? "selected" : ""}>Inactive</option>
              </select>
            </div>
            <div>
              <label>Email</label>
              <input class="input" name="email" value="${Utils.escapeHtml(data.email || "")}" />
            </div>
            <div>
              <label>Phone</label>
              <input class="input" name="phone" value="${Utils.escapeHtml(data.phone || "")}" />
            </div>
          </div>
        </fieldset>
      </form>
    `, {
      title: isEdit ? "Edit Employee" : "Add Employee",
      footer: `
        <button class="btn" data-close>Cancel</button>
        <button class="btn primary" id="saveEmployee">${isEdit ? "Save" : "Create"}</button>
      `
    });

    Utils.el("#saveEmployee")?.addEventListener("click", async () => {
      const form = Utils.el("#employeeForm");
      const payload = Object.fromEntries(new FormData(form).entries());
      if (isEdit) {
        const response = await api.put(`/api/employees/${data.id}`, payload, { fallbackData: data });
        employees = employees.map((emp) => emp.id === data.id ? { ...emp, ...payload } : emp);
        if (response.ok) Toast.show("success", "Employee updated.");
      } else {
        const response = await api.post("/api/employees", payload, { fallbackData: { id: Date.now(), ...payload } });
        const created = response.data || { id: Date.now(), ...payload };
        employees = [created, ...employees];
        Toast.show("success", "Employee created.");
      }
      Modal.close("employee");
      loadEmployees(false);
    });
  };

  const openDeleteModal = (emp) => {
    Confirm.open({
      title: "Delete Employee",
      message: `Remove ${emp.name} from records?`,
      confirmText: "Delete",
      onConfirm: async () => {
        await api.del(`/api/employees/${emp.id}`);
        employees = employees.filter((row) => row.id !== emp.id);
        Toast.show("success", "Employee deleted.");
        loadEmployees(false);
      }
    });
  };

  const loadEmployees = async (fetchRemote = true) => {
    const query = {
      search: Utils.el("#searchInput").value,
      department: Utils.el("#departmentFilter").value,
      designation: Utils.el("#designationFilter").value,
      status: Utils.el("#statusFilter").value,
      page,
      page_size: pageSize,
      sort_by: Utils.el("#sortBy").value,
      sort_dir: "asc"
    };

    if (fetchRemote) {
      Loader.show(employeeTable);
      const response = await api.get("/api/employees", query, { fallbackData: { items: fallbackEmployees, total: fallbackEmployees.length } });
      const data = response.data || {};
      employees = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : fallbackEmployees;
      total = data.total || employees.length;
      Loader.hide(employeeTable);
    }

    employeeCount.textContent = `${total} records`;
    renderTable(employees);
    renderPagination();
  };

  if (canManage) {
    Utils.el("#btnAddEmployee")?.addEventListener("click", () => openEmployeeModal());
  }

  const searchHandler = Utils.debounce(() => {
    page = 1;
    loadEmployees();
  }, 400);

  ["searchInput", "departmentFilter", "designationFilter", "statusFilter", "sortBy"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("input", searchHandler);
    Utils.el(`#${id}`)?.addEventListener("change", searchHandler);
  });

  employeeTable.addEventListener("click", (event) => {
    const editId = event.target.closest("button[data-edit]")?.dataset.edit;
    const deleteId = event.target.closest("button[data-delete]")?.dataset.delete;
    if (editId) {
      const emp = employees.find((row) => String(row.id) === editId);
      if (emp) openEmployeeModal({ mode: "edit", data: emp });
    }
    if (deleteId) {
      const emp = employees.find((row) => String(row.id) === deleteId);
      if (emp) openDeleteModal(emp);
    }
  });

  loadEmployees();
})();
