import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Zap,
  RefreshCw,
  Calculator,
  Target,
  BarChart3,
  Activity,
  Shield,
  Settings,
  User,
  Leaf,
  CheckCircle2,
  Info
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import CalculationBreakdownModal from './CalculationBreakdownModal'
import PredictionTrendChart from './PredictionTrendChart'
import RiskGauge from './RiskGauge'
import InterventionComparison from './InterventionComparison'
import {
  CONTROL_HIERARCHY,
  calculateFactorPrevalence,
  generateDynamicSliders,
  calculateFullProjection,
  getTopKeywordsForFactor
} from './ScenarioSimulatorEngine'
import { ScenarioSimulatorCompact } from '../outlook'

// Category icons and colors
const CATEGORY_CONFIG = {
  engineering: {
    icon: Settings,
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  administrative: {
    icon: Shield,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  ppe: {
    icon: User,
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  environmental: {
    icon: Leaf,
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  }
}

/**
 * UnifiedPredictivePanel - Combined forecasting and scenario simulation
 * Enhanced with HSE-aligned data-driven calculations
 *
 * Props:
 *  - incidentPrediction: Prediction data from getIncidentPredictionSummary
 *  - filteredIncidents: Array of filtered incidents
 *  - selectedHazardName: (optional) Auto-sync with hazard selection from detail panel
 *  - hazardTrendData: (optional) Trend data for the selected hazard
 *  - hazardTrendingData: (optional) Full trending hazards list from getHazardTrendingByPeriod
 *  - factorData: (optional) Factor data from aggregateContributingFactors
 */
const UnifiedPredictivePanel = ({
  incidentPrediction,
  filteredIncidents,
  selectedHazardName,
  hazardTrendData,
  hazardTrendingData,
  factorData
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMethodology, setShowMethodology] = useState(false)
  const [viewMode, setViewMode] = useState('visual') // 'visual' or 'numbers'

  // Modal state for calculation breakdown
  const [breakdownModal, setBreakdownModal] = useState({ isOpen: false, type: null, data: null })

  // Dynamic slider state - initialized when factors change
  const [sliders, setSliders] = useState({})
  const [actionsToClose, setActionsToClose] = useState(0)

  // Selected hazard for focused simulation
  const [selectedHazard, setSelectedHazard] = useState('all')

  // Auto-sync with external hazard selection
  useEffect(() => {
    if (selectedHazardName && selectedHazardName !== selectedHazard) {
      setSelectedHazard(selectedHazardName)
    }
  }, [selectedHazardName])

  const { weekly, monthly, typeProbability, typeRisk } = incidentPrediction || {}

  // Get unique hazards for dropdown
  const hazardOptions = useMemo(() => {
    if (!filteredIncidents?.length) return []

    const hazardCounts = {}
    filteredIncidents.forEach(i => {
      const hazard = i.location?.trim()
      if (hazard && hazard !== 'Not Specified' && hazard !== 'Not specified') {
        hazardCounts[hazard] = (hazardCounts[hazard] || 0) + 1
      }
    })

    return Object.entries(hazardCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [filteredIncidents])

  // Filter incidents by selected hazard
  const hazardFilteredIncidents = useMemo(() => {
    if (!filteredIncidents?.length) return []
    if (selectedHazard === 'all') return filteredIncidents

    return filteredIncidents.filter(i =>
      i.location?.trim() === selectedHazard
    )
  }, [filteredIncidents, selectedHazard])

  // Count negative incidents and open actions
  const incidentStats = useMemo(() => {
    const incidents = hazardFilteredIncidents
    if (!incidents?.length) {
      return { totalNegative: 0, openActionsCount: 0, totalIncidents: 0 }
    }

    const totalNegative = incidents.filter(
      i => !['positive', 'leadership'].includes(i.type?.toLowerCase())
    ).length

    const openActionsCount = incidents.filter(
      i => i.actionStatus === 'open' || i.actionStatus === 'Open'
    ).length

    return {
      totalNegative,
      openActionsCount,
      totalIncidents: incidents.length
    }
  }, [hazardFilteredIncidents])

  // Calculate factor prevalence from actual data
  const prevalence = useMemo(() => {
    if (!factorData?.byFactor || incidentStats.totalNegative === 0) return {}
    return calculateFactorPrevalence(factorData, incidentStats.totalNegative)
  }, [factorData, incidentStats.totalNegative])

  // Generate dynamic sliders based on top factors in the data
  const dynamicSliders = useMemo(() => {
    if (!factorData?.byFactor) return []
    const result = generateDynamicSliders(factorData, selectedHazard, incidentStats.totalNegative)
    return result.sliders || result
  }, [factorData, selectedHazard, incidentStats.totalNegative])

  // Group sliders by HSE control category
  const slidersByCategory = useMemo(() => {
    const grouped = {
      engineering: [],
      administrative: [],
      ppe: [],
      environmental: []
    }

    for (const slider of dynamicSliders) {
      if (grouped[slider.categoryKey]) {
        grouped[slider.categoryKey].push(slider)
      }
    }

    return grouped
  }, [dynamicSliders])

  // Calculate weekly average for comparison
  const weeklyAverage = useMemo(() => {
    if (!hazardTrendData?.days?.length) {
      if (!hazardFilteredIncidents?.length) return 0
      const daysWithData = new Set(hazardFilteredIncidents.map(i => i.date?.substring(0, 10)))
      const avgPerDay = hazardFilteredIncidents.length / Math.max(daysWithData.size, 1)
      return Math.round(avgPerDay * 7)
    }
    return Math.round((hazardTrendData.avgPerDay || 0) * 7)
  }, [hazardTrendData, hazardFilteredIncidents])

  // Calculate hazard-specific trend direction using linear regression
  const hazardTrend = useMemo(() => {
    if (selectedHazard === 'all' || !hazardFilteredIncidents?.length) {
      return { slope: 0, direction: 'stable', trendFactor: 1 }
    }

    // Group incidents by week for trend analysis
    const weeklyData = {}
    hazardFilteredIncidents.forEach(i => {
      if (!i.date) return
      const date = new Date(i.date)
      // Get ISO week number
      const startOfYear = new Date(date.getFullYear(), 0, 1)
      const weekNum = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)
      const weekKey = `${date.getFullYear()}-W${weekNum}`
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1
    })

    const weeks = Object.keys(weeklyData).sort()
    if (weeks.length < 3) {
      return { slope: 0, direction: 'stable', trendFactor: 1 }
    }

    // Simple linear regression on last 8 weeks (or available data)
    const recentWeeks = weeks.slice(-8)
    const n = recentWeeks.length
    const values = recentWeeks.map(w => weeklyData[w])

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += values[i]
      sumXY += i * values[i]
      sumX2 += i * i
    }

    const denominator = n * sumX2 - sumX * sumX
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
    const avgCount = sumY / n

    // Normalize slope relative to average
    const normalizedSlope = avgCount > 0 ? slope / avgCount : 0

    // Determine trend direction and factor
    let direction = 'stable'
    let trendFactor = 1
    if (normalizedSlope > 0.05) {
      direction = 'increasing'
      // Increase prediction by up to 20% for strong upward trends
      trendFactor = 1 + Math.min(0.2, normalizedSlope)
    } else if (normalizedSlope < -0.05) {
      direction = 'decreasing'
      // Decrease prediction by up to 20% for strong downward trends
      trendFactor = 1 + Math.max(-0.2, normalizedSlope)
    }

    return { slope: normalizedSlope, direction, trendFactor, avgCount }
  }, [selectedHazard, hazardFilteredIncidents])

  // Calculate projected outcome using data-driven engine
  const projection = useMemo(() => {
    if (weekly?.predicted === undefined || weekly?.predicted === null) return null

    // Calculate hazard-specific baseline prediction
    let basePrediction = weekly.predicted
    let hazardRatio = 1

    if (selectedHazard !== 'all' && filteredIncidents?.length > 0) {
      hazardRatio = hazardFilteredIncidents.length / filteredIncidents.length

      // Use hazard-specific trend to adjust prediction (not just simple proportion)
      // Base prediction uses the historical ratio
      let hazardBase = weekly.predicted * hazardRatio

      // Apply hazard-specific trend factor
      // If hazard is trending up, prediction should be higher
      // If hazard is trending down, prediction should be lower
      hazardBase *= hazardTrend.trendFactor

      basePrediction = Math.max(1, Math.round(hazardBase))
    }

    // Use data-driven calculation
    const result = calculateFullProjection({
      basePrediction,
      sliders,
      factorData,
      totalNegativeIncidents: incidentStats.totalNegative,
      openActionsCount: incidentStats.openActionsCount,
      actionsToClose
    })

    return {
      ...result,
      hazardRatio: Math.round(hazardRatio * 100),
      totalIncidents: incidentStats.totalIncidents,
      isFiltered: selectedHazard !== 'all',
      hazardTrendDirection: hazardTrend.direction,
      hazardTrendFactor: hazardTrend.trendFactor
    }
  }, [weekly, sliders, actionsToClose, factorData, incidentStats, selectedHazard, hazardFilteredIncidents, filteredIncidents, hazardTrend])

  const handleSliderChange = useCallback((id, value) => {
    setSliders(prev => ({ ...prev, [id]: value }))
  }, [])

  const handleActionsChange = useCallback((value) => {
    setActionsToClose(value)
  }, [])

  const handleHazardChange = useCallback((e) => {
    setSelectedHazard(e.target.value)
    // Reset sliders when hazard changes
    setSliders({})
    setActionsToClose(0)
  }, [])

  const handleReset = useCallback(() => {
    setSliders({})
    setActionsToClose(0)
    setSelectedHazard('all')
  }, [])

  const openBreakdown = useCallback((type, extraData = {}) => {
    let data = {}
    switch (type) {
      case 'weekly':
        data = { ...weekly, ...extraData }
        break
      case 'monthly':
        data = { ...monthly, ...extraData }
        break
      case 'typeProbability':
        data = { ...typeProbability, ...extraData }
        break
      case 'riskAssessment':
        data = { ...typeRisk, ...extraData }
        break
      case 'scenario':
        data = { ...projection, prevalence, sliders, selectedHazard, ...extraData }
        break
      default:
        data = extraData
    }
    setBreakdownModal({ isOpen: true, type, data })
  }, [weekly, monthly, typeProbability, typeRisk, projection, prevalence, sliders, selectedHazard])

  const closeBreakdown = useCallback(() => {
    setBreakdownModal({ isOpen: false, type: null, data: null })
  }, [])

  const hasChanges = Object.values(sliders).some(v => v !== 0) || actionsToClose > 0 || selectedHazard !== 'all'

  // Don't render if no meaningful data
  if (!weekly && !monthly && !typeProbability?.hasData) {
    return null
  }

  return (
    <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-soft">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-800">Predictive Analysis</h3>
          {selectedHazard !== 'all' && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {selectedHazard}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-0.5" onClick={e => e.stopPropagation()}>
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
          <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
            Projected
          </span>
          {isExpanded ? (
            <ChevronUp size={18} className="text-surface-500" />
          ) : (
            <ChevronDown size={18} className="text-surface-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-surface-200">
          {viewMode === 'visual' ? (
            <div className="space-y-4 p-4">
              {/* Forecast Section */}
              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-3">FORECAST</h4>
                <PredictionTrendChart
                  historicalData={hazardTrendData?.days || []}
                  prediction={weekly?.predicted}
                  range={weekly?.range}
                  trend={weekly?.trend}
                  hazardName={selectedHazard !== 'all' ? selectedHazard : 'All Hazards'}
                  avgPerDay={hazardTrendData?.avgPerDay}
                />
              </div>

              {/* Risk Analysis Section */}
              <div className="bg-surface-50 rounded-lg p-4">
                <h4 className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-3">RISK ANALYSIS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-surface-100">
                    <RiskGauge
                    predicted={weekly?.predicted}
                    average={weeklyAverage}
                    confidence={weekly?.confidence}
                    trend={weekly?.trend}
                    size="medium"
                      factorData={factorData}
                      weeklyHistory={hazardTrendData}
                    />
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-surface-100">
                    <QuickStats
                      weekly={weekly}
                      monthly={monthly}
                      onClick={(type) => openBreakdown(type)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
              <PredictionCard
                label="NEXT WEEK"
                predicted={weekly?.predicted}
                range={weekly?.range}
                trend={weekly?.trend}
                confidence={weekly?.confidence}
                changePercent={weekly?.changePercent}
                onClick={() => openBreakdown('weekly')}
              />
              <PredictionCard
                label="NEXT MONTH"
                predicted={monthly?.predicted}
                range={monthly?.range}
                trend={monthly?.trend}
                confidence={monthly?.confidence}
                changePercent={monthly?.changePercent}
                onClick={() => openBreakdown('monthly')}
              />
            </div>
          )}

          {/* Type Probability & Risk Assessment */}
          {(typeProbability?.hasData || typeRisk?.hasData) && (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200 border-t border-surface-200">
              {typeProbability?.hasData && (
                <TypeProbabilitySection data={typeProbability} onClick={() => openBreakdown('typeProbability')} />
              )}
              {typeRisk?.hasData && (
                <RiskAssessmentSection data={typeRisk} onClick={() => openBreakdown('riskAssessment')} />
              )}
            </div>
          )}

          {/* Scenario Simulator Compact */}
          <div className="border-t border-surface-200 p-4">
            <ScenarioSimulatorCompact
              trendingHazards={hazardTrendingData || []}
              factorData={factorData}
              incidentStats={incidentStats}
              prevalence={prevalence}
              filteredIncidents={filteredIncidents}
              hazardFilteredIncidents={hazardFilteredIncidents}
              selectedHazard={selectedHazard}
              onHazardChange={handleHazardChange}
              weekly={weekly}
              onProjectionChange={(proj) => {
                // Optional: handle projection changes
              }}
            />
          </div>

          {/* Methodology Disclosure */}
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
              <MethodologySection
                filteredIncidents={filteredIncidents}
                hazardFilteredIncidents={hazardFilteredIncidents}
                selectedHazard={selectedHazard}
              />
            )}
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

/**
 * QuickStats - Compact stats display for visual mode
 */
const QuickStats = ({ weekly, monthly, onClick }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
        Forecast Summary
      </h4>

      <button
        onClick={() => onClick('weekly')}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors group"
      >
        <span className="text-xs text-surface-500">Next Week</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-surface-800">{weekly?.predicted || '-'}</span>
          {weekly?.changePercent !== undefined && weekly?.changePercent !== 0 && (
            <span className={`text-xs font-semibold ${
              weekly.changePercent > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {weekly.changePercent > 0 ? '+' : ''}{weekly.changePercent}%
            </span>
          )}
          <TrendIcon trend={weekly?.trend} size={14} />
          <Calculator size={12} className="text-surface-300 group-hover:text-primary-400 transition-colors" />
        </div>
      </button>

      <button
        onClick={() => onClick('monthly')}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors group"
      >
        <span className="text-xs text-surface-500">Next Month</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-surface-800">{monthly?.predicted || '-'}</span>
          {monthly?.changePercent !== undefined && monthly?.changePercent !== 0 && (
            <span className={`text-xs font-semibold ${
              monthly.changePercent > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {monthly.changePercent > 0 ? '+' : ''}{monthly.changePercent}%
            </span>
          )}
          <TrendIcon trend={monthly?.trend} size={14} />
          <Calculator size={12} className="text-surface-300 group-hover:text-primary-400 transition-colors" />
        </div>
      </button>

      <div className="flex items-center justify-between text-xs text-surface-400 pt-1 border-t border-surface-100">
        <span>Weekly range: {weekly?.range?.min || '-'} - {weekly?.range?.max || '-'}</span>
        <span>Monthly: {monthly?.range?.min || '-'} - {monthly?.range?.max || '-'}</span>
      </div>
    </div>
  )
}

/**
 * PredictionCard - Individual prediction display
 */
const PredictionCard = ({ label, predicted, range, trend, confidence, changePercent, onClick }) => {
  if (predicted === undefined || predicted === null) {
    return (
      <div className="p-4 flex items-center justify-center">
        <span className="text-sm text-surface-400">Insufficient data</span>
      </div>
    )
  }

  const getTrendColor = () => {
    if (trend === 'increasing') return 'text-red-500'
    if (trend === 'decreasing') return 'text-green-500'
    return 'text-surface-500'
  }

  return (
    <button
      onClick={onClick}
      className="p-4 relative w-full text-left hover:bg-surface-50 transition-colors group"
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Calculator size={14} className="text-primary-400" />
      </div>

      <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">{label}</p>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-bold text-surface-800">{predicted}</span>
        {changePercent !== undefined && changePercent !== 0 && (
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {changePercent > 0 ? '+' : ''}{changePercent}%
          </span>
        )}
      </div>

      {range && (
        <p className="text-sm text-surface-500 mb-2">Range: {range.min} - {range.max}</p>
      )}

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          <TrendIcon trend={trend} size={14} />
          <span className="text-xs font-medium">
            {trend === 'increasing' ? 'Trending up' : trend === 'decreasing' ? 'Trending down' : 'Stable'}
          </span>
        </div>
        <span className="text-xs text-surface-400">
          {confidence ? `${confidence.charAt(0).toUpperCase()}${confidence.slice(1)} Confidence` : ''}
        </span>
      </div>
    </button>
  )
}

/**
 * TypeProbabilitySection - Donut chart with legend
 */
const TypeProbabilitySection = ({ data, onClick }) => {
  const { types, mostLikely } = data

  const chartData = useMemo(() => {
    return types?.map(t => ({
      name: formatTypeName(t.type),
      fullName: t.label,
      value: t.probability,
      color: t.color,
      trend: t.trend
    })) || []
  }, [types])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const item = payload[0].payload
    return (
      <div className="bg-white p-2 rounded shadow-lg border border-surface-200 text-xs">
        <p className="font-semibold" style={{ color: item.color }}>{item.fullName}</p>
        <p className="text-surface-700">{item.value.toFixed(1)}%</p>
      </div>
    )
  }

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    if (value < 5) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        {name} {value.toFixed(0)}%
      </text>
    )
  }

  return (
    <button onClick={onClick} className="p-4 w-full text-left hover:bg-surface-50 transition-colors group relative">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Calculator size={14} className="text-primary-400" />
      </div>

      <h4 className="text-sm font-semibold text-surface-700 mb-2">Type Probability</h4>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {mostLikely && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-100">
          <span className="text-xs text-surface-500">Most likely:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: mostLikely.color }}>
              {formatTypeName(mostLikely.type)}
            </span>
            <span className="text-xs text-surface-500">({mostLikely.probability}%)</span>
            <TrendIcon trend={mostLikely.trend} size={12} />
          </div>
        </div>
      )}
    </button>
  )
}

/**
 * RiskAssessmentSection - Risk bars with trend indicators
 */
const RiskAssessmentSection = ({ data, onClick }) => {
  const { risks, highestRisk } = data

  return (
    <button onClick={onClick} className="p-4 w-full text-left hover:bg-surface-50 transition-colors group relative">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Calculator size={14} className="text-primary-400" />
      </div>

      <h4 className="text-sm font-semibold text-surface-700 mb-3">Risk Assessment</h4>

      <div className="space-y-2.5">
        {risks?.slice(0, 4).map((risk) => (
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

      {highestRisk && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-100">
          <span className="text-xs text-surface-500">Highest:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: highestRisk.color }}>
              {formatTypeName(highestRisk.type)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
              {highestRisk.riskScore}
            </span>
          </div>
        </div>
      )}
    </button>
  )
}

/**
 * ScenarioSlider - Data-driven scenario slider with prevalence indicator and "Why?" explanation
 */
const ScenarioSlider = ({
  id,
  label,
  sublabel,
  value,
  min,
  max,
  unit = '',
  leftLabel,
  rightLabel,
  colorClass,
  onChange,
  prevalence,
  maxReduction,
  topKeywords = [],
  effectiveness = 0,
  categoryName = ''
}) => {
  const [showExplanation, setShowExplanation] = useState(false)
  const displayValue = value > 0 ? `+${value}` : value.toString()
  const isPositive = value > 0
  const isNegative = value < 0

  // Calculate actual impact based on slider value
  const actualImpact = prevalence && effectiveness
    ? (prevalence * effectiveness * (value / 100)).toFixed(1)
    : 0
  const effortPercent = value

  return (
    <div className="space-y-1.5 pl-2">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-surface-700">{label}</span>
          {sublabel && (
            <p className="text-xs text-surface-400 truncate">{sublabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {prevalence !== null && prevalence !== undefined && (
            <span className="text-2xs bg-surface-100 text-surface-500 px-1.5 py-0.5 rounded whitespace-nowrap">
              {prevalence.toFixed(1)}%
            </span>
          )}
          <span className={`text-sm font-bold min-w-[50px] text-right ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-surface-500'
          }`}>
            {displayValue}{unit}
          </span>
        </div>
      </div>
      <div className="w-full">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(id, parseInt(e.target.value))}
          className={`unified-slider ${colorClass} w-full block`}
          style={{ width: '100%' }}
        />
      </div>
      <div className="flex justify-between text-2xs text-surface-400">
        <span>{leftLabel}</span>
        {maxReduction !== undefined && (
          <span className="text-green-600">Max impact: -{maxReduction.toFixed(1)}%</span>
        )}
        <span>{rightLabel}</span>
      </div>

      {/* Why? Explanation Button */}
      {prevalence !== null && prevalence !== undefined && maxReduction !== undefined && (
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1 text-2xs text-primary-600 hover:text-primary-700 transition-colors mt-1"
        >
          {showExplanation ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <HelpCircle size={10} />
          <span>Why {maxReduction > 0 ? `-${maxReduction.toFixed(1)}%` : '0%'} max impact?</span>
        </button>
      )}

      {/* Expandable Explanation Panel */}
      {showExplanation && prevalence !== null && (
        <div className="mt-2 p-3 bg-surface-50 rounded-lg border border-surface-200 text-xs space-y-3">
          {/* Formula Breakdown */}
          <div>
            <p className="font-semibold text-surface-700 mb-1.5 flex items-center gap-1">
              <Calculator size={12} className="text-primary-500" />
              Impact Calculation
            </p>
            <div className="bg-white rounded p-2 border border-surface-200">
              <div className="font-mono text-2xs text-surface-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Prevalence</span>
                  <span className="font-semibold">{prevalence.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>× Control Effectiveness</span>
                  <span className="font-semibold">{(effectiveness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>× Effort Applied</span>
                  <span className={`font-semibold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-surface-500'}`}>
                    {effortPercent}%
                  </span>
                </div>
                <div className="border-t border-surface-200 pt-1 mt-1 flex items-center justify-between">
                  <span className="font-semibold">= Current Impact</span>
                  <span className={`font-bold ${parseFloat(actualImpact) > 0 ? 'text-green-600' : parseFloat(actualImpact) < 0 ? 'text-red-500' : 'text-surface-600'}`}>
                    {parseFloat(actualImpact) > 0 ? '-' : ''}{Math.abs(parseFloat(actualImpact)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-2xs text-surface-400 mt-1.5">
              At 100% effort: {prevalence.toFixed(1)}% × {(effectiveness * 100).toFixed(0)}% = -{maxReduction.toFixed(1)}% reduction
            </p>
          </div>

          {/* Control Category Info */}
          {categoryName && (
            <div className="flex items-center gap-2 text-2xs text-surface-500 bg-white rounded px-2 py-1.5 border border-surface-100">
              <Info size={10} className="text-surface-400" />
              <span>
                <strong>{categoryName}</strong> controls have <strong>{(effectiveness * 100).toFixed(0)}%</strong> effectiveness (HSE/NIOSH standard)
              </span>
            </div>
          )}

          {/* Top Contributors */}
          {topKeywords && topKeywords.length > 0 && (
            <div>
              <p className="font-semibold text-surface-700 mb-1.5 flex items-center gap-1">
                <Target size={12} className="text-amber-500" />
                Top Contributors ({prevalence.toFixed(1)}% of incidents)
              </p>
              <div className="space-y-1">
                {topKeywords.map((kw, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-2xs">
                    <span className="text-surface-400">•</span>
                    <span className="text-surface-700 font-medium flex-1">{kw.keyword}</span>
                    <span className="text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded">
                      {kw.count} observations
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No keywords message */}
          {(!topKeywords || topKeywords.length === 0) && (
            <div className="text-2xs text-surface-400 italic">
              Keyword analysis not available for this factor.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * ProjectedImpactBox - Shows the projected impact (numbers mode)
 */
const ProjectedImpactBox = ({ projection, hasChanges, onClick, selectedHazard }) => {
  const { baseline, projected, changePercent, riskLevel, isImproved, hazardRatio, isFiltered, hazardTrendDirection, hazardTrendFactor } = projection

  // Get trend indicator for hazard-specific predictions
  const getTrendIndicator = () => {
    if (!isFiltered || !hazardTrendDirection || hazardTrendDirection === 'stable') return null

    if (hazardTrendDirection === 'increasing') {
      return (
        <span className="ml-1 text-2xs text-red-600 flex items-center gap-0.5" title={`Hazard trending up (+${((hazardTrendFactor - 1) * 100).toFixed(0)}% adjustment)`}>
          <TrendingUp size={10} />
          trending
        </span>
      )
    }

    if (hazardTrendDirection === 'decreasing') {
      return (
        <span className="ml-1 text-2xs text-green-600 flex items-center gap-0.5" title={`Hazard trending down (${((hazardTrendFactor - 1) * 100).toFixed(0)}% adjustment)`}>
          <TrendingDown size={10} />
          trending
        </span>
      )
    }

    return null
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-amber-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-surface-400'
    }
  }

  const getRiskWidth = (level) => {
    switch (level) {
      case 'low': return '25%'
      case 'medium': return '50%'
      case 'high': return '75%'
      case 'critical': return '100%'
      default: return '50%'
    }
  }

  const Wrapper = hasChanges ? 'button' : 'div'
  const wrapperProps = hasChanges ? {
    onClick,
    className: `w-full text-left p-4 rounded-lg border-2 group relative transition-all ${
      isImproved
        ? 'bg-green-50 border-green-200 hover:border-green-300'
        : 'bg-red-50 border-red-200 hover:border-red-300'
    }`
  } : {
    className: 'p-4 rounded-lg border-2 bg-surface-50 border-surface-200'
  }

  return (
    <Wrapper {...wrapperProps}>
      {hasChanges && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Calculator size={14} className="text-primary-400" />
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
          Projected Impact
          {isFiltered && selectedHazard !== 'all' && (
            <span className="ml-2 text-primary-600 normal-case">for "{selectedHazard}"</span>
          )}
        </span>
        {isFiltered && (
          <div className="flex items-center gap-1">
            <span className="text-2xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {hazardRatio}% of total
            </span>
            {getTrendIndicator()}
          </div>
        )}
      </div>

      {hasChanges ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
                {projected}
              </span>
              <span className="text-sm text-surface-500">/week</span>
            </div>
            <span className="text-sm text-surface-400">(was {baseline})</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
              isImproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isImproved ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              <span className="text-sm font-bold">
                {changePercent > 0 ? '+' : ''}{changePercent}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getRiskColor(riskLevel)}`}
                style={{ width: getRiskWidth(riskLevel) }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-surface-400">Risk Level:</span>
              <span className={`font-semibold ${
                riskLevel === 'low' ? 'text-green-600' :
                riskLevel === 'medium' ? 'text-amber-600' :
                riskLevel === 'high' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {riskLevel?.toUpperCase()}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-surface-500">
          <Minus size={16} />
          <span className="text-sm">Adjust sliders above to see projected impact</span>
        </div>
      )}
    </Wrapper>
  )
}

/**
 * MethodologySection - Explanation of calculations
 */
const MethodologySection = ({ filteredIncidents, hazardFilteredIncidents, selectedHazard }) => (
  <div className="px-4 pb-4 text-xs text-surface-600 space-y-4">
    {/* Data-Driven Approach */}
    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
      <p className="font-semibold text-green-700 mb-2 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-2xs font-bold">1</span>
        Data-Driven Factor Analysis
      </p>
      <div className="text-surface-600 space-y-1">
        <p><strong>Prevalence:</strong> Calculated from your actual incident descriptions</p>
        <p><strong>Effect:</strong> Prevalence % x Control Effectiveness = Max Reduction</p>
        <p className="text-surface-500 text-2xs mt-2">No arbitrary multipliers - all based on your data</p>
      </div>
    </div>

    {/* HSE Hierarchy */}
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
      <p className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-2xs font-bold">2</span>
        HSE Hierarchy of Controls
      </p>
      <div className="grid grid-cols-2 gap-2 text-surface-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Engineering: 75% effective</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-indigo-500"></div>
          <span>Administrative: 50% effective</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span>PPE: 30% effective</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Environmental: 55% effective</span>
        </div>
      </div>
      <p className="text-surface-500 text-2xs mt-2">Based on NIOSH/HSE research on control effectiveness</p>
    </div>

    {/* Formula */}
    <div className="bg-surface-50 rounded-lg p-3">
      <p className="font-semibold text-surface-700 mb-2 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-surface-200 text-surface-600 flex items-center justify-center text-2xs font-bold">3</span>
        Calculation Formula
      </p>
      <div className="bg-white rounded p-2 font-mono text-2xs text-surface-600 border border-surface-200">
        Effect = FactorPrevalence × ControlEffectiveness × (SliderValue / 100)
      </div>
      <p className="text-surface-500 text-2xs mt-2">
        Example: If Training appears in 20% of incidents, and you increase training by 50%, max reduction = 20% × 50% × 50% = 5%
      </p>
    </div>

    <p className="text-surface-400 italic pt-1 text-2xs">
      Based on {filteredIncidents?.length || 0} observations
      {selectedHazard !== 'all' && ` (${hazardFilteredIncidents?.length || 0} for selected hazard)`}.
    </p>
  </div>
)

/**
 * TrendIcon - Reusable trend indicator
 */
const TrendIcon = ({ trend, size = 12 }) => {
  if (trend === 'increasing') return <TrendingUp size={size} className="text-red-500" />
  if (trend === 'decreasing') return <TrendingDown size={size} className="text-green-500" />
  return <Minus size={size} className="text-surface-400" />
}

/**
 * Helper: Format incident type name for display
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

/**
 * Helper: Get risk bar color based on level
 */
const getRiskBarColor = (riskLevel) => {
  if (riskLevel === 'high') return 'bg-red-500'
  if (riskLevel === 'medium') return 'bg-amber-500'
  return 'bg-green-500'
}

export default React.memo(UnifiedPredictivePanel)
