import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  MapPin,
  Building,
  Layers,
  Sliders,
  Settings,
  Shield,
  HardHat,
  RotateCcw
} from 'lucide-react'
import { SIGNIFICANT_HAZARDS } from '../../utils/constants'
import { getDayOfWeekPatterns, getHourlyPatterns } from '../../utils/insightsCalculations'
import { generateDynamicSliders } from '../insights/ScenarioSimulatorEngine'

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * TrendBadge - Shows trend direction and percentage at top
 */
const TrendBadge = ({ trend, changePercent }) => {
  const trendConfig = {
    'significant-rise': { icon: TrendingUp, label: 'RISING', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'rising': { icon: TrendingUp, label: 'RISING', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'stable': { icon: Minus, label: 'STABLE', bg: 'bg-surface-100', text: 'text-surface-700', border: 'border-surface-200' },
    'new': { icon: Minus, label: 'NEW', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'declining': { icon: TrendingDown, label: 'DECLINING', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    'significant-decline': { icon: TrendingDown, label: 'DECLINING', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
  }

  const config = trendConfig[trend] || trendConfig.stable
  const Icon = config.icon
  const displayPercent = Math.abs(changePercent || 0)

  return (
    <div className={`inline-flex flex-col items-center px-4 py-2 rounded-lg ${config.bg} ${config.border} border`}>
      <div className="flex items-center gap-1.5">
        <Icon size={20} className={config.text} />
        <span className={`text-lg font-bold ${config.text}`}>
          {displayPercent > 0 ? `${displayPercent}%` : '—'}
        </span>
      </div>
      <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
    </div>
  )
}

/**
 * RiskDots - Visual indicator showing position among 14 hazards
 */
const RiskDots = ({ currentRank, total = 14 }) => {
  const dots = []
  for (let i = 1; i <= total; i++) {
    let color = 'bg-green-400' // low risk (positions 8-14)
    if (i <= 3) color = 'bg-red-500' // high risk (positions 1-3)
    else if (i <= 7) color = 'bg-amber-400' // medium risk (positions 4-7)

    const isCurrent = i === currentRank
    dots.push(
      <div
        key={i}
        className={`rounded-full transition-all ${isCurrent ? 'w-3.5 h-3.5 ring-2 ring-offset-1 ring-primary-500' : 'w-2.5 h-2.5'} ${color}`}
        title={`Position ${i}`}
      />
    )
  }

  return (
    <div className="flex items-center gap-1 justify-center">
      {dots}
    </div>
  )
}

/**
 * HubCenter - The main hazard card at center of visualization
 */
const HubCenter = ({ hazard, rank, total, isAnimating }) => {
  if (!hazard) {
    return (
      <div className="w-64 h-64 bg-surface-100 rounded-2xl border-2 border-surface-200 flex items-center justify-center">
        <span className="text-surface-400">No hazard data</span>
      </div>
    )
  }

  return (
    <div className={`relative transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
      {/* Main hub card */}
      <div className="w-72 bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-5 flex flex-col items-center gap-3">
        {/* Hazard name */}
        <h2 className="text-lg font-bold text-surface-900 text-center leading-tight">
          {hazard.name}
        </h2>

        {/* Rank badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
            #{rank} RISK
          </span>
        </div>

        {/* Observation count */}
        <div className="text-center">
          <span className="text-3xl font-bold text-surface-800">{hazard.totalCount || 0}</span>
          <span className="text-xs text-surface-500 ml-1">observations</span>
        </div>

        {/* Risk position dots */}
        <div className="pt-2 border-t border-surface-100 w-full">
          <RiskDots currentRank={rank} total={total} />
          <p className="text-[10px] text-surface-400 text-center mt-1">Risk Position</p>
        </div>
      </div>
    </div>
  )
}

/**
 * FactorCard - Contributing factor spoke on left side
 */
const FactorCard = ({ factor, index }) => {
  const barWidth = Math.min(100, Math.max(10, factor.percentage || 0))

  return (
    <div className="flex items-center gap-3 group">
      {/* Card */}
      <div className="w-44 bg-white rounded-lg border border-surface-200 p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-surface-800 truncate" title={factor.name}>
            {factor.name}
          </span>
          <span className="text-xs font-semibold text-primary-600">
            {Math.round(factor.percentage || 0)}%
          </span>
        </div>
        {/* Mini progress bar */}
        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-400 rounded-full transition-all duration-300"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      {/* Connector line */}
      <div className="w-8 h-0.5 bg-surface-300 group-hover:bg-primary-300 transition-colors" />
    </div>
  )
}

/**
 * TimeCard - Peak time spoke on right side
 */
const TimeCard = ({ type, label, sublabel, deviation, isGap }) => {
  const bgClass = isGap ? 'bg-amber-50 border-amber-300' : 'bg-white border-surface-200'
  const deviationColor = deviation > 0 ? 'text-red-600' : deviation < 0 ? 'text-green-600' : 'text-surface-500'
  const Icon = type === 'day' ? Calendar : Clock

  return (
    <div className="flex items-center gap-3 group">
      {/* Connector line */}
      <div className="w-8 h-0.5 bg-surface-300 group-hover:bg-primary-300 transition-colors" />
      {/* Card */}
      <div className={`w-44 rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow ${bgClass}`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} className={isGap ? 'text-amber-600' : 'text-surface-500'} />
          <span className={`text-sm font-medium ${isGap ? 'text-amber-800' : 'text-surface-800'}`}>
            {label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isGap ? 'text-amber-600' : 'text-surface-500'}`}>
            {sublabel}
          </span>
          {deviation !== null && (
            <span className={`text-xs font-semibold ${deviationColor}`}>
              {deviation > 0 ? '+' : ''}{deviation}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * NavigationBar - Prev/Next buttons and position indicator
 */
const NavigationBar = ({ current, total, onPrev, onNext, hazardName }) => {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrev}
        disabled={current === 0}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-surface-100 hover:bg-surface-200 text-surface-700"
        aria-label="Previous hazard"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="text-center">
        <div className="text-sm font-semibold text-surface-800">
          {current + 1} <span className="text-surface-400">/</span> {total}
        </div>
        <div className="text-[10px] text-surface-500 truncate max-w-32">{hazardName}</div>
      </div>

      <button
        onClick={onNext}
        disabled={current >= total - 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-surface-100 hover:bg-surface-200 text-surface-700"
        aria-label="Next hazard"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ============================================================================
// WHERE SECTION COMPONENTS
// ============================================================================

/**
 * BreakdownList - Renders ranked list with progress bars
 */
const BreakdownList = ({ title, items, icon: Icon, iconColor = 'text-blue-500', barColor = 'bg-blue-400' }) => {
  if (!items?.length) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Icon size={14} className={iconColor} />
          <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">{title}</span>
        </div>
        <p className="text-xs text-surface-400 italic">No data available</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={iconColor} />
        <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">{title}</span>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="text-xs text-surface-400 w-4">{idx + 1}.</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-surface-800 truncate" title={item.name}>
                  {item.name}
                </span>
                <span className="text-xs font-semibold text-surface-600 ml-2">{item.pct}%</span>
              </div>
              <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(100, item.pct)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * WhereSection - Shows top sites, sub-regions, and contractors for current hazard
 */
const WhereSection = ({ hazardIncidents, siteClassifications = {}, isExpanded, onToggle }) => {
  // Aggregate by site
  const topSites = useMemo(() => {
    if (!hazardIncidents?.length) return []
    const counts = {}
    hazardIncidents.forEach(i => {
      const site = i.site || 'Unknown'
      counts[site] = (counts[site] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / hazardIncidents.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [hazardIncidents])

  // Aggregate by sub-region (using siteClassifications)
  const topSubRegions = useMemo(() => {
    if (!hazardIncidents?.length) return []
    const counts = {}
    hazardIncidents.forEach(i => {
      const site = i.site || 'Unknown'
      const subRegion = siteClassifications[site] || 'Unassigned'
      counts[subRegion] = (counts[subRegion] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / hazardIncidents.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [hazardIncidents, siteClassifications])

  // Aggregate by contractor
  const topContractors = useMemo(() => {
    if (!hazardIncidents?.length) return []
    const counts = {}
    hazardIncidents.forEach(i => {
      const contractor = i.contractor || i.contractorName || 'Unknown'
      counts[contractor] = (counts[contractor] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / hazardIncidents.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [hazardIncidents])

  const hasData = topSites.length > 0 || topContractors.length > 0
  const hasSubRegions = topSubRegions.some(r => r.name !== 'Unassigned')

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-surface-800">WHERE?</span>
          <span className="text-xs text-surface-500">Sites, sub-regions & contractors</span>
        </div>
        {isExpanded ? <ChevronUp size={18} className="text-surface-400" /> : <ChevronDown size={18} className="text-surface-400" />}
      </button>

      {isExpanded && (
        <div className="border-t border-surface-100 p-4">
          {hasData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BreakdownList
                title="Top Sites"
                items={topSites}
                icon={Building}
                iconColor="text-blue-500"
                barColor="bg-blue-400"
              />
              <BreakdownList
                title="Sub-Regions"
                items={hasSubRegions ? topSubRegions.filter(r => r.name !== 'Unassigned') : topSubRegions}
                icon={Layers}
                iconColor="text-purple-500"
                barColor="bg-purple-400"
              />
              <BreakdownList
                title="Top Contractors"
                items={topContractors}
                icon={Users}
                iconColor="text-amber-500"
                barColor="bg-amber-400"
              />
            </div>
          ) : (
            <p className="text-sm text-surface-500 text-center py-2">
              No site or contractor data available for this hazard.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SIMULATION DRAWER COMPONENTS
// ============================================================================

/**
 * QuickActionButton - Preset action button
 */
const QuickActionButton = ({ label, icon: Icon, onClick, isActive, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'ring-2 ring-primary-400 ' + colorClass
        : colorClass + ' opacity-80 hover:opacity-100'
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
)

/**
 * FactorSlider - Individual factor adjustment slider with visible track
 */
const FactorSlider = ({ slider, value, onChange }) => {
  const handleChange = (e) => {
    onChange(parseInt(e.target.value, 10))
  }

  // Category-specific styling
  const categoryConfig = {
    engineering: {
      labelColor: 'text-blue-600',
      trackBg: 'bg-blue-100',
      thumbColor: 'bg-blue-500',
      activeBg: 'bg-blue-400'
    },
    administrative: {
      labelColor: 'text-indigo-600',
      trackBg: 'bg-indigo-100',
      thumbColor: 'bg-indigo-500',
      activeBg: 'bg-indigo-400'
    },
    ppe: {
      labelColor: 'text-amber-600',
      trackBg: 'bg-amber-100',
      thumbColor: 'bg-amber-500',
      activeBg: 'bg-amber-400'
    },
    environmental: {
      labelColor: 'text-green-600',
      trackBg: 'bg-green-100',
      thumbColor: 'bg-green-500',
      activeBg: 'bg-green-400'
    }
  }

  const config = categoryConfig[slider.categoryKey] || {
    labelColor: 'text-surface-700',
    trackBg: 'bg-surface-200',
    thumbColor: 'bg-primary-500',
    activeBg: 'bg-primary-400'
  }

  // Calculate fill percentage (value ranges from -50 to 100, center at 0)
  const normalizedValue = ((value + 50) / 150) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${config.labelColor}`}>{slider.label}</span>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
          value > 0 ? 'bg-green-100 text-green-700' : value < 0 ? 'bg-red-100 text-red-700' : 'text-surface-500'
        }`}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <div className="relative">
        {/* Track background */}
        <div className={`absolute inset-0 h-2 rounded-full ${config.trackBg}`} style={{ top: '50%', transform: 'translateY(-50%)' }} />
        {/* Zero marker */}
        <div className="absolute h-3 w-0.5 bg-surface-400 rounded-full" style={{ left: '33.33%', top: '50%', transform: 'translateY(-50%)' }} />
        {/* Active fill from zero point */}
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
          onChange={handleChange}
          className="relative w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
          style={{
            WebkitAppearance: 'none'
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 3px solid #3b82f6;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
            margin-top: -8px;
          }
          input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 3px solid #3b82f6;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          }
          input[type="range"]::-webkit-slider-runnable-track {
            height: 2px;
            background: transparent;
          }
          input[type="range"]::-moz-range-track {
            height: 2px;
            background: transparent;
          }
        `}</style>
      </div>
      <div className="flex items-center justify-between text-[10px] text-surface-400">
        <span>-50%</span>
        <span>0</span>
        <span>+100%</span>
      </div>
      <p className="text-[10px] text-surface-500">{slider.sublabel}</p>
    </div>
  )
}

/**
 * ImpactScoreCard - Shows intervention impact on risk (not observation reduction)
 */
const ImpactScoreCard = ({ impactScore, factorsAddressed, confidence, breakdown }) => {
  // Impact score is positive = good (risk reduction potential)
  const hasImpact = impactScore > 0

  // Determine impact level
  let impactLevel = 'none'
  let impactColor = 'text-surface-500'
  let impactBg = 'bg-surface-50 border-surface-200'
  if (impactScore >= 40) {
    impactLevel = 'High'
    impactColor = 'text-green-700'
    impactBg = 'bg-green-50 border-green-200'
  } else if (impactScore >= 20) {
    impactLevel = 'Moderate'
    impactColor = 'text-blue-700'
    impactBg = 'bg-blue-50 border-blue-200'
  } else if (impactScore > 0) {
    impactLevel = 'Low'
    impactColor = 'text-amber-700'
    impactBg = 'bg-amber-50 border-amber-200'
  }

  return (
    <div className={`rounded-lg p-4 border ${impactBg}`}>
      <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Intervention Impact</h4>
      <div className="space-y-3">
        {/* Main Impact Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${impactColor}`}>
            {hasImpact ? `${impactScore}%` : '—'}
          </div>
          <div className={`text-xs font-medium ${impactColor}`}>
            {hasImpact ? `${impactLevel} Impact` : 'Adjust sliders'}
          </div>
        </div>

        {/* Risk Reduction Indicator */}
        {hasImpact && (
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <Shield size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">
                Risk Reduction Potential
              </span>
            </div>
          </div>
        )}

        {/* Factors Addressed */}
        {factorsAddressed > 0 && (
          <div className="text-center text-xs text-surface-600">
            <span className="font-semibold">{factorsAddressed}</span> factor{factorsAddressed > 1 ? 's' : ''} addressed
          </div>
        )}

        {/* Confidence */}
        {confidence && (
          <div className="text-center text-[10px] text-surface-400">
            Confidence: {confidence}%
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ImpactBar - Visual bar showing intervention strength
 */
const ImpactBar = ({ percent }) => {
  // percent is now positive = good impact
  const impactScore = Math.abs(percent)
  const width = Math.min(100, impactScore * 1.5) // Scale for visibility

  // Color based on impact strength
  let barColor = 'bg-surface-300'
  if (impactScore >= 40) barColor = 'bg-green-500'
  else if (impactScore >= 20) barColor = 'bg-blue-500'
  else if (impactScore > 0) barColor = 'bg-amber-500'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-surface-500">Intervention Strength</span>
        <span className={`font-semibold ${impactScore >= 40 ? 'text-green-700' : impactScore >= 20 ? 'text-blue-700' : impactScore > 0 ? 'text-amber-700' : 'text-surface-600'}`}>
          {impactScore > 0 ? `${impactScore}%` : 'None'}
        </span>
      </div>
      <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
        {/* Progress bar from left */}
        <div
          className={`h-full ${barColor} transition-all duration-300 rounded-full`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

/**
 * SimulationDrawer - Collapsible intervention simulator
 */
const SimulationDrawer = ({
  currentHazard,
  hazardIncidents,
  factorData,
  isExpanded,
  onToggle
}) => {
  const [sliders, setSliders] = useState({})
  const [activeQuickAction, setActiveQuickAction] = useState(null)

  // Generate dynamic sliders based on top factors for this hazard
  const dynamicSliders = useMemo(() => {
    if (!factorData?.byFactor || !hazardIncidents?.length) return []

    // Build a map of hazard incident IDs
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))

    // Filter factors that appear in this hazard's incidents
    const hazardFactors = factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return {
          name: factor.name,
          count: matchingIncidents.length,
          hazards: { [currentHazard?.name]: matchingIncidents.length }
        }
      })
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)

    // Generate sliders from these factors
    return generateDynamicSliders(
      { byFactor: hazardFactors },
      currentHazard?.name,
      hazardIncidents.length
    ).slice(0, 5)
  }, [factorData, currentHazard, hazardIncidents])

  // Calculate projection with hazard-specific sensitivity
  const projection = useMemo(() => {
    if (!Object.keys(sliders).length || !dynamicSliders.length) {
      return { totalEffect: 0, effects: {}, breakdown: [] }
    }

    // Use hazard-specific factor prevalence for more accurate calculation
    // Higher sensitivity: each slider has more impact based on actual factor correlation
    let totalEffect = 0
    const breakdown = []

    for (const slider of dynamicSliders) {
      const sliderValue = sliders[slider.id] || 0
      if (sliderValue === 0) continue

      // Factor prevalence in THIS hazard (more accurate than global)
      const hazardPrevalence = slider.prevalence || 0

      // Control effectiveness multiplier (engineering > admin > ppe)
      const effectivenessMultiplier = {
        engineering: 0.85,
        administrative: 0.60,
        ppe: 0.40,
        environmental: 0.55
      }[slider.categoryKey] || 0.50

      // Calculate IMPACT (positive = good intervention effect)
      // Formula: (prevalence% * effectiveness * sliderValue%) * sensitivity_boost
      const sensitivityBoost = 1.5 // Increase responsiveness
      const rawImpact = (hazardPrevalence / 100) * effectivenessMultiplier * (sliderValue / 100) * sensitivityBoost
      const impact = rawImpact * 100 // Positive = risk reduction potential

      if (impact > 0.1) {
        breakdown.push({
          factor: slider.factor,
          label: slider.label,
          sliderValue,
          impact: Math.round(impact * 10) / 10,
          prevalence: hazardPrevalence
        })
        totalEffect += impact
      }
    }

    // Cap at reasonable bounds (0% to 70% impact)
    const cappedEffect = Math.min(70, Math.max(0, totalEffect))

    return {
      impactScore: Math.round(cappedEffect * 10) / 10,
      factorsAddressed: breakdown.length,
      breakdown,
      isCapped: totalEffect > cappedEffect
    }
  }, [sliders, dynamicSliders])

  // Quick action handlers
  const applyQuickAction = (type) => {
    if (activeQuickAction === type) {
      // Toggle off
      setSliders({})
      setActiveQuickAction(null)
      return
    }

    const presets = {
      engineering: { barriers: 50, guards: 50, devices: 50 },
      admin: { training: 50, supervision: 50, inspections: 50 },
      ppe: { ppe: 50 }
    }

    // Filter presets to only include factors that exist in dynamic sliders
    const validSliderIds = new Set(dynamicSliders.map(s => s.id))
    const filtered = {}

    for (const [key, val] of Object.entries(presets[type] || {})) {
      if (validSliderIds.has(key)) {
        filtered[key] = val
      }
    }

    // If no matching sliders, apply to all available
    if (Object.keys(filtered).length === 0 && dynamicSliders.length > 0) {
      dynamicSliders.forEach(s => {
        filtered[s.id] = 50
      })
    }

    setSliders(filtered)
    setActiveQuickAction(type)
  }

  const resetAll = () => {
    setSliders({})
    setActiveQuickAction(null)
  }

  // Confidence score (simple heuristic)
  const confidence = useMemo(() => {
    const factorCount = dynamicSliders.length
    const totalSliderValue = Object.values(sliders).reduce((sum, v) => sum + Math.abs(v), 0)
    if (factorCount === 0 || totalSliderValue === 0) return null
    return Math.max(40, Math.min(85, 50 + factorCount * 5 + Math.min(totalSliderValue / 10, 20)))
  }, [dynamicSliders, sliders])

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-primary-500" />
          <span className="text-sm font-semibold text-surface-800">IMPACT SIMULATOR</span>
          {projection.impactScore > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              projection.impactScore >= 40 ? 'bg-green-100 text-green-700' :
              projection.impactScore >= 20 ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {projection.impactScore}% Impact
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={18} className="text-surface-400" /> : <ChevronDown size={18} className="text-surface-400" />}
      </button>

      {isExpanded && (
        <div className="border-t border-surface-100 p-4 space-y-4">
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <QuickActionButton
              label="+50% Engineering"
              icon={Settings}
              onClick={() => applyQuickAction('engineering')}
              isActive={activeQuickAction === 'engineering'}
              colorClass="bg-blue-100 text-blue-700 hover:bg-blue-200"
            />
            <QuickActionButton
              label="+50% Admin"
              icon={Shield}
              onClick={() => applyQuickAction('admin')}
              isActive={activeQuickAction === 'admin'}
              colorClass="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            />
            <QuickActionButton
              label="+50% PPE"
              icon={HardHat}
              onClick={() => applyQuickAction('ppe')}
              isActive={activeQuickAction === 'ppe'}
              colorClass="bg-amber-100 text-amber-700 hover:bg-amber-200"
            />
            {Object.keys(sliders).length > 0 && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700 ml-2"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          <hr className="border-surface-100" />

          {/* Sliders + Outcome Grid */}
          {dynamicSliders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">
              {/* Sliders */}
              <div className="space-y-4">
                <p className="text-xs text-surface-500 font-medium">Fine-tune factors:</p>
                {dynamicSliders.map(slider => (
                  <FactorSlider
                    key={slider.id}
                    slider={slider}
                    value={sliders[slider.id] || 0}
                    onChange={(v) => setSliders(s => ({ ...s, [slider.id]: v }))}
                  />
                ))}
              </div>

              {/* Impact Score Card */}
              <ImpactScoreCard
                impactScore={projection.impactScore}
                factorsAddressed={projection.factorsAddressed}
                confidence={confidence}
                breakdown={projection.breakdown}
              />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-surface-500">No controllable factors detected for this hazard.</p>
              <p className="text-xs text-surface-400 mt-1">Factor data may be limited.</p>
            </div>
          )}

          {/* Impact Bar */}
          {dynamicSliders.length > 0 && <ImpactBar percent={projection.impactScore} />}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RiskHubView - Connected hub visualization for Director Insights
 * Shows hazard at center with factors, times, and trend connected around it
 */
const RiskHubView = ({
  filteredIncidents,
  negativeIncidents,
  sortedHazards,
  factorData,
  period,
  siteClassifications = {}
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  // Default: expanded on desktop, collapsed on mobile
  const [whereExpanded, setWhereExpanded] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768
  )
  const [simExpanded, setSimExpanded] = useState(false)

  // Filter to significant hazards with data, sorted by priority
  const hazards = useMemo(() => {
    if (!sortedHazards?.length) return []
    return sortedHazards
      .filter(h => SIGNIFICANT_HAZARDS.includes(h.name) && !h.hasNoData && h.totalCount > 0)
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
  }, [sortedHazards])

  // Current hazard
  const currentHazard = hazards[currentIndex] || null

  // Get incidents for current hazard
  const hazardIncidents = useMemo(() => {
    if (!currentHazard || !negativeIncidents?.length) return []
    return negativeIncidents.filter(i => i.location === currentHazard.name)
  }, [currentHazard, negativeIncidents])

  // Get top factors for current hazard
  const hazardFactors = useMemo(() => {
    if (!currentHazard || !factorData?.byFactor || !hazardIncidents.length) return []

    // Build a map of hazard incident IDs
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))

    // Filter factors that appear in this hazard's incidents
    const factorsWithCounts = factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        // Count how many of this factor's incidents are in the hazard
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return {
          name: factor.name,
          count: matchingIncidents.length,
          percentage: hazardIncidents.length > 0
            ? (matchingIncidents.length / hazardIncidents.length) * 100
            : 0
        }
      })
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return factorsWithCounts
  }, [currentHazard, factorData, hazardIncidents])

  // Day of week patterns for current hazard
  const dayPatterns = useMemo(() => {
    if (!hazardIncidents.length) return null
    return getDayOfWeekPatterns(hazardIncidents)
  }, [hazardIncidents])

  // Hourly patterns for current hazard
  const hourPatterns = useMemo(() => {
    if (!hazardIncidents.length) return null
    return getHourlyPatterns(hazardIncidents)
  }, [hazardIncidents])

  // Build time cards data
  const timeCards = useMemo(() => {
    const cards = []

    // Peak day
    if (dayPatterns?.hasData && dayPatterns.patterns?.length > 0) {
      const sortedDays = [...dayPatterns.patterns].sort((a, b) => b.count - a.count)
      const peakDay = sortedDays[0]
      if (peakDay && peakDay.count > 0) {
        cards.push({
          type: 'day',
          label: peakDay.day,
          sublabel: 'Peak Day',
          deviation: peakDay.riskIndex - 100,
          isGap: false
        })
      }

      // Low day (gap) - only if significantly below average
      const lowDay = sortedDays[sortedDays.length - 1]
      if (lowDay && lowDay.riskIndex < 70) {
        cards.push({
          type: 'day',
          label: lowDay.day,
          sublabel: 'Gap - Low Coverage',
          deviation: lowDay.riskIndex - 100,
          isGap: true
        })
      }
    }

    // Peak shift
    if (hourPatterns?.hasData && hourPatterns.shifts?.length > 0) {
      const sortedShifts = [...hourPatterns.shifts].sort((a, b) => b.count - a.count)
      const peakShift = sortedShifts[0]
      if (peakShift && peakShift.count > 0) {
        const shiftLabel = peakShift.key.charAt(0).toUpperCase() + peakShift.key.slice(1)
        cards.push({
          type: 'shift',
          label: shiftLabel,
          sublabel: 'Peak Shift',
          deviation: peakShift.riskIndex - 100,
          isGap: false
        })
      }

      // Low shift (gap)
      const lowShift = sortedShifts[sortedShifts.length - 1]
      if (lowShift && lowShift.riskIndex < 70) {
        const shiftLabel = lowShift.key.charAt(0).toUpperCase() + lowShift.key.slice(1)
        cards.push({
          type: 'shift',
          label: shiftLabel,
          sublabel: 'Gap - Low Coverage',
          deviation: lowShift.riskIndex - 100,
          isGap: true
        })
      }
    }

    return cards.slice(0, 4) // Max 4 time cards
  }, [dayPatterns, hourPatterns])

  // Navigation handlers with animation
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(i => i - 1)
        setIsAnimating(false)
      }, 150)
    }
  }, [currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex < hazards.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(i => i + 1)
        setIsAnimating(false)
      }, 150)
    }
  }, [currentIndex, hazards.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  // Reset index when hazards change
  useEffect(() => {
    if (currentIndex >= hazards.length) {
      setCurrentIndex(Math.max(0, hazards.length - 1))
    }
  }, [hazards.length, currentIndex])

  // Empty state
  if (!hazards.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-surface-400" />
        </div>
        <h2 className="text-lg font-semibold text-surface-800 mb-2">No Significant Hazard Data</h2>
        <p className="text-sm text-surface-500 max-w-md mx-auto">
          No significant hazards found in the current data. Import more observations or adjust filters.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-surface-100 p-4 sm:p-6 animate-fade-in">
      {/* Desktop Layout */}
      <div className="hidden md:block relative min-h-[420px]">
        {/* Trend Badge - Top Center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <TrendBadge
            trend={currentHazard?.trendLevel?.level}
            changePercent={currentHazard?.changePercent}
          />
        </div>

        {/* Connector from trend to hub */}
        <div className="absolute top-16 left-1/2 w-0.5 h-8 bg-surface-200" />

        {/* Main 3-column grid */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 lg:gap-8 items-center pt-24 pb-16">
          {/* Left: Factors */}
          <div className="flex flex-col gap-3 items-end">
            {hazardFactors.length > 0 ? (
              hazardFactors.map((factor, idx) => (
                <FactorCard key={factor.name} factor={factor} index={idx} />
              ))
            ) : (
              <div className="w-44 p-4 text-center text-sm text-surface-400 italic">
                No factors detected
              </div>
            )}
            <div className="text-xs text-surface-400 font-medium uppercase tracking-wider mt-2 mr-11">
              Contributing Factors
            </div>
          </div>

          {/* Center: Hub */}
          <HubCenter
            hazard={currentHazard}
            rank={currentIndex + 1}
            total={hazards.length}
            isAnimating={isAnimating}
          />

          {/* Right: Times */}
          <div className="flex flex-col gap-3 items-start">
            {timeCards.length > 0 ? (
              timeCards.map((card, idx) => (
                <TimeCard key={`${card.type}-${card.label}-${idx}`} {...card} />
              ))
            ) : (
              <div className="w-44 p-4 text-center text-sm text-surface-400 italic">
                No time data available
              </div>
            )}
            <div className="text-xs text-surface-400 font-medium uppercase tracking-wider mt-2 ml-11">
              Temporal Patterns
            </div>
          </div>
        </div>

        {/* Navigation - Bottom Center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <NavigationBar
            current={currentIndex}
            total={hazards.length}
            onPrev={handlePrev}
            onNext={handleNext}
            hazardName={currentHazard?.name}
          />
        </div>
      </div>

      {/* WHERE Section - Desktop */}
      <div className="hidden md:block mt-4">
        <WhereSection
          hazardIncidents={hazardIncidents}
          siteClassifications={siteClassifications}
          isExpanded={whereExpanded}
          onToggle={() => setWhereExpanded(!whereExpanded)}
        />
      </div>

      {/* Simulation Drawer - Desktop */}
      <div className="hidden md:block mt-3">
        <SimulationDrawer
          currentHazard={currentHazard}
          hazardIncidents={hazardIncidents}
          factorData={factorData}
          isExpanded={simExpanded}
          onToggle={() => setSimExpanded(!simExpanded)}
        />
      </div>

      {/* Mobile Layout - Vertical Stack */}
      <div className="md:hidden space-y-4">
        {/* Trend Badge */}
        <div className="flex justify-center">
          <TrendBadge
            trend={currentHazard?.trendLevel?.level}
            changePercent={currentHazard?.changePercent}
          />
        </div>

        {/* Hub */}
        <div className="flex justify-center">
          <HubCenter
            hazard={currentHazard}
            rank={currentIndex + 1}
            total={hazards.length}
            isAnimating={isAnimating}
          />
        </div>

        {/* Factors Section */}
        {hazardFactors.length > 0 && (
          <div className="bg-surface-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
              Contributing Factors
            </h3>
            <div className="space-y-2">
              {hazardFactors.map(factor => (
                <div key={factor.name} className="flex items-center justify-between bg-white rounded-lg p-3 border border-surface-200">
                  <span className="text-sm font-medium text-surface-800">{factor.name}</span>
                  <span className="text-xs font-semibold text-primary-600">{Math.round(factor.percentage)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Times Section */}
        {timeCards.length > 0 && (
          <div className="bg-surface-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
              Temporal Patterns
            </h3>
            <div className="space-y-2">
              {timeCards.map((card, idx) => (
                <div
                  key={`${card.type}-${card.label}-${idx}`}
                  className={`flex items-center justify-between rounded-lg p-3 border ${card.isGap ? 'bg-amber-50 border-amber-300' : 'bg-white border-surface-200'}`}
                >
                  <div className="flex items-center gap-2">
                    {card.type === 'day' ? <Calendar size={14} className="text-surface-500" /> : <Clock size={14} className="text-surface-500" />}
                    <div>
                      <span className={`text-sm font-medium ${card.isGap ? 'text-amber-800' : 'text-surface-800'}`}>{card.label}</span>
                      <span className={`text-xs block ${card.isGap ? 'text-amber-600' : 'text-surface-500'}`}>{card.sublabel}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${card.deviation > 0 ? 'text-red-600' : card.deviation < 0 ? 'text-green-600' : 'text-surface-500'}`}>
                    {card.deviation > 0 ? '+' : ''}{card.deviation}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center pt-2">
          <NavigationBar
            current={currentIndex}
            total={hazards.length}
            onPrev={handlePrev}
            onNext={handleNext}
            hazardName={currentHazard?.name}
          />
        </div>

        {/* WHERE Section - Mobile (collapsed by default) */}
        <WhereSection
          hazardIncidents={hazardIncidents}
          siteClassifications={siteClassifications}
          isExpanded={whereExpanded}
          onToggle={() => setWhereExpanded(!whereExpanded)}
        />

        {/* Simulation Drawer - Mobile (collapsed by default) */}
        <SimulationDrawer
          currentHazard={currentHazard}
          hazardIncidents={hazardIncidents}
          factorData={factorData}
          isExpanded={simExpanded}
          onToggle={() => setSimExpanded(!simExpanded)}
        />
      </div>
    </div>
  )
}

export default React.memo(RiskHubView)
