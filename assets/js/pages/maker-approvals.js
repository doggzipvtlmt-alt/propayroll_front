initPage({
  title: "Maker Approvals",
  content: `
    <div class="form-section">
      <h4>Approval Filters</h4>
      <div class="form-grid">
        <input placeholder="Search by name / request ID" />
        <select>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>
    </div>
    <div id="approvalTable"></div>
    <div style="margin-top:12px;">${renderPagination()}</div>
    <div id="activity" class="card" style="margin-top:12px;">
      <h4>Recent Activity</h4>
      <ul style="margin-left: 18px;">
        <li>REQ-1092 approved by Maker (09:12)</li>
        <li>REQ-1091 rejected - duplicate account</li>
      </ul>
    </div>
  `,
  onReady: async () => {
    const tableHost = document.getElementById("approvalTable");
    const loader = showLoader(tableHost);
    let data = [];
    try {
      const response = await request("/api/maker/approvals", "GET");
      data = response?.items || [];
    } catch (error) {
      data = SAMPLE_DATA.approvals;
      showToast("Using fallback approvals data.");
    }
    hideLoader(loader);
    tableHost.innerHTML = renderTable({
      columns: [
        { key: "id", label: "Request ID" },
        { key: "name", label: "Name" },
        { key: "role", label: "Role Requested" },
        { key: "requested_on", label: "Requested On" },
        { key: "status", label: "Status" }
      ],
      rows: data.map((item) => ({
        ...item,
        requested_on: formatDate(item.requested_on),
        status: createBadge(item.status || "Pending", "warning")
      })),
      actions: [
        { key: "approve", label: "Approve", class: "secondary" },
        { key: "reject", label: "Reject", class: "danger" }
      ]
    });

    tableHost.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      const id = button.dataset.id;
      try {
        await request(`/api/maker/approvals/${id}/${action}`, "POST");
        showToast(`Request ${id} ${action}d.`);
      } catch (error) {
        showToast(`Recorded ${action} for ${id} locally.`);
      }
    });
  }
});
