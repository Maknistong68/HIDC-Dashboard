import React, { useMemo, useState } from 'react'
import { Info, ChevronRight } from 'lucide-react'
import { getHazardInsights } from '../../utils/insightsCalculations'
import { getKeywordsForFactor } from '../../utils/rootCauseEngine'
import HazardRootCauseChart from './HazardRootCauseChart'
import HazardActionStatus from './HazardActionStatus'
import HazardTemporalPatterns from './HazardTemporalPatterns'
import HazardContractorBreakdown from './HazardContractorBreakdown'

/**
 * HazardInsightsTab - Main container for hazard insights in DrillDownModal
 * Orchestrates all insight panels in a responsive grid layout
 *
 * Layout (Desktop 2-column):
 * +-------------------------------------------------------+
 * |              HazardActionStatus (Full Width)          |
 * +-------------------------------------------------------+
 * |         HazardRootCauseChart (Full Width)             |
 * +-------------------------------------------------------+
 * |   HazardTemporalPatterns  |  HazardContractorBreakdown|
 * +---------------------------+---------------------------+
 */
const HazardInsightsTab = ({
  hazardName,
  hazardIncidents = [],
  allIncidents = [],
  factorData = null,
  filterMonth = null,  // For month-specific insights (e.g., from heatmap)
  onViewRecords,
  onFilterByRootCause,
  isMobile = false
}) => {
  const [showDataSource, setShowDataSource] = useState(false)

  // Calculate insights for this hazard, using pre-calculated factorData if available
  const insights = useMemo(() => {
    const result = getHazardInsights(allIncidents, hazardName, factorData, { filterMonth })
    return result
  }, [allIncidents, hazardName, factorData, filterMonth])

  // Handle root cause bar click - filter observations and callback
  const handleRootCauseClick = (factorName) => {
    if (!factorName || !onFilterByRootCause) return

    // If we have pre-calculated factorData, use it for consistent filtering
    if (factorData?.byFactor) {
      const factor = factorData.byFactor.find(f => f.name === factorName)
      if (factor?.incidents) {
        // Filter to only incidents in this hazard
        const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))
        const factorObservations = factor.incidents.filter(inc =>
          hazardIncidentIds.has(inc.id)
        )
        const keywords = getKeywordsForFactor(factorName)
        onFilterByRootCause(factorObservations, factorName, keywords)
        return
      }
    }

    // Fallback: use rootCauses from insights (already calculated with factorData)
    const keywords = getKeywordsForFactor(factorName)
    // Filter hazardIncidents by matching against the factor in insights.rootCauses
    const rootCause = insights.rootCauses?.find(rc => rc.name === factorName)
    if (rootCause && rootCause.incidents) {
      onFilterByRootCause(rootCause.incidents, factorName, keywords)
    } else {
      // Last resort: return all hazard incidents (not ideal but better than nothing)
      onFilterByRootCause(hazardIncidents, factorName, keywords)
    }
  }

  if (!insights.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Info size={24} className="text-surface-400" />
        </div>
        <h3 className="text-base font-semibold text-surface-700 mb-1">No Insights Available</h3>
        <p className="text-sm text-surface-500 text-center max-w-xs">
          Not enough data to generate insights for "{hazardName}".
          {hazardIncidents.length === 0 && ' No observations found for this hazard.'}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${isMobile ? '' : ''}`}>
      {/* Row 1: Action Status (Full Width) */}
      <HazardActionStatus
        actions={insights.actions}
        isMobile={isMobile}
      />

      {/* Row 2: Root Cause Chart (Full Width) */}
      <HazardRootCauseChart
        rootCauses={insights.rootCauses}
        onBarClick={onFilterByRootCause ? handleRootCauseClick : null}
        isMobile={isMobile}
      />

      {/* Row 3: Temporal Patterns + Contractor Breakdown */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <HazardTemporalPatterns
          temporal={insights.temporal}
          isMobile={isMobile}
        />
        <HazardContractorBreakdown
          contractors={insights.contractors}
          isMobile={isMobile}
        />
      </div>

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
            <p>Hazard Category: <span className="font-medium text-surface-700">{hazardName}</span></p>
            <p>Total Observations: <span className="font-medium text-surface-700">{insights.totalCount}</span></p>
            <p>Trend: <span className="font-medium text-surface-700">
              {insights.trend?.direction === 'up' ? `+${insights.trend.percentChange}%` :
               insights.trend?.direction === 'down' ? `-${Math.abs(insights.trend.percentChange)}%` : 'Stable'}
            </span></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(HazardInsightsTab)
