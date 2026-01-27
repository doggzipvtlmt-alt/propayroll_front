function getToken() {
  return localStorage.getItem("access_token");
}

async function request(path, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json"
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    window.location.href = "login.html";
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.payload = data;
    throw error;
  }
  return data;
}
