import React, { useMemo } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Eye, ShieldCheck, CheckCircle2, Zap, Layers } from 'lucide-react'
import { isPositiveType } from '../../utils/rootCauseEngine'

const SPARKLINE_DAYS = 14

/**
 * Build daily buckets for last N days from incidents
 */
function buildDailyBuckets(incidents, days) {
  const now = new Date()
  const buckets = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets.push({ date: d.toISOString().substring(0, 10), value: 0 })
  }
  return buckets
}

/**
 * Compute a 14-day sparkline for a given daily value function
 */
function computeSparkline(incidents, days, valueFn) {
  const buckets = buildDailyBuckets(incidents, days)
  const byDate = {}
  for (const b of buckets) byDate[b.date] = b

  for (const inc of incidents) {
    const d = inc.date?.substring(0, 10)
    if (d && byDate[d]) {
      valueFn(byDate[d], inc)
    }
  }
  return buckets
}

const STATUS_CONFIG = {
  good: { bg: 'bg-green-100', text: 'text-green-700', label: 'Good' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Watch' },
  poor: { bg: 'bg-red-100', text: 'text-red-700', label: 'Low' }
}

const ICONS = {
  nearMiss: Eye,
  positiveRate: ShieldCheck,
  actionClosure: CheckCircle2,
  reportingVelocity: Zap,
  hazardCoverage: Layers
}

const IndicatorCard = ({ icon: Icon, label, value, unit, status, sparkData, color }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.warning
  return (
    <div className="bg-white rounded-lg border border-surface-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon size={14} className="text-surface-400" />
          <span className="text-2xs font-medium text-surface-500 uppercase tracking-wide">{label}</span>
        </div>
        <span className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xl font-bold text-surface-800">{value}</span>
          {unit && <span className="text-xs text-surface-400 ml-0.5">{unit}</span>}
        </div>
        {sparkData?.length > 0 && (
          <div className="w-20 h-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

const LeadingIndicatorTracker = ({ filteredIncidents, negativeIncidents }) => {
  const indicators = useMemo(() => {
    if (!filteredIncidents?.length) return []

    const totalNeg = negativeIncidents?.length || 0
    const totalAll = filteredIncidents.length

    // 1. Near-Miss Ratio
    const nearMissCount = negativeIncidents?.filter(
      i => i.type?.toLowerCase() === 'near-miss'
    ).length || 0
    const nearMissRatio = totalNeg > 0 ? nearMissCount / totalNeg : 0
    const nearMissSpark = computeSparkline(negativeIncidents || [], SPARKLINE_DAYS, (bucket, inc) => {
      if (inc.type?.toLowerCase() === 'near-miss') bucket.value++
    })

    // 2. Positive Observation Rate
    const positiveCount = filteredIncidents.filter(i => isPositiveType(i.type)).length
    const positiveRate = totalAll > 0 ? positiveCount / totalAll : 0
    const positiveSpark = computeSparkline(filteredIncidents, SPARKLINE_DAYS, (bucket, inc) => {
      if (isPositiveType(inc.type)) bucket.value++
    })

    // 3. Action Closure Rate
    const withAction = filteredIncidents.filter(i => i.actionStatus)
    const closedActions = withAction.filter(
      i => i.actionStatus?.toLowerCase() === 'closed' || i.actionStatus?.toLowerCase() === 'completed'
    ).length
    const closureRate = withAction.length > 0 ? closedActions / withAction.length : 0

    // 4. Reporting Velocity (current week vs previous week avg)
    const now = new Date()
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const twoWeeksAgo = new Date(now)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const currentWeekCount = filteredIncidents.filter(i => {
      const d = new Date(i.date)
      return d >= oneWeekAgo && d <= now
    }).length
    const prevWeekCount = filteredIncidents.filter(i => {
      const d = new Date(i.date)
      return d >= twoWeeksAgo && d < oneWeekAgo
    }).length
    const velocityRatio = prevWeekCount > 0 ? currentWeekCount / prevWeekCount : currentWeekCount > 0 ? 1.5 : 1
    const velocitySpark = computeSparkline(filteredIncidents, SPARKLINE_DAYS, (bucket) => {
      bucket.value++
    })

    // 5. Hazard Coverage
    const allHazards = new Set(filteredIncidents.map(i => i.location).filter(Boolean))
    const observedHazards = new Set(
      filteredIncidents.filter(i => {
        const d = new Date(i.date)
        return d >= oneWeekAgo
      }).map(i => i.location).filter(Boolean)
    )
    const coverageRate = allHazards.size > 0 ? observedHazards.size / allHazards.size : 0

    return [
      {
        key: 'nearMiss',
        icon: ICONS.nearMiss,
        label: 'Near-Miss Ratio',
        value: `${(nearMissRatio * 100).toFixed(0)}%`,
        status: nearMissRatio >= 0.4 ? 'good' : nearMissRatio >= 0.2 ? 'warning' : 'poor',
        sparkData: nearMissSpark,
        color: '#22c55e'
      },
      {
        key: 'positiveRate',
        icon: ICONS.positiveRate,
        label: 'Positive Rate',
        value: `${(positiveRate * 100).toFixed(0)}%`,
        status: positiveRate >= 0.5 ? 'good' : positiveRate >= 0.3 ? 'warning' : 'poor',
        sparkData: positiveSpark,
        color: '#3b82f6'
      },
      {
        key: 'actionClosure',
        icon: ICONS.actionClosure,
        label: 'Action Closure',
        value: `${(closureRate * 100).toFixed(0)}%`,
        status: closureRate >= 0.8 ? 'good' : closureRate >= 0.6 ? 'warning' : 'poor',
        sparkData: null,
        color: '#f59e0b'
      },
      {
        key: 'reportingVelocity',
        icon: ICONS.reportingVelocity,
        label: 'Report Velocity',
        value: `${velocityRatio.toFixed(1)}x`,
        status: velocityRatio >= 0.8 && velocityRatio <= 1.3 ? 'good' : velocityRatio > 1.3 ? 'warning' : 'poor',
        sparkData: velocitySpark,
        color: '#8b5cf6'
      },
      {
        key: 'hazardCoverage',
        icon: ICONS.hazardCoverage,
        label: 'Hazard Coverage',
        value: `${(coverageRate * 100).toFixed(0)}%`,
        unit: `(${observedHazards.size}/${allHazards.size})`,
        status: coverageRate >= 0.7 ? 'good' : coverageRate >= 0.4 ? 'warning' : 'poor',
        sparkData: null,
        color: '#ec4899'
      }
    ]
  }, [filteredIncidents, negativeIncidents])

  if (!indicators.length) return null

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200">
        <h3 className="text-sm font-semibold text-surface-800">Leading Indicators</h3>
        <p className="text-2xs text-surface-400 mt-0.5">Proactive safety metrics — higher is generally better</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {indicators.map(ind => (
            <IndicatorCard key={ind.key} {...ind} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default React.memo(LeadingIndicatorTracker)
