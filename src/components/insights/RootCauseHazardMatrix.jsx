import { useMemo, memo } from 'react'
import { Table } from 'lucide-react'

/**
 * RootCauseHazardMatrix - Correlation table showing root causes by hazard
 */
const RootCauseHazardMatrix = ({ data, onCellClick }) => {
  const matrix = data?.matrix
  const rootCauses = data?.rootCauses

  // Memoize max count calculation to avoid recalculating on every render
  const maxCount = useMemo(() => {
    if (!matrix || !rootCauses || matrix.length === 0) return 1
    return Math.max(...matrix.flatMap(row => rootCauses.map(rc => row[rc] || 0)))
  }, [matrix, rootCauses])

  if (!data || !data.hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Table size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">
          No correlation data available
        </p>
        <p className="text-xs text-surface-400 mt-1">
          Requires both hazard and root cause data
        </p>
      </div>
    )
  }

  // Get cell color intensity based on count
  const getCellColor = (count, maxCount) => {
    if (count === 0) return 'bg-surface-50'
    const intensity = Math.min((count / maxCount) * 100, 100)
    if (intensity > 75) return 'bg-safety-critical-light text-safety-critical'
    if (intensity > 50) return 'bg-safety-warning-light text-safety-warning'
    if (intensity > 25) return 'bg-primary-100 text-primary-700'
    return 'bg-surface-100 text-surface-600'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 font-semibold text-surface-600 bg-surface-50 sticky left-0 z-10">
              Hazard
            </th>
            {rootCauses.map(rc => (
              <th
                key={rc}
                className="p-2 font-semibold text-surface-600 bg-surface-50 text-center min-w-[80px]"
              >
                <span className="truncate block" title={rc}>
                  {rc.length > 12 ? rc.substring(0, 12) + '...' : rc}
                </span>
              </th>
            ))}
            <th className="p-2 font-semibold text-surface-600 bg-surface-50 text-center">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, idx) => (
            <tr
              key={row.hazard}
              className={`
                group
                ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50/50'}
                hover:bg-primary-50 transition-colors
              `}
            >
              <td className={`
                p-2 font-medium text-surface-700 sticky left-0 z-10 border-r border-surface-100
                ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'}
                group-hover:bg-primary-50 transition-colors
              `}>
                <span className="truncate block max-w-[120px]" title={row.hazard}>
                  {row.hazard}
                </span>
              </td>
              {rootCauses.map(rc => {
                const count = row[rc] || 0
                const pct = row[`${rc}_pct`] || '0'
                return (
                  <td
                    key={rc}
                    className={`
                      p-2 text-center cursor-pointer transition-all
                      ${getCellColor(count, maxCount)}
                      hover:ring-2 hover:ring-primary-400 hover:ring-inset
                      group-hover:brightness-95
                    `}
                    onClick={() => count > 0 && onCellClick?.(row.hazard, rc, count)}
                    title={count > 0 ? `${row.hazard} + ${rc}: ${count} incidents (${pct}%)` : 'No data'}
                  >
                    {count > 0 ? count : '-'}
                  </td>
                )
              })}
              <td className="p-2 text-center font-semibold text-surface-700 bg-surface-100 group-hover:bg-primary-100 transition-colors">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-4 text-xs text-surface-500">
        <span>Intensity:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-surface-100 rounded" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-primary-100 rounded" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-safety-warning-light rounded" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-safety-critical-light rounded" />
          <span>Critical</span>
        </div>
      </div>
    </div>
  )
}

export default memo(RootCauseHazardMatrix)
