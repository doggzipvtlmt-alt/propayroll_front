# ProPayroll Office OS Frontend

A static HTML/CSS/Vanilla JS portal for the ProPayroll Office OS platform. It consumes a FastAPI backend via REST APIs and renders a dense, print-friendly HR and payroll UI with fallback data so pages remain usable offline.

## Configuration
The API base URL and portal name live in `assets/js/config.js`:

```js
window.APP_CONFIG = {
  API_BASE_URL: "https://propayroll.onrender.com",
  APP_NAME: "ProPayroll Office OS",
  PORTAL_THEME: "SERIOUS"
};
```

## Login flow
1. Open `login.html`.
2. Enter `company_id`, `identifier`, and `dob_or_pin`.
3. The portal calls `POST /api/auth/login`.
4. On success, the token and user are stored in `localStorage`.
5. All API calls include `Authorization: Bearer <token>` automatically.
6. Use **Logout** in the top bar to clear the session.

## Running locally (VS Code Live Server)
1. Open the repository in VS Code.
2. Right click `login.html` → **Open with Live Server**.
3. Navigate to other pages (e.g. `employees.html`).

## Deploy on Render (Static Site)
1. Create a new **Static Site** service on Render.
2. Connect the repository.
3. **Root Directory**: leave blank (or set if deploying from a subfolder).
4. **Build Command**: leave blank.
5. **Publish Directory**: `.`
6. SPA redirect is **not** required because this is a multi-page site.

> Note: Static HTML cannot access environment variables at runtime. Commit `config.js` or fetch a `config.json` file at runtime if you need dynamic configuration.

## API behavior
- Responses are expected in the `{ ok, data, request_id }` envelope.
- When the API is unavailable, pages render fallback demo data.
- The most recent `request_id` is displayed in the footer for support requests.
