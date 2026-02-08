import React from 'react'
import {
  Lightbulb,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react'

/**
 * Icon mapping for recommendation types
 */
const getIcon = (iconName) => {
  const icons = {
    AlertTriangle,
    Clock,
    Target,
    TrendingUp,
    Calendar,
    Users
  }
  return icons[iconName] || Lightbulb
}

/**
 * Priority badge styling
 */
const priorityConfig = {
  HIGH: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  LOW: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' }
}

/**
 * Color mapping for icons
 */
const colorConfig = {
  red: { icon: 'text-red-500', bg: 'bg-red-100' },
  amber: { icon: 'text-amber-500', bg: 'bg-amber-100' },
  blue: { icon: 'text-blue-500', bg: 'bg-blue-100' },
  indigo: { icon: 'text-indigo-500', bg: 'bg-indigo-100' },
  purple: { icon: 'text-purple-500', bg: 'bg-purple-100' },
  green: { icon: 'text-green-500', bg: 'bg-green-100' }
}

/**
 * HazardRecommendations - Actionable insight cards (2-3 max)
 */
const HazardRecommendations = ({ recommendations = [], isMobile = false }) => {
  if (!recommendations.length) {
    return (
      <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Recommendations</span>
        </div>
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
            <Lightbulb size={18} className="text-green-600" />
          </div>
          <p className="text-sm text-green-600 font-medium">No immediate actions needed</p>
          <p className="text-xs text-surface-400 mt-1">This hazard category is well-managed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-amber-500" />
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Actionable Recommendations</span>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-2">
        {recommendations.map((rec) => {
          const Icon = getIcon(rec.icon)
          const pConfig = priorityConfig[rec.priority] || priorityConfig.MEDIUM
          const cConfig = colorConfig[rec.color] || colorConfig.blue

          return (
            <div
              key={rec.id}
              className={`rounded-lg border p-3 ${pConfig.border} ${pConfig.bg} bg-opacity-30`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cConfig.bg}`}>
                  <Icon size={16} className={cConfig.icon} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Priority dot */}
                    <span className={`w-2 h-2 rounded-full ${pConfig.dot}`} />
                    {/* Title */}
                    <h4 className={`text-sm font-semibold ${pConfig.text}`}>
                      {rec.title}
                    </h4>
                  </div>
                  {/* Message */}
                  <p className="text-xs text-surface-600 leading-relaxed">
                    {rec.message}
                  </p>
                </div>

                {/* Priority badge on mobile */}
                {isMobile && (
                  <span className={`text-2xs font-medium px-1.5 py-0.5 rounded ${pConfig.bg} ${pConfig.text}`}>
                    {rec.priority}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <p className="text-2xs text-surface-400 text-center mt-3 pt-3 border-t border-surface-100">
        Recommendations are prioritized based on risk impact and urgency
      </p>
    </div>
  )
}

export default React.memo(HazardRecommendations)
