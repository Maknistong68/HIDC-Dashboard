import React, { useState, useMemo, useCallback, startTransition, memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { Dices, AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react'
import { useWorkerTask } from '../../hooks/useWorkerTask'
import { CONSEQUENCE_TYPE_MAP } from '../../utils/riskMatrix'

// ─── Constants ──────────────────────────────────────────────────────────────

const HORIZON_OPTIONS = [
  { value: 4, label: '4 weeks' },
  { value: 8, label: '8 weeks' },
  { value: 12, label: '12 weeks' },
]

const SIM_COUNT_OPTIONS = [
  { value: 1000, label: '1K' },
  { value: 5000, label: '5K' },
  { value: 10000, label: '10K' },
]

const SEVERITY_LABELS = {
  fatality: 'High (Sev 4)',
  serious: 'Medium (Sev 3)',
  moderate: 'Low (Sev 2)',
  minor: 'Very Low (Sev 1)',
}

const SEVERITY_COLORS = {
  fatality: 'bg-red-600',
  serious: 'bg-amber-500',
  moderate: 'bg-yellow-400',
  minor: 'bg-surface-400',
}

const SEVERITY_TEXT_COLORS = {
  fatality: 'text-red-700',
  serious: 'text-amber-700',
  moderate: 'text-yellow-700',
  minor: 'text-surface-600',
}

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.96)',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
}

const WORST_SEVERITY_LABELS = { 4: 'High', 3: 'Medium', 2: 'Low', 1: 'Very Low' }
const WORST_SEVERITY_CHIPS = {
  4: 'bg-red-100 text-red-800',
  3: 'bg-amber-100 text-amber-800',
  2: 'bg-yellow-100 text-yellow-800',
  1: 'bg-surface-100 text-surface-700',
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const PillToggle = memo(({ options, value, onChange, label }) => (
  <div className="flex items-center gap-1.5">
    {label && <span className="text-[10px] uppercase tracking-wider text-surface-500 mr-1">{label}</span>}
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          value === opt.value
            ? 'bg-primary-100 text-primary-700'
            : 'text-surface-600 hover:bg-surface-100'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
))
PillToggle.displayName = 'PillToggle'

const HistogramTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={TOOLTIP_STYLE} className="p-2">
      <p className="font-medium text-surface-700 text-xs mb-0.5">
        {d.binStart === d.binEnd ? `${d.binStart} incidents` : `${d.binStart}–${d.binEnd} incidents`}
      </p>
      <p className="text-xs text-surface-600">{d.pct}% of simulations ({d.count.toLocaleString()})</p>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

const MonteCarloTab = ({ negativeIncidents, sortedHazards }) => {
  const [horizon, setHorizon] = useState(4)
  const [simCount, setSimCount] = useState(5000)
  const [significantOnly, setSignificantOnly] = useState(false)

  const handleHorizonChange = useCallback((v) => {
    startTransition(() => setHorizon(v))
  }, [])
  const handleSimCountChange = useCallback((v) => {
    startTransition(() => setSimCount(v))
  }, [])

  // Stable params object for worker
  const workerParams = useMemo(() => ({
    sortedHazards,
    numSimulations: simCount,
    horizonWeeks: horizon,
    significantOnly,
  }), [sortedHazards, simCount, horizon, significantOnly])

  const { result: mcResults, isPending } = useWorkerTask(
    'monteCarlo',
    negativeIncidents,
    workerParams,
    [negativeIncidents, sortedHazards, simCount, horizon, significantOnly],
    null
  )

  // Derive display values
  const hasResults = mcResults && mcResults.summary && !mcResults.meta?.insufficient

  // Risk level for serious probability
  const seriousRiskLevel = useMemo(() => {
    if (!hasResults) return null
    const p = mcResults.summary.seriousProbability
    if (p >= 50) return { label: 'HIGH', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    if (p >= 20) return { label: 'MODERATE', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    return { label: 'LOW', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  }, [hasResults, mcResults?.summary?.seriousProbability])

  // Confidence indicator
  const confidence = useMemo(() => {
    if (!hasResults) return null
    const weeks = mcResults.meta.totalWeeks
    const obs = mcResults.meta.totalObservations
    if (weeks > 20 && obs > 50) return { label: 'High confidence', color: 'text-green-600' }
    if (weeks >= 8 && obs >= 20) return { label: 'Moderate confidence', color: 'text-blue-600' }
    return { label: 'Low confidence', color: 'text-orange-600' }
  }, [hasResults, mcResults?.meta?.totalWeeks, mcResults?.meta?.totalObservations])

  // Histogram data with P95 marker
  const histogramData = useMemo(() => {
    if (!hasResults) return []
    return mcResults.distribution.map(bin => ({
      ...bin,
      label: bin.binStart === bin.binEnd ? `${bin.binStart}` : `${bin.binStart}-${bin.binEnd}`,
      isAboveP95: bin.binStart > mcResults.summary.p95,
    }))
  }, [hasResults, mcResults?.distribution, mcResults?.summary?.p95])

  // ── Insufficient data state ──
  if (!negativeIncidents?.length || negativeIncidents.length < 5) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
          <Dices size={24} className="text-surface-400" />
        </div>
        <p className="text-sm font-medium text-surface-700 mb-1">Insufficient Data</p>
        <p className="text-xs text-surface-500">At least 5 negative incidents are required for Monte Carlo simulation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* ── Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg border border-surface-200 px-3 py-2">
        <div className="flex items-center gap-4">
          <PillToggle options={HORIZON_OPTIONS} value={horizon} onChange={handleHorizonChange} label="Horizon" />
          <PillToggle options={SIM_COUNT_OPTIONS} value={simCount} onChange={handleSimCountChange} label="Simulations" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startTransition(() => setSignificantOnly(!significantOnly))}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              significantOnly
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            Significant Only
          </button>
          {isPending && (
            <span className="text-[10px] text-surface-400 animate-pulse">Simulating...</span>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {hasResults ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg border border-surface-200 p-3">
              <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">Expected Incidents</p>
              <p className="text-xl font-bold text-surface-900">{mcResults.summary.median}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">
                Range: {mcResults.summary.p25}–{mcResults.summary.p75}
              </p>
            </div>
            <div className={`rounded-lg border p-3 ${seriousRiskLevel.bg} ${seriousRiskLevel.border}`}>
              <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">Serious Incident Risk</p>
              <p className={`text-xl font-bold ${seriousRiskLevel.color}`}>
                {mcResults.summary.seriousProbability}%
              </p>
              <p className={`text-[10px] font-semibold ${seriousRiskLevel.color} mt-0.5`}>
                {seriousRiskLevel.label}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-surface-200 p-3">
              <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">Worst Case (P95)</p>
              <p className="text-xl font-bold text-violet-700">{mcResults.summary.p95}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">incidents in {horizon} weeks</p>
            </div>
            <div className="bg-white rounded-lg border border-surface-200 p-3">
              <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">LTI / Fatal Probability</p>
              <p className={`text-xl font-bold ${mcResults.summary.ltiFatalProbability > 20 ? 'text-red-600' : mcResults.summary.ltiFatalProbability > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                {mcResults.summary.ltiFatalProbability}%
              </p>
              <p className="text-[10px] text-surface-400 mt-0.5">P(≥1) in {horizon} weeks</p>
            </div>
          </div>

          {/* Confidence Indicator */}
          <p className="text-[10px] text-surface-500 text-center -mt-1">
            {mcResults.meta.numSimulations.toLocaleString()} simulations · Based on {mcResults.meta.totalWeeks} weeks of data · {mcResults.meta.totalObservations} observations ·{' '}
            <span className={`font-semibold ${confidence.color}`}>{confidence.label}</span>
          </p>

          {/* Distribution Histogram */}
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                <Activity size={13} className="text-primary-500" />
                Incident Count Distribution
              </h3>
              <div className="flex items-center gap-3 text-[10px] text-surface-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Simulations
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Worst-case zone
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={histogramData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={v => `${v}%`}
                  width={40}
                />
                <Tooltip content={<HistogramTooltip />} />
                <ReferenceLine
                  x={histogramData.find(b => b.binStart <= mcResults.summary.p50 && b.binEnd >= mcResults.summary.p50)?.label}
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                  label={{ value: 'P50', position: 'top', fontSize: 9, fill: '#2563eb' }}
                />
                <ReferenceLine
                  x={histogramData.find(b => b.binStart <= mcResults.summary.p95 && b.binEnd >= mcResults.summary.p95)?.label}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  label={{ value: 'P95', position: 'top', fontSize: 9, fill: '#dc2626' }}
                />
                <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
                  {histogramData.map((entry, i) => (
                    <Cell key={i} fill={entry.isAboveP95 ? '#fca5a5' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-Hazard Breakdown Table */}
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <h3 className="text-xs font-semibold text-surface-700 mb-2 flex items-center gap-1.5">
              <Shield size={13} className="text-primary-500" />
              Per-Hazard Exceedance Probability
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="text-left py-1.5 px-2 font-semibold text-surface-600">Hazard</th>
                    <th className="text-right py-1.5 px-2 font-semibold text-surface-600">Expected</th>
                    <th className="text-left py-1.5 px-2 font-semibold text-surface-600 w-32">P(≥1 incident)</th>
                    <th className="text-left py-1.5 px-2 font-semibold text-surface-600 w-32">P(≥1 serious)</th>
                    <th className="text-center py-1.5 px-2 font-semibold text-surface-600">Worst Hist.</th>
                  </tr>
                </thead>
                <tbody>
                  {mcResults.perHazard.map(h => (
                    <tr key={h.name} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                      <td className="py-1.5 px-2 font-medium text-surface-800 truncate max-w-[180px]">{h.name}</td>
                      <td className="py-1.5 px-2 text-right text-surface-700">{h.mean}</td>
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, h.pAtLeast1)}%` }}
                            />
                          </div>
                          <span className="text-surface-600 w-10 text-right">{h.pAtLeast1}%</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${h.pAtLeast1Serious > 30 ? 'bg-red-400' : h.pAtLeast1Serious > 10 ? 'bg-amber-400' : 'bg-green-400'}`}
                              style={{ width: `${Math.min(100, h.pAtLeast1Serious)}%` }}
                            />
                          </div>
                          <span className="text-surface-600 w-10 text-right">{h.pAtLeast1Serious}%</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${WORST_SEVERITY_CHIPS[h.worstSeverity] || WORST_SEVERITY_CHIPS[1]}`}>
                          {WORST_SEVERITY_LABELS[h.worstSeverity] || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Severity Forecast Breakdown */}
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <h3 className="text-xs font-semibold text-surface-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-primary-500" />
              Expected Severity Breakdown ({horizon} weeks)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(mcResults.severityBreakdown).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 bg-surface-50 rounded-lg px-2.5 py-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${SEVERITY_COLORS[key]}`} />
                  <div>
                    <p className={`text-sm font-bold ${SEVERITY_TEXT_COLORS[key]}`}>{value}</p>
                    <p className="text-[10px] text-surface-500">{SEVERITY_LABELS[key]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Type breakdown detail */}
            {mcResults.typeBreakdown?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-surface-100">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {mcResults.typeBreakdown.slice(0, 8).map(t => (
                    <span key={t.type} className="text-[10px] text-surface-500">
                      <span className="font-medium text-surface-700">{t.type}</span>: {t.mean}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : isPending ? (
        <div className="bg-white rounded-lg border border-surface-200 p-8 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-surface-600">Running {simCount.toLocaleString()} simulations...</p>
          <p className="text-[10px] text-surface-400 mt-1">Analyzing {sortedHazards.length} hazards over {horizon} weeks</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-surface-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <Dices size={24} className="text-surface-400" />
          </div>
          <p className="text-sm font-medium text-surface-700 mb-1">Insufficient Data</p>
          <p className="text-xs text-surface-500">Not enough historical data to calibrate simulation rates.</p>
        </div>
      )}
    </div>
  )
}

export default memo(MonteCarloTab)
