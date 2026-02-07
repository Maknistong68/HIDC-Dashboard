/**
 * Review Queue System for Low-Confidence Hazard Classifications
 *
 * Tracks observations that couldn't be confidently classified,
 * enabling continuous improvement of the classification system.
 */

import { HAZARD_OBJECTS, HSE_ABBREVIATIONS, EQUIPMENT_SYNONYMS } from './contextMappings'

// Storage key for localStorage
const REVIEW_QUEUE_KEY = 'hazard_review_queue'
const UNKNOWN_TERMS_KEY = 'hazard_unknown_terms'
const MAX_QUEUE_SIZE = 100
const MAX_UNKNOWN_TERMS = 500

// ============================================================================
// Common English words to exclude from unknown term detection
// ============================================================================

const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once',
  'done', 'being', 'doing', 'having', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'then', 'once', 'any', 'because', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'out', 'off',
  'over', 'under', 'again', 'further', 'then', 'once', 'upon', 'while', 'until',
  'unless', 'since', 'although', 'though', 'even', 'still', 'already', 'yet',
  'worker', 'workers', 'person', 'people', 'area', 'areas', 'site', 'sites',
  'work', 'working', 'found', 'observed', 'seen', 'noted', 'reported', 'issue',
  'issues', 'problem', 'problems', 'good', 'bad', 'safe', 'unsafe', 'proper',
  'improper', 'correct', 'incorrect', 'near', 'close', 'without', 'using', 'used'
])

// ============================================================================
// Build known terms set for faster lookup
// ============================================================================

const buildKnownTermsSet = () => {
  const terms = new Set()

  // Add all HAZARD_OBJECTS terms
  for (const objects of Object.values(HAZARD_OBJECTS)) {
    for (const obj of objects) {
      // Add the full term
      terms.add(obj.toLowerCase())
      // Also add individual words from multi-word terms
      obj.toLowerCase().split(/\s+/).forEach(word => terms.add(word))
    }
  }

  // Add all abbreviations and their expansions
  for (const [abbrev, expansion] of Object.entries(HSE_ABBREVIATIONS)) {
    terms.add(abbrev.toLowerCase())
    expansion.toLowerCase().split(/\s+/).forEach(word => terms.add(word))
  }

  // Add all equipment synonyms
  for (const synonyms of Object.values(EQUIPMENT_SYNONYMS)) {
    for (const synonym of synonyms) {
      terms.add(synonym.toLowerCase())
      synonym.toLowerCase().split(/\s+/).forEach(word => terms.add(word))
    }
  }

  return terms
}

// Lazily build the known terms set
let knownTermsSet = null
const getKnownTerms = () => {
  if (!knownTermsSet) {
    knownTermsSet = buildKnownTermsSet()
  }
  return knownTermsSet
}

// ============================================================================
// Review Queue Functions
// ============================================================================

/**
 * Get the current review queue from localStorage
 * @returns {Array} Array of review items
 */
export const getReviewQueue = () => {
  try {
    const stored = localStorage.getItem(REVIEW_QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    // error handled silently
    return []
  }
}

/**
 * Add an observation to the review queue
 * @param {string} observation - The observation description
 * @param {Object} result - The classification result
 * @returns {boolean} Whether the item was added
 */
export const addToReviewQueue = (observation, result) => {
  if (!observation || !result) return false

  try {
    const queue = getReviewQueue()

    // Check for duplicates (same observation text)
    const isDuplicate = queue.some(
      item => item.observation.toLowerCase() === observation.toLowerCase().substring(0, 200)
    )

    if (isDuplicate) return false

    const item = {
      id: Date.now(),
      observation: observation.substring(0, 200), // Truncate for storage
      fullObservation: observation.length > 200 ? observation : null,
      suggestedCategory: result.category,
      confidence: result.confidence,
      fallbackUsed: result.fallbackUsed || null,
      unknownTerms: extractUnknownTerms(observation),
      timestamp: new Date().toISOString(),
      reviewed: false,
      reviewedCategory: null,
      reviewedAt: null
    }

    queue.push(item)

    // Keep queue under max size (remove oldest items)
    while (queue.length > MAX_QUEUE_SIZE) {
      queue.shift()
    }

    localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(queue))

    // Also track unknown terms globally
    if (item.unknownTerms.length > 0) {
      addUnknownTerms(item.unknownTerms)
    }

    return true
  } catch (error) {
    // error handled silently
    return false
  }
}

/**
 * Mark an item as reviewed with the correct category
 * @param {number} itemId - The item ID
 * @param {string} correctCategory - The manually verified category
 * @returns {boolean} Whether the update was successful
 */
export const markAsReviewed = (itemId, correctCategory) => {
  try {
    const queue = getReviewQueue()
    const item = queue.find(i => i.id === itemId)

    if (!item) return false

    item.reviewed = true
    item.reviewedCategory = correctCategory
    item.reviewedAt = new Date().toISOString()

    localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(queue))
    return true
  } catch (error) {
    // error handled silently
    return false
  }
}

/**
 * Get unreviewed items from the queue
 * @returns {Array} Array of unreviewed items
 */
export const getUnreviewedItems = () => {
  return getReviewQueue().filter(item => !item.reviewed)
}

/**
 * Get reviewed items for analysis
 * @returns {Array} Array of reviewed items
 */
export const getReviewedItems = () => {
  return getReviewQueue().filter(item => item.reviewed)
}

/**
 * Clear the entire review queue
 */
export const clearReviewQueue = () => {
  try {
    localStorage.removeItem(REVIEW_QUEUE_KEY)
  } catch (error) {
    // error handled silently
  }
}

/**
 * Get review queue statistics
 * @returns {Object} Statistics about the queue
 */
export const getReviewQueueStats = () => {
  const queue = getReviewQueue()
  const unreviewed = queue.filter(i => !i.reviewed)
  const reviewed = queue.filter(i => i.reviewed)

  // Count category mismatches
  const mismatches = reviewed.filter(
    i => i.suggestedCategory !== i.reviewedCategory
  )

  // Group by suggested category
  const byCategory = {}
  for (const item of unreviewed) {
    byCategory[item.suggestedCategory] = (byCategory[item.suggestedCategory] || 0) + 1
  }

  return {
    total: queue.length,
    unreviewed: unreviewed.length,
    reviewed: reviewed.length,
    mismatches: mismatches.length,
    accuracy: reviewed.length > 0
      ? Math.round(((reviewed.length - mismatches.length) / reviewed.length) * 100)
      : 0,
    byCategory,
    oldestUnreviewed: unreviewed.length > 0 ? unreviewed[0].timestamp : null
  }
}

// ============================================================================
// Unknown Terms Tracking
// ============================================================================

/**
 * Extract unknown terms from an observation
 * @param {string} text - The observation text
 * @returns {Array} Array of unknown terms
 */
export const extractUnknownTerms = (text) => {
  if (!text) return []

  const knownTerms = getKnownTerms()
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3) // Only consider words > 3 chars

  const unknown = []

  for (const word of words) {
    // Skip common words
    if (COMMON_WORDS.has(word)) continue

    // Skip known terms
    if (knownTerms.has(word)) continue

    // Skip numbers
    if (/^\d+$/.test(word)) continue

    // This is an unknown term
    if (!unknown.includes(word)) {
      unknown.push(word)
    }
  }

  return unknown
}

/**
 * Get all tracked unknown terms with frequencies
 * @returns {Object} Map of term -> frequency
 */
export const getUnknownTerms = () => {
  try {
    const stored = localStorage.getItem(UNKNOWN_TERMS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    // error handled silently
    return {}
  }
}

/**
 * Add unknown terms to the global tracker
 * @param {Array} terms - Array of terms to add
 */
export const addUnknownTerms = (terms) => {
  if (!terms || terms.length === 0) return

  try {
    const existing = getUnknownTerms()

    for (const term of terms) {
      existing[term] = (existing[term] || 0) + 1
    }

    // Prune if too many terms (keep most frequent)
    const entries = Object.entries(existing)
    if (entries.length > MAX_UNKNOWN_TERMS) {
      entries.sort((a, b) => b[1] - a[1]) // Sort by frequency desc
      const pruned = Object.fromEntries(entries.slice(0, MAX_UNKNOWN_TERMS))
      localStorage.setItem(UNKNOWN_TERMS_KEY, JSON.stringify(pruned))
    } else {
      localStorage.setItem(UNKNOWN_TERMS_KEY, JSON.stringify(existing))
    }
  } catch (error) {
    // error handled silently
  }
}

/**
 * Get the most frequent unknown terms (candidates for adding to dictionary)
 * @param {number} limit - Number of terms to return
 * @returns {Array} Array of { term, frequency } objects
 */
export const getTopUnknownTerms = (limit = 20) => {
  const terms = getUnknownTerms()
  return Object.entries(terms)
    .map(([term, frequency]) => ({ term, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit)
}

/**
 * Clear all unknown terms
 */
export const clearUnknownTerms = () => {
  try {
    localStorage.removeItem(UNKNOWN_TERMS_KEY)
  } catch (error) {
    // error handled silently
  }
}

/**
 * Remove a term from unknown terms (e.g., after adding to dictionary)
 * @param {string} term - The term to remove
 */
export const removeUnknownTerm = (term) => {
  try {
    const terms = getUnknownTerms()
    delete terms[term.toLowerCase()]
    localStorage.setItem(UNKNOWN_TERMS_KEY, JSON.stringify(terms))
  } catch (error) {
    // error handled silently
  }
}

// ============================================================================
// Export for Integration
// ============================================================================

export default {
  // Review queue
  getReviewQueue,
  addToReviewQueue,
  markAsReviewed,
  getUnreviewedItems,
  getReviewedItems,
  clearReviewQueue,
  getReviewQueueStats,

  // Unknown terms
  extractUnknownTerms,
  getUnknownTerms,
  addUnknownTerms,
  getTopUnknownTerms,
  clearUnknownTerms,
  removeUnknownTerm
}
