import React from 'react'
import { Users, Building2 } from 'lucide-react'

/**
 * HazardContractorBreakdown - Top 5 contractors reporting this hazard
 */
const HazardContractorBreakdown = ({ contractors = [], isMobile = false }) => {
  if (!contractors.length) {
    return (
      <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Users size={16} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Contractor Breakdown</span>
        </div>
        <p className="text-sm text-surface-400 text-center py-4">No contractor data available</p>
      </div>
    )
  }

  // Find max count for bar scaling
  const maxCount = contractors[0]?.count || 1

  // Color palette for contractors
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  return (
    <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-purple-500" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Top Contractors</span>
        </div>
        <span className="text-2xs text-surface-400">{contractors.length} contractor{contractors.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Contractor List */}
      <div className="space-y-2">
        {contractors.map((contractor, index) => {
          const barWidth = (contractor.count / maxCount) * 100
          const color = colors[index % colors.length]

          return (
            <div key={contractor.name} className="relative">
              {/* Background bar */}
              <div
                className="absolute inset-0 rounded-lg opacity-20"
                style={{ backgroundColor: color, width: `${barWidth}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Rank badge */}
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {index + 1}
                  </span>

                  {/* Contractor name */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 size={12} className="text-surface-400 flex-shrink-0" />
                    <span className="text-sm text-surface-700 truncate" title={contractor.name}>
                      {contractor.name}
                    </span>
                  </div>
                </div>

                {/* Count and percentage */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-surface-800">{contractor.count}</span>
                  <span className="text-xs text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded">
                    {contractor.percentage}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top contractor highlight */}
      {contractors.length > 0 && contractors[0].percentage > 30 && (
        <div className="mt-3 pt-3 border-t border-surface-100">
          <p className="text-2xs text-surface-500">
            <span className="font-medium text-surface-700">{contractors[0].name}</span>
            {' '}accounts for {contractors[0].percentage}% of observations in this hazard category.
          </p>
        </div>
      )}
    </div>
  )
}

export default React.memo(HazardContractorBreakdown)
