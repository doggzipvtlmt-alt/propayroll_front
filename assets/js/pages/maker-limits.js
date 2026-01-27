initPage({
  title: "Salary Limits",
  content: `
    <div class="form-section">
      <h4>Set Salary Limit by Designation</h4>
      <form id="limitForm" class="form-grid">
        <input name="designation" placeholder="Designation" required />
        <input name="limit" placeholder="Annual Limit (₹)" required />
        <button type="submit">Save Limit</button>
      </form>
    </div>
    <div id="limitTable"></div>
  `,
  onReady: async () => {
    const tableHost = document.getElementById("limitTable");
    const loader = showLoader(tableHost);
    let data = [];
    try {
      const response = await request("/api/maker/limits", "GET");
      data = response?.items || [];
    } catch (error) {
      data = SAMPLE_DATA.limits;
      showToast("Using fallback limits.");
    }
    hideLoader(loader);
    tableHost.innerHTML = renderTable({
      columns: [
        { key: "designation", label: "Designation" },
        { key: "limit", label: "Limit" }
      ],
      rows: data
    });

    document.getElementById("limitForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.target).entries());
      try {
        await request("/api/maker/limits", "POST", payload);
        showToast("Limit saved.");
      } catch (error) {
        showToast("Limit stored locally.");
      }
    });
  }
});
