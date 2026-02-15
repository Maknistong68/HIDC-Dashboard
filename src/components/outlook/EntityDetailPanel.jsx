import React, { useMemo, useRef, useEffect, useState, useCallback, startTransition } from 'react'
import { Shield, BarChart3, Activity, CheckCircle2, AlertTriangle, RotateCcw, ChevronDown, ChevronRight, Info } from 'lucide-react'
import Tooltip from '../ui/Tooltip'
import EntityScoreGauge from './EntityScoreGauge'
import SafetySignalRadar from './SafetySignalRadar'
import CompactPriorityStrip from './CompactPriorityStrip'
import SignalDetailCard from './SignalDetailCard'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts'
import {
  SIGNAL_KEYS,
  SIGNAL_LABELS,
  SIGNAL_META,
  SIGNAL_ACTIONS,
  DEFAULT_THRESHOLDS,
  getSignalDotColor
} from '../../utils/signalConstants'

/* ── Risk Weight constants (moved from RiskSettingsModal) ── */
const WEIGHT_LABELS = {
  severityMix: 'Injury Severity',
  trend: 'Trend (30d)',
  openActionRate: 'Open Actions',
  highRiskExposure: 'High-Risk Exp.',
  nearMissRate: 'Near-Miss Rate',
  positiveRate: 'Positive Rate'
}

const WEIGHT_HINTS = {
  nearMissRate: { inverted: true },
  positiveRate: { inverted: true }
}

const WEIGHT_RANGES = {
  severityMix: { min: 5, max: 35 },
  trend: { min: 5, max: 30 },
  openActionRate: { min: 5, max: 35 },
  highRiskExposure: { min: 5, max: 25 },
  nearMissRate: { min: 5, max: 10 },
  positiveRate: { min: 5, max: 20 }
}

const PRESETS = {
  balanced: { severityMix: 25, trend: 20, openActionRate: 20, highRiskExposure: 15, nearMissRate: 10, positiveRate: 10 },
  operations: { severityMix: 30, trend: 25, openActionRate: 20, highRiskExposure: 15, nearMissRate: 5, positiveRate: 5 },
  culture: { severityMix: 20, trend: 20, openActionRate: 20, highRiskExposure: 10, nearMissRate: 10, positiveRate: 20 },
  compliance: { severityMix: 20, trend: 15, openActionRate: 30, highRiskExposure: 20, nearMissRate: 10, positiveRate: 5 }
}

const PRESET_LABELS = {
  balanced: 'Balanced',
  operations: 'Operations',
  culture: 'Culture',
  compliance: 'Compliance'
}

const getBarColor = (count, maxCount) => {
  const ratio = maxCount > 0 ? count / maxCount : 0
  if (ratio > 0.7) return '#ef4444'
  if (ratio > 0.4) return '#f59e0b'
  if (ratio > 0.2) return '#3b82f6'
  return '#10b981'
}

/**
 * EntityTrendChart - Daily incidents bar chart for the entity
 */
const EntityTrendChart = React.memo(({ incidents, isTransitioning }) => {
  const chartData = useMemo(() => {
    if (!incidents?.length) return []
    const dateMap = new Map()
    incidents.forEach(i => {
      if (!i.date) return
      const d = typeof i.date === 'string' ? i.date.split('T')[0] : i.date
      dateMap.set(d, (dateMap.get(d) || 0) + 1)
    })
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [incidents])

  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-surface-400">No trend data available</p>
      </div>
    )
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 0)

  return (
    <div className={`h-full flex flex-col transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="bg-surface-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                      <p className="font-medium">{payload[0].payload.label}</p>
                      <p className="text-surface-300">Count: <span className="text-white font-bold">{payload[0].value}</span></p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={500}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.count, maxCount)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})

EntityTrendChart.displayName = 'EntityTrendChart'

/**
 * EntityDetailPanel - Right panel showing detail for selected entity
 * Redesigned with score gauge, metric cards, and tighter layout
 * Thresholds are now inline sliders below the radar chart
 */
const EntityDetailPanel = ({ entity, incidents, dimension, totalIncidents, rankings, thresholds, onThresholdChange, entityWeights, setEntityWeights, presetProfile, setPresetProfile }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeTab, setActiveTab] = useState('signals')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [radarSize, setRadarSize] = useState(400)
  const [showWeights, setShowWeights] = useState(false)
  const prevEntityRef = useRef(null)
  const contentRef = useRef(null)
  const radarContainerRef = useRef(null)

  // Responsive radar sizing via ResizeObserver on the radar container zone
  useEffect(() => {
    const el = radarContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      const h = entry.contentRect.height
      setRadarSize(Math.max(257, Math.min(644, Math.min(w, h) * 1.05)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const benchmark = useMemo(() => {
    if (!rankings?.length || !entity) return null
    const total = rankings.length
    const avg = Math.round(rankings.reduce((s, r) => s + r.score, 0) / total)
    const rank = rankings.findIndex(r => r.name === entity.name) + 1
    return { avg, rank, total }
  }, [rankings, entity])

  // Calculate trend for gauge (using trend signal if present for backward compatibility)
  const trendInfo = useMemo(() => {
    const trendDetail = entity?.signals?.trend?.detail
    if (!trendDetail) return { direction: null, percent: 0 }
    const match = trendDetail.match(/(\d+)\s*cur\s*\/\s*(\d+)\s*prev/i)
    if (!match) return { direction: null, percent: 0 }
    const cur = parseInt(match[1], 10)
    const prev = parseInt(match[2], 10)
    if (prev === 0 && cur === 0) return { direction: 'stable', percent: 0 }
    if (prev === 0) return { direction: 'up', percent: 100 }
    const pct = Math.round(((cur - prev) / prev) * 100)
    if (pct > 5) return { direction: 'up', percent: pct }
    if (pct < -5) return { direction: 'down', percent: pct }
    return { direction: 'stable', percent: pct }
  }, [entity])

  const insightData = useMemo(() => {
    if (!entity?.signals) return null
    const entries = Object.entries(entity.signals)
      .filter(([, v]) => v && typeof v.score === 'number')
      .sort((a, b) => b[1].score - a[1].score)
    if (entries.length < 2) return null

    const isLow = entity.score <= 30
    const bullets = []

    // Contradiction detection: overall Low but some signals in red
    const redSignals = entries.filter(([, v]) => v.score > 60)
    if (isLow && redSignals.length > 0) {
      const redNames = redSignals.map(([k]) => SIGNAL_LABELS[k] || k).join(' and ')
      bullets.push(`Overall score is Low, but ${redNames} ${redSignals.length === 1 ? 'is' : 'are'} in the red zone — don't overlook ${redSignals.length === 1 ? 'this' : 'these'}.`)
    }

    // Top signal action
    const [top1Key, top1Val] = entries[0]
    const action1 = SIGNAL_ACTIONS[top1Key] || 'reviewing the top risk signals'
    bullets.push(`Priority: ${action1} (${SIGNAL_LABELS[top1Key]} score: ${top1Val.score}/100).`)

    // Second signal if > 30
    const [top2Key, top2Val] = entries[1]
    if (top2Val.score > 30) {
      const action2 = SIGNAL_ACTIONS[top2Key] || 'addressing the second-highest signal'
      bullets.push(`Also consider ${action2} (${SIGNAL_LABELS[top2Key]}: ${top2Val.score}/100).`)
    }

    // Under-reporting flag: check if inverted signals are in top 3
    const top3Keys = entries.slice(0, 3).map(([k]) => k)
    const invertedInTop3 = top3Keys.filter(k => SIGNAL_META[k]?.inverted)
    if (invertedInTop3.length > 0 && !isLow) {
      const invNames = invertedInTop3.map(k => SIGNAL_LABELS[k] || k).join(' and ')
      bullets.push(`Under-reporting concern: ${invNames} ${invertedInTop3.length === 1 ? 'is' : 'are'} among the top risk drivers — low reporting may mask actual conditions.`)
    }

    return { bullets, isLow, hasContradiction: isLow && redSignals.length > 0 }
  }, [entity])

  // Check if thresholds differ from defaults
  const hasThresholdChanges = useMemo(
    () => SIGNAL_KEYS.some(k => thresholds[k] !== DEFAULT_THRESHOLDS[k]),
    [thresholds]
  )

  // Reset all thresholds to defaults
  const handleResetThresholds = useCallback(() => {
    SIGNAL_KEYS.forEach(key => {
      onThresholdChange(key, DEFAULT_THRESHOLDS[key])
    })
  }, [onThresholdChange])

  // Weight handlers
  const handlePresetChange = useCallback((key) => {
    setEntityWeights(PRESETS[key])
    setPresetProfile(key)
  }, [setEntityWeights, setPresetProfile])

  const handleWeightChange = useCallback((key, value) => {
    const range = WEIGHT_RANGES[key] || { min: 5, max: 50 }
    const clamped = Math.min(range.max, Math.max(range.min, value))
    setEntityWeights(prev => ({ ...prev, [key]: clamped }))
    setPresetProfile('custom')
  }, [setEntityWeights, setPresetProfile])

  // Smooth transition on entity change
  useEffect(() => {
    if (prevEntityRef.current?.name !== entity?.name) {
      startTransition(() => {
        setIsTransitioning(true)
      })
      const timer = setTimeout(() => {
        startTransition(() => {
          setIsTransitioning(false)
        })
      }, 300)
      prevEntityRef.current = entity
      return () => clearTimeout(timer)
    }
  }, [entity])

  // Empty state
  if (!entity) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <Shield size={24} className="text-surface-400" />
          </div>
          <h3 className="text-base font-semibold text-surface-700 mb-1">No Entity Selected</h3>
          <p className="text-sm text-surface-500">Select an entity from the list to view details</p>
        </div>
      </div>
    )
  }

  const sharePercent = totalIncidents > 0
    ? ((entity.incidentCount / totalIncidents) * 100).toFixed(1)
    : 0

  return (
    <div
      className={`h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Header row: Gauge + Entity info */}
      <div className="px-4 py-3 bg-surface-50 border-b border-surface-100">
        <div className="flex items-start gap-4">
          {/* Score Gauge */}
          <EntityScoreGauge
            score={entity.score}
            riskLevel={entity.riskLevel}
            trend={trendInfo.direction}
            trendPercent={trendInfo.percent}
            benchmark={benchmark}
          />

          {/* Entity info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-surface-800 truncate">{entity.name}</h3>
              {entity.lowConfidence && (
                <span className="text-2xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                  Low data
                </span>
              )}
              {entity.meetsMinReportPolicy === false && (
                <Tooltip
                  content={`Policy requires min. 2 reports/site/month. Violations: ${
                    entity.monthlyViolations?.slice(0, 5).map(v => `${v.site} (${v.month}: ${v.count})`).join(', ')
                  }${entity.monthlyViolations?.length > 5 ? ` +${entity.monthlyViolations.length - 5} more` : ''}`}
                  position="top"
                  delay={200}
                >
                  <span className="text-2xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1 cursor-help">
                    <AlertTriangle size={10} />
                    Low coverage
                  </span>
                </Tooltip>
              )}
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              {entity.incidentCount} incident{entity.incidentCount !== 1 ? 's' : ''} &middot; {dimension}
            </p>
            {benchmark && (
              <p className="text-2xs text-surface-400 mt-1">
                Score is {entity.score >= benchmark.avg ? 'above' : 'below'} the {benchmark.total}-entity average of {benchmark.avg}
              </p>
            )}
            {insightData && insightData.isLow && !insightData.hasContradiction && (
              <div className="mt-2 flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-2xs text-emerald-800">Low risk profile. Continue monitoring.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-surface-100">
        <button
          onClick={() => setActiveTab('signals')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'signals'
              ? 'bg-primary-100 text-primary-700'
              : 'text-surface-600 hover:bg-surface-100'
          }`}
        >
          <Activity size={14} />
          Signals
        </button>
        <button
          onClick={() => setActiveTab('trend')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'trend'
              ? 'bg-primary-100 text-primary-700'
              : 'text-surface-600 hover:bg-surface-100'
          }`}
        >
          <BarChart3 size={14} />
          Trend
        </button>
      </div>

      {/* Content area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0 relative">
        {activeTab === 'signals' ? (
          <div className={`h-full flex flex-col transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            {/* Zone 1: Radar chart — centered, fills available space */}
            <div
              ref={radarContainerRef}
              className="flex-1 min-h-[200px] flex items-center justify-center pt-4"
            >
              <SafetySignalRadar
                signals={entity.signals}
                thresholds={thresholds}
                onSignalSelect={setSelectedSignal}
                selectedSignal={selectedSignal}
                size={radarSize}
              />
            </div>

            {/* Zone 2: Settings — Thresholds + Weights */}
            <div className="flex-shrink-0 border-t border-surface-100">
              {/* Section A: Signal Thresholds (expanded by default) */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-semibold text-surface-700">Signal Thresholds</h4>
                    <Tooltip
                      content="Set alert levels for each signal. Signals exceeding their threshold pulse red on the radar."
                      position="top"
                      maxWidth={280}
                    >
                      <Info size={12} className="text-surface-400 hover:text-surface-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <button
                    onClick={handleResetThresholds}
                    disabled={!hasThresholdChanges}
                    className={`flex items-center gap-1 text-2xs ${
                      hasThresholdChanges ? 'text-surface-500 hover:text-surface-700' : 'text-surface-300 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                </div>
                <div className="space-y-1.5">
                  {SIGNAL_KEYS.map(key => {
                    const score = entity.signals?.[key]?.score ?? 0
                    const dotColor = getSignalDotColor(score)
                    const threshold = thresholds[key] ?? 60
                    const interpretation = SIGNAL_META[key]?.interpret?.(score) || ''
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                        <Tooltip
                          content={interpretation}
                          position="top"
                          maxWidth={260}
                        >
                          <span className="text-2xs text-surface-600 w-24 truncate flex-shrink-0 flex items-center gap-0.5 cursor-help">
                            {SIGNAL_LABELS[key]}
                            <Info size={9} className="text-surface-400 flex-shrink-0" />
                          </span>
                        </Tooltip>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={threshold}
                          onChange={e => onThresholdChange(key, Number(e.target.value))}
                          className="unified-slider threshold flex-1 h-1.5"
                          aria-label={`${SIGNAL_LABELS[key]} threshold`}
                        />
                        <span className="text-2xs font-semibold text-red-600 w-6 text-right tabular-nums">
                          {threshold}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Section B: Risk Weights (collapsed by default) */}
              <div className="border-t border-surface-100 px-4 py-2">
                <button
                  onClick={() => setShowWeights(prev => !prev)}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-1.5">
                    {showWeights ? <ChevronDown size={14} className="text-surface-500" /> : <ChevronRight size={14} className="text-surface-500" />}
                    <h4 className="text-xs font-semibold text-surface-700 group-hover:text-surface-900 transition-colors">Risk Weights</h4>
                    <Tooltip
                      content="Adjust how much each signal contributes to the overall risk score. Higher weight = more influence."
                      position="top"
                      maxWidth={280}
                    >
                      <span onClick={e => e.stopPropagation()}>
                        <Info size={12} className="text-surface-400 hover:text-surface-600 cursor-help" />
                      </span>
                    </Tooltip>
                  </div>
                  <span className={`text-2xs px-2 py-0.5 rounded-full font-medium ${
                    presetProfile === 'custom'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-primary-100 text-primary-700'
                  }`}>
                    {presetProfile === 'custom' ? 'Custom' : PRESET_LABELS[presetProfile] || 'Balanced'}
                  </span>
                </button>

                {showWeights && (
                  <div className="mt-2 space-y-2 animate-fade-in">
                    {/* Preset pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-2xs text-surface-400 font-medium">Preset:</span>
                      {Object.entries(PRESET_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => handlePresetChange(key)}
                          className={`px-2 py-0.5 rounded-full text-2xs font-medium transition-all ${
                            presetProfile === key
                              ? 'bg-primary-500 text-white'
                              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Weight sliders */}
                    <div className="space-y-1.5">
                      {Object.entries(WEIGHT_LABELS).map(([key, label]) => {
                        const hint = WEIGHT_HINTS[key]
                        const range = WEIGHT_RANGES[key] || { min: 5, max: 50 }
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className={`text-2xs w-24 truncate flex-shrink-0 ${
                              hint?.inverted ? 'text-amber-600 font-medium' : 'text-surface-600'
                            }`}>
                              {hint?.inverted && <AlertTriangle size={9} className="inline mr-0.5 -mt-px" />}
                              {label}
                            </span>
                            <input
                              type="range"
                              min={range.min}
                              max={range.max}
                              value={entityWeights[key]}
                              onChange={(e) => handleWeightChange(key, parseInt(e.target.value))}
                              className="unified-slider risk-weight flex-1 h-1.5"
                              aria-label={`${label} weight`}
                            />
                            <span className="text-2xs text-surface-500 font-mono w-7 text-right">
                              {entityWeights[key]}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Zone 3: Legend + Exceeding Thresholds */}
            <div className="flex-shrink-0 border-t border-surface-100 px-4 py-3">
              {/* Legend row — 3 items only */}
              <div className="flex flex-wrap justify-center gap-3 text-xs text-surface-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 border-t-2 border-dashed border-red-500" />
                  <span>Threshold</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Exceeds</span>
                </div>
              </div>

              {/* Compact Priority Strip */}
              <CompactPriorityStrip
                signals={entity.signals}
                thresholds={thresholds}
                onSignalClick={setSelectedSignal}
              />
            </div>

            {/* Detail Card Overlay */}
            {selectedSignal && entity.signals?.[selectedSignal] && (
              <SignalDetailCard
                signalKey={selectedSignal}
                signal={entity.signals[selectedSignal]}
                onClose={() => setSelectedSignal(null)}
              />
            )}
          </div>
        ) : (
          <div className="h-full p-4">
            <EntityTrendChart incidents={incidents} isTransitioning={isTransitioning} />
          </div>
        )}
      </div>

      {/* Bottom bar - entity share (tighter) */}
      <div className="px-4 py-2 bg-surface-50 border-t border-surface-100">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-2xs text-surface-500">Entity Share</span>
          <span className="text-2xs font-semibold text-surface-700">{sharePercent}%</span>
        </div>
        <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${sharePercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(EntityDetailPanel)
