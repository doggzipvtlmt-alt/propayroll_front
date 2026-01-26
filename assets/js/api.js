(function () {
  const DEFAULT_TIMEOUT_MS = 12000;

  window.APP_STATE = window.APP_STATE || { last_request_id: null };

  async function withTimeout(promiseFactory, ms = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      return await promiseFactory(controller.signal);
    } finally {
      clearTimeout(id);
    }
  }

  function buildHeaders(extra = {}) {
    const config = window.APP_CONFIG || {};
    return {
      "Content-Type": "application/json",
      "X-COMPANY-ID": config.COMPANY_ID,
      "X-USER-ID": config.USER_ID,
      "X-ROLE": config.ROLE,
      ...extra
    };
  }

  async function request(path, { method = "GET", body = null, query = null, headers = {} } = {}) {
    const base = window.APP_CONFIG?.API_BASE_URL || "";
    const queryString = query ? Utils.buildQuery(query) : "";
    const url = base.replace(/\/$/, "") + path + queryString;

    try {
      const res = await withTimeout(async (signal) => {
        return fetch(url, {
          method,
          headers: buildHeaders(headers),
          body: body ? JSON.stringify(body) : null,
          signal
        });
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      window.APP_STATE.last_request_id = json.request_id || null;

      if (!res.ok || json.ok !== true) {
        const msg = json?.error || json?.message || res.statusText || "Request failed";
        const err = new Error(msg);
        err.status = res.status;
        err.payload = json;
        throw err;
      }

      return json.data;
    } catch (err) {
      if (window.Components?.toast) {
        Components.toast({
          title: "API Error",
          message: err.message || "Unable to load data",
          type: "error"
        });
      }
      throw err;
    }
  }

  window.API = { request };
})();
