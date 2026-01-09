import React from 'react'

/**
 * Badge - Status indicators and labels
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'default',
  dot = false,
  pulse = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-surface-100 text-surface-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-safety-success-light text-safety-success-dark',
    warning: 'bg-safety-warning-light text-safety-warning-dark',
    danger: 'bg-safety-critical-light text-safety-critical-dark',
    info: 'bg-safety-info-light text-safety-info-dark',
    caution: 'bg-safety-caution-light text-safety-caution-dark',
  }

  const sizes = {
    small: 'text-2xs px-1.5 py-0.5',
    default: 'text-xs px-2 py-0.5',
    large: 'text-sm px-2.5 py-1',
  }

  const dotColors = {
    default: 'bg-surface-500',
    primary: 'bg-primary-500',
    success: 'bg-safety-success',
    warning: 'bg-safety-warning',
    danger: 'bg-safety-critical',
    info: 'bg-safety-info',
    caution: 'bg-safety-caution',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${dotColors[variant]}
            ${pulse ? 'animate-pulse' : ''}
          `}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
