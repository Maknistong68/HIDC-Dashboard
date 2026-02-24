/**
 * Settings Defaults - Simplified
 * These are the hardcoded defaults used throughout the app.
 * The complex settings page has been removed in favor of simple import options.
 */

export const SETTINGS_VERSION = '2.0'
export const SETTINGS_STORAGE_KEY = 'hse_settings'

// Simplified defaults - no longer user-configurable
export const defaultSettings = {
  version: SETTINGS_VERSION,

  // Text cleanup (always enabled)
  cleanup: {
    text: {
      removeExtraSpaces: true,
      fixLineBreaks: true,
      capitalization: 'none',
      removeUnwantedChars: ['emojis', 'html', 'nonPrintable'],
      fixQuotationMarks: true,
    },
    dates: {
      inputFormat: 'DD/MM/YYYY',
      badDateAction: 'flag',
      allowFutureDates: false,
      validDateRange: {
        enabled: true,
        minYear: 2020,
        maxYear: 2030,
      },
    },
    names: {
      contractor: 'title',
      site: 'title',
      reporter: 'title',
    },
  },

  // Categorization (hardcoded 70% confidence)
  categorization: {
    enabled: true,
    confidenceLevel: 0.7,
    rules: {
      prioritizeMajorHazards: true,
      useSmartCorrections: true,
      useExclusionRules: true,
    },
  },

  // Duplicates (handled via import options)
  duplicates: {
    enabled: true,
    sensitivity: 0.85,
    mustMatch: ['date', 'contractor', 'description'],
    shouldBeSimilar: ['site', 'reporter'],
    dateFlexibility: 1,
    whenFound: {
      action: 'skip',
      keepVersion: 'latest',
    },
  },

  // Type/Status mappings (always enabled)
  transform: {
    typeMapping: {
      enabled: true,
      mappings: {
        'Near Hit': 'Near Miss',
        'Near-Miss': 'Near Miss',
        'Unsafe Action': 'Unsafe Act',
        'Unsafe Behavior': 'Unsafe Act',
        'Good Catch': 'Positive Observation',
        'Positive': 'Positive Observation',
        'Safe Act': 'Positive Observation',
        'Hazard': 'Unsafe Condition',
        'First Aid': 'FAC',
        'First Aid Case': 'FAC',
        'Medical Treatment': 'MTI',
        'Lost Time': 'LTI',
        'Lost Time Injury': 'LTI',
      },
    },
    statusMapping: {
      enabled: true,
      mappings: {
        'Pending': 'Open',
        'In Review': 'Open',
        'Under Investigation': 'Open',
        'Resolved': 'Closed',
        'Complete': 'Closed',
        'Done': 'Closed',
      },
    },
  },
}

// Helper function to get nested value
export const getSettingValue = (settings, path) => {
  const keys = path.split('.')
  let value = settings
  for (const key of keys) {
    if (value === undefined || value === null) return undefined
    value = value[key]
  }
  return value
}

// Helper function to set nested value
export const setSettingValue = (settings, path, value) => {
  const keys = path.split('.')
  const newSettings = JSON.parse(JSON.stringify(settings))
  let current = newSettings
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
  return newSettings
}

// Merge saved settings with defaults (for backwards compatibility)
// Performs deep merge to preserve user customizations while ensuring new defaults are applied
export const mergeWithDefaults = (savedSettings) => {
  if (!savedSettings) return { ...defaultSettings }

  // Deep merge saved settings with defaults
  const merged = { ...defaultSettings }

  for (const key of Object.keys(savedSettings)) {
    if (savedSettings[key] !== null && typeof savedSettings[key] === 'object' && !Array.isArray(savedSettings[key])) {
      // Deep merge nested objects
      merged[key] = { ...defaultSettings[key], ...savedSettings[key] }
    } else {
      // Shallow copy primitive values and arrays
      merged[key] = savedSettings[key]
    }
  }

  return merged
}

// Validate settings structure
export const validateSettings = (_settings) => {
  // Always valid since we use hardcoded defaults
  return { isValid: true, errors: [] }
}
