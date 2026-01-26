(function () {
  Components.mountLayout({ activeNav: "leaves" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">People / Leaves</div>
        <h1>Leave Management</h1>
        <p class="muted">Track leave requests, approvals, and policy updates.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnApplyLeave">➕ Apply Leave</button>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd">
          <h3>Apply for Leave</h3>
          <span class="hint">Submit a new request</span>
        </div>
        <div class="bd">
          <form id="leaveForm" class="form-grid">
            <div>
              <label>Leave Type</label>
              <select name="type">
                <option>Annual</option>
                <option>Sick</option>
                <option>Casual</option>
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
              <textarea rows="3" name="reason"></textarea>
            </div>
          </form>
          <div style="margin-top:12px;">
            <button class="btn primary" id="submitLeave">Submit Request</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="hd">
          <h3>Leave Policy</h3>
          <span class="hint">Key reminders</span>
        </div>
        <div class="bd">
          <ul class="help-list">
            <li>Annual leave requires 5-day notice where possible.</li>
            <li>Sick leave can be applied retroactively within 48 hours.</li>
            <li>HR will verify balances before approval.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Leave Requests</h3>
        <span class="hint" id="leaveCount">0 requests</span>
      </div>
      <div class="bd" id="leaveTable">${Components.loader("Loading leave requests...")}</div>
    </div>

    <div class="card">
      <div class="hd">
        <h3>Help Tips</h3>
        <span class="hint">For approvers</span>
      </div>
      <div class="bd">
        <ul class="help-list">
          <li>Approve or reject requests within 24 hours.</li>
          <li>Add comments for audit trail visibility.</li>
          <li>Ensure overlapping leaves are flagged.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackLeaves = Utils.sampleRange(12, (i) => ({
    id: i + 1,
    employee: i % 2 === 0 ? "Avery Patel" : "Jordan Lee",
    type: i % 3 === 0 ? "Annual" : i % 3 === 1 ? "Sick" : "WFH",
    start_date: `2024-03-${(i % 9) + 1}`,
    end_date: `2024-03-${(i % 9) + 2}`,
    status: i % 4 === 0 ? "pending" : i % 4 === 1 ? "approved" : "rejected",
    reason: "Personal time off",
    approver: "Maria Thomas"
  }));

  let leaves = [];

  const leaveTable = document.getElementById("leaveTable");
  const leaveCount = document.getElementById("leaveCount");
  const role = (window.APP_CONFIG?.ROLE || "").toUpperCase();
  const canApprove = ["MD", "HR", "ADMIN"].includes(role);

  function renderTable(rows) {
    const columns = [
      { key: "employee", label: "Employee" },
      { key: "type", label: "Type" },
      { key: "start_date", label: "Start", render: (r) => Utils.fmtDate(r.start_date) },
      { key: "end_date", label: "End", render: (r) => Utils.fmtDate(r.end_date) },
      { key: "status", label: "Status", render: (r) => Components.badge(r.status, r.status) },
      { key: "approver", label: "Approver" }
    ];

    const rowActions = canApprove ? (row) => `
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn small" data-approve="${row.id}">Approve</button>
        <button class="btn small" data-reject="${row.id}">Reject</button>
      </div>
    ` : null;

    leaveTable.innerHTML = Components.table({ columns, rows, rowActions, emptyText: "No leave requests found." });
  }

  function openDecisionModal({ mode, row }) {
    const modal = Components.openModal({
      title: `${mode === "approve" ? "Approve" : "Reject"} Leave`,
      bodyHtml: `
        <p>${Utils.escapeHtml(row.employee)} • ${Utils.escapeHtml(row.type)}</p>
        <label>Comment</label>
        <textarea class="input" id="decisionComment" rows="3"></textarea>
      `,
      footerHtml: `
        <button class="btn" id="cancelDecision">Cancel</button>
        <button class="btn primary" id="confirmDecision">Confirm</button>
      `
    });

    document.getElementById("cancelDecision").addEventListener("click", modal.close);
    document.getElementById("confirmDecision").addEventListener("click", async () => {
      const comment = document.getElementById("decisionComment").value;
      try {
        await API.request(`/api/leaves/${row.id}/${mode}`, { method: "PUT", body: { comment } });
        leaves = leaves.map((l) => l.id === row.id ? { ...l, status: mode === "approve" ? "approved" : "rejected" } : l);
        Components.toast({ title: "Updated", message: "Leave request processed.", type: "success" });
      } catch (err) {
        leaves = leaves.map((l) => l.id === row.id ? { ...l, status: mode === "approve" ? "approved" : "rejected" } : l);
      }
      modal.close();
      renderTable(leaves);
    });
  }

  async function loadLeaves() {
    try {
      const data = await API.request("/api/leaves");
      leaves = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackLeaves;
    } catch (err) {
      leaves = fallbackLeaves;
    }
    leaveCount.textContent = `${leaves.length} requests`;
    renderTable(leaves);
  }

  document.getElementById("submitLeave").addEventListener("click", async () => {
    const form = document.getElementById("leaveForm");
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const created = await API.request("/api/leaves", { method: "POST", body: payload });
      leaves = [created, ...leaves];
      Components.toast({ title: "Submitted", message: "Leave request sent for approval.", type: "success" });
    } catch (err) {
      leaves = [{ id: Date.now(), employee: "You", status: "pending", approver: "Manager", ...payload }, ...leaves];
    }
    form.reset();
    renderTable(leaves);
  });

  document.getElementById("btnApplyLeave").addEventListener("click", () => {
    document.getElementById("leaveForm").scrollIntoView({ behavior: "smooth" });
  });

  leaveTable.addEventListener("click", (e) => {
    const approveId = e.target.closest("button[data-approve]")?.getAttribute("data-approve");
    const rejectId = e.target.closest("button[data-reject]")?.getAttribute("data-reject");
    if (approveId) {
      const row = leaves.find((l) => String(l.id) === approveId);
      if (row) openDecisionModal({ mode: "approve", row });
    }
    if (rejectId) {
      const row = leaves.find((l) => String(l.id) === rejectId);
      if (row) openDecisionModal({ mode: "reject", row });
    }
  });

  loadLeaves();
})();
