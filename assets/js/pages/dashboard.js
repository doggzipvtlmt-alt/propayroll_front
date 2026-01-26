(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Overview / Dashboard</div>
        <h1>Office OS Command Center</h1>
        <p class="muted">Track HR, attendance, and operational health across teams in one place.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnQuickLeave">Apply Leave</button>
        <button class="btn" id="btnQuickOnboard">Start Onboarding</button>
      </div>
    </div>

    <div class="grid three" id="kpiGrid"></div>

    <div class="grid two">
      <div class="card">
        <div class="hd">
          <h3>Attendance Trend</h3>
          <span class="hint">Last 7 working days</span>
        </div>
        <div class="bars" id="attendanceChart"></div>
      </div>
      <div class="card">
        <div class="hd">
          <h3>Leave Distribution</h3>
          <span class="hint">By leave type</span>
        </div>
        <div class="bars" id="leaveChart"></div>
      </div>
    </div>

    <div class="split">
      <div>
        <div class="card">
          <div class="hd">
            <h3>Recent Activity</h3>
            <span class="hint">Latest updates from HR and managers</span>
          </div>
          <div class="timeline" id="activityFeed"></div>
        </div>
        <div class="card" style="margin-top:24px;">
          <div class="hd">
            <h3>Announcements</h3>
            <span class="hint">Policy updates & reminders</span>
          </div>
          <div class="grid" id="announcementList"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd">
            <h3>Quick Actions</h3>
            <span class="hint">Jump to frequent workflows</span>
          </div>
          <div class="grid">
            <button class="btn" id="btnViewApprovals">Review Approvals</button>
            <button class="btn" id="btnMarkAttendance">Mark Attendance</button>
            <button class="btn" id="btnOpenVault">Open Vault</button>
          </div>
        </div>
        <div class="card" style="margin-top:24px;">
          <div class="hd">
            <h3>Help Tips</h3>
            <span class="hint">Operational best practices</span>
          </div>
          <ul class="help-list">
            <li>Update employee managers weekly to keep org charts accurate.</li>
            <li>Run payroll checks 2 days before the closing date.</li>
            <li>Use approvals to centralize compliance workflows.</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const fallbackSummary = {
    total_employees: 218,
    active_employees: 204,
    pending_leaves: 12,
    open_positions: 6,
    attendance_rate: 96,
    payroll_ready: "On Track"
  };

  const fallbackAttendance = [92, 95, 97, 94, 96, 93, 98];
  const fallbackLeaves = [32, 18, 12, 9];

  const activityItems = Array.from({ length: 10 }, (_, i) => ({
    title: i % 2 === 0 ? "Leave request approved" : "Profile update submitted",
    detail: i % 2 === 0 ? "Finance team approved sick leave" : "Updated bank details for payroll",
    time: `${i + 1}h ago`
  }));

  const announcements = [
    { title: "Holiday Schedule", body: "Office closed for Founder’s Day on Oct 14." },
    { title: "Policy Update", body: "Remote work guidelines updated for Q4." },
    { title: "Security", body: "Enable MFA for all payroll users by Friday." }
  ];

  const kpiGrid = Utils.el("#kpiGrid");
  const attendanceChart = Utils.el("#attendanceChart");
  const leaveChart = Utils.el("#leaveChart");
  const activityFeed = Utils.el("#activityFeed");
  const announcementList = Utils.el("#announcementList");

  const renderKPIs = (summary) => {
    kpiGrid.innerHTML = `
      <div class="card">
        <div class="hd"><h3>Total Employees</h3><span class="hint">All records</span></div>
        <h2>${summary.total_employees}</h2>
        <p class="muted">${summary.active_employees} active</p>
      </div>
      <div class="card">
        <div class="hd"><h3>Pending Leaves</h3><span class="hint">Need review</span></div>
        <h2>${summary.pending_leaves}</h2>
        <p class="muted">Auto-escalate in 48h</p>
      </div>
      <div class="card">
        <div class="hd"><h3>Attendance Rate</h3><span class="hint">Week to date</span></div>
        <h2>${summary.attendance_rate}%</h2>
        <p class="muted">${summary.payroll_ready} for payroll</p>
      </div>
    `;
  };

  const renderBars = (el, data) => {
    el.innerHTML = data.map((val) => `
      <div class="bar"><span style="width:${val}%"></span></div>
    `).join("");
  };

  const renderActivity = () => {
    activityFeed.innerHTML = activityItems.map((item) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong>${Utils.escapeHtml(item.title)}</strong>
          <p class="muted">${Utils.escapeHtml(item.detail)}</p>
          <span class="hint">${Utils.escapeHtml(item.time)}</span>
        </div>
      </div>
    `).join("");
  };

  const renderAnnouncements = () => {
    announcementList.innerHTML = announcements.map((note) => `
      <div class="notice">
        <strong>${Utils.escapeHtml(note.title)}</strong>
        <p class="muted">${Utils.escapeHtml(note.body)}</p>
      </div>
    `).join("");
  };

  const loadSummary = async () => {
    Loader.show(kpiGrid);
    const response = await api.get("/api/dashboard/summary");
    const summary = response.ok ? response.data : fallbackSummary;
    renderKPIs(summary || fallbackSummary);
    Loader.hide(kpiGrid);
  };

  renderBars(attendanceChart, fallbackAttendance);
  renderBars(leaveChart, fallbackLeaves);
  renderActivity();
  renderAnnouncements();
  loadSummary();

  Utils.el("#btnQuickLeave")?.addEventListener("click", () => window.location.href = "leaves.html");
  Utils.el("#btnQuickOnboard")?.addEventListener("click", () => Toast.show("info", "Onboarding wizard coming soon."));
  Utils.el("#btnViewApprovals")?.addEventListener("click", () => window.location.href = "approvals.html");
  Utils.el("#btnMarkAttendance")?.addEventListener("click", () => window.location.href = "attendance.html");
  Utils.el("#btnOpenVault")?.addEventListener("click", () => window.location.href = "vault.html");
})();
