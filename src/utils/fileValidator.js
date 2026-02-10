/**
 * File Validation Utilities
 *
 * Provides security validation for file uploads including:
 * - MIME type validation
 * - Magic byte (file signature) verification
 * - File size limits
 *
 * Prevents malicious file uploads disguised as Excel files.
 */

// Maximum file size in bytes (50MB)
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
export const MAX_FILE_SIZE_MB = 50

// Allowed MIME types for Excel files
export const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/octet-stream' // Some browsers report this for Excel files
]

// Magic bytes (file signatures) for Excel files
// XLSX files are ZIP archives starting with PK (0x50 0x4B)
// XLS files start with compound document header (0xD0 0xCF 0x11 0xE0)
export const EXCEL_MAGIC_BYTES = {
  xlsx: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP archive)
  xls: [0xd0, 0xcf, 0x11, 0xe0]   // Compound Document File
}

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxMB - Maximum file size in MB (default: 50)
 * @returns {{ valid: boolean, error?: string, sizeMB: number }}
 */
export const validateFileSize = (file, maxMB = MAX_FILE_SIZE_MB) => {
  const maxBytes = maxMB * 1024 * 1024
  const sizeMB = file.size / 1024 / 1024

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size (${sizeMB.toFixed(1)}MB) exceeds maximum allowed size (${maxMB}MB)`,
      sizeMB
    }
  }

  return { valid: true, sizeMB }
}

/**
 * Read the first N bytes of a file
 * @param {File} file - The file to read
 * @param {number} numBytes - Number of bytes to read
 * @returns {Promise<Uint8Array>}
 */
const readFileHeader = (file, numBytes = 8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(new Uint8Array(e.target.result))
    }
    reader.onerror = () => reject(new Error('Failed to read file header'))
    reader.readAsArrayBuffer(file.slice(0, numBytes))
  })
}

/**
 * Check if bytes match a magic byte signature
 * @param {Uint8Array} bytes - File header bytes
 * @param {number[]} signature - Expected signature
 * @returns {boolean}
 */
const matchesSignature = (bytes, signature) => {
  if (bytes.length < signature.length) return false
  return signature.every((byte, index) => bytes[index] === byte)
}

/**
 * Validate file type using MIME type and magic bytes
 * @param {File} file - The file to validate
 * @returns {Promise<{ valid: boolean, error?: string, detectedType?: string }>}
 */
export const validateFileType = async (file) => {
  // Check file extension first
  const fileName = file.name.toLowerCase()
  const hasValidExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'Invalid file extension. Only .xlsx and .xls files are allowed.'
    }
  }

  // Check MIME type (browsers may report different types)
  const mimeType = file.type
  const hasValidMime = ALLOWED_MIME_TYPES.includes(mimeType) || mimeType === ''

  if (!hasValidMime) {
    return {
      valid: false,
      error: `Invalid file type: ${mimeType}. Only Excel files are allowed.`
    }
  }

  // Read and verify magic bytes
  try {
    const header = await readFileHeader(file, 8)

    const isXlsx = matchesSignature(header, EXCEL_MAGIC_BYTES.xlsx)
    const isXls = matchesSignature(header, EXCEL_MAGIC_BYTES.xls)

    if (!isXlsx && !isXls) {
      return {
        valid: false,
        error: 'File content does not match Excel format. The file may be corrupted or is not a valid Excel file.'
      }
    }

    return {
      valid: true,
      detectedType: isXlsx ? 'xlsx' : 'xls'
    }
  } catch (error) {
    return {
      valid: false,
      error: `Failed to verify file format: ${error.message}`
    }
  }
}

/**
 * Comprehensive file validation (size + type)
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxMB - Maximum file size in MB (default: 50)
 * @returns {Promise<{ valid: boolean, errors: string[], warnings: string[], detectedType?: string, sizeMB: number }>}
 */
export const validateFile = async (file, options = {}) => {
  const { maxMB = MAX_FILE_SIZE_MB } = options
  const errors = []
  const warnings = []

  // Validate size
  const sizeResult = validateFileSize(file, maxMB)
  if (!sizeResult.valid) {
    errors.push(sizeResult.error)
  }

  // Validate type (only if size is valid - no point reading a huge file)
  let detectedType = null
  if (sizeResult.valid) {
    const typeResult = await validateFileType(file)
    if (!typeResult.valid) {
      errors.push(typeResult.error)
    } else {
      detectedType = typeResult.detectedType
    }
  }

  // Warn about large files that might be slow to process
  if (sizeResult.sizeMB > 10) {
    warnings.push(`Large file (${sizeResult.sizeMB.toFixed(1)}MB) may take longer to process`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    detectedType,
    sizeMB: sizeResult.sizeMB
  }
}

/**
 * Validate multiple files
 * @param {File[]} files - Array of files to validate
 * @param {Object} options - Validation options
 * @returns {Promise<{ validFiles: File[], invalidFiles: Array<{file: File, errors: string[]}>, totalSizeMB: number }>}
 */
export const validateFiles = async (files, options = {}) => {
  const validFiles = []
  const invalidFiles = []
  let totalSizeMB = 0

  for (const file of files) {
    const result = await validateFile(file, options)
    totalSizeMB += result.sizeMB

    if (result.valid) {
      validFiles.push(file)
    } else {
      invalidFiles.push({ file, errors: result.errors })
    }
  }

  return { validFiles, invalidFiles, totalSizeMB }
}
