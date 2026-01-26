(async function () {
  const ready = await Utils.ensureAuthenticated();
  if (!ready) return;

  const content = Layout.render({
    title: "Vault",
    subtitle: "Secure storage for payslips, letters, and personal documents.",
    breadcrumb: ["Personal", "Vault"],
    actions: "<button class='btn small' id='btnAddVault'>Upload Item</button>"
  });

  if (!content) return;

  content.innerHTML += `
    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Vault Items</h3><span class="hint">Your secure archive</span></div>
        <div id="vaultTable"></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Guidelines</h3><span class="hint">Security</span></div>
        <ul class="help-list">
          <li>Store payslips, letters, and tax proofs.</li>
          <li>Ensure documents are named clearly.</li>
          <li>Confidential files remain encrypted at rest.</li>
        </ul>
      </div>
    </div>
  `;

  const vaultTable = Utils.el("#vaultTable");
  const fallbackVault = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: i % 2 === 0 ? "Payslip - Aug" : "Form 16",
    category: i % 2 === 0 ? "Payslip" : "Tax",
    uploaded: `2024-09-${String(i + 1).padStart(2, "0")}`
  }));

  const renderTable = (rows) => {
    const columns = [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "uploaded", label: "Uploaded", render: (r) => Utils.formatDate(r.uploaded), exportValue: (r) => r.uploaded }
    ];
    Table.render(vaultTable, { columns, rows, emptyText: "No vault items." });
  };

  const loadVault = async () => {
    Loader.show(vaultTable);
    const response = await api.get("/api/vault", null, { fallbackData: fallbackVault });
    const items = response.data || fallbackVault;
    Loader.hide(vaultTable);
    renderTable(items);
  };

  Utils.el("#btnAddVault")?.addEventListener("click", () => {
    Modal.open("vault", `
      <form id="vaultForm" class="form-grid">
        <div>
          <label>Title</label>
          <input class="input" name="title" required />
        </div>
        <div>
          <label>Category</label>
          <select name="category">
            <option>Payslip</option>
            <option>Tax</option>
            <option>Letter</option>
          </select>
        </div>
      </form>
    `, {
      title: "Upload Vault Item",
      footer: `
        <button class="btn" data-close>Cancel</button>
        <button class="btn primary" id="saveVault">Save</button>
      `
    });

    Utils.el("#saveVault")?.addEventListener("click", async () => {
      const form = Utils.el("#vaultForm");
      const payload = Object.fromEntries(new FormData(form).entries());
      await api.post("/api/vault", payload, { fallbackData: payload });
      Toast.show("success", "Vault item added.");
      Modal.close("vault");
      loadVault();
    });
  });

  loadVault();
})();
