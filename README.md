# Doggzi Analytics Portal + Pricing Simulator

A lightweight web analytics portal and pricing simulator for Doggzi recipes. The app parses the CSV recipe dataset, exposes APIs, and provides a vanilla JS dashboard for exploring recipes and running pricing scenarios.

## Features
- Recipe explorer with filters, ingredient composition, and percentage validation warnings.
- Pricing simulator with cost inputs, demand model assumptions, and profit projections.
- Scenario library saved in SQLite with CSV export.
- Simple access-code login secured by an `.env` value.

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** SQLite (file-based persistence)
- **Frontend:** HTML, CSS, Vanilla JS
- **Charts:** Chart.js via CDN

## Setup

```bash
npm install
npm run start
```

The server runs on `http://localhost:3000` by default.

## Environment Variables
Create a `.env` file (or export environment variables) with the following values:

```bash
APP_ACCESS_CODE=3344
SESSION_SECRET=replace-with-a-secure-secret
PORT=3000
```

> `APP_ACCESS_CODE` defaults to `3344` if not provided.

## Data
The CSV dataset lives at:

```
./data/Doggzi.recipes.csv
```

The server parses the CSV on startup. If the file is missing, the API returns a friendly error message.

## Render Deployment
1. Push the repo to GitHub.
2. Create a new **Web Service** on Render.
3. Set the **Build Command** to `npm install`.
4. Set the **Start Command** to `npm start`.
5. Add environment variables (`APP_ACCESS_CODE`, `SESSION_SECRET`).
6. Ensure Render’s `PORT` variable is available (the app listens on `process.env.PORT`).

## Project Structure
```
├── data/                  # CSV dataset
├── db/                    # SQLite database (created at runtime)
├── public/                # Frontend assets
├── server.js              # Express + SQLite backend
└── README.md
```
