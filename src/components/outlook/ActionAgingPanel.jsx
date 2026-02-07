import React, { useMemo, useState } from 'react'
import { Clock, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { getOverdueActionAlerts } from '../../utils/insightsCalculations'

const BUCKETS = [
  { id: 'critical', label: '>60 days', alertId: 'overdue-critical', icon: AlertTriangle, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700', badgeColor: 'bg-red-100 text-red-700' },
  { id: 'warning', label: '30-60 days', alertId: 'overdue-warning', icon: Clock, color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700', badgeColor: 'bg-amber-100 text-amber-700' },
  { id: 'attention', label: '14-30 days', alertId: 'overdue-attention', icon: AlertCircle, color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700', badgeColor: 'bg-yellow-100 text-yellow-700' }
]

/**
 * ActionAgingPanel - Displays overdue action buckets with aging distribution
 */
const ActionAgingPanel = ({ filteredIncidents }) => {
  const [expandedBucket, setExpandedBucket] = useState(null)

  const alerts = useMemo(() => {
    if (!filteredIncidents?.length) return []
    return getOverdueActionAlerts(filteredIncidents)
  }, [filteredIncidents])

  const bucketData = useMemo(() => {
    return BUCKETS.map(bucket => {
      const alert = alerts.find(a => a.id === bucket.alertId)
      return {
        ...bucket,
        count: alert?.metric || 0,
        details: alert?.details || '',
        drillDown: alert?.drillDownData || []
      }
    })
  }, [alerts])

  const totalOverdue = bucketData.reduce((sum, b) => sum + b.count, 0)

  if (totalOverdue === 0) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-surface-500" />
          <h3 className="text-sm font-semibold text-surface-800">Action Aging</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
            <Clock size={18} className="text-green-600" />
          </div>
          <p className="text-sm text-green-600 font-medium">No overdue actions</p>
          <p className="text-xs text-surface-400 mt-1">All actions are within acceptable timeframes.</p>
        </div>
      </div>
    )
  }

  // Calculate distribution bar widths
  const maxCount = Math.max(...bucketData.map(b => b.count), 1)

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-surface-600" />
          <h3 className="text-sm font-semibold text-surface-800">Action Aging Analysis</h3>
        </div>
        <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">
          {totalOverdue} overdue
        </span>
      </div>

      {/* Bucket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {bucketData.map((bucket) => {
          const Icon = bucket.icon
          const isExpanded = expandedBucket === bucket.id

          return (
            <button
              key={bucket.id}
              type="button"
              disabled={bucket.count === 0}
              aria-expanded={isExpanded}
              aria-controls={`bucket-details-${bucket.id}`}
              onClick={() => setExpandedBucket(isExpanded ? null : bucket.id)}
              className={`text-left w-full rounded-lg border p-3 transition-colors ${bucket.bgColor} ${bucket.borderColor} ${
                bucket.count > 0 ? 'hover:opacity-80' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className={bucket.textColor} />
                  <span className={`text-xs font-medium ${bucket.textColor}`}>{bucket.label}</span>
                </div>
                {bucket.count > 0 && (
                  isExpanded ? <ChevronUp size={14} className={bucket.textColor} /> : <ChevronDown size={14} className={bucket.textColor} />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${bucket.textColor}`}>{bucket.count}</span>
                <span className="text-xs text-surface-500">{bucket.id === 'critical' ? 'critical' : bucket.id === 'warning' ? 'warning' : 'attention'}</span>
              </div>
              {bucket.details && (
                <p className="text-2xs text-surface-500 mt-1">{bucket.details}</p>
              )}

              {/* Distribution bar */}
              <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    bucket.id === 'critical' ? 'bg-red-500' :
                    bucket.id === 'warning' ? 'bg-amber-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Expanded Drill-Down */}
      {expandedBucket && (
        <div id={`bucket-details-${expandedBucket}`} className="border-t border-surface-100 pt-3">
          <h4 className="text-xs font-semibold text-surface-600 mb-2">
            {bucketData.find(b => b.id === expandedBucket)?.label} Details
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {bucketData
              .find(b => b.id === expandedBucket)
              ?.drillDown.slice(0, 10)
              .map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-surface-50 rounded px-3 py-1.5">
                  <div className="flex-1 min-w-0">
                    <span className="text-surface-700 font-medium truncate block">
                      {item.location || item.hazardCategory || 'Observation'}
                    </span>
                    <span className="text-surface-400 text-2xs">
                      {item.site || ''} {item.contractor ? `- ${item.contractor}` : ''}
                    </span>
                  </div>
                  <span className="text-surface-500 flex-shrink-0 ml-2">
                    {item.age}d old
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(ActionAgingPanel)
