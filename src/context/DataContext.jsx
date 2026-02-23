import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react'
import {
  loadIncidentsChunked,
  saveIncidentsWithFile,
  getImportedFiles,
  deleteImportedFile,
  clearAllData as storageClearAll,
  getStorageStatistics
} from '../utils/storage'
import {
  getAllRecords,
  addRecords,
  updateRecord,
  deleteRecord,
  replaceFileRecords,
  updateFile,
  getFileById,
  getSiteClassifications,
  setSiteClassification,
  setSiteClassificationsBatch
} from '../utils/indexedDBStorage'
import { generateId } from '../utils/calculations'
import { categorizeForImport, runBackgroundCategorization } from '../utils/categorizationManager'
import { clearAllCaches, clearDataCaches } from '../utils/memoizedCalculations'
import { useLoading } from './LoadingContext'

// ============================================
// THREE SEPARATE CONTEXTS
// ============================================

// DataStateContext: incidents, files, siteClassifications, isLoading, storageStats, etc.
const DataStateContext = createContext(null)

// UIStateContext: showOpenClosed, isImporting, isProcessingBatch, hasData
const UIStateContext = createContext(null)

// DataActionsContext: all callbacks (stable references)
const DataActionsContext = createContext(null)

// ============================================
// SELECTIVE HOOKS
// ============================================

/**
 * useDataState - Access data state (incidents, files, etc.)
 * Components using this re-render when data changes, but NOT on UI toggles
 */
export const useDataState = () => {
  const context = useContext(DataStateContext)
  if (!context) {
    throw new Error('useDataState must be used within a DataProvider')
  }
  return context
}

/**
 * useUIState - Access UI state (showOpenClosed, isImporting, hasData)
 * Components using this re-render on UI toggles, but NOT on data changes
 */
export const useUIState = () => {
  const context = useContext(UIStateContext)
  if (!context) {
    throw new Error('useUIState must be used within a DataProvider')
  }
  return context
}

/**
 * useDataActions - Access action callbacks (stable references, no re-renders)
 */
export const useDataActions = () => {
  const context = useContext(DataActionsContext)
  if (!context) {
    throw new Error('useDataActions must be used within a DataProvider')
  }
  return context
}

/**
 * useData - Backward-compatible combined hook
 * Returns all state + actions in a single object (same as before the split)
 */
export const useData = () => {
  const dataState = useDataState()
  const uiState = useUIState()
  const actions = useDataActions()

  return useMemo(() => ({
    ...dataState,
    ...uiState,
    ...actions,
  }), [dataState, uiState, actions])
}

// ============================================
// PROVIDER
// ============================================

export const DataProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [incidents, setIncidents] = useState([])
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [importWarnings, setImportWarnings] = useState(null)
  const [lastImportStats, setLastImportStats] = useState(null)
  const [showOpenClosed, setShowOpenClosed] = useState(false)
  const [storageStats, setStorageStats] = useState(null)
  const [categorizationProgress, setCategorizationProgress] = useState(null)
  const [siteClassifications, setSiteClassifications] = useState({})
  const [isImporting, setIsImporting] = useState(false)
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)

  // Global loading overlay
  const { startLoading, updateProgress, updateMessage, finishLoading } = useLoading()
  const setMessage = updateMessage

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Reload incidents from storage
  const reloadIncidents = useCallback(async () => {
    startLoading('Reloading incidents...')
    try {
      updateProgress(20)
      // Clear data caches before reloading (keep normalization caches)
      clearDataCaches()

      const records = await getAllRecords()
      updateProgress(60)
      setIncidents(Array.isArray(records) ? records : [])

      // Update storage stats
      const stats = await getStorageStatistics()
      setStorageStats(stats)
      updateProgress(100)
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error reloading incidents:', error)
    } finally {
      finishLoading()
    }
  }, [startLoading, updateProgress, finishLoading])

  // Reload files list
  // Use { silent: true } to skip showing the global loading overlay (e.g., during batch import)
  const reloadFiles = useCallback(async (options = {}) => {
    const { silent = false } = options

    if (!silent) {
      startLoading('Reloading files...')
    }
    try {
      if (!silent) updateProgress(30)
      const fileList = await getImportedFiles()
      setFiles(fileList)
      if (!silent) updateProgress(70)

      // Update storage stats
      const stats = await getStorageStatistics()
      setStorageStats(stats)
      if (!silent) updateProgress(100)
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error reloading files:', error)
    } finally {
      if (!silent) {
        finishLoading()
      }
    }
  }, [startLoading, updateProgress, finishLoading])

  // Load all data from storage
  const loadData = useCallback(async () => {
    setIsLoading(true)
    startLoading('Loading data...')
    try {
      updateProgress(10)
      // Load incidents from IndexedDB in chunks (prevents main-thread blocking)
      const storedIncidents = await loadIncidentsChunked((loaded, total) => {
        // Map chunk progress to 10-40% of the overall bar
        const chunkPercent = total > 0 ? (loaded / total) : 1
        updateProgress(10 + Math.round(chunkPercent * 30))
        setMessage(`Loading records... ${loaded.toLocaleString()} of ${total.toLocaleString()}`)
      })

      // Ensure it's an array
      const validIncidents = Array.isArray(storedIncidents) ? storedIncidents : []
      updateProgress(40)

      setIncidents(validIncidents)

      // Load file list
      const fileList = await getImportedFiles()
      setFiles(fileList)
      updateProgress(70)

      // Get storage statistics
      const stats = await getStorageStatistics()
      setStorageStats(stats)
      updateProgress(85)

      // Load site classifications
      const classifications = await getSiteClassifications()
      setSiteClassifications(classifications)
      updateProgress(90)

      updateProgress(100)

      // Run background categorization if needed (non-blocking)
      runBackgroundCategorization(
        (processed, total) => {
          setCategorizationProgress({ processed, total })
        },
        (result) => {
          if (result.updated > 0) {
            // Reload incidents to get updated categories (silent - no overlay)
            // Wrapped in startTransition so the UI stays responsive during refresh
            getAllRecords().then(records => {
              startTransition(() => {
                clearDataCaches()
                setIncidents(Array.isArray(records) ? records : [])
              })
            }).catch(err => {
              if (import.meta.env.DEV) console.error('[DataContext] Error reloading after categorization:', err)
            })
          }
          setCategorizationProgress(null)
        }
      ).catch(err => {
        if (import.meta.env.DEV) console.error('[DataContext] Background categorization error:', err)
      })

    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error loading data:', error)
      setIncidents([])
      setFiles([])
    } finally {
      setIsLoading(false)
      finishLoading()
    }
  }, [startLoading, updateProgress, setMessage, finishLoading])

  // Project CRUD
  const addProject = useCallback((project) => {
    const newProject = { ...project, id: generateId() }
    setProjects(prev => [...prev, newProject])
    return newProject
  }, [])

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setIncidents(prev => prev.filter(i => i.projectId !== id))
  }, [])

  // Get project by ID
  const getProjectById = useCallback((id) => {
    return projects.find(p => p.id === id)
  }, [projects])

  // ============================================
  // INCIDENT OPERATIONS
  // ============================================

  // Add single incident (legacy support)
  const addIncident = useCallback(async (incident) => {
    const newIncident = {
      ...incident,
      id: incident.id || generateId()
    }

    // Update state immediately
    setIncidents(prev => [...prev, newIncident])

    return newIncident
  }, [])

  // Add multiple incidents with file tracking (main import method)
  // Set importOptions.skipReload = true during batch operations to prevent overlapping transactions
  const addIncidentsWithFile = useCallback(async (newIncidents, fileInfo, importOptions = {}) => {
    try {
      // Apply categorization with the import mode
      const mode = importOptions.classificationMode || 'trust-excel'
      const categorizedIncidents = categorizeForImport(newIncidents, mode)

      // Assign IDs if needed
      const incidentsWithIds = categorizedIncidents.map(incident => ({
        ...incident,
        id: incident.id || generateId()
      }))

      // Save to IndexedDB with file tracking
      const result = await saveIncidentsWithFile(incidentsWithIds, {
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize || 0,
        fileHash: fileInfo.fileHash || null
      })

      // When skipStateUpdate is true (batch import), skip cache clearing and state updates
      // The caller will do a single batchReloadIncidents() after all files are processed
      if (!importOptions.skipStateUpdate) {
        // Clear data caches since data changed (keep normalization caches)
        clearDataCaches()

        // Incremental state update: merge new records directly instead of full reload
        const incidentsWithFileId = incidentsWithIds.map(incident => ({
          ...incident,
          fileId: result.fileId
        }))
        setIncidents(prev => [...prev, ...incidentsWithFileId])
      }

      // Skip reload during batch operations to prevent overlapping IndexedDB transactions
      if (!importOptions.skipReload) {
        // Only reload files list (lightweight) to update the file management UI
        await reloadFiles()

        // Update storage stats in background
        getStorageStatistics().then(stats => setStorageStats(stats)).catch(err => {
          if (import.meta.env.DEV) console.error('[DataContext] Error getting storage stats:', err)
        })
      }

      return {
        fileId: result.fileId,
        recordCount: result.recordCount,
        incidents: incidentsWithIds
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] CRITICAL ERROR in addIncidentsWithFile:', error)
      throw error
    }
  }, [reloadFiles])

  // Batch reload - single cache clear + state update after batch import
  // Must be synchronous (no startTransition) so setIncidents commits before
  // handleDone() calls setIsProcessingBatch(false), otherwise App.jsx guard
  // sees incidents.length=0 + isProcessingBatch=false and shows empty Layout
  // NOTE: Worker warming is now handled by precomputeAllData() in the calculation gate
  const batchReloadIncidents = useCallback(async () => {
    clearDataCaches()
    const records = await getAllRecords()
    const validRecords = Array.isArray(records) ? records : []
    setIncidents(validRecords)
    return validRecords
  }, [])

  // Legacy addIncidents (without file tracking)
  const addIncidents = useCallback((newIncidents) => {
    const incidentsWithIds = newIncidents.map(incident => ({
      ...incident,
      id: incident.id || generateId()
    }))
    setIncidents(prev => [...prev, ...incidentsWithIds])
    return incidentsWithIds
  }, [])

  // Update single incident
  const updateIncident = useCallback(async (id, updates) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))

    // Also update in IndexedDB
    try {
      await updateRecord(id, updates)
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error updating record in IndexedDB:', error)
    }
  }, [])

  // Update incident by Event ID
  const updateIncidentByEventId = useCallback(async (eventId, updates) => {
    let foundIncident = null

    setIncidents(prev => {
      return prev.map(i => {
        if (i.eventId === eventId) {
          foundIncident = { ...i }  // Capture before update
          return { ...i, ...updates }
        }
        return i
      })
    })

    // Use captured incident for IndexedDB update
    if (foundIncident) {
      try {
        await updateRecord(foundIncident.id, updates)
      } catch (error) {
        if (import.meta.env.DEV) console.error('[DataContext] Error updating record in IndexedDB:', error)
      }
    }
  }, [])  // No dependencies - uses functional update

  // Delete single incident
  const deleteIncident = useCallback(async (id) => {
    setIncidents(prev => prev.filter(i => i.id !== id))

    try {
      await deleteRecord(id)
      clearDataCaches()
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error deleting record from IndexedDB:', error)
    }
  }, [])

  // ============================================
  // FILE MANAGEMENT OPERATIONS
  // ============================================

  // Delete a file and all its records
  const deleteFile = useCallback(async (fileId) => {
    try {
      const result = await deleteImportedFile(fileId)

      // Clear data caches since data changed (keep normalization caches)
      clearDataCaches()

      // Reload data
      await reloadIncidents()
      await reloadFiles()

      return result
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error deleting file:', error)
      throw error
    }
  }, [])

  // Replace a file's records (for file update feature)
  const replaceFile = useCallback(async (fileId, newIncidents, importOptions = {}) => {
    try {
      // Apply categorization
      const mode = importOptions.classificationMode || 'trust-excel'
      const categorizedIncidents = categorizeForImport(newIncidents, mode)

      // Assign IDs
      const incidentsWithIds = categorizedIncidents.map(incident => ({
        ...incident,
        id: incident.id || generateId()
      }))

      // Replace in IndexedDB
      const result = await replaceFileRecords(fileId, incidentsWithIds)

      // Update file metadata
      await updateFile(fileId, {
        recordCount: incidentsWithIds.length,
        replacedAt: new Date().toISOString()
      })

      // Clear data caches (keep normalization caches)
      clearDataCaches()

      // Reload data
      await reloadIncidents()
      await reloadFiles()

      return result
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error replacing file:', error)
      throw error
    }
  }, [])

  // Get file by ID
  const getFile = useCallback(async (fileId) => {
    try {
      return await getFileById(fileId)
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error getting file:', error)
      return null
    }
  }, [])

  // Get incidents for a specific file
  const getIncidentsByFile = useCallback((fileId) => {
    return incidents.filter(i => i.fileId === fileId)
  }, [incidents])

  // ============================================
  // DATA MANAGEMENT
  // ============================================

  // Clear all data
  const clearData = useCallback(async () => {
    startLoading('Resetting application data...')
    try {
      updateProgress(10)
      await storageClearAll()
      updateProgress(40)
      setProjects([])
      setIncidents([])
      updateProgress(60)
      setFiles([])
      setStorageStats(null)
      updateProgress(80)
      clearAllCaches()
      updateProgress(100)
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error clearing data:', error)
    } finally {
      finishLoading()
    }
  }, [startLoading, updateProgress, finishLoading])

  // Export data as JSON
  const exportData = useCallback(() => {
    return {
      projects,
      incidents,
      files,
      exportedAt: new Date().toISOString()
    }
  }, [projects, incidents, files])

  // Import data from JSON
  const importData = useCallback((data) => {
    if (data.projects) setProjects(data.projects)
    if (data.incidents) setIncidents(data.incidents)
    return { success: true }
  }, [])

  // ============================================
  // SITE CLASSIFICATION
  // ============================================

  // Update site classification
  const updateSiteClassification = useCallback(async (name, subRegion) => {
    try {
      await setSiteClassification(name, subRegion)
      // Update local state
      setSiteClassifications(prev => {
        const updated = { ...prev }
        if (subRegion) {
          updated[name] = subRegion
        } else {
          delete updated[name]
        }
        return updated
      })
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error updating site classification:', error)
      throw error
    }
  }, [])

  // Bulk update site classifications
  const updateSiteClassificationsBatch = useCallback(async (assignments) => {
    try {
      await setSiteClassificationsBatch(assignments)
      // Update local state
      setSiteClassifications(prev => {
        const updated = { ...prev }
        for (const { name, subRegion } of assignments) {
          if (subRegion) {
            updated[name] = subRegion
          } else {
            delete updated[name]
          }
        }
        return updated
      })
    } catch (error) {
      if (import.meta.env.DEV) console.error('[DataContext] Error updating site classifications batch:', error)
      throw error
    }
  }, [])

  // Base site data - only recalculates when incidents change (expensive part)
  const baseSiteData = useMemo(() => {
    const siteMap = new Map()
    for (const incident of incidents) {
      const site = incident.site || 'Unknown'
      if (!siteMap.has(site)) {
        siteMap.set(site, { name: site, recordCount: 0 })
      }
      siteMap.get(site).recordCount++
    }
    return Array.from(siteMap.values())
  }, [incidents])

  // Enriched sites - cheap lookup when siteClassifications changes
  const enrichedSites = useMemo(() => {
    return baseSiteData.map(site => ({
      ...site,
      subRegion: siteClassifications[site.name] || ''
    }))
  }, [baseSiteData, siteClassifications])

  // Keep function for backward compatibility
  const getEnrichedSites = useCallback(() => enrichedSites, [enrichedSites])

  // Flag to indicate if any sites have subregion assignments
  const hasSubregionAssignments = useMemo(() => {
    return Object.keys(siteClassifications).length > 0
  }, [siteClassifications])

  // Compute assigned sub-regions (only show sub-regions that have at least one site assigned)
  const assignedSubRegions = useMemo(() => {
    const regions = new Set(Object.values(siteClassifications).filter(Boolean))
    // Import SUB_REGION_OPTIONS inline to avoid circular dependency
    const SUB_REGION_OPTIONS = [
      { value: 'SUB REGION 1', label: 'Sub Region 1' },
      { value: 'SUB REGION 2', label: 'Sub Region 2' },
      { value: 'SUB REGION 3', label: 'Sub Region 3' },
      { value: 'SUB REGION 4', label: 'Sub Region 4' },
      { value: 'SUB REGION 5', label: 'Sub Region 5' },
    ]
    return SUB_REGION_OPTIONS.filter(opt => regions.has(opt.value))
  }, [siteClassifications])

  // ============================================
  // IMPORT TRACKING
  // ============================================

  const recordImportWarnings = useCallback((warnings) => {
    setImportWarnings(warnings)
  }, [])

  const clearImportWarnings = useCallback(() => {
    setImportWarnings(null)
  }, [])

  const recordImportStats = useCallback((stats) => {
    setLastImportStats({
      ...stats,
      timestamp: new Date().toISOString()
    })
  }, [])

  // ============================================
  // CONTEXT VALUES (Split into 3)
  // ============================================

  // Data state - changes when data changes
  const dataStateValue = useMemo(() => ({
    projects,
    incidents,
    files,
    isLoading,
    importWarnings,
    lastImportStats,
    storageStats,
    categorizationProgress,
    siteClassifications,
    hasSubregionAssignments,
    assignedSubRegions,
  }), [
    projects,
    incidents,
    files,
    isLoading,
    importWarnings,
    lastImportStats,
    storageStats,
    categorizationProgress,
    siteClassifications,
    hasSubregionAssignments,
    assignedSubRegions,
  ])

  // UI state - changes on UI toggles only
  const uiStateValue = useMemo(() => ({
    showOpenClosed,
    setShowOpenClosed,
    isImporting,
    setIsImporting,
    isProcessingBatch,
    setIsProcessingBatch,
    hasData: incidents.length > 0,
  }), [showOpenClosed, isImporting, isProcessingBatch, incidents.length])

  // Actions - stable references, rarely change
  const actionsValue = useMemo(() => ({
    // Project operations
    addProject,
    updateProject,
    deleteProject,
    getProjectById,

    // Incident operations
    addIncident,
    addIncidents,
    addIncidentsWithFile,
    updateIncident,
    updateIncidentByEventId,
    deleteIncident,

    // File management operations
    deleteFile,
    replaceFile,
    getFile,
    getIncidentsByFile,

    // Data management
    exportData,
    importData,
    clearData,
    loadData,
    reloadIncidents,
    reloadFiles,
    batchReloadIncidents,

    // Site classification
    updateSiteClassification,
    updateSiteClassificationsBatch,
    getEnrichedSites,

    // Import tracking
    recordImportWarnings,
    clearImportWarnings,
    recordImportStats,
  }), [
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    addIncident,
    addIncidents,
    addIncidentsWithFile,
    updateIncident,
    updateIncidentByEventId,
    deleteIncident,
    deleteFile,
    replaceFile,
    getFile,
    getIncidentsByFile,
    exportData,
    importData,
    clearData,
    loadData,
    reloadIncidents,
    reloadFiles,
    batchReloadIncidents,
    updateSiteClassification,
    updateSiteClassificationsBatch,
    getEnrichedSites,
    recordImportWarnings,
    clearImportWarnings,
    recordImportStats,
  ])

  return (
    <DataStateContext.Provider value={dataStateValue}>
      <UIStateContext.Provider value={uiStateValue}>
        <DataActionsContext.Provider value={actionsValue}>
          {children}
        </DataActionsContext.Provider>
      </UIStateContext.Provider>
    </DataStateContext.Provider>
  )
}
