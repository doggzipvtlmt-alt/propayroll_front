initPage({
  title: "Appraisals",
  content: `
    <div class="form-section">
      <h4>Appraisal Cycle</h4>
      <div class="form-grid">
        <select>
          <option>FY 2023-24</option>
          <option>FY 2024-25</option>
        </select>
        <select>
          <option>All Status</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </div>
    </div>
    <div id="appraisalTable"></div>
  `,
  onReady: () => {
    const tableHost = document.getElementById("appraisalTable");
    tableHost.innerHTML = renderTable({
      columns: [
        { key: "employee", label: "Employee" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" }
      ],
      rows: [
        { employee: "Vikram Singh", role: "Operations Lead", status: createBadge("Pending", "warning") },
        { employee: "Sana Ali", role: "Finance Analyst", status: createBadge("Completed", "success") }
      ]
    });
  }
});
