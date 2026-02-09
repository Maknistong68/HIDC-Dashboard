import React, { useMemo, useRef, useEffect, useState, startTransition } from 'react'
import { Shield, BarChart3, Activity, Info, CheckCircle2, TrendingUp, TrendingDown, Minus, AlertTriangle, HelpCircle } from 'lucide-react'
import Tooltip from '../ui/Tooltip'
import { isOpenAction } from '../../utils/incidentHelpers'
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

const getTrendArrow = (detail) => {
  if (!detail) return null
  const match = detail.match(/(\d+)\s*cur\s*\/\s*(\d+)\s*prev/i)
  if (!match) return null
  const cur = parseInt(match[1], 10)
  const prev = parseInt(match[2], 10)
  if (prev === 0 && cur === 0) {
    return { icon: <Minus size={12} className="text-surface-400" />, color: 'text-surface-500', text: 'Stable — no incidents in either period' }
  }
  if (prev === 0) {
    return { icon: <TrendingUp size={12} className="text-red-500" />, color: 'text-red-600', text: `New activity: ${cur} incident${cur !== 1 ? 's' : ''} in recent 60 days (none prior)` }
  }
  const pctChange = Math.round(((cur - prev) / prev) * 100)
  if (pctChange > 5) {
    return { icon: <TrendingUp size={12} className="text-red-500" />, color: 'text-red-600', text: `Incidents up ${pctChange}% (${cur} vs ${prev} in prior period)` }
  }
  if (pctChange < -5) {
    return { icon: <TrendingDown size={12} className="text-green-500" />, color: 'text-green-600', text: `Incidents dropped ${Math.abs(pctChange)}% (${cur} vs ${prev} in prior period)` }
  }
  return { icon: <Minus size={12} className="text-surface-400" />, color: 'text-surface-500', text: `Stable — similar volume both periods (${cur} vs ${prev})` }
}

const SIGNAL_LABELS = {
  severityMix: 'Injury Severity',
  trend: 'Trend (60d)',
  openActionRate: 'Open Actions',
  highRiskExposure: 'High-Risk Exposure',
  nearMissRate: 'Near-Miss Rate',
  positiveRate: 'Positive Rate'
}

const SIGNAL_META = {
  severityMix: {
    tooltip: 'HOW THIS IS CALCULATED: We look at the proportion of incidents classified as serious injuries (LTI — Lost Time Injury, or MTI — Medical Treatment Injury) relative to all incidents. A higher score means a larger share of incidents resulted in serious harm. For example, a score of 60 means roughly 60% of incidents were LTI or MTI. A low score means most incidents are minor — that is what you want to see.',
    inverted: false,
    interpret: (s) => s === 0 ? 'No severe injuries — good'
      : s <= 30 ? 'Low severity ratio'
      : s <= 60 ? 'Moderate severity — review needed'
      : 'High severity — immediate attention needed'
  },
  trend: {
    tooltip: 'HOW THIS IS CALCULATED: We compare the number of incidents in the most recent 60-day window against the previous 60-day window. Using 60 days provides smoother trend detection that filters out short-term noise. A score of 0 means incidents dropped or stayed flat. A score above 60 means a significant increase. A "spike" indicator appears if the last 30 days are significantly higher than the 60-day average.',
    inverted: false,
    interpret: (s) => s <= 30 ? 'Declining or stable trend'
      : s <= 60 ? 'Slightly increasing activity'
      : 'Significant increase in recent incidents'
  },
  openActionRate: {
    tooltip: 'HOW THIS IS CALCULATED: We count how many incidents still have unresolved corrective actions (status "open" or "in-progress") as a percentage of total incidents. A score of 80 means 80% of incidents have outstanding actions that haven\'t been closed. High scores indicate follow-through problems — incidents are being reported but fixes aren\'t being completed.',
    inverted: false,
    interpret: (s) => s <= 10 ? 'Almost all actions closed — good'
      : s <= 30 ? 'Some actions still open'
      : s <= 60 ? 'Many unresolved actions — follow up needed'
      : 'Most actions unresolved — escalation needed'
  },
  highRiskExposure: {
    tooltip: 'HOW THIS IS CALCULATED: We measure the percentage of incidents that involve major hazard categories — Working at Height, Lifting Operations, Confined Space, Electrical, Excavation, and Hot Work. These are activities with higher potential for fatality or serious injury. A high score means a large share of this entity\'s work involves inherently dangerous tasks, which demands stronger risk controls.',
    inverted: false,
    interpret: (s) => s <= 30 ? 'Low exposure to major hazards'
      : s <= 60 ? 'Moderate exposure — ensure controls are in place'
      : 'High exposure to major hazards — verify risk controls'
  },
  nearMissRate: {
    tooltip: 'HOW THIS IS CALCULATED: This is an INVERTED signal — a higher score means HIGHER risk. We measure what percentage of site-months meet the target of 2 near-misses per site per month. If few site-months meet this target, workers may not be reporting hazards before they cause harm. A high bar here means "most sites below target" which is a warning sign. Good teams consistently report 2+ near-misses per site per month — it shows hazard awareness.',
    inverted: true,
    invertedNote: 'Low reporting = higher risk',
    interpret: (s) => s <= 30 ? 'Good near-miss reporting (80%+ site-months meet target)'
      : s <= 60 ? 'Moderate reporting — some sites below 2/month target'
      : 'Very low near-miss reporting — most sites below 2/month target'
  },
  positiveRate: {
    tooltip: 'HOW THIS IS CALCULATED: This is an INVERTED signal — a higher score means HIGHER risk. We measure the rate of positive safety observations (good catches, safe behaviors) relative to total observations. When positive observations are rare, it suggests workers aren\'t engaged in proactive safety. A high bar here means "very few positive observations" — the workforce may only report when things go wrong, not when things go right.',
    inverted: true,
    invertedNote: 'Fewer positives = higher risk',
    interpret: (s) => s <= 30 ? 'Strong positive observation rate'
      : s <= 60 ? 'Moderate — encourage more positive reporting'
      : 'Low positive observations — safety culture concern'
  }
}

const INVERTED_EXPLANATIONS = {
  nearMissRate: {
    high: 'Almost no near-miss reports are being filed. This is a red flag — it usually means workers are not identifying hazards before they cause harm, or they don\'t feel comfortable reporting. Healthy teams report many near-misses for every actual incident.',
    moderate: 'Near-miss reporting is below what we\'d expect. It may indicate that some hazards are going unnoticed or unreported. Consider running a near-miss awareness campaign or making reporting easier.',
    smallSample: 'Sample size too small for reliable culture assessment. With fewer than 20 incidents, low near-miss rates could reflect limited exposure rather than under-reporting. Collect more data before drawing conclusions.'
  },
  positiveRate: {
    high: 'Very few positive safety observations are being recorded. This suggests the safety culture may be reactive — people only report when something goes wrong, not when things go right. Encouraging positive observations helps reinforce safe behaviors.',
    moderate: 'Positive observations are lower than ideal. Teams with strong safety cultures typically record more "good catches" and safe behavior observations. Consider recognizing and rewarding proactive safety reporting.',
    smallSample: 'Sample size too small for reliable culture assessment. With fewer than 20 incidents, low positive observation rates may not indicate a culture problem. Continue monitoring as more data becomes available.'
  }
}

const SIGNAL_ACTIONS = {
  severityMix: 'reviewing incident severity patterns',
  trend: 'investigating the recent increase in incidents',
  openActionRate: 'closing outstanding corrective actions',
  highRiskExposure: 'verifying risk controls for major hazards',
  nearMissRate: 'encouraging near-miss reporting',
  positiveRate: 'promoting positive safety observations'
}

const getSignalBarColor = (score) => {
  if (score > 60) return 'bg-red-500'
  if (score > 30) return 'bg-amber-500'
  return 'bg-emerald-500'
}

const getRiskBadge = (level) => {
  if (level === 'High') return { bg: 'bg-red-100', text: 'text-red-700' }
  if (level === 'Moderate') return { bg: 'bg-amber-100', text: 'text-amber-700' }
  return { bg: 'bg-green-100', text: 'text-green-700' }
}

const getScoreTextColor = (score) => {
  if (score > 60) return 'text-red-600'
  if (score > 30) return 'text-amber-600'
  return 'text-emerald-600'
}

const getBarColor = (count, maxCount) => {
  const ratio = maxCount > 0 ? count / maxCount : 0
  if (ratio > 0.7) return '#ef4444'
  if (ratio > 0.4) return '#f59e0b'
  if (ratio > 0.2) return '#3b82f6'
  return '#10b981'
}

/**
 * EntitySummaryStats - Grid of stats at top of detail panel
 */
const EntitySummaryStats = React.memo(({ entity, incidents }) => {
  const stats = useMemo(() => {
    if (!incidents?.length) return null

    const total = incidents.length
    const severe = incidents.filter(i => {
      const t = (i.severity || i.type || '').toLowerCase()
      return t === 'lti' || t === 'mti'
    }).length
    const openActions = incidents.filter(isOpenAction).length
    const nearMiss = incidents.filter(i => (i.severity || i.type || '').toLowerCase() === 'near-miss').length
    const nmPercent = total > 0 ? ((nearMiss / total) * 100).toFixed(1) : '0.0'

    const positive = incidents.filter(i => {
      const t = (i.type || '').toLowerCase()
      return t === 'positive' || t === 'positive observation'
    }).length
    const posPercent = total > 0 ? ((positive / total) * 100).toFixed(1) : '0.0'

    const majorHazards = ['Working at Height', 'Lifting Operations', 'Confined Space', 'Electrical', 'Excavation', 'Hot Work']
    const highRisk = incidents.filter(i =>
      majorHazards.includes(i.hazardCategory) || majorHazards.includes(i.location)
    ).length

    const complianceConcern = (openActions >= 3 && severe >= 1) || openActions >= 5
    const complianceLevel = (openActions >= 5 && severe >= 2) ? 'high' : 'moderate'

    return { total, severe, openActions, highRisk, nmPercent, posPercent, complianceConcern, complianceLevel }
  }, [incidents])

  if (!stats) return null

  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-surface-50 rounded px-2 py-1.5">
          <span className="text-surface-500">Total Incidents</span>
          <span className="font-semibold text-primary-600 ml-1">{stats.total}</span>
        </div>
        <div className="bg-surface-50 rounded px-2 py-1.5">
          <span className="text-surface-500">Severe (LTI+MTI)</span>
          <span className={`font-semibold ml-1 ${stats.severe > 0 ? 'text-red-500' : 'text-green-600'}`}>{stats.severe}</span>
        </div>
        <div className="bg-surface-50 rounded px-2 py-1.5">
          <span className="text-surface-500">Open Actions</span>
          <span className={`font-semibold ml-1 ${stats.openActions > 3 ? 'text-amber-600' : 'text-surface-700'}`}>{stats.openActions}</span>
        </div>
        <div className="bg-surface-50 rounded px-2 py-1.5">
          <span className="text-surface-500">High-Risk Exp.</span>
          <span className="font-semibold text-surface-700 ml-1">{stats.highRisk}</span>
        </div>
        <div className="bg-surface-50 rounded px-2 py-1.5">
          <span className="text-surface-500">Near-Miss %</span>
          <span className="font-semibold text-surface-700 ml-1">{stats.nmPercent}%</span>
        </div>
        <div className="bg-surface-50 rounded px-2 py-1.5">
          <span className="text-surface-500">Positive %</span>
          <span className="font-semibold text-surface-700 ml-1">{stats.posPercent}%</span>
        </div>
      </div>
      {stats.complianceConcern && (
        <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
          stats.complianceLevel === 'high'
            ? 'bg-red-50 border border-red-200'
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <Shield size={14} className={`flex-shrink-0 ${
            stats.complianceLevel === 'high' ? 'text-red-500' : 'text-amber-500'
          }`} />
          <span className={stats.complianceLevel === 'high' ? 'text-red-800' : 'text-amber-800'}>
            {stats.complianceLevel === 'high'
              ? 'Compliance Risk: High open actions + severe injuries — potential audit/stop-work concern'
              : 'Compliance Watch: Multiple open actions may affect audit readiness'}
          </span>
        </div>
      )}
    </div>
  )
})

EntitySummaryStats.displayName = 'EntitySummaryStats'

/**
 * SignalBars - Horizontal bars showing each signal score
 */
const SignalBars = React.memo(({ signals, isTransitioning, entityName }) => {
  if (!signals) return null

  return (
    <div className={`space-y-3 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      {Object.entries(SIGNAL_LABELS).map(([key, label]) => {
        const sig = signals[key]
        if (!sig) return null
        const meta = SIGNAL_META[key]
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <span className="text-xs font-medium text-surface-700">{label}</span>
                {meta?.inverted && (
                  <span className="text-2xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded leading-none">
                    ↕ {meta.invertedNote}
                  </span>
                )}
                {meta && (
                  <Tooltip content={meta.tooltip} position="top" delay={200}>
                    <Info size={12} className="text-surface-400 cursor-help" />
                  </Tooltip>
                )}
              </span>
              <span className="text-xs font-bold text-surface-600">{sig.score}/100</span>
            </div>
            <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getSignalBarColor(sig.score)}`}
                style={{ width: `${Math.max(2, sig.score)}%` }}
              />
            </div>
            <p className="text-2xs mt-0.5">
              <span className="text-surface-500">{meta ? meta.interpret(sig.score) : ''}</span>
              {sig.detail && <span className="text-surface-400"> ({sig.detail})</span>}
            </p>
            {key === 'trend' && sig.detail && (() => {
              const arrow = getTrendArrow(sig.detail)
              return (
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {arrow && (
                    <>
                      {arrow.icon}
                      <span className={`text-2xs font-medium ${arrow.color}`}>{arrow.text}</span>
                    </>
                  )}
                  {sig.spikeDetected && (
                    <span className="text-2xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <TrendingUp size={10} />
                      Recent spike
                    </span>
                  )}
                </div>
              )
            })()}
            {meta?.inverted && sig.score > 30 && INVERTED_EXPLANATIONS[key] && (
              <div className={`mt-1.5 flex items-start gap-1.5 rounded px-2 py-1.5 ${
                sig.hasCultureContext === false
                  ? 'bg-surface-50 border border-surface-200'
                  : 'bg-blue-50 border border-blue-100'
              }`}>
                {sig.hasCultureContext === false ? (
                  <HelpCircle size={12} className="text-surface-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Info size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-2xs leading-relaxed ${
                  sig.hasCultureContext === false ? 'text-surface-600' : 'text-blue-800'
                }`}>
                  {sig.hasCultureContext === false
                    ? INVERTED_EXPLANATIONS[key].smallSample
                    : sig.score > 60
                      ? INVERTED_EXPLANATIONS[key].high
                      : INVERTED_EXPLANATIONS[key].moderate}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
})

SignalBars.displayName = 'SignalBars'

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
 * Mirrors HazardDetailPanel structure and styling
 */
const EntityDetailPanel = ({ entity, incidents, dimension, totalIncidents, rankings }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeTab, setActiveTab] = useState('signals')
  const prevEntityRef = useRef(null)

  const benchmark = useMemo(() => {
    if (!rankings?.length || !entity) return null
    const total = rankings.length
    const avg = Math.round(rankings.reduce((s, r) => s + r.score, 0) / total)
    const rank = rankings.findIndex(r => r.name === entity.name) + 1
    return { avg, rank, total }
  }, [rankings, entity])

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

  const badge = getRiskBadge(entity.riskLevel)
  const sharePercent = totalIncidents > 0
    ? ((entity.incidentCount / totalIncidents) * 100).toFixed(1)
    : 0

  return (
    <div
      className={`h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Summary stats grid */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <EntitySummaryStats entity={entity} incidents={incidents} />
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {entity.meetsMinReportPolicy === false && (
            <Tooltip
              content={`Policy requires min. 2 reports/site/month. Violations: ${
                entity.monthlyViolations?.slice(0, 5).map(v => `${v.site} (${v.month}: ${v.count})`).join(', ')
              }${entity.monthlyViolations?.length > 5 ? ` +${entity.monthlyViolations.length - 5} more` : ''}`}
              position="left"
              delay={200}
            >
              <span className="text-2xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1 cursor-help">
                <AlertTriangle size={10} />
                Low site coverage
              </span>
            </Tooltip>
          )}
          {entity.lowConfidence && (
            <span className="text-2xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1" title="Low sample size">
              Low data
            </span>
          )}
        </div>
      </div>

      {/* Entity name header */}
      <div className="px-4 py-3 bg-surface-50">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-surface-800">{entity.name}</h3>
          <Tooltip content="Composite risk score (0-100). Higher = riskier. Based on 6 weighted signals." position="top" delay={200}>
            <span className="flex items-center cursor-help">
              <span className="text-xs text-surface-400 mr-0.5">Risk</span>
              <span className={`text-sm font-bold ${getScoreTextColor(entity.score)}`}>{entity.score}</span>
              <span className="text-2xs text-surface-400">/100</span>
            </span>
          </Tooltip>
          <span className={`px-1.5 py-0.5 rounded text-2xs font-semibold ${badge.bg} ${badge.text}`}>
            {entity.riskLevel}
          </span>
          {benchmark && (
            <span className="text-2xs text-surface-400">(avg: {benchmark.avg} · rank {benchmark.rank}/{benchmark.total})</span>
          )}
        </div>
        <p className="text-xs text-surface-500">
          {entity.incidentCount} incident{entity.incidentCount !== 1 ? 's' : ''} &middot; {dimension}
        </p>
        {benchmark && (
          <p className="text-2xs text-surface-400 mt-0.5">
            Score is {entity.score >= benchmark.avg ? 'above' : 'below'} the {benchmark.total}-entity average of {benchmark.avg}. Higher score = higher risk.
          </p>
        )}
        {insightData && insightData.isLow && !insightData.hasContradiction && (
          <div className="mt-2 flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-800">Low risk profile. Continue monitoring.</p>
          </div>
        )}
      </div>

      {/* Tab selector */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-surface-100 bg-surface-50">
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
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        {activeTab === 'signals' ? (
          <SignalBars signals={entity.signals} isTransitioning={isTransitioning} entityName={entity.name} />
        ) : (
          <EntityTrendChart incidents={incidents} isTransitioning={isTransitioning} />
        )}
      </div>

      {/* Bottom bar - entity share */}
      <div className="px-4 py-3 bg-surface-50 border-t border-surface-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-surface-600">Entity Share of Total Observations</span>
          <span className="text-xs font-bold text-surface-700">{sharePercent}%</span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${sharePercent}%` }}
          />
        </div>
        <p className="text-2xs text-surface-400 mt-1">
          {entity.name}: {entity.incidentCount} of {totalIncidents} observations ({sharePercent}%)
        </p>
      </div>
    </div>
  )
}

export default React.memo(EntityDetailPanel)
