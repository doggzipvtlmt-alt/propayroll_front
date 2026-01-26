(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const canApprove = Utils.hasRole(["HR", "MD", "ADMIN"]);

  const content = Layout.render({
    title: "Leave Management",
    subtitle: "Apply for leave and track approvals across teams.",
    breadcrumb: ["HR", "Leaves"],
    actions: "<button class='btn small' id='btnApplyLeave'>Apply Leave</button>"
  });

  if (!content) return;

  content.innerHTML += `
    <div class="grid two">
      <div>
        <div class="card">
          <div class="hd">
            <h3>Apply Leave</h3>
            <span class="hint">Use official leave categories</span>
          </div>
          <form id="leaveForm">
            <div class="form-grid">
              <div>
                <label>Leave Type</label>
                <select name="type" required>
                  <option value="">Select type</option>
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Privilege Leave</option>
                  <option>Work From Home</option>
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
                <input class="input" name="reason" placeholder="Brief reason" required />
              </div>
            </div>
            <div style="margin-top:12px; display:flex; gap:8px;">
              <button class="btn primary" type="submit">Submit Leave</button>
              <button class="btn" type="reset">Clear</button>
            </div>
          </form>
        </div>
        <div class="card" style="margin-top:16px;">
          <div class="hd">
            <h3>Leave Requests</h3>
            <span class="hint">Status overview</span>
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
              <label>Type</label>
              <select id="typeFilter">
                <option value="">All</option>
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Privilege Leave</option>
                <option>Work From Home</option>
              </select>
            </div>
            <div>
              <label>From</label>
              <input class="input" type="date" id="fromFilter" />
            </div>
            <div>
              <label>To</label>
              <input class="input" type="date" id="toFilter" />
            </div>
          </div>
          <div id="leaveTable" style="margin-top:12px;"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd">
            <h3>Leave Policy Circulars</h3>
            <span class="hint">Official notices</span>
          </div>
          <ul class="help-list">
            <li>Carry-forward is capped at 12 days.</li>
            <li>Sick leave requires medical proof for 2+ days.</li>
            <li>Privilege leave must be applied 7 days in advance.</li>
          </ul>
        </div>
        <div class="card" style="margin-top:16px;">
          <div class="hd">
            <h3>Help Tips</h3>
            <span class="hint">Workflow guidance</span>
          </div>
          <div class="form-row"><label>Balance Sync</label><div>Auto-updated nightly</div></div>
          <div class="form-row"><label>Escalations</label><div>Pending beyond 48 hrs</div></div>
          <div class="form-row"><label>Leave Ledger</label><div>Available in Vault</div></div>
        </div>
      </div>
    </div>
  `;

  const fallbackLeaves = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    employee: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    type: i % 2 === 0 ? "Casual Leave" : "Sick Leave",
    start_date: `2024-09-0${i + 1}`,
    end_date: `2024-09-0${i + 2}`,
    status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Rejected"
  }));

  const leaveTable = Utils.el("#leaveTable");
  let leaves = fallbackLeaves;

  const renderTable = () => {
    const rows = leaves.filter((row) => {
      const status = Utils.el("#statusFilter").value;
      const type = Utils.el("#typeFilter").value;
      if (status && row.status !== status) return false;
      if (type && row.type !== type) return false;
      return true;
    });

    const columns = [
      { key: "employee", label: "Employee" },
      { key: "type", label: "Type" },
      { key: "start_date", label: "Start", render: (r) => Utils.formatDate(r.start_date), exportValue: (r) => r.start_date },
      { key: "end_date", label: "End", render: (r) => Utils.formatDate(r.end_date), exportValue: (r) => r.end_date },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status), exportValue: (r) => r.status }
    ];

    const rowActions = (row) => {
      if (!canApprove || row.status !== "Pending") return "—";
      return `
        <div style="display:flex; gap:6px;">
          <button class="btn small" data-approve="${row.id}">Approve</button>
          <button class="btn small" data-reject="${row.id}">Reject</button>
        </div>
      `;
    };

    Table.render(leaveTable, { columns, rows, rowActions, emptyText: "No leave requests." });
  };

  const loadLeaves = async () => {
    Loader.show(leaveTable);
    const response = await api.get("/api/leaves", null, { fallbackData: fallbackLeaves });
    leaves = response.data || fallbackLeaves;
    Loader.hide(leaveTable);
    renderTable();
  };

  Utils.el("#leaveForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    const response = await api.post("/api/leaves", payload, { fallbackData: { id: Date.now(), employee: "You", status: "Pending", ...payload } });
    if (response.data) {
      leaves = [response.data, ...leaves];
      Toast.show("success", "Leave request submitted.");
      renderTable();
    }
  });

  ["statusFilter", "typeFilter", "fromFilter", "toFilter"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("change", renderTable);
  });

  leaveTable.addEventListener("click", async (event) => {
    const approveId = event.target.closest("button[data-approve]")?.dataset.approve;
    const rejectId = event.target.closest("button[data-reject]")?.dataset.reject;
    if (approveId) {
      await api.put(`/api/leaves/${approveId}/approve`, {}, { fallbackData: {} });
      leaves = leaves.map((row) => row.id === Number(approveId) ? { ...row, status: "Approved" } : row);
      renderTable();
    }
    if (rejectId) {
      await api.put(`/api/leaves/${rejectId}/reject`, {}, { fallbackData: {} });
      leaves = leaves.map((row) => row.id === Number(rejectId) ? { ...row, status: "Rejected" } : row);
      renderTable();
    }
  });

  loadLeaves();
})();
