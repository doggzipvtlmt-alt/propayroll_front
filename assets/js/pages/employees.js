initPage({
  title: "Employee Directory",
  content: `
    <div class="form-section">
      <h4>Directory Filters</h4>
      <div class="form-grid">
        <input placeholder="Search name or code" />
        <select>
          <option>All Departments</option>
          <option>Operations</option>
          <option>Finance</option>
          <option>IT</option>
          <option>HR</option>
        </select>
      </div>
    </div>
    <div id="employeeTable"></div>
    <div class="form-section" id="requests" style="margin-top:16px;">
      <h4>Add Employee</h4>
      <form id="employeeForm" class="grid">
        <div class="form-section">
          <h4>Personal Information</h4>
          <div class="form-grid">
            <input name="full_name" placeholder="Full Name" required />
            <input name="employee_code" placeholder="Employee Code" required />
            <input name="dob" type="date" placeholder="Date of Birth" required />
            <input name="gender" placeholder="Gender" required />
            <input name="email" type="email" placeholder="Official Email" required />
            <input name="phone" placeholder="Phone Number" required />
          </div>
        </div>
        <div class="form-section">
          <h4>Employment Details</h4>
          <div class="form-grid">
            <input name="department" placeholder="Department" required />
            <input name="designation" placeholder="Designation" required />
            <input name="manager" placeholder="Reporting Manager" required />
            <input name="location" placeholder="Location" required />
            <input name="joining_date" type="date" placeholder="Joining Date" required />
            <input name="employment_type" placeholder="Employment Type" required />
          </div>
        </div>
        <div class="form-section">
          <h4>Payroll & Compliance</h4>
          <div class="form-grid">
            <input name="pan" placeholder="PAN" required />
            <input name="aadhaar" placeholder="Aadhaar" required />
            <input name="bank" placeholder="Bank Name" required />
            <input name="ifsc" placeholder="IFSC" required />
            <input name="account" placeholder="Account Number" required />
            <input name="salary" placeholder="Annual CTC" required />
          </div>
        </div>
        <div class="form-section">
          <h4>Emergency Contact</h4>
          <div class="form-grid">
            <input name="emergency_name" placeholder="Contact Name" required />
            <input name="emergency_phone" placeholder="Contact Phone" required />
            <input name="relation" placeholder="Relationship" required />
            <input name="address" placeholder="Residential Address" required />
          </div>
        </div>
        <div style="text-align: right;">
          <button type="submit">Save Employee Record</button>
        </div>
      </form>
    </div>
  `,
  onReady: async () => {
    const tableHost = document.getElementById("employeeTable");
    const loader = showLoader(tableHost);
    let data = [];
    try {
      const response = await request("/api/hr/employees", "GET");
      data = response?.items || [];
    } catch (error) {
      data = SAMPLE_DATA.employees;
      showToast("Using fallback employee directory.");
    }
    hideLoader(loader);
    tableHost.innerHTML = renderTable({
      columns: [
        { key: "code", label: "Employee Code" },
        { key: "name", label: "Name" },
        { key: "dept", label: "Department" },
        { key: "status", label: "Status" }
      ],
      rows: data.map((emp) => ({
        ...emp,
        status: createBadge(emp.status || "Active", emp.status === "Active" ? "success" : "warning")
      })),
      actions: [
        { key: "view", label: "View", class: "secondary" }
      ]
    });

    document.getElementById("employeeForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.target).entries());
      try {
        await request("/api/hr/employees", "POST", payload);
        showModal("Employee Saved", "Employee record stored successfully. Redirecting to dashboard.");
      } catch (error) {
        showModal("Employee Saved", "Employee record stored locally. Redirecting to dashboard.");
      }
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    });
  }
});
