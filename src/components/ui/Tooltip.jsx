import React, { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

/**
 * Tooltip - Accessible tooltip component with multiple positions
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
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

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

      // Keep tooltip within viewport
      x = Math.max(8, Math.min(x, viewport.width - tooltip.width - 8))
      y = Math.max(8, Math.min(y, viewport.height - tooltip.height - 8))

      setTooltipPosition({ x, y })
    }
  }, [isVisible, position])

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
        className={`inline-flex items-center cursor-help ${className}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {showIcon ? (
          <Info
            size={iconSize}
            className="text-surface-400 hover:text-surface-600 transition-colors"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className="fixed z-[100] animate-fade-in"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth,
          }}
        >
          <div className="relative bg-surface-800 text-white text-xs leading-relaxed px-3 py-2 rounded-lg shadow-strong">
            {/* Arrow */}
            <span
              className={`absolute w-2 h-2 bg-surface-800 ${arrowClasses[position]}`}
            />
            <span className="relative">{content}</span>
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
