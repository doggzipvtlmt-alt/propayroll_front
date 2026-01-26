(function () {
  Components.mountLayout({ activeNav: "dashboard" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Home / Dashboard</div>
        <h1>Executive Dashboard</h1>
        <p class="muted">Real-time pulse across people, leave, and attendance operations.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn primary" href="employees.html">➕ Add Employee</a>
        <a class="btn" href="leaves.html">📝 Apply Leave</a>
        <a class="btn" href="attendance.html">✅ Mark Attendance</a>
      </div>
    </div>

    <div class="grid three" id="kpiGrid"></div>

    <div class="grid two">
      <div class="card">
        <div class="hd">
          <h3>Attendance Trend</h3>
          <span class="hint">Last 7 days</span>
        </div>
        <div class="bd">
          <div class="bars" id="attendanceBars"></div>
        </div>
      </div>
      <div class="card">
        <div class="hd">
          <h3>Announcements</h3>
          <span class="hint">Company-wide updates</span>
        </div>
        <div class="bd" id="announcements"></div>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd">
          <h3>Recent Activity</h3>
          <span class="hint">Live system feed</span>
        </div>
        <div class="bd" id="activityFeed"></div>
      </div>
      <div class="card">
        <div class="hd">
          <h3>Help Tips</h3>
          <span class="hint">Quick guidance</span>
        </div>
        <div class="bd" id="helpTips"></div>
        <div class="ft">
          <span class="muted">Need more? Explore the Office OS modules.</span>
          <a class="btn small" href="users.html">Open Users →</a>
        </div>
      </div>
    </div>
  `;

  const fallbackSummary = {
    total_employees: 128,
    on_leave_today: 6,
    attendance_rate: 94,
    open_positions: 12,
    approvals_pending: 9,
    notifications: 18
  };

  const fallbackActivity = Utils.sampleRange(6, (i) => ({
    title: `Approval ${i % 2 === 0 ? "completed" : "created"}`,
    detail: "Leave request routed for manager review.",
    time: `${i + 1}h ago`
  }));

  const fallbackAnnouncements = [
    { title: "Performance cycle opens", detail: "Self reviews open Friday." },
    { title: "Office reopening", detail: "Hybrid schedule policy updated." },
    { title: "Learning week", detail: "New compliance courses assigned." }
  ];

  const fallbackBars = [72, 84, 93, 76, 88, 91, 86];

  const kpiGrid = document.getElementById("kpiGrid");
  const bars = document.getElementById("attendanceBars");
  const announcements = document.getElementById("announcements");
  const activityFeed = document.getElementById("activityFeed");
  const helpTips = document.getElementById("helpTips");

  function renderKpis(summary) {
    const items = [
      { label: "Total Employees", value: summary.total_employees, hint: "Active headcount" },
      { label: "On Leave Today", value: summary.on_leave_today, hint: "Pending coverage" },
      { label: "Attendance Rate", value: `${summary.attendance_rate}%`, hint: "Last 7 days" },
      { label: "Open Positions", value: summary.open_positions, hint: "Hiring pipeline" },
      { label: "Approvals Pending", value: summary.approvals_pending, hint: "Awaiting action" },
      { label: "Notifications", value: summary.notifications, hint: "Unread alerts" }
    ];
    kpiGrid.innerHTML = items.map((item) => `
      <div class="card">
        <div class="hd">
          <h3>${Utils.escapeHtml(item.label)}</h3>
        </div>
        <div class="bd">
          <div style="font-size:28px; font-weight:700;">${Utils.escapeHtml(item.value)}</div>
          <div class="hint">${Utils.escapeHtml(item.hint)}</div>
        </div>
      </div>
    `).join("");
  }

  function renderBars(values) {
    bars.innerHTML = values.map((value) => `
      <div class="bar"><span style="width:${value}%"></span></div>
    `).join("");
  }

  function renderAnnouncements(list) {
    announcements.innerHTML = list.map((item) => `
      <div class="mini-card" style="margin-bottom:10px;">
        <strong>${Utils.escapeHtml(item.title)}</strong>
        <p class="muted">${Utils.escapeHtml(item.detail)}</p>
      </div>
    `).join("");
  }

  function renderActivity(list) {
    activityFeed.innerHTML = list.map((item) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <strong>${Utils.escapeHtml(item.title)}</strong>
          <p class="muted">${Utils.escapeHtml(item.detail)}</p>
          <div class="hint">${Utils.escapeHtml(item.time)}</div>
        </div>
      </div>
    `).join("");
  }

  function renderHelp() {
    helpTips.innerHTML = `
      <ul class="help-list">
        <li>Use the search bar to jump between employees, approvals, and documents.</li>
        <li>Monitor approvals and leave queues daily to reduce turnaround time.</li>
        <li>Audit logs are visible to MD/Admin roles only.</li>
      </ul>
    `;
  }

  async function init() {
    let summary = fallbackSummary;
    try {
      summary = await API.request("/api/dashboard/summary");
    } catch (err) {
      summary = fallbackSummary;
    }
    renderKpis(summary);
    renderBars(fallbackBars);
    renderAnnouncements(fallbackAnnouncements);
    renderActivity(fallbackActivity);
    renderHelp();
  }

  init();
})();
