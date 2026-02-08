import React from 'react'
import { CheckCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react'

/**
 * HazardActionStatus - Shows action counts, closure rate, and overdue alerts
 */
const HazardActionStatus = ({ actions, isMobile = false }) => {
  if (!actions) {
    return (
      <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Action Status</span>
        </div>
        <p className="text-sm text-surface-400 text-center py-4">No action data available</p>
      </div>
    )
  }

  const { open, inProgress, closed, total, closureRate, overdueCount } = actions

  // Determine closure rate status
  const closureStatus = closureRate >= 80 ? 'good' : closureRate >= 50 ? 'warning' : 'critical'
  const closureConfig = {
    good: { color: 'text-green-600', bg: 'bg-green-100' },
    warning: { color: 'text-amber-600', bg: 'bg-amber-100' },
    critical: { color: 'text-red-600', bg: 'bg-red-100' }
  }

  return (
    <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${closureConfig[closureStatus].bg}`}>
            <CheckCircle size={16} className={closureConfig[closureStatus].color} />
          </div>
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Action Status</span>
        </div>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1 text-2xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            <AlertTriangle size={10} />
            {overdueCount} overdue
          </span>
        )}
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Open */}
        <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertCircle size={12} className="text-red-500" />
            <span className="text-2xs font-medium text-red-600">Open</span>
          </div>
          <span className="text-lg font-bold text-red-700">{open}</span>
        </div>

        {/* In Progress */}
        <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={12} className="text-amber-500" />
            <span className="text-2xs font-medium text-amber-600">In Progress</span>
          </div>
          <span className="text-lg font-bold text-amber-700">{inProgress}</span>
        </div>

        {/* Closed */}
        <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle size={12} className="text-green-500" />
            <span className="text-2xs font-medium text-green-600">Closed</span>
          </div>
          <span className="text-lg font-bold text-green-700">{closed}</span>
        </div>
      </div>

      {/* Closure Rate Bar */}
      <div className="pt-3 border-t border-surface-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-surface-600">Closure Rate</span>
          <span className={`text-sm font-bold ${closureConfig[closureStatus].color}`}>
            {closureRate}%
          </span>
        </div>
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              closureStatus === 'good' ? 'bg-green-500' :
              closureStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${closureRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-2xs text-surface-400">
            {closed} of {total} resolved
          </span>
          <span className="text-2xs text-surface-400">
            {closureRate >= 80 ? 'On track' : closureRate >= 50 ? 'Needs attention' : 'Action required'}
          </span>
        </div>
      </div>

      {/* Overdue Warning */}
      {overdueCount > 0 && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">
              <span className="font-medium">{overdueCount} action{overdueCount > 1 ? 's' : ''}</span>
              {' '}open for more than 30 days. Prioritize resolution to reduce risk.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(HazardActionStatus)
