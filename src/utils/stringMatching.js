/**
 * String Matching Utilities
 * Provides phonetic matching (Soundex), Levenshtein distance, and fuzzy matching
 * for contractor name normalization and enhanced duplicate detection
 */

// ============================================
// SOUNDEX - Phonetic Matching Algorithm
// ============================================

/**
 * Generate Soundex code for a string
 * Used to match names that sound similar but are spelled differently
 * e.g., "Smith" and "Smyth" both produce "S530"
 */
export const soundex = (str) => {
  if (!str || typeof str !== 'string') return ''

  // Clean and uppercase
  const s = str.toUpperCase().replace(/[^A-Z]/g, '')
  if (s.length === 0) return ''

  // Soundex letter mappings
  const map = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  }

  // First letter kept as-is
  let code = s[0]
  let prevCode = map[s[0]] || '0'

  for (let i = 1; i < s.length && code.length < 4; i++) {
    const currentCode = map[s[i]] || '0'
    // Skip if same as previous code (handles double letters)
    // Skip vowels (A, E, I, O, U, H, W, Y - mapped to '0')
    if (currentCode !== '0' && currentCode !== prevCode) {
      code += currentCode
    }
    prevCode = currentCode
  }

  // Pad with zeros to always return 4 characters
  return (code + '0000').slice(0, 4)
}

/**
 * Check if two strings have matching Soundex codes
 */
export const soundexMatch = (str1, str2) => {
  if (!str1 || !str2) return false
  return soundex(str1) === soundex(str2)
}

// ============================================
// LEVENSHTEIN DISTANCE - Edit Distance
// ============================================

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits (insertions, deletions, substitutions)
 * needed to transform one string into another
 */
export const levenshteinDistance = (str1, str2) => {
  if (!str1) return str2?.length || 0
  if (!str2) return str1.length

  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  if (s1 === s2) return 0

  const len1 = s1.length
  const len2 = s2.length

  // Use single array optimization for memory efficiency
  let prevRow = Array(len2 + 1).fill(0).map((_, i) => i)
  let currRow = Array(len2 + 1).fill(0)

  for (let i = 1; i <= len1; i++) {
    currRow[0] = i
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      currRow[j] = Math.min(
        prevRow[j] + 1,      // deletion
        currRow[j - 1] + 1,  // insertion
        prevRow[j - 1] + cost // substitution
      )
    }
    ;[prevRow, currRow] = [currRow, prevRow]
  }

  return prevRow[len2]
}

/**
 * Calculate Levenshtein similarity (0-1 range)
 * Higher values indicate more similar strings
 */
export const levenshteinSimilarity = (str1, str2) => {
  if (!str1 && !str2) return 1
  if (!str1 || !str2) return 0

  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1

  const distance = levenshteinDistance(str1, str2)
  return 1 - (distance / maxLen)
}

// ============================================
// ABBREVIATION NORMALIZATION
// ============================================

/**
 * Common abbreviation mappings for construction/HSE industry
 */
const ABBREVIATIONS = {
  // Company suffixes
  'ltd': 'limited',
  'llc': 'limited liability company',
  'inc': 'incorporated',
  'corp': 'corporation',
  'co': 'company',
  'intl': 'international',
  'int': 'international',

  // Construction terms
  'maint': 'maintenance',
  'constr': 'construction',
  'eng': 'engineering',
  'mech': 'mechanical',
  'elec': 'electrical',
  'equip': 'equipment',
  'mgmt': 'management',
  'svcs': 'services',
  'svc': 'service',
  'tech': 'technology',
  'cont': 'contractor',
  'bldg': 'building',
  'proj': 'project',

  // Common words
  'st': 'street',
  'rd': 'road',
  'ave': 'avenue',
  'dr': 'drive',
  'dept': 'department',
  'div': 'division',
}

/**
 * Expand abbreviations in a string
 */
export const expandAbbreviations = (str) => {
  if (!str) return ''

  let result = str.toLowerCase()

  // Replace abbreviations (word boundary matching)
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbr}\\.?\\b`, 'gi')
    result = result.replace(regex, full)
  }

  return result
}

// ============================================
// CONTRACTOR NAME NORMALIZATION
// ============================================

/**
 * Normalize a contractor/company name for comparison
 * - Removes punctuation and special characters
 * - Normalizes spacing
 * - Expands abbreviations
 * - Lowercases
 */
export const normalizeContractorName = (name) => {
  if (!name || typeof name !== 'string') return ''

  let normalized = name
    .toLowerCase()
    .trim()
    // Remove common suffixes in parentheses
    .replace(/\([^)]*\)/g, '')
    // Remove punctuation except spaces
    .replace(/[.,\-_&'"/\\]+/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()

  // Expand abbreviations
  normalized = expandAbbreviations(normalized)

  return normalized.trim()
}

/**
 * Calculate comprehensive similarity between two contractor names
 * Combines multiple matching strategies:
 * 1. Exact match after normalization
 * 2. Levenshtein similarity
 * 3. Soundex matching for phonetic similarity
 * 4. Word-set overlap (Jaccard)
 */
export const contractorSimilarity = (name1, name2) => {
  if (!name1 || !name2) return { score: 0, method: 'none' }

  const norm1 = normalizeContractorName(name1)
  const norm2 = normalizeContractorName(name2)

  // Exact match after normalization
  if (norm1 === norm2) {
    return { score: 1, method: 'exact' }
  }

  // Calculate Levenshtein similarity
  const levSim = levenshteinSimilarity(norm1, norm2)

  // Check Soundex match for each word
  const words1 = norm1.split(/\s+/).filter(w => w.length > 2)
  const words2 = norm2.split(/\s+/).filter(w => w.length > 2)

  let soundexMatches = 0
  let soundexTotal = Math.max(words1.length, words2.length)

  for (const w1 of words1) {
    for (const w2 of words2) {
      if (soundexMatch(w1, w2)) {
        soundexMatches++
        break
      }
    }
  }

  const soundexScore = soundexTotal > 0 ? soundexMatches / soundexTotal : 0

  // Jaccard word-set similarity
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  const jaccardScore = union.size > 0 ? intersection.size / union.size : 0

  // Combined score (weighted average)
  const combinedScore = (levSim * 0.4) + (soundexScore * 0.3) + (jaccardScore * 0.3)

  // Determine best match method
  let method = 'combined'
  if (levSim > 0.9) method = 'levenshtein'
  else if (soundexScore > 0.8) method = 'soundex'
  else if (jaccardScore > 0.8) method = 'jaccard'

  return {
    score: combinedScore,
    method,
    details: {
      levenshtein: levSim,
      soundex: soundexScore,
      jaccard: jaccardScore
    }
  }
}

/**
 * Find similar contractors from a list
 * Returns contractors that match above the threshold
 */
export const findSimilarContractors = (name, existingContractors, threshold = 0.7) => {
  if (!name || !existingContractors || existingContractors.length === 0) {
    return []
  }

  const matches = []

  for (const existing of existingContractors) {
    if (!existing) continue

    const similarity = contractorSimilarity(name, existing)

    if (similarity.score >= threshold) {
      matches.push({
        name: existing,
        similarity: similarity.score,
        method: similarity.method,
        details: similarity.details
      })
    }
  }

  // Sort by similarity score descending
  return matches.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Find the best matching contractor from existing list
 * Returns null if no match above threshold
 */
export const findBestContractorMatch = (name, existingContractors, threshold = 0.8) => {
  const matches = findSimilarContractors(name, existingContractors, threshold)
  return matches.length > 0 ? matches[0] : null
}

// ============================================
// DUPLICATE DETECTION ENHANCEMENTS
// ============================================

/**
 * Enhanced description similarity using multiple methods
 * Better than simple Jaccard for detecting duplicates with typos
 */
export const enhancedDescriptionSimilarity = (desc1, desc2) => {
  if (!desc1 || !desc2) return 0
  if (desc1 === desc2) return 1

  const s1 = desc1.toLowerCase().trim()
  const s2 = desc2.toLowerCase().trim()

  if (s1 === s2) return 1

  // For short descriptions, use Levenshtein
  if (s1.length < 50 || s2.length < 50) {
    return levenshteinSimilarity(s1, s2)
  }

  // For longer descriptions, combine Jaccard with Levenshtein on key phrases
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 3))
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 3))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  const jaccardScore = union.size > 0 ? intersection.size / union.size : 0

  // Check for high Levenshtein similarity on first 100 chars (key content)
  const prefix1 = s1.slice(0, 100)
  const prefix2 = s2.slice(0, 100)
  const prefixSimilarity = levenshteinSimilarity(prefix1, prefix2)

  // Combine scores
  return (jaccardScore * 0.6) + (prefixSimilarity * 0.4)
}

/**
 * Enhanced reporter name matching
 * Handles "John Smith" vs "Smith, John" and phonetic variations
 */
export const reporterNameSimilarity = (name1, name2) => {
  if (!name1 || !name2) return 0

  const n1 = name1.toLowerCase().trim()
  const n2 = name2.toLowerCase().trim()

  if (n1 === n2) return 1

  // Normalize name formats
  const normalize = (name) => {
    // Convert "Last, First" to "First Last"
    if (name.includes(',')) {
      const parts = name.split(',').map(p => p.trim())
      if (parts.length === 2) {
        return `${parts[1]} ${parts[0]}`.toLowerCase()
      }
    }
    return name.toLowerCase()
  }

  const norm1 = normalize(n1)
  const norm2 = normalize(n2)

  if (norm1 === norm2) return 1

  // Split into words and check phonetic matching
  const words1 = norm1.split(/\s+/).filter(w => w.length > 1)
  const words2 = norm2.split(/\s+/).filter(w => w.length > 1)

  let matches = 0
  let total = Math.max(words1.length, words2.length)

  for (const w1 of words1) {
    for (const w2 of words2) {
      // Exact match
      if (w1 === w2) {
        matches++
        break
      }
      // Soundex match (phonetic)
      if (soundexMatch(w1, w2)) {
        matches += 0.9  // Slightly lower weight for phonetic match
        break
      }
      // Levenshtein similarity for typos
      const levSim = levenshteinSimilarity(w1, w2)
      if (levSim > 0.8) {
        matches += levSim
        break
      }
    }
  }

  return total > 0 ? matches / total : 0
}

// ============================================
// CONSOLIDATION SUGGESTIONS
// ============================================

/**
 * Analyze a list of contractor names and suggest consolidations
 * Returns groups of similar contractors that could be merged
 */
export const suggestContractorConsolidations = (contractors, threshold = 0.75) => {
  if (!contractors || contractors.length < 2) return []

  // Get unique contractors
  const unique = [...new Set(contractors.filter(c => c && c.trim()))]

  const consolidationGroups = []
  const processed = new Set()

  for (let i = 0; i < unique.length; i++) {
    if (processed.has(unique[i])) continue

    const group = {
      primary: unique[i],
      similar: [],
      suggestedName: unique[i]
    }

    for (let j = i + 1; j < unique.length; j++) {
      if (processed.has(unique[j])) continue

      const similarity = contractorSimilarity(unique[i], unique[j])

      if (similarity.score >= threshold) {
        group.similar.push({
          name: unique[j],
          similarity: similarity.score,
          method: similarity.method
        })
        processed.add(unique[j])
      }
    }

    if (group.similar.length > 0) {
      // Suggest the most common/longest name as primary
      const allNames = [group.primary, ...group.similar.map(s => s.name)]
      group.suggestedName = allNames.reduce((a, b) => a.length >= b.length ? a : b)
      consolidationGroups.push(group)
      processed.add(unique[i])
    }
  }

  return consolidationGroups
}

/**
 * Auto-normalize a contractor name based on existing data
 * Returns the best matching existing name, or the normalized input
 */
export const autoNormalizeContractor = (name, existingContractors, threshold = 0.85) => {
  if (!name) return ''

  const match = findBestContractorMatch(name, existingContractors, threshold)

  if (match) {
    return {
      normalized: match.name,
      original: name,
      wasNormalized: match.name !== name,
      similarity: match.similarity,
      method: match.method
    }
  }

  // No match found - return cleaned version
  const cleaned = name.trim().replace(/\s+/g, ' ')
  return {
    normalized: cleaned,
    original: name,
    wasNormalized: cleaned !== name,
    similarity: 1,
    method: 'none'
  }
}
