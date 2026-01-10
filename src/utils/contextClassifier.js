/**
 * Context-Aware HSE Observation Classification Engine
 *
 * Philosophy: Understand the risk (potential outcome) BEFORE assigning the category.
 *
 * Process:
 * 1. Input Preparation (Light Cleaning)
 * 2. Hazard Object Identification (WHAT)
 * 3. Action Identification (WHAT IS HAPPENING)
 * 4. Potential Outcome Identification (HOW HARM OCCURS)
 * 5. Outcome-Driven Hazard Mapping
 * 6. Sub-Significant Hazard Attribution (Secondary)
 * 7. Integration with Existing Rules
 * 8. Confidence Scoring
 */

import {
  OUTCOME_TO_HAZARD,
  HAZARD_OBJECTS,
  HAZARD_ACTIONS,
  DISAMBIGUATION_RULES,
  HAZARD_SEVERITY,
  OBJECT_ACTION_OUTCOMES,
  SIGNIFICANT_HAZARDS,
  SUB_SIGNIFICANT_HAZARDS,
  HSE_ABBREVIATIONS,
  EQUIPMENT_SYNONYMS,
  EQUIPMENT_TO_CATEGORY
} from './contextMappings'

import { levenshteinDistance } from './stringMatching'

// ============================================================================
// STEP 1: Input Preparation (Light Cleaning)
// ============================================================================

const prepareInput = (text) => {
  if (!text || typeof text !== 'string') return ''

  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .replace(/[""]/g, '"')      // Normalize quotes
    .replace(/['']/g, "'")      // Normalize apostrophes
}

// ============================================================================
// STEP 1B: Abbreviation Expansion (NEW - Multi-Fallback Layer 0)
// ============================================================================

/**
 * Expand HSE abbreviations to their full forms for better classification
 * @param {string} text - The preprocessed text
 * @returns {string} Text with abbreviations expanded
 */
export const expandAbbreviations = (text) => {
  if (!text) return text

  let expanded = text

  // Sort by length descending to match longer abbreviations first
  // This prevents 'wah violation' being partially matched by 'wah'
  const sortedAbbrevs = Object.entries(HSE_ABBREVIATIONS)
    .sort((a, b) => b[0].length - a[0].length)

  for (const [abbrev, expansion] of sortedAbbrevs) {
    // Match whole word only (with word boundaries)
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi')
    expanded = expanded.replace(regex, expansion)
  }

  return expanded
}

// ============================================================================
// STEP 1C: Fuzzy Keyword Matching (NEW - Multi-Fallback Layer 1)
// ============================================================================

/**
 * Find keywords that approximately match despite typos
 * Uses Levenshtein distance for fuzzy matching
 * @param {string} text - The text to search
 * @param {number} maxDistance - Maximum edit distance (default 2)
 * @returns {Array} Array of fuzzy matches with confidence
 */
export const fuzzyKeywordMatch = (text, maxDistance = 2) => {
  if (!text) return []

  const words = text.split(/\s+/)
  const matches = []

  // Collect all keywords from HAZARD_OBJECTS
  const allKeywords = []
  for (const [category, objects] of Object.entries(HAZARD_OBJECTS)) {
    for (const obj of objects) {
      // Only consider single words for fuzzy matching (multi-word handled elsewhere)
      if (!obj.includes(' ')) {
        allKeywords.push({ keyword: obj.toLowerCase(), category })
      }
    }
  }

  for (const word of words) {
    // Skip short words (less likely to be meaningful hazard terms)
    if (word.length < 4) continue

    for (const { keyword, category } of allKeywords) {
      // Skip if lengths are too different (optimization)
      if (Math.abs(word.length - keyword.length) > maxDistance) continue

      const distance = levenshteinDistance(word.toLowerCase(), keyword)

      // Only consider matches within distance AND with distance > 0 (not exact match)
      if (distance > 0 && distance <= maxDistance) {
        matches.push({
          original: word,
          matched: keyword,
          category,
          distance,
          confidence: Math.max(0, 85 - (distance * 15)) // 70% for dist=1, 55% for dist=2
        })
      }
    }
  }

  // Sort by distance (closest matches first), then by confidence
  return matches.sort((a, b) => a.distance - b.distance || b.confidence - a.confidence)
}

// ============================================================================
// STEP 1D: Equipment Synonym Resolution (NEW - Multi-Fallback Layer 2)
// ============================================================================

/**
 * Resolve equipment synonyms to canonical forms and their categories
 * @param {string} text - The text to search
 * @returns {Array} Array of resolved equipment with categories
 */
export const resolveEquipmentSynonyms = (text) => {
  if (!text) return []

  const resolved = []
  const lowerText = text.toLowerCase()

  for (const [canonical, synonyms] of Object.entries(EQUIPMENT_SYNONYMS)) {
    for (const synonym of synonyms) {
      // Check if synonym appears in text (as whole word or phrase)
      const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(lowerText)) {
        const category = EQUIPMENT_TO_CATEGORY[canonical] || 'Work Environment'
        resolved.push({
          found: synonym,
          canonical,
          category,
          confidence: 75 // Synonym matches have good confidence
        })
      }
    }
  }

  // Remove duplicates (same canonical form)
  const seen = new Set()
  return resolved.filter(item => {
    if (seen.has(item.canonical)) return false
    seen.add(item.canonical)
    return true
  })
}

// ============================================================================
// STEP 1E: Pattern-Based Inference (NEW - Multi-Fallback Layer 3)
// ============================================================================

/**
 * Infer category from action/severity patterns when other methods fail
 * @param {string} text - The text to analyze
 * @returns {Object|null} Inferred result or null
 */
const patternBasedInference = (text) => {
  if (!text) return null

  // Action patterns that strongly suggest categories
  const actionPatterns = [
    { pattern: /\b(fell|fall|falling|dropped|plummeted)\b/i, category: 'Working at Height', confidence: 60 },
    { pattern: /\b(struck|hit|crushed|pinned|caught)\s*(by)?\b/i, category: 'Mobile Plant & Equipment', confidence: 55 },
    { pattern: /\b(electrocuted|shocked|zapped)\b/i, category: 'Energized System', confidence: 65 },
    { pattern: /\b(drowned|drowning|submerged)\b/i, category: 'Working on or Near Water', confidence: 65 },
    { pattern: /\b(asphyxiated|suffocated|engulfed)\b/i, category: 'Confined Spaces', confidence: 65 },
    { pattern: /\b(burned|burnt|fire|flame)\b/i, category: 'Fire', confidence: 50 },
    { pattern: /\b(welding|grinding|cutting)\s*(operation|work|activity)?\b/i, category: 'Hot Work', confidence: 55 },
    { pattern: /\b(lifting|hoisting|rigging)\s*(operation|work|activity)?\b/i, category: 'Lifting', confidence: 55 },
    { pattern: /\b(excavat|trench|dig|digging)\b/i, category: 'Breaking Ground & Excavation', confidence: 55 },
    { pattern: /\b(confined|enclosed|restricted)\s*(space|area)?\b/i, category: 'Confined Spaces', confidence: 50 }
  ]

  // Equipment prefix patterns
  const prefixPatterns = [
    { pattern: /\b(mini|micro|small)\s*(excavator|digger|loader)/i, category: 'Mobile Plant & Equipment', confidence: 60 },
    { pattern: /\b(heavy|large|big)\s*(equipment|plant|machinery)/i, category: 'Mobile Plant & Equipment', confidence: 50 },
    { pattern: /\b(mobile|portable)\s*(crane|hoist|scaffold)/i, category: 'Lifting', confidence: 55 },
    { pattern: /\b(temporary|makeshift)\s*(support|platform|structure)/i, category: 'Temporary Works', confidence: 55 }
  ]

  // Check action patterns first (higher priority)
  for (const { pattern, category, confidence } of actionPatterns) {
    if (pattern.test(text)) {
      return { category, confidence, source: 'action-pattern', pattern: pattern.toString() }
    }
  }

  // Check prefix patterns
  for (const { pattern, category, confidence } of prefixPatterns) {
    if (pattern.test(text)) {
      return { category, confidence, source: 'prefix-pattern', pattern: pattern.toString() }
    }
  }

  return null
}

// ============================================================================
// STEP 2: Hazard Object Identification (WHAT)
// ============================================================================

const extractHazardObjects = (text) => {
  const foundObjects = []

  for (const [category, objects] of Object.entries(HAZARD_OBJECTS)) {
    for (const obj of objects) {
      if (text.includes(obj.toLowerCase())) {
        foundObjects.push({
          object: obj,
          category,
          position: text.indexOf(obj.toLowerCase())
        })
      }
    }
  }

  // Sort by position (earliest mentioned first) and remove duplicates
  foundObjects.sort((a, b) => a.position - b.position)

  // Return unique objects
  const seen = new Set()
  return foundObjects.filter(item => {
    if (seen.has(item.object)) return false
    seen.add(item.object)
    return true
  })
}

// ============================================================================
// STEP 3: Action Identification (WHAT IS HAPPENING)
// ============================================================================

const extractAction = (text) => {
  const foundActions = []

  for (const [actionType, actions] of Object.entries(HAZARD_ACTIONS)) {
    for (const action of actions) {
      if (text.includes(action.toLowerCase())) {
        foundActions.push({
          action,
          type: actionType,
          position: text.indexOf(action.toLowerCase())
        })
      }
    }
  }

  // Sort by position
  foundActions.sort((a, b) => a.position - b.position)

  // Return first (primary) action
  return foundActions.length > 0 ? foundActions[0] : null
}

// ============================================================================
// STEP 4: Potential Outcome Identification (HOW HARM OCCURS)
// ============================================================================

const determineOutcome = (text, objects, action) => {
  // First, check for explicit outcomes in text
  for (const [outcome, category] of Object.entries(OUTCOME_TO_HAZARD)) {
    if (text.includes(outcome.toLowerCase())) {
      return {
        outcome,
        category,
        source: 'explicit',
        confidence: 95
      }
    }
  }

  // Second, infer outcome from object + action combination
  if (objects.length > 0 && action) {
    for (const [ruleKey, rule] of Object.entries(OBJECT_ACTION_OUTCOMES)) {
      const objectMatch = objects.some(obj =>
        rule.objects.some(ruleObj => obj.object.includes(ruleObj) || ruleObj.includes(obj.object))
      )
      const actionMatch = rule.actions.some(ruleAction =>
        action.action.includes(ruleAction) || ruleAction.includes(action.action)
      )

      if (objectMatch && actionMatch) {
        return {
          outcome: rule.outcome,
          category: rule.category,
          source: 'inferred',
          confidence: 80
        }
      }
    }
  }

  // Third, infer from object alone (what could happen)
  if (objects.length > 0) {
    const primaryObject = objects[0]
    return {
      outcome: `potential ${primaryObject.category.toLowerCase()} incident`,
      category: primaryObject.category,
      source: 'object-based',
      confidence: 65
    }
  }

  // Fourth, infer from action alone
  if (action) {
    const actionCategoryMap = {
      'movement': 'Mobile Plant & Equipment',
      'entry': 'Confined Spaces',
      'height_work': 'Working at Height',
      'hot_work': 'Hot Work',
      'lifting': 'Lifting',
      'excavation': 'Breaking Ground & Excavation',
      'electrical': 'Energized System',
      'falling': 'Working at Height',
      'crossing': 'Working on or Near Live Roads',
      'water_work': 'Working on or Near Water'
    }

    if (actionCategoryMap[action.type]) {
      return {
        outcome: `${action.type} related incident`,
        category: actionCategoryMap[action.type],
        source: 'action-based',
        confidence: 55
      }
    }
  }

  return null
}

// ============================================================================
// STEP 5: Check Disambiguation Rules (CRITICAL)
// ============================================================================

const checkDisambiguation = (text) => {
  for (const rule of DISAMBIGUATION_RULES) {
    if (text.includes(rule.pattern.toLowerCase())) {
      return {
        pattern: rule.pattern,
        wrongCategory: rule.wrongCategory,
        correctCategory: rule.correctCategory,
        reason: rule.reason,
        confidence: 95 // High confidence for explicit rules
      }
    }
  }
  return null
}

// ============================================================================
// STEP 6: Map Outcome to Category with Severity Priority
// ============================================================================

const mapOutcomeToCategory = (outcome, objects) => {
  if (!outcome) return null

  // Get the category from outcome
  let category = outcome.category

  // If multiple objects suggest different categories, use severity ranking
  if (objects.length > 1) {
    const categories = objects.map(obj => obj.category)
    categories.push(category)

    // Find highest severity (lowest number = highest severity)
    let highestSeverity = Infinity
    let bestCategory = category

    for (const cat of categories) {
      const severity = HAZARD_SEVERITY[cat] || 99
      if (severity < highestSeverity) {
        highestSeverity = severity
        bestCategory = cat
      }
    }

    category = bestCategory
  }

  return category
}

// ============================================================================
// STEP 7: Determine Sub-Significant Hazard (Secondary)
// ============================================================================

const determineSubHazard = (text, primaryCategory) => {
  // Look for sub-significant indicators that aren't the primary category
  const subIndicators = {
    'PPE': ['ppe', 'helmet', 'gloves', 'safety glasses', 'hard hat', 'hi-vis', 'harness'],
    'Housekeeping': ['housekeeping', 'tidy', 'clean', 'mess', 'clutter', 'debris'],
    'Barricades': ['barricade', 'barrier', 'fencing', 'delineator', 'cone'],
    'Safety Sign': ['sign', 'signage', 'warning sign', 'notice'],
    'Traffic Management': ['traffic', 'vehicle movement', 'pedestrian'],
    'Training and Competency': ['training', 'competent', 'certified', 'qualified'],
    'Emergency Preparedness': ['emergency', 'evacuation', 'first aid', 'fire extinguisher']
  }

  for (const [subHazard, keywords] of Object.entries(subIndicators)) {
    if (subHazard === primaryCategory) continue

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return subHazard
      }
    }
  }

  return null
}

// ============================================================================
// STEP 8: Calculate Confidence Score
// ============================================================================

const calculateConfidence = (disambiguation, outcome, objects, action) => {
  // Start with base confidence
  let confidence = 50

  // Disambiguation rule gives highest confidence
  if (disambiguation) {
    return disambiguation.confidence
  }

  // Explicit outcome in text
  if (outcome?.source === 'explicit') {
    confidence = 95
  }
  // Inferred from object + action
  else if (outcome?.source === 'inferred') {
    confidence = 80
  }
  // Object-based inference
  else if (outcome?.source === 'object-based') {
    confidence = 65
  }
  // Action-based inference
  else if (outcome?.source === 'action-based') {
    confidence = 55
  }

  // Boost confidence if multiple signals agree
  if (objects.length > 0 && action) {
    const objectCategories = new Set(objects.map(o => o.category))
    if (outcome && objectCategories.has(outcome.category)) {
      confidence = Math.min(confidence + 10, 100)
    }
  }

  // Boost if significant hazard (we're more certain about major hazards)
  if (outcome && SIGNIFICANT_HAZARDS.includes(outcome.category)) {
    confidence = Math.min(confidence + 5, 100)
  }

  return Math.round(confidence)
}

// ============================================================================
// STEP 9: Generate Reasoning Explanation
// ============================================================================

const generateReasoning = (disambiguation, objects, action, outcome) => {
  const parts = []

  if (disambiguation) {
    return `Phrase "${disambiguation.pattern}" indicates ${disambiguation.correctCategory} (${disambiguation.reason}), not ${disambiguation.wrongCategory || 'other'}.`
  }

  if (objects.length > 0) {
    const objNames = objects.slice(0, 3).map(o => o.object).join(', ')
    parts.push(`Hazard object(s): ${objNames}`)
  }

  if (action) {
    parts.push(`Action: ${action.action}`)
  }

  if (outcome) {
    parts.push(`Potential outcome: ${outcome.outcome}`)
    if (outcome.source === 'explicit') {
      parts.push('(explicitly mentioned)')
    } else if (outcome.source === 'inferred') {
      parts.push('(inferred from object + action)')
    }
  }

  return parts.length > 0 ? parts.join('. ') + '.' : 'Classification based on keyword analysis.'
}

// ============================================================================
// MAIN FUNCTION: Analyze Observation (Enhanced with Multi-Fallback)
// ============================================================================

/**
 * Analyze an HSE observation using context-aware classification
 * with multi-fallback layers for improved accuracy
 *
 * @param {string} description - The observation description
 * @param {string} existingCategory - The existing category from Excel (if any)
 * @returns {Object} Classification result with confidence and reasoning
 */
export const analyzeObservation = (description, existingCategory = '') => {
  // Default result for empty input
  if (!description || description.trim() === '') {
    return {
      category: 'Work Environment',
      confidence: 0,
      reasoning: 'No description provided',
      hazardObject: null,
      action: null,
      potentialOutcome: null,
      subHazard: null,
      shouldOverride: false,
      analysisComplete: false,
      needsReview: false,
      fallbackUsed: null
    }
  }

  // STEP 0: Prepare input with abbreviation expansion
  const rawText = prepareInput(description)
  const text = expandAbbreviations(rawText) // NEW: Expand abbreviations first

  // Track if abbreviations were expanded
  const abbreviationsExpanded = text !== rawText

  // STEP 1: Check disambiguation rules FIRST (highest priority)
  const disambiguation = checkDisambiguation(text)

  // STEP 2: Extract hazard objects
  let objects = extractHazardObjects(text)

  // STEP 3: Extract action
  const action = extractAction(text)

  // STEP 4: Determine potential outcome
  let outcome = determineOutcome(text, objects, action)

  // STEP 5: Map to category
  let category = null
  let confidence = 0
  let fallbackUsed = null
  let fallbackDetails = null

  if (disambiguation) {
    category = disambiguation.correctCategory
    confidence = disambiguation.confidence
  } else if (outcome) {
    category = mapOutcomeToCategory(outcome, objects)
    confidence = outcome.confidence || 65
  } else if (objects.length > 0) {
    category = objects[0].category
    confidence = 65
  }

  // =========================================================================
  // MULTI-FALLBACK SYSTEM (NEW)
  // =========================================================================

  // FALLBACK 1: Equipment Synonym Resolution (if confidence < 70)
  if (!category || confidence < 70) {
    const synonymMatches = resolveEquipmentSynonyms(text)
    if (synonymMatches.length > 0) {
      const bestMatch = synonymMatches[0]
      if (!category || bestMatch.confidence > confidence) {
        category = bestMatch.category
        confidence = bestMatch.confidence
        fallbackUsed = 'synonym'
        fallbackDetails = `Equipment "${bestMatch.found}" → ${bestMatch.canonical}`
      }
    }
  }

  // FALLBACK 2: Fuzzy Keyword Matching (if confidence < 60)
  if (!category || confidence < 60) {
    const fuzzyMatches = fuzzyKeywordMatch(text)
    if (fuzzyMatches.length > 0) {
      const bestMatch = fuzzyMatches[0]
      if (!category || bestMatch.confidence > confidence) {
        category = bestMatch.category
        confidence = bestMatch.confidence
        fallbackUsed = 'fuzzy'
        fallbackDetails = `"${bestMatch.original}" ≈ "${bestMatch.matched}" (distance: ${bestMatch.distance})`
      }
    }
  }

  // FALLBACK 3: Pattern-Based Inference (if confidence < 50)
  if (!category || confidence < 50) {
    const patternResult = patternBasedInference(text)
    if (patternResult) {
      if (!category || patternResult.confidence > confidence) {
        category = patternResult.category
        confidence = patternResult.confidence
        fallbackUsed = 'pattern'
        fallbackDetails = `Matched ${patternResult.source}`
      }
    }
  }

  // Default fallback (if still no category)
  if (!category) {
    category = 'Work Environment'
    confidence = 0
    fallbackUsed = 'default'
  }

  // =========================================================================
  // END MULTI-FALLBACK SYSTEM
  // =========================================================================

  // STEP 6: Determine sub-hazard
  const subHazard = determineSubHazard(text, category)

  // STEP 7: Recalculate confidence with all signals
  if (!disambiguation && !fallbackUsed) {
    confidence = calculateConfidence(disambiguation, outcome, objects, action)
  }

  // Boost confidence if abbreviations were expanded and matched
  if (abbreviationsExpanded && confidence > 0) {
    confidence = Math.min(confidence + 5, 100)
  }

  // STEP 8: Generate reasoning
  let reasoning = generateReasoning(disambiguation, objects, action, outcome)

  // Enhance reasoning with fallback info
  if (fallbackUsed) {
    reasoning = `${reasoning} [Fallback: ${fallbackUsed}${fallbackDetails ? ' - ' + fallbackDetails : ''}]`
  }
  if (abbreviationsExpanded) {
    reasoning = `[Abbreviations expanded] ${reasoning}`
  }

  // STEP 9: Determine if this should override existing rules
  const shouldOverride = confidence >= 85 || disambiguation !== null

  // STEP 10: Flag for review if low confidence
  const needsReview = confidence < 50 && category === 'Work Environment'

  return {
    category,
    confidence: Math.round(confidence),
    reasoning,
    hazardObject: objects.length > 0 ? objects[0].object : null,
    hazardObjects: objects.map(o => o.object),
    action: action ? action.action : null,
    actionType: action ? action.type : null,
    potentialOutcome: outcome ? outcome.outcome : null,
    outcomeSource: outcome ? outcome.source : null,
    subHazard,
    shouldOverride,
    analysisComplete: true,
    needsReview,
    fallbackUsed,
    fallbackDetails,
    abbreviationsExpanded,
    expandedText: abbreviationsExpanded ? text : null,
    disambiguation: disambiguation ? {
      pattern: disambiguation.pattern,
      wrongCategory: disambiguation.wrongCategory,
      reason: disambiguation.reason
    } : null
  }
}

// ============================================================================
// HELPER: Get classification confidence level label
// ============================================================================

export const getConfidenceLevel = (confidence) => {
  if (confidence >= 85) return 'high'
  if (confidence >= 65) return 'medium'
  return 'low'
}

// ============================================================================
// HELPER: Batch analyze multiple observations
// ============================================================================

export const analyzeObservations = (observations) => {
  return observations.map(obs => ({
    ...obs,
    contextAnalysis: analyzeObservation(obs.description, obs.location || obs.originalHazardCategory)
  }))
}

// ============================================================================
// HELPER: Get confidence statistics for a set of observations
// ============================================================================

export const getConfidenceStats = (observations) => {
  const results = observations.map(obs =>
    analyzeObservation(obs.description, obs.location || obs.originalHazardCategory)
  )

  const high = results.filter(r => r.confidence >= 85).length
  const medium = results.filter(r => r.confidence >= 65 && r.confidence < 85).length
  const low = results.filter(r => r.confidence < 65).length

  const avgConfidence = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length)
    : 0

  return {
    total: results.length,
    high,
    medium,
    low,
    avgConfidence,
    highPercentage: results.length > 0 ? Math.round((high / results.length) * 100) : 0,
    mediumPercentage: results.length > 0 ? Math.round((medium / results.length) * 100) : 0,
    lowPercentage: results.length > 0 ? Math.round((low / results.length) * 100) : 0
  }
}
