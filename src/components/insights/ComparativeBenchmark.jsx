import React, { useState } from 'react'
import { Trophy, Medal, AlertTriangle, ChevronUp, ChevronDown, Minus } from 'lucide-react'

/**
 * ComparativeBenchmark - Contractor performance comparison table
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

  const { rankings, topPerformers, laggards, average } = data

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

  const getRankBadge = (rank) => {
    if (rank === 1) return <Trophy size={16} className="text-amber-500" />
    if (rank === 2) return <Medal size={16} className="text-gray-400" />
    if (rank === 3) return <Medal size={16} className="text-amber-700" />
    return <span className="text-xs font-medium text-surface-500">#{rank}</span>
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-safety-success'
    if (score >= 50) return 'text-safety-warning'
    return 'text-safety-critical'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-safety-success-light'
    if (score >= 50) return 'bg-safety-warning-light'
    return 'bg-safety-critical-light'
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
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-amber-500" />
            <span className="text-xs font-semibold text-surface-600 uppercase">Top Performers</span>
          </div>
          <div className="space-y-1">
            {topPerformers.slice(0, 3).map((c, idx) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="text-surface-700 truncate">{c.name}</span>
                <span className="font-bold text-amber-600">{c.compositeScore}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-surface-50 rounded-lg border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Minus size={18} className="text-surface-500" />
            <span className="text-xs font-semibold text-surface-600 uppercase">Average Score</span>
          </div>
          <p className="text-2xl font-bold text-surface-700">{average}%</p>
          <p className="text-xs text-surface-500 mt-1">{rankings.length} contractors</p>
        </div>

        <div className="p-4 bg-safety-critical-light rounded-lg border border-safety-critical/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-safety-critical" />
            <span className="text-xs font-semibold text-surface-600 uppercase">Need Attention</span>
          </div>
          <p className="text-2xl font-bold text-safety-critical">{laggards.length}</p>
          <p className="text-xs text-surface-500 mt-1">Contractors below 50%</p>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50 border-y border-surface-200">
            <tr>
              <th className="px-3 py-2 text-left text-2xs font-semibold text-surface-600 uppercase tracking-wide w-12">
                Rank
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
            {sortedRankings.map((contractor) => (
              <tr
                key={contractor.name}
                className={`hover:bg-surface-50 transition-colors ${
                  contractor.compositeScore < 50 ? 'bg-safety-critical-light/30' : ''
                }`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-center w-6 h-6">
                    {getRankBadge(contractor.rank)}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-sm font-medium text-surface-800 truncate block max-w-[200px]">
                    {contractor.name}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getScoreBg(contractor.compositeScore)} ${getScoreColor(contractor.compositeScore)}`}>
                    {contractor.compositeScore}%
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          contractor.qualityScore >= 70 ? 'bg-safety-success' :
                          contractor.qualityScore >= 50 ? 'bg-safety-warning' :
                          'bg-safety-critical'
                        }`}
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
                  <span className={`text-xs ${
                    contractor.nearMissRate >= 5 ? 'text-safety-success font-medium' :
                    contractor.nearMissRate >= 2 ? 'text-safety-warning' :
                    'text-safety-critical'
                  }`}>
                    {contractor.nearMissRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-surface-600">{contractor.totalObs}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-surface-500 pt-2 border-t border-surface-200">
        <span>Score colors:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-safety-success"></span>
          70%+ Good
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-safety-warning"></span>
          50-69% Warning
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-safety-critical"></span>
          &lt;50% Critical
        </span>
      </div>
    </div>
  )
}

export default React.memo(ComparativeBenchmark)
