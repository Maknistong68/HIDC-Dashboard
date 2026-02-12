import React, { useMemo, useState, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import Card from '../ui/Card'
import TimePeriodToggle from '../common/TimePeriodToggle'
import { InfoTooltip } from '../ui/Tooltip'
import { TrendingUp, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { getNearMissComplianceTrend } from '../../utils/dataQualityCalculations'
import { startOfQuarter, endOfQuarter, format, parseISO } from 'date-fns'

const TARGET = 2
const PYRAMID_TYPES = ['lti', 'mti', 'fac', 'near-miss', 'unsafe-act', 'unsafe-condition']

const GRANULARITY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

/**
 * Compute per-site near-miss breakdown for a set of month keys.
 * Returns sorted array: failing sites first (ascending count), then passing sites (descending count).
 */
const getSiteBreakdown = (incidents, monthKeys) => {
  const pyramidIncidents = incidents.filter(
    i => i.date && i.site && monthKeys.includes(i.date.substring(0, 7)) && PYRAMID_TYPES.includes(i.type)
  )
  const nearMisses = incidents.filter(
    i => i.date && i.site && monthKeys.includes(i.date.substring(0, 7)) && i.type === 'near-miss'
  )

  // Count near-misses per site per month
  const siteMonthMap = {} // { site: { monthKey: count } }
  nearMisses.forEach(i => {
    const month = i.date.substring(0, 7)
    if (!siteMonthMap[i.site]) siteMonthMap[i.site] = {}
    siteMonthMap[i.site][month] = (siteMonthMap[i.site][month] || 0) + 1
  })

  // Ensure all active sites appear (even with 0 NMs)
  pyramidIncidents.forEach(i => {
    const month = i.date.substring(0, 7)
    if (!siteMonthMap[i.site]) siteMonthMap[i.site] = {}
    if (!(month in siteMonthMap[i.site])) siteMonthMap[i.site][month] = 0
  })

  // Build flat list: one row per site-month with proportional score
  const rows = []
  Object.entries(siteMonthMap).forEach(([site, months]) => {
    Object.entries(months).forEach(([month, count]) => {
      // 0 NM = 0%, 1 NM = 50%, 2+ NM = 100%
      const score = Math.min(count / TARGET, 1) * 100
      const status = count >= TARGET ? 'met' : count > 0 ? 'partial' : 'none'
      rows.push({ site, month, count, score, status })
    })
  })

  // Sort: none first, then partial, then met (within each group, ascending count)
  const statusOrder = { none: 0, partial: 1, met: 2 }
  rows.sort((a, b) => {
    if (a.status !== b.status) return statusOrder[a.status] - statusOrder[b.status]
    return a.count - b.count
  })

  return rows
}

const NearMissComplianceTrend = ({ incidents, isMobile }) => {
  const [granularity, setGranularity] = useState('monthly')
  const [drillDown, setDrillDown] = useState(null) // { label, monthKeys, complianceRate }

  const data = useMemo(
    () => getNearMissComplianceTrend(incidents, granularity),
    [incidents, granularity]
  )

  const handleChartClick = useCallback((chartData) => {
    const payload = chartData?.activePayload?.[0]?.payload
    if (!payload) return

    let monthKeys
    if (payload.monthKey) {
      // Monthly — single month
      monthKeys = [payload.monthKey]
    } else {
      // Quarterly — derive 3 month keys from label like "Q1 '25"
      const match = payload.label.match(/Q(\d)\s+'(\d{2})/)
      if (match) {
        const quarter = parseInt(match[1])
        const year = 2000 + parseInt(match[2])
        const startMonth = (quarter - 1) * 3 // 0-based
        const qStart = new Date(year, startMonth, 1)
        const qEnd = endOfQuarter(qStart)
        const keys = []
        let cursor = new Date(qStart)
        while (cursor <= qEnd) {
          keys.push(format(cursor, 'yyyy-MM'))
          cursor.setMonth(cursor.getMonth() + 1)
        }
        monthKeys = keys
      } else {
        return
      }
    }

    setDrillDown({
      label: payload.label,
      monthKeys,
      complianceRate: payload.complianceRate,
      nearMissCount: payload.nearMissCount,
      sitesMetTarget: payload.sitesMetTarget,
      totalSiteMonths: payload.totalSiteMonths,
    })
  }, [])

  const siteRows = useMemo(() => {
    if (!drillDown) return []
    return getSiteBreakdown(incidents, drillDown.monthKeys)
  }, [drillDown, incidents])

  const metCount = siteRows.filter(r => r.status === 'met').length
  const partialCount = siteRows.filter(r => r.status === 'partial').length
  const noneCount = siteRows.filter(r => r.status === 'none').length
  const showMonthColumn = drillDown?.monthKeys?.length > 1

  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Header>
          <TrendingUp size={14} className="text-surface-500" />
          <Card.Title>Near-Miss Compliance Trend</Card.Title>
        </Card.Header>
        <div className="flex items-center justify-center h-[200px] text-sm text-surface-400">
          No data available
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <Card.Header
          action={
            <TimePeriodToggle
              period={granularity}
              onPeriodChange={setGranularity}
              periods={GRANULARITY_OPTIONS}
              hideWorkRelated
            />
          }
        >
          <TrendingUp size={14} className="text-green-600" />
          <Card.Title>Near-Miss Compliance Trend</Card.Title>
          <InfoTooltip text="HOW THIS CHART IS CREATED: Each period shows the percentage of site-months meeting the near-miss target (≥2 near-misses per site per month). UPWARD TREND: More sites are meeting the reporting target. DOWNWARD TREND: Fewer sites are meeting the target - may need follow-up. The dashed line at 80% marks the 'good' compliance threshold. Click any dot to see the site breakdown." />
        </Card.Header>
        <div className={isMobile ? 'h-[200px]' : 'h-[280px]'}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                dy={5}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 30 : 35}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-white/95 backdrop-blur-sm border border-surface-200 rounded-lg shadow-medium p-3 animate-fade-in">
                      <p className="text-xs font-medium text-surface-700 mb-2">{label} (tap for details)</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-surface-600">Compliance:</span>
                          <span className="font-semibold text-surface-800">{d.complianceRate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-surface-300" />
                          <span className="text-surface-600">Near-misses:</span>
                          <span className="font-semibold text-surface-800">{d.nearMissCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-surface-300" />
                          <span className="text-surface-600">Sites met target:</span>
                          <span className="font-semibold text-surface-800">
                            {d.sitesMetTarget} / {d.totalSiteMonths}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              <ReferenceLine
                y={80}
                stroke="#059669"
                strokeDasharray="5 5"
                strokeWidth={1}
                label={
                  isMobile
                    ? null
                    : { value: '80% target', position: 'right', fontSize: 10, fill: '#059669' }
                }
              />
              <Line
                type="monotone"
                dataKey="complianceRate"
                name="Compliance"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{
                  r: isMobile ? 4 : 4,
                  fill: '#059669',
                  strokeWidth: 2,
                  stroke: '#fff',
                  style: { cursor: 'pointer' },
                }}
                activeDot={{
                  r: 6,
                  fill: '#059669',
                  stroke: '#fff',
                  strokeWidth: 2,
                  style: { cursor: 'pointer' },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Site Breakdown Modal */}
      {drillDown && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDrillDown(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <div>
                <h3 className="text-sm font-semibold text-surface-800">
                  Site Breakdown — {drillDown.label}
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Target: {TARGET}+ near-misses per site per month
                </p>
              </div>
              <button
                onClick={() => setDrillDown(null)}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-3 px-5 py-3 bg-surface-50 border-b border-surface-100">
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold ${
                  drillDown.complianceRate >= 80 ? 'bg-green-500' : drillDown.complianceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {Math.round(drillDown.complianceRate)}
                </span>
                <span className="text-surface-600 font-medium">% compliance</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-surface-600">{metCount} met</span>
              </div>
              {partialCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <span className="text-surface-600">{partialCount} partial</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs">
                <XCircle size={14} className="text-red-400" />
                <span className="text-surface-600">{noneCount} none</span>
              </div>
            </div>

            {/* Site table */}
            <div className="overflow-y-auto flex-1 px-5 py-3">
              {siteRows.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-6">No site data for this period</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-surface-500 uppercase tracking-wide border-b border-surface-100">
                      <th className="text-left pb-2 font-semibold">Site</th>
                      {showMonthColumn && <th className="text-left pb-2 font-semibold">Month</th>}
                      <th className="text-center pb-2 font-semibold">Count</th>
                      <th className="text-center pb-2 font-semibold">Score</th>
                      <th className="text-center pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteRows.map((row, i) => (
                      <tr key={`${row.site}-${row.month}-${i}`} className="border-b border-surface-50 last:border-0">
                        <td className="py-2 pr-2 text-surface-700 font-medium max-w-[160px] truncate" title={row.site}>
                          {row.site}
                        </td>
                        {showMonthColumn && (
                          <td className="py-2 pr-2 text-surface-500">
                            {(() => {
                              try { return format(parseISO(row.month + '-01'), 'MMM yy') } catch { return row.month }
                            })()}
                          </td>
                        )}
                        <td className="py-2 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                            row.status === 'met' ? 'bg-green-50 text-green-700' : row.status === 'partial' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {row.count}
                          </span>
                        </td>
                        <td className="py-2 text-center text-[11px] font-semibold">
                          <span className={
                            row.status === 'met' ? 'text-green-600' : row.status === 'partial' ? 'text-yellow-600' : 'text-red-500'
                          }>
                            {Math.round(row.score)}%
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          {row.status === 'met' ? (
                            <CheckCircle size={16} className="text-green-500 mx-auto" />
                          ) : row.status === 'partial' ? (
                            <AlertTriangle size={16} className="text-yellow-500 mx-auto" />
                          ) : (
                            <XCircle size={16} className="text-red-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NearMissComplianceTrend
