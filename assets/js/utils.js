(function () {
  const SESSION_KEY = "officeos_session";
  const ACCESS_TOKEN_KEY = "access_token";
  const USER_KEY = "user";
  const COMPANY_ID_KEY = "company_id";

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
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);
      const companyId = localStorage.getItem(COMPANY_ID_KEY);
      if (accessToken || userRaw || companyId) {
        let user = {};
        try {
          user = userRaw ? JSON.parse(userRaw) : {};
        } catch (err) {
          user = {};
        }
        return {
          access_token: accessToken || "",
          user,
          company_id: companyId || ""
        };
      }

      try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      } catch (err) {
        return {};
      }
    },
    set(data) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data?.access_token || "");
      localStorage.setItem(USER_KEY, JSON.stringify(data?.user || {}));
      if (data?.company_id) {
        localStorage.setItem(COMPANY_ID_KEY, data.company_id);
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    },
    clear() {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(COMPANY_ID_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const getSession = () => {
    const session = storage.get();
    if (session?.access_token || session?.user) {
      return session;
    }
    return {};
  };

  const setSession = ({ access_token, user, company_id }) => {
    storage.set({
      access_token,
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
    if (!session?.access_token) {
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
