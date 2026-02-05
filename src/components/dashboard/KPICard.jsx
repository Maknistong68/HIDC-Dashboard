import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AnimatedNumber } from '../ui'
import { InfoTooltip } from '../ui/Tooltip'

/**
 * KPICard - Key Performance Indicator display card
 * Features: Animated numbers, trend indicators, accessible tooltips
 */
const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  onClick,
  info,
  animate = true,
  className = '',
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      glow: 'group-hover:shadow-glow-primary',
    },
    success: {
      bg: 'bg-safety-success-light',
      icon: 'text-safety-success',
      glow: 'group-hover:shadow-glow-success',
    },
    warning: {
      bg: 'bg-safety-warning-light',
      icon: 'text-safety-warning',
      glow: '',
    },
    danger: {
      bg: 'bg-safety-critical-light',
      icon: 'text-safety-critical',
      glow: 'group-hover:shadow-glow-danger',
    },
    info: {
      bg: 'bg-safety-info-light',
      icon: 'text-safety-info',
      glow: '',
    },
  }

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-safety-success' },
    down: { icon: TrendingDown, color: 'text-safety-critical' },
    neutral: { icon: Minus, color: 'text-surface-400' },
  }

  const colors = colorClasses[color] || colorClasses.primary
  const TrendIcon = trend ? trendConfig[trend]?.icon : null

  // Parse numeric value for animation
  const numericValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, ''))
    : value
  const isNumeric = !isNaN(numericValue) && isFinite(numericValue)
  const valuePrefix = typeof value === 'string' && value.includes('%') ? '' : ''
  const valueSuffix = typeof value === 'string' && value.includes('%') ? '%' : ''

  return (
    <div
      className={`
        group bg-white border border-surface-200 rounded-lg p-3 sm:p-4
        transition-all duration-300 ease-out
        hover:shadow-medium hover:border-surface-300
        active:shadow-soft active:scale-[0.99]
        ${onClick ? 'cursor-pointer' : ''}
        ${colors.glow}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title with tooltip - Responsive text size */}
          <p className="text-xs sm:text-sm font-semibold text-surface-500 uppercase tracking-wide flex items-center gap-0.5">
            <span className="truncate">{title}</span>
            {info && <InfoTooltip text={info} />}
          </p>

          {/* Value with animation - Responsive size */}
          <p className="text-xl sm:text-2xl font-bold text-surface-800 mt-1 tabular-nums">
            {animate && isNumeric ? (
              <>
                {valuePrefix}
                <AnimatedNumber value={numericValue} />
                {valueSuffix}
              </>
            ) : (
              value
            )}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-surface-500 mt-1 truncate">{subtitle}</p>
          )}

          {/* Trend indicator */}
          {trend && TrendIcon && (
            <div className={`flex items-center gap-1 mt-2 ${trendConfig[trend].color}`}>
              <TrendIcon size={14} aria-hidden="true" />
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`
              flex-shrink-0 p-2.5 rounded-lg
              transition-transform duration-300 ease-out
              group-hover:scale-110
              ${colors.bg} ${colors.icon}
            `}
          >
            <Icon size={22} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(KPICard)
