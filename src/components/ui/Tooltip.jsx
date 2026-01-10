import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Info } from 'lucide-react'

/**
 * Tooltip - Accessible tooltip component with multiple positions
 * Mobile-optimized: Tap to show, tap outside to hide on touch devices
 */
const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
  showIcon = false,
  iconSize = 14,
  maxWidth = 280,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isTouch, setIsTouch] = useState(false)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  // Detect touch device on mount
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const showTooltip = useCallback(() => {
    if (isTouch) {
      // On touch: show immediately (toggle behavior)
      setIsVisible(true)
    } else {
      // On mouse: use delay
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }
  }, [delay, isTouch])

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }, [])

  // Toggle for touch devices
  const handleTouchToggle = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsVisible(prev => !prev)
  }, [])

  // Handle click for touch devices
  const handleClick = useCallback((e) => {
    if (isTouch) {
      e.preventDefault()
      e.stopPropagation()
      setIsVisible(prev => !prev)
    }
  }, [isTouch])

  // Close on outside click/touch (for touch devices)
  useEffect(() => {
    if (!isTouch || !isVisible) return

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target)
      ) {
        setIsVisible(false)
      }
    }

    // Small delay to prevent immediate close on the same tap that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener('touchstart', handleOutsideClick)
      document.addEventListener('click', handleOutsideClick)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isTouch, isVisible])

  // Position tooltip
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      let x = 0
      let y = 0

      switch (position) {
        case 'top':
          x = trigger.left + trigger.width / 2 - tooltip.width / 2
          y = trigger.top - tooltip.height - 8
          break
        case 'bottom':
          x = trigger.left + trigger.width / 2 - tooltip.width / 2
          y = trigger.bottom + 8
          break
        case 'left':
          x = trigger.left - tooltip.width - 8
          y = trigger.top + trigger.height / 2 - tooltip.height / 2
          break
        case 'right':
          x = trigger.right + 8
          y = trigger.top + trigger.height / 2 - tooltip.height / 2
          break
        default:
          break
      }

      // Keep tooltip within viewport with padding
      const padding = 16
      x = Math.max(padding, Math.min(x, viewport.width - tooltip.width - padding))
      y = Math.max(padding, Math.min(y, viewport.height - tooltip.height - padding))

      setTooltipPosition({ x, y })
    }
  }, [isVisible, position])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
    left: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45',
    right: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
  }

  return (
    <>
      <span
        ref={triggerRef}
        className={`
          inline-flex items-center
          ${isTouch ? 'cursor-pointer' : 'cursor-help'}
          ${className}
        `}
        // Mouse events (desktop)
        onMouseEnter={!isTouch ? showTooltip : undefined}
        onMouseLeave={!isTouch ? hideTooltip : undefined}
        // Touch events (mobile)
        onClick={handleClick}
        onTouchEnd={isTouch ? handleTouchToggle : undefined}
        // Keyboard events
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
        aria-expanded={isVisible}
      >
        {showIcon ? (
          <span className={`
            inline-flex items-center justify-center rounded-full
            ${isTouch ? 'w-7 h-7 -m-1.5 active:bg-surface-200/50' : ''}
            transition-colors
          `}>
            <Info
              size={iconSize}
              className={`
                text-surface-400 transition-colors
                ${isTouch ? 'active:text-primary-500' : 'hover:text-surface-600'}
                ${isVisible ? 'text-primary-500' : ''}
              `}
              aria-hidden="true"
            />
          </span>
        ) : (
          children
        )}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className="fixed z-[100] animate-fade-in pointer-events-auto"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth: Math.min(maxWidth, window.innerWidth - 32),
          }}
        >
          <div className="relative bg-surface-800 text-white text-sm sm:text-xs leading-relaxed px-4 sm:px-3 py-2.5 sm:py-2 rounded-lg shadow-strong">
            {/* Arrow */}
            <span
              className={`absolute w-2 h-2 bg-surface-800 ${arrowClasses[position]}`}
            />
            <span className="relative">{content}</span>

            {/* Close hint on touch devices */}
            {isTouch && (
              <span className="block mt-1.5 text-[10px] text-surface-400 border-t border-surface-600 pt-1.5">
                Tap anywhere to close
              </span>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Simpler inline info tooltip for chart headers
export const InfoTooltip = ({ text, className = '' }) => (
  <Tooltip content={text} position="right" className={`ml-1.5 ${className}`} showIcon />
)

export default Tooltip
