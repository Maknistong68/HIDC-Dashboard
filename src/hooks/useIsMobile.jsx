import { useState, useEffect } from 'react'

/**
 * Shared breakpoint constants - use these throughout the app for consistency
 * Based on Tailwind CSS breakpoints
 */
export const BREAKPOINTS = {
  SM: 640,   // Small phones -> larger phones
  MD: 768,   // Phones -> tablets (primary mobile/desktop breakpoint)
  LG: 1024,  // Tablets -> laptops
  XL: 1280,  // Laptops -> desktops
  XXL: 1536, // Large desktops
}

// Default mobile breakpoint used throughout the app
export const MOBILE_BREAKPOINT = BREAKPOINTS.MD

/**
 * useIsMobile - Hook for detecting mobile/tablet breakpoints
 *
 * @param {number} breakpoint - The breakpoint in pixels (default: 768 = Tailwind's 'md')
 * @returns {boolean} - True if viewport is below breakpoint
 */
const useIsMobile = (breakpoint = MOBILE_BREAKPOINT) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Set initial value
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}

/**
 * useBreakpoint - Hook for detecting current breakpoint
 *
 * @returns {Object} - Object with boolean flags for each breakpoint
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window !== 'undefined') {
      return getBreakpoint(window.innerWidth)
    }
    return { xs: false, sm: false, md: false, lg: false, xl: false, xxl: false }
  })

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth))
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

const getBreakpoint = (width) => ({
  xs: width < 375,      // Extra small phones
  sm: width >= 375 && width < 640,  // Small phones
  md: width >= 640 && width < 768,  // Large phones / small tablets
  lg: width >= 768 && width < 1024, // Tablets
  xl: width >= 1024 && width < 1280, // Small laptops
  xxl: width >= 1280,   // Desktops

  // Convenience flags
  isMobile: width < 640,
  isTablet: width >= 640 && width < 1024,
  isDesktop: width >= 1024,

  // Touch device detection
  isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

/**
 * useIsTouch - Hook for detecting touch devices
 *
 * @returns {boolean} - True if device supports touch
 */
export const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    return false
  })

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

export default useIsMobile
