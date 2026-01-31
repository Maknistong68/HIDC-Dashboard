import React, { useState, useMemo, useCallback } from 'react'
import {
  RefreshCw,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  Clock,
  Moon,
  Target,
  Users,
  HelpCircle
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

/**
 * What-If Simulator - Clean, intuitive design
 */
const WhatIfSimulator = ({ incidents, overdueCount, currentNightPct, topRootCauses }) => {
  const [params, setParams] = useState({
    actionsToClose: 0,
    nightCoverage: Math.round(currentNightPct || 15),
    rootCause: topRootCauses?.[0] || null,
    rootCauseReduction: 0,
    trainingIncrease: 0
  })

  const [showHelp, setShowHelp] = useState(false)

  // Calculate baseline from incidents
  const baseline = useMemo(() => {
    if (!incidents?.length) return null

    const total = incidents.length
    const weeklyAvg = Math.round(total / 12) // ~12 weeks of data

    // Count root causes
    const rcCounts = {}
    incidents.forEach(i => {
      const rc = i.rootCause || 'Not Specified'
      if (rc !== 'Not Specified') rcCounts[rc] = (rcCounts[rc] || 0) + 1
    })

    return { total, weeklyAvg, rcCounts, overdueCount: overdueCount || 0, nightPct: currentNightPct || 15 }
  }, [incidents, overdueCount, currentNightPct])

  // Calculate projections based on parameters
  const projection = useMemo(() => {
    if (!baseline) return null

    // === CALCULATION LOGIC ===
    // Each intervention contributes to incident reduction percentage

    let totalReduction = 0

    // 1. Closing actions: Each action = 1.5% reduction (max 25%)
    const actionEffect = Math.min(25, params.actionsToClose * 1.5)
    totalReduction += actionEffect

    // 2. Night coverage: Each % above current = 0.5% reduction (max 15%)
    const coverageGain = Math.max(0, params.nightCoverage - baseline.nightPct)
    const coverageEffect = Math.min(15, coverageGain * 0.5)
    totalReduction += coverageEffect

    // 3. Root cause reduction: (RC% of total) × (reduction%) = effect
    let rcEffect = 0
    if (params.rootCause && params.rootCauseReduction > 0) {
      const rcCount = baseline.rcCounts[params.rootCause] || 0
      const rcPct = (rcCount / baseline.total) * 100
      rcEffect = (rcPct * params.rootCauseReduction) / 100
      totalReduction += rcEffect
    }

    // 4. Training: Each 10% increase = 1% reduction (max 10%)
    const trainingEffect = Math.min(10, params.trainingIncrease * 0.1)
    totalReduction += trainingEffect

    // Cap total reduction at 50%
    totalReduction = Math.min(50, totalReduction)

    // Project weekly incidents over 12 weeks
    const weeks = []
    for (let w = 0; w <= 12; w++) {
      // Effect ramps up over first 4 weeks
      const rampUp = Math.min(1, w / 4)
      const weekReduction = totalReduction * rampUp
      const projected = baseline.weeklyAvg * (1 - weekReduction / 100)

      weeks.push({
        week: w === 0 ? 'Now' : `W${w}`,
        baseline: baseline.weeklyAvg,
        projected: Math.round(projected * 10) / 10
      })
    }

    // Calculate annual impact
    const annualBaseline = baseline.weeklyAvg * 52
    const annualProjected = baseline.weeklyAvg * (1 - totalReduction / 100) * 52
    const annualSaved = Math.round(annualBaseline - annualProjected)

    return {
      reductionPct: Math.round(totalReduction),
      weeklyNow: baseline.weeklyAvg,
      weeklyAfter: Math.round(baseline.weeklyAvg * (1 - totalReduction / 100) * 10) / 10,
      annualSaved,
      weeks,
      breakdown: {
        actions: Math.round(actionEffect * 10) / 10,
        coverage: Math.round(coverageEffect * 10) / 10,
        rootCause: Math.round(rcEffect * 10) / 10,
        training: Math.round(trainingEffect * 10) / 10
      }
    }
  }, [baseline, params])

  const handleChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setParams({
      actionsToClose: 0,
      nightCoverage: Math.round(currentNightPct || 15),
      rootCause: topRootCauses?.[0] || null,
      rootCauseReduction: 0,
      trainingIncrease: 0
    })
  }, [currentNightPct, topRootCauses])

  const hasChanges = params.actionsToClose > 0 ||
    params.nightCoverage > baseline?.nightPct ||
    params.rootCauseReduction > 0 ||
    params.trainingIncrease > 0

  if (!baseline) {
    return (
      <div className="p-8 text-center text-surface-500 bg-surface-50 rounded-lg">
        No data available for simulation
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Banner - Only show when there are changes */}
      {hasChanges && projection && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wide">Projected Reduction</p>
                <p className="text-3xl font-bold">{projection.reductionPct}%</p>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wide">Weekly Incidents</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{projection.weeklyNow}</span>
                  <ArrowRight size={16} className="text-emerald-200" />
                  <span className="text-2xl font-bold">{projection.weeklyAfter}</span>
                </div>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wide">Annual Impact</p>
                <p className="text-2xl font-bold">~{projection.annualSaved} fewer</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Control 1: Close Overdue Actions */}
        <ControlCard
          icon={Clock}
          iconColor="text-amber-500"
          iconBg="bg-amber-100"
          title="Close Overdue Actions"
          description={`${baseline.overdueCount} actions currently overdue`}
          effect={projection?.breakdown.actions > 0 ? `-${projection.breakdown.actions}%` : null}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-600">Actions to close</span>
              <span className="text-lg font-bold text-surface-800">{params.actionsToClose}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(baseline.overdueCount, 10)}
              value={params.actionsToClose}
              onChange={(e) => handleChange('actionsToClose', parseInt(e.target.value))}
              className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-surface-400">
              <span>0</span>
              <span>{Math.max(baseline.overdueCount, 10)}</span>
            </div>
          </div>
        </ControlCard>

        {/* Control 2: Night Coverage */}
        <ControlCard
          icon={Moon}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-100"
          title="Improve Night Coverage"
          description={`Currently ${baseline.nightPct}% · Target 25%`}
          effect={projection?.breakdown.coverage > 0 ? `-${projection.breakdown.coverage}%` : null}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-600">Target coverage</span>
              <span className="text-lg font-bold text-surface-800">{params.nightCoverage}%</span>
            </div>
            <input
              type="range"
              min={Math.round(baseline.nightPct)}
              max={40}
              value={params.nightCoverage}
              onChange={(e) => handleChange('nightCoverage', parseInt(e.target.value))}
              className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-surface-400">
              <span>{Math.round(baseline.nightPct)}%</span>
              <span>40%</span>
            </div>
          </div>
        </ControlCard>

        {/* Control 3: Root Cause Intervention */}
        <ControlCard
          icon={Target}
          iconColor="text-purple-500"
          iconBg="bg-purple-100"
          title="Target Root Cause"
          description="Focus intervention on specific cause"
          effect={projection?.breakdown.rootCause > 0 ? `-${projection.breakdown.rootCause}%` : null}
        >
          <div className="space-y-3">
            {/* Root cause selector */}
            <select
              value={params.rootCause || ''}
              onChange={(e) => handleChange('rootCause', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {topRootCauses?.map(rc => (
                <option key={rc} value={rc}>
                  {rc} ({baseline.rcCounts[rc] || 0} incidents)
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-600">Reduction target</span>
              <span className="text-lg font-bold text-surface-800">{params.rootCauseReduction}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={params.rootCauseReduction}
              onChange={(e) => handleChange('rootCauseReduction', parseInt(e.target.value))}
              className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-surface-400">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>
        </ControlCard>

        {/* Control 4: Training Increase */}
        <ControlCard
          icon={Users}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-100"
          title="Increase Training"
          description="More toolbox talks, refreshers, competency checks"
          effect={projection?.breakdown.training > 0 ? `-${projection.breakdown.training}%` : null}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-600">Training increase</span>
              <span className="text-lg font-bold text-surface-800">{params.trainingIncrease}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={params.trainingIncrease}
              onChange={(e) => handleChange('trainingIncrease', parseInt(e.target.value))}
              className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-surface-400">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </ControlCard>
      </div>

      {/* Projection Chart - Only show when there are changes */}
      {hasChanges && projection && (
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-surface-800">12-Week Projection</h4>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-surface-300"></span>
                Current trend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500"></span>
                With changes
              </span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection.weeks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(value, name) => [
                    value,
                    name === 'baseline' ? 'Current trend' : 'With changes'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#cbd5e1"
                  fill="#f1f5f9"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#10b981"
                  fill="#d1fae5"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasChanges && (
        <div className="bg-surface-50 rounded-xl border border-dashed border-surface-300 p-8 text-center">
          <TrendingDown size={40} className="mx-auto mb-3 text-surface-400" />
          <p className="text-surface-700 font-medium">Adjust the sliders above to see projections</p>
          <p className="text-sm text-surface-500 mt-1">
            Simulate how different interventions could reduce incidents
          </p>
        </div>
      )}

      {/* How It Works - Collapsible */}
      <div className="border border-surface-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between p-4 bg-surface-50 hover:bg-surface-100 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-surface-700">
            <HelpCircle size={16} />
            How are projections calculated?
          </span>
          <span className="text-xs text-surface-500">{showHelp ? 'Hide' : 'Show'}</span>
        </button>

        {showHelp && (
          <div className="p-4 bg-white text-sm text-surface-600 space-y-3">
            <div>
              <p className="font-medium text-surface-800">1. Close Overdue Actions</p>
              <p className="text-xs mt-1">Each closed action = <strong>1.5% reduction</strong> (max 25%)</p>
              <p className="text-xs text-surface-500">Closing actions shows commitment and removes lingering hazards</p>
            </div>
            <div>
              <p className="font-medium text-surface-800">2. Night Coverage</p>
              <p className="text-xs mt-1">Each 1% increase above current = <strong>0.5% reduction</strong> (max 15%)</p>
              <p className="text-xs text-surface-500">Better coverage catches hazards across all shifts</p>
            </div>
            <div>
              <p className="font-medium text-surface-800">3. Root Cause Intervention</p>
              <p className="text-xs mt-1">Formula: <strong>(Root cause % of total) × (your reduction %)</strong></p>
              <p className="text-xs text-surface-500">e.g., If "Inadequate Training" is 20% of incidents and you reduce it by 30%, effect = 6%</p>
            </div>
            <div>
              <p className="font-medium text-surface-800">4. Training Increase</p>
              <p className="text-xs mt-1">Each 10% increase = <strong>1% reduction</strong> (max 10%)</p>
              <p className="text-xs text-surface-500">More training improves competency and hazard awareness</p>
            </div>
            <div className="pt-3 border-t border-surface-200">
              <p className="font-medium text-surface-800">Combined Effect</p>
              <p className="text-xs mt-1">All effects are <strong>added together</strong> (capped at 50% total reduction)</p>
              <p className="text-xs mt-1">Effect <strong>ramps up over 4 weeks</strong> as interventions take hold</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Control Card Component - Clean card for each parameter
 */
const ControlCard = ({ icon: Icon, iconColor, iconBg, title, description, effect, children }) => (
  <div className="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <h4 className="font-semibold text-surface-800">{title}</h4>
          <p className="text-xs text-surface-500">{description}</p>
        </div>
      </div>
      {effect && (
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">
          {effect}
        </span>
      )}
    </div>
    {children}
  </div>
)

export default React.memo(WhatIfSimulator)
