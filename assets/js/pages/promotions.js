initPage({
  title: "Promotions",
  content: `
    <div class="card">
      <h4>Promotion Pipeline</h4>
      <p class="small">Review candidates aligned with performance and tenure criteria.</p>
    </div>
    <div id="promotionTable" style="margin-top:12px;"></div>
  `,
  onReady: () => {
    document.getElementById("promotionTable").innerHTML = renderTable({
      columns: [
        { key: "employee", label: "Employee" },
        { key: "current", label: "Current Role" },
        { key: "proposed", label: "Proposed Role" },
        { key: "status", label: "Status" }
      ],
      rows: [
        {
          employee: "Rohan Mehta",
          current: "Analyst",
          proposed: "Senior Analyst",
          status: createBadge("Under Review", "warning")
        },
        {
          employee: "Aditi Roy",
          current: "HR Executive",
          proposed: "HR Lead",
          status: createBadge("Approved", "success")
        }
      ]
    });
  }
});
