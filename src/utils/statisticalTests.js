// ============================================================================
// STATISTICAL DIAGNOSTIC TESTS
// Tests that flag when models are unreliable
// ============================================================================

/**
 * Test normality via skewness and kurtosis (Jarque-Bera approximation)
 * Warns when Z-score anomaly detection is unreliable
 *
 * @param {number[]} values - Time series values
 * @returns {Object} { skewness, kurtosis, isNormal, warning }
 */
export const testNormality = (values) => {
  const n = values.length
  if (n < 8) {
    return { skewness: 0, kurtosis: 0, isNormal: false, warning: 'Insufficient data for normality test (need 8+)' }
  }

  const mean = values.reduce((a, b) => a + b, 0) / n
  let m2 = 0, m3 = 0, m4 = 0
  for (const v of values) {
    const d = v - mean
    m2 += d * d
    m3 += d * d * d
    m4 += d * d * d * d
  }
  m2 /= n
  m3 /= n
  m4 /= n

  const sd = Math.sqrt(m2)
  if (sd === 0) {
    return { skewness: 0, kurtosis: 0, isNormal: true, warning: 'All values are identical' }
  }

  const skewness = m3 / Math.pow(sd, 3)
  const kurtosis = m4 / Math.pow(sd, 4) - 3 // excess kurtosis (normal = 0)

  // Jarque-Bera test statistic
  const jb = (n / 6) * (skewness * skewness + (kurtosis * kurtosis) / 4)
  // Chi-squared critical value at 95% with 2 df ≈ 5.99
  const isNormal = jb < 5.99

  let warning = null
  if (!isNormal) {
    if (Math.abs(skewness) > 1) {
      warning = `Data is ${skewness > 0 ? 'right' : 'left'}-skewed (${Math.round(skewness * 100) / 100}). Z-score anomaly detection may be unreliable.`
    } else if (Math.abs(kurtosis) > 2) {
      warning = `Heavy tails detected (kurtosis=${Math.round(kurtosis * 100) / 100}). Extreme values may be underdetected.`
    } else {
      warning = 'Data departs from normal distribution. Consider non-parametric methods.'
    }
  }

  return {
    skewness: Math.round(skewness * 100) / 100,
    kurtosis: Math.round(kurtosis * 100) / 100,
    isNormal,
    jbStatistic: Math.round(jb * 100) / 100,
    warning,
  }
}

/**
 * Durbin-Watson test for autocorrelation in residuals
 * Detects when consecutive observations are correlated (violates independence assumption)
 *
 * DW ≈ 2: no autocorrelation
 * DW < 1.5: positive autocorrelation (recommend time-series model)
 * DW > 2.5: negative autocorrelation
 *
 * @param {number[]} residuals - Model residuals (actual - predicted)
 * @returns {Object} { statistic, interpretation, hasAutocorrelation, warning }
 */
export const durbinWatsonTest = (residuals) => {
  const n = residuals.length
  if (n < 3) {
    return { statistic: 2, interpretation: 'insufficient_data', hasAutocorrelation: false, warning: null }
  }

  let sumSqDiff = 0
  let sumSq = 0
  for (let i = 0; i < n; i++) {
    sumSq += residuals[i] * residuals[i]
    if (i > 0) {
      sumSqDiff += Math.pow(residuals[i] - residuals[i - 1], 2)
    }
  }

  const dw = sumSq > 0 ? sumSqDiff / sumSq : 2

  let interpretation = 'none'
  let hasAutocorrelation = false
  let warning = null

  if (dw < 1.5) {
    interpretation = 'positive'
    hasAutocorrelation = true
    warning = `Positive autocorrelation detected (DW=${Math.round(dw * 100) / 100}). A time-series model (Holt-Winters) is recommended.`
  } else if (dw > 2.5) {
    interpretation = 'negative'
    hasAutocorrelation = true
    warning = `Negative autocorrelation detected (DW=${Math.round(dw * 100) / 100}). Check for over-differencing.`
  }

  return {
    statistic: Math.round(dw * 100) / 100,
    interpretation,
    hasAutocorrelation,
    warning,
  }
}

/**
 * Zero-inflation detection for count data
 * Checks if there are more zeros than expected under Poisson distribution
 *
 * @param {number[]} values - Count data
 * @returns {Object} { zeroPercent, expectedZeroPercent, isZeroInflated, recommendation }
 */
export const detectZeroInflation = (values) => {
  const n = values.length
  if (n === 0) return { zeroPercent: 0, expectedZeroPercent: 0, isZeroInflated: false, recommendation: null }

  const zeros = values.filter(v => v === 0).length
  const zeroPercent = Math.round((zeros / n) * 100)
  const mean = values.reduce((a, b) => a + b, 0) / n

  // Expected zeros under Poisson: P(X=0) = e^(-lambda)
  const expectedZeroPercent = Math.round(Math.exp(-mean) * 100)

  const isZeroInflated = zeroPercent > Math.max(30, expectedZeroPercent * 1.5)

  return {
    zeroPercent,
    expectedZeroPercent,
    isZeroInflated,
    recommendation: isZeroInflated
      ? 'Aggregate to weekly data for more reliable analysis. Daily data has too many zero-count days.'
      : null,
  }
}

/**
 * Bonferroni correction for multiple testing
 * Adjusts significance threshold when testing multiple hazards simultaneously
 *
 * @param {number} alpha - Original significance level (e.g., 0.05)
 * @param {number} numTests - Number of simultaneous tests
 * @returns {Object} { adjustedAlpha, zThreshold, original }
 */
export const bonferroniAdjust = (alpha = 0.05, numTests = 1) => {
  if (numTests <= 1) return { adjustedAlpha: alpha, zThreshold: 1.96, original: alpha }
  const adjustedAlpha = alpha / numTests
  // Approximate Z-threshold from adjusted alpha
  // Using Abramowitz & Stegun approximation for inverse normal
  const p = adjustedAlpha / 2
  const t = Math.sqrt(-2 * Math.log(p))
  const zThreshold = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) /
    (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)

  return {
    adjustedAlpha: Math.round(adjustedAlpha * 10000) / 10000,
    zThreshold: Math.round(zThreshold * 100) / 100,
    original: alpha,
    numTests,
  }
}

/**
 * Run all diagnostic tests on a time series
 * @param {number[]} values - Raw time series values
 * @param {number[]} residuals - Model residuals (optional)
 * @param {number} numHazards - Number of hazards being tested simultaneously
 * @returns {Object} Combined diagnostics with overall health status
 */
export const runDiagnostics = (values, residuals = null, numHazards = 1) => {
  const normality = testNormality(values)
  const zeroInflation = detectZeroInflation(values)
  const bonferroni = bonferroniAdjust(0.05, numHazards)

  let autocorrelation = null
  if (residuals?.length >= 3) {
    autocorrelation = durbinWatsonTest(residuals)
  }

  // Overall health score
  const warnings = [
    normality.warning,
    autocorrelation?.warning,
    zeroInflation.recommendation,
  ].filter(Boolean)

  let health = 'good'
  if (warnings.length >= 2) health = 'poor'
  else if (warnings.length === 1) health = 'fair'

  return {
    normality,
    autocorrelation,
    zeroInflation,
    bonferroni,
    warnings,
    health,
  }
}
