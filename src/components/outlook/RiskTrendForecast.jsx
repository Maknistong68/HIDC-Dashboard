import React, { useState, useMemo, useCallback, startTransition, memo } from 'react'
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea,
  Scatter, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  calculateEMAForecast,
  calculateAllHazardForecasts,
  calculateIncidentProbability,
  applySimulationToForecast,
  calculateCriticalThreshold,
} from '../../utils/predictiveCalculations'
import { getHazardInsights, getDayOfWeekPatterns, getHourlyPatterns } from '../../utils/insightsCalculations'
import {
  generateContextualSliders,
  calculateProjectedChange,
  calculateFactorPrevalence,
  calculateActionClosureEffect,
  applyQuickActionPreset,
} from '../insights/ScenarioSimulatorEngine'
import { QUICK_ACTION_PRESETS } from '../../utils/constants'
import { parseISO, startOfWeek, format } from 'date-fns'
import { CONSEQUENCE_TYPE_MAP } from '../../utils/riskMatrix'
import { filterByHazard, isOpenAction } from '../../utils/incidentHelpers'
import ForecastIntelligencePanel from './ForecastIntelligencePanel'
import ForecastSimulatorPanel from './ForecastSimulatorPanel'

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.96)',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
}

const CHART_COLORS = {
  bar: '#93c5fd',
  ema: '#2563eb',
  forecast: '#7c3aed',
  confidence: '#ddd6fe',
  simulated: '#f97316',
}

const SEVERITY_DOT_COLORS = {
  4: '#991b1b', // fatality/fire — dark red
  3: '#dc2626', // LTI/security — red
  2: '#ea580c', // MTI/FAC — orange
  1: '#64748b', // near-miss/other — slate
}

const TREND_CONFIG = {
  rising: { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50', label: 'Rising' },
  declining: { icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50', label: 'Declining' },
  stable: { icon: Minus, color: 'text-surface-600', bg: 'bg-surface-50', label: 'Stable' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const hasSpike = payload.some(e => e.dataKey === 'spike' && e.value != null)
  return (
    <div style={TOOLTIP_STYLE} className="p-2">
      <p className="font-medium text-surface-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        entry.name ? (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ) : null
      ))}
      {hasSpike && (
        <p className="text-[10px] font-semibold text-red-600 mt-1">Spike: above upper Bollinger band</p>
      )}
    </div>
  )
}

/**
 * Compact sparkline card for hazard overview grid.
 */
const SparklineCard = memo(({ hazard, isSelected, onSelect }) => {
  const trend = TREND_CONFIG[hazard.trendDirection] || TREND_CONFIG.stable
  const TrendIcon = trend.icon

  return (
    <button
      onClick={() => onSelect(hazard.name)}
      className={`text-left px-2 py-1.5 rounded-md border transition-all duration-200 ${
        isSelected
          ? 'border-primary-400 bg-primary-50 shadow-sm'
          : 'border-surface-200 bg-white hover:border-surface-300'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-medium text-surface-700 truncate">{hazard.name}</span>
        <TrendIcon size={10} className={trend.color} />
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-sm font-bold text-surface-900">{hazard.currentRate}</span>
        <span className="text-[9px] text-surface-400">/wk</span>
      </div>
    </button>
  )
})

SparklineCard.displayName = 'SparklineCard'

/**
 * RiskTrendForecast - Executive Intelligence + Simulation orchestrator.
 * Composes: KPI cards, forecast chart with simulation overlay,
 * ForecastIntelligencePanel (WHEN/WHERE/WHY), ForecastSimulatorPanel (sliders + projection).
 */
const RiskTrendForecast = ({ incidents, sortedHazards, factorData, negativeIncidents }) => {
  const [selectedHazard, setSelectedHazard] = useState(null)
  const [sliderValues, setSliderValues] = useState({})
  const [actionsToClose, setActionsToClose] = useState(0)
  const [activePreset, setActivePreset] = useState(null)
  const [criticalZoneMode, setCriticalZoneMode] = useState('avg')

  // All hazard forecasts (ranked)
  const allForecasts = useMemo(
    () => calculateAllHazardForecasts(incidents, sortedHazards),
    [incidents, sortedHazards]
  )

  // Auto-select top-ranked hazard, allow override via sparkline card click
  const activeHazard = selectedHazard || allForecasts[0]?.name || null

  // Detailed EMA forecast for selected hazard
  const forecastData = useMemo(() => {
    if (!activeHazard) return null
    return calculateEMAForecast(incidents, activeHazard)
  }, [incidents, activeHazard])

  // Hazard-filtered negative incidents
  const hazardIncidents = useMemo(() => {
    if (!activeHazard || !negativeIncidents?.length) return []
    return filterByHazard(negativeIncidents, activeHazard)
  }, [negativeIncidents, activeHazard])

  // Group incidents by week for severity markers on chart
  const incidentsByWeek = useMemo(() => {
    if (!hazardIncidents?.length) return new Map()
    const map = new Map()
    for (const inc of hazardIncidents) {
      if (!inc.date) continue
      const d = typeof inc.date === 'string' ? parseISO(inc.date) : inc.date
      const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      if (!map.has(weekKey)) map.set(weekKey, [])
      map.get(weekKey).push(inc)
    }
    return map
  }, [hazardIncidents])

  // Intelligence data
  const insights = useMemo(() => {
    if (!activeHazard || !incidents?.length) return null
    return getHazardInsights(incidents, activeHazard, factorData)
  }, [incidents, activeHazard, factorData])

  const dayPatterns = useMemo(() => {
    if (!hazardIncidents.length) return null
    return getDayOfWeekPatterns(hazardIncidents)
  }, [hazardIncidents])

  const hourPatterns = useMemo(() => {
    if (!hazardIncidents.length) return null
    return getHourlyPatterns(hazardIncidents)
  }, [hazardIncidents])

  // Simulation: build hazard-specific factor data (same pattern as HazardRiskMatrix)
  const hazardFactorData = useMemo(() => {
    if (!factorData?.byFactor || !hazardIncidents?.length) return []
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))
    return factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return { name: factor.name, count: matchingIncidents.length, hazards: { [activeHazard]: matchingIncidents.length } }
      })
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [factorData, activeHazard, hazardIncidents])

  // Contextual sliders (capped at 6 for inline layout)
  const contextualSliders = useMemo(() => {
    if (!hazardFactorData.length || !hazardIncidents?.length) return []
    const result = generateContextualSliders(
      { byFactor: hazardFactorData },
      activeHazard,
      hazardIncidents.length,
      dayPatterns
    )
    return (result.sliders || result).slice(0, 6)
  }, [hazardFactorData, activeHazard, hazardIncidents, dayPatterns])

  // Factor prevalence
  const prevalence = useMemo(() => {
    if (!hazardFactorData.length || !hazardIncidents?.length) return {}
    return calculateFactorPrevalence({ byFactor: hazardFactorData }, hazardIncidents.length)
  }, [hazardFactorData, hazardIncidents])

  // Open actions count
  const openActionsCount = useMemo(() => {
    if (!hazardIncidents?.length) return 0
    return hazardIncidents.filter(isOpenAction).length
  }, [hazardIncidents])

  // Projection (same pattern as HazardRiskMatrix)
  const projection = useMemo(() => {
    const hasSliders = Object.values(sliderValues).some(v => v !== 0)
    if (!hasSliders && actionsToClose === 0) return { totalEffect: 0, effects: {}, factorsAddressed: 0 }

    const engineResult = calculateProjectedChange(sliderValues, prevalence)

    let actionEffect = 0
    if (actionsToClose > 0 && openActionsCount > 0) {
      actionEffect = calculateActionClosureEffect(actionsToClose, openActionsCount, hazardIncidents?.length || 0)
    }

    const combinedEffect = engineResult.totalEffect + actionEffect
    const clampedEffect = Math.round(Math.min(40, Math.max(-45, combinedEffect)) * 10) / 10

    return {
      totalEffect: clampedEffect,
      effects: engineResult.effects,
      factorsAddressed: Object.keys(engineResult.effects || {}).length + (actionsToClose > 0 ? 1 : 0),
      isCapped: engineResult.isCapped,
      hasDisminishingReturns: engineResult.hasDisminishingReturns,
    }
  }, [sliderValues, actionsToClose, prevalence, openActionsCount, hazardIncidents])

  // Probability calculations
  const baselineProbability = useMemo(() => {
    if (!forecastData?.hasData) return 0
    return calculateIncidentProbability(forecastData.currentRate, 4)
  }, [forecastData])

  // Simulated forecast overlay
  const simulatedForecast = useMemo(() => {
    if (!forecastData?.hasData || projection.totalEffect === 0) return null
    return applySimulationToForecast(forecastData, projection.totalEffect)
  }, [forecastData, projection.totalEffect])

  // Critical threshold — average weekly count during serious-incident weeks
  const criticalThreshold = useMemo(() => {
    if (!forecastData?.hasData || !hazardIncidents?.length) return null
    return calculateCriticalThreshold(hazardIncidents, forecastData.weeklyRates)
  }, [forecastData, hazardIncidents])

  // Active threshold value based on selected mode (only for serious-data path)
  const activeCriticalThreshold = useMemo(() => {
    if (!criticalThreshold?.hasSeriousData || criticalZoneMode === 'off') return null
    if (!criticalThreshold.thresholds) return criticalThreshold.threshold
    return criticalThreshold.thresholds[criticalZoneMode] ?? criticalThreshold.threshold
  }, [criticalThreshold, criticalZoneMode])

  const simulatedRate = simulatedForecast?.simulatedRate ?? forecastData?.currentRate ?? 0

  const simulatedProbability = useMemo(() => {
    if (!simulatedForecast) return baselineProbability
    return calculateIncidentProbability(simulatedForecast.simulatedRate, 4)
  }, [simulatedForecast, baselineProbability])

  // Compose chart data with optional simulation overlay
  const chartData = useMemo(() => {
    if (!forecastData?.hasData) return []
    const data = forecastData.weeklyRates.map((w, i) => {
      const weekIncs = incidentsByWeek.get(w.week) || []
      const worstSev = weekIncs.length > 0
        ? Math.max(...weekIncs.map(inc => CONSEQUENCE_TYPE_MAP[inc.type?.toLowerCase()] || 1))
        : 0
      const emaEntry = forecastData.emaLine[i]
      return {
        week: w.week,
        count: w.count,
        ema: emaEntry?.ema ?? null,
        bollingerUpper: emaEntry?.bollingerUpper ?? null,
        bollingerLower: emaEntry?.bollingerLower ?? null,
        spike: emaEntry?.spike ? w.count : null,
        incidentDot: worstSev > 0 ? w.count : null,
        dotColor: SEVERITY_DOT_COLORS[worstSev] || null,
      }
    })

    forecastData.forecast.forEach((f, i) => {
      const point = {
        week: f.week,
        count: null,
        ema: null,
        forecastEma: f.ema,
        forecastUpper: forecastData.confidence[i]?.upper,
        forecastLower: forecastData.confidence[i]?.lower,
      }
      // Merge simulated overlay
      if (simulatedForecast) {
        const simPoint = simulatedForecast.forecast.find(s => s.week === f.week)
        if (simPoint) point.simulatedEma = simPoint.simulatedEma
      }
      data.push(point)
    })

    const historicalCount = forecastData.weeklyRates.length
    const startIdx = Math.max(0, historicalCount - 16)
    return data.slice(startIdx)
  }, [forecastData, simulatedForecast, incidentsByWeek])

  // Handlers
  const handleSelect = useCallback((name) => {
    startTransition(() => {
      setSelectedHazard(name)
      setSliderValues({})
      setActionsToClose(0)
      setActivePreset(null)
      setCriticalZoneMode('avg')
    })
  }, [])

  const handleSliderChange = useCallback((sliderId, value) => {
    setSliderValues(prev => ({ ...prev, [sliderId]: value }))
    setActivePreset(null)
  }, [])

  const handleReset = useCallback(() => {
    setSliderValues({})
    setActionsToClose(0)
    setActivePreset(null)
  }, [])

  const handlePreset = useCallback((presetId) => {
    if (activePreset === presetId) {
      handleReset()
      return
    }
    const result = applyQuickActionPreset(presetId, prevalence, openActionsCount)
    const validSliderIds = new Set(contextualSliders.map(s => s.id))
    const filtered = {}
    for (const [key, val] of Object.entries(result.sliders || {})) {
      if (validSliderIds.has(key)) filtered[key] = val
    }
    if (Object.keys(filtered).length === 0 && contextualSliders.length > 0 && presetId !== 'close-actions') {
      contextualSliders.forEach(s => { filtered[s.id] = 50 })
    }
    setSliderValues(filtered)
    setActionsToClose(result.actionsToClose || 0)
    setActivePreset(presetId)
  }, [activePreset, prevalence, openActionsCount, contextualSliders, handleReset])

  const trend = forecastData
    ? TREND_CONFIG[forecastData.trendDirection] || TREND_CONFIG.stable
    : TREND_CONFIG.stable
  const TrendIcon = trend.icon

  if (!allForecasts.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-8 text-center">
        <p className="text-sm text-surface-500">
          Not enough data to calculate trend forecasts.
        </p>
      </div>
    )
  }

  const hasSimulation = projection.totalEffect !== 0

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPI Cards: WHAT + WHEN + PROBABILITY */}
      {/* Chart + Simulator side-by-side */}
      {forecastData?.hasData && chartData.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Forecast Chart — takes remaining space */}
          <div className="flex-1 min-w-0 bg-white rounded-lg border border-surface-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-surface-800">
                {activeHazard}
                <span className="text-surface-400 font-normal ml-1">— Weekly Incident Rate + EMA Forecast</span>
              </h3>
              <div className="flex items-center gap-2">
                {criticalThreshold?.hasSeriousData && (
                  <div className="inline-flex rounded border border-surface-200 bg-surface-50 overflow-hidden">
                    {[
                      { key: 'avg', label: 'Avg', tip: 'Average weekly count during serious-incident weeks' },
                      { key: 'med', label: 'Med', tip: 'Median — less affected by outlier weeks' },
                      { key: 'min', label: 'Min', tip: 'Minimum — most sensitive early warning' },
                      { key: 'off', label: 'Off', tip: 'Hide critical zone overlay' },
                    ].map(({ key, label, tip }) => (
                      <button
                        key={key}
                        title={tip}
                        onClick={() => setCriticalZoneMode(key)}
                        className={`text-[10px] px-2 py-0.5 font-medium transition-colors ${
                          criticalZoneMode === key
                            ? 'bg-white text-red-600 shadow-sm'
                            : 'text-surface-500 hover:text-surface-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {hasSimulation && (
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    Simulation active
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => {
                      const d = new Date(v)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />

                  {/* Critical threshold red zone */}
                  {activeCriticalThreshold != null && (
                    <>
                      <ReferenceArea
                        y1={activeCriticalThreshold}
                        fill="#fef2f2"
                        fillOpacity={0.6}
                        label={{ value: 'Risk Zone', position: 'insideTopLeft', fontSize: 9, fill: '#fca5a5' }}
                      />
                      <ReferenceLine
                        y={activeCriticalThreshold}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{
                          value: criticalThreshold?.hasSeriousData
                            ? `Serious Incident Zone — ${criticalZoneMode === 'med' ? 'Median' : criticalZoneMode === 'min' ? 'Min' : 'Avg'} (${activeCriticalThreshold}/wk)`
                            : `Elevated Activity Zone (${activeCriticalThreshold}/wk)`,
                          position: 'insideTopRight',
                          fontSize: 9,
                          fill: '#ef4444',
                        }}
                      />
                    </>
                  )}
                  {/* Statistical fallback zone (no serious data, always shown) */}
                  {criticalThreshold && !criticalThreshold.hasSeriousData && (
                    <>
                      <ReferenceArea
                        y1={criticalThreshold.threshold}
                        fill="#fef2f2"
                        fillOpacity={0.6}
                        label={{ value: 'Risk Zone', position: 'insideTopLeft', fontSize: 9, fill: '#fca5a5' }}
                      />
                      <ReferenceLine
                        y={criticalThreshold.threshold}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{
                          value: `Elevated Activity Zone (${criticalThreshold.threshold}/wk)`,
                          position: 'insideTopRight',
                          fontSize: 9,
                          fill: '#ef4444',
                        }}
                      />
                    </>
                  )}

                  {/* Bollinger Bands — historical zone (blue) */}
                  <Area dataKey="bollingerUpper" stroke="#93c5fd" strokeWidth={0.5} strokeDasharray="3 2" fill="#dbeafe" fillOpacity={0.25} name="Bollinger Band" connectNulls={false} />
                  <Area dataKey="bollingerLower" stroke="#93c5fd" strokeWidth={0.5} strokeDasharray="3 2" fill="#ffffff" fillOpacity={1} name="" legendType="none" connectNulls={false} />

                  {/* Forecast confidence band (purple, tighter) */}
                  <Area dataKey="forecastUpper" stroke="#a78bfa" strokeWidth={0.5} strokeDasharray="4 2" fill="#ede9fe" fillOpacity={0.35} name="Forecast Band" connectNulls={false} />
                  <Area dataKey="forecastLower" stroke="#a78bfa" strokeWidth={0.5} strokeDasharray="4 2" fill="#ffffff" fillOpacity={1} name="" legendType="none" connectNulls={false} />

                  {/* Historical bars */}
                  <Bar dataKey="count" fill={CHART_COLORS.bar} name="Weekly Count" radius={[2, 2, 0, 0]} barSize={14} />

                  {/* Incident severity dots on historical bars */}
                  <Scatter dataKey="incidentDot" name="Worst Severity" legendType="none" shape="circle">
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.dotColor || 'transparent'}
                        r={entry.incidentDot != null ? 5 : 0}
                        stroke="#fff"
                        strokeWidth={1.5}
                      />
                    ))}
                  </Scatter>

                  {/* Spike markers (breached upper Bollinger band) */}
                  <Scatter dataKey="spike" name="Spike" legendType="none" shape="diamond">
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.spike != null ? '#dc2626' : 'transparent'}
                        r={entry.spike != null ? 5 : 0}
                        stroke="#fff"
                        strokeWidth={1.5}
                      />
                    ))}
                  </Scatter>

                  {/* EMA line */}
                  <Line dataKey="ema" stroke={CHART_COLORS.ema} strokeWidth={2} dot={false} name="EMA" connectNulls={false} />

                  {/* Forecast dashed line */}
                  <Line dataKey="forecastEma" stroke={CHART_COLORS.forecast} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: CHART_COLORS.forecast }} name="Forecast" connectNulls={false} />

                  {/* Simulated overlay (only when sliders active) */}
                  {hasSimulation && (
                    <Line dataKey="simulatedEma" stroke={CHART_COLORS.simulated} strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3, fill: CHART_COLORS.simulated }} name="Simulated" connectNulls={false} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {criticalThreshold?.hasSeriousData && criticalZoneMode !== 'off' && (
              <p className="text-[10px] text-red-400 italic mt-1">
                {criticalZoneMode === 'avg'
                  ? `Red zone (average): When this hazard exceeded ${activeCriticalThreshold}/wk, serious incidents (LTI, fire, etc.) occurred — based on ${criticalThreshold.seriousWeekCount} occurrence${criticalThreshold.seriousWeekCount !== 1 ? 's' : ''} from ${criticalThreshold.dateRange.from} to ${criticalThreshold.dateRange.to}.`
                  : criticalZoneMode === 'med'
                    ? `Red zone (median): ${activeCriticalThreshold}/wk — median of ${criticalThreshold.seriousWeekCount} occurrence${criticalThreshold.seriousWeekCount !== 1 ? 's' : ''} from ${criticalThreshold.dateRange.from} to ${criticalThreshold.dateRange.to}. Median is less affected by outlier weeks.`
                    : `Red zone (minimum): ${activeCriticalThreshold}/wk — lowest weekly count that still produced a serious incident (${criticalThreshold.dateRange.from} to ${criticalThreshold.dateRange.to}). Most sensitive early-warning threshold.`}
              </p>
            )}
            {criticalThreshold && !criticalThreshold.hasSeriousData && (
              <p className="text-[10px] text-red-400 italic mt-1">
                Red zone: Statistically elevated activity level (mean + 1.5{'\u03C3'}). No serious incidents recorded for this hazard.
              </p>
            )}
          </div>

          {/* Simulation panel — fixed 320px width */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <ForecastSimulatorPanel
              sliders={contextualSliders}
              sliderValues={sliderValues}
              onSliderChange={handleSliderChange}
              projection={projection}
              baselineProbability={baselineProbability}
              simulatedProbability={simulatedProbability}
              openActionsCount={openActionsCount}
              actionsToClose={actionsToClose}
              onActionsToCloseChange={setActionsToClose}
              onReset={handleReset}
              onPreset={handlePreset}
              activePreset={activePreset}
            />
          </div>
        </div>
      )}

      {/* Intelligence cards (WHEN/WHERE/WHY) — full-width row */}
      {forecastData?.hasData && (
        <ForecastIntelligencePanel
          insights={insights}
          dayPatterns={dayPatterns}
          hourPatterns={hourPatterns}
        />
      )}

      {/* All Hazards — compact sparkline grid */}
      {allForecasts.length > 1 && (
        <div>
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">All Hazards</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5">
            {allForecasts.map((h) => (
              <SparklineCard
                key={h.name}
                hazard={h}
                isSelected={h.name === activeHazard}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(RiskTrendForecast)
