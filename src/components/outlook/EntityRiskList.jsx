import React, { useState, useMemo, useCallback } from 'react'
import { ChevronRight, Info } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

const SIGNAL_LABEL_MAP = {
  severityMix: 'Severity Mix',
  trend: 'Trend (30d)',
  openActionRate: 'Open Actions',
  highRiskExposure: 'High-Risk Exposure',
  nearMissRate: 'Near-Miss Rate',
  positiveRate: 'Positive Rate'
}

const getRiskBadge = (level) => {
  if (level === 'High') return { bg: 'bg-red-100', text: 'text-red-700' }
  if (level === 'Moderate') return { bg: 'bg-amber-100', text: 'text-amber-700' }
  return { bg: 'bg-green-100', text: 'text-green-700' }
}

const getScoreColor = (score) => {
  if (score > 60) return 'bg-red-500 text-white'
  if (score > 30) return 'bg-amber-500 text-white'
  return 'bg-emerald-500 text-white'
}

/**
 * EntityItem - Individual entity card mirroring HazardItem styling
 */
const EntityItem = React.memo(({ entity, isSelected, onSelect }) => {
  const badge = getRiskBadge(entity.riskLevel)

  const topSignalLabel = useMemo(() => {
    if (!entity.signals) return null
    let topKey = null
    let topScore = -1
    for (const [key, val] of Object.entries(entity.signals)) {
      if (val && typeof val.score === 'number' && val.score > topScore) {
        topScore = val.score
        topKey = key
      }
    }
    return topKey ? SIGNAL_LABEL_MAP[topKey] || topKey : null
  }, [entity.signals])

  return (
    <button
      onClick={() => onSelect(entity)}
      className={`
        w-full flex items-center gap-2 p-2 rounded-lg
        text-left group
        transition-all duration-200 ease-out
        ${isSelected
          ? 'bg-primary-50 border-2 border-primary-400 shadow-sm'
          : 'bg-white hover:bg-surface-50 border-2 border-surface-200 hover:border-surface-300'
        }
      `}
    >
      {/* Score circle */}
      <span className={`flex-shrink-0 w-7 h-7 rounded-full ${getScoreColor(entity.score)} flex items-center justify-center text-xs font-bold`}>
        {entity.score}
      </span>

      {/* Name and subtitle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className={`text-sm truncate transition-colors duration-200 ${isSelected ? 'text-primary-700 font-semibold' : 'text-surface-800 font-medium'}`}>
            {entity.name}
          </p>
          {entity.lowConfidence && (
            <Tooltip content="Low confidence - fewer than 5 incidents" position="top" delay={200}>
              <span className="text-xs text-amber-500">&#9888;</span>
            </Tooltip>
          )}
        </div>
        <p className="text-xs text-surface-500">
          {entity.incidentCount} incident{entity.incidentCount !== 1 ? 's' : ''}
        </p>
        {topSignalLabel && (
          <p className="text-2xs text-surface-400 truncate">
            Top signal: {topSignalLabel}
          </p>
        )}
      </div>

      {/* Risk badge + chevron */}
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span className={`px-1.5 py-0.5 rounded text-2xs font-semibold ${badge.bg} ${badge.text}`}>
            {entity.riskLevel}
          </span>
          <ChevronRight
            size={16}
            className={`transition-colors duration-200 ${isSelected ? 'text-primary-500' : 'text-surface-400 group-hover:text-surface-500'}`}
          />
        </div>
      </div>
    </button>
  )
})

EntityItem.displayName = 'EntityItem'

/**
 * EntityRiskList - Left panel showing sortable list of ranked entities
 * Mirrors HazardList styling and behavior
 */
const EntityRiskList = ({ rankings, selected, onSelect }) => {
  const [sortBy, setSortBy] = useState('risk')

  const handleSelect = useCallback((entity) => {
    onSelect(entity)
  }, [onSelect])

  const sortedEntities = useMemo(() => {
    if (!rankings) return []
    const sorted = [...rankings]

    if (sortBy === 'risk') {
      sorted.sort((a, b) => b.score - a.score)
    } else if (sortBy === 'incidents') {
      sorted.sort((a, b) => b.incidentCount - a.incidentCount)
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    return sorted
  }, [rankings, sortBy])

  if (!rankings || rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Info size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">No entity data available</p>
        <p className="text-xs text-surface-400 mt-1">Import data to see entity rankings</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with sort */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-xs text-surface-500">Select to explore</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs text-surface-600 bg-white border border-surface-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300 transition-colors duration-200"
        >
          <option value="risk">By Risk</option>
          <option value="incidents">By Incidents</option>
          <option value="name">By Name</option>
        </select>
      </div>

      {/* Entity list - scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 scroll-smooth">
        {sortedEntities.map((entity) => (
          <EntityItem
            key={entity.name}
            entity={entity}
            isSelected={selected?.name === entity.name}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(EntityRiskList)
