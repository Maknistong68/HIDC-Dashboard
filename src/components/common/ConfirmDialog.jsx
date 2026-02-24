// React import removed (jsx-runtime)
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import Modal from './Modal'
import { Button } from '../ui'

/**
 * ConfirmDialog - Accessible confirmation dialog
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-safety-critical-light',
      iconColor: 'text-safety-critical',
      buttonVariant: 'danger',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-safety-warning-light',
      iconColor: 'text-safety-warning',
      buttonVariant: 'danger',
    },
    primary: {
      icon: Info,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      buttonVariant: 'primary',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-safety-success-light',
      iconColor: 'text-safety-success',
      buttonVariant: 'success',
    },
  }

  const config = variantConfig[variant] || variantConfig.danger
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center py-4">
        {/* Icon */}
        <div
          className={`
            mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4
            animate-scale-in
            ${config.iconBg}
          `}
        >
          <Icon
            className={`w-7 h-7 ${config.iconColor}`}
            aria-hidden="true"
          />
        </div>

        {/* Message */}
        <p className="text-surface-600 leading-relaxed">{message}</p>
      </div>

      {/* Actions */}
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          {cancelText}
        </Button>
        <Button
          variant={config.buttonVariant}
          onClick={handleConfirm}
          loading={loading}
          className="flex-1"
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmDialog
