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
import { detectAllCausesUnified } from '../../utils/rootCauseEngine'

import { FACTOR_TYPE } from '../../utils/rootCauseEngine'

// Category colors for Common vs Specific factors
const CATEGORY_COLORS = {
  // ===== COMMON FACTORS (Teal theme) =====
  'Common Factor': '#0d9488',
  'common': '#0d9488',
  'Permit to Work': '#0d9488',
  'PPE': '#14b8a6',
  'Barriers & Signage': '#0f766e',
  'Training & Competency': '#10b981',
  'Housekeeping': '#059669',
  'Supervision': '#047857',
  'Site Access & Security': '#065f46',

  // ===== SPECIFIC FACTORS (Violet/Purple theme) =====
  'Specific Factor': '#7c3aed',
  'specific': '#7c3aed',

  // Working at Height
  'Scaffold deficiency': '#8b5cf6',
  'MEWP malfunction': '#7c3aed',
  'Ladder positioning': '#6d28d9',
  'Guardrail/edge gap': '#5b21b6',
  'Safety net missing': '#4c1d95',
  'Anchor point issue': '#7e22ce',
  'Opening unprotected': '#9333ea',

  // Lifting
  'Rigging deficiency': '#a855f7',
  'Lift plan inadequate': '#9333ea',
  'Crane defect': '#7e22ce',
  'Tag line missing': '#6b21a8',
  'Overload': '#581c87',
  'Load shifting': '#4c1d95',

  // Confined Spaces
  'Atmospheric hazard': '#dc2626',
  'Rescue plan missing': '#b91c1c',
  'Attendant absent': '#991b1b',
  'Ventilation inadequate': '#7f1d1d',
  'Isolation failure': '#ef4444',

  // Energized System
  'LOTO not applied': '#fbbf24',
  'Live exposure': '#f59e0b',
  'Exposed conductor': '#d97706',
  'Panel/enclosure open': '#b45309',
  'Grounding fault': '#92400e',

  // Hot Work
  'Fire watch absent': '#ef4444',
  'Welding screen missing': '#dc2626',
  'Spark escape': '#b91c1c',
  'Cylinder unsecured': '#991b1b',
  'Combustible nearby': '#7f1d1d',

  // Fire
  'Extinguisher missing/expired': '#f97316',
  'Exit blocked': '#ea580c',
  'Alarm failure': '#c2410c',
  'Ignition source': '#9a3412',
  'Fire door propped': '#7c2d12',

  // Mobile Plant & Equipment
  'Banksman absent': '#3b82f6',
  'Exclusion zone breach': '#2563eb',
  'Blind spot': '#1d4ed8',
  'Equipment defect': '#1e40af',
  'Pedestrian conflict': '#1e3a8a',

  // Breaking Ground & Excavation
  'Services not located': '#78716c',
  'Shoring inadequate': '#57534e',
  'Collapse risk': '#44403c',
  'Spoil too close': '#292524',
  'Water ingress': '#1c1917',

  // Temporary Works
  'Design inadequate': '#6366f1',
  'Overloaded': '#4f46e5',
  'Bracing missing': '#4338ca',
  'Foundation unstable': '#3730a3',
  'Strike damage': '#312e81',

  // Driving
  'Speeding': '#ec4899',
  'Seatbelt not worn': '#db2777',
  'Phone use': '#be185d',
  'Driver fatigue': '#9d174d',
  'Vehicle defect': '#831843',

  // Working in Heat
  'Dehydration': '#f59e0b',
  'No rest breaks': '#d97706',
  'No shade': '#b45309',
  'Heat illness signs': '#92400e',
  'Not acclimatized': '#78350f',

  // Working on or Near Water
  'Life jacket missing': '#0ea5e9',
  'Rescue equipment absent': '#0284c7',
  'Strong current': '#0369a1',
  'Vessel defect': '#075985',
  'Lone working': '#0c4a6e',

  // Working on or Near Live Roads
  'Traffic controller absent': '#84cc16',
  'Vehicle incursion risk': '#65a30d',
  'Poor visibility': '#4d7c0f',
  'Inadequate separation': '#3f6212',

  // Explosives & Blasting
  'Shot firer absent': '#dc2626',
  'Misfire risk': '#b91c1c',
  'Blast radius breach': '#991b1b',
  'Flyrock hazard': '#7f1d1d',
  'Warning failure': '#ef4444',

  // Physical Hazard
  'Exposed rebar': '#f97316',
  'Sharp edge': '#ea580c',
  'Struck-by risk': '#c2410c',
  'Pinch point': '#9a3412',
  'Protruding object': '#7c2d12',

  // Mechanical Hazard
  'Guard missing': '#64748b',
  'Rotating parts exposed': '#475569',
  'E-stop absent': '#334155',
  'Unexpected startup': '#1e293b',

  // COSHH (Chemical)
  'SDS missing': '#22c55e',
  'Unlabeled container': '#16a34a',
  'Incompatible storage': '#15803d',
  'Spill uncontained': '#166534',

  // Respiratory Hazard
  'Dust/fume exposure': '#a3a3a3',
  'Wrong RPE type': '#737373',
  'Fit test overdue': '#525252',
  'LEV not working': '#404040',

  // Slip and Trip
  'Wet surface': '#06b6d4',
  'Uneven ground': '#0891b2',
  'Cable across path': '#0e7490',
  'Poor lighting': '#155e75',

  // Tools
  'Tool defective': '#f472b6',
  'Wrong tool for job': '#ec4899',
  'Guard bypassed': '#db2777',
  'Inspection overdue': '#be185d',

  // Traffic Management
  'Route confusion': '#fbbf24',
  'Pedestrian mixing': '#f59e0b',
  'Speed not controlled': '#d97706',
  'Crossing unsafe': '#b45309',

  // Environmental
  'Spill/leak': '#14b8a6',
  'Dust emission': '#0d9488',
  'Noise excessive': '#0f766e',
  'Waste improper': '#115e59',

  // Access
  'Route blocked': '#6366f1',
  'Stair defect': '#4f46e5',
  'Lighting inadequate': '#4338ca',
  'Overcrowded': '#3730a3',

  // Worker Welfare
  'Water unavailable': '#0ea5e9',
  'Toilet unclean': '#0284c7',
  'Rest area missing': '#0369a1',
  'First aid kit empty': '#075985',

  // Noise
  'Hearing zone unmarked': '#a855f7',
  'Source uncontrolled': '#9333ea',
  'Exposure excessive': '#7e22ce',

  // General/Unclassified
  'Unclassified': '#64748b',
  'Multiple factors': '#475569',
  'Not Specified': '#94a3b8'
}

// Color palette for negative (site issues) - fallback
const NEGATIVE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#6366f1', '#dc2626', '#64748b',
  '#22c55e', '#06b6d4', '#a855f7', '#f59e0b', '#84cc16'
]

// Color palette for positive (good practices)
const POSITIVE_COLORS = [
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#64748b'
]

// Negative observation types
const NEGATIVE_TYPES = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr', 'fac', 'mti', 'lti']

// Positive observation types
const POSITIVE_TYPES = ['positive']

/**
 * BarChartTooltip - Extracted outside component to prevent recreation on each render
 */
const BarChartTooltip = ({ active, payload, isPositive }) => {
  if (active && payload && payload.length) {
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
        <p className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-primary-500'}`}>Click to view observations</p>
      </div>
    )
  }
  return null
}

/**
 * DrillDownModal - Shows observations for a selected root cause with rich copy
 */
const DrillDownModal = ({ isOpen, onClose, rootCause, observations, hazardName, colorScheme }) => {
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

  const isPositive = colorScheme === 'green'
  const reportType = isPositive ? 'POSITIVE OBSERVATION' : 'FACTORS'

  const handleCopyAll = () => {
    // Build rich context header
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

    // Build detailed observation list
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

    // Build summary footer
    const footer = [
      '══════════════════════════════════════════════════════════════',
      `END OF REPORT - ${observations.length} observations for "${rootCause}"`,
      '══════════════════════════════════════════════════════════════'
    ].join('\n')

    const fullText = header + observationsList + footer
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Copy single observation with context
  const handleCopySingle = (obs, index) => {
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
  }

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
              {copied ? 'Copied!' : 'Copy All with Context'}
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

        {/* Footer with copy hint */}
        <div className={`px-4 py-2 border-t ${isPositive ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'} rounded-b-xl`}>
          <p className="text-xs text-surface-500 text-center">
            Hover over an observation to copy individually, or use "Copy All with Context" for full report
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * RootCausePanel - Root cause analysis for selected hazard
 * Shows bar chart of root cause distribution with counts and percentages
 * Click on bars to see drill-down of observations
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
  const colors = isPositive ? POSITIVE_COLORS : NEGATIVE_COLORS
  const typeFilter = isPositive ? POSITIVE_TYPES : NEGATIVE_TYPES

  // Get observations grouped by root cause for drill-down (UNIFIED detection)
  const observationsByRootCause = useMemo(() => {
    if (!incidents || !hazardName) return {}

    // Filter by hazard AND observation type
    // Include observations where type matches filter OR type is undefined (unclassified)
    const hazardIncidents = incidents.filter(i => {
      if (i.location !== hazardName) return false
      // Include if type matches filter, or if type is missing and we're looking at negative observations
      // (unclassified observations are typically issues that need attention)
      if (i.type && typeFilter.includes(i.type)) return true
      if (!i.type && !isPositive) return true // Include untyped in negative view
      return false
    })

    const grouped = {}

    hazardIncidents.forEach(incident => {
      const description = incident.description || ''
      if (!description.trim()) return

      // Use UNIFIED detection - gets BOTH physical issues AND contributing factors
      const allCauses = detectAllCausesUnified(description, hazardName)

      if (allCauses.length > 0) {
        // Group by each detected cause
        allCauses.forEach(({ name }) => {
          if (!grouped[name]) {
            grouped[name] = []
          }
          grouped[name].push({
            description,
            date: incident.date || incident.observationDate,
            type: incident.type
          })
        })
      } else {
        // No causes detected
        if (!grouped['Not Specified']) {
          grouped['Not Specified'] = []
        }
        grouped['Not Specified'].push({
          description,
          date: incident.date || incident.observationDate,
          type: incident.type
        })
      }
    })

    return grouped
  }, [incidents, hazardName, typeFilter])

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

  // Prepare chart data - show up to 15 items with category colors
  // Look up color by name first (for consolidated factors), then by category, then fallback
  const chartData = breakdown
    .filter(item => breakdown.length === 1 || item.name !== 'Not Specified')
    .slice(0, 15)
    .map((item, index) => ({
      ...item,
      color: CATEGORY_COLORS[item.name] || CATEGORY_COLORS[item.category] || colors[index % colors.length]
    }))

  // Handle bar click
  const handleBarClick = useCallback((data) => {
    if (data && data.name) {
      setSelectedRootCause(data.name)
    }
  }, [])

  // Memoized tooltip renderer
  const renderTooltip = useCallback((props) => (
    <BarChartTooltip {...props} isPositive={isPositive} />
  ), [isPositive])

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div className="h-full flex flex-col">
      {/* Header with coverage stats */}
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

      {/* Chart with bar labels */}
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
