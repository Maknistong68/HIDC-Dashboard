/**
 * Centralized Date Utilities
 *
 * Single source of truth for all date/time operations in the app.
 * This ensures consistent date handling across all components and calculations.
 */

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
  format,
  isWithinInterval,
  isSameDay,
  isBefore,
  isAfter,
  addDays,
  subDays,
} from 'date-fns'

// ============================================
// CORE DATE PROVIDER
// ============================================

/**
 * Get current date/time
 * All components should use this instead of new Date() directly
 * This allows for consistent date handling and easier testing
 */
export const getCurrentDate = () => new Date()

/**
 * Get today's date at start of day (midnight)
 * Useful for date-only comparisons
 */
export const getToday = () => startOfDay(getCurrentDate())

/**
 * Get current timestamp in ISO format
 */
export const getCurrentTimestamp = () => getCurrentDate().toISOString()

// ============================================
// DATE RANGE UTILITIES
// ============================================

/**
 * Get this month's date range
 * Returns { start, end } as yyyy-MM-dd strings
 */
export const getThisMonthRange = () => {
  const now = getCurrentDate()
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

/**
 * Get this week's date range
 * Returns { start, end } as yyyy-MM-dd strings
 */
export const getThisWeekRange = () => {
  const now = getCurrentDate()
  return {
    start: format(startOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
  }
}

/**
 * Get last N days range
 * Returns { start, end } as yyyy-MM-dd strings
 */
export const getLastNDaysRange = (days) => {
  const now = getCurrentDate()
  return {
    start: format(subDays(now, days), 'yyyy-MM-dd'),
    end: format(now, 'yyyy-MM-dd'),
  }
}

/**
 * Get date range from period in months
 * Used by TimePeriodToggle (1W=0.25, 1M=1, 3M=3, 6M=6, 1Y=12)
 * @param {number} months - Period in months (0.25 = 1 week)
 * @returns {{ start: string, end: string }} - yyyy-MM-dd format
 */
export const getPeriodRange = (months) => {
  const now = getCurrentDate()
  const days = Math.round(months * 30) // Approximate: 1 month = 30 days
  return {
    start: format(subDays(now, days), 'yyyy-MM-dd'),
    end: format(now, 'yyyy-MM-dd'),
  }
}

// ============================================
// AGE CALCULATIONS
// ============================================

/**
 * Calculate age of a record in days
 * @param {string} dateStr - ISO date string (yyyy-MM-dd)
 * @returns {number} - Days since the date
 */
export const getAgeDays = (dateStr) => {
  if (!dateStr) return 0
  try {
    const recordDate = parseISO(dateStr)
    return differenceInDays(getCurrentDate(), recordDate)
  } catch {
    return 0
  }
}

/**
 * Check if a record is overdue (open for more than N days)
 * @param {string} dateStr - Record date
 * @param {number} thresholdDays - Threshold in days (default 30)
 * @returns {boolean}
 */
export const isOverdue = (dateStr, thresholdDays = 30) => {
  return getAgeDays(dateStr) > thresholdDays
}

/**
 * Check if a record is approaching deadline
 * @param {string} dateStr - Record date
 * @param {number} thresholdDays - Total days allowed (default 30)
 * @param {number} warningDays - Days before deadline to warn (default 7)
 * @returns {boolean}
 */
export const isApproachingDeadline = (dateStr, thresholdDays = 30, warningDays = 7) => {
  const age = getAgeDays(dateStr)
  return age >= (thresholdDays - warningDays) && age <= thresholdDays
}

/**
 * Get cutoff date for overdue calculations
 * @param {number} days - Days threshold
 * @returns {string} - yyyy-MM-dd format
 */
export const getOverdueCutoffDate = (days = 30) => {
  return format(subDays(getCurrentDate(), days), 'yyyy-MM-dd')
}

// ============================================
// COMPLIANCE/EXPIRY UTILITIES
// ============================================

/**
 * Check if a date is expired (in the past)
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export const isExpired = (dateStr) => {
  if (!dateStr) return false
  try {
    const expiryDate = parseISO(dateStr)
    return isBefore(expiryDate, getToday())
  } catch {
    return false
  }
}

/**
 * Check if a date is expiring soon (within N days)
 * @param {string} dateStr - ISO date string
 * @param {number} days - Days threshold (default 30)
 * @returns {boolean}
 */
export const isExpiringSoon = (dateStr, days = 30) => {
  if (!dateStr) return false
  try {
    const expiryDate = parseISO(dateStr)
    const today = getToday()
    const futureDate = addDays(today, days)
    return isAfter(expiryDate, today) && isBefore(expiryDate, futureDate)
  } catch {
    return false
  }
}

/**
 * Get days until expiry (negative if expired)
 * @param {string} dateStr - ISO date string
 * @returns {number}
 */
export const getDaysUntilExpiry = (dateStr) => {
  if (!dateStr) return 0
  try {
    const expiryDate = parseISO(dateStr)
    return differenceInDays(expiryDate, getToday())
  } catch {
    return 0
  }
}

// ============================================
// SHIFT DETECTION (for HSE operations)
// ============================================

/**
 * Get current shift based on time of day
 * Morning: 06:00 - 14:00
 * Day/Afternoon: 14:00 - 22:00
 * Night: 22:00 - 06:00
 * @returns {'morning' | 'day' | 'night'}
 */
export const getCurrentShift = () => {
  const hour = getCurrentDate().getHours()
  if (hour >= 6 && hour < 14) return 'morning'
  if (hour >= 14 && hour < 22) return 'day'
  return 'night'
}

/**
 * Get shift for a specific hour
 * @param {number} hour - Hour (0-23)
 * @returns {'morning' | 'day' | 'night'}
 */
export const getShiftForHour = (hour) => {
  if (hour >= 6 && hour < 14) return 'morning'
  if (hour >= 14 && hour < 22) return 'day'
  return 'night'
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format current date for display
 * @param {string} formatStr - date-fns format string
 * @returns {string}
 */
export const formatCurrentDate = (formatStr = 'EEEE, MMMM d, yyyy') => {
  return format(getCurrentDate(), formatStr)
}

/**
 * Format a date string for display
 * @param {string} dateStr - ISO date string
 * @param {string} formatStr - date-fns format string
 * @returns {string}
 */
export const formatDate = (dateStr, formatStr = 'MMM d, yyyy') => {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), formatStr)
  } catch {
    return dateStr
  }
}

/**
 * Get relative time description
 * @param {string} dateStr - ISO date string
 * @returns {string} - e.g., "Today", "Yesterday", "3 days ago", "2 weeks ago"
 */
export const getRelativeTime = (dateStr) => {
  if (!dateStr) return '-'

  try {
    const date = parseISO(dateStr)
    const today = getToday()
    const days = differenceInDays(today, startOfDay(date))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 14) return '1 week ago'
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 60) return '1 month ago'
    return `${Math.floor(days / 30)} months ago`
  } catch {
    return dateStr
  }
}

// ============================================
// DATE COMPARISON UTILITIES
// ============================================

/**
 * Check if date is today
 * @param {string} dateStr - ISO date string
 * @returns {boolean}
 */
export const isToday = (dateStr) => {
  if (!dateStr) return false
  try {
    return isSameDay(parseISO(dateStr), getCurrentDate())
  } catch {
    return false
  }
}

/**
 * Check if date is within range
 * @param {string} dateStr - ISO date string
 * @param {string} startStr - Range start (yyyy-MM-dd)
 * @param {string} endStr - Range end (yyyy-MM-dd)
 * @returns {boolean}
 */
export const isInDateRange = (dateStr, startStr, endStr) => {
  if (!dateStr) return false
  try {
    const date = parseISO(dateStr)
    const start = startStr ? parseISO(startStr) : new Date(0)
    const end = endStr ? parseISO(endStr) : new Date(9999, 11, 31)
    return isWithinInterval(date, { start, end })
  } catch {
    return false
  }
}

// ============================================
// SESSION TRACKING
// ============================================

let sessionStartTime = null

/**
 * Initialize session start time
 * Called once when app loads
 */
export const initSession = () => {
  sessionStartTime = getCurrentDate()
}

/**
 * Get session start time
 * @returns {Date | null}
 */
export const getSessionStart = () => sessionStartTime

/**
 * Get session duration in minutes
 * @returns {number}
 */
export const getSessionDurationMinutes = () => {
  if (!sessionStartTime) return 0
  return differenceInMinutes(getCurrentDate(), sessionStartTime)
}

// Initialize session on module load
initSession()
