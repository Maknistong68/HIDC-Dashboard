import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

const ProjectComparison = ({ data }) => {
  const getBarColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f97316'
    return '#dc2626'
  }

  return (
    <div className="bg-white rounded-sm border border-gray-300 p-3">
      <h3 className="text-xs font-semibold text-gray-800 mb-2 uppercase tracking-wide">
        Project Safety Scores
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={95}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Score']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '2px',
                fontSize: '11px',
              }}
            />
            <ReferenceLine x={80} stroke="#22c55e" strokeDasharray="5 5" />
            <ReferenceLine x={60} stroke="#f97316" strokeDasharray="5 5" />
            <Bar dataKey="score" radius={[0, 2, 2, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500"></div>
          <span className="text-gray-500">≥80</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500"></div>
          <span className="text-gray-500">60-79</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500"></div>
          <span className="text-gray-500">&lt;60</span>
        </div>
      </div>
    </div>
  )
}

export default ProjectComparison
