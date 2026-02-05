/**
 * IndexedDB Storage Layer for HSE Dashboard
 *
 * Provides enterprise-grade storage for 60,000+ records across multiple files.
 * Replaces localStorage (5-10MB limit) with IndexedDB (unlimited).
 *
 * Database Schema:
 * - files: File metadata (id, fileName, fileSize, importedAt, recordCount, status)
 * - records: All incident records with fileId link
 * - settings: App settings (key-value store)
 */

import { openDB } from 'idb'

const DB_NAME = 'hse_dashboard'
const DB_VERSION = 2

// Database schema definition
const STORES = {
  FILES: 'files',
  RECORDS: 'records',
  SETTINGS: 'settings'
}

// Initialize and upgrade database
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Files store - metadata about imported files
      if (!db.objectStoreNames.contains(STORES.FILES)) {
        const fileStore = db.createObjectStore(STORES.FILES, {
          keyPath: 'id',
          autoIncrement: true
        })
        fileStore.createIndex('fileName', 'fileName', { unique: false })
        fileStore.createIndex('importedAt', 'importedAt', { unique: false })
        fileStore.createIndex('status', 'status', { unique: false })
        fileStore.createIndex('fileHash', 'fileHash', { unique: false })
      }

      // Version 2: Add fileHash index to existing files store
      if (oldVersion < 2 && db.objectStoreNames.contains(STORES.FILES)) {
        const fileStore = transaction.objectStore(STORES.FILES)
        if (!fileStore.indexNames.contains('fileHash')) {
          fileStore.createIndex('fileHash', 'fileHash', { unique: false })
        }
      }

      // Records store - all incident records
      if (!db.objectStoreNames.contains(STORES.RECORDS)) {
        const recordStore = db.createObjectStore(STORES.RECORDS, {
          keyPath: 'id'
        })
        // Indexes for efficient querying
        recordStore.createIndex('fileId', 'fileId', { unique: false })
        recordStore.createIndex('externalId', 'externalId', { unique: false })
        recordStore.createIndex('date', 'date', { unique: false })
        recordStore.createIndex('contractor', 'contractor', { unique: false })
        recordStore.createIndex('site', 'site', { unique: false })
        recordStore.createIndex('type', 'type', { unique: false })
        recordStore.createIndex('location', 'location', { unique: false }) // hazard category
        recordStore.createIndex('actionStatus', 'actionStatus', { unique: false })
        // Compound index for common queries
        recordStore.createIndex('contractor_site', ['contractor', 'site'], { unique: false })
      }

      // Settings store - app configuration
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
}

// Singleton DB instance
let dbInstance = null
let dbInitPromise = null

const getDB = async () => {
  // If we have a valid connection, verify it's still usable
  if (dbInstance) {
    try {
      // Test if connection is still valid by checking if we can start a transaction
      // This will throw if the connection is closing or closed
      const testTx = dbInstance.transaction(STORES.SETTINGS, 'readonly')
      testTx.abort() // Immediately abort - we just wanted to test
      return dbInstance
    } catch (error) {
      // Connection is stale or closing, reset it
      console.warn('[IndexedDB] Connection stale, reconnecting...', error.message)
      dbInstance = null
      dbInitPromise = null
    }
  }

  // Prevent multiple simultaneous init attempts
  if (dbInitPromise) {
    return dbInitPromise
  }

  dbInitPromise = initDB().then(db => {
    dbInstance = db
    dbInitPromise = null
    return db
  }).catch(error => {
    dbInitPromise = null
    throw error
  })

  return dbInitPromise
}

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Create a new file record
 * @param {Object} fileData - { fileName, fileSize, recordCount, status, fileHash }
 * @returns {Promise<number>} - The generated file ID
 */
export const createFile = async (fileData) => {
  const db = await getDB()
  const file = {
    ...fileData,
    importedAt: new Date().toISOString(),
    status: fileData.status || 'active'
  }
  const id = await db.add(STORES.FILES, file)
  return id
}

/**
 * Get all files
 * @returns {Promise<Array>}
 */
export const getAllFiles = async () => {
  const db = await getDB()
  return db.getAll(STORES.FILES)
}

/**
 * Get file by ID
 * @param {number} id
 * @returns {Promise<Object|undefined>}
 */
export const getFileById = async (id) => {
  const db = await getDB()
  return db.get(STORES.FILES, id)
}

/**
 * Update file metadata
 * @param {number} id
 * @param {Object} updates
 */
export const updateFile = async (id, updates) => {
  const db = await getDB()
  const file = await db.get(STORES.FILES, id)
  if (file) {
    await db.put(STORES.FILES, { ...file, ...updates })
  }
}

/**
 * Delete a file and all its associated records
 * @param {number} fileId
 * @returns {Promise<{ deletedRecords: number }>}
 */
export const deleteFile = async (fileId) => {
  const db = await getDB()
  const tx = db.transaction([STORES.FILES, STORES.RECORDS], 'readwrite')

  // Get all records for this file
  const records = await tx.objectStore(STORES.RECORDS).index('fileId').getAll(fileId)

  // Delete all records
  for (const record of records) {
    await tx.objectStore(STORES.RECORDS).delete(record.id)
  }

  // Delete the file
  await tx.objectStore(STORES.FILES).delete(fileId)

  await tx.done

  return { deletedRecords: records.length }
}

/**
 * Get file by hash (for duplicate file detection)
 * @param {string} hash - The SHA-256 hash of the file
 * @returns {Promise<Object|undefined>} - The file record if found
 */
export const getFileByHash = async (hash) => {
  const db = await getDB()
  const index = db.transaction(STORES.FILES).store.index('fileHash')
  return index.get(hash)
}

/**
 * Get file record counts (for display)
 * @returns {Promise<Map<number, number>>} - Map of fileId to record count
 */
export const getFileRecordCounts = async () => {
  const db = await getDB()
  const records = await db.getAll(STORES.RECORDS)

  const counts = new Map()
  for (const record of records) {
    if (record.fileId) {
      counts.set(record.fileId, (counts.get(record.fileId) || 0) + 1)
    }
  }

  return counts
}

// ============================================
// RECORD OPERATIONS
// ============================================

/**
 * Add multiple records in a single transaction
 * @param {Array} records - Array of record objects
 * @param {number} fileId - The file ID to associate records with
 * @returns {Promise<Array<string>>} - Array of generated IDs
 */
export const addRecords = async (records, fileId) => {
  const db = await getDB()
  const tx = db.transaction(STORES.RECORDS, 'readwrite')
  const ids = []

  for (const record of records) {
    const recordWithFile = {
      ...record,
      fileId,
      id: record.id || generateRecordId()
    }
    await tx.store.put(recordWithFile)
    ids.push(recordWithFile.id)
  }

  await tx.done
  return ids
}

/**
 * Get all records
 * @returns {Promise<Array>}
 */
export const getAllRecords = async () => {
  const db = await getDB()
  return db.getAll(STORES.RECORDS)
}

/**
 * Get records by file ID
 * @param {number} fileId
 * @returns {Promise<Array>}
 */
export const getRecordsByFileId = async (fileId) => {
  const db = await getDB()
  return db.getAllFromIndex(STORES.RECORDS, 'fileId', fileId)
}

/**
 * Get records with pagination (for lazy loading)
 * @param {number} offset - Starting index
 * @param {number} limit - Number of records to fetch
 * @returns {Promise<{ records: Array, total: number }>}
 */
export const getRecordsPaginated = async (offset = 0, limit = 1000) => {
  const db = await getDB()
  const tx = db.transaction(STORES.RECORDS, 'readonly')
  const store = tx.store

  const total = await store.count()
  const records = []

  let cursor = await store.openCursor()
  let skipped = 0

  while (cursor && records.length < limit) {
    if (skipped >= offset) {
      records.push(cursor.value)
    } else {
      skipped++
    }
    cursor = await cursor.continue()
  }

  return { records, total }
}

/**
 * Get record by ID
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
export const getRecordById = async (id) => {
  const db = await getDB()
  return db.get(STORES.RECORDS, id)
}

/**
 * Update a single record
 * @param {string} id
 * @param {Object} updates
 */
export const updateRecord = async (id, updates) => {
  const db = await getDB()
  const record = await db.get(STORES.RECORDS, id)
  if (record) {
    await db.put(STORES.RECORDS, { ...record, ...updates })
  }
}

/**
 * Update multiple records in batch
 * @param {Array<{id: string, updates: Object}>} updatesList
 */
export const updateRecordsBatch = async (updatesList) => {
  const db = await getDB()
  const tx = db.transaction(STORES.RECORDS, 'readwrite')

  for (const { id, updates } of updatesList) {
    const record = await tx.store.get(id)
    if (record) {
      await tx.store.put({ ...record, ...updates })
    }
  }

  await tx.done
}

/**
 * Delete a single record
 * @param {string} id
 */
export const deleteRecord = async (id) => {
  const db = await getDB()
  await db.delete(STORES.RECORDS, id)
}

/**
 * Delete multiple records by IDs
 * @param {Array<string>} ids
 */
export const deleteRecordsBatch = async (ids) => {
  const db = await getDB()
  const tx = db.transaction(STORES.RECORDS, 'readwrite')

  for (const id of ids) {
    await tx.store.delete(id)
  }

  await tx.done
}

/**
 * Delete all records for a file
 * @param {number} fileId
 * @returns {Promise<number>} - Number of deleted records
 */
export const deleteRecordsByFileId = async (fileId) => {
  const db = await getDB()
  const tx = db.transaction(STORES.RECORDS, 'readwrite')
  const index = tx.store.index('fileId')

  let cursor = await index.openCursor(fileId)
  let deletedCount = 0

  while (cursor) {
    await cursor.delete()
    deletedCount++
    cursor = await cursor.continue()
  }

  await tx.done
  return deletedCount
}

/**
 * Replace all records for a file (for file replacement feature)
 * @param {number} fileId
 * @param {Array} newRecords
 * @returns {Promise<{ deleted: number, added: number }>}
 */
export const replaceFileRecords = async (fileId, newRecords) => {
  const db = await getDB()
  const tx = db.transaction(STORES.RECORDS, 'readwrite')
  const index = tx.store.index('fileId')

  // Delete existing records for this file
  let cursor = await index.openCursor(fileId)
  let deletedCount = 0

  while (cursor) {
    await cursor.delete()
    deletedCount++
    cursor = await cursor.continue()
  }

  // Add new records
  for (const record of newRecords) {
    const recordWithFile = {
      ...record,
      fileId,
      id: record.id || generateRecordId()
    }
    await tx.store.put(recordWithFile)
  }

  await tx.done

  return { deleted: deletedCount, added: newRecords.length }
}

/**
 * Check for duplicate records by externalId
 * @param {Array<string>} externalIds
 * @returns {Promise<Set<string>>} - Set of existing external IDs
 */
export const checkDuplicateExternalIds = async (externalIds) => {
  const db = await getDB()
  const index = db.transaction(STORES.RECORDS, 'readonly').store.index('externalId')

  const existing = new Set()

  for (const externalId of externalIds) {
    const record = await index.get(externalId)
    if (record) {
      existing.add(externalId)
    }
  }

  return existing
}

/**
 * Get total record count
 * @returns {Promise<number>}
 */
export const getRecordCount = async () => {
  const db = await getDB()
  return db.count(STORES.RECORDS)
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

/**
 * Get a setting value
 * @param {string} key
 * @returns {Promise<any>}
 */
export const getSetting = async (key) => {
  const db = await getDB()
  const setting = await db.get(STORES.SETTINGS, key)
  return setting?.value
}

/**
 * Set a setting value
 * @param {string} key
 * @param {any} value
 */
export const setSetting = async (key, value) => {
  const db = await getDB()
  await db.put(STORES.SETTINGS, { key, value })
}

/**
 * Get all settings
 * @returns {Promise<Object>}
 */
export const getAllSettings = async () => {
  const db = await getDB()
  const settings = await db.getAll(STORES.SETTINGS)
  return settings.reduce((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {})
}

/**
 * Clear a setting
 * @param {string} key
 */
export const clearSetting = async (key) => {
  const db = await getDB()
  await db.delete(STORES.SETTINGS, key)
}

// ============================================
// REPORTER EXCLUSION
// ============================================

/**
 * Get excluded reporters list
 * @returns {Promise<Array<string>>} - Array of excluded reporter names
 */
export const getExcludedReporters = async () => {
  const reporters = await getSetting('excludedReporters')
  return reporters || []
}

/**
 * Set excluded reporters list
 * @param {Array<string>} reporters - Array of reporter names to exclude
 */
export const setExcludedReporters = async (reporters) => {
  await setSetting('excludedReporters', reporters)
}

// ============================================
// MIGRATION & UTILITIES
// ============================================

/**
 * Check if IndexedDB is supported and working
 * @returns {Promise<boolean>}
 */
export const isIndexedDBSupported = async () => {
  try {
    if (!window.indexedDB) return false
    await getDB()
    return true
  } catch {
    return false
  }
}

/**
 * Get storage usage statistics
 * @returns {Promise<Object>}
 */
export const getStorageStats = async () => {
  const db = await getDB()

  const fileCount = await db.count(STORES.FILES)
  const recordCount = await db.count(STORES.RECORDS)

  // Estimate storage size (rough calculation)
  let estimatedSize = 0

  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    estimatedSize = estimate.usage || 0
  }

  return {
    fileCount,
    recordCount,
    estimatedSize,
    estimatedSizeMB: (estimatedSize / 1024 / 1024).toFixed(2)
  }
}

/**
 * Clear all data from all stores
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  const db = await getDB()
  const tx = db.transaction([STORES.FILES, STORES.RECORDS, STORES.SETTINGS], 'readwrite')

  await tx.objectStore(STORES.FILES).clear()
  await tx.objectStore(STORES.RECORDS).clear()
  await tx.objectStore(STORES.SETTINGS).clear()

  await tx.done
}

/**
 * Export all data to JSON (for backup)
 * @returns {Promise<Object>}
 */
export const exportAllData = async () => {
  const db = await getDB()

  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    files: await db.getAll(STORES.FILES),
    records: await db.getAll(STORES.RECORDS),
    settings: await db.getAll(STORES.SETTINGS)
  }
}

/**
 * Import data from JSON backup
 * @param {Object} data
 * @returns {Promise<{ files: number, records: number }>}
 */
export const importAllData = async (data) => {
  const db = await getDB()
  const tx = db.transaction([STORES.FILES, STORES.RECORDS, STORES.SETTINGS], 'readwrite')

  // Import files
  let fileCount = 0
  if (data.files) {
    for (const file of data.files) {
      await tx.objectStore(STORES.FILES).put(file)
      fileCount++
    }
  }

  // Import records
  let recordCount = 0
  if (data.records) {
    for (const record of data.records) {
      await tx.objectStore(STORES.RECORDS).put(record)
      recordCount++
    }
  }

  // Import settings
  if (data.settings) {
    for (const setting of data.settings) {
      await tx.objectStore(STORES.SETTINGS).put(setting)
    }
  }

  await tx.done

  return { files: fileCount, records: recordCount }
}

/**
 * Generate a unique record ID
 * @returns {string}
 */
const generateRecordId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Export constants for external use
export { DB_NAME, DB_VERSION, STORES }
