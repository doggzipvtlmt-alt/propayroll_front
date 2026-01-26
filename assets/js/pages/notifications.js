(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const content = Layout.render({
    title: "Notifications",
    subtitle: "Alerts, circulars, and system notifications.",
    breadcrumb: ["Personal", "Notifications"]
  });

  if (!content) return;

  content.innerHTML += `
    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Notifications Feed</h3><span class="hint">Latest updates</span></div>
        <div id="notificationTable"></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Notice Board</h3><span class="hint">Administrative circulars</span></div>
        <ul class="help-list">
          <li>Payroll cut-off reminders dispatched.</li>
          <li>Biometric attendance compliance notice.</li>
          <li>Quarterly appraisal timeline announced.</li>
        </ul>
      </div>
    </div>
  `;

  const notificationTable = Utils.el("#notificationTable");

  const fallbackNotifications = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: i % 2 === 0 ? "Approval reminder" : "System update",
    detail: i % 2 === 0 ? "Pending approval requires action" : "Payroll module updated",
    date: `2024-09-${String(i + 1).padStart(2, "0")}`,
    priority: i % 2 === 0 ? "High" : "Normal"
  }));

  const renderTable = (rows) => {
    const columns = [
      { key: "title", label: "Title" },
      { key: "detail", label: "Message" },
      { key: "date", label: "Date", render: (r) => Utils.formatDate(r.date), exportValue: (r) => r.date },
      { key: "priority", label: "Priority" }
    ];
    Table.render(notificationTable, { columns, rows, emptyText: "No notifications." });
  };

  Loader.show(notificationTable);
  const response = await api.get("/api/notifications", null, { fallbackData: fallbackNotifications });
  const notifications = response.data || fallbackNotifications;
  Loader.hide(notificationTable);
  renderTable(notifications);
})();
