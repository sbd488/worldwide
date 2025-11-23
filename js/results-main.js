// Main script for results page
import { getSearchById } from "./storage.js"
import { getURLParameter, getCountryName, formatDate, copyToClipboard } from "./ui.js"

document.addEventListener("DOMContentLoaded", initResults)

function initResults() {
  const searchId = getURLParameter("id")
  const resultsContainer = document.getElementById("resultsContainer")
  const resultsHeader = document.getElementById("resultsHeader")
  const searchInfo = document.getElementById("searchInfo")

  if (!searchId) {
    displayNoResults("No search ID provided. Please start a new search from the home page.")
    return
  }

  const search = getSearchById(Number.parseInt(searchId))

  if (!search) {
    displayNoResults("Search not found. It may have been deleted.")
    return
  }

  // Display search information
  displaySearchInfo(search)

  // Display results
  displayResults(search.results)

  function displaySearchInfo(search) {
    searchInfo.innerHTML = `
      <div class="info-badge">
        <strong>Keyword:</strong> ${search.keyword}
      </div>
      <div class="info-badge">
        <strong>Country:</strong> ${getCountryName(search.country)}
      </div>
      ${
        search.industry
          ? `
        <div class="info-badge">
          <strong>Industry:</strong> ${search.industry}
        </div>
      `
          : ""
      }
      <div class="info-badge">
        <strong>Generated:</strong> ${formatDate(search.timestamp)}
      </div>
    `

    if (search.notes) {
      const notesDiv = document.createElement("div")
      notesDiv.style.marginTop = "1rem"
      notesDiv.innerHTML = `<p><strong>Notes:</strong> ${search.notes}</p>`
      searchInfo.appendChild(notesDiv)
    }
  }

  function displayResults(results) {
    resultsContainer.innerHTML = ""

    if (results.totalKeywords) {
      const summarySection = createSummarySection(results)
      resultsContainer.appendChild(summarySection)
    }

    const categories = [
      { key: "keywords", title: "All Keywords", icon: "🔑", data: results.keywords || [] },
      {
        key: "highVolume",
        title: "High Volume Keywords (>10k searches)",
        icon: "📈",
        data: results.byVolume?.high || [],
      },
      {
        key: "mediumVolume",
        title: "Medium Volume Keywords (1k-10k searches)",
        icon: "📊",
        data: results.byVolume?.medium || [],
      },
      {
        key: "lowDifficulty",
        title: "Easy Keywords (Low Competition)",
        icon: "✅",
        data: results.byDifficulty?.easy || [],
      },
      {
        key: "highCPC",
        title: "High Value Keywords (CPC >$0.20)",
        icon: "💰",
        data: results.byCPC?.high || [],
      },
    ]

    let hasResults = false

    categories.forEach((category) => {
      const ideas = category.data

      if (ideas && ideas.length > 0) {
        hasResults = true
        const section = createCategorySection(category.title, category.icon, ideas, category.key)
        resultsContainer.appendChild(section)
      }
    })

    if (!hasResults) {
      displayNoResults("No content ideas found for this search. Try a different keyword or country.")
    }
  }

  function createSummarySection(results) {
    const section = document.createElement("section")
    section.className = "summary-section"
    section.innerHTML = `
      <div class="summary-card">
        <h3>📊 Search Summary</h3>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-value">${results.totalKeywords}</span>
            <span class="stat-label">Total Keywords</span>
          </div>
          <div class="stat">
            <span class="stat-value">${results.byVolume?.high?.length || 0}</span>
            <span class="stat-label">High Volume</span>
          </div>
          <div class="stat">
            <span class="stat-value">${results.byDifficulty?.easy?.length || 0}</span>
            <span class="stat-label">Easy to Rank</span>
          </div>
          <div class="stat">
            <span class="stat-value">${results.byCPC?.high?.length || 0}</span>
            <span class="stat-label">High Value</span>
          </div>
        </div>
      </div>
    `
    return section
  }

  function createCategorySection(title, icon, ideas, categoryKey) {
    const section = document.createElement("section")
    section.className = "category-section"

    const heading = document.createElement("h3")
    heading.textContent = `${icon} ${title}`
    heading.innerHTML += ` <span class="count-badge">${ideas.length}</span>`

    const list = document.createElement("div")
    list.className = "ideas-list"

    // Limit display to first 50 keywords for performance
    const displayLimit = categoryKey === "keywords" ? 50 : ideas.length
    ideas.slice(0, displayLimit).forEach((idea) => {
      const card = document.createElement("div")
      card.className = "keyword-card"
      card.setAttribute("tabindex", "0")
      card.setAttribute("role", "button")

      // Create keyword content with metrics
      const keywordText = typeof idea === "string" ? idea : idea.keyword
      const content = document.createElement("div")
      content.className = "keyword-content"

      const text = document.createElement("p")
      text.className = "keyword-text"
      text.textContent = keywordText
      content.appendChild(text)

      // Add metrics if available
      if (typeof idea === "object" && idea.keyword) {
        const metrics = document.createElement("div")
        metrics.className = "keyword-metrics"
        metrics.innerHTML = `
          <span class="metric" title="Search Volume">
            📊 ${idea.searchVolume}
          </span>
          <span class="metric" title="Keyword Difficulty">
            🎯 ${idea.difficulty}%
          </span>
          <span class="metric" title="Cost Per Click">
            💵 ${idea.cpc}
          </span>
        `
        content.appendChild(metrics)
      }

      const copyBtn = document.createElement("button")
      copyBtn.className = "copy-btn"
      copyBtn.textContent = "Copy"
      copyBtn.setAttribute("aria-label", `Copy "${keywordText}"`)

      copyBtn.addEventListener("click", async (e) => {
        e.stopPropagation()
        const success = await copyToClipboard(keywordText)
        if (success) {
          copyBtn.textContent = "✓"
          setTimeout(() => {
            copyBtn.textContent = "Copy"
          }, 2000)
        }
      })

      card.appendChild(content)
      card.appendChild(copyBtn)

      // Allow keyboard interaction
      card.addEventListener("click", async () => {
        await copyToClipboard(keywordText)
      })

      card.addEventListener("keypress", async (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          await copyToClipboard(keywordText)
        }
      })

      list.appendChild(card)
    })

    // Add "show more" message if truncated
    if (categoryKey === "keywords" && ideas.length > displayLimit) {
      const showMore = document.createElement("p")
      showMore.className = "show-more-text"
      showMore.textContent = `Showing ${displayLimit} of ${ideas.length} keywords`
      list.appendChild(showMore)
    }

    section.appendChild(heading)
    section.appendChild(list)

    return section
  }

  function displayNoResults(message) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>${message}</p>
        <a href="index.html" style="color: var(--primary-color); font-weight: 600;">← Back to Home</a>
      </div>
    `
  }
}
