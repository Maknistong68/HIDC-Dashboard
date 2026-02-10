/**
 * Safe JSON Utilities
 *
 * Provides secure JSON parsing with error handling to prevent crashes
 * from malformed or malicious JSON data.
 */

/**
 * Safely parse JSON string with fallback value
 * Prevents application crashes from malformed JSON
 *
 * @param {string} jsonString - The JSON string to parse
 * @param {*} fallback - The fallback value if parsing fails (default: null)
 * @param {Object} options - Additional options
 * @param {boolean} options.logErrors - Whether to log errors in dev mode (default: true)
 * @returns {*} - Parsed value or fallback
 */
export const safeJsonParse = (jsonString, fallback = null, options = {}) => {
  const { logErrors = true } = options

  if (jsonString === null || jsonString === undefined) {
    return fallback
  }

  if (typeof jsonString !== 'string') {
    // If it's already an object, return it
    if (typeof jsonString === 'object') {
      return jsonString
    }
    return fallback
  }

  // Empty string check
  if (jsonString.trim() === '') {
    return fallback
  }

  try {
    return JSON.parse(jsonString)
  } catch (error) {
    if (logErrors && import.meta.env.DEV) {
      console.error('[safeJsonParse] Failed to parse JSON:', error.message)
    }
    return fallback
  }
}

/**
 * Safely stringify an object to JSON
 * Handles circular references and other edge cases
 *
 * @param {*} value - The value to stringify
 * @param {string} fallback - The fallback string if stringification fails (default: '{}')
 * @param {Object} options - Additional options
 * @param {boolean} options.pretty - Whether to format with indentation (default: false)
 * @returns {string} - JSON string or fallback
 */
export const safeJsonStringify = (value, fallback = '{}', options = {}) => {
  const { pretty = false } = options

  if (value === undefined) {
    return fallback
  }

  try {
    return pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[safeJsonStringify] Failed to stringify:', error.message)
    }
    return fallback
  }
}

/**
 * Parse JSON with schema validation
 * Returns fallback if parsed data doesn't match expected schema
 *
 * @param {string} jsonString - The JSON string to parse
 * @param {function} validator - Validation function that returns true if valid
 * @param {*} fallback - The fallback value if parsing or validation fails
 * @returns {*} - Parsed and validated value or fallback
 */
export const safeJsonParseWithSchema = (jsonString, validator, fallback = null) => {
  const parsed = safeJsonParse(jsonString, null)

  if (parsed === null) {
    return fallback
  }

  try {
    if (validator && typeof validator === 'function') {
      if (!validator(parsed)) {
        if (import.meta.env.DEV) {
          console.error('[safeJsonParseWithSchema] Schema validation failed')
        }
        return fallback
      }
    }
    return parsed
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[safeJsonParseWithSchema] Validation error:', error.message)
    }
    return fallback
  }
}

/**
 * Deep clone an object using JSON serialization
 * Safer than structuredClone for simple objects
 *
 * @param {*} value - The value to clone
 * @param {*} fallback - The fallback value if cloning fails
 * @returns {*} - Cloned value or fallback
 */
export const safeJsonClone = (value, fallback = null) => {
  if (value === null || value === undefined) {
    return fallback
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[safeJsonClone] Failed to clone:', error.message)
    }
    return fallback
  }
}
