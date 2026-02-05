import React from 'react'
import { HelpCircle, Users, ChevronRight } from 'lucide-react'

/**
 * SupportOpportunitiesTable - Table showing contractors/reporters below quality threshold
 *
 * DESIGN PRINCIPLES (Non-Bias Representation):
 * 1. Renamed from "Outliers" to "Support Opportunities" - focus on assistance, not stigma
 * 2. NO row-level color highlighting - avoids visual stigmatization
 * 3. Subtle left-border indicator instead of full row tinting
 * 4. Neutral language: "Support level" not "status", "Below threshold" not "failing"
 *
 * VISUAL ACCESSIBILITY:
 * - Left border provides visual grouping without judgmental coloring
 * - All text maintains consistent styling regardless of score
 */
const SupportOpportunitiesTable = ({ data, onRowClick }) => {
  if (!data || data.outliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
          <Users size={24} className="text-teal-600" />
        </div>
        <p className="text-sm font-medium text-surface-700">All Contractors Meeting Threshold</p>
        <p className="text-xs text-surface-500 mt-1">
          No contractors currently below the 50% quality threshold
        </p>
      </div>
    )
  }

  const { outliers, criticalCount, warningCount } = data

  /**
   * Support level configuration - neutral, action-oriented
   * Uses left-border color instead of full row highlighting
   */
  const getSupportLevel = (status) => {
    switch (status) {
      case 'critical':
        return {
          label: 'Priority Support',
          borderColor: 'border-l-amber-500',
          textColor: 'text-amber-700',
          dotColor: 'bg-amber-500'
        }
      case 'warning':
        return {
          label: 'Additional Support',
          borderColor: 'border-l-blue-500',
          textColor: 'text-blue-700',
          dotColor: 'bg-blue-500'
        }
      default: // attention
        return {
          label: 'Monitor',
          borderColor: 'border-l-slate-400',
          textColor: 'text-slate-600',
          dotColor: 'bg-slate-400'
        }
    }
  }

  return (
    <div>
      {/* Summary - Neutral language */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-surface-50 rounded-lg">
        <HelpCircle size={20} className="text-blue-600" />
        <div className="text-sm">
          <span className="font-semibold">{outliers.length}</span> contractor{outliers.length !== 1 ? 's' : ''} may benefit from support
          {criticalCount > 0 && (
            <span className="text-amber-600 ml-2">
              ({criticalCount} priority)
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
              const supportLevel = getSupportLevel(outlier.status)
              return (
                <tr
                  key={outlier.name}
                  className={`
                    border-b border-surface-100 cursor-pointer
                    hover:bg-surface-50 transition-colors
                    border-l-4 ${supportLevel.borderColor}
                  `}
                  onClick={() => onRowClick?.(outlier)}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${supportLevel.dotColor}`} />
                      <span className="font-medium text-surface-700 truncate max-w-[150px]">
                        {outlier.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-bold text-surface-700">
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

      {/* Legend - Neutral support-oriented language */}
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Priority Support (&lt;30%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Additional Support (30-40%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Monitor (40-50%)</span>
        </div>
      </div>
    </div>
  )
}

// Export with both names for backward compatibility
export { SupportOpportunitiesTable }
export default React.memo(SupportOpportunitiesTable)
