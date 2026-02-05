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
  addRecords,
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
  getAllSettings
} from './indexedDBStorage'

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
    console.log('[Storage] Checking IndexedDB support for the first time...')
    useIndexedDB = await isIndexedDBSupported()
    console.log(`[Storage] IndexedDB support result: ${useIndexedDB}`)
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
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return null
  }
}

/**
 * Save data to localStorage (legacy)
 */
export const saveData = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
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
    console.error(`Error clearing ${key} from localStorage:`, error)
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
    console.error('Error clearing all data:', error)
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
  console.log('[Migration] Checking migration status...')
  console.log('[Migration] hse_migrated_to_idb flag:', localStorage.getItem(STORAGE_KEYS.MIGRATED_TO_IDB))

  if (isMigrated()) {
    console.log('[Migration] Already migrated to IndexedDB - skipping')
    return { success: true, skipped: true }
  }

  if (!(await shouldUseIndexedDB())) {
    console.log('[Migration] IndexedDB not supported, using localStorage')
    return { success: false, reason: 'IndexedDB not supported' }
  }

  try {
    console.log('[Migration] Starting localStorage → IndexedDB migration...')

    // Get existing incidents from localStorage
    const incidents = getData('INCIDENTS') || []
    console.log(`[Migration] Found ${incidents.length} records in localStorage`)

    if (incidents.length > 0) {
      // Create a file record for the migrated data
      console.log('[Migration] Creating file record for migrated data...')
      const fileId = await createFile({
        fileName: 'Migrated from localStorage',
        fileSize: 0,
        recordCount: incidents.length,
        status: 'active',
        migratedFrom: 'localStorage'
      })
      console.log(`[Migration] File record created with ID: ${fileId}`)

      // Add all records to IndexedDB with the file reference
      console.log('[Migration] Adding records to IndexedDB...')
      await addRecords(incidents, fileId)

      console.log(`[Migration] Migrated ${incidents.length} records to IndexedDB`)
    } else {
      console.log('[Migration] No records in localStorage to migrate')
    }

    // Migrate settings
    const settings = getData('SETTINGS')
    if (settings) {
      console.log('[Migration] Migrating settings...')
      for (const [key, value] of Object.entries(settings)) {
        await setSetting(key, value)
      }
      console.log('[Migration] Migrated settings to IndexedDB')
    }

    // Mark as migrated
    console.log('[Migration] Setting migration flag...')
    markMigrated()

    // Clear localStorage incidents (keep settings as backup)
    clearData('INCIDENTS')

    console.log('[Migration] Migration complete!')
    return { success: true, recordsMigrated: incidents.length }
  } catch (error) {
    console.error('[Migration] CRITICAL ERROR during migration:', error)
    console.error('[Migration] Error stack:', error.stack)
    return { success: false, error: error.message }
  }
}

// ============================================
// UNIFIED STORAGE API
// ============================================

/**
 * Load all incidents (from IndexedDB or localStorage)
 */
export const loadIncidents = async () => {
  console.log('[Storage] loadIncidents() called')
  try {
    // Try IndexedDB first
    const useIDB = await shouldUseIndexedDB()
    console.log(`[Storage] Using IndexedDB: ${useIDB}`)

    if (useIDB) {
      // Run migration if needed
      console.log('[Storage] Running migration check...')
      await migrateToIndexedDB()

      console.log('[Storage] Fetching records from IndexedDB...')
      const records = await getAllRecords()
      console.log(`[Storage] Successfully loaded ${records.length} records from IndexedDB`)
      return records
    }

    // Fallback to localStorage
    console.log('[Storage] Falling back to localStorage')
    const localData = getData('INCIDENTS') || []
    console.log(`[Storage] Loaded ${localData.length} records from localStorage`)
    return localData
  } catch (error) {
    console.error('[Storage] CRITICAL ERROR loading incidents:', error)
    console.error('[Storage] Error stack:', error.stack)
    // Final fallback
    console.log('[Storage] Attempting final fallback to localStorage')
    const fallbackData = getData('INCIDENTS') || []
    console.log(`[Storage] Fallback loaded ${fallbackData.length} records`)
    return fallbackData
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
    console.error('Error saving incidents:', error)
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
  console.log(`[Storage] saveIncidentsWithFile() called - ${incidents.length} records, file: ${fileInfo.fileName}`)
  try {
    const useIDB = await shouldUseIndexedDB()
    console.log(`[Storage] Using IndexedDB for save: ${useIDB}`)

    if (useIDB) {
      // Create file record
      console.log('[Storage] Creating file record in IndexedDB...')
      const fileId = await createFile({
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize || 0,
        fileHash: fileInfo.fileHash || null,
        recordCount: incidents.length,
        status: 'active'
      })
      console.log(`[Storage] File record created with ID: ${fileId}`)

      // Add records with file reference
      console.log(`[Storage] Adding ${incidents.length} records to IndexedDB...`)
      await addRecords(incidents, fileId)
      console.log(`[Storage] Successfully saved ${incidents.length} records with fileId: ${fileId}`)

      return { fileId, recordCount: incidents.length }
    }

    // Fallback: append to localStorage
    console.log('[Storage] Using localStorage fallback for save')
    const existing = getData('INCIDENTS') || []
    saveData('INCIDENTS', [...existing, ...incidents])
    console.log(`[Storage] Saved to localStorage. Total: ${existing.length + incidents.length} records`)
    return { fileId: null, recordCount: incidents.length }
  } catch (error) {
    console.error('[Storage] CRITICAL ERROR saving incidents with file:', error)
    console.error('[Storage] Error stack:', error.stack)
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
    console.error('Error checking file hash:', error)
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
    console.error('Error getting imported files:', error)
    return []
  }
}

/**
 * Delete a file and all its records
 * @param {number} fileId
 */
export const deleteImportedFile = async (fileId) => {
  try {
    if (await shouldUseIndexedDB()) {
      return await idbDeleteFile(fileId)
    }
    // Not supported in localStorage
    return { deletedRecords: 0 }
  } catch (error) {
    console.error('Error deleting file:', error)
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
    console.error('Error getting storage statistics:', error)
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
    if (await shouldUseIndexedDB()) {
      return await idbExportAllData()
    }

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      projects: getData('PROJECTS') || [],
      incidents: getData('INCIDENTS') || [],
      engagements: getData('ENGAGEMENTS') || [],
      compliance: getData('COMPLIANCE') || [],
      settings: getData('SETTINGS') || {},
    }
  } catch (error) {
    console.error('Error exporting data:', error)
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
    console.error('Error importing data:', error)
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
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
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
    console.error('Error saving settings to IndexedDB:', error)
  }
}
