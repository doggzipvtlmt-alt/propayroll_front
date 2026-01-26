(function () {
  function ensureRoots() {
    if (!document.getElementById("toast-root")) {
      const t = document.createElement("div");
      t.id = "toast-root";
      document.body.appendChild(t);
    }
    if (!document.getElementById("modal-root")) {
      const m = document.createElement("div");
      m.id = "modal-root";
      m.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
        <div class="hd"><h3 id="modal-title">Modal</h3><button class="close" aria-label="Close">✕</button></div>
        <div class="bd" id="modal-body"></div>
        <div class="ft" id="modal-footer"></div>
      </div>`;
      document.body.appendChild(m);
    }
  }

  function toast({ title = "Info", message = "", type = "info", ms = 3500 } = {}) {
    ensureRoots();
    const root = document.getElementById("toast-root");
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `
      <div class="row">
        <div>
          <strong>${Utils.escapeHtml(title)}</strong>
          <p>${Utils.escapeHtml(message)}</p>
        </div>
        <button class="x" aria-label="Close">✕</button>
      </div>
    `;
    const x = el.querySelector(".x");
    const remove = () => el.remove();
    x.addEventListener("click", remove);
    root.appendChild(el);
    setTimeout(remove, ms);
  }

  function badge(text, variant = "gray") {
    return `<span class="badge ${variant}">${Utils.escapeHtml(text)}</span>`;
  }

  function openModal({ title = "Modal", bodyHtml = "", footerHtml = "", onClose = null } = {}) {
    ensureRoots();
    const root = document.getElementById("modal-root");
    Utils.qs("#modal-title", root).textContent = title;
    Utils.qs("#modal-body", root).innerHTML = bodyHtml;
    Utils.qs("#modal-footer", root).innerHTML = footerHtml;

    const closeBtn = Utils.qs(".close", root);
    const close = () => {
      root.classList.remove("open");
      if (typeof onClose === "function") onClose();
    };

    closeBtn.onclick = close;
    root.onclick = (e) => { if (e.target === root) close(); };
    document.onkeydown = (e) => { if (e.key === "Escape") close(); };

    root.classList.add("open");
    return { close };
  }

  function table({ columns = [], rows = [], rowActions = null, emptyText = "No data found." } = {}) {
    if (!rows || rows.length === 0) {
      return `<div style="padding:14px;color:rgba(255,255,255,0.65);">${Utils.escapeHtml(emptyText)}</div>`;
    }

    const th = columns.map(c => `<th>${Utils.escapeHtml(c.label)}</th>`).join("");
    const actionTh = rowActions ? `<th>Actions</th>` : "";

    const tb = rows.map(r => {
      const tds = columns.map(c => {
        const raw = typeof c.render === "function" ? c.render(r) : r[c.key];
        return `<td>${raw ?? "—"}</td>`;
      }).join("");
      const acts = rowActions ? `<td>${rowActions(r)}</td>` : "";
      return `<tr>${tds}${acts}</tr>`;
    }).join("");

    return `<div class="table-wrap">
      <table>
        <thead><tr>${th}${actionTh}</tr></thead>
        <tbody>${tb}</tbody>
      </table>
    </div>`;
  }

  window.Components = { toast, badge, openModal, table };
})();
