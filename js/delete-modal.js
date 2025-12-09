(function () {
  let confirmCallback = null;

  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("deleteConfirmModal");
    if (!modal) return;

    const overlay = modal.querySelector(".modal-overlay");
    const closeButtons = modal.querySelectorAll("[data-delete-close]");
    const confirmBtn = document.getElementById("deleteConfirmBtn");
    const messageEl = document.getElementById("deleteConfirmMessage");

    function openDeleteConfirm(message, onConfirm) {
      if (messageEl && message) {
        messageEl.textContent = message;
      }

      confirmCallback = typeof onConfirm === "function" ? onConfirm : null;

      modal.classList.add("modal--visible");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeDeleteConfirm() {
      modal.classList.remove("modal--visible");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      confirmCallback = null;
    }

    if (overlay) {
      overlay.addEventListener("click", closeDeleteConfirm);
    }

    closeButtons.forEach((btn) => {
      btn.addEventListener("click", closeDeleteConfirm);
    });

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        if (confirmCallback) {
          confirmCallback();
        }
        closeDeleteConfirm();
      });
    }

    // Expose globally so any script can use it
    window.openDeleteConfirm = openDeleteConfirm;
  });
})();
