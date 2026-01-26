(function () {
  Components.mountLayout({ activeNav: "attendance" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">People / Attendance</div>
        <h1>Attendance Tracker</h1>
        <p class="muted">Monitor daily attendance and mark bulk entries.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnMarkAttendance">✅ Mark Attendance</button>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd">
          <h3>Monthly Overview</h3>
          <span class="hint">Status badges</span>
        </div>
        <div class="bd">
          <div class="calendar-grid" id="calendarGrid"></div>
        </div>
      </div>
      <div class="card">
        <div class="hd">
          <h3>Attendance Filters</h3>
          <span class="hint">Filter by date/department</span>
        </div>
        <div class="bd form-grid">
          <div>
            <label>Date</label>
            <input class="input" type="date" id="attendanceDate" />
          </div>
          <div>
            <label>Department</label>
            <select id="attendanceDepartment">
              <option value="">All Departments</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select id="attendanceStatus">
              <option value="">Any Status</option>
              <option value="present">Present</option>
              <option value="remote">Remote</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Daily Attendance</h3>
        <span class="hint" id="attendanceCount">0 entries</span>
      </div>
      <div class="bd" id="attendanceTable">${Components.loader("Loading attendance...")}</div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Help Tips</h3>
        <span class="hint">Operational guidance</span>
      </div>
      <div class="bd">
        <ul class="help-list">
          <li>Mark attendance in bulk before 11 AM each day.</li>
          <li>Use remote status for approved work-from-home employees.</li>
          <li>Attendance anomalies are flagged automatically.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackAttendance = Utils.sampleRange(15, (i) => ({
    id: i + 1,
    employee: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    department: i % 3 === 0 ? "Engineering" : i % 3 === 1 ? "Finance" : "People Ops",
    date: `2024-03-${String((i % 9) + 1).padStart(2, "0")}`,
    status: i % 4 === 0 ? "remote" : i % 4 === 1 ? "leave" : "present",
    check_in: "09:30",
    check_out: "18:10"
  }));

  let attendance = [];
  let departments = ["Engineering", "Finance", "People Ops", "Sales"];

  const calendarGrid = document.getElementById("calendarGrid");
  const attendanceTable = document.getElementById("attendanceTable");
  const attendanceCount = document.getElementById("attendanceCount");
  const attendanceDepartment = document.getElementById("attendanceDepartment");

  function renderCalendar() {
    const days = Utils.sampleRange(28, (i) => ({
      day: i + 1,
      status: i % 5 === 0 ? "leave" : i % 4 === 0 ? "remote" : "present"
    }));

    calendarGrid.innerHTML = days.map((d) => `
      <div class="calendar-cell">
        <strong>${d.day}</strong>
        ${Components.badge(d.status, d.status === "present" ? "approved" : d.status === "remote" ? "info" : "pending")}
      </div>
    `).join("");
  }

  function renderTable(rows) {
    const columns = [
      { key: "employee", label: "Employee" },
      { key: "department", label: "Department" },
      { key: "date", label: "Date", render: (r) => Utils.fmtDate(r.date) },
      { key: "status", label: "Status", render: (r) => Components.badge(r.status, r.status === "present" ? "approved" : r.status === "remote" ? "info" : "pending") },
      { key: "check_in", label: "Check-In" },
      { key: "check_out", label: "Check-Out" }
    ];

    attendanceTable.innerHTML = Components.table({ columns, rows, emptyText: "No attendance data." });
  }

  function openAttendanceModal() {
    const modal = Components.openModal({
      title: "Mark Attendance",
      bodyHtml: `
        <form id="attendanceForm" class="form-grid">
          <div>
            <label>Date</label>
            <input class="input" type="date" name="date" required />
          </div>
          <div>
            <label>Department</label>
            <select name="department">
              ${departments.map((dep) => `<option>${Utils.escapeHtml(dep)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select name="status">
              <option value="present">Present</option>
              <option value="remote">Remote</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <div>
            <label>Notes</label>
            <textarea rows="3" name="notes"></textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn" id="cancelAttendance">Cancel</button>
        <button class="btn primary" id="saveAttendance">Submit</button>
      `
    });

    document.getElementById("cancelAttendance").addEventListener("click", modal.close);
    document.getElementById("saveAttendance").addEventListener("click", async () => {
      const form = document.getElementById("attendanceForm");
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        const created = await API.request("/api/attendance", { method: "POST", body: payload });
        attendance = [created, ...attendance];
        Components.toast({ title: "Saved", message: "Attendance recorded.", type: "success" });
      } catch (err) {
        attendance = [{ id: Date.now(), employee: "Bulk Entry", check_in: "09:00", check_out: "18:00", ...payload }, ...attendance];
      }
      modal.close();
      renderTable(attendance);
    });
  }

  async function loadDepartments() {
    try {
      const data = await API.request("/api/meta/departments");
      departments = Array.isArray(data) ? data : departments;
    } catch (err) {
      departments = departments;
    }
    attendanceDepartment.innerHTML = `<option value="">All Departments</option>` + departments.map((dep) => `<option>${Utils.escapeHtml(dep)}</option>`).join("");
  }

  async function loadAttendance() {
    try {
      const data = await API.request("/api/attendance");
      attendance = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackAttendance;
    } catch (err) {
      attendance = fallbackAttendance;
    }
    attendanceCount.textContent = `${attendance.length} entries`;
    renderTable(attendance);
  }

  document.getElementById("btnMarkAttendance").addEventListener("click", openAttendanceModal);

  ["attendanceDate", "attendanceDepartment", "attendanceStatus"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      const date = document.getElementById("attendanceDate").value;
      const dept = attendanceDepartment.value;
      const status = document.getElementById("attendanceStatus").value;
      const filtered = attendance.filter((row) => {
        return (!date || row.date === date) && (!dept || row.department === dept) && (!status || row.status === status);
      });
      attendanceCount.textContent = `${filtered.length} entries`;
      renderTable(filtered);
    });
  });

  renderCalendar();
  loadDepartments();
  loadAttendance();
})();
