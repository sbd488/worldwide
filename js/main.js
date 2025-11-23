// Main application script for home page
import { fetchContentIdeas, parseContentIdeas } from "./api.js"
import { saveSearch, getAllSearches, deleteSearch } from "./storage.js"
import { validateForm, validateField, getFormData, setButtonLoading } from "./form.js"
import { showError, showSuccess, createSearchCard } from "./ui.js"

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", initApp)

function initApp() {
  const form = document.getElementById("searchForm")
  const submitBtn = document.getElementById("submitBtn")
  const savedSearchesSection = document.getElementById("savedSearchesSection")
  const searchHistory = document.getElementById("searchHistory")

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

    try {
      // Fetch data from API
      const apiData = await fetchContentIdeas(formData.keyword, formData.country)
      const parsedData = parseContentIdeas(apiData)

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

        // Redirect to results page with search ID
        setTimeout(() => {
          window.location.href = `results.html?id=${savedSearch.id}`
        }, 1000)
      }
    } catch (error) {
      console.error("Error:", error)
      showError("Failed to fetch content ideas. Please try again.", form.parentElement)
      setButtonLoading(submitBtn, false)
    }
  })

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
            if (confirm("Are you sure you want to delete this search?")) {
              deleteSearch(id)
              loadSavedSearches()
              showSuccess("Search deleted successfully", savedSearchesSection)
            }
          },
        )
        searchHistory.appendChild(card)
      })
    } else {
      savedSearchesSection.classList.add("hidden")
    }
  }
}
