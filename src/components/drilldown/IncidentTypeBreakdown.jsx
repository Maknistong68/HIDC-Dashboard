import React, { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { INCIDENT_SUB_TYPES } from '../../utils/constants'

/**
 * IncidentTypeBreakdown - Shows breakdown of incident sub-types
 * LTI, MTI, FAC, Property Damage, Environmental, Security
 */
const IncidentTypeBreakdown = ({ incidents = [], onTypeClick, isMobile = false }) => {
  // Calculate counts for each sub-type
  const breakdown = useMemo(() => {
    const counts = {}
    INCIDENT_SUB_TYPES.forEach(({ key }) => {
      counts[key] = 0
    })
    incidents.forEach(i => {
      if (counts[i.type] !== undefined) {
        counts[i.type]++
      }
    })
    return counts
  }, [incidents])

  // Total incidents
  const total = incidents.length

  // Get sub-types that have data
  const activeTypes = INCIDENT_SUB_TYPES.filter(({ key }) => breakdown[key] > 0)

  if (activeTypes.length === 0) {
    return null
  }

  return (
    <div className="bg-white/80 rounded-xl border border-surface-200/50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-red-500" />
        <h4 className="text-sm font-semibold text-surface-800">Incident Type Breakdown</h4>
        <span className="text-xs text-surface-500 ml-auto">{total} total</span>
      </div>

      {/* Breakdown Grid */}
      <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {INCIDENT_SUB_TYPES.map(({ key, label, color }) => {
          const count = breakdown[key]
          const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0

          return (
            <button
              key={key}
              onClick={() => onTypeClick && onTypeClick(key, label)}
              disabled={count === 0}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-lg
                border transition-all
                ${count > 0
                  ? 'bg-white hover:bg-surface-50 border-surface-200 cursor-pointer hover:shadow-sm'
                  : 'bg-surface-50 border-surface-100 cursor-default opacity-50'
                }
              `}
            >
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full mb-1.5"
                style={{ backgroundColor: count > 0 ? color : '#d1d5db' }}
              />

              {/* Count */}
              <span
                className="text-xl font-bold tabular-nums"
                style={{ color: count > 0 ? color : '#9ca3af' }}
              >
                {count}
              </span>

              {/* Label */}
              <span className="text-xs font-medium text-surface-600 mt-0.5">
                {label}
              </span>

              {/* Percentage bar */}
              {count > 0 && (
                <div className="w-full h-1 bg-surface-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              )}

              {/* Percentage label */}
              {count > 0 && (
                <span className="text-[10px] text-surface-400 mt-1">
                  {percentage}%
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Hint */}
      <p className="text-[10px] text-surface-400 text-center mt-3">
        Click a type to filter records
      </p>
    </div>
  )
}

export default React.memo(IncidentTypeBreakdown)
