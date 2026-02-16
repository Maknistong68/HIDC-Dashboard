/**
 * Error Reporter — collects errors in-memory for production debugging.
 * Future: swap in Sentry/Datadog with one-line change.
 */

const MAX_ERRORS = 100
const errors = []

/**
 * Report an error with optional context metadata.
 * @param {Error|string} error
 * @param {Object} [meta] - Additional context (component name, action, etc.)
 */
export function reportError(error, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    message: error?.message || String(error),
    stack: error?.stack || null,
    ...meta,
  }

  errors.push(entry)

  // Ring buffer — drop oldest when full
  if (errors.length > MAX_ERRORS) {
    errors.shift()
  }
}

/**
 * Get all collected errors (for debugging / export).
 * @returns {Array} Shallow copy of the error list
 */
export function getErrors() {
  return [...errors]
}

/**
 * Clear all collected errors.
 */
export function clearErrors() {
  errors.length = 0
}
