/**
 * Memoization Utilities for HSE Dashboard
 *
 * Provides caching for expensive calculations to improve performance:
 * - LRU cache for string normalization
 * - Cache for classification results
 * - Memoized chart data calculations
 *
 * This prevents redundant recalculation when data hasn't changed.
 */

/**
 * Simple LRU (Least Recently Used) Cache
 * Automatically evicts oldest items when max size is reached
 */
export class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) {
      return undefined
    }
    // Move to end (most recently used)
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    // If key exists, delete to update position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // Evict oldest if at capacity
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key) {
    return this.cache.has(key)
  }

  clear() {
    this.cache.clear()
  }

  get size() {
    return this.cache.size
  }
}

// ============================================
// STRING NORMALIZATION CACHE
// ============================================

// Cache for normalized contractor names
const contractorCache = new LRUCache(500)

// Cache for normalized site names
const siteCache = new LRUCache(500)

// Cache for normalized text (descriptions, etc.)
const textCache = new LRUCache(1000)

/**
 * Get cached normalized contractor name
 * @param {string} contractor
 * @param {Function} normalizer - Normalization function to call on cache miss
 * @returns {string}
 */
export const getCachedContractor = (contractor, normalizer) => {
  if (!contractor) return contractor

  const cached = contractorCache.get(contractor)
  if (cached !== undefined) {
    return cached
  }

  const normalized = normalizer(contractor)
  contractorCache.set(contractor, normalized)
  return normalized
}

/**
 * Get cached normalized site name
 * @param {string} site
 * @param {Function} normalizer
 * @returns {string}
 */
export const getCachedSite = (site, normalizer) => {
  if (!site) return site

  const cached = siteCache.get(site)
  if (cached !== undefined) {
    return cached
  }

  const normalized = normalizer(site)
  siteCache.set(site, normalized)
  return normalized
}

/**
 * Get cached normalized text
 * @param {string} text
 * @param {Function} normalizer
 * @returns {string}
 */
export const getCachedText = (text, normalizer) => {
  if (!text) return text

  const cached = textCache.get(text)
  if (cached !== undefined) {
    return cached
  }

  const normalized = normalizer(text)
  textCache.set(text, normalized)
  return normalized
}

// ============================================
// FACTOR DETECTION CACHE
// ============================================

// Cache for per-incident factor detection results
const factorCache = new LRUCache(5000)

/**
 * Get cached factor detection result for an incident description
 * @param {string} description - Incident description
 * @param {string} hazardCategory - Hazard category
 * @param {Function} detectFn - Factor detection function to call on cache miss
 * @param {string} incidentType - Incident type (e.g., 'unsafe-act') for classification-based detection
 * @returns {Array} Detected factors
 */
export const getCachedFactors = (description, hazardCategory, detectFn, incidentType) => {
  if (!description) return []
  const key = `${description.substring(0, 200)}|${hazardCategory || ''}|${incidentType || ''}`
  const cached = factorCache.get(key)
  if (cached !== undefined) return cached
  const result = incidentType
    ? detectFn(description, hazardCategory, { incidentType })
    : detectFn(description, hazardCategory)
  factorCache.set(key, result)
  return result
}

/**
 * Clear factor detection cache
 */
export const clearFactorCache = () => {
  factorCache.clear()
}

// ============================================
// CLASSIFICATION CACHE
// ============================================

// Cache for hazard classifications
const classificationCache = new LRUCache(2000)

/**
 * Generate cache key for classification
 * @param {string} description
 * @param {string} existingCategory
 * @param {string} mode
 * @returns {string}
 */
const getClassificationKey = (description, existingCategory, mode) => {
  // Use first 200 chars of description to limit key size
  const descKey = (description || '').substring(0, 200)
  return `${descKey}|${existingCategory || ''}|${mode}`
}

/**
 * Get cached hazard classification
 * @param {string} description
 * @param {string} existingCategory
 * @param {string} mode
 * @param {Function} classifier - Classification function to call on cache miss
 * @returns {string}
 */
export const getCachedClassification = (description, existingCategory, mode, classifier) => {
  const key = getClassificationKey(description, existingCategory, mode)

  const cached = classificationCache.get(key)
  if (cached !== undefined) {
    return cached
  }

  const result = classifier(description, existingCategory, mode)
  classificationCache.set(key, result)
  return result
}

/**
 * Clear classification cache
 * Use when classification rules change
 */
export const clearClassificationCache = () => {
  classificationCache.clear()
}

// ============================================
// CHART DATA MEMOIZATION
// ============================================

// Cache for expensive chart calculations
const chartDataCache = new Map()

/**
 * Generate hash for incidents array
 * Uses length, sample of IDs, and checksum for change detection
 * @param {Array} incidents
 * @returns {string}
 */
const getIncidentsHash = (incidents) => {
  if (!incidents || incidents.length === 0) return 'empty'

  // Sample multiple records across the array for better change detection
  const sampleSize = Math.min(10, incidents.length)
  const step = Math.max(1, Math.floor(incidents.length / sampleSize))

  const sampleIds = []
  for (let i = 0; i < incidents.length && sampleIds.length < sampleSize; i += step) {
    const record = incidents[i]
    // Include id and key fields that might change
    const recordKey = [
      record?.id || '',
      record?.location || '',
      record?.type || '',
      record?.date || ''
    ].join('|')
    sampleIds.push(recordKey)
  }

  // Add last record to ensure tail changes are detected
  if (incidents.length > 1) {
    const last = incidents[incidents.length - 1]
    sampleIds.push([last?.id || '', last?.location || '', last?.type || ''].join('|'))
  }

  return `${incidents.length}:${sampleIds.join(':')}`
}

/**
 * Get cached chart data or compute it
 * @param {string} chartType - Unique identifier for the chart
 * @param {Array} incidents - Current incidents data
 * @param {Function} compute - Function to compute chart data
 * @param {any} additionalParams - Additional parameters that affect the computation
 * @returns {any}
 */
export const getCachedChartData = (chartType, incidents, compute, additionalParams = null) => {
  const hash = getIncidentsHash(incidents)
  const paramsStr = additionalParams ? JSON.stringify(additionalParams) : ''
  const cacheKey = `${chartType}:${hash}:${paramsStr}`

  if (chartDataCache.has(cacheKey)) {
    return chartDataCache.get(cacheKey)
  }

  const result = compute(incidents, additionalParams)
  chartDataCache.set(cacheKey, result)

  // Limit chart cache size (200 entries to accommodate dual-dataset caching)
  if (chartDataCache.size > 200) {
    const firstKey = chartDataCache.keys().next().value
    chartDataCache.delete(firstKey)
  }

  return result
}

/**
 * Clear chart data cache
 * Use when significant data changes occur
 */
export const clearChartCache = () => {
  chartDataCache.clear()
}

// ============================================
// FILTER RESULTS MEMOIZATION
// ============================================

// Cache for filtered incidents
let filteredIncidentsCache = {
  hash: null,
  filterKey: null,
  result: null
}

/**
 * Get cached filtered incidents
 * @param {Array} incidents
 * @param {Object} filters - Filter criteria
 * @param {Function} filterFn - Filter function
 * @returns {Array}
 */
export const getCachedFilteredIncidents = (incidents, filters, filterFn) => {
  const hash = getIncidentsHash(incidents)
  const filterKey = JSON.stringify(filters)

  if (
    filteredIncidentsCache.hash === hash &&
    filteredIncidentsCache.filterKey === filterKey &&
    filteredIncidentsCache.result
  ) {
    return filteredIncidentsCache.result
  }

  const result = filterFn(incidents, filters)

  filteredIncidentsCache = {
    hash,
    filterKey,
    result
  }

  return result
}

/**
 * Clear filtered incidents cache
 */
export const clearFilterCache = () => {
  filteredIncidentsCache = {
    hash: null,
    filterKey: null,
    result: null
  }
}

// ============================================
// AGGREGATION MEMOIZATION
// ============================================

// Cache for aggregated data (counts by category, contractor, etc.)
const aggregationCache = new Map()

/**
 * Get cached aggregation result
 * @param {string} aggregationType - Type of aggregation (e.g., 'byContractor', 'byCategory')
 * @param {Array} incidents
 * @param {Function} aggregateFn
 * @returns {any}
 */
export const getCachedAggregation = (aggregationType, incidents, aggregateFn) => {
  const hash = getIncidentsHash(incidents)
  const cacheKey = `${aggregationType}:${hash}`

  if (aggregationCache.has(cacheKey)) {
    return aggregationCache.get(cacheKey)
  }

  const result = aggregateFn(incidents)
  aggregationCache.set(cacheKey, result)

  // Limit cache size (200 entries to accommodate dual-dataset caching)
  if (aggregationCache.size > 200) {
    const firstKey = aggregationCache.keys().next().value
    aggregationCache.delete(firstKey)
  }

  return result
}

/**
 * Clear aggregation cache
 */
export const clearAggregationCache = () => {
  aggregationCache.clear()
}

// ============================================
// GLOBAL CACHE MANAGEMENT
// ============================================

/**
 * Clear all caches
 * Use when data is significantly changed (import, delete, etc.)
 */
export const clearAllCaches = () => {
  contractorCache.clear()
  siteCache.clear()
  textCache.clear()
  classificationCache.clear()
  factorCache.clear()
  chartDataCache.clear()
  aggregationCache.clear()
  clearFilterCache()
}

/**
 * Clear only data-dependent caches (use after import)
 * Keeps normalization caches (contractor, site, text) intact
 */
export const clearDataCaches = () => {
  classificationCache.clear()
  factorCache.clear()
  chartDataCache.clear()
  aggregationCache.clear()
  clearFilterCache()
}

/**
 * Get cache statistics
 * @returns {Object}
 */
export const getCacheStats = () => {
  return {
    contractor: contractorCache.size,
    site: siteCache.size,
    text: textCache.size,
    classification: classificationCache.size,
    factor: factorCache.size,
    chartData: chartDataCache.size,
    aggregation: aggregationCache.size,
    total:
      contractorCache.size +
      siteCache.size +
      textCache.size +
      classificationCache.size +
      factorCache.size +
      chartDataCache.size +
      aggregationCache.size
  }
}

// ============================================
// MEMOIZATION HELPERS
// ============================================

/**
 * Create a memoized version of a function
 * @param {Function} fn - Function to memoize
 * @param {number} maxSize - Maximum cache size
 * @returns {Function}
 */
export const memoize = (fn, maxSize = 100) => {
  const cache = new LRUCache(maxSize)

  return (...args) => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Create a memoized async function
 * @param {Function} asyncFn - Async function to memoize
 * @param {number} maxSize - Maximum cache size
 * @returns {Function}
 */
export const memoizeAsync = (asyncFn, maxSize = 100) => {
  const cache = new LRUCache(maxSize)
  const pending = new Map()

  return async (...args) => {
    const key = JSON.stringify(args)

    // Return cached result
    if (cache.has(key)) {
      return cache.get(key)
    }

    // Return pending promise if same call is in progress
    if (pending.has(key)) {
      return pending.get(key)
    }

    // Execute and cache
    const promise = asyncFn(...args).then(result => {
      cache.set(key, result)
      pending.delete(key)
      return result
    }).catch(error => {
      pending.delete(key)
      throw error
    })

    pending.set(key, promise)
    return promise
  }
}
