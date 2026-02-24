import { memo } from 'react'
import { TrendingUp, TrendingDown, ChevronRight, Zap } from 'lucide-react'

/**
 * AnomalyAlert - Individual anomaly display with severity and context
 */
const AnomalyAlert = ({ anomaly, onClick }) => {
  const {
    dateLabel,
    value,
    zScore,
    type,
    severity,
    deviation,
    method,
    confirmedBy,
    incidents
  } = anomaly

  const isSpike = type === 'spike'

  const getConfig = () => {
    if (severity === 'high') {
      return {
        bg: isSpike ? 'bg-safety-critical-light' : 'bg-blue-50',
        border: isSpike ? 'border-safety-critical/30' : 'border-blue-300',
        iconBg: isSpike ? 'bg-safety-critical/10' : 'bg-blue-100',
        iconColor: isSpike ? 'text-safety-critical' : 'text-blue-600',
        textColor: isSpike ? 'text-safety-critical' : 'text-blue-700',
        badge: 'bg-safety-critical text-white'
      }
    }
    return {
      bg: isSpike ? 'bg-amber-50' : 'bg-sky-50',
      border: isSpike ? 'border-amber-200' : 'border-sky-200',
      iconBg: isSpike ? 'bg-amber-100' : 'bg-sky-100',
      iconColor: isSpike ? 'text-amber-600' : 'text-sky-600',
      textColor: isSpike ? 'text-amber-700' : 'text-sky-700',
      badge: 'bg-amber-500 text-white'
    }
  }

  const config = getConfig()
  const Icon = isSpike ? TrendingUp : TrendingDown

  return (
    <div
      className={`p-3 rounded-lg border ${config.bg} ${config.border} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-1.5 rounded-full ${config.iconBg} flex-shrink-0`}>
          <Icon size={16} className={config.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-surface-800">
              {dateLabel}
            </span>
            {severity === 'high' && (
              <span className={`px-1.5 py-0.5 text-2xs font-bold rounded ${config.badge}`}>
                HIGH
              </span>
            )}
            {confirmedBy === 'both' && (
              <span className="px-1.5 py-0.5 text-2xs font-medium bg-purple-100 text-purple-700 rounded flex items-center gap-0.5">
                <Zap size={10} />
                Confirmed
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <span className={`text-lg font-bold ${config.textColor}`}>
              {value} observations
            </span>
            <span className="text-xs text-surface-500">
              {isSpike ? '+' : ''}{deviation}% from average
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-500">
            {zScore && (
              <span>
                Z-score: <strong className="text-surface-700">{zScore}</strong>
              </span>
            )}
            {method && (
              <span className="capitalize">
                Method: {method === 'z-score' ? 'Z-Score' : 'IQR'}
              </span>
            )}
            {incidents && incidents.length > 0 && (
              <span>
                {incidents.length} incident{incidents.length !== 1 ? 's' : ''} recorded
              </span>
            )}
          </div>

          {/* Sample incidents */}
          {incidents && incidents.length > 0 && (
            <div className="mt-2 pt-2 border-t border-surface-200/50">
              <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                Sample Incidents
              </p>
              <div className="space-y-1">
                {incidents.slice(0, 2).map((inc, idx) => (
                  <p key={idx} className="text-xs text-surface-600 truncate">
                    {inc.location || inc.type || 'Observation'} - {inc.contractor || 'Unknown'}
                  </p>
                ))}
                {incidents.length > 2 && (
                  <p className="text-xs text-surface-400">
                    +{incidents.length - 2} more...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Arrow if clickable */}
        {onClick && (
          <ChevronRight size={16} className="text-surface-400 flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

export default memo(AnomalyAlert)
