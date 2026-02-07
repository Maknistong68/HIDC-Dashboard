import { useEffect } from 'react'

/**
 * useNavigationGuard - Prevents browser close/reload when a condition is true.
 * Shows the browser's native "Leave site?" confirmation dialog.
 *
 * @param {boolean} shouldBlock - Whether to block navigation
 */
const useNavigationGuard = (shouldBlock) => {
  useEffect(() => {
    if (!shouldBlock) return

    const handler = (e) => {
      e.preventDefault()
      // Chrome requires returnValue to be set
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [shouldBlock])
}

export default useNavigationGuard
