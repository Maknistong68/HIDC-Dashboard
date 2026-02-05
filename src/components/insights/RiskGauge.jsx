import React, { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, HelpCircle, Calculator, Target, Activity } from 'lucide-react'

/**
 * RiskGauge - Visual 5-level risk gauge showing where prediction falls on risk spectrum
 *
 * Props:
 *  - predicted: The predicted incident count
 *  - average: Historical average for comparison
 *  - confidence: 'low' | 'medium' | 'high'
 *  - size: 'small' | 'medium' | 'large'
 *  - trend: 'increasing' | 'stable' | 'decreasing'
 *  - factorData: (optional) Factor data from aggregateContributingFactors for explanation
 *  - weeklyHistory: (optional) Recent weekly counts for trend analysis
 */
const RiskGauge = ({
  predicted,
  average,
  confidence = 'medium',
  size = 'medium',
  trend = 'stable',
  showComparison = true,
  factorData,
  weeklyHistory
}) => {
  const [showExplanation, setShowExplanation] = useState(false)
  // Calculate risk level based on predicted vs average
  const riskAnalysis = useMemo(() => {
    if (predicted === undefined || predicted === null || average === undefined || average === null) {
      return {
        level: 2, // Medium as default
        label: 'Medium',
        color: 'amber',
        percent: 50,
        changePercent: 0,
        isAbove: false
      }
    }

    const changePercent = average > 0 ? Math.round(((predicted - average) / average) * 100) : 0
    const isAbove = predicted > average

    // Determine risk level (0-4)
    let level, label, color
    if (changePercent <= -30) {
      level = 0
      label = 'Low'
      color = 'green'
    } else if (changePercent <= -10) {
      level = 1
      label = 'OK'
      color = 'emerald'
    } else if (changePercent <= 15) {
      level = 2
      label = 'Medium'
      color = 'amber'
    } else if (changePercent <= 40) {
      level = 3
      label = 'High'
      color = 'orange'
    } else {
      level = 4
      label = 'Critical'
      color = 'red'
    }

    // Calculate pointer position (0-100%)
    // Maps level 0-4 to position 10%, 30%, 50%, 70%, 90%
    const percent = 10 + level * 20

    return { level, label, color, percent, changePercent, isAbove }
  }, [predicted, average])

  // Extract top contributing factors from factorData
  const topFactors = useMemo(() => {
    if (!factorData?.byFactor) return []

    const factors = Object.entries(factorData.byFactor)
      .map(([name, data]) => ({
        name,
        count: data.count || 0,
        percentage: data.percentage || 0
      }))
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)

    return factors
  }, [factorData])

  // Analyze weekly trend pattern
  const trendAnalysis = useMemo(() => {
    if (!weeklyHistory?.days?.length) return null

    const days = weeklyHistory.days
    // Group by week (last 3 weeks)
    const weeklyData = []
    const now = new Date()

    for (let w = 2; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekCount = days.filter(d => {
        const date = new Date(d.date)
        return date >= weekStart && date < weekEnd
      }).reduce((sum, d) => sum + (d.count || 0), 0)

      weeklyData.push({
        week: 3 - w,
        count: weekCount
      })
    }

    // Determine pattern
    let pattern = 'stable'
    if (weeklyData.length >= 2) {
      const lastTwo = weeklyData.slice(-2)
      const change = lastTwo[1].count - lastTwo[0].count
      if (change > 1) pattern = 'increasing'
      else if (change < -1) pattern = 'decreasing'
    }

    // Check for steady trend across all 3 weeks
    if (weeklyData.length === 3) {
      const [w1, w2, w3] = weeklyData.map(w => w.count)
      if (w1 < w2 && w2 < w3) pattern = 'steadily increasing'
      else if (w1 > w2 && w2 > w3) pattern = 'steadily decreasing'
      else if (w1 < w2 && w2 > w3) pattern = 'peaked then dropped'
      else if (w1 > w2 && w2 < w3) pattern = 'dipped then rose'
    }

    return {
      weeks: weeklyData,
      pattern
    }
  }, [weeklyHistory])

  // Generate possible causes based on top factors
  const possibleCauses = useMemo(() => {
    if (!topFactors.length) return []

    const causeMap = {
      'Training': 'New workers joining or refresher training needed',
      'Supervision': 'Shift changes or supervisory gaps',
      'Environment': 'Weather conditions or site layout changes',
      'Equipment': 'Equipment maintenance or new machinery introduction',
      'Procedure': 'Process changes or procedure updates needed',
      'Communication': 'Information flow gaps between teams',
      'Housekeeping': 'Site organization or cleanup schedules',
      'PPE': 'Personal protective equipment availability or compliance',
      'Fatigue': 'Scheduling or overtime patterns',
      'Awareness': 'Hazard visibility or safety signage'
    }

    return topFactors
      .slice(0, 3)
      .map(f => ({
        factor: f.name,
        cause: causeMap[f.name] || `Issues related to ${f.name.toLowerCase()}`
      }))
  }, [topFactors])

  // Get threshold explanation
  const getThresholdExplanation = () => {
    const { changePercent, label } = riskAnalysis
    switch (label) {
      case 'Low':
        return `≤ -30% below average (current: ${changePercent}%)`
      case 'OK':
        return `-10% to -30% below average (current: ${changePercent}%)`
      case 'Medium':
        return `-10% to +15% of average (current: ${changePercent > 0 ? '+' : ''}${changePercent}%)`
      case 'High':
        return `+15% to +40% above average (current: +${changePercent}%)`
      case 'Critical':
        return `> +40% above average (current: +${changePercent}%)`
      default:
        return ''
    }
  }

  const sizeClasses = {
    small: {
      container: 'py-2',
      gauge: 'h-3',
      pointer: 'w-3 h-3 -top-0.5',
      text: 'text-xs',
      label: 'text-2xs'
    },
    medium: {
      container: 'py-3',
      gauge: 'h-4',
      pointer: 'w-4 h-4 -top-0.5',
      text: 'text-sm',
      label: 'text-xs'
    },
    large: {
      container: 'py-4',
      gauge: 'h-5',
      pointer: 'w-5 h-5 -top-1',
      text: 'text-base',
      label: 'text-sm'
    }
  }

  const s = sizeClasses[size] || sizeClasses.medium

  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp size={size === 'small' ? 12 : 14} className="text-red-500" />
    if (trend === 'decreasing') return <TrendingDown size={size === 'small' ? 12 : 14} className="text-green-500" />
    return <Minus size={size === 'small' ? 12 : 14} className="text-surface-400" />
  }

  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' }
      case 'emerald':
        return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100' }
      case 'amber':
        return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' }
      case 'orange':
        return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100' }
      case 'red':
        return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' }
      default:
        return { bg: 'bg-surface-500', text: 'text-surface-600', light: 'bg-surface-100' }
    }
  }

  const colors = getColorClasses(riskAnalysis.color)

  return (
    <div className={`space-y-2 ${s.container}`}>
      {/* Risk Level Label */}
      <div className="flex items-center justify-between">
        <span className={`font-medium text-surface-700 ${s.label}`}>Weekly Risk Level</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${colors.text} ${s.text}`}>
            {riskAnalysis.label}
          </span>
          {getTrendIcon()}
        </div>
      </div>

      {/* Gauge Container */}
      <div className="relative">
        {/* Gauge Track */}
        <div className={`flex rounded-full overflow-hidden ${s.gauge}`}>
          {/* LOW */}
          <div className="flex-1 bg-green-500" title="Low" />
          {/* OK */}
          <div className="flex-1 bg-emerald-400" title="OK" />
          {/* MEDIUM */}
          <div className="flex-1 bg-amber-400" title="Medium" />
          {/* HIGH */}
          <div className="flex-1 bg-orange-500" title="High" />
          {/* CRITICAL */}
          <div className="flex-1 bg-red-500" title="Critical" />
        </div>

        {/* Pointer */}
        <div
          className="absolute transition-all duration-500 ease-out"
          style={{ left: `calc(${riskAnalysis.percent}% - 8px)`, top: '-2px' }}
        >
          <div className={`${s.pointer} relative`}>
            {/* Pointer arrow */}
            <div
              className="w-0 h-0 mx-auto"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '8px solid #1e293b'
              }}
            />
          </div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between mt-1 px-1">
          <span className="text-2xs text-surface-400">Low</span>
          <span className="text-2xs text-surface-400">OK</span>
          <span className="text-2xs text-surface-400">Med</span>
          <span className="text-2xs text-surface-400">High</span>
          <span className="text-2xs text-surface-400">Crit</span>
        </div>
      </div>

      {/* Comparison Stats */}
      {showComparison && predicted !== undefined && average !== undefined && (
        <div className={`flex items-center justify-between pt-1 border-t border-surface-100 ${s.label}`}>
          <span className="text-surface-500">
            {predicted} predicted vs {Math.round(average)} avg
          </span>
          <span className={`font-bold ${riskAnalysis.isAbove ? 'text-red-500' : 'text-green-500'}`}>
            {riskAnalysis.isAbove ? '+' : ''}{riskAnalysis.changePercent}%
          </span>
        </div>
      )}

      {/* Confidence indicator */}
      {confidence && (
        <div className={`flex items-center gap-1 ${s.label}`}>
          <span className="text-surface-400">Confidence:</span>
          <div className="flex items-center gap-0.5">
            <div className={`w-1.5 h-3 rounded-full ${confidence !== 'low' ? 'bg-primary-500' : 'bg-surface-200'}`} />
            <div className={`w-1.5 h-3 rounded-full ${confidence === 'high' || confidence === 'medium' ? 'bg-primary-500' : 'bg-surface-200'}`} />
            <div className={`w-1.5 h-3 rounded-full ${confidence === 'high' ? 'bg-primary-500' : 'bg-surface-200'}`} />
          </div>
          <span className="text-surface-500 capitalize">{confidence}</span>
        </div>
      )}

      {/* Why? Explanation Button */}
      {showComparison && predicted !== undefined && average !== undefined && (
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 transition-colors pt-1"
        >
          {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <HelpCircle size={12} />
          <span>Why is risk {riskAnalysis.label}?</span>
        </button>
      )}

      {/* Expandable Explanation Panel */}
      {showExplanation && (
        <div className="mt-2 p-3 bg-surface-50 rounded-lg border border-surface-200 text-xs space-y-4">
          {/* Calculation Breakdown */}
          <div>
            <p className="font-semibold text-surface-700 mb-2 flex items-center gap-1.5">
              <Calculator size={14} className="text-primary-500" />
              Calculation
            </p>
            <div className="bg-white rounded-lg p-3 border border-surface-200">
              <div className="font-mono text-xs text-surface-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Predicted incidents</span>
                  <span className="font-semibold">{predicted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Historical average</span>
                  <span className="font-semibold">{Math.round(average)}</span>
                </div>
                <div className="flex items-center justify-between text-surface-400">
                  <span>Formula</span>
                  <span>(predicted - avg) / avg × 100</span>
                </div>
                <div className="border-t border-surface-200 pt-1.5 mt-1.5 flex items-center justify-between">
                  <span className="font-semibold">Result</span>
                  <span className={`font-bold ${riskAnalysis.isAbove ? 'text-red-500' : 'text-green-500'}`}>
                    ({predicted} - {Math.round(average)}) / {Math.round(average)} = {riskAnalysis.isAbove ? '+' : ''}{riskAnalysis.changePercent}%
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-surface-100">
                <p className="text-2xs text-surface-500">
                  <span className="font-medium">Threshold:</span> {getThresholdExplanation()}
                </p>
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          {topFactors.length > 0 && (
            <div>
              <p className="font-semibold text-surface-700 mb-2 flex items-center gap-1.5">
                <Target size={14} className="text-amber-500" />
                Contributing Factors
              </p>
              <div className="space-y-2">
                {topFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-surface-400">•</span>
                    <span className="text-surface-700 font-medium flex-1">{factor.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${Math.min(factor.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-surface-500 text-2xs w-12 text-right">
                        {factor.percentage.toFixed(0)}% recent
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Trend */}
          {trendAnalysis && trendAnalysis.weeks.length > 0 && (
            <div>
              <p className="font-semibold text-surface-700 mb-2 flex items-center gap-1.5">
                <Activity size={14} className="text-blue-500" />
                Recent Trend
              </p>
              <div className="bg-white rounded-lg p-3 border border-surface-200">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {trendAnalysis.weeks.map((week, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <div className="text-2xs text-surface-400 mb-1">Week {week.week}</div>
                      <div className={`text-lg font-bold ${
                        idx === trendAnalysis.weeks.length - 1
                          ? (riskAnalysis.isAbove ? 'text-red-500' : 'text-green-500')
                          : 'text-surface-600'
                      }`}>
                        {week.count}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Trend arrows between weeks */}
                <div className="flex items-center justify-center gap-1 text-surface-400">
                  {trendAnalysis.weeks.slice(0, -1).map((week, idx) => {
                    const next = trendAnalysis.weeks[idx + 1]
                    const diff = next.count - week.count
                    return (
                      <React.Fragment key={idx}>
                        <span className="text-sm">{week.count}</span>
                        <span className="text-xs">→</span>
                      </React.Fragment>
                    )
                  })}
                  <span className="text-sm">{trendAnalysis.weeks[trendAnalysis.weeks.length - 1]?.count}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-surface-100 text-center">
                  <span className="text-2xs text-surface-500">
                    Pattern: <span className="font-medium capitalize">{trendAnalysis.pattern}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Possible Causes */}
          {possibleCauses.length > 0 && riskAnalysis.level >= 2 && (
            <div>
              <p className="font-semibold text-surface-700 mb-2 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-purple-500" />
                Possible Causes
              </p>
              <div className="space-y-1.5">
                {possibleCauses.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-surface-600">
                    <span className="text-surface-400 mt-0.5">•</span>
                    <span>
                      <span className="font-medium">{item.factor}:</span>{' '}
                      {item.cause}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No data message */}
          {topFactors.length === 0 && !trendAnalysis && (
            <div className="text-center py-2 text-surface-400">
              <p>Detailed factor analysis not available.</p>
              <p className="text-2xs mt-1">Factor data is extracted from observation descriptions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(RiskGauge)
