import React, { useMemo } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { HAZARD_RECOMMENDED_ACTIONS } from '../../utils/constants'

/**
 * HazardSpecificActions - Horizontal scrollable pill buttons for hazard-specific recommendations
 *
 * Shows top recommended interventions for the selected hazard(s).
 * Click to apply that specific intervention.
 */
const HazardSpecificActions = ({
  selectedHazards = [],
  onApplyAction,
  appliedActions = {},
  maxRecommendations = 6
}) => {
  // Aggregate recommendations across all selected hazards
  const recommendations = useMemo(() => {
    if (selectedHazards.length === 0) return []

    // Collect all recommendations with hazard context
    const allRecs = []

    for (const hazardName of selectedHazards) {
      const hazardRecs = HAZARD_RECOMMENDED_ACTIONS[hazardName]
      if (!hazardRecs) continue

      hazardRecs.forEach(rec => {
        // Check if already added (by factor)
        const existing = allRecs.find(r => r.factor === rec.factor)
        if (existing) {
          // Merge - use highest effect and combine hazards
          existing.effect = Math.max(existing.effect, rec.effect)
          if (!existing.hazards.includes(hazardName)) {
            existing.hazards.push(hazardName)
          }
          // Upgrade priority if needed
          if (rec.priority === 'high' && existing.priority !== 'high') {
            existing.priority = 'high'
          }
        } else {
          allRecs.push({
            ...rec,
            hazards: [hazardName]
          })
        }
      })
    }

    // Sort by: priority (high first), then effect (descending)
    return allRecs
      .sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1
        if (b.priority === 'high' && a.priority !== 'high') return 1
        return b.effect - a.effect
      })
      .slice(0, maxRecommendations)
  }, [selectedHazards, maxRecommendations])

  // Scroll container ref for manual scrolling
  const scrollRef = React.useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (recommendations.length === 0) {
    return null
  }

  // Get primary hazard name for display
  const primaryHazard = selectedHazards.length === 1
    ? selectedHazards[0]
    : `${selectedHazards.length} Hazards`

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-500" />
          <span className="text-xs font-medium text-surface-600">
            Recommended for {primaryHazard}
          </span>
        </div>

        {/* Scroll controls (show only if scrollable) */}
        {recommendations.length > 4 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Pills Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-transparent pb-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {recommendations.map((rec, index) => {
          const isApplied = appliedActions[rec.factor.toLowerCase()] > 0
          const priorityColor = rec.priority === 'high'
            ? 'border-amber-300 bg-amber-50'
            : 'border-surface-200 bg-surface-50'

          return (
            <button
              key={`${rec.factor}-${index}`}
              type="button"
              onClick={() => onApplyAction(rec.factor, rec.effect)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isApplied
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : `${priorityColor} text-surface-700 hover:border-primary-400 hover:bg-primary-50`
              }`}
              title={`${rec.action} (+${rec.effect}% effect) - ${rec.hazards.join(', ')}`}
            >
              {/* Action name (truncated) */}
              <span className="max-w-[120px] truncate">
                {rec.action}
              </span>

              {/* Effect badge */}
              <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                isApplied
                  ? 'bg-green-200 text-green-800'
                  : rec.priority === 'high'
                    ? 'bg-amber-200 text-amber-800'
                    : 'bg-surface-200 text-surface-600'
              }`}>
                +{rec.effect}%
              </span>

              {/* Multi-hazard indicator */}
              {rec.hazards.length > 1 && (
                <span className="text-2xs text-surface-400" title={rec.hazards.join(', ')}>
                  ({rec.hazards.length})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Applied count */}
      {Object.values(appliedActions).filter(v => v > 0).length > 0 && (
        <p className="text-2xs text-surface-400">
          {Object.values(appliedActions).filter(v => v > 0).length} recommendations applied
        </p>
      )}
    </div>
  )
}

export default React.memo(HazardSpecificActions)
