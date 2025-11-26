document.addEventListener("DOMContentLoaded", () => {
  const openButtons = document.querySelectorAll("[data-open-modal]")
  const body = document.body

  function openModal(selector) {
    const modal = document.querySelector(selector)
    if (!modal) return
    modal.classList.add("modal--visible")
    modal.setAttribute("aria-hidden", "false")
    body.style.overflow = "hidden"
  }

  function closeModal(modal) {
    modal.classList.remove("modal--visible")
    modal.setAttribute("aria-hidden", "true")
    body.style.overflow = ""
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-open-modal")
      if (target) {
        openModal(target)
      }
    })
  })

  // Close when clicking elements marked as [data-close-modal]
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-close-modal]")) {
      const modal = e.target.closest(".modal")
      if (modal) {
        closeModal(modal)
      }
    }
  })

  // Close with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const visibleModal = document.querySelector(".modal.modal--visible")
      if (visibleModal) {
        closeModal(visibleModal)
      }
    }
  })
})