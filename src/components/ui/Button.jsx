import LoadingSpinner from './LoadingSpinner'

/**
 * Button - Consistent button component with variants
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: `
      bg-primary-600 text-white
      hover:bg-primary-700 active:bg-primary-800
      disabled:bg-primary-300
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-white text-surface-700 border border-surface-300
      hover:bg-surface-50 hover:border-surface-400 active:bg-surface-100
      disabled:bg-surface-50 disabled:text-surface-400
    `,
    ghost: `
      bg-transparent text-surface-600
      hover:bg-surface-100 hover:text-surface-900 active:bg-surface-200
      disabled:text-surface-300
    `,
    danger: `
      bg-safety-critical text-white
      hover:bg-safety-critical-dark active:bg-red-800
      disabled:bg-red-300
      shadow-sm hover:shadow-md
    `,
    'danger-ghost': `
      bg-transparent text-safety-critical
      hover:bg-safety-critical-light active:bg-red-100
      disabled:text-red-300
    `,
    success: `
      bg-safety-success text-white
      hover:bg-safety-success-dark active:bg-green-800
      disabled:bg-green-300
      shadow-sm hover:shadow-md
    `,
  }

  const sizes = {
    small: 'text-xs px-2.5 py-1.5 gap-1.5',
    default: 'text-sm px-3 py-2 gap-2',
    large: 'text-base px-4 py-2.5 gap-2',
  }

  const iconSizes = {
    small: 14,
    default: 16,
    large: 18,
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner
            size="xs"
            color={variant === 'secondary' || variant === 'ghost' ? 'gray' : 'white'}
          />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={iconSizes[size]} className="flex-shrink-0" />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon size={iconSizes[size]} className="flex-shrink-0" />
          )}
        </>
      )}
    </button>
  )
}

export default Button
