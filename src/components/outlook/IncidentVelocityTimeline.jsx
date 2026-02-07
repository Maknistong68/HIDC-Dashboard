import React, { useMemo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer
} from 'recharts'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const SMOOTHING_WINDOW = 7
const ACCEL_THRESHOLD = 0.3
const ZONE_MIN_DAYS = 3

/**
 * Custom tooltip for velocity chart
 */
const VelocityTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-surface-200 text-xs">
      <p className="font-medium text-surface-700 mb-1">{data?.label || label}</p>
      {data?.cumulative != null && (
        <p className="text-surface-500">Cumulative: <span className="font-semibold text-surface-700">{data.cumulative}</span></p>
      )}
      {data?.velocity != null && (
        <p className="text-surface-500">Velocity (7d avg): <span className="font-semibold text-primary-600">{data.velocity.toFixed(1)}/day</span></p>
      )}
      {data?.acceleration != null && (
        <p className="text-surface-500">
          Acceleration: <span className={`font-semibold ${data.acceleration > 0 ? 'text-red-500' : data.acceleration < 0 ? 'text-green-500' : 'text-surface-500'}`}>
            {data.acceleration > 0 ? '+' : ''}{data.acceleration.toFixed(2)}
          </span>
        </p>
      )}
    </div>
  )
}

const IncidentVelocityTimeline = ({ negativeIncidents, period }) => {
  const { chartData, zones, stats } = useMemo(() => {
    if (!negativeIncidents?.length) return { chartData: [], zones: [], stats: null }

    // Build daily counts
    const countsByDate = {}
    for (const inc of negativeIncidents) {
      const d = inc.date?.substring(0, 10)
      if (d) countsByDate[d] = (countsByDate[d] || 0) + 1
    }

    const dates = Object.keys(countsByDate).sort()
    if (dates.length < 3) return { chartData: [], zones: [], stats: null }

    // Build cumulative + velocity data
    let cumulative = 0
    const raw = dates.map((date, idx) => {
      cumulative += countsByDate[date]
      return { date, count: countsByDate[date], cumulative, index: idx }
    })

    // 7-day smoothed velocity
    const withVelocity = raw.map((point, idx) => {
      const start = Math.max(0, idx - SMOOTHING_WINDOW + 1)
      const window = raw.slice(start, idx + 1)
      const velocity = window.reduce((sum, p) => sum + p.count, 0) / window.length
      return { ...point, velocity }
    })

    // Acceleration (change in velocity)
    const withAccel = withVelocity.map((point, idx) => {
      const acceleration = idx > 0 ? point.velocity - withVelocity[idx - 1].velocity : 0
      const month = point.date.substring(5, 7)
      const day = point.date.substring(8, 10)
      return {
        ...point,
        acceleration,
        label: `${month}/${day}`
      }
    })

    // Detect acceleration/deceleration zones
    const detectedZones = []
    let zoneStart = null
    let zoneType = null
    let consecutive = 0

    for (let i = 0; i < withAccel.length; i++) {
      const a = withAccel[i].acceleration
      let currentType = null
      if (a > ACCEL_THRESHOLD) currentType = 'accelerating'
      else if (a < -ACCEL_THRESHOLD) currentType = 'decelerating'

      if (currentType === zoneType) {
        consecutive++
      } else {
        if (zoneType && consecutive >= ZONE_MIN_DAYS) {
          detectedZones.push({
            type: zoneType,
            x1: withAccel[zoneStart].label,
            x2: withAccel[i - 1].label
          })
        }
        zoneStart = i
        zoneType = currentType
        consecutive = currentType ? 1 : 0
      }
    }
    // Close last zone
    if (zoneType && consecutive >= ZONE_MIN_DAYS) {
      detectedZones.push({
        type: zoneType,
        x1: withAccel[zoneStart].label,
        x2: withAccel[withAccel.length - 1].label
      })
    }

    // Stats
    const velocities = withAccel.map(p => p.velocity)
    const currentVelocity = velocities[velocities.length - 1] || 0
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length
    const recentAccel = withAccel.slice(-7)
    const avgAccel = recentAccel.reduce((a, p) => a + p.acceleration, 0) / recentAccel.length
    let trend = 'stable'
    if (avgAccel > ACCEL_THRESHOLD / 2) trend = 'increasing'
    else if (avgAccel < -ACCEL_THRESHOLD / 2) trend = 'decreasing'

    return {
      chartData: withAccel,
      zones: detectedZones,
      stats: {
        currentVelocity: currentVelocity.toFixed(1),
        avgVelocity: avgVelocity.toFixed(1),
        trend
      }
    }
  }, [negativeIncidents])

  if (!chartData.length) return null

  // Sample every Nth label to avoid crowding
  const labelInterval = Math.max(1, Math.floor(chartData.length / 12))

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-surface-800">Incident Velocity Timeline</h3>
          </div>
          {stats && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-surface-500">
                Now: <span className="font-semibold text-surface-700">{stats.currentVelocity}/day</span>
              </span>
              <span className="text-surface-300">|</span>
              <span className="text-surface-500">
                Avg: <span className="font-semibold text-surface-700">{stats.avgVelocity}/day</span>
              </span>
              <span className="text-surface-300">|</span>
              <span className={`flex items-center gap-1 font-medium ${
                stats.trend === 'increasing' ? 'text-red-500' : stats.trend === 'decreasing' ? 'text-green-500' : 'text-surface-500'
              }`}>
                {stats.trend === 'increasing' && <TrendingUp size={12} />}
                {stats.trend === 'decreasing' && <TrendingDown size={12} />}
                {stats.trend === 'stable' && <Minus size={12} />}
                {stats.trend === 'increasing' ? 'Accelerating' : stats.trend === 'decreasing' ? 'Decelerating' : 'Stable'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval={labelInterval}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                label={{ value: 'Cumulative', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9ca3af' } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                label={{ value: 'Velocity/day', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9ca3af' } }}
              />
              <Tooltip content={<VelocityTooltip />} />

              {zones.map((zone, idx) => (
                <ReferenceArea
                  key={`zone-${idx}`}
                  yAxisId="left"
                  x1={zone.x1}
                  x2={zone.x2}
                  fill={zone.type === 'accelerating' ? '#fecaca' : '#bbf7d0'}
                  fillOpacity={0.3}
                />
              ))}

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cumulative"
                fill="#dbeafe"
                stroke="#3b82f6"
                strokeWidth={1.5}
                fillOpacity={0.4}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="velocity"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 text-2xs text-surface-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-blue-200 border border-blue-400" /> Cumulative
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-500" /> Velocity (7d avg)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-red-100 border border-red-300" /> Accelerating
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-green-100 border border-green-300" /> Decelerating
          </span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(IncidentVelocityTimeline)
