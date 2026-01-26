(function () {
  Components.mountLayout({ activeNav: "employees" });

  const content = document.getElementById("pageContent");
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

    <div class="card">
      <div class="hd">
        <h3>Filters & Search</h3>
        <span class="hint">Use filters to narrow results</span>
      </div>
      <div class="bd form-grid">
        <div>
          <label for="searchInput">Search</label>
          <input class="input" id="searchInput" placeholder="Name, email, employee code" />
        </div>
        <div>
          <label for="departmentFilter">Department</label>
          <select id="departmentFilter">
            <option value="">All Departments</option>
            <option>Engineering</option>
            <option>People Ops</option>
            <option>Finance</option>
            <option>Sales</option>
          </select>
        </div>
        <div>
          <label for="designationFilter">Designation</label>
          <select id="designationFilter">
            <option value="">All Designations</option>
            <option>Manager</option>
            <option>Analyst</option>
            <option>Lead</option>
            <option>Associate</option>
          </select>
        </div>
        <div>
          <label for="statusFilter">Status</label>
          <select id="statusFilter">
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label for="sortBy">Sort By</label>
          <select id="sortBy">
            <option value="name">Name</option>
            <option value="department">Department</option>
            <option value="join_date">Join Date</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Employee List</h3>
        <span class="hint" id="employeeCount">0 records</span>
      </div>
      <div class="bd" id="employeeTable">${Components.loader("Loading employees...")}</div>
      <div class="ft" id="employeePagination"></div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Help Tips</h3>
        <span class="hint">Onboarding guidance</span>
      </div>
      <div class="bd">
        <ul class="help-list">
          <li>Keep employee codes consistent with payroll systems.</li>
          <li>Assign managers to maintain accurate reporting structures.</li>
          <li>Inactive employees remain searchable for audit history.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackEmployees = Utils.sampleRange(14, (i) => ({
    id: i + 1,
    emp_code: `EMP-${1000 + i}`,
    name: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    department: i % 3 === 0 ? "Engineering" : i % 3 === 1 ? "Finance" : "People Ops",
    designation: i % 2 === 0 ? "Lead" : "Analyst",
    manager: i % 2 === 0 ? "Maria Thomas" : "Chen Wu",
    join_date: `2022-0${(i % 9) + 1}-15`,
    status: i % 4 === 0 ? "inactive" : "active",
    email: `user${i}@officeos.com`,
    phone: "+1-202-555-01" + String(i).padStart(2, "0")
  }));

  let employees = [];
  let page = 1;
  const pageSize = 10;

  const employeeTable = document.getElementById("employeeTable");
  const employeePagination = document.getElementById("employeePagination");
  const employeeCount = document.getElementById("employeeCount");

  function renderTable(rows) {
    const columns = [
      { key: "emp_code", label: "Emp Code" },
      { key: "name", label: "Name" },
      { key: "department", label: "Dept" },
      { key: "designation", label: "Designation" },
      { key: "manager", label: "Manager" },
      { key: "join_date", label: "Join Date", render: (r) => Utils.fmtDate(r.join_date) },
      { key: "status", label: "Status", render: (r) => Components.badge(r.status, r.status) },
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

    employeeTable.innerHTML = Components.table({ columns, rows, rowActions, emptyText: "No employees found." });
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    employeePagination.innerHTML = "";
    employeePagination.appendChild(Components.pagination({
      page,
      totalPages,
      onChange: (next) => {
        page = next;
        loadEmployees();
      }
    }));
  }

  function openEmployeeModal({ mode = "add", data = {} } = {}) {
    const isEdit = mode === "edit";
    const modal = Components.openModal({
      title: isEdit ? "Edit Employee" : "Add Employee",
      bodyHtml: `
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
              <option value="active" ${data.status === "active" ? "selected" : ""}>Active</option>
              <option value="inactive" ${data.status === "inactive" ? "selected" : ""}>Inactive</option>
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
      `,
      footerHtml: `
        <button class="btn" id="cancelEmployee">Cancel</button>
        <button class="btn primary" id="saveEmployee">${isEdit ? "Save" : "Create"}</button>
      `
    });

    document.getElementById("cancelEmployee").addEventListener("click", modal.close);
    document.getElementById("saveEmployee").addEventListener("click", async () => {
      const form = document.getElementById("employeeForm");
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        if (isEdit) {
          await API.request(`/api/employees/${data.id}`, { method: "PUT", body: payload });
          employees = employees.map((emp) => emp.id === data.id ? { ...emp, ...payload } : emp);
        } else {
          const created = await API.request("/api/employees", { method: "POST", body: payload });
          employees = [created, ...employees];
        }
        Components.toast({ title: "Saved", message: "Employee record updated.", type: "success" });
      } catch (err) {
        if (!isEdit) {
          employees = [{ id: Date.now(), ...payload }, ...employees];
        } else {
          employees = employees.map((emp) => emp.id === data.id ? { ...emp, ...payload } : emp);
        }
      }
      modal.close();
      loadEmployees(false);
    });
  }

  function openDeleteModal(emp) {
    const modal = Components.openModal({
      title: "Delete Employee",
      bodyHtml: `<p>Are you sure you want to remove <strong>${Utils.escapeHtml(emp.name)}</strong>?</p>`,
      footerHtml: `
        <button class="btn" id="cancelDelete">Cancel</button>
        <button class="btn primary" id="confirmDelete">Delete</button>
      `
    });

    document.getElementById("cancelDelete").addEventListener("click", modal.close);
    document.getElementById("confirmDelete").addEventListener("click", async () => {
      try {
        await API.request(`/api/employees/${emp.id}`, { method: "DELETE" });
        employees = employees.filter((e) => e.id !== emp.id);
        Components.toast({ title: "Deleted", message: "Employee removed.", type: "success" });
      } catch (err) {
        employees = employees.filter((e) => e.id !== emp.id);
      }
      modal.close();
      loadEmployees(false);
    });
  }

  async function loadEmployees(fetchRemote = true) {
    const query = {
      search: document.getElementById("searchInput").value,
      department: document.getElementById("departmentFilter").value,
      designation: document.getElementById("designationFilter").value,
      status: document.getElementById("statusFilter").value,
      page,
      page_size: pageSize,
      sort_by: document.getElementById("sortBy").value,
      sort_dir: "asc"
    };

    if (fetchRemote) {
      try {
        const data = await API.request("/api/employees", { query });
        employees = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackEmployees;
      } catch (err) {
        employees = fallbackEmployees;
      }
    }

    const start = (page - 1) * pageSize;
    const rows = employees.slice(start, start + pageSize);
    employeeCount.textContent = `${employees.length} records`;
    renderTable(rows);
    renderPagination(employees.length);
  }

  document.getElementById("btnAddEmployee").addEventListener("click", () => openEmployeeModal());
  document.getElementById("btnExport").addEventListener("click", () => Components.toast({
    title: "Export queued",
    message: "CSV export will be available shortly.",
    type: "info"
  }));

  ["searchInput", "departmentFilter", "designationFilter", "statusFilter", "sortBy"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      page = 1;
      loadEmployees();
    });
  });

  employeeTable.addEventListener("click", (e) => {
    const editId = e.target.closest("button[data-edit]")?.getAttribute("data-edit");
    const deleteId = e.target.closest("button[data-delete]")?.getAttribute("data-delete");
    if (editId) {
      const emp = employees.find((r) => String(r.id) === editId);
      if (emp) openEmployeeModal({ mode: "edit", data: emp });
    }
    if (deleteId) {
      const emp = employees.find((r) => String(r.id) === deleteId);
      if (emp) openDeleteModal(emp);
    }
  });

  loadEmployees();
})();
