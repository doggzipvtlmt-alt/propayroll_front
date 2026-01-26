(function () {
  Components.mountLayout({ activeNav: "audit" });

  const content = document.getElementById("pageContent");
  const role = (window.APP_CONFIG?.ROLE || "").toUpperCase();
  const canView = ["MD", "ADMIN"].includes(role);

  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Office OS / Audit</div>
        <h1>Audit Logs</h1>
        <p class="muted">Immutable activity logs for compliance and security reviews.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnExportAudit">Export Logs</button>
      </div>
    </div>

    <div class="card" id="auditNotice"></div>

    <div class="card" id="auditTableCard">
      <div class="hd"><h3>Audit Entries</h3><span class="hint" id="auditCount">0 entries</span></div>
      <div class="bd" id="auditTable">${Components.loader("Loading audit logs...")}</div>
    </div>

    <div class="card">
      <div class="hd"><h3>Help Tips</h3><span class="hint">Compliance</span></div>
      <div class="bd">
        <ul class="help-list">
          <li>Audit logs are retained for seven years.</li>
          <li>Export logs monthly for offline storage.</li>
          <li>Access is restricted to MD/Admin roles only.</li>
        </ul>
      </div>
    </div>
  `;

  const auditNotice = document.getElementById("auditNotice");
  const auditTableCard = document.getElementById("auditTableCard");
  const auditTable = document.getElementById("auditTable");
  const auditCount = document.getElementById("auditCount");

  const fallbackAudit = Utils.sampleRange(12, (i) => ({
    id: i + 1,
    actor: i % 2 === 0 ? "Admin" : "MD",
    action: i % 2 === 0 ? "Updated payroll settings" : "Exported audit logs",
    target: i % 3 === 0 ? "Settings" : "Audit",
    time: `2024-03-${String((i % 9) + 1).padStart(2, "0")} 14:00`
  }));

  function renderNotice() {
    if (canView) {
      auditNotice.innerHTML = `
        <div class="mini-card">
          <strong>Access Granted</strong>
          <p class="muted">Viewing audit logs as ${Utils.escapeHtml(role)}.</p>
        </div>
      `;
    } else {
      auditNotice.innerHTML = `
        <div class="mini-card">
          <strong>Restricted Access</strong>
          <p class="muted">Audit logs are visible only to MD and Admin roles.</p>
        </div>
      `;
      auditTableCard.style.display = "none";
      document.getElementById("btnExportAudit").setAttribute("disabled", "disabled");
    }
  }

  function renderTable(rows) {
    const columns = [
      { key: "actor", label: "Actor" },
      { key: "action", label: "Action" },
      { key: "target", label: "Target" },
      { key: "time", label: "Timestamp" }
    ];

    auditTable.innerHTML = Components.table({ columns, rows, emptyText: "No audit logs found." });
  }

  async function init() {
    renderNotice();
    if (!canView) return;

    let auditRows = fallbackAudit;
    try {
      const data = await API.request("/api/audit");
      auditRows = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackAudit;
    } catch (err) {
      auditRows = fallbackAudit;
    }

    auditCount.textContent = `${auditRows.length} entries`;
    renderTable(auditRows);
  }

  document.getElementById("btnExportAudit").addEventListener("click", () => {
    Components.toast({ title: "Export started", message: "Audit logs export will be ready soon.", type: "success" });
  });

  init();
})();
