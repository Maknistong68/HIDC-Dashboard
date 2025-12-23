// LocalStorage keys
const STORAGE_KEYS = {
  PROJECTS: 'hse_projects',
  INCIDENTS: 'hse_incidents',
  ENGAGEMENTS: 'hse_engagements',
  COMPLIANCE: 'hse_compliance',
  SETTINGS: 'hse_settings',
}

// Get data from localStorage
export const getData = (key) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key])
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return null
  }
}

// Save data to localStorage
export const saveData = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
    return false
  }
}

// Clear specific data
export const clearData = (key) => {
  try {
    localStorage.removeItem(STORAGE_KEYS[key])
    return true
  } catch (error) {
    console.error(`Error clearing ${key} from localStorage:`, error)
    return false
  }
}

// Clear all data
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('Error clearing all data:', error)
    return false
  }
}

// Export all data to JSON
export const exportAllData = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    projects: getData('PROJECTS') || [],
    incidents: getData('INCIDENTS') || [],
    engagements: getData('ENGAGEMENTS') || [],
    compliance: getData('COMPLIANCE') || [],
    settings: getData('SETTINGS') || {},
  }
  return data
}

// Import data from JSON
export const importAllData = (data) => {
  try {
    if (!data.version) {
      throw new Error('Invalid data format: missing version')
    }

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

// Download JSON file
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

// Read JSON file
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
