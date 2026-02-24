
/**
 * Skeleton - Loading placeholder components
 */
const Skeleton = ({
  width,
  height,
  variant = 'rectangular',
  className = '',
  animate = true,
}) => {
  const variants = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  }

  return (
    <div
      className={`
        bg-surface-200
        ${variants[variant]}
        ${animate ? 'skeleton' : ''}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  )
}

// Preset skeleton components
Skeleton.Text = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height={14}
        width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
      />
    ))}
  </div>
)
Skeleton.Text.displayName = 'Skeleton.Text'

Skeleton.Avatar = ({ size = 40, className = '' }) => (
  <Skeleton variant="circular" width={size} height={size} className={className} />
)
Skeleton.Avatar.displayName = 'Skeleton.Avatar'

Skeleton.Card = ({ className = '' }) => (
  <div className={`p-4 bg-white rounded-lg border border-surface-200 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton.Avatar size={32} />
      <Skeleton variant="text" width={120} height={16} />
    </div>
    <Skeleton.Text lines={3} />
  </div>
)
Skeleton.Card.displayName = 'Skeleton.Card'

Skeleton.KPICard = ({ className = '' }) => (
  <div className={`p-4 bg-white rounded-lg border border-surface-200 ${className}`}>
    <Skeleton variant="text" width={100} height={12} className="mb-3" />
    <Skeleton variant="text" width={60} height={28} className="mb-2" />
    <Skeleton variant="text" width={80} height={12} />
  </div>
)
Skeleton.KPICard.displayName = 'Skeleton.KPICard'

Skeleton.Table = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`bg-white rounded-lg border border-surface-200 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex gap-4 p-3 bg-surface-50 border-b border-surface-200">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" width={80} height={14} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="flex gap-4 p-3 border-b border-surface-100 last:border-0"
      >
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={colIndex === 0 ? 60 : 100}
            height={14}
          />
        ))}
      </div>
    ))}
  </div>
)
Skeleton.Table.displayName = 'Skeleton.Table'

Skeleton.Chart = ({ height = 200, className = '' }) => (
  <div className={`p-4 bg-white rounded-lg border border-surface-200 ${className}`}>
    <Skeleton variant="text" width={120} height={16} className="mb-4" />
    <Skeleton height={height} />
  </div>
)
Skeleton.Chart.displayName = 'Skeleton.Chart'

export default Skeleton
