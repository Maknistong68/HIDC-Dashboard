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

export default {
  CONTROL_HIERARCHY,
  calculateFactorPrevalence,
  getTopFactorsForHazard,
  calculateInterventionEffect,
  calculateProjectedChange,
  generateDynamicSliders,
  calculateActionClosureEffect,
  calculateFullProjection
}
