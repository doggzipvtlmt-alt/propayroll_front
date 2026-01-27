const loginForm = document.getElementById("loginForm");
const statusText = document.getElementById("loginStatus");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusText.textContent = "Authenticating...";
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const result = await request("/api/auth/login", "POST", payload);
    if (result) {
      localStorage.setItem("access_token", result.access_token || "sample-token");
      localStorage.setItem("user_role", result.role || "EMPLOYEE");
      localStorage.setItem("user_name", result.name || payload.email.split("@")[0]);
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    statusText.textContent = error.message || "Login failed.";
    showToast("Login failed. Using demo access.", "error");
    localStorage.setItem("access_token", "demo-token");
    localStorage.setItem("user_role", "EMPLOYEE");
    localStorage.setItem("user_name", payload.email.split("@")[0]);
    window.location.href = "dashboard.html";
  }
});
