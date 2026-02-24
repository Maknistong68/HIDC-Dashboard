/**
 * Audit Logger for HSE Dashboard
 *
 * Provides audit logging for security-sensitive operations:
 * - Data exports (PDF, JSON, PPTX)
 * - Data imports
 * - Data deletions
 * - Authentication events (when applicable)
 *
 * Logs are stored in IndexedDB for offline persistence and
 * can be exported for compliance review.
 */

import { getDB } from './indexedDBStorage'

// Audit action types
export const AUDIT_ACTIONS = {
  // Export actions
  EXPORT_PDF: 'EXPORT_PDF',
  EXPORT_JSON: 'EXPORT_JSON',
  EXPORT_PPTX: 'EXPORT_PPTX',
  EXPORT_CSV: 'EXPORT_CSV',

  // Import actions
  IMPORT_FILE: 'IMPORT_FILE',
  IMPORT_BATCH: 'IMPORT_BATCH',

  // Delete actions
  DELETE_FILE: 'DELETE_FILE',
  DELETE_RECORDS: 'DELETE_RECORDS',
  CLEAR_ALL_DATA: 'CLEAR_ALL_DATA',

  // Data access
  DATA_ACCESS: 'DATA_ACCESS',

  // Settings changes
  SETTINGS_CHANGE: 'SETTINGS_CHANGE'
}

// Audit log store name
export const AUDIT_STORE = 'audit_log'

/**
 * Log an audit event
 * @param {string} action - The action type (from AUDIT_ACTIONS)
 * @param {Object} details - Additional details about the action
 * @param {string} details.description - Human-readable description
 * @param {number} details.recordCount - Number of records affected
 * @param {string} details.fileName - File name involved (if applicable)
 * @param {Object} details.metadata - Any additional metadata
 * @returns {Promise<number|null>} - The audit log entry ID or null if failed
 */
export const logAuditEvent = async (action, details = {}) => {
  try {
    // Get user agent and basic environment info
    const userAgent = navigator.userAgent
    const timestamp = new Date().toISOString()

    const entry = {
      action,
      timestamp,
      details: {
        description: details.description || '',
        recordCount: details.recordCount || 0,
        fileName: details.fileName || null,
        ...details.metadata
      },
      environment: {
        userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }

    // Try to save to IndexedDB
    const db = await getDB()

    // Check if audit_log store exists
    if (!db.objectStoreNames.contains(AUDIT_STORE)) {
      // Store doesn't exist yet - log to console in dev mode
      if (import.meta.env.DEV) {
        console.warn('[AuditLog] Store not initialized, logging to console:', entry)
      }
      return null
    }

    const id = await db.add(AUDIT_STORE, entry)
    return id
  } catch (error) {
    // Don't let audit logging failures break the app
    if (import.meta.env.DEV) {
      console.error('[AuditLog] Failed to log event:', error)
    }
    return null
  }
}

/**
 * Get audit log entries with optional filtering
 * @param {Object} options - Filter options
 * @param {string} options.action - Filter by action type
 * @param {Date} options.startDate - Filter by start date
 * @param {Date} options.endDate - Filter by end date
 * @param {number} options.limit - Maximum entries to return
 * @returns {Promise<Array>} - Array of audit log entries
 */
export const getAuditLogs = async (options = {}) => {
  try {
    const db = await getDB()

    if (!db.objectStoreNames.contains(AUDIT_STORE)) {
      return []
    }

    let logs = await db.getAll(AUDIT_STORE)

    // Apply filters
    if (options.action) {
      logs = logs.filter(log => log.action === options.action)
    }

    if (options.startDate) {
      const startTime = new Date(options.startDate).getTime()
      logs = logs.filter(log => new Date(log.timestamp).getTime() >= startTime)
    }

    if (options.endDate) {
      const endTime = new Date(options.endDate).getTime()
      logs = logs.filter(log => new Date(log.timestamp).getTime() <= endTime)
    }

    // Sort by timestamp descending (most recent first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Apply limit
    if (options.limit && options.limit > 0) {
      logs = logs.slice(0, options.limit)
    }

    return logs
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[AuditLog] Failed to get logs:', error)
    }
    return []
  }
}

/**
 * Export audit logs to JSON for compliance review
 * @param {Object} options - Filter options (same as getAuditLogs)
 * @returns {Promise<Object>} - Export data with metadata
 */
export const exportAuditLogs = async (options = {}) => {
  const logs = await getAuditLogs(options)

  return {
    exportedAt: new Date().toISOString(),
    exportedBy: 'Event Dashboard',
    totalEntries: logs.length,
    filters: options,
    entries: logs
  }
}

/**
 * Clear old audit logs (for maintenance)
 * @param {number} daysToKeep - Number of days of logs to keep (default: 365)
 * @returns {Promise<number>} - Number of entries deleted
 */
export const clearOldAuditLogs = async (daysToKeep = 365) => {
  try {
    const db = await getDB()

    if (!db.objectStoreNames.contains(AUDIT_STORE)) {
      return 0
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffTime = cutoffDate.getTime()

    const tx = db.transaction(AUDIT_STORE, 'readwrite')
    const store = tx.objectStore(AUDIT_STORE)

    let cursor = await store.openCursor()
    let deletedCount = 0

    while (cursor) {
      const logTime = new Date(cursor.value.timestamp).getTime()
      if (logTime < cutoffTime) {
        await cursor.delete()
        deletedCount++
      }
      cursor = await cursor.continue()
    }

    await tx.done

    // Log the cleanup itself
    await logAuditEvent(AUDIT_ACTIONS.SETTINGS_CHANGE, {
      description: `Cleared ${deletedCount} audit log entries older than ${daysToKeep} days`
    })

    return deletedCount
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[AuditLog] Failed to clear old logs:', error)
    }
    return 0
  }
}

/**
 * Get audit log statistics
 * @returns {Promise<Object>} - Statistics about the audit log
 */
export const getAuditStats = async () => {
  try {
    const logs = await getAuditLogs()

    const stats = {
      totalEntries: logs.length,
      byAction: {},
      oldestEntry: null,
      newestEntry: null
    }

    // Count by action type
    for (const log of logs) {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1
    }

    // Find oldest and newest
    if (logs.length > 0) {
      stats.oldestEntry = logs[logs.length - 1].timestamp
      stats.newestEntry = logs[0].timestamp
    }

    return stats
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[AuditLog] Failed to get stats:', error)
    }
    return { totalEntries: 0, byAction: {} }
  }
}
