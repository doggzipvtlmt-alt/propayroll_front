(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Approvals</div>
        <h1>Approval Queue</h1>
        <p class="muted">Review pending approvals across leave, payroll, and access requests.</p>
      </div>
    </div>

    <div class="grid three">
      <div class="card"><h3 id="pendingCount">0</h3><p class="muted">Pending Items</p></div>
      <div class="card"><h3>6</h3><p class="muted">Overdue Reviews</p></div>
      <div class="card"><h3>98%</h3><p class="muted">SLA Compliance</p></div>
    </div>

    <div class="split">
      <div>
        <div class="card">
          <div class="hd"><h3>Filters</h3><span class="hint">Narrow down approvals</span></div>
          <div class="form-grid">
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
              <label>Entity Type</label>
              <select id="entityFilter">
                <option value="">All</option>
                <option>Leave</option>
                <option>Payroll</option>
                <option>Access</option>
              </select>
            </div>
            <div>
              <label>Search</label>
              <input class="input" id="approvalSearch" placeholder="Employee or request ID" />
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="hd"><h3>Approval List</h3><span class="hint" id="approvalCount">0 items</span></div>
          <div id="approvalTable"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd"><h3>Best Practices</h3><span class="hint">Operations tips</span></div>
          <ul class="help-list">
            <li>Review approvals within 24 hours to maintain SLA.</li>
            <li>Route payroll approvals to Finance and HR jointly.</li>
            <li>Use notes to document decision rationale.</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const fallbackApprovals = Array.from({ length: 12 }, (_, i) => ({
    id: `APR-${100 + i}`,
    employee: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    entity_type: i % 3 === 0 ? "Leave" : i % 3 === 1 ? "Payroll" : "Access",
    submitted_at: `2023-09-${10 + i}`,
    status: i % 4 === 0 ? "Rejected" : i % 3 === 0 ? "Approved" : "Pending"
  }));

  let approvals = [];
  const approvalTable = Utils.el("#approvalTable");

  const renderTable = () => {
    const columns = [
      { key: "id", label: "Request ID" },
      { key: "employee", label: "Employee" },
      { key: "entity_type", label: "Type" },
      { key: "submitted_at", label: "Submitted", render: (r) => Utils.formatDate(r.submitted_at) },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status) }
    ];

    Table.render(approvalTable, {
      columns,
      rows: approvals,
      rowActions: (row) => `
        <div style="display:flex; gap:6px;">
          <button class="btn small" data-approve="${row.id}">Approve</button>
          <button class="btn small" data-reject="${row.id}">Reject</button>
        </div>
      `,
      emptyText: "No approvals in queue."
    });
    Utils.el("#approvalCount").textContent = `${approvals.length} items`;
    Utils.el("#pendingCount").textContent = approvals.filter((row) => row.status === "Pending").length;
  };

  const loadApprovals = async () => {
    const query = {
      status: Utils.el("#statusFilter").value,
      entity_type: Utils.el("#entityFilter").value,
      search: Utils.el("#approvalSearch").value
    };

    Loader.show(approvalTable);
    const response = await api.get("/api/approvals", query);
    approvals = response.ok ? (response.data?.items || response.data || []) : fallbackApprovals;
    if (!approvals.length) approvals = fallbackApprovals;
    renderTable();
    Loader.hide(approvalTable);
  };

  approvalTable.addEventListener("click", async (event) => {
    const approveId = event.target.closest("button[data-approve]")?.dataset.approve;
    const rejectId = event.target.closest("button[data-reject]")?.dataset.reject;
    if (approveId) {
      Toast.show("success", `Approval ${approveId} marked approved.`);
    }
    if (rejectId) {
      Toast.show("success", `Approval ${rejectId} marked rejected.`);
    }
  });

  ["statusFilter", "entityFilter", "approvalSearch"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("input", Utils.debounce(loadApprovals, 400));
    Utils.el(`#${id}`)?.addEventListener("change", loadApprovals);
  });

  loadApprovals();
})();
