(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canAccess = Utils.hasRole(["MD", "ADMIN"]);

  const content = Layout.render({
    title: "Audit Logs",
    subtitle: "System audit trail for compliance and governance.",
    breadcrumb: ["Admin", "Audit"]
  });

  if (!content) return;

  if (!canAccess) {
    content.innerHTML += `
      <div class="card">
        <h3>Access Restricted</h3>
        <p class="muted">Only ADMIN and MD roles can access audit logs.</p>
      </div>
    `;
    return;
  }

  content.innerHTML += `
    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Audit Entries</h3><span class="hint">System activity</span></div>
        <div id="auditTable"></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Audit Guidance</h3><span class="hint">Compliance</span></div>
        <ul class="help-list">
          <li>Audit logs are retained for 7 years.</li>
          <li>Export logs quarterly for statutory filings.</li>
          <li>Critical actions are flagged for review.</li>
        </ul>
      </div>
    </div>
  `;

  const auditTable = Utils.el("#auditTable");
  const fallbackAudit = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    action: i % 2 === 0 ? "User updated" : "Leave approved",
    actor: i % 2 === 0 ? "HR Admin" : "Manager",
    timestamp: `2024-09-${String(i + 1).padStart(2, "0")} 09:${String(i).padStart(2, "0")}`,
    severity: i % 3 === 0 ? "High" : "Normal"
  }));

  const renderTable = (rows) => {
    const columns = [
      { key: "action", label: "Action" },
      { key: "actor", label: "Actor" },
      { key: "timestamp", label: "Timestamp" },
      { key: "severity", label: "Severity" }
    ];
    Table.render(auditTable, { columns, rows, emptyText: "No audit entries." });
  };

  Loader.show(auditTable);
  const response = await api.get("/api/audit", null, { fallbackData: fallbackAudit });
  const entries = response.data || fallbackAudit;
  Loader.hide(auditTable);
  renderTable(entries);
})();
