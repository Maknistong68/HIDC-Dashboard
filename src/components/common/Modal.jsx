import React, { useEffect, useRef, useCallback, useId } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

/**
 * Modal - Accessible modal component with focus trapping and animations
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  contentClassName = '',
}) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const titleId = useId()

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  }

  // Get all focusable elements within the modal
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return []
    return modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  }, [])

  // Focus trap handler
  const handleTabKey = useCallback(
    (e) => {
      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    },
    [getFocusableElements]
  )

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab') {
        handleTabKey(e)
      }
    },
    [closeOnEscape, onClose, handleTabKey]
  )

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  // Focus management on open/close
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      // Focus first focusable element or the modal itself
      requestAnimationFrame(() => {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        } else if (modalRef.current) {
          modalRef.current.focus()
        }
      })

      // Add event listener
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus when modal closes
      if (previousFocusRef.current && !isOpen) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, handleKeyDown, getFocusableElements])

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative bg-white rounded-xl shadow-strong w-full
            transform transition-all duration-300 ease-out
            animate-scale-in
            ${sizeClasses[size]}
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-semibold text-surface-800"
                >
                  {title}
                </h2>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`p-5 ${contentClassName}`}>{children}</div>
        </div>
      </div>
    </div>
  )

  // Use portal to render at document root
  return createPortal(modalContent, document.body)
}

// Modal Footer for consistent action buttons
Modal.Footer = ({ children, className = '' }) => (
  <div
    className={`flex items-center justify-end gap-3 pt-4 mt-4 border-t border-surface-200 ${className}`}
  >
    {children}
  </div>
)

// Modal Section for grouping content
Modal.Section = ({ title, children, className = '' }) => (
  <div className={`mb-4 last:mb-0 ${className}`}>
    {title && (
      <h3 className="text-sm font-medium text-surface-700 mb-2">{title}</h3>
    )}
    {children}
  </div>
)

export default Modal
