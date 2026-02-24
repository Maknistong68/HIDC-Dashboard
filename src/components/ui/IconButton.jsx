import LoadingSpinner from './LoadingSpinner'

/**
 * IconButton - Square button with just an icon
 */
const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'default',
  loading = false,
  disabled = false,
  label,
  className = '',
  ...props
}) => {
  const variants = {
    primary: `
      bg-primary-600 text-white
      hover:bg-primary-700 active:bg-primary-800
      disabled:bg-primary-300
    `,
    secondary: `
      bg-white text-surface-600 border border-surface-300
      hover:bg-surface-50 hover:text-surface-900 hover:border-surface-400
      disabled:bg-surface-50 disabled:text-surface-400
    `,
    ghost: `
      bg-transparent text-surface-500
      hover:bg-surface-100 hover:text-surface-700
      disabled:text-surface-300
    `,
    danger: `
      bg-safety-critical-light text-safety-critical
      hover:bg-red-100 active:bg-red-200
      disabled:bg-red-50 disabled:text-red-300
    `,
  }

  const sizes = {
    small: { button: 'w-7 h-7', icon: 14 },
    default: { button: 'w-9 h-9', icon: 18 },
    large: { button: 'w-11 h-11', icon: 22 },
  }

  const isDisabled = disabled || loading
  const { button: buttonSize, icon: iconSize } = sizes[size]

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-md
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${buttonSize}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="xs" color={variant === 'primary' ? 'white' : 'gray'} />
      ) : (
        <Icon size={iconSize} />
      )}
    </button>
  )
}

export default IconButton
