window.APP_CONFIG = {
  API_BASE_URL: "https://propayroll.onrender.com",
  COMPANY_ID: "SEED_COMPANY_ID_OR_PLACEHOLDER",
  USER_ID: "SEED_USER_ID_OR_PLACEHOLDER",
  ROLE: "MD"
};

window.getAuthHeaders = function () {
  return {
    "X-COMPANY-ID": window.APP_CONFIG.COMPANY_ID,
    "X-USER-ID": window.APP_CONFIG.USER_ID,
    "X-ROLE": window.APP_CONFIG.ROLE
  };
};
