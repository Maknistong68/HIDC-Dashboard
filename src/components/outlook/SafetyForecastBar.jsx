import React, { useMemo, useState, useCallback } from 'react'
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, ChevronDown, ChevronUp } from 'lucide-react'
import { calculateSafetyWeather } from '../../utils/safetyForecast'

const ICON_MAP = {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning
}

/** Tiny colored dot for factor health */
function SignalDot({ score }) {
  const bg = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${bg}`} />
}

/** Thin progress bar (0-100) */
function ScoreBar({ score, color }) {
  return (
    <div className="w-full h-1 rounded-full bg-surface-200 overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  )
}

/** Single weather card (week or month) */
function ForecastCard({ label, weather }) {
  const WeatherIcon = ICON_MAP[weather.icon] || Cloud
  const animClass =
    weather.icon === 'Sun' ? 'animate-spin-slow' :
    weather.icon === 'CloudRain' || weather.icon === 'CloudLightning' ? 'animate-pulse' :
    ''

  return (
    <div className="flex-1 min-w-[180px]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${weather.color}18` }}
        >
          <WeatherIcon size={22} style={{ color: weather.color }} className={animClass} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: weather.color }}>
            {weather.label}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-surface-500">Score: {weather.score}/100</span>
            <div className="flex items-center gap-0.5 ml-1">
              {weather.factors.map(f => (
                <SignalDot key={f.key} score={f.score} />
              ))}
            </div>
          </div>
          <ScoreBar score={weather.score} color={weather.color} />
        </div>
      </div>
      <p className="text-[11px] text-surface-500 mt-1.5 leading-tight truncate" title={weather.insight}>
        {weather.insight}
      </p>
    </div>
  )
}

/** Factor row in expanded view */
function FactorRow({ factor }) {
  const barColor = factor.score >= 70 ? '#22c55e' : factor.score >= 40 ? '#eab308' : '#ef4444'
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-surface-600 w-32 flex-shrink-0 truncate" title={factor.name}>
        {factor.name}
      </span>
      <div className="flex-1 h-2 rounded-full bg-surface-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${factor.score}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs font-medium text-surface-600 w-8 text-right">{factor.score}</span>
    </div>
  )
}

/**
 * SafetyForecastBar - Weather forecast for safety, shown above SafetyOutlook tabs.
 */
const SafetyForecastBar = React.memo(({ incidents }) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded(p => !p), [])

  const weekWeather = useMemo(() => calculateSafetyWeather(incidents, 'week'), [incidents])
  const monthWeather = useMemo(() => calculateSafetyWeather(incidents, 'month'), [incidents])

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden transition-all duration-300">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-surface-50 transition-colors"
        aria-expanded={expanded}
        aria-controls="forecast-details"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
          Safety Forecast
        </span>
        <span className="text-surface-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Forecast cards */}
      <div className="px-4 pb-3 flex flex-col sm:flex-row gap-4 sm:gap-6">
        <ForecastCard label="This Week" weather={weekWeather} />
        <div className="hidden sm:block w-px bg-surface-200 self-stretch" />
        <ForecastCard label="This Month" weather={monthWeather} />
      </div>

      {/* Expanded: factor breakdown */}
      {expanded && (
        <div id="forecast-details" className="px-4 pb-4 border-t border-surface-100 pt-3 animate-fade-in">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-2">
            Signal Breakdown
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
            {/* Use week factors for display (they share the same signal names) */}
            {weekWeather.factors.map(f => (
              <div key={f.key} className="flex items-center gap-2 py-1.5">
                <span className="text-xs text-surface-600 w-32 flex-shrink-0 truncate" title={f.name}>
                  {f.name}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${f.score}%`,
                        backgroundColor: f.score >= 70 ? '#22c55e' : f.score >= 40 ? '#eab308' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-surface-500 w-6 text-right">{f.score}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-surface-400 mt-2 italic">
            Based on recent trends, reporting quality, and open actions.
          </p>
        </div>
      )}
    </div>
  )
})

SafetyForecastBar.displayName = 'SafetyForecastBar'

export default SafetyForecastBar
