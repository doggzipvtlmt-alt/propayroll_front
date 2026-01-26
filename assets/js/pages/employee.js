(function () {
  Components.mountLayout({ activeNav: "employees" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">People / Employees / Profile</div>
        <h1>Employee Profile</h1>
        <p class="muted">Full view of employee details, documents, and history.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn" href="employees.html">← Back to Directory</a>
        <button class="btn primary" id="btnEditProfile">Edit Profile</button>
      </div>
    </div>

    <div class="card" id="profileHeader"></div>

    <div class="card">
      <div class="hd">
        <h3>Profile Tabs</h3>
        <span class="hint">Navigate details</span>
      </div>
      <div class="bd">
        <div id="profileTabs"></div>
        <div id="tabContent" style="margin-top:16px;"></div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Help Tips</h3>
        <span class="hint">Profile checklist</span>
      </div>
      <div class="bd">
        <ul class="help-list">
          <li>Verify emergency contact and ID documents for compliance.</li>
          <li>Review leave balances during every performance cycle.</li>
          <li>Keep manager assignments updated for workflows.</li>
        </ul>
      </div>
    </div>
  `;

  const id = Utils.getParam("id") || "1";
  const fallbackEmployee = {
    id,
    emp_code: "EMP-1092",
    name: "Avery Patel",
    department: "Engineering",
    designation: "Lead",
    manager: "Maria Thomas",
    join_date: "2021-04-12",
    status: "active",
    email: "avery.patel@officeos.com",
    phone: "+1-202-555-0192",
    location: "New York",
    address: "245 Hudson Street, NY",
    dob: "1991-11-08",
    blood_group: "O+",
    emergency_contact: "Sam Patel • +1-202-555-0171"
  };

  let employee = fallbackEmployee;

  const profileHeader = document.getElementById("profileHeader");
  const profileTabs = document.getElementById("profileTabs");
  const tabContent = document.getElementById("tabContent");

  function renderHeader() {
    profileHeader.innerHTML = `
      <div class="grid two">
        <div>
          <h2 style="margin-top:0;">${Utils.escapeHtml(employee.name)}</h2>
          <p class="muted">${Utils.escapeHtml(employee.designation)} • ${Utils.escapeHtml(employee.department)}</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
            ${Components.badge(employee.status, employee.status)}
            <span class="badge info">${Utils.escapeHtml(employee.emp_code)}</span>
          </div>
        </div>
        <div>
          <div class="mini-card">
            <p><strong>Email:</strong> ${Utils.escapeHtml(employee.email)}</p>
            <p><strong>Phone:</strong> ${Utils.escapeHtml(employee.phone)}</p>
            <p><strong>Manager:</strong> ${Utils.escapeHtml(employee.manager)}</p>
            <p><strong>Join Date:</strong> ${Utils.fmtDate(employee.join_date)}</p>
          </div>
        </div>
      </div>
      <div class="grid three" style="margin-top:20px;">
        <div class="card">
          <div class="hd"><h4>Leave Balance</h4><span class="hint">2024</span></div>
          <div class="bd">
            <p><strong>Annual:</strong> 14 days</p>
            <p><strong>Sick:</strong> 8 days</p>
            <p><strong>WFH:</strong> 6 days</p>
          </div>
        </div>
        <div class="card">
          <div class="hd"><h4>Performance</h4><span class="hint">Quarterly</span></div>
          <div class="bd">
            <p><strong>Score:</strong> 4.3/5</p>
            <p><strong>Last Review:</strong> 2024-01-15</p>
          </div>
        </div>
        <div class="card">
          <div class="hd"><h4>Engagement</h4><span class="hint">Pulse</span></div>
          <div class="bd">
            <p><strong>eNPS:</strong> +38</p>
            <p><strong>Manager Check-in:</strong> Weekly</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderTabContent(key) {
    const sections = {
      overview: `
        <div class="grid two">
          <div class="card">
            <div class="hd"><h4>Role Summary</h4></div>
            <div class="bd">
              <p>${Utils.escapeHtml(employee.name)} drives roadmap delivery for the ${Utils.escapeHtml(employee.department)} team.</p>
              <p><strong>Location:</strong> ${Utils.escapeHtml(employee.location)}</p>
              <p><strong>Office:</strong> HQ - 4th Floor</p>
            </div>
          </div>
          <div class="card">
            <div class="hd"><h4>Manager Insights</h4></div>
            <div class="bd">
              <p><strong>Manager:</strong> ${Utils.escapeHtml(employee.manager)}</p>
              <p>Weekly 1:1 scheduled every Monday at 10:00 AM.</p>
              <p>Next goal review: 2024-05-01.</p>
            </div>
          </div>
        </div>
      `,
      personal: `
        <div class="card">
          <div class="hd"><h4>Personal Details</h4></div>
          <div class="bd">
            <p><strong>Date of Birth:</strong> ${Utils.escapeHtml(employee.dob)}</p>
            <p><strong>Blood Group:</strong> ${Utils.escapeHtml(employee.blood_group)}</p>
            <p><strong>Address:</strong> ${Utils.escapeHtml(employee.address)}</p>
            <p><strong>Emergency Contact:</strong> ${Utils.escapeHtml(employee.emergency_contact)}</p>
          </div>
        </div>
      `,
      work: `
        <div class="grid two">
          <div class="card">
            <div class="hd"><h4>Work Details</h4></div>
            <div class="bd">
              <p><strong>Employee Code:</strong> ${Utils.escapeHtml(employee.emp_code)}</p>
              <p><strong>Designation:</strong> ${Utils.escapeHtml(employee.designation)}</p>
              <p><strong>Department:</strong> ${Utils.escapeHtml(employee.department)}</p>
              <p><strong>Join Date:</strong> ${Utils.fmtDate(employee.join_date)}</p>
            </div>
          </div>
          <div class="card">
            <div class="hd"><h4>Reporting Line</h4></div>
            <div class="bd">
              <p><strong>Manager:</strong> ${Utils.escapeHtml(employee.manager)}</p>
              <p><strong>Direct Reports:</strong> 4 employees</p>
              <p><strong>Work Mode:</strong> Hybrid</p>
            </div>
          </div>
        </div>
      `,
      documents: `
        <div class="card">
          <div class="hd"><h4>Documents</h4><span class="hint">Uploads pending</span></div>
          <div class="bd">
            <p>Upload offer letters, IDs, and compliance documents here.</p>
            <button class="btn">Upload Document</button>
          </div>
        </div>
      `,
      history: `
        <div class="card">
          <div class="hd"><h4>History Timeline</h4></div>
          <div class="bd timeline">
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div>
                <strong>2024-02-12</strong>
                <p class="muted">Completed leadership training.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div>
                <strong>2023-10-01</strong>
                <p class="muted">Promoted to Lead Engineer.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div>
                <strong>2022-05-05</strong>
                <p class="muted">Transferred to Platform team.</p>
              </div>
            </div>
          </div>
        </div>
      `
    };
    tabContent.innerHTML = sections[key] || sections.overview;
  }

  function renderTabs(active = "overview") {
    profileTabs.innerHTML = Components.tabs({
      tabs: [
        { key: "overview", label: "Overview" },
        { key: "personal", label: "Personal" },
        { key: "work", label: "Work" },
        { key: "documents", label: "Documents" },
        { key: "history", label: "History" }
      ],
      active
    });

    profileTabs.addEventListener("click", (e) => {
      const key = e.target.getAttribute("data-tab");
      if (!key) return;
      Utils.qsa(".tab", profileTabs).forEach((tab) => tab.classList.remove("active"));
      e.target.classList.add("active");
      renderTabContent(key);
    });

    renderTabContent(active);
  }

  async function init() {
    try {
      employee = await API.request(`/api/employees/${id}`);
    } catch (err) {
      employee = fallbackEmployee;
    }
    renderHeader();
    renderTabs();
  }

  document.getElementById("btnEditProfile").addEventListener("click", () => {
    Components.toast({
      title: "Edit Mode",
      message: "Profile editing is coming soon.",
      type: "info"
    });
  });

  init();
})();
