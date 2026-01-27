initPage({
  title: "Leave Management",
  content: `
    <div class="grid two">
      <div class="card">
        <h4>Leave Balances</h4>
        <p>Annual: 12 days</p>
        <p>Sick: 6 days</p>
        <p>Casual: 4 days</p>
      </div>
      <div class="card">
        <h4>Apply Leave</h4>
        <form id="leaveForm" class="grid">
          <input type="date" name="from" required />
          <input type="date" name="to" required />
          <select name="type" required>
            <option>Annual</option>
            <option>Sick</option>
            <option>Casual</option>
          </select>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>Leave History</h4>
      ${renderTable({
        columns: [
          { key: "period", label: "Period" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" }
        ],
        rows: [
          { period: "12-14 Feb", type: "Annual", status: createBadge("Approved", "success") },
          { period: "03 Mar", type: "Sick", status: createBadge("Pending", "warning") }
        ]
      })}
    </div>
  `,
  onReady: () => {
    document.getElementById("leaveForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.target).entries());
      try {
        await request("/api/employee/leaves", "POST", payload);
        showToast("Leave submitted for approval.");
      } catch (error) {
        showToast("Leave queued locally.");
      }
    });
  }
});
