import React, { useState, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { GitCompare, Save, Trash2, RotateCcw, X } from 'lucide-react'

const MAX_SCENARIOS = 4
const SCENARIO_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

const getRiskLevel = (projected, baseline) => {
  if (!baseline || baseline === 0) return 'unknown'
  const ratio = projected / baseline
  if (ratio <= 0.8) return 'low'
  if (ratio <= 1.0) return 'medium'
  if (ratio <= 1.2) return 'elevated'
  return 'high'
}

const getRiskBadge = (level) => {
  const styles = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    elevated: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
    unknown: 'bg-surface-100 text-surface-500'
  }
  return styles[level] || styles.unknown
}

const ComparisonTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-surface-200 text-xs">
      <p className="font-semibold text-surface-700 mb-1">{item?.name}</p>
      <p className="text-surface-500">
        Projected: <span className="font-semibold">{item?.projected?.toFixed(1)}/wk</span>
      </p>
      {item?.change != null && (
        <p className={item.change < 0 ? 'text-green-600' : item.change > 0 ? 'text-red-500' : 'text-surface-500'}>
          {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}% vs baseline
        </p>
      )}
    </div>
  )
}

const ScenarioComparisonPanel = ({
  currentProjection,
  weekly,
  sliders,
  actionsToClose,
  effectiveSelectedHazards,
  hasChanges,
  savedScenarios,
  onSaveScenario,
  onDeleteScenario,
  onLoadScenario
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [scenarioName, setScenarioName] = useState('')

  const baselineProjected = weekly?.predicted || 0

  const handleSave = useCallback(() => {
    if (!scenarioName.trim() || !currentProjection) return
    onSaveScenario({
      name: scenarioName.trim(),
      projected: currentProjection.projected,
      change: currentProjection.changePercent || 0,
      sliders: { ...sliders },
      actionsToClose,
      hazards: [...effectiveSelectedHazards],
      timestamp: Date.now()
    })
    setScenarioName('')
    setShowSaveDialog(false)
  }, [scenarioName, currentProjection, sliders, actionsToClose, effectiveSelectedHazards, onSaveScenario])

  // Build chart data
  const chartData = []
  chartData.push({
    name: 'Baseline',
    projected: baselineProjected,
    change: 0,
    isBaseline: true
  })
  if (hasChanges && currentProjection) {
    chartData.push({
      name: 'Current',
      projected: currentProjection.projected,
      change: currentProjection.changePercent || 0,
      isCurrent: true
    })
  }
  for (const s of savedScenarios) {
    chartData.push({
      name: s.name,
      projected: s.projected,
      change: s.change
    })
  }

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-purple-500" />
          <h3 className="text-sm font-semibold text-surface-800">Scenario Comparison</h3>
          {savedScenarios.length > 0 && (
            <span className="text-2xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {savedScenarios.length} saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && currentProjection && savedScenarios.length < MAX_SCENARIOS && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors"
            >
              <Save size={12} />
              Save Scenario
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Save dialog */}
        {showSaveDialog && (
          <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-lg border border-surface-200">
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Scenario name..."
              className="flex-1 text-sm px-2 py-1 rounded border border-surface-300 focus:border-primary-400 focus:outline-none"
              maxLength={30}
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={!scenarioName.trim()}
              className="px-3 py-1 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setShowSaveDialog(false); setScenarioName('') }}
              className="p-1 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Comparison table */}
        {(savedScenarios.length > 0 || (hasChanges && currentProjection)) && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-2 px-2 font-medium text-surface-500">Scenario</th>
                  <th className="text-right py-2 px-2 font-medium text-surface-500">Projected/wk</th>
                  <th className="text-right py-2 px-2 font-medium text-surface-500">Change</th>
                  <th className="text-center py-2 px-2 font-medium text-surface-500">Risk</th>
                  <th className="text-right py-2 px-2 font-medium text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-surface-50">
                  <td className="py-2 px-2 font-medium text-surface-700">Baseline</td>
                  <td className="py-2 px-2 text-right font-semibold text-surface-800">{baselineProjected}</td>
                  <td className="py-2 px-2 text-right text-surface-400">—</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${getRiskBadge('medium')}`}>
                      Baseline
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-surface-400">—</td>
                </tr>
                {hasChanges && currentProjection && (
                  <tr className="border-b border-surface-50 bg-primary-50/30">
                    <td className="py-2 px-2 font-medium text-primary-700">Current (unsaved)</td>
                    <td className="py-2 px-2 text-right font-semibold text-surface-800">
                      {currentProjection.projected?.toFixed(1)}
                    </td>
                    <td className={`py-2 px-2 text-right font-medium ${
                      currentProjection.changePercent < 0 ? 'text-green-600' : currentProjection.changePercent > 0 ? 'text-red-500' : 'text-surface-500'
                    }`}>
                      {currentProjection.changePercent > 0 ? '+' : ''}{currentProjection.changePercent?.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${getRiskBadge(getRiskLevel(currentProjection.projected, baselineProjected))}`}>
                        {getRiskLevel(currentProjection.projected, baselineProjected)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-surface-400">—</td>
                  </tr>
                )}
                {savedScenarios.map((scenario, idx) => (
                  <tr key={scenario.timestamp} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SCENARIO_COLORS[idx % SCENARIO_COLORS.length] }} />
                        <span className="font-medium text-surface-700">{scenario.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-surface-800">
                      {scenario.projected?.toFixed(1)}
                    </td>
                    <td className={`py-2 px-2 text-right font-medium ${
                      scenario.change < 0 ? 'text-green-600' : scenario.change > 0 ? 'text-red-500' : 'text-surface-500'
                    }`}>
                      {scenario.change > 0 ? '+' : ''}{scenario.change?.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${getRiskBadge(getRiskLevel(scenario.projected, baselineProjected))}`}>
                        {getRiskLevel(scenario.projected, baselineProjected)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onLoadScenario(scenario)}
                          className="p-1 text-surface-400 hover:text-primary-600 transition-colors"
                          title="Load scenario"
                        >
                          <RotateCcw size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteScenario(scenario.timestamp)}
                          className="p-1 text-surface-400 hover:text-red-500 transition-colors"
                          title="Delete scenario"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Comparison chart */}
        {chartData.length > 1 && (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<ComparisonTooltip />} />
                <Bar dataKey="projected" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        entry.isBaseline ? '#94a3b8' :
                        entry.isCurrent ? '#6366f1' :
                        SCENARIO_COLORS[(idx - (hasChanges ? 2 : 1)) % SCENARIO_COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {savedScenarios.length === 0 && !hasChanges && (
          <div className="text-center py-6 text-sm text-surface-400">
            <GitCompare size={24} className="mx-auto mb-2 text-surface-300" />
            <p>Adjust simulator controls and save scenarios to compare.</p>
            <p className="text-2xs mt-1">Up to {MAX_SCENARIOS} scenarios can be saved.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(ScenarioComparisonPanel)
