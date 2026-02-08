import React, { useMemo, useState, useCallback } from 'react'
import {
  Shield,
  ListChecks,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  AlertTriangle
} from 'lucide-react'
import { ForecastChart, HazardTrendingChart } from '../insights'
import {
  generateRecommendations,
  calculateRiskScore,
  getActionItemsCount,
  getCompositeTrends,
  getHazardTrending,
  forecastIncidents
} from '../../utils/insightsCalculations'

const PRIORITY_COLORS = {
  HIGH: 'bg-safety-critical',
  MEDIUM: 'bg-safety-warning',
  LOW: 'bg-safety-success'
}

const RISK_DOT = {
  good: 'bg-safety-success',
  warning: 'bg-safety-warning',
  critical: 'bg-safety-critical',
  unknown: 'bg-surface-400'
}

const RISK_TEXT = {
  good: 'text-safety-success',
  warning: 'text-safety-warning',
  critical: 'text-safety-critical',
  unknown: 'text-surface-500'
}

/**
 * PredictiveSimulationTab — Compact executive view
 * KPI strip + 2 charts + insight strip. Scannable in 5 seconds.
 */
const PredictiveSimulationTab = ({ filteredIncidents, period }) => {
  const [forecastDays, setForecastDays] = useState(30)

  const metrics = useMemo(() => {
    if (!filteredIncidents || filteredIncidents.length === 0) return null
    return {
      riskScore: calculateRiskScore(filteredIncidents),
      actionItems: getActionItemsCount(filteredIncidents),
      compositeTrends: getCompositeTrends(filteredIncidents),
      forecast: forecastIncidents(filteredIncidents, forecastDays),
      hazardTrending: getHazardTrending(filteredIncidents),
      recommendations: generateRecommendations(filteredIncidents)
    }
  }, [filteredIncidents, forecastDays])

  const handleForecastPeriodChange = useCallback((days) => {
    setForecastDays(days)
  }, [])

  if (!filteredIncidents?.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-100 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
          <Zap size={24} className="text-surface-400" />
        </div>
        <h2 className="text-base font-semibold text-surface-800 mb-1">No Predictive Data</h2>
        <p className="text-xs text-surface-500">Import more observation data to enable forecasting and simulation.</p>
      </div>
    )
  }

  if (!metrics) return null

  const riskLevel = metrics.riskScore?.level || 'unknown'
  const riskScore = metrics.riskScore?.score ?? 0
  const actionTotal = metrics.actionItems?.total ?? 0
  const actionHigh = metrics.actionItems?.high ?? 0
  const trendDir = metrics.compositeTrends?.incidents?.direction || 'stable'
  const trendChange = metrics.compositeTrends?.incidents?.change || 0
  const topInsights = (metrics.recommendations || []).slice(0, 3)

  const TrendIcon = trendDir === 'improving' ? TrendingDown : trendDir === 'worsening' ? TrendingUp : Minus
  const trendColor = trendDir === 'improving' ? 'text-safety-success' : trendDir === 'worsening' ? 'text-safety-critical' : 'text-surface-500'
  const trendLabel = trendDir === 'improving' ? 'Improving' : trendDir === 'worsening' ? 'Worsening' : 'Stable'

  return (
    <div className="space-y-3 animate-fade-in">
      {/* KPI Strip */}
      <div className="bg-white rounded-lg border border-surface-200 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Risk Score */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${RISK_DOT[riskLevel]}`} />
            <Shield size={15} className="text-surface-400" />
            <span className="text-xs text-surface-500">Risk</span>
            <span className={`text-sm font-bold ${RISK_TEXT[riskLevel]}`}>{riskScore}%</span>
            <span className="text-xs text-surface-400 capitalize">{riskLevel}</span>
          </div>

          <div className="w-px h-6 bg-surface-200 hidden sm:block" />

          {/* Action Items */}
          <div className="flex items-center gap-2">
            <ListChecks size={15} className="text-surface-400" />
            <span className="text-xs text-surface-500">Actions</span>
            <span className="text-sm font-bold text-surface-800">{actionTotal}</span>
            {actionHigh > 0 && (
              <span className="text-2xs font-semibold bg-safety-critical/10 text-safety-critical px-1.5 py-0.5 rounded-full">
                {actionHigh} high
              </span>
            )}
          </div>

          <div className="w-px h-6 bg-surface-200 hidden sm:block" />

          {/* Trend */}
          <div className="flex items-center gap-2">
            <TrendIcon size={15} className={trendColor} />
            <span className="text-xs text-surface-500">Trend</span>
            <span className={`text-sm font-bold ${trendColor}`}>{trendLabel}</span>
            <span className="text-xs text-surface-400">{trendChange > 0 ? '+' : ''}{trendChange}%</span>
          </div>
        </div>
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Forecast Chart */}
        <div className="bg-white rounded-lg border border-surface-200 p-3">
          <h3 className="text-xs font-semibold text-surface-600 mb-2">Incident Forecast</h3>
          <div className="h-72">
            <ForecastChart
              data={metrics.forecast}
              onPeriodChange={handleForecastPeriodChange}
            />
          </div>
        </div>

        {/* Hazard Trending */}
        <div className="bg-white rounded-lg border border-surface-200 p-3">
          <h3 className="text-xs font-semibold text-surface-600 mb-2">Top Hazards</h3>
          <div className="h-72">
            <HazardTrendingChart data={metrics.hazardTrending} />
          </div>
        </div>
      </div>

      {/* Insight Strip */}
      {topInsights.length > 0 && (
        <div className="bg-surface-50 rounded-lg border border-surface-200 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={13} className="text-surface-400" />
            <span className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">Key Insights</span>
          </div>
          <div className="space-y-1.5">
            {topInsights.map((rec, i) => (
              <div key={rec.id || i} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_COLORS[rec.priority] || 'bg-surface-400'}`} />
                <span className="text-xs text-surface-700 leading-snug">{rec.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(PredictiveSimulationTab)
