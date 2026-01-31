import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import {
  HAZARD_PATTERNS,
  HAZARD_CATEGORIES,
  HAZARD_PHRASES,
  CATEGORY_PRIORITY,
  HAZARD_EXCLUSIONS,
  CONTEXT_REDIRECTS,
  MAJOR_HAZARDS,
  FALLBACK_CATEGORY,
  checkCriticalKeywords
} from './constants'
import { analyzeObservation } from './contextClassifier'
import {
  parseSentence,
  extractWeightedKeywords,
  analyzeForRootCause,
  GRAMMATICAL_WEIGHTS
} from './sentenceParser'
import {
  getSettings,
  cleanText,
  cleanName,
  validateDate,
  validateRecord,
  calculateRecordQuality,
  checkDuplicate,
  meetsConfidenceThreshold,
  mapType,
  mapStatus
} from './settingsReader'
import {
  findSimilarContractors,
  suggestContractorConsolidations,
  autoNormalizeContractor,
  normalizeContractorName
} from './stringMatching'

// ============================================
// CONTRACTOR NAME NORMALIZATION
// ============================================

/**
 * Analyze contractors in import data and find similar names
 * Returns normalization suggestions and auto-normalized names
 */
export const analyzeContractorNames = (newContractors, existingContractors = []) => {
  const suggestions = []
  const normalizations = new Map()

  // Get unique contractors from new data
  const uniqueNew = [...new Set(newContractors.filter(c => c && c.trim()))]

  // Get unique contractors from existing data
  const uniqueExisting = [...new Set(existingContractors.filter(c => c && c.trim()))]

  // For each new contractor, check if similar to existing
  for (const contractor of uniqueNew) {
    // Skip if empty
    if (!contractor || !contractor.trim()) continue

    // Find similar contractors in existing data
    const similarExisting = findSimilarContractors(contractor, uniqueExisting, 0.75)

    if (similarExisting.length > 0) {
      const best = similarExisting[0]
      suggestions.push({
        original: contractor,
        suggestedMatch: best.name,
        similarity: best.similarity,
        method: best.method,
        source: 'existing'
      })
      // Auto-normalize to existing name if high confidence
      if (best.similarity >= 0.85) {
        normalizations.set(contractor, best.name)
      }
    }
  }

  // Find consolidation opportunities within new data
  const withinNewConsolidations = suggestContractorConsolidations(uniqueNew, 0.8)

  for (const group of withinNewConsolidations) {
    for (const similar of group.similar) {
      suggestions.push({
        original: similar.name,
        suggestedMatch: group.suggestedName,
        similarity: similar.similarity,
        method: similar.method,
        source: 'within_import'
      })
      // Auto-normalize to suggested name
      if (similar.similarity >= 0.85) {
        normalizations.set(similar.name, group.suggestedName)
      }
    }
  }

  return {
    suggestions,
    normalizations,
    uniqueNew,
    uniqueExisting
  }
}

/**
 * Get all unique contractor names from incidents
 */
export const getExistingContractors = (incidents) => {
  if (!incidents || !Array.isArray(incidents)) return []
  return [...new Set(incidents.map(i => i.contractor).filter(c => c && c.trim()))]
}

/**
 * Get all unique site names from incidents
 */
export const getExistingSites = (incidents) => {
  if (!incidents || !Array.isArray(incidents)) return []
  return [...new Set(incidents.map(i => i.site).filter(s => s && s.trim()))]
}

// ============================================
// NEOM EXCEL FORMAT - STRICT VALIDATION
// ============================================

// Required NEOM columns (can be in any order)
export const NEOM_REQUIRED_COLUMNS = [
  'Event ID',
  'Type',
  'Classification',
  'Event Date',
  'Event Description',
  'Approval',
  'Approval Process Requirements',
  'Reported by',
  'Significant Hazard'
]

/**
 * Validate Excel has NEOM format (columns can be in any order)
 * Returns { valid: boolean, missing: string[] }
 */
export const validateNEOMFormat = (headers) => {
  const normalizedHeaders = headers.map(h => h?.toString().toLowerCase().trim())
  const missing = NEOM_REQUIRED_COLUMNS.filter(col =>
    !normalizedHeaders.includes(col.toLowerCase())
  )
  return { valid: missing.length === 0, missing }
}

/**
 * Auto-map NEOM columns by header name (not position)
 * Returns column index mappings for transformRows
 */
export const mapNEOMColumns = (headers) => {
  const mappings = {}
  const normalizedHeaders = headers.map(h => h?.toString().toLowerCase().trim())

  // DEBUG: Log headers to diagnose mapping issues
  console.log('[mapNEOMColumns] Normalized headers:', normalizedHeaders)

  // Map NEOM header names to internal field names
  const columnMap = {
    'event id': 'eventId',
    'type': 'type',
    'classification': 'classification',
    'event date': 'date',
    'event description': 'description',
    'approval': 'status',
    'approval process requirements': 'approvalStatus',
    'reported by': 'reportedBy',
    'significant hazard': 'hazardCategory',
    'contractor': 'contractor',
    'site': 'site',
    'level': 'level'
  }

  // First pass: exact matching
  Object.entries(columnMap).forEach(([header, field]) => {
    const index = normalizedHeaders.indexOf(header)
    if (index !== -1) mappings[field] = index
  })

  // Second pass: substring matching for unmapped fields
  Object.entries(columnMap).forEach(([header, field]) => {
    if (mappings[field] !== undefined) return // Already mapped

    // Find header that contains our keyword or vice versa
    const index = normalizedHeaders.findIndex(h =>
      h.includes(header) || header.includes(h)
    )
    if (index !== -1 && !Object.values(mappings).includes(index)) {
      mappings[field] = index
      console.log(`[mapNEOMColumns] Substring match: "${header}" found in column ${index}`)
    }
  })

  console.log('[mapNEOMColumns] Final mappings:', mappings)
  return mappings
}

/**
 * Normalize header for matching - removes special chars, spaces, lowercases
 */
const normalizeHeader = (h) => {
  if (!h) return ''
  return h.toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
}

// Expected column mappings - normalized variations
export const EXPECTED_COLUMNS = {
  eventId: ['eventid', 'id', 'reference', 'ref', 'no', 'number', 'recordid', 'observationid', 'incidentid'],
  type: ['type', 'observationtype', 'eventtype', 'category', 'obstype', 'incidenttype'],
  classification: ['classification', 'class', 'subtype', 'subcategory', 'subclass'],
  date: ['eventdate', 'date', 'observationdate', 'createddate', 'dateofobservation', 'datetime', 'incidentdate', 'dateraised'],
  time: ['time', 'eventtime', 'observationtime', 'createdtime', 'timeofday', 'hourtime'],
  description: ['eventdescription', 'description', 'details', 'observation', 'findings', 'comments', 'notes', 'summary', 'observationdetails'],
  status: ['approval', 'status', 'state', 'actionstatus', 'approvalstatus', 'currentstatus', 'closurestatus'],
  reportedBy: ['reportedby', 'reporter', 'submittedby', 'createdby', 'observer', 'raisedby', 'observername', 'name', 'person'],
  hazardCategory: ['significanthazard', 'hazardcategory', 'hazardtype', 'riskcategory', 'hazard', 'risktype', 'hazardclassification'],
  // Two separate filters - each maps to its own column only
  contractor: ['contractor'],  // Only 'contractor' column
  site: ['site'],  // Only 'site' column
  company: ['company', 'companies', 'project', 'projectname', 'location', 'client', 'clientname', 'organization', 'org', 'entity', 'businessunit', 'bu', 'division', 'department', 'dept', 'region', 'area', 'areaname', 'facility', 'plant', 'branch', 'worksite', 'vendor', 'vendorname', 'subcontractor'],
}

// Classification mappings to dashboard types
export const CLASSIFICATION_MAPPING = {
  // Direct mappings
  'Unsafe Condition': { type: 'incident', incidentType: 'unsafe-condition' },
  'Unsafe Act': { type: 'incident', incidentType: 'unsafe-act' },
  'Near Miss': { type: 'incident', incidentType: 'near-miss' },
  'Positive Observation': { type: 'incident', incidentType: 'positive' },
  'Positive': { type: 'incident', incidentType: 'positive' },
  'Good Practice': { type: 'incident', incidentType: 'positive' },
  'Best Practice': { type: 'incident', incidentType: 'positive' },
  'Safe Behavior': { type: 'incident', incidentType: 'positive' },

  // Type-based mappings - Incident (all case variations)
  'Incident': { type: 'incident', incidentType: 'fac' },
  'incident': { type: 'incident', incidentType: 'fac' },
  'INCIDENT': { type: 'incident', incidentType: 'fac' },

  // Hazard Identification
  'Hazard Identification': { type: 'incident', incidentType: 'unsafe-condition' },
  'Hazard identification': { type: 'incident', incidentType: 'unsafe-condition' },
  'hazard identification': { type: 'incident', incidentType: 'unsafe-condition' },

  // LTI/MTI/FAC variations
  'LTI': { type: 'incident', incidentType: 'lti' },
  'lti': { type: 'incident', incidentType: 'lti' },
  'Lost Time Injury': { type: 'incident', incidentType: 'lti' },
  'MTI': { type: 'incident', incidentType: 'mti' },
  'mti': { type: 'incident', incidentType: 'mti' },
  'Medical Treatment Injury': { type: 'incident', incidentType: 'mti' },
  'FAC': { type: 'incident', incidentType: 'fac' },
  'fac': { type: 'incident', incidentType: 'fac' },
  'First Aid': { type: 'incident', incidentType: 'fac' },
  'First Aid Case': { type: 'incident', incidentType: 'fac' },

  // Non-Conformance (NCR) - separate category
  'Non-Conformance': { type: 'incident', incidentType: 'ncr' },
  'NCR': { type: 'incident', incidentType: 'ncr' },
  'Non Conformance': { type: 'incident', incidentType: 'ncr' },
  'Nonconformance': { type: 'incident', incidentType: 'ncr' },

  // Leadership Event - proactive safety engagement
  'Leadership Event': { type: 'incident', incidentType: 'leadership' },
  'Leadership': { type: 'incident', incidentType: 'leadership' },
  'Management Visit': { type: 'incident', incidentType: 'leadership' },
  'Safety Walk': { type: 'incident', incidentType: 'leadership' },
  'Safety Tour': { type: 'incident', incidentType: 'leadership' },

  // "Others" - will be auto-classified by keywords
  'To Be Determined': { type: 'unknown', needsMapping: true },
  'Safety': { type: 'unknown', needsMapping: true },
  'Other': { type: 'unknown', needsMapping: true },
  'Others': { type: 'unknown', needsMapping: true },
}

// Keyword patterns for auto-classification of "Others"
export const KEYWORD_PATTERNS = {
  'positive': {
    keywords: [
      'good practice', 'best practice', 'well done', 'excellent', 'positive',
      'commend', 'praise', 'proper use', 'correct procedure', 'safe behavior',
      'good example', 'compliant', 'followed procedure', 'wearing ppe correctly'
    ],
    priority: 0 // Check first
  },
  'near-miss': {
    keywords: [
      'almost', 'nearly', 'close call', 'narrowly', 'near miss', 'near-miss',
      'could have', 'potential injury', 'lucky', 'fortunate', 'avoided',
      'near hit', 'close shave', 'narrow escape', 'just missed', 'barely'
    ],
    priority: 1
  },
  'unsafe-act': {
    keywords: [
      'no helmet', 'no gloves', 'no goggles', 'no harness', 'no safety', 'no ppe',
      'without helmet', 'without gloves', 'without harness', 'without ppe',
      'not wearing', 'missing ppe', 'improper ppe', 'ppe violation',
      'removed helmet', 'removed gloves', 'removed harness',
      'running', 'horseplay', 'shortcut', 'bypassing', 'bypassed',
      'ignoring', 'ignored', 'not following', 'failed to', 'failure to',
      'smoking', 'using phone', 'mobile phone', 'distracted', 'inattention',
      'unsafe manner', 'improper use', 'misuse', 'wrong tool',
      'unauthorized', 'unqualified', 'untrained', 'not trained',
      'not authorized', 'working alone', 'skipped', 'skipping',
      'did not', 'didn\'t', 'no permit', 'without permit'
    ],
    priority: 2
  },
  'unsafe-condition': {
    keywords: [
      'scaffold', 'scaffolding', 'excavation', 'trench', 'edge protection',
      'fall protection', 'guardrail', 'handrail', 'barrier', 'barricade',
      'unprotected edge', 'open hole', 'opening', 'unguarded', 'unstable',
      'unsecured', 'loose', 'missing cover', 'no cover',
      'debris', 'clutter', 'cluttered', 'obstruction', 'obstructed',
      'blocked', 'spill', 'spillage', 'wet floor', 'slippery', 'slip hazard',
      'trip hazard', 'tripping', 'messy', 'poor housekeeping', 'housekeeping',
      'material storage', 'improper storage', 'stacking',
      'faulty', 'damaged', 'defective', 'broken', 'malfunctioning',
      'exposed wire', 'electrical hazard', 'no grounding', 'worn out',
      'corroded', 'corrosion', 'leaking', 'leak', 'cracked', 'bent',
      'missing guard', 'no guard', 'deficient',
      'poor lighting', 'insufficient lighting', 'dark', 'no light',
      'ventilation', 'poor ventilation', 'heat stress', 'excessive noise',
      'dust', 'fumes', 'gas leak', 'confined space', 'toxic',
      'hazard', 'hazardous', 'unsafe condition', 'condition', 'risk',
      'found', 'observed', 'identified', 'noticed', 'detected'
    ],
    priority: 3
  }
}

/**
 * Classify a description using keyword analysis
 */
export const classifyByKeywords = (description, hazardCategory = '') => {
  const textToAnalyze = `${description} ${hazardCategory}`.toLowerCase()

  const sortedPatterns = Object.entries(KEYWORD_PATTERNS)
    .sort((a, b) => a[1].priority - b[1].priority)

  for (const [incidentType, config] of sortedPatterns) {
    for (const keyword of config.keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        return incidentType
      }
    }
  }

  return 'unsafe-condition'
}

/**
 * Normalize hazard category to match one of 30 approved categories
 * (13 Major + 17 Sub-Significant hazards)
 * This handles variations in naming from imported data
 */
export const normalizeHazardCategory = (category) => {
  if (!category || category.trim() === '') return null

  const normalized = category.trim().toLowerCase()

  // Direct match check (case-insensitive)
  for (const approved of HAZARD_CATEGORIES) {
    if (approved.toLowerCase() === normalized) {
      return approved
    }
  }

  // Fuzzy match - check if the category contains key parts of approved names
  const fuzzyMappings = {
    'confined': 'Confined Spaces',
    'electrical': 'Energized System',
    'energi': 'Energized System',
    'mobile plant': 'Mobile Plant & Equipment',
    'plant': 'Mobile Plant & Equipment',
    'equipment': 'Mobile Plant & Equipment',
    'excavation': 'Breaking Ground & Excavation',
    'trench': 'Breaking Ground & Excavation',
    'digging': 'Breaking Ground & Excavation',
    'fire': 'Fire',
    'hot work': 'Hot Work',
    'welding': 'Hot Work',
    'lifting': 'Lifting',
    'crane': 'Lifting',
    'hoist': 'Lifting',
    'scaffold': 'Temporary Works',
    'temporary': 'Temporary Works',
    'formwork': 'Temporary Works',
    'live road': 'Working on or Near Live Roads',
    'highway': 'Working on or Near Live Roads',
    'roadwork': 'Working on or Near Live Roads',
    'driving': 'Driving',
    'vehicle': 'Driving',
    'height': 'Working at Height',
    'fall': 'Working at Height',
    'ladder': 'Working at Height',
    'coshh': 'COSHH',
    'chemical': 'COSHH',
    'hazardous substance': 'COSHH',
    'housekeeping': 'Housekeeping',
    'clean': 'Housekeeping',
    'tidy': 'Housekeeping',
    'security': 'Site Security',
    'tool': 'Tools',
    'traffic': 'Traffic Management',
    'pedestrian': 'Traffic Management',
    'environment': 'General Site Issues',
    'weather': 'General Site Issues',
    'lighting': 'General Site Issues',
    'heat': 'Working in Heat',
    'hot surface': 'Working in Heat',
    'thermal': 'Working in Heat',
    'working on heat': 'Working in Heat',
    'working in heat': 'Working in Heat',
    'working in the heat': 'Working in Heat',
    'water': 'Working on or Near Water',
    'marine': 'Working on or Near Water',
    'drowning': 'Working on or Near Water',

    // Excel variations - map to standard names
    'work at height': 'Working at Height',
    'working at heights': 'Working at Height',
    'work at heights': 'Working at Height',
    'breaking ground & excavations': 'Breaking Ground & Excavation',
    'excavations': 'Breaking Ground & Excavation',
    'energised system': 'Energized System',
    'energised systems': 'Energized System',
    'energized systems': 'Energized System',
    'hot works': 'Hot Work',
    'hotwork': 'Hot Work',
    'hotworks': 'Hot Work',

    // ============================================================
    // BACKWARD COMPATIBILITY MAPPINGS (legacy → new category names)
    // ============================================================

    // Physical Hazard (replaces 'Struck By')
    'struck by': 'Physical Hazard',
    'struck-by': 'Physical Hazard',
    'falling objects': 'Physical Hazard',
    'falling object': 'Physical Hazard',
    'dropped object': 'Physical Hazard',
    'impalement': 'Physical Hazard',
    'sharp object': 'Physical Hazard',
    'protruding rebar': 'Physical Hazard',
    'physical hazard': 'Physical Hazard',
    'struck': 'Physical Hazard',

    // Mechanical Hazard (NEW)
    'caught in': 'Mechanical Hazard',
    'caught-in': 'Mechanical Hazard',
    'caught in between': 'Mechanical Hazard',
    'caught between': 'Mechanical Hazard',
    'caught-between': 'Mechanical Hazard',
    'pinch point': 'Mechanical Hazard',
    'crushing': 'Mechanical Hazard',
    'machinery': 'Mechanical Hazard',
    'mechanical hazard': 'Mechanical Hazard',
    'entanglement': 'Mechanical Hazard',
    'amputation': 'Mechanical Hazard',

    // Slip and Trip (replaces 'Slips Trips Falls')
    'slip and trip': 'Slip and Trip',
    'slips trips falls': 'Slip and Trip',  // backward compat
    'slip trip fall': 'Slip and Trip',
    'slips trips and falls': 'Slip and Trip',
    'slip trip': 'Slip and Trip',
    'slip': 'Slip and Trip',
    'trip': 'Slip and Trip',

    // Worker Welfare (replaces 'Site Welfare')
    'site welfare': 'Worker Welfare',       // backward compat
    'worker welfare': 'Worker Welfare',
    'welfare': 'Worker Welfare',
    'camp': 'Worker Welfare',
    'camps': 'Worker Welfare',
    'accommodation': 'Worker Welfare',
    'toilet': 'Worker Welfare',
    'canteen': 'Worker Welfare',
    'dormitory': 'Worker Welfare',

    // Respiratory Hazard (replaces 'Dust Control')
    'dust control': 'Respiratory Hazard',   // backward compat
    'respiratory hazard': 'Respiratory Hazard',
    'dust': 'Respiratory Hazard',
    'silica': 'Respiratory Hazard',
    'fumes': 'Respiratory Hazard',
    'respiratory': 'Respiratory Hazard',
    'inhalation': 'Respiratory Hazard',
    'airborne': 'Respiratory Hazard',

    // Access (updated - slip/trip moved to Slip and Trip)
    'access': 'Access',
    'egress': 'Access',

    // Legacy fallbacks
    'manual handling': 'Lifting',
    'general safety': 'General Site Issues',
    'general': 'General Site Issues',
    'other': 'General Site Issues',
    'others': 'General Site Issues',
    'unclassified': 'General Site Issues',  // backward compat
    'not specified': null,
  }

  for (const [key, value] of Object.entries(fuzzyMappings)) {
    if (normalized.includes(key)) {
      return value
    }
  }

  return null // Return null if no match found - will trigger description-based classification
}

/**
 * Check if text contains any exclusion term for a category
 * Returns true if the text should be EXCLUDED from matching this category
 * Exclusion rules are always enabled (hardcoded default)
 */
const isExcludedTerm = (text, category) => {
  const exclusions = HAZARD_EXCLUSIONS[category] || []
  return exclusions.some(exclusion => text.includes(exclusion.toLowerCase()))
}

/**
 * Verify if description actually supports a given category
 * Returns true if description contains at least one keyword/phrase for the category
 * This prevents trusting incorrect source categories from Excel
 */
const descriptionSupportsCategory = (text, category) => {
  if (!text || !category) return false

  // Check if any phrase matches
  const phrases = HAZARD_PHRASES[category] || []
  for (const phrase of phrases) {
    if (text.includes(phrase.toLowerCase())) {
      return true
    }
  }

  // Check if any keyword matches
  const keywords = HAZARD_PATTERNS[category] || []
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      return true
    }
  }

  return false
}

// Export for use in data quality checking
export { descriptionSupportsCategory }

/**
 * Strip reference text from observation - only keep the MAIN observation
 * Removes text after "Ref:", "Reference:", "NEOM-", "REF:", etc.
 * This prevents keywords in policy quotes from affecting classification
 */
const stripReferenceText = (text) => {
  if (!text) return ''

  // Common reference markers
  const refMarkers = [
    /\bref:\s*/gi,
    /\breference:\s*/gi,
    /\bneom[\s-]+(phsas|hsas|nev)/gi,
    /\bsuggested ideas?\s*:/gi,
    /\bsuggestion:\s*/gi,
    /\bnote:\s*/gi,
    /\baction required:\s*/gi,
  ]

  let mainText = text.toLowerCase()

  // Find the earliest reference marker and cut there
  let earliestCut = mainText.length
  for (const marker of refMarkers) {
    const match = mainText.match(marker)
    if (match && match.index < earliestCut) {
      earliestCut = match.index
    }
  }

  // Return only the main observation text (before references)
  return mainText.substring(0, earliestCut).trim()
}

/**
 * Check for context redirects - terms that should redirect to a different category
 * Returns the redirect category if found, null otherwise
 */
const checkContextRedirects = (text) => {
  // Sort redirects by length (longest first) to match most specific phrases first
  const sortedRedirects = Object.entries(CONTEXT_REDIRECTS)
    .sort((a, b) => b[0].length - a[0].length)

  for (const [phrase, category] of sortedRedirects) {
    if (text.includes(phrase.toLowerCase())) {
      return category
    }
  }
  return null
}

/**
 * Sentence-Aware Classification
 * Uses grammatical structure to weight keywords based on their role:
 * - SUBJECT (weight 1.0): Main problem/hazard - highest priority
 * - OBJECT (weight 0.7): Equipment/material involved
 * - ACTOR (weight 0.6): Person involved (for context)
 * - LOCATION (weight 0.4): Where it happened - lower priority
 *
 * Example: "poor housekeeping on welfare"
 * - "housekeeping" is SUBJECT (weight 1.0) → Housekeeping
 * - "welfare" is LOCATION (weight 0.4) → Worker Welfare
 * Result: Housekeeping wins due to higher weight
 */
const classifyWithSentenceAwareness = (text) => {
  if (!text || text.length < 5) {
    return { category: null, confidence: 0, isMainSubject: false }
  }

  // Parse the sentence to extract components
  const parsed = parseSentence(text)
  const matches = []

  // Check each keyword part against hazard patterns
  for (const kwPart of parsed.keywords) {
    const partText = kwPart.text.toLowerCase()

    // Check against all hazard patterns
    for (const category of CATEGORY_PRIORITY) {
      const patterns = HAZARD_PATTERNS[category] || []
      const phrases = HAZARD_PHRASES[category] || []

      // Check phrases first (more specific)
      for (const phrase of phrases) {
        if (partText.includes(phrase.toLowerCase())) {
          matches.push({
            keyword: phrase,
            category,
            role: kwPart.role,
            weight: kwPart.weight,
            confidence: parsed.confidence * kwPart.weight,
            isMainSubject: kwPart.role === 'SUBJECT',
            isLocation: kwPart.role === 'LOCATION',
            matchType: 'phrase'
          })
        }
      }

      // Check keywords
      for (const keyword of patterns) {
        if (partText.includes(keyword.toLowerCase())) {
          matches.push({
            keyword,
            category,
            role: kwPart.role,
            weight: kwPart.weight,
            confidence: parsed.confidence * kwPart.weight,
            isMainSubject: kwPart.role === 'SUBJECT',
            isLocation: kwPart.role === 'LOCATION',
            matchType: 'keyword'
          })
        }
      }
    }
  }

  if (matches.length === 0) {
    return { category: null, confidence: 0, isMainSubject: false, parsed }
  }

  // Sort by confidence (weight * parsing confidence), prefer phrases
  matches.sort((a, b) => {
    // Prefer phrases over keywords
    if (a.matchType === 'phrase' && b.matchType !== 'phrase') return -1
    if (b.matchType === 'phrase' && a.matchType !== 'phrase') return 1
    // Then by confidence
    return b.confidence - a.confidence
  })

  const bestMatch = matches[0]

  // Check for conflicts (multiple categories with similar confidence)
  const hasConflict = matches.length > 1 &&
    matches[0].category !== matches[1].category &&
    Math.abs(matches[0].confidence - matches[1].confidence) < 0.2

  // If conflict, prefer SUBJECT over LOCATION
  if (hasConflict) {
    const subjectMatch = matches.find(m => m.isMainSubject)
    if (subjectMatch) {
      return {
        category: subjectMatch.category,
        confidence: subjectMatch.confidence,
        isMainSubject: true,
        keyword: subjectMatch.keyword,
        role: subjectMatch.role,
        alternativeCategory: matches.find(m => m !== subjectMatch)?.category,
        reason: `Subject "${subjectMatch.keyword}" takes priority over location`,
        parsed
      }
    }

    // Prefer non-location match
    const nonLocationMatch = matches.find(m => !m.isLocation)
    if (nonLocationMatch) {
      return {
        category: nonLocationMatch.category,
        confidence: nonLocationMatch.confidence,
        isMainSubject: nonLocationMatch.isMainSubject,
        keyword: nonLocationMatch.keyword,
        role: nonLocationMatch.role,
        alternativeCategory: matches.find(m => m.isLocation)?.category,
        reason: `"${nonLocationMatch.keyword}" takes priority over location keyword`,
        parsed
      }
    }
  }

  return {
    category: bestMatch.category,
    confidence: bestMatch.confidence,
    isMainSubject: bestMatch.isMainSubject,
    keyword: bestMatch.keyword,
    role: bestMatch.role,
    reason: `Matched "${bestMatch.keyword}" with role ${bestMatch.role}`,
    parsed,
    actor: parsed.actor,
    object: parsed.object,
    action: parsed.action,
    location: parsed.location
  }
}

// Export for use in other modules
export { classifyWithSentenceAwareness }

/**
 * Get full sentence analysis for an observation
 * Returns WHO, WHAT, WHERE, WHY breakdown plus hazard classification
 * Useful for UI display and root cause investigation
 */
export const getObservationAnalysis = (description) => {
  if (!description) {
    return null
  }

  const text = description.toLowerCase()

  // Get sentence parsing
  const parsed = parseSentence(description)

  // Get root cause analysis
  const rootCause = analyzeForRootCause(description)

  // Get classification with sentence awareness
  const classification = classifyWithSentenceAwareness(text)

  // Get final hazard category
  const hazardCategory = categorizeHazard(description)

  return {
    // Sentence breakdown
    who: {
      actor: parsed.actor,
      actorType: parsed.actorType,
    },
    what: {
      object: parsed.object,
      objectType: parsed.objectType,
      action: parsed.action,
      actionType: parsed.actionType,
    },
    where: {
      location: parsed.location,
    },
    why: {
      cause: parsed.cause || rootCause.immediateCause,
      deviation: rootCause.deviation,
    },

    // Classification result
    classification: {
      category: hazardCategory,
      confidence: classification.confidence,
      matchedKeyword: classification.keyword,
      keywordRole: classification.role,
      isMainSubject: classification.isMainSubject,
      alternativeCategory: classification.alternativeCategory,
    },

    // Root cause components
    rootCause: {
      deviation: rootCause.deviation,
      deviationConfidence: rootCause.deviationConfidence,
      immediateCause: rootCause.immediateCause,
      consequence: rootCause.consequence,
      affectedItem: rootCause.affectedItem,
    },

    // All extracted keywords with weights
    keywords: parsed.keywords,

    // Parsing metadata
    pattern: parsed.pattern,
    overallConfidence: parsed.confidence,
  }
}

/**
 * 8-Step Context-Aware Hazard Classification System
 *
 * Classification Modes (controlled by import options):
 * - trust-excel: Use Excel category if valid, classify blanks/invalid
 * - reclassify-all: Ignore Excel categories, always use description
 * - fill-blanks: Keep any Excel category, only classify truly empty ones
 *
 * STEP 0: Context-Aware Analysis (object → action → outcome)
 * STEP 0.5: Sentence-Aware Parsing (grammatical role weighting)
 * STEP 1: Check CONTEXT_REDIRECTS first (highest priority)
 * STEP 2: Trust Excel category if valid (respecting exclusions) - mode dependent
 * STEP 3: Check PHRASES for MAJOR hazards (13 significant hazards)
 * STEP 4: Check PHRASES for SUB-SIGNIFICANT hazards (17 lower priority)
 * STEP 5: Check KEYWORDS for MAJOR hazards (with exclusion checking)
 * STEP 6: Check KEYWORDS for SUB-SIGNIFICANT hazards (with exclusion checking)
 * STEP 7: Default fallback → "General Site Issues" (never "Others")
 *
 * FULLY AUTOMATED - No manual review required
 */
export const categorizeHazard = (description, existingCategory = '', mode = 'trust-excel') => {
  const text = (description || '').toLowerCase()

  // Get categorization settings - use hardcoded defaults for simplified flow
  const confidenceThreshold = 70 // Hardcoded 70% confidence threshold

  // Strip reference text (after "Ref:", "Reference:", "NEOM-", etc.) - only classify MAIN observation
  const mainText = stripReferenceText(text)

  // ============================================
  // MODE: fill-blanks - Only classify if blank, "Other", or "Not Specified"
  // Keep manual categories that are meaningful
  // ============================================
  const trimmedCategory = (existingCategory || '').trim().toLowerCase()
  const isBlank = !trimmedCategory
  const isOther = trimmedCategory === 'other' || trimmedCategory === 'others'
  const isGeneric = isBlank || isOther ||
    trimmedCategory === 'general' ||
    trimmedCategory === 'not specified' ||
    trimmedCategory === 'n/a'

  // Helper: Check if category is allowed when source was "Other"
  // "Other" means the category was generic/unclassified - ALLOW reclassification to Major Hazards
  // This ensures safety-critical observations get properly identified based on description
  const isAllowedForOtherSource = (category) => {
    // Always allow reclassification - "Other" source should enable better classification
    return true
  }

  if (mode === 'fill-blanks') {
    if (!isGeneric) {
      // Preserve manual selection - normalize but don't reclassify
      const normalized = normalizeHazardCategory(existingCategory)
      return normalized || existingCategory.trim()
    }
    // Fall through to description-based classification
  }

  // ============================================
  // MODE: reclassify-all - Always use description
  // Skip ALL Excel category trust logic
  // ============================================
  // (When mode is reclassify-all, we skip the "trust Excel" step below)

  // DEBUG: Check for misclassification issues
  const isDebugTarget = mainText.includes('safety officer') || mainText.includes('scaffold') || mainText.includes('excavat') || mainText.includes('msds') || mainText.includes('chemical')
  if (isDebugTarget) {
    console.log('[DEBUG categorizeHazard] Input:', { description: description?.substring(0, 80), mainText: mainText?.substring(0, 80) })
  }

  // ============================================
  // STEP 0: CRITICAL HAZARD KEYWORDS (ABSOLUTE PRIORITY)
  // These ALWAYS win over location/context words
  // Checks for life-threatening hazards, chemicals, supervision issues, permits
  // NOTE: If source was "Other", skip Significant Hazards
  // ============================================
  const criticalCategory = checkCriticalKeywords(mainText)
  if (criticalCategory && isAllowedForOtherSource(criticalCategory)) {
    if (isDebugTarget) console.log('[DEBUG] STEP 0 CRITICAL_KEYWORD hit:', criticalCategory)
    return criticalCategory
  }

  // ============================================
  // STEP 1: Check CONTEXT_REDIRECTS (HIGH PRIORITY)
  // Handles misleading terms like "line of fire", "fire extinguisher", etc.
  // Smart corrections are always enabled (hardcoded default)
  // NOTE: If source was "Other", skip Significant Hazards
  // ============================================
  const redirectCategory = checkContextRedirects(mainText)
  if (redirectCategory && isAllowedForOtherSource(redirectCategory)) {
    if (isDebugTarget) console.log('[DEBUG] STEP 1 CONTEXT_REDIRECT hit:', redirectCategory)
    return redirectCategory // Immediate return - no further checking
  }

  // ============================================
  // STEP 2: ENSEMBLE VOTING SYSTEM (PRIMARY CLASSIFICATION)
  // Uses 4 independent strategies that vote on the category:
  // 1. KEYWORD: Object/action/outcome matching
  // 2. SENTENCE: WHO/WHAT/WHERE/HOW analysis
  // 3. CLEAN TEXT: Strip noise, re-classify
  // 4. CONTROL-LINK: Link control issues to hazards
  // ============================================
  const contextResult = analyzeObservation(description, existingCategory)

  // Use voting result if:
  // 1. High confidence (shouldOverride) - 85%+ or disambiguation match
  // 2. OR has valid votes and category is not fallback
  // 3. OR controlLink strategy found a hazard context (control + hazard)
  const hasValidVotingResult = contextResult.category &&
    contextResult.category !== FALLBACK_CATEGORY &&
    contextResult.validVoteCount > 0

  const controlLinkFound = contextResult.votes?.controlLink?.category &&
    contextResult.votes?.controlLink?.category !== FALLBACK_CATEGORY &&
    contextResult.votes?.controlLink?.isControlIssue

  // NOTE: All STEP 2 returns check isAllowedForOtherSource - if source was "Other", skip Significant Hazards
  if (contextResult.shouldOverride && contextResult.confidence >= confidenceThreshold && isAllowedForOtherSource(contextResult.category)) {
    if (isDebugTarget) console.log('[DEBUG] STEP 2a analyzeObservation shouldOverride:', contextResult.category, contextResult.confidence)
    return contextResult.category
  }

  // If controlLink strategy found a specific hazard, use it (control issues linked to hazards)
  if (controlLinkFound && contextResult.votes.controlLink.confidence >= 70 && isAllowedForOtherSource(contextResult.votes.controlLink.category)) {
    if (isDebugTarget) console.log('[DEBUG] STEP 2b controlLink found:', contextResult.votes.controlLink.category)
    return contextResult.votes.controlLink.category
  }

  // If voting found a valid category with any consensus, prefer it over keyword matching
  if (hasValidVotingResult && contextResult.confidence >= 50 && isAllowedForOtherSource(contextResult.category)) {
    if (isDebugTarget) console.log('[DEBUG] STEP 2c voting consensus:', contextResult.category, contextResult.consensusLevel)
    return contextResult.category
  }

  // ============================================
  // STEP 3: SENTENCE-AWARE PARSING (FALLBACK)
  // Analyzes grammatical structure to identify:
  // - WHO (actor), WHAT (object), WHERE (location), WHY (cause)
  // - Assigns weights based on grammatical role (subject > object > location)
  // ============================================
  const sentenceResult = classifyWithSentenceAwareness(text)

  // If sentence parsing found a high-confidence match with clear subject, use it
  // NOTE: Check isAllowedForOtherSource - if source was "Other", skip Significant Hazards
  if (sentenceResult.category && sentenceResult.confidence >= 0.7 && sentenceResult.isMainSubject) {
    // Verify the category is valid and not excluded
    if (HAZARD_CATEGORIES.includes(sentenceResult.category) && !isExcludedTerm(text, sentenceResult.category) && isAllowedForOtherSource(sentenceResult.category)) {
      if (isDebugTarget) console.log('[DEBUG] STEP 3 sentenceAwareness hit:', sentenceResult.category)
      return sentenceResult.category
    }
  }

  // ============================================
  // STEP 2: Validate Excel category against description
  // Trust the Excel source category unless:
  // - It's explicitly excluded by the description (contradiction)
  // - The description clearly indicates a DIFFERENT major hazard
  // NOTE: This step is SKIPPED when mode is 'reclassify-all'
  // ============================================
  if (mode === 'trust-excel' && existingCategory && existingCategory.trim() !== '') {
    const normalized = normalizeHazardCategory(existingCategory)
    if (normalized && normalized !== FALLBACK_CATEGORY) {
      // Check if this category is explicitly excluded by the description
      if (isExcludedTerm(text, normalized)) {
        // Description contradicts the Excel category - fall through to description-based
      } else if (MAJOR_HAZARDS.includes(normalized)) {
        // For MAJOR hazards from Excel:
        // Trust the source unless description EXPLICITLY supports a DIFFERENT major hazard
        // This prevents "Energised Systems" being changed to "General Site Issues" when description is empty

        // Check if description clearly indicates a different major hazard
        let descriptionSupportsDifferentMajor = false
        if (text && text.length > 10) { // Only check if there's meaningful description
          for (const otherCategory of MAJOR_HAZARDS) {
            if (otherCategory === normalized) continue // Skip the current category
            if (descriptionSupportsCategory(text, otherCategory) && !isExcludedTerm(text, otherCategory)) {
              descriptionSupportsDifferentMajor = true
              break
            }
          }
        }

        // Trust Excel category unless description clearly contradicts it
        if (!descriptionSupportsDifferentMajor) {
          return normalized
        }
        // Description supports a different major hazard - fall through to description-based
      } else {
        // For Sub-Significant hazards, trust source if not excluded
        return normalized
      }
    }
  }

  // No valid category from Excel - classify by description
  if (!text) return FALLBACK_CATEGORY

  // ============================================
  // STEP 3: Check PHRASES for MAJOR hazards first (13 significant)
  // NOTE: Skip entirely if source was "Other" - respect that classification
  // ============================================
  if (!isOther) {
    for (const category of MAJOR_HAZARDS) {
      if (isExcludedTerm(text, category)) continue // Skip if excluded

      const phrases = HAZARD_PHRASES[category] || []
      for (const phrase of phrases) {
        if (text.includes(phrase.toLowerCase())) {
          return category // Phrase match wins immediately
        }
      }
    }
  }

  // ============================================
  // STEP 4: Check PHRASES for SUB-SIGNIFICANT hazards (17 lower priority)
  // ============================================
  for (const category of CATEGORY_PRIORITY) {
    if (MAJOR_HAZARDS.includes(category)) continue // Already checked
    if (isExcludedTerm(text, category)) continue // Skip if excluded

    const phrases = HAZARD_PHRASES[category] || []
    for (const phrase of phrases) {
      if (text.includes(phrase.toLowerCase())) {
        return category // Phrase match wins immediately
      }
    }
  }

  // ============================================
  // STEP 5: Check KEYWORDS for MAJOR hazards (with exclusion checking)
  // NOTE: Skip entirely if source was "Other" - respect that classification
  // ============================================
  if (!isOther) {
    for (const category of MAJOR_HAZARDS) {
      if (isExcludedTerm(text, category)) continue // Skip if excluded

      const keywords = HAZARD_PATTERNS[category] || []
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return category // First keyword match wins
        }
      }
    }
  }

  // ============================================
  // STEP 6: Check KEYWORDS for SUB-SIGNIFICANT hazards
  // ============================================
  for (const category of CATEGORY_PRIORITY) {
    if (MAJOR_HAZARDS.includes(category)) continue // Already checked
    if (isExcludedTerm(text, category)) continue // Skip if excluded

    const keywords = HAZARD_PATTERNS[category] || []
    for (const keyword of keywords) {
      // Skip very short generic words for generic categories
      const categoryIndex = CATEGORY_PRIORITY.indexOf(category)
      if (keyword.length <= 4 && categoryIndex >= 20) {
        continue // Skip short words for generic categories
      }

      if (text.includes(keyword.toLowerCase())) {
        return category // First keyword match wins
      }
    }
  }

  // ============================================
  // STEP 7: DEFAULT fallback → General Site Issues (never "Others")
  // ============================================
  return FALLBACK_CATEGORY
}

// Status mapping
export const STATUS_MAPPING = {
  'Closed': 'closed',
  'Contractor Review': 'open',
  'Review': 'open',
  'Contractor Investigation': 'in-progress',
  'Open': 'open',
  'In Progress': 'in-progress',
  'Pending': 'open',
  'Complete': 'closed',
  'Completed': 'closed',
  'Done': 'closed',
  'Resolved': 'closed',
}

/**
 * Detect header row by scoring each row against expected column names
 * Returns the row index that most likely contains headers
 */
const detectHeaderRow = (rows, maxRowsToCheck = 15) => {
  const allExpectedNames = Object.values(EXPECTED_COLUMNS).flat()
  let bestRowIndex = 0
  let bestScore = 0

  const rowsToCheck = Math.min(rows.length, maxRowsToCheck)

  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i]
    if (!row || !Array.isArray(row)) continue

    let score = 0
    let nonEmptyCells = 0

    row.forEach(cell => {
      if (cell !== null && cell !== undefined && cell !== '') {
        nonEmptyCells++
        const normalized = normalizeHeader(String(cell))

        // Check if cell matches any expected column name
        if (allExpectedNames.some(name => {
          const normalizedName = normalizeHeader(name)
          return normalized.includes(normalizedName) || normalizedName.includes(normalized)
        })) {
          score += 2  // Direct match
        }

        // Check for common header keywords
        const headerKeywords = ['id', 'date', 'type', 'name', 'status', 'description', 'hazard', 'observation', 'reporter', 'classification']
        if (headerKeywords.some(kw => normalized.includes(kw))) {
          score += 1
        }
      }
    })

    // Prefer rows with more non-empty cells (likely to be headers, not titles)
    // But penalize rows with too few cells
    if (nonEmptyCells >= 3 && score > bestScore) {
      bestScore = score
      bestRowIndex = i
    }
  }

  return bestRowIndex
}

/**
 * Parse Excel file and return raw data
 * Auto-detects header row even if not on first row
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd'
        })

        if (jsonData.length < 2) {
          reject(new Error('Excel file is empty or has no data rows'))
          return
        }

        // Auto-detect header row (might not be row 0)
        const headerRowIndex = detectHeaderRow(jsonData)
        const headers = jsonData[headerRowIndex]
        const rows = jsonData.slice(headerRowIndex + 1).filter(row =>
          row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
        )

        resolve({
          sheetName,
          headers,
          rows,
          totalRows: rows.length,
          headerRowIndex,  // Include this for debugging/display
        })
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + error.message))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Calculate similarity between two strings (for fuzzy matching)
 */
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  if (s1 === s2) return 1
  if (s1.includes(s2) || s2.includes(s1)) return 0.9

  // Simple character overlap
  const set1 = new Set(s1.split(''))
  const set2 = new Set(s2.split(''))
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * Auto-detect column mappings based on headers (improved version)
 */
export const autoDetectColumns = (headers, rows = []) => {
  const mappings = {}
  const normalizedHeaders = headers.map(h => normalizeHeader(h))

  // First pass: exact/substring matching with normalized headers
  Object.entries(EXPECTED_COLUMNS).forEach(([field, possibleNames]) => {
    const index = normalizedHeaders.findIndex(h =>
      possibleNames.some(name => {
        const normalizedName = normalizeHeader(name)
        return h.includes(normalizedName) || normalizedName.includes(h)
      })
    )
    if (index !== -1) {
      mappings[field] = index
    }
  })

  // Second pass: fuzzy matching for unmapped fields
  Object.entries(EXPECTED_COLUMNS).forEach(([field, possibleNames]) => {
    if (mappings[field] !== undefined) return // Already mapped

    let bestMatch = { index: -1, score: 0 }

    normalizedHeaders.forEach((h, index) => {
      // Skip if this column is already mapped
      if (Object.values(mappings).includes(index)) return

      possibleNames.forEach(name => {
        const normalizedName = normalizeHeader(name)
        const similarity = calculateSimilarity(h, normalizedName)
        if (similarity > 0.7 && similarity > bestMatch.score) {
          bestMatch = { index, score: similarity }
        }
      })
    })

    if (bestMatch.index !== -1) {
      mappings[field] = bestMatch.index
    }
  })

  // Third pass: content-based detection for still unmapped fields
  if (rows.length > 0) {
    const unmappedFields = Object.keys(EXPECTED_COLUMNS).filter(f => mappings[f] === undefined)

    unmappedFields.forEach(field => {
      const unmappedCols = headers.map((_, i) => i).filter(i => !Object.values(mappings).includes(i))

      for (const colIndex of unmappedCols) {
        const samples = rows.slice(0, 10).map(row => row[colIndex]).filter(Boolean)

        if (samples.length === 0) continue

        // Detect by content patterns
        if (field === 'date') {
          const datePattern = /^\d{4}[-/]\d{2}[-/]\d{2}|^\d{2}[-/]\d{2}[-/]\d{4}/
          if (samples.every(s => datePattern.test(String(s)) || !isNaN(Date.parse(String(s))))) {
            mappings[field] = colIndex
            break
          }
        }

        if (field === 'eventId') {
          // Short alphanumeric codes
          if (samples.every(s => String(s).length < 20 && /^[A-Z0-9-]+$/i.test(String(s)))) {
            mappings[field] = colIndex
            break
          }
        }

        if (field === 'description') {
          // Long text fields
          const avgLength = samples.reduce((sum, s) => sum + String(s).length, 0) / samples.length
          if (avgLength > 50) {
            mappings[field] = colIndex
            break
          }
        }
      }
    })
  }

  return mappings
}

/**
 * Check if text indicates a positive observation
 */
const isPositiveObservation = (type, classification, description) => {
  const positiveKeywords = ['positive', 'good practice', 'best practice', 'well done', 'excellent', 'commend', 'safe behavior']
  const textToCheck = `${type} ${classification} ${description}`.toLowerCase()

  return positiveKeywords.some(keyword => textToCheck.includes(keyword))
}

/**
 * Transform Excel rows to dashboard format
 * Note: Maximum 2000 rows are processed (source system limitation - rows beyond 2000 are typically footer/warnings)
 *
 * @param {Array} rows - Excel data rows
 * @param {Array} headers - Column headers
 * @param {Object} columnMappings - Column index mappings
 * @param {string} projectId - Project ID to assign
 * @param {Array} existingIncidents - Optional existing incidents for contractor normalization
 * @param {Object} importOptions - Import options including classificationMode
 */
const MAX_DATA_ROWS = 2000

export const transformRows = (rows, headers, columnMappings, projectId, existingIncidents = [], importOptions = {}) => {
  // DEBUG: Log detected column mappings
  console.log('[Import] Column mappings:', JSON.stringify(columnMappings, null, 2))
  console.log('[Import] Classification column index:', columnMappings['classification'])

  // Get classification mode from import options (default: trust-excel)
  const classificationMode = importOptions.classificationMode || 'trust-excel'
  // Get fileId from import options if provided (for IndexedDB file tracking)
  const fileId = importOptions.fileId || null
  const incidents = []
  const needsMapping = []
  const warnings = {
    dateIssues: [],
    hazardIssues: [],
    contractorNormalizations: [], // NEW: Track contractor name normalizations
    rowLimitApplied: false,
  }
  const today = format(new Date(), 'yyyy-MM-dd')

  // Get existing contractor names for normalization
  const existingContractors = getExistingContractors(existingIncidents)
  const existingSites = getExistingSites(existingIncidents)

  // Limit to MAX_DATA_ROWS to exclude footer/warning rows from source system
  const dataRows = rows.slice(0, MAX_DATA_ROWS)
  if (rows.length > MAX_DATA_ROWS) {
    warnings.rowLimitApplied = true
    console.log(`Import limited to ${MAX_DATA_ROWS} rows (${rows.length - MAX_DATA_ROWS} footer/warning rows excluded)`)
  }

  // Get current settings for processing
  const settings = getSettings()

  dataRows.forEach((row, index) => {
    const getValue = (field) => {
      const colIndex = columnMappings[field]
      return colIndex !== undefined ? row[colIndex] : null
    }

    const eventId = getValue('eventId') || `imported-${Date.now()}-${index}`
    const rawType = getValue('type') || ''
    const classification = (getValue('classification') || '').toString().trim()

    // DEBUG: Comprehensive classification tracing
    const rawClassValue = getValue('classification')
    console.log(`[Import] Row ${index + 1}: rawClassValue="${rawClassValue}" (type: ${typeof rawClassValue})`)
    console.log(`[Import] Row ${index + 1}: classification after trim="${classification}" (length: ${classification.length})`)
    if (classification) {
      // Check for hidden characters
      const charCodes = [...classification].map(c => c.charCodeAt(0))
      console.log(`[Import] Row ${index + 1}: charCodes=[${charCodes.join(',')}]`)
    }

    // DEBUG: Log when Type column contains "Incident"
    if (rawType && rawType.toString().toLowerCase().trim() === 'incident') {
      console.log(`[Import] Row ${index + 1}: Type="${rawType}" detected as Incident → will map to FAC`)
    }
    const dateValue = getValue('date')
    const timeValue = getValue('time') // Dedicated time column
    const rawDescription = getValue('description') || ''
    const rawStatus = getValue('status') || 'Open'
    const rawReportedBy = getValue('reportedBy') || 'Unknown'
    const rawHazardCategory = getValue('hazardCategory') || ''
    // Two separate filters - each from its own column only
    const rawContractor = getValue('contractor') || ''  // Only from 'contractor' column
    const rawSite = getValue('site') || ''  // Only from 'site' column
    const company = getValue('company') || ''  // For backwards compatibility

    // ============================================
    // APPLY SETTINGS-BASED CLEANUP
    // ============================================

    // Clean description text
    const description = cleanText(rawDescription, 'description')

    // Clean and normalize names based on settings
    const reportedBy = cleanName(rawReportedBy, 'reporter') || 'Unknown'

    // Enhanced contractor normalization with fuzzy matching
    let contractor = cleanName(rawContractor, 'contractor')
    let contractorWasNormalized = false
    let originalContractor = contractor

    if (contractor && existingContractors.length > 0) {
      const normResult = autoNormalizeContractor(contractor, existingContractors, 0.85)
      if (normResult.wasNormalized && normResult.normalized !== contractor) {
        originalContractor = contractor
        contractor = normResult.normalized
        contractorWasNormalized = true
        warnings.contractorNormalizations.push({
          row: index + 2,
          original: originalContractor,
          normalized: contractor,
          similarity: normResult.similarity,
          method: normResult.method,
          eventId
        })
      }
    }

    // Enhanced site normalization with fuzzy matching
    let site = cleanName(rawSite, 'site')
    let siteWasNormalized = false
    let originalSite = site

    if (site && existingSites.length > 0) {
      const normResult = autoNormalizeContractor(site, existingSites, 0.85)
      if (normResult.wasNormalized && normResult.normalized !== site) {
        originalSite = site
        site = normResult.normalized
        siteWasNormalized = true
        // Add to contractor normalizations (same structure works for sites)
        warnings.contractorNormalizations.push({
          row: index + 2,
          original: originalSite,
          normalized: site,
          similarity: normResult.similarity,
          method: normResult.method,
          eventId,
          fieldType: 'site'
        })
      }
    }

    // Apply type mapping from settings
    const type = mapType(rawType) || rawType

    // Apply status mapping from settings
    const status = mapStatus(rawStatus) || rawStatus

    // Always categorize using the new 29-category system (eliminates "Others")
    // Pass existing category for normalization, falls back to description-based classification
    const hazardCategory = categorizeHazard(description, rawHazardCategory, classificationMode)

    // Track hazard auto-classification (when original was blank or generic like "Other")
    const genericHazards = ['other', 'others', 'general', 'general safety', 'not specified', '']
    const wasAutoClassified = !rawHazardCategory ||
      genericHazards.includes(rawHazardCategory.toLowerCase().trim())

    // Data Quality Tracking
    // Determine if hazard category came from Excel or was auto-classified
    const normalizedExcelCategory = normalizeHazardCategory(rawHazardCategory)
    const hazardCategorySource = (!rawHazardCategory || wasAutoClassified || hazardCategory !== normalizedExcelCategory)
      ? 'auto-classified'
      : 'excel'

    // Check if description actually supports the assigned category
    const descriptionText = (description || '').toLowerCase()
    const hazardCategoryValidated = descriptionSupportsCategory(descriptionText, hazardCategory)

    // Detect potential data quality issues
    let dataQualityIssue = null
    const hasDescription = description && description.trim().length > 10 &&
      !description.toLowerCase().includes('no description provided')

    if (hazardCategorySource === 'excel' && !hazardCategoryValidated) {
      if (!hasDescription) {
        // No description to validate - not an error, just missing data
        dataQualityIssue = null // No issue - we trust the Excel category
      } else {
        // Excel had a category but description doesn't support it - potential mismatch
        dataQualityIssue = `Source category "${rawHazardCategory}" could not be verified against description keywords.`
      }
    } else if (hazardCategorySource === 'auto-classified' && wasAutoClassified && rawHazardCategory) {
      // Original was generic like "Other" - auto-classified based on description
      dataQualityIssue = `Original category "${rawHazardCategory}" was generic. Auto-classified as "${hazardCategory}" based on description keywords.`
    }

    // Context-Aware Analysis - stores reasoning and confidence for UI display
    const contextAnalysis = analyzeObservation(description, rawHazardCategory)

    if (wasAutoClassified && hazardCategory !== FALLBACK_CATEGORY) {
      warnings.hazardIssues.push({
        row: index + 2,
        original: rawHazardCategory || '(blank)',
        autoClassified: hazardCategory,
        eventId,
      })
    }

    // Parse date - handles DD/MM/YYYY HH:MM (European) and other formats
    // Also extracts time separately for hour-of-day analysis
    let parsedDate
    let eventTime = null // Store time as "HH:MM" for hour analysis
    let dateFellBack = false

    // First, check for dedicated time column (highest priority)
    if (timeValue) {
      if (typeof timeValue === 'string') {
        const timeMatch = timeValue.trim().match(/(\d{1,2}):(\d{2})/)
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10)
          const minutes = parseInt(timeMatch[2], 10)
          if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            eventTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
          }
        }
      } else if (typeof timeValue === 'number') {
        // Excel time serial (fractional day, e.g., 0.5 = 12:00 noon)
        // Handle both pure time serials (0-1) and datetime serials
        const fractionalPart = timeValue % 1
        const totalMinutes = Math.round(fractionalPart * 24 * 60)
        const hours = Math.floor(totalMinutes / 60) % 24
        const minutes = totalMinutes % 60
        eventTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }
    }

    try {
      if (dateValue instanceof Date) {
        parsedDate = format(dateValue, 'yyyy-MM-dd')
        // Extract time from Date object (only if not already set from time column)
        if (!eventTime) {
          const hours = dateValue.getHours()
          const minutes = dateValue.getMinutes()
          if (hours !== 0 || minutes !== 0) {
            eventTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
          }
        }
      } else if (typeof dateValue === 'string') {
        const cleaned = dateValue.trim()

        // Extract time from string (HH:MM format anywhere in string) - only if not already set
        if (!eventTime) {
          const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})/)
          if (timeMatch) {
            const hours = parseInt(timeMatch[1])
            const minutes = parseInt(timeMatch[2])
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
              eventTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
            }
          }
        }

        // Try DD/MM/YYYY format first (European - most common in this data)
        const ddmmMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
        if (ddmmMatch) {
          const day = parseInt(ddmmMatch[1])
          const month = parseInt(ddmmMatch[2])
          const year = parseInt(ddmmMatch[3])
          // Validate: day 1-31, month 1-12
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
            // Format directly to avoid timezone issues
            parsedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          }
        }

        // Try YYYY-MM-DD (ISO format) if not already parsed
        if (!parsedDate) {
          const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/)
          if (isoMatch) {
            parsedDate = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
          }
        }

        // Fallback to native Date parsing
        if (!parsedDate) {
          const date = new Date(cleaned)
          if (isNaN(date.getTime())) {
            parsedDate = today
            dateFellBack = true
          } else {
            parsedDate = format(date, 'yyyy-MM-dd')
          }
        }
      } else if (typeof dateValue === 'number') {
        // Excel serial date (includes fractional day for time)
        // Excel epoch is Dec 30, 1899, Unix epoch is Jan 1, 1970
        // Difference is 25569 days
        const totalDays = dateValue - 25569
        const wholeDays = Math.floor(totalDays)
        const fractionalDay = totalDays - wholeDays
        // Use UTC to avoid timezone issues - construct date directly
        const utcDate = new Date(Date.UTC(1970, 0, 1 + wholeDays))
        parsedDate = utcDate.toISOString().split('T')[0]
        // Extract time from fractional day (only if not already set from time column)
        if (!eventTime && fractionalDay > 0) {
          const totalMinutes = Math.round(fractionalDay * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          eventTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        }
      } else {
        parsedDate = today
        dateFellBack = true
      }
    } catch {
      parsedDate = today
      dateFellBack = true
    }

    // Track date parsing issues
    if (dateFellBack && dateValue) {
      warnings.dateIssues.push({
        row: index + 2, // +1 for header, +1 for 1-based
        original: String(dateValue),
        parsedAs: parsedDate,
        eventId,
      })
    }

    // Map status
    const actionStatus = STATUS_MAPPING[status] || STATUS_MAPPING[status?.trim()] || 'open'

    // Check for positive observation first (from both type AND classification)
    if (isPositiveObservation(type, classification, description)) {
      incidents.push({
        externalId: eventId,
        projectId,
        fileId, // Link to source file for file management
        date: parsedDate,
        eventTime, // Store time separately for hour-of-day analysis
        type: 'positive',
        description,
        location: hazardCategory,
        contractor,
        site,
        company,
        rootCause: 'Positive observation',
        correctiveAction: 'N/A - Positive observation',
        actionDueDate: parsedDate,
        actionStatus: 'closed',
        approvalStatus: 'Closed', // Positive observations are always closed
        reportedBy,
        originalClassification: classification,
        originalType: type,
        autoClassified: false,
        // Data Quality fields
        originalHazardCategory: rawHazardCategory || null,
        hazardCategorySource,
        hazardCategoryValidated,
        dataQualityIssue,
        // Context-Aware Classification Analysis (Ensemble Voting System)
        contextAnalysis: {
          hazardObject: contextAnalysis.hazardObject,
          hazardObjects: contextAnalysis.hazardObjects,
          action: contextAnalysis.action,
          actionType: contextAnalysis.actionType,
          potentialOutcome: contextAnalysis.potentialOutcome,
          outcomeSource: contextAnalysis.outcomeSource,
          confidence: contextAnalysis.confidence,
          consensusLevel: contextAnalysis.consensusLevel,
          reasoning: contextAnalysis.reasoning,
          subHazard: contextAnalysis.subHazard,
          // Voting details
          votes: contextAnalysis.votes,
          voteCounts: contextAnalysis.voteCounts,
          dissent: contextAnalysis.dissent,
          tiebreaker: contextAnalysis.tiebreaker,
          needsReview: contextAnalysis.needsReview
        }
      })
      return
    }

    // Helper to find mapping case-insensitively
    const findMapping = (value) => {
      if (!value) return null
      const normalized = value.trim()
      // Try exact match first
      if (CLASSIFICATION_MAPPING[normalized]) return CLASSIFICATION_MAPPING[normalized]
      // Try case-insensitive match
      const key = Object.keys(CLASSIFICATION_MAPPING).find(
        k => k.toLowerCase() === normalized.toLowerCase()
      )
      return key ? CLASSIFICATION_MAPPING[key] : null
    }

    // Determine type mapping (case-insensitive lookup)
    // PRIORITY: Check Type column first for "Incident", then Classification
    let mapping = null

    // PRIORITY: Classification column takes precedence over Type column
    // Check Classification first for specific values (Unsafe Act, Unsafe Condition, etc.)
    let classMapping = findMapping(classification)
    const typeMapping = findMapping(type)

    // DEBUG: Log mapping lookup results
    console.log(`[Import] Row ${index + 1}: findMapping("${classification}") =`, classMapping)
    console.log(`[Import] Row ${index + 1}: findMapping("${type}") =`, typeMapping)

    // FALLBACK: Direct case-insensitive match if findMapping failed
    if (!classMapping && classification) {
      const lowerClass = classification.toLowerCase()
      if (lowerClass === 'unsafe act') {
        classMapping = { type: 'incident', incidentType: 'unsafe-act' }
        console.log(`[Import] Row ${index + 1}: Direct match for "Unsafe Act" → unsafe-act`)
      } else if (lowerClass === 'unsafe condition') {
        classMapping = { type: 'incident', incidentType: 'unsafe-condition' }
        console.log(`[Import] Row ${index + 1}: Direct match for "Unsafe Condition" → unsafe-condition`)
      } else if (lowerClass === 'near miss') {
        classMapping = { type: 'incident', incidentType: 'near-miss' }
        console.log(`[Import] Row ${index + 1}: Direct match for "Near Miss" → near-miss`)
      } else if (lowerClass === 'positive observation' || lowerClass === 'positive') {
        classMapping = { type: 'incident', incidentType: 'positive' }
        console.log(`[Import] Row ${index + 1}: Direct match for "Positive" → positive`)
      }
    }

    // Classification takes priority when it has a specific (non-generic) mapping
    if (classMapping && !classMapping.needsMapping) {
      mapping = classMapping
      console.log(`[Import] Row ${index + 1}: Using Classification mapping → ${classMapping.incidentType}`)
    } else if (typeMapping && !typeMapping.needsMapping) {
      // Type column has a valid mapping
      mapping = typeMapping
    } else {
      // Fallback: If Type column is exactly "Incident" (case-insensitive), map to FAC
      const normalizedType = (type || '').toString().toLowerCase().trim()
      if (normalizedType === 'incident') {
        mapping = { type: 'incident', incidentType: 'fac', autoClassified: false }
        console.log(`[Import] Row ${index + 1}: Type="${type}" → Fallback mapping to FAC`)
      } else {
        // Try any available mapping
        mapping = typeMapping || classMapping
      }
    }

    // Auto-classify using keyword analysis only if no valid mapping found
    if (!mapping || mapping.needsMapping) {
      const autoClassifiedType = classifyByKeywords(description, hazardCategory)
      mapping = { type: 'incident', incidentType: autoClassifiedType, autoClassified: true }
    }

    // DEBUG: Log final mapping result
    console.log(`[Import] Row ${index + 1}: FINAL type="${mapping.incidentType}" (autoClassified: ${mapping.autoClassified || false})`)

    incidents.push({
      externalId: eventId,
      projectId,
      fileId, // Link to source file for file management
      date: parsedDate,
      eventTime, // Store time separately for hour-of-day analysis
      type: mapping.incidentType,
      description,
      location: hazardCategory,
      contractor,
      site,
      company,
      rootCause: 'Imported from Excel',
      correctiveAction: 'Review required',
      actionDueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      actionStatus,
      approvalStatus: status?.trim() || 'Open', // Preserve original approval status
      reportedBy,
      originalClassification: classification,
      originalType: type,
      autoClassified: mapping.autoClassified || false,
      // Data Quality fields
      originalHazardCategory: rawHazardCategory || null,
      hazardCategorySource,
      hazardCategoryValidated,
      dataQualityIssue,
      // Context-Aware Classification Analysis (Ensemble Voting System)
      contextAnalysis: {
        hazardObject: contextAnalysis.hazardObject,
        hazardObjects: contextAnalysis.hazardObjects,
        action: contextAnalysis.action,
        actionType: contextAnalysis.actionType,
        potentialOutcome: contextAnalysis.potentialOutcome,
        outcomeSource: contextAnalysis.outcomeSource,
        confidence: contextAnalysis.confidence,
        consensusLevel: contextAnalysis.consensusLevel,
        reasoning: contextAnalysis.reasoning,
        subHazard: contextAnalysis.subHazard,
        // Voting details
        votes: contextAnalysis.votes,
        voteCounts: contextAnalysis.voteCounts,
        dissent: contextAnalysis.dissent,
        tiebreaker: contextAnalysis.tiebreaker,
        needsReview: contextAnalysis.needsReview
      }
    })
  })

  return { incidents, needsMapping, warnings }
}

/**
 * Check for duplicates against existing data
 * Simplified - uses import options for duplicate handling
 *
 * @param {Array} newItems - New items to check
 * @param {Array} existingItems - Existing items to check against
 * @param {string} matchField - Field to match on (default: externalId)
 * @param {string} duplicateHandling - How to handle duplicates: 'skip' | 'update' | 'allow'
 */
export const checkDuplicates = (newItems, existingItems, matchField = 'externalId', duplicateHandling = 'skip') => {
  const newRecords = []
  const updates = []
  const skipped = []

  newItems.forEach(item => {
    // Check by exact ID match
    const existingById = existingItems.find(e => e[matchField] === item[matchField])

    if (existingById) {
      // Exact ID match found
      if (duplicateHandling === 'allow') {
        // Import anyway - add as new record
        newRecords.push(item)
      } else if (duplicateHandling === 'update') {
        // Update existing record with new data
        updates.push({
          existing: existingById,
          new: item,
          changes: {
            ...item,
            id: existingById.id // Keep the existing internal ID
          }
        })
      } else {
        // Skip duplicates (default)
        skipped.push(item)
      }
      return
    }

    // No duplicate found - add as new record
    newRecords.push(item)
  })

  return { newRecords, updates, skipped }
}

/**
 * Get unique values for a column (for analysis)
 */
export const getUniqueValues = (rows, columnIndex) => {
  const counts = {}
  rows.forEach(row => {
    const value = row[columnIndex]
    if (value) {
      counts[value] = (counts[value] || 0) + 1
    }
  })
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}
