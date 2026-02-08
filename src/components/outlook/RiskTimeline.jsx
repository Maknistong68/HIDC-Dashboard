import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts'
import { Calendar } from 'lucide-react'

function formatWeekRange(startDate) {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return start.getMonth() === end.getMonth()
    ? `${m[start.getMonth()]} ${start.getDate()}\u2013${end.getDate()}`
    : `${m[start.getMonth()]} ${start.getDate()}\u2013${m[end.getMonth()]} ${end.getDate()}`
}

function getBarColor(value, average) {
  if (value > average * 1.5) return '#ef4444'
  if (value > average) return '#f59e0b'
  return '#22c55e'
}

const TimelineTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-surface-200 text-xs">
      <p className="font-semibold text-surface-700 mb-1">{d?.weekLabel}</p>
      <p className="text-surface-600">Predicted: <span className="font-bold">~{d?.predicted}</span></p>
      <p className="text-surface-500">Range: {d?.low}\u2013{d?.high}</p>
    </div>
  )
}

const RiskTimeline = ({ monteCarloResult, weeklyAverage }) => {
  const chartData = useMemo(() => {
    if (!monteCarloResult?.cells?.length) return []
    const weeks = monteCarloResult.cells[0]?.length || 6
    const now = new Date()
    const data = []
    for (let w = 0; w < weeks; w++) {
      let totalAvg = 0, totalP95 = 0
      for (let h = 0; h < monteCarloResult.cells.length; h++) {
        const c = monteCarloResult.cells[h][w]
        totalAvg += c?.avg || 0
        totalP95 += c?.p95 || 0
      }
      const predicted = Math.round(totalAvg)
      const high = Math.round(totalP95)
      const low = Math.max(0, Math.round(predicted * 0.7))
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() + w * 7)
      data.push({
        week: `W${w + 1}`,
        weekLabel: formatWeekRange(weekStart),
        predicted, high, low,
        fill: getBarColor(predicted, weeklyAverage || 1)
      })
    }
    return data
  }, [monteCarloResult, weeklyAverage])

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4 text-center text-xs text-surface-400">
        Run simulation to see risk timeline.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-800">Risk Timeline</h3>
          <span className="text-2xs text-surface-400">When?</span>
        </div>
      </div>
      <div className="p-4">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TimelineTooltip />} />
              <ReferenceLine y={weeklyAverage || 0} stroke="#9ca3af" strokeDasharray="4 4"
                label={{ value: `Avg: ${weeklyAverage || 0}`, position: 'right', fill: '#9ca3af', fontSize: 10 }} />
              <Bar dataKey="predicted" radius={[3, 3, 0, 0]} maxBarSize={40}>
                {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-2xs text-surface-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-sm bg-green-400" /> &lt;avg</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-sm bg-amber-400" /> &gt;avg</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-sm bg-red-400" /> &gt;1.5&times;</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(RiskTimeline)
