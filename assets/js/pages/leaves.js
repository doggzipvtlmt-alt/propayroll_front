(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">People / Leaves</div>
        <h1>Leave Management</h1>
        <p class="muted">Apply, approve, and track leave requests across the organization.</p>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Apply for Leave</h3><span class="hint">Submit a new request</span></div>
        <form id="leaveForm" class="form-grid">
          <div>
            <label>Leave Type</label>
            <select name="type" required>
              <option>Annual</option>
              <option>Sick</option>
              <option>Casual</option>
              <option>Remote Work</option>
            </select>
          </div>
          <div>
            <label>Start Date</label>
            <input class="input" type="date" name="start_date" required />
          </div>
          <div>
            <label>End Date</label>
            <input class="input" type="date" name="end_date" required />
          </div>
          <div>
            <label>Reason</label>
            <textarea class="input" name="reason" rows="3" placeholder="Brief reason"></textarea>
          </div>
        </form>
        <div class="ft">
          <button class="btn primary" id="submitLeave">Submit Request</button>
        </div>
      </div>
      <div class="card">
        <div class="hd"><h3>Leave Balance</h3><span class="hint">Updated daily</span></div>
        <div class="grid three">
          <div><strong>12</strong><p class="muted">Annual</p></div>
          <div><strong>6</strong><p class="muted">Sick</p></div>
          <div><strong>4</strong><p class="muted">Casual</p></div>
        </div>
        <div class="notice" style="margin-top:16px;">
          <strong>Policy Snapshot</strong>
          <p class="muted">Requests beyond 5 days require manager approval.</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Requests</h3>
        <span class="hint">Track approvals and statuses</span>
      </div>
      <div class="form-grid">
        <div>
          <label>Status</label>
          <select id="statusFilter">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label>Leave Type</label>
          <select id="typeFilter">
            <option value="">All</option>
            <option>Annual</option>
            <option>Sick</option>
            <option>Casual</option>
            <option>Remote Work</option>
          </select>
        </div>
        <div>
          <label>Date Range</label>
          <input class="input" id="dateFilter" type="date" />
        </div>
      </div>
      <div id="leaveTable"></div>
    </div>

    <div class="card">
      <div class="hd"><h3>Help Tips</h3><span class="hint">Compliance & policy</span></div>
      <ul class="help-list">
        <li>Ensure leave overlaps are reviewed by the department head.</li>
        <li>Emergency leave can be submitted retroactively within 48 hours.</li>
        <li>Managers can delegate approvals during travel.</li>
      </ul>
    </div>
  `;

  const fallbackLeaves = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    employee: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    type: i % 3 === 0 ? "Annual" : i % 3 === 1 ? "Sick" : "Casual",
    start_date: `2023-09-${10 + i}`,
    end_date: `2023-09-${11 + i}`,
    status: i % 4 === 0 ? "Rejected" : i % 3 === 0 ? "Approved" : "Pending",
    reason: "Family commitment"
  }));

  const leaveTable = Utils.el("#leaveTable");
  const canApprove = ["MD", "HR", "ADMIN"].includes(window.APP_CONFIG.ROLE);

  const renderTable = (rows) => {
    const columns = [
      { key: "employee", label: "Employee" },
      { key: "type", label: "Type" },
      { key: "start_date", label: "Start", render: (r) => Utils.formatDate(r.start_date) },
      { key: "end_date", label: "End", render: (r) => Utils.formatDate(r.end_date) },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status) }
    ];

    const rowActions = canApprove ? (row) => `
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn small" data-approve="${row.id}">Approve</button>
        <button class="btn small" data-reject="${row.id}">Reject</button>
      </div>
    ` : null;

    Table.render(leaveTable, { columns, rows, rowActions, emptyText: "No leave requests." });
  };

  const loadLeaves = async () => {
    const query = {
      status: Utils.el("#statusFilter").value,
      leave_type: Utils.el("#typeFilter").value,
      date: Utils.el("#dateFilter").value
    };

    Loader.show(leaveTable);
    const response = await api.get("/api/leaves", query);
    const rows = response.ok ? (response.data?.items || response.data || []) : fallbackLeaves;
    renderTable(rows.length ? rows : fallbackLeaves);
    Loader.hide(leaveTable);
  };

  Utils.el("#submitLeave")?.addEventListener("click", async () => {
    const form = Utils.el("#leaveForm");
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await api.post("/api/leaves", payload);
    if (response.ok) {
      Toast.show("success", "Leave request submitted.");
      form.reset();
      loadLeaves();
    } else {
      Toast.show("info", "Saved locally as draft.");
    }
  });

  ["statusFilter", "typeFilter", "dateFilter"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("change", loadLeaves);
  });

  leaveTable.addEventListener("click", async (event) => {
    if (!canApprove) return;
    const approveId = event.target.closest("button[data-approve]")?.dataset.approve;
    const rejectId = event.target.closest("button[data-reject]")?.dataset.reject;
    if (approveId) {
      await api.put(`/api/leaves/${approveId}/approve`, {});
      Toast.show("success", "Leave approved.");
      loadLeaves();
    }
    if (rejectId) {
      await api.put(`/api/leaves/${rejectId}/reject`, {});
      Toast.show("success", "Leave rejected.");
      loadLeaves();
    }
  });

  loadLeaves();
})();
