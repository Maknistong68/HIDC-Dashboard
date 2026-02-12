// ============================================================================
// FORECAST MODELS - Holt-Winters + Ensemble
// ============================================================================

/**
 * Detect zero-inflation: if >30% of days have zero incidents,
 * recommend weekly aggregation
 * @param {number[]} dailyValues - Daily counts
 * @returns {Object} { isZeroInflated, zeroPercent, recommendation }
 */
export const detectZeroInflation = (dailyValues) => {
  if (!dailyValues.length) return { isZeroInflated: false, zeroPercent: 0, recommendation: null }
  const zeros = dailyValues.filter(v => v === 0).length
  const pct = Math.round((zeros / dailyValues.length) * 100)
  return {
    isZeroInflated: pct > 30,
    zeroPercent: pct,
    recommendation: pct > 30 ? 'weekly' : 'daily',
  }
}

/**
 * Aggregate daily values to weekly sums
 * @param {number[]} dailyValues - Daily counts
 * @returns {number[]} Weekly sums
 */
export const aggregateToWeekly = (dailyValues) => {
  const weeks = []
  for (let i = 0; i < dailyValues.length; i += 7) {
    const chunk = dailyValues.slice(i, i + 7)
    weeks.push(chunk.reduce((a, b) => a + b, 0))
  }
  return weeks
}

/**
 * Holt-Winters Additive method
 * Captures level, trend, and seasonal (day-of-week) patterns
 *
 * @param {number[]} values - Time series values (daily or weekly)
 * @param {number} seasonLength - Season length (7 for daily=day-of-week, 1 for weekly)
 * @param {number} horizon - Number of steps to forecast
 * @param {Object} params - { alpha, beta, gamma } smoothing parameters
 * @returns {Object} { fitted, forecast, level, trend, seasonal }
 */
export const holtWintersAdditive = (
  values,
  seasonLength = 7,
  horizon = 30,
  params = { alpha: 0.3, beta: 0.1, gamma: 0.1 }
) => {
  const n = values.length
  if (n < seasonLength * 2) {
    // Not enough data for seasonal decomposition - fall back to simple exponential
    return simpleExponentialForecast(values, horizon, params.alpha)
  }

  const { alpha, beta, gamma } = params

  // Initialize level and trend from first season
  let level = values.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength
  let trend = 0
  if (n >= seasonLength * 2) {
    const s1Avg = values.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength
    const s2Avg = values.slice(seasonLength, seasonLength * 2).reduce((a, b) => a + b, 0) / seasonLength
    trend = (s2Avg - s1Avg) / seasonLength
  }

  // Initialize seasonal components from first season
  const seasonal = new Array(seasonLength)
  for (let i = 0; i < seasonLength; i++) {
    seasonal[i] = values[i] - level
  }

  // Fit the model
  const fitted = new Array(n)
  for (let t = 0; t < n; t++) {
    const sIdx = t % seasonLength
    const prevLevel = level
    const prevTrend = trend

    // Update equations
    level = alpha * (values[t] - seasonal[sIdx]) + (1 - alpha) * (prevLevel + prevTrend)
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend
    seasonal[sIdx] = gamma * (values[t] - level) + (1 - gamma) * seasonal[sIdx]

    fitted[t] = level + trend + seasonal[sIdx]
  }

  // Generate forecast
  const forecast = new Array(horizon)
  for (let h = 1; h <= horizon; h++) {
    const sIdx = (n + h - 1) % seasonLength
    forecast[h - 1] = Math.max(0, level + trend * h + seasonal[sIdx])
  }

  return { fitted, forecast, level, trend, seasonal: [...seasonal] }
}

/**
 * Simple exponential smoothing (fallback when not enough data for HW)
 */
const simpleExponentialForecast = (values, horizon, alpha = 0.3) => {
  const n = values.length
  if (n === 0) return { fitted: [], forecast: Array(horizon).fill(0), level: 0, trend: 0, seasonal: [] }

  const fitted = [values[0]]
  let smoothed = values[0]
  for (let i = 1; i < n; i++) {
    smoothed = alpha * values[i] + (1 - alpha) * smoothed
    fitted.push(smoothed)
  }

  return {
    fitted,
    forecast: Array(horizon).fill(Math.max(0, smoothed)),
    level: smoothed,
    trend: 0,
    seasonal: [],
  }
}

/**
 * Linear regression forecast (same logic as forecastIncidents, reusable)
 */
export const linearRegressionForecast = (values, horizon) => {
  const n = values.length
  if (n < 2) return { fitted: [...values], forecast: Array(horizon).fill(values[0] || 0) }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }
  const denom = n * sumX2 - sumX * sumX
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
  const intercept = (sumY - slope * sumX) / n

  const fitted = values.map((_, i) => Math.max(0, slope * i + intercept))
  const forecast = Array.from({ length: horizon }, (_, i) => Math.max(0, slope * (n + i) + intercept))

  return { fitted, forecast, slope, intercept }
}

/**
 * Ensemble forecast: weight models by backtested accuracy
 *
 * @param {number[]} dailyValues - Raw daily counts
 * @param {number} horizon - Days to forecast
 * @returns {Object} { forecast, models, weights, isWeekly }
 */
export const ensembleForecast = (dailyValues, horizon = 30) => {
  const zeroCheck = detectZeroInflation(dailyValues)
  const isWeekly = zeroCheck.isZeroInflated
  const values = isWeekly ? aggregateToWeekly(dailyValues) : dailyValues
  const forecastHorizon = isWeekly ? Math.ceil(horizon / 7) : horizon
  const seasonLength = isWeekly ? 1 : 7

  // Model 1: Linear Regression
  const lrResult = linearRegressionForecast(values, forecastHorizon)

  // Model 2: Holt-Winters
  const hwResult = holtWintersAdditive(values, seasonLength, forecastHorizon)

  // Model 3: Simple Exponential Smoothing
  const esResult = simpleExponentialForecast(values, forecastHorizon, 0.3)

  // Calculate in-sample error for weighting
  const calcError = (fitted) => {
    let sse = 0
    const n = Math.min(fitted.length, values.length)
    for (let i = 0; i < n; i++) {
      sse += Math.pow(values[i] - (fitted[i] || 0), 2)
    }
    return n > 0 ? Math.sqrt(sse / n) : Infinity
  }

  const errors = {
    lr: calcError(lrResult.fitted),
    hw: calcError(hwResult.fitted),
    es: calcError(esResult.fitted),
  }

  // Inverse-error weighting (lower error = higher weight)
  const invErrors = {
    lr: errors.lr > 0 ? 1 / errors.lr : 1,
    hw: errors.hw > 0 ? 1 / errors.hw : 1,
    es: errors.es > 0 ? 1 / errors.es : 1,
  }
  const sumInv = invErrors.lr + invErrors.hw + invErrors.es
  const weights = {
    lr: Math.round((invErrors.lr / sumInv) * 100) / 100,
    hw: Math.round((invErrors.hw / sumInv) * 100) / 100,
    es: Math.round((invErrors.es / sumInv) * 100) / 100,
  }

  // Weighted ensemble
  const ensemblePredictions = []
  for (let i = 0; i < forecastHorizon; i++) {
    const val = weights.lr * (lrResult.forecast[i] || 0)
      + weights.hw * (hwResult.forecast[i] || 0)
      + weights.es * (esResult.forecast[i] || 0)
    ensemblePredictions.push(Math.max(0, Math.round(val * 10) / 10))
  }

  // If weekly, expand back to daily (distribute evenly)
  let dailyForecast = ensemblePredictions
  if (isWeekly) {
    dailyForecast = []
    for (const weekVal of ensemblePredictions) {
      const daily = Math.round((weekVal / 7) * 10) / 10
      for (let d = 0; d < 7 && dailyForecast.length < horizon; d++) {
        dailyForecast.push(daily)
      }
    }
  }

  return {
    forecast: dailyForecast,
    models: {
      linearRegression: { error: Math.round(errors.lr * 100) / 100, weight: weights.lr },
      holtWinters: { error: Math.round(errors.hw * 100) / 100, weight: weights.hw },
      exponentialSmoothing: { error: Math.round(errors.es * 100) / 100, weight: weights.es },
    },
    weights,
    isWeekly,
    zeroInflation: zeroCheck,
  }
}
