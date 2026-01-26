(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canMark = Utils.hasRole(["HR", "ADMIN", "MD"]);

  const content = Layout.render({
    title: "Attendance Register",
    subtitle: "Track daily attendance with department filters and month summary.",
    breadcrumb: ["HR", "Attendance"],
    actions: canMark ? "<button class='btn small' id='btnMarkAttendance'>Mark Attendance</button>" : ""
  });

  if (!content) return;

  content.innerHTML += `
    <div class="card">
      <div class="hd">
        <h3>Filters</h3>
        <span class="hint">Monthly register</span>
      </div>
      <div class="form-grid">
        <div>
          <label>Month</label>
          <input class="input" type="month" id="monthFilter" />
        </div>
        <div>
          <label>Department</label>
          <select id="departmentFilter">
            <option value="">All</option>
          </select>
        </div>
        <div>
          <label>Status</label>
          <select id="statusFilter">
            <option value="">All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid two" style="margin-top:16px;">
      <div class="card">
        <div class="hd">
          <h3>Monthly Grid</h3>
          <span class="hint">Quick glance</span>
        </div>
        <div id="monthGrid" class="grid three"></div>
      </div>
      <div class="card">
        <div class="hd">
          <h3>Daily Register</h3>
          <span class="hint">Attendance entries</span>
        </div>
        <div id="attendanceTable"></div>
      </div>
    </div>
  `;

  const fallbackAttendance = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    employee: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    department: i % 2 === 0 ? "Finance" : "Engineering",
    date: `2024-09-${String(i + 1).padStart(2, "0")}`,
    status: i % 3 === 0 ? "Absent" : "Present"
  }));

  const departmentsFallback = ["Finance", "Engineering", "People Ops", "Sales"];

  const attendanceTable = Utils.el("#attendanceTable");
  let records = [];

  const renderGrid = () => {
    const days = Array.from({ length: 12 }, (_, i) => ({
      day: i + 1,
      status: i % 5 === 0 ? "Absent" : "Present"
    }));
    Utils.el("#monthGrid").innerHTML = days.map((day) => `
      <div class="notice">
        <strong>Day ${day.day}</strong>
        <div class="hint">${day.status}</div>
      </div>
    `).join("");
  };

  const renderTable = () => {
    const status = Utils.el("#statusFilter").value;
    const dept = Utils.el("#departmentFilter").value;

    const rows = records.filter((row) => {
      if (status && row.status !== status) return false;
      if (dept && row.department !== dept) return false;
      return true;
    });

    const columns = [
      { key: "employee", label: "Employee" },
      { key: "department", label: "Department" },
      { key: "date", label: "Date", render: (r) => Utils.formatDate(r.date), exportValue: (r) => r.date },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status), exportValue: (r) => r.status }
    ];

    Table.render(attendanceTable, { columns, rows, emptyText: "No attendance records." });
  };

  const loadDepartments = async () => {
    const response = await api.get("/api/meta/departments", null, { fallbackData: departmentsFallback });
    const deptList = response.data || departmentsFallback;
    const select = Utils.el("#departmentFilter");
    select.innerHTML = `<option value="">All</option>${deptList.map((dept) => `<option>${Utils.escapeHtml(dept)}</option>`).join("")}`;
  };

  const loadAttendance = async () => {
    Loader.show(attendanceTable);
    const response = await api.get("/api/attendance", null, { fallbackData: fallbackAttendance });
    records = response.data || fallbackAttendance;
    Loader.hide(attendanceTable);
    renderTable();
  };

  if (canMark) {
    Utils.el("#btnMarkAttendance")?.addEventListener("click", async () => {
      const payload = {
        date: new Date().toISOString().slice(0, 10),
        status: "Present"
      };
      await api.post("/api/attendance", payload, { fallbackData: payload });
      Toast.show("success", "Attendance marked for today.");
      loadAttendance();
    });
  }

  ["statusFilter", "departmentFilter", "monthFilter"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("change", renderTable);
  });

  renderGrid();
  loadDepartments();
  loadAttendance();
})();
