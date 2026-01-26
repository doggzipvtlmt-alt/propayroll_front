(function () {
  const DEFAULT_TIMEOUT = 10000;
  let lastRequestId = null;

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

  const request = async (path, {
    method = "GET",
    body = null,
    query = null,
    headers = null,
    timeoutMs = DEFAULT_TIMEOUT,
    fallbackData = null
  } = {}) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const url = buildUrl(path, query);
    const token = window.Utils?.getSession?.().token;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(headers || {})
        },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });

      const text = await res.text();
      const json = safeJson(text);
      lastRequestId = json.request_id || null;
      window.LAST_REQUEST_ID = lastRequestId;
      window.Layout?.updateRequestId?.(lastRequestId);

      if (!res.ok || json.ok !== true) {
        Toast.show("error", json?.message || json?.error || "Request failed", { title: "API Error" });
        return { ok: false, data: fallbackData, request_id: lastRequestId };
      }

      return { ok: true, data: json.data, request_id: lastRequestId };
    } catch (err) {
      Toast.show("error", err.message || "Network error", { title: "API Error" });
      return { ok: false, data: fallbackData, request_id: lastRequestId };
    } finally {
      window.clearTimeout(timer);
    }
  };

  window.api = {
    request,
    get: (path, query, opts = {}) => request(path, { query, ...opts }),
    post: (path, body, opts = {}) => request(path, { method: "POST", body, ...opts }),
    put: (path, body, opts = {}) => request(path, { method: "PUT", body, ...opts }),
    del: (path, opts = {}) => request(path, { method: "DELETE", ...opts })
  };
})();
