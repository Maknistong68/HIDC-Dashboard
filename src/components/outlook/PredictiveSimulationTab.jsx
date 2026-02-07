import React, { useState, useMemo, useCallback, useEffect, startTransition } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  RefreshCw,
  CheckCircle2,
  Zap
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import PredictionTrendChart from '../insights/PredictionTrendChart'
import CalculationBreakdownModal from '../insights/CalculationBreakdownModal'
import AnomalyDetectionPanel from './AnomalyDetectionPanel'
import SimulatorResultsPanel from './SimulatorResultsPanel'
import TrendingHazardSelector from './TrendingHazardSelector'
import QuickActionPanel from './QuickActionPanel'
import HazardSpecificActions from './HazardSpecificActions'
import InterventionSliderGroup from './InterventionSliderGroup'
import {
  CONTROL_HIERARCHY,
  calculateFactorPrevalence,
  generateDynamicSliders,
  calculateMultiHazardProjection
} from '../insights/ScenarioSimulatorEngine'

// Slider styles now in global index.css (.unified-slider, .sim-slider)

/**
 * TrendIcon - Reusable trend indicator
 */
const TrendIcon = ({ trend, size = 12 }) => {
  if (trend === 'increasing') return <TrendingUp size={size} className="text-red-500" />
  if (trend === 'decreasing') return <TrendingDown size={size} className="text-green-500" />
  return <Minus size={size} className="text-surface-400" />
}

/**
 * Format incident type name
 */
const formatTypeName = (type) => {
  if (!type) return 'Unknown'
  switch (type.toLowerCase()) {
    case 'near-miss': return 'Near'
    case 'fac': return 'FAC'
    case 'mti': return 'MTI'
    case 'lti': return 'LTI'
    case 'positive': return 'Positive'
    case 'unsafe-act': return 'Unsafe Act'
    case 'unsafe-condition': return 'Unsafe Cond.'
    case 'ncr': return 'NCR'
    default: return type
  }
}

const getRiskBarColor = (riskLevel) => {
  if (riskLevel === 'high') return 'bg-red-500'
  if (riskLevel === 'medium') return 'bg-amber-500'
  return 'bg-green-500'
}

/**
 * ForecastCard - KPI-style forecast display
 */
const ForecastCard = ({ label, predicted, range, trend, changePercent, onClick }) => {
  if (predicted === undefined || predicted === null) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4 text-center">
        <span className="text-xs text-surface-400 block mb-1">{label}</span>
        <span className="text-sm text-surface-400">Insufficient data</span>
      </div>
    )
  }

  const getTrendColor = () => {
    if (trend === 'increasing') return 'text-red-500'
    if (trend === 'decreasing') return 'text-green-500'
    return 'text-surface-500'
  }

  const getTrendLabel = () => {
    if (trend === 'increasing') return 'Rising'
    if (trend === 'decreasing') return 'Falling'
    return 'Stable'
  }

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-surface-200 p-4 hover:bg-surface-50 transition-colors text-left group w-full"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">{label}</span>
        <Calculator size={12} className="text-surface-300 group-hover:text-primary-400 transition-colors" />
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-surface-800">{predicted}</span>
        {changePercent !== undefined && changePercent !== 0 && (
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {changePercent > 0 ? '+' : ''}{changePercent}%
          </span>
        )}
      </div>
      {range && (
        <p className="text-xs text-surface-400 mb-1">Range: {range.min} - {range.max}</p>
      )}
      <div className={`flex items-center gap-1 ${getTrendColor()}`}>
        <TrendIcon trend={trend} size={12} />
        <span className="text-xs font-medium">{getTrendLabel()}</span>
      </div>
    </button>
  )
}

/**
 * PredictiveSimulationTab - Tab 2: Predictive & Simulation
 * Full tab container orchestrating predictive + simulator sections
 */
const PredictiveSimulationTab = ({
  filteredIncidents,
  negativeIncidents,
  sortedHazards,
  factorData,
  incidentPrediction,
  hazardTrendData,
  selectedHazardName,
  period
}) => {
  const [activeSection, setActiveSection] = useState('analytics')
  const [viewMode, setViewMode] = useState('visual')
  const [showMethodology, setShowMethodology] = useState(false)
  const [breakdownModal, setBreakdownModal] = useState({ isOpen: false, type: null, data: null })

  // Simulator state
  const [simulatorMode, setSimulatorMode] = useState('quick')
  const [selectedHazards, setSelectedHazards] = useState([])
  const [selectAllTrending, setSelectAllTrending] = useState(false)
  const [activeQuickAction, setActiveQuickAction] = useState(null)
  const [sliders, setSliders] = useState({})
  const [actionsToClose, setActionsToClose] = useState(0)
  const [expandedCategory, setExpandedCategory] = useState(null)

  const { weekly, monthly, typeProbability, typeRisk } = incidentPrediction || {}

  // Auto-sync external hazard selection
  useEffect(() => {
    if (selectedHazardName && !selectedHazards.includes(selectedHazardName)) {
      setSelectedHazards([selectedHazardName])
      setSelectAllTrending(false)
    }
  }, [selectedHazardName])

  // Trending hazards
  const trendingList = useMemo(() => {
    return sortedHazards.filter(h =>
      h.trendLevel?.level === 'significant-rise' ||
      h.trendLevel?.level === 'rising'
    )
  }, [sortedHazards])

  const effectiveSelectedHazards = useMemo(() => {
    if (selectAllTrending) return trendingList.map(h => h.name)
    return selectedHazards
  }, [selectAllTrending, trendingList, selectedHazards])

  // Incident stats
  const incidentStats = useMemo(() => {
    const totalNegative = negativeIncidents?.length || 0
    const openActionsCount = filteredIncidents?.filter(
      i => i.actionStatus === 'open' || i.actionStatus === 'Open'
    ).length || 0
    return { totalNegative, openActionsCount, totalIncidents: filteredIncidents?.length || 0 }
  }, [negativeIncidents, filteredIncidents])

  // Factor prevalence
  const prevalence = useMemo(() => {
    if (!factorData?.byFactor || incidentStats.totalNegative === 0) return {}
    return calculateFactorPrevalence(factorData, incidentStats.totalNegative)
  }, [factorData, incidentStats.totalNegative])

  // Dynamic sliders
  const dynamicSliders = useMemo(() => {
    if (!factorData?.byFactor) return []
    const hazardName = effectiveSelectedHazards.length === 1 ? effectiveSelectedHazards[0] : 'all'
    return generateDynamicSliders(factorData, hazardName, incidentStats.totalNegative)
  }, [factorData, effectiveSelectedHazards, incidentStats.totalNegative])

  const slidersByCategory = useMemo(() => {
    const grouped = { engineering: [], administrative: [], ppe: [], environmental: [] }
    for (const slider of dynamicSliders) {
      if (grouped[slider.categoryKey]) grouped[slider.categoryKey].push(slider)
    }
    return grouped
  }, [dynamicSliders])

  // Weekly average for risk gauge
  const weeklyAverage = useMemo(() => {
    if (!hazardTrendData?.days?.length) {
      if (!negativeIncidents?.length) return 0
      const daysWithData = new Set(negativeIncidents.map(i => i.date?.substring(0, 10)))
      const avgPerDay = negativeIncidents.length / Math.max(daysWithData.size, 1)
      return Math.round(avgPerDay * 7)
    }
    return Math.round((hazardTrendData.avgPerDay || 0) * 7)
  }, [hazardTrendData, negativeIncidents])

  // Projection
  const projection = useMemo(() => {
    if (!weekly?.predicted) return null
    return calculateMultiHazardProjection({
      hazards: effectiveSelectedHazards,
      sliders,
      factorData,
      incidents: negativeIncidents,
      trendingData: sortedHazards,
      basePrediction: weekly.predicted,
      openActionsCount: incidentStats.openActionsCount,
      actionsToClose
    })
  }, [weekly, effectiveSelectedHazards, sliders, factorData, negativeIncidents, sortedHazards, incidentStats, actionsToClose])

  const hasChanges = useMemo(() => {
    return Object.values(sliders).some(v => v !== 0) || actionsToClose > 0 || effectiveSelectedHazards.length > 0
  }, [sliders, actionsToClose, effectiveSelectedHazards])

  // Handlers
  const handleToggleHazard = useCallback((hazardName) => {
    setSelectAllTrending(false)
    setSelectedHazards(prev => prev.includes(hazardName) ? prev.filter(h => h !== hazardName) : [...prev, hazardName])
  }, [])

  const handleToggleAllTrending = useCallback(() => {
    setSelectAllTrending(prev => !prev)
    if (!selectAllTrending) setSelectedHazards([])
  }, [selectAllTrending])

  const handleClearSelection = useCallback(() => {
    setSelectAllTrending(false)
    setSelectedHazards([])
  }, [])

  const handleQuickActionToggle = useCallback((actionId) => {
    setActiveQuickAction(prev => {
      if (prev === actionId) {
        setSliders({})
        setActionsToClose(0)
        return null
      }
      const presets = {
        'engineering-boost': { barriers: 75, guards: 75, devices: 75 },
        'admin-boost': { training: 80, inspections: 70, supervision: 60 },
        'ppe-push': { ppe: 100 },
        'close-actions': {}
      }
      setSliders(presets[actionId] || {})
      if (actionId === 'close-actions') {
        setActionsToClose(incidentStats.openActionsCount)
      } else {
        setActionsToClose(0)
      }
      return actionId
    })
  }, [incidentStats.openActionsCount])

  const handleSliderChange = useCallback((sliderId, value) => {
    setActiveQuickAction(null)
    setSliders(prev => ({ ...prev, [sliderId]: value }))
  }, [])

  const handleActionsToCloseChange = useCallback((value) => {
    setActiveQuickAction(null)
    setActionsToClose(value)
  }, [])

  const handleApplyRecommendation = useCallback((factor, effect) => {
    setActiveQuickAction(null)
    setSliders(prev => ({ ...prev, [factor.toLowerCase()]: effect }))
  }, [])

  const handleReset = useCallback(() => {
    setActiveQuickAction(null)
    setSliders({})
    setActionsToClose(0)
    setSelectedHazards([])
    setSelectAllTrending(false)
  }, [])

  const openBreakdown = useCallback((type, extraData = {}) => {
    let data = {}
    switch (type) {
      case 'weekly': data = { ...weekly, ...extraData }; break
      case 'monthly': data = { ...monthly, ...extraData }; break
      case 'typeProbability': data = { ...typeProbability, ...extraData }; break
      case 'riskAssessment': data = { ...typeRisk, ...extraData }; break
      default: data = extraData
    }
    setBreakdownModal({ isOpen: true, type, data })
  }, [weekly, monthly, typeProbability, typeRisk])

  const closeBreakdown = useCallback(() => {
    setBreakdownModal({ isOpen: false, type: null, data: null })
  }, [])

  if (!incidentPrediction?.hasData && !negativeIncidents?.length) {
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

  // Type probability chart data
  const typeProbChartData = useMemo(() => {
    return typeProbability?.types?.map(t => ({
      name: formatTypeName(t.type),
      fullName: t.label,
      value: t.probability,
      color: t.color,
      trend: t.trend
    })) || []
  }, [typeProbability])

  const TypeProbTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const item = payload[0].payload
    return (
      <div className="bg-white p-2 rounded shadow-lg border border-surface-200 text-xs">
        <p className="font-semibold" style={{ color: item.color }}>{item.fullName}</p>
        <p className="text-surface-700">{item.value.toFixed(1)}%</p>
      </div>
    )
  }

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    if (value < 5) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        className="text-xs font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
        {name} {value.toFixed(0)}%
      </text>
    )
  }

  const handleSectionChange = useCallback((section) => {
    startTransition(() => { setActiveSection(section) })
  }, [])

  return (
    <div className="flex flex-col gap-3 flex-1 animate-fade-in">
      {/* Sub-tab row: Analytics / Simulator pills + forecast summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div role="tablist" aria-label="Predictive sub-tabs" className="flex items-center gap-2">
          <button
            role="tab"
            aria-selected={activeSection === 'analytics'}
            onClick={() => handleSectionChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'analytics'
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            <BarChart3 size={14} />
            Analytics
          </button>
          <button
            role="tab"
            aria-selected={activeSection === 'simulator'}
            onClick={() => handleSectionChange('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'simulator'
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            <Activity size={14} />
            Simulator
          </button>
        </div>

        {/* Forecast summary (right side) */}
        <div className="flex items-center gap-3 text-xs transition-all duration-200">
          <span className="text-surface-500">
            Weekly: <span className={`font-medium ${
              weekly?.trend === 'increasing' ? 'text-red-500' : weekly?.trend === 'decreasing' ? 'text-green-500' : 'text-surface-600'
            }`}>{weekly?.predicted ?? '—'}</span>
          </span>
          <span className="text-surface-300">·</span>
          <span className="text-surface-500">
            Monthly: <span className={`font-medium ${
              monthly?.trend === 'increasing' ? 'text-red-500' : monthly?.trend === 'decreasing' ? 'text-green-500' : 'text-surface-600'
            }`}>{monthly?.predicted ?? '—'}</span>
          </span>
          {weekly?.trend && (
            <>
              <span className="text-surface-300">·</span>
              <span className={`font-medium ${
                weekly.trend === 'increasing' ? 'text-red-500' : weekly.trend === 'decreasing' ? 'text-green-500' : 'text-surface-500'
              }`}>
                {weekly.trend === 'increasing' ? 'Rising' : weekly.trend === 'decreasing' ? 'Falling' : 'Stable'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ==================== ANALYTICS SECTION ==================== */}
      {activeSection === 'analytics' && (
      <>
      <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
          <h3 className="text-sm font-semibold text-surface-800">Predictive Analytics</h3>
          <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'visual' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              <BarChart3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('numbers')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'numbers' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              <Activity size={14} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Forecast Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ForecastCard
              label="Weekly Forecast"
              predicted={weekly?.predicted}
              range={weekly?.range}
              trend={weekly?.trend}
              changePercent={weekly?.changePercent}
              onClick={() => openBreakdown('weekly')}
            />
            <ForecastCard
              label="Monthly Forecast"
              predicted={monthly?.predicted}
              range={monthly?.range}
              trend={monthly?.trend}
              changePercent={monthly?.changePercent}
              onClick={() => openBreakdown('monthly')}
            />
          </div>

          {/* Forecast Trend Chart */}
          {viewMode === 'visual' && (
            <div className="bg-surface-50 rounded-lg p-4">
              <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-3">FORECAST TREND</h4>
              <PredictionTrendChart
                historicalData={hazardTrendData?.days || []}
                prediction={weekly?.predicted}
                range={weekly?.range}
                trend={weekly?.trend}
                hazardName="All Hazards"
                avgPerDay={hazardTrendData?.avgPerDay}
              />
            </div>
          )}

          {/* Type Probability & Risk Assessment */}
          {(typeProbability?.hasData || typeRisk?.hasData) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Probability Donut */}
              {typeProbability?.hasData && (
                <div className="bg-surface-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-surface-600 mb-2">Type Probability</h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeProbChartData}
                          cx="50%" cy="50%"
                          innerRadius={30} outerRadius={55}
                          paddingAngle={2} dataKey="value"
                          labelLine={false} label={renderPieLabel}
                        >
                          {typeProbChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<TypeProbTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {typeProbability.mostLikely && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-100">
                      <span className="text-xs text-surface-500">Most likely:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: typeProbability.mostLikely.color }}>
                          {formatTypeName(typeProbability.mostLikely.type)}
                        </span>
                        <span className="text-xs text-surface-500">({typeProbability.mostLikely.probability}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Risk Assessment Bars */}
              {typeRisk?.hasData && (
                <div className="bg-surface-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-surface-600 mb-3">Risk Assessment</h4>
                  <div className="space-y-2.5">
                    {typeRisk.risks?.slice(0, 4).map((risk) => (
                      <div key={risk.type} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-surface-700">{formatTypeName(risk.type)}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-surface-800">{risk.riskScore}%</span>
                            <TrendIcon trend={risk.trend} size={12} />
                          </div>
                        </div>
                        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(risk.riskLevel)}`}
                            style={{ width: `${Math.max(2, risk.riskScore)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {typeRisk.highestRisk && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-100">
                      <span className="text-xs text-surface-500">Highest:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: typeRisk.highestRisk.color }}>
                          {formatTypeName(typeRisk.highestRisk.type)}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
                          {typeRisk.highestRisk.riskScore}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="border-t border-surface-200">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-surface-500 hover:bg-surface-50 transition-colors"
          >
            <HelpCircle size={14} />
            <span>How are predictions calculated?</span>
            {showMethodology ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showMethodology && (
            <div className="px-4 pb-4 text-xs text-surface-500 space-y-2">
              <p>Forecasts use linear regression on historical daily counts with confidence intervals.</p>
              <p>Type probabilities are derived from {negativeIncidents?.length || 0} negative observations using Bayesian analysis.</p>
              <p>Risk scores combine severity, probability, and trend direction per incident type.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== ANOMALY DETECTION ==================== */}
      <AnomalyDetectionPanel negativeIncidents={negativeIncidents} />
      </>
      )}

      {/* ==================== SIMULATOR SECTION ==================== */}
      {activeSection === 'simulator' && (
      <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-surface-800">Scenario Simulator</h3>
            <span className="text-2xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Data-Driven</span>
          </div>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 text-xs text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded transition-colors"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Hazard Selector */}
          <div className="bg-surface-50 rounded-lg p-3">
            <TrendingHazardSelector
              trendingHazards={sortedHazards}
              selectedHazards={selectedHazards}
              selectAllTrending={selectAllTrending}
              onToggleHazard={handleToggleHazard}
              onToggleAllTrending={handleToggleAllTrending}
              onClearSelection={handleClearSelection}
            />
          </div>

          {/* Two-column: Controls (left) + Results (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Controls */}
            <div className="space-y-4">
              {/* Mode Tabs (pill style) */}
              <div className="flex items-center gap-2">
                {['quick', 'custom', 'advanced'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSimulatorMode(tab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      simulatorMode === tab
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
                    }`}
                  >
                    {tab === 'quick' ? 'Quick Actions' : tab === 'custom' ? 'Custom' : 'Advanced'}
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              {simulatorMode === 'quick' && (
                <div className="space-y-3">
                  <QuickActionPanel
                    activeAction={activeQuickAction}
                    onToggleAction={handleQuickActionToggle}
                    openActionsCount={incidentStats.openActionsCount}
                  />
                  {effectiveSelectedHazards.length > 0 && (
                    <HazardSpecificActions
                      selectedHazards={effectiveSelectedHazards}
                      onApplyAction={handleApplyRecommendation}
                      appliedActions={sliders}
                    />
                  )}
                </div>
              )}

              {/* Custom Tab */}
              {simulatorMode === 'custom' && (
                <div className="space-y-3">
                  {(incidentStats.openActionsCount > 0) && (
                    <div className="space-y-2 pb-3 border-b border-surface-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-amber-600" />
                        <span className="text-sm font-medium text-surface-700">Corrective Actions</span>
                        <span className="text-2xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          {incidentStats.openActionsCount} open
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={incidentStats.openActionsCount}
                        value={actionsToClose}
                        onChange={(e) => handleActionsToCloseChange(parseInt(e.target.value))}
                        className="sim-slider actions w-full"
                      />
                      <div className="flex justify-between text-2xs text-surface-400">
                        <span>0 closed</span>
                        <span className="font-medium text-amber-600">{actionsToClose} to close</span>
                        <span>{incidentStats.openActionsCount} closed</span>
                      </div>
                    </div>
                  )}
                  <InterventionSliderGroup
                    slidersByCategory={slidersByCategory}
                    sliders={sliders}
                    onSliderChange={handleSliderChange}
                    factorData={factorData}
                    selectedHazards={effectiveSelectedHazards}
                    expandedCategory={expandedCategory}
                    onToggleCategory={(key) => setExpandedCategory(prev => prev === key ? null : key)}
                  />
                  {dynamicSliders.length === 0 && (
                    <div className="text-center py-4 text-sm text-surface-500">
                      <p>No contributing factors detected.</p>
                      <p className="text-xs text-surface-400 mt-1">Factors are extracted from observation descriptions.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Tab */}
              {simulatorMode === 'advanced' && (
                <div className="space-y-4">
                  {(incidentStats.openActionsCount > 0) && (
                    <div className="space-y-2 pb-3 border-b border-surface-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-amber-600" />
                        <span className="text-sm font-medium text-surface-700">Corrective Actions</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={incidentStats.openActionsCount}
                        value={actionsToClose}
                        onChange={(e) => handleActionsToCloseChange(parseInt(e.target.value))}
                        className="sim-slider actions w-full"
                      />
                      <div className="flex justify-between text-2xs text-surface-400">
                        <span>0 closed</span>
                        <span className="font-medium">{actionsToClose} / {incidentStats.openActionsCount}</span>
                        <span>{incidentStats.openActionsCount} closed</span>
                      </div>
                    </div>
                  )}
                  {Object.entries(slidersByCategory).map(([categoryKey, categorySliders]) => {
                    if (categorySliders.length === 0) return null
                    const category = CONTROL_HIERARCHY[categoryKey]
                    return (
                      <div key={categoryKey} className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-surface-700">
                          <span>{category.name}</span>
                          <span className="text-2xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded">
                            {Math.round(category.effectiveness * 100)}% eff.
                          </span>
                        </div>
                        {categorySliders.map(slider => (
                          <div key={slider.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-surface-600">{slider.label}</span>
                              <span className={`font-medium ${
                                (sliders[slider.id] || 0) > 0 ? 'text-green-600' :
                                (sliders[slider.id] || 0) < 0 ? 'text-red-500' : 'text-surface-500'
                              }`}>
                                {(sliders[slider.id] || 0) > 0 ? '+' : ''}{sliders[slider.id] || 0}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={-50} max={100}
                              value={sliders[slider.id] || 0}
                              onChange={(e) => handleSliderChange(slider.id, parseInt(e.target.value))}
                              className={`unified-slider ${categoryKey} w-full`}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Results */}
            <SimulatorResultsPanel
              projection={projection}
              hasChanges={hasChanges}
              weekly={weekly}
              weeklyAverage={weeklyAverage}
              factorData={factorData}
              hazardTrendData={hazardTrendData}
            />
          </div>
        </div>
      </div>
      )}

      <CalculationBreakdownModal
        isOpen={breakdownModal.isOpen}
        onClose={closeBreakdown}
        type={breakdownModal.type}
        data={breakdownModal.data}
      />
    </div>
  )
}

export default React.memo(PredictiveSimulationTab)
