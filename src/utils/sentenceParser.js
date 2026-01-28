/**
 * Sentence Parser for HSE Classification
 *
 * Analyzes sentence structure to identify:
 * - SUBJECT: The main problem/deviation (highest weight)
 * - OBJECT: Secondary item affected (medium weight)
 * - LOCATION: Where it occurred (context, lower weight)
 * - CAUSE: Why it happened (root cause indicator)
 * - CONSEQUENCE: What could/did happen (outcome indicator)
 *
 * Uses grammatical patterns to assign confidence weights to keywords.
 */

// ============================================================================
// SECTION A: GRAMMATICAL ROLE WEIGHTS
// Higher weight = more likely to be the MAIN hazard
// ============================================================================

export const GRAMMATICAL_WEIGHTS = {
  SUBJECT: 1.0,           // Main subject - highest confidence
  DIRECT_OBJECT: 0.8,     // Direct object - high confidence
  PREDICATE_NOUN: 0.75,   // "X is a hazard" - predicate nominative
  INDIRECT_OBJECT: 0.6,   // Indirect object - medium confidence
  PREP_OBJECT: 0.4,       // Object of preposition - context/location
  MODIFIER: 0.3,          // Adjective/adverb modifying another word
  CLAUSE_NOUN: 0.5,       // Noun in subordinate clause
}

// ============================================================================
// SECTION B: SENTENCE PATTERN TEMPLATES
// Regex patterns to identify sentence structures
// ============================================================================

export const SENTENCE_PATTERNS = {
  // Pattern: "X was found at/on/in Y"
  // X = SUBJECT (problem), Y = LOCATION
  FOUND_AT: {
    regex: /^(.+?)\s+(?:was|were|is|are)\s+(?:found|observed|noticed|seen|identified|discovered)\s+(?:at|on|in|near|inside|within)\s+(.+)$/i,
    roles: { 1: 'SUBJECT', 2: 'LOCATION' },
    description: 'Problem found at location'
  },

  // Pattern: "X at/on/in Y"
  // X = SUBJECT (problem), Y = LOCATION
  SUBJECT_AT_LOCATION: {
    regex: /^(.+?)\s+(?:at|on|in|near|inside|within|around)\s+(?:the\s+)?(.+)$/i,
    roles: { 1: 'SUBJECT', 2: 'LOCATION' },
    description: 'Subject at location'
  },

  // Pattern: "No X at/for/in Y" or "Missing X at/for/in Y"
  // X = SUBJECT (what's missing), Y = LOCATION/CONTEXT
  MISSING_AT: {
    regex: /^(?:no|missing|lack of|absence of|without)\s+(.+?)\s+(?:at|for|in|on|near)\s+(.+)$/i,
    roles: { 1: 'SUBJECT', 2: 'LOCATION' },
    description: 'Missing item at location'
  },

  // Pattern: "X due to/because of/caused by Y"
  // X = CONSEQUENCE, Y = CAUSE (root cause)
  CAUSED_BY: {
    regex: /^(.+?)\s+(?:due to|because of|caused by|as a result of|owing to)\s+(.+)$/i,
    roles: { 1: 'CONSEQUENCE', 2: 'CAUSE' },
    description: 'Consequence due to cause'
  },

  // Pattern: "X resulting in/leading to/causing Y"
  // X = CAUSE (root cause), Y = CONSEQUENCE
  RESULTING_IN: {
    regex: /^(.+?)\s+(?:resulting in|leading to|causing|which caused|that caused)\s+(.+)$/i,
    roles: { 1: 'CAUSE', 2: 'CONSEQUENCE' },
    description: 'Cause resulting in consequence'
  },

  // Pattern: "X without Y" or "X with no Y"
  // X = CONTEXT, Y = SUBJECT (what's missing is the problem)
  WITHOUT: {
    regex: /^(.+?)\s+(?:without|with no|lacking|missing)\s+(.+)$/i,
    roles: { 1: 'CONTEXT', 2: 'SUBJECT' },
    description: 'Context without required item'
  },

  // Pattern: "X not Y" (negation)
  // X = SUBJECT, "not Y" = the deviation
  NEGATION: {
    regex: /^(.+?)\s+(?:not|wasn't|weren't|isn't|aren't|has not|have not|had not)\s+(.+)$/i,
    roles: { 1: 'SUBJECT', 2: 'DEVIATION' },
    description: 'Subject with negated condition'
  },

  // Pattern: "Poor/Bad/Improper X"
  // X = SUBJECT (the problem area)
  QUALITY_MODIFIER: {
    regex: /^(?:poor|bad|improper|inadequate|insufficient|defective|damaged|broken|faulty|unsafe|hazardous|dangerous|exposed|unprotected|unsecured|missing|no|lack of)\s+(.+)$/i,
    roles: { 1: 'SUBJECT' },
    description: 'Quality issue with subject'
  },

  // Pattern: "X of Y" (possession/association)
  // Need to determine which is primary based on keywords
  OF_PATTERN: {
    regex: /^(.+?)\s+of\s+(.+)$/i,
    roles: { 1: 'PRIMARY', 2: 'SECONDARY' },
    description: 'X of Y relationship'
  },

  // Pattern: "X for Y"
  // X = SUBJECT, Y = PURPOSE/BENEFICIARY
  FOR_PATTERN: {
    regex: /^(.+?)\s+for\s+(.+)$/i,
    roles: { 1: 'SUBJECT', 2: 'PURPOSE' },
    description: 'Subject for purpose'
  },

  // Pattern: "Worker/Person doing X at Y"
  // X = ACTION (hazard context), Y = LOCATION
  ACTOR_ACTION: {
    regex: /^(?:worker|workers|person|personnel|employee|staff|crew|team)\s+(.+?)\s+(?:at|on|in|near)\s+(.+)$/i,
    roles: { 1: 'ACTION', 2: 'LOCATION' },
    description: 'Person performing action at location'
  },
}

// ============================================================================
// SECTION C: LOCATION INDICATORS
// Prepositions and phrases that indicate location/context
// ============================================================================

export const LOCATION_INDICATORS = [
  // Spatial prepositions
  'at', 'on', 'in', 'near', 'inside', 'outside', 'within', 'around',
  'beside', 'next to', 'adjacent to', 'close to', 'nearby',
  'above', 'below', 'under', 'over', 'beneath', 'underneath',
  'behind', 'in front of', 'between', 'among',
  // Location phrases
  'at the', 'on the', 'in the', 'near the', 'inside the',
  'at site', 'on site', 'in area', 'at location',
]

// ============================================================================
// SECTION D: CAUSE INDICATORS
// Words/phrases that indicate root cause
// ============================================================================

export const CAUSE_INDICATORS = [
  'due to', 'because of', 'caused by', 'as a result of', 'owing to',
  'attributed to', 'resulting from', 'stemming from', 'arising from',
  'lack of', 'failure to', 'failure of', 'absence of', 'missing',
  'inadequate', 'insufficient', 'improper', 'incorrect',
  'negligence', 'oversight', 'error', 'mistake', 'violation',
  'non-compliance', 'not following', 'disregard for',
]

// ============================================================================
// SECTION E: CONSEQUENCE INDICATORS
// Words/phrases that indicate outcomes/consequences
// ============================================================================

export const CONSEQUENCE_INDICATORS = [
  'resulting in', 'leading to', 'causing', 'which caused', 'that caused',
  'could result in', 'may cause', 'might lead to', 'risk of',
  'potential for', 'possibility of', 'danger of', 'hazard of',
  'injury', 'harm', 'damage', 'accident', 'incident',
  'fatality', 'death', 'serious injury', 'major injury',
]

// ============================================================================
// SECTION E2: ACTOR/PERSON INDICATORS (WHO was involved)
// Nouns that represent people involved in the observation
// ============================================================================

export const ACTOR_INDICATORS = {
  // Workers by role
  workers: [
    'worker', 'workers', 'laborer', 'laborers', 'labourer', 'labourers',
    'employee', 'employees', 'staff', 'personnel', 'crew', 'team',
    'person', 'persons', 'individual', 'individuals', 'man', 'men',
  ],

  // Operators and drivers
  operators: [
    'operator', 'operators', 'driver', 'drivers', 'plant operator',
    'machine operator', 'equipment operator', 'crane operator',
    'forklift operator', 'excavator operator', 'loader operator',
  ],

  // Skilled trades
  trades: [
    'welder', 'welders', 'electrician', 'electricians', 'plumber', 'plumbers',
    'carpenter', 'carpenters', 'mason', 'masons', 'painter', 'painters',
    'rigger', 'riggers', 'scaffolder', 'scaffolders', 'fitter', 'fitters',
    'mechanic', 'mechanics', 'technician', 'technicians',
  ],

  // Supervisors and management
  supervisors: [
    'supervisor', 'supervisors', 'foreman', 'foremen', 'manager', 'managers',
    'engineer', 'engineers', 'superintendent', 'charge hand', 'gang leader',
    'team leader', 'site manager', 'project manager', 'safety officer',
  ],

  // Contractors
  contractors: [
    'contractor', 'contractors', 'subcontractor', 'subcontractors',
    'sub-contractor', 'sub-contractors', 'vendor', 'vendors',
    'supplier', 'suppliers', 'third party', 'third-party',
  ],

  // Visitors and others
  others: [
    'visitor', 'visitors', 'guest', 'guests', 'inspector', 'inspectors',
    'auditor', 'auditors', 'client', 'clients', 'pedestrian', 'pedestrians',
    'bystander', 'bystanders', 'passer-by', 'passerby',
  ],
}

// Flatten all actors into single array for quick lookup
export const ALL_ACTORS = Object.values(ACTOR_INDICATORS).flat()

// ============================================================================
// SECTION E3: OBJECT/NOUN INDICATORS (WHAT was involved)
// Physical objects/equipment involved in the observation
// ============================================================================

export const OBJECT_INDICATORS = {
  // Equipment and machinery
  equipment: [
    'equipment', 'machinery', 'machine', 'plant', 'tool', 'tools',
    'vehicle', 'crane', 'forklift', 'excavator', 'loader', 'truck',
    'scaffold', 'scaffolding', 'ladder', 'platform', 'lift',
  ],

  // Materials
  materials: [
    'material', 'materials', 'load', 'cargo', 'object', 'objects',
    'rebar', 'steel', 'concrete', 'timber', 'wood', 'pipe', 'pipes',
    'cable', 'cables', 'wire', 'wires', 'panel', 'sheet',
  ],

  // Structures
  structures: [
    'structure', 'building', 'wall', 'floor', 'roof', 'ceiling',
    'foundation', 'column', 'beam', 'slab', 'formwork', 'shoring',
    'trench', 'excavation', 'pit', 'hole', 'opening',
  ],

  // Safety items
  safety: [
    'barricade', 'barrier', 'guardrail', 'handrail', 'sign', 'signage',
    'ppe', 'helmet', 'harness', 'gloves', 'vest', 'boots',
    'fire extinguisher', 'first aid', 'emergency',
  ],

  // Facilities
  facilities: [
    'facility', 'facilities', 'toilet', 'restroom', 'welfare',
    'canteen', 'office', 'storage', 'warehouse', 'workshop',
    'camp', 'accommodation', 'dormitory',
  ],
}

// Flatten all objects into single array
export const ALL_OBJECTS = Object.values(OBJECT_INDICATORS).flat()

// ============================================================================
// SECTION F: DEVIATION/PROBLEM INDICATORS
// Words that indicate something is wrong
// ============================================================================

export const DEVIATION_INDICATORS = [
  // Negative states
  'poor', 'bad', 'improper', 'inadequate', 'insufficient', 'defective',
  'damaged', 'broken', 'faulty', 'unsafe', 'hazardous', 'dangerous',
  'exposed', 'unprotected', 'unsecured', 'unsupported', 'unstable',
  'missing', 'absent', 'lacking', 'no', 'none', 'without',
  // Negative actions
  'not', 'wasn\'t', 'weren\'t', 'isn\'t', 'aren\'t', 'hasn\'t', 'haven\'t',
  'failed', 'failure', 'collapsed', 'fell', 'dropped', 'slipped',
  // Observations
  'found', 'observed', 'noticed', 'seen', 'identified', 'discovered',
  'reported', 'noted', 'detected',
]

// ============================================================================
// SECTION G: NOUN PHRASE EXTRACTORS
// Extract noun phrases from text
// ============================================================================

/**
 * Simple tokenizer - splits text into words
 */
export const tokenize = (text) => {
  if (!text) return []
  return text.toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0)
}

/**
 * Check if word is a stop word (low semantic value)
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
  'which', 'who', 'whom', 'whose', 'what', 'where', 'when', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'than', 'too', 'very', 'just', 'also',
])

export const isStopWord = (word) => STOP_WORDS.has(word.toLowerCase())

/**
 * Check if word is a location preposition
 */
export const isLocationPreposition = (word) => {
  const preps = ['at', 'on', 'in', 'near', 'inside', 'outside', 'within', 'around',
    'beside', 'behind', 'above', 'below', 'under', 'over', 'between', 'among']
  return preps.includes(word.toLowerCase())
}

// ============================================================================
// SECTION G2: ACTOR AND OBJECT EXTRACTORS
// ============================================================================

/**
 * Extract actor (person/role) from text
 * Returns the actor and their category
 */
export const extractActor = (text) => {
  if (!text) return null
  const lowerText = text.toLowerCase()

  for (const [type, actors] of Object.entries(ACTOR_INDICATORS)) {
    for (const actor of actors) {
      // Match whole word only
      const regex = new RegExp(`\\b${actor}\\b`, 'i')
      if (regex.test(lowerText)) {
        return { actor, type, position: lowerText.indexOf(actor) }
      }
    }
  }
  return null
}

/**
 * Extract object (equipment/material) from text
 * Returns the object and its category
 */
export const extractObject = (text) => {
  if (!text) return null
  const lowerText = text.toLowerCase()

  for (const [type, objects] of Object.entries(OBJECT_INDICATORS)) {
    for (const obj of objects) {
      // Match whole word only
      const regex = new RegExp(`\\b${obj}\\b`, 'i')
      if (regex.test(lowerText)) {
        return { object: obj, type, position: lowerText.indexOf(obj) }
      }
    }
  }
  return null
}

/**
 * Extract action/verb from text
 * Identifies what happened
 */
export const ACTION_VERBS = {
  // Incident actions
  incident: [
    'fell', 'fall', 'falling', 'dropped', 'drop', 'dropping',
    'struck', 'strike', 'striking', 'hit', 'hitting',
    'slipped', 'slip', 'slipping', 'tripped', 'trip', 'tripping',
    'collapsed', 'collapse', 'collapsing', 'failed', 'fail', 'failing',
    'caught', 'trapped', 'crushed', 'pinched', 'severed',
  ],

  // Unsafe conditions
  condition: [
    'exposed', 'unprotected', 'unsecured', 'missing', 'damaged',
    'broken', 'defective', 'faulty', 'worn', 'corroded', 'rusted',
    'leaking', 'spilling', 'overflowing', 'blocked', 'obstructed',
  ],

  // Work actions
  work: [
    'working', 'operating', 'driving', 'lifting', 'welding', 'cutting',
    'grinding', 'drilling', 'digging', 'excavating', 'climbing',
    'entering', 'accessing', 'loading', 'unloading', 'carrying',
  ],

  // Observations
  observation: [
    'found', 'observed', 'noticed', 'seen', 'identified', 'discovered',
    'reported', 'noted', 'detected', 'spotted', 'witnessed',
  ],
}

export const extractAction = (text) => {
  if (!text) return null
  const lowerText = text.toLowerCase()

  for (const [type, verbs] of Object.entries(ACTION_VERBS)) {
    for (const verb of verbs) {
      const regex = new RegExp(`\\b${verb}\\b`, 'i')
      if (regex.test(lowerText)) {
        return { action: verb, type, position: lowerText.indexOf(verb) }
      }
    }
  }
  return null
}

// ============================================================================
// SECTION H: MAIN SENTENCE PARSER
// ============================================================================

/**
 * Parse a sentence and extract weighted keywords with grammatical roles
 *
 * @param {string} text - The sentence to parse
 * @returns {Object} Parsed result with weighted keywords
 */
export const parseSentence = (text) => {
  if (!text || typeof text !== 'string') {
    return { keywords: [], mainSubject: null, location: null, cause: null, consequence: null, actor: null, object: null }
  }

  const normalizedText = text.trim().toLowerCase()
  const result = {
    original: text,
    normalized: normalizedText,
    keywords: [],
    mainSubject: null,      // The primary problem/hazard
    location: null,         // Where it occurred
    cause: null,            // Root cause (if identified)
    consequence: null,      // Outcome (if identified)
    deviation: null,        // What went wrong
    actor: null,            // WHO was involved (person/role)
    actorType: null,        // Category of actor (worker, operator, supervisor, etc.)
    object: null,           // WHAT was involved (equipment/material)
    objectType: null,       // Category of object
    action: null,           // WHAT happened (verb/action)
    confidence: 0,          // Overall parsing confidence
    pattern: null,          // Which pattern matched
  }

  // Step 0: Extract actor (WHO) - do this first as it helps with context
  const actorInfo = extractActor(normalizedText)
  if (actorInfo) {
    result.actor = actorInfo.actor
    result.actorType = actorInfo.type
    result.keywords.push({ text: actorInfo.actor, role: 'ACTOR', weight: 0.6 })
  }

  // Step 0b: Extract object (WHAT) - physical item involved
  const objectInfo = extractObject(normalizedText)
  if (objectInfo) {
    result.object = objectInfo.object
    result.objectType = objectInfo.type
    result.keywords.push({ text: objectInfo.object, role: 'OBJECT', weight: 0.7 })
  }

  // Step 0c: Extract action (WHAT HAPPENED) - verb/action
  const actionInfo = extractAction(normalizedText)
  if (actionInfo) {
    result.action = actionInfo.action
    result.actionType = actionInfo.type
    result.keywords.push({ text: actionInfo.action, role: 'ACTION', weight: 0.5 })
  }

  // Step 1: Try to match sentence patterns
  for (const [patternName, pattern] of Object.entries(SENTENCE_PATTERNS)) {
    const match = normalizedText.match(pattern.regex)
    if (match) {
      result.pattern = patternName

      // Extract parts based on pattern roles
      for (const [groupIndex, role] of Object.entries(pattern.roles)) {
        const value = match[parseInt(groupIndex)]?.trim()
        if (value) {
          switch (role) {
            case 'SUBJECT':
              result.mainSubject = value
              result.keywords.push({ text: value, role: 'SUBJECT', weight: GRAMMATICAL_WEIGHTS.SUBJECT })
              break
            case 'LOCATION':
              result.location = value
              result.keywords.push({ text: value, role: 'LOCATION', weight: GRAMMATICAL_WEIGHTS.PREP_OBJECT })
              break
            case 'CAUSE':
              result.cause = value
              result.keywords.push({ text: value, role: 'CAUSE', weight: GRAMMATICAL_WEIGHTS.CLAUSE_NOUN })
              break
            case 'CONSEQUENCE':
              result.consequence = value
              result.keywords.push({ text: value, role: 'CONSEQUENCE', weight: GRAMMATICAL_WEIGHTS.DIRECT_OBJECT })
              break
            case 'CONTEXT':
              result.keywords.push({ text: value, role: 'CONTEXT', weight: GRAMMATICAL_WEIGHTS.PREP_OBJECT })
              break
            case 'DEVIATION':
              result.deviation = value
              result.keywords.push({ text: value, role: 'DEVIATION', weight: GRAMMATICAL_WEIGHTS.PREDICATE_NOUN })
              break
            case 'ACTION':
              result.keywords.push({ text: value, role: 'ACTION', weight: GRAMMATICAL_WEIGHTS.DIRECT_OBJECT })
              break
            case 'PRIMARY':
            case 'SECONDARY':
              result.keywords.push({ text: value, role: role, weight: role === 'PRIMARY' ? 0.7 : 0.5 })
              break
            case 'PURPOSE':
              result.keywords.push({ text: value, role: 'PURPOSE', weight: GRAMMATICAL_WEIGHTS.INDIRECT_OBJECT })
              break
          }
        }
      }

      result.confidence = 0.8 // Pattern matched
      break
    }
  }

  // Step 2: If no pattern matched, use heuristic parsing
  if (!result.pattern) {
    result.pattern = 'HEURISTIC'
    const parsed = heuristicParse(normalizedText)
    result.mainSubject = parsed.subject
    result.location = parsed.location
    result.keywords = parsed.keywords
    result.confidence = parsed.confidence
  }

  // Step 3: Identify deviation indicators in the subject
  if (result.mainSubject) {
    const tokens = tokenize(result.mainSubject)
    for (const token of tokens) {
      if (DEVIATION_INDICATORS.includes(token)) {
        result.deviation = result.mainSubject
        break
      }
    }
  }

  return result
}

/**
 * Heuristic parsing when no pattern matches
 * Uses word position and preposition detection
 */
const heuristicParse = (text) => {
  const tokens = tokenize(text)
  const keywords = []
  let subject = null
  let location = null
  let locationStartIndex = -1

  // Find location preposition
  for (let i = 0; i < tokens.length; i++) {
    if (isLocationPreposition(tokens[i])) {
      locationStartIndex = i
      break
    }
  }

  if (locationStartIndex > 0) {
    // Everything before preposition is subject
    const subjectTokens = tokens.slice(0, locationStartIndex).filter(t => !isStopWord(t))
    const locationTokens = tokens.slice(locationStartIndex + 1).filter(t => !isStopWord(t))

    subject = subjectTokens.join(' ')
    location = locationTokens.join(' ')

    if (subject) {
      keywords.push({ text: subject, role: 'SUBJECT', weight: GRAMMATICAL_WEIGHTS.SUBJECT })
    }
    if (location) {
      keywords.push({ text: location, role: 'LOCATION', weight: GRAMMATICAL_WEIGHTS.PREP_OBJECT })
    }
  } else {
    // No location preposition found - treat as simple subject
    const meaningfulTokens = tokens.filter(t => !isStopWord(t))
    subject = meaningfulTokens.join(' ')
    if (subject) {
      keywords.push({ text: subject, role: 'SUBJECT', weight: GRAMMATICAL_WEIGHTS.SUBJECT })
    }
  }

  return {
    subject,
    location,
    keywords,
    confidence: locationStartIndex > 0 ? 0.6 : 0.4
  }
}

// ============================================================================
// SECTION I: KEYWORD EXTRACTOR WITH WEIGHTS
// ============================================================================

/**
 * Extract all keywords from text with weights based on grammatical role
 *
 * @param {string} text - The text to analyze
 * @param {Object} hazardKeywords - Map of hazard category keywords
 * @returns {Array} Weighted keyword matches
 */
export const extractWeightedKeywords = (text, hazardKeywords) => {
  const parsed = parseSentence(text)
  const matches = []

  // Check each keyword part against hazard keywords
  for (const kwPart of parsed.keywords) {
    const partText = kwPart.text.toLowerCase()

    for (const [category, keywords] of Object.entries(hazardKeywords)) {
      for (const keyword of keywords) {
        if (partText.includes(keyword.toLowerCase())) {
          matches.push({
            keyword,
            category,
            role: kwPart.role,
            weight: kwPart.weight,
            confidence: parsed.confidence * kwPart.weight,
            isMainSubject: kwPart.role === 'SUBJECT',
            isLocation: kwPart.role === 'LOCATION',
            isCause: kwPart.role === 'CAUSE',
          })
        }
      }
    }
  }

  // Sort by confidence (weight * parsing confidence)
  matches.sort((a, b) => b.confidence - a.confidence)

  return {
    parsed,
    matches,
    bestMatch: matches[0] || null,
    hasConflict: matches.length > 1 &&
      matches[0]?.category !== matches[1]?.category &&
      Math.abs(matches[0]?.confidence - matches[1]?.confidence) < 0.2
  }
}

// ============================================================================
// SECTION J: SENTENCE COMPONENT ANALYZER
// For root cause analysis - breaks down into Deviation, Cause, Consequence
// ============================================================================

/**
 * Analyze sentence for root cause investigation components
 *
 * @param {string} text - The observation text
 * @returns {Object} Root cause analysis components
 */
export const analyzeForRootCause = (text) => {
  const parsed = parseSentence(text)

  const analysis = {
    // WHO was involved
    actor: parsed.actor,
    actorType: parsed.actorType,
    actorConfidence: parsed.actor ? 0.9 : 0,

    // WHAT happened (action/event)
    action: parsed.action,
    actionType: parsed.actionType,

    // WHAT was involved (object/equipment)
    object: parsed.object,
    objectType: parsed.objectType,

    // WHERE it happened
    location: parsed.location,
    locationConfidence: parsed.location ? 0.8 : 0,

    // What went wrong (the deviation/non-conformance)
    deviation: null,
    deviationConfidence: 0,

    // Why it happened (immediate cause)
    immediateCause: null,
    immediateCauseConfidence: 0,

    // Potential/actual outcome
    consequence: null,
    consequenceConfidence: 0,

    // What was affected
    affectedItem: null,

    // Overall parsing confidence
    overallConfidence: parsed.confidence,
  }

  // Extract deviation (the problem)
  if (parsed.mainSubject) {
    // Check if subject contains deviation indicators
    const hasDeviation = DEVIATION_INDICATORS.some(ind =>
      parsed.mainSubject.includes(ind)
    )
    if (hasDeviation) {
      analysis.deviation = parsed.mainSubject
      analysis.deviationConfidence = parsed.confidence
    } else {
      // Subject might be the affected item, not the deviation
      analysis.affectedItem = parsed.mainSubject
    }
  }

  // If we have an action that indicates an incident, that's the deviation
  if (parsed.actionType === 'incident' && parsed.action) {
    analysis.deviation = analysis.deviation || `${parsed.actor || 'Person'} ${parsed.action}`
    analysis.deviationConfidence = Math.max(analysis.deviationConfidence, 0.85)
  }

  // Extract cause
  if (parsed.cause) {
    analysis.immediateCause = parsed.cause
    analysis.immediateCauseConfidence = parsed.confidence * 0.8
  }

  // Extract consequence
  if (parsed.consequence) {
    analysis.consequence = parsed.consequence
    analysis.consequenceConfidence = parsed.confidence * 0.7
  }

  return analysis
}

// ============================================================================
// SECTION K: CLASSIFICATION WITH SENTENCE AWARENESS
// ============================================================================

/**
 * Classify hazard with sentence-aware keyword weights
 * Returns category with confidence based on grammatical role
 *
 * @param {string} text - The observation text
 * @param {Object} hazardPatterns - Map of category -> keywords
 * @returns {Object} Classification result with confidence
 */
export const classifyWithSentenceAwareness = (text, hazardPatterns) => {
  const result = extractWeightedKeywords(text, hazardPatterns)

  if (!result.matches.length) {
    return {
      category: null,
      confidence: 0,
      reason: 'No keywords matched',
      parsed: result.parsed,
    }
  }

  // If there's a conflict (multiple categories with similar confidence)
  if (result.hasConflict) {
    const topMatches = result.matches.slice(0, 2)

    // Prefer the one in SUBJECT role
    const subjectMatch = topMatches.find(m => m.isMainSubject)
    if (subjectMatch) {
      return {
        category: subjectMatch.category,
        confidence: subjectMatch.confidence,
        reason: `Selected "${subjectMatch.keyword}" as main subject over location/context`,
        alternativeCategory: topMatches.find(m => m !== subjectMatch)?.category,
        alternativeConfidence: topMatches.find(m => m !== subjectMatch)?.confidence,
        parsed: result.parsed,
      }
    }

    // If neither is subject, prefer non-location
    const nonLocationMatch = topMatches.find(m => !m.isLocation)
    if (nonLocationMatch) {
      return {
        category: nonLocationMatch.category,
        confidence: nonLocationMatch.confidence,
        reason: `Selected "${nonLocationMatch.keyword}" over location keyword`,
        alternativeCategory: topMatches.find(m => m !== nonLocationMatch)?.category,
        alternativeConfidence: topMatches.find(m => m !== nonLocationMatch)?.confidence,
        parsed: result.parsed,
      }
    }
  }

  // Return best match
  return {
    category: result.bestMatch.category,
    confidence: result.bestMatch.confidence,
    keyword: result.bestMatch.keyword,
    role: result.bestMatch.role,
    reason: `Matched "${result.bestMatch.keyword}" with role ${result.bestMatch.role}`,
    parsed: result.parsed,
  }
}

// ============================================================================
// SECTION L: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all sentence components for display/debugging
 */
export const getSentenceBreakdown = (text) => {
  const parsed = parseSentence(text)
  const rootCause = analyzeForRootCause(text)

  return {
    original: text,

    // WHO-WHAT-WHERE-WHY-HOW breakdown
    who: {
      actor: parsed.actor,
      actorType: parsed.actorType,
      description: parsed.actor ? `${parsed.actorType}: ${parsed.actor}` : 'Not identified',
    },

    what: {
      object: parsed.object,
      objectType: parsed.objectType,
      action: parsed.action,
      actionType: parsed.actionType,
      description: parsed.object
        ? `${parsed.objectType}: ${parsed.object}${parsed.action ? ` (${parsed.action})` : ''}`
        : 'Not identified',
    },

    where: {
      location: parsed.location,
      description: parsed.location || 'Not identified',
    },

    why: {
      cause: parsed.cause || rootCause.immediateCause,
      description: parsed.cause || rootCause.immediateCause || 'Not identified',
    },

    problem: {
      mainSubject: parsed.mainSubject,
      deviation: rootCause.deviation,
      consequence: parsed.consequence || rootCause.consequence,
    },

    // All extracted keywords with weights
    keywords: parsed.keywords.map(k => ({
      text: k.text,
      role: k.role,
      weight: k.weight,
      percentWeight: Math.round(k.weight * 100) + '%'
    })),

    pattern: parsed.pattern,
    confidence: Math.round(parsed.confidence * 100) + '%',
    rootCauseAnalysis: rootCause,
  }
}

/**
 * Compare two potential classifications based on sentence structure
 * Returns which one should take priority
 */
export const compareClassifications = (match1, match2) => {
  // Subject always wins over location
  if (match1.role === 'SUBJECT' && match2.role === 'LOCATION') return match1
  if (match2.role === 'SUBJECT' && match1.role === 'LOCATION') return match2

  // Subject wins over cause (cause is context for why it happened)
  if (match1.role === 'SUBJECT' && match2.role === 'CAUSE') return match1
  if (match2.role === 'SUBJECT' && match1.role === 'CAUSE') return match2

  // Higher weight wins
  if (match1.weight > match2.weight) return match1
  if (match2.weight > match1.weight) return match2

  // Same weight - use confidence
  return match1.confidence >= match2.confidence ? match1 : match2
}

// ============================================================================
// SECTION M: EXAMPLES AND TESTS
// ============================================================================

/**
 * Test cases demonstrating the parser
 */
export const PARSER_EXAMPLES = [
  {
    text: "poor housekeeping on a welfare",
    expected: {
      who: null,
      what: "housekeeping",
      where: "welfare",
      mainSubject: "poor housekeeping",
      location: "welfare",
      classification: "Housekeeping",
      reason: "Subject 'poor housekeeping' takes priority over location 'welfare'"
    }
  },
  {
    text: "exposed rebar at excavation site",
    expected: {
      who: null,
      what: "rebar",
      where: "excavation site",
      mainSubject: "exposed rebar",
      location: "excavation site",
      classification: "Physical Hazard",
      reason: "Subject 'exposed rebar' is the hazard, excavation is location"
    }
  },
  {
    text: "worker fell from scaffold due to missing harness",
    expected: {
      who: "worker",
      what: "scaffold, harness",
      action: "fell",
      cause: "missing harness",
      mainSubject: "worker fell from scaffold",
      classification: "Working at Height",
      reason: "Fall from height is the incident, missing harness is root cause"
    }
  },
  {
    text: "operator struck by falling object",
    expected: {
      who: "operator",
      what: "object",
      action: "struck",
      mainSubject: "struck by falling object",
      classification: "Physical Hazard",
      reason: "Struck-by is the hazard, operator is the affected person"
    }
  },
  {
    text: "electrician working on live panel without isolation",
    expected: {
      who: "electrician",
      what: "panel",
      action: "working",
      cause: "without isolation",
      classification: "Energized System",
      reason: "Working on live electrical is the hazard"
    }
  },
  {
    text: "no drinking water at welfare facility",
    expected: {
      who: null,
      what: "water, facility",
      where: "welfare facility",
      mainSubject: "no drinking water",
      location: "welfare facility",
      classification: "Worker Welfare",
      reason: "Missing drinking water is a welfare issue"
    }
  },
  {
    text: "forklift operator reversing without banksman",
    expected: {
      who: "operator",
      what: "forklift",
      action: null,
      cause: "without banksman",
      classification: "Mobile Plant & Equipment",
      reason: "Forklift operation is the hazard context"
    }
  },
  {
    text: "welder not wearing face shield during grinding",
    expected: {
      who: "welder",
      what: "face shield",
      action: "grinding",
      deviation: "not wearing",
      classification: "Hot Work",
      reason: "Grinding is hot work, PPE is the control measure missing"
    }
  },
  {
    text: "dust observed during excavation work",
    expected: {
      who: null,
      what: null,
      action: "observed",
      where: "excavation work",
      mainSubject: "dust",
      classification: "Respiratory Hazard",
      reason: "Dust is the subject/hazard, excavation is context"
    }
  },
  {
    text: "scaffolder working at height without harness",
    expected: {
      who: "scaffolder",
      what: "harness",
      action: "working",
      where: "at height",
      cause: "without harness",
      classification: "Working at Height",
      reason: "Working at height without fall protection"
    }
  },
]
