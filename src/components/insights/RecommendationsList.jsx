import React from 'react'
import { CheckCircle2, Lightbulb } from 'lucide-react'
import RecommendationCard from './RecommendationCard'

/**
 * RecommendationsList - Container for all recommendations
 * Shows priority-ordered list of action items
 */
const RecommendationsList = ({ recommendations, onItemClick }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-safety-success-light flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-safety-success" />
        </div>
        <h3 className="font-semibold text-surface-800 mb-2">All Clear!</h3>
        <p className="text-sm text-surface-500 max-w-xs">
          No actionable recommendations at this time. Your HSE performance metrics are within acceptable ranges.
        </p>
      </div>
    )
  }

  const highPriority = recommendations.filter(r => r.priority === 'HIGH')
  const mediumPriority = recommendations.filter(r => r.priority === 'MEDIUM')
  const lowPriority = recommendations.filter(r => r.priority === 'LOW')

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center gap-3 p-3 bg-surface-100 rounded-lg">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Lightbulb size={20} className="text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-surface-700">
            {recommendations.length} Action Item{recommendations.length !== 1 ? 's' : ''} Identified
          </p>
          <p className="text-xs text-surface-500">
            {highPriority.length > 0 && `${highPriority.length} high priority`}
            {highPriority.length > 0 && mediumPriority.length > 0 && ', '}
            {mediumPriority.length > 0 && `${mediumPriority.length} medium`}
            {(highPriority.length > 0 || mediumPriority.length > 0) && lowPriority.length > 0 && ', '}
            {lowPriority.length > 0 && `${lowPriority.length} low`}
          </p>
        </div>
      </div>

      {/* High Priority */}
      {highPriority.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide px-1">
            Requires Immediate Attention
          </h4>
          <div className="space-y-2">
            {highPriority.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority */}
      {mediumPriority.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide px-1">
            Monitor Closely
          </h4>
          <div className="space-y-2">
            {mediumPriority.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority */}
      {lowPriority.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide px-1">
            For Your Information
          </h4>
          <div className="space-y-2">
            {lowPriority.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(RecommendationsList)
