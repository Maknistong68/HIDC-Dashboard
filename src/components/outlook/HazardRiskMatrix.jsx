import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MapPin,
  Sliders,
  Settings,
  Shield,
  HardHat,
  RotateCcw,
  Calendar,
  X
} from 'lucide-react'
import { SIGNIFICANT_HAZARDS, SUB_SIGNIFICANT_HAZARDS } from '../../utils/constants'
import { getDayOfWeekPatterns, getHourlyPatterns } from '../../utils/insightsCalculations'
import { generateDynamicSliders } from '../insights/ScenarioSimulatorEngine'
import { SEVERITY_WEIGHTS } from '../../utils/calculations'

// ============================================================================
// RISK SCORE CALCULATION (Severity-Weighted)
// ============================================================================

/**
 * Calculate severity-weighted count for a list of incidents
 * Uses SEVERITY_WEIGHTS: LTI=25, MTI=15, FAC=10, NCR=5, Near-Miss=3, default=1
 *
 * This ensures high-severity incidents (LTI, MTI) contribute more to risk score
 * than low-severity observations (unsafe acts/conditions)
 */
const calculateSeverityWeightedCount = (incidents) => {
  if (!incidents?.length) return 0
  return incidents.reduce((sum, incident) => {
    const weight = SEVERITY_WEIGHTS[incident.type] || SEVERITY_WEIGHTS.default || 1
    return sum + weight
  }, 0)
}

/**
 * Calculate risk score for a hazard (0-100)
 *
 * NEW FORMULA (Severity-Weighted):
 * - 40% Severity-weighted volume (LTI counts more than near-miss)
 * - 30% Trend direction (rising/stable/declining)
 * - 30% Hazard significance (14 significant hazards)
 *
 * This replaces the old 33/33/33 raw-count formula to ensure
 * hazards with actual injuries rank higher than high-volume low-severity hazards.
 */
const calculateRiskScore = (hazard, maxWeightedCount, maxRawCount) => {
  // 40% - Severity-weighted volume score
  // Uses weighted count (LTI=25pts, near-miss=3pts, observation=1pt)
  const weightedCount = hazard.severityWeightedCount || 0
  const volumeScore = maxWeightedCount > 0 ? (weightedCount / maxWeightedCount) * 40 : 0

  // 30% - Trend score
  let trendScore = 15 // Stable baseline
  const level = hazard.trendLevel?.level
  if (level === 'significant-rise' || level === 'rising') {
    trendScore = 30 // Max for rising trend
  } else if (level === 'declining' || level === 'significant-decline') {
    trendScore = 0 // No points for declining
  }

  // 30% - Significance score (based on hazard category)
  let significanceScore = 0
  if (SIGNIFICANT_HAZARDS.includes(hazard.name)) {
    significanceScore = 30 // Full points for 14 significant hazards
  } else if (SUB_SIGNIFICANT_HAZARDS.includes(hazard.name)) {
    significanceScore = 15 // Half points for sub-significant
  }

  return Math.round(volumeScore + trendScore + significanceScore)
}

/**
 * Get cell color based on grid position with improved contrast
 */
const getCellColor = (row, col) => {
  const positionScore = (4 - row) + (4 - col)
  if (positionScore >= 6) return {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-900',
    hover: 'hover:bg-red-100',
    badge: 'bg-red-600',
    shadow: 'shadow-md shadow-red-200/50',
    level: 'critical'
  }
  if (positionScore >= 4) return {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-900',
    hover: 'hover:bg-amber-100',
    badge: 'bg-amber-600',
    shadow: 'shadow-sm shadow-amber-200/50',
    level: 'high'
  }
  if (positionScore >= 2) return {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    hover: 'hover:bg-yellow-100',
    badge: 'bg-yellow-500',
    shadow: '',
    level: 'medium'
  }
  return {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    hover: 'hover:bg-emerald-100',
    badge: 'bg-emerald-500',
    shadow: '',
    level: 'low'
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TrendIndicator = ({ trend, size = 12 }) => {
  const level = trend?.level
  if (level === 'significant-rise' || level === 'rising') {
    return <TrendingUp size={size} className="text-red-600" strokeWidth={2.5} />
  }
  if (level === 'declining' || level === 'significant-decline') {
    return <TrendingDown size={size} className="text-green-600" strokeWidth={2.5} />
  }
  return <Minus size={size} className="text-surface-400" strokeWidth={2} />
}

/**
 * SeverityDots - Shows small colored dots for incident types
 */
const SeverityDots = ({ incidents }) => {
  if (!incidents?.length) return null

  // Count by severity type
  const counts = { lti: 0, mti: 0, fac: 0, 'near-miss': 0 }
  incidents.forEach(i => {
    if (counts.hasOwnProperty(i.type)) counts[i.type]++
  })

  const hasRecordable = counts.lti > 0 || counts.mti > 0 || counts.fac > 0

  if (!hasRecordable) return null

  return (
    <div className="absolute -top-1 -right-1 flex gap-0.5">
      {counts.lti > 0 && (
        <div className="w-2.5 h-2.5 rounded-full bg-red-600 ring-1 ring-white" title={`${counts.lti} LTI`} />
      )}
      {counts.mti > 0 && (
        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-1 ring-white" title={`${counts.mti} MTI`} />
      )}
      {counts.fac > 0 && (
        <div className="w-2 h-2 rounded-full bg-yellow-500 ring-1 ring-white" title={`${counts.fac} FAC`} />
      )}
    </div>
  )
}

/**
 * MatrixCell - Wide aspect ratio cell (16:9-ish) with rank badge and severity indicators
 */
const MatrixCell = ({ hazard, row, col, onClick, rank }) => {
  const colors = getCellColor(row, col)
  const isCritical = colors.level === 'critical'
  const isHigh = colors.level === 'high'

  if (!hazard) {
    return (
      <div className={`aspect-[16/10] w-full rounded-md ${colors.bg} ${colors.border} border opacity-20`} />
    )
  }

  return (
    <button
      onClick={() => onClick(hazard, row, col)}
      className={`aspect-[16/10] w-full rounded-md ${colors.bg} ${colors.border}
                  ${isCritical ? 'border-2' : 'border'}
                  ${colors.shadow}
                  px-2 py-1.5 relative
                  flex flex-col items-center justify-center text-center
                  transition-all duration-150 ${colors.hover}
                  hover:scale-[1.01] hover:shadow-md
                  cursor-pointer group`}
      title={`#${rank} ${hazard.name} - ${hazard.totalCount} observations (Risk: ${hazard.riskScore || 0})`}
    >
      {/* Rank Badge - smaller */}
      <div className={`absolute -top-1 -left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full ${colors.badge}
                       flex items-center justify-center shadow-sm
                       ${isCritical || isHigh ? 'ring-1 ring-white' : ''}`}>
        <span className="text-[8px] sm:text-[9px] font-bold text-white">{rank}</span>
      </div>

      {/* Severity Dots - top right */}
      <SeverityDots incidents={hazard.incidents} />

      {/* Hazard Name - larger font */}
      <span className={`text-sm sm:text-base font-semibold ${colors.text} leading-snug line-clamp-2`}>
        {hazard.name}
      </span>

      {/* Risk Score and Trend - inline */}
      <div className="flex items-center gap-1 mt-0.5">
        <TrendIndicator trend={hazard.trendLevel} size={14} />
        <span className={`text-lg sm:text-xl font-bold ${colors.text}`}>{hazard.riskScore || 0}</span>
      </div>
    </button>
  )
}

const Legend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-surface-600">
    {/* Risk Level Legend */}
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-[10px] text-surface-400 uppercase tracking-wider">Risk:</span>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded bg-red-50 border-2 border-red-400 shadow-sm" />
        <span className="font-medium text-red-700">Critical</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded bg-amber-50 border border-amber-400" />
        <span className="font-medium text-amber-700">High</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-400" />
        <span className="font-medium text-yellow-700">Medium</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300" />
        <span className="font-medium text-emerald-700">Low</span>
      </div>
    </div>
    {/* Severity Dots Legend */}
    <div className="flex items-center gap-2 sm:gap-3 border-l border-surface-200 pl-3">
      <span className="text-[10px] text-surface-400 uppercase tracking-wider">Severity:</span>
      <div className="flex items-center gap-1">
        <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
        <span className="text-red-700">LTI</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
        <span className="text-orange-700">MTI</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <span className="text-yellow-700">FAC</span>
      </div>
    </div>
  </div>
)

// ============================================================================
// MODAL DETAIL COMPONENTS
// ============================================================================

const FactorSlider = ({ slider, value, onChange }) => {
  const normalizedValue = ((value + 50) / 150) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-surface-700">{slider.label}</span>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
          value > 0 ? 'bg-green-100 text-green-700' : value < 0 ? 'bg-red-100 text-red-700' : 'text-surface-500'
        }`}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <div className="relative">
        <div className="absolute inset-0 h-2 rounded-full bg-surface-200" style={{ top: '50%', transform: 'translateY(-50%)' }} />
        <div className="absolute h-3 w-0.5 bg-surface-400 rounded-full" style={{ left: '33.33%', top: '50%', transform: 'translateY(-50%)' }} />
        <div
          className={`absolute h-2 rounded-full ${value >= 0 ? 'bg-green-400' : 'bg-red-400'} transition-all duration-150`}
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            left: value >= 0 ? '33.33%' : `${normalizedValue}%`,
            width: value >= 0 ? `${(value / 100) * 66.67}%` : `${33.33 - normalizedValue}%`
          }}
        />
        <input
          type="range"
          min="-50"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="relative w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-surface-400">
        <span>-50%</span>
        <span>0</span>
        <span>+100%</span>
      </div>
    </div>
  )
}

const ImpactScoreCard = ({ impactScore, factorsAddressed, confidence }) => {
  const hasImpact = impactScore > 0
  let impactLevel = 'none', impactColor = 'text-surface-500', impactBg = 'bg-surface-50 border-surface-200'
  if (impactScore >= 40) { impactLevel = 'High'; impactColor = 'text-green-700'; impactBg = 'bg-green-50 border-green-200' }
  else if (impactScore >= 20) { impactLevel = 'Moderate'; impactColor = 'text-blue-700'; impactBg = 'bg-blue-50 border-blue-200' }
  else if (impactScore > 0) { impactLevel = 'Low'; impactColor = 'text-amber-700'; impactBg = 'bg-amber-50 border-amber-200' }

  return (
    <div className={`rounded-lg p-4 border ${impactBg}`}>
      <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Intervention Impact</h4>
      <div className="space-y-3 text-center">
        <div className={`text-3xl font-bold ${impactColor}`}>{hasImpact ? `${impactScore}%` : '—'}</div>
        <div className={`text-xs font-medium ${impactColor}`}>{hasImpact ? `${impactLevel} Impact` : 'Adjust sliders'}</div>
        {hasImpact && (
          <div className="bg-white/60 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1">
              <Shield size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Risk Reduction Potential</span>
            </div>
          </div>
        )}
        {factorsAddressed > 0 && <div className="text-xs text-surface-600"><span className="font-semibold">{factorsAddressed}</span> factor{factorsAddressed > 1 ? 's' : ''} addressed</div>}
        {confidence && <div className="text-[10px] text-surface-400">Confidence: {confidence}%</div>}
      </div>
    </div>
  )
}

const QuickActionButton = ({ label, icon: Icon, onClick, isActive, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'ring-2 ring-primary-400 ' + colorClass : colorClass + ' opacity-80 hover:opacity-100'}`}
  >
    <Icon size={14} />
    {label}
  </button>
)

/**
 * Get risk level from grid position
 */
const getRiskLevel = (position) => {
  if (position < 0) return { level: 'Critical', color: 'text-red-700', bg: 'bg-red-50' }
  const row = Math.floor(position / 5)
  const col = position % 5
  const positionScore = (4 - row) + (4 - col)
  if (positionScore >= 6) return { level: 'Critical', color: 'text-red-700', bg: 'bg-red-50' }
  if (positionScore >= 4) return { level: 'High', color: 'text-amber-700', bg: 'bg-amber-50' }
  if (positionScore >= 2) return { level: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-50' }
  return { level: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50' }
}

/**
 * MiniMatrixComparison - Visual comparison of current vs projected position
 */
const MiniMatrixComparison = ({ currentRank, projectedRank, impactScore }) => {
  const currentPosition = currentRank - 1
  const projectedPosition = projectedRank - 1
  const improvement = currentRank - projectedRank
  const currentLevel = getRiskLevel(currentPosition)
  const projectedLevel = getRiskLevel(projectedPosition)
  const hasChange = improvement !== 0 && impactScore > 0

  // Generate cell colors for mini matrix
  const getCellBg = (idx) => {
    const row = Math.floor(idx / 5)
    const col = idx % 5
    const positionScore = (4 - row) + (4 - col)
    if (positionScore >= 6) return 'bg-red-400'
    if (positionScore >= 4) return 'bg-amber-400'
    if (positionScore >= 2) return 'bg-yellow-400'
    return 'bg-emerald-400'
  }

  return (
    <div className="bg-surface-50 rounded-lg p-4 mt-4">
      <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-4 text-center">
        Ranking Comparison
      </h4>

      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Current Position Mini Matrix */}
        <div className="text-center">
          <p className="text-[10px] font-medium text-surface-500 mb-2 uppercase tracking-wider">Current</p>
          <div className="grid grid-cols-5 gap-0.5 w-20 sm:w-24 mx-auto">
            {Array.from({ length: 25 }).map((_, idx) => (
              <div
                key={`current-${idx}`}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-all duration-300
                  ${getCellBg(idx)}
                  ${idx === currentPosition
                    ? 'ring-2 ring-white shadow-lg scale-125 z-10'
                    : 'opacity-30'
                  }`}
              />
            ))}
          </div>
          <p className={`text-xs font-bold mt-2 ${currentLevel.color}`}>
            #{currentRank} {currentLevel.level}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl sm:text-2xl text-surface-300">→</span>
        </div>

        {/* Projected Position Mini Matrix */}
        <div className="text-center">
          <p className="text-[10px] font-medium text-surface-500 mb-2 uppercase tracking-wider">Projected</p>
          <div className="grid grid-cols-5 gap-0.5 w-20 sm:w-24 mx-auto">
            {Array.from({ length: 25 }).map((_, idx) => (
              <div
                key={`projected-${idx}`}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-all duration-300
                  ${getCellBg(idx)}
                  ${hasChange && idx === projectedPosition
                    ? 'ring-2 ring-white shadow-lg scale-125 z-10 animate-pulse'
                    : hasChange
                      ? 'opacity-30'
                      : idx === currentPosition
                        ? 'ring-2 ring-white shadow-lg scale-125 z-10'
                        : 'opacity-30'
                  }`}
              />
            ))}
          </div>
          <p className={`text-xs font-bold mt-2 ${hasChange ? projectedLevel.color : 'text-surface-400'}`}>
            {hasChange ? `#${projectedRank} ${projectedLevel.level}` : '—'}
          </p>
        </div>
      </div>

      {/* Summary */}
      {hasChange && (
        <div className={`text-center mt-4 p-2 rounded-lg ${improvement > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <span className={`text-sm font-semibold ${improvement > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {improvement > 0 ? '▼' : '▲'}{Math.abs(improvement)} position{Math.abs(improvement) > 1 ? 's' : ''} {improvement > 0 ? 'improvement' : 'worsening'}
          </span>
          {currentLevel.level !== projectedLevel.level && (
            <p className="text-xs text-surface-500 mt-1">
              {currentLevel.level} → {projectedLevel.level}
            </p>
          )}
        </div>
      )}

      {!hasChange && (
        <div className="text-center mt-4 p-2 bg-surface-100 rounded-lg">
          <span className="text-sm text-surface-500">Adjust sliders to see projected impact</span>
        </div>
      )}
    </div>
  )
}

const SimulationPanel = ({ currentHazard, hazardIncidents, factorData, currentRank, allHazards }) => {
  const [sliders, setSliders] = useState({})
  const [activeQuickAction, setActiveQuickAction] = useState(null)

  const dynamicSliders = useMemo(() => {
    if (!factorData?.byFactor || !hazardIncidents?.length) return []
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))
    const hazardFactors = factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return { name: factor.name, count: matchingIncidents.length, hazards: { [currentHazard?.name]: matchingIncidents.length } }
      })
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
    const result = generateDynamicSliders({ byFactor: hazardFactors }, currentHazard?.name, hazardIncidents.length)
    return (result.sliders || result).slice(0, 5)
  }, [factorData, currentHazard, hazardIncidents])

  const projection = useMemo(() => {
    if (!Object.keys(sliders).length || !dynamicSliders.length) return { impactScore: 0, factorsAddressed: 0, breakdown: [] }
    let totalEffect = 0
    const breakdown = []
    for (const slider of dynamicSliders) {
      const sliderValue = sliders[slider.id] || 0
      if (sliderValue === 0) continue
      const hazardPrevalence = slider.prevalence || 0
      const effectivenessMultiplier = { engineering: 0.85, administrative: 0.60, ppe: 0.40, environmental: 0.55 }[slider.categoryKey] || 0.50
      const impact = (hazardPrevalence / 100) * effectivenessMultiplier * (sliderValue / 100) * 1.5 * 100
      if (impact > 0.1) {
        breakdown.push({ factor: slider.factor, label: slider.label, sliderValue, impact: Math.round(impact * 10) / 10, prevalence: hazardPrevalence })
        totalEffect += impact
      }
    }
    return { impactScore: Math.round(Math.min(70, Math.max(0, totalEffect)) * 10) / 10, factorsAddressed: breakdown.length, breakdown }
  }, [sliders, dynamicSliders])

  // Calculate projected rank based on intervention impact
  const projectedRank = useMemo(() => {
    if (projection.impactScore === 0 || !allHazards?.length || !currentHazard) return currentRank
    // Reduce current hazard's risk score by intervention impact
    const currentScore = currentHazard.riskScore || 50
    const projectedScore = currentScore * (1 - projection.impactScore / 100)
    // Count how many hazards would rank higher after intervention
    let newRank = 1
    for (const h of allHazards) {
      if (h.name !== currentHazard.name && (h.riskScore || 0) > projectedScore) newRank++
    }
    return Math.min(newRank, 25)
  }, [projection.impactScore, allHazards, currentHazard, currentRank])

  const applyQuickAction = (type) => {
    if (activeQuickAction === type) { setSliders({}); setActiveQuickAction(null); return }
    const presets = { engineering: { barriers: 50, guards: 50, devices: 50 }, admin: { training: 50, supervision: 50, inspections: 50 }, ppe: { ppe: 50 } }
    const validSliderIds = new Set(dynamicSliders.map(s => s.id))
    const filtered = {}
    for (const [key, val] of Object.entries(presets[type] || {})) { if (validSliderIds.has(key)) filtered[key] = val }
    if (Object.keys(filtered).length === 0 && dynamicSliders.length > 0) dynamicSliders.forEach(s => { filtered[s.id] = 50 })
    setSliders(filtered)
    setActiveQuickAction(type)
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-surface-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap items-center gap-2">
          <QuickActionButton label="+50% Eng" icon={Settings} onClick={() => applyQuickAction('engineering')} isActive={activeQuickAction === 'engineering'} colorClass="bg-blue-100 text-blue-700 hover:bg-blue-200" />
          <QuickActionButton label="+50% Admin" icon={Shield} onClick={() => applyQuickAction('admin')} isActive={activeQuickAction === 'admin'} colorClass="bg-indigo-100 text-indigo-700 hover:bg-indigo-200" />
          <QuickActionButton label="+50% PPE" icon={HardHat} onClick={() => applyQuickAction('ppe')} isActive={activeQuickAction === 'ppe'} colorClass="bg-amber-100 text-amber-700 hover:bg-amber-200" />
          {Object.keys(sliders).length > 0 && (
            <button onClick={() => { setSliders({}); setActiveQuickAction(null) }} className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700 ml-2">
              <RotateCcw size={12} />Reset
            </button>
          )}
        </div>
      </div>

      {/* Intervention Sliders */}
      {dynamicSliders.length > 0 ? (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Intervention Sliders</h4>
          <div className="space-y-3">
            {dynamicSliders.map(slider => (
              <FactorSlider
                key={slider.id}
                slider={slider}
                value={sliders[slider.id] || 0}
                onChange={(v) => setSliders(s => ({ ...s, [slider.id]: v }))}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface-50 rounded-lg p-4 text-center">
          <p className="text-sm text-surface-500">No controllable factors detected for this hazard.</p>
        </div>
      )}

      {/* Mini Matrix Comparison */}
      <MiniMatrixComparison
        currentRank={currentRank}
        projectedRank={projectedRank}
        impactScore={projection.impactScore}
      />
    </div>
  )
}


// ============================================================================
// CENTER HAZARD CARD - Shows severity breakdown (Pyramid visualization)
// ============================================================================

const CenterHazardCard = ({ hazard, hazardIncidents, cellColor, trend, trendDetails }) => {
  // Calculate severity breakdown
  const severityBreakdown = useMemo(() => {
    if (!hazardIncidents?.length) return { lti: 0, mti: 0, fac: 0, nearMiss: 0, observations: 0, total: 0, weightedScore: 0 }

    const counts = { lti: 0, mti: 0, fac: 0, nearMiss: 0, observations: 0 }
    let weightedScore = 0

    hazardIncidents.forEach(i => {
      const type = i.type?.toLowerCase()
      const weight = SEVERITY_WEIGHTS[type] || SEVERITY_WEIGHTS.default || 1
      weightedScore += weight

      if (type === 'lti') counts.lti++
      else if (type === 'mti') counts.mti++
      else if (type === 'fac') counts.fac++
      else if (type === 'near-miss') counts.nearMiss++
      else counts.observations++
    })

    return { ...counts, total: hazardIncidents.length, weightedScore }
  }, [hazardIncidents])

  const hasRecordable = severityBreakdown.lti > 0 || severityBreakdown.mti > 0 || severityBreakdown.fac > 0

  return (
    <div className={`${cellColor?.bg || 'bg-primary-50'} ${cellColor?.border || 'border-primary-300'} border-2 rounded-2xl p-5 shadow-md`}>
      {/* Top Row: Trend Badge + Risk Score */}
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${trend.bg}`}>
          <TrendIndicator trend={hazard?.trendLevel} size={14} />
          <span className={`text-xs font-semibold ${trend.color}`}>{trend.label}</span>
          {trendDetails.changePercent !== 0 && (
            <span className={`text-xs ${trend.color}`}>
              {trendDetails.changePercent > 0 ? '+' : ''}{trendDetails.changePercent}%
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-surface-400 uppercase">Risk Score</p>
          <p className={`text-lg font-bold ${cellColor?.text || 'text-primary-700'}`}>{hazard?.riskScore || 0}</p>
        </div>
      </div>

      {/* Hazard Name */}
      <h2 className={`text-xl font-bold leading-tight text-center ${cellColor?.text || 'text-primary-800'}`}>
        {hazard?.name}
      </h2>

      {/* Total Count */}
      <div className="text-center mt-2 mb-4">
        <p className="text-3xl font-black text-surface-800">{severityBreakdown.total}</p>
        <p className="text-xs text-surface-500 uppercase tracking-wider">total observations</p>
      </div>

      {/* Severity Breakdown - Pyramid Style */}
      <div className="bg-white/60 rounded-xl p-3">
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-2 text-center">
          Severity Breakdown
        </p>

        {/* Pyramid rows */}
        <div className="space-y-1.5">
          {/* LTI - Top of pyramid (most severe) */}
          {severityBreakdown.lti > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-100 px-3 py-1 rounded-full">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-xs font-bold text-red-700">{severityBreakdown.lti} LTI</span>
                <span className="text-[10px] text-red-500">×1000</span>
              </div>
            </div>
          )}

          {/* MTI */}
          {severityBreakdown.mti > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-orange-100 px-3 py-1 rounded-full">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-xs font-bold text-orange-700">{severityBreakdown.mti} MTI</span>
                <span className="text-[10px] text-orange-500">×500</span>
              </div>
            </div>
          )}

          {/* FAC */}
          {severityBreakdown.fac > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs font-bold text-yellow-700">{severityBreakdown.fac} FAC</span>
                <span className="text-[10px] text-yellow-600">×100</span>
              </div>
            </div>
          )}

          {/* Near Miss */}
          {severityBreakdown.nearMiss > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-blue-700">{severityBreakdown.nearMiss} Near Miss</span>
                <span className="text-[10px] text-blue-500">×50</span>
              </div>
            </div>
          )}

          {/* Observations - Base of pyramid */}
          {severityBreakdown.observations > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-surface-100 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-surface-400" />
                <span className="text-xs text-surface-600">{severityBreakdown.observations} Observations</span>
                <span className="text-[10px] text-surface-400">×1</span>
              </div>
            </div>
          )}
        </div>

        {/* Weighted Score Summary */}
        <div className="mt-3 pt-2 border-t border-surface-200 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-surface-500">Weighted Score:</span>
            <span className={`text-sm font-bold ${hasRecordable ? 'text-red-600' : 'text-surface-700'}`}>
              {severityBreakdown.weightedScore}
            </span>
          </div>
          {hasRecordable && (
            <p className="text-[10px] text-red-500 mt-1">
              ⚠️ Contains recordable incidents
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CONNECTED HUB DIAGRAM - Infographic layout with WHEN | HAZARD | WHERE
// ============================================================================

const ConnectedHubDiagram = ({
  hazard,
  hazardIncidents,
  hazardFactors,
  dayPatterns,
  hourPatterns,
  siteClassifications,
  cellColor
}) => {
  // Calculate WHERE data: top 2 sites/contractors
  const whereData = useMemo(() => {
    if (!hazardIncidents?.length) return { sites: [], contractors: [] }

    const siteCounts = {}
    const contractorCounts = {}
    hazardIncidents.forEach(i => {
      const site = i.site || 'Unknown'
      const contractor = i.contractor || i.contractorName || 'Unknown'
      siteCounts[site] = (siteCounts[site] || 0) + 1
      contractorCounts[contractor] = (contractorCounts[contractor] || 0) + 1
    })

    const sites = Object.entries(siteCounts)
      .map(([name, count]) => ({ name, pct: Math.round((count / hazardIncidents.length) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2)

    const contractors = Object.entries(contractorCounts)
      .map(([name, count]) => ({ name, pct: Math.round((count / hazardIncidents.length) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2)

    return { sites, contractors }
  }, [hazardIncidents])

  // Calculate WHEN data: peak day and shift with deviation %
  const whenData = useMemo(() => {
    const result = { day: null, shift: null }

    if (dayPatterns?.hasData && dayPatterns.patterns?.length > 0) {
      const sortedDays = [...dayPatterns.patterns].sort((a, b) => b.count - a.count)
      const peakDay = sortedDays[0]
      if (peakDay && peakDay.count > 0) {
        result.day = { label: peakDay.day, deviation: Math.round(peakDay.riskIndex - 100) }
      }
    }

    if (hourPatterns?.hasData && hourPatterns.shifts?.length > 0) {
      const sortedShifts = [...hourPatterns.shifts].sort((a, b) => b.count - a.count)
      const peakShift = sortedShifts[0]
      if (peakShift && peakShift.count > 0) {
        result.shift = {
          label: peakShift.key.charAt(0).toUpperCase() + peakShift.key.slice(1),
          deviation: Math.round(peakShift.riskIndex - 100)
        }
      }
    }

    return result
  }, [dayPatterns, hourPatterns])

  // Trend configuration
  const trendConfig = {
    'significant-rise': { label: 'RISING', color: 'text-red-700', bg: 'bg-red-100', icon: 'text-red-600' },
    'rising': { label: 'RISING', color: 'text-red-700', bg: 'bg-red-100', icon: 'text-red-600' },
    'stable': { label: 'STABLE', color: 'text-surface-700', bg: 'bg-surface-100', icon: 'text-surface-500' },
    'new': { label: 'NEW', color: 'text-blue-700', bg: 'bg-blue-100', icon: 'text-blue-600' },
    'declining': { label: 'DECLINING', color: 'text-green-700', bg: 'bg-green-100', icon: 'text-green-600' },
    'significant-decline': { label: 'DECLINING', color: 'text-green-700', bg: 'bg-green-100', icon: 'text-green-600' }
  }
  const trend = trendConfig[hazard?.trendLevel?.level] || trendConfig.stable

  const hasWhenData = whenData.day || whenData.shift
  const hasWhereData = whereData.sites.length > 0 || whereData.contractors.length > 0

  // Calculate trend details for bottom card
  const trendDetails = useMemo(() => {
    const currentCount = hazard?.currentPeriodCount ?? hazardIncidents?.length ?? 0
    const previousCount = hazard?.previousPeriodCount ?? 0
    const changePercent = hazard?.changePercent ?? 0

    return {
      currentCount,
      previousCount,
      changePercent: Math.round(changePercent),
      direction: changePercent > 5 ? 'rising' : changePercent < -5 ? 'declining' : 'stable'
    }
  }, [hazard, hazardIncidents])

  return (
    <div className="space-y-4">
      {/* TOP ROW: WHEN + WHERE side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* WHEN Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar size={16} className="text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">When</p>
          </div>
          {hasWhenData ? (
            <div className="space-y-3">
              {whenData.day && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Peak Day</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{whenData.day.label}</p>
                    <p className={`text-[10px] font-semibold ${whenData.day.deviation > 0 ? 'text-red-500' : whenData.day.deviation < 0 ? 'text-green-500' : 'text-surface-400'}`}>
                      {whenData.day.deviation > 0 ? '+' : ''}{whenData.day.deviation}% vs avg
                    </p>
                  </div>
                </div>
              )}
              {whenData.shift && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Peak Shift</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{whenData.shift.label}</p>
                    <p className={`text-[10px] font-semibold ${whenData.shift.deviation > 0 ? 'text-red-500' : whenData.shift.deviation < 0 ? 'text-green-500' : 'text-surface-400'}`}>
                      {whenData.shift.deviation > 0 ? '+' : ''}{whenData.shift.deviation}% vs avg
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-surface-400 italic text-center py-2">No temporal data</p>
          )}
        </div>

        {/* WHERE Card */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin size={16} className="text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Where</p>
          </div>
          {hasWhereData ? (
            <div className="space-y-2">
              {whereData.sites.slice(0, 2).map((site, idx) => {
                const isUnknown = site.name === 'Unknown'
                return (
                  <div key={`site-${idx}`} className="flex items-center justify-between">
                    <span
                      className={`text-xs truncate max-w-[60%] ${isUnknown ? 'text-surface-400 italic' : 'text-surface-600'}`}
                      title={site.name}
                    >
                      {site.name}
                    </span>
                    <span className={`text-sm font-semibold ${isUnknown ? 'text-surface-400' : 'text-purple-600'}`}>
                      {site.pct}%
                    </span>
                  </div>
                )
              })}

              {/* Divider if both sites and contractors exist */}
              {whereData.sites.length > 0 && whereData.contractors.length > 0 && (
                <div className="border-t border-purple-200 my-2" />
              )}

              {/* Top Contractor */}
              {whereData.contractors.slice(0, 1).map((contractor, idx) => {
                const isUnknown = contractor.name === 'Unknown'
                return (
                  <div key={`contractor-${idx}`} className="flex items-center justify-between">
                    <span className="text-xs text-surface-500">Top Contractor</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs truncate max-w-[80px] ${isUnknown ? 'text-surface-400 italic' : 'text-surface-600'}`}
                        title={contractor.name}
                      >
                        {contractor.name}
                      </span>
                      <span className={`text-sm font-semibold ${isUnknown ? 'text-surface-400' : 'text-purple-600'}`}>
                        {contractor.pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-surface-400 italic text-center py-2">No location data</p>
          )}
        </div>
      </div>

      {/* Connector arrows pointing down to center */}
      <div className="flex justify-center gap-24 -my-1">
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-3 bg-surface-300" />
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-surface-300" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-3 bg-surface-300" />
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-surface-300" />
        </div>
      </div>

      {/* CENTER: Main Hazard Card with severity breakdown */}
      <CenterHazardCard
        hazard={hazard}
        hazardIncidents={hazardIncidents}
        cellColor={cellColor}
        trend={trend}
        trendDetails={trendDetails}
      />

      {/* Connector arrows pointing down from center */}
      <div className="flex justify-center gap-24 -my-1">
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-surface-300" />
          <div className="w-0.5 h-3 bg-surface-300" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-surface-300" />
          <div className="w-0.5 h-3 bg-surface-300" />
        </div>
      </div>

      {/* BOTTOM ROW: Contributing Factors + Trend Details side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contributing Factors Card */}
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <h3 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Contributing Factors</h3>
          {hazardFactors?.length > 0 ? (
            <div className="space-y-2">
              {hazardFactors.map((factor, idx) => (
                <div key={factor.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-surface-400 w-3">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-surface-800 truncate">{factor.name}</span>
                      <span className="text-[10px] font-semibold text-primary-600 ml-2">{Math.round(factor.percentage)}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-400 rounded-full transition-all" style={{ width: `${Math.min(100, factor.percentage)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-surface-400 italic text-center py-4">No factors detected</p>
          )}
        </div>

        {/* Trend Details Card */}
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <h3 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Period Comparison</h3>
          <div className="space-y-3">
            {/* Current vs Previous */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">Current Period</span>
              <span className="text-lg font-bold text-surface-800">{trendDetails.currentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">Previous Period</span>
              <span className="text-lg font-medium text-surface-500">{trendDetails.previousCount || '—'}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-surface-100" />

            {/* Change indicator */}
            <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${
              trendDetails.direction === 'rising' ? 'bg-red-50' :
              trendDetails.direction === 'declining' ? 'bg-green-50' : 'bg-surface-50'
            }`}>
              {trendDetails.direction === 'rising' && <TrendingUp size={16} className="text-red-600" />}
              {trendDetails.direction === 'declining' && <TrendingDown size={16} className="text-green-600" />}
              {trendDetails.direction === 'stable' && <Minus size={16} className="text-surface-500" />}
              <span className={`text-sm font-semibold ${
                trendDetails.direction === 'rising' ? 'text-red-700' :
                trendDetails.direction === 'declining' ? 'text-green-700' : 'text-surface-600'
              }`}>
                {trendDetails.changePercent > 0 ? '+' : ''}{trendDetails.changePercent}% change
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// DRILL-DOWN MODAL (Horizontal 2-Section Layout)
// ============================================================================

const HazardDetailModal = ({
  isOpen,
  onClose,
  hazard,
  hazardIncidents,
  hazardFactors,
  dayPatterns,
  hourPatterns,
  factorData,
  siteClassifications,
  cellColor,
  currentRank,
  allHazards
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    previousActiveElement.current = document.activeElement
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    if (modalRef.current) modalRef.current.focus()
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      if (previousActiveElement.current?.focus) previousActiveElement.current.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen || !hazard) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-[1600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in"
      >
        {/* Minimal Header - Close button only */}
        <div className="flex-shrink-0 bg-surface-50 border-b border-surface-200 px-4 py-3 rounded-t-2xl flex items-center justify-end">
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors" aria-label="Close modal">
            <X size={20} className="text-surface-600" />
          </button>
        </div>

        {/* Content - Horizontal 2-Section Split */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN: Connected Hub Diagram (Diamond Layout) */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider border-b border-surface-200 pb-2">
                Current State
              </h3>
              <ConnectedHubDiagram
                hazard={hazard}
                hazardIncidents={hazardIncidents}
                hazardFactors={hazardFactors}
                dayPatterns={dayPatterns}
                hourPatterns={hourPatterns}
                siteClassifications={siteClassifications}
                cellColor={cellColor}
              />
            </div>

            {/* RIGHT COLUMN: Predictive Simulation */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider border-b border-surface-200 pb-2 flex items-center gap-2">
                <Sliders size={14} className="text-primary-500" />
                Predictive Simulation
              </h3>
              <SimulationPanel
                currentHazard={hazard}
                hazardIncidents={hazardIncidents}
                factorData={factorData}
                currentRank={currentRank}
                allHazards={allHazards}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HazardRiskMatrix = ({
  sortedHazards,
  negativeIncidents,
  filteredIncidents,
  factorData,
  period,
  siteClassifications = {}
}) => {
  const [selectedHazard, setSelectedHazard] = useState(null)
  const [selectedCellColor, setSelectedCellColor] = useState(null)
  const [selectedRank, setSelectedRank] = useState(1)

  const rankedHazards = useMemo(() => {
    if (!sortedHazards?.length) return []

    // Step 1: Group incidents by hazard and calculate severity-weighted counts
    const hazardIncidentMap = new Map()
    if (negativeIncidents?.length) {
      negativeIncidents.forEach(incident => {
        const hazardName = incident.location
        if (!hazardName) return
        if (!hazardIncidentMap.has(hazardName)) {
          hazardIncidentMap.set(hazardName, [])
        }
        hazardIncidentMap.get(hazardName).push(incident)
      })
    }

    // Step 2: Enrich hazards with severity-weighted counts
    const enrichedHazards = sortedHazards
      .filter(h => !h.hasNoData && h.totalCount > 0)
      .map(h => {
        const incidents = hazardIncidentMap.get(h.name) || []
        const severityWeightedCount = calculateSeverityWeightedCount(incidents)
        return { ...h, severityWeightedCount, incidents }
      })

    // Step 3: Calculate max values for normalization
    const maxWeightedCount = Math.max(...enrichedHazards.map(h => h.severityWeightedCount || 0), 1)
    const maxRawCount = Math.max(...enrichedHazards.map(h => h.totalCount || 0), 1)

    // Step 4: Calculate risk scores and rank
    return enrichedHazards
      .map(h => ({ ...h, riskScore: calculateRiskScore(h, maxWeightedCount, maxRawCount) }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 25)
  }, [sortedHazards, negativeIncidents])

  const grid = useMemo(() => {
    const rows = []
    for (let r = 0; r < 5; r++) {
      const row = []
      for (let c = 0; c < 5; c++) row.push(rankedHazards[r * 5 + c] || null)
      rows.push(row)
    }
    return rows
  }, [rankedHazards])

  const handleCellClick = useCallback((hazard, row, col) => {
    setSelectedHazard(hazard)
    setSelectedCellColor(getCellColor(row, col))
    // Store the rank (position in rankedHazards + 1)
    const rank = rankedHazards.findIndex(h => h.name === hazard.name) + 1
    setSelectedRank(rank)
  }, [rankedHazards])

  const handleCloseModal = useCallback(() => {
    setSelectedHazard(null)
    setSelectedCellColor(null)
    setSelectedRank(1)
  }, [])

  const hazardIncidents = useMemo(() => {
    if (!selectedHazard || !negativeIncidents?.length) return []
    return negativeIncidents.filter(i => i.location === selectedHazard.name)
  }, [selectedHazard, negativeIncidents])

  const hazardFactors = useMemo(() => {
    if (!selectedHazard || !factorData?.byFactor || !hazardIncidents.length) return []
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))
    return factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return { name: factor.name, count: matchingIncidents.length, percentage: hazardIncidents.length > 0 ? (matchingIncidents.length / hazardIncidents.length) * 100 : 0 }
      })
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [selectedHazard, factorData, hazardIncidents])

  const dayPatterns = useMemo(() => hazardIncidents.length ? getDayOfWeekPatterns(hazardIncidents) : null, [hazardIncidents])
  const hourPatterns = useMemo(() => hazardIncidents.length ? getHourlyPatterns(hazardIncidents) : null, [hazardIncidents])

  if (!rankedHazards.length) {
    return (
      <div className="bg-white rounded-xl border border-surface-200 p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-surface-400" />
        </div>
        <h2 className="text-lg font-bold text-surface-800 mb-2">No Hazard Data Available</h2>
        <p className="text-sm text-surface-500 max-w-md mx-auto">
          No hazards found for the selected period. Try importing more observations or adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-surface-800">Hazard Risk Matrix</h2>
          <p className="text-xs text-surface-500 mt-0.5">Top 25 hazards ranked by risk score. Click any cell for detailed analysis.</p>
        </div>
        <Legend />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-3 sm:p-4">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {grid.map((row, rowIdx) =>
            row.map((hazard, colIdx) => {
              const rank = rowIdx * 5 + colIdx + 1
              return (
                <MatrixCell
                  key={hazard?.name || `empty-${rowIdx}-${colIdx}`}
                  hazard={hazard}
                  row={rowIdx}
                  col={colIdx}
                  rank={rank}
                  onClick={handleCellClick}
                />
              )
            })
          )}
        </div>
      </div>

      <HazardDetailModal
        isOpen={!!selectedHazard}
        onClose={handleCloseModal}
        hazard={selectedHazard}
        hazardIncidents={hazardIncidents}
        hazardFactors={hazardFactors}
        dayPatterns={dayPatterns}
        hourPatterns={hourPatterns}
        factorData={factorData}
        siteClassifications={siteClassifications}
        cellColor={selectedCellColor}
        currentRank={selectedRank}
        allHazards={rankedHazards}
      />
    </div>
  )
}

export default React.memo(HazardRiskMatrix)
