import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react'

/**
 * PredictionMethodologyDisclosure - Collapsible "How it works" explanation panel
 * Provides transparency about the prediction algorithms used
 */
const PredictionMethodologyDisclosure = ({ methodology }) => {
  const [isOpen, setIsOpen] = useState(false)

  const defaultMethodology = {
    countForecast: 'Linear regression with 95% confidence intervals',
    typeProbability: 'Exponential weighted moving average (α=0.4, 6-month lookback)',
    riskScore: 'Probability × Severity × Trend Multiplier'
  }

  const methods = methodology || defaultMethodology

  const methodologyDetails = [
    {
      title: 'Incident Count Forecasting',
      description: methods.countForecast,
      details: [
        'Uses historical daily incident counts to fit a linear trend line',
        'Projects future values based on the trend direction and slope',
        'Confidence range represents 95% prediction interval',
        'Weekly forecasts aggregate 7 daily predictions; monthly uses 30 days'
      ]
    },
    {
      title: 'Type Probability Prediction',
      description: methods.typeProbability,
      details: [
        'Analyzes incident type distribution (LTI/MTI/FAC) over past 6 months',
        'Recent months weighted higher using exponential decay (α=0.4)',
        'Trend detected by comparing recent 3 months vs. older 3 months',
        'Probabilities normalized to sum to 100%'
      ]
    },
    {
      title: 'Risk Score Calculation',
      description: methods.riskScore,
      details: [
        'Severity weights: LTI=10, MTI=5, FAC=2, Near-Miss=1',
        'Trend multipliers: Increasing=1.2×, Stable=1.0×, Decreasing=0.8×',
        'Final score = Probability × Severity Weight × Trend Multiplier',
        'Normalized to 0-100 scale for comparison'
      ]
    }
  ]

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors"
      >
        <HelpCircle size={16} />
        <span>How are predictions calculated?</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="mt-3 bg-surface-50 rounded-lg border border-surface-200 p-4 space-y-4">
          <div className="flex items-start gap-2 pb-3 border-b border-surface-200">
            <Info size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-surface-600">
              These predictions are based on historical patterns in your data.
              They provide estimates to help with planning, but actual results may vary.
              All projected values are shown with dashed borders.
            </p>
          </div>

          {methodologyDetails.map((method, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-sm font-semibold text-surface-700">
                {method.title}
              </h4>
              <p className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block">
                {method.description}
              </p>
              <ul className="space-y-1 ml-4">
                {method.details.map((detail, idx) => (
                  <li key={idx} className="text-xs text-surface-600 list-disc">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-3 border-t border-surface-200">
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
              Data Representation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 border-2 border-dashed border-surface-400 rounded" />
                <span className="text-surface-600">Dashed border = Projected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 bg-surface-50 rounded border border-surface-200" />
                <span className="text-surface-600">Muted background</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed' }} />
                <span className="text-surface-600">Dashed line = Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  PROJECTED
                </span>
                <span className="text-surface-600">Label badge</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-200">
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
              Confidence Levels
            </h4>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-safety-success-light text-safety-success font-medium">
                  High
                </span>
                <span className="text-surface-500">R² &gt; 0.7</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                  Medium
                </span>
                <span className="text-surface-500">R² 0.4-0.7</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-surface-100 text-surface-500 font-medium">
                  Low
                </span>
                <span className="text-surface-500">R² &lt; 0.4</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(PredictionMethodologyDisclosure)
