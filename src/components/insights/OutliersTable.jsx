import React from 'react'
import { AlertTriangle, Users, ChevronRight } from 'lucide-react'

/**
 * OutliersTable - Table showing contractors/reporters below quality threshold
 */
const OutliersTable = ({ data, onRowClick }) => {
  if (!data || data.outliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="w-12 h-12 rounded-full bg-safety-success-light flex items-center justify-center mb-3">
          <Users size={24} className="text-safety-success" />
        </div>
        <p className="text-sm font-medium text-surface-700">All Performers Above Threshold</p>
        <p className="text-xs text-surface-500 mt-1">
          No contractors or reporters below the 50% quality threshold
        </p>
      </div>
    )
  }

  const { outliers, criticalCount, warningCount } = data

  const statusColors = {
    critical: {
      bg: 'bg-safety-critical-light',
      text: 'text-safety-critical',
      badge: 'bg-safety-critical'
    },
    warning: {
      bg: 'bg-safety-warning-light',
      text: 'text-safety-warning',
      badge: 'bg-safety-warning'
    },
    attention: {
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      badge: 'bg-primary-500'
    }
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-surface-50 rounded-lg">
        <AlertTriangle size={20} className="text-safety-warning" />
        <div className="text-sm">
          <span className="font-semibold">{outliers.length}</span> performer{outliers.length !== 1 ? 's' : ''} below threshold
          {criticalCount > 0 && (
            <span className="text-safety-critical ml-2">
              ({criticalCount} critical)
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left py-2 px-3 font-semibold text-surface-600">
                Contractor
              </th>
              <th className="text-center py-2 px-3 font-semibold text-surface-600">
                Score
              </th>
              <th className="text-center py-2 px-3 font-semibold text-surface-600">
                Obs.
              </th>
              <th className="text-center py-2 px-3 font-semibold text-surface-600 hidden sm:table-cell">
                Cat. Rate
              </th>
              <th className="text-center py-2 px-3 font-semibold text-surface-600 hidden sm:table-cell">
                Quality Rate
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {outliers.map((outlier, idx) => {
              const colors = statusColors[outlier.status] || statusColors.attention
              return (
                <tr
                  key={outlier.name}
                  className={`
                    border-b border-surface-100 cursor-pointer
                    hover:bg-surface-50 transition-colors
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50/30'}
                  `}
                  onClick={() => onRowClick?.(outlier)}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors.badge}`} />
                      <span className="font-medium text-surface-700 truncate max-w-[150px]">
                        {outlier.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-bold ${colors.text}`}>
                      {outlier.score}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-surface-600">
                    {outlier.observations}
                  </td>
                  <td className="py-2.5 px-3 text-center text-surface-600 hidden sm:table-cell">
                    {outlier.categorizationRate}%
                  </td>
                  <td className="py-2.5 px-3 text-center text-surface-600 hidden sm:table-cell">
                    {outlier.qualityRate}%
                  </td>
                  <td className="py-2.5 px-1">
                    <ChevronRight size={16} className="text-surface-400" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-safety-critical" />
          <span>Critical (&lt;30%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-safety-warning" />
          <span>Warning (30-40%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary-500" />
          <span>Attention (40-50%)</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(OutliersTable)
