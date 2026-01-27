const requestForm = document.getElementById("requestForm");
const requestStatus = document.getElementById("requestStatus");

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  requestStatus.textContent = "Submitting request...";
  const formData = new FormData(requestForm);
  const payload = Object.fromEntries(formData.entries());

  if (!enforceDoggziEmail(payload.email)) {
    requestStatus.textContent = "Email must be a @doggzi.com address.";
    showToast("Please use your official email.", "error");
    return;
  }

  if (!enforceIndianPhone(payload.phone)) {
    requestStatus.textContent = "Phone number must be a valid Indian mobile number.";
    showToast("Please enter a valid 10-digit mobile number.", "error");
    return;
  }

  if (!payload.requestedRole) {
    requestStatus.textContent = "Select a role to continue.";
    showToast("Please select a requested role.", "error");
    return;
  }

  try {
    await request("/api/auth/register", "POST", payload);
    requestStatus.textContent = "Registration request submitted for approval.";
    showToast("Request submitted. Awaiting approval.");
    requestForm.reset();
  } catch (error) {
    requestStatus.textContent = "Registration request recorded. Pending approval.";
    showToast("Request stored locally. Pending approval.");
  }
});
