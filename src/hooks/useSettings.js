import { useState, useEffect, useCallback } from 'react'
import {
  defaultSettings,
  SETTINGS_STORAGE_KEY,
  mergeWithDefaults,
  getSettingValue,
  setSettingValue,
  validateSettings
} from '../utils/settingsDefaults'

// Custom hook for managing application settings
export const useSettings = () => {
  const [settings, setSettings] = useState(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && hasChanges) {
      saveSettings(settings)
      setHasChanges(false)
    }
  }, [settings, isLoaded, hasChanges])

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const merged = mergeWithDefaults(parsed)
        setSettings(merged)
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSettings(defaultSettings)
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback((settingsToSave) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }, [])

  // Update a single setting by path (e.g., 'cleanup.text.removeExtraSpaces')
  const updateSetting = useCallback((path, value) => {
    setSettings(prev => {
      const newSettings = setSettingValue(prev, path, value)
      return newSettings
    })
    setHasChanges(true)
  }, [])

  // Update an entire section (e.g., 'cleanup')
  const updateSection = useCallback((section, values) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values
      }
    }))
    setHasChanges(true)
  }, [])

  // Get a setting value by path
  const getSetting = useCallback((path) => {
    return getSettingValue(settings, path)
  }, [settings])

  // Reset all settings to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings)
    setHasChanges(true)
  }, [])

  // Reset a specific section to defaults
  const resetSection = useCallback((section) => {
    if (defaultSettings[section]) {
      setSettings(prev => ({
        ...prev,
        [section]: { ...defaultSettings[section] }
      }))
      setHasChanges(true)
    }
  }, [])

  // Export settings as JSON
  const exportSettings = useCallback(() => {
    const data = JSON.stringify(settings, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hidc-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [settings])

  // Import settings from JSON file
  const importSettings = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          const validation = validateSettings(imported)
          if (!validation.isValid) {
            reject(new Error(`Invalid settings file: ${validation.errors.join(', ')}`))
            return
          }
          const merged = mergeWithDefaults(imported)
          setSettings(merged)
          setHasChanges(true)
          resolve({ success: true, message: 'Settings imported successfully' })
        } catch (error) {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    })
  }, [])

  // Check if a setting differs from default
  const isModified = useCallback((path) => {
    const current = getSettingValue(settings, path)
    const def = getSettingValue(defaultSettings, path)
    return JSON.stringify(current) !== JSON.stringify(def)
  }, [settings])

  // Get count of modified settings in a section
  const getModifiedCount = useCallback((section) => {
    if (!settings[section] || !defaultSettings[section]) return 0

    let count = 0
    const checkModified = (current, def, prefix = '') => {
      for (const key in current) {
        const path = prefix ? `${prefix}.${key}` : key
        if (typeof current[key] === 'object' && !Array.isArray(current[key]) && current[key] !== null) {
          checkModified(current[key], def?.[key] || {}, path)
        } else if (JSON.stringify(current[key]) !== JSON.stringify(def?.[key])) {
          count++
        }
      }
    }
    checkModified(settings[section], defaultSettings[section])
    return count
  }, [settings])

  return {
    settings,
    isLoaded,
    updateSetting,
    updateSection,
    getSetting,
    resetToDefaults,
    resetSection,
    exportSettings,
    importSettings,
    isModified,
    getModifiedCount,
  }
}

export default useSettings
