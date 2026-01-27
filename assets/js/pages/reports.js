initPage({
  title: "Finance Reports",
  content: `
    <div class="card">
      <h4>Report Catalogue</h4>
      ${renderTable({
        columns: [
          { key: "report", label: "Report" },
          { key: "owner", label: "Owner" },
          { key: "actions", label: "Action" }
        ],
        rows: [
          { report: "Payroll Variance", owner: "Finance", actions: "Download" },
          { report: "Revenue Summary", owner: "Revenue Ops", actions: "Download" }
        ]
      })}
    </div>
  `
});
