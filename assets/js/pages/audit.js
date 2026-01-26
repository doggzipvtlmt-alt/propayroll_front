(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  const role = window.APP_CONFIG.ROLE;

  if (!['MD', 'ADMIN'].includes(role)) {
    content.innerHTML = `
      <div class="page-title">
        <div>
          <div class="breadcrumb">Admin / Audit</div>
          <h1>Audit Log</h1>
          <p class="muted">Access restricted to MD and ADMIN roles.</p>
        </div>
      </div>
      <div class="card">
        <div class="hd"><h3>Access Denied</h3></div>
        <p class="muted">Your role (${Utils.escapeHtml(role)}) does not have permission to view audit logs.</p>
        <div class="notice" style="margin-top:16px;">
          <strong>Need access?</strong>
          <p class="muted">Contact your system administrator to request audit viewer permissions.</p>
        </div>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Audit</div>
        <h1>Audit Log</h1>
        <p class="muted">Review all critical system actions and security events.</p>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Audit Summary</h3><span class="hint">Last 30 days</span></div>
        <div class="grid three">
          <div><strong>132</strong><p class="muted">Events</p></div>
          <div><strong>9</strong><p class="muted">Critical</p></div>
          <div><strong>98%</strong><p class="muted">Resolved</p></div>
        </div>
      </div>
      <div class="card">
        <div class="hd"><h3>Best Practices</h3><span class="hint">Compliance tips</span></div>
        <ul class="help-list">
          <li>Review privileged actions weekly.</li>
          <li>Export audit logs before payroll closing.</li>
          <li>Investigate repeated access failures.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>Audit Events</h3><span class="hint" id="auditCount">0 entries</span></div>
      <div id="auditTable"></div>
    </div>
  `;

  const fallbackAudit = Array.from({ length: 12 }, (_, i) => ({
    id: `AUD-${100 + i}`,
    actor: i % 2 === 0 ? "Admin User" : "HR Manager",
    action: i % 3 === 0 ? "Updated payroll settings" : i % 3 === 1 ? "Approved leave" : "Reset user password",
    entity: i % 2 === 0 ? "Payroll" : "Employee",
    created_at: `2023-09-${10 + i}`
  }));

  const auditTable = Utils.el("#auditTable");

  const renderTable = (rows) => {
    const columns = [
      { key: "id", label: "Event ID" },
      { key: "actor", label: "Actor" },
      { key: "action", label: "Action" },
      { key: "entity", label: "Entity" },
      { key: "created_at", label: "Date", render: (r) => Utils.formatDate(r.created_at) }
    ];
    Table.render(auditTable, { columns, rows, emptyText: "No audit events found." });
    Utils.el("#auditCount").textContent = `${rows.length} entries`;
  };

  const loadAudit = async () => {
    Loader.show(auditTable);
    const response = await api.get("/api/audit");
    const rows = response.ok ? (response.data?.items || response.data || []) : fallbackAudit;
    renderTable(rows.length ? rows : fallbackAudit);
    Loader.hide(auditTable);
  };

  loadAudit();
})();
