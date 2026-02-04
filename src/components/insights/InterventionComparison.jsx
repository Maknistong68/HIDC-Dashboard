import React, { useMemo } from 'react'
import { TrendingDown, TrendingUp, CheckCircle, Shield, Settings, User, Leaf, Target } from 'lucide-react'

// Category icons mapping
const CATEGORY_ICONS = {
  'Engineering Controls': Settings,
  'Administrative Controls': Shield,
  'Personal Protective Equipment': User,
  'Environmental Controls': Leaf,
  'Corrective Actions': CheckCircle
}

const CATEGORY_COLORS = {
  'Engineering Controls': { text: 'text-blue-600', bg: 'bg-blue-500' },
  'Administrative Controls': { text: 'text-indigo-600', bg: 'bg-indigo-500' },
  'Personal Protective Equipment': { text: 'text-amber-600', bg: 'bg-amber-500' },
  'Environmental Controls': { text: 'text-green-600', bg: 'bg-green-500' },
  'Corrective Actions': { text: 'text-orange-600', bg: 'bg-orange-500' }
}

/**
 * InterventionComparison - Clean, intuitive impact visualization
 * Focuses on percentage reduction with clear visual feedback
 */
const InterventionComparison = ({
  baseline,
  projected,
  effects = {},
  changePercent = 0,
  selectedHazard
}) => {
  const isImproved = changePercent < 0
  const hasChanges = changePercent !== 0
  const absChange = Math.abs(changePercent)

  // Calculate actual values for display
  const actualProjected = baseline * (1 + changePercent / 100)
  const actualDifference = Math.abs(baseline - actualProjected)

  // Build interventions list from effects object
  const interventions = useMemo(() => {
    const list = []

    for (const [key, effect] of Object.entries(effects)) {
      if (!effect || effect.effect === 0) continue

      list.push({
        id: key,
        name: effect.label || effect.factor,
        effect: Math.round(effect.effect * 10) / 10,
        category: effect.category || 'Other',
        factor: effect.factor
      })
    }

    return list.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect))
  }, [effects])

  // Group interventions by category
  const groupedInterventions = useMemo(() => {
    const grouped = {}
    for (const intervention of interventions) {
      if (!grouped[intervention.category]) {
        grouped[intervention.category] = []
      }
      grouped[intervention.category].push(intervention)
    }
    return grouped
  }, [interventions])

  if (!hasChanges) {
    return (
      <div className="p-4 bg-surface-50 rounded-lg border border-surface-200 text-center">
        <Target size={24} className="text-surface-300 mx-auto mb-2" />
        <p className="text-sm text-surface-500">Adjust sliders to see projected impact</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border-2 overflow-hidden ${
      isImproved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      {/* Header with hazard name */}
      <div className={`px-4 py-2 ${isImproved ? 'bg-green-100' : 'bg-red-100'}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
            Projected Outcome
          </span>
          {selectedHazard && selectedHazard !== 'all' && (
            <span className="text-xs text-primary-600 font-medium">
              {selectedHazard}
            </span>
          )}
        </div>
      </div>

      {/* Main Impact Display - Clean and focused */}
      <div className="p-4">
        {/* Big percentage display */}
        <div className="text-center mb-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isImproved ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isImproved ? (
              <TrendingDown size={24} className="text-green-600" />
            ) : (
              <TrendingUp size={24} className="text-red-600" />
            )}
            <span className={`text-3xl font-bold ${
              isImproved ? 'text-green-600' : 'text-red-600'
            }`}>
              {changePercent > 0 ? '+' : ''}{changePercent}%
            </span>
          </div>

          <p className={`text-sm mt-2 ${isImproved ? 'text-green-700' : 'text-red-700'}`}>
            {isImproved ? 'Potential Reduction' : 'Projected Increase'}
          </p>
        </div>

        {/* Visual reduction meter */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
            <span>Current Risk</span>
            <span>After Interventions</span>
          </div>
          <div className="h-4 bg-surface-200 rounded-full overflow-hidden relative">
            {/* Background (full bar = current risk) */}
            <div className="absolute inset-0 bg-surface-300 rounded-full" />

            {/* Reduction indicator */}
            {isImproved && (
              <div
                className="absolute top-0 right-0 h-full bg-green-400 rounded-r-full transition-all duration-500"
                style={{ width: `${Math.min(absChange, 100)}%` }}
              />
            )}

            {/* Remaining risk */}
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                isImproved ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.max(100 - absChange, 0)}%` }}
            />

            {/* Percentage marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-surface-800 transition-all duration-500"
              style={{ left: `${100 - absChange}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-surface-600 font-medium">
              {baseline}/week baseline
            </span>
            <span className={`font-bold ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
              {actualProjected.toFixed(1)}/week projected
            </span>
          </div>
        </div>

        {/* Compact interventions list */}
        {interventions.length > 0 && (
          <div className="border-t border-surface-200 pt-3">
            <p className="text-xs font-semibold text-surface-600 mb-2">
              Impact Breakdown:
            </p>
            <div className="space-y-1.5">
              {Object.entries(groupedInterventions).map(([category, items]) => {
                const colors = CATEGORY_COLORS[category] || { text: 'text-surface-600', bg: 'bg-surface-500' }
                const Icon = CATEGORY_ICONS[category] || CheckCircle
                const totalEffect = items.reduce((sum, i) => sum + i.effect, 0)

                return (
                  <div key={category} className="flex items-center justify-between py-1 px-2 bg-white rounded border border-surface-100">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={colors.text} />
                      <span className="text-xs text-surface-700">
                        {category}
                        {items.length > 1 && (
                          <span className="text-surface-400 ml-1">({items.length})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Mini impact bar */}
                      <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${totalEffect < 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(totalEffect) * 2, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold min-w-[45px] text-right ${
                        totalEffect < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {totalEffect > 0 ? '+' : ''}{totalEffect.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom summary */}
        <div className={`mt-3 pt-3 border-t text-center ${
          isImproved ? 'border-green-200' : 'border-red-200'
        }`}>
          <p className={`text-xs ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
            {isImproved ? (
              actualDifference >= 0.5 ? (
                <><strong>~{Math.round(actualDifference)}</strong> fewer incidents expected per week</>
              ) : (
                <><strong>{actualDifference.toFixed(2)}</strong> fewer incidents expected per week</>
              )
            ) : (
              <><strong>+{actualDifference >= 0.5 ? Math.round(actualDifference) : actualDifference.toFixed(2)}</strong> more incidents expected per week</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default React.memo(InterventionComparison)
