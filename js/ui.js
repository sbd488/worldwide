// UI helper functions module

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {HTMLElement} container - Container element
 */
export function showError(message, container) {
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.textContent = message
  errorDiv.setAttribute("role", "alert")

  container.insertBefore(errorDiv, container.firstChild)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove()
  }, 5000)
}

/**
 * Show success message
 * @param {string} message - Success message to display
 * @param {HTMLElement} container - Container element
 */
export function showSuccess(message, container) {
  const successDiv = document.createElement("div")
  successDiv.className = "success-message"
  successDiv.textContent = message
  successDiv.setAttribute("role", "alert")

  container.insertBefore(successDiv, container.firstChild)

  // Auto-remove after 3 seconds
  setTimeout(() => {
    successDiv.remove()
  }, 3000)
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

  return date.toLocaleDateString()
}

/**
 * Get country name from code
 * @param {string} code - Country code
 * @returns {string} Country name
 */
export function getCountryName(code) {
  const countries = {
    us: "United States",
    uk: "United Kingdom",
    ca: "Canada",
    au: "Australia",
    de: "Germany",
    fr: "France",
    es: "Spain",
    it: "Italy",
    br: "Brazil",
    in: "India",
  }
  return countries[code] || code.toUpperCase()
}

/**
 * Create search card element
 * @param {Object} search - Search data
 * @param {Function} onView - View callback
 * @param {Function} onDelete - Delete callback
 * @returns {HTMLElement} Search card element
 */
export function createSearchCard(search, onView, onDelete) {
  const card = document.createElement("div")
  card.className = "search-card"

  const title = document.createElement("h3")
  title.textContent = search.keyword

  const country = document.createElement("p")
  country.innerHTML = `<strong>Country:</strong> ${getCountryName(search.country)}`

  const industry = document.createElement("p")
  industry.innerHTML = `<strong>Industry:</strong> ${search.industry || "All"}`

  const timestamp = document.createElement("p")
  timestamp.innerHTML = `<strong>Saved:</strong> ${formatDate(search.timestamp)}`

  const actions = document.createElement("div")
  actions.className = "actions"

  const viewBtn = document.createElement("button")
  viewBtn.textContent = "View Results"
  viewBtn.onclick = () => onView(search.id)

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "btn-secondary"
  deleteBtn.textContent = "Delete"
  deleteBtn.onclick = () => onDelete(search.id)

  actions.appendChild(viewBtn)
  actions.appendChild(deleteBtn)

  card.appendChild(title)
  card.appendChild(country)
  card.appendChild(industry)
  card.appendChild(timestamp)
  card.appendChild(actions)

  return card
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy:", error)
    return false
  }
}

/**
 * Get URL parameter
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
export function getURLParameter(name) {
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

/**
 * Set URL parameter
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
export function setURLParameter(name, value) {
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.pushState({}, "", url)
}
