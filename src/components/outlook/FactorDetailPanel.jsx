import React, { useMemo, useRef, useEffect, useState, startTransition } from 'react'
import { createPortal } from 'react-dom'
import { Layers, BarChart3, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts'
import FactorTrendChart from './FactorTrendChart'
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
 * DetectionSummary - Shows detection rate and stats in a grid layout for better readability
 */
const DetectionSummary = React.memo(({ factor, totalIncidents, analyzedIncidents, detectedIncidents }) => {
  if (!factor) return null

  const detectionRate = totalIncidents > 0
    ? ((detectedIncidents / totalIncidents) * 100).toFixed(1)
    : 0

  const hazardCount = factor.hazardBreakdown?.length || 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
      <div className="bg-surface-50 rounded px-2 py-1.5">
        <span className="text-surface-500">Occurrences</span>
        <span className="font-semibold text-primary-600 ml-1">{factor.count}</span>
      </div>
      <div className="bg-surface-50 rounded px-2 py-1.5">
        <span className="text-surface-500">Detection</span>
        <span className={`font-semibold ml-1 ${parseFloat(detectionRate) > 50 ? 'text-green-600' : parseFloat(detectionRate) > 20 ? 'text-amber-600' : 'text-red-500'}`}>
          {detectionRate}%
        </span>
      </div>
      <div className="bg-surface-50 rounded px-2 py-1.5">
        <span className="text-surface-500">Hazards</span>
        <span className="font-semibold text-surface-700 ml-1">{hazardCount}</span>
      </div>
    </div>
  )
})

DetectionSummary.displayName = 'DetectionSummary'

/**
 * HazardBarChart - Horizontal bar chart showing hazard distribution with variance colors
 * Colors indicate relative frequency: red (high), amber (medium), blue (low), green (very low)
 */
const HazardBarChart = React.memo(({ hazardBreakdown, isTransitioning, onBarClick }) => {
  // Pre-calculate chart data and colors for performance
  const { chartData, maxCount } = useMemo(() => {
    if (!hazardBreakdown?.length) return { chartData: [], maxCount: 0 }

    // Show all hazards (no limit) for scrollable view
    const data = hazardBreakdown.map(h => ({
      name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
      fullName: h.name,
      count: h.count
    }))

    const max = Math.max(...data.map(d => d.count), 0)

    // Pre-calculate colors for each bar
    return {
      chartData: data.map(d => ({
        ...d,
        fill: getBarColor(d.count, max)
      })),
      maxCount: max
    }
  }, [hazardBreakdown])

  // Calculate dynamic height based on number of items (30px per bar minimum)
  const chartHeight = Math.max(180, chartData.length * 30)

  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-surface-400">No hazard data available</p>
      </div>
    )
  }

  const handleBarClick = (data) => {
    if (onBarClick && data?.fullName) {
      onBarClick(data.fullName)
    }
  }

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
      </div>
    </div>
  )
})

HazardBarChart.displayName = 'HazardBarChart'

/**
 * FactorDetailPanelInner - Right panel showing hazard breakdown for selected factor
 * With bar chart showing variance colors and detection percentage
 */
const FactorDetailPanelInner = ({ factor, totalIncidents = 0, analyzedIncidents = 0, allFactors = [], trendData, timePeriod, onOpenDrillDown }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeTab, setActiveTab] = useState('trend') // 'trend' or 'hazards'
  const prevFactorRef = useRef(null)

  // Calculate detection stats
  const detectedIncidents = useMemo(() => {
    // Count unique incidents that have at least one factor
    const incidentSet = new Set()
    allFactors.forEach(f => {
      f.incidents?.forEach(inc => {
        if (inc.id) incidentSet.add(inc.id)
      })
    })
    return incidentSet.size
  }, [allFactors])

  // Handle hazard bar click - filter observations and open drill-down
  const handleHazardClick = (hazardName) => {
    if (!hazardName || !factor?.incidents?.length || !onOpenDrillDown) return

    // Filter factor's incidents that belong to this hazard category
    const hazardObservations = factor.incidents.filter(inc => inc.location === hazardName)

    onOpenDrillDown(
      hazardObservations,
      `${factor.name} in ${hazardName}`,
      hazardName
    )
  }

  // Smooth transition effect when factor changes
  useEffect(() => {
    if (prevFactorRef.current?.name !== factor?.name) {
      startTransition(() => {
        setIsTransitioning(true)
      })
      const timer = setTimeout(() => {
        startTransition(() => {
          setIsTransitioning(false)
        })
      }, 300)
      prevFactorRef.current = factor
      return () => clearTimeout(timer)
    }
  }, [factor])

  // Show placeholder when no factor is selected
  if (!factor) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <Layers size={24} className="text-surface-400" />
          </div>
          <h3 className="text-base font-semibold text-surface-700 mb-1">No Factor Selected</h3>
          <p className="text-sm text-surface-500">Select a factor from the list to view details</p>
        </div>
      </div>
    )
  }

  // Check sample size for reliability indicator
  const hasLowSampleSize = factor.count < 5
  const hasMediumSampleSize = factor.count >= 5 && factor.count < 20

  return (
    <div
      className={`h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Header with detection summary */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <DetectionSummary
          factor={factor}
          totalIncidents={totalIncidents}
          analyzedIncidents={analyzedIncidents}
          detectedIncidents={detectedIncidents}
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

      {/* Factor name header */}
      <div className="px-4 py-3 bg-surface-50">
        <h3 className="text-lg font-semibold text-surface-800">{factor.name}</h3>
        <p className="text-xs text-surface-500">
          Found in {factor.count} observation{factor.count !== 1 ? 's' : ''} across {factor.hazardBreakdown?.length || 0} hazard categories
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
          onClick={() => setActiveTab('hazards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'hazards'
              ? 'bg-primary-100 text-primary-700'
              : 'text-surface-600 hover:bg-surface-100'
          }`}
        >
          <BarChart3 size={14} />
          Hazards
        </button>
      </div>

      {/* Chart content based on active tab */}
      <div className="flex-1 p-4 overflow-hidden">
        {activeTab === 'trend' ? (
          <FactorTrendChart
            data={trendData}
            factorName={factor.name}
            timePeriod={timePeriod}
          />
        ) : (
          <HazardBarChart
            hazardBreakdown={factor.hazardBreakdown}
            isTransitioning={isTransitioning}
            onBarClick={handleHazardClick}
          />
        )}
      </div>

      {/* Detection rate bar at bottom */}
      <div className="px-4 py-3 bg-surface-50 border-t border-surface-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-surface-600">Overall Factor Detection Rate</span>
          <span className="text-xs font-bold text-surface-700">
            {totalIncidents > 0 ? ((detectedIncidents / totalIncidents) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${totalIncidents > 0 ? (detectedIncidents / totalIncidents) * 100 : 0}%` }}
          />
        </div>
        <p className="text-2xs text-surface-400 mt-1">
          {detectedIncidents} of {totalIncidents} observations have detected factors
        </p>
      </div>
    </div>
  )
}

/**
 * Wrapper component that renders the modal using portal
 */
const FactorDetailPanel = (props) => {
  const [drillDownOpen, setDrillDownOpen] = useState(false)
  const [drillDownData, setDrillDownData] = useState([])
  const [drillDownTitle, setDrillDownTitle] = useState('')
  const [drillDownHazard, setDrillDownHazard] = useState('')

  const handleOpenDrillDown = (data, title, hazardName) => {
    setDrillDownData(data)
    setDrillDownTitle(title)
    setDrillDownHazard(hazardName)
    setDrillDownOpen(true)
  }

  const handleCloseDrillDown = () => {
    setDrillDownOpen(false)
    setDrillDownData([])
    setDrillDownTitle('')
    setDrillDownHazard('')
  }

  return (
    <>
      <FactorDetailPanelInner
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
          breadcrumb={['Safety Outlook', 'Factors', props.factor?.name || '', drillDownHazard]}
          source="Safety Outlook"
        />,
        document.body
      )}
    </>
  )
}

export default React.memo(FactorDetailPanel)
