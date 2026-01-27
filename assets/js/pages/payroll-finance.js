initPage({
  title: "Payroll Finance",
  content: `
    <div class="grid two">
      <div class="card">
        <h4>Payroll Processing</h4>
        <p>Current cycle: March 2024</p>
        <p>Status: ${createBadge("In Progress", "warning")}</p>
        <button class="secondary" style="margin-top:8px;">Download Payroll Summary</button>
      </div>
      <div class="card">
        <h4>Bank File Upload</h4>
        <input type="file" />
        <button style="margin-top:8px;">Upload</button>
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>Payroll Register</h4>
      ${renderTable({
        columns: [
          { key: "month", label: "Month" },
          { key: "processed", label: "Processed" },
          { key: "exceptions", label: "Exceptions" }
        ],
        rows: [
          { month: "Feb 2024", processed: "412", exceptions: "4" },
          { month: "Jan 2024", processed: "408", exceptions: "6" }
        ]
      })}
    </div>
  `
});
