(async function () {
  Utils.setActiveNav();

  const btnSidebar = Utils.qs("#btnSidebar");
  if (btnSidebar) btnSidebar.addEventListener("click", () => Utils.toggleSidebar());

  const kpiGrid = Utils.qs("#kpiGrid");
  const attendanceBars = Utils.qs("#attendanceBars");
  const activityFeed = Utils.qs("#activityFeed");
  const announcements = Utils.qs("#announcements");
  const helpTips = Utils.qs("#helpTips");

  function kpiCard(label, value, hint, right = "") {
    return `
      <div class="card">
        <div class="kpi">
          <div class="label"><span>${Utils.escapeHtml(label)}</span><span>${right}</span></div>
          <div class="value">${Utils.escapeHtml(String(value))}</div>
          <div class="delta">${Utils.escapeHtml(hint)}</div>
          <div class="spark" aria-hidden="true"></div>
        </div>
      </div>
    `;
  }

  function barRow(name, pct) {
    const p = Math.max(0, Math.min(100, pct));
    return `
      <div class="bar">
        <div class="name">${Utils.escapeHtml(name)}</div>
        <div class="track"><div class="fill" style="width:${p}%"></div></div>
        <div class="pct">${p}%</div>
      </div>
    `;
  }

  function timelineItem(title, when, desc) {
    return `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-card">
          <div class="t">
            <strong>${Utils.escapeHtml(title)}</strong>
            <span>${Utils.escapeHtml(when)}</span>
          </div>
          <p>${Utils.escapeHtml(desc)}</p>
        </div>
      </div>
    `;
  }

  function announcementItem(title, badgeHtml, body) {
    return `
      <div style="padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:16px;background:rgba(255,255,255,0.04);margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
          <strong style="font-size:13px;">${Utils.escapeHtml(title)}</strong>
          ${badgeHtml}
        </div>
        <div style="margin-top:8px;color:rgba(255,255,255,0.65);font-size:12px;line-height:1.5;">
          ${Utils.escapeHtml(body)}
        </div>
      </div>
    `;
  }

  // Render static content first (so page is "filled" even before API)
  kpiGrid.innerHTML =
    kpiCard("Headcount", "—", "Total employees in directory", Components.badge("Live", "good")) +
    kpiCard("Present Today", "—", "Based on attendance records", Components.badge("Draft", "gray")) +
    kpiCard("Pending Leaves", "—", "Requests awaiting approval", Components.badge("Queue", "warn")) +
    kpiCard("Upcoming Birthdays", "—", "Next 30 days", Components.badge("Info", "gray")) +
    kpiCard("New Joiners", "—", "Joined in last 30 days", Components.badge("Trend", "good"));

  attendanceBars.innerHTML =
    barRow("Mon", 65) + barRow("Tue", 72) + barRow("Wed", 58) + barRow("Thu", 80) + barRow("Fri", 74) + barRow("Sat", 22) + barRow("Sun", 10);

  activityFeed.innerHTML =
    timelineItem("Employee directory updated", "Today", "HR updated employee records and synced department tags for reporting.") +
    timelineItem("Leave request submitted", "Yesterday", "A leave request was submitted with supporting notes. Pending review.") +
    timelineItem("Policy notice published", "2 days ago", "Updated attendance policy: grace period and WFH tagging guidance.") +
    timelineItem("System seed executed", "This week", "Demo data inserted into MongoDB for employees and leave requests.");

  announcements.innerHTML =
    announcementItem("Payroll cutoff reminder", Components.badge("Important", "warn"), "Please submit attendance corrections and pending leave regularization before the monthly payroll cutoff.") +
    announcementItem("Office maintenance window", Components.badge("Scheduled", "gray"), "Network maintenance is planned for Saturday 11:00 PM – 1:00 AM. Internal tools may be slow.") +
    announcementItem("New joiner onboarding", Components.badge("HR", "good"), "Welcome new team members! Managers: complete onboarding checklist and assign Buddy by EOD.");

  helpTips.innerHTML = `
    <div style="display:grid;gap:10px;">
      <div class="chip">Use Employees page to manage directory, filters and CRUD actions.</div>
      <div class="chip">Leaves page supports apply + approve/reject (based on backend capabilities).</div>
      <div class="chip">Attendance page will show calendar-like view + daily log.</div>
      <div class="chip">Settings page contains Departments/Designations/Leave Types (some placeholders).</div>
    </div>
    <div style="margin-top:12px;color:rgba(255,255,255,0.65);font-size:12px;line-height:1.5;">
      If API is down, the UI will keep working using fallback data. When API is up, KPIs auto-refresh.
    </div>
  `;

  // Fetch live summary (if available)
  try {
    const res = await API.request("/api/dashboard/summary");
    // Expect { ok:true, data:{...}, request_id }
    const s = res?.data || {};

    // If backend returns different keys, still display safely
    const headcount = s.headcount ?? s.total_employees ?? "—";
    const present = s.present_today ?? s.present ?? "—";
    const pendingLeaves = s.pending_leaves ?? s.pending ?? "—";
    const birthdays = s.upcoming_birthdays ?? s.birthdays ?? "—";
    const joiners = s.new_joiners ?? s.joiners ?? "—";

    kpiGrid.innerHTML =
      kpiCard("Headcount", headcount, "Total employees in directory", Components.badge("Live", "good")) +
      kpiCard("Present Today", present, "Based on attendance records", Components.badge("Today", "good")) +
      kpiCard("Pending Leaves", pendingLeaves, "Requests awaiting approval", Components.badge("Queue", "warn")) +
      kpiCard("Upcoming Birthdays", birthdays, "Next 30 days", Components.badge("Upcoming", "gray")) +
      kpiCard("New Joiners", joiners, "Joined in last 30 days", Components.badge("Trend", "good"));

    Components.toast({ title: "Dashboard updated", message: "Live KPIs loaded from backend.", type: "success" });
  } catch (e) {
    Components.toast({ title: "Using demo data", message: "Could not load /api/dashboard/summary. Showing fallback content.", type: "warn" });
  }
})();
