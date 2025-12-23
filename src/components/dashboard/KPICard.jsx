import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  onClick,
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-orange-50 text-orange-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  }

  return (
    <div
      className={`bg-white border border-gray-300 p-3 ${
        onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-1 ${trendColors[trend]}`}>
              {trend === 'up' && <TrendingUp size={14} />}
              {trend === 'down' && <TrendingDown size={14} />}
              {trend === 'neutral' && <Minus size={14} />}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2 ${colorClasses[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}

export default KPICard
