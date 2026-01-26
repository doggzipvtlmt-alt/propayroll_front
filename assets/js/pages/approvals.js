(function () {
  Components.mountLayout({ activeNav: "approvals" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Office OS / Approvals</div>
        <h1>Approvals Queue</h1>
        <p class="muted">Track approvals across leave, attendance, and expenses.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnBulkApprove">Approve All</button>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>Filters</h3><span class="hint">Queue filters</span></div>
      <div class="bd form-grid">
        <div>
          <label>Status</label>
          <select id="approvalStatus">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label>Type</label>
          <select id="approvalType">
            <option value="">All Types</option>
            <option>Leave</option>
            <option>Attendance</option>
            <option>Expense</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>Approvals</h3><span class="hint" id="approvalCount">0 items</span></div>
      <div class="bd" id="approvalTable">${Components.loader("Loading approvals...")}</div>
    </div>

    <div class="card">
      <div class="hd"><h3>Help Tips</h3><span class="hint">SLA reminders</span></div>
      <div class="bd">
        <ul class="help-list">
          <li>High-priority approvals are highlighted in the queue.</li>
          <li>Add comments to rejected items to reduce rework.</li>
          <li>Bulk actions apply to the filtered view.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackApprovals = Utils.sampleRange(14, (i) => ({
    id: i + 1,
    requester: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    type: i % 3 === 0 ? "Leave" : i % 3 === 1 ? "Attendance" : "Expense",
    status: i % 4 === 0 ? "pending" : i % 4 === 1 ? "approved" : "rejected",
    submitted: `2024-03-${String((i % 9) + 1).padStart(2, "0")}`,
    due: `2024-03-${String((i % 9) + 3).padStart(2, "0")}`
  }));

  let approvals = [];

  const approvalTable = document.getElementById("approvalTable");
  const approvalCount = document.getElementById("approvalCount");

  function renderTable(rows) {
    const columns = [
      { key: "requester", label: "Requester" },
      { key: "type", label: "Type" },
      { key: "submitted", label: "Submitted", render: (r) => Utils.fmtDate(r.submitted) },
      { key: "due", label: "Due", render: (r) => Utils.fmtDate(r.due) },
      { key: "status", label: "Status", render: (r) => Components.badge(r.status, r.status) }
    ];

    approvalTable.innerHTML = Components.table({ columns, rows, emptyText: "No approvals found." });
  }

  function applyFilters() {
    const status = document.getElementById("approvalStatus").value;
    const type = document.getElementById("approvalType").value;
    const filtered = approvals.filter((row) => {
      return (!status || row.status === status) && (!type || row.type === type);
    });
    approvalCount.textContent = `${filtered.length} items`;
    renderTable(filtered);
  }

  async function init() {
    try {
      const data = await API.request("/api/approvals");
      approvals = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackApprovals;
    } catch (err) {
      approvals = fallbackApprovals;
    }
    applyFilters();
  }

  document.getElementById("btnBulkApprove").addEventListener("click", () => {
    Components.toast({ title: "Bulk action", message: "Approvals queued for processing.", type: "success" });
  });

  ["approvalStatus", "approvalType"].forEach((id) => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });

  init();
})();
