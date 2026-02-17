import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChevronDown, ChevronUp, Trophy, AlertTriangle, Activity, Shield } from 'lucide-react'
import { useDeferredMemo } from '../../hooks/useDeferredMemo'
import { calculatePyramidRanking } from '../../utils/riskMatrix'
import { getCached, CACHE_KEYS } from '../../utils/dashboardCache'
import { PYRAMID_SECTIONS } from '../../utils/constants'

// Build flat type→color map from PYRAMID_SECTIONS (excluding proactive)
const TYPE_COLOR_MAP = {}
const TYPE_LABEL_MAP = {}
for (const section of PYRAMID_SECTIONS) {
  if (section.id === 'proactive') continue
  for (const t of section.types) {
    TYPE_COLOR_MAP[t.key] = t.color
    TYPE_LABEL_MAP[t.key] = t.label
  }
}

// Ordered list of all incident types for stacked bars (severity high→low)
const STACKED_TYPES = PYRAMID_SECTIONS
  .filter(s => s.id !== 'proactive')
  .flatMap(s => s.types.map(t => t.key))

// Section colors for the legend
const SECTION_LEGEND = [
  { id: 'incidents-hum', label: 'Injury / Illness', color: '#dc2626' },
  { id: 'incidents-env-dmg', label: 'Env / Property / Other', color: '#d97706' },
  { id: 'observations', label: 'Observations', color: '#059669' },
]

// Risk score badge color based on zone level
const getRiskBadgeClasses = (zone) => {
  if (!zone) return 'bg-surface-100 text-surface-500'
  switch (zone.level) {
    case 'veryHigh': return 'bg-red-100 text-red-800'
    case 'high': return 'bg-amber-100 text-amber-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-emerald-100 text-emerald-800'
    case 'veryLow': return 'bg-sky-100 text-sky-800'
    default: return 'bg-surface-100 text-surface-500'
  }
}

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.97)',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  padding: '8px 12px',
}

// Lookup ranking data by fullName for tooltip enrichment
let _rankingLookup = new Map()

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const items = payload.filter(p => p.value > 0)
  if (!items.length) return null
  const total = items.reduce((s, p) => s + p.value, 0)
  const row = payload[0]?.payload
  const hazardData = _rankingLookup.get(row?.fullName)
  return (
    <div style={TOOLTIP_CONTENT_STYLE}>
      <div className="flex items-center justify-between gap-4 mb-1">
        <p className="font-medium text-surface-800">{label}</p>
        {hazardData?.riskScore > 0 && (
          <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${getRiskBadgeClasses(hazardData.zone)}`}>
            L×C {hazardData.riskScore}
          </span>
        )}
      </div>
      {items.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-surface-600">{TYPE_LABEL_MAP[p.dataKey] || p.dataKey}:</span>
          <span className="font-medium text-surface-800">{p.value.toLocaleString()}</span>
        </div>
      ))}
      <div className="mt-1 pt-1 border-t border-surface-200 text-xs font-medium text-surface-800">
        Weighted Score: {total.toLocaleString()}
      </div>
    </div>
  )
}

const KPICard = ({ icon: Icon, label, value, sublabel, color }) => (
  <div className="bg-white rounded-xl border border-surface-200 p-3 flex-1 min-w-[140px]">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <span className="text-xs text-surface-500">{label}</span>
    </div>
    <p className="text-lg font-bold text-surface-900">{value}</p>
    {sublabel && <p className="text-2xs text-surface-400 mt-0.5">{sublabel}</p>}
  </div>
)

const HazardPyramidRanking = React.memo(({ filteredIncidents, sortedHazards, negativeIncidents, period, matrixData }) => {
  const [showDetail, setShowDetail] = useState(false)

  // Cache-first: uses precomputed result from calculation gate if available
  const ranking = useDeferredMemo(() => {
    const cached = getCached(CACHE_KEYS.PYRAMID_RANKING, filteredIncidents)
    if (cached) return cached
    return calculatePyramidRanking(filteredIncidents, sortedHazards, matrixData)
  }, [filteredIncidents, sortedHazards, matrixData])

  // Update the lookup for tooltip enrichment
  useMemo(() => {
    const map = new Map()
    if (ranking?.length) {
      for (const h of ranking) map.set(h.name, h)
    }
    _rankingLookup = map
  }, [ranking])

  // Build chart data — each row is a hazard, with a key per stacked type
  const chartData = useMemo(() => {
    if (!ranking?.length) return []
    return ranking.map(h => {
      const row = {
        name: h.name.length > 22 ? h.name.substring(0, 20) + '...' : h.name,
        fullName: h.name,
        rank: h.rank,
        pyramidScore: h.pyramidScore,
        riskScore: h.riskScore,
      }
      for (const type of STACKED_TYPES) {
        row[type] = h.breakdown[type]?.score || 0
      }
      return row
    })
  }, [ranking])

  // KPI values
  const kpis = useMemo(() => {
    if (!ranking?.length) return { totalScore: 0, topHazard: '-', topRiskScore: 0, topWeightedScore: 0, injuryRatio: 0 }
    const totalScore = ranking.reduce((s, h) => s + h.pyramidScore, 0)
    const top = ranking[0]
    const totalInjury = ranking.reduce((s, h) => s + (h.sections['incidents-hum'] || 0), 0)
    const injuryRatio = totalScore > 0 ? Math.round((totalInjury / totalScore) * 100) : 0
    return {
      totalScore,
      topHazard: top.name,
      topRiskScore: top.riskScore,
      topWeightedScore: top.pyramidScore,
      injuryRatio,
    }
  }, [ranking])

  const chartHeight = Math.max(300, (ranking?.length || 0) * 36)

  if (!ranking?.length) {
    return (
      <div className="bg-white rounded-xl border border-surface-200 p-8 text-center">
        <p className="text-sm text-surface-400">No incident data available for pyramid ranking.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="flex flex-wrap gap-3">
        <KPICard
          icon={Shield}
          label="#1 Risk Score (L×C)"
          value={kpis.topRiskScore}
          sublabel={kpis.topHazard}
          color="#dc2626"
        />
        <KPICard
          icon={Trophy}
          label="#1 Weighted Score"
          value={kpis.topWeightedScore.toLocaleString()}
          sublabel={kpis.topHazard}
          color="#6366f1"
        />
        <KPICard
          icon={AlertTriangle}
          label="Total Weighted Score"
          value={kpis.totalScore.toLocaleString()}
          sublabel={`${ranking.length} hazards ranked`}
          color="#f59e0b"
        />
        <KPICard
          icon={Activity}
          label="Injury Score Ratio"
          value={`${kpis.injuryRatio}%`}
          sublabel="of total weighted score"
          color="#059669"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        {SECTION_LEGEND.map(s => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-surface-600">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
        <div className="ml-auto text-2xs text-surface-400">Ranked by Risk Score (L×C), then Weighted Score</div>
      </div>

      {/* Stacked Horizontal Bar Chart */}
      <div className="bg-white rounded-xl border border-surface-200 p-4">
        <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: 520 }}>
          <div style={{ height: chartHeight, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString()} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                {STACKED_TYPES.map(type => (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="pyramid"
                    fill={TYPE_COLOR_MAP[type]}
                    radius={0}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expandable Detail Table */}
      <div className="bg-white rounded-xl border border-surface-200">
        <button
          onClick={() => setShowDetail(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors rounded-xl"
        >
          <span>{showDetail ? 'Hide' : 'Show'} Detailed Breakdown</span>
          {showDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDetail && (
          <div className="px-4 pb-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-2 pr-3 font-medium text-surface-500">#</th>
                  <th className="text-left py-2 pr-3 font-medium text-surface-500">Hazard</th>
                  <th className="text-center py-2 px-2 font-medium text-surface-500">Risk&nbsp;Score</th>
                  {STACKED_TYPES.map(type => (
                    <th key={type} className="text-center py-2 px-1 font-medium text-surface-500 whitespace-nowrap">
                      <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: TYPE_COLOR_MAP[type] }} />
                      {(TYPE_LABEL_MAP[type] || type).replace(/\s+/g, '\u00A0')}
                    </th>
                  ))}
                  <th className="text-right py-2 pl-3 font-medium text-surface-500">Weighted</th>
                  <th className="text-right py-2 pl-3 font-medium text-surface-500">Count</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map(h => (
                  <tr key={h.name} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="py-1.5 pr-3 text-surface-400 font-medium">{h.rank}</td>
                    <td className="py-1.5 pr-3 text-surface-800 font-medium whitespace-nowrap">
                      {h.isSignificant && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" title="Significant Hazard" />
                      )}
                      {h.name}
                    </td>
                    <td className="text-center py-1.5 px-2">
                      {h.riskScore > 0 ? (
                        <span className={`inline-block text-2xs font-bold px-1.5 py-0.5 rounded ${getRiskBadgeClasses(h.zone)}`}>
                          {h.riskScore}
                        </span>
                      ) : (
                        <span className="text-surface-300">-</span>
                      )}
                    </td>
                    {STACKED_TYPES.map(type => {
                      const data = h.breakdown[type]
                      return (
                        <td key={type} className="text-center py-1.5 px-1 text-surface-600">
                          {data ? `${data.count}` : '-'}
                        </td>
                      )
                    })}
                    <td className="text-right py-1.5 pl-3 font-bold text-surface-800">{h.pyramidScore.toLocaleString()}</td>
                    <td className="text-right py-1.5 pl-3 text-surface-500">{h.rawCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
})

HazardPyramidRanking.displayName = 'HazardPyramidRanking'

export default HazardPyramidRanking
