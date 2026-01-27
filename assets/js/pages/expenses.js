initPage({
  title: "Expenses",
  content: `
    <div class="form-section">
      <h4>Expense Filters</h4>
      <div class="form-grid">
        <input type="month" />
        <select>
          <option>All Cost Centers</option>
          <option>Operations</option>
          <option>HR</option>
          <option>IT</option>
        </select>
      </div>
    </div>
    <div class="card">
      <h4>Expense Ledger</h4>
      <div id="expenseTable"></div>
      <div style="margin-top:12px; text-align:right;">
        <button class="secondary">Export to Excel</button>
      </div>
    </div>
  `,
  onReady: async () => {
    const tableHost = document.getElementById("expenseTable");
    const loader = showLoader(tableHost);
    let data = [];
    try {
      const response = await request("/api/finance/expenses", "GET");
      data = response?.items || [];
    } catch (error) {
      data = [
        { category: "Recruitment", amount: "₹ 12,50,000", status: "Approved" },
        { category: "IT Licenses", amount: "₹ 8,20,000", status: "Pending" }
      ];
      showToast("Using fallback expense data.");
    }
    hideLoader(loader);
    tableHost.innerHTML = renderTable({
      columns: [
        { key: "category", label: "Category" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" }
      ],
      rows: data.map((item) => ({
        ...item,
        status: createBadge(item.status, item.status === "Approved" ? "success" : "warning")
      }))
    });
  }
});
