
/**
 * Card - Consistent container component
 */
const Card = ({
  children,
  className = '',
  padding = 'default',
  hover = false,
  animate = false,
  onClick,
  ...props
}) => {
  const paddings = {
    none: '',
    small: 'p-3',
    default: 'p-4',
    large: 'p-6',
  }

  const isClickable = !!onClick

  return (
    <div
      className={`
        bg-white border border-surface-200 rounded-lg shadow-soft
        ${paddings[padding]}
        ${hover ? 'card-hover' : ''}
        ${animate ? 'animate-fade-in-up' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Header
Card.Header = ({ children, className = '', action }) => (
  <div className={`flex items-center justify-between mb-3 ${className}`}>
    <div className="flex items-center gap-2">{children}</div>
    {action && <div>{action}</div>}
  </div>
)
Card.Header.displayName = 'Card.Header'

// Card Title
Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-xs font-semibold text-surface-700 uppercase tracking-wide ${className}`}>
    {children}
  </h3>
)
Card.Title.displayName = 'Card.Title'

// Card Body
Card.Body = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)
Card.Body.displayName = 'Card.Body'

// Card Footer
Card.Footer = ({ children, className = '' }) => (
  <div className={`mt-4 pt-3 border-t border-surface-100 ${className}`}>
    {children}
  </div>
)
Card.Footer.displayName = 'Card.Footer'

export default Card
