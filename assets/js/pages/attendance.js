initPage({
  title: "Attendance",
  content: `
    <div class="grid two">
      <div class="card">
        <h4>Monthly Summary</h4>
        <p><strong>Present Days:</strong> 21</p>
        <p><strong>Late Marks:</strong> 2</p>
        <p><strong>Remote Days:</strong> 4</p>
      </div>
      <div class="card">
        <h4>Attendance Actions</h4>
        <button class="secondary">Request Correction</button>
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>Recent Attendance</h4>
      ${renderTable({
        columns: [
          { key: "date", label: "Date" },
          { key: "status", label: "Status" },
          { key: "remarks", label: "Remarks" }
        ],
        rows: [
          { date: "18 Mar 2024", status: createBadge("Present", "success"), remarks: "On time" },
          { date: "19 Mar 2024", status: createBadge("Late", "warning"), remarks: "10 mins late" }
        ]
      })}
    </div>
  `
});
