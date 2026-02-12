// ============================================================================
// FORECAST VALIDATION - Walk-forward backtesting & error metrics
// ============================================================================

/**
 * Calculate error metrics between actual and predicted values
 * @param {number[]} actual - Actual observed values
 * @param {number[]} predicted - Predicted values
 * @returns {Object} { rmse, mae, mape, n }
 */
export const calculateErrorMetrics = (actual, predicted) => {
  const n = Math.min(actual.length, predicted.length)
  if (n === 0) return { rmse: 0, mae: 0, mape: 0, n: 0 }

  let sumSqErr = 0
  let sumAbsErr = 0
  let sumAbsPctErr = 0
  let nonZeroCount = 0

  for (let i = 0; i < n; i++) {
    const err = actual[i] - predicted[i]
    sumSqErr += err * err
    sumAbsErr += Math.abs(err)
    if (actual[i] > 0) {
      sumAbsPctErr += Math.abs(err) / actual[i]
      nonZeroCount++
    }
  }

  return {
    rmse: Math.sqrt(sumSqErr / n),
    mae: sumAbsErr / n,
    mape: nonZeroCount > 0 ? (sumAbsPctErr / nonZeroCount) * 100 : 0,
    n,
  }
}

/**
 * Naive baseline: predict next value = last observed value ("same as last period")
 * @param {number[]} values - Time series values
 * @param {number} horizon - How many steps ahead to predict
 * @returns {number[]} Predicted values (all equal to last observed)
 */
export const naiveBaseline = (values, horizon = 1) => {
  if (!values.length) return Array(horizon).fill(0)
  const last = values[values.length - 1]
  return Array(horizon).fill(last)
}

/**
 * Simple linear regression predictor (matches forecastIncidents logic)
 * Returns predicted values for positions n..n+horizon-1
 */
const linearRegressionPredict = (values, horizon) => {
  const n = values.length
  if (n < 2) return Array(horizon).fill(values[0] || 0)

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

  const predictions = []
  for (let i = 0; i < horizon; i++) {
    predictions.push(Math.max(0, slope * (n + i) + intercept))
  }
  return predictions
}

/**
 * Walk-forward validation: train on months 1..N, test on month N+1, repeat
 * @param {number[]} dailyValues - Daily incident counts
 * @param {number} windowSize - Minimum training window (days)
 * @param {number} stepSize - Test window size (days)
 * @returns {Object} { metrics, naiveMetrics, modelBeatsNaive, accuracy, badge }
 */
export const walkForwardValidation = (dailyValues, windowSize = 30, stepSize = 7) => {
  if (dailyValues.length < windowSize + stepSize) {
    return {
      metrics: null,
      naiveMetrics: null,
      modelBeatsNaive: false,
      accuracy: 0,
      badge: 'insufficient',
      folds: 0,
    }
  }

  const allActual = []
  const allPredicted = []
  const allNaive = []
  let folds = 0

  for (let trainEnd = windowSize; trainEnd + stepSize <= dailyValues.length; trainEnd += stepSize) {
    const trainData = dailyValues.slice(0, trainEnd)
    const testData = dailyValues.slice(trainEnd, trainEnd + stepSize)

    // Model predictions
    const modelPred = linearRegressionPredict(trainData, stepSize)

    // Naive predictions
    const naivePred = naiveBaseline(trainData, stepSize)

    for (let i = 0; i < testData.length; i++) {
      allActual.push(testData[i])
      allPredicted.push(modelPred[i])
      allNaive.push(naivePred[i])
    }
    folds++
  }

  if (folds === 0) {
    return { metrics: null, naiveMetrics: null, modelBeatsNaive: false, accuracy: 0, badge: 'insufficient', folds: 0 }
  }

  const metrics = calculateErrorMetrics(allActual, allPredicted)
  const naiveMetrics = calculateErrorMetrics(allActual, allNaive)
  const modelBeatsNaive = metrics.rmse < naiveMetrics.rmse

  // Accuracy = 100 - MAPE (clamped 0-100)
  const accuracy = Math.max(0, Math.min(100, Math.round(100 - metrics.mape)))

  let badge = 'low'
  if (accuracy >= 80) badge = 'high'
  else if (accuracy >= 60) badge = 'medium'

  return {
    metrics: {
      rmse: Math.round(metrics.rmse * 100) / 100,
      mae: Math.round(metrics.mae * 100) / 100,
      mape: Math.round(metrics.mape * 10) / 10,
    },
    naiveMetrics: {
      rmse: Math.round(naiveMetrics.rmse * 100) / 100,
      mae: Math.round(naiveMetrics.mae * 100) / 100,
      mape: Math.round(naiveMetrics.mape * 10) / 10,
    },
    modelBeatsNaive,
    accuracy,
    badge,
    folds,
  }
}

/**
 * Compare model vs naive and return summary
 */
export const compareModels = (modelMetrics, naiveMetrics) => {
  if (!modelMetrics || !naiveMetrics) return null

  const improvement = naiveMetrics.rmse > 0
    ? Math.round(((naiveMetrics.rmse - modelMetrics.rmse) / naiveMetrics.rmse) * 100)
    : 0

  return {
    improvement,
    modelBetter: improvement > 0,
    summary: improvement > 0
      ? `Model is ${improvement}% better than naive baseline`
      : `Naive baseline performs ${Math.abs(improvement)}% better — model may be overfitting`,
  }
}
