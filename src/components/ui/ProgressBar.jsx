import React from 'react'

/**
 * ProgressBar - Animated progress indicator
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'default',
  showLabel = false,
  label,
  animate = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variants = {
    primary: 'bg-primary-500',
    success: 'bg-safety-success',
    warning: 'bg-safety-warning',
    danger: 'bg-safety-critical',
    info: 'bg-safety-info',
    gradient: 'bg-gradient-to-r from-primary-500 to-primary-600',
  }

  const sizes = {
    small: 'h-1',
    default: 'h-2',
    large: 'h-3',
  }

  // Auto-select variant based on percentage
  const getAutoVariant = () => {
    if (percentage >= 80) return 'success'
    if (percentage >= 50) return 'warning'
    return 'danger'
  }

  const barVariant = variant === 'auto' ? getAutoVariant() : variant

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-surface-600">{label}</span>}
          {showLabel && (
            <span className="text-xs font-medium text-surface-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-surface-200 rounded-full overflow-hidden ${sizes[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${variants[barVariant]}
            ${animate ? 'progress-animate' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
