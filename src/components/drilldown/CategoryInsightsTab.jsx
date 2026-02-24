import { useMemo, useState, useCallback, memo } from 'react'
import { ChevronRight, Info } from 'lucide-react'
import { getCategoryInsights } from '../../utils/insightsCalculations'
import { getKeywordsForFactor } from '../../utils/rootCauseEngine'
import { ENV_BREAKDOWN_TYPES, DMG_BREAKDOWN_TYPES } from '../../utils/constants'
import CategoryTopHazards from './CategoryTopHazards'
import HazardRootCauseChart from './HazardRootCauseChart'
import HazardActionStatus from './HazardActionStatus'
import HazardContractorBreakdown from './HazardContractorBreakdown'
import IncidentTypeBreakdown from './IncidentTypeBreakdown'

/**
 * CategoryInsightsTab - Insights for observation category drill-downs (Unsafe Condition, Near Miss, etc.)
 *
 * Layout:
 * +-------------------------------------------------------+
 * |              HazardActionStatus (Full Width)          |
 * +-------------------------------------------------------+
 * |         CategoryTopHazards (Full Width)               |
 * +-------------------------------------------------------+
 * |   HazardRootCauseChart  |  HazardContractorBreakdown  |
 * +---------------------------+---------------------------+
 */
const CategoryInsightsTab = ({
  categoryType,
  categoryIncidents = [],
  allIncidents = [],
  onViewRecords: _onViewRecords,
  onFilterByHazard,
  onFilterByRootCause,
  isMobile = false
}) => {
  const [showDataSource, setShowDataSource] = useState(false)

  // Check if this is the "incident" aggregate type
  const isIncidentAggregate = categoryType === 'incident'
  // Check if this is a consolidated type with sub-type breakdown
  const isEnvCategory = categoryType === 'environmental'
  const isDmgCategory = categoryType === 'damage-to-property'
  // Get the sub-type breakdown config
  const subTypeBreakdownConfig = isEnvCategory
    ? { subTypes: ENV_BREAKDOWN_TYPES, title: 'Environmental Breakdown' }
    : isDmgCategory
      ? { subTypes: DMG_BREAKDOWN_TYPES, title: 'Damage Breakdown' }
      : null

  // Handle incident sub-type click - filter to that specific type
  const handleIncidentTypeClick = useCallback((typeKey, typeLabel) => {
    if (!onFilterByRootCause) return
    const typeIncidents = categoryIncidents.filter(i => i.type === typeKey)
    onFilterByRootCause(typeIncidents, typeLabel, [])
  }, [categoryIncidents, onFilterByRootCause])

  // Calculate insights for this category
  const insights = useMemo(() => {
    return getCategoryInsights(categoryIncidents, categoryType, allIncidents)
  }, [categoryIncidents, categoryType, allIncidents])

  // Handle hazard bar click - filter observations to that hazard
  const handleHazardClick = (hazardName) => {
    if (!hazardName || !onFilterByHazard) return
    const hazardIncidents = categoryIncidents.filter(i =>
      i.location && i.location.toLowerCase() === hazardName.toLowerCase()
    )
    onFilterByHazard(hazardIncidents, hazardName)
  }

  // Handle root cause bar click - filter observations by factor
  const handleRootCauseClick = (factorName) => {
    if (!factorName || !onFilterByRootCause) return
    const keywords = getKeywordsForFactor(factorName)
    // Filter incidents that mention this factor (simple text match)
    const keywordsLower = keywords.map(k => k.toLowerCase())
    const factorIncidents = categoryIncidents.filter(i => {
      if (!i.description) return false
      const descLower = i.description.toLowerCase()
      return keywordsLower.some(kw => descLower.includes(kw))
    })
    onFilterByRootCause(factorIncidents.length > 0 ? factorIncidents : categoryIncidents, factorName, keywords)
  }

  // Get friendly category name
  const getCategoryLabel = (type) => {
    const labels = {
      'unsafe-condition': 'Unsafe Condition',
      'unsafe-act': 'Unsafe Act',
      'near-miss': 'Near Miss',
      'positive': 'Positive Observation',
      'ncr': 'Non-Conformance',
      'fatality': 'Fatality',
      'lti': 'Lost Time Injury',
      'mti': 'Medical Treatment Injury',
      'fac': 'First Aid Case',
      'env-major': 'ENV Major/Severe (P1)',
      'env-moderate': 'ENV Moderate (P2)',
      'env-minor': 'ENV Minor (P3)',
      'fire': 'Fire',
      'security': 'Security',
      'dmg-light-vehicle': 'Light Vehicle / MV',
      'dmg-heavy-plant': 'Heavy Plant',
      'dmg-truck-trailer': 'Truck & Trailer',
      'dmg-static-equipment': 'Static Equipment',
      'environmental': 'Environmental',
      'damage-to-property': 'Damage to Property',
      'leadership': 'Leadership Event',
      'emergency-drill': 'Emergency Drill',
      'incident': 'Incident'
    }
    return labels[type] || type?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown'
  }

  // Positive/proactive types don't need root cause analysis or recommendations
  const positiveTypes = ['positive', 'leadership', 'emergency-drill']
  const isPositiveCategory = positiveTypes.includes(categoryType)

  if (!insights.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Info size={24} className="text-surface-400" />
        </div>
        <h3 className="text-base font-semibold text-surface-700 mb-1">No Insights Available</h3>
        <p className="text-sm text-surface-500 text-center max-w-xs">
          Not enough data to generate insights for &quot;{getCategoryLabel(categoryType)}&quot;.
          {categoryIncidents.length === 0 && ' No observations found for this category.'}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${isMobile ? '' : ''}`}>
      {/* Incident Type Breakdown - for aggregate "incident" type */}
      {isIncidentAggregate && (
        <IncidentTypeBreakdown
          incidents={categoryIncidents}
          onTypeClick={handleIncidentTypeClick}
          isMobile={isMobile}
        />
      )}

      {/* Sub-type Breakdown - for Environmental / Damage to Property categories */}
      {subTypeBreakdownConfig && (
        <IncidentTypeBreakdown
          incidents={categoryIncidents}
          subTypes={subTypeBreakdownConfig.subTypes}
          title={subTypeBreakdownConfig.title}
          onTypeClick={handleIncidentTypeClick}
          isMobile={isMobile}
        />
      )}

      {/* Row 1: Action Status (Full Width) */}
      <HazardActionStatus
        actions={insights.actions}
        isMobile={isMobile}
      />

      {/* Row 2: Top Hazards Chart (Full Width) */}
      <CategoryTopHazards
        hazards={insights.topHazards}
        onBarClick={onFilterByHazard ? handleHazardClick : null}
        isMobile={isMobile}
      />

      {/* Row 3: Root Causes + Contractors (hide root causes for positive types) */}
      {isPositiveCategory ? (
        // For positive types, show only contractors (full width)
        <HazardContractorBreakdown
          contractors={insights.contractors}
          isMobile={isMobile}
        />
      ) : (
        // For negative types, show both root causes and contractors
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <HazardRootCauseChart
            rootCauses={insights.rootCauses}
            onBarClick={onFilterByRootCause ? handleRootCauseClick : null}
            isMobile={isMobile}
          />
          <HazardContractorBreakdown
            contractors={insights.contractors}
            isMobile={isMobile}
          />
        </div>
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
            <p>Category: <span className="font-medium text-surface-700">{getCategoryLabel(categoryType)}</span></p>
            <p>Total Observations: <span className="font-medium text-surface-700">{insights.totalCount}</span></p>
            <p>Top Hazard: <span className="font-medium text-surface-700">
              {insights.topHazards[0]?.name || 'N/A'} ({insights.topHazards[0]?.percentage || 0}%)
            </span></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(CategoryInsightsTab)
