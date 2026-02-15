import React, { useMemo, useRef, useEffect, useState, useCallback, startTransition } from 'react'
import { createPortal } from 'react-dom'
import { Target, BarChart3, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts'
import { detectFactorsForHazard, getIncidentsForHazardFactor, getKeywordsForFactor } from '../../utils/rootCauseEngine'
import { getCachedAggregation } from '../../utils/memoizedCalculations'
import HazardTrendChart from './HazardTrendChart'
import DrillDownModal from '../common/DrillDownModal'

/**
 * Get variance-based bar color
 * High counts = red, medium = amber, low = blue, very low = green
 */
const getBarColor = (count, maxCount) => {
  const ratio = maxCount > 0 ? count / maxCount : 0
  if (ratio > 0.7) return '#ef4444' // red
  if (ratio > 0.4) return '#f59e0b' // amber
  if (ratio > 0.2) return '#3b82f6' // blue
  return '#10b981' // green
}

/**
 * HazardSummary - Shows hazard stats in a grid layout for better readability
 */
const HazardSummary = React.memo(({ hazard, totalIncidents }) => {
  if (!hazard) return null

  const percentage = totalIncidents > 0
    ? ((hazard.totalCount / totalIncidents) * 100).toFixed(1)
    : 0

  const factorCount = hazard.factors?.length || 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
      <div className="bg-surface-50 rounded px-2 py-1.5">
        <span className="text-surface-500">Observations</span>
        <span className="font-semibold text-primary-600 ml-1">{hazard.totalCount}</span>
      </div>
      <div className="bg-surface-50 rounded px-2 py-1.5">
        <span className="text-surface-500">Percentage</span>
        <span className={`font-semibold ml-1 ${parseFloat(percentage) > 20 ? 'text-red-500' : parseFloat(percentage) > 10 ? 'text-amber-600' : 'text-green-600'}`}>
          {percentage}%
        </span>
      </div>
      <div className="bg-surface-50 rounded px-2 py-1.5">
        <span className="text-surface-500">Factors</span>
        <span className="font-semibold text-surface-700 ml-1">{factorCount}</span>
      </div>
    </div>
  )
})

HazardSummary.displayName = 'HazardSummary'

/**
 * FactorBarChart - Horizontal bar chart showing top contributing factors with variance colors
 */
const FactorBarChart = React.memo(({ factors, isTransitioning, onBarClick }) => {
  const { chartData, maxCount } = useMemo(() => {
    if (!factors?.length) return { chartData: [], maxCount: 0 }

    // Show all factors (no limit) for scrollable view
    const data = factors.map(f => ({
      name: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name,
      fullName: f.name,
      count: f.count,
      isUnclassified: f.isUnclassified || false
    }))

    const max = Math.max(...data.map(d => d.count), 0)

    return {
      chartData: data.map(d => ({
        ...d,
        // Use gray for Unclassified factor
        fill: d.isUnclassified ? '#6b7280' : getBarColor(d.count, max)
      })),
      maxCount: max
    }
  }, [factors])

  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-surface-400">No factor data available</p>
      </div>
    )
  }

  const handleBarClick = (data) => {
    if (onBarClick && data?.fullName) {
      onBarClick(data.fullName)
    }
  }

  // Calculate dynamic height based on number of items (30px per bar minimum)
  const chartHeight = Math.max(180, chartData.length * 30)

  return (
    <div
      className={`h-full flex flex-col transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Click hint */}
      {onBarClick && (
        <p className="text-2xs text-surface-400 text-center mb-1">Click a bar to view observations</p>
      )}
      <div className="flex-1 min-h-[180px] overflow-y-auto overflow-x-hidden">
        <div style={{ height: chartHeight, minHeight: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-surface-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                      <p className="font-medium">{payload[0].payload.fullName}</p>
                      <p className="text-surface-300">Count: <span className="text-white font-bold">{payload[0].value}</span></p>
                      {onBarClick && (
                        <p className="text-surface-400 text-2xs mt-1">Click to view observations</p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              isAnimationActive={true}
              animationDuration={500}
              onClick={handleBarClick}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.fullName}-${index}`}
                  fill={entry.fill}
                  style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-2xs text-surface-500 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
          <span>Very Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#6b7280]" />
          <span>Unclassified</span>
        </div>
      </div>
    </div>
  )
})

FactorBarChart.displayName = 'FactorBarChart'

/**
 * HazardDetailPanelInner - Right panel showing factor distribution for selected hazard
 * Mirrors FactorDetailPanel implementation with bar charts and trend chart
 */
const HazardDetailPanelInner = ({ hazard, incidents, timePeriod, trendData, onOpenDrillDown }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeTab, setActiveTab] = useState('factors') // 'trend' or 'factors'
  const prevHazardRef = useRef(null)

  // Calculate contributing factors for this hazard
  // Uses getCachedAggregation to avoid recomputation when incidents array reference
  // changes but actual data is the same (sampled hash comparison)
  const contributingFactors = useMemo(() => {
    if (!hazard || !incidents) return []
    return getCachedAggregation(
      `hazardDetail-factors-${hazard.name}`,
      incidents,
      (data) => detectFactorsForHazard(data, hazard.name)
    )
  }, [hazard?.name, incidents])

  // Get hazard incidents for drill-down filtering
  const hazardIncidents = useMemo(() => {
    if (!hazard || !incidents) return []
    return incidents.filter(i => i.location === hazard.name)
  }, [hazard?.name, incidents])

  // Handle factor bar click - filter observations and open drill-down
  // Uses getIncidentsForHazardFactor (LRU cached) instead of per-incident detectContributingFactors
  const handleFactorClick = useCallback((factorName) => {
    if (!factorName || !hazardIncidents.length || !onOpenDrillDown) return

    startTransition(() => {
      // Uses internal LRU cache for factor detection per incident
      const factorObservations = getIncidentsForHazardFactor(
        hazardIncidents,
        hazard.name,
        factorName
      )

      // Get keywords for highlighting
      const keywords = getKeywordsForFactor(factorName)

      onOpenDrillDown(
        factorObservations,
        `${factorName} Observations in ${hazard.name}`,
        keywords
      )
    })
  }, [hazardIncidents, hazard?.name, onOpenDrillDown])

  // Smooth transition effect when hazard changes
  useEffect(() => {
    if (prevHazardRef.current?.name !== hazard?.name) {
      startTransition(() => {
        setIsTransitioning(true)
      })
      const timer = setTimeout(() => {
        startTransition(() => {
          setIsTransitioning(false)
        })
      }, 300)
      prevHazardRef.current = hazard
      return () => clearTimeout(timer)
    }
  }, [hazard])

  // Show placeholder when no hazard is selected
  if (!hazard) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <Target size={24} className="text-surface-400" />
          </div>
          <h3 className="text-base font-semibold text-surface-700 mb-1">No Hazard Selected</h3>
          <p className="text-sm text-surface-500">Select a hazard from the list to view details</p>
        </div>
      </div>
    )
  }

  // Check sample size for reliability indicator
  const hasLowSampleSize = hazard.totalCount < 5
  const hasMediumSampleSize = hazard.totalCount >= 5 && hazard.totalCount < 20

  // Add factors to hazard for summary
  const hazardWithFactors = { ...hazard, factors: contributingFactors }

  return (
    <div
      className={`h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Header with hazard summary */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <HazardSummary
          hazard={hazardWithFactors}
          totalIncidents={incidents?.length || 0}
        />
        {/* Data quality warning */}
        {hasLowSampleSize && (
          <span className="text-2xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1" title="Low sample size">
            <span>Low data</span>
          </span>
        )}
        {hasMediumSampleSize && (
          <span className="text-2xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded" title="Moderate sample size">
            Moderate data
          </span>
        )}
      </div>

      {/* Hazard name header */}
      <div className="px-4 py-3 bg-surface-50">
        <h3 className="text-lg font-semibold text-surface-800">{hazard.name}</h3>
        <p className="text-xs text-surface-500">
          {hazard.totalCount} observation{hazard.totalCount !== 1 ? 's' : ''} with {contributingFactors.length} contributing factor{contributingFactors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-surface-100 bg-surface-50">
        <button
          onClick={() => setActiveTab('trend')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'trend'
              ? 'bg-primary-100 text-primary-700'
              : 'text-surface-600 hover:bg-surface-100'
          }`}
        >
          <TrendingUp size={14} />
          Trend
        </button>
        <button
          onClick={() => setActiveTab('factors')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'factors'
              ? 'bg-primary-100 text-primary-700'
              : 'text-surface-600 hover:bg-surface-100'
          }`}
        >
          <BarChart3 size={14} />
          Factors
        </button>
      </div>

      {/* Chart content based on active tab */}
      <div className="flex-1 p-4 overflow-hidden">
        {activeTab === 'trend' ? (
          <HazardTrendChart
            data={trendData}
            hazardName={hazard.name}
            timePeriod={timePeriod}
          />
        ) : (
          <FactorBarChart
            factors={contributingFactors}
            isTransitioning={isTransitioning}
            onBarClick={handleFactorClick}
          />
        )}
      </div>

      {/* Hazard percentage bar at bottom */}
      <div className="px-4 py-3 bg-surface-50 border-t border-surface-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-surface-600">Hazard Share of Total Observations</span>
          <span className="text-xs font-bold text-surface-700">
            {incidents?.length > 0 ? ((hazard.totalCount / incidents.length) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${incidents?.length > 0 ? (hazard.totalCount / incidents.length) * 100 : 0}%` }}
          />
        </div>
        <p className="text-2xs text-surface-400 mt-1">
          {hazard.totalCount} of {incidents?.length || 0} total observations
        </p>
      </div>

    </div>
  )
}

/**
 * Wrapper component that renders the modal using portal
 */
const HazardDetailPanelWithPortal = (props) => {
  const [drillDownOpen, setDrillDownOpen] = useState(false)
  const [drillDownData, setDrillDownData] = useState([])
  const [drillDownTitle, setDrillDownTitle] = useState('')
  const [drillDownKeywords, setDrillDownKeywords] = useState([])

  const handleOpenDrillDown = (data, title, keywords) => {
    setDrillDownData(data)
    setDrillDownTitle(title)
    setDrillDownKeywords(keywords)
    setDrillDownOpen(true)
  }

  const handleCloseDrillDown = () => {
    setDrillDownOpen(false)
    setDrillDownData([])
    setDrillDownTitle('')
    setDrillDownKeywords([])
  }

  return (
    <>
      <HazardDetailPanelInner
        {...props}
        onOpenDrillDown={handleOpenDrillDown}
      />
      {/* Portal the modal to document.body to escape overflow/transform contexts */}
      {createPortal(
        <DrillDownModal
          isOpen={drillDownOpen}
          onClose={handleCloseDrillDown}
          title={drillDownTitle}
          data={drillDownData}
          type="records"
          breadcrumb={['Safety Outlook', props.hazard?.name || '', 'Factors']}
          highlightKeywords={drillDownKeywords}
          source="Safety Outlook"
        />,
        document.body
      )}
    </>
  )
}

export default React.memo(HazardDetailPanelWithPortal)
