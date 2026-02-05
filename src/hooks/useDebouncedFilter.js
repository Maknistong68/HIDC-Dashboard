import { useState, useEffect, useTransition, useRef, useMemo } from 'react'

/**
 * useDebouncedFilter - Hook for debouncing filter values to prevent lag
 *
 * Returns immediate values for UI display and debounced values for expensive calculations.
 * Uses useTransition to keep the UI responsive during updates.
 *
 * @param {Object} filterValues - The current filter values object
 * @param {number} delay - Debounce delay in milliseconds (default: 150ms)
 * @returns {Object} { immediate, debounced, isPending }
 *   - immediate: Current filter values (use for UI elements like selected state)
 *   - debounced: Debounced filter values (use for expensive calculations like filtering large arrays)
 *   - isPending: Whether a transition is pending (can show loading indicator)
 */
export const useDebouncedFilter = (filterValues, delay = 150) => {
  const [debouncedValues, setDebouncedValues] = useState(filterValues)
  const [isPending, startTransition] = useTransition()
  const timeoutRef = useRef(null)

  // Track the previous filter values for comparison
  const prevFilterRef = useRef(filterValues)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Check if values actually changed (shallow comparison)
    const hasChanged = Object.keys(filterValues).some(
      key => filterValues[key] !== prevFilterRef.current[key]
    )

    if (!hasChanged) {
      return
    }

    prevFilterRef.current = filterValues

    // Set up debounce
    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        setDebouncedValues(filterValues)
      })
    }, delay)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [filterValues, delay])

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(() => ({
    immediate: filterValues,
    debounced: debouncedValues,
    isPending
  }), [filterValues, debouncedValues, isPending])
}

/**
 * useDebouncedValue - Simpler hook for debouncing a single value
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 150ms)
 * @returns {Object} { immediate, debounced, isPending }
 */
export const useDebouncedValue = (value, delay = 150) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [isPending, startTransition] = useTransition()
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        setDebouncedValue(value)
      })
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return useMemo(() => ({
    immediate: value,
    debounced: debouncedValue,
    isPending
  }), [value, debouncedValue, isPending])
}

export default useDebouncedFilter
