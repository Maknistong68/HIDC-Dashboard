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
  X,
  Grid3x3,
  BarChart3,
  Info,
  CheckCircle,
  User,
  AlertCircle,
} from 'lucide-react'
import { SIGNIFICANT_HAZARDS, SUB_SIGNIFICANT_HAZARDS, QUICK_ACTION_PRESETS } from '../../utils/constants'
import { getDayOfWeekPatterns, getHourlyPatterns } from '../../utils/insightsCalculations'
import {
  generateContextualSliders,
  calculateProjectedChange,
  calculateFactorPrevalence,
  calculateActionClosureEffect,
  applyQuickActionPreset,
} from '../insights/ScenarioSimulatorEngine'
import { SEVERITY_WEIGHTS } from '../../utils/calculations'
import { isOpenAction } from '../../utils/incidentHelpers'
import {
  plotHazardsOnMatrix,
  getCellRiskColor,
  getScoreColor,
  getScoreLabel,
  CONSEQUENCE_LABELS,
  LIKELIHOOD_LABELS,
} from '../../utils/riskMatrix'

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
 * Get cell color based on grid position with improved contrast (5 levels)
 */
const getCellColor = (row, col) => {
  const positionScore = (4 - row) + (4 - col)
  if (positionScore >= 7) return {
    bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-900',
    hover: 'hover:bg-red-100', badge: 'bg-red-600',
    shadow: 'shadow-md shadow-red-200/50', level: 'veryHigh'
  }
  if (positionScore >= 5) return {
    bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-900',
    hover: 'hover:bg-amber-100', badge: 'bg-amber-600',
    shadow: 'shadow-sm shadow-amber-200/50', level: 'high'
  }
  if (positionScore >= 3) return {
    bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800',
    hover: 'hover:bg-yellow-100', badge: 'bg-yellow-500',
    shadow: '', level: 'medium'
  }
  if (positionScore >= 1) return {
    bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800',
    hover: 'hover:bg-emerald-100', badge: 'bg-emerald-500',
    shadow: '', level: 'low'
  }
  return {
    bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-800',
    hover: 'hover:bg-sky-100', badge: 'bg-sky-500',
    shadow: '', level: 'veryLow'
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
  const isVeryHigh = colors.level === 'veryHigh'
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
                  ${isVeryHigh ? 'border-2' : 'border'}
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
                       ${isVeryHigh || isHigh ? 'ring-1 ring-white' : ''}`}>
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
        <span className="font-medium text-red-700">V.High</span>
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
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded bg-sky-50 border border-sky-300" />
        <span className="font-medium text-sky-700">V.Low</span>
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
  const sources = slider.sources || {}

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium text-surface-700 truncate">{slider.label}</span>
          {/* Relevance badges */}
          {sources.expert && (
            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200" title={sources.expertAction || 'Expert recommended'}>
              Expert
            </span>
          )}
          {sources.temporal && (
            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200" title={sources.peakDays ? `Peak: ${sources.peakDays.join(', ')}` : 'Peak time correlation'}>
              Peak Time
            </span>
          )}
          {!sources.expert && sources.data && (
            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200" title="Detected in incident data">
              Data
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
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
 * Get risk level from grid position (5 levels)
 */
const getRiskLevel = (position) => {
  if (position < 0) return { level: 'Very High', color: 'text-red-700', bg: 'bg-red-50' }
  const row = Math.floor(position / 5)
  const col = position % 5
  const positionScore = (4 - row) + (4 - col)
  if (positionScore >= 7) return { level: 'Very High', color: 'text-red-700', bg: 'bg-red-50' }
  if (positionScore >= 5) return { level: 'High', color: 'text-amber-700', bg: 'bg-amber-50' }
  if (positionScore >= 3) return { level: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-50' }
  if (positionScore >= 1) return { level: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50' }
  return { level: 'Very Low', color: 'text-sky-700', bg: 'bg-sky-50' }
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

  // Generate cell colors for mini matrix (5 levels)
  const getCellBg = (idx) => {
    const row = Math.floor(idx / 5)
    const col = idx % 5
    const positionScore = (4 - row) + (4 - col)
    if (positionScore >= 7) return 'bg-red-400'
    if (positionScore >= 5) return 'bg-amber-400'
    if (positionScore >= 3) return 'bg-yellow-400'
    if (positionScore >= 1) return 'bg-emerald-400'
    return 'bg-sky-400'
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

const ICON_MAP = { Settings, Shield, User, CheckCircle, HardHat }

const SimulationPanel = ({ currentHazard, hazardIncidents, factorData, dayPatterns, currentRank, allHazards }) => {
  const [sliders, setSliders] = useState({})
  const [actionsToClose, setActionsToClose] = useState(0)
  const [activeQuickAction, setActiveQuickAction] = useState(null)

  // Count open actions for this hazard
  const openActionsCount = useMemo(() => {
    if (!hazardIncidents?.length) return 0
    return hazardIncidents.filter(isOpenAction).length
  }, [hazardIncidents])

  // Confidence indicator based on observation count
  const confidence = useMemo(() => {
    const count = hazardIncidents?.length || 0
    if (count >= 50) return { level: 'High', pct: 90, color: 'text-green-600' }
    if (count >= 20) return { level: 'Moderate', pct: 70, color: 'text-blue-600' }
    if (count >= 10) return { level: 'Low', pct: 50, color: 'text-amber-600' }
    return { level: 'Insufficient', pct: 25, color: 'text-red-500' }
  }, [hazardIncidents])

  // Generate contextual sliders using engine (Expert 50% + Data 30% + Temporal 20%)
  const contextualSliders = useMemo(() => {
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
    const result = generateContextualSliders(
      { byFactor: hazardFactors },
      currentHazard?.name,
      hazardIncidents.length,
      dayPatterns
    )
    return (result.sliders || result).slice(0, 8)
  }, [factorData, currentHazard, hazardIncidents, dayPatterns])

  // Calculate factor prevalence for engine projection
  const prevalence = useMemo(() => {
    if (!factorData?.byFactor || !hazardIncidents?.length) return {}
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))
    const hazardFactors = factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return { name: factor.name, count: matchingIncidents.length }
      })
      .filter(f => f.count > 0)
    return calculateFactorPrevalence({ byFactor: hazardFactors }, hazardIncidents.length)
  }, [factorData, hazardIncidents, currentHazard])

  // Project change using engine (diminishing returns, -60% to +40% cap)
  const projection = useMemo(() => {
    const hasSliders = Object.values(sliders).some(v => v !== 0)
    if (!hasSliders && actionsToClose === 0) return { totalEffect: 0, effects: {}, factorsAddressed: 0 }

    const engineResult = calculateProjectedChange(sliders, prevalence)

    // Add action closure effect
    let actionEffect = 0
    if (actionsToClose > 0 && openActionsCount > 0) {
      actionEffect = calculateActionClosureEffect(actionsToClose, openActionsCount, hazardIncidents?.length || 0)
    }

    const combinedEffect = engineResult.totalEffect + actionEffect
    // Clamp to engine bounds: -60% to +40%
    const clampedEffect = Math.round(Math.min(40, Math.max(-60, combinedEffect)) * 10) / 10

    const factorsAddressed = Object.keys(engineResult.effects || {}).length + (actionsToClose > 0 ? 1 : 0)

    return {
      // impactScore is absolute value of reduction (positive = good)
      impactScore: clampedEffect < 0 ? Math.abs(clampedEffect) : 0,
      totalEffect: clampedEffect,
      effects: engineResult.effects,
      factorsAddressed,
      isCapped: engineResult.isCapped,
    }
  }, [sliders, actionsToClose, prevalence, openActionsCount, hazardIncidents])

  // Calculate projected rank based on intervention impact
  const projectedRank = useMemo(() => {
    if (projection.impactScore === 0 || !allHazards?.length || !currentHazard) return currentRank
    const currentScore = currentHazard.riskScore || 50
    const projectedScore = currentScore * (1 - projection.impactScore / 100)
    let newRank = 1
    for (const h of allHazards) {
      if (h.name !== currentHazard.name && (h.riskScore || 0) > projectedScore) newRank++
    }
    return Math.min(newRank, 25)
  }, [projection.impactScore, allHazards, currentHazard, currentRank])

  const applyQuickAction = useCallback((presetId) => {
    if (activeQuickAction === presetId) {
      setSliders({})
      setActionsToClose(0)
      setActiveQuickAction(null)
      return
    }
    const result = applyQuickActionPreset(presetId, prevalence, openActionsCount)
    // Only apply slider values that match available sliders
    const validSliderIds = new Set(contextualSliders.map(s => s.id))
    const filtered = {}
    for (const [key, val] of Object.entries(result.sliders || {})) {
      if (validSliderIds.has(key)) filtered[key] = val
    }
    // If no sliders matched, set all available sliders to 50
    if (Object.keys(filtered).length === 0 && contextualSliders.length > 0 && presetId !== 'close-actions') {
      contextualSliders.forEach(s => { filtered[s.id] = 50 })
    }
    setSliders(filtered)
    setActionsToClose(result.actionsToClose || 0)
    setActiveQuickAction(presetId)
  }, [activeQuickAction, prevalence, openActionsCount, contextualSliders])

  const presetColorMap = { blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200', indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200', green: 'bg-green-100 text-green-700 hover:bg-green-200' }

  const isInsufficient = (hazardIncidents?.length || 0) < 10

  return (
    <div className="space-y-4">
      {/* Insufficient data warning */}
      {isInsufficient && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Low confidence:</span> Only {hazardIncidents?.length || 0} observations. Results improve with 10+ observations.
          </p>
        </div>
      )}

      {/* Confidence indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-surface-500">Confidence:</span>
        <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${confidence.pct >= 70 ? 'bg-green-400' : confidence.pct >= 50 ? 'bg-blue-400' : 'bg-amber-400'}`} style={{ width: `${confidence.pct}%` }} />
        </div>
        <span className={`font-semibold ${confidence.color}`}>{confidence.level}</span>
      </div>

      {/* Quick Actions from QUICK_ACTION_PRESETS */}
      <div>
        <h3 className="text-sm font-semibold text-surface-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_ACTION_PRESETS.map(preset => {
            const PresetIcon = ICON_MAP[preset.icon] || Settings
            return (
              <QuickActionButton
                key={preset.id}
                label={preset.label}
                icon={PresetIcon}
                onClick={() => applyQuickAction(preset.id)}
                isActive={activeQuickAction === preset.id}
                colorClass={presetColorMap[preset.color] || 'bg-surface-100 text-surface-700 hover:bg-surface-200'}
              />
            )
          })}
          {(Object.keys(sliders).length > 0 || actionsToClose > 0) && (
            <button onClick={() => { setSliders({}); setActionsToClose(0); setActiveQuickAction(null) }} className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700 ml-2">
              <RotateCcw size={12} />Reset
            </button>
          )}
        </div>
      </div>

      {/* Intervention Sliders */}
      {contextualSliders.length > 0 ? (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Intervention Sliders</h4>
          <div className="space-y-3">
            {contextualSliders.map(slider => (
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

      {/* Action Closure Slider */}
      {openActionsCount > 0 && (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Action Closure</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-surface-700">Close Open Actions</span>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                {actionsToClose} / {openActionsCount}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={openActionsCount}
              value={actionsToClose}
              onChange={(e) => setActionsToClose(parseInt(e.target.value, 10))}
              className="w-full h-6 appearance-none bg-transparent cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-surface-400">
              <span>0</span>
              <span>{openActionsCount} open</span>
            </div>
          </div>
        </div>
      )}

      {/* Impact Score Card */}
      <ImpactScoreCard
        impactScore={projection.impactScore}
        factorsAddressed={projection.factorsAddressed}
        confidence={confidence.pct}
      />

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
    if (!hazardIncidents?.length) return { fatality: 0, lti: 0, mti: 0, fac: 0, env: 0, fire: 0, security: 0, dmg: 0, nearMiss: 0, observations: 0, total: 0, weightedScore: 0 }

    const counts = { fatality: 0, lti: 0, mti: 0, fac: 0, env: 0, fire: 0, security: 0, dmg: 0, nearMiss: 0, observations: 0 }
    let weightedScore = 0

    hazardIncidents.forEach(i => {
      const type = i.type?.toLowerCase()
      const weight = SEVERITY_WEIGHTS[type] || SEVERITY_WEIGHTS.default || 1
      weightedScore += weight

      if (type === 'fatality') counts.fatality++
      else if (type === 'lti') counts.lti++
      else if (type === 'mti') counts.mti++
      else if (type === 'fac') counts.fac++
      else if (type === 'environmental') counts.env++
      else if (type === 'fire') counts.fire++
      else if (type === 'security') counts.security++
      else if (type === 'damage-to-property') counts.dmg++
      else if (type === 'near-miss') counts.nearMiss++
      else counts.observations++
    })

    return { ...counts, total: hazardIncidents.length, weightedScore }
  }, [hazardIncidents])

  const hasRecordable = severityBreakdown.fatality > 0 || severityBreakdown.lti > 0 || severityBreakdown.mti > 0 || severityBreakdown.fac > 0

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
          {/* Fatality - Top of pyramid */}
          {severityBreakdown.fatality > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-200 px-3 py-1 rounded-full">
                <div className="w-2.5 h-2.5 rounded-full bg-red-900" />
                <span className="text-xs font-bold text-red-900">{severityBreakdown.fatality} Fatality</span>
                <span className="text-[10px] text-red-700">×10000</span>
              </div>
            </div>
          )}

          {/* LTI */}
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

          {/* ENV */}
          {severityBreakdown.env > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-600" />
                <span className="text-xs font-bold text-amber-700">{severityBreakdown.env} ENV</span>
                <span className="text-[10px] text-amber-500">×200</span>
              </div>
            </div>
          )}

          {/* Fire */}
          {severityBreakdown.fire > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-red-600">{severityBreakdown.fire} Fire</span>
                <span className="text-[10px] text-red-400">×500</span>
              </div>
            </div>
          )}

          {/* Security */}
          {severityBreakdown.security > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-stone-500" />
                <span className="text-xs font-bold text-stone-600">{severityBreakdown.security} Security</span>
                <span className="text-[10px] text-stone-400">×100</span>
              </div>
            </div>
          )}

          {/* DMG */}
          {severityBreakdown.dmg > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-lime-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-lime-600" />
                <span className="text-xs font-bold text-lime-700">{severityBreakdown.dmg} DMG</span>
                <span className="text-[10px] text-lime-500">×200</span>
              </div>
            </div>
          )}

          {/* Near Miss */}
          {severityBreakdown.nearMiss > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-700">{severityBreakdown.nearMiss} Near Miss</span>
                <span className="text-[10px] text-amber-500">×50</span>
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
                dayPatterns={dayPatterns}
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
// TRUE RISK MATRIX VIEW (Likelihood x Impact, score-based classification)
// ============================================================================

const RiskMatrixLegend = () => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-surface-600">
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-[10px] text-surface-400 uppercase tracking-wider">Risk:</span>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fee2e2', border: '2px solid #f87171' }} />
        <span className="font-medium text-red-700">V.High <span className="text-[10px] text-surface-400">(20-25)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ffedd5', border: '1px solid #fb923c' }} />
        <span className="font-medium text-amber-700">High <span className="text-[10px] text-surface-400">(15-19)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fef9c3', border: '1px solid #facc15' }} />
        <span className="font-medium text-yellow-700">Medium <span className="text-[10px] text-surface-400">(8-14)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dcfce7', border: '1px solid #4ade80' }} />
        <span className="font-medium text-emerald-700">Low <span className="text-[10px] text-surface-400">(4-7)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#d1fae5', border: '1px solid #34d399' }} />
        <span className="font-medium text-green-700">V.Low <span className="text-[10px] text-surface-400">(1-3)</span></span>
      </div>
    </div>
  </div>
)

/**
 * HazardChip - Compact badge for a hazard in a risk matrix cell
 */
const HazardChip = ({ hazard, onClick }) => {
  const zone = hazard.zone
  return (
    <button
      onClick={() => onClick(hazard)}
      className={`${zone.chipBg} ${zone.chipText} ${zone.chipBorder} border
                  px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium
                  truncate max-w-full transition-all hover:scale-105 hover:shadow-sm cursor-pointer`}
      title={`${hazard.name} — L${hazard.likelihood} x I${hazard.consequence} = ${hazard.riskScore} (${zone.label})`}
    >
      {hazard.name}
    </button>
  )
}

/**
 * RiskMatrixCell - A cell in the true L x C grid with HSL gradient background
 * Shows "Level - Score" label centered, hazard chips below
 */
const RiskMatrixCell = ({ likelihood, consequence, hazards, onClick }) => {
  const score = likelihood * consequence
  const hasHazards = hazards.length > 0
  const scoreColor = getScoreColor(score)
  const label = getScoreLabel(likelihood, consequence)

  return (
    <div
      className={`${hasHazards ? 'border-2' : 'border'}
                  rounded-md p-1.5 min-h-[60px] sm:min-h-[72px] flex flex-col items-center justify-center gap-0.5
                  ${hasHazards ? 'shadow-sm' : 'opacity-60'} relative`}
      style={{
        backgroundColor: scoreColor.backgroundColor,
        color: scoreColor.color,
        borderColor: scoreColor.borderColor,
      }}
    >
      {/* Level - Score label centered */}
      <span className="text-[9px] sm:text-[10px] font-bold leading-tight text-center whitespace-nowrap">
        {label}
      </span>

      {/* Hazard chips */}
      {hazards.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
          {hazards.map(h => (
            <HazardChip key={h.name} hazard={h} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * RiskMatrixView - True 5x5 Likelihood x Impact grid (score-based)
 * Columns reversed: L5 (left) → L1 (right) so highest risk is top-left
 */
const RiskMatrixView = ({ matrixData, allIncidents, onHazardClick }) => {
  // Build 5x5 grid: grid[consequence][likelihood] = [hazards]
  const grid = useMemo(() => {
    const g = {}
    for (let c = 1; c <= 5; c++) {
      g[c] = {}
      for (let l = 1; l <= 5; l++) {
        g[c][l] = []
      }
    }
    if (matrixData?.hazards) {
      for (const h of matrixData.hazards) {
        if (h.consequence >= 1 && h.consequence <= 5 && h.likelihood >= 1 && h.likelihood <= 5) {
          g[h.consequence][h.likelihood].push(h)
        }
      }
    }
    return g
  }, [matrixData])

  // Stats summary
  const stats = useMemo(() => {
    if (!matrixData?.hazards?.length) return null
    const zones = { veryHigh: 0, high: 0, medium: 0, low: 0, veryLow: 0 }
    matrixData.hazards.forEach(h => { zones[h.zone.level] = (zones[h.zone.level] || 0) + 1 })
    return { total: matrixData.hazards.length, ...zones, totalDays: matrixData.totalDays, isAdaptive: matrixData.isAdaptive }
  }, [matrixData])

  if (!matrixData?.hazards?.length) return null

  return (
    <div className="space-y-3">
      {/* Stats row */}
      {stats && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-surface-500">{stats.total} hazards plotted over {stats.totalDays} days</span>
          {stats.isAdaptive && (
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <Info size={11} />
              Adaptive thresholds (dataset &lt;90 days)
            </span>
          )}
          {stats.veryHigh > 0 && <span className="font-semibold text-red-700">{stats.veryHigh} Very High</span>}
          {stats.high > 0 && <span className="font-semibold text-amber-700">{stats.high} High</span>}
          {stats.medium > 0 && <span className="font-semibold text-yellow-700">{stats.medium} Medium</span>}
          {stats.low > 0 && <span className="font-semibold text-emerald-700">{stats.low} Low</span>}
          {stats.veryLow > 0 && <span className="font-semibold text-green-700">{stats.veryLow} Very Low</span>}
        </div>
      )}

      {/* Matrix Grid with axis labels — columns reversed (L5 left → L1 right) */}
      <div className="bg-white rounded-xl border border-surface-200 p-3 sm:p-4 overflow-x-auto">
        <div className="min-w-[480px]">
          {/* X-axis label */}
          <div className="flex">
            <div className="w-24 sm:w-28 flex-shrink-0" />
            <div className="flex-1 text-center text-[10px] font-semibold text-surface-400 uppercase tracking-widest mb-1">
              &larr; Likelihood
            </div>
          </div>

          {/* Column headers (Likelihood reversed: 5, 4, 3, 2, 1) */}
          <div className="flex">
            <div className="w-24 sm:w-28 flex-shrink-0 text-right pr-2">
              <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">
                Impact &darr;
              </span>
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1.5 sm:gap-2">
              {[5, 4, 3, 2, 1].map(l => (
                <div key={`lh-${l}`} className="text-center">
                  <span className="text-[10px] sm:text-xs font-bold text-surface-700">{l}</span>
                  <p className="text-[8px] sm:text-[10px] text-surface-400 leading-tight">{LIKELIHOOD_LABELS[l]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rows: Impact 5 (top) down to 1 (bottom), columns reversed */}
          <div className="mt-2 space-y-1.5 sm:space-y-2">
            {[5, 4, 3, 2, 1].map(c => (
              <div key={`row-${c}`} className="flex">
                {/* Row label */}
                <div className="w-24 sm:w-28 flex-shrink-0 flex items-center justify-end pr-2 gap-1">
                  <div className="text-right">
                    <span className="text-[10px] sm:text-xs font-bold text-surface-700">{c}</span>
                    <p className="text-[8px] sm:text-[10px] text-surface-400 leading-tight">{CONSEQUENCE_LABELS[c]}</p>
                  </div>
                </div>
                {/* Grid cells — reversed: L5, L4, L3, L2, L1 */}
                <div className="flex-1 grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[5, 4, 3, 2, 1].map(l => (
                    <RiskMatrixCell
                      key={`cell-${l}-${c}`}
                      likelihood={l}
                      consequence={c}
                      hazards={grid[c][l]}
                      onClick={onHazardClick}
                    />
                  ))}
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
 * ViewToggle - Switch between Risk Matrix and Risk Ranking
 */
const ViewToggle = ({ view, onChange }) => (
  <div className="flex items-center bg-surface-100 rounded-lg p-0.5">
    <button
      onClick={() => onChange('matrix')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
        ${view === 'matrix' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
    >
      <Grid3x3 size={14} />
      Risk Matrix
    </button>
    <button
      onClick={() => onChange('ranking')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
        ${view === 'ranking' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
    >
      <BarChart3 size={14} />
      Risk Ranking
    </button>
  </div>
)

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
  const [viewMode, setViewMode] = useState('matrix') // 'matrix' | 'ranking'

  // True Risk Matrix data (L x C placement)
  const matrixData = useMemo(() => {
    return plotHazardsOnMatrix(filteredIncidents, sortedHazards)
  }, [filteredIncidents, sortedHazards])

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

  // Handle clicks from the true risk matrix view
  const handleMatrixHazardClick = useCallback((hazard) => {
    setSelectedHazard(hazard)
    setSelectedCellColor(hazard.zone || null)
    const rank = rankedHazards.findIndex(h => h.name === hazard.name) + 1
    setSelectedRank(rank || 1)
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

  const hasMatrixData = matrixData?.hazards?.length > 0
  const hasRankingData = rankedHazards.length > 0

  if (!hasMatrixData && !hasRankingData) {
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
          <p className="text-xs text-surface-500 mt-0.5">
            {viewMode === 'matrix'
              ? 'Hazards plotted by Likelihood × Impact. Score = L × C. Click any hazard for detailed analysis.'
              : 'Top 25 hazards ranked by risk score. Click any cell for detailed analysis.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode} onChange={setViewMode} />
          {viewMode === 'matrix' ? <RiskMatrixLegend /> : <Legend />}
        </div>
      </div>

      {/* True Risk Matrix View */}
      {viewMode === 'matrix' && (
        <RiskMatrixView
          matrixData={matrixData}
          allIncidents={filteredIncidents}
          onHazardClick={handleMatrixHazardClick}
        />
      )}

      {/* Legacy Risk Ranking View */}
      {viewMode === 'ranking' && (
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
      )}

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
