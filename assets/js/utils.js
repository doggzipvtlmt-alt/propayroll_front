(function () {
  const SESSION_KEY = "officeos_session";

  const qs = (name) => new URL(window.location.href).searchParams.get(name);
  const el = (sel, root = document) => root.querySelector(sel);
  const els = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHtml = (str) => String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = (str) => {
    if (!str) return "—";
    const date = new Date(str);
    if (Number.isNaN(date.getTime())) return str;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const debounce = (fn, ms = 300) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), ms);
    };
  };

  const setActiveNav = () => {
    const path = window.location.pathname.split("/").pop();
    els("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      const active = href === path || (path === "" && href === "index.html");
      link.classList.toggle("active", active);
    });
  };

  const storage = {
    get() {
      try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      } catch (err) {
        return {};
      }
    },
    set(data) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    },
    clear() {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const getSession = () => storage.get();

  const setSession = ({ token, user, company_id }) => {
    storage.set({
      token,
      user,
      company_id
    });
  };

  const clearSession = () => storage.clear();

  const getRoleKey = () => {
    const session = getSession();
    return String(session?.user?.role_key || session?.user?.role || "").toUpperCase();
  };

  const hasRole = (roles = []) => {
    const role = getRoleKey();
    if (!roles.length) return true;
    return roles.map((r) => String(r).toUpperCase()).includes(role);
  };

  const ensureAuthenticated = async () => {
    const session = getSession();
    if (!session?.token) {
      window.location.href = "login.html";
      return false;
    }
    if (typeof window.api?.get === "function") {
      const response = await window.api.get("/api/auth/me");
      if (!response.ok) {
        clearSession();
        window.location.href = "login.html";
        return false;
      }
    }
    return true;
  };

  const logout = async () => {
    try {
      if (typeof window.api?.post === "function") {
        await window.api.post("/api/auth/logout", {});
      }
    } finally {
      clearSession();
      window.location.href = "login.html";
    }
  };

  window.Utils = {
    qs,
    el,
    els,
    escapeHtml,
    formatDate,
    debounce,
    setActiveNav,
    storage,
    getSession,
    setSession,
    clearSession,
    getRoleKey,
    hasRole,
    ensureAuthenticated,
    logout
  };
})();
