/**
 * Storage Layer for HSE Dashboard
 *
 * Provides backward-compatible API that uses IndexedDB for enterprise-scale storage.
 * Falls back to localStorage for settings and small data if IndexedDB fails.
 *
 * Migration: Automatically migrates data from localStorage to IndexedDB on first load.
 */

import {
  isIndexedDBSupported,
  getAllRecords,
  getRecordsChunked,
  addRecords,
  updateRecordsBatch,
  createFile,
  getAllFiles,
  getFileByHash,
  deleteFile as idbDeleteFile,
  getStorageStats,
  clearAllData as idbClearAllData,
  exportAllData as idbExportAllData,
  importAllData as idbImportAllData,
  getSetting,
  setSetting,
} from './indexedDBStorage'
import { safeJsonParse, safeJsonStringify } from './safeJson'
import { logAuditEvent, AUDIT_ACTIONS } from './auditLogger'

// LocalStorage keys (for backward compatibility and fallback)
const STORAGE_KEYS = {
  PROJECTS: 'hse_projects',
  INCIDENTS: 'hse_incidents',
  ENGAGEMENTS: 'hse_engagements',
  COMPLIANCE: 'hse_compliance',
  SETTINGS: 'hse_settings',
  MIGRATED_TO_IDB: 'hse_migrated_to_idb'
}

// Track if we're using IndexedDB
let useIndexedDB = null

/**
 * Check if we should use IndexedDB
 */
const shouldUseIndexedDB = async () => {
  if (useIndexedDB === null) {
    useIndexedDB = await isIndexedDBSupported()
  }
  return useIndexedDB
}

/**
 * Check if data has been migrated to IndexedDB
 */
const isMigrated = () => {
  return localStorage.getItem(STORAGE_KEYS.MIGRATED_TO_IDB) === 'true'
}

/**
 * Mark data as migrated
 */
const markMigrated = () => {
  localStorage.setItem(STORAGE_KEYS.MIGRATED_TO_IDB, 'true')
}

// ============================================
// LEGACY LOCALSTORAGE FUNCTIONS (kept for fallback)
// ============================================

/**
 * Get data from localStorage (legacy)
 */
export const getData = (key) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key])
    return safeJsonParse(data, null)
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error reading ${key} from localStorage:`, error)
    return null
  }
}

/**
 * Save data to localStorage (legacy)
 */
export const saveData = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], safeJsonStringify(data, '{}'))
    return true
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error saving ${key} to localStorage:`, error)
    return false
  }
}

/**
 * Clear specific data from localStorage (legacy)
 */
export const clearData = (key) => {
  try {
    localStorage.removeItem(STORAGE_KEYS[key])
    return true
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error clearing ${key} from localStorage:`, error)
    return false
  }
}

/**
 * Clear all data from localStorage
 */
export const clearAllData = async () => {
  try {
    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // Clear IndexedDB if supported
    if (await shouldUseIndexedDB()) {
      await idbClearAllData()
    }

    return true
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error clearing all data:', error)
    return false
  }
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

/**
 * Migrate data from localStorage to IndexedDB
 * This runs once on first load after IndexedDB is enabled
 */
export const migrateToIndexedDB = async () => {
  if (isMigrated()) {
    return { success: true, skipped: true }
  }

  if (!(await shouldUseIndexedDB())) {
    return { success: false, reason: 'IndexedDB not supported' }
  }

  try {
    // Get existing incidents from localStorage
    const incidents = getData('INCIDENTS') || []

    if (incidents.length > 0) {
      // Create a file record for the migrated data
      const fileId = await createFile({
        fileName: 'Migrated from localStorage',
        fileSize: 0,
        recordCount: incidents.length,
        status: 'active',
        migratedFrom: 'localStorage'
      })

      // Add all records to IndexedDB with the file reference
      await addRecords(incidents, fileId)
    }

    // Migrate settings
    const settings = getData('SETTINGS')
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        await setSetting(key, value)
      }
    }

    // Mark as migrated
    markMigrated()

    // Clear localStorage incidents (keep settings as backup)
    clearData('INCIDENTS')

    return { success: true, recordsMigrated: incidents.length }
  } catch (error) {
    if (import.meta.env.DEV) console.error('[Migration] CRITICAL ERROR during migration:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// DATA MIGRATIONS (one-time fixes for existing records)
// ============================================

const MIGRATION_KEY = 'hazard-category-fix-v1'

/**
 * Fix hazard categories for security & environmental incidents.
 * Security → "Site Security", Environmental → "Environmental".
 * Runs once, tracked via settings flag.
 */
export const migrateHazardCategories = async () => {
  try {
    const alreadyRun = await getSetting(MIGRATION_KEY)
    if (alreadyRun) return { skipped: true }

    const records = await getAllRecords()
    const updates = []

    for (const record of records) {
      const t = record.type
      if (t === 'security' && record.location !== 'Site Security') {
        updates.push({ id: record.id, updates: { location: 'Site Security' } })
      } else if ((t === 'environmental' || t === 'env-minor' || t === 'env-major') && record.location !== 'Environmental') {
        updates.push({ id: record.id, updates: { location: 'Environmental' } })
      }
    }

    if (updates.length > 0) {
      await updateRecordsBatch(updates)
    }

    await setSetting(MIGRATION_KEY, { ran: true, fixed: updates.length, date: new Date().toISOString() })
    return { fixed: updates.length }
  } catch (error) {
    if (import.meta.env.DEV) console.error('[Migration] Hazard category fix failed:', error)
    return { error: error.message }
  }
}

// ============================================
// UNIFIED STORAGE API
// ============================================

/**
 * Load all incidents (from IndexedDB or localStorage)
 */
export const loadIncidents = async () => {
  try {
    // Try IndexedDB first
    const useIDB = await shouldUseIndexedDB()

    if (useIDB) {
      // Run migrations if needed
      await migrateToIndexedDB()
      await migrateHazardCategories()

      const records = await getAllRecords()
      return records
    }

    // Fallback to localStorage
    const localData = getData('INCIDENTS') || []
    return localData
  } catch (error) {
    if (import.meta.env.DEV) console.error('[Storage] CRITICAL ERROR loading incidents:', error)
    // Final fallback
    const fallbackData = getData('INCIDENTS') || []
    return fallbackData
  }
}

/**
 * Load all incidents in chunks (prevents main-thread blocking for 60K+ records).
 * Falls back to bulk load if IndexedDB chunked loading fails.
 *
 * @param {function} onChunk - Called with (loaded, total) after each chunk
 * @returns {Promise<Array>}
 */
export const loadIncidentsChunked = async (onChunk) => {
  try {
    const useIDB = await shouldUseIndexedDB()

    if (useIDB) {
      await migrateToIndexedDB()
      await migrateHazardCategories()
      return await getRecordsChunked(5000, onChunk)
    }

    // Fallback to localStorage (no chunking needed for small data)
    const localData = getData('INCIDENTS') || []
    return localData
  } catch (error) {
    if (import.meta.env.DEV) console.error('[Storage] Chunked load failed, falling back to bulk:', error)
    // Fallback to bulk load
    try {
      return await loadIncidents()
    } catch (fallbackError) {
      if (import.meta.env.DEV) console.error('[Storage] Bulk fallback also failed:', fallbackError)
      return getData('INCIDENTS') || []
    }
  }
}

/**
 * Save incidents (to IndexedDB with file tracking)
 * Note: For new imports, use saveIncidentsWithFile instead
 */
export const saveIncidents = async (incidents) => {
  try {
    if (await shouldUseIndexedDB()) {
      // For direct saves (not through import), update existing records
      // This is mainly for recategorization and updates
      await idbClearAllData()

      if (incidents.length > 0) {
        // Group by fileId if available
        const byFile = new Map()
        for (const incident of incidents) {
          const fileId = incident.fileId || 'legacy'
          if (!byFile.has(fileId)) {
            byFile.set(fileId, [])
          }
          byFile.get(fileId).push(incident)
        }

        // Re-create files and add records
        for (const [fileId, records] of byFile) {
          const newFileId = await createFile({
            fileName: fileId === 'legacy' ? 'Legacy Data' : `File ${fileId}`,
            fileSize: 0,
            recordCount: records.length,
            status: 'active'
          })
          await addRecords(records, newFileId)
        }
      }

      return true
    }

    // Fallback to localStorage
    return saveData('INCIDENTS', incidents)
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error saving incidents:', error)
    return saveData('INCIDENTS', incidents)
  }
}

/**
 * Save incidents with file tracking (for imports)
 * @param {Array} incidents - Array of incident records
 * @param {Object} fileInfo - { fileName, fileSize, fileHash }
 * @returns {Promise<{ fileId: number, recordCount: number }>}
 */
export const saveIncidentsWithFile = async (incidents, fileInfo) => {
  try {
    const useIDB = await shouldUseIndexedDB()

    if (useIDB) {
      // Create file record
      const fileId = await createFile({
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize || 0,
        fileHash: fileInfo.fileHash || null,
        recordCount: incidents.length,
        status: 'active'
      })

      // Add records with file reference
      await addRecords(incidents, fileId)

      return { fileId, recordCount: incidents.length }
    }

    // Fallback: append to localStorage
    const existing = getData('INCIDENTS') || []
    saveData('INCIDENTS', [...existing, ...incidents])
    return { fileId: null, recordCount: incidents.length }
  } catch (error) {
    if (import.meta.env.DEV) console.error('[Storage] CRITICAL ERROR saving incidents with file:', error)
    throw error
  }
}

/**
 * Check if a file with the given hash already exists
 * @param {string} hash - SHA-256 hash of the file
 * @returns {Promise<Object|undefined>} - The file record if found
 */
export const checkFileHashExists = async (hash) => {
  try {
    if (await shouldUseIndexedDB()) {
      return await getFileByHash(hash)
    }
    // No hash tracking in localStorage
    return undefined
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error checking file hash:', error)
    return undefined
  }
}

/**
 * Get all imported files
 */
export const getImportedFiles = async () => {
  try {
    if (await shouldUseIndexedDB()) {
      return await getAllFiles()
    }
    // No file tracking in localStorage
    return []
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error getting imported files:', error)
    return []
  }
}

/**
 * Delete a file and all its records
 * @param {number} fileId
 */
export const deleteImportedFile = async (fileId) => {
  try {
    let result = { deletedRecords: 0 }
    if (await shouldUseIndexedDB()) {
      result = await idbDeleteFile(fileId)
    }

    // Log audit event for deletion
    await logAuditEvent(AUDIT_ACTIONS.DELETE_FILE, {
      description: `Deleted file ID ${fileId} and associated records`,
      recordCount: result.deletedRecords,
      metadata: { fileId }
    })

    return result
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * Get storage statistics
 */
export const getStorageStatistics = async () => {
  try {
    if (await shouldUseIndexedDB()) {
      return await getStorageStats()
    }

    // Estimate localStorage usage
    let totalSize = 0
    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += item.length * 2 // UTF-16
      }
    }

    const incidents = getData('INCIDENTS') || []
    return {
      fileCount: 0,
      recordCount: incidents.length,
      estimatedSize: totalSize,
      estimatedSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      isIndexedDB: false
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error getting storage statistics:', error)
    return { fileCount: 0, recordCount: 0, estimatedSize: 0, estimatedSizeMB: '0' }
  }
}

// ============================================
// EXPORT/IMPORT FUNCTIONS
// ============================================

/**
 * Export all data to JSON
 */
export const exportAllData = async () => {
  try {
    let data
    if (await shouldUseIndexedDB()) {
      data = await idbExportAllData()
    } else {
      data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        projects: getData('PROJECTS') || [],
        incidents: getData('INCIDENTS') || [],
        engagements: getData('ENGAGEMENTS') || [],
        compliance: getData('COMPLIANCE') || [],
        settings: getData('SETTINGS') || {},
      }
    }

    // Log audit event
    const recordCount = data.records?.length || data.incidents?.length || 0
    await logAuditEvent(AUDIT_ACTIONS.EXPORT_JSON, {
      description: 'Full data export to JSON',
      recordCount,
      metadata: {
        exportDate: data.exportDate || data.exportedAt,
        fileCount: data.files?.length || 0
      }
    })

    return data
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error exporting data:', error)
    throw error
  }
}

/**
 * Import data from JSON
 */
export const importAllData = async (data) => {
  try {
    if (!data.version) {
      throw new Error('Invalid data format: missing version')
    }

    if (await shouldUseIndexedDB()) {
      // Check if this is the new format (with files array)
      if (data.files && data.records) {
        return await idbImportAllData(data)
      }

      // Convert legacy format
      if (data.incidents && data.incidents.length > 0) {
        const fileId = await createFile({
          fileName: 'Imported from backup',
          fileSize: 0,
          recordCount: data.incidents.length,
          status: 'active',
          importedAt: data.exportDate || new Date().toISOString()
        })

        await addRecords(data.incidents, fileId)
        return { success: true, records: data.incidents.length }
      }
    }

    // Fallback to localStorage
    if (data.projects) saveData('PROJECTS', data.projects)
    if (data.incidents) saveData('INCIDENTS', data.incidents)
    if (data.engagements) saveData('ENGAGEMENTS', data.engagements)
    if (data.compliance) saveData('COMPLIANCE', data.compliance)
    if (data.settings) saveData('SETTINGS', data.settings)

    return { success: true }
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error importing data:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Download JSON file
 */
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Read JSON file
 */
export const readJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = safeJsonParse(e.target.result, null)
      if (data === null) {
        reject(new Error('Invalid JSON file'))
      } else {
        resolve(data)
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

// ============================================
// SETTINGS (sync access for backward compatibility)
// ============================================

/**
 * Get settings (sync for backward compatibility)
 * Uses localStorage directly for immediate access
 */
export const getSettingsSync = () => {
  return getData('SETTINGS') || {}
}

/**
 * Save settings (both localStorage and IndexedDB)
 */
export const saveSettings = async (settings) => {
  // Always save to localStorage for sync access
  saveData('SETTINGS', settings)

  // Also save to IndexedDB if available
  try {
    if (await shouldUseIndexedDB()) {
      for (const [key, value] of Object.entries(settings)) {
        await setSetting(key, value)
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error saving settings to IndexedDB:', error)
  }
}
