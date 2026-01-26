(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">People / Attendance</div>
        <h1>Attendance Tracker</h1>
        <p class="muted">Monitor daily attendance, late arrivals, and remote coverage.</p>
      </div>
      <button class="btn primary" id="btnMark">Mark Attendance</button>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Monthly View</h3><span class="hint">Current month</span></div>
        <div class="calendar-grid" id="attendanceCalendar"></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Daily Attendance</h3><span class="hint">Filtered by department</span></div>
        <div class="form-grid">
          <div>
            <label>Date</label>
            <input class="input" id="attendanceDate" type="date" />
          </div>
          <div>
            <label>Department</label>
            <select id="departmentFilter"></select>
          </div>
        </div>
        <div id="attendanceTable"></div>
      </div>
    </div>
  `;

  const calendar = Utils.el("#attendanceCalendar");
  const attendanceTable = Utils.el("#attendanceTable");

  const fallbackDepartments = ["All Departments", "Engineering", "People Ops", "Finance", "Sales"];

  const fallbackRows = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    employee: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    department: i % 3 === 0 ? "Engineering" : i % 3 === 1 ? "Finance" : "People Ops",
    status: i % 4 === 0 ? "Absent" : i % 3 === 0 ? "Remote" : "Present",
    check_in: "09:15 AM",
    check_out: "06:10 PM"
  }));

  const statusDots = {
    Present: "present",
    Absent: "absent",
    Leave: "leave",
    Remote: "remote"
  };

  const renderCalendar = () => {
    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    calendar.innerHTML = Array.from({ length: days }, (_, i) => {
      const status = ["Present", "Present", "Remote", "Leave", "Absent"][i % 5];
      return `
        <div class="calendar-cell">
          <strong>${i + 1}</strong>
          <span class="status-dot ${statusDots[status]}"></span>
          <span class="hint">${status}</span>
        </div>
      `;
    }).join("");
  };

  const renderTable = (rows) => {
    const columns = [
      { key: "employee", label: "Employee" },
      { key: "department", label: "Department" },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status) },
      { key: "check_in", label: "Check In" },
      { key: "check_out", label: "Check Out" }
    ];
    Table.render(attendanceTable, { columns, rows, emptyText: "No attendance records." });
  };

  const loadDepartments = async () => {
    const response = await api.get("/api/meta/departments");
    const departments = response.ok ? response.data : fallbackDepartments;
    Utils.el("#departmentFilter").innerHTML = ["All Departments", ...departments].map((dept) => `
      <option value="${dept === "All Departments" ? "" : dept}">${dept}</option>
    `).join("");
  };

  const loadAttendance = async () => {
    const query = {
      date: Utils.el("#attendanceDate").value,
      department: Utils.el("#departmentFilter").value
    };
    Loader.show(attendanceTable);
    const response = await api.get("/api/attendance", query);
    const rows = response.ok ? (response.data?.items || response.data || []) : fallbackRows;
    renderTable(rows.length ? rows : fallbackRows);
    Loader.hide(attendanceTable);
  };

  const openMarkModal = () => {
    Modal.open("attendance", `
      <form id="attendanceForm" class="form-grid">
        <div>
          <label>Date</label>
          <input class="input" type="date" name="date" required />
        </div>
        <div>
          <label>Department</label>
          <input class="input" name="department" placeholder="Engineering" />
        </div>
        <div>
          <label>Status</label>
          <select name="status">
            <option>Present</option>
            <option>Remote</option>
            <option>Leave</option>
            <option>Absent</option>
          </select>
        </div>
        <div>
          <label>Notes</label>
          <textarea class="input" name="notes" rows="3" placeholder="Optional"></textarea>
        </div>
      </form>
    `, {
      title: "Bulk Mark Attendance",
      footer: `
        <button class="btn" data-close>Cancel</button>
        <button class="btn primary" id="saveAttendance">Save</button>
      `
    });

    Utils.el("#saveAttendance")?.addEventListener("click", async () => {
      const payload = Object.fromEntries(new FormData(Utils.el("#attendanceForm")).entries());
      const response = await api.post("/api/attendance", payload);
      if (response.ok) Toast.show("success", "Attendance saved.");
      Modal.close("attendance");
      loadAttendance();
    });
  };

  Utils.el("#btnMark")?.addEventListener("click", openMarkModal);
  Utils.el("#attendanceDate")?.addEventListener("change", loadAttendance);
  Utils.el("#departmentFilter")?.addEventListener("change", loadAttendance);

  renderCalendar();
  loadDepartments();
  loadAttendance();
})();
