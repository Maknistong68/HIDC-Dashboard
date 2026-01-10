import { useState, useCallback, useEffect, useRef } from 'react'
import useIsMobile from './useIsMobile'

/**
 * useResizable - Hook for making modal/container resizable by dragging edges
 * Mobile-optimized: Disables resize handles on mobile devices
 *
 * @param {Object} options
 * @param {number} options.minWidth - Minimum width in pixels (default: 400, responsive on mobile)
 * @param {number} options.minHeight - Minimum height in pixels (default: 300, responsive on mobile)
 * @param {number} options.maxWidthPercent - Max width as % of viewport (default: 95)
 * @param {number} options.maxHeightPercent - Max height as % of viewport (default: 95)
 * @param {number} options.initialWidth - Initial width (null = use CSS default)
 * @param {number} options.initialHeight - Initial height (null = use CSS default)
 * @param {boolean} options.disableOnMobile - Disable resizing on mobile (default: true)
 */
const useResizable = ({
  minWidth = 400,
  minHeight = 300,
  maxWidthPercent = 95,
  maxHeightPercent = 95,
  initialWidth = null,
  initialHeight = null,
  disableOnMobile = true
} = {}) => {
  const isMobile = useIsMobile(640)

  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight
  })
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    direction: null
  })
  const containerRef = useRef(null)

  // Calculate responsive min dimensions based on viewport
  const getResponsiveMinDimensions = useCallback(() => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // On mobile, use nearly full viewport
    if (viewportWidth < 640) {
      return {
        minWidth: Math.min(viewportWidth - 32, 320), // 16px padding each side
        minHeight: Math.min(viewportHeight - 100, 400)
      }
    }

    // On tablet, slightly constrained
    if (viewportWidth < 1024) {
      return {
        minWidth: Math.min(viewportWidth - 64, minWidth),
        minHeight: Math.min(viewportHeight - 128, minHeight)
      }
    }

    // Desktop: use provided values
    return { minWidth, minHeight }
  }, [minWidth, minHeight])

  // Get max dimensions based on viewport
  const getMaxDimensions = useCallback(() => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // On mobile, allow nearly full viewport
    if (viewportWidth < 640) {
      return {
        maxWidth: viewportWidth,
        maxHeight: viewportHeight
      }
    }

    return {
      maxWidth: Math.floor(viewportWidth * (maxWidthPercent / 100)),
      maxHeight: Math.floor(viewportHeight * (maxHeightPercent / 100))
    }
  }, [maxWidthPercent, maxHeightPercent])

  // Clamp dimensions within constraints
  const clampDimensions = useCallback((width, height) => {
    const { maxWidth, maxHeight } = getMaxDimensions()
    const { minWidth: respMinWidth, minHeight: respMinHeight } = getResponsiveMinDimensions()

    return {
      width: width ? Math.max(respMinWidth, Math.min(width, maxWidth)) : null,
      height: height ? Math.max(respMinHeight, Math.min(height, maxHeight)) : null
    }
  }, [getMaxDimensions, getResponsiveMinDimensions])

  // Start resize
  const handleResizeStart = useCallback((e, direction) => {
    // Disable resize on mobile if option is set
    if (disableOnMobile && isMobile) return

    e.preventDefault()
    e.stopPropagation()

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    // Get current element dimensions
    const container = containerRef.current
    const rect = container?.getBoundingClientRect()

    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startWidth: rect?.width || dimensions.width || 800,
      startHeight: rect?.height || dimensions.height || 600,
      direction
    }

    setIsResizing(true)
    document.body.style.cursor = getCursorStyle(direction)
    document.body.style.userSelect = 'none'
  }, [dimensions, disableOnMobile, isMobile])

  // Handle resize move
  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const { startX, startY, startWidth, startHeight, direction } = resizeRef.current

    let newWidth = dimensions.width || startWidth
    let newHeight = dimensions.height || startHeight

    // Calculate deltas
    const deltaX = clientX - startX
    const deltaY = clientY - startY

    // Apply deltas based on direction
    if (direction.includes('e')) {
      newWidth = startWidth + deltaX
    }
    if (direction.includes('w')) {
      newWidth = startWidth - deltaX
    }
    if (direction.includes('s')) {
      newHeight = startHeight + deltaY
    }
    if (direction.includes('n')) {
      newHeight = startHeight - deltaY
    }

    const clamped = clampDimensions(newWidth, newHeight)
    setDimensions(clamped)
  }, [isResizing, dimensions, clampDimensions])

  // End resize
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      document.addEventListener('touchmove', handleResizeMove)
      document.addEventListener('touchend', handleResizeEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
      document.removeEventListener('touchmove', handleResizeMove)
      document.removeEventListener('touchend', handleResizeEnd)
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  // Get cursor style for direction
  const getCursorStyle = (direction) => {
    const cursors = {
      'e': 'ew-resize',
      'w': 'ew-resize',
      's': 'ns-resize',
      'n': 'ns-resize',
      'se': 'nwse-resize',
      'sw': 'nesw-resize',
      'ne': 'nesw-resize',
      'nw': 'nwse-resize'
    }
    return cursors[direction] || 'default'
  }

  // Generate resize handles JSX - hidden on mobile
  const ResizeHandles = useCallback(() => {
    // Don't render handles on mobile
    if (disableOnMobile && isMobile) return null

    return (
      <>
        {/* Right edge */}
        <div
          className="absolute top-0 right-0 w-3 h-full cursor-ew-resize hover:bg-blue-500/20 transition-colors z-10"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
          onTouchStart={(e) => handleResizeStart(e, 'e')}
        />
        {/* Bottom edge */}
        <div
          className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize hover:bg-blue-500/20 transition-colors z-10"
          onMouseDown={(e) => handleResizeStart(e, 's')}
          onTouchStart={(e) => handleResizeStart(e, 's')}
        />
        {/* Left edge */}
        <div
          className="absolute top-0 left-0 w-3 h-full cursor-ew-resize hover:bg-blue-500/20 transition-colors z-10"
          onMouseDown={(e) => handleResizeStart(e, 'w')}
          onTouchStart={(e) => handleResizeStart(e, 'w')}
        />
        {/* Bottom-right corner */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-20 group"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
          onTouchStart={(e) => handleResizeStart(e, 'se')}
        >
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-r-2 border-b-2 border-surface-400 group-hover:border-blue-500 transition-colors" />
        </div>
        {/* Bottom-left corner */}
        <div
          className="absolute bottom-0 left-0 w-5 h-5 cursor-nesw-resize z-20 group"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
          onTouchStart={(e) => handleResizeStart(e, 'sw')}
        >
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-l-2 border-b-2 border-surface-400 group-hover:border-blue-500 transition-colors" />
        </div>
      </>
    )
  }, [handleResizeStart, disableOnMobile, isMobile])

  // Container style to apply - responsive for mobile
  const containerStyle = (() => {
    // On mobile, don't apply custom dimensions
    if (isMobile) {
      return {}
    }

    if (dimensions.width || dimensions.height) {
      return {
        width: dimensions.width ? `${dimensions.width}px` : undefined,
        height: dimensions.height ? `${dimensions.height}px` : undefined,
        maxWidth: dimensions.width ? 'none' : undefined,
        maxHeight: dimensions.height ? 'none' : undefined
      }
    }
    return {}
  })()

  // Reset dimensions
  const resetDimensions = useCallback(() => {
    setDimensions({ width: initialWidth, height: initialHeight })
  }, [initialWidth, initialHeight])

  return {
    dimensions,
    setDimensions,
    isResizing,
    containerRef,
    containerStyle,
    ResizeHandles,
    resetDimensions,
    clampDimensions,
    isMobile
  }
}

export default useResizable
