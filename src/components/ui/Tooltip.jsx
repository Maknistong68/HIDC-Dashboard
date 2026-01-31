import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Info } from 'lucide-react'

/**
 * Tooltip - Accessible tooltip component with SMART auto-positioning
 * Mobile-optimized: Tap to show, tap outside to hide on touch devices
 * Auto-adjusts position to avoid screen edge overlaps
 */
const Tooltip = ({
  content,
  children,
  position = 'auto', // 'auto' | 'top' | 'bottom' | 'left' | 'right'
  delay = 200,
  className = '',
  showIcon = false,
  iconSize = 14,
  maxWidth = 340,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [actualPosition, setActualPosition] = useState('bottom')
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

  // Smart position calculation - automatically finds best position to avoid overlaps
  const calculateBestPosition = useCallback((trigger, tooltip, viewport, preferredPosition) => {
    const padding = 16
    const gap = 10

    // Calculate available space in each direction
    const spaceAbove = trigger.top - padding
    const spaceBelow = viewport.height - trigger.bottom - padding
    const spaceLeft = trigger.left - padding
    const spaceRight = viewport.width - trigger.right - padding

    // Determine best position if 'auto' or if preferred position doesn't fit
    let bestPosition = preferredPosition

    if (preferredPosition === 'auto') {
      // Priority: bottom > top > right > left (bottom is usually best for readability)
      if (spaceBelow >= tooltip.height + gap) {
        bestPosition = 'bottom'
      } else if (spaceAbove >= tooltip.height + gap) {
        bestPosition = 'top'
      } else if (spaceRight >= tooltip.width + gap) {
        bestPosition = 'right'
      } else if (spaceLeft >= tooltip.width + gap) {
        bestPosition = 'left'
      } else {
        // If nothing fits well, use bottom and let viewport clamping handle it
        bestPosition = 'bottom'
      }
    } else {
      // Check if preferred position fits, otherwise find alternative
      const fits = {
        top: spaceAbove >= tooltip.height + gap,
        bottom: spaceBelow >= tooltip.height + gap,
        left: spaceLeft >= tooltip.width + gap,
        right: spaceRight >= tooltip.width + gap,
      }

      if (!fits[preferredPosition]) {
        // Find alternative position
        if (preferredPosition === 'top' && fits.bottom) bestPosition = 'bottom'
        else if (preferredPosition === 'bottom' && fits.top) bestPosition = 'top'
        else if (preferredPosition === 'left' && fits.right) bestPosition = 'right'
        else if (preferredPosition === 'right' && fits.left) bestPosition = 'left'
        else if (fits.bottom) bestPosition = 'bottom'
        else if (fits.top) bestPosition = 'top'
        else bestPosition = 'bottom'
      }
    }

    return bestPosition
  }, [])

  // Position tooltip with smart auto-positioning
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      // Calculate best position
      const bestPosition = calculateBestPosition(trigger, tooltip, viewport, position)
      setActualPosition(bestPosition)

      let x = 0
      let y = 0
      const gap = 10

      switch (bestPosition) {
        case 'top':
          x = trigger.left + trigger.width / 2 - tooltip.width / 2
          y = trigger.top - tooltip.height - gap
          break
        case 'bottom':
          x = trigger.left + trigger.width / 2 - tooltip.width / 2
          y = trigger.bottom + gap
          break
        case 'left':
          x = trigger.left - tooltip.width - gap
          y = trigger.top + trigger.height / 2 - tooltip.height / 2
          break
        case 'right':
          x = trigger.right + gap
          y = trigger.top + trigger.height / 2 - tooltip.height / 2
          break
        default:
          break
      }

      // Keep tooltip within viewport with padding
      const padding = 12
      x = Math.max(padding, Math.min(x, viewport.width - tooltip.width - padding))
      y = Math.max(padding, Math.min(y, viewport.height - tooltip.height - padding))

      setTooltipPosition({ x, y })
    }
  }, [isVisible, position, calculateBestPosition])

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
          className="fixed z-[9999] animate-fade-in pointer-events-auto"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth: Math.min(maxWidth, window.innerWidth - 24),
          }}
        >
          <div className="relative bg-surface-900 text-white text-sm leading-relaxed px-4 py-3 rounded-xl shadow-2xl border border-surface-700">
            {/* Arrow - hidden when position changes dynamically to avoid visual glitches */}
            <span
              className={`absolute w-2.5 h-2.5 bg-surface-900 border-surface-700 ${arrowClasses[actualPosition]}`}
              style={{
                borderWidth: actualPosition === 'top' || actualPosition === 'left' ? '0 1px 1px 0' : '1px 0 0 1px'
              }}
            />
            <div className="relative">{content}</div>

            {/* Close hint on touch devices */}
            {isTouch && (
              <span className="block mt-2 text-[11px] text-surface-400 border-t border-surface-700 pt-2">
                Tap anywhere to close
              </span>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Enhanced InfoTooltip with auto-positioning and improved styling
export const InfoTooltip = ({ text, className = '' }) => (
  <Tooltip content={text} position="auto" className={`ml-1.5 ${className}`} showIcon maxWidth={380} />
)

export default Tooltip
