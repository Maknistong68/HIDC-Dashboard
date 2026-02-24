import React, { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { analyzeControlChart } from '../../utils/controlCharts'

/**
 * Custom dot renderer: red for out-of-control, default for normal
 */
const ControlDot = (props) => {
  const { cx, cy, payload } = props
  if (!payload?.isOutOfControl) return null
  return (
    <circle cx={cx} cy={cy} r={4} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
  )
}

/**
 * ControlChartPanel - XmR (Individuals & Moving Range) SPC chart
 * Shows centerline, UCL, LCL, and highlights out-of-control points
 */
const ControlChartPanel = ({ historicalData }) => {
  const [showViolations, setShowViolations] = useState(false)

  const analysis = useMemo(() => {
    if (!historicalData?.length) return null
    const values = historicalData.map(h => h.value)
    const labels = historicalData.map(h => h.dateLabel || h.date)
    return analyzeControlChart(values, labels)
  }, [historicalData])

  if (!analysis || analysis.chartData.length < 5) return null

  const { limits, capability, chartData } = analysis
  const statusColor = capability.status === 'in-control'
    ? 'text-green-700 bg-green-50'
    : capability.status === 'out-of-control'
      ? 'text-red-700 bg-red-50'
      : 'text-amber-700 bg-amber-50'

  const StatusIcon = capability.inControl ? CheckCircle : AlertTriangle

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-surface-600">SPC Control Chart (XmR)</h3>
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
            <StatusIcon size={10} />
            {capability.status === 'in-control' ? 'In Control' : capability.status === 'out-of-control' ? 'Out of Control' : 'Unstable'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-surface-400">
          <span>CL: {limits.cl}</span>
          <span>UCL: {limits.ucl}</span>
          <span>LCL: {limits.lcl}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              interval="preserveStartEnd"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(value, name) => {
                if (name === 'value') return [value, 'Count']
                return [value, name]
              }}
              labelFormatter={(label) => label}
            />

            {/* Reference lines */}
            <ReferenceLine y={limits.ucl} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'UCL', position: 'right', fontSize: 9, fill: '#ef4444' }} />
            <ReferenceLine y={limits.cl} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'CL', position: 'right', fontSize: 9, fill: '#3b82f6' }} />
            {limits.lcl > 0 && (
              <ReferenceLine y={limits.lcl} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'LCL', position: 'right', fontSize: 9, fill: '#ef4444' }} />
            )}

            {/* Data line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={1.5}
              dot={<ControlDot />}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Violations toggle */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3 text-[10px] text-surface-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-indigo-500" />
            <span>Daily Count</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500 border-dashed border-t border-red-500" />
            <span>Control Limits</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span>Out of Control</span>
          </div>
        </div>

        {capability.outOfControlCount > 0 && (
          <button
            onClick={() => setShowViolations(v => !v)}
            className="flex items-center gap-1 text-[10px] text-surface-500 hover:text-surface-700"
          >
            {capability.outOfControlCount} violation{capability.outOfControlCount !== 1 ? 's' : ''}
            <ChevronDown size={12} className={`transition-transform ${showViolations ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Nelson Rule violations detail */}
      {showViolations && analysis.violations.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 space-y-1">
          {analysis.violations.slice(0, 5).map((v, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-red-700">
              <span className="font-bold shrink-0">Rule {v.rule}:</span>
              <span>{v.description}</span>
            </div>
          ))}
          {analysis.violations.length > 5 && (
            <p className="text-[10px] text-red-500 italic">
              +{analysis.violations.length - 5} more violations
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(ControlChartPanel)
