initPage({
  title: "Employee Profile",
  content: `
    <div class="grid two">
      <div class="card">
        <h4>Profile Summary</h4>
        <p><strong>Name:</strong> Sana Ali</p>
        <p><strong>Employee Code:</strong> EMP-553</p>
        <p><strong>Department:</strong> Finance</p>
        <p><strong>Status:</strong> ${createBadge("Probation", "warning")}</p>
      </div>
      <div class="card">
        <h4>Employment Info</h4>
        <p><strong>Designation:</strong> Finance Analyst</p>
        <p><strong>Joining Date:</strong> 12 Feb 2024</p>
        <p><strong>Manager:</strong> Prakash Verma</p>
        <p><strong>Location:</strong> Mumbai</p>
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>Compliance Checklist</h4>
      <ul style="margin-left: 18px;">
        <li>Identity verification completed.</li>
        <li>Bank account verification pending.</li>
        <li>Tax declarations awaiting submission.</li>
      </ul>
    </div>
  `
});
