import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Activity } from 'lucide-react'
import Tooltip from '../ui/Tooltip'
import { isOpenAction } from '../../utils/incidentHelpers'

/**
 * EntityMetricCards - Three glassmorphism cards showing grouped metrics
 * Card 1: Safety Performance (Severity, Trend, Open Actions)
 * Card 2: Risk Exposure (High-Risk %, Major hazards)
 * Card 3: Culture Metrics (Near-Miss Rate, Positive Rate - inverted)
 */
const EntityMetricCards = ({ entity, incidents }) => {
  const metrics = useMemo(() => {
    if (!incidents?.length || !entity?.signals) return null

    const total = incidents.length

    // Safety Performance
    const severe = incidents.filter(i => {
      const t = (i.severity || i.type || '').toLowerCase()
      return t === 'lti' || t === 'mti'
    }).length
    const severityPercent = total > 0 ? Math.round((severe / total) * 100) : 0
    const openActions = incidents.filter(isOpenAction).length

    // Trend from signals
    const trendSignal = entity.signals.trend || {}
    let trendDirection = 'stable'
    let trendValue = 0
    if (trendSignal.detail) {
      const match = trendSignal.detail.match(/(\d+)\s*cur\s*\/\s*(\d+)\s*prev/i)
      if (match) {
        const cur = parseInt(match[1], 10)
        const prev = parseInt(match[2], 10)
        if (prev > 0) {
          trendValue = Math.round(((cur - prev) / prev) * 100)
          if (trendValue > 5) trendDirection = 'up'
          else if (trendValue < -5) trendDirection = 'down'
        } else if (cur > 0) {
          trendDirection = 'up'
          trendValue = 100
        }
      }
    }

    // Risk Exposure
    const majorHazards = ['Working at Height', 'Lifting Operations', 'Confined Space', 'Electrical', 'Excavation', 'Hot Work']
    const highRiskIncidents = incidents.filter(i =>
      majorHazards.includes(i.hazardCategory) || majorHazards.includes(i.location)
    )
    const highRiskPercent = total > 0 ? Math.round((highRiskIncidents.length / total) * 100) : 0

    // Count unique major hazards involved
    const hazardsInvolved = new Set()
    highRiskIncidents.forEach(i => {
      if (majorHazards.includes(i.location)) hazardsInvolved.add(i.location)
      if (majorHazards.includes(i.hazardCategory)) hazardsInvolved.add(i.hazardCategory)
    })

    // Culture Metrics (inverted - low = concern)
    const nearMissScore = entity.signals.nearMissRate?.score ?? 0
    const positiveScore = entity.signals.positiveRate?.score ?? 0

    return {
      safetyPerformance: {
        severityPercent,
        severe,
        trendDirection,
        trendValue,
        openActions
      },
      riskExposure: {
        percent: highRiskPercent,
        count: highRiskIncidents.length,
        hazardCount: hazardsInvolved.size
      },
      cultureMetrics: {
        nearMissScore,
        positiveScore
      }
    }
  }, [entity, incidents])

  if (!metrics) return null

  const { safetyPerformance, riskExposure, cultureMetrics } = metrics

  const getTrendIcon = (dir, val) => {
    if (dir === 'up') return (
      <span className="flex items-center gap-0.5 text-red-500">
        <TrendingUp size={12} />
        <span className="text-2xs">+{val}%</span>
      </span>
    )
    if (dir === 'down') return (
      <span className="flex items-center gap-0.5 text-green-500">
        <TrendingDown size={12} />
        <span className="text-2xs">{val}%</span>
      </span>
    )
    return (
      <span className="flex items-center gap-0.5 text-surface-400">
        <Minus size={12} />
        <span className="text-2xs">Stable</span>
      </span>
    )
  }

  const getScoreBarColor = (score, inverted = false) => {
    // For inverted signals, high score means concern
    if (inverted) {
      if (score > 60) return 'bg-red-400'
      if (score > 30) return 'bg-amber-400'
      return 'bg-emerald-400'
    }
    // Normal: high = bad
    if (score > 60) return 'bg-red-400'
    if (score > 30) return 'bg-amber-400'
    return 'bg-emerald-400'
  }

  const getCultureLabel = (score, type) => {
    if (score <= 30) return type === 'nearMiss' ? 'Good reporting' : 'Strong engagement'
    if (score <= 60) return 'Moderate'
    return 'Low — concern'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Card 1: Safety Performance */}
      <div className="metric-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Shield size={14} className="text-primary-500" />
          <h4 className="text-xs font-semibold text-surface-700">Safety Performance</h4>
        </div>
        <div className="space-y-2">
          {/* Injury Severity */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-2xs text-surface-500">Injury Severity</span>
              <span className="text-2xs font-medium text-surface-700">{safetyPerformance.severityPercent}%</span>
            </div>
            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(safetyPerformance.severityPercent)}`}
                style={{ width: `${Math.max(2, safetyPerformance.severityPercent)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-400 mt-0.5">{safetyPerformance.severe} LTI/MTI of total</p>
          </div>

          {/* Trend */}
          <div className="flex items-center justify-between">
            <span className="text-2xs text-surface-500">Trend (60d)</span>
            {getTrendIcon(safetyPerformance.trendDirection, safetyPerformance.trendValue)}
          </div>

          {/* Open Actions */}
          <div className="flex items-center justify-between">
            <span className="text-2xs text-surface-500">Open Actions</span>
            <span className={`text-xs font-semibold ${safetyPerformance.openActions > 3 ? 'text-amber-600' : 'text-surface-700'}`}>
              {safetyPerformance.openActions}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Risk Exposure */}
      <div className="metric-card">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <h4 className="text-xs font-semibold text-surface-700">Risk Exposure</h4>
        </div>
        <div className="space-y-2">
          {/* High-Risk % */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-2xs text-surface-500">High-Risk Exposure</span>
              <span className="text-2xs font-medium text-surface-700">{riskExposure.percent}%</span>
            </div>
            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(riskExposure.percent)}`}
                style={{ width: `${Math.max(2, riskExposure.percent)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-400 mt-0.5">{riskExposure.count} major hazard incidents</p>
          </div>

          {/* Hazards involved */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-2xs text-surface-500">Major Hazards</span>
            <Tooltip
              content="Working at Height, Lifting Ops, Confined Space, Electrical, Excavation, Hot Work"
              position="top"
              delay={200}
            >
              <span className="text-xs font-semibold text-surface-700 cursor-help">
                {riskExposure.hazardCount} of 6
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Card 3: Culture Metrics */}
      <div className="metric-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity size={14} className="text-blue-500" />
          <h4 className="text-xs font-semibold text-surface-700">Culture Metrics</h4>
          <Tooltip content="Inverted signals: higher score = higher risk (low reporting)" position="top" delay={200}>
            <span className="text-2xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded leading-none cursor-help">
              ↕ Inverted
            </span>
          </Tooltip>
        </div>
        <div className="space-y-2">
          {/* Near-Miss Rate */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-2xs text-surface-500">Near-Miss Rate</span>
              <span className="text-2xs font-medium text-surface-700">{cultureMetrics.nearMissScore}/100</span>
            </div>
            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(cultureMetrics.nearMissScore, true)}`}
                style={{ width: `${Math.max(2, cultureMetrics.nearMissScore)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-400 mt-0.5">{getCultureLabel(cultureMetrics.nearMissScore, 'nearMiss')}</p>
          </div>

          {/* Positive Rate */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-2xs text-surface-500">Positive Rate</span>
              <span className="text-2xs font-medium text-surface-700">{cultureMetrics.positiveScore}/100</span>
            </div>
            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(cultureMetrics.positiveScore, true)}`}
                style={{ width: `${Math.max(2, cultureMetrics.positiveScore)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-400 mt-0.5">{getCultureLabel(cultureMetrics.positiveScore, 'positive')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(EntityMetricCards)
