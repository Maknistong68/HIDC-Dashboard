import { memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ENGAGEMENT_TYPES } from '../../utils/constants'

const colors = [
  '#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f59e0b', '#6366f1', '#84cc16', '#06b6d4'
]

/**
 * EngagementChart - Horizontal bar chart showing engagement types
 * Wrapped in React.memo to prevent unnecessary re-renders when parent context changes
 */
const EngagementChart = memo(({ data, onBarClick, activeBar }) => {
  // Transform data for chart
  const chartData = ENGAGEMENT_TYPES.map((type, index) => ({
    name: type.label.split(' / ')[0].split(' ').slice(0, 2).join(' '),
    fullName: type.label,
    type: type.value,
    value: data[type.value] || 0,
    color: colors[index % colors.length],
  })).filter(item => item.value > 0).sort((a, b) => b.value - a.value)

  const handleBarClick = (data) => {
    if (data && data.type) {
      onBarClick?.(data.type)
    }
  }

  return (
    <div className="bg-white rounded-sm border border-surface-200 p-3">
      <h3 className="text-xs font-semibold text-surface-800 mb-2 uppercase tracking-wide">
        Engagements by Type
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={75}
            />
            <Tooltip
              formatter={(value, name, props) => [value, props.payload.fullName]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '2px',
                fontSize: '11px',
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 2, 2, 0]}
              cursor="pointer"
              onClick={handleBarClick}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeBar && activeBar !== entry.type ? 0.4 : 1}
                  stroke={activeBar === entry.type ? '#1f2937' : 'none'}
                  strokeWidth={activeBar === entry.type ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-surface-400 text-center mt-1">
        Click bar to drill down
      </p>
    </div>
  )
})

EngagementChart.displayName = 'EngagementChart'

export default EngagementChart
