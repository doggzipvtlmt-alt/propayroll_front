initPage({
  title: "Payslips",
  content: `
    <div class="card">
      <h4>Payslip Archive</h4>
      ${renderTable({
        columns: [
          { key: "month", label: "Month" },
          { key: "net", label: "Net Pay" },
          { key: "actions", label: "Action" }
        ],
        rows: [
          { month: "Feb 2024", net: "₹ 62,800", actions: "Download" },
          { month: "Jan 2024", net: "₹ 62,800", actions: "Download" }
        ]
      })}
    </div>
  `
});
