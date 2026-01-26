(function () {
  const ensureRoot = () => {
    if (!document.getElementById("toast-root")) {
      const toastRoot = document.createElement("div");
      toastRoot.id = "toast-root";
      document.body.appendChild(toastRoot);
    }
    if (!document.getElementById("modal-root")) {
      const modalRoot = document.createElement("div");
      modalRoot.id = "modal-root";
      document.body.appendChild(modalRoot);
    }
  };

  const Toast = {
    show(type = "info", message = "", opts = {}) {
      ensureRoot();
      const root = document.getElementById("toast-root");
      const toast = document.createElement("div");
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <div>
          <strong>${Utils.escapeHtml(opts.title || type.toUpperCase())}</strong>
          <p>${Utils.escapeHtml(message)}</p>
        </div>
        <button class="icon-btn" aria-label="Close">✕</button>
      `;
      const remove = () => toast.remove();
      toast.querySelector("button")?.addEventListener("click", remove);
      root.appendChild(toast);
      setTimeout(remove, opts.ms || 3500);
    }
  };

  const Modal = {
    open(id, html, opts = {}) {
      ensureRoot();
      const root = document.getElementById("modal-root");
      const modal = document.createElement("div");
      modal.className = "modal open";
      modal.setAttribute("data-modal", id);
      modal.innerHTML = `
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-hd">
            <h3>${Utils.escapeHtml(opts.title || "Modal")}</h3>
            <button class="icon-btn" data-close aria-label="Close">✕</button>
          </div>
          <div class="modal-bd">${html}</div>
          <div class="modal-ft">${opts.footer || ""}</div>
        </div>
      `;
      root.appendChild(modal);

      modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target.closest("[data-close]")) {
          Modal.close(id);
        }
      });

      document.addEventListener("keydown", function onEsc(event) {
        if (event.key === "Escape") {
          Modal.close(id);
          document.removeEventListener("keydown", onEsc);
        }
      });
    },
    close(id) {
      const modal = document.querySelector(`.modal[data-modal='${id}']`);
      if (modal) modal.remove();
    }
  };

  const Confirm = {
    open({ title = "Confirm", message = "Are you sure?", confirmText = "Confirm", onConfirm }) {
      Modal.open("confirm", `
        <p>${Utils.escapeHtml(message)}</p>
      `, {
        title,
        footer: `
          <button class="btn" data-close>Cancel</button>
          <button class="btn primary" id="confirmAction">${Utils.escapeHtml(confirmText)}</button>
        `
      });

      Utils.el("#confirmAction")?.addEventListener("click", () => {
        if (typeof onConfirm === "function") onConfirm();
        Modal.close("confirm");
      });
    }
  };

  const Loader = {
    show(el) {
      if (!el) return;
      el.dataset.prev = el.innerHTML;
      el.innerHTML = `
        <div class="skeleton">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      `;
    },
    hide(el) {
      if (!el) return;
      if (el.dataset.prev !== undefined) {
        el.innerHTML = el.dataset.prev;
        delete el.dataset.prev;
      }
    }
  };

  const Badge = {
    render(status) {
      const normalized = String(status || "").toLowerCase();
      const map = {
        pending: "pending",
        approved: "approved",
        rejected: "rejected",
        active: "active",
        inactive: "inactive"
      };
      const cls = map[normalized] || "info";
      return `<span class="badge ${cls}">${Utils.escapeHtml(status || "info")}</span>`;
    }
  };

  const Table = {
    render(el, { columns = [], rows = [], rowActions = null, emptyText = "No data found." } = {}) {
      if (!el) return;
      if (!rows || rows.length === 0) {
        EmptyState.render(el, "Nothing here yet", emptyText);
        return;
      }
      const head = columns.map((col) => `<th>${Utils.escapeHtml(col.label)}</th>`).join("");
      const actionHead = rowActions ? "<th>Actions</th>" : "";
      const body = rows.map((row) => {
        const cells = columns.map((col) => {
          const value = typeof col.render === "function" ? col.render(row) : row[col.key];
          return `<td>${value ?? "—"}</td>`;
        }).join("");
        const actions = rowActions ? `<td>${rowActions(row)}</td>` : "";
        return `<tr>${cells}${actions}</tr>`;
      }).join("");
      el.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr>${head}${actionHead}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    }
  };

  const Pagination = {
    render(el, { page = 1, pageSize = 10, total = 0, onPageChange }) {
      if (!el) return;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      el.innerHTML = `
        <div class="pagination">
          <button class="btn small" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? "disabled" : ""}>Prev</button>
          <span>Page ${page} of ${totalPages}</span>
          <button class="btn small" data-page="${Math.min(totalPages, page + 1)}" ${page >= totalPages ? "disabled" : ""}>Next</button>
        </div>
      `;
      el.querySelectorAll("button[data-page]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          const next = Number(button.getAttribute("data-page"));
          if (typeof onPageChange === "function") onPageChange(next);
        });
      });
    }
  };

  const Tabs = {
    init(container) {
      if (!container) return;
      const buttons = container.querySelectorAll("[data-tab]");
      const panels = container.querySelectorAll("[data-tab-content]");
      const activate = (key) => {
        buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === key));
        panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.tabContent === key));
      };
      buttons.forEach((btn) => btn.addEventListener("click", () => activate(btn.dataset.tab)));
      if (buttons[0]) activate(buttons[0].dataset.tab);
    }
  };

  const EmptyState = {
    render(el, title, description, actionHtml = "") {
      if (!el) return;
      el.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <div>
            <h4>${Utils.escapeHtml(title)}</h4>
            <p>${Utils.escapeHtml(description)}</p>
            ${actionHtml}
          </div>
        </div>
      `;
    }
  };

  window.Toast = Toast;
  window.Modal = Modal;
  window.Confirm = Confirm;
  window.Loader = Loader;
  window.Badge = Badge;
  window.Table = Table;
  window.Pagination = Pagination;
  window.Tabs = Tabs;
  window.EmptyState = EmptyState;
})();
