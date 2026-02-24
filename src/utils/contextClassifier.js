/**
 * Context-Aware HSE Observation Classification Engine
 *
 * ENSEMBLE VOTING SYSTEM (v3.0)
 *
 * Architecture: 4 independent strategies vote on each observation.
 * The majority vote wins, providing higher accuracy and transparency.
 *
 * STRATEGIES:
 * 1. KEYWORD STRATEGY: Object/action/outcome keyword matching from HAZARD_OBJECTS, HAZARD_ACTIONS
 * 2. SENTENCE STRATEGY: WHO/WHAT/WHERE/HOW grammatical analysis from sentenceParser
 * 3. CLEAN TEXT STRATEGY: Strip PHSAS references, re-classify core observation
 * 4. CONTROL-LINK STRATEGY: Link control issues (signage, PPE, permit) to underlying hazards
 *
 * VOTING RULES:
 * - 4/4 unanimous = 95% confidence
 * - 3/4 consensus = 85% confidence
 * - 2/4 split = 70% confidence (tiebreaker: severity ranking)
 * - 1/4 no consensus = 50% confidence (flag for review)
 *
 * Final category = majority vote winner
 * Confidence = consensus level
 */

import {
  OUTCOME_TO_HAZARD,
  HAZARD_OBJECTS,
  HAZARD_ACTIONS,
  DISAMBIGUATION_RULES,
  HAZARD_SEVERITY,
  OBJECT_ACTION_OUTCOMES,
  SIGNIFICANT_HAZARDS,
  HSE_ABBREVIATIONS,
  EQUIPMENT_SYNONYMS,
  EQUIPMENT_TO_CATEGORY,
  CONTROL_KEYWORDS,
  CONTROL_HAZARD_CONTEXT
} from './contextMappings'

import { FALLBACK_CATEGORY } from './constants'

import { levenshteinDistance } from './stringMatching'

import {
  parseSentence,
  ACTOR_HAZARD_CONFIDENCE,
  OBJECT_HAZARD_CONFIDENCE
} from './sentenceParser'

// ============================================================================
// PREPROCESSING LAYER
// ============================================================================

/**
 * Prepare input text (light cleaning)
 */
const prepareInput = (text) => {
  if (!text || typeof text !== 'string') return ''

  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .replace(/[""]/g, '"')      // Normalize quotes
    .replace(/['']/g, "'")      // Normalize apostrophes
}

/**
 * Strip reference text from observation - extract ONLY the core observation
 * Removes text after common reference markers like Ref:, PHSAS, Note:, etc.
 * This prevents keywords in policy/procedure quotes from affecting classification.
 *
 * @param {string} text - The raw observation text
 * @returns {Object} { cleanText, removedText, noiseRemoved, originalLength, cleanedLength }
 */
export const stripReferenceText = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      cleanText: '',
      removedText: '',
      noiseRemoved: false,
      originalLength: 0,
      cleanedLength: 0
    }
  }

  const original = text.trim()
  let mainText = original

  // Reference markers - patterns that indicate the start of reference/citation text
  const refMarkers = [
    // Reference citations
    /\bref(?:erence)?:\s*/gi,
    /\brefer(?:ring)?\s+to\s+/gi,
    // PHSAS specific patterns
    /\bphsas[\s-]+\d/gi,
    // Policy/procedure references
    /\bpolicy\s*#?\d/gi,
    /\bprocedure\s*#?\d/gi,
    /\bstandard\s*#?\d/gi,
    // Note/action markers
    /\bnote:\s*/gi,
    /\bnotes:\s*/gi,
    /\baction\s+required:\s*/gi,
    /\bsuggested\s+(?:action|idea)s?:\s*/gi,
    /\bsuggestion:\s*/gi,
    /\brecommendation:\s*/gi,
    // Attachment/image references
    /\battachment\s*#?\d/gi,
    /\bsee\s+attached/gi,
    /\bphoto\s*#?\d/gi,
    /\bimage\s*#?\d/gi,
  ]

  // Find the earliest reference marker and cut there
  let earliestCut = mainText.length
  let matchedMarker = null

  for (const marker of refMarkers) {
    const match = mainText.match(marker)
    if (match && match.index !== undefined && match.index < earliestCut) {
      earliestCut = match.index
      matchedMarker = match[0]
    }
  }

  // Only cut if we found a marker and it's not at the start
  const cleanText = earliestCut > 10 ? mainText.substring(0, earliestCut).trim() : mainText.trim()
  const removedText = earliestCut < mainText.length ? mainText.substring(earliestCut).trim() : ''
  const noiseRemoved = removedText.length > 0

  return {
    cleanText,
    removedText,
    noiseRemoved,
    originalLength: original.length,
    cleanedLength: cleanText.length,
    matchedMarker
  }
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
        const category = EQUIPMENT_TO_CATEGORY[canonical] || FALLBACK_CATEGORY
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

  // Fire exclusion terms - if these appear with "fire", it's not a fire hazard
  const fireExclusionTerms = [
    'fire extinguisher', 'fire alarm', 'fire exit', 'fire drill',
    'fire watch', 'fire door', 'fire blanket', 'fire prevention',
    'fire fighting', 'fire warden', 'fire marshal', 'fire safety',
    'fire assembly', 'fire muster', 'fire hose', 'fire hydrant',
    'fire resistant', 'fireproof', 'firewall', 'line of fire'
  ]

  // Helper to check if fire is excluded by context
  const isFireExcluded = (txt) => {
    const lowerTxt = txt.toLowerCase()
    return fireExclusionTerms.some(term => lowerTxt.includes(term))
  }

  // CONTEXT-AWARE action patterns - check context BEFORE applying pattern
  // More specific patterns first (longer/more context = checked first)
  const actionPatterns = [
    // EXCAVATION patterns - must check BEFORE fall patterns
    { pattern: /\b(fall|falling|fell)\s*(into|in)\s*(the\s*)?(excavation|trench|pit|ditch)\b/i, category: 'Breaking Ground & Excavation', confidence: 70 },
    { pattern: /\b(excavat|trench|dig|digging|ditch|pit)\b/i, category: 'Breaking Ground & Excavation', confidence: 55 },

    // STRUCK-BY patterns - context-aware
    { pattern: /\bstruck\s*(by)\s*(falling|dropped)\s*(object|material|tool|debris)\b/i, category: 'Physical Hazard', confidence: 65 },
    { pattern: /\bstruck\s*(by)\s*(vehicle|plant|equipment|forklift|excavator|crane|truck)\b/i, category: 'Mobile Plant & Equipment', confidence: 65 },
    { pattern: /\b(hit|struck)\s*(by)\s*(swinging|rotating|moving)\b/i, category: 'Mechanical Hazard', confidence: 60 },

    // CAUGHT-IN patterns - should be Mechanical Hazard, not Mobile Plant
    { pattern: /\bcaught\s*(in|between)\s*(machinery|machine|conveyor|belt|gear|roller|equipment)\b/i, category: 'Mechanical Hazard', confidence: 70 },
    { pattern: /\bcaught\s*(in|between)\b/i, category: 'Mechanical Hazard', confidence: 55 },

    // CRUSHED/PINNED patterns - context-aware
    { pattern: /\b(crushed|pinned)\s*(by)\s*(vehicle|plant|equipment|excavator|crane|truck)\b/i, category: 'Mobile Plant & Equipment', confidence: 65 },
    { pattern: /\b(crushed|pinned)\s*(by)\s*(machinery|machine|formwork|structure|wall|material)\b/i, category: 'Mechanical Hazard', confidence: 60 },
    { pattern: /\b(crushed|pinned)\b/i, category: 'Mechanical Hazard', confidence: 50 }, // Default to Mechanical

    // FALL patterns - only for person falls from height (not into excavation)
    { pattern: /\b(fell|fall|falling)\s*(from|off)\s*(height|scaffold|ladder|platform|roof|edge)\b/i, category: 'Working at Height', confidence: 65 },
    { pattern: /\b(fell|fall|falling)\s*(from|off)\b/i, category: 'Working at Height', confidence: 55 },
    { pattern: /\b(dropped|plummeted)\b/i, category: 'Working at Height', confidence: 50 },

    // FIRE patterns - more specific to avoid false positives (use checkFire flag)
    { pattern: /\b(uncontrolled\s+fire|fire\s+(hazard|incident|spread|outbreak)|caught\s+(on\s+)?fire|engulfed\s+(in|by)\s+fire)\b/i, category: 'Fire', confidence: 60 },
    { pattern: /\b(burning|ablaze|ignited|combustion)\b/i, category: 'Fire', confidence: 55 },
    { pattern: /\b(fire|flame)\b/i, category: 'Fire', confidence: 45, checkFire: true }, // Will be excluded if fire context found

    // Other patterns
    { pattern: /\b(electrocuted|shocked|zapped|electric\s*shock)\b/i, category: 'Energized System', confidence: 65 },
    // Working on or Near Water pattern REMOVED - only classify from explicit Excel data
    { pattern: /\b(asphyxiated|suffocated|engulfed)\b/i, category: 'Confined Spaces', confidence: 65 },
    { pattern: /\b(welding|grinding|cutting)\s*(operation|work|activity)?\b/i, category: 'Hot Work', confidence: 55 },
    { pattern: /\b(lifting|hoisting|rigging)\s*(operation|work|activity)?\b/i, category: 'Lifting', confidence: 55 },
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
  for (const { pattern, category, confidence, checkFire } of actionPatterns) {
    if (pattern.test(text)) {
      // Skip fire patterns if fire is excluded by context
      if (checkFire && isFireExcluded(text)) {
        continue
      }
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
// STEP 1F: Control-to-Hazard Linking (Option C Implementation)
// When a control issue is detected, link it to the underlying hazard
// ============================================================================

/**
 * Check if the observation is about a control issue (signage, PPE, permit, etc.)
 * @param {string} text - The preprocessed text
 * @returns {boolean} True if the observation mentions a control issue
 */
const isControlIssue = (text) => {
  if (!text) return false
  const lowerText = text.toLowerCase()

  for (const keyword of CONTROL_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return true
    }
  }
  return false
}

/**
 * Find the underlying hazard context when a control issue is detected
 * This implements Option C: linking controls to their underlying hazards
 * @param {string} text - The preprocessed text
 * @returns {Object|null} The hazard category and matched context, or null
 */
const linkControlToHazard = (text) => {
  if (!text) return null
  const lowerText = text.toLowerCase()

  // First, check if this is a control issue
  if (!isControlIssue(lowerText)) {
    return null
  }

  // Score each hazard category based on context matches
  const hazardScores = {}

  for (const [hazardCategory, contextKeywords] of Object.entries(CONTROL_HAZARD_CONTEXT)) {
    let score = 0
    const matchedKeywords = []

    for (const keyword of contextKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length // Multi-word matches get higher scores
        matchedKeywords.push(keyword)
      }
    }

    if (score > 0) {
      hazardScores[hazardCategory] = {
        score,
        matchedKeywords,
        // Apply severity multiplier - higher severity hazards get priority
        adjustedScore: score * (10 - (HAZARD_SEVERITY[hazardCategory] || 5))
      }
    }
  }

  // Find the best match (highest adjusted score)
  let bestCategory = null
  let bestScore = 0
  let bestKeywords = []

  for (const [category, data] of Object.entries(hazardScores)) {
    if (data.adjustedScore > bestScore) {
      bestScore = data.adjustedScore
      bestCategory = category
      bestKeywords = data.matchedKeywords
    }
  }

  if (bestCategory) {
    return {
      category: bestCategory,
      matchedContext: bestKeywords,
      confidence: Math.min(85, 60 + bestKeywords.length * 5), // Base 60 + 5 per keyword, max 85
      source: 'control-hazard-link'
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
// Uses HAZARD_ACTIONS mapping to identify actions
// ============================================================================

const extractActionInternal = (text) => {
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
    for (const [_ruleKey, rule] of Object.entries(OBJECT_ACTION_OUTCOMES)) {
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
      'crossing': 'Working on or Near Live Roads'
      // water_work removed - only classify from explicit Excel data
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
  // Note: PPE, Barricades, Safety Sign, Training, Emergency Preparedness are controls, not hazards
  // They are now mapped to actual hazards
  const subIndicators = {
    'General Site Issues': ['ppe', 'helmet', 'gloves', 'safety glasses', 'hard hat', 'hi-vis', 'sign', 'signage', 'warning sign', 'notice', 'training', 'competent', 'certified', 'qualified'],
    'Working at Height': ['harness', 'fall protection'],
    'Housekeeping': ['housekeeping', 'tidy', 'clean', 'mess', 'clutter', 'debris'],
    'Access': ['barricade', 'barrier', 'fencing', 'delineator', 'cone'],
    'Traffic Management': ['traffic', 'vehicle movement', 'pedestrian'],
    'Fire': ['emergency', 'evacuation', 'fire extinguisher', 'assembly point'],
    'Worker Welfare': ['first aid', 'first aider']
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

const _calculateConfidence = (disambiguation, outcome, objects, action) => {
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

const _generateReasoning = (disambiguation, objects, action, outcome) => {
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
// STRATEGY 1: KEYWORD DETECTION
// Matches hazard objects, actions, and outcomes from mappings
// ============================================================================

/**
 * Strategy 1: Keyword Detection
 * Uses HAZARD_OBJECTS, HAZARD_ACTIONS, OUTCOME_TO_HAZARD, DISAMBIGUATION_RULES
 *
 * @param {string} text - Preprocessed text (abbreviations expanded)
 * @returns {Object} Vote object with category, confidence, reasoning
 */
const strategyKeyword = (text) => {
  if (!text) {
    return {
      strategy: 'keyword',
      category: null,
      confidence: 0,
      reasoning: 'No text provided',
      matchedObjects: [],
      matchedActions: []
    }
  }

  // Step 1: Check disambiguation rules FIRST (highest priority)
  const disambiguation = checkDisambiguation(text)
  if (disambiguation) {
    return {
      strategy: 'keyword',
      category: disambiguation.correctCategory,
      confidence: 95,
      reasoning: `Disambiguation rule: "${disambiguation.pattern}" → ${disambiguation.correctCategory} (${disambiguation.reason})`,
      matchedObjects: [],
      matchedActions: [],
      disambiguation: disambiguation
    }
  }

  // Step 2: Extract hazard objects
  const objects = extractHazardObjects(text)

  // Step 3: Extract action
  const actionResult = extractActionInternal(text)

  // Step 4: Determine potential outcome
  const outcome = determineOutcome(text, objects, actionResult)

  // Step 5: Map to category
  let category = null
  let confidence = 0

  if (outcome) {
    category = mapOutcomeToCategory(outcome, objects)
    confidence = outcome.confidence || 65
  } else if (objects.length > 0) {
    category = objects[0].category
    confidence = 65
  }

  // Boost confidence if multiple signals agree
  if (objects.length > 0 && actionResult) {
    const objectCategories = new Set(objects.map(o => o.category))
    if (outcome && objectCategories.has(outcome.category)) {
      confidence = Math.min(confidence + 10, 100)
    }
  }

  // Generate reasoning
  const parts = []
  if (objects.length > 0) {
    parts.push(`Objects: ${objects.slice(0, 3).map(o => o.object).join(', ')}`)
  }
  if (actionResult) {
    parts.push(`Action: ${actionResult.action}`)
  }
  if (outcome) {
    parts.push(`Outcome: ${outcome.outcome}`)
  }

  return {
    strategy: 'keyword',
    category: category || FALLBACK_CATEGORY,
    confidence: category ? Math.round(confidence) : 0,
    reasoning: parts.length > 0 ? parts.join('. ') : 'No keywords matched',
    matchedObjects: objects.map(o => o.object),
    matchedActions: actionResult ? [actionResult.action] : [],
    outcome: outcome
  }
}

// ============================================================================
// STRATEGY 2: SENTENCE STRUCTURE (WHO/WHAT/WHERE/HOW)
// Uses grammatical parsing to understand observation context
// ============================================================================

/**
 * Strategy 2: Sentence Structure
 * Uses sentenceParser to extract WHO/WHAT/WHERE/HOW
 * Actor and Object roles have hazard confidence mappings
 *
 * @param {string} text - Raw text (before stripping references)
 * @returns {Object} Vote object with category, confidence, reasoning
 */
const strategySentence = (text) => {
  if (!text) {
    return {
      strategy: 'sentence',
      category: null,
      confidence: 0,
      reasoning: 'No text provided',
      who: null,
      what: null,
      where: null,
      how: null
    }
  }

  // Parse sentence structure
  const parsed = parseSentence(text)

  // Collect hazard votes from different sentence components
  const hazardVotes = []

  // WHO (actor) - specialist roles have high confidence
  if (parsed.actor) {
    const actorConf = ACTOR_HAZARD_CONFIDENCE[parsed.actor.toLowerCase()]
    if (actorConf && actorConf.hazard) {
      hazardVotes.push({
        source: 'actor',
        category: actorConf.hazard,
        confidence: actorConf.confidence * 100,
        detail: parsed.actor
      })
    }
  }

  // WHAT (object) - equipment/tools suggest hazard categories
  if (parsed.object) {
    const objConf = OBJECT_HAZARD_CONFIDENCE[parsed.object.toLowerCase()]
    if (objConf && objConf.hazard) {
      hazardVotes.push({
        source: 'object',
        category: objConf.hazard,
        confidence: objConf.confidence * 100,
        detail: parsed.object
      })
    }
  }

  // Actor suggested hazard (from sentenceParser)
  if (parsed.actorSuggestedHazard) {
    hazardVotes.push({
      source: 'actorHint',
      category: parsed.actorSuggestedHazard,
      confidence: (parsed.actorHazardConfidence || 0.6) * 100,
      detail: `${parsed.actor} → ${parsed.actorSuggestedHazard}`
    })
  }

  // Object suggested hazard (from sentenceParser)
  if (parsed.objectSuggestedHazard) {
    hazardVotes.push({
      source: 'objectHint',
      category: parsed.objectSuggestedHazard,
      confidence: (parsed.objectHazardConfidence || 0.7) * 100,
      detail: `${parsed.object} → ${parsed.objectSuggestedHazard}`
    })
  }

  // Check ambiguity resolutions
  for (const amb of parsed.ambiguities || []) {
    if (amb.hazard) {
      hazardVotes.push({
        source: 'ambiguity',
        category: amb.hazard,
        confidence: amb.confidence * 100,
        detail: `${amb.word} → ${amb.hazard}`
      })
    }
  }

  // Determine winner by highest confidence
  let bestVote = null
  for (const vote of hazardVotes) {
    if (!bestVote || vote.confidence > bestVote.confidence) {
      bestVote = vote
    }
  }

  // Build reasoning
  const parts = []
  if (parsed.actor) parts.push(`WHO: ${parsed.actor}`)
  if (parsed.object) parts.push(`WHAT: ${parsed.object}`)
  if (parsed.location) parts.push(`WHERE: ${parsed.location}`)
  if (parsed.action) parts.push(`HOW: ${parsed.action}`)
  if (parsed.deviation) parts.push(`DEVIATION: ${parsed.deviation}`)

  return {
    strategy: 'sentence',
    category: bestVote?.category || null,
    confidence: bestVote ? Math.round(bestVote.confidence) : 0,
    reasoning: bestVote
      ? `${bestVote.source}: ${bestVote.detail}`
      : (parts.length > 0 ? parts.join(', ') + ' (no hazard mapped)' : 'No sentence structure identified'),
    who: parsed.actor ? { actor: parsed.actor, hazardHint: parsed.actorSuggestedHazard } : null,
    what: parsed.object ? { object: parsed.object, hazardHint: parsed.objectSuggestedHazard } : null,
    where: parsed.location ? { location: parsed.location } : null,
    how: parsed.action ? { action: parsed.action } : null,
    deviation: parsed.deviation,
    hazardVotes: hazardVotes
  }
}

// ============================================================================
// STRATEGY 3: CLEAN TEXT ANALYSIS
// Strips reference noise, classifies core observation
// ============================================================================

/**
 * Strategy 3: Clean Text Analysis
 * Strips PHSAS/Ref text, then runs keyword detection on clean text
 * Compares clean vs full-text results
 *
 * @param {string} rawText - Original raw text with references
 * @param {string} expandedText - Text with abbreviations expanded
 * @returns {Object} Vote object with category, confidence, reasoning
 */
const strategyCleanText = (rawText, expandedText) => {
  if (!rawText) {
    return {
      strategy: 'cleanText',
      category: null,
      confidence: 0,
      reasoning: 'No text provided',
      noiseRemoved: false
    }
  }

  // Strip reference text
  const stripped = stripReferenceText(rawText)

  // If no noise was removed, echo keyword strategy instead of abstaining
  // This prevents the clean text strategy from always voting null (capping consensus at 3/4)
  if (!stripped.noiseRemoved) {
    const keywordResult = strategyKeyword(expandedText)
    return {
      strategy: 'cleanText',
      category: keywordResult.category,
      confidence: keywordResult.confidence > 0 ? Math.max(keywordResult.confidence - 5, 0) : 0,
      reasoning: 'No reference noise — echoing keyword detection',
      noiseRemoved: false,
      cleanedText: stripped.cleanText
    }
  }

  // Prepare and expand abbreviations on clean text
  const cleanPrepared = prepareInput(stripped.cleanText)
  const cleanExpanded = expandAbbreviations(cleanPrepared)

  // Run keyword detection on clean text
  const cleanResult = strategyKeyword(cleanExpanded)

  // Also run on full text for comparison
  const fullResult = strategyKeyword(expandedText)

  // Determine if clean result is different and potentially better
  const resultsDiffer = cleanResult.category !== fullResult.category

  // Clean text gets confidence boost when noise was substantial
  const noiseRatio = (stripped.originalLength - stripped.cleanedLength) / stripped.originalLength
  let confidence = cleanResult.confidence

  // Boost confidence if we removed significant noise (>20% of text)
  if (noiseRatio > 0.2 && cleanResult.category && cleanResult.category !== FALLBACK_CATEGORY) {
    confidence = Math.min(confidence + 10, 95)
  }

  return {
    strategy: 'cleanText',
    category: cleanResult.category,
    confidence: Math.round(confidence),
    reasoning: `Stripped ${stripped.originalLength - stripped.cleanedLength} chars (${Math.round(noiseRatio * 100)}% noise)${resultsDiffer ? `. Clean: ${cleanResult.category}, Full: ${fullResult.category}` : ''}`,
    noiseRemoved: true,
    originalLength: stripped.originalLength,
    cleanedLength: stripped.cleanedLength,
    cleanedText: stripped.cleanText,
    matchedMarker: stripped.matchedMarker,
    fullTextCategory: fullResult.category,
    resultsDiffer
  }
}

// ============================================================================
// STRATEGY 4: CONTROL-HAZARD LINKING
// Links control issues (signage, PPE, permit) to underlying hazards
// ============================================================================

/**
 * Strategy 4: Control-Hazard Linking
 * When observation is about a control (signage, PPE, permit, inspection),
 * finds the underlying hazard context
 *
 * ENHANCED: Higher confidence when clear hazard context found
 *
 * @param {string} text - Preprocessed text
 * @returns {Object} Vote object with category, confidence, reasoning
 */
const strategyControlLink = (text) => {
  if (!text) {
    return {
      strategy: 'controlLink',
      category: null,
      confidence: 0,
      reasoning: 'No text provided',
      isControlIssue: false
    }
  }

  // Check if this is a control issue
  if (!isControlIssue(text)) {
    return {
      strategy: 'controlLink',
      category: null,
      confidence: 0,
      reasoning: 'Not a control issue',
      isControlIssue: false
    }
  }

  // Find the underlying hazard
  const hazardLink = linkControlToHazard(text)

  if (!hazardLink) {
    return {
      strategy: 'controlLink',
      category: null,
      confidence: 0,
      reasoning: 'Control issue detected but no hazard context found',
      isControlIssue: true,
      controlType: 'unknown'
    }
  }

  // Identify the control type
  const controlTypes = ['signage', 'sign', 'label', 'ppe', 'permit', 'rams', 'inspection', 'training', 'supervision', 'barricade', 'barrier', 'checklist', 'documentation']
  let detectedControlType = 'general'
  for (const ct of controlTypes) {
    if (text.includes(ct)) {
      detectedControlType = ct
      break
    }
  }

  // FIXED CONFIDENCE CALCULATION:
  // Confidence should be calculated from evidence, not just bounded by category type
  // Base confidence from hazardLink, then add incremental boost for matches
  const matchCount = hazardLink.matchedContext.length

  // Start with base confidence from linkControlToHazard (60 + 5 per keyword, max 85)
  let confidence = hazardLink.confidence

  // Add small incremental boost based on match count (max +10)
  // This prevents jumping from 60 to 90 based purely on keyword count
  const matchBoost = Math.min(matchCount * 3, 10)
  confidence = Math.min(confidence + matchBoost, 85)

  // Additional small boost for high-severity hazards (they should win ties)
  // But capped to prevent over-inflation
  const highSeverityCategories = [
    'Working at Height', 'Hot Work', 'Lifting', 'Energized System',
    'Confined Spaces', 'Breaking Ground & Excavation', 'Mobile Plant & Equipment'
  ]
  if (highSeverityCategories.includes(hazardLink.category)) {
    confidence = Math.min(confidence + 5, 90) // Max 90, not 95
  }

  return {
    strategy: 'controlLink',
    category: hazardLink.category,
    confidence: Math.round(confidence),
    reasoning: `Control issue (${detectedControlType}) + hazard context: ${hazardLink.matchedContext.slice(0, 3).join(', ')}`,
    isControlIssue: true,
    controlType: detectedControlType,
    hazardContext: hazardLink.matchedContext,
    matchCount
  }
}

// ============================================================================
// VOTING AGGREGATOR
// Collects votes from all strategies and determines winner
// ============================================================================

/**
 * Collect votes from all 4 strategies
 *
 * @param {string} description - Original observation text
 * @returns {Object} All strategy votes
 */
const collectVotes = (description) => {
  // Preprocess text
  const rawText = prepareInput(description)
  const expandedText = expandAbbreviations(rawText)

  // Run all 4 strategies
  const keywordVote = strategyKeyword(expandedText)
  const sentenceVote = strategySentence(description) // Use original for sentence parsing
  const cleanTextVote = strategyCleanText(description, expandedText)
  const controlLinkVote = strategyControlLink(expandedText)

  return {
    keyword: keywordVote,
    sentence: sentenceVote,
    cleanText: cleanTextVote,
    controlLink: controlLinkVote,
    preprocessed: {
      raw: rawText,
      expanded: expandedText,
      abbreviationsExpanded: expandedText !== rawText
    }
  }
}

/**
 * Aggregate votes and determine winner
 * Uses majority voting with tiebreaker based on severity
 *
 * @param {Object} votes - Votes from all strategies
 * @returns {Object} Final classification result
 */
const aggregateVotes = (votes) => {
  // Collect valid votes (category not null and not fallback)
  const validVotes = []

  for (const [strategyName, vote] of Object.entries(votes)) {
    if (strategyName === 'preprocessed') continue // Skip metadata

    if (vote.category && vote.category !== FALLBACK_CATEGORY) {
      validVotes.push({
        strategy: strategyName,
        category: vote.category,
        confidence: vote.confidence || 0
      })
    }
  }

  // Count votes per category
  const voteCounts = {}
  const voteDetails = {}

  for (const vote of validVotes) {
    if (!voteCounts[vote.category]) {
      voteCounts[vote.category] = 0
      voteDetails[vote.category] = []
    }
    voteCounts[vote.category]++
    voteDetails[vote.category].push(vote)
  }

  // Find winner (most votes)
  let winner = null
  let maxVotes = 0
  let tiedCategories = []

  for (const [category, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count
      winner = category
      tiedCategories = [category]
    } else if (count === maxVotes) {
      tiedCategories.push(category)
    }
  }

  // Handle ties using severity tiebreaker
  let tiebreakerUsed = null
  if (tiedCategories.length > 1) {
    // Compare severity (lower number = higher severity = wins)
    let bestSeverity = Infinity
    let bestCategory = tiedCategories[0]

    for (const cat of tiedCategories) {
      const severity = HAZARD_SEVERITY[cat] || 99
      if (severity < bestSeverity) {
        bestSeverity = severity
        bestCategory = cat
      }
    }

    // If still tied, use highest individual confidence
    if (bestSeverity === Infinity || tiedCategories.every(c => (HAZARD_SEVERITY[c] || 99) === bestSeverity)) {
      let bestConf = 0
      for (const cat of tiedCategories) {
        const catVotes = voteDetails[cat] || []
        const maxConf = Math.max(...catVotes.map(v => v.confidence))
        if (maxConf > bestConf) {
          bestConf = maxConf
          bestCategory = cat
        }
      }
      tiebreakerUsed = 'confidence'
    } else {
      tiebreakerUsed = 'severity'
    }

    winner = bestCategory
  }

  // Calculate consensus confidence
  const totalStrategies = 4
  const winnerVotes = voteCounts[winner] || 0
  const consensusLevel = `${winnerVotes}/${totalStrategies}`

  const consensusConfidence = {
    4: 95,  // Unanimous
    3: 85,  // Strong consensus
    2: 70,  // Weak consensus
    1: 50,  // No consensus
    0: 0    // No valid votes
  }[winnerVotes] || 50

  // Identify dissenting votes
  const dissent = []
  for (const [strategyName, vote] of Object.entries(votes)) {
    if (strategyName === 'preprocessed') continue
    if (vote.category && vote.category !== winner && vote.category !== FALLBACK_CATEGORY) {
      dissent.push({
        strategy: strategyName,
        votedFor: vote.category,
        confidence: vote.confidence
      })
    }
  }

  // Generate reasoning
  const reasoningParts = [`${winnerVotes}/${totalStrategies} strategies voted ${winner || FALLBACK_CATEGORY}`]
  if (dissent.length > 0) {
    reasoningParts.push(`Dissent: ${dissent.map(d => `${d.strategy}→${d.votedFor}`).join(', ')}`)
  }
  if (tiebreakerUsed) {
    reasoningParts.push(`Tiebreaker: ${tiebreakerUsed}`)
  }

  // Flag for review if low consensus OR if there was a 2/4 split (tie that was broken)
  // 2/4 split means real disagreement that should be flagged
  const needsReview = winnerVotes <= 1 || winnerVotes === 2 || (!winner && validVotes.length > 0)

  return {
    // Final result
    category: winner || FALLBACK_CATEGORY,
    confidence: winner ? consensusConfidence : 0,
    consensusLevel,

    // Individual votes
    votes: {
      keyword: votes.keyword,
      sentence: votes.sentence,
      cleanText: votes.cleanText,
      controlLink: votes.controlLink
    },

    // Vote summary
    voteCounts,
    validVoteCount: validVotes.length,

    // Transparency
    reasoning: reasoningParts.join('. ') + '.',
    dissent,

    // Flags
    needsReview,
    tiebreaker: tiebreakerUsed,

    // Preprocessing info
    abbreviationsExpanded: votes.preprocessed?.abbreviationsExpanded || false
  }
}

/**
 * Generate detailed voting reasoning for display
 */
const _generateVotingReasoning = (aggregated) => {
  const parts = []

  // Main result
  parts.push(`Winner: ${aggregated.category} (${aggregated.consensusLevel} consensus, ${aggregated.confidence}% confidence)`)

  // Strategy breakdown
  const strategyNames = ['keyword', 'sentence', 'cleanText', 'controlLink']
  for (const name of strategyNames) {
    const vote = aggregated.votes[name]
    if (vote) {
      const cat = vote.category || 'N/A'
      const conf = vote.confidence || 0
      parts.push(`  ${name}: ${cat} (${conf}%)`)
    }
  }

  // Dissent
  if (aggregated.dissent.length > 0) {
    parts.push(`Dissenting: ${aggregated.dissent.map(d => d.strategy).join(', ')}`)
  }

  return parts.join('\n')
}

// ============================================================================
// MAIN FUNCTION: Analyze Observation (ENSEMBLE VOTING SYSTEM)
// ============================================================================

/**
 * Analyze an HSE observation using the ENSEMBLE VOTING SYSTEM
 *
 * 4 independent strategies vote on each observation:
 * 1. KEYWORD: Object/action/outcome keyword matching
 * 2. SENTENCE: WHO/WHAT/WHERE/HOW grammatical analysis
 * 3. CLEAN TEXT: Strip references, re-classify core observation
 * 4. CONTROL-LINK: Link control issues to underlying hazards
 *
 * Majority vote wins. Ties use severity ranking.
 *
 * @param {string} description - The observation description
 * @param {string} existingCategory - The existing category from Excel (if any)
 * @returns {Object} Classification result with voting details, confidence, and reasoning
 */
export const analyzeObservation = (description, _existingCategory = '') => {
  // Default result for empty input
  if (!description || description.trim() === '') {
    return {
      category: FALLBACK_CATEGORY,
      confidence: 0,
      consensusLevel: '0/4',
      reasoning: 'No description provided',
      hazardObject: null,
      hazardObjects: [],
      action: null,
      actionType: null,
      potentialOutcome: null,
      outcomeSource: null,
      subHazard: null,
      shouldOverride: false,
      analysisComplete: false,
      needsReview: true,
      fallbackUsed: 'default',
      votes: null,
      dissent: [],
      tiebreaker: null,
      abbreviationsExpanded: false
    }
  }

  // =========================================================================
  // ENSEMBLE VOTING SYSTEM
  // =========================================================================

  // Step 1: Collect votes from all 4 strategies
  const allVotes = collectVotes(description)

  // Step 2: Aggregate votes to determine winner
  const aggregated = aggregateVotes(allVotes)

  // Step 3: Extract additional details from keyword strategy for compatibility
  const keywordVote = allVotes.keyword
  const objects = keywordVote?.matchedObjects || []
  const action = keywordVote?.matchedActions?.[0] || null
  const outcome = keywordVote?.outcome

  // Step 4: Determine sub-hazard
  const expandedText = allVotes.preprocessed?.expanded || prepareInput(description)
  const subHazard = determineSubHazard(expandedText, aggregated.category)

  // Step 5: Determine if this should override existing rules
  // High confidence (>= 85) or unanimous vote should override
  const shouldOverride = aggregated.confidence >= 85 || aggregated.consensusLevel === '4/4'

  // =========================================================================
  // LEGACY COMPATIBILITY: Also run the old single-path analysis
  // This provides fallback in case voting fails to find anything
  // =========================================================================

  let legacyCategory = null
  let legacyConfidence = 0
  let legacyFallbackUsed = null

  // If voting found nothing useful, fall back to old system
  if (aggregated.category === FALLBACK_CATEGORY && aggregated.validVoteCount === 0) {
    const text = expandedText

    // Check disambiguation rules
    const disambiguation = checkDisambiguation(text)
    if (disambiguation) {
      legacyCategory = disambiguation.correctCategory
      legacyConfidence = disambiguation.confidence
      legacyFallbackUsed = 'disambiguation'
    }

    // Try pattern-based inference
    if (!legacyCategory) {
      const patternResult = patternBasedInference(text)
      if (patternResult) {
        legacyCategory = patternResult.category
        legacyConfidence = patternResult.confidence
        legacyFallbackUsed = 'pattern'
      }
    }

    // Try equipment synonyms
    if (!legacyCategory) {
      const synonymMatches = resolveEquipmentSynonyms(text)
      if (synonymMatches.length > 0) {
        legacyCategory = synonymMatches[0].category
        legacyConfidence = synonymMatches[0].confidence
        legacyFallbackUsed = 'synonym'
      }
    }

    // Use legacy result if found
    if (legacyCategory) {
      return {
        category: legacyCategory,
        confidence: legacyConfidence,
        consensusLevel: '0/4 (legacy)',
        reasoning: `Voting found no category. Legacy fallback: ${legacyFallbackUsed}`,
        hazardObject: objects[0] || null,
        hazardObjects: objects,
        action: action,
        actionType: keywordVote?.actionType || null,
        potentialOutcome: outcome?.outcome || null,
        outcomeSource: outcome?.source || null,
        subHazard,
        shouldOverride: legacyConfidence >= 85,
        analysisComplete: true,
        needsReview: legacyConfidence < 50,
        fallbackUsed: legacyFallbackUsed,
        votes: aggregated.votes,
        dissent: [],
        tiebreaker: null,
        abbreviationsExpanded: aggregated.abbreviationsExpanded,
        votingResult: aggregated
      }
    }
  }

  // =========================================================================
  // RETURN VOTING RESULT
  // =========================================================================

  return {
    // Primary result
    category: aggregated.category,
    confidence: aggregated.confidence,
    consensusLevel: aggregated.consensusLevel,
    reasoning: aggregated.reasoning,

    // Compatibility fields (from keyword strategy)
    hazardObject: objects[0] || null,
    hazardObjects: objects,
    action: action,
    actionType: keywordVote?.actionType || null,
    potentialOutcome: outcome?.outcome || null,
    outcomeSource: outcome?.source || null,
    subHazard,

    // Override flags
    shouldOverride,
    analysisComplete: true,
    needsReview: aggregated.needsReview,

    // Voting details
    fallbackUsed: aggregated.validVoteCount === 0 ? 'default' : null,
    votes: aggregated.votes,
    voteCounts: aggregated.voteCounts,
    validVoteCount: aggregated.validVoteCount,
    dissent: aggregated.dissent,
    tiebreaker: aggregated.tiebreaker,

    // Preprocessing info
    abbreviationsExpanded: aggregated.abbreviationsExpanded,
    expandedText: aggregated.abbreviationsExpanded ? expandedText : null,

    // Full voting result for debugging
    votingResult: aggregated
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
