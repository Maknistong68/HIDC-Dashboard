/**
 * Simplified Settings Reader Utility
 * Uses hardcoded sensible defaults - no complex settings page needed
 */

import {
  levenshteinSimilarity,
  soundexMatch,
  reporterNameSimilarity,
  enhancedDescriptionSimilarity,
  contractorSimilarity,
  normalizeContractorName
} from './stringMatching'

// Hardcoded sensible defaults
const HARDCODED_SETTINGS = {
  cleanup: {
    text: {
      removeExtraSpaces: true,
      fixLineBreaks: true,
      fixQuotationMarks: true,
      removeUnwantedChars: ['emojis', 'html', 'nonPrintable'],
      capitalization: 'none',
    },
    names: {
      contractor: 'title',
      site: 'title',
      reporter: 'title',
    },
    dates: {
      inputFormat: 'DD/MM/YYYY',
      badDateAction: 'flag',
      allowFutureDates: false,
      validDateRange: {
        enabled: true,
        minYear: 2020,
        maxYear: 2030,
      },
    },
  },
  categorization: {
    enabled: true,
    confidenceLevel: 0.7,
    rules: {
      prioritizeMajorHazards: true,
      useSmartCorrections: true,
      useExclusionRules: true,
    },
  },
  duplicates: {
    enabled: true,
    sensitivity: 0.85,
    mustMatch: ['date', 'contractor', 'description'],
    shouldBeSimilar: ['site', 'reporter'],
    dateFlexibility: 1,
    whenFound: {
      action: 'skip',
      keepVersion: 'latest',
    },
  },
  transform: {
    typeMapping: {
      enabled: true,
      mappings: {
        'Near Hit': 'Near Miss',
        'Near-Miss': 'Near Miss',
        'Unsafe Action': 'Unsafe Act',
        'Unsafe Behavior': 'Unsafe Act',
        'Good Catch': 'Positive Observation',
        'Positive': 'Positive Observation',
        'Safe Act': 'Positive Observation',
        'Hazard': 'Unsafe Condition',
        'First Aid': 'FAC',
        'First Aid Case': 'FAC',
        'Medical Treatment': 'MTI',
        'Lost Time': 'LTI',
        'Lost Time Injury': 'LTI',
      },
    },
    statusMapping: {
      enabled: true,
      mappings: {
        'Pending': 'Open',
        'In Review': 'Open',
        'Under Investigation': 'Open',
        'Resolved': 'Closed',
        'Complete': 'Closed',
        'Done': 'Closed',
      },
    },
  },
}

/**
 * Get current settings (always returns hardcoded defaults)
 */
export const getSettings = () => {
  return HARDCODED_SETTINGS
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
 * Apply text cleanup to a string
 */
export const cleanText = (text, fieldType = 'description') => {
  if (!text || typeof text !== 'string') return text

  let result = text

  // Always trim and collapse multiple spaces
  result = result.trim().replace(/\s+/g, ' ')

  // Fix line breaks
  result = result.replace(/[\r\n]+/g, ' ').trim()

  // Fix quotation marks
  result = result
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")

  // Remove emojis
  result = result.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')

  // Remove HTML tags
  result = result.replace(/<[^>]*>/g, '')

  // Remove non-printable characters
  result = result.replace(/[\x00-\x1F\x7F]/g, '')

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
 * Clean name field (always applies title case normalization)
 */
export const cleanName = (name, fieldType) => {
  if (!name || typeof name !== 'string') return name

  let result = name.trim().replace(/\s+/g, ' ')

  // Always apply title case for names
  result = applyCapitalization(result, 'title')

  return result
}

// ============================================
// DATE VALIDATION FUNCTIONS
// ============================================

/**
 * Check if a date is valid
 */
export const validateDate = (dateStr, parsedDate) => {
  const issues = []

  if (!parsedDate) {
    return { valid: false, issues: ['Invalid date format'], action: 'flag' }
  }

  // Check future dates (not allowed)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const parsed = new Date(parsedDate)
  if (parsed > today) {
    issues.push('Future date not allowed')
  }

  // Check date range (2020-2030)
  const year = parseInt(parsedDate.substring(0, 4))
  if (year < 2020 || year > 2030) {
    issues.push('Date outside valid range (2020-2030)')
  }

  return {
    valid: issues.length === 0,
    issues,
    action: issues.length > 0 ? 'flag' : null
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate a record against required fields
 */
export const validateRecord = (record) => {
  const requiredFields = ['date', 'type', 'description', 'contractor']
  const issues = []

  const fieldMap = {
    date: 'date',
    type: 'type',
    description: 'description',
    contractor: 'contractor',
  }

  requiredFields.forEach(field => {
    const recordField = fieldMap[field] || field
    const value = record[recordField]

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      issues.push(`Missing required field: ${field}`)
    }
  })

  return {
    valid: issues.length === 0,
    issues,
    action: issues.length > 0 ? 'flag' : null
  }
}

/**
 * Calculate quality score for a record
 */
export const calculateRecordQuality = (record) => {
  const weights = { description: 40, categorization: 35, completeness: 25 }
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

  // Categorization quality
  const location = record.location || ''
  const badCategories = ['', 'other', 'others', 'not specified', 'work environment']
  let catScore = badCategories.includes(location.toLowerCase()) ? 30 : 100

  breakdown.categorization = catScore
  score += (catScore * weights.categorization / 100)

  // Completeness
  const fields = ['date', 'type', 'description', 'contractor', 'site', 'reportedBy', 'location']
  const filled = fields.filter(f => record[f] && record[f].toString().trim() !== '').length
  const completenessScore = Math.round((filled / fields.length) * 100)

  breakdown.completeness = completenessScore
  score += (completenessScore * weights.completeness / 100)

  return {
    score: Math.round(score),
    breakdown,
    meetsMinimum: true // Always accept
  }
}

// ============================================
// DUPLICATE DETECTION FUNCTIONS
// ============================================

/**
 * Check if two records are duplicates
 */
export const checkDuplicate = (newRecord, existingRecord) => {
  const threshold = 0.85
  const dateTolerance = 1

  const fieldMap = {
    date: 'date',
    contractor: 'contractor',
    description: 'description',
  }

  // Check date
  const newDate = (newRecord.date || '').toString().trim()
  const existingDate = (existingRecord.date || '').toString().trim()
  const daysDiff = Math.abs(dateDiff(newDate, existingDate))
  if (daysDiff > dateTolerance) {
    return { isDuplicate: false, reason: 'date_mismatch' }
  }

  // Check contractor
  const newContractor = (newRecord.contractor || '').toString().trim()
  const existingContractor = (existingRecord.contractor || '').toString().trim()
  const contractorSim = contractorSimilarity(newContractor, existingContractor)
  if (contractorSim.score < 0.7) {
    return { isDuplicate: false, reason: 'contractor_mismatch' }
  }

  // Check description
  const newDesc = (newRecord.description || '').toString().trim()
  const existingDesc = (existingRecord.description || '').toString().trim()
  const descSimilarity = enhancedDescriptionSimilarity(newDesc, existingDesc)
  if (descSimilarity < threshold) {
    return { isDuplicate: false, reason: 'description_mismatch' }
  }

  return {
    isDuplicate: true,
    similarity: descSimilarity
  }
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
 * Get categorization settings (hardcoded)
 */
export const getCategorizationSettings = () => {
  return {
    enabled: true,
    confidenceLevel: 0.7,
    rules: {
      prioritizeMajorHazards: true,
      useSmartCorrections: true,
      useExclusionRules: true
    }
  }
}

/**
 * Check if confidence meets threshold (always 70%)
 */
export const meetsConfidenceThreshold = (confidence) => {
  return confidence >= 70
}

// ============================================
// TYPE/STATUS MAPPING FUNCTIONS
// ============================================

/**
 * Apply type mapping
 */
export const mapType = (type) => {
  const mappings = HARDCODED_SETTINGS.transform.typeMapping.mappings
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
 * Apply status mapping
 */
export const mapStatus = (status) => {
  const mappings = HARDCODED_SETTINGS.transform.statusMapping.mappings
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
