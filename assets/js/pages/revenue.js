initPage({
  title: "Revenue",
  content: `
    <div class="form-section">
      <h4>Revenue Filters</h4>
      <div class="form-grid">
        <input type="month" />
        <select>
          <option>All Regions</option>
          <option>North</option>
          <option>South</option>
          <option>East</option>
          <option>West</option>
        </select>
      </div>
    </div>
    <div class="card">
      <h4>Revenue Ledger</h4>
      <div id="revenueTable"></div>
      <div style="margin-top:12px; text-align:right;">
        <button class="secondary">Export to Excel</button>
      </div>
    </div>
  `,
  onReady: async () => {
    const tableHost = document.getElementById("revenueTable");
    const loader = showLoader(tableHost);
    let data = [];
    try {
      const response = await request("/api/finance/revenue", "GET");
      data = response?.items || [];
    } catch (error) {
      data = SAMPLE_DATA.finance;
      showToast("Using fallback revenue data.");
    }
    hideLoader(loader);
    tableHost.innerHTML = renderTable({
      columns: [
        { key: "period", label: "Period" },
        { key: "revenue", label: "Revenue" },
        { key: "expense", label: "Expense" }
      ],
      rows: data
    });
  }
});
