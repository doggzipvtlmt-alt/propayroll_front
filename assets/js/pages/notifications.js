(function () {
  Components.mountLayout({ activeNav: "notifications" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Office OS / Notifications</div>
        <h1>Notifications Center</h1>
        <p class="muted">Stay informed with real-time alerts and updates.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnMarkRead">Mark All Read</button>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Notification Feed</h3><span class="hint" id="notiCount">0 alerts</span></div>
        <div class="bd" id="notiList">${Components.loader("Loading notifications...")}</div>
      </div>
      <div class="card">
        <div class="hd"><h3>Filters</h3><span class="hint">Types</span></div>
        <div class="bd form-grid">
          <div>
            <label>Status</label>
            <select id="notiStatus">
              <option value="">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select id="notiPriority">
              <option value="">Any</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>Help Tips</h3><span class="hint">Alert hygiene</span></div>
      <div class="bd">
        <ul class="help-list">
          <li>High priority alerts require immediate action.</li>
          <li>Mark routine notifications as read to keep the feed clean.</li>
          <li>Adjust channel preferences in Settings.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackNotifications = Utils.sampleRange(12, (i) => ({
    id: i + 1,
    title: i % 2 === 0 ? "Leave request pending" : "Policy update",
    message: "Review the latest update in the HR policy hub.",
    status: i % 3 === 0 ? "read" : "unread",
    priority: i % 3 === 0 ? "low" : i % 3 === 1 ? "medium" : "high",
    time: `2024-03-${String((i % 9) + 1).padStart(2, "0")} 09:30`
  }));

  let notifications = [];

  const notiList = document.getElementById("notiList");
  const notiCount = document.getElementById("notiCount");

  function renderList(rows) {
    if (!rows.length) {
      notiList.innerHTML = Components.emptyState({ title: "No alerts", description: "You're all caught up." });
      return;
    }

    notiList.innerHTML = rows.map((item) => `
      <div class="mini-card" style="margin-bottom:12px;">
        <strong>${Utils.escapeHtml(item.title)}</strong>
        <p class="muted">${Utils.escapeHtml(item.message)}</p>
        <div style="display:flex; gap:8px; align-items:center;">
          ${Components.badge(item.priority, item.priority === "high" ? "error" : item.priority === "medium" ? "warn" : "info")}
          ${Components.badge(item.status, item.status === "read" ? "approved" : "pending")}
          <span class="hint">${Utils.escapeHtml(item.time)}</span>
        </div>
      </div>
    `).join("");
  }

  function applyFilters() {
    const status = document.getElementById("notiStatus").value;
    const priority = document.getElementById("notiPriority").value;
    const filtered = notifications.filter((item) => {
      return (!status || item.status === status) && (!priority || item.priority === priority);
    });
    notiCount.textContent = `${filtered.length} alerts`;
    renderList(filtered);
  }

  async function init() {
    try {
      const data = await API.request("/api/notifications");
      notifications = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackNotifications;
    } catch (err) {
      notifications = fallbackNotifications;
    }
    applyFilters();
  }

  document.getElementById("btnMarkRead").addEventListener("click", () => {
    notifications = notifications.map((item) => ({ ...item, status: "read" }));
    applyFilters();
    Components.toast({ title: "Updated", message: "All notifications marked as read.", type: "success" });
  });

  ["notiStatus", "notiPriority"].forEach((id) => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });

  init();
})();
