# Office OS Frontend

A static, HTML/CSS/Vanilla JS frontend for the Office OS platform. It consumes a FastAPI backend via REST APIs and renders a full HR operations UI with fallback data so pages always load offline.

## Configuration
Update `assets/js/config.js` with your API base URL and identity headers:

```js
window.APP_CONFIG = {
  API_BASE_URL: "http://127.0.0.1:8000",
  COMPANY_ID: "CHANGE_ME",
  USER_ID: "CHANGE_ME",
  ROLE: "MD"
}
```

### Runtime overrides
You can override the API base URL and role at runtime using query parameters:

- `?api=https://your-api.example.com`
- `?role=HR`

Example:

```
/index.html?api=https://api.example.com&role=ADMIN
```

## Running locally
Use VS Code Live Server or any static server:

1. Open the folder in VS Code.
2. Right click `index.html` → **Open with Live Server**.
3. Navigate to the page you want (e.g. `employees.html`).

## Render deployment (static site)
1. Create a new **Static Site** service on Render.
2. Connect the repository.
3. Set the **Build Command** to empty and **Publish Directory** to the repo root (`.`).
4. Deploy.
5. Update `assets/js/config.js` or use `?api=` runtime overrides to point to the backend.

## Notes
- All API calls include `X-COMPANY-ID`, `X-USER-ID`, and `X-ROLE` headers.
- Backend responses are expected in the `{ ok, data, request_id }` envelope.
- UI renders fallback sample data when the API is unavailable.
