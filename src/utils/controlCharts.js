// ============================================================================
// SPC CONTROL CHARTS - XmR (Individuals & Moving Range)
// The most common SPC chart in HSE
// ============================================================================

/**
 * Calculate XmR control limits
 * CL = mean, UCL = CL + 2.66 * MR_bar, LCL = max(0, CL - 2.66 * MR_bar)
 *
 * @param {number[]} values - Individual measurements (daily counts)
 * @returns {Object} { cl, ucl, lcl, mrBar, values, movingRanges }
 */
export const calculateControlLimits = (values) => {
  const n = values.length
  if (n < 2) {
    return { cl: values[0] || 0, ucl: 0, lcl: 0, mrBar: 0, values, movingRanges: [] }
  }

  // Centerline = average
  const cl = values.reduce((a, b) => a + b, 0) / n

  // Moving ranges
  const movingRanges = []
  for (let i = 1; i < n; i++) {
    movingRanges.push(Math.abs(values[i] - values[i - 1]))
  }

  // Average moving range
  const mrBar = movingRanges.reduce((a, b) => a + b, 0) / movingRanges.length

  // Control limits (2.66 is the standard constant for XmR charts, d2=1.128, 3/d2≈2.66)
  const ucl = cl + 2.66 * mrBar
  const lcl = Math.max(0, cl - 2.66 * mrBar)

  return {
    cl: Math.round(cl * 100) / 100,
    ucl: Math.round(ucl * 100) / 100,
    lcl: Math.round(lcl * 100) / 100,
    mrBar: Math.round(mrBar * 100) / 100,
    values,
    movingRanges,
  }
}

/**
 * Detect Nelson Rules 1-4 for out-of-control signals
 *
 * Rule 1: Point beyond 3-sigma (UCL/LCL)
 * Rule 2: 9 consecutive points on same side of CL
 * Rule 3: 6 consecutive points steadily increasing or decreasing
 * Rule 4: 14 consecutive points alternating up and down
 *
 * @param {number[]} values - Individual measurements
 * @param {Object} limits - { cl, ucl, lcl }
 * @returns {Object[]} Array of { rule, index, description }
 */
export const detectNelsonRules = (values, limits) => {
  const { cl, ucl, lcl } = limits
  const violations = []

  // Rule 1: Beyond control limits
  for (let i = 0; i < values.length; i++) {
    if (values[i] > ucl) {
      violations.push({ rule: 1, index: i, description: `Point ${i + 1} above UCL (${values[i]} > ${ucl})` })
    } else if (values[i] < lcl) {
      violations.push({ rule: 1, index: i, description: `Point ${i + 1} below LCL (${values[i]} < ${lcl})` })
    }
  }

  // Rule 2: 9 consecutive points on same side of CL
  let aboveCount = 0
  let belowCount = 0
  for (let i = 0; i < values.length; i++) {
    if (values[i] > cl) {
      aboveCount++
      belowCount = 0
    } else if (values[i] < cl) {
      belowCount++
      aboveCount = 0
    } else {
      aboveCount = 0
      belowCount = 0
    }
    if (aboveCount >= 9) {
      violations.push({ rule: 2, index: i, description: `9+ consecutive points above centerline at point ${i + 1}` })
      aboveCount = 0 // Reset to avoid duplicate
    }
    if (belowCount >= 9) {
      violations.push({ rule: 2, index: i, description: `9+ consecutive points below centerline at point ${i + 1}` })
      belowCount = 0
    }
  }

  // Rule 3: 6 consecutive increasing or decreasing
  let increasing = 0
  let decreasing = 0
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) {
      increasing++
      decreasing = 0
    } else if (values[i] < values[i - 1]) {
      decreasing++
      increasing = 0
    } else {
      increasing = 0
      decreasing = 0
    }
    if (increasing >= 6) {
      violations.push({ rule: 3, index: i, description: `6+ consecutive increasing points at point ${i + 1}` })
      increasing = 0
    }
    if (decreasing >= 6) {
      violations.push({ rule: 3, index: i, description: `6+ consecutive decreasing points at point ${i + 1}` })
      decreasing = 0
    }
  }

  // Rule 4: 14 consecutive alternating points
  let alternating = 0
  for (let i = 2; i < values.length; i++) {
    const prevDir = values[i - 1] - values[i - 2]
    const currDir = values[i] - values[i - 1]
    if ((prevDir > 0 && currDir < 0) || (prevDir < 0 && currDir > 0)) {
      alternating++
    } else {
      alternating = 0
    }
    if (alternating >= 14) {
      violations.push({ rule: 4, index: i, description: `14+ alternating points at point ${i + 1}` })
      alternating = 0
    }
  }

  return violations
}

/**
 * Get process capability summary
 * @param {number[]} values - Measurements
 * @param {Object} limits - Control limits
 * @param {Object[]} violations - Nelson rule violations
 * @returns {Object} { inControl, outOfControlCount, status, violations }
 */
export const getProcessCapability = (values, limits, violations) => {
  const outOfControlIndices = new Set(violations.map(v => v.index))
  const outOfControlCount = outOfControlIndices.size
  const inControl = outOfControlCount === 0

  let status = 'in-control'
  if (outOfControlCount > values.length * 0.1) status = 'unstable'
  else if (outOfControlCount > 0) status = 'out-of-control'

  return {
    inControl,
    outOfControlCount,
    totalPoints: values.length,
    status,
    violations,
    outOfControlIndices: [...outOfControlIndices],
  }
}

/**
 * Complete XmR analysis: limits + Nelson rules + process capability
 * @param {number[]} values - Daily counts
 * @param {string[]} labels - Date labels for each value
 * @returns {Object} Full control chart data
 */
export const analyzeControlChart = (values, labels = []) => {
  const limits = calculateControlLimits(values)
  const violations = detectNelsonRules(values, limits)
  const capability = getProcessCapability(values, limits, violations)

  // Build chart data
  const outOfControlSet = new Set(capability.outOfControlIndices)
  const chartData = values.map((value, i) => ({
    index: i,
    label: labels[i] || `Day ${i + 1}`,
    value,
    cl: limits.cl,
    ucl: limits.ucl,
    lcl: limits.lcl,
    isOutOfControl: outOfControlSet.has(i),
  }))

  return {
    limits,
    violations,
    capability,
    chartData,
  }
}
