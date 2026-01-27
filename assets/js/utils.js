function getUserRole() {
  return localStorage.getItem("user_role") || "EMPLOYEE";
}

function getUserName() {
  return localStorage.getItem("user_name") || "Guest User";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString();
}

function setActiveLink(path) {
  const links = document.querySelectorAll(".sidebar nav a");
  links.forEach((link) => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active");
    }
  });
}

function enforceDoggziEmail(value) {
  return /@doggzi\.com$/i.test(value);
}

const SAMPLE_DATA = {
  approvals: [
    { id: "REQ-1093", name: "Kavita Sharma", role: "HR", status: "Pending", requested_on: "2024-03-21" },
    { id: "REQ-1094", name: "Nikhil Rao", role: "FINANCE", status: "Pending", requested_on: "2024-03-22" }
  ],
  users: [
    { id: "U-882", name: "Rohan Mehta", role: "EMPLOYEE", status: "Active" },
    { id: "U-883", name: "Aditi Roy", role: "HR", status: "Active" }
  ],
  limits: [
    { designation: "Analyst", limit: "₹ 12,00,000" },
    { designation: "Manager", limit: "₹ 20,00,000" }
  ],
  employees: [
    { code: "EMP-552", name: "Vikram Singh", dept: "Operations", status: "Active" },
    { code: "EMP-553", name: "Sana Ali", dept: "Finance", status: "Probation" }
  ],
  tickets: [
    { id: "T-221", subject: "System access reset", status: "Open" },
    { id: "T-222", subject: "Leave balance correction", status: "In Review" }
  ],
  finance: [
    { period: "Q1 FY24", revenue: "₹ 4.2 Cr", expense: "₹ 3.1 Cr" },
    { period: "Q2 FY24", revenue: "₹ 4.8 Cr", expense: "₹ 3.5 Cr" }
  ]
};
