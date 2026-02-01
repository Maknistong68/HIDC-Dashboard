/**
 * File Hash Utilities
 *
 * Calculates SHA-256 hash of file content for duplicate file detection.
 * Used to prevent re-importing identical files.
 */

/**
 * Calculate SHA-256 hash of file content
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - Hex string of the hash
 */
export const calculateFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
