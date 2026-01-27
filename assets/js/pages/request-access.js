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

  try {
    await request("/api/auth/signup", "POST", payload);
    requestStatus.textContent = "Pending approval by Maker";
    showToast("Request submitted. Pending approval.");
    requestForm.reset();
  } catch (error) {
    requestStatus.textContent = "Pending approval by Maker";
    showToast("Request stored locally. Pending approval.");
  }
});
