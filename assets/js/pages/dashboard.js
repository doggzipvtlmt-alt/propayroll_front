(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const content = Layout.render({
    title: "Command Dashboard",
    subtitle: "Enterprise overview for Doggzi Office OS approvals, HR, finance, and governance.",
    breadcrumb: ["Home", "Dashboard"],
    actions: "<button class='btn small' id='btnQuickLeave'>Apply Leave</button><button class='btn small' id='btnViewApprovals'>Approvals</button>"
  });

  if (!content) return;

  content.innerHTML += `
    <div id="noticeBar"></div>
    <div class="grid three" id="kpiGrid"></div>

    <div class="grid two">
      <div class="card">
        <div class="hd">
          <h3>Recent Activity</h3>
          <span class="hint">Workflow approvals and audit events</span>
        </div>
        <div class="timeline" id="activityFeed"></div>
      </div>
      <div class="card">
        <div class="hd">
          <h3>Announcements</h3>
          <span class="hint">Corporate governance updates</span>
        </div>
        <div class="grid" id="announcementList"></div>
      </div>
    </div>

    <div class="split" style="margin-top:24px;">
      <div>
        <div class="card">
          <div class="hd">
          <h3>Quick Links</h3>
          <span class="hint">Role-gated workflows</span>
          </div>
          <div class="grid three">
            <a class="notice" href="employees.html">Employee Onboarding</a>
            <a class="notice" href="attendance.html">Attendance Register</a>
            <a class="notice" href="leaves.html">Leave Requests</a>
            <a class="notice" href="approvals.html">Approval Chains</a>
            <a class="notice" href="notifications.html">Notifications</a>
            <a class="notice" href="vault.html">Secure Vault</a>
          </div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd">
          <h3>Service Status</h3>
          <span class="hint">Workflow readiness</span>
          </div>
          <div class="form-row">
            <label>Payroll Cycle</label>
            <div>On Track (98%)</div>
          </div>
          <div class="form-row">
            <label>Pending Approvals</label>
            <div>12 awaiting HR/Finance review</div>
          </div>
          <div class="form-row">
            <label>Compliance Alerts</label>
            <div>2 open notices</div>
          </div>
        </div>
        <div class="card" style="margin-top:16px;">
          <div class="hd">
          <h3>Help Tips</h3>
          <span class="hint">Approval discipline</span>
          </div>
          <ul class="help-list">
            <li>Verify eligibility and documents before onboarding approval.</li>
            <li>Run attendance locks before payroll processing.</li>
            <li>Archive approvals weekly for audit readiness.</li>
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

  const notices = [
    "Salary processing cut-off is the 25th of every month.",
    "Designation or salary escalations require Finance → MD → Superuser approvals.",
    "Jurisdiction for all policies: Gurgaon, India."
  ];

  const activityItems = Array.from({ length: 6 }, (_, i) => ({
    title: i % 2 === 0 ? "Approval chain advanced" : "Attendance correction submitted",
    detail: i % 2 === 0 ? "Finance escalated appraisal to MD" : "Manual attendance request pending review",
    time: `${i + 1}h ago`
  }));

  const announcements = [
    { title: "Holiday Schedule", body: "Office closed for Founder’s Day on Oct 14." },
    { title: "Policy Update", body: "Notice period is 1 month with mandatory knowledge transfer." },
    { title: "Security", body: "Enable MFA for all payroll users by Friday." }
  ];

  Marquee.render(Utils.el("#noticeBar"), notices);

  const kpiGrid = Utils.el("#kpiGrid");
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
        <p class="muted">Action required in 48 hours</p>
      </div>
      <div class="card">
        <div class="hd"><h3>Attendance Rate</h3><span class="hint">Week to date</span></div>
        <h2>${summary.attendance_rate}%</h2>
        <p class="muted">${summary.payroll_ready} for payroll</p>
      </div>
    `;
  };

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

  announcementList.innerHTML = announcements.map((note) => `
    <div class="notice">
      <strong>${Utils.escapeHtml(note.title)}</strong>
      <p class="muted">${Utils.escapeHtml(note.body)}</p>
    </div>
  `).join("");

  Loader.show(kpiGrid);
  const response = await api.get("/api/dashboard/summary", null, { fallbackData: fallbackSummary });
  const summary = response.data || fallbackSummary;
  renderKPIs(summary);
  Loader.hide(kpiGrid);

  Utils.el("#btnQuickLeave")?.addEventListener("click", () => window.location.href = "leaves.html");
  Utils.el("#btnViewApprovals")?.addEventListener("click", () => window.location.href = "approvals.html");
})();
