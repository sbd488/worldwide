// Local storage module for persisting data

const STORAGE_KEYS = {
  SEARCHES: "contentPlanner_searches",
  LAST_SEARCH: "contentPlanner_lastSearch",
}

/**
 * Save a search to local storage
 * @param {Object} searchData - Search data to save
 */
export function saveSearch(searchData) {
  try {
    const searches = getAllSearches()
    const searchWithId = {
      ...searchData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }

    searches.unshift(searchWithId)

    // Keep only last 20 searches
    const limitedSearches = searches.slice(0, 20)

    localStorage.setItem(STORAGE_KEYS.SEARCHES, JSON.stringify(limitedSearches))
    localStorage.setItem(STORAGE_KEYS.LAST_SEARCH, JSON.stringify(searchWithId))

    return searchWithId
  } catch (error) {
    console.error("Error saving search:", error)
    return null
  }
}

/**
 * Get all saved searches from local storage
 * @returns {Array} Array of saved searches
 */
export function getAllSearches() {
  try {
    const searches = localStorage.getItem(STORAGE_KEYS.SEARCHES)
    return searches ? JSON.parse(searches) : []
  } catch (error) {
    console.error("Error getting searches:", error)
    return []
  }
}

/**
 * Get a specific search by ID
 * @param {number} id - Search ID
 * @returns {Object|null} Search data or null
 */
export function getSearchById(id) {
  try {
    const searches = getAllSearches()
    return searches.find((search) => search.id === Number.parseInt(id))
  } catch (error) {
    console.error("Error getting search by ID:", error)
    return null
  }
}

/**
 * Delete a search by ID
 * @param {number} id - Search ID to delete
 * @returns {boolean} Success status
 */
export function deleteSearch(id) {
  try {
    const searches = getAllSearches()
    const filtered = searches.filter((search) => search.id !== Number.parseInt(id))
    localStorage.setItem(STORAGE_KEYS.SEARCHES, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error("Error deleting search:", error)
    return false
  }
}

/**
 * Get the last search
 * @returns {Object|null} Last search data or null
 */
export function getLastSearch() {
  try {
    const lastSearch = localStorage.getItem(STORAGE_KEYS.LAST_SEARCH)
    return lastSearch ? JSON.parse(lastSearch) : null
  } catch (error) {
    console.error("Error getting last search:", error)
    return null
  }
}

/**
 * Clear all saved searches
 */
export function clearAllSearches() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SEARCHES)
    localStorage.removeItem(STORAGE_KEYS.LAST_SEARCH)
    return true
  } catch (error) {
    console.error("Error clearing searches:", error)
    return false
  }
}
