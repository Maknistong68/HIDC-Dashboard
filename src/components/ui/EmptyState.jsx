import { FileText, Search, AlertCircle, Inbox, Database } from 'lucide-react'
import Button from './Button'

/**
 * EmptyState - Placeholder for empty content areas
 */
const EmptyState = ({
  icon: CustomIcon,
  title,
  description,
  action,
  actionLabel,
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const variants = {
    default: {
      icon: Inbox,
      defaultTitle: 'No data',
      defaultDescription: 'There is nothing to display here yet.',
    },
    search: {
      icon: Search,
      defaultTitle: 'No results found',
      defaultDescription: 'Try adjusting your search or filters.',
    },
    error: {
      icon: AlertCircle,
      defaultTitle: 'Something went wrong',
      defaultDescription: 'An error occurred while loading data.',
    },
    noData: {
      icon: Database,
      defaultTitle: 'No data available',
      defaultDescription: 'Import data to get started.',
    },
    noRecords: {
      icon: FileText,
      defaultTitle: 'No records',
      defaultDescription: 'No records match the current filters.',
    },
  }

  const sizes = {
    small: {
      container: 'py-6',
      icon: 32,
      title: 'text-sm',
      description: 'text-xs',
    },
    default: {
      container: 'py-12',
      icon: 48,
      title: 'text-base',
      description: 'text-sm',
    },
    large: {
      container: 'py-20',
      icon: 64,
      title: 'text-lg',
      description: 'text-base',
    },
  }

  const config = variants[variant]
  const sizeConfig = sizes[size]
  const Icon = CustomIcon || config.icon

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${sizeConfig.container}
        ${className}
      `}
    >
      <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mb-4 animate-fade-in">
        <Icon size={sizeConfig.icon} className="text-surface-400" strokeWidth={1.5} />
      </div>
      <h3
        className={`font-medium text-surface-700 mb-1 animate-fade-in ${sizeConfig.title}`}
        style={{ animationDelay: '0.1s' }}
      >
        {title || config.defaultTitle}
      </h3>
      <p
        className={`text-surface-500 max-w-sm mb-4 animate-fade-in ${sizeConfig.description}`}
        style={{ animationDelay: '0.2s' }}
      >
        {description || config.defaultDescription}
      </p>
      {action && actionLabel && (
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button onClick={action} variant="primary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState
