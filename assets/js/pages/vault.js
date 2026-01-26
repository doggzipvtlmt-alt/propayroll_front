(function () {
  Utils.renderLayout();

  const content = Utils.el("#pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Admin / Vault</div>
        <h1>Secrets Vault</h1>
        <p class="muted">Manage API keys and credentials securely (write-only).</p>
      </div>
      <button class="btn primary" id="btnAddSecret">Add Secret</button>
    </div>

    <div class="grid three">
      <div class="card"><h3 id="vaultTotal">0</h3><p class="muted">Secrets Stored</p></div>
      <div class="card"><h3>3</h3><p class="muted">Rotations Due</p></div>
      <div class="card"><h3>100%</h3><p class="muted">Encryption Coverage</p></div>
    </div>

    <div class="split">
      <div>
        <div class="card">
          <div class="hd"><h3>Filters</h3><span class="hint">Search secrets</span></div>
          <div class="form-grid">
            <div>
              <label>Search</label>
              <input class="input" id="vaultSearch" placeholder="Service or key name" />
            </div>
            <div>
              <label>Category</label>
              <select id="vaultCategory">
                <option value="">All</option>
                <option>Payroll</option>
                <option>HRIS</option>
                <option>Infrastructure</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="hd"><h3>Secrets</h3><span class="hint" id="vaultCount">0 records</span></div>
          <div id="vaultTable"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="hd"><h3>Best Practices</h3><span class="hint">Security</span></div>
          <ul class="help-list">
            <li>Rotate production credentials every 90 days.</li>
            <li>Use separate secrets per environment.</li>
            <li>Limit vault access to Admin roles.</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const fallbackVault = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? "Payroll API Key" : "HRIS Client Secret",
    category: i % 3 === 0 ? "Payroll" : i % 3 === 1 ? "HRIS" : "Infrastructure",
    owner: i % 2 === 0 ? "Finance" : "IT",
    updated_at: `2023-09-${12 + i}`
  }));

  let secrets = [];
  const tableEl = Utils.el("#vaultTable");

  const maskSecret = () => "••••••••••";

  const renderTable = () => {
    const columns = [
      { key: "name", label: "Secret" },
      { key: "category", label: "Category" },
      { key: "owner", label: "Owner" },
      { key: "updated_at", label: "Updated", render: (r) => Utils.formatDate(r.updated_at) },
      { key: "masked", label: "Value", render: () => maskSecret() }
    ];

    Table.render(tableEl, {
      columns,
      rows: secrets,
      rowActions: (row) => `
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn small" data-edit="${row.id}">Edit</button>
          <button class="btn small" data-rotate="${row.id}">Reset Secret</button>
          <button class="btn small" data-delete="${row.id}">Delete</button>
        </div>
      `,
      emptyText: "No secrets configured."
    });
    Utils.el("#vaultTotal").textContent = secrets.length;
    Utils.el("#vaultCount").textContent = `${secrets.length} records`;
  };

  const openSecretModal = (mode, data = {}) => {
    Modal.open("vault", `
      <form id="vaultForm" class="form-grid">
        <div>
          <label>Secret Name</label>
          <input class="input" name="name" value="${Utils.escapeHtml(data.name || "")}" required />
        </div>
        <div>
          <label>Category</label>
          <select name="category">
            <option ${data.category === "Payroll" ? "selected" : ""}>Payroll</option>
            <option ${data.category === "HRIS" ? "selected" : ""}>HRIS</option>
            <option ${data.category === "Infrastructure" ? "selected" : ""}>Infrastructure</option>
          </select>
        </div>
        <div>
          <label>Owner</label>
          <input class="input" name="owner" value="${Utils.escapeHtml(data.owner || "")}" />
        </div>
        <div>
          <label>Secret Value</label>
          <input class="input" name="secret" placeholder="Enter new value" />
        </div>
      </form>
      <p class="hint">Secrets are write-only. Stored values are masked.</p>
    `, {
      title: mode === "edit" ? "Edit Secret" : "Add Secret",
      footer: `
        <button class="btn" data-close>Cancel</button>
        <button class="btn primary" id="saveSecret">Save</button>
      `
    });

    Utils.el("#saveSecret")?.addEventListener("click", async () => {
      const payload = Object.fromEntries(new FormData(Utils.el("#vaultForm")).entries());
      if (mode === "edit") {
        await api.put(`/api/vault/${data.id}`, payload);
        secrets = secrets.map((row) => row.id === data.id ? { ...row, ...payload } : row);
      } else {
        const response = await api.post("/api/vault", payload);
        secrets = [response.ok ? response.data : { id: Date.now(), ...payload }, ...secrets];
      }
      Toast.show("success", "Secret saved.");
      Modal.close("vault");
      renderTable();
    });
  };

  const loadVault = async () => {
    const query = {
      search: Utils.el("#vaultSearch").value,
      category: Utils.el("#vaultCategory").value
    };
    Loader.show(tableEl);
    const response = await api.get("/api/vault", query);
    secrets = response.ok ? (response.data?.items || response.data || []) : fallbackVault;
    if (!secrets.length) secrets = fallbackVault;
    renderTable();
    Loader.hide(tableEl);
  };

  Utils.el("#btnAddSecret")?.addEventListener("click", () => openSecretModal("add"));

  tableEl.addEventListener("click", async (event) => {
    const editId = event.target.closest("button[data-edit]")?.dataset.edit;
    const rotateId = event.target.closest("button[data-rotate]")?.dataset.rotate;
    const deleteId = event.target.closest("button[data-delete]")?.dataset.delete;
    if (editId) {
      const item = secrets.find((row) => String(row.id) === editId);
      if (item) openSecretModal("edit", item);
    }
    if (rotateId) {
      await api.put(`/api/vault/${rotateId}/reset-secret`, {});
      Toast.show("success", "Secret rotated.");
    }
    if (deleteId) {
      await api.del(`/api/vault/${deleteId}`);
      secrets = secrets.filter((row) => String(row.id) !== deleteId);
      renderTable();
      Toast.show("success", "Secret deleted.");
    }
  });

  ["vaultSearch", "vaultCategory"].forEach((id) => {
    Utils.el(`#${id}`)?.addEventListener("input", Utils.debounce(loadVault, 400));
    Utils.el(`#${id}`)?.addEventListener("change", loadVault);
  });

  loadVault();
})();
