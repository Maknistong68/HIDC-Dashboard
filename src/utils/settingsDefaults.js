// Default settings for HIDC Dashboard
// All settings are user-friendly and stored in localStorage

export const SETTINGS_VERSION = '1.0'
export const SETTINGS_STORAGE_KEY = 'hse_settings'

export const defaultSettings = {
  version: SETTINGS_VERSION,

  // 1. Clean Up My Data
  cleanup: {
    text: {
      removeExtraSpaces: true,
      fixLineBreaks: false,
      capitalization: 'none', // none | title | upper | lower | sentence
      removeUnwantedChars: ['emojis'], // emojis | symbols | html | nonPrintable
      fixQuotationMarks: true,
    },
    dates: {
      inputFormat: 'DD/MM/YYYY', // DD/MM/YYYY | MM/DD/YYYY | YYYY-MM-DD | DD-MMM-YYYY
      badDateAction: 'flag', // reject | useToday | flag
      allowFutureDates: false,
      validDateRange: {
        enabled: true,
        minYear: 2020,
        maxYear: 2030,
      },
    },
    names: {
      contractor: 'title', // none | trim | title | upper | fuzzy
      site: 'title',
      reporter: 'title', // also supports 'flipName' for "Last, First" -> "First Last"
    },
    description: {
      minLength: 20,
      maxLength: 2000,
    },
  },

  // 2. Find Duplicates
  duplicates: {
    enabled: true,
    strictness: 'similar', // exact | similar | smart
    sensitivity: 0.85, // 0.5 to 1.0 (lower = catch more)
    compareAgainst: 'all', // thisImport | all | last30Days
    mustMatch: ['date', 'contractor', 'description'],
    shouldBeSimilar: ['site', 'reporter'],
    dateFlexibility: 1, // days (0-7)
    whenFound: {
      action: 'flag', // skip | importAnyway | combine | flag
      keepVersion: 'latest', // first | latest | bestQuality
      keepLog: true,
    },
  },

  // 3. Auto-Categorize Hazards
  categorization: {
    enabled: true,
    confidenceLevel: 0.7, // 0.5 to 1.0
    whenUnsure: 'flag', // bestGuess | leaveBlank | flag | useOther
    multipleMatches: 'highest', // highest | first | mostSpecific | flag
    rules: {
      prioritizeMajorHazards: true,
      customOrder: [], // empty = use default order
      useSmartCorrections: true,
      useExclusionRules: true,
    },
    customKeywords: {}, // { categoryName: ['keyword1', 'keyword2'] }
    customExclusions: {}, // { categoryName: ['exclude1', 'exclude2'] }
  },

  // 4. Validate My Data
  validation: {
    requiredFields: ['date', 'type', 'description', 'contractor'],
    whenMissing: 'flag', // reject | useDefault | flag
    defaultValues: {
      status: 'Open',
      type: 'Unsafe Condition',
      site: '',
      reporter: '',
    },
    fieldRules: {
      incidentTypes: 'flexible', // strict | flexible | any
      statusValues: 'flexible',
      contractorNames: 'autoAdd', // any | mustExist | autoAdd
      siteNames: 'autoAdd',
    },
    qualityScoring: {
      enabled: true,
      weights: {
        description: 40, // percentage
        categorization: 35,
        completeness: 25,
      },
      minQualityToImport: 0, // 0-100, 0 means accept all
    },
  },

  // 5. Organize My Data
  organize: {
    sorting: {
      primaryField: 'date',
      primaryOrder: 'desc', // asc | desc
      secondaryField: 'type',
      secondaryOrder: 'asc',
      emptyValuesPosition: 'last', // first | last
    },
    grouping: {
      enabled: false,
      groupBy: 'none', // none | type | contractor | site | month | status | hazardCategory
      orderBy: 'countDesc', // alpha | countDesc | countAsc | custom
      startCollapsed: false,
    },
    defaultFilters: {
      dateRange: 'thisMonth', // allTime | thisMonth | last30Days | thisQuarter | thisYear | ytd
      contractor: 'all',
      site: 'all',
      status: 'all', // all | open | closed
      incidentTypes: ['all'], // array of types or ['all']
      rememberFilters: true,
    },
    hierarchy: {
      linkSitesToContractors: true,
      allowSharedSites: false,
    },
  },

  // 6. Transform My Data
  transform: {
    typeMapping: {
      enabled: true,
      mappings: {
        // Common variations mapped to standard types
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
      whenUnknown: 'flag', // reject | useDefault | flag
      defaultType: 'Unsafe Condition',
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
      whenUnknown: 'flag',
      defaultStatus: 'Open',
    },
    autoCalculate: {
      age: true, // days since creation
      month: true, // extract month
      quarter: true, // extract quarter (Q1-Q4)
      generateId: true,
      idFormat: 'OBS-{YYYY}-{####}', // pattern for auto-generated IDs
    },
  },

  // 7. Master Lists
  masterLists: {
    contractors: {
      enabled: true,
      autoAddNew: true,
      requireApproval: false,
      matchSimilarNames: true,
      similarityThreshold: 0.8,
      mergeDuplicates: false,
      list: [], // populated from data
    },
    sites: {
      enabled: true,
      linkToContractors: true,
      autoAddNew: true,
      autoFillContractor: true,
      list: [], // populated from data
    },
    categories: {
      useStandard: true,
      allowCustom: false,
      customLimit: 10,
      nicknames: {}, // { 'nickname': 'Standard Category Name' }
    },
  },

  // 8. Import Process
  importProcess: {
    stepOrder: ['clean', 'validate', 'dedupe', 'categorize', 'transform', 'score'],
    stopOnErrors: false,
    errorLimit: 10, // percentage
    batchSize: 500,
    reviewQueue: {
      enabled: true,
      autoImportGood: true,
      expiryDays: 7,
      notifyMe: true,
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

// Merge saved settings with defaults (handles new settings added in updates)
export const mergeWithDefaults = (savedSettings) => {
  if (!savedSettings) return { ...defaultSettings }

  const merge = (defaults, saved) => {
    const result = { ...defaults }
    for (const key in saved) {
      if (saved[key] !== null && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        result[key] = merge(defaults[key] || {}, saved[key])
      } else {
        result[key] = saved[key]
      }
    }
    return result
  }

  return merge(defaultSettings, savedSettings)
}

// Validate settings structure
export const validateSettings = (settings) => {
  const errors = []

  // Check version
  if (!settings.version) {
    errors.push('Missing settings version')
  }

  // Check required sections
  const requiredSections = ['cleanup', 'duplicates', 'categorization', 'validation', 'organize', 'transform', 'masterLists', 'importProcess']
  for (const section of requiredSections) {
    if (!settings[section]) {
      errors.push(`Missing section: ${section}`)
    }
  }

  // Validate ranges
  if (settings.duplicates?.sensitivity < 0.5 || settings.duplicates?.sensitivity > 1) {
    errors.push('Duplicate sensitivity must be between 0.5 and 1.0')
  }

  if (settings.categorization?.confidenceLevel < 0.5 || settings.categorization?.confidenceLevel > 1) {
    errors.push('Categorization confidence must be between 0.5 and 1.0')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
