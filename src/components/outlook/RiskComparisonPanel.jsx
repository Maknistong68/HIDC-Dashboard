import React, { useState, useMemo } from 'react'
import { Building2, MapPin, Globe } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts'
import { calculateRiskByDimension } from '../../utils/insightsCalculations'
import { InfoTooltip } from '../ui/Tooltip'

/**
 * Truncate text to a maximum length with ellipsis
 */
const truncateText = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - 1) + '...'
}

/**
 * Get color based on risk score
 * green (70+), amber (50-70), red (<50)
 */
const getRiskColor = (score) => {
  if (score >= 70) return '#22c55e' // green-500
  if (score >= 50) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

/**
 * Get status icon for factor
 */
const getStatusIcon = (status) => {
  if (status === 'good') return '✓'
  if (status === 'critical') return '✗'
  return '!'
}

/**
 * Get status color for factor
 */
const getStatusColor = (status) => {
  if (status === 'good') return '#22c55e'
  if (status === 'critical') return '#ef4444'
  return '#f59e0b'
}

/**
 * Custom tooltip for the bar chart with factor breakdown
 */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const factors = data.factors || []

  return (
    <div className="bg-white border border-surface-200 rounded-lg shadow-xl p-3 text-xs min-w-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-surface-100">
        <p className="font-semibold text-surface-800">{data.name}</p>
        <span className="font-bold text-sm" style={{ color: getRiskColor(data.score) }}>{data.score}%</span>
      </div>

      {/* Factors breakdown */}
      {factors.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {factors.map((factor, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span style={{ color: getStatusColor(factor.status) }}>{getStatusIcon(factor.status)}</span>
                <span className="text-surface-600">{factor.name}</span>
              </div>
              <span className="font-medium" style={{ color: getStatusColor(factor.status) }}>
                {Math.round(factor.score)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-surface-100 text-surface-500">
        {data.incidentCount} observations
      </div>
    </div>
  )
}

/**
 * Custom Y-axis tick that truncates long labels
 */
const CustomYAxisTick = ({ x, y, payload }) => {
  const maxLength = 25
  const displayText = truncateText(payload.value, maxLength)
  const isTruncated = payload.value && payload.value.length > maxLength

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{payload.value}</title>
      <text
        x={-5}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#475569"
        fontSize={11}
        style={{ cursor: isTruncated ? 'help' : 'default' }}
      >
        {displayText}
      </text>
    </g>
  )
}

/**
 * Tab configuration
 */
const TABS = [
  { id: 'contractor', label: 'Company', icon: Building2 },
  { id: 'site', label: 'Site', icon: MapPin },
  { id: 'subregion', label: 'Subregion', icon: Globe }
]

/**
 * RiskComparisonPanel - Shows risk scores across different dimensions
 */
const RiskComparisonPanel = ({ incidents, siteClassifications = {} }) => {
  const [activeTab, setActiveTab] = useState('contractor')

  // Calculate risk data for each dimension
  const companyData = useMemo(() =>
    calculateRiskByDimension(incidents, 'contractor'),
    [incidents]
  )

  const siteData = useMemo(() =>
    calculateRiskByDimension(incidents, 'site'),
    [incidents]
  )

  const subregionData = useMemo(() =>
    calculateRiskByDimension(incidents, 'subregion', siteClassifications),
    [incidents, siteClassifications]
  )

  // Get current data based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'contractor':
        return companyData
      case 'site':
        return siteData
      case 'subregion':
        return subregionData
      default:
        return companyData
    }
  }, [activeTab, companyData, siteData, subregionData])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!currentData.length) {
      return { total: 0, avgScore: 0, criticalCount: 0 }
    }

    const total = currentData.length
    const avgScore = Math.round(
      currentData.reduce((sum, d) => sum + d.score, 0) / total
    )
    const criticalCount = currentData.filter(d => d.level === 'critical').length

    return { total, avgScore, criticalCount }
  }, [currentData])

  // Dynamic chart height based on data count
  // 36px per bar for comfortable spacing, min 150px, no max limit
  const chartHeight = currentData.length > 0
    ? Math.max(150, currentData.length * 36 + 20)
    : 150

  if (!incidents.length) return null

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-surface-800">Risk Comparison</h3>
          <InfoTooltip text="Compare risk scores across Companies, Sites, and Subregions. Risk scores use rates (not counts) for fair comparison regardless of company size. Factors: Near-Miss Reporting (25%), High-Risk Trend (25% - compares current vs previous 30-day period), High-Risk Closure (25%), Positive High-Risk (25%). High-risk = 14 significant hazards. Green (70+) good, amber (50-70) warning, red (<50) critical." />
        </div>
      </div>

      {/* Tabs and Summary Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-surface-500">
            <span className="font-semibold text-surface-700">{summaryStats.total}</span> Total
          </span>
          <span className="text-surface-300">|</span>
          <span className="text-surface-500">
            <span className="font-semibold" style={{ color: getRiskColor(summaryStats.avgScore) }}>
              {summaryStats.avgScore}%
            </span> Avg
          </span>
          <span className="text-surface-300">|</span>
          <span className="text-surface-500">
            <span className={`font-semibold ${summaryStats.criticalCount > 0 ? 'text-red-600' : 'text-surface-600'}`}>
              {summaryStats.criticalCount}
            </span> Critical
          </span>
        </div>
      </div>

      {/* Chart or Empty State */}
      {currentData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-surface-500 text-sm">
          No data available for this dimension
        </div>
      ) : (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              layout="vertical"
              margin={{ top: 5, right: 50, bottom: 5, left: 10 }}
              barGap={4}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={<CustomYAxisTick />}
                tickLine={false}
                axisLine={false}
                width={160}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <ReferenceLine x={50} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine x={70} stroke="#22c55e" strokeDasharray="3 3" strokeWidth={1} />
              <Bar
                dataKey="score"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRiskColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      {currentData.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-surface-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Good (70+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Warning (50-70)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Critical (&lt;50)</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(RiskComparisonPanel)
