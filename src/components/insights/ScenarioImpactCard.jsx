import React from 'react'
import { CheckCircle, Clock, Moon, Target, ArrowRight, TrendingUp } from 'lucide-react'

/**
 * ScenarioImpactCard - Display projected outcome for a simulation scenario
 */
const ScenarioImpactCard = ({ scenario }) => {
  if (!scenario) return null

  const getScenarioConfig = (name) => {
    if (name.includes('Overdue') || name.includes('Action')) {
      return {
        icon: Clock,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100',
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50'
      }
    }
    if (name.includes('Night') || name.includes('Coverage')) {
      return {
        icon: Moon,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50'
      }
    }
    if (name.includes('Reduce') || name.includes('Root')) {
      return {
        icon: Target,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100',
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50'
      }
    }
    return {
      icon: TrendingUp,
      iconColor: 'text-surface-600',
      iconBg: 'bg-surface-100',
      borderColor: 'border-surface-200',
      bgColor: 'bg-surface-50'
    }
  }

  const config = getScenarioConfig(scenario.name)
  const Icon = config.icon
  const hasImprovement = scenario.scoreDelta > 0 || scenario.improvement > 0

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-full ${config.iconBg}`}>
          <Icon size={14} className={config.iconColor} />
        </div>
        <h4 className="text-sm font-semibold text-surface-800">{scenario.name}</h4>
      </div>

      {/* Metrics based on scenario type */}
      <div className="space-y-2 text-xs">
        {/* Action Closure Scenario */}
        {scenario.currentOverdue !== undefined && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Overdue Actions</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-surface-700">{scenario.currentOverdue}</span>
                <ArrowRight size={12} className="text-surface-400" />
                <span className="font-bold text-safety-success">{scenario.projectedOverdue}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Action Score</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-surface-700">{scenario.currentActionScore}%</span>
                <ArrowRight size={12} className="text-surface-400" />
                <span className="font-bold text-safety-success">{scenario.projectedActionScore}%</span>
              </div>
            </div>
          </>
        )}

        {/* Coverage Scenario */}
        {scenario.currentNightPct !== undefined && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Night Coverage</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-surface-700">{scenario.currentNightPct}%</span>
                <ArrowRight size={12} className="text-surface-400" />
                <span className="font-bold text-safety-success">{scenario.targetNightPct}%</span>
              </div>
            </div>
            {scenario.additionalObsNeeded > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-surface-600">Additional Obs Needed</span>
                <span className="font-medium text-surface-700">{scenario.additionalObsNeeded}</span>
              </div>
            )}
          </>
        )}

        {/* Root Cause Reduction Scenario */}
        {scenario.rootCause && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Current Count</span>
              <span className="font-medium text-surface-700">{scenario.currentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Projected Reduction</span>
              <span className="font-bold text-safety-success">-{scenario.projectedReduction}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Overall Impact</span>
              <span className="font-bold text-safety-success">-{scenario.overallReductionPct}%</span>
            </div>
          </>
        )}
      </div>

      {/* Score Impact */}
      {scenario.scoreDelta !== undefined && scenario.scoreDelta !== 0 && (
        <div className="mt-3 pt-3 border-t border-surface-200/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-600">Risk Score Impact</span>
            <span className={`text-sm font-bold ${hasImprovement ? 'text-safety-success' : 'text-surface-600'}`}>
              {hasImprovement ? '+' : ''}{scenario.scoreDelta} pts
            </span>
          </div>
        </div>
      )}

      {/* Improvement badge */}
      {hasImprovement && (
        <div className="mt-3 flex items-center gap-1.5 text-safety-success">
          <CheckCircle size={14} />
          <span className="text-xs font-medium">
            +{scenario.improvement || scenario.scoreDelta}% improvement
          </span>
        </div>
      )}
    </div>
  )
}

export default React.memo(ScenarioImpactCard)
