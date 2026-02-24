
/**
 * LoadingSpinner - Consistent loading indicator across the app
 * Variants: spinner (default), dots, pulse, bars
 */
const LoadingSpinner = ({
  size = 'default',
  variant = 'spinner',
  color = 'primary',
  className = '',
  label = 'Loading...',
  showLabel = false,
}) => {
  const sizes = {
    xs: 12,
    small: 16,
    default: 24,
    large: 32,
    xl: 48,
  }

  const colors = {
    primary: 'text-primary-500',
    white: 'text-white',
    gray: 'text-surface-400',
    success: 'text-safety-success',
    danger: 'text-safety-critical',
  }

  const pixelSize = sizes[size] || sizes.default
  const colorClass = colors[color] || colors.primary

  // Spinner variant (default)
  if (variant === 'spinner') {
    return (
      <div className={`inline-flex flex-col items-center gap-2 ${className}`} role="status" aria-label={label}>
        <svg
          className={`animate-spin ${colorClass}`}
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.2"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        {showLabel && <span className="text-sm text-surface-500">{label}</span>}
      </div>
    )
  }

  // Dots variant
  if (variant === 'dots') {
    const dotSize = pixelSize / 4
    return (
      <div className={`inline-flex items-center gap-1 ${className}`} role="status" aria-label={label}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`rounded-full ${colorClass} bg-current`}
            style={{
              width: dotSize,
              height: dotSize,
              animation: `pulseDot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes pulseDot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        {showLabel && <span className="ml-2 text-sm text-surface-500">{label}</span>}
      </div>
    )
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div className={`inline-flex flex-col items-center gap-2 ${className}`} role="status" aria-label={label}>
        <span
          className={`rounded-full ${colorClass} bg-current animate-pulse-soft`}
          style={{ width: pixelSize, height: pixelSize }}
        />
        {showLabel && <span className="text-sm text-surface-500">{label}</span>}
      </div>
    )
  }

  // Bars variant
  if (variant === 'bars') {
    const barWidth = pixelSize / 6
    const barHeight = pixelSize
    return (
      <div className={`inline-flex items-end gap-0.5 ${className}`} role="status" aria-label={label}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`rounded-sm ${colorClass} bg-current`}
            style={{
              width: barWidth,
              height: barHeight,
              animation: `barPulse 1s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes barPulse {
            0%, 100% { transform: scaleY(0.4); }
            50% { transform: scaleY(1); }
          }
        `}</style>
        {showLabel && <span className="ml-2 text-sm text-surface-500">{label}</span>}
      </div>
    )
  }

  return null
}

export default LoadingSpinner
