(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canAccess = Utils.hasRole(["HR", "MD", "FINANCE", "SUPERUSER"]);

  const content = Layout.render({
    title: "Approvals Desk",
    subtitle: "Centralized approvals for HR, finance, and governance workflows.",
    breadcrumb: ["Workflow", "Approvals"]
  });

  if (!content) return;

  if (!canAccess) {
    content.innerHTML += `
      <div class="card">
        <h3>Access Restricted</h3>
        <p class="muted">Approval workflows are restricted to HR, Finance, MD, and Superuser roles.</p>
      </div>
    `;
    return;
  }

  content.innerHTML += `
    <div class="grid two">
      <div>
        <div class="card">
          <div class="hd"><h3>Filters</h3><span class="hint">Refine approvals</span></div>
          <div class="form-grid">
            <div>
              <label>Type</label>
              <select id="typeFilter">
                <option value="">All</option>
                <option>Leave</option>
                <option>Expense</option>
                <option>Payroll</option>
              </select>
            </div>
            <div>
              <label>Status</label>
              <select id="statusFilter">
                <option value="">All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
            <div>
              <label>Priority</label>
              <select id="priorityFilter">
                <option value="">All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </div>
        <div class="card" style="margin-top:16px;">
          <div class="hd"><h3>Approval Queue</h3><span class="hint" id="approvalCount">0 requests</span></div>
          <div id="approvalTable"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd"><h3>Service Notes</h3><span class="hint">Guidance</span></div>
          <ul class="help-list">
            <li>Designation or salary changes require Finance → MD → Superuser approvals.</li>
            <li>High priority items auto-escalate to MD after 24 hours.</li>
            <li>Rejected items require a reason in audit logs.</li>
          </ul>
        </div>
        <div class="card" style="margin-top:16px;">
          <div class="hd"><h3>Print Batch</h3><span class="hint">Print-ready</span></div>
          <p class="muted">Use print to archive approvals for compliance reviews.</p>
        </div>
      </div>
    </div>
  `;

  const approvalTable = Utils.el("#approvalTable");
  const approvalCount = Utils.el("#approvalCount");

  const fallbackApprovals = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    requester: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    type: i % 2 === 0 ? "Leave" : "Expense",
    submitted: `2024-09-${String(i + 1).padStart(2, "0")}`,
    status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Rejected",
    priority: i % 2 === 0 ? "High" : "Medium"
  }));

  let approvals = [];

  const renderTable = () => {
    const type = Utils.el("#typeFilter").value;
    const status = Utils.el("#statusFilter").value;
    const priority = Utils.el("#priorityFilter").value;

    const rows = approvals.filter((row) => {
      if (type && row.type !== type) return false;
      if (status && row.status !== status) return false;
      if (priority && row.priority !== priority) return false;
      return true;
    });

    approvalCount.textContent = `${rows.length} requests`;

    const columns = [
      { key: "requester", label: "Requester" },
      { key: "type", label: "Type" },
      { key: "submitted", label: "Submitted", render: (r) => Utils.formatDate(r.submitted), exportValue: (r) => r.submitted },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status), exportValue: (r) => r.status }
    ];

    const rowActions = (row) => {
      if (row.status !== "Pending") return "—";
      return `
        <div style="display:flex; gap:6px;">
          <button class="btn small" data-approve="${row.id}">Approve</button>
          <button class="btn small" data-reject="${row.id}">Reject</button>
        </div>
      `;
    };

    Table.render(approvalTable, { columns, rows, rowActions, emptyText: "No approvals pending." });
  };

  const loadApprovals = async () => {
    Loader.show(approvalTable);
    const response = await api.get("/api/approvals", null, { fallbackData: fallbackApprovals });
    approvals = response.data || fallbackApprovals;
    Loader.hide(approvalTable);
    renderTable();
  };

  approvalTable.addEventListener("click", async (event) => {
    const approveId = event.target.closest("button[data-approve]")?.dataset.approve;
    const rejectId = event.target.closest("button[data-reject]")?.dataset.reject;
    if (approveId) {
      await api.put(`/api/approvals/${approveId}/approve`, {}, { fallbackData: {} });
      approvals = approvals.map((row) => row.id === Number(approveId) ? { ...row, status: "Approved" } : row);
      renderTable();
    }
    if (rejectId) {
      await api.put(`/api/approvals/${rejectId}/reject`, {}, { fallbackData: {} });
      approvals = approvals.map((row) => row.id === Number(rejectId) ? { ...row, status: "Rejected" } : row);
      renderTable();
    }
  });

  ["typeFilter", "statusFilter", "priorityFilter"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("change", renderTable);
  });

  loadApprovals();
})();
