import { useState, useEffect, useRef, useCallback, useMemo, memo, Fragment } from 'react'
import { X, TrendingUp, Shield, Calculator, Search, ArrowRight, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import {
  CONSEQUENCE_TYPE_MAP,
  CONSEQUENCE_LABELS,
  LIKELIHOOD_LABELS,
  LIKELIHOOD_PROBABILITY_THRESHOLDS,
  getScoreColor,
  getRiskZone,
  calculatePoissonProbability,
} from '../../utils/riskMatrix'

// ============================================================================
// SHARED
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

// ============================================================================
// SECTION 1: ENSEMBLE FORECASTING (kept as-is)
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
          <p className="text-sm text-amber-700">{forecastData?.error || 'Not enough data yet. Import more observations to see predictions.'}</p>
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
      {hasEnsemble && (
        <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-2.5">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-2">Model Weights (from your data)</h4>
          <WeightBar label="Holt-Winters" weight={ensemble.weights.hw} color="bg-emerald-400" error={ensemble.models.holtWinters.error} />
          <WeightBar label="Linear Regression" weight={ensemble.weights.lr} color="bg-blue-400" error={ensemble.models.linearRegression.error} />
          <WeightBar label="Exp. Smoothing" weight={ensemble.weights.es} color="bg-violet-400" error={ensemble.models.exponentialSmoothing.error} />
        </div>
      )}
      {hasEnsemble && (
        <div className={`rounded-lg border p-3 ${ensemble.zeroInflation?.isZeroInflated ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <span className={`text-xs font-semibold ${ensemble.zeroInflation?.isZeroInflated ? 'text-amber-700' : 'text-green-700'}`}>
            Zero-Inflation: {ensemble.zeroInflation?.isZeroInflated ? 'Active' : 'Not detected'}
          </span>
          <p className="text-[10px] text-surface-500 mt-1">
            {ensemble.zeroInflation?.zeroPercent}% of days had zero incidents.
            {ensemble.zeroInflation?.isZeroInflated
              ? ' Data was grouped into weekly totals for better accuracy.'
              : ' Daily data used (threshold: >30%).'}
          </p>
        </div>
      )}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg Historical', value: summary.avgHistorical, sub: 'per day' },
            { label: 'Avg Forecast', value: summary.avgForecast, sub: 'per day' },
            { label: 'Trend', value: model?.trend === 'increasing' ? 'Rising' : model?.trend === 'decreasing' ? 'Declining' : 'Stable', sub: `${model?.dailyChange > 0 ? '+' : ''}${model?.dailyChange}/day`, color: model?.trend === 'increasing' ? 'text-red-600' : model?.trend === 'decreasing' ? 'text-green-600' : 'text-surface-600' },
            { label: 'Confidence', value: summary.confidence === 'high' ? 'High' : summary.confidence === 'medium' ? 'Medium' : 'Low', sub: `R² = ${model?.rSquared}`, color: summary.confidence === 'high' ? 'text-green-600' : summary.confidence === 'medium' ? 'text-blue-600' : 'text-amber-600' },
          ].map(item => (
            <div key={item.label} className="bg-surface-50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-surface-400 uppercase">{item.label}</p>
              <p className={`text-lg font-bold ${item.color || 'text-surface-800'}`}>{item.value}</p>
              <p className="text-[10px] text-surface-400">{item.sub}</p>
            </div>
          ))}
        </div>
      )}
      <DeepDive title="How the models work">
        <p className="mb-2"><strong>Holt-Winters:</strong> Looks at daily and weekly patterns to predict future incidents.</p>
        <p className="mb-2"><strong>Linear Regression:</strong> Draws the best straight line through your data to find the overall trend.</p>
        <p><strong>Exponential Smoothing:</strong> Gives more importance to recent data than older data.</p>
      </DeepDive>
    </div>
  )
}

// ============================================================================
// SECTION 2: HOW RISK IS CALCULATED (REDESIGNED — Simple & Visual)
// ============================================================================

/** Visual step card with number badge */
const StepCard = ({ step, title, children }) => (
  <div className="relative bg-white rounded-xl border border-surface-200 p-4">
    <div className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
      <span className="text-[11px] font-bold text-white">{step}</span>
    </div>
    <h4 className="text-sm font-bold text-surface-800 mt-1 mb-2">{title}</h4>
    {children}
  </div>
)

/** Colored level row for Likelihood / Consequence tables */
const LevelRow = ({ level, label, description, color, isHighlighted }) => (
  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isHighlighted ? 'ring-2 ring-primary-400 shadow-sm' : ''}`} style={{ backgroundColor: color + '18' }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
      <span className="text-sm font-black text-white">{level}</span>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-surface-800">{label}</p>
      <p className="text-[11px] text-surface-500 leading-snug">{description}</p>
    </div>
  </div>
)

/** Visual 5x5 mini matrix */
const VisualMiniMatrix = ({ highlightL, highlightC }) => (
  <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
    <div />
    {[5, 4, 3, 2, 1].map(l => (
      <div key={`lh-${l}`} className={`text-center text-[9px] font-bold py-0.5 ${l === highlightL ? 'text-primary-700' : 'text-surface-400'}`}>
        L{l}
      </div>
    ))}
    {[5, 4, 3, 2, 1].map(c => (
      <Fragment key={`row-${c}`}>
        <div className={`text-[9px] font-bold pr-1 flex items-center justify-end ${c === highlightC ? 'text-primary-700' : 'text-surface-400'}`}>
          C{c}
        </div>
        {[5, 4, 3, 2, 1].map(l => {
          const score = l * c
          const colors = getScoreColor(score)
          const isActive = l === highlightL && c === highlightC
          return (
            <div
              key={`${l}-${c}`}
              className={`aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold transition-all ${isActive ? 'ring-2 ring-surface-800 ring-offset-1 scale-125 z-10' : ''}`}
              style={{ backgroundColor: colors.backgroundColor, color: colors.color }}
            >
              {score}
            </div>
          )
        })}
      </Fragment>
    ))}
  </div>
)

const LIKELIHOOD_DESCRIPTIONS = [
  '',
  'Very unlikely to happen — less than once in 10 years',
  'Could happen, but rare — once every 5 to 10 years',
  'May happen sometimes — once every 2 to 5 years',
  'Will probably happen — once every 1 to 2 years',
  'Expected to happen — multiple times per year',
]

const LIKELIHOOD_COLORS = ['', '#22c55e', '#84cc16', '#eab308', '#f87171', '#dc2626']

const CONSEQUENCE_DESCRIPTIONS = [
  '',
  'Near-miss or minor observation — no injury',
  'First aid or medical treatment — no time off work',
  'Lost time injury — 5 or more days off work',
  'Single fatality or major fire / environmental damage',
  'Multiple fatalities — complete shutdown of operations',
]

const CONSEQUENCE_COLORS = ['', '#22c55e', '#84cc16', '#eab308', '#f87171', '#dc2626']

const RISK_LEVEL_ROWS = [
  { range: '20-25', label: 'Very High', desc: 'Immediate action required', mid: 25 },
  { range: '10-19', label: 'High', desc: 'Urgent attention needed', mid: 15 },
  { range: '5-9', label: 'Medium', desc: 'Action plan required', mid: 7 },
  { range: '3-4', label: 'Low', desc: 'Monitor and review', mid: 4 },
  { range: '1-2', label: 'Very Low', desc: 'Acceptable — routine monitoring', mid: 2 },
]

const RiskMatrixMethodologySection = ({ matrixData }) => {
  const hasData = matrixData?.hazards?.length > 0

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
        <Shield size={20} className="text-amber-600" /> How Risk Score Is Calculated
      </h3>

      <p className="text-sm text-surface-600 leading-relaxed">
        Every hazard gets a <strong>Risk Score</strong> from 1 to 25. The higher the score, the more dangerous the hazard. Here&apos;s how we calculate it in 3 simple steps:
      </p>

      {/* ---- STEP 1: LIKELIHOOD ---- */}
      <StepCard step={1} title="How likely is it to happen again?">
        <p className="text-xs text-surface-500 mb-3">
          We look at how often this hazard caused incidents in your data. If it happens frequently, it&apos;s more likely to happen again in the next 12 months.
        </p>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(level => (
            <LevelRow
              key={level}
              level={level}
              label={LIKELIHOOD_LABELS[level]}
              description={LIKELIHOOD_DESCRIPTIONS[level]}
              color={LIKELIHOOD_COLORS[level]}
            />
          ))}
        </div>
        <DeepDive title="How we calculate the chance">
          <p className="mb-2">We count how many incidents happened for each hazard, then work out the <strong>chance of it happening at least once in the next 12 months</strong>.</p>
          <div className="bg-surface-50 rounded-lg p-3 mb-2">
            <p className="text-xs text-surface-600">For example: If &quot;Working at Height&quot; had <strong>3 incidents over 2 years</strong>, that&apos;s about 1.5 per year — giving a <strong>78% chance</strong> of happening again next year → <strong>Level 4 (Likely)</strong>.</p>
          </div>
          <div className="space-y-1.5">
            {LIKELIHOOD_PROBABILITY_THRESHOLDS.map(t => (
              <div key={t.level} className="flex items-center justify-between text-[11px] px-2 py-1 rounded" style={{ backgroundColor: LIKELIHOOD_COLORS[t.level] + '15' }}>
                <span className="font-medium text-surface-700">Level {t.level} — {LIKELIHOOD_LABELS[t.level]}</span>
                <span className="text-surface-500">{t.label} chance → {t.freqDesc}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-amber-600">
            <strong>Safety check:</strong> If we have very few incidents (less than 5) or very little data (less than 30 days), we limit the level to prevent unreliable results.
          </p>
        </DeepDive>
      </StepCard>

      {/* ---- STEP 2: CONSEQUENCE ---- */}
      <StepCard step={2} title="How bad could it be?">
        <p className="text-xs text-surface-500 mb-3">
          We look at the worst type of incident that has happened for this hazard. More severe incidents mean a higher consequence level.
        </p>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(level => (
            <LevelRow
              key={level}
              level={level}
              label={CONSEQUENCE_LABELS[level]}
              description={CONSEQUENCE_DESCRIPTIONS[level]}
              color={CONSEQUENCE_COLORS[level]}
            />
          ))}
        </div>

        {/* Incident type mapping */}
        <div className="mt-3 bg-surface-50 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-2">What counts as what?</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {[
              { types: 'Near-miss, NCR, Unsafe act/condition', level: 1 },
              { types: 'FAC, MTI, Light vehicle damage', level: 2 },
              { types: 'LTI, Security, Env moderate', level: 3 },
              { types: 'Fatality, Fire, Env major', level: 4 },
              { types: 'Multiple fatalities', level: 5 },
            ].map(row => (
              <Fragment key={row.level}>
                <span className="text-surface-500">{row.types}</span>
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={10} className="text-surface-400" />
                  <span className="font-bold" style={{ color: CONSEQUENCE_COLORS[row.level] }}>Level {row.level}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <DeepDive title="How recency affects the score">
          <p className="mb-2">Recent incidents count more than old ones. A fatality that happened last month matters more than one from 2 years ago.</p>
          <div className="space-y-1 text-[11px]">
            {[
              { period: 'Last 3 months', weight: '100%', bar: 'w-full' },
              { period: '3 to 6 months ago', weight: '60%', bar: 'w-[60%]' },
              { period: '6 to 12 months ago', weight: '30%', bar: 'w-[30%]' },
              { period: 'Over 1 year ago', weight: '10%', bar: 'w-[10%]' },
            ].map(row => (
              <div key={row.period} className="flex items-center gap-3">
                <span className="text-surface-600 w-32 flex-shrink-0">{row.period}</span>
                <div className="flex-1 h-4 bg-surface-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-red-400 rounded-full ${row.bar}`} />
                </div>
                <span className="text-surface-500 w-10 text-right font-semibold">{row.weight}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-surface-500">
            This means an old fatality slowly loses impact over time, which encourages taking fresh data seriously.
          </p>
        </DeepDive>
      </StepCard>

      {/* ---- STEP 3: RISK SCORE ---- */}
      <StepCard step={3} title="Multiply them together">
        <p className="text-xs text-surface-500 mb-3">
          The final <strong>Risk Score = Likelihood × Consequence</strong>. The result falls into one of 5 risk levels:
        </p>

        {/* Visual formula */}
        <div className="flex items-center justify-center gap-3 py-3 mb-3">
          <div className="bg-blue-100 border border-blue-200 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] text-blue-500 font-medium uppercase">Likelihood</p>
            <p className="text-2xl font-black text-blue-700">L</p>
            <p className="text-[10px] text-blue-400">1 to 5</p>
          </div>
          <span className="text-2xl font-bold text-surface-300">×</span>
          <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] text-red-500 font-medium uppercase">Consequence</p>
            <p className="text-2xl font-black text-red-700">C</p>
            <p className="text-[10px] text-red-400">1 to 5</p>
          </div>
          <span className="text-2xl font-bold text-surface-300">=</span>
          <div className="bg-primary-100 border border-primary-200 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] text-primary-500 font-medium uppercase">Risk Score</p>
            <p className="text-2xl font-black text-primary-700">R</p>
            <p className="text-[10px] text-primary-400">1 to 25</p>
          </div>
        </div>

        {/* Risk levels */}
        <div className="space-y-1.5">
          {RISK_LEVEL_ROWS.map(row => {
            const colors = getScoreColor(row.mid)
            return (
              <div key={row.label} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: colors.backgroundColor + '20' }}>
                <div className="w-14 h-7 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={colors}>
                  {row.range}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-surface-800">{row.label}</span>
                  <span className="text-[11px] text-surface-500 ml-2">{row.desc}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Example */}
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-amber-700 uppercase mb-1">Example</p>
          <p className="text-xs text-surface-600">
            &quot;Working at Height&quot; has incidents happening <strong>frequently (Likely = 4)</strong> and has had an <strong>LTI (Medium = 3)</strong>.
            Risk Score = 4 × 3 = <strong>12 → High Risk</strong>.
          </p>
        </div>
      </StepCard>

      {/* Dataset info */}
      {hasData && (
        <div className="flex items-center gap-4 bg-surface-50 border border-surface-100 rounded-lg px-4 py-3 text-xs text-surface-500">
          <span><strong className="text-surface-700">{matrixData.hazards.length}</strong> hazards analyzed</span>
          <span className="text-surface-300">|</span>
          <span><strong className="text-surface-700">{matrixData.totalDays}</strong> days of data</span>
          <span className="text-surface-300">|</span>
          <span><strong className="text-surface-700">12-month</strong> assessment window</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SECTION 3: HAZARD BREAKDOWN (INTERACTIVE — Redesigned)
// ============================================================================

const HazardBreakdownCard = ({ hazard, matrixData }) => {
  const worstType = useMemo(() => {
    if (!hazard?.incidents?.length) return null
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
  }, [hazard?.incidents])

  const probability = useMemo(() => {
    if (!hazard) return 0
    return hazard.probability ?? calculatePoissonProbability(hazard.negativeCount || 0, matrixData?.totalDays || 1)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only recompute on specific property changes
  }, [hazard?.probability, hazard?.negativeCount, matrixData?.totalDays])

  const readableRate = useMemo(() => {
    const rate = hazard.rate || 0
    if (rate >= 1) return `${rate.toFixed(1)} per day`
    if (rate >= 1 / 7) return `${(rate * 7).toFixed(1)} per week`
    if (rate >= 1 / 30) return `${(rate * 30).toFixed(1)} per month`
    if (rate >= 1 / 90) return `${(rate * 90).toFixed(1)} per quarter`
    return `${(rate * 365).toFixed(1)} per year`
  }, [hazard?.rate])

  if (!hazard) return null

  const scoreColor = getScoreColor(hazard.riskScore)
  const zone = getRiskZone(hazard.likelihood, hazard.consequence)

  const isCountCapped = hazard.negativeCount < 5
  const isDaysCapped = matrixData.totalDays < 30

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4 animate-fade-in">
      {/* Header */}
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

      {/* Visual formula for this hazard */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center min-w-[90px]">
          <p className="text-[9px] text-blue-500 font-medium uppercase">Likelihood</p>
          <p className="text-2xl font-black text-blue-700">{hazard.likelihood}</p>
          <p className="text-[10px] text-blue-500 font-medium">{LIKELIHOOD_LABELS[hazard.likelihood]}</p>
        </div>
        <span className="text-2xl font-bold text-surface-300">×</span>
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center min-w-[90px]">
          <p className="text-[9px] text-red-500 font-medium uppercase">Consequence</p>
          <p className="text-2xl font-black text-red-700">{hazard.consequence}</p>
          <p className="text-[10px] text-red-500 font-medium">{CONSEQUENCE_LABELS[hazard.consequence]}</p>
        </div>
        <span className="text-2xl font-bold text-surface-300">=</span>
        <div className="rounded-xl px-4 py-3 text-center min-w-[90px] border-2" style={{ backgroundColor: scoreColor.backgroundColor + '20', borderColor: scoreColor.borderColor }}>
          <p className="text-[9px] font-medium uppercase" style={{ color: scoreColor.borderColor }}>Score</p>
          <p className="text-2xl font-black" style={{ color: scoreColor.borderColor }}>{hazard.riskScore}</p>
          <p className="text-[10px] font-medium" style={{ color: scoreColor.borderColor }}>{zone.label}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Why this Likelihood */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-blue-800">Why Likelihood = {hazard.likelihood}?</p>
          <div className="space-y-1.5 text-xs text-surface-600">
            <div className="flex justify-between items-center">
              <span>Incidents found</span>
              <span className="font-bold text-blue-700">{hazard.negativeCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Over a period of</span>
              <span className="font-bold text-surface-700">{matrixData.totalDays} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span>That&apos;s about</span>
              <span className="font-bold text-surface-700">{readableRate}</span>
            </div>
            <div className="border-t border-blue-200 pt-1.5 flex justify-between items-center">
              <span>Chance of happening again next year</span>
              <span className="font-black text-blue-700 text-sm">{(probability * 100).toFixed(0)}%</span>
            </div>
          </div>
          {(isCountCapped || isDaysCapped) && (
            <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700">
                Level limited because {hazard.negativeCount < 3 ? 'less than 3 incidents' : hazard.negativeCount < 5 ? 'less than 5 incidents' : ''}{(isCountCapped && isDaysCapped) ? ' and ' : ''}{matrixData.totalDays < 14 ? 'less than 14 days of data' : matrixData.totalDays < 30 ? 'less than 30 days of data' : ''} — not enough to be confident.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Why this Consequence */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-red-800">Why Consequence = {hazard.consequence}?</p>
          <div className="space-y-1.5 text-xs text-surface-600">
            {worstType ? (
              <>
                <div className="flex justify-between items-center">
                  <span>Worst incident type</span>
                  <span className="font-bold text-red-700 uppercase">{worstType.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>That maps to</span>
                  <span className="font-bold" style={{ color: CONSEQUENCE_COLORS[worstType.severity] }}>Level {worstType.severity} — {worstType.label}</span>
                </div>
              </>
            ) : (
              <p className="text-surface-400 italic">No incident type data available</p>
            )}
            <div className="border-t border-red-200 pt-1.5 flex justify-between items-center">
              <span>After recency adjustment</span>
              <span className="font-black text-red-700 text-sm">Level {hazard.consequence}</span>
            </div>
          </div>
          <p className="text-[10px] text-surface-400">
            Recent incidents (last 3 months) count at full weight. Older incidents have less impact on the score.
          </p>
        </div>
      </div>

      {/* Mini matrix position */}
      <div className="bg-surface-50 rounded-xl p-4">
        <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-2 text-center font-semibold">Position on the Risk Matrix</p>
        <div className="max-w-[200px] mx-auto">
          <VisualMiniMatrix highlightL={hazard.likelihood} highlightC={hazard.consequence} />
        </div>
      </div>
    </div>
  )
}

const HazardCalculationSection = ({ matrixData }) => {
  const [selectedHazardName, setSelectedHazardName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const sortedHazards = useMemo(() => {
    if (!matrixData?.hazards?.length) return []
    return [...matrixData.hazards].sort((a, b) => b.riskScore - a.riskScore || b.negativeCount - a.negativeCount)
  }, [matrixData?.hazards])

  const filteredHazards = useMemo(() => {
    if (!searchQuery.trim()) return sortedHazards
    const q = searchQuery.toLowerCase()
    return sortedHazards.filter(h => h.name.toLowerCase().includes(q))
  }, [sortedHazards, searchQuery])

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
          <Calculator size={20} className="text-primary-600" /> Check Any Hazard
        </h3>
        <div className="bg-surface-50 rounded-lg p-6 text-center">
          <p className="text-sm text-surface-500">No hazard data available. Try importing more data or adjusting your filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
        <Calculator size={20} className="text-primary-600" /> Check Any Hazard
      </h3>
      <p className="text-sm text-surface-600 leading-relaxed">
        Pick a hazard below to see exactly how its score was calculated — using your real data.
      </p>

      {/* Search + hazard pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search hazards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-surface-200 rounded-lg text-sm text-surface-700 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
            aria-label="Search hazards"
          />
        </div>
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

      <HazardBreakdownCard hazard={selectedHazard} matrixData={matrixData} />
    </div>
  )
}

// ============================================================================
// MAIN MODAL
// ============================================================================

const SECTIONS = [
  { id: 'risk-matrix', label: 'Risk Scoring', icon: Shield },
  { id: 'hazard-breakdown', label: 'Check a Hazard', icon: Calculator },
  { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
]

const MethodologyExplorerModal = ({
  isOpen,
  onClose,
  matrixData,
  filteredIncidents: _filteredIncidents,
  sortedHazards: _sortedHazards,
  forecastData,
  negativeIncidents: _negativeIncidents,
}) => {
  const [activeSection, setActiveSection] = useState('risk-matrix')
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

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setActiveSection('risk-matrix')
      if (contentRef.current) contentRef.current.scrollTop = 0
    }
  }, [isOpen])

  if (!isOpen) return null

  const setSectionRef = (id) => (el) => { sectionRefs.current[id] = el }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 bg-surface-50 border-r border-surface-200 flex flex-col">
          <div className="px-4 py-4 border-b border-surface-200">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-primary-600" />
              <span className="text-sm font-semibold text-surface-800">Guide</span>
            </div>
            <p className="text-[10px] text-surface-400 mt-1">How your data is scored</p>
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-bold text-surface-800">How It Works</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-500 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-12">
            <section ref={setSectionRef('risk-matrix')}>
              <RiskMatrixMethodologySection matrixData={matrixData} />
            </section>
            <section ref={setSectionRef('hazard-breakdown')}>
              <HazardCalculationSection matrixData={matrixData} />
            </section>
            <section ref={setSectionRef('forecasting')}>
              <EnsembleForecastingSection forecastData={forecastData} />
            </section>
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(MethodologyExplorerModal)
