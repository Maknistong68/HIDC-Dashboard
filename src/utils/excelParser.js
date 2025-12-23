import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { HAZARD_PATTERNS, HAZARD_CATEGORIES, HAZARD_PHRASES, CATEGORY_PRIORITY } from './constants'

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

  // Type-based mappings (when classification doesn't match)
  'Hazard Identification': { type: 'incident', incidentType: 'unsafe-condition' },
  'Incident': { type: 'incident', incidentType: 'fac' },
  'LTI': { type: 'incident', incidentType: 'lti' },
  'MTI': { type: 'incident', incidentType: 'mti' },
  'FAC': { type: 'incident', incidentType: 'fac' },
  'First Aid': { type: 'incident', incidentType: 'fac' },

  // "Others" - will be auto-classified by keywords
  'To Be Determined': { type: 'unknown', needsMapping: true },
  'Safety': { type: 'unknown', needsMapping: true },
  'Non-Conformance': { type: 'unknown', needsMapping: true },
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
 * Normalize hazard category to match one of 29 approved categories
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
    'barricade': 'Barricades',
    'barrier': 'Barricades',
    'coshh': 'COSHH',
    'chemical': 'COSHH',
    'hazardous substance': 'COSHH',
    'dust': 'Dust Control',
    'silica': 'Dust Control',
    'bbs': 'BBS',
    'behavior': 'BBS',
    'behaviour': 'BBS',
    'housekeeping': 'Housekeeping',
    'clean': 'Housekeeping',
    'tidy': 'Housekeeping',
    'ppe': 'PPE',
    'protective': 'PPE',
    'helmet': 'PPE',
    'sign': 'Safety Sign',
    'signage': 'Safety Sign',
    'security': 'Site Security',
    'access': 'Access',
    'egress': 'Access',
    'welfare': 'Site Welfare',
    'toilet': 'Site Welfare',
    'supervision': 'Safety Supervision',
    'supervisor': 'Safety Supervision',
    'tool': 'Tools',
    'traffic': 'Traffic Management',
    'pedestrian': 'Traffic Management',
    'environment': 'Work Environment',
    'weather': 'Work Environment',
    'lighting': 'Work Environment',
    'permit': 'Permit and RAMS',
    'rams': 'Permit and RAMS',
    'risk assessment': 'Permit and RAMS',
    'training': 'Training and Competency',
    'competenc': 'Training and Competency',
    'emergency': 'Emergency Preparedness',
    'evacuation': 'Emergency Preparedness',
    'heat': 'Working on Heat',
    'hot surface': 'Working on Heat',
    'thermal': 'Working on Heat',
    // Legacy mappings from old categories
    'slip': 'Access',
    'trip': 'Access',
    'manual handling': 'Lifting',
    'struck': 'Mobile Plant & Equipment',
    'machinery': 'Mobile Plant & Equipment',
    'general safety': 'Work Environment',
    'general': 'Work Environment',
    'other': 'Work Environment',
    'others': 'Work Environment',
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
 * 3-Layer Hazard Classification System
 *
 * LAYER 1: Trust Excel category first (if valid approved category)
 * LAYER 2: Check multi-word PHRASES (more specific, avoids generic word conflicts)
 * LAYER 3: Check single KEYWORDS in priority order (high-risk categories first)
 *
 * IMPORTANT: Never returns "Others" or "General Safety"
 */
export const categorizeHazard = (description, existingCategory = '') => {
  // ============================================
  // LAYER 1: Trust Excel category if valid
  // ============================================
  if (existingCategory && existingCategory.trim() !== '') {
    const normalized = normalizeHazardCategory(existingCategory)
    // Trust the source data if it's a valid category (not just defaulting to Work Environment)
    if (normalized && normalized !== 'Work Environment') {
      return normalized
    }
  }

  // No valid category from Excel - classify by description
  if (!description) return 'Work Environment'

  const text = description.toLowerCase()

  // ============================================
  // LAYER 2: Check PHRASES first (highest priority)
  // Multi-word phrases are more specific and avoid conflicts
  // ============================================
  for (const category of CATEGORY_PRIORITY) {
    const phrases = HAZARD_PHRASES[category] || []
    for (const phrase of phrases) {
      if (text.includes(phrase.toLowerCase())) {
        return category // Phrase match wins immediately
      }
    }
  }

  // ============================================
  // LAYER 3: Check single KEYWORDS in priority order
  // High-risk categories checked first, generic last
  // ============================================
  for (const category of CATEGORY_PRIORITY) {
    const keywords = HAZARD_PATTERNS[category] || []
    for (const keyword of keywords) {
      // Skip very short generic words for lower-priority (generic) categories
      // This prevents "tool" matching "Tools" when it's in "toolbox talk"
      const categoryIndex = CATEGORY_PRIORITY.indexOf(category)
      if (keyword.length <= 4 && categoryIndex >= 20) {
        continue // Skip short words for generic categories
      }

      if (text.includes(keyword.toLowerCase())) {
        return category // First keyword match in priority order wins
      }
    }
  }

  // ============================================
  // DEFAULT: Work Environment (never "Others")
  // ============================================
  return 'Work Environment'
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
 */
export const transformRows = (rows, headers, columnMappings, projectId) => {
  const incidents = []
  const needsMapping = []
  const warnings = {
    dateIssues: [],
    hazardIssues: [],
  }
  const today = format(new Date(), 'yyyy-MM-dd')

  rows.forEach((row, index) => {
    const getValue = (field) => {
      const colIndex = columnMappings[field]
      return colIndex !== undefined ? row[colIndex] : null
    }

    const eventId = getValue('eventId') || `imported-${Date.now()}-${index}`
    const type = getValue('type') || ''
    const classification = getValue('classification') || ''
    const dateValue = getValue('date')
    const description = getValue('description') || ''
    const status = getValue('status') || 'Open'
    const reportedBy = getValue('reportedBy') || 'Unknown'
    const rawHazardCategory = getValue('hazardCategory') || ''
    // Two separate filters - each from its own column only
    const contractor = getValue('contractor') || ''  // Only from 'contractor' column
    const site = getValue('site') || ''  // Only from 'site' column
    const company = getValue('company') || ''  // For backwards compatibility

    // Always categorize using the new 29-category system (eliminates "Others")
    // Pass existing category for normalization, falls back to description-based classification
    const hazardCategory = categorizeHazard(description, rawHazardCategory)

    // Track hazard auto-classification (when original was blank or generic like "Other")
    const genericHazards = ['other', 'others', 'general', 'general safety', 'not specified', '']
    const wasAutoClassified = !rawHazardCategory ||
      genericHazards.includes(rawHazardCategory.toLowerCase().trim())

    if (wasAutoClassified && hazardCategory !== 'Work Environment') {
      warnings.hazardIssues.push({
        row: index + 2,
        original: rawHazardCategory || '(blank)',
        autoClassified: hazardCategory,
        eventId,
      })
    }

    // Parse date - handles DD/MM/YYYY (European) and other formats
    let parsedDate
    let dateFellBack = false
    try {
      if (dateValue instanceof Date) {
        parsedDate = format(dateValue, 'yyyy-MM-dd')
      } else if (typeof dateValue === 'string') {
        const cleaned = dateValue.trim()

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
        // Excel serial date
        const date = new Date((dateValue - 25569) * 86400 * 1000)
        parsedDate = format(date, 'yyyy-MM-dd')
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
        date: parsedDate,
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
      })
      return
    }

    // Determine type mapping
    let mapping = CLASSIFICATION_MAPPING[classification] || CLASSIFICATION_MAPPING[type]

    // Auto-classify "Others" using keyword analysis
    if (!mapping || mapping.needsMapping) {
      const autoClassifiedType = classifyByKeywords(description, hazardCategory)
      mapping = { type: 'incident', incidentType: autoClassifiedType, autoClassified: true }
    }

    incidents.push({
      externalId: eventId,
      projectId,
      date: parsedDate,
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
    })
  })

  return { incidents, needsMapping, warnings }
}

/**
 * Check for duplicates against existing data
 */
export const checkDuplicates = (newItems, existingItems, matchField = 'externalId') => {
  const newRecords = []
  const updates = []
  const skipped = []

  newItems.forEach(item => {
    const existingItem = existingItems.find(e => e[matchField] === item[matchField])

    if (!existingItem) {
      newRecords.push(item)
    } else if (existingItem.actionStatus !== item.actionStatus) {
      updates.push({
        existing: existingItem,
        new: item,
        changes: { actionStatus: item.actionStatus }
      })
    } else {
      skipped.push(item)
    }
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
