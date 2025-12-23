import React, { createContext, useContext, useState, useEffect } from 'react'
import { getData, saveData, clearAllData } from '../utils/storage'
import { generateId, recategorizeBlankHazards } from '../utils/calculations'

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
  const [isLoading, setIsLoading] = useState(true)
  const [importWarnings, setImportWarnings] = useState(null)
  const [lastImportStats, setLastImportStats] = useState(null)
  const [showOpenClosed, setShowOpenClosed] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveData('PROJECTS', projects)
    }
  }, [projects, isLoading])

  useEffect(() => {
    if (!isLoading) {
      saveData('INCIDENTS', incidents)
    }
  }, [incidents, isLoading])

  const loadData = () => {
    const storedProjects = getData('PROJECTS')
    let storedIncidents = getData('INCIDENTS') || []

    // Auto-fix blank hazard categories on load
    const hasBlankHazards = storedIncidents.some(
      i => !i.location || i.location === 'Not specified' || i.location.trim() === ''
    )
    if (hasBlankHazards && storedIncidents.length > 0) {
      storedIncidents = recategorizeBlankHazards(storedIncidents)
      saveData('INCIDENTS', storedIncidents)
    }

    setProjects(storedProjects || [])
    setIncidents(storedIncidents)
    setIsLoading(false)
  }

  // Fix blank hazard categories in existing data
  const fixBlankHazardCategories = () => {
    setIncidents(prev => {
      const fixed = recategorizeBlankHazards(prev)
      saveData('INCIDENTS', fixed)
      return fixed
    })
  }

  // Project CRUD
  const addProject = (project) => {
    const newProject = { ...project, id: generateId() }
    setProjects(prev => [...prev, newProject])
    return newProject
  }

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setIncidents(prev => prev.filter(i => i.projectId !== id))
  }

  // Incident/Observation CRUD
  const addIncident = (incident) => {
    const newIncident = { ...incident, id: generateId() }
    setIncidents(prev => [...prev, newIncident])
    return newIncident
  }

  const addIncidents = (newIncidents) => {
    const incidentsWithIds = newIncidents.map(incident => ({
      ...incident,
      id: incident.id || generateId()
    }))
    setIncidents(prev => [...prev, ...incidentsWithIds])
    return incidentsWithIds
  }

  const updateIncident = (id, updates) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const updateIncidentByEventId = (eventId, updates) => {
    setIncidents(prev => prev.map(i => i.eventId === eventId ? { ...i, ...updates } : i))
  }

  const deleteIncident = (id) => {
    setIncidents(prev => prev.filter(i => i.id !== id))
  }

  // Get project by ID
  const getProjectById = (id) => {
    return projects.find(p => p.id === id)
  }

  // Clear all data
  const clearData = () => {
    clearAllData()
    setProjects([])
    setIncidents([])
  }

  // Export data as JSON
  const exportData = () => {
    return {
      projects,
      incidents,
      exportedAt: new Date().toISOString()
    }
  }

  // Import data from JSON
  const importData = (data) => {
    if (data.projects) setProjects(data.projects)
    if (data.incidents) setIncidents(data.incidents)
    return { success: true }
  }

  // Record import warnings for display
  const recordImportWarnings = (warnings) => {
    setImportWarnings(warnings)
  }

  // Clear import warnings
  const clearImportWarnings = () => {
    setImportWarnings(null)
  }

  // Record import statistics
  const recordImportStats = (stats) => {
    setLastImportStats({
      ...stats,
      timestamp: new Date().toISOString()
    })
  }

  const value = {
    // Data
    projects,
    incidents,
    isLoading,
    importWarnings,
    lastImportStats,
    showOpenClosed,
    setShowOpenClosed,

    // Project operations
    addProject,
    updateProject,
    deleteProject,
    getProjectById,

    // Incident operations
    addIncident,
    addIncidents,
    updateIncident,
    updateIncidentByEventId,
    deleteIncident,

    // Data management
    exportData,
    importData,
    clearData,
    loadData,
    fixBlankHazardCategories,

    // Import tracking
    recordImportWarnings,
    clearImportWarnings,
    recordImportStats,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
