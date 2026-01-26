(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">People / Employees</div>
        <h1>Employee Directory</h1>
        <p class="muted">Search, onboard, and manage employee records across departments.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnAddEmployee">➕ Add Employee</button>
        <button class="btn" id="btnExport">⬇️ Export</button>
      </div>
    </div>

    <div class="split">
      <div>
        <div class="card">
          <div class="hd">
            <h3>Filters & Search</h3>
            <span class="hint">Use filters to narrow results</span>
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

        <div class="card" style="margin-top:24px;">
          <div class="hd">
            <h3>Employee List</h3>
            <span class="hint" id="employeeCount">0 records</span>
          </div>
          <div id="employeeTable"></div>
          <div id="employeePagination"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd">
            <h3>Quick Stats</h3>
            <span class="hint">People pulse</span>
          </div>
          <div class="grid">
            <div>
              <strong id="statActive">0</strong>
              <p class="muted">Active Employees</p>
            </div>
            <div>
              <strong id="statNew">0</strong>
              <p class="muted">New this month</p>
            </div>
            <div>
              <strong id="statManagers">0</strong>
              <p class="muted">People Managers</p>
            </div>
          </div>
        </div>
        <div class="card" style="margin-top:24px;">
          <div class="hd">
            <h3>Help Tips</h3>
            <span class="hint">Onboarding guidance</span>
          </div>
          <ul class="help-list">
            <li>Keep employee codes consistent with payroll systems.</li>
            <li>Assign managers to maintain accurate reporting structures.</li>
            <li>Inactive employees remain searchable for audit history.</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const fallbackEmployees = Array.from({ length: 15 }, (_, i) => ({
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
      { key: "join_date", label: "Join Date", render: (r) => Utils.formatDate(r.join_date) },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status) },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" }
    ];

    const rowActions = (row) => `
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <a class="btn small" href="employee.html?id=${row.id}">View</a>
        <button class="btn small" data-edit="${row.id}">Edit</button>
        <button class="btn small" data-delete="${row.id}">Delete</button>
      </div>
    `;

    Table.render(employeeTable, { columns, rows, rowActions, emptyText: "No employees found." });
  };

  const renderPagination = (total) => {
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
      <form id="employeeForm" class="form-grid">
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
        const response = await api.put(`/api/employees/${data.id}`, payload);
        employees = employees.map((emp) => emp.id === data.id ? { ...emp, ...payload } : emp);
        if (response.ok) Toast.show("success", "Employee updated.");
      } else {
        const response = await api.post("/api/employees", payload);
        const created = response.ok ? response.data : { id: Date.now(), ...payload };
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
        const response = await api.del(`/api/employees/${emp.id}`);
        employees = employees.filter((row) => row.id !== emp.id);
        if (response.ok) Toast.show("success", "Employee deleted.");
        loadEmployees(false);
      }
    });
  };

  const renderStats = () => {
    Utils.el("#statActive").textContent = employees.filter((emp) => emp.status === "Active").length;
    Utils.el("#statNew").textContent = employees.filter((emp) => emp.join_date >= "2023-01-01").length;
    Utils.el("#statManagers").textContent = employees.filter((emp) => emp.designation?.toLowerCase().includes("manager")).length;
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
      const response = await api.get("/api/employees", query);
      if (response.ok) {
        const data = response.data || {};
        employees = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : fallbackEmployees;
      } else {
        employees = fallbackEmployees;
      }
      Loader.hide(employeeTable);
    }

    const total = employees.length;
    const rows = employees.slice((page - 1) * pageSize, page * pageSize);
    employeeCount.textContent = `${total} records`;
    renderTable(rows);
    renderPagination(total);
    renderStats();
  };

  Utils.el("#btnAddEmployee")?.addEventListener("click", () => openEmployeeModal());
  Utils.el("#btnExport")?.addEventListener("click", () => Toast.show("info", "CSV export queued."));

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
