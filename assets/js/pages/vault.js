(function () {
  Components.mountLayout({ activeNav: "vault" });

  const content = document.getElementById("pageContent");
  content.innerHTML = `
    <div class="page-title">
      <div>
        <div class="breadcrumb">Office OS / Vault</div>
        <h1>Vault Access</h1>
        <p class="muted">Secure storage for confidential documents and keys.</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="btnRequestAccess">Request Access</button>
      </div>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="hd"><h3>Vault Items</h3><span class="hint" id="vaultCount">0 items</span></div>
        <div class="bd" id="vaultTable">${Components.loader("Loading vault items...")}</div>
      </div>
      <div class="card">
        <div class="hd"><h3>Security Overview</h3><span class="hint">Compliance</span></div>
        <div class="bd">
          <ul class="help-list">
            <li>All vault access is logged in audit trails.</li>
            <li>Rotate credentials every 90 days.</li>
            <li>Use role-based access controls for sensitive data.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="hd"><h3>Help Tips</h3><span class="hint">Vault operations</span></div>
      <div class="bd">
        <ul class="help-list">
          <li>Store contracts, compliance docs, and payroll keys.</li>
          <li>Use tags to make sensitive files searchable.</li>
          <li>Download requests require manager approval.</li>
        </ul>
      </div>
    </div>
  `;

  const fallbackVault = Utils.sampleRange(10, (i) => ({
    id: i + 1,
    name: i % 2 === 0 ? "Payroll Credentials" : "Vendor Contract",
    category: i % 2 === 0 ? "Credentials" : "Contracts",
    owner: i % 2 === 0 ? "Finance" : "Legal",
    updated: `2024-02-${String((i % 9) + 1).padStart(2, "0")}`,
    status: i % 3 === 0 ? "restricted" : "active"
  }));

  let vaultItems = [];

  const vaultTable = document.getElementById("vaultTable");
  const vaultCount = document.getElementById("vaultCount");

  function renderTable(rows) {
    const columns = [
      { key: "name", label: "Item" },
      { key: "category", label: "Category" },
      { key: "owner", label: "Owner" },
      { key: "updated", label: "Last Updated", render: (r) => Utils.fmtDate(r.updated) },
      { key: "status", label: "Status", render: (r) => Components.badge(r.status === "restricted" ? "restricted" : r.status, r.status === "restricted" ? "warn" : "approved") }
    ];

    vaultTable.innerHTML = Components.table({ columns, rows, emptyText: "No vault items available." });
  }

  async function init() {
    try {
      const data = await API.request("/api/vault");
      vaultItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : fallbackVault;
    } catch (err) {
      vaultItems = fallbackVault;
    }
    vaultCount.textContent = `${vaultItems.length} items`;
    renderTable(vaultItems);
  }

  document.getElementById("btnRequestAccess").addEventListener("click", () => {
    Components.toast({ title: "Access requested", message: "Vault access request submitted.", type: "success" });
  });

  init();
})();
