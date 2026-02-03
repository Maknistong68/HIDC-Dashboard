import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts'
import { Target, X, Copy, Check, ThumbsUp, AlertTriangle } from 'lucide-react'
import { detectAllCausesUnified, FACTOR_TYPE, NEGATIVE_TYPES } from '../../utils/rootCauseEngine'

// Simplified color system - Common vs Specific factors
const FACTOR_TYPE_COLORS = {
  // Common Factors - Teal palette
  'common': '#0d9488',
  'Common Factor': '#0d9488',
  [FACTOR_TYPE.COMMON]: '#0d9488',

  // Specific Factors - Violet palette
  'specific': '#7c3aed',
  'Specific Factor': '#7c3aed',
  [FACTOR_TYPE.SPECIFIC]: '#7c3aed',

  // Unclassified
  'Not Specified': '#94a3b8',
  'Unclassified': '#64748b'
}

// Color palettes for factors
const COMMON_FACTOR_PALETTE = [
  '#0d9488', '#14b8a6', '#0f766e', '#10b981', '#059669', '#047857', '#065f46'
]

const SPECIFIC_FACTOR_PALETTE = [
  '#7c3aed', '#8b5cf6', '#6d28d9', '#5b21b6', '#4c1d95', '#9333ea', '#a855f7',
  '#6366f1', '#4f46e5', '#4338ca', '#3b82f6', '#2563eb', '#1d4ed8'
]

// Negative colors fallback
const NEGATIVE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#6366f1', '#dc2626', '#64748b',
  '#22c55e', '#06b6d4', '#a855f7', '#f59e0b', '#84cc16'
]

// Positive colors
const POSITIVE_COLORS = [
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#64748b'
]

// Positive observation types (NEGATIVE_TYPES is imported from rootCauseEngine)
const POSITIVE_TYPES = ['positive']

/**
 * Get color for a factor based on its type
 */
const getFactorColor = (item, index, isPositive) => {
  // Check for direct type-based color first
  if (FACTOR_TYPE_COLORS[item.type]) {
    // Use palette variation based on index
    if (item.type === FACTOR_TYPE.COMMON || item.type === 'common') {
      return COMMON_FACTOR_PALETTE[index % COMMON_FACTOR_PALETTE.length]
    }
    if (item.type === FACTOR_TYPE.SPECIFIC || item.type === 'specific') {
      return SPECIFIC_FACTOR_PALETTE[index % SPECIFIC_FACTOR_PALETTE.length]
    }
    return FACTOR_TYPE_COLORS[item.type]
  }

  // Check for name-based color
  if (FACTOR_TYPE_COLORS[item.name]) {
    return FACTOR_TYPE_COLORS[item.name]
  }

  // Fallback to palette
  const palette = isPositive ? POSITIVE_COLORS : NEGATIVE_COLORS
  return palette[index % palette.length]
}

/**
 * BarChartTooltip - Shows factor details on hover
 */
const BarChartTooltip = React.memo(({ active, payload, isPositive }) => {
  if (!active || !payload || !payload.length) return null

  const item = payload[0].payload
  const isCommon = item.type === FACTOR_TYPE.COMMON || item.type === 'common'
  const isSpecific = item.type === FACTOR_TYPE.SPECIFIC || item.type === 'specific'

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-surface-200">
      <p className="text-sm font-semibold text-surface-800 mb-1">{item.name}</p>
      {/* Factor type badge */}
      <div className="flex items-center gap-2 mb-1">
        {isCommon && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">
            Common Factor
          </span>
        )}
        {isSpecific && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
            Hazard-Specific
          </span>
        )}
        {!isCommon && !isSpecific && item.category && item.category !== 'Unclassified' && (
          <span className="text-xs text-surface-500">{item.category}</span>
        )}
      </div>
      <p className="text-sm text-surface-600">
        <span className="font-medium">{item.count}</span> occurrences
      </p>
      <p className="text-xs text-surface-400">{item.percentage}% of total</p>
      <p className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-primary-500'}`}>
        Click to view observations
      </p>
    </div>
  )
})

BarChartTooltip.displayName = 'BarChartTooltip'

/**
 * DrillDownModal - Shows observations for a selected root cause
 */
const DrillDownModal = React.memo(({ isOpen, onClose, rootCause, observations, hazardName, colorScheme }) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const isPositive = colorScheme === 'green'
  const reportType = isPositive ? 'POSITIVE OBSERVATION' : 'FACTORS'

  const handleCopyAll = useCallback(() => {
    const header = [
      '══════════════════════════════════════════════════════════════',
      `${reportType} REPORT`,
      '══════════════════════════════════════════════════════════════',
      `Issue/Practice: ${rootCause}`,
      `Hazard Category: ${hazardName}`,
      `Total Observations: ${observations.length}`,
      `Type: ${isPositive ? 'Good Practice' : 'Deficiency'}`,
      `Generated: ${new Date().toLocaleString()}`,
      '══════════════════════════════════════════════════════════════',
      ''
    ].join('\n')

    const observationsList = observations.map((obs, i) => {
      return [
        `[${i + 1}] ─────────────────────────────────────────────────────`,
        `Date: ${obs.date || 'N/A'}`,
        `Type: ${obs.type || 'N/A'}`,
        ``,
        `Description:`,
        `${obs.description}`,
        ``
      ].join('\n')
    }).join('\n')

    const footer = [
      '══════════════════════════════════════════════════════════════',
      `END OF REPORT - ${observations.length} observations for "${rootCause}"`,
      '══════════════════════════════════════════════════════════════'
    ].join('\n')

    navigator.clipboard.writeText(header + observationsList + footer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [rootCause, hazardName, observations, isPositive, reportType])

  const handleCopySingle = useCallback((obs, index) => {
    const text = [
      `── ${isPositive ? 'Positive Observation' : 'Factor'} #${index + 1} ──`,
      `Issue/Practice: ${rootCause}`,
      `Hazard: ${hazardName}`,
      `Date: ${obs.date || 'N/A'}`,
      `Type: ${obs.type || 'N/A'}`,
      ``,
      `Description:`,
      `${obs.description}`
    ].join('\n')
    navigator.clipboard.writeText(text)
  }, [rootCause, hazardName, isPositive])

  if (!isOpen) return null

  const Icon = isPositive ? ThumbsUp : AlertTriangle
  const headerColor = isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  const iconColor = isPositive ? 'text-green-600' : 'text-red-500'
  const buttonColor = isPositive ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${headerColor} rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <Icon size={20} className={iconColor} />
            <div>
              <h3 className="text-lg font-semibold text-surface-800">{rootCause}</h3>
              <p className="text-sm text-surface-500">
                {observations.length} observations from {hazardName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm text-white rounded-lg transition-colors ${buttonColor}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-surface-500" />
            </button>
          </div>
        </div>

        {/* Observations list */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {observations.map((obs, index) => (
              <div
                key={obs.date ? `${obs.date}-${index}` : `obs-${index}`}
                className={`p-3 rounded-lg border group ${isPositive ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700">{obs.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {obs.date && (
                        <span className="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded">
                          {obs.date}
                        </span>
                      )}
                      {obs.type && (
                        <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
                          {obs.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopySingle(obs, index)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded transition-all"
                    title="Copy this observation"
                  >
                    <Copy size={14} className="text-surface-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-2 border-t ${isPositive ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'} rounded-b-xl`}>
          <p className="text-xs text-surface-500 text-center">
            Hover over an observation to copy individually
          </p>
        </div>
      </div>
    </div>
  )
})

DrillDownModal.displayName = 'DrillDownModal'

/**
 * RootCausePanel - Root cause analysis for selected hazard
 * Optimized with memoization and simplified color system
 */
const RootCausePanel = ({
  data,
  hazardName,
  incidents,
  observationType = 'negative',
  title = 'Factors',
  subtitle = 'Deficiencies identified',
  emptyMessage = 'No issues identified',
  colorScheme = 'red'
}) => {
  const [selectedRootCause, setSelectedRootCause] = useState(null)

  const isPositive = colorScheme === 'green' || observationType === 'positive'
  const typeFilter = isPositive ? POSITIVE_TYPES : NEGATIVE_TYPES

  // Get observations grouped by root cause for drill-down
  const observationsByRootCause = useMemo(() => {
    if (!incidents || !hazardName) return {}

    const hazardIncidents = incidents.filter(i => {
      if (i.location !== hazardName) return false
      if (i.type && typeFilter.includes(i.type)) return true
      if (!i.type && !isPositive) return true
      return false
    })

    const grouped = {}

    hazardIncidents.forEach(incident => {
      const description = incident.description || ''
      if (!description.trim()) return

      const allCauses = detectAllCausesUnified(description, hazardName)

      if (allCauses.length > 0) {
        allCauses.forEach(({ name }) => {
          if (!grouped[name]) grouped[name] = []
          grouped[name].push({
            description,
            date: incident.date || incident.observationDate,
            type: incident.type
          })
        })
      } else {
        if (!grouped['Not Specified']) grouped['Not Specified'] = []
        grouped['Not Specified'].push({
          description,
          date: incident.date || incident.observationDate,
          type: incident.type
        })
      }
    })

    return grouped
  }, [incidents, hazardName, typeFilter, isPositive])

  const EmptyIcon = isPositive ? ThumbsUp : Target

  if (!data || !data.hasData || !data.breakdown || data.breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center p-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isPositive ? 'bg-green-100' : 'bg-surface-100'}`}>
          <EmptyIcon size={24} className={isPositive ? 'text-green-400' : 'text-surface-400'} />
        </div>
        <p className="text-sm text-surface-500">{emptyMessage}</p>
        <p className="text-xs text-surface-400 mt-1">
          {hazardName
            ? `No ${isPositive ? 'positive observations' : 'deficiencies'} extracted from ${hazardName} descriptions`
            : 'Select a hazard to view breakdown'
          }
        </p>
      </div>
    )
  }

  const { breakdown, total, topCause, matchedPercent } = data

  // Prepare chart data with colors based on factor type
  const chartData = breakdown
    .filter(item => breakdown.length === 1 || item.name !== 'Not Specified')
    .slice(0, 15)
    .map((item, index) => ({
      ...item,
      color: getFactorColor(item, index, isPositive)
    }))

  const handleBarClick = useCallback((data) => {
    if (data && data.name) setSelectedRootCause(data.name)
  }, [])

  const renderTooltip = useCallback((props) => (
    <BarChartTooltip {...props} isPositive={isPositive} />
  ), [isPositive])

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-surface-800">{title}</h3>
          <p className="text-xs text-surface-500">{hazardName}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-surface-600">
            <span className="font-semibold">{total}</span> total
          </span>
          {matchedPercent && (
            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded">
              {matchedPercent}% classified
            </span>
          )}
          {topCause && topCause.name !== 'Not Specified' && topCause.name !== 'Other' && (
            <span className={`text-xs px-2 py-1 rounded ${isPositive ? 'bg-green-50 text-green-600' : 'bg-surface-100 text-surface-600'}`}>
              Top: {topCause.name}
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              domain={[0, Math.ceil(maxCount * 1.2)]}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: '#374151' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              width={130}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              maxBarSize={28}
              onClick={handleBarClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className={`text-xs mt-2 ${isPositive ? 'text-green-500' : 'text-surface-400'}`}>
        Click bars to view observations
      </p>

      {/* Drill-down modal */}
      <DrillDownModal
        isOpen={!!selectedRootCause}
        onClose={() => setSelectedRootCause(null)}
        rootCause={selectedRootCause}
        observations={observationsByRootCause[selectedRootCause] || []}
        hazardName={hazardName}
        colorScheme={colorScheme}
      />
    </div>
  )
}

export default React.memo(RootCausePanel)
