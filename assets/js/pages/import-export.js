initPage({
  title: "Imports & Exports",
  content: `
    <div class="grid two">
      <div class="card">
        <h4>Download Templates</h4>
        <ul style="margin-left:18px;">
          <li><a href="#">Employee Master Template</a></li>
          <li><a href="#">Payroll Upload Template</a></li>
          <li><a href="#">Expense Import Template</a></li>
        </ul>
      </div>
      <div class="card">
        <h4>Upload Excel Files</h4>
        <input type="file" />
        <button style="margin-top:8px;">Upload</button>
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>Export Centre</h4>
      <p class="small">Select dataset and export to Excel for reconciliation.</p>
      <button class="secondary">Export All Transactions</button>
    </div>
  `
});
