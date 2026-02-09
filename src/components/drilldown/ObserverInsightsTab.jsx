import React, { useMemo, useState } from 'react'
import { Eye, ChevronRight, Info, User, PieChart } from 'lucide-react'
import { getObserverInsights } from '../../utils/insightsCalculations'
import HazardActionStatus from './HazardActionStatus'
import HazardTemporalPatterns from './HazardTemporalPatterns'
import CategoryTopHazards from './CategoryTopHazards'

/**
 * ObserverTypeBreakdown - Pie/donut-style breakdown of observation types
 */
const ObserverTypeBreakdown = ({ typeBreakdown = [], isMobile = false }) => {
  if (!typeBreakdown.length) {
    return (
      <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <PieChart size={16} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Observation Types</span>
        </div>
        <p className="text-sm text-surface-400 text-center py-4">No type data available</p>
      </div>
    )
  }

  // Calculate total for bar widths
  const maxCount = typeBreakdown[0]?.count || 1

  return (
    <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieChart size={16} className="text-purple-500" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Observation Types</span>
        </div>
        <span className="text-2xs text-surface-400">{typeBreakdown.length} types</span>
      </div>

      {/* Type List */}
      <div className="space-y-2">
        {typeBreakdown.map((item, index) => {
          const barWidth = (item.count / maxCount) * 100

          return (
            <div key={item.type} className="relative">
              {/* Background bar */}
              <div
                className="absolute inset-0 rounded-lg opacity-20"
                style={{ backgroundColor: item.color, width: `${barWidth}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Color indicator */}
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  {/* Type label */}
                  <span className="text-sm text-surface-700 truncate">
                    {item.label}
                  </span>
                </div>

                {/* Count and percentage */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-surface-800">{item.count}</span>
                  <span className="text-xs text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top type highlight */}
      {typeBreakdown.length > 0 && typeBreakdown[0].percentage > 40 && (
        <div className="mt-3 pt-3 border-t border-surface-100">
          <p className="text-2xs text-surface-500">
            <span className="font-medium text-surface-700">{typeBreakdown[0].label}</span>
            {' '}accounts for {typeBreakdown[0].percentage}% of this observer's reports.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * ObserverInsightsTab - Insights for observer drill-downs
 *
 * Layout:
 * +-------------------------------------------------------+
 * |              HazardActionStatus (Full Width)          |
 * +-------------------------------------------------------+
 * |    ObserverTypeBreakdown   |   CategoryTopHazards     |
 * +---------------------------+---------------------------+
 * |         HazardTemporalPatterns (Full Width)           |
 * +-------------------------------------------------------+
 */
const ObserverInsightsTab = ({
  observerName,
  observerIncidents = [],
  allIncidents = [],
  onViewRecords,
  onFilterByType,
  onFilterByHazard,
  isMobile = false
}) => {
  const [showDataSource, setShowDataSource] = useState(false)

  // Calculate insights for this observer
  const insights = useMemo(() => {
    return getObserverInsights(observerIncidents, observerName, allIncidents)
  }, [observerIncidents, observerName, allIncidents])

  // Handle hazard bar click - filter to that hazard
  const handleHazardClick = (hazardName) => {
    if (!hazardName || !onFilterByHazard) return
    const hazardIncidents = observerIncidents.filter(i =>
      i.location && i.location.toLowerCase() === hazardName.toLowerCase()
    )
    onFilterByHazard(hazardIncidents, hazardName)
  }

  if (!insights.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Info size={24} className="text-surface-400" />
        </div>
        <h3 className="text-base font-semibold text-surface-700 mb-1">No Insights Available</h3>
        <p className="text-sm text-surface-500 text-center max-w-xs">
          Not enough data to generate insights for "{observerName}".
          {observerIncidents.length === 0 && ' No observations found for this observer.'}
        </p>
        {observerIncidents.length > 0 && (
          <button
            onClick={() => onViewRecords && onViewRecords()}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            <Eye size={16} />
            View {observerIncidents.length} Record{observerIncidents.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${isMobile ? '' : ''}`}>
      {/* Observer Info Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-surface-900">{observerName}</h3>
            <p className="text-sm text-surface-600">{insights.totalCount} total observations</p>
          </div>
        </div>
      </div>

      {/* Row 1: Action Status (Full Width) */}
      <HazardActionStatus
        actions={insights.actions}
        isMobile={isMobile}
      />

      {/* Row 2: Type Breakdown + Top Hazards */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <ObserverTypeBreakdown
          typeBreakdown={insights.typeBreakdown}
          isMobile={isMobile}
        />
        <CategoryTopHazards
          hazards={insights.topHazards}
          onBarClick={onFilterByHazard ? handleHazardClick : null}
          isMobile={isMobile}
        />
      </div>

      {/* Row 3: Temporal Patterns (Full Width) */}
      <HazardTemporalPatterns
        temporal={insights.temporal}
        isMobile={isMobile}
      />

      {/* Peak Activity Summary */}
      {insights.temporal?.peakHour && (
        <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-3">
          <p className="text-sm text-indigo-800">
            <span className="font-medium">Peak Activity:</span>{' '}
            {insights.temporal.peakDay}s at {insights.temporal.peakHour.label}{' '}
            <span className="text-indigo-600">
              ({insights.temporal.peakHour.count} obs, {insights.temporal.peakHour.percentage}%)
            </span>
          </p>
        </div>
      )}

      {/* View All Records Button */}
      {onViewRecords && observerIncidents.length > 0 && (
        <button
          onClick={onViewRecords}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          <Eye size={18} />
          View All {insights.totalCount} Records
          <ChevronRight size={16} />
        </button>
      )}

      {/* Data Source Info (collapsible) */}
      <div className="pt-2 border-t border-surface-100">
        <button
          onClick={() => setShowDataSource(!showDataSource)}
          className="flex items-center gap-1.5 text-2xs text-surface-400 hover:text-surface-600 transition-colors"
        >
          <Info size={12} />
          <span>Data based on {insights.totalCount} observations</span>
          <ChevronRight
            size={12}
            className={`transition-transform ${showDataSource ? 'rotate-90' : ''}`}
          />
        </button>
        {showDataSource && (
          <div className="mt-2 p-2 bg-surface-50 rounded text-2xs text-surface-500 space-y-1">
            <p>Observer: <span className="font-medium text-surface-700">{observerName}</span></p>
            <p>Total Observations: <span className="font-medium text-surface-700">{insights.totalCount}</span></p>
            <p>Primary Type: <span className="font-medium text-surface-700">
              {insights.typeBreakdown[0]?.label || 'N/A'} ({insights.typeBreakdown[0]?.percentage || 0}%)
            </span></p>
            <p>Top Hazard: <span className="font-medium text-surface-700">
              {insights.topHazards[0]?.name || 'N/A'} ({insights.topHazards[0]?.percentage || 0}%)
            </span></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(ObserverInsightsTab)
