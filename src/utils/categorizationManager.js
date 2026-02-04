/**
 * Categorization Manager for HSE Dashboard
 *
 * Handles incremental categorization to improve performance:
 * - Tracks categorization version per record
 * - Only recategorizes NEW records on import
 * - Batch processes in chunks of 500 (non-blocking)
 *
 * Before: Load → Categorize 60,000 → Ready (minutes)
 * After: Load → Ready (instant), new imports only
 */

import { categorizeHazard } from './excelParser'
import { updateRecordsBatch, getAllRecords, getSetting, setSetting } from './indexedDBStorage'

// Current categorization algorithm version
// Increment this when classification logic changes to trigger re-categorization
export const CATEGORIZATION_VERSION = 3

// Batch size for non-blocking processing
const BATCH_SIZE = 500

// Delay between batches (ms) to keep UI responsive
const BATCH_DELAY = 10

/**
 * Get the categorization version for a record
 * @param {Object} record
 * @returns {number}
 */
export const getRecordCategorizationVersion = (record) => {
  return record._categorizationVersion || 0
}

/**
 * Check if a record needs recategorization
 * @param {Object} record
 * @returns {boolean}
 */
export const needsRecategorization = (record) => {
  return getRecordCategorizationVersion(record) < CATEGORIZATION_VERSION
}

/**
 * Categorize a single record
 * @param {Object} record
 * @param {string} mode - Classification mode: 'trust-excel' | 'reclassify-all' | 'fill-blanks'
 * @returns {Object} - Updated record with categorization
 */
export const categorizeRecord = (record, mode = 'trust-excel') => {
  const newCategory = categorizeHazard(
    record.description,
    record.originalHazardCategory || record.location,
    mode
  )

  return {
    ...record,
    location: newCategory,
    _categorizationVersion: CATEGORIZATION_VERSION,
    _categorizedAt: new Date().toISOString()
  }
}

/**
 * Categorize records in batches (non-blocking)
 * @param {Array} records - Records to categorize
 * @param {string} mode - Classification mode
 * @param {Function} onProgress - Progress callback (processed, total)
 * @returns {Promise<Array>} - Categorized records
 */
export const categorizeRecordsBatch = async (records, mode = 'trust-excel', onProgress = null) => {
  const results = []
  const total = records.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)

    // Process batch
    const categorizedBatch = batch.map(record => categorizeRecord(record, mode))
    results.push(...categorizedBatch)

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, total), total)
    }

    // Yield to UI thread
    if (i + BATCH_SIZE < total) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
    }
  }

  return results
}

/**
 * Categorize only records that need it (incremental)
 * @param {Array} records - All records
 * @param {string} mode - Classification mode
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{ updated: Array, unchanged: Array, totalUpdated: number }>}
 */
export const categorizeIncrementally = async (records, mode = 'trust-excel', onProgress = null) => {
  const needsUpdate = []
  const unchanged = []

  // Separate records that need updating
  for (const record of records) {
    if (needsRecategorization(record)) {
      needsUpdate.push(record)
    } else {
      unchanged.push(record)
    }
  }

  console.log(`[Categorization] ${needsUpdate.length} records need updating, ${unchanged.length} already current`)

  if (needsUpdate.length === 0) {
    return { updated: [], unchanged, totalUpdated: 0 }
  }

  // Categorize records that need it
  const updated = await categorizeRecordsBatch(needsUpdate, mode, onProgress)

  return {
    updated,
    unchanged,
    totalUpdated: updated.length
  }
}

/**
 * Persist categorization updates to IndexedDB
 * @param {Array} records - Records with updated categorization
 * @returns {Promise<number>} - Number of records updated
 */
export const persistCategorizationUpdates = async (records) => {
  if (records.length === 0) return 0

  const updates = records.map(record => ({
    id: record.id,
    updates: {
      location: record.location,
      _categorizationVersion: record._categorizationVersion,
      _categorizedAt: record._categorizedAt
    }
  }))

  await updateRecordsBatch(updates)
  return records.length
}

/**
 * Run background categorization update
 * Checks all records in IndexedDB and updates any that need recategorization
 * @param {Function} onProgress - Progress callback
 * @param {Function} onComplete - Completion callback
 * @returns {Promise<{ processed: number, updated: number }>}
 */
export const runBackgroundCategorization = async (onProgress = null, onComplete = null) => {
  try {
    // Check if we need to run (based on stored version)
    const lastVersion = await getSetting('lastCategorizationVersion') || 0
    if (lastVersion >= CATEGORIZATION_VERSION) {
      console.log('[Categorization] All records already at current version')
      if (onComplete) onComplete({ processed: 0, updated: 0, skipped: true })
      return { processed: 0, updated: 0, skipped: true }
    }

    console.log(`[Categorization] Starting background update (v${lastVersion} → v${CATEGORIZATION_VERSION})...`)

    // Get all records
    const records = await getAllRecords()
    const total = records.length

    if (total === 0) {
      await setSetting('lastCategorizationVersion', CATEGORIZATION_VERSION)
      if (onComplete) onComplete({ processed: 0, updated: 0 })
      return { processed: 0, updated: 0 }
    }

    // Categorize incrementally
    const { updated, totalUpdated } = await categorizeIncrementally(
      records,
      'trust-excel',
      (processed, total) => {
        if (onProgress) onProgress(processed, total)
      }
    )

    // Persist updates
    if (totalUpdated > 0) {
      await persistCategorizationUpdates(updated)
      console.log(`[Categorization] Updated ${totalUpdated} records`)
    }

    // Mark as complete
    await setSetting('lastCategorizationVersion', CATEGORIZATION_VERSION)

    const result = { processed: total, updated: totalUpdated }
    if (onComplete) onComplete(result)

    return result
  } catch (error) {
    console.error('[Categorization] Error during background update:', error)
    throw error
  }
}

/**
 * Force recategorization of all records
 * Use sparingly - mainly for testing or after major classification changes
 * @param {string} mode - Classification mode
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{ processed: number }>}
 */
export const forceRecategorizeAll = async (mode = 'reclassify-all', onProgress = null) => {
  console.log('[Categorization] Force recategorizing all records...')

  // Get all records
  const records = await getAllRecords()

  if (records.length === 0) {
    return { processed: 0 }
  }

  // Categorize all records (ignoring version)
  const categorized = await categorizeRecordsBatch(records, mode, onProgress)

  // Persist all updates
  await persistCategorizationUpdates(categorized)

  // Update version
  await setSetting('lastCategorizationVersion', CATEGORIZATION_VERSION)

  console.log(`[Categorization] Force recategorized ${categorized.length} records`)

  return { processed: categorized.length }
}

/**
 * Categorize records for import (synchronous, returns immediately)
 * This is used during the import process before saving to IndexedDB
 * @param {Array} records - Records from Excel parser
 * @param {string} mode - Classification mode
 * @returns {Array} - Categorized records ready for storage
 */
export const categorizeForImport = (records, mode = 'trust-excel') => {
  return records.map(record => ({
    ...record,
    location: categorizeHazard(
      record.description,
      record.originalHazardCategory || record.location,
      mode
    ),
    _categorizationVersion: CATEGORIZATION_VERSION,
    _categorizedAt: new Date().toISOString()
  }))
}

/**
 * Get categorization statistics
 * @param {Array} records
 * @returns {Object}
 */
export const getCategorizationStats = (records) => {
  const stats = {
    total: records.length,
    current: 0,
    outdated: 0,
    byVersion: {}
  }

  for (const record of records) {
    const version = getRecordCategorizationVersion(record)

    if (version >= CATEGORIZATION_VERSION) {
      stats.current++
    } else {
      stats.outdated++
    }

    stats.byVersion[version] = (stats.byVersion[version] || 0) + 1
  }

  return stats
}
