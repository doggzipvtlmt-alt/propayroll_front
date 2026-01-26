(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">People / Employees / Profile</div>
        <h1>Employee Profile</h1>
        <p class="muted">Full employee record including personal, work, and history data.</p>
      </div>
      <a class="btn" href="employees.html">Back to Directory</a>
    </div>

    <div class="card" id="profileHeader"></div>

    <div class="card">
      <div class="tabs" id="profileTabs">
        <button data-tab="overview">Overview</button>
        <button data-tab="personal">Personal</button>
        <button data-tab="work">Work</button>
        <button data-tab="documents">Documents</button>
        <button data-tab="history">History</button>
      </div>
      <div class="tab-panel" data-tab-content="overview" id="tabOverview"></div>
      <div class="tab-panel" data-tab-content="personal" id="tabPersonal"></div>
      <div class="tab-panel" data-tab-content="work" id="tabWork"></div>
      <div class="tab-panel" data-tab-content="documents" id="tabDocuments"></div>
      <div class="tab-panel" data-tab-content="history" id="tabHistory"></div>
    </div>
  `;

  const fallbackEmployee = {
    id: 1,
    emp_code: "EMP-1001",
    name: "Avery Patel",
    status: "Active",
    department: "People Ops",
    designation: "HR Lead",
    manager: "Maria Thomas",
    join_date: "2021-05-12",
    email: "avery.patel@officeos.com",
    phone: "+1-202-555-0123",
    location: "New York",
    work_mode: "Hybrid",
    leave_balance: { annual: 12, sick: 6, casual: 5 }
  };

  const renderHeader = (emp) => {
    Utils.el("#profileHeader").innerHTML = `
      <div style="display:flex; gap:16px; align-items:center;">
        <div class="avatar" style="width:64px; height:64px;">${Utils.escapeHtml(emp.name?.slice(0, 1) || "E")}</div>
        <div>
          <h2 style="margin:0;">${Utils.escapeHtml(emp.name || "Employee")}</h2>
          <p class="muted">${Utils.escapeHtml(emp.emp_code || "")}</p>
          ${Badge.render(emp.status || "Active")}
        </div>
      </div>
    `;
  };

  const renderOverview = (emp) => {
    Utils.el("#tabOverview").innerHTML = `
      <div class="grid three" style="margin-top:16px;">
        <div class="card">
          <h4>Manager</h4>
          <p>${Utils.escapeHtml(emp.manager || "—")}</p>
          <span class="hint">Primary approver</span>
        </div>
        <div class="card">
          <h4>Department</h4>
          <p>${Utils.escapeHtml(emp.department || "—")}</p>
          <span class="hint">${Utils.escapeHtml(emp.designation || "—")}</span>
        </div>
        <div class="card">
          <h4>Work Mode</h4>
          <p>${Utils.escapeHtml(emp.work_mode || "Hybrid")}</p>
          <span class="hint">Location: ${Utils.escapeHtml(emp.location || "—")}</span>
        </div>
      </div>
      <div class="grid three" style="margin-top:24px;">
        <div class="card">
          <h4>Annual Leave</h4>
          <p>${emp.leave_balance?.annual ?? 12} days</p>
        </div>
        <div class="card">
          <h4>Sick Leave</h4>
          <p>${emp.leave_balance?.sick ?? 6} days</p>
        </div>
        <div class="card">
          <h4>Casual Leave</h4>
          <p>${emp.leave_balance?.casual ?? 5} days</p>
        </div>
      </div>
    `;
  };

  const renderPersonal = (emp) => {
    Utils.el("#tabPersonal").innerHTML = `
      <div class="form-grid" style="margin-top:16px;">
        <div><label>Email</label><p>${Utils.escapeHtml(emp.email || "—")}</p></div>
        <div><label>Phone</label><p>${Utils.escapeHtml(emp.phone || "—")}</p></div>
        <div><label>Location</label><p>${Utils.escapeHtml(emp.location || "—")}</p></div>
        <div><label>Emergency Contact</label><p>+1-202-555-0178</p></div>
      </div>
    `;
  };

  const renderWork = (emp) => {
    Utils.el("#tabWork").innerHTML = `
      <div class="form-grid" style="margin-top:16px;">
        <div><label>Department</label><p>${Utils.escapeHtml(emp.department || "—")}</p></div>
        <div><label>Designation</label><p>${Utils.escapeHtml(emp.designation || "—")}</p></div>
        <div><label>Join Date</label><p>${Utils.formatDate(emp.join_date)}</p></div>
        <div><label>Manager</label><p>${Utils.escapeHtml(emp.manager || "—")}</p></div>
      </div>
      <div class="notice" style="margin-top:16px;">
        <strong>Attendance Snapshot</strong>
        <p class="muted">98% on-time arrival in the last 30 days.</p>
      </div>
    `;
  };

  const renderDocuments = () => {
    Utils.el("#tabDocuments").innerHTML = `
      <div class="notice" style="margin-top:16px;">
        <strong>Upload Documents</strong>
        <p class="muted">Drop files here or click to upload. Supported: PDF, JPG, PNG.</p>
        <button class="btn" style="margin-top:12px;">Upload File</button>
      </div>
      <div class="card" style="margin-top:16px;">
        <div class="hd"><h4>Stored Documents</h4><span class="hint">3 files</span></div>
        <ul class="help-list">
          <li>Offer Letter.pdf</li>
          <li>Government ID.png</li>
          <li>Signed NDA.pdf</li>
        </ul>
      </div>
    `;
  };

  const renderHistory = () => {
    Utils.el("#tabHistory").innerHTML = `
      <div class="timeline" style="margin-top:16px;">
        ${["Promoted to HR Lead", "Approved leave request", "Updated bank details", "Completed compliance training"].map((item) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div>
              <strong>${Utils.escapeHtml(item)}</strong>
              <p class="muted">${Utils.escapeHtml("Recorded by Office OS")}</p>
              <span class="hint">${new Date().toLocaleDateString()}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  };

  const loadEmployee = async () => {
    const id = Utils.qs("id") || "1";
    const response = await api.get(`/api/employees/${id}`);
    const emp = response.ok ? response.data : fallbackEmployee;
    renderHeader(emp || fallbackEmployee);
    renderOverview(emp || fallbackEmployee);
    renderPersonal(emp || fallbackEmployee);
    renderWork(emp || fallbackEmployee);
    renderDocuments();
    renderHistory();
    Tabs.init(Utils.el("#profileTabs"));
  };

  loadEmployee();
})();
