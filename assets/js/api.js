(function () {
  const DEFAULT_TIMEOUT = 10000;

  const safeJson = (text) => {
    try {
      return text ? JSON.parse(text) : {};
    } catch (err) {
      return {};
    }
  };

  const buildUrl = (path, query) => {
    const base = window.APP_CONFIG?.API_BASE_URL || "";
    const normalized = base.replace(/\/$/, "");
    const url = new URL(`${normalized}${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        url.searchParams.set(key, value);
      });
    }
    return url.toString();
  };

  const request = async (path, { method = "GET", body = null, query = null, headers = null, timeoutMs = DEFAULT_TIMEOUT } = {}) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const url = buildUrl(path, query);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...window.getAuthHeaders(),
          ...(headers || {})
        },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });

      const text = await res.text();
      const json = safeJson(text);
      window.LAST_REQUEST_ID = json.request_id || null;

      if (!res.ok || json.ok !== true) {
        Toast.show("error", json?.message || json?.error || "Request failed", { title: "API Error" });
        return { ok: false, data: null };
      }

      return { ok: true, data: json.data };
    } catch (err) {
      Toast.show("error", err.message || "Network error", { title: "API Error" });
      return { ok: false, data: null };
    } finally {
      window.clearTimeout(timer);
    }
  };

  window.api = {
    request,
    get: (path, query) => request(path, { query }),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    del: (path) => request(path, { method: "DELETE" })
  };
})();
