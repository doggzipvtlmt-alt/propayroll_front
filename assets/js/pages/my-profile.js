initPage({
  title: "My Profile",
  content: `
    <div class="grid two">
      <div class="card">
        <h4>Personal Details</h4>
        <p><strong>Name:</strong> ${getUserName()}</p>
        <p><strong>Employee ID:</strong> EMP-774</p>
        <p><strong>Email:</strong> ${getUserName()}@doggzi.com</p>
        <p><strong>Department:</strong> Corporate Services</p>
      </div>
      <div class="card">
        <h4>Compliance</h4>
        <p>${createBadge("KYC Verified", "success")}</p>
        <p>${createBadge("Tax Declaration Pending", "warning")}</p>
      </div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>Documents</h4>
      <ul style="margin-left:18px;">
        <li>Appointment Letter</li>
        <li>Identity Proof</li>
        <li>Bank Verification</li>
      </ul>
    </div>
  `
});
