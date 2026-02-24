/**
 * DateContext - Centralized Date/Time Awareness
 *
 * Provides current date/time to the entire app with:
 * - Automatic midnight rollover (recalculates when day changes)
 * - Consistent "now" reference across all components
 * - Session tracking
 * - Date utility functions
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  getCurrentDate,
  getToday,
  getThisMonthRange,
  getThisWeekRange,
  getLastNDaysRange,
  getPeriodRange,
  getOverdueCutoffDate,
  getCurrentShift,
  formatCurrentDate,
  getAgeDays,
  isOverdue,
  isApproachingDeadline,
  isExpired,
  isExpiringSoon,
  getDaysUntilExpiry,
  getRelativeTime,
  isToday,
  getSessionStart,
  getSessionDurationMinutes,
} from '../utils/dateUtils'

const DateContext = createContext()

export const useDate = () => {
  const context = useContext(DateContext)
  if (!context) {
    throw new Error('useDate must be used within a DateProvider')
  }
  return context
}

export const DateProvider = ({ children }) => {
  // Current date state - updates at midnight
  const [currentDate, setCurrentDate] = useState(getCurrentDate)
  const [lastRefresh, setLastRefresh] = useState(getCurrentDate)
  const intervalRef = useRef(null)

  // Update date at midnight instead of polling every 60 seconds
  useEffect(() => {
    // Calculate ms until midnight
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight - now

    // Set timeout for midnight, then switch to daily interval
    const timeout = setTimeout(() => {
      setCurrentDate(new Date())
      setLastRefresh(new Date())
      // After midnight, set daily interval
      const interval = setInterval(() => {
        setCurrentDate(new Date())
        setLastRefresh(new Date())
      }, 24 * 60 * 60 * 1000)
      // Store interval for cleanup
      intervalRef.current = interval
    }, msUntilMidnight)

    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Manual refresh function
  const refreshDate = useCallback(() => {
    const now = getCurrentDate()
    setCurrentDate(now)
    setLastRefresh(now)
  }, [])

  // Memoized date ranges - recalculate when currentDate changes
  const dateRanges = useMemo(() => ({
    thisMonth: getThisMonthRange(),
    thisWeek: getThisWeekRange(),
    last7Days: getLastNDaysRange(7),
    last30Days: getLastNDaysRange(30),
    last90Days: getLastNDaysRange(90),
  // eslint-disable-next-line react-hooks/exhaustive-deps -- currentDate triggers recalc of date-relative ranges
  }), [currentDate])

  // Memoized cutoff dates
  const cutoffDates = useMemo(() => ({
    overdue30Days: getOverdueCutoffDate(30),
    overdue7Days: getOverdueCutoffDate(7),
    overdue14Days: getOverdueCutoffDate(14),
  // eslint-disable-next-line react-hooks/exhaustive-deps -- currentDate triggers recalc
  }), [currentDate])

  // Current shift
  const currentShift = useMemo(() => getCurrentShift(), [currentDate]) // eslint-disable-line react-hooks/exhaustive-deps -- currentDate triggers recalc

  // Context value
  const value = useMemo(() => ({
    // Current state
    currentDate,
    lastRefresh,
    currentShift,

    // Date ranges (pre-calculated for performance)
    dateRanges,
    cutoffDates,

    // Functions - pass through from dateUtils
    refreshDate,
    getCurrentDate,
    getToday,
    getThisMonthRange,
    getThisWeekRange,
    getLastNDaysRange,
    getPeriodRange,
    getOverdueCutoffDate,
    getCurrentShift,
    formatCurrentDate,

    // Age/Overdue calculations
    getAgeDays,
    isOverdue,
    isApproachingDeadline,

    // Expiry calculations
    isExpired,
    isExpiringSoon,
    getDaysUntilExpiry,

    // Formatting
    getRelativeTime,
    isToday,

    // Session info
    getSessionStart,
    getSessionDurationMinutes,
  }), [currentDate, lastRefresh, currentShift, dateRanges, cutoffDates, refreshDate])

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  )
}
