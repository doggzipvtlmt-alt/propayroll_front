# Office OS Frontend

A static, HTML/CSS/Vanilla JS frontend for the Office OS platform. It consumes a FastAPI backend via REST APIs and renders a full HR operations UI with fallback data so pages always load offline.

## Configuration
The API base URL and identity defaults live in `assets/js/config.js`:

```js
window.APP_CONFIG = {
  API_BASE_URL: "https://propayroll.onrender.com",
  COMPANY_ID: "SEED_COMPANY_ID_OR_PLACEHOLDER",
  USER_ID: "SEED_USER_ID_OR_PLACEHOLDER",
  ROLE: "MD"
};
```

## Required headers
Every request automatically includes:

- `X-COMPANY-ID`
- `X-USER-ID`
- `X-ROLE`

## Update identity from the UI
Use the **Identity** button in the top bar to update `COMPANY_ID`, `USER_ID`, and `ROLE`. Values are stored in `localStorage`, so you don’t need to edit files once set.

## Running locally (VS Code Live Server)
1. Open the repository in VS Code.
2. Right click `index.html` → **Open with Live Server**.
3. Navigate to other pages (e.g. `employees.html`).

## Deploy on Render (Static Site)
1. Create a new **Static Site** service on Render.
2. Connect the repository.
3. **Root Directory**: leave blank (or set if deploying from a subfolder).
4. **Build Command**: leave blank.
5. **Publish Directory**: `.`
6. SPA redirect is **not** required because this is a multi-page site.

## Notes
- Backend responses are expected in the `{ ok, data, request_id }` envelope.
- UI renders fallback sample data when the API is unavailable.
