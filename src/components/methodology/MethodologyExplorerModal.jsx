import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, TrendingUp, Shield, ChevronDown, ChevronRight, Calculator, Search } from 'lucide-react'
import {
  CONSEQUENCE_TYPE_MAP,
  CONSEQUENCE_LABELS,
  LIKELIHOOD_LABELS,
  getScoreColor,
  getRiskZone,
} from '../../utils/riskMatrix'

// ============================================================================
// SHARED SUB-COMPONENTS
// ============================================================================

const DeepDive = ({ title, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-surface-200 rounded-lg overflow-hidden mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-surface-50 hover:bg-surface-100 transition-colors text-left"
      >
        <span className="text-xs font-medium text-surface-700">{title}</span>
        {open ? <ChevronDown size={14} className="text-surface-400" /> : <ChevronRight size={14} className="text-surface-400" />}
      </button>
      {open && <div className="px-4 py-3 text-xs text-surface-600 leading-relaxed bg-white">{children}</div>}
    </div>
  )
}

const FormulaCard = ({ label, formula, note }) => (
  <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
    <span className="text-[10px] uppercase tracking-wider text-primary-500 font-medium">{label}</span>
    <code className="block text-sm text-primary-800 mt-1 font-mono">{formula}</code>
    {note && <p className="text-[10px] text-primary-500 mt-1">{note}</p>}
  </div>
)

// ============================================================================
// SECTION 1: ENSEMBLE FORECASTING
// ============================================================================

const WeightBar = ({ label, weight, color, error }) => {
  const pct = Math.round(weight * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-surface-600 w-28 truncate">{label}</span>
      <div className="flex-1 h-5 bg-surface-100 rounded-full overflow-hidden relative">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-surface-800">
          {pct}%
        </span>
      </div>
      <span className="text-[10px] text-surface-400 w-20 text-right">RMSE: {error}</span>
    </div>
  )
}

const EnsembleForecastingSection = ({ forecastData }) => {
  const ensemble = forecastData?.ensemble
  const summary = forecastData?.summary
  const model = forecastData?.model

  const hasEnsemble = ensemble && ensemble.weights
  const hasData = !!forecastData && !forecastData.error

  if (!hasData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-600" /> Ensemble Forecasting
        </h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-sm text-amber-700">{forecastData?.error || 'Insufficient data for forecasting. Import more observations to enable predictions.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
        <TrendingUp size={20} className="text-emerald-600" /> Ensemble Forecasting
      </h3>
      <p className="text-sm text-surface-600 leading-relaxed">
        Three independent statistical models are combined using inverse-error weighting. Models with lower prediction error get higher influence in the final 30-day forecast.
      </p>

      {/* Model weight bars */}
      {hasEnsemble && (
        <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-2.5">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-2">Model Weights (from your data)</h4>
          <WeightBar
            label="Holt-Winters"
            weight={ensemble.weights.hw}
            color="bg-emerald-400"
            error={ensemble.models.holtWinters.error}
          />
          <WeightBar
            label="Linear Regression"
            weight={ensemble.weights.lr}
            color="bg-blue-400"
            error={ensemble.models.linearRegression.error}
          />
          <WeightBar
            label="Exp. Smoothing"
            weight={ensemble.weights.es}
            color="bg-violet-400"
            error={ensemble.models.exponentialSmoothing.error}
          />
        </div>
      )}

      {/* Zero-inflation status */}
      {hasEnsemble && (
        <div className={`rounded-lg border p-3 ${ensemble.zeroInflation?.isZeroInflated ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${ensemble.zeroInflation?.isZeroInflated ? 'text-amber-700' : 'text-green-700'}`}>
              Zero-Inflation: {ensemble.zeroInflation?.isZeroInflated ? 'Active' : 'Not detected'}
            </span>
          </div>
          <p className="text-[10px] text-surface-500 mt-1">
            {ensemble.zeroInflation?.zeroPercent}% of days had zero incidents.
            {ensemble.zeroInflation?.isZeroInflated
              ? ' Data was aggregated to weekly totals before fitting models.'
              : ' Daily granularity used (threshold: >30%).'}
          </p>
        </div>
      )}

      {/* Forecast summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase">Avg Historical</p>
            <p className="text-lg font-bold text-surface-800">{summary.avgHistorical}</p>
            <p className="text-[10px] text-surface-400">per day</p>
          </div>
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase">Avg Forecast</p>
            <p className="text-lg font-bold text-surface-800">{summary.avgForecast}</p>
            <p className="text-[10px] text-surface-400">per day</p>
          </div>
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase">Trend</p>
            <p className={`text-lg font-bold ${model?.trend === 'increasing' ? 'text-red-600' : model?.trend === 'decreasing' ? 'text-green-600' : 'text-surface-600'}`}>
              {model?.trend === 'increasing' ? 'Rising' : model?.trend === 'decreasing' ? 'Declining' : 'Stable'}
            </p>
            <p className="text-[10px] text-surface-400">{model?.dailyChange > 0 ? '+' : ''}{model?.dailyChange}/day</p>
          </div>
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase">Confidence</p>
            <p className={`text-lg font-bold ${summary.confidence === 'high' ? 'text-green-600' : summary.confidence === 'medium' ? 'text-blue-600' : 'text-amber-600'}`}>
              {summary.confidence === 'high' ? 'High' : summary.confidence === 'medium' ? 'Medium' : 'Low'}
            </p>
            <p className="text-[10px] text-surface-400">R² = {model?.rSquared}</p>
          </div>
        </div>
      )}

      {/* How it works */}
      <FormulaCard
        label="Ensemble Weight"
        formula="w = (1 / error) / Σ(1 / errors)"
        note="Models with lower prediction error get higher influence in the final forecast"
      />

      {/* Deep dives for each model */}
      <DeepDive title="Holt-Winters (Seasonal)">
        <p className="mb-2">Triple exponential smoothing that captures level, trend, and 7-day seasonal patterns.</p>
        <div className="bg-surface-50 rounded p-2 mb-2">
          <code className="text-xs text-surface-700">α=0.3 (level) β=0.1 (trend) γ=0.1 (season)</code>
        </div>
        <p>Requires at least 14 data points (2 full seasons). Falls back to simple exponential smoothing if data is insufficient.</p>
      </DeepDive>
      <DeepDive title="Linear Regression (Trend)">
        <p className="mb-2">Least-squares fit providing the long-term trend baseline.</p>
        <div className="bg-surface-50 rounded p-2 mb-2">
          <code className="text-xs text-surface-700">y = slope × x + intercept</code>
        </div>
        {model && <p>Current slope: <strong>{model.slope}</strong> incidents/day. Intercept: <strong>{model.intercept}</strong>.</p>}
      </DeepDive>
      <DeepDive title="Exponential Smoothing (Adaptive)">
        <p className="mb-2">Emphasizes recent data more than older observations. Serves as fallback when insufficient data for Holt-Winters.</p>
        <div className="bg-surface-50 rounded p-2">
          <code className="text-xs text-surface-700">α=0.3 — higher α = faster adaptation to recent changes</code>
        </div>
      </DeepDive>
      <DeepDive title="Zero-inflation handling">
        <p>If more than 30% of days have zero incidents, the system automatically aggregates data to weekly totals before fitting models. This prevents overfitting to sparse data and produces smoother, more reliable forecasts.</p>
      </DeepDive>
    </div>
  )
}

// ============================================================================
// SECTION 2: RISK MATRIX METHODOLOGY
// ============================================================================

const RiskMatrixMethodologySection = ({ matrixData }) => {
  const hasData = matrixData?.hazards?.length > 0

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
        <Shield size={20} className="text-amber-600" /> Risk Matrix Methodology
      </h3>

      {/* Dataset overview */}
      {hasData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-800">{matrixData.totalDays}</p>
            <p className="text-[10px] text-amber-600 uppercase">Days in Dataset</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-800">{matrixData.hazards.length}</p>
            <p className="text-[10px] text-amber-600 uppercase">Hazards Plotted</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-800">{matrixData.isAdaptive ? 'Adaptive' : 'Fixed'}</p>
            <p className="text-[10px] text-amber-600 uppercase">Threshold Mode</p>
          </div>
        </div>
      )}

      <p className="text-sm text-surface-600 leading-relaxed">
        Based on the RAM Standard, each hazard is scored on a 5×5 grid of Likelihood × Consequence. Risk Score = L × C (range 1-25).
      </p>

      {/* Methodology bullets */}
      <div className="space-y-2">
        {[
          { label: 'L × C Scoring', desc: 'Risk Score = Likelihood (1-5) × Consequence (1-5). Range: 1-25.' },
          { label: 'Time-Decay', desc: 'Recent incidents (90d) = 100% weight. 3-6mo = 60%. 6-12mo = 30%. >1yr = 10%.' },
          { label: 'Confidence Caps', desc: '<3 incidents → max Unlikely. <5 → max Possible. <14 days → max Unlikely. <30 days → max Possible.' },
          { label: 'Adaptive Thresholds', desc: 'Datasets <90 days blend percentile-based with fixed thresholds for stability.' },
        ].map(item => (
          <div key={item.label} className="flex items-start gap-2 bg-surface-50 border border-surface-100 rounded-lg p-3">
            <span className="text-xs font-semibold text-amber-700 w-28 flex-shrink-0">{item.label}</span>
            <span className="text-xs text-surface-600">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Threshold table */}
      {hasData && matrixData.thresholds && (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">
            Active Likelihood Thresholds
            {matrixData.isAdaptive && <span className="text-blue-500 ml-2 normal-case">(blended — dataset &lt;90 days)</span>}
          </h4>
          <div className="space-y-1.5">
            {matrixData.thresholds.map(t => (
              <div key={t.level} className="flex items-center justify-between bg-surface-50 border border-surface-100 rounded px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">{t.level}</span>
                  <span className="text-xs text-surface-700">{LIKELIHOOD_LABELS[t.level]}</span>
                </div>
                <span className="text-xs font-mono text-surface-500">
                  ≥ {t.min.toFixed(4)} incidents/day
                  <span className="text-[10px] text-surface-400 ml-2">
                    ({(t.min * 7).toFixed(2)}/wk)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk level bands */}
      <div className="space-y-1.5">
        {[
          { range: '20-25', label: 'Very High' },
          { range: '10-19', label: 'High' },
          { range: '5-9', label: 'Medium' },
          { range: '3-4', label: 'Low' },
          { range: '1-2', label: 'Very Low' },
        ].map(level => {
          const midScore = level.label === 'Very High' ? 25 : level.label === 'High' ? 15 : level.label === 'Medium' ? 7 : level.label === 'Low' ? 4 : 2
          const colors = getScoreColor(midScore)
          return (
            <div key={level.label} className="flex items-center gap-3">
              <div className="w-16 h-7 rounded flex items-center justify-center text-[10px] font-bold" style={colors}>
                {level.range}
              </div>
              <span className="text-xs text-surface-600">{level.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// SECTION 3: HAZARD CALCULATION BREAKDOWN (INTERACTIVE)
// ============================================================================

const MiniMatrixGrid = ({ highlightL, highlightC }) => {
  return (
    <div className="bg-surface-50 rounded-lg p-3">
      <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-2 text-center">Risk Matrix Position</p>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
        {/* Column header row */}
        <div />
        {[5, 4, 3, 2, 1].map(l => (
          <div key={`lh-${l}`} className={`text-center text-[8px] font-bold py-0.5 ${l === highlightL ? 'text-primary-700' : 'text-surface-400'}`}>
            L{l}
          </div>
        ))}
        {/* Data rows */}
        {[5, 4, 3, 2, 1].map(c => (
          <React.Fragment key={`row-${c}`}>
            <div className={`text-[8px] font-bold pr-1 flex items-center justify-end ${c === highlightC ? 'text-primary-700' : 'text-surface-400'}`}>
              C{c}
            </div>
            {[5, 4, 3, 2, 1].map(l => {
              const score = l * c
              const colors = getScoreColor(score)
              const isHighlighted = l === highlightL && c === highlightC
              return (
                <div
                  key={`${l}-${c}`}
                  className={`w-full aspect-square rounded-sm flex items-center justify-center text-[7px] font-bold ${isHighlighted ? 'ring-2 ring-surface-800 ring-offset-1 scale-125 z-10' : ''}`}
                  style={{ backgroundColor: colors.backgroundColor, color: colors.color }}
                >
                  {score}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

const HazardBreakdownCard = ({ hazard, matrixData }) => {
  if (!hazard) return null

  const scoreColor = getScoreColor(hazard.riskScore)
  const zone = getRiskZone(hazard.likelihood, hazard.consequence)

  // Find worst incident type
  const worstType = useMemo(() => {
    if (!hazard.incidents?.length) return null
    let worst = null
    let worstSeverity = 0
    for (const inc of hazard.incidents) {
      const type = inc.type?.toLowerCase()
      const severity = CONSEQUENCE_TYPE_MAP[type] || 0
      if (severity > worstSeverity) {
        worstSeverity = severity
        worst = { type, severity, label: CONSEQUENCE_LABELS[severity] || 'Unknown' }
      }
    }
    return worst
  }, [hazard.incidents])

  // Calculate readable rate
  const readableRate = useMemo(() => {
    const rate = hazard.rate || 0
    if (rate >= 1) return `${rate.toFixed(1)} per day`
    if (rate >= 1 / 7) return `${(rate * 7).toFixed(1)} per week`
    if (rate >= 1 / 30) return `${(rate * 30).toFixed(1)} per month`
    return `${(rate * 90).toFixed(1)} per quarter`
  }, [hazard.rate])

  // Check confidence caps
  const isCountCapped = hazard.negativeCount < 5
  const isDaysCapped = matrixData.totalDays < 30

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4 animate-fade-in">
      {/* Header: Name + Risk Badge */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-surface-800">{hazard.name}</h4>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${zone.chipBg} ${zone.chipText} ${zone.chipBorder} border`}>
            {zone.label}
          </span>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black" style={scoreColor}>
            {hazard.riskScore}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Likelihood + Consequence breakdown */}
        <div className="space-y-4">
          {/* Likelihood Breakdown */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Likelihood</span>
              <span className="text-lg font-black text-blue-800">{hazard.likelihood}</span>
            </div>
            <p className="text-[10px] text-blue-600">{LIKELIHOOD_LABELS[hazard.likelihood]}</p>
            <div className="space-y-1 text-xs text-surface-600">
              <div className="flex justify-between">
                <span>Negative incidents</span>
                <span className="font-semibold">{hazard.negativeCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Dataset span</span>
                <span className="font-semibold">{matrixData.totalDays} days</span>
              </div>
              <div className="flex justify-between">
                <span>Rate</span>
                <span className="font-semibold">{hazard.rate} inc/day → {readableRate}</span>
              </div>
              <div className="flex justify-between">
                <span>Threshold band</span>
                <span className="font-semibold">Level {hazard.likelihood} ({LIKELIHOOD_LABELS[hazard.likelihood]})</span>
              </div>
            </div>
            {(isCountCapped || isDaysCapped) && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-1">
                <p className="text-[10px] text-amber-700 font-medium">Confidence cap applied:</p>
                {hazard.negativeCount < 3 && <p className="text-[10px] text-amber-600">&lt;3 incidents → max Unlikely (2)</p>}
                {hazard.negativeCount >= 3 && hazard.negativeCount < 5 && <p className="text-[10px] text-amber-600">&lt;5 incidents → max Possible (3)</p>}
                {matrixData.totalDays < 14 && <p className="text-[10px] text-amber-600">&lt;14 days → max Unlikely (2)</p>}
                {matrixData.totalDays >= 14 && matrixData.totalDays < 30 && <p className="text-[10px] text-amber-600">&lt;30 days → max Possible (3)</p>}
              </div>
            )}
          </div>

          {/* Consequence Breakdown */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Consequence</span>
              <span className="text-lg font-black text-red-800">{hazard.consequence}</span>
            </div>
            <p className="text-[10px] text-red-600">{CONSEQUENCE_LABELS[hazard.consequence]}</p>
            <div className="space-y-1 text-xs text-surface-600">
              {worstType && (
                <>
                  <div className="flex justify-between">
                    <span>Worst incident type</span>
                    <span className="font-semibold uppercase">{worstType.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type severity level</span>
                    <span className="font-semibold">{worstType.severity} ({worstType.label})</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Time-decay applied</span>
                <span className="font-semibold">Yes (90d=100%, 3-6mo=60%, 6-12mo=30%)</span>
              </div>
              <div className="flex justify-between">
                <span>Final weighted consequence</span>
                <span className="font-semibold">{hazard.consequence}</span>
              </div>
            </div>
          </div>

          {/* Risk Score formula */}
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
            <p className="text-[10px] text-primary-500 uppercase tracking-wider font-medium">Risk Score</p>
            <p className="text-sm font-mono text-primary-800 mt-1">
              {hazard.likelihood} (L) × {hazard.consequence} (C) = <strong>{hazard.riskScore}</strong>
            </p>
          </div>
        </div>

        {/* RIGHT: Mini 5x5 grid */}
        <div className="flex flex-col items-center justify-center">
          <MiniMatrixGrid highlightL={hazard.likelihood} highlightC={hazard.consequence} />
        </div>
      </div>
    </div>
  )
}

const HazardCalculationSection = ({ matrixData }) => {
  const [selectedHazardName, setSelectedHazardName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Sort hazards by risk score for the dropdown
  const sortedHazards = useMemo(() => {
    if (!matrixData?.hazards?.length) return []
    return [...matrixData.hazards].sort((a, b) => b.riskScore - a.riskScore || b.negativeCount - a.negativeCount)
  }, [matrixData?.hazards])

  // Filter hazards by search
  const filteredHazards = useMemo(() => {
    if (!searchQuery.trim()) return sortedHazards
    const q = searchQuery.toLowerCase()
    return sortedHazards.filter(h => h.name.toLowerCase().includes(q))
  }, [sortedHazards, searchQuery])

  // Auto-select first hazard when data loads
  useEffect(() => {
    if (sortedHazards.length > 0 && !selectedHazardName) {
      setSelectedHazardName(sortedHazards[0].name)
    }
  }, [sortedHazards, selectedHazardName])

  const selectedHazard = useMemo(() => {
    return sortedHazards.find(h => h.name === selectedHazardName) || null
  }, [sortedHazards, selectedHazardName])

  if (!matrixData?.hazards?.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
          <Calculator size={20} className="text-primary-600" /> Hazard Calculation Breakdown
        </h3>
        <div className="bg-surface-50 rounded-lg p-6 text-center">
          <p className="text-sm text-surface-500">No hazard data available. Apply fewer filters or import more data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
        <Calculator size={20} className="text-primary-600" /> Hazard Calculation Breakdown
      </h3>
      <p className="text-sm text-surface-600 leading-relaxed">
        Select a hazard to see exactly why it sits at its current risk matrix position — real numbers, not theory.
      </p>

      {/* Hazard selector */}
      <div className="space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search hazards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-surface-200 rounded-lg text-sm text-surface-700 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
          />
        </div>

        {/* Hazard pills */}
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
          {filteredHazards.map(h => {
            const colors = getScoreColor(h.riskScore)
            const isSelected = h.name === selectedHazardName
            return (
              <button
                key={h.name}
                onClick={() => setSelectedHazardName(h.name)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isSelected ? 'ring-2 ring-primary-500 shadow-sm scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                style={isSelected ? colors : { backgroundColor: `${colors.backgroundColor}80`, color: colors.color, borderColor: colors.borderColor }}
              >
                <span className="truncate max-w-[180px]">{h.name}</span>
                <span className="font-black">{h.riskScore}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Breakdown card */}
      <HazardBreakdownCard hazard={selectedHazard} matrixData={matrixData} />
    </div>
  )
}

// ============================================================================
// MAIN MODAL
// ============================================================================

const SECTIONS = [
  { id: 'forecasting', label: 'Ensemble Forecasting', icon: TrendingUp },
  { id: 'risk-matrix', label: 'Risk Matrix', icon: Shield },
  { id: 'hazard-breakdown', label: 'Hazard Breakdown', icon: Calculator },
]

const MethodologyExplorerModal = ({
  isOpen,
  onClose,
  matrixData,
  filteredIncidents,
  sortedHazards,
  forecastData,
  negativeIncidents,
}) => {
  const [activeSection, setActiveSection] = useState('forecasting')
  const contentRef = useRef(null)
  const sectionRefs = useRef({})

  const scrollToSection = useCallback((id) => {
    setActiveSection(id)
    const el = sectionRefs.current[id]
    if (el && contentRef.current) {
      const offset = el.offsetTop - contentRef.current.offsetTop
      contentRef.current.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }, [])

  // Track scroll position to highlight active sidebar item
  useEffect(() => {
    if (!isOpen) return
    const container = contentRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop + 80
      let current = SECTIONS[0].id
      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id]
        if (el && el.offsetTop - container.offsetTop <= scrollTop) {
          current = section.id
        }
      }
      setActiveSection(current)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setActiveSection('forecasting')
      if (contentRef.current) contentRef.current.scrollTop = 0
    }
  }, [isOpen])

  if (!isOpen) return null

  const setSectionRef = (id) => (el) => {
    sectionRefs.current[id] = el
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 bg-surface-50 border-r border-surface-200 flex flex-col">
          <div className="px-4 py-4 border-b border-surface-200">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-primary-600" />
              <span className="text-sm font-semibold text-surface-800">Guide</span>
            </div>
            <p className="text-[10px] text-surface-400 mt-1">Live data from your dataset</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            {SECTIONS.map(section => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-xs transition-all duration-200 mb-0.5 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-primary-600' : 'text-surface-400'} />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-bold text-surface-800">How It's Calculated</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-500 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-12">
            <section ref={setSectionRef('forecasting')}>
              <EnsembleForecastingSection forecastData={forecastData} />
            </section>

            <section ref={setSectionRef('risk-matrix')}>
              <RiskMatrixMethodologySection matrixData={matrixData} />
            </section>

            <section ref={setSectionRef('hazard-breakdown')}>
              <HazardCalculationSection matrixData={matrixData} />
            </section>

            {/* Bottom spacer */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MethodologyExplorerModal)
