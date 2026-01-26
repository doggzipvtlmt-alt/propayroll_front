(function () {
  const DEFAULT_TIMEOUT_MS = 15000;

  function withTimeout(promiseFactory, ms = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    return promiseFactory(controller.signal).finally(() => clearTimeout(id));
  }

  async function request(path, { method = "GET", body = null, headers = {} } = {}) {
    const base = window.APP_CONFIG?.API_BASE_URL || "";
    const url = base.replace(/\/$/, "") + path;

    const finalHeaders = {
      "Content-Type": "application/json",
      ...(window.APP_CONFIG?.DEFAULT_HEADERS || {}),
      ...headers
    };

    return await withTimeout(async (signal) => {
      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : null,
        signal
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!res.ok) {
        const msg =
          (data && data.detail) ? JSON.stringify(data.detail) :
          (data?.error?.message || res.statusText);
        const err = new Error(msg);
        err.status = res.status;
        err.payload = data;
        throw err;
      }
      return data;
    });
  }

  window.API = { request };
})();
