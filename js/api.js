// API module for handling Answer the Public API requests

const API_CONFIG = {
  baseURL: "https://answer-the-public1.p.rapidapi.com/answer-the-public",
  apiKey: "4c01e911c3msh768067093716181p1cff82jsn0dc8dbeed873",
  apiHost: "answer-the-public1.p.rapidapi.com",
}

/**
 * Fetch content ideas from Answer the Public API
 * @param {string} keyword - The search keyword
 * @param {string} country - Country code (e.g., 'us', 'uk')
 * @returns {Promise<Object>} API response data
 */
export async function fetchContentIdeas(keyword, country) {
  const url = `${API_CONFIG.baseURL}?keyword=${encodeURIComponent(keyword)}&country=${country}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_CONFIG.apiKey,
      "x-rapidapi-host": API_CONFIG.apiHost,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Parse API response and extract useful content ideas
 * @param {Object} data - Raw API response with structure {all_keywords: {total_keywords, all_keywords: []}}
 * @returns {Object} Organized content ideas with metadata
 */
export function parseContentIdeas(data) {
  const parsed = {
    totalKeywords: 0,
    keywords: [],
    byVolume: {
      high: [], // >10k searches
      medium: [], // 1k-10k searches
      low: [], // <1k searches
    },
    byDifficulty: {
      easy: [], // <40%
      medium: [], // 40-60%
      hard: [], // >60%
    },
    byCPC: {
      high: [], // >$0.20
      medium: [], // $0.10-$0.20
      low: [], // <$0.10
    },
  }

  try {
    if (data.all_keywords && data.all_keywords.all_keywords) {
      parsed.totalKeywords = data.all_keywords.total_keywords || 0
      const keywords = data.all_keywords.all_keywords

      keywords.forEach((item) => {
        const keywordData = {
          keyword: item.keyword || "",
          searchVolume: item["searche volume"] || "0",
          difficulty: item["Keyword Difficulty %"] || "0",
          cpc: item.CPC || "$0.00",
        }

        parsed.keywords.push(keywordData)

        // Categorize by search volume
        const volume = parseSearchVolume(keywordData.searchVolume)
        if (volume > 10000) {
          parsed.byVolume.high.push(keywordData)
        } else if (volume >= 1000) {
          parsed.byVolume.medium.push(keywordData)
        } else {
          parsed.byVolume.low.push(keywordData)
        }

        // Categorize by difficulty
        const difficulty = Number.parseInt(keywordData.difficulty)
        if (difficulty < 40) {
          parsed.byDifficulty.easy.push(keywordData)
        } else if (difficulty <= 60) {
          parsed.byDifficulty.medium.push(keywordData)
        } else {
          parsed.byDifficulty.hard.push(keywordData)
        }

        // Categorize by CPC
        const cpc = Number.parseFloat(keywordData.cpc.replace("$", ""))
        if (cpc > 0.2) {
          parsed.byCPC.high.push(keywordData)
        } else if (cpc >= 0.1) {
          parsed.byCPC.medium.push(keywordData)
        } else {
          parsed.byCPC.low.push(keywordData)
        }
      })
    }
  } catch (error) {
    console.error("Error parsing content ideas:", error)
  }

  return parsed
}

/**
 * Parse search volume string to number
 * @param {string} volumeStr - Volume string like "49.5k" or "880"
 * @returns {number} Numeric volume
 */
function parseSearchVolume(volumeStr) {
  if (!volumeStr) return 0

  const str = volumeStr.toLowerCase().trim()
  if (str.includes("k")) {
    return Number.parseFloat(str.replace("k", "")) * 1000
  }
  return Number.parseFloat(str) || 0
}
