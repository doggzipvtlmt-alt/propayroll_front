(function () {
  const params = new URL(window.location.href).searchParams;
  const apiOverride = params.get("api");
  const roleOverride = params.get("role");

  window.APP_CONFIG = {
    API_BASE_URL: apiOverride || "http://127.0.0.1:8000",
    COMPANY_ID: "CHANGE_ME",
    USER_ID: "CHANGE_ME",
    ROLE: roleOverride || "MD"
  };
})();
