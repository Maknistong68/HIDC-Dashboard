import React, { useMemo, useState, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ListChecks,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart3,
  LineChart,
  Zap,
  Link2,
  Sliders,
  Users,
  Award,
  Calendar,
  Target
} from 'lucide-react'
import { useData } from '../context/DataContext'
import FilterBar from '../components/common/FilterBar'
import KPICard from '../components/dashboard/KPICard'
import EmptyState from '../components/dashboard/EmptyState'
import { InfoTooltip } from '../components/ui/Tooltip'
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
  ComparativeBenchmark,
  SeasonalPatternChart,
  SeasonalRiskPrediction
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
  getOverdueActionAlerts,
  detectSeasonalPatterns,
  predictSeasonalRisk
} from '../utils/insightsCalculations'
import { getObservationsByHour } from '../utils/dataQualityCalculations'

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
      benchmark: getContractorBenchmark(filteredIncidents),
      // Seasonal Pattern Detection
      seasonalPatterns: detectSeasonalPatterns(filteredIncidents),
      seasonalRiskPrediction: predictSeasonalRisk(filteredIncidents, 7)
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
              info="HOW THIS SCORE IS CALCULATED: This is a combined score (0-100%) based on four key factors from your data: (1) NEAR-MISS REPORTING - Are people reporting near misses? More near-miss reports mean better hazard awareness. (2) ACTION CLOSURE - Are issues being resolved quickly? Higher closure rates are better. (3) SHIFT COVERAGE - Are all shifts reporting equally? Good coverage across day and night shifts indicates consistent safety awareness. (4) CONTRACTOR QUALITY - How well are contractors documenting their observations? Higher quality descriptions help with investigations. GREEN (70%+): Low risk. YELLOW (40-69%): Moderate risk - some areas need attention. RED (below 40%): High risk - multiple areas need improvement."
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
              info="HOW THIS IS CALCULATED: The system automatically analyzes your data and generates recommended actions based on patterns it finds. For example, if one contractor has many more unsafe observations than others, it becomes an action item. If near-miss reporting is dropping, that's flagged. Items are ranked by priority: HIGH PRIORITY = urgent issues needing immediate attention (shown in red count). MEDIUM PRIORITY = should be addressed soon. LOW PRIORITY = good to address when time allows. See the 'Actionable Recommendations' section below for the full list of suggested actions."
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
              info="HOW THIS TREND IS CALCULATED: We compare the number of negative observations (incidents, near misses, unsafe acts/conditions) from the most recent month to the average of the previous 3 months. IMPROVING (green, arrow down): Negative observations are decreasing - fewer safety issues are being reported, which usually means conditions are getting safer. NEEDS ATTENTION (red, arrow up): Negative observations are increasing - more safety issues are being found. This could mean conditions are getting worse OR people are becoming more vigilant at reporting. STABLE (blue): Numbers are roughly the same - no significant change in either direction."
            />
          </div>

          {/* Section: Predictive Forecasting (Phase 1) */}
          <Section
            title="Predictive Forecasting"
            icon={LineChart}
            info="HOW FORECASTS ARE CREATED: The system looks at your historical observation data month by month and finds the overall trend (going up, down, or flat). Using this pattern, it projects what future months might look like. The SOLID LINE shows actual past data. The DASHED LINE shows predicted future values. The SHADED AREA shows the 'confidence range' - the actual numbers will most likely fall somewhere within this zone. Think of it like a weather forecast - it gives you a reasonable estimate of what to expect, but real numbers may vary. Use this to plan staffing and resources for safety programs."
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

          {/* Section: Seasonal Pattern Detection */}
          <Section
            title="Seasonal Patterns"
            icon={Calendar}
            info="HOW SEASONAL PATTERNS WORK: The system analyzes your historical data to find recurring patterns based on time. DAY-OF-WEEK: Which days have the most/fewest incidents? For example, Mondays might have 25% more incidents than average due to workers returning from weekends. HOUR-OF-DAY: Which hours are highest risk? Morning shifts often show different patterns than night shifts. MONTH-OF-YEAR: Are there seasonal trends? Some hazards increase in summer heat or winter conditions. The RISK INDEX shows how each period compares to average (100% = average, 130% = 30% above average). The 7-DAY FORECAST predicts risk levels for the upcoming week based on these patterns. Use this to plan safety interventions - schedule extra supervision on high-risk days or increase awareness during peak hours."
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seasonal Pattern Chart */}
              <div>
                <SeasonalPatternChart
                  data={metrics.seasonalPatterns}
                  title="Historical Patterns"
                />
              </div>

              {/* 7-Day Risk Prediction */}
              <div>
                <SeasonalRiskPrediction
                  data={metrics.seasonalRiskPrediction}
                  title="7-Day Risk Forecast"
                />
              </div>
            </div>
          </Section>

          {/* Section: Anomaly Detection (Phase 2) */}
          <Section
            title="Anomaly Detection"
            icon={Zap}
            info="HOW ANOMALIES ARE DETECTED: The system calculates the 'normal range' of observations for each day/week based on historical patterns. When actual numbers fall far outside this normal range, they're flagged as anomalies. SPIKE (unusual high): More observations than expected - could indicate an incident that triggered many reports, a new hazard being discovered, or a reporting campaign. DROP (unusual low): Fewer observations than expected - could indicate reporting issues, staff absences, or system problems. Click any anomaly to see the actual observations from that period. Not all anomalies are bad - sometimes a spike means people are more engaged in reporting."
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
            info="HOW RECOMMENDATIONS ARE GENERATED: The system automatically scans your data looking for patterns that typically indicate problems. Examples: Contractors with unusually high unsafe observation rates, hazard categories that are increasing month over month, overdue actions that haven't been closed, low near-miss reporting rates. Each recommendation includes: WHAT the issue is, WHY it matters, and WHAT you can do about it. HIGH PRIORITY items (red) should be addressed first as they represent the biggest risks or quickest wins. Click any recommendation to see the underlying data that triggered it."
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
            info="HOW ROOT CAUSE DATA IS COLLECTED: Each observation should have a 'Root Cause' field that explains WHY the issue happened (human error, equipment failure, lack of training, etc.). We group all observations by their root cause to show which causes appear most often. The PIE CHART shows the overall breakdown - larger slices mean more common root causes. The TREND CHART shows how each root cause changes over time. The MATRIX shows which root causes are linked to which hazard types. This helps you focus training and prevention efforts on the most common underlying issues rather than just treating symptoms."
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
            info="HOW PATTERNS ARE DISCOVERED: The system looks for combinations that appear together more often than would happen by chance. For example, if 'Contractor ABC' has 5x more 'Working at Height' hazards than other contractors, that's a pattern worth investigating. Or if 'Human Error' root causes happen mostly during 'Night Shifts', that's a correlation. The system tests these mathematically to filter out coincidences and only show you statistically significant patterns. Each pattern shows: WHAT combination is occurring, HOW STRONG the relationship is (strength %), and WHAT it might mean. Use these insights to target specific contractors, shifts, or work types for focused safety improvements."
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
            info="HOW LEADING INDICATORS WORK: Unlike 'lagging indicators' (which count what already happened, like injuries), leading indicators predict future performance. NEAR-MISS REPORTING RATE: High near-miss reporting is a good sign - it means people are catching hazards BEFORE they cause harm. Industries typically aim for 10+ near misses reported for every actual incident. TREND INDICATORS: Show whether key metrics are going up, down, or staying stable compared to recent history. RISK SCORE BREAKDOWN: Shows how each factor contributes to your overall risk score, helping you identify which specific areas need the most attention. Improving your leading indicators today helps prevent incidents tomorrow."
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
            info="HOW HAZARD TRENDS ARE CALCULATED: For each hazard category, we compare the count from the current period to the previous period (e.g., this month vs last month). TRENDING UP (red arrow): This hazard is appearing more often - it's getting worse and needs attention. TRENDING DOWN (green arrow): This hazard is appearing less often - improvements are working. STABLE (no arrow): Numbers are similar to before. The trend helps you focus resources on hazards that are actually getting worse rather than spreading effort equally across all categories. A hazard that's trending up, even if still small in absolute numbers, might deserve attention before it grows."
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
            info="HOW SAFETY CULTURE IS MEASURED: Culture is about HOW people report, not just what they report. ENGAGEMENT VELOCITY: How quickly are people submitting observations after an event? Faster is better - it means people act immediately. REPORTER DIVERSITY: Are many different people reporting, or just a few? More diverse reporters indicate wider engagement. PROACTIVE vs REACTIVE: What percentage of reports are positive observations and near-misses (proactive) vs actual incidents (reactive)? Higher proactive % means people catch issues before they become problems. LEADERSHIP VISIBILITY: Are supervisors and managers submitting observations? Their participation signals that safety matters at all levels. These metrics together paint a picture of whether safety is just a checkbox or truly embedded in your culture."
            defaultOpen={true}
          >
            <SafetyCultureDashboard cultureData={metrics.safetyCulture} />
          </Section>

          {/* Section: Comparative Analytics (Phase 6) */}
          <Section
            title="Contractor Benchmarking"
            icon={Award}
            info="HOW CONTRACTOR BENCHMARKS ARE CALCULATED: We analyze each contractor's safety data and score them on multiple factors: QUALITY SCORE: How complete and detailed are their observation descriptions? Do they include root causes, photos, etc.? PROACTIVE REPORTING RATIO: What percentage of their reports are positive observations and near-misses (good) vs incidents (reactive)? NEAR-MISS RATE: Are they reporting near-misses? High near-miss reporting usually indicates better safety awareness. CLOSE-OUT RATE: How quickly do they close their assigned actions? All contractors are ranked so you can see who's performing best and who might need coaching. Use this to have data-driven conversations with contractors about their safety performance."
            defaultOpen={false}
          >
            <ComparativeBenchmark data={metrics.benchmark} />
          </Section>

          {/* Section: What-If Simulator (Phase 5) */}
          <Section
            title="What-If Simulator"
            icon={Sliders}
            info="HOW THE SIMULATOR WORKS: This is a 'what if' tool that lets you explore hypothetical scenarios. Adjust the sliders to see how changes might affect your risk scores. For example: 'What if we increased night shift reporting by 20%?' or 'What if we closed all overdue actions?' The simulator uses your actual data patterns to estimate the impact. This helps you prioritize actions by showing which changes would have the biggest effect on your overall safety metrics. Note: These are estimates based on mathematical models - actual results may vary. Use this for planning discussions and setting targets, not as exact predictions."
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
