function getDashboardContent(role) {
  const common = `
    <div class="card">
      <h4>System Notices</h4>
      <p class="small">Quarterly payroll lock scheduled on 28th. Ensure approvals are completed.</p>
    </div>
  `;
  const widgets = {
    MAKER: `
      <div class="grid three">
        <div class="card"><h4>Pending Approvals</h4><strong>12</strong></div>
        <div class="card"><h4>Limits Summary</h4><strong>₹ 1.2 Cr</strong></div>
        <div class="card"><h4>Recent Activity</h4><strong>18 items</strong></div>
      </div>
      <div class="card" style="margin-top:12px;">
        <h4>Approval Queue Snapshot</h4>
        ${renderTable({
          columns: [
            { key: "id", label: "Request ID" },
            { key: "name", label: "Name" },
            { key: "role", label: "Role" },
            { key: "status", label: "Status" }
          ],
          rows: SAMPLE_DATA.approvals.map((item) => ({
            ...item,
            status: createBadge(item.status, "warning")
          }))
        })}
      </div>
    `,
    HR: `
      <div class="grid three">
        <div class="card"><h4>Total Employees</h4><strong>418</strong></div>
        <div class="card"><h4>Onboarding Pipeline</h4><strong>22</strong></div>
        <div class="card"><h4>Appraisals Due</h4><strong>34</strong></div>
      </div>
      <div class="card" style="margin-top:12px;">
        <h4>Active Employee Status</h4>
        ${renderTable({
          columns: [
            { key: "code", label: "Employee Code" },
            { key: "name", label: "Name" },
            { key: "dept", label: "Department" },
            { key: "status", label: "Status" }
          ],
          rows: SAMPLE_DATA.employees.map((emp) => ({
            ...emp,
            status: createBadge(emp.status, emp.status === "Active" ? "success" : "warning")
          }))
        })}
      </div>
    `,
    FINANCE: `
      <div class="grid three">
        <div class="card"><h4>Revenue KPI</h4><strong>₹ 9.0 Cr</strong></div>
        <div class="card"><h4>Expense KPI</h4><strong>₹ 6.6 Cr</strong></div>
        <div class="card"><h4>Payroll Status</h4><strong>94% processed</strong></div>
      </div>
      <div class="card" style="margin-top:12px;">
        <h4>Quarterly Summary</h4>
        ${renderTable({
          columns: [
            { key: "period", label: "Period" },
            { key: "revenue", label: "Revenue" },
            { key: "expense", label: "Expense" }
          ],
          rows: SAMPLE_DATA.finance
        })}
      </div>
    `,
    MD: `
      <div class="grid three">
        <div class="card"><h4>Approval Queue</h4><strong>7</strong></div>
        <div class="card"><h4>Department Summary</h4><strong>14 departments</strong></div>
        <div class="card"><h4>Risk Alerts</h4><strong>2 open</strong></div>
      </div>
      <div class="card" style="margin-top:12px;">
        <h4>Executive Reviews</h4>
        <ul style="margin-left: 18px;">
          <li>Salary limit adjustments pending for Finance.</li>
          <li>Performance review cycle to close by 30th.</li>
          <li>Compliance audit report due next week.</li>
        </ul>
      </div>
    `,
    EMPLOYEE: `
      <div class="grid three">
        <div class="card"><h4>Leave Balance</h4><strong>12 days</strong></div>
        <div class="card"><h4>Attendance</h4><strong>92% this month</strong></div>
        <div class="card"><h4>Payslip Links</h4><strong>Last 3 months</strong></div>
      </div>
      <div class="card" style="margin-top:12px;">
        <h4>Recent Tickets</h4>
        ${renderTable({
          columns: [
            { key: "id", label: "Ticket" },
            { key: "subject", label: "Subject" },
            { key: "status", label: "Status" }
          ],
          rows: SAMPLE_DATA.tickets.map((ticket) => ({
            ...ticket,
            status: createBadge(ticket.status, ticket.status === "Open" ? "warning" : "success")
          }))
        })}
      </div>
    `
  };
  return `${widgets[role] || widgets.EMPLOYEE}${common}`;
}

initPage({
  title: "Dashboard",
  content: getDashboardContent(getUserRole())
});
