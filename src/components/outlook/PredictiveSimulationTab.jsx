import React, { useMemo, useState, useCallback } from 'react'
import {
  Shield,
  ListChecks,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  AlertTriangle,
  Target,
  ChevronDown
} from 'lucide-react'
import { ForecastChart, HazardTrendingChart } from '../insights'
import ControlChartPanel from './ControlChartPanel'
import {
  generateRecommendations,
  calculateRiskScore,
  getActionItemsCount,
  getCompositeTrends,
  getHazardTrending,
  forecastIncidents
} from '../../utils/insightsCalculations'
import { runDiagnostics } from '../../utils/statisticalTests'
import { calculateAllRates } from '../../utils/rateCalculations'

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
      recommendations: generateRecommendations(filteredIncidents),
      rates: calculateAllRates(filteredIncidents)
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

  // Validation metrics
  const validation = metrics.forecast?.validation
  const accuracyBadge = validation?.badge
  const accuracyPct = validation?.accuracy ?? null
  const BADGE_COLORS = { high: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-red-100 text-red-700' }
  const [showMethodology, setShowMethodology] = useState(false)
  const [showModelHealth, setShowModelHealth] = useState(false)

  // Statistical diagnostics
  const diagnostics = useMemo(() => {
    if (!metrics?.forecast?.historical?.length) return null
    const dailyValues = metrics.forecast.historical.map(h => h.value)
    // Build residuals from linear regression model
    const n = dailyValues.length
    const model = metrics.forecast.model
    const residuals = model ? dailyValues.map((v, i) => v - (model.slope * i + model.intercept)) : null
    return runDiagnostics(dailyValues, residuals, 27)
  }, [metrics])

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

          {/* Model Accuracy Badge */}
          {accuracyPct !== null && (
            <>
              <div className="w-px h-6 bg-surface-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Target size={15} className="text-surface-400" />
                <span className="text-xs text-surface-500">Accuracy</span>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${BADGE_COLORS[accuracyBadge] || 'bg-surface-100 text-surface-600'}`}>
                  {accuracyPct}%
                </span>
                {accuracyBadge === 'low' && (
                  <span className="text-[10px] text-red-500">Unreliable</span>
                )}
              </div>
            </>
          )}
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

      {/* SPC Control Chart */}
      {metrics.forecast?.historical?.length >= 5 && (
        <ControlChartPanel historicalData={metrics.forecast.historical} />
      )}

      {/* Exposure Rate Cards */}
      {metrics.rates && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Contractor-Normalized Rate */}
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Contractor Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-surface-800">{metrics.rates.contractor.rate}</span>
              <span className="text-[10px] text-surface-400">per 100 contractors/mo</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-surface-500">
              <span>{metrics.rates.contractor.incidentCount} incidents</span>
              <span className="text-surface-300">|</span>
              <span>{metrics.rates.contractor.activeContractors} contractors</span>
            </div>
          </div>

          {/* Site-Day Rate */}
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Site Rate (Annualized)</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-surface-800">{metrics.rates.site.annualizedRate}</span>
              <span className="text-[10px] text-surface-400">per site/year</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-surface-500">
              <span>{metrics.rates.site.activeSites} site{metrics.rates.site.activeSites !== 1 ? 's' : ''}</span>
              <span className="text-surface-300">|</span>
              <span>{metrics.rates.site.totalDays} days</span>
            </div>
          </div>

          {/* Observation Density */}
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Reporting Density</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-surface-800">{metrics.rates.observation.density}</span>
              <span className="text-[10px] text-surface-400">obs/reporter/mo</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px]">
              <span className={`font-semibold px-1.5 py-0.5 rounded-full ${
                metrics.rates.observation.benchmark === 'excellent' ? 'bg-green-100 text-green-700' :
                metrics.rates.observation.benchmark === 'good' ? 'bg-blue-100 text-blue-700' :
                metrics.rates.observation.benchmark === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {metrics.rates.observation.benchmark}
              </span>
              <span className="text-surface-500">{metrics.rates.observation.uniqueReporters} reporters</span>
            </div>
          </div>
        </div>
      )}

      {/* Model Methodology Disclosure */}
      {validation?.metrics && (
        <div className="bg-white rounded-lg border border-surface-200">
          <button
            onClick={() => setShowMethodology(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-surface-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-surface-400" />
              <span className="text-xs font-semibold text-surface-600">Model Methodology & Accuracy</span>
              {validation.modelBeatsNaive && (
                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">Beats baseline</span>
              )}
            </div>
            <ChevronDown size={14} className={`text-surface-400 transition-transform ${showMethodology ? 'rotate-180' : ''}`} />
          </button>
          {showMethodology && (
            <div className="px-4 pb-3 border-t border-surface-100 pt-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-surface-400 uppercase">RMSE</p>
                  <p className="text-sm font-bold text-surface-800">{validation.metrics.rmse}</p>
                </div>
                <div>
                  <p className="text-[10px] text-surface-400 uppercase">MAE</p>
                  <p className="text-sm font-bold text-surface-800">{validation.metrics.mae}</p>
                </div>
                <div>
                  <p className="text-[10px] text-surface-400 uppercase">MAPE</p>
                  <p className="text-sm font-bold text-surface-800">{validation.metrics.mape}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-surface-400 uppercase">Folds</p>
                  <p className="text-sm font-bold text-surface-800">{validation.folds}</p>
                </div>
              </div>
              {validation.comparison && (
                <p className="text-[11px] text-surface-500 mt-2 text-center">{validation.comparison.summary}</p>
              )}
              <p className="text-[10px] text-surface-400 mt-2 text-center">
                Walk-forward cross-validation: train on past data, test on next 7 days, repeat.
                Naive baseline = &ldquo;same as last period&rdquo;.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Model Health Panel */}
      {diagnostics && diagnostics.warnings.length > 0 && (
        <div className="bg-white rounded-lg border border-surface-200">
          <button
            onClick={() => setShowModelHealth(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-surface-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                diagnostics.health === 'poor' ? 'bg-red-500' : diagnostics.health === 'fair' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <span className="text-xs font-semibold text-surface-600">
                Model Health: {diagnostics.health === 'poor' ? 'Poor' : diagnostics.health === 'fair' ? 'Fair' : 'Good'}
              </span>
              <span className="text-[10px] text-surface-400">
                {diagnostics.warnings.length} warning{diagnostics.warnings.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ChevronDown size={14} className={`text-surface-400 transition-transform ${showModelHealth ? 'rotate-180' : ''}`} />
          </button>
          {showModelHealth && (
            <div className="px-4 pb-3 border-t border-surface-100 pt-3 space-y-2">
              {diagnostics.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-surface-600">{w}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-surface-100 text-center text-[10px]">
                <div>
                  <p className="text-surface-400">Skewness</p>
                  <p className="font-semibold text-surface-700">{diagnostics.normality.skewness}</p>
                </div>
                <div>
                  <p className="text-surface-400">Kurtosis</p>
                  <p className="font-semibold text-surface-700">{diagnostics.normality.kurtosis}</p>
                </div>
                <div>
                  <p className="text-surface-400">Zero Days</p>
                  <p className="font-semibold text-surface-700">{diagnostics.zeroInflation.zeroPercent}%</p>
                </div>
                {diagnostics.autocorrelation && (
                  <div>
                    <p className="text-surface-400">Durbin-Watson</p>
                    <p className="font-semibold text-surface-700">{diagnostics.autocorrelation.statistic}</p>
                  </div>
                )}
              </div>
              {diagnostics.bonferroni.numTests > 1 && (
                <p className="text-[10px] text-surface-400 text-center mt-1">
                  Bonferroni-adjusted Z-threshold: {diagnostics.bonferroni.zThreshold} (testing {diagnostics.bonferroni.numTests} hazards)
                </p>
              )}
            </div>
          )}
        </div>
      )}

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
