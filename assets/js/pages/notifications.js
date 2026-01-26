(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Notifications</div>
        <h1>Notifications Center</h1>
        <p class="muted">Track system alerts, approvals, and policy updates.</p>
      </div>
      <button class="btn primary" id="btnReadAll">Mark All Read</button>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Summary</h3><span class="hint">Notification overview</span></div>
        <div class="grid three">
          <div><strong id="notiTotal">0</strong><p class="muted">Total</p></div>
          <div><strong id="notiUnread">0</strong><p class="muted">Unread</p></div>
          <div><strong>4</strong><p class="muted">Critical</p></div>
        </div>
      </div>
      <div class="card">
        <div class="hd"><h3>Best Practices</h3><span class="hint">Comms tips</span></div>
        <ul class="help-list">
          <li>Resolve critical alerts within 2 hours.</li>
          <li>Archive informational notices monthly.</li>
          <li>Review approval alerts daily.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>All Notifications</h3><span class="hint" id="notiCount">0 items</span></div>
      <div id="notificationsTable"></div>
    </div>
  `;

  const fallbackNotifications = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: i % 2 === 0 ? "Leave request pending" : "New policy update",
    type: i % 3 === 0 ? "Critical" : "Info",
    created_at: `2023-09-${10 + i}`,
    status: i % 4 === 0 ? "Read" : "Unread"
  }));

  let notifications = [];
  const tableEl = Utils.el("#notificationsTable");

  const renderTable = () => {
    const columns = [
      { key: "title", label: "Message" },
      { key: "type", label: "Type" },
      { key: "created_at", label: "Date", render: (r) => Utils.formatDate(r.created_at) },
      { key: "status", label: "Status", render: (r) => Badge.render(r.status === "Unread" ? "Pending" : "Approved") }
    ];

    Table.render(tableEl, {
      columns,
      rows: notifications,
      rowActions: (row) => `
        <div style="display:flex; gap:6px;">
          <button class="btn small" data-read="${row.id}">Mark Read</button>
        </div>
      `,
      emptyText: "No notifications available."
    });
    Utils.el("#notiCount").textContent = `${notifications.length} items`;
    Utils.el("#notiTotal").textContent = notifications.length;
    Utils.el("#notiUnread").textContent = notifications.filter((row) => row.status === "Unread").length;
  };

  const loadNotifications = async () => {
    Loader.show(tableEl);
    const response = await api.get("/api/notifications");
    notifications = response.ok ? (response.data?.items || response.data || []) : fallbackNotifications;
    if (!notifications.length) notifications = fallbackNotifications;
    renderTable();
    Loader.hide(tableEl);
  };

  Utils.el("#btnReadAll")?.addEventListener("click", async () => {
    const response = await api.put("/api/notifications/read-all", {});
    if (response.ok) Toast.show("success", "All notifications marked read.");
    notifications = notifications.map((n) => ({ ...n, status: "Read" }));
    renderTable();
  });

  tableEl.addEventListener("click", async (event) => {
    const readId = event.target.closest("button[data-read]")?.dataset.read;
    if (!readId) return;
    await api.put(`/api/notifications/${readId}/read`, {});
    notifications = notifications.map((n) => n.id == readId ? { ...n, status: "Read" } : n);
    renderTable();
  });

  loadNotifications();
})();
