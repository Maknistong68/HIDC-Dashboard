import React, { useState } from 'react'
import { CheckCircle, ArrowUpCircle, HelpCircle, ChevronUp, ChevronDown, Info } from 'lucide-react'

/**
 * ComparativeBenchmark - Contractor performance comparison table
 *
 * DESIGN PRINCIPLES (Non-Bias Representation):
 * 1. NO gamification (trophies, medals, rankings) - avoids stigmatization hierarchy
 * 2. Performance BANDS instead of rankings - focus on standards, not competition
 * 3. Neutral language: "Support Needed" not "Poor", "Developing" not "Below Average"
 * 4. Equal visual treatment for all contractors - no row highlighting based on score
 *
 * PERFORMANCE BANDS:
 * - Meeting Standards (70%+): Contractor meets or exceeds quality expectations
 * - Developing (50-69%): Contractor is progressing, may benefit from support
 * - Support Needed (<50%): Contractor requires additional resources/training
 */
const ComparativeBenchmark = ({ data }) => {
  const [sortBy, setSortBy] = useState('compositeScore')
  const [sortOrder, setSortOrder] = useState('desc')

  if (!data || !data.hasData) {
    return (
      <div className="p-6 bg-surface-50 rounded-lg border border-surface-200 text-center">
        <p className="text-sm text-surface-500">No contractor data available for benchmarking</p>
      </div>
    )
  }

  const { rankings, average } = data

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedRankings = [...rankings].sort((a, b) => {
    const aVal = a[sortBy] || 0
    const bVal = b[sortBy] || 0
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  /**
   * Get performance band based on score
   * Returns neutral, action-oriented classification
   */
  const getPerformanceBand = (score) => {
    if (score >= 70) {
      return {
        label: 'Meeting Standards',
        shortLabel: 'Standards',
        icon: CheckCircle,
        iconColor: 'text-teal-600',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
        textColor: 'text-teal-700'
      }
    }
    if (score >= 50) {
      return {
        label: 'Developing',
        shortLabel: 'Developing',
        icon: ArrowUpCircle,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      }
    }
    return {
      label: 'Support Needed',
      shortLabel: 'Support',
      icon: HelpCircle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700'
    }
  }

  // Group contractors by performance band
  const bandCounts = {
    meetingStandards: rankings.filter(c => c.compositeScore >= 70).length,
    developing: rankings.filter(c => c.compositeScore >= 50 && c.compositeScore < 70).length,
    supportNeeded: rankings.filter(c => c.compositeScore < 50).length
  }

  const SortHeader = ({ field, label }) => (
    <th
      className="px-3 py-2 text-left text-2xs font-semibold text-surface-600 uppercase tracking-wide cursor-pointer hover:bg-surface-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === field && (
          sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
        )}
      </div>
    </th>
  )

  return (
    <div className="space-y-4">
      {/* Summary Cards - Using performance bands, not rankings */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-teal-600" />
            <span className="text-xs font-semibold text-surface-600 uppercase">Meeting Standards</span>
          </div>
          <p className="text-2xl font-bold text-teal-700">{bandCounts.meetingStandards}</p>
          <p className="text-xs text-surface-500 mt-1">Contractors at 70%+</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle size={18} className="text-blue-600" />
            <span className="text-xs font-semibold text-surface-600 uppercase">Developing</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{bandCounts.developing}</p>
          <p className="text-xs text-surface-500 mt-1">Contractors at 50-69%</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle size={18} className="text-amber-600" />
            <span className="text-xs font-semibold text-surface-600 uppercase">Support Needed</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{bandCounts.supportNeeded}</p>
          <p className="text-xs text-surface-500 mt-1">Contractors below 50%</p>
        </div>
      </div>

      {/* Average indicator */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-50 rounded-lg border border-surface-200">
        <Info size={14} className="text-surface-500" />
        <span className="text-xs text-surface-600">
          Average score across {rankings.length} contractors: <span className="font-bold">{average}%</span>
        </span>
      </div>

      {/* Performance Table - No ranking column, equal visual treatment */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50 border-y border-surface-200">
            <tr>
              <th className="px-3 py-2 text-left text-2xs font-semibold text-surface-600 uppercase tracking-wide w-24">
                Band
              </th>
              <SortHeader field="name" label="Contractor" />
              <SortHeader field="compositeScore" label="Score" />
              <SortHeader field="qualityScore" label="Quality" />
              <SortHeader field="proactiveRatio" label="Proactive" />
              <SortHeader field="nearMissRate" label="Near-Miss %" />
              <SortHeader field="totalObs" label="Observations" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {sortedRankings.map((contractor) => {
              const band = getPerformanceBand(contractor.compositeScore)
              const BandIcon = band.icon

              return (
                <tr
                  key={contractor.name}
                  className="hover:bg-surface-50 transition-colors"
                  // Removed conditional row highlighting - equal visual treatment
                >
                  <td className="px-3 py-2.5">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${band.bgColor} border ${band.borderColor}`}>
                      <BandIcon size={12} className={band.iconColor} />
                      <span className={`text-2xs font-medium ${band.textColor}`}>
                        {band.shortLabel}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm font-medium text-surface-800 truncate block max-w-[200px]">
                      {contractor.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${band.bgColor} ${band.textColor}`}>
                      {contractor.compositeScore}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-surface-500"
                          style={{ width: `${contractor.qualityScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-surface-600">{contractor.qualityScore}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-surface-700">
                      {contractor.proactiveRatio.toFixed(1)}:1
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-surface-700">
                      {contractor.nearMissRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-surface-600">{contractor.totalObs}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend - Using neutral performance band descriptions */}
      <div className="flex items-center gap-6 text-xs text-surface-500 pt-2 border-t border-surface-200">
        <span>Performance bands:</span>
        <span className="flex items-center gap-1">
          <CheckCircle size={12} className="text-teal-600" />
          Meeting Standards (70%+)
        </span>
        <span className="flex items-center gap-1">
          <ArrowUpCircle size={12} className="text-blue-600" />
          Developing (50-69%)
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle size={12} className="text-amber-600" />
          Support Needed (&lt;50%)
        </span>
      </div>
    </div>
  )
}

export default React.memo(ComparativeBenchmark)
