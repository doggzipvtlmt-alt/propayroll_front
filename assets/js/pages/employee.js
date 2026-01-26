(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const employeeId = Utils.qs("id") || "1";

  const content = Layout.render({
    title: "Employee Profile",
    subtitle: "Official personnel record and employment history.",
    breadcrumb: ["People", "Employees", `Record #${employeeId}`],
    actions: "<button class='btn small' id='btnPrintRecord'>Print Record</button>"
  });

  if (!content) return;

  content.innerHTML += `
    <div class="tabs" id="profileTabs">
      <button data-tab="overview">Overview</button>
      <button data-tab="personal">Personal</button>
      <button data-tab="work">Work</button>
      <button data-tab="documents">Documents</button>
      <button data-tab="history">History</button>
    </div>

    <div class="tab-panel" data-tab-content="overview">
      <div class="grid two">
        <div class="card" id="overviewCard"></div>
        <div class="card">
          <div class="hd">
            <h3>Official Record Summary</h3>
            <span class="hint">Printable summary</span>
          </div>
          <div id="recordSummary"></div>
        </div>
      </div>
    </div>

    <div class="tab-panel" data-tab-content="personal">
      <div class="card" id="personalCard"></div>
    </div>

    <div class="tab-panel" data-tab-content="work">
      <div class="card" id="workCard"></div>
    </div>

    <div class="tab-panel" data-tab-content="documents">
      <div class="card" id="documentsCard"></div>
    </div>

    <div class="tab-panel" data-tab-content="history">
      <div class="card" id="historyCard"></div>
    </div>
  `;

  const fallbackEmployee = {
    id: employeeId,
    emp_code: "EMP-1001",
    name: "Avery Patel",
    department: "Finance",
    designation: "Senior Analyst",
    manager: "Maria Thomas",
    join_date: "2022-03-15",
    status: "Active",
    email: "avery.patel@officeos.com",
    phone: "+1-202-555-0199",
    dob: "1992-07-12",
    address: "14, Maple Avenue, Springfield",
    bank: "Axis Bank",
    account: "XXXX-9921",
    pf: "PF-7721",
    esi: "ESI-3301",
    last_appraisal: "2023-04-01",
    documents: ["Offer Letter", "ID Proof", "Policy Acknowledgement"]
  };

  const overviewCard = Utils.el("#overviewCard");
  const recordSummary = Utils.el("#recordSummary");
  const personalCard = Utils.el("#personalCard");
  const workCard = Utils.el("#workCard");
  const documentsCard = Utils.el("#documentsCard");
  const historyCard = Utils.el("#historyCard");

  const renderProfile = (employee) => {
    overviewCard.innerHTML = `
      <div class="hd">
        <h3>${Utils.escapeHtml(employee.name)}</h3>
        <span class="hint">${Utils.escapeHtml(employee.emp_code)}</span>
      </div>
      <div class="form-row"><label>Designation</label><div>${Utils.escapeHtml(employee.designation)}</div></div>
      <div class="form-row"><label>Department</label><div>${Utils.escapeHtml(employee.department)}</div></div>
      <div class="form-row"><label>Manager</label><div>${Utils.escapeHtml(employee.manager)}</div></div>
      <div class="form-row"><label>Status</label><div>${Badge.render(employee.status)}</div></div>
    `;

    recordSummary.innerHTML = `
      <div class="form-row"><label>Employee Code</label><div>${Utils.escapeHtml(employee.emp_code)}</div></div>
      <div class="form-row"><label>Joining Date</label><div>${Utils.formatDate(employee.join_date)}</div></div>
      <div class="form-row"><label>PF / ESI</label><div>${Utils.escapeHtml(employee.pf)} / ${Utils.escapeHtml(employee.esi)}</div></div>
      <div class="form-row"><label>Bank</label><div>${Utils.escapeHtml(employee.bank)} (${Utils.escapeHtml(employee.account)})</div></div>
      <div class="form-row"><label>Last Appraisal</label><div>${Utils.formatDate(employee.last_appraisal)}</div></div>
    `;

    personalCard.innerHTML = `
      <div class="hd"><h3>Personal Details</h3><span class="hint">Government verified</span></div>
      <div class="form-row"><label>Date of Birth</label><div>${Utils.formatDate(employee.dob)}</div></div>
      <div class="form-row"><label>Email</label><div>${Utils.escapeHtml(employee.email)}</div></div>
      <div class="form-row"><label>Phone</label><div>${Utils.escapeHtml(employee.phone)}</div></div>
      <div class="form-row"><label>Address</label><div>${Utils.escapeHtml(employee.address)}</div></div>
    `;

    workCard.innerHTML = `
      <div class="hd"><h3>Work Details</h3><span class="hint">Payroll-ready</span></div>
      <div class="form-row"><label>Department</label><div>${Utils.escapeHtml(employee.department)}</div></div>
      <div class="form-row"><label>Designation</label><div>${Utils.escapeHtml(employee.designation)}</div></div>
      <div class="form-row"><label>Manager</label><div>${Utils.escapeHtml(employee.manager)}</div></div>
      <div class="form-row"><label>Join Date</label><div>${Utils.formatDate(employee.join_date)}</div></div>
    `;

    documentsCard.innerHTML = `
      <div class="hd"><h3>Documents</h3><span class="hint">Stored in Vault</span></div>
      <ul class="help-list">
        ${employee.documents.map((doc) => `<li>${Utils.escapeHtml(doc)}</li>`).join("")}
      </ul>
    `;

    historyCard.innerHTML = `
      <div class="hd"><h3>History Log</h3><span class="hint">System changes</span></div>
      <div class="timeline">
        <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Profile created</strong><p class="muted">Onboarding completed.</p></div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Salary revised</strong><p class="muted">Annual increment applied.</p></div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Leave balance updated</strong><p class="muted">Carry forward credited.</p></div></div>
      </div>
    `;
  };

  Loader.show(overviewCard);
  const response = await api.get(`/api/employees/${employeeId}`, null, { fallbackData: fallbackEmployee });
  const employee = response.data || fallbackEmployee;
  Loader.hide(overviewCard);
  renderProfile(employee);

  Tabs.init(Utils.el("#profileTabs"));

  Utils.el("#btnPrintRecord")?.addEventListener("click", () => window.print());
})();
