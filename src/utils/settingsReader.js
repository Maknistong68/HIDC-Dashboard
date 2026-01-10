/**
 * Settings Reader Utility
 * Reads settings from localStorage for use in data processing functions
 */

import { defaultSettings, SETTINGS_STORAGE_KEY, mergeWithDefaults } from './settingsDefaults'
import {
  levenshteinSimilarity,
  soundexMatch,
  reporterNameSimilarity,
  enhancedDescriptionSimilarity,
  contractorSimilarity,
  normalizeContractorName
} from './stringMatching'

/**
 * Get current settings from localStorage (merged with defaults)
 */
export const getSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return mergeWithDefaults(parsed)
    }
  } catch (error) {
    console.error('Error reading settings:', error)
  }
  return defaultSettings
}

/**
 * Get a specific setting value by path
 */
export const getSetting = (path) => {
  const settings = getSettings()
  const keys = path.split('.')
  let value = settings
  for (const key of keys) {
    if (value === undefined || value === null) return undefined
    value = value[key]
  }
  return value
}

// ============================================
// TEXT CLEANUP FUNCTIONS
// ============================================

/**
 * Apply text cleanup settings to a string
 */
export const cleanText = (text, fieldType = 'description') => {
  if (!text || typeof text !== 'string') return text

  const settings = getSettings()
  const cleanup = settings.cleanup?.text || {}
  let result = text

  // Remove extra spaces (trim + collapse multiple spaces)
  if (cleanup.removeExtraSpaces !== false) {
    result = result.trim().replace(/\s+/g, ' ')
  }

  // Fix line breaks
  if (cleanup.fixLineBreaks) {
    result = result.replace(/[\r\n]+/g, ' ').trim()
  }

  // Fix quotation marks
  if (cleanup.fixQuotationMarks !== false) {
    result = result
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
  }

  // Remove unwanted characters
  const charsToRemove = cleanup.removeUnwantedChars || []
  if (charsToRemove.includes('emojis')) {
    // Remove emoji characters
    result = result.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
  }
  if (charsToRemove.includes('html')) {
    result = result.replace(/<[^>]*>/g, '')
  }
  if (charsToRemove.includes('nonPrintable')) {
    result = result.replace(/[\x00-\x1F\x7F]/g, '')
  }

  // Apply capitalization (only for name fields, not descriptions)
  if (fieldType !== 'description') {
    const capitalization = cleanup.capitalization || 'none'
    result = applyCapitalization(result, capitalization)
  }

  return result
}

/**
 * Apply capitalization rule
 */
export const applyCapitalization = (text, rule) => {
  if (!text) return text

  switch (rule) {
    case 'title':
      return text.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    default:
      return text
  }
}

/**
 * Clean name field based on settings
 */
export const cleanName = (name, fieldType) => {
  if (!name || typeof name !== 'string') return name

  const settings = getSettings()
  const nameSettings = settings.cleanup?.names || {}
  let result = name.trim()

  // Get the normalization rule for this field type
  const rule = nameSettings[fieldType] || 'none'

  switch (rule) {
    case 'trim':
      result = result.replace(/\s+/g, ' ')
      break
    case 'title':
      result = result.replace(/\s+/g, ' ')
      result = applyCapitalization(result, 'title')
      break
    case 'upper':
      result = result.replace(/\s+/g, ' ').toUpperCase()
      break
    case 'flipName':
      // Convert "Last, First" to "First Last"
      result = result.replace(/\s+/g, ' ')
      if (result.includes(',')) {
        const parts = result.split(',').map(p => p.trim())
        if (parts.length === 2) {
          result = `${parts[1]} ${parts[0]}`
        }
      }
      result = applyCapitalization(result, 'title')
      break
    case 'fuzzy':
      // Fuzzy matching would require a master list - just clean for now
      result = result.replace(/\s+/g, ' ')
      result = applyCapitalization(result, 'title')
      break
    default:
      // 'none' - no changes
      break
  }

  return result
}

// ============================================
// DATE VALIDATION FUNCTIONS
// ============================================

/**
 * Check if a date is valid according to settings
 */
export const validateDate = (dateStr, parsedDate) => {
  const settings = getSettings()
  const dateSettings = settings.cleanup?.dates || {}
  const issues = []

  if (!parsedDate) {
    return { valid: false, issues: ['Invalid date format'], action: dateSettings.badDateAction || 'flag' }
  }

  // Check future dates
  if (!dateSettings.allowFutureDates) {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const parsed = new Date(parsedDate)
    if (parsed > today) {
      issues.push('Future date not allowed')
    }
  }

  // Check date range
  if (dateSettings.validDateRange?.enabled) {
    const year = parseInt(parsedDate.substring(0, 4))
    const minYear = dateSettings.validDateRange.minYear || 2020
    const maxYear = dateSettings.validDateRange.maxYear || 2030
    if (year < minYear || year > maxYear) {
      issues.push(`Date outside valid range (${minYear}-${maxYear})`)
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    action: issues.length > 0 ? (dateSettings.badDateAction || 'flag') : null
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate a record against required fields settings
 */
export const validateRecord = (record) => {
  const settings = getSettings()
  const validation = settings.validation || {}
  const requiredFields = validation.requiredFields || ['date', 'type', 'description', 'contractor']
  const defaults = validation.defaultValues || {}

  const issues = []
  const appliedDefaults = {}

  // Field mappings from settings to record properties
  const fieldMap = {
    date: 'date',
    type: 'type',
    description: 'description',
    contractor: 'contractor',
    site: 'site',
    reporter: 'reportedBy',
    status: 'actionStatus'
  }

  requiredFields.forEach(field => {
    const recordField = fieldMap[field] || field
    const value = record[recordField]

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      if (validation.whenMissing === 'useDefault' && defaults[field]) {
        appliedDefaults[recordField] = defaults[field]
      } else {
        issues.push(`Missing required field: ${field}`)
      }
    }
  })

  return {
    valid: issues.length === 0 || validation.whenMissing === 'useDefault',
    issues,
    appliedDefaults,
    action: issues.length > 0 ? (validation.whenMissing || 'flag') : null
  }
}

/**
 * Calculate quality score for a record based on settings
 */
export const calculateRecordQuality = (record) => {
  const settings = getSettings()
  const qualitySettings = settings.validation?.qualityScoring || {}

  if (!qualitySettings.enabled) {
    return { score: 100, breakdown: {} }
  }

  const weights = qualitySettings.weights || { description: 40, categorization: 35, completeness: 25 }
  let score = 0
  const breakdown = {}

  // Description quality (based on word count)
  const description = record.description || ''
  const wordCount = description.trim().split(/\s+/).filter(w => w.length > 0).length
  let descScore = 0
  if (wordCount >= 20) descScore = 100
  else if (wordCount >= 15) descScore = 80
  else if (wordCount >= 10) descScore = 60
  else if (wordCount >= 5) descScore = 40
  else descScore = 20

  breakdown.description = descScore
  score += (descScore * weights.description / 100)

  // Categorization quality (has proper category, not blank/other)
  const location = record.location || ''
  const badCategories = ['', 'other', 'others', 'not specified', 'work environment']
  let catScore = badCategories.includes(location.toLowerCase()) ? 30 : 100

  breakdown.categorization = catScore
  score += (catScore * weights.categorization / 100)

  // Completeness (how many fields are filled)
  const fields = ['date', 'type', 'description', 'contractor', 'site', 'reportedBy', 'location']
  const filled = fields.filter(f => record[f] && record[f].toString().trim() !== '').length
  const completenessScore = Math.round((filled / fields.length) * 100)

  breakdown.completeness = completenessScore
  score += (completenessScore * weights.completeness / 100)

  return {
    score: Math.round(score),
    breakdown,
    meetsMinimum: score >= (qualitySettings.minQualityToImport || 0)
  }
}

// ============================================
// DUPLICATE DETECTION FUNCTIONS
// ============================================

/**
 * Check if two records are duplicates based on settings
 * Enhanced with phonetic matching (Soundex) and Levenshtein distance
 */
export const checkDuplicate = (newRecord, existingRecord) => {
  const settings = getSettings()
  const dupSettings = settings.duplicates || {}

  if (!dupSettings.enabled) {
    return { isDuplicate: false }
  }

  const mustMatch = dupSettings.mustMatch || ['date', 'contractor', 'description']
  const shouldBeSimilar = dupSettings.shouldBeSimilar || ['site', 'reporter']
  const dateTolerance = dupSettings.dateFlexibility || 1
  const threshold = dupSettings.sensitivity || 0.85

  // Field mappings
  const fieldMap = {
    date: 'date',
    contractor: 'contractor',
    site: 'site',
    description: 'description',
    reporter: 'reportedBy',
    type: 'type'
  }

  // Track matching details for debugging
  const matchDetails = {}

  // Check must-match fields
  for (const field of mustMatch) {
    const recordField = fieldMap[field] || field
    const newVal = (newRecord[recordField] || '').toString().trim()
    const existingVal = (existingRecord[recordField] || '').toString().trim()

    if (field === 'date') {
      // Date comparison with tolerance
      const daysDiff = Math.abs(dateDiff(newVal, existingVal))
      matchDetails.date = { daysDiff, tolerance: dateTolerance }
      if (daysDiff > dateTolerance) {
        return { isDuplicate: false, reason: 'date_mismatch', details: matchDetails }
      }
    } else if (field === 'description') {
      // Enhanced description similarity with Levenshtein + Jaccard
      const similarity = enhancedDescriptionSimilarity(newVal, existingVal)
      matchDetails.description = { similarity, threshold }
      if (similarity < threshold) {
        return { isDuplicate: false, reason: 'description_mismatch', details: matchDetails }
      }
    } else if (field === 'contractor') {
      // Enhanced contractor matching with normalization and phonetic matching
      const similarity = contractorSimilarity(newVal, existingVal)
      matchDetails.contractor = similarity
      // Use lower threshold for contractor (0.7) since names vary more
      if (similarity.score < 0.7) {
        return { isDuplicate: false, reason: 'contractor_mismatch', details: matchDetails }
      }
    } else if (field === 'reporter') {
      // Enhanced reporter name matching with phonetic support
      const similarity = reporterNameSimilarity(newVal, existingVal)
      matchDetails.reporter = { similarity }
      if (similarity < 0.7) {
        return { isDuplicate: false, reason: 'reporter_mismatch', details: matchDetails }
      }
    } else {
      // Standard comparison with Levenshtein for typo tolerance
      const levSim = levenshteinSimilarity(newVal.toLowerCase(), existingVal.toLowerCase())
      matchDetails[field] = { similarity: levSim }
      // If not an exact match, check if phonetically similar or high Levenshtein
      if (newVal.toLowerCase() !== existingVal.toLowerCase() && levSim < 0.8) {
        // Also try Soundex for single-word fields
        if (!soundexMatch(newVal, existingVal)) {
          return { isDuplicate: false, reason: `${field}_mismatch`, details: matchDetails }
        }
      }
    }
  }

  // All must-match fields match - calculate overall similarity
  let similarityScore = 1.0

  for (const field of shouldBeSimilar) {
    const recordField = fieldMap[field] || field
    const newVal = (newRecord[recordField] || '').toString().trim()
    const existingVal = (existingRecord[recordField] || '').toString().trim()

    if (newVal && existingVal) {
      let sim
      if (field === 'reporter') {
        // Use enhanced reporter matching
        sim = reporterNameSimilarity(newVal, existingVal)
      } else if (field === 'site' || field === 'contractor') {
        // Use contractor similarity (works for site names too)
        const result = contractorSimilarity(newVal, existingVal)
        sim = result.score
      } else {
        // Standard Levenshtein similarity
        sim = levenshteinSimilarity(newVal.toLowerCase(), existingVal.toLowerCase())
      }
      matchDetails[`similar_${field}`] = { similarity: sim }
      similarityScore *= sim
    }
  }

  return {
    isDuplicate: true,
    similarity: similarityScore,
    action: dupSettings.whenFound?.action || 'flag',
    keepVersion: dupSettings.whenFound?.keepVersion || 'latest',
    matchDetails
  }
}

/**
 * Calculate similarity between two strings (Jaccard similarity)
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 1

  const set1 = new Set(str1.split(/\s+/))
  const set2 = new Set(str2.split(/\s+/))

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * Calculate date difference in days
 */
const dateDiff = (date1, date2) => {
  try {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return Math.round((d1 - d2) / (1000 * 60 * 60 * 24))
  } catch {
    return Infinity
  }
}

// ============================================
// CATEGORIZATION SETTINGS
// ============================================

/**
 * Get categorization settings
 */
export const getCategorizationSettings = () => {
  const settings = getSettings()
  return settings.categorization || {
    enabled: true,
    confidenceLevel: 0.7,
    whenUnsure: 'flag',
    multipleMatches: 'highest',
    rules: {
      prioritizeMajorHazards: true,
      useSmartCorrections: true,
      useExclusionRules: true
    }
  }
}

/**
 * Check if confidence meets threshold
 */
export const meetsConfidenceThreshold = (confidence) => {
  const settings = getCategorizationSettings()
  const threshold = (settings.confidenceLevel || 0.7) * 100
  return confidence >= threshold
}

// ============================================
// TYPE/STATUS MAPPING FUNCTIONS
// ============================================

/**
 * Apply type mapping from settings
 */
export const mapType = (type) => {
  const settings = getSettings()
  const typeMapping = settings.transform?.typeMapping || {}

  if (!typeMapping.enabled) return type

  const mappings = typeMapping.mappings || {}
  const mapped = mappings[type]

  if (mapped) return mapped

  // Check case-insensitive
  const typeLower = (type || '').toLowerCase()
  for (const [key, value] of Object.entries(mappings)) {
    if (key.toLowerCase() === typeLower) {
      return value
    }
  }

  return type
}

/**
 * Apply status mapping from settings
 */
export const mapStatus = (status) => {
  const settings = getSettings()
  const statusMapping = settings.transform?.statusMapping || {}

  if (!statusMapping.enabled) return status

  const mappings = statusMapping.mappings || {}
  const mapped = mappings[status]

  if (mapped) return mapped

  // Check case-insensitive
  const statusLower = (status || '').toLowerCase()
  for (const [key, value] of Object.entries(mappings)) {
    if (key.toLowerCase() === statusLower) {
      return value
    }
  }

  return status
}
