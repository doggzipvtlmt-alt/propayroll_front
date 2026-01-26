(async function () {
  const session = Utils.getSession();
  if (session?.access_token) {
    window.location.href = "index.html";
    return;
  }

  const form = Utils.el("#loginForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const baseUrl = window.APP_CONFIG?.API_BASE_URL || "";
    const url = `${baseUrl.replace(/\\/$/, "")}/api/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password
        })
      });
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        data = {};
      }
      const accessToken = data?.access_token || data?.data?.access_token;
      const user = data?.user || data?.data?.user || {};

      if (res.ok && accessToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        Utils.setSession({
          access_token: accessToken,
          user
        });
        Toast.show("success", "Login successful.");
        window.location.href = "index.html";
        return;
      }

      if (res.status === 401) {
        Toast.show("error", "Invalid email/password");
        return;
      }

      const message = data?.message || data?.error || "Login failed";
      Toast.show("error", message);
    } catch (err) {
      Toast.show("error", err.message || "Invalid email/password");
    }
  });
})();
