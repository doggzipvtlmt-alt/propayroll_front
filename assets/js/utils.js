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
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString();
  }

  function fmtDateTime(s) {
    if (!s) return "—";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString();
  }

  function fmtMoney(n) {
    if (n === null || n === undefined || n === "") return "—";
    const num = Number(n);
    if (Number.isNaN(num)) return n;
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(num);
  }

  function getParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function buildQuery(params = {}) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      usp.set(key, value);
    });
    const out = usp.toString();
    return out ? `?${out}` : "";
  }

  function setActiveNav(active) {
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const match = a.getAttribute("data-nav") === active;
      if (match) a.classList.add("active");
      else a.classList.remove("active");
    });
  }

  function toggleSidebar(open) {
    const sb = document.querySelector(".sidebar");
    if (!sb) return;
    if (open === true) sb.classList.add("open");
    else if (open === false) sb.classList.remove("open");
    else sb.classList.toggle("open");
  }

  function sampleRange(len, factory) {
    return Array.from({ length: len }, (_, idx) => factory(idx));
  }

  window.Utils = {
    qs,
    qsa,
    escapeHtml,
    fmtDate,
    fmtDateTime,
    fmtMoney,
    getParam,
    buildQuery,
    setActiveNav,
    toggleSidebar,
    sampleRange
  };
})();
