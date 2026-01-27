# Doggzi HRMS Corporate Portal (Frontend)

This repository contains a static, role-based HRMS portal built with **HTML**, **CSS**, and **vanilla JavaScript**. It is designed to run as a Render Static Site and communicate with backend APIs configured in `assets/js/config.js`.

## Features
- Role-aware dashboards for Maker, HR, Finance, MD, and Employee personas.
- Dense enterprise UI with tables, forms, status badges, and right-side help panel.
- Modular JS utilities (toast, modal, loader, table renderer, pagination, badge).
- Graceful API error handling with fallback sample data.

## Local Preview
Open `login.html` in a browser or serve the directory with any static file server.

## Configuration
Update the API base URL in:
```
assets/js/config.js
```

Example:
```js
window.APP_CONFIG = {
  API_BASE_URL: "http://127.0.0.1:8000"
};
```

## Pages
- Authentication: `login.html`, `request-access.html`
- Shared portal: `dashboard.html` + role-based modules
- Maker: `maker-approvals.html`, `maker-users.html`, `maker-limits.html`
- HR: `employees.html`, `employee.html`, `appraisals.html`, `promotions.html`
- Employee: `my-profile.html`, `attendance.html`, `leaves.html`, `payslips.html`, `tickets.html`, `notices.html`, `surveys.html`
- Finance: `revenue.html`, `expenses.html`, `payroll-finance.html`, `reports.html`, `import-export.html`

## Deployment
This is a static site. Configure Render to serve the repository root.
