/**
 * DateContext - Centralized Date/Time Awareness
 *
 * Provides current date/time to the entire app with:
 * - Automatic midnight rollover (recalculates when day changes)
 * - Consistent "now" reference across all components
 * - Session tracking
 * - Date utility functions
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
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

  // Check for day change and update
  useEffect(() => {
    const checkDayChange = () => {
      const now = getCurrentDate()
      const today = getToday()

      // Check if day has changed since last update
      if (currentDate.toDateString() !== now.toDateString()) {
        console.log('[DateContext] Day changed, refreshing date state')
        setCurrentDate(now)
        setLastRefresh(now)
      }
    }

    // Check every minute for day change
    const interval = setInterval(checkDayChange, 60000)

    // Also check immediately
    checkDayChange()

    return () => clearInterval(interval)
  }, [currentDate])

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
  }), [currentDate])

  // Memoized cutoff dates
  const cutoffDates = useMemo(() => ({
    overdue30Days: getOverdueCutoffDate(30),
    overdue7Days: getOverdueCutoffDate(7),
    overdue14Days: getOverdueCutoffDate(14),
  }), [currentDate])

  // Current shift
  const currentShift = useMemo(() => getCurrentShift(), [currentDate])

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
