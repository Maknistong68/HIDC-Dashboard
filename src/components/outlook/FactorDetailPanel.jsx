import React, { useState, useMemo, useEffect } from 'react'
import { AlertCircle, Eye, Copy, Check, X } from 'lucide-react'
import { NEGATIVE_TYPES, detectContributingFactors } from '../../utils/rootCauseEngine'
import { getFactorDailyData } from '../../utils/insightsCalculations'
import HazardTrendChart from './HazardTrendChart'

// Category styling
const CATEGORY_STYLES = {
  'Planning & Procedures': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', bar: 'bg-indigo-500' },
  'Equipment Management': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-500' },
  'PPE': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', bar: 'bg-cyan-500' },
  'Fall Protection': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' },
  'Human Factors': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: 'bg-orange-500' },
  'Training & Competency': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
  'Supervision': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', bar: 'bg-purple-500' },
  'Organizational': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', bar: 'bg-rose-500' },
  'Communication': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', bar: 'bg-teal-500' },
  'Environmental': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' },
  'Lifting & Rigging': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  'Hazardous Materials': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', bar: 'bg-pink-500' },
  'Electrical': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', bar: 'bg-violet-500' },
  'Excavation': { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700', bar: 'bg-stone-500' },
  'Fire Safety': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' },
  'Traffic Management': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', bar: 'bg-slate-500' },
  'Access': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', bar: 'bg-gray-500' },
  'default': { bg: 'bg-surface-50', border: 'border-surface-200', text: 'text-surface-700', bar: 'bg-surface-500' }
}

const getCategoryStyle = (category) => {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.default
}

/**
 * HazardBar - Clickable horizontal bar showing hazard affected by this factor
 */
const HazardBar = ({ hazardName, count, maxCount, onClick, barColor }) => {
  const width = maxCount > 0 ? (count / maxCount) * 100 : 0

  return (
    <button
      onClick={onClick}
      className="w-full group hover:bg-surface-50 rounded-lg p-2 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-surface-700 group-hover:text-primary-600 truncate pr-2">
          {hazardName}
        </span>
        <span className="text-sm font-bold text-surface-600 flex-shrink-0">
          {count}
        </span>
      </div>
      <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(width, 2)}%` }}
        />
      </div>
    </button>
  )
}

/**
 * DrillDownModal - Shows observations for a specific factor + hazard combination
 */
const DrillDownModal = ({ isOpen, onClose, factor, hazard, observations }) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyAll = () => {
    const lines = [
      `FACTORS REPORT`,
      `Factor: ${factor}`,
      `Hazard: ${hazard}`,
      `Total Observations: ${observations.length}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      '─'.repeat(50),
      ''
    ]

    observations.forEach((obs, index) => {
      lines.push(`── Observation #${index + 1} ──`)
      lines.push(`Date: ${obs.date || 'N/A'}`)
      lines.push(`Contractor: ${obs.contractor || 'N/A'}`)
      lines.push(`Site: ${obs.site || 'N/A'}`)
      lines.push(`Type: ${obs.type || 'N/A'}`)
      lines.push(`Description: ${obs.description || 'N/A'}`)
      lines.push('')
    })

    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">{factor}</h3>
            <p className="text-sm text-surface-500">
              {hazard} - {observations.length} observation{observations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
              <X size={18} className="text-surface-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {observations.map((obs, index) => (
            <div key={obs.id || index} className="p-3 bg-surface-50 rounded-lg border border-surface-100">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-surface-500">#{index + 1}</span>
                <span className="text-xs text-surface-400">{obs.date}</span>
              </div>
              <p className="text-sm text-surface-700 leading-relaxed">{obs.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                <span>{obs.contractor || 'Unknown Contractor'}</span>
                <span className="text-surface-300">|</span>
                <span>{obs.site || 'Unknown Site'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * HazardsAffectedPanel - Shows hazards affected by the factor
 */
const HazardsAffectedPanel = ({ factor, hazardsAffected, maxCount, categoryStyle, onHazardClick }) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-800">Hazards Affected</h3>
        <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">
          {hazardsAffected.length} hazard{hazardsAffected.length !== 1 ? 's' : ''}
        </span>
      </div>

      {hazardsAffected.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-sm text-surface-500">No hazard data available for this factor</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1">
          {hazardsAffected.map((hazard) => (
            <HazardBar
              key={hazard.name}
              hazardName={hazard.name}
              count={hazard.count}
              maxCount={maxCount}
              onClick={() => onHazardClick(hazard.name)}
              barColor={categoryStyle.bar}
            />
          ))}
        </div>
      )}

      <div className="flex-shrink-0 pt-3 border-t border-surface-100 mt-3">
        <p className="text-xs text-surface-400 flex items-center gap-1.5">
          <Eye size={12} />
          Click a hazard to view observations
        </p>
      </div>
    </div>
  )
}

/**
 * FactorDetailPanel - Right panel showing factor details with tabs
 */
const FactorDetailPanel = ({ factor, factorData, incidents, timePeriod }) => {
  const [activeTab, setActiveTab] = useState('chart')
  const [selectedDrillDown, setSelectedDrillDown] = useState(null)

  // Calculate chart data for factor trend
  const chartData = useMemo(() => {
    if (!factor || !incidents) return null
    return getFactorDailyData(incidents, factor.name, timePeriod, detectContributingFactors)
  }, [factor, incidents, timePeriod])

  // Get hazards affected by this factor
  const hazardsAffected = useMemo(() => {
    if (!factor || !factorData?.byFactorHazard) return []
    const hazardCounts = factorData.byFactorHazard[factor.name] || {}
    return Object.entries(hazardCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [factor, factorData])

  // Get max count for bar scaling
  const maxCount = useMemo(() => {
    if (hazardsAffected.length === 0) return 0
    return Math.max(...hazardsAffected.map(h => h.count))
  }, [hazardsAffected])

  // Get observations for drill-down
  const getDrillDownObservations = (hazardName) => {
    if (!incidents || !factor) return []
    return incidents.filter(i => {
      if (i.location !== hazardName) return false
      if (!NEGATIVE_TYPES.includes(i.type)) return false
      const detectedFactors = detectContributingFactors(i.description)
      return detectedFactors.some(f => f.factor === factor.name)
    })
  }

  const handleHazardClick = (hazardName) => {
    const observations = getDrillDownObservations(hazardName)
    setSelectedDrillDown({ hazard: hazardName, observations })
  }

  const closeDrillDown = () => setSelectedDrillDown(null)

  const tabs = [
    { id: 'chart', label: 'Trend' },
    { id: 'hazards', label: 'Hazards', count: hazardsAffected.length }
  ]

  // Show placeholder when no factor is selected
  if (!factor) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <AlertCircle size={24} className="text-surface-400" />
          </div>
          <h3 className="text-base font-semibold text-surface-700 mb-1">No Factor Selected</h3>
          <p className="text-sm text-surface-500">Select a factor from the list to view details</p>
        </div>
      </div>
    )
  }

  const categoryStyle = getCategoryStyle(factor.category)

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden">
      {/* Header with factor info */}
      <div className={`px-3 pt-3 pb-2 ${categoryStyle.bg} border-b ${categoryStyle.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-xs font-medium ${categoryStyle.text}`}>
              {factor.category || 'Uncategorized'}
            </span>
          </div>
          <span className="text-xs text-surface-600">
            {factor.count} observation{factor.count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex border-b border-surface-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-sm transition-all duration-150
                ${isActive
                  ? 'text-primary-600 border-b-2 border-primary-500 font-medium'
                  : 'text-surface-500 hover:text-surface-700'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs text-surface-400">· {tab.count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-3 overflow-auto">
        {activeTab === 'chart' && (
          <HazardTrendChart
            data={chartData}
            hazardName={factor?.name}
            timePeriod={timePeriod}
          />
        )}
        {activeTab === 'hazards' && (
          <HazardsAffectedPanel
            factor={factor}
            hazardsAffected={hazardsAffected}
            maxCount={maxCount}
            categoryStyle={categoryStyle}
            onHazardClick={handleHazardClick}
          />
        )}
      </div>

      {/* Drill-down modal */}
      <DrillDownModal
        isOpen={!!selectedDrillDown}
        onClose={closeDrillDown}
        factor={factor.name}
        hazard={selectedDrillDown?.hazard}
        observations={selectedDrillDown?.observations || []}
      />
    </div>
  )
}

export default React.memo(FactorDetailPanel)
