import React from 'react'
import { AlertTriangle, AlertCircle, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

/**
 * ForecastAlertCard - Displays threshold breach warnings from forecast
 */
const ForecastAlertCard = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-4 bg-safety-success-light rounded-lg border border-safety-success/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-safety-success/10 rounded-full">
            <AlertCircle size={16} className="text-safety-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-safety-success">No Threshold Breaches Forecasted</p>
            <p className="text-xs text-surface-600 mt-0.5">
              Projected incident rates remain within normal range
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getAlertConfig = (type) => {
    switch (type) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bg: 'bg-safety-critical-light',
          border: 'border-safety-critical/20',
          iconBg: 'bg-safety-critical/10',
          iconColor: 'text-safety-critical',
          textColor: 'text-safety-critical'
        }
      case 'warning':
        return {
          icon: AlertCircle,
          bg: 'bg-safety-warning-light',
          border: 'border-safety-warning/20',
          iconBg: 'bg-safety-warning/10',
          iconColor: 'text-safety-warning',
          textColor: 'text-safety-warning'
        }
      case 'trend':
        return {
          icon: TrendingUp,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          textColor: 'text-amber-700'
        }
      default:
        return {
          icon: AlertCircle,
          bg: 'bg-surface-50',
          border: 'border-surface-200',
          iconBg: 'bg-surface-100',
          iconColor: 'text-surface-500',
          textColor: 'text-surface-700'
        }
    }
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const config = getAlertConfig(alert.type)
        const Icon = config.icon

        return (
          <div
            key={`${alert.type}-${alert.message}`}
            className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-full ${config.iconBg} flex-shrink-0`}>
                <Icon size={16} className={config.iconColor} />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${config.textColor}`}>
                  {alert.message}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-surface-600">
                  {alert.daysUntil && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      In {alert.daysUntil} day{alert.daysUntil !== 1 ? 's' : ''}
                    </span>
                  )}

                  {alert.affectedDays && (
                    <span>
                      {alert.affectedDays} day{alert.affectedDays !== 1 ? 's' : ''} affected
                    </span>
                  )}

                  {alert.threshold && (
                    <span>
                      Threshold: {alert.threshold}/day
                    </span>
                  )}

                  {alert.increase && (
                    <span className="flex items-center gap-1">
                      <ArrowRight size={12} />
                      +{alert.increase}% acceleration
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(ForecastAlertCard)
