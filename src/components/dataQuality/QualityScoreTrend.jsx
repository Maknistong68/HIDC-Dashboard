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
import { TrendingUp, X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import {
  getQualityScoreTrend,
  calculateQualityScore,
  getDescriptionMetrics,
  getNearMissMetrics,
  getReporterMetrics,
  getDuplicateDescriptions,
  getMisclassificationAnalysis,
} from '../../utils/dataQualityCalculations'
import { endOfQuarter, format } from 'date-fns'

const GRANULARITY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

const STATUS_CONFIG = {
  good: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', bar: 'bg-green-500' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', bar: 'bg-yellow-500' },
  poor: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-50', bar: 'bg-red-500' },
}

const getStatus = (value) => value >= 75 ? 'good' : value >= 50 ? 'warning' : 'poor'

/**
 * Build the 5-category quality breakdown for a given set of month keys.
 */
const getBreakdownForPeriod = (incidents, monthKeys) => {
  const periodIncidents = incidents.filter(
    i => i.date && monthKeys.includes(i.date.substring(0, 7))
  )
  if (periodIncidents.length === 0) return null

  const misclass = getMisclassificationAnalysis(periodIncidents)
  const quality = calculateQualityScore(periodIncidents, misclass)
  const description = getDescriptionMetrics(periodIncidents)
  const nearMiss = getNearMissMetrics(periodIncidents)
  const reporters = getReporterMetrics(periodIncidents)
  const duplicates = getDuplicateDescriptions(periodIncidents)

  const activeReporters = reporters.filter(r => r.total >= 5).length

  return {
    score: quality.score,
    count: periodIncidents.length,
    categories: [
      {
        label: 'Classification Accuracy',
        value: Math.round(quality.breakdown.classificationAccuracy?.value || 0),
        weight: quality.breakdown.classificationAccuracy?.weight || 0,
        detail: `${misclass.totalMisclassified} potential misclassification${misclass.totalMisclassified !== 1 ? 's' : ''} of ${periodIncidents.length}`,
      },
      {
        label: 'Description Quality',
        value: Math.round(parseFloat(description.qualityRate)),
        weight: quality.breakdown.description?.weight || 0,
        detail: `${description.qualityCount} of ${periodIncidents.length} have 15+ words`,
      },
      {
        label: 'Near-Miss Compliance',
        value: Math.round(quality.breakdown.nearMiss?.value || 0),
        weight: quality.breakdown.nearMiss?.weight || 0,
        detail: `${nearMiss.sitesMetTarget} of ${nearMiss.totalSiteMonths} site-months met target (≥2/month)`,
      },
      {
        label: 'Reporter Diversity',
        value: Math.round(quality.breakdown.reporters?.value || 0),
        weight: quality.breakdown.reporters?.weight || 0,
        detail: `${activeReporters} active of ${reporters.length} reporters`,
      },
      {
        label: 'Data Integrity',
        value: Math.round(quality.breakdown.dataIntegrity?.value || 0),
        weight: quality.breakdown.dataIntegrity?.weight || 0,
        detail: `${duplicates.duplicateRate}% duplicate rate (${duplicates.totalDuplicates} entries)`,
      },
    ],
  }
}

const QualityScoreTrend = ({ incidents, isMobile }) => {
  const [granularity, setGranularity] = useState('monthly')
  const [drillDown, setDrillDown] = useState(null) // { label, monthKeys }

  const data = useMemo(
    () => getQualityScoreTrend(incidents, granularity),
    [incidents, granularity]
  )

  const handleChartClick = useCallback((chartData) => {
    const payload = chartData?.activePayload?.[0]?.payload
    if (!payload) return

    let monthKeys
    if (payload.monthKey) {
      monthKeys = [payload.monthKey]
    } else {
      // Quarterly — derive month keys from label like "Q1 '25"
      const match = payload.label.match(/Q(\d)\s+'(\d{2})/)
      if (match) {
        const quarter = parseInt(match[1])
        const year = 2000 + parseInt(match[2])
        const startMonth = (quarter - 1) * 3
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

    setDrillDown({ label: payload.label, monthKeys })
  }, [])

  const breakdown = useMemo(() => {
    if (!drillDown) return null
    return getBreakdownForPeriod(incidents, drillDown.monthKeys)
  }, [drillDown, incidents])

  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Header>
          <TrendingUp size={14} className="text-surface-500" />
          <Card.Title>Quality Score Trend</Card.Title>
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
          <TrendingUp size={14} className="text-blue-600" />
          <Card.Title>Quality Score Trend</Card.Title>
          <InfoTooltip text="HOW THIS CHART IS CREATED: Each period, we calculate a quality score for all observations submitted using the same 5-category formula (classification accuracy, description quality, near-miss rate, reporter diversity, and data integrity). UPWARD TREND: Quality is improving - training and processes are working. DOWNWARD TREND: Quality is declining - may need refresher training or process review. The dashed blue line at 75% shows the recommended target. Click any dot to see the breakdown." />
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
                      <p className="text-xs font-medium text-surface-700 mb-2">
                        {label} (tap for details)
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-surface-600">Quality Score:</span>
                          <span className="font-semibold text-surface-800">{d.qualityScore}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-surface-300" />
                          <span className="text-surface-600">Observations:</span>
                          <span className="font-semibold text-surface-800">{d.count}</span>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              <ReferenceLine
                y={75}
                stroke="#3b82f6"
                strokeDasharray="5 5"
                strokeWidth={1}
                label={
                  isMobile
                    ? null
                    : { value: '75% target', position: 'right', fontSize: 10, fill: '#3b82f6' }
                }
              />
              <Line
                type="monotone"
                dataKey="qualityScore"
                name="Quality Score"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{
                  r: isMobile ? 4 : 4,
                  fill: '#3b82f6',
                  strokeWidth: 2,
                  stroke: '#fff',
                  style: { cursor: 'pointer' },
                }}
                activeDot={{
                  r: 6,
                  fill: '#3b82f6',
                  stroke: '#fff',
                  strokeWidth: 2,
                  style: { cursor: 'pointer' },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quality Breakdown Modal */}
      {drillDown && breakdown && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDrillDown(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 flex flex-col animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <div>
                <h3 className="text-sm font-semibold text-surface-800">
                  Quality Breakdown — {drillDown.label}
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  {breakdown.count} observations scored
                </p>
              </div>
              <button
                onClick={() => setDrillDown(null)}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Overall score */}
            <div className="flex items-center gap-3 px-5 py-3 bg-surface-50 border-b border-surface-100">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold ${
                breakdown.score >= 75 ? 'bg-blue-500' : breakdown.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {breakdown.score}
              </div>
              <div>
                <div className="text-xs font-semibold text-surface-700">Overall Quality Score</div>
                <div className="text-[11px] text-surface-500">
                  {breakdown.score >= 75 ? 'Good — meeting targets' : breakdown.score >= 50 ? 'Needs improvement' : 'Below standard — action required'}
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="px-5 py-4 space-y-4">
              {breakdown.categories.map((cat) => {
                const status = getStatus(cat.value)
                const cfg = STATUS_CONFIG[status]
                const StatusIcon = cfg.icon
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon size={14} className={cfg.color} />
                        <span className="text-xs font-medium text-surface-700">{cat.label}</span>
                        <span className="text-[10px] text-surface-400">({cat.weight}%)</span>
                      </div>
                      <span className={`text-xs font-bold ${
                        status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : 'text-red-500'
                      }`}>
                        {cat.value}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                        style={{ width: `${Math.min(cat.value, 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-surface-400 mt-1">{cat.detail}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QualityScoreTrend
