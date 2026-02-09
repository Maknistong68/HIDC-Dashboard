import React from 'react'
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * NearMissGauge - Gauge visualization for near-miss compliance
 *
 * NEW: Shows count-based compliance (% of site-months meeting 2/month target)
 * instead of percentage-based rate comparison
 */
const NearMissGauge = ({ data }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Target size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">No data available</p>
      </div>
    )
  }

  const {
    complianceRate,
    complianceGaugePercent,
    sitesMetTarget,
    totalSiteMonths,
    siteMonthTarget,
    targetPerSitePerMonth,
    status,
    message,
    count,
    total,
    isCompliant
  } = data

  // Use complianceRate directly (already 0-100)
  const displayRate = parseFloat(complianceRate || complianceGaugePercent || 0)
  const target = targetPerSitePerMonth || siteMonthTarget || 2

  // Gauge colors based on status
  const statusColors = {
    good: {
      gauge: 'bg-safety-success',
      text: 'text-safety-success',
      bg: 'bg-safety-success-light'
    },
    warning: {
      gauge: 'bg-safety-warning',
      text: 'text-safety-warning',
      bg: 'bg-safety-warning-light'
    },
    critical: {
      gauge: 'bg-safety-critical',
      text: 'text-safety-critical',
      bg: 'bg-safety-critical-light'
    }
  }

  const colors = statusColors[status] || statusColors.warning

  // Calculate gauge angle (180 degree semi-circle) - compliance is 0-100%
  const gaugeAngle = (displayRate / 100) * 180

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border-[20px] border-surface-200"
          style={{
            clipPath: 'inset(50% 0 0 0)'
          }}
        />

        {/* Progress arc */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border-[20px] ${colors.gauge} origin-bottom transition-transform duration-700`}
          style={{
            clipPath: 'inset(50% 0 0 0)',
            transform: `rotate(${gaugeAngle - 180}deg)`
          }}
        />

        {/* Target line at 80% (good threshold) */}
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-24 bg-surface-800 origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${(80 / 100) * 180 - 90}deg)`
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-800 rotate-45" />
        </div>

        {/* Center circle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center translate-y-1/2">
          <div className="text-center">
            <p className={`text-xl font-bold ${colors.text}`}>{displayRate.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between w-48 -mt-2 text-xs text-surface-500">
        <span>0%</span>
        <span className="font-semibold">Target: 80%</span>
        <span>100%</span>
      </div>

      {/* Status message */}
      <div className={`mt-4 p-3 rounded-lg w-full ${colors.bg}`}>
        <div className="flex items-center gap-2">
          {status === 'good' ? (
            <CheckCircle size={16} className={colors.text} />
          ) : status === 'critical' ? (
            <AlertTriangle size={16} className={colors.text} />
          ) : (
            <TrendingDown size={16} className={colors.text} />
          )}
          <p className={`text-sm font-medium ${colors.text}`}>
            {isCompliant ? 'Meeting Compliance Target' : 'Below Compliance Target'}
          </p>
        </div>
        <p className="text-xs text-surface-600 mt-1">{message}</p>
      </div>

      {/* Stats - show site-month breakdown */}
      <div className="mt-3 flex flex-col items-center gap-1 text-xs text-surface-500">
        <span className="font-medium">
          {sitesMetTarget || 0} of {totalSiteMonths || 0} site-months meet target
        </span>
        <span className="text-surface-400">
          Target: {target} near-misses per site per month
        </span>
        <span className="text-surface-400">
          {count} total near-misses | {total} observations
        </span>
      </div>
    </div>
  )
}

export default React.memo(NearMissGauge)
