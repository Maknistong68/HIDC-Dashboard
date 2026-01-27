import React from 'react'
import {
  AlertTriangle,
  Users,
  Moon,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react'

/**
 * RecommendationCard - Action item display with priority
 * Features: Priority badge, specific metric, action button
 */
const RecommendationCard = ({ recommendation, onClick }) => {
  const {
    priority,
    title,
    message,
    details,
    metric,
    icon,
    actionLabel,
    type
  } = recommendation

  const priorityColors = {
    HIGH: {
      bg: 'bg-safety-critical-light',
      border: 'border-safety-critical/30',
      badge: 'bg-safety-critical text-white',
      text: 'text-safety-critical',
      hover: 'hover:border-safety-critical/50'
    },
    MEDIUM: {
      bg: 'bg-safety-warning-light',
      border: 'border-safety-warning/30',
      badge: 'bg-safety-warning text-white',
      text: 'text-safety-warning',
      hover: 'hover:border-safety-warning/50'
    },
    LOW: {
      bg: 'bg-safety-info-light',
      border: 'border-safety-info/30',
      badge: 'bg-safety-info text-white',
      text: 'text-safety-info',
      hover: 'hover:border-safety-info/50'
    }
  }

  const icons = {
    AlertTriangle,
    Users,
    Moon,
    Calendar,
    TrendingUp,
    Clock,
    AlertCircle
  }

  const colors = priorityColors[priority] || priorityColors.LOW
  const Icon = icons[icon] || AlertCircle

  return (
    <div
      className={`
        relative p-4 rounded-lg border transition-all duration-200 cursor-pointer
        ${colors.bg} ${colors.border} ${colors.hover}
        hover:shadow-md active:scale-[0.99]
      `}
      onClick={() => onClick?.(recommendation)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(recommendation)}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            <Icon size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                {priority}
              </span>
              <span className="text-2xs font-medium text-surface-500 uppercase">
                {type.replace('-', ' ')}
              </span>
            </div>

            <h4 className="font-semibold text-surface-800 text-sm">
              {title}
            </h4>

            <p className="text-sm text-surface-600 mt-1">
              {message}
            </p>

            {details && (
              <p className="text-xs text-surface-500 mt-1 truncate">
                {details}
              </p>
            )}
          </div>
        </div>

        {/* Metric & Arrow */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {metric && (
            <span className={`text-lg font-bold ${colors.text}`}>
              {metric}
            </span>
          )}
          <ChevronRight size={20} className="text-surface-400" />
        </div>
      </div>

      {/* Action Button */}
      {actionLabel && (
        <div className="mt-3 pt-3 border-t border-surface-200/50">
          <span className={`text-xs font-semibold ${colors.text}`}>
            {actionLabel}
          </span>
        </div>
      )}
    </div>
  )
}

export default React.memo(RecommendationCard)
