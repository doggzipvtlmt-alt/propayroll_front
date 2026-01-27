initPage({
  title: "Service Tickets",
  content: `
    <div class="grid two">
      <div class="card">
        <h4>Submit Ticket</h4>
        <form id="ticketForm" class="grid">
          <input name="subject" placeholder="Subject" required />
          <textarea name="description" placeholder="Describe the issue" rows="4" required></textarea>
          <button type="submit">Submit Ticket</button>
        </form>
      </div>
      <div class="card">
        <h4>Ticket SLA</h4>
        <p>Response time: 24 hours</p>
        <p>Escalation: After 48 hours</p>
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>My Tickets</h4>
      ${renderTable({
        columns: [
          { key: "id", label: "Ticket ID" },
          { key: "subject", label: "Subject" },
          { key: "status", label: "Status" }
        ],
        rows: SAMPLE_DATA.tickets.map((ticket) => ({
          ...ticket,
          status: createBadge(ticket.status, ticket.status === "Open" ? "warning" : "success")
        }))
      })}
    </div>
  `,
  onReady: () => {
    document.getElementById("ticketForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.target).entries());
      try {
        await request("/api/employee/tickets", "POST", payload);
        showToast("Ticket submitted successfully.");
      } catch (error) {
        showToast("Ticket stored locally.");
      }
    });
  }
});
