import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  loadIncidents,
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
  getContractorClassifications,
  setContractorClassification
} from '../utils/indexedDBStorage'
import { generateId } from '../utils/calculations'
import { categorizeForImport, runBackgroundCategorization } from '../utils/categorizationManager'
import { clearAllCaches, clearDataCaches } from '../utils/memoizedCalculations'
import { useLoading } from './LoadingContext'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

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
  const [contractorClassifications, setContractorClassifications] = useState({})

  // Global loading overlay
  const { startLoading, updateProgress, finishLoading } = useLoading()

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
      console.error('[DataContext] Error reloading incidents:', error)
    } finally {
      finishLoading()
    }
  }, [startLoading, updateProgress, finishLoading])

  // Reload files list
  const reloadFiles = useCallback(async () => {
    startLoading('Reloading files...')
    try {
      updateProgress(30)
      const fileList = await getImportedFiles()
      setFiles(fileList)
      updateProgress(70)

      // Update storage stats
      const stats = await getStorageStatistics()
      setStorageStats(stats)
      updateProgress(100)
    } catch (error) {
      console.error('[DataContext] Error reloading files:', error)
    } finally {
      finishLoading()
    }
  }, [startLoading, updateProgress, finishLoading])

  // Load all data from storage
  const loadData = useCallback(async () => {
    setIsLoading(true)
    startLoading('Loading data...')
    try {
      updateProgress(10)
      // Load incidents from IndexedDB (with localStorage fallback)
      const storedIncidents = await loadIncidents()

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

      // Load contractor classifications
      const classifications = await getContractorClassifications()
      setContractorClassifications(classifications)
      updateProgress(90)

      console.log(`[DataContext] Loaded ${validIncidents.length} incidents from ${fileList.length} files`)

      updateProgress(100)

      // Run background categorization if needed (non-blocking)
      runBackgroundCategorization(
        (processed, total) => {
          setCategorizationProgress({ processed, total })
        },
        (result) => {
          if (result.updated > 0) {
            console.log(`[DataContext] Background categorization updated ${result.updated} records`)
            // Reload incidents to get updated categories (silent - no overlay)
            getAllRecords().then(records => {
              setIncidents(Array.isArray(records) ? records : [])
            }).catch(console.error)
          }
          setCategorizationProgress(null)
        }
      ).catch(console.error)

    } catch (error) {
      console.error('[DataContext] Error loading data:', error)
      setIncidents([])
      setFiles([])
    } finally {
      setIsLoading(false)
      finishLoading()
    }
  }, [startLoading, updateProgress, finishLoading])

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

    // Note: For single additions without file context, we just update state
    // The record will be persisted on next full save or through addIncidentsWithFile
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

      // Clear data caches since data changed (keep normalization caches)
      clearDataCaches()

      // Incremental state update: merge new records directly instead of full reload
      // This avoids fetching all records from IndexedDB after every import
      // IMPORTANT: Add fileId to each incident so timeline visualization works
      const incidentsWithFileId = incidentsWithIds.map(incident => ({
        ...incident,
        fileId: result.fileId
      }))
      setIncidents(prev => [...prev, ...incidentsWithFileId])

      // Skip reload during batch operations to prevent overlapping IndexedDB transactions
      // The caller (BatchImportModal) will call reloadFiles() once at the end
      if (!importOptions.skipReload) {
        // Only reload files list (lightweight) to update the file management UI
        await reloadFiles()

        // Update storage stats in background
        getStorageStatistics().then(stats => setStorageStats(stats)).catch(console.error)
      }

      return {
        fileId: result.fileId,
        recordCount: result.recordCount,
        incidents: incidentsWithIds
      }
    } catch (error) {
      console.error('[DataContext] Error adding incidents with file:', error)
      throw error
    }
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
      console.error('[DataContext] Error updating record in IndexedDB:', error)
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
        console.error('[DataContext] Error updating record in IndexedDB:', error)
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
      console.error('[DataContext] Error deleting record from IndexedDB:', error)
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

      console.log(`[DataContext] Deleted file ${fileId} with ${result.deletedRecords} records`)
      return result
    } catch (error) {
      console.error('[DataContext] Error deleting file:', error)
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

      console.log(`[DataContext] Replaced file ${fileId}: ${result.deleted} deleted, ${result.added} added`)
      return result
    } catch (error) {
      console.error('[DataContext] Error replacing file:', error)
      throw error
    }
  }, [])

  // Get file by ID
  const getFile = useCallback(async (fileId) => {
    try {
      return await getFileById(fileId)
    } catch (error) {
      console.error('[DataContext] Error getting file:', error)
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
      console.log('[DataContext] All data cleared')
    } catch (error) {
      console.error('[DataContext] Error clearing data:', error)
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
  // CONTRACTOR CLASSIFICATION
  // ============================================

  // Update contractor classification
  const updateContractorClassification = useCallback(async (name, subRegion) => {
    try {
      await setContractorClassification(name, subRegion)
      // Update local state
      setContractorClassifications(prev => {
        const updated = { ...prev }
        if (subRegion) {
          updated[name] = subRegion
        } else {
          delete updated[name]
        }
        return updated
      })
    } catch (error) {
      console.error('[DataContext] Error updating contractor classification:', error)
      throw error
    }
  }, [])

  // Get enriched contractors with sub-regions and record counts
  const getEnrichedContractors = useCallback(() => {
    const contractorMap = new Map()

    for (const incident of incidents) {
      const contractor = incident.contractor || 'Unknown'
      if (!contractorMap.has(contractor)) {
        contractorMap.set(contractor, {
          name: contractor,
          recordCount: 0,
          subRegion: contractorClassifications[contractor] || ''
        })
      }
      contractorMap.get(contractor).recordCount++
    }

    return Array.from(contractorMap.values())
  }, [incidents, contractorClassifications])

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
  // CONTEXT VALUE (Memoized to prevent unnecessary re-renders)
  // ============================================

  const value = useMemo(() => ({
    // Data
    projects,
    incidents,
    files,
    isLoading,
    importWarnings,
    lastImportStats,
    showOpenClosed,
    setShowOpenClosed,
    storageStats,
    categorizationProgress,
    contractorClassifications,

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

    // Contractor classification
    updateContractorClassification,
    getEnrichedContractors,

    // Import tracking
    recordImportWarnings,
    clearImportWarnings,
    recordImportStats,
  }), [
    projects,
    incidents,
    files,
    isLoading,
    importWarnings,
    lastImportStats,
    showOpenClosed,
    storageStats,
    categorizationProgress,
    contractorClassifications,
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
    updateContractorClassification,
    getEnrichedContractors,
    recordImportWarnings,
    clearImportWarnings,
    recordImportStats,
  ])

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
