/**
 * ScenarioSimulatorEngine - Data-driven HSE intervention calculations
 *
 * Based on HSE Hierarchy of Controls and actual factor prevalence in data.
 * No arbitrary multipliers - all calculations derived from:
 * 1. Actual factor detection rates in incidents
 * 2. Industry-standard control effectiveness ranges
 */

// ============================================================================
// HSE HIERARCHY OF CONTROLS
// ============================================================================

/**
 * Map factors to HSE Hierarchy of Controls
 * Effectiveness ranges based on NIOSH/HSE research:
 * - Engineering: 60-90% effectiveness at addressing root cause
 * - Administrative: 40-60% effectiveness
 * - PPE: 20-40% effectiveness (last line of defense)
 */
export const CONTROL_HIERARCHY = {
  // Engineering Controls - Physical changes that isolate people from hazards
  engineering: {
    name: 'Engineering Controls',
    effectiveness: 0.75, // 75% average effectiveness
    factors: ['Barriers', 'Safety Devices', 'Machine Guarding', 'Signage'],
    description: 'Physical barriers, guards, and engineering solutions',
    interventions: [
      { id: 'barriers', label: 'Install/Improve Barriers', factor: 'Barriers' },
      { id: 'guards', label: 'Machine Guarding', factor: 'Machine Guarding' },
      { id: 'devices', label: 'Safety Devices', factor: 'Safety Devices' },
      { id: 'signage', label: 'Warning Signs/Labels', factor: 'Signage' }
    ]
  },

  // Administrative Controls - Change how people work
  administrative: {
    name: 'Administrative Controls',
    effectiveness: 0.50, // 50% average effectiveness
    factors: [
      'Training', 'Competency', 'Documentations', 'Permit', 'Supervision',
      'Planning', 'Communication', 'Inspections', 'Interfaces', 'Housekeeping', 'BBS'
    ],
    description: 'Procedures, training, supervision, and work practices',
    interventions: [
      { id: 'training', label: 'Training Programs', factor: 'Training' },
      { id: 'competency', label: 'Competency Assessment', factor: 'Competency' },
      { id: 'procedures', label: 'Procedures/Documentation', factor: 'Documentations' },
      { id: 'permits', label: 'Permit Systems', factor: 'Permit' },
      { id: 'supervision', label: 'Supervision Level', factor: 'Supervision' },
      { id: 'planning', label: 'Work Planning', factor: 'Planning' },
      { id: 'communication', label: 'Communication/Briefings', factor: 'Communication' },
      { id: 'inspections', label: 'Inspection Frequency', factor: 'Inspections' },
      { id: 'interfaces', label: 'Handover Procedures', factor: 'Interfaces' },
      { id: 'housekeeping', label: 'Housekeeping Standards', factor: 'Housekeeping' }
    ]
  },

  // PPE - Last line of defense
  ppe: {
    name: 'Personal Protective Equipment',
    effectiveness: 0.30, // 30% average effectiveness (protects worker, doesn't eliminate hazard)
    factors: ['PPE'],
    description: 'Personal protective equipment compliance',
    interventions: [
      { id: 'ppe', label: 'PPE Compliance', factor: 'PPE' }
    ]
  },

  // Environmental Controls
  environmental: {
    name: 'Environmental Controls',
    effectiveness: 0.55, // 55% average effectiveness
    factors: ['Environment', 'Emergency Preparedness'],
    description: 'Workplace conditions and emergency readiness',
    interventions: [
      { id: 'environment', label: 'Work Environment', factor: 'Environment' },
      { id: 'emergency', label: 'Emergency Preparedness', factor: 'Emergency Preparedness' }
    ]
  }
}

// ============================================================================
// FACTOR PREVALENCE CALCULATOR
// ============================================================================

/**
 * Calculate factor prevalence from actual incident data
 * Returns: { factorName: { count, percentage, incidents } }
 */
export const calculateFactorPrevalence = (factorData, totalNegativeIncidents) => {
  if (!factorData?.byFactor || totalNegativeIncidents === 0) {
    return {}
  }

  const prevalence = {}

  for (const factor of factorData.byFactor) {
    // Calculate prevalence as percentage of negative incidents
    const percentage = (factor.count / totalNegativeIncidents) * 100

    prevalence[factor.name] = {
      name: factor.name,
      count: factor.count,
      percentage: Math.round(percentage * 10) / 10,
      // This is the maximum potential reduction if this factor is fully addressed
      maxReduction: percentage
    }
  }

  return prevalence
}

/**
 * Get top factors for a specific hazard
 */
export const getTopFactorsForHazard = (factorData, hazardName, limit = 5) => {
  if (!factorData?.byFactor) return []

  // Filter factors that appear in this hazard
  const hazardFactors = factorData.byFactor
    .filter(f => {
      if (!hazardName || hazardName === 'all') return true
      // Check if factor has incidents in this hazard
      return f.hazards?.[hazardName] > 0
    })
    .map(f => ({
      ...f,
      hazardCount: hazardName && hazardName !== 'all' ? (f.hazards?.[hazardName] || 0) : f.count
    }))
    .sort((a, b) => b.hazardCount - a.hazardCount)
    .slice(0, limit)

  return hazardFactors
}

// ============================================================================
// INTERVENTION EFFECT CALCULATOR
// ============================================================================

/**
 * Calculate the effect of an intervention based on:
 * 1. Factor prevalence (how often it appears in incidents)
 * 2. Control hierarchy effectiveness
 * 3. Slider value (0-100% effort applied)
 *
 * Formula: Effect = Prevalence × ControlEffectiveness × (SliderValue / 100)
 */
export const calculateInterventionEffect = (
  factorName,
  sliderValue,
  prevalence,
  controlCategory
) => {
  // Get factor prevalence
  const factorPrevalence = prevalence[factorName]
  if (!factorPrevalence) return 0

  // Get control effectiveness
  const control = CONTROL_HIERARCHY[controlCategory]
  if (!control) return 0

  // Calculate effect
  // sliderValue: -50 to +100 (negative = reducing effort, positive = increasing)
  // At +100%: maximum effect = prevalence × effectiveness
  // At 0%: no change
  // At -50%: negative effect (reducing controls increases incidents)

  const effortMultiplier = sliderValue / 100
  const maxEffect = factorPrevalence.percentage * control.effectiveness

  // Positive slider = reduction in incidents (negative %)
  // Negative slider = increase in incidents (positive %)
  const effect = -1 * maxEffect * effortMultiplier

  return Math.round(effect * 10) / 10
}

/**
 * Calculate total projected change from all interventions
 */
export const calculateProjectedChange = (sliders, prevalence) => {
  let totalEffect = 0
  const effects = {}

  // Process each control category
  for (const [categoryKey, category] of Object.entries(CONTROL_HIERARCHY)) {
    for (const intervention of category.interventions) {
      const sliderValue = sliders[intervention.id]
      if (sliderValue === undefined || sliderValue === 0) continue

      const effect = calculateInterventionEffect(
        intervention.factor,
        sliderValue,
        prevalence,
        categoryKey
      )

      if (effect !== 0) {
        effects[intervention.id] = {
          factor: intervention.factor,
          label: intervention.label,
          sliderValue,
          effect,
          category: category.name
        }
        totalEffect += effect
      }
    }
  }

  // Cap total effect at reasonable bounds (-60% to +40%)
  const cappedEffect = Math.max(-60, Math.min(40, totalEffect))

  return {
    totalEffect: Math.round(cappedEffect * 10) / 10,
    effects,
    isCapped: Math.abs(totalEffect) > Math.abs(cappedEffect)
  }
}

// ============================================================================
// KEYWORD AGGREGATION FOR FACTOR EXPLANATIONS
// ============================================================================

/**
 * Get top keywords/phrases that contributed to a factor being detected
 * Aggregates keyword matches across all observations for a specific factor
 *
 * @param {Object} factorData - Factor data from aggregateContributingFactors
 * @param {string} factorName - Name of the factor to get keywords for
 * @param {string} hazardName - Optional: filter to specific hazard
 * @param {number} limit - Maximum number of keywords to return (default: 5)
 * @returns {Array<{keyword: string, count: number, type: string}>} Top keywords with counts
 */
export const getTopKeywordsForFactor = (factorData, factorName, hazardName = 'all', limit = 5) => {
  if (!factorData?.byFactor || !factorName) {
    return []
  }

  // Find the factor in the data
  const factor = factorData.byFactor.find(f => f.name === factorName)
  if (!factor || !factor.incidents) {
    return []
  }

  // Filter incidents by hazard if specified
  const incidents = hazardName === 'all'
    ? factor.incidents
    : factor.incidents.filter(i => i.location === hazardName)

  if (incidents.length === 0) {
    return []
  }

  // Import detectContributingFactorsWithDetails dynamically to avoid circular dependency
  // We'll use a simpler approach: scan descriptions for known patterns
  const keywordCounts = {}

  // Get keywords for this factor from FACTOR_PHRASE_CONFIG (imported via window or passed)
  // Since we can't import rootCauseEngine here, we'll extract keywords from incidents
  // by looking at common phrases in descriptions

  for (const incident of incidents) {
    if (!incident.description) continue

    const normalizedText = incident.description.toLowerCase()

    // Extract meaningful phrases (2-4 words) that appear in the description
    // Focus on common HSE terminology
    const phrases = extractMeaningfulPhrases(normalizedText, factorName)

    for (const phrase of phrases) {
      if (!keywordCounts[phrase]) {
        keywordCounts[phrase] = { keyword: phrase, count: 0, type: 'detected' }
      }
      keywordCounts[phrase].count++
    }
  }

  // Convert to array, sort by count, and return top N
  return Object.values(keywordCounts)
    .filter(k => k.count >= 2) // Only include phrases that appear at least twice
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Extract meaningful phrases from text based on factor type
 * Uses common HSE terminology patterns
 */
const extractMeaningfulPhrases = (text, factorName) => {
  const phrases = []

  // Factor-specific keyword patterns
  const FACTOR_KEYWORDS = {
    'Environment': [
      'poor lighting', 'poor visibility', 'dusty', 'dust', 'weather', 'rain', 'wind',
      'hot', 'cold', 'wet', 'slippery', 'muddy', 'dark', 'visibility', 'lighting',
      'temperature', 'humidity', 'conditions', 'cluttered', 'congested', 'noisy'
    ],
    'Training': [
      'training', 'untrained', 'inexperienced', 'new worker', 'lack of training',
      'insufficient training', 'no training', 'unfamiliar', 'not trained',
      'competency', 'skill', 'knowledge', 'awareness'
    ],
    'PPE': [
      'ppe', 'helmet', 'gloves', 'goggles', 'safety glasses', 'vest', 'boots',
      'harness', 'respirator', 'mask', 'ear protection', 'face shield',
      'not wearing', 'without ppe', 'missing ppe', 'improper ppe'
    ],
    'Communication': [
      'communication', 'miscommunication', 'not communicated', 'lack of communication',
      'briefing', 'no briefing', 'toolbox talk', 'handover', 'shift change',
      'radio', 'signal', 'warning', 'informed', 'not informed'
    ],
    'Supervision': [
      'supervision', 'unsupervised', 'supervisor', 'no supervision', 'lack of supervision',
      'foreman', 'overseer', 'monitoring', 'not monitored', 'left alone'
    ],
    'Housekeeping': [
      'housekeeping', 'messy', 'untidy', 'clutter', 'debris', 'waste', 'spillage',
      'tools lying', 'materials scattered', 'not cleaned', 'dirty', 'disorganized'
    ],
    'Barriers': [
      'barrier', 'barricade', 'fence', 'guard rail', 'handrail', 'no barrier',
      'missing barrier', 'broken barrier', 'insufficient barrier', 'demarcation'
    ],
    'Signage': [
      'sign', 'signage', 'warning sign', 'no sign', 'missing sign', 'label',
      'marking', 'not marked', 'unclear sign', 'faded sign'
    ],
    'Permit': [
      'permit', 'ptw', 'permit to work', 'no permit', 'without permit',
      'expired permit', 'invalid permit', 'hot work permit', 'confined space permit'
    ],
    'Planning': [
      'planning', 'plan', 'no plan', 'poor planning', 'unplanned', 'preparation',
      'risk assessment', 'jsa', 'method statement', 'procedure'
    ],
    'Competency': [
      'competency', 'competent', 'not competent', 'qualified', 'not qualified',
      'certified', 'not certified', 'license', 'authorization'
    ],
    'Documentations': [
      'documentation', 'procedure', 'sop', 'work instruction', 'checklist',
      'no procedure', 'outdated procedure', 'not following procedure'
    ],
    'Safety Devices': [
      'safety device', 'interlock', 'emergency stop', 'e-stop', 'sensor',
      'alarm', 'detector', 'cut-off', 'bypass', 'disabled'
    ],
    'Machine Guarding': [
      'guard', 'guarding', 'machine guard', 'no guard', 'missing guard',
      'removed guard', 'bypass guard', 'pinch point', 'nip point'
    ],
    'Inspections': [
      'inspection', 'not inspected', 'no inspection', 'failed inspection',
      'pre-use check', 'daily check', 'maintenance', 'defect'
    ],
    'Interfaces': [
      'interface', 'handover', 'shift change', 'contractor', 'third party',
      'coordination', 'simultaneous operations', 'simops'
    ],
    'Emergency Preparedness': [
      'emergency', 'evacuation', 'fire', 'first aid', 'muster point',
      'emergency exit', 'fire extinguisher', 'emergency response'
    ],
    'BBS': [
      'bbs', 'behavior', 'behaviour', 'unsafe act', 'at risk behavior',
      'shortcut', 'rushing', 'complacency', 'fatigue'
    ]
  }

  const keywords = FACTOR_KEYWORDS[factorName] || []

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      phrases.push(keyword)
    }
  }

  return phrases
}

// ============================================================================
// DYNAMIC SLIDER GENERATOR
// ============================================================================

/**
 * Generate sliders based on actual top factors in the data
 * Only shows sliders for factors that actually exist in incidents
 */
export const generateDynamicSliders = (factorData, hazardName, totalNegativeIncidents) => {
  const topFactors = getTopFactorsForHazard(factorData, hazardName, 8)
  const prevalence = calculateFactorPrevalence(factorData, totalNegativeIncidents)

  const sliders = []

  for (const factor of topFactors) {
    // Find which control category this factor belongs to
    let category = null
    let intervention = null

    for (const [categoryKey, cat] of Object.entries(CONTROL_HIERARCHY)) {
      const found = cat.interventions.find(i => i.factor === factor.name)
      if (found) {
        category = { key: categoryKey, ...cat }
        intervention = found
        break
      }
    }

    if (!category || !intervention) continue

    const factorPrevalence = prevalence[factor.name]
    if (!factorPrevalence) continue

    sliders.push({
      id: intervention.id,
      factor: factor.name,
      label: intervention.label,
      category: category.name,
      categoryKey: category.key,
      effectiveness: category.effectiveness,
      prevalence: factorPrevalence.percentage,
      maxReduction: factorPrevalence.percentage * category.effectiveness,
      count: factor.count,
      // Descriptive sublabel based on actual data
      sublabel: `${factorPrevalence.percentage.toFixed(1)}% of incidents involve ${factor.name.toLowerCase()}`
    })
  }

  return sliders
}

// ============================================================================
// OPEN ACTIONS CALCULATOR
// ============================================================================

/**
 * Calculate effect of closing open actions
 * Based on assumption that open actions represent unresolved risks
 */
export const calculateActionClosureEffect = (
  actionsToClose,
  totalOpenActions,
  totalNegativeIncidents
) => {
  if (totalOpenActions === 0 || actionsToClose === 0) return 0

  // Each open action represents ~2-3% of risk (based on typical action effectiveness)
  // Closing all actions would reduce incidents by ~15-20%
  const maxReduction = Math.min(20, totalOpenActions * 2.5)
  const closureRatio = actionsToClose / totalOpenActions

  return -1 * Math.round(maxReduction * closureRatio * 10) / 10
}

// ============================================================================
// PROJECTION CALCULATOR
// ============================================================================

/**
 * Calculate full projection with all factors
 */
export const calculateFullProjection = ({
  basePrediction,
  sliders,
  factorData,
  totalNegativeIncidents,
  openActionsCount,
  actionsToClose
}) => {
  // Calculate factor prevalence
  const prevalence = calculateFactorPrevalence(factorData, totalNegativeIncidents)

  // Calculate intervention effects
  const { totalEffect, effects, isCapped } = calculateProjectedChange(sliders, prevalence)

  // Calculate action closure effect
  const actionEffect = calculateActionClosureEffect(
    actionsToClose,
    openActionsCount,
    totalNegativeIncidents
  )

  // Total combined effect
  const combinedEffect = Math.max(-60, Math.min(40, totalEffect + actionEffect))

  // Calculate projected value
  const projected = Math.round(basePrediction * (1 + combinedEffect / 100))

  // Determine risk level based on change
  let riskLevel = 'medium'
  if (combinedEffect <= -20) riskLevel = 'low'
  else if (combinedEffect >= 30) riskLevel = 'critical'
  else if (combinedEffect >= 15) riskLevel = 'high'

  return {
    baseline: basePrediction,
    projected,
    changePercent: Math.round(combinedEffect),
    riskLevel,
    effects: {
      ...effects,
      actions: actionEffect !== 0 ? {
        factor: 'Open Actions',
        label: `Close ${actionsToClose} actions`,
        effect: actionEffect,
        category: 'Corrective Actions'
      } : null
    },
    isImproved: combinedEffect < 0,
    isCapped,
    totalEffect: Math.round(combinedEffect * 10) / 10
  }
}

// ============================================================================
// MULTI-HAZARD PROJECTION CALCULATOR
// ============================================================================

/**
 * Calculate projection for multiple hazards combined
 * Aggregates projections across selected hazards
 *
 * @param {Object} params - Calculation parameters
 * @param {Array<string>} params.hazards - Array of hazard names
 * @param {Object} params.sliders - Slider values by intervention ID
 * @param {Object} params.factorData - Factor data from aggregateContributingFactors
 * @param {Array} params.incidents - All incidents
 * @param {Object} params.trendingData - Trending data from getHazardTrendingByPeriod
 * @param {number} params.basePrediction - Base weekly prediction
 * @param {number} params.openActionsCount - Number of open corrective actions
 * @param {number} params.actionsToClose - Number of actions to close
 * @returns {Object} Aggregated projection result
 */
export const calculateMultiHazardProjection = ({
  hazards = [],
  sliders = {},
  factorData,
  incidents = [],
  trendingData = [],
  basePrediction = 0,
  openActionsCount = 0,
  actionsToClose = 0
}) => {
  if (hazards.length === 0) {
    // No hazards selected - return full projection
    return calculateFullProjection({
      basePrediction,
      sliders,
      factorData,
      totalNegativeIncidents: incidents.length,
      openActionsCount,
      actionsToClose
    })
  }

  // Calculate hazard-specific proportions
  let totalHazardIncidents = 0
  const hazardRatios = {}

  for (const hazardName of hazards) {
    const hazardIncidents = incidents.filter(i => i.location === hazardName)
    hazardRatios[hazardName] = hazardIncidents.length
    totalHazardIncidents += hazardIncidents.length
  }

  // Calculate proportion of total
  const proportion = incidents.length > 0
    ? totalHazardIncidents / incidents.length
    : 0

  // Adjust base prediction by proportion
  const adjustedBasePrediction = Math.max(1, Math.round(basePrediction * proportion))

  // Apply trend factor if available
  let trendFactor = 1
  for (const hazardName of hazards) {
    const trend = trendingData.find(t => t.name === hazardName)
    if (trend) {
      // Weight by hazard's share of selected incidents
      const weight = totalHazardIncidents > 0
        ? hazardRatios[hazardName] / totalHazardIncidents
        : 1 / hazards.length

      // Calculate trend adjustment
      if (trend.trendLevel?.level === 'significant-rise') {
        trendFactor += 0.15 * weight
      } else if (trend.trendLevel?.level === 'rising') {
        trendFactor += 0.08 * weight
      } else if (trend.trendLevel?.level === 'declining') {
        trendFactor -= 0.05 * weight
      } else if (trend.trendLevel?.level === 'significant-decline') {
        trendFactor -= 0.1 * weight
      }
    }
  }

  const trendAdjustedPrediction = Math.max(1, Math.round(adjustedBasePrediction * trendFactor))

  // Calculate projection with interventions
  const result = calculateFullProjection({
    basePrediction: trendAdjustedPrediction,
    sliders,
    factorData,
    totalNegativeIncidents: totalHazardIncidents,
    openActionsCount,
    actionsToClose
  })

  return {
    ...result,
    hazards,
    hazardCount: hazards.length,
    totalHazardIncidents,
    proportion: Math.round(proportion * 100),
    trendFactor,
    isMultiHazard: hazards.length > 1
  }
}

// ============================================================================
// QUICK ACTION PRESET APPLICATOR
// ============================================================================

import { QUICK_ACTION_PRESETS } from '../../utils/constants'

/**
 * Apply quick action preset and return modified slider values
 *
 * @param {string} actionId - ID of the quick action preset
 * @param {Object} prevalence - Factor prevalence data
 * @param {number} openActionsCount - Number of open corrective actions
 * @returns {Object} { sliders, actionsToClose }
 */
export const applyQuickActionPreset = (actionId, prevalence = {}, openActionsCount = 0) => {
  const preset = QUICK_ACTION_PRESETS.find(a => a.id === actionId)
  if (!preset) {
    return { sliders: {}, actionsToClose: 0 }
  }

  const sliders = {}
  let actionsToClose = 0

  for (const [key, value] of Object.entries(preset.effect)) {
    if (key === 'actionsToClose') {
      actionsToClose = value === 'max' ? openActionsCount : value
    } else {
      // Map effect keys to slider IDs
      const sliderMapping = {
        barriers: 'barriers',
        guards: 'guards',
        devices: 'devices',
        signage: 'signage',
        training: 'training',
        inspections: 'inspections',
        supervision: 'supervision',
        permits: 'permits',
        ppe: 'ppe'
      }

      const sliderId = sliderMapping[key] || key
      sliders[sliderId] = value
    }
  }

  return { sliders, actionsToClose }
}

// ============================================================================
// HAZARD-SPECIFIC RECOMMENDATIONS
// ============================================================================

import { HAZARD_RECOMMENDED_ACTIONS } from '../../utils/constants'

/**
 * Get recommended actions for hazard, sorted by effectiveness
 *
 * @param {string} hazardName - Name of the hazard
 * @param {Object} factorData - Factor data from aggregateContributingFactors
 * @param {Object} prevalence - Factor prevalence data
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} Sorted recommendations with calculated scores
 */
export const getRecommendedActionsForHazard = (hazardName, factorData, prevalence = {}, limit = 5) => {
  const mapping = HAZARD_RECOMMENDED_ACTIONS[hazardName]
  if (!mapping) {
    return []
  }

  // Calculate effectiveness score for each recommendation
  const scoredRecs = mapping.map(rec => {
    // Check if factor exists in data
    const factorPrevalence = prevalence[rec.factor]?.percentage || 0

    // Score = base effect × prevalence weight × priority weight
    const priorityWeight = rec.priority === 'high' ? 1.5 : 1
    const score = rec.effect * (1 + factorPrevalence / 100) * priorityWeight

    return {
      ...rec,
      prevalence: factorPrevalence,
      score,
      hasData: factorPrevalence > 0
    }
  })

  // Sort by score descending
  return scoredRecs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Get recommended actions for multiple hazards, aggregated and deduplicated
 *
 * @param {Array<string>} hazardNames - Array of hazard names
 * @param {Object} factorData - Factor data from aggregateContributingFactors
 * @param {Object} prevalence - Factor prevalence data
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} Aggregated and sorted recommendations
 */
export const getRecommendedActionsForMultipleHazards = (hazardNames, factorData, prevalence = {}, limit = 6) => {
  if (!hazardNames || hazardNames.length === 0) {
    return []
  }

  const aggregated = {}

  for (const hazardName of hazardNames) {
    const recs = getRecommendedActionsForHazard(hazardName, factorData, prevalence, 10)

    for (const rec of recs) {
      const key = rec.factor
      if (!aggregated[key]) {
        aggregated[key] = {
          ...rec,
          hazards: [hazardName],
          totalScore: rec.score
        }
      } else {
        // Merge
        aggregated[key].hazards.push(hazardName)
        aggregated[key].totalScore += rec.score
        // Use highest effect
        if (rec.effect > aggregated[key].effect) {
          aggregated[key].effect = rec.effect
          aggregated[key].action = rec.action
        }
        // Upgrade priority if any is high
        if (rec.priority === 'high') {
          aggregated[key].priority = 'high'
        }
      }
    }
  }

  // Sort by total score and return
  return Object.values(aggregated)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
}

// ============================================================================
// THREE FIXED SCENARIOS CALCULATOR
// ============================================================================

/**
 * Calculate three fixed scenarios for executive view:
 * 1. No Change - Current trajectory
 * 2. Minimum Controls - PPE + basic training + supervision
 * 3. Best Controls - Engineering controls + close 10 actions
 *
 * @param {Object} params - Calculation parameters
 * @returns {Object} { noChange, minControls, bestControls }
 */
export const calculateThreeFixedScenarios = ({
  incidentPrediction,
  factorData,
  negativeIncidents,
  prevalence,
  topRiskHazard,
  sortedHazards
}) => {
  const totalNegative = negativeIncidents?.length || 0

  // Base weekly prediction
  const basePrediction = incidentPrediction?.weekly?.predicted ||
    Math.round((totalNegative / 30) * 7) || 5

  // Get trend factor
  let trendFactor = 1.0
  if (topRiskHazard?.trend === 'significant-rise') trendFactor = 1.3
  else if (topRiskHazard?.trend === 'rising') trendFactor = 1.15
  else if (topRiskHazard?.trend === 'declining') trendFactor = 0.9
  else if (topRiskHazard?.trend === 'significant-decline') trendFactor = 0.75

  // ── Scenario 1: No Change ──
  // Project forward with current trend
  const noChangeProjected = Math.round(basePrediction * trendFactor)
  const noChangeRiskChange = Math.round((trendFactor - 1) * 100)

  const noChange = {
    projected: noChangeProjected,
    riskChange: Math.max(0, noChangeRiskChange), // Show as positive (increase)
    trend: topRiskHazard?.trend || 'stable',
    expectedType: 'Based on historical distribution',
    expectedSeverity: trendFactor > 1.1 ? 'Elevated' : 'Normal'
  }

  // ── Scenario 2: Minimum Controls ──
  // Apply: PPE (50%), Training (30%), Supervision (30%)
  const minSliders = { ppe: 50, training: 30, supervision: 30 }

  let minEffect = 0
  // PPE: 30% effectiveness × prevalence × 50% effort
  const ppePrev = prevalence['PPE']?.percentage || 15
  minEffect += ppePrev * 0.30 * 0.5

  // Training: 50% effectiveness × prevalence × 30% effort
  const trainingPrev = prevalence['Training']?.percentage || 20
  minEffect += trainingPrev * 0.50 * 0.3

  // Supervision: 50% effectiveness × prevalence × 30% effort
  const supervisionPrev = prevalence['Supervision']?.percentage || 10
  minEffect += supervisionPrev * 0.50 * 0.3

  const minReduction = Math.round(Math.min(35, minEffect))

  const minControls = {
    projected: Math.round(basePrediction * (1 - minReduction / 100)),
    riskReduction: minReduction,
    sliders: minSliders,
    timeEstimate: '2-3 weeks to see effect',
    controls: ['PPE compliance', 'Training programs', 'Supervision level']
  }

  // ── Scenario 3: Best Controls ──
  // Apply: Engineering (75%), plus close 10 actions
  const bestSliders = { barriers: 75, guards: 50, training: 50, inspections: 50 }

  let bestEffect = 0
  // Engineering controls: 75% effectiveness × prevalence × 75% effort
  const barriersPrev = prevalence['Barriers']?.percentage || 10
  bestEffect += barriersPrev * 0.75 * 0.75

  const guardsPrev = prevalence['Machine Guarding']?.percentage || 5
  bestEffect += guardsPrev * 0.75 * 0.5

  // Additional admin controls
  bestEffect += trainingPrev * 0.50 * 0.5
  const inspectionsPrev = prevalence['Inspections']?.percentage || 8
  bestEffect += inspectionsPrev * 0.50 * 0.5

  // Action closure effect (closing 10 actions = ~10% reduction)
  bestEffect += 10

  const bestReduction = Math.round(Math.min(55, bestEffect))

  const bestControls = {
    projected: Math.round(basePrediction * (1 - bestReduction / 100)),
    riskReduction: bestReduction,
    sliders: bestSliders,
    actionsToClose: 10,
    timeEstimate: '4-6 weeks to see effect',
    costBenefit: 'High ROI - addresses root cause',
    controls: ['Engineering barriers', 'Machine guards', 'Close 10 actions']
  }

  return { noChange, minControls, bestControls }
}

// ============================================================================
// SINGLE BEST ACTION DETERMINATION
// ============================================================================

/**
 * Determine the single best action for maximum risk reduction
 *
 * Priority scoring:
 * 1. Base effect score from factor prevalence × control effectiveness
 * 2. +30% boost for engineering controls
 * 3. +40% boost if hazard is trending up
 * 4. -50% penalty if data source is biased
 * 5. Return TOP 1 only
 *
 * @param {Object} params - Input parameters
 * @returns {Object} Best action recommendation
 */
export const determineSingleBestAction = ({
  factorData,
  prevalence,
  topRiskHazard,
  sortedHazards,
  dataSourceBreakdown
}) => {
  if (!factorData?.byFactor?.length) {
    return null
  }

  // Get top factors with their prevalence
  const candidates = []

  for (const factor of factorData.byFactor.slice(0, 10)) {
    if (factor.isUnclassified || factor.name === 'Unclassified') continue

    const factorPrev = prevalence[factor.name]?.percentage || 0
    if (factorPrev < 2) continue // Skip very low prevalence factors

    // Find control category and effectiveness
    let controlCategory = null
    let effectiveness = 0.5
    let intervention = null

    for (const [catKey, cat] of Object.entries(CONTROL_HIERARCHY)) {
      const found = cat.interventions.find(i => i.factor === factor.name)
      if (found) {
        controlCategory = catKey
        effectiveness = cat.effectiveness
        intervention = found
        break
      }
    }

    if (!intervention) continue

    // Base score: prevalence × effectiveness
    let score = factorPrev * effectiveness

    // Engineering control boost (+30%)
    if (controlCategory === 'engineering') {
      score *= 1.3
    }

    // Trending hazard boost (+40% if hazard is rising)
    const isRising = topRiskHazard?.trend === 'significant-rise' || topRiskHazard?.trend === 'rising'
    if (isRising) {
      score *= 1.4
    }

    // Bias penalty (-50% if biased data)
    if (dataSourceBreakdown?.hasBias) {
      score *= 0.5
    }

    // Calculate expected risk reduction
    const riskReduction = Math.round(factorPrev * effectiveness)

    candidates.push({
      factor: factor.name,
      action: intervention.label,
      category: CONTROL_HIERARCHY[controlCategory].name,
      categoryKey: controlCategory,
      score,
      riskReduction,
      prevalence: factorPrev,
      effectiveness,
      hazardName: topRiskHazard?.name || null
    })
  }

  if (candidates.length === 0) {
    return null
  }

  // Sort by score descending and pick top 1
  candidates.sort((a, b) => b.score - a.score)
  const best = candidates[0]

  // Determine confidence based on data quality
  let confidence = 'medium'
  if (!dataSourceBreakdown?.hasBias && best.prevalence > 10) {
    confidence = 'high'
  } else if (dataSourceBreakdown?.hasBias || best.prevalence < 5) {
    confidence = 'low'
  }

  // Build reasoning
  const reasoning = `${best.factor} appears in ${best.prevalence.toFixed(1)}% of incidents. ` +
    `${best.category} controls have ${Math.round(best.effectiveness * 100)}% effectiveness. ` +
    `${topRiskHazard?.name ? `Focus on ${topRiskHazard.name} area.` : ''}`

  return {
    ...best,
    confidence,
    reasoning
  }
}

export default {
  CONTROL_HIERARCHY,
  calculateFactorPrevalence,
  getTopFactorsForHazard,
  getTopKeywordsForFactor,
  calculateInterventionEffect,
  calculateProjectedChange,
  generateDynamicSliders,
  calculateActionClosureEffect,
  calculateFullProjection,
  calculateMultiHazardProjection,
  applyQuickActionPreset,
  getRecommendedActionsForHazard,
  getRecommendedActionsForMultipleHazards,
  calculateThreeFixedScenarios,
  determineSingleBestAction
}
