import React, { useMemo, useState, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ListChecks,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  BarChart3,
  LineChart,
  Zap,
  Link2,
  Sliders,
  Users,
  Award
} from 'lucide-react'
import { useData } from '../context/DataContext'
import FilterBar from '../components/common/FilterBar'
import KPICard from '../components/dashboard/KPICard'
import EmptyState from '../components/dashboard/EmptyState'
import {
  RecommendationsList,
  RootCauseBreakdownChart,
  RootCauseHazardMatrix,
  RootCauseTrendChart,
  NearMissGauge,
  TrendIndicatorGroup,
  HazardTrendingChart,
  InsightsDrillDownModal,
  ForecastChart,
  ForecastAlertCard,
  AnomalyDetectionPanel,
  PatternInsightsList,
  WhatIfSimulator,
  SafetyCultureDashboard,
  ComparativeBenchmark
} from '../components/insights'
import {
  generateRecommendations,
  calculateRiskScore,
  getActionItemsCount,
  getRootCauseBreakdown,
  getRootCauseByHazard,
  getRootCauseTrends,
  getNearMissAnalysis,
  getCompositeTrends,
  getHazardTrending,
  forecastIncidents,
  getAnomalyAnalysis,
  identifyCorrelationPatterns,
  runWhatIfSimulation,
  calculateSafetyCultureScore,
  getContractorBenchmark,
  getOverdueActionAlerts
} from '../utils/insightsCalculations'
import { getObservationsByHour } from '../utils/dataQualityCalculations'

// Info tooltip component
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-flex items-center ml-1.5">
    <Info size={14} className="text-surface-400 cursor-help hover:text-surface-600 transition-colors" />
    <div className="hidden group-hover:block absolute z-50 w-64 p-2.5 bg-surface-900 text-white text-xs rounded-lg shadow-xl left-5 top-0 leading-relaxed">
      <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-surface-900 transform rotate-45"></div>
      <span className="relative">{text}</span>
    </div>
  </div>
)

// Collapsible section component
const Section = ({ title, icon: Icon, children, defaultOpen = true, info }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-primary-600" />}
          <h2 className="font-semibold text-surface-800">{title}</h2>
          {info && <InfoTooltip text={info} />}
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-surface-400" />
        ) : (
          <ChevronDown size={20} className="text-surface-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-surface-100">
          {children}
        </div>
      )}
    </div>
  )
}

const PredictiveAnalytics = () => {
  const { incidents, isLoading } = useData()

  // Filter state
  const [filters, setFilters] = useState({
    contractor: '',
    site: '',
    dateFrom: '',
    dateTo: ''
  })

  // Drill-down modal state
  const [drillDown, setDrillDown] = useState({
    type: null,
    data: null,
    title: ''
  })

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      if (key === 'contractor') {
        newFilters.site = ''
      }
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ contractor: '', site: '', dateFrom: '', dateTo: '' })
  }, [])

  // Get unique contractors and sites for filters
  const { contractors, sites } = useMemo(() => {
    const contractorSet = new Set()
    const siteSet = new Set()

    incidents.forEach(incident => {
      if (incident.contractor) contractorSet.add(incident.contractor)
      if (incident.site) siteSet.add(incident.site)
    })

    return {
      contractors: [...contractorSet].sort(),
      sites: [...siteSet].sort()
    }
  }, [incidents])

  // Filter incidents based on current filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      if (filters.contractor && incident.contractor !== filters.contractor) return false
      if (filters.site && incident.site !== filters.site) return false
      if (filters.dateFrom && incident.date < filters.dateFrom) return false
      if (filters.dateTo && incident.date > filters.dateTo) return false
      return true
    })
  }, [incidents, filters])

  // Forecast period state
  const [forecastDays, setForecastDays] = useState(30)

  // Calculate all metrics
  const metrics = useMemo(() => {
    if (filteredIncidents.length === 0) return null

    // Get hour data for coverage calculations
    const hourData = getObservationsByHour(filteredIncidents)
    const currentNightPct = hourData.summary.hasTimeData
      ? parseFloat(hourData.summary.nightShiftPct)
      : 15

    // Get overdue count for simulator
    const overdueAlerts = getOverdueActionAlerts(filteredIncidents)
    const overdueCount = overdueAlerts.reduce((sum, a) => sum + (a.metric || 0), 0)

    // Get top root causes for simulator
    const rootCauseBreakdown = getRootCauseBreakdown(filteredIncidents)
    const topRootCauses = rootCauseBreakdown.breakdown
      .filter(r => r.name !== 'Not Specified')
      .slice(0, 5)
      .map(r => r.name)

    return {
      recommendations: generateRecommendations(filteredIncidents),
      riskScore: calculateRiskScore(filteredIncidents),
      actionItems: getActionItemsCount(filteredIncidents),
      rootCauseBreakdown,
      rootCauseByHazard: getRootCauseByHazard(filteredIncidents),
      rootCauseTrends: getRootCauseTrends(filteredIncidents),
      nearMissAnalysis: getNearMissAnalysis(filteredIncidents),
      compositeTrends: getCompositeTrends(filteredIncidents),
      hazardTrending: getHazardTrending(filteredIncidents),
      // Phase 1: Forecasting
      forecast: forecastIncidents(filteredIncidents, forecastDays),
      // Phase 2: Anomaly Detection
      anomalies: getAnomalyAnalysis(filteredIncidents),
      // Phase 3: Correlation Patterns
      correlations: identifyCorrelationPatterns(filteredIncidents),
      // Phase 5: Simulator data
      simulatorData: {
        overdueCount,
        currentNightPct,
        topRootCauses
      },
      // Phase 6: Safety Culture & Benchmarking
      safetyCulture: calculateSafetyCultureScore(filteredIncidents),
      benchmark: getContractorBenchmark(filteredIncidents)
    }
  }, [filteredIncidents, forecastDays])

  // Handle forecast period change
  const handleForecastPeriodChange = useCallback((days) => {
    setForecastDays(days)
  }, [])

  // Handle recommendation click
  const handleRecommendationClick = useCallback((recommendation) => {
    setDrillDown({
      type: 'recommendation',
      data: recommendation.drillDownData,
      title: recommendation.title
    })
  }, [])

  // Close drill-down modal
  const closeDrillDown = useCallback(() => {
    setDrillDown({ type: null, data: null, title: '' })
  }, [])

  // Filter configuration
  const filterConfig = useMemo(() => {
    // Get sites for selected contractor
    const availableSites = filters.contractor
      ? [...new Set(incidents
          .filter(i => i.contractor === filters.contractor)
          .map(i => i.site)
          .filter(Boolean)
        )].sort()
      : sites

    return [
      {
        key: 'contractor',
        type: 'select',
        label: 'Contractor',
        placeholder: 'All Contractors',
        options: contractors.map(c => ({ value: c, label: c }))
      },
      {
        key: 'site',
        type: 'select',
        label: 'Site',
        placeholder: 'All Sites',
        options: availableSites.map(s => ({ value: s, label: s }))
      },
      {
        key: 'dateFrom',
        type: 'date',
        label: 'From'
      },
      {
        key: 'dateTo',
        type: 'date',
        label: 'To'
      }
    ]
  }, [contractors, sites, filters.contractor, incidents])

  // Show empty state if no data
  if (incidents.length === 0) {
    return <EmptyState />
  }

  // Get trend icon and color
  const getTrendIcon = (direction) => {
    if (direction === 'improving') return { Icon: TrendingDown, color: 'text-safety-success' }
    if (direction === 'worsening') return { Icon: TrendingUp, color: 'text-safety-critical' }
    return { Icon: Minus, color: 'text-surface-400' }
  }

  const riskLevel = metrics?.riskScore?.level || 'unknown'
  const riskColors = {
    good: { bg: 'bg-safety-success-light', text: 'text-safety-success' },
    warning: { bg: 'bg-safety-warning-light', text: 'text-safety-warning' },
    critical: { bg: 'bg-safety-critical-light', text: 'text-safety-critical' },
    unknown: { bg: 'bg-surface-100', text: 'text-surface-500' }
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-surface-800">Predictive Analytics</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Insights, recommendations, and trend analysis
          </p>
        </div>
        <div className="text-sm text-surface-500">
          Analyzing {filteredIncidents.length.toLocaleString()} observations
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {metrics && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Overall Risk Score */}
            <KPICard
              title="Risk Score"
              value={`${metrics.riskScore.score}%`}
              subtitle={`${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk level`}
              icon={Shield}
              color={riskLevel === 'good' ? 'success' : riskLevel === 'warning' ? 'warning' : 'danger'}
              info="Composite score based on near-miss reporting, action closure, shift coverage, and contractor quality"
            />

            {/* Action Items */}
            <KPICard
              title="Action Items"
              value={metrics.actionItems.total}
              subtitle={
                metrics.actionItems.high > 0
                  ? `${metrics.actionItems.high} high priority`
                  : 'No high priority items'
              }
              icon={ListChecks}
              color={metrics.actionItems.high > 0 ? 'danger' : metrics.actionItems.medium > 0 ? 'warning' : 'success'}
              info="Recommendations requiring attention based on data analysis"
            />

            {/* Trend Direction */}
            <KPICard
              title="Overall Trend"
              value={
                metrics.compositeTrends?.incidents?.direction === 'improving' ? 'Improving' :
                metrics.compositeTrends?.incidents?.direction === 'worsening' ? 'Needs Attention' :
                'Stable'
              }
              subtitle={`${metrics.compositeTrends?.incidents?.change || 0}% change`}
              icon={Activity}
              color={
                metrics.compositeTrends?.incidents?.direction === 'improving' ? 'success' :
                metrics.compositeTrends?.incidents?.direction === 'worsening' ? 'danger' :
                'info'
              }
              trend={
                metrics.compositeTrends?.incidents?.direction === 'improving' ? 'down' :
                metrics.compositeTrends?.incidents?.direction === 'worsening' ? 'up' :
                'neutral'
              }
              info="Trend based on observation volume over the past 3 months"
            />
          </div>

          {/* Section: Predictive Forecasting (Phase 1) */}
          <Section
            title="Predictive Forecasting"
            icon={LineChart}
            info="Statistical forecast of future incident trends with 95% confidence intervals. Based on linear regression analysis."
            defaultOpen={true}
          >
            <div className="space-y-4">
              <ForecastChart
                data={metrics.forecast}
                onPeriodChange={handleForecastPeriodChange}
              />
              {metrics.forecast?.alerts && metrics.forecast.alerts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-surface-700 mb-2">Forecast Alerts</h4>
                  <ForecastAlertCard alerts={metrics.forecast.alerts} />
                </div>
              )}
            </div>
          </Section>

          {/* Section: Anomaly Detection (Phase 2) */}
          <Section
            title="Anomaly Detection"
            icon={Zap}
            info="Statistical outliers identified using Z-score and IQR methods. Spikes indicate unusual increases, drops indicate unusual decreases."
            defaultOpen={true}
          >
            <AnomalyDetectionPanel
              data={metrics.anomalies}
              onAnomalyClick={(anomaly) => setDrillDown({
                type: 'anomaly',
                data: anomaly.incidents,
                title: `Anomaly: ${anomaly.dateLabel}`
              })}
            />
          </Section>

          {/* Section 1: Actionable Recommendations (PRIMARY) */}
          <Section
            title="Actionable Recommendations"
            icon={AlertTriangle}
            info="Priority-ordered action items based on data analysis. Address high priority items first."
            defaultOpen={true}
          >
            <RecommendationsList
              recommendations={metrics.recommendations}
              onItemClick={handleRecommendationClick}
            />
          </Section>

          {/* Section 2: Root Cause Analysis */}
          <Section
            title="Root Cause Analysis"
            icon={Target}
            info="Distribution and trends of root causes across incidents"
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Root Cause Breakdown Pie Chart */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">
                  Root Cause Distribution
                </h3>
                <RootCauseBreakdownChart
                  data={metrics.rootCauseBreakdown}
                />
              </div>

              {/* Root Cause Trend Chart */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">
                  Root Cause Trends (12 months)
                </h3>
                <RootCauseTrendChart
                  data={metrics.rootCauseTrends}
                />
              </div>
            </div>

            {/* Root Cause by Hazard Matrix */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-surface-700 mb-3">
                Root Cause by Hazard Matrix
              </h3>
              <RootCauseHazardMatrix
                data={metrics.rootCauseByHazard}
              />
            </div>
          </Section>

          {/* Section: Correlation Patterns (Phase 3) */}
          <Section
            title="Correlation Patterns"
            icon={Link2}
            info="Statistically significant patterns where certain Contractor + Root Cause or Hazard + Root Cause combinations occur more frequently than expected. Based on chi-square significance testing."
            defaultOpen={true}
          >
            <PatternInsightsList
              data={metrics.correlations}
              onPatternClick={(pattern) => setDrillDown({
                type: 'pattern',
                data: pattern,
                title: `Pattern: ${pattern.description}`
              })}
            />
          </Section>

          {/* Section 3: Leading Indicators */}
          <Section
            title="Leading Indicators"
            icon={BarChart3}
            info="Predictive metrics that indicate future safety performance"
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Near Miss Gauge */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">
                  Near-Miss Reporting Rate
                </h3>
                <NearMissGauge data={metrics.nearMissAnalysis} />
              </div>

              {/* Trend Indicators */}
              <div>
                <h3 className="text-sm font-semibold text-surface-700 mb-3">
                  Trend Indicators
                </h3>
                <TrendIndicatorGroup trends={metrics.compositeTrends} />

                {/* Risk Score Breakdown */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
                    Risk Score Breakdown
                  </h4>
                  <div className="space-y-2">
                    {metrics.riskScore.factors.map(factor => (
                      <div key={factor.name} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-surface-600">{factor.name}</span>
                            <span className="font-semibold text-surface-700">{Math.round(factor.score)}%</span>
                          </div>
                          <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                factor.status === 'good' ? 'bg-safety-success' :
                                factor.status === 'warning' ? 'bg-safety-warning' :
                                'bg-safety-critical'
                              }`}
                              style={{ width: `${Math.min(factor.score, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-2xs text-surface-400 w-8">
                          {factor.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Section 4: Hazard Trends */}
          <Section
            title="Hazard Trends"
            icon={TrendingUp}
            info="Hazard categories with trend direction compared to previous period"
            defaultOpen={true}
          >
            <HazardTrendingChart
              data={metrics.hazardTrending}
            />
          </Section>

          {/* Section: Safety Culture Dashboard (Phase 6) */}
          <Section
            title="Safety Culture Dashboard"
            icon={Users}
            info="Composite safety culture metrics measuring engagement velocity, reporter diversity, proactive vs reactive reporting, and leadership visibility."
            defaultOpen={true}
          >
            <SafetyCultureDashboard cultureData={metrics.safetyCulture} />
          </Section>

          {/* Section: Comparative Analytics (Phase 6) */}
          <Section
            title="Contractor Benchmarking"
            icon={Award}
            info="Comparative performance analysis across contractors based on quality scores, proactive reporting ratios, and near-miss rates."
            defaultOpen={false}
          >
            <ComparativeBenchmark data={metrics.benchmark} />
          </Section>

          {/* Section: What-If Simulator (Phase 5) */}
          <Section
            title="What-If Simulator"
            icon={Sliders}
            info="Interactive simulation tool. Adjust parameters to see projected impact on risk scores and safety metrics."
            defaultOpen={false}
          >
            <WhatIfSimulator
              incidents={filteredIncidents}
              simulationFn={runWhatIfSimulation}
              overdueCount={metrics.simulatorData.overdueCount}
              currentNightPct={metrics.simulatorData.currentNightPct}
              topRootCauses={metrics.simulatorData.topRootCauses}
            />
          </Section>
        </>
      )}

      {/* Drill-Down Modal */}
      {drillDown.type && (
        <InsightsDrillDownModal
          isOpen={true}
          onClose={closeDrillDown}
          title={drillDown.title}
        >
          {drillDown.type === 'recommendation' && Array.isArray(drillDown.data) && (
            <div className="space-y-3">
              {drillDown.data.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-50 rounded-lg border border-surface-200"
                >
                  {item.name && (
                    <p className="font-semibold text-surface-800">{item.name}</p>
                  )}
                  {item.qualityScore !== undefined && (
                    <p className="text-sm text-surface-600">Quality Score: {item.qualityScore}%</p>
                  )}
                  {item.age !== undefined && (
                    <p className="text-sm text-surface-600">Age: {item.age} days</p>
                  )}
                  {item.description && (
                    <p className="text-sm text-surface-500 mt-1">{item.description}</p>
                  )}
                  {item.hazard && (
                    <p className="text-sm text-surface-600">Hazard: {item.hazard}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-surface-400 mt-1">Date: {item.date}</p>
                  )}
                </div>
              ))}
            </div>
          )}

        </InsightsDrillDownModal>
      )}
    </div>
  )
}

export default PredictiveAnalytics
