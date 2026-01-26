(function () {
  function qs(sel, el = document) { return el.querySelector(sel); }
  function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function fmtDate(s) {
    if (!s) return "—";
    // backend uses strings; show as-is if not parsable
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString();
  }

  function getParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function setActiveNav() {
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav]").forEach(a => {
      const match = (a.getAttribute("href") || "").toLowerCase() === file;
      if (match) a.classList.add("active");
    });
  }

  function toggleSidebar(open) {
    const sb = document.querySelector(".sidebar");
    if (!sb) return;
    if (open === true) sb.classList.add("open");
    else if (open === false) sb.classList.remove("open");
    else sb.classList.toggle("open");
  }

  window.Utils = { qs, qsa, escapeHtml, fmtDate, getParam, setActiveNav, toggleSidebar };
})();
