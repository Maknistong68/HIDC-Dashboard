import React, { useState, useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie
} from 'recharts'
import { Layers, X, Copy, Check, AlertTriangle } from 'lucide-react'
import { aggregateContributingFactors, detectContributingFactors } from '../../utils/rootCauseEngine'
import { CONTRIBUTING_FACTOR_COLORS } from '../../utils/constants'

// Negative observation types
const NEGATIVE_TYPES = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr', 'fac', 'mti', 'lti']

/**
 * BarTooltip - Extracted outside component to prevent recreation on each render
 */
const BarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-surface-200">
        <p className="text-sm font-semibold text-surface-800 mb-1">{item.name}</p>
        <p className="text-xs text-surface-500 mb-1">{item.category}</p>
        <p className="text-sm text-surface-600">
          <span className="font-medium">{item.count}</span> occurrences ({item.percentage}%)
        </p>
        <p className="text-xs mt-1 text-primary-500">Click to view observations</p>
      </div>
    )
  }
  return null
}

/**
 * DonutTooltip - Extracted outside component to prevent recreation on each render
 */
const DonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-surface-200">
        <p className="text-sm font-semibold text-surface-800 mb-1">{item.name}</p>
        <p className="text-sm text-surface-600">
          <span className="font-medium">{item.count}</span> observations
        </p>
        <p className="text-xs text-surface-400">{item.percentage}% of analyzed</p>
      </div>
    )
  }
  return null
}

/**
 * DrillDownModal - Shows observations for a selected contributing factor
 */
const DrillDownModal = ({ isOpen, onClose, factorName, observations, categoryName }) => {
  const [copied, setCopied] = useState(false)

  // Handle keyboard escape to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyAll = () => {
    const text = observations.map((obs, i) =>
      `${i + 1}. "${obs.description}"`
    ).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categoryColor = CONTRIBUTING_FACTOR_COLORS[categoryName] || '#64748b'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-surface-50">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <AlertTriangle size={18} style={{ color: categoryColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-800">{factorName}</h3>
              <p className="text-sm text-surface-500">
                {observations.length} observations • {categoryName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white hover:bg-surface-100 rounded-lg transition-colors border border-surface-200"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-surface-500" />
            </button>
          </div>
        </div>

        {/* Observations list */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {observations.map((obs, index) => (
              <div
                key={obs.date ? `${obs.date}-${index}` : `obs-${index}`}
                className="p-3 rounded-lg border bg-surface-50/50 border-surface-100"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-surface-700">{obs.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {obs.date && (
                        <p className="text-xs text-surface-400">{obs.date}</p>
                      )}
                      {obs.hazard && (
                        <span className="text-xs px-2 py-0.5 bg-surface-100 rounded text-surface-500">
                          {obs.hazard}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * ContributingFactorsPanel - Shows universal contributing factors analysis
 * Displays donut chart for categories and bar chart for top factors
 */
const ContributingFactorsPanel = ({ incidents, hazardName }) => {
  const [selectedFactor, setSelectedFactor] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Filter incidents for this hazard and negative types only
  const hazardIncidents = useMemo(() => {
    if (!incidents || !hazardName) return []
    return incidents.filter(i =>
      i.location === hazardName && NEGATIVE_TYPES.includes(i.type)
    )
  }, [incidents, hazardName])

  // Aggregate contributing factors
  const factorData = useMemo(() => {
    return aggregateContributingFactors(hazardIncidents, 'all')
  }, [hazardIncidents])

  // Get observations grouped by factor for drill-down
  const observationsByFactor = useMemo(() => {
    if (!hazardIncidents.length) return {}

    const grouped = {}

    hazardIncidents.forEach(incident => {
      const description = incident.description || ''
      if (!description.trim()) return

      const factors = detectContributingFactors(description)

      factors.forEach(({ factor, category }) => {
        if (!grouped[factor]) {
          grouped[factor] = { observations: [], category }
        }
        // Avoid duplicate observations
        const exists = grouped[factor].observations.some(
          o => o.description === description && o.date === incident.date
        )
        if (!exists) {
          grouped[factor].observations.push({
            description,
            date: incident.date || incident.observationDate,
            type: incident.type,
            hazard: incident.location
          })
        }
      })
    })

    return grouped
  }, [hazardIncidents])

  // Prepare donut chart data
  const donutData = useMemo(() => {
    return factorData.byCategory.map(item => ({
      ...item,
      color: CONTRIBUTING_FACTOR_COLORS[item.name] || '#64748b'
    }))
  }, [factorData.byCategory])

  // Prepare bar chart data (top 10 factors)
  const barData = useMemo(() => {
    return factorData.byFactor.slice(0, 10).map(item => ({
      ...item,
      color: CONTRIBUTING_FACTOR_COLORS[item.category] || '#64748b'
    }))
  }, [factorData.byFactor])

  // Handle bar click for drill-down
  const handleBarClick = (data) => {
    if (data && data.name) {
      setSelectedFactor(data.name)
      setSelectedCategory(data.category)
    }
  }

  // Empty state
  if (!factorData.byCategory.length || hazardIncidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center p-4">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Layers size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">No contributing factors detected</p>
        <p className="text-xs text-surface-400 mt-1">
          {hazardName
            ? `No systemic factors identified in ${hazardName} observations`
            : 'Select a hazard to view contributing factors'
          }
        </p>
      </div>
    )
  }

  const maxCount = Math.max(...barData.map(d => d.count), 1)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-surface-800">Contributing Factors</h3>
          <p className="text-xs text-surface-500">
            Systemic factors from {hazardIncidents.length} negative observations
          </p>
        </div>
      </div>

      {/* Two-column layout: Donut + Bar chart */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Donut Chart - Category breakdown */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          <p className="text-xs font-medium text-surface-600 mb-2">By Category</p>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="count"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={DonutTooltip} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-surface-800">{factorData.byCategory.length}</p>
                <p className="text-xs text-surface-500">categories</p>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 justify-center">
            {donutData.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-surface-600">{item.name}</span>
                <span className="text-xs text-surface-400">({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Top factors */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          <p className="text-xs font-medium text-surface-600 mb-2">Top Contributing Factors</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, Math.ceil(maxCount * 1.2)]}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#374151' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  width={120}
                />
                <Tooltip content={BarTooltip} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 10, fill: '#374151', fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <p className="text-xs mt-2 text-surface-400">
        Click bars to view observations with that contributing factor
      </p>

      {/* Drill-down modal */}
      <DrillDownModal
        isOpen={!!selectedFactor}
        onClose={() => {
          setSelectedFactor(null)
          setSelectedCategory(null)
        }}
        factorName={selectedFactor}
        categoryName={selectedCategory}
        observations={observationsByFactor[selectedFactor]?.observations || []}
      />
    </div>
  )
}

export default React.memo(ContributingFactorsPanel)
