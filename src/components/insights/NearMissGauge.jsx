import React from 'react'
import { Target, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

/**
 * NearMissGauge - Gauge visualization comparing near-miss rate to benchmark
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
    rateValue,
    benchmark,
    gaugePercent,
    status,
    message,
    count,
    total,
    isAboveBenchmark
  } = data

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

  // Calculate gauge angle (180 degree semi-circle)
  const gaugeAngle = Math.min(gaugePercent, 150) * 1.2 // Max 180 degrees

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

        {/* Benchmark line */}
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-24 bg-surface-800 origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${(benchmark / 10) * 180 - 90}deg)`
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-800 rotate-45" />
        </div>

        {/* Center circle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center translate-y-1/2">
          <div className="text-center">
            <p className={`text-xl font-bold ${colors.text}`}>{rateValue}%</p>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between w-48 -mt-2 text-xs text-surface-500">
        <span>0%</span>
        <span className="font-semibold">Target: {benchmark}%</span>
        <span>10%</span>
      </div>

      {/* Status message */}
      <div className={`mt-4 p-3 rounded-lg w-full ${colors.bg}`}>
        <div className="flex items-center gap-2">
          {status === 'good' ? (
            <TrendingUp size={16} className={colors.text} />
          ) : status === 'critical' ? (
            <AlertTriangle size={16} className={colors.text} />
          ) : (
            <TrendingDown size={16} className={colors.text} />
          )}
          <p className={`text-sm font-medium ${colors.text}`}>
            {isAboveBenchmark ? 'Above' : 'Below'} Industry Benchmark
          </p>
        </div>
        <p className="text-xs text-surface-600 mt-1">{message}</p>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-500">
        <span>{count} near misses</span>
        <span className="text-surface-300">|</span>
        <span>{total} total observations</span>
      </div>
    </div>
  )
}

export default React.memo(NearMissGauge)
