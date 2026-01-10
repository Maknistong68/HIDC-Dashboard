import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * useResizable - Hook for making modal/container resizable by dragging edges
 *
 * @param {Object} options
 * @param {number} options.minWidth - Minimum width in pixels (default: 400)
 * @param {number} options.minHeight - Minimum height in pixels (default: 300)
 * @param {number} options.maxWidthPercent - Max width as % of viewport (default: 95)
 * @param {number} options.maxHeightPercent - Max height as % of viewport (default: 95)
 * @param {number} options.initialWidth - Initial width (null = use CSS default)
 * @param {number} options.initialHeight - Initial height (null = use CSS default)
 */
const useResizable = ({
  minWidth = 400,
  minHeight = 300,
  maxWidthPercent = 95,
  maxHeightPercent = 95,
  initialWidth = null,
  initialHeight = null
} = {}) => {
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

  // Get max dimensions based on viewport
  const getMaxDimensions = useCallback(() => {
    return {
      maxWidth: Math.floor(window.innerWidth * (maxWidthPercent / 100)),
      maxHeight: Math.floor(window.innerHeight * (maxHeightPercent / 100))
    }
  }, [maxWidthPercent, maxHeightPercent])

  // Clamp dimensions within constraints
  const clampDimensions = useCallback((width, height) => {
    const { maxWidth, maxHeight } = getMaxDimensions()
    return {
      width: width ? Math.max(minWidth, Math.min(width, maxWidth)) : null,
      height: height ? Math.max(minHeight, Math.min(height, maxHeight)) : null
    }
  }, [minWidth, minHeight, getMaxDimensions])

  // Start resize
  const handleResizeStart = useCallback((e, direction) => {
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
  }, [dimensions])

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

  // Generate resize handles JSX
  const ResizeHandles = useCallback(() => (
    <>
      {/* Right edge */}
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-blue-500/20 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'e')}
        onTouchStart={(e) => handleResizeStart(e, 'e')}
      />
      {/* Bottom edge */}
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-blue-500/20 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 's')}
        onTouchStart={(e) => handleResizeStart(e, 's')}
      />
      {/* Left edge */}
      <div
        className="absolute top-0 left-0 w-2 h-full cursor-ew-resize hover:bg-blue-500/20 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'w')}
        onTouchStart={(e) => handleResizeStart(e, 'w')}
      />
      {/* Bottom-right corner */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20 group"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
        onTouchStart={(e) => handleResizeStart(e, 'se')}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-surface-400 group-hover:border-blue-500 transition-colors" />
      </div>
      {/* Bottom-left corner */}
      <div
        className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-20 group"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
        onTouchStart={(e) => handleResizeStart(e, 'sw')}
      >
        <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-surface-400 group-hover:border-blue-500 transition-colors" />
      </div>
    </>
  ), [handleResizeStart])

  // Container style to apply
  const containerStyle = dimensions.width || dimensions.height ? {
    width: dimensions.width ? `${dimensions.width}px` : undefined,
    height: dimensions.height ? `${dimensions.height}px` : undefined,
    maxWidth: dimensions.width ? 'none' : undefined,
    maxHeight: dimensions.height ? 'none' : undefined
  } : {}

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
    clampDimensions
  }
}

export default useResizable
