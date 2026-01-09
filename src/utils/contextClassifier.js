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
  SUB_SIGNIFICANT_HAZARDS
} from './contextMappings'

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
// MAIN FUNCTION: Analyze Observation
// ============================================================================

/**
 * Analyze an HSE observation using context-aware classification
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
      analysisComplete: false
    }
  }

  // STEP 1: Prepare input
  const text = prepareInput(description)

  // STEP 2: Check disambiguation rules FIRST (highest priority)
  const disambiguation = checkDisambiguation(text)

  // STEP 3: Extract hazard objects
  const objects = extractHazardObjects(text)

  // STEP 4: Extract action
  const action = extractAction(text)

  // STEP 5: Determine potential outcome
  const outcome = determineOutcome(text, objects, action)

  // STEP 6: Map to category
  let category = null

  if (disambiguation) {
    category = disambiguation.correctCategory
  } else if (outcome) {
    category = mapOutcomeToCategory(outcome, objects)
  } else if (objects.length > 0) {
    category = objects[0].category
  }

  // Default fallback
  if (!category) {
    category = 'Work Environment'
  }

  // STEP 7: Determine sub-hazard
  const subHazard = determineSubHazard(text, category)

  // STEP 8: Calculate confidence
  const confidence = calculateConfidence(disambiguation, outcome, objects, action)

  // STEP 9: Generate reasoning
  const reasoning = generateReasoning(disambiguation, objects, action, outcome)

  // STEP 10: Determine if this should override existing rules
  const shouldOverride = confidence >= 85 || disambiguation !== null

  return {
    category,
    confidence,
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
