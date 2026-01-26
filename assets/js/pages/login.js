(async function () {
  const session = Utils.getSession();
  if (session?.token) {
    window.location.href = "index.html";
    return;
  }

  const form = Utils.el("#loginForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await api.post("/api/auth/login", payload);
    if (response.ok) {
      const data = response.data || {};
      Utils.setSession({
        token: data.token,
        user: data.user || {},
        company_id: payload.company_id
      });
      Toast.show("success", "Login successful.");
      window.location.href = "index.html";
    } else {
      Toast.show("error", "Unable to login. Verify your credentials.");
    }
  });
})();
