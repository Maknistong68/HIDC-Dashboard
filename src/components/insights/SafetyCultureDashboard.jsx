import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Shield,
  Eye,
  Activity,
  CheckCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-react'

/**
 * SafetyCultureDashboard - Displays 4 safety culture metrics
 */
const SafetyCultureDashboard = ({ cultureData }) => {
  if (!cultureData) {
    return (
      <div className="flex items-center justify-center h-48 bg-surface-50 rounded-lg border border-surface-200">
        <p className="text-sm text-surface-500">Loading culture metrics...</p>
      </div>
    )
  }

  const { score, level, components, recommendations } = cultureData

  const getStatusIcon = (status) => {
    if (status === 'good') return CheckCircle
    if (status === 'warning') return AlertCircle
    return AlertTriangle
  }

  const getStatusColor = (status) => {
    if (status === 'good') return 'text-safety-success'
    if (status === 'warning') return 'text-safety-warning'
    return 'text-safety-critical'
  }

  const getStatusBg = (status) => {
    if (status === 'good') return 'bg-safety-success-light border-safety-success/20'
    if (status === 'warning') return 'bg-safety-warning-light border-safety-warning/20'
    return 'bg-safety-critical-light border-safety-critical/20'
  }

  const getLevelConfig = () => {
    if (level === 'good') return { color: 'text-safety-success', bg: 'bg-safety-success' }
    if (level === 'warning') return { color: 'text-safety-warning', bg: 'bg-safety-warning' }
    return { color: 'text-safety-critical', bg: 'bg-safety-critical' }
  }

  const levelConfig = getLevelConfig()

  // Component configs
  const componentConfigs = {
    'Engagement Velocity': { icon: Activity, color: 'blue' },
    'Reporter Diversity': { icon: Users, color: 'purple' },
    'Proactive Ratio': { icon: Shield, color: 'green' },
    'Leadership Visibility': { icon: Eye, color: 'amber' }
  }

  const getComponentColor = (name, type) => {
    const config = componentConfigs[name] || { color: 'surface' }
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', fill: 'bg-blue-500' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', fill: 'bg-purple-500' },
      green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', fill: 'bg-emerald-500' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', fill: 'bg-amber-500' },
      surface: { bg: 'bg-surface-50', border: 'border-surface-200', text: 'text-surface-600', fill: 'bg-surface-500' }
    }
    return colors[config.color][type]
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-surface-50 to-surface-100 rounded-lg border border-surface-200">
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
            Safety Culture Score
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-bold ${levelConfig.color}`}>
              {score}
            </span>
            <span className="text-lg text-surface-400">/100</span>
          </div>
          <p className="text-xs text-surface-500 mt-1 capitalize">
            {level} culture health
          </p>
        </div>

        {/* Circular gauge visualization */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke={level === 'good' ? '#22c55e' : level === 'warning' ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(score / 100) * 201} 201`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${levelConfig.color}`}>{score}%</span>
          </div>
        </div>
      </div>

      {/* Component Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {components.map((comp) => {
          const config = componentConfigs[comp.name] || { icon: Activity }
          const Icon = config.icon
          const status = comp.data?.status || 'unknown'
          const StatusIcon = getStatusIcon(status)

          return (
            <div
              key={comp.name}
              className={`p-4 rounded-lg border ${getComponentColor(comp.name, 'bg')} ${getComponentColor(comp.name, 'border')}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={getComponentColor(comp.name, 'text')} />
                  <span className="text-sm font-semibold text-surface-800">{comp.name}</span>
                </div>
                <StatusIcon size={16} className={getStatusColor(status)} />
              </div>

              {/* Score bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-500">Score</span>
                  <span className="font-bold text-surface-700">{comp.score}%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-surface-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getComponentColor(comp.name, 'fill')}`}
                    style={{ width: `${Math.min(comp.score, 100)}%` }}
                  />
                </div>
              </div>

              {/* Component-specific details */}
              <div className="text-xs text-surface-600 space-y-1">
                {comp.name === 'Engagement Velocity' && comp.data && (
                  <>
                    <div className="flex items-center gap-1">
                      {comp.data.trend === 'increasing' ? (
                        <TrendingUp size={12} className="text-safety-success" />
                      ) : comp.data.trend === 'decreasing' ? (
                        <TrendingDown size={12} className="text-safety-critical" />
                      ) : (
                        <Minus size={12} className="text-surface-400" />
                      )}
                      <span>
                        {comp.data.percentChange > 0 ? '+' : ''}{comp.data.percentChange}% vs last period
                      </span>
                    </div>
                    <p>{comp.data.currentPeriod} obs this week</p>
                  </>
                )}

                {comp.name === 'Reporter Diversity' && comp.data && (
                  <>
                    <p>{comp.data.uniqueReporters} unique reporters</p>
                    <p>{comp.data.diversityPct}% of expected diversity</p>
                  </>
                )}

                {comp.name === 'Proactive Ratio' && comp.data && (
                  <>
                    <p>{comp.data.ratio}:1 proactive to reactive</p>
                    <p>Target: {comp.data.target}:1</p>
                  </>
                )}

                {comp.name === 'Leadership Visibility' && comp.data && (
                  <>
                    <p>{comp.data.leadershipEvents} leadership events</p>
                    <p>{comp.data.ratio}% of observations (target: {comp.data.target}%)</p>
                  </>
                )}
              </div>

              {/* Message */}
              {comp.data?.message && (
                <p className="mt-2 text-2xs text-surface-500 italic">
                  {comp.data.message}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">
            Improvement Recommendations
          </h4>
          <ul className="space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-amber-700 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default React.memo(SafetyCultureDashboard)
