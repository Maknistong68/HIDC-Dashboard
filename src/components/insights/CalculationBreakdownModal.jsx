import React from 'react'
import { X, Calculator, TrendingUp, TrendingDown, Minus, AlertCircle, Info } from 'lucide-react'

/**
 * CalculationBreakdownModal - Shows detailed calculation breakdown for predictions
 * Helps users understand exactly how each number was derived
 */
const CalculationBreakdownModal = ({ isOpen, onClose, type, data }) => {
  if (!isOpen) return null

  const renderContent = () => {
    switch (type) {
      case 'weekly':
      case 'monthly':
        return <ForecastBreakdown data={data} period={type} />
      case 'typeProbability':
        return <TypeProbabilityBreakdown data={data} />
      case 'riskAssessment':
        return <RiskAssessmentBreakdown data={data} />
      case 'scenario':
        return <ScenarioBreakdown data={data} />
      default:
        return <p className="text-surface-500">No breakdown available</p>
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'weekly': return 'Weekly Forecast Calculation'
      case 'monthly': return 'Monthly Forecast Calculation'
      case 'typeProbability': return 'Type Probability Calculation'
      case 'riskAssessment': return 'Risk Assessment Calculation'
      case 'scenario': return 'Scenario Impact Calculation'
      default: return 'Calculation Breakdown'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-surface-900">{getTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-surface-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200 bg-surface-50">
          <div className="flex items-start gap-2 text-xs text-surface-500">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              These calculations are statistical estimates based on historical data.
              Actual outcomes may vary due to factors not captured in the model.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * ForecastBreakdown - Shows linear regression calculation for weekly/monthly forecasts
 */
const ForecastBreakdown = ({ data, period }) => {
  const { predicted, range, trend, confidence, changePercent, model, historical, summary } = data || {}

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-800 mb-2">Result</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary-700">{predicted}</span>
          <span className="text-sm text-primary-600">predicted incidents {period === 'weekly' ? 'next week' : 'next month'}</span>
        </div>
        {range && (
          <p className="text-sm text-primary-600 mt-1">
            95% confidence range: {range.min} - {range.max}
          </p>
        )}
      </div>

      {/* Method Explanation */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
          <Info size={16} className="text-blue-500" />
          Method: Linear Regression
        </h4>
        <div className="bg-surface-50 rounded-lg p-4 space-y-3">
          <p className="text-sm text-surface-600">
            Linear regression finds the best-fit line through historical data points and extends it to predict future values.
          </p>

          {model && (
            <div className="bg-white rounded border border-surface-200 p-3">
              <p className="text-xs font-mono text-surface-700 mb-2">Formula:</p>
              <p className="text-sm font-mono bg-surface-100 p-2 rounded">
                Predicted = {model.intercept?.toFixed(2)} + ({model.slope?.toFixed(4)} × day_number)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step by Step */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Step-by-Step Calculation</h4>
        <div className="space-y-3">
          <Step
            number={1}
            title="Gather Historical Data"
            description={`Used ${summary?.dataPoints || historical?.length || '90'} days of incident data`}
          />

          <Step
            number={2}
            title="Calculate Average"
            description={`Historical average: ${summary?.avgHistorical || '-'} incidents/day`}
          />

          <Step
            number={3}
            title="Fit Regression Line"
            description={
              model ? (
                <>
                  Slope: {model.slope?.toFixed(4)} (incidents/day change rate)<br/>
                  Intercept: {model.intercept?.toFixed(2)}<br/>
                  R² (fit quality): {(model.rSquared * 100)?.toFixed(1)}%
                </>
              ) : 'Calculating best-fit line through data points'
            }
          />

          <Step
            number={4}
            title="Project Forward"
            description={`Multiply daily prediction by ${period === 'weekly' ? '7' : '30'} days = ${predicted} incidents`}
          />

          <Step
            number={5}
            title="Calculate Confidence Range"
            description={`Using 95% confidence interval: ${range?.min} to ${range?.max}`}
          />
        </div>
      </div>

      {/* Confidence Explanation */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-2">Why "{confidence}" confidence?</h4>
        <div className={`p-3 rounded-lg ${
          confidence === 'high' ? 'bg-green-50 text-green-800' :
          confidence === 'medium' ? 'bg-amber-50 text-amber-800' :
          'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm">
            {confidence === 'high' && (
              <>R² is above 70%, meaning the trend line fits the data well. Historical patterns are consistent.</>
            )}
            {confidence === 'medium' && (
              <>R² is between 40-70%. The trend line has moderate fit. Some variation in historical data.</>
            )}
            {confidence === 'low' && (
              <>R² is below 40%. Historical data is highly variable. Prediction may not be reliable.</>
            )}
          </p>
        </div>
      </div>

      {/* Trend Explanation */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-2">Why "{trend}" trend?</h4>
        <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-lg">
          {trend === 'increasing' && <TrendingUp className="text-red-500" size={20} />}
          {trend === 'decreasing' && <TrendingDown className="text-green-500" size={20} />}
          {trend === 'stable' && <Minus className="text-surface-400" size={20} />}
          <p className="text-sm text-surface-700">
            {trend === 'increasing' && `Slope is positive (${model?.slope?.toFixed(4)}), indicating upward trend. Change: +${changePercent}%`}
            {trend === 'decreasing' && `Slope is negative (${model?.slope?.toFixed(4)}), indicating downward trend. Change: ${changePercent}%`}
            {trend === 'stable' && `Slope is near zero (${model?.slope?.toFixed(4)}), indicating little change. Change: ${changePercent}%`}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * TypeProbabilityBreakdown - Shows how type probabilities were calculated
 */
const TypeProbabilityBreakdown = ({ data }) => {
  const { types, monthlyData, lookbackMonths } = data || {}

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-800 mb-3">Probability Distribution</h4>
        <div className="space-y-2">
          {types?.map(t => (
            <div key={t.type} className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: t.color }}>{t.label}</span>
              <span className="text-sm font-bold">{t.probability}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Method Explanation */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
          <Info size={16} className="text-blue-500" />
          Method: Exponential Weighted Moving Average
        </h4>
        <div className="bg-surface-50 rounded-lg p-4 space-y-3">
          <p className="text-sm text-surface-600">
            Recent months are weighted more heavily than older months. This captures recent changes in incident patterns.
          </p>

          <div className="bg-white rounded border border-surface-200 p-3">
            <p className="text-xs font-mono text-surface-700 mb-2">Formula:</p>
            <p className="text-sm font-mono bg-surface-100 p-2 rounded">
              Weight = (1 - 0.4)^months_ago
            </p>
            <p className="text-xs text-surface-500 mt-2">
              Decay factor α = 0.4 means each month has 60% the weight of the previous month
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Weights */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Monthly Weights Applied</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-100">
                <th className="text-left p-2 font-medium text-surface-600">Month</th>
                <th className="text-right p-2 font-medium text-surface-600">Months Ago</th>
                <th className="text-right p-2 font-medium text-surface-600">Weight</th>
                <th className="text-right p-2 font-medium text-surface-600">Total Incidents</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData?.slice(0, 6).map((m, i) => (
                <tr key={m.month} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-50'}>
                  <td className="p-2">{m.month}</td>
                  <td className="p-2 text-right">{m.monthsAgo}</td>
                  <td className="p-2 text-right font-mono">{m.weight?.toFixed(3)}</td>
                  <td className="p-2 text-right">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculation Example */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Example Calculation</h4>
        <div className="bg-surface-50 rounded-lg p-4">
          {types?.[0] && (
            <div className="space-y-2 text-sm text-surface-700">
              <p><strong>For {types[0].label}:</strong></p>
              <p>1. Sum weighted counts: Σ(count × weight) = {types[0].weightedCount?.toFixed(2)}</p>
              <p>2. Sum all type weighted counts: Total = {types?.reduce((s, t) => s + (t.weightedCount || 0), 0).toFixed(2)}</p>
              <p>3. Probability = {types[0].weightedCount?.toFixed(2)} / {types?.reduce((s, t) => s + (t.weightedCount || 0), 0).toFixed(2)} × 100 = <strong>{types[0].probability}%</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * RiskAssessmentBreakdown - Shows how risk scores were calculated
 */
const RiskAssessmentBreakdown = ({ data }) => {
  const { risks } = data || {}

  const severityWeights = {
    lti: { label: 'LTI', weight: 10, reason: 'Lost time injuries are most severe' },
    mti: { label: 'MTI', weight: 5, reason: 'Medical treatment required' },
    fac: { label: 'FAC', weight: 2, reason: 'First aid only' },
    'near-miss': { label: 'Near Miss', weight: 1, reason: 'No injury but potential' }
  }

  const trendMultipliers = {
    increasing: { value: 1.2, label: '+20%', reason: 'Rising trends increase risk' },
    stable: { value: 1.0, label: '0%', reason: 'No trend adjustment' },
    decreasing: { value: 0.8, label: '-20%', reason: 'Declining trends reduce risk' }
  }

  return (
    <div className="space-y-6">
      {/* Formula Overview */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-800 mb-3">Risk Score Formula</h4>
        <div className="bg-white rounded border border-primary-200 p-3">
          <p className="text-sm font-mono text-center">
            Risk Score = (Probability / 100) × Severity Weight × Trend Multiplier
          </p>
        </div>
        <p className="text-xs text-primary-600 mt-2 text-center">
          Normalized to 0-100 scale (max possible = 12)
        </p>
      </div>

      {/* Severity Weights */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Severity Weights</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(severityWeights).map(([key, val]) => (
            <div key={key} className="bg-surface-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-surface-700">{val.label}</span>
                <span className="text-lg font-bold text-surface-800">{val.weight}</span>
              </div>
              <p className="text-xs text-surface-500">{val.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Multipliers */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Trend Multipliers</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(trendMultipliers).map(([key, val]) => (
            <div key={key} className="bg-surface-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {key === 'increasing' && <TrendingUp size={14} className="text-red-500" />}
                {key === 'decreasing' && <TrendingDown size={14} className="text-green-500" />}
                {key === 'stable' && <Minus size={14} className="text-surface-400" />}
                <span className="text-sm font-medium text-surface-700 capitalize">{key}</span>
              </div>
              <p className="text-lg font-bold text-surface-800">×{val.value}</p>
              <p className="text-xs text-surface-500">{val.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Calculations */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Calculations for Each Type</h4>
        <div className="space-y-3">
          {risks?.map(risk => {
            const severity = severityWeights[risk.type]?.weight || 1
            const trendMult = trendMultipliers[risk.trend]?.value || 1
            const rawScore = (risk.probability / 100) * severity * trendMult

            return (
              <div key={risk.type} className="bg-surface-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold" style={{ color: risk.color }}>{risk.label}</span>
                  <span className="text-lg font-bold">{risk.riskScore}%</span>
                </div>
                <div className="text-sm text-surface-600 font-mono bg-white p-2 rounded">
                  ({risk.probability}% / 100) × {severity} × {trendMult} = {rawScore.toFixed(3)}
                  <br/>
                  Normalized: ({rawScore.toFixed(3)} / 12) × 100 = <strong>{risk.riskScore}%</strong>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                  <span>Probability: {risk.probability}%</span>
                  <span>Severity: {severity}</span>
                  <span>Trend: {risk.trend} (×{trendMult})</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * ScenarioBreakdown - Shows how scenario projections were calculated
 */
const ScenarioBreakdown = ({ data }) => {
  const { baseline, projected, effects, sliderData, sliders } = data || {}

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-800 mb-2">Projected Outcome</h4>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-primary-700">{projected}</span>
          <span className="text-sm text-primary-600">incidents/week</span>
          <span className="text-sm text-surface-500">(baseline: {baseline})</span>
        </div>
      </div>

      {/* Formula */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Formula</h4>
        <div className="bg-surface-50 rounded-lg p-4">
          <p className="text-sm font-mono text-center">
            Projected = Baseline × (1 + Total Effect%)
          </p>
          <p className="text-sm font-mono text-center mt-2 bg-white p-2 rounded">
            {projected} = {baseline} × (1 + {((projected/baseline - 1) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Individual Effects */}
      <div>
        <h4 className="text-sm font-semibold text-surface-800 mb-3">Effect Breakdown</h4>
        <div className="space-y-3">
          <EffectRow
            label="Close Open Actions"
            value={sliders?.closeActions || 0}
            unit=" actions"
            effect={effects?.openActions}
            formula={`Each closed action = ~2.5% reduction (max 15% total)`}
            calculation={`${sliders?.closeActions || 0} / ${sliderData?.openActionsCount || 1} × -15% = ${effects?.openActions?.toFixed(1)}%`}
          />

          <EffectRow
            label="Training Hours"
            value={sliders?.training || 0}
            unit="%"
            effect={effects?.training}
            formula={`Training root-cause % × slider × 0.8`}
            calculation={`${sliderData?.trainingPercent || 0}% × ${sliders?.training || 0}% × 0.8 = ${effects?.training?.toFixed(1)}%`}
          />

          <EffectRow
            label="Inspection Frequency"
            value={sliders?.inspection || 0}
            unit="%"
            effect={effects?.inspection}
            formula={`+10% inspection = ~1.5% reduction`}
            calculation={`${sliders?.inspection || 0} × -0.15 = ${effects?.inspection?.toFixed(1)}%`}
          />

          <EffectRow
            label="Supervision Level"
            value={sliders?.supervision || 0}
            unit="%"
            effect={effects?.supervision}
            formula={`Supervision root-cause % × slider × 0.8`}
            calculation={`${sliderData?.supervisionPercent || 0}% × ${sliders?.supervision || 0}% × 0.8 = ${effects?.supervision?.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Total Effect */}
      <div className="bg-surface-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-surface-700">Total Combined Effect:</span>
          <span className={`text-lg font-bold ${
            (effects?.openActions + effects?.training + effects?.inspection + effects?.supervision) < 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {((effects?.openActions || 0) + (effects?.training || 0) + (effects?.inspection || 0) + (effects?.supervision || 0)).toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-surface-500">
          Note: Total effect is capped between -60% and +40% to maintain realistic projections.
        </p>
      </div>
    </div>
  )
}

/**
 * Helper Components
 */
const Step = ({ number, title, description }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
      {number}
    </div>
    <div>
      <p className="text-sm font-medium text-surface-800">{title}</p>
      <p className="text-sm text-surface-600">{description}</p>
    </div>
  </div>
)

const EffectRow = ({ label, value, unit, effect, formula, calculation }) => (
  <div className="bg-surface-50 rounded-lg p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-surface-700">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-surface-500">Input: {value}{unit}</span>
        <span className={`text-sm font-bold ${effect < 0 ? 'text-green-600' : effect > 0 ? 'text-red-600' : 'text-surface-500'}`}>
          Effect: {effect?.toFixed(1)}%
        </span>
      </div>
    </div>
    <div className="text-xs text-surface-500 space-y-1">
      <p>Formula: {formula}</p>
      <p className="font-mono bg-white p-1 rounded">{calculation}</p>
    </div>
  </div>
)

export default CalculationBreakdownModal
