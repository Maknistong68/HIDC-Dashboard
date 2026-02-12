import React, { useMemo, useRef, useEffect, useState, startTransition } from 'react'
import { Shield, BarChart3, Activity, CheckCircle2, AlertTriangle } from 'lucide-react'
import Tooltip from '../ui/Tooltip'
import EntityScoreGauge from './EntityScoreGauge'
import SafetySignalRadar from './SafetySignalRadar'
import SignalPriorityList from './SignalPriorityList'
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
  SIGNAL_LABELS,
  SIGNAL_META,
  SIGNAL_ACTIONS
} from '../../utils/signalConstants'

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
 * Thresholds are now passed from parent (global settings)
 */
const EntityDetailPanel = ({ entity, incidents, dimension, totalIncidents, rankings, thresholds }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeTab, setActiveTab] = useState('signals')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const prevEntityRef = useRef(null)

  const benchmark = useMemo(() => {
    if (!rankings?.length || !entity) return null
    const total = rankings.length
    const avg = Math.round(rankings.reduce((s, r) => s + r.score, 0) / total)
    const rank = rankings.findIndex(r => r.name === entity.name) + 1
    return { avg, rank, total }
  }, [rankings, entity])

  // Calculate trend for gauge (using trend signal if present for backward compatibility)
  const trendInfo = useMemo(() => {
    // Check for trend data in signals (backward compatibility)
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
      <div className="flex-1 p-4 overflow-y-auto min-h-0 relative">
        {activeTab === 'signals' ? (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            {/* Radar + Priority Panel - 50/50 split */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              {/* Radar Chart - 50% width */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <SafetySignalRadar
                  signals={entity.signals}
                  thresholds={thresholds}
                  onSignalSelect={setSelectedSignal}
                  selectedSignal={selectedSignal}
                  size={340}
                />
                {/* Legend - directly under radar */}
                <div className="flex flex-wrap justify-center gap-3 mt-2 text-2xs text-surface-500">
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
              </div>

              {/* Priority Signals List - 50% width */}
              <div className="w-full md:w-1/2">
                <SignalPriorityList
                  signals={entity.signals}
                  thresholds={thresholds}
                  onSignalClick={setSelectedSignal}
                  maxItems={3}
                />
              </div>
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
          <EntityTrendChart incidents={incidents} isTransitioning={isTransitioning} />
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
