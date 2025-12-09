import { fetchContentIdeas, parseContentIdeas } from "./api.js"
import { saveSearch, getAllSearches, deleteSearch } from "./storage.js"
import { validateForm, validateField, getFormData, setButtonLoading } from "./form.js"
import { showError, showSuccess, createSearchCard } from "./ui.js"

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", initApp)

function initApp() {
  const form = document.getElementById("searchForm")
  if (!form) return

  const submitBtn = document.getElementById("submitBtn")
  const savedSearchesSection = document.getElementById("savedSearchesSection")
  const searchHistory = document.getElementById("searchHistory")

  // Delete confirmation modal elements
  const deleteModal = document.getElementById("deleteSearchModal")
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn")
  let searchIdToDelete = null

  // NEW: Loading modal elements
  const loadingModal = document.getElementById("loadingModal")
  const cancelLoadingBtn = document.getElementById("cancelLoadingBtn")
  let isSearchCancelled = false

  // Set up form validation
  setupFormValidation(form)

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (!validateForm(form)) {
      showError("Please fix the errors in the form", form.parentElement)
      return
    }

    const formData = getFormData(form)
    setButtonLoading(submitBtn, true)
    openLoadingModal()

    try {
      const apiData = await fetchContentIdeas(formData.keyword, formData.country)
      const parsedData = parseContentIdeas(apiData)

      // If user cancelled while we were waiting, stop here
      if (isSearchCancelled) {
        setButtonLoading(submitBtn, false)
        closeLoadingModal()
        return
      }

      // Save search to local storage
      const savedSearch = saveSearch({
        keyword: formData.keyword,
        country: formData.country,
        industry: formData.industry,
        notes: formData.notes,
        results: parsedData,
      })

      if (savedSearch) {
        showSuccess("Content ideas generated successfully!", form.parentElement)
        closeLoadingModal()

        // Redirect to results page with search ID
        setTimeout(() => {
          window.location.href = `results.html?id=${savedSearch.id}`
        }, 1000)
      }
    } catch (error) {
      // If the user cancelled, we silently ignore errors from this request
      if (!isSearchCancelled) {
        console.error("Error:", error)
        showError("Failed to fetch content ideas. Please try again.", form.parentElement)
        setButtonLoading(submitBtn, false)
        closeLoadingModal()
      }
    }
  })

  // ---------- Loading modal helpers ----------

  function openLoadingModal() {
    if (!loadingModal) return
    isSearchCancelled = false
    loadingModal.classList.add("modal--visible")
    loadingModal.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
  }

  function closeLoadingModal() {
    if (!loadingModal) return
    loadingModal.classList.remove("modal--visible")
    loadingModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
  }

  if (cancelLoadingBtn) {
    cancelLoadingBtn.addEventListener("click", () => {
      // Mark as cancelled so the async logic ignores the result
      isSearchCancelled = true
      closeLoadingModal()
      setButtonLoading(submitBtn, false)
      showError("Search canceled by user.", form.parentElement)
    })
  }

  // ---------- Delete modal helpers ----------

  function openDeleteModal(id) {
    if (!deleteModal) {
      // Fallback: native confirm if modal is missing
      if (window.confirm("Are you sure you want to delete this search?")) {
        performDelete(id)
      }
      return
    }

    searchIdToDelete = id
    deleteModal.classList.add("modal--visible")
    deleteModal.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
  }

  function closeDeleteModal() {
    if (!deleteModal) return
    deleteModal.classList.remove("modal--visible")
    deleteModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
    searchIdToDelete = null
  }

  function performDelete(id) {
    deleteSearch(id)
    loadSavedSearches()
    if (savedSearchesSection) {
      showSuccess("Search deleted successfully", savedSearchesSection)
    }
  }

  // Wire up delete modal buttons if present
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (searchIdToDelete !== null) {
        performDelete(searchIdToDelete)
      }
      closeDeleteModal()
    })
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      closeDeleteModal()
    })
  }

  if (deleteModal) {
    const overlay = deleteModal.querySelector(".modal-overlay")
    if (overlay) {
      overlay.addEventListener("click", () => {
        closeDeleteModal()
      })
    }
  }

  // Load and display saved searches
  loadSavedSearches()

  function setupFormValidation(form) {
    const fields = form.querySelectorAll("input[required], select[required]")

    fields.forEach((field) => {
      // Validate on blur
      field.addEventListener("blur", () => {
        if (field.value) {
          validateField(field)
        }
      })

      // Clear error on input
      field.addEventListener("input", () => {
        const errorElement = document.getElementById(`${field.id}-error`)
        if (errorElement && errorElement.classList.contains("show")) {
          field.classList.remove("error")
          errorElement.classList.remove("show")
        }
      })
    })
  }

  function loadSavedSearches() {
    if (!savedSearchesSection || !searchHistory) return

    const searches = getAllSearches()

    if (searches.length > 0) {
      savedSearchesSection.classList.remove("hidden")
      searchHistory.innerHTML = ""

      // Show only last 6 searches on home page
      searches.slice(0, 6).forEach((search) => {
        const card = createSearchCard(
          search,
          (id) => {
            window.location.href = `results.html?id=${id}`
          },
          (id) => {
            openDeleteModal(id)
          },
        )

        searchHistory.appendChild(card)
      })
    } else {
      savedSearchesSection.classList.add("hidden")
    }
  }
}