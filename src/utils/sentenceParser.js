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
// SECTION A: CONFIDENCE CONSTANTS
// ============================================================================

// Default confidence level for hazard classification (0-1 scale)
// Used when no specific context indicates higher or lower confidence
export const DEFAULT_CONFIDENCE = 0.7

// Higher confidence for clear, unambiguous patterns
export const HIGH_CONFIDENCE = 0.85

// Lower confidence for context-dependent or ambiguous patterns
export const LOW_CONFIDENCE = 0.5

// ============================================================================
// SECTION A0: NOISE WORDS - Words that don't contribute to hazard classification
// Filter these out to focus on the MAIN hazard-indicating keywords
// ============================================================================

export const NOISE_WORDS = new Set([
  // Articles
  'the', 'a', 'an',

  // Common prepositions (when standalone)
  'in', 'on', 'at', 'by', 'for', 'with', 'to', 'from', 'of', 'into', 'onto',
  'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under',

  // Conjunctions
  'and', 'or', 'but', 'nor', 'yet', 'so', 'because', 'although', 'while', 'if',

  // Generic verbs (observation context)
  'was', 'were', 'is', 'are', 'been', 'being', 'be', 'have', 'has', 'had',
  'observed', 'found', 'noticed', 'seen', 'identified', 'discovered', 'noted',
  'reported', 'detected', 'spotted', 'witnessed', 'conducted', 'performed',

  // Time/context fillers
  'during', 'while', 'when', 'after', 'before', 'upon', 'following',
  'today', 'yesterday', 'morning', 'afternoon', 'evening', 'inspection',

  // Quantity words
  'some', 'many', 'several', 'few', 'multiple', 'various', 'all', 'any',
  'one', 'two', 'three', 'first', 'second', 'third',

  // Generic adjectives
  'proper', 'improper', 'appropriate', 'inappropriate', 'good', 'bad',
  'correct', 'incorrect', 'adequate', 'inadequate', 'sufficient', 'insufficient',

  // Filler words
  'that', 'this', 'these', 'those', 'it', 'its', 'their', 'there', 'here',
  'which', 'who', 'whom', 'whose', 'what', 'where', 'how', 'why',

  // Common HSE observation fillers
  'site', 'area', 'location', 'place', 'zone', 'section', 'part',
  'worker', 'workers', 'personnel', 'staff', 'employee', 'employees',
  'work', 'working', 'task', 'activity', 'operation', 'job',
  'safety', 'hazard', 'risk', 'issue', 'problem', 'concern',
  'observed', 'observation', 'inspection', 'audit', 'check',
  'not', 'no', 'without', 'lacking', 'missing', // Keep these for pattern matching but filter in keyword extraction
])

// Words that ARE significant for classification (not noise)
export const SIGNAL_WORDS = new Set([
  // Equipment/structures (hazard indicators)
  'scaffold', 'scaffolding', 'ladder', 'crane', 'forklift', 'excavator',
  'excavation', 'trench', 'pit', 'tank', 'vessel', 'pipe', 'cable', 'wire',
  'harness', 'lanyard', 'helmet', 'gloves', 'goggles', 'respirator',
  'guardrail', 'barricade', 'barrier', 'fence', 'cover', 'guard',
  'fire', 'chemical', 'electrical', 'gas', 'fuel', 'oil',
  'water', 'river', 'sea', 'lake', 'flood',
  'vehicle', 'truck', 'car', 'bus', 'trailer',
  'toilet', 'welfare', 'canteen', 'shelter', 'accommodation',

  // Conditions (hazard indicators)
  'exposed', 'unguarded', 'unprotected', 'damaged', 'broken', 'defective',
  'missing', 'absent', 'removed', 'open', 'uncovered', 'unsecured',
  'wet', 'slippery', 'unstable', 'loose', 'corroded', 'rusted',
  'live', 'energized', 'hot', 'cold', 'dusty', 'noisy',

  // Actions (incident indicators)
  'fell', 'fall', 'falling', 'dropped', 'struck', 'hit', 'caught',
  'slipped', 'tripped', 'collapsed', 'failed', 'leaked', 'spilled',
  'crushed', 'pinched', 'cut', 'burned', 'electrocuted',

  // PPE items
  'ppe', 'shoes', 'boots', 'vest', 'jacket', 'glasses', 'mask',
  'ear', 'protection', 'equipment',

  // Hazard types
  'height', 'confined', 'lifting', 'welding', 'cutting', 'grinding',
  'driving', 'loading', 'unloading', 'digging', 'drilling',
])

/**
 * Filter noise words from text, keeping only signal words
 * Returns array of significant keywords
 */
export const filterNoiseWords = (text) => {
  if (!text) return []

  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')  // Remove punctuation except hyphens
    .split(/\s+/)
    .filter(w => w.length > 2)  // Remove very short words
    .filter(w => !NOISE_WORDS.has(w))  // Remove noise

  return words
}

/**
 * Extract the MAIN hazard keyword from text
 * Prioritizes signal words over other words
 */
export const extractMainKeyword = (text) => {
  if (!text) return null

  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)

  // First, look for signal words
  for (const word of words) {
    if (SIGNAL_WORDS.has(word)) {
      return { keyword: word, isSignal: true }
    }
  }

  // If no signal word, return first non-noise word
  for (const word of words) {
    if (!NOISE_WORDS.has(word)) {
      return { keyword: word, isSignal: false }
    }
  }

  return null
}

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
// Including common misspellings
// ============================================================================

export const ACTOR_INDICATORS = {
  // Generic workers (lower confidence - 0.6)
  workers: [
    'worker', 'workers', 'workar', 'workars', 'woker', 'wokers',
    'laborer', 'laborers', 'labourer', 'labourers', 'laborer', 'labourr',
    'employee', 'employees', 'employe', 'employes', 'emplyee',
    'staff', 'personnel', 'personel', 'personell',
    'crew', 'team', 'person', 'persons', 'individual', 'individuals',
    'man', 'men', 'helper', 'helpers', 'helpar',
  ],

  // Operators and drivers (higher confidence for Mobile Plant - 0.85)
  operators: [
    'operator', 'operators', 'operater', 'operaters', 'opreator', 'oprator',
    'driver', 'drivers', 'diver', 'drivar',
    'plant operator', 'machine operator', 'equipment operator',
    'crane operator', 'crain operator', 'cran operator',
    'forklift operator', 'forklift operater', 'forklift driver',
    'excavator operator', 'excevator operator', 'excavater operator',
    'loader operator', 'loder operator', 'wheel loader operator',
    'backhoe operator', 'jcb operator', 'dozer operator', 'bulldozer operator',
    'dump truck driver', 'dumptruck driver', 'tipper driver',
    'telehandler operator', 'boom lift operator', 'scissor lift operator',
  ],

  // Lifting specialists (highest confidence for Lifting - 0.95)
  lifting: [
    'rigger', 'riggers', 'rigar', 'rigars', 'rigging',
    'signalman', 'signalmen', 'signal man', 'signal men', 'signelman', 'signalsman',
    'signaller', 'signallers', 'signaler', 'signalers',
    'banksman', 'banksmen', 'banks man', 'banks men', 'banksmann',
    'slinger', 'slingers', 'slingar', 'slingman', 'slingmen', 'sling man',
    'appointed person', 'ap', 'lifting supervisor', 'lift supervisor',
    'crane banksman', 'crane signalman', 'lifting ap',
  ],

  // Height work specialists (highest confidence for Working at Height - 0.95)
  height: [
    'scaffolder', 'scaffolders', 'scaffoldar', 'scaffoldars', 'scafoldar',
    'scaffold erector', 'scaffold erecter', 'scaffolding erector',
    'roofer', 'roofers', 'roofar', 'roof worker',
    'steeplejack', 'steeple jack',
    'rope access', 'rope access technician', 'irata',
    'abseiler', 'abseilers', 'absailer',
  ],

  // Hot work specialists (highest confidence for Hot Work - 0.95)
  hotwork: [
    'welder', 'welders', 'weldar', 'weldars', 'weldor',
    'fitter', 'fitters', 'fittar', 'fittars', 'pipe fitter', 'pipefitter',
    'fabricator', 'fabricators', 'fabricater',
    'burner', 'burners', 'gas cutter', 'flame cutter',
    'brazier', 'solderer', 'soldarar',
    'grinder', 'grinders', 'grindar',
    'boilermaker', 'boilermakers', 'boiler maker',
  ],

  // Electrical specialists (highest confidence for Energized System - 0.95)
  electrical: [
    'electrician', 'electricians', 'electrican', 'electricans', 'electritian',
    'electrical technician', 'electrical tech', 'sparky', 'sparkies',
    'linesman', 'linesmen', 'lineman', 'linemen',
    'cable jointer', 'cable jointer', 'jointer',
    'instrument technician', 'instrumentation tech',
    'control technician', 'panel technician',
  ],

  // Excavation specialists (higher confidence for Breaking Ground - 0.9)
  excavation: [
    'excavator driver', 'excavator operator',
    'piling operator', 'piling rig operator', 'piler',
    'driller', 'drillers', 'drilling operator',
    'trencher', 'trencher operator',
    'ground worker', 'groundworker', 'ground workers',
  ],

  // Confined space specialists (higher confidence for Confined Spaces - 0.9)
  confined: [
    'confined space entrant', 'entrant', 'entrants',
    'standby', 'standby man', 'standby person', 'hole watch',
    'top man', 'topman', 'attendant', 'attendants',
    'rescue team', 'rescue standby',
  ],

  // Other skilled trades
  trades: [
    'plumber', 'plumbers', 'plumbar', 'plumbars',
    'carpenter', 'carpenters', 'carpentar', 'carpentars', 'chippy', 'chippies',
    'mason', 'masons', 'brick layer', 'bricklayer', 'bricklayers',
    'painter', 'painters', 'paintar', 'paintars',
    'mechanic', 'mechanics', 'mechanik', 'mechaniks',
    'technician', 'technicians', 'technicion', 'technicien',
    'tiler', 'tilers', 'tilar',
    'plasterer', 'plasterers', 'plasterar',
    'glazier', 'glaziers', 'glaziar',
    'insulator', 'insulators', 'lagging man',
    'steel fixer', 'steelfixer', 'steel fixers', 'rebar man',
  ],

  // Supervisors and management
  supervisors: [
    'supervisor', 'supervisors', 'supervisar', 'supervisars', 'superviser',
    'foreman', 'foremen', 'forman', 'foramen', 'chargehand', 'charge hand',
    'manager', 'managers', 'managar', 'site manager', 'project manager',
    'engineer', 'engineers', 'enginear', 'site engineer', 'safety engineer',
    'superintendent', 'superintendant', 'super',
    'gang leader', 'gangleader', 'team leader', 'teamleader',
    'safety officer', 'hse officer', 'safety man', 'safety supervisor',
    'permit holder', 'permit issuer', 'area authority',
  ],

  // Contractors
  contractors: [
    'contractor', 'contractors', 'contractar', 'contractars', 'contracter',
    'subcontractor', 'subcontractors', 'sub-contractor', 'sub contractor',
    'vendor', 'vendors', 'vendar',
    'supplier', 'suppliers', 'suppliar',
    'third party', 'third-party', '3rd party',
  ],

  // Visitors and others
  others: [
    'visitor', 'visitors', 'visiter', 'visiters',
    'guest', 'guests',
    'inspector', 'inspectors', 'inspecter', 'inspecters',
    'auditor', 'auditors', 'auditar',
    'client', 'clients',
    'pedestrian', 'pedestrians', 'pedestrean',
    'bystander', 'bystanders',
    'passer-by', 'passerby', 'passer by',
    'trainee', 'trainees', 'apprentice', 'apprentices',
  ],
}

// Actor to hazard confidence mapping
// Specialized roles get higher confidence for their related hazards
export const ACTOR_HAZARD_CONFIDENCE = {
  // Lifting roles → Lifting hazard (highest)
  'rigger': { hazard: 'Lifting', confidence: 0.95 },
  'riggers': { hazard: 'Lifting', confidence: 0.95 },
  'signalman': { hazard: 'Lifting', confidence: 0.95 },
  'signalmen': { hazard: 'Lifting', confidence: 0.95 },
  'signal man': { hazard: 'Lifting', confidence: 0.95 },
  'banksman': { hazard: 'Lifting', confidence: 0.95 },
  'banksmen': { hazard: 'Lifting', confidence: 0.95 },
  'slinger': { hazard: 'Lifting', confidence: 0.95 },
  'slingers': { hazard: 'Lifting', confidence: 0.95 },
  'slingman': { hazard: 'Lifting', confidence: 0.95 },
  'appointed person': { hazard: 'Lifting', confidence: 0.95 },
  'ap': { hazard: 'Lifting', confidence: 0.9 },
  'crane operator': { hazard: 'Lifting', confidence: 0.9 },

  // Height roles → Working at Height (highest)
  'scaffolder': { hazard: 'Working at Height', confidence: 0.95 },
  'scaffolders': { hazard: 'Working at Height', confidence: 0.95 },
  'roofer': { hazard: 'Working at Height', confidence: 0.95 },
  'roofers': { hazard: 'Working at Height', confidence: 0.95 },
  'rope access': { hazard: 'Working at Height', confidence: 0.95 },

  // Hot work roles → Hot Work (highest)
  'welder': { hazard: 'Hot Work', confidence: 0.95 },
  'welders': { hazard: 'Hot Work', confidence: 0.95 },
  'fitter': { hazard: 'Hot Work', confidence: 0.85 },
  'fitters': { hazard: 'Hot Work', confidence: 0.85 },
  'grinder': { hazard: 'Hot Work', confidence: 0.9 },
  'grinders': { hazard: 'Hot Work', confidence: 0.9 },

  // Electrical roles → Energized System (highest)
  'electrician': { hazard: 'Energized System', confidence: 0.95 },
  'electricians': { hazard: 'Energized System', confidence: 0.95 },
  'linesman': { hazard: 'Energized System', confidence: 0.95 },
  'lineman': { hazard: 'Energized System', confidence: 0.95 },

  // Mobile plant roles → Mobile Plant & Equipment
  'forklift operator': { hazard: 'Mobile Plant & Equipment', confidence: 0.95 },
  'excavator operator': { hazard: 'Mobile Plant & Equipment', confidence: 0.95 },
  'crane operator': { hazard: 'Mobile Plant & Equipment', confidence: 0.85 },
  'loader operator': { hazard: 'Mobile Plant & Equipment', confidence: 0.95 },
  'dump truck driver': { hazard: 'Mobile Plant & Equipment', confidence: 0.9 },
  'operator': { hazard: 'Mobile Plant & Equipment', confidence: DEFAULT_CONFIDENCE },
  'driver': { hazard: 'Driving', confidence: DEFAULT_CONFIDENCE },

  // Confined space roles
  'confined space entrant': { hazard: 'Confined Spaces', confidence: 0.95 },
  'entrant': { hazard: 'Confined Spaces', confidence: 0.85 },
  'standby': { hazard: 'Confined Spaces', confidence: 0.85 },
  'hole watch': { hazard: 'Confined Spaces', confidence: 0.9 },

  // Generic worker - lower confidence (context needed)
  'worker': { hazard: null, confidence: 0.5 },
  'workers': { hazard: null, confidence: 0.5 },
  'laborer': { hazard: null, confidence: 0.5 },
  'employee': { hazard: null, confidence: 0.5 },
  'person': { hazard: null, confidence: 0.4 },
}

// Flatten all actors into single array for quick lookup
export const ALL_ACTORS = Object.values(ACTOR_INDICATORS).flat()

// ============================================================================
// SECTION E3: OBJECT/NOUN INDICATORS (WHAT was involved)
// Physical objects/equipment involved in the observation
// Including misspellings and hazard associations
// ============================================================================

export const OBJECT_INDICATORS = {
  // Equipment and machinery (Mobile Plant & Equipment)
  equipment: [
    'equipment', 'equipement', 'equpment', 'equipments',
    'machinery', 'machinry', 'machine', 'machines', 'machinary',
    'plant', 'plants',
    'vehicle', 'vehicles', 'vehical', 'vehicals',
    'crane', 'cranes', 'crain', 'crains', 'tower crane', 'mobile crane',
    'forklift', 'forklifts', 'fork lift', 'fork lifts', 'foklift',
    'excavator', 'excavators', 'excevator', 'excevators', 'excavater',
    'loader', 'loaders', 'loder', 'loders', 'wheel loader', 'front loader',
    'backhoe', 'backhoes', 'back hoe', 'jcb',
    'truck', 'trucks', 'lorry', 'lorries', 'tipper', 'tippers', 'dump truck',
    'bulldozer', 'bulldozers', 'dozer', 'dozers',
    'compactor', 'compactors', 'roller', 'rollers',
    'telehandler', 'telehandlers', 'tele handler', 'manitou',
    'boom lift', 'boomlift', 'cherry picker', 'mewp', 'ewp',
    'scissor lift', 'scissorlift', 'scissor lifts',
    'pallet jack', 'pallet truck', 'hand pallet',
  ],

  // Lifting equipment
  lifting: [
    'crane', 'cranes', 'crain', 'tower crane', 'mobile crane', 'gantry crane',
    'hoist', 'hoists', 'chain hoist', 'electric hoist',
    'sling', 'slings', 'web sling', 'chain sling', 'wire sling',
    'shackle', 'shackles', 'shakle', 'shakles',
    'hook', 'hooks', 'crane hook', 'lifting hook',
    'spreader beam', 'spreader bar', 'lifting beam',
    'load', 'loads', 'suspended load', 'lifted load',
    'rigging', 'rigging gear', 'lifting gear', 'lifting equipment',
    'tagline', 'tag line', 'tag lines', 'guide rope',
  ],

  // Height work equipment
  height: [
    'scaffold', 'scaffolds', 'scaffolding', 'scaffoldings', 'scafold', 'scafolding',
    'ladder', 'ladders', 'ladar', 'ladars', 'step ladder', 'extension ladder',
    'platform', 'platforms', 'work platform', 'working platform',
    'guardrail', 'guardrails', 'guard rail', 'guard rails', 'gaurd rail',
    'handrail', 'handrails', 'hand rail', 'hand rails',
    'toe board', 'toeboard', 'toe boards', 'toeboards', 'kickboard',
    'safety net', 'safety nets', 'catch net',
    'harness', 'harnesses', 'harnes', 'full body harness', 'safety harness',
    'lanyard', 'lanyards', 'lanard', 'shock absorber',
    'anchor', 'anchors', 'anchor point', 'anchorage',
    'lifeline', 'lifelines', 'life line', 'static line', 'horizontal lifeline',
    'roof', 'roofs', 'rooftop', 'roof top',
    'edge', 'edges', 'leading edge', 'unprotected edge',
    'opening', 'openings', 'floor opening', 'wall opening',
  ],

  // Hot work equipment
  hotwork: [
    'welding machine', 'welder', 'welding', 'welding set',
    'grinder', 'grinders', 'angle grinder', 'grinding machine',
    'cutting torch', 'oxy torch', 'gas torch', 'acetylene torch',
    'cylinder', 'cylinders', 'gas cylinder', 'oxygen cylinder', 'acetylene cylinder',
    'flashback arrestor', 'flash back arrestor', 'flashback',
    'regulator', 'regulators', 'gas regulator',
    'welding shield', 'welding mask', 'face shield',
    'fire blanket', 'fire blankets', 'welding blanket',
    'spark', 'sparks', 'hot work', 'hotwork',
  ],

  // Electrical equipment
  electrical: [
    'panel', 'panels', 'electrical panel', 'distribution panel', 'db',
    'cable', 'cables', 'wire', 'wires', 'electrical cable', 'power cable',
    'extension', 'extensions', 'extension cord', 'extension lead',
    'socket', 'sockets', 'outlet', 'outlets', 'power point',
    'switch', 'switches', 'isolator', 'isolators', 'breaker', 'breakers',
    'transformer', 'transformers', 'generator', 'generators', 'genset',
    'motor', 'motors', 'electric motor',
    'light', 'lights', 'lighting', 'lamp', 'lamps', 'flood light',
    'live', 'live wire', 'live cable', 'energized', 'energised',
  ],

  // Excavation/ground work
  excavation: [
    'trench', 'trenches', 'tranch', 'tranches',
    'excavation', 'excavations', 'excevation', 'dig', 'digs',
    'pit', 'pits', 'hole', 'holes',
    'shoring', 'shorings', 'trench box', 'trench shield',
    'spoil', 'spoils', 'spoil pile', 'excavated material',
    'edge protection', 'trench edge', 'excavation edge',
    'benching', 'battering', 'slope', 'slopes',
  ],

  // Materials (Physical Hazard related)
  materials: [
    'material', 'materials', 'materiel', 'materiels',
    'load', 'loads', 'cargo', 'cargos',
    'object', 'objects', 'item', 'items',
    'rebar', 'rebars', 're-bar', 'reinforcement', 'reinforcing bar', 'steel bar',
    'steel', 'steels', 'structural steel', 'steel beam',
    'concrete', 'concreet', 'cement', 'ciment',
    'timber', 'timbers', 'timbar', 'wood', 'woods', 'wooden', 'plywood',
    'pipe', 'pipes', 'piping', 'pipeline',
    'sheet', 'sheets', 'metal sheet', 'sheet metal',
    'nail', 'nails', 'screw', 'screws', 'bolt', 'bolts',
    'glass', 'glazing',
    'debris', 'rubble', 'waste',
  ],

  // Structures
  structures: [
    'structure', 'structures', 'structur',
    'building', 'buildings', 'bulding', 'buldings',
    'wall', 'walls', 'concrete wall', 'block wall',
    'floor', 'floors', 'slab', 'slabs', 'concrete slab',
    'roof', 'roofs', 'roofing',
    'ceiling', 'ceilings',
    'foundation', 'foundations', 'footing', 'footings',
    'column', 'columns', 'collum', 'collums', 'pillar', 'pillars',
    'beam', 'beams', 'girder', 'girders',
    'formwork', 'formworks', 'form work', 'shuttering',
    'falsework', 'false work',
    'temporary structure', 'temp structure',
  ],

  // Safety items
  safety: [
    'barricade', 'barricades', 'baricade', 'baricades', 'barricad',
    'barrier', 'barriers', 'barier', 'bariers',
    'fence', 'fences', 'fencing', 'hoarding',
    'cone', 'cones', 'traffic cone', 'safety cone',
    'sign', 'signs', 'signage', 'signages', 'warning sign', 'safety sign',
    'ppe', 'helmet', 'helmets', 'hard hat', 'hard hats', 'hardhat',
    'gloves', 'glove', 'safety gloves',
    'vest', 'vests', 'hi-vis', 'hi vis', 'high vis', 'high visibility',
    'boots', 'boot', 'safety boots', 'safety shoes',
    'goggles', 'goggle', 'safety glasses', 'eye protection',
    'ear plug', 'ear plugs', 'earplugs', 'ear muff', 'ear muffs',
    'respirator', 'respirators', 'mask', 'masks', 'dust mask', 'n95',
    'fire extinguisher', 'fire extinguishers', 'extinguisher', 'extingusher',
    'first aid', 'first aid kit', 'first aid box', 'firstaid',
  ],

  // Confined space items
  confined: [
    'manhole', 'manholes', 'man hole',
    'tank', 'tanks', 'storage tank', 'water tank',
    'vessel', 'vessels', 'pressure vessel',
    'chamber', 'chambers', 'sump', 'sumps',
    'culvert', 'culverts',
    'duct', 'ducts', 'air duct',
    'sewer', 'sewers', 'sewerage',
    'gas detector', 'gas monitor', 'four gas', '4 gas',
    'ventilation', 'ventilator', 'blower', 'fan',
    'tripod', 'tripods', 'rescue tripod', 'davit',
  ],

  // Facilities (Worker Welfare related)
  facilities: [
    'facility', 'facilities', 'facilty', 'facillity',
    'toilet', 'toilets', 'tolet', 'tolets', 'restroom', 'washroom', 'latrine',
    'welfare', 'welfare facility', 'welfare facilities',
    'canteen', 'canteens', 'mess', 'mess hall', 'dining',
    'office', 'offices', 'site office',
    'storage', 'storages', 'store', 'stores', 'warehouse',
    'workshop', 'workshops', 'work shop',
    'camp', 'camps', 'labor camp', 'labour camp', 'worker camp',
    'accommodation', 'accommodations', 'accomodation', 'dorm', 'dormitory',
    'drinking water', 'potable water', 'water cooler', 'water dispenser',
    'rest area', 'rest shelter', 'shade', 'shade area',
    'prayer room', 'changing room', 'locker room',
  ],
}

// Object to hazard confidence mapping
export const OBJECT_HAZARD_CONFIDENCE = {
  // Lifting equipment → Lifting
  'crane': { hazard: 'Lifting', confidence: 0.9 },
  'hoist': { hazard: 'Lifting', confidence: 0.9 },
  'sling': { hazard: 'Lifting', confidence: 0.95 },
  'shackle': { hazard: 'Lifting', confidence: 0.9 },
  'rigging': { hazard: 'Lifting', confidence: 0.95 },
  'suspended load': { hazard: 'Lifting', confidence: 0.95 },

  // Height equipment → Working at Height
  'scaffold': { hazard: 'Working at Height', confidence: 0.9 },
  'scaffolding': { hazard: 'Working at Height', confidence: 0.9 },
  'ladder': { hazard: 'Working at Height', confidence: 0.85 },
  'harness': { hazard: 'Working at Height', confidence: 0.95 },
  'lanyard': { hazard: 'Working at Height', confidence: 0.95 },
  'lifeline': { hazard: 'Working at Height', confidence: 0.95 },
  'guardrail': { hazard: 'Working at Height', confidence: 0.85 },

  // Electrical → Energized System
  'electrical panel': { hazard: 'Energized System', confidence: 0.95 },
  'live wire': { hazard: 'Energized System', confidence: 0.95 },
  'energized': { hazard: 'Energized System', confidence: 0.95 },
  'generator': { hazard: 'Energized System', confidence: 0.8 },

  // Hot work equipment → Hot Work
  'welding': { hazard: 'Hot Work', confidence: 0.95 },
  'grinder': { hazard: 'Hot Work', confidence: 0.9 },
  'cutting torch': { hazard: 'Hot Work', confidence: 0.95 },
  'gas cylinder': { hazard: 'Hot Work', confidence: 0.85 },

  // Excavation → Breaking Ground
  'trench': { hazard: 'Breaking Ground & Excavation', confidence: 0.95 },
  'excavation': { hazard: 'Breaking Ground & Excavation', confidence: 0.95 },
  'shoring': { hazard: 'Breaking Ground & Excavation', confidence: 0.95 },

  // Confined space → Confined Spaces
  'manhole': { hazard: 'Confined Spaces', confidence: 0.9 },
  'tank': { hazard: 'Confined Spaces', confidence: DEFAULT_CONFIDENCE },
  'gas detector': { hazard: 'Confined Spaces', confidence: 0.9 },

  // Sharp objects → Physical Hazard
  'rebar': { hazard: 'Physical Hazard', confidence: 0.85 },
  'nail': { hazard: 'Physical Hazard', confidence: 0.8 },
  'sharp': { hazard: 'Physical Hazard', confidence: 0.85 },

  // Mobile plant
  'forklift': { hazard: 'Mobile Plant & Equipment', confidence: 0.95 },
  'excavator': { hazard: 'Mobile Plant & Equipment', confidence: 0.9 },

  // Welfare
  'toilet': { hazard: 'Worker Welfare', confidence: 0.9 },
  'welfare': { hazard: 'Worker Welfare', confidence: 0.95 },
  'drinking water': { hazard: 'Worker Welfare', confidence: 0.95 },
  'canteen': { hazard: 'Worker Welfare', confidence: 0.9 },
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
 * Returns the actor, their category, and hazard confidence boost
 */
export const extractActor = (text) => {
  if (!text) return null
  const lowerText = text.toLowerCase()

  // Check longer phrases first (e.g., "crane operator" before "operator")
  const allActors = []
  for (const [type, actors] of Object.entries(ACTOR_INDICATORS)) {
    for (const actor of actors) {
      allActors.push({ actor, type })
    }
  }
  // Sort by length descending to match longer phrases first
  allActors.sort((a, b) => b.actor.length - a.actor.length)

  for (const { actor, type } of allActors) {
    // Escape special regex characters
    const escapedActor = actor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escapedActor}\\b`, 'i')
    if (regex.test(lowerText)) {
      // Get hazard confidence from mapping
      const hazardInfo = ACTOR_HAZARD_CONFIDENCE[actor.toLowerCase()] || { hazard: null, confidence: 0.6 }
      return {
        actor,
        type,
        position: lowerText.indexOf(actor.toLowerCase()),
        suggestedHazard: hazardInfo.hazard,
        hazardConfidence: hazardInfo.confidence,
        isSpecialist: hazardInfo.confidence >= 0.85, // High-confidence specialist role
      }
    }
  }
  return null
}

/**
 * Extract object (equipment/material) from text
 * Returns the object, its category, and hazard confidence boost
 */
export const extractObject = (text) => {
  if (!text) return null
  const lowerText = text.toLowerCase()

  // Check longer phrases first
  const allObjects = []
  for (const [type, objects] of Object.entries(OBJECT_INDICATORS)) {
    for (const obj of objects) {
      allObjects.push({ object: obj, type })
    }
  }
  // Sort by length descending
  allObjects.sort((a, b) => b.object.length - a.object.length)

  for (const { object: obj, type } of allObjects) {
    const escapedObj = obj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escapedObj}\\b`, 'i')
    if (regex.test(lowerText)) {
      // Get hazard confidence from mapping
      const hazardInfo = OBJECT_HAZARD_CONFIDENCE[obj.toLowerCase()] || { hazard: null, confidence: DEFAULT_CONFIDENCE }
      return {
        object: obj,
        type,
        position: lowerText.indexOf(obj.toLowerCase()),
        suggestedHazard: hazardInfo.hazard,
        hazardConfidence: hazardInfo.confidence,
      }
    }
  }
  return null
}

// ============================================================================
// SECTION G3: LOCATION EXTRACTION WITH PREPOSITIONS
// ============================================================================

/**
 * Location prepositions and their semantic meaning
 */
export const LOCATION_PREPOSITIONS = {
  // Position prepositions
  'at': { type: 'position', weight: 0.4 },
  'on': { type: 'surface', weight: 0.4 },
  'in': { type: 'inside', weight: 0.4 },
  'inside': { type: 'inside', weight: 0.4 },
  'within': { type: 'inside', weight: 0.4 },
  'near': { type: 'proximity', weight: 0.35 },
  'nearby': { type: 'proximity', weight: 0.35 },
  'close to': { type: 'proximity', weight: 0.35 },
  'next to': { type: 'proximity', weight: 0.35 },
  'beside': { type: 'proximity', weight: 0.35 },
  'adjacent to': { type: 'proximity', weight: 0.35 },
  'around': { type: 'proximity', weight: 0.3 },

  // Vertical position (important for height hazards)
  'above': { type: 'above', weight: 0.5, heightRelated: true },
  'over': { type: 'above', weight: 0.5, heightRelated: true },
  'below': { type: 'below', weight: 0.5, heightRelated: true },
  'under': { type: 'below', weight: 0.4, heightRelated: true },
  'beneath': { type: 'below', weight: 0.4, heightRelated: true },
  'underneath': { type: 'below', weight: 0.4, heightRelated: true },

  // Relative position
  'between': { type: 'between', weight: 0.45 },
  'among': { type: 'among', weight: 0.4 },
  'behind': { type: 'behind', weight: 0.35 },
  'in front of': { type: 'front', weight: 0.35 },
}

/**
 * Extract location from text with preposition analysis
 */
export const extractLocation = (text) => {
  if (!text) return null
  const lowerText = text.toLowerCase()

  // Sort prepositions by length (longest first) to match "close to" before "to"
  const prepEntries = Object.entries(LOCATION_PREPOSITIONS).sort((a, b) => b[0].length - a[0].length)

  for (const [prep, info] of prepEntries) {
    const prepRegex = new RegExp(`\\b${prep}\\s+(?:the\\s+)?(.+?)(?:\\s*$|\\s+(?:due|because|caused|resulting|without|with|during))`, 'i')
    const match = lowerText.match(prepRegex)
    if (match) {
      const locationText = match[1].trim()
      // Don't return very short locations or stop words
      if (locationText.length > 2 && !isStopWord(locationText)) {
        return {
          location: locationText,
          preposition: prep,
          type: info.type,
          weight: info.weight,
          heightRelated: info.heightRelated || false,
          fullPhrase: `${prep} ${locationText}`,
        }
      }
    }
  }
  return null
}

// ============================================================================
// SECTION G4: AMBIGUITY DETECTION
// Words that could mean different things depending on context
// ============================================================================

export const AMBIGUOUS_WORDS = {
  // "Fall" - could be Working at Height or Slip and Trip
  'fall': {
    contexts: [
      { pattern: /fall\s+from|fell\s+from|fall\s+off|fell\s+off|falling\s+from/, hazard: 'Working at Height', confidence: 0.95 },
      { pattern: /fall\s+into|fell\s+into/, hazard: 'Confined Spaces', confidence: DEFAULT_CONFIDENCE },
      { pattern: /slip.*fall|trip.*fall|fall.*slip|fall.*trip/, hazard: 'Slip and Trip', confidence: 0.85 },
      { pattern: /same\s+level|ground\s+level|floor/, hazard: 'Slip and Trip', confidence: 0.8 },
    ],
    default: { hazard: 'Working at Height', confidence: DEFAULT_CONFIDENCE }
  },

  // "Fire" - could be actual fire hazard or fire-fighting equipment
  'fire': {
    contexts: [
      { pattern: /fire\s+extinguisher|fire\s+ext|extinguisher/, hazard: 'Fire', confidence: 0.8 },
      { pattern: /fire\s+drill|fire\s+alarm|fire\s+exit|fire\s+escape/, hazard: 'Fire', confidence: 0.75 },
      { pattern: /on\s+fire|caught\s+fire|fire\s+broke|fire\s+started/, hazard: 'Fire', confidence: 0.95 },
      { pattern: /hot\s+work|welding|cutting|grinding/, hazard: 'Hot Work', confidence: 0.85 },
    ],
    default: { hazard: 'Fire', confidence: DEFAULT_CONFIDENCE }
  },

  // "Water" - Worker Welfare, Environmental, Slip hazards
  // NOTE: "Working on or Near Water" keyword detection REMOVED - only explicit Excel data classifies to this hazard
  'water': {
    contexts: [
      // Worker Welfare - drinking water and amenities (HIGH CONFIDENCE)
      { pattern: /drinking\s+water|potable\s+water|water\s+cooler|water\s+dispenser|water\s+station/, hazard: 'Worker Welfare', confidence: 0.95 },
      { pattern: /no\s+drinking\s+water|no\s+potable\s+water|lack\s+of\s+drinking\s+water/, hazard: 'Worker Welfare', confidence: 0.95 },
      { pattern: /water\s+not\s+available|water\s+not\s+provided|insufficient\s+water/, hazard: 'Worker Welfare', confidence: 0.95 },
      { pattern: /clean\s+water|filtered\s+water|safe\s+water|hot\s+water|cold\s+water/, hazard: 'Worker Welfare', confidence: 0.9 },
      { pattern: /water\s+bottle|water\s+jug|water\s+container|water\s+supply\s+for\s+drinking/, hazard: 'Worker Welfare', confidence: 0.9 },
      { pattern: /washing\s+water|hand\s+washing|sanitary\s+water|hygiene/, hazard: 'Worker Welfare', confidence: 0.9 },
      { pattern: /water\s+shortage|water\s+issue|water\s+problem|water\s+complaint/, hazard: 'Worker Welfare', confidence: 0.85 },
      { pattern: /water\s+tank|water\s+storage/, hazard: 'Worker Welfare', confidence: 0.75 },
      // Water filter/maintenance (welfare)
      { pattern: /water\s+filter|filter.*replaced|filter.*not\s+replaced|water\s+filtration/, hazard: 'Worker Welfare', confidence: 0.95 },
      // No water / water availability (welfare)
      { pattern: /no\s+water|without\s+water|water\s+was\s+not|water\s+was\s+available/, hazard: 'Worker Welfare', confidence: 0.9 },
      { pattern: /availability\s+of\s+water|water\s+in\s+toilet|water\s+in\s+washroom/, hazard: 'Worker Welfare', confidence: 0.9 },
      // Water gallons/bottles thrown (housekeeping)
      { pattern: /water\s+gallon|gallon.*water|water.*thrown|thrown.*water/, hazard: 'Housekeeping', confidence: 0.85 },

      // Environmental - sewage/wastewater (NOT drowning hazard)
      { pattern: /sewage|wastewater|waste\s+water|toilet\s+overflow|overflowed/, hazard: 'Environmental', confidence: 0.95 },
      { pattern: /spilled\s+from.*toilet|toilet.*spill|contaminated\s+ground/, hazard: 'Environmental', confidence: 0.9 },

      // Respiratory Hazard - water spraying for dust suppression
      { pattern: /sprinkling\s+water|water\s+sprinkling|spraying\s+water|water\s+spray/, hazard: 'Respiratory Hazard', confidence: 0.85 },
      { pattern: /dust\s+suppression|without\s+sprinkling/, hazard: 'Respiratory Hazard', confidence: 0.85 },

      // Slip and Trip - water causing slipping
      { pattern: /water\s+spill|wet\s+floor|water\s+on\s+floor|water\s+leak|leaking\s+water/, hazard: 'Slip and Trip', confidence: 0.85 },
      { pattern: /slippery.*water|water.*slippery|puddle|pooling\s+water/, hazard: 'Slip and Trip', confidence: 0.85 },
    ],
    // DEFAULT: Worker Welfare (most construction site "water" mentions are welfare-related)
    default: { hazard: 'Worker Welfare', confidence: 0.5 }
  },

  // "Dust" - usually Respiratory Hazard
  'dust': {
    contexts: [
      { pattern: /silica|crystalline/, hazard: 'Respiratory Hazard', confidence: 0.95 },
      { pattern: /dust\s+control|dust\s+suppression|water\s+spray/, hazard: 'Respiratory Hazard', confidence: 0.9 },
      { pattern: /inhal|breath|lung|respiratory/, hazard: 'Respiratory Hazard', confidence: 0.95 },
    ],
    default: { hazard: 'Respiratory Hazard', confidence: 0.85 }
  },

  // "Pit" - could be Confined Space or Breaking Ground
  'pit': {
    contexts: [
      { pattern: /confined|entry|enter|entrant/, hazard: 'Confined Spaces', confidence: 0.9 },
      { pattern: /open\s+pit|pit\s+open|unprotected\s+pit/, hazard: 'Breaking Ground & Excavation', confidence: 0.9 },
      { pattern: /inspection\s+pit|service\s+pit/, hazard: 'Confined Spaces', confidence: 0.8 },
      { pattern: /fall.*pit|pit.*fall/, hazard: 'Breaking Ground & Excavation', confidence: 0.85 },
    ],
    default: { hazard: 'Breaking Ground & Excavation', confidence: DEFAULT_CONFIDENCE }
  },

  // "Tank" - could be Confined Space or storage
  'tank': {
    contexts: [
      { pattern: /confined|entry|enter|entrant|inside\s+tank/, hazard: 'Confined Spaces', confidence: 0.95 },
      { pattern: /water\s+tank|storage\s+tank|fuel\s+tank/, hazard: 'General Site Issues', confidence: 0.6 },
      { pattern: /cleaning.*tank|tank.*cleaning/, hazard: 'Confined Spaces', confidence: 0.9 },
    ],
    default: { hazard: 'Confined Spaces', confidence: DEFAULT_CONFIDENCE }
  },

  // "Heat" - could be Working in Heat or Hot Work
  'heat': {
    contexts: [
      { pattern: /hot\s+work|welding|cutting|grinding|burning/, hazard: 'Hot Work', confidence: 0.9 },
      { pattern: /heat\s+stress|heat\s+stroke|working\s+in\s+heat|hot\s+weather/, hazard: 'Working in Heat', confidence: 0.95 },
      { pattern: /heat\s+exposure|high\s+temperature|extreme\s+heat/, hazard: 'Working in Heat', confidence: 0.9 },
    ],
    default: { hazard: 'Working in Heat', confidence: DEFAULT_CONFIDENCE }
  },

  // "Crane" - could be Lifting or Mobile Plant
  'crane': {
    contexts: [
      { pattern: /lift|lifting|hoist|sling|rigging|load/, hazard: 'Lifting', confidence: 0.9 },
      { pattern: /crane\s+operator|operating\s+crane|crane\s+operation/, hazard: 'Mobile Plant & Equipment', confidence: 0.85 },
      { pattern: /struck|collision|swing/, hazard: 'Mobile Plant & Equipment', confidence: 0.85 },
    ],
    default: { hazard: 'Lifting', confidence: 0.75 }
  },

  // "Scaffold" - could be Working at Height or Temporary Works
  'scaffold': {
    contexts: [
      { pattern: /fall|fell|height|working\s+on|access/, hazard: 'Working at Height', confidence: 0.9 },
      { pattern: /erect|dismantle|install|modify|alter/, hazard: 'Temporary Works', confidence: 0.85 },
      { pattern: /collapse|unstable|unsafe/, hazard: 'Temporary Works', confidence: 0.9 },
      { pattern: /tag|inspection|green\s+tag|red\s+tag/, hazard: 'Temporary Works', confidence: 0.8 },
    ],
    default: { hazard: 'Working at Height', confidence: 0.8 }
  },

  // "Excavation" - usually Breaking Ground, but could be others
  'excavation': {
    contexts: [
      { pattern: /collapse|cave|caving/, hazard: 'Breaking Ground & Excavation', confidence: 0.95 },
      { pattern: /edge|fall|fell/, hazard: 'Breaking Ground & Excavation', confidence: 0.9 },
      { pattern: /confined|entry|enter/, hazard: 'Confined Spaces', confidence: 0.8 },
      { pattern: /shoring|support|protection/, hazard: 'Breaking Ground & Excavation', confidence: 0.95 },
    ],
    default: { hazard: 'Breaking Ground & Excavation', confidence: 0.9 }
  },
}

/**
 * Resolve ambiguous word based on context
 */
export const resolveAmbiguity = (text, word) => {
  if (!text || !word) return null
  const lowerText = text.toLowerCase()
  const ambiguityInfo = AMBIGUOUS_WORDS[word.toLowerCase()]

  if (!ambiguityInfo) return null

  // Check each context pattern
  for (const context of ambiguityInfo.contexts) {
    if (context.pattern.test(lowerText)) {
      return {
        word,
        hazard: context.hazard,
        confidence: context.confidence,
        resolved: true,
        matchedPattern: context.pattern.toString(),
      }
    }
  }

  // Return default if no specific context matched
  return {
    word,
    hazard: ambiguityInfo.default.hazard,
    confidence: ambiguityInfo.default.confidence,
    resolved: false,
    reason: 'Using default - no specific context found',
  }
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
    filteredKeywords: [],   // Non-noise keywords only
    mainSubject: null,      // The primary problem/hazard
    mainKeyword: null,      // The main hazard-indicating keyword
    mainKeywordIsSignal: false, // Is main keyword a known signal word?
    location: null,         // WHERE it occurred
    locationInfo: null,     // Detailed location info (preposition, type)
    cause: null,            // Root cause (if identified)
    consequence: null,      // Outcome (if identified)
    deviation: null,        // What went wrong (ISSUE)
    actor: null,            // WHO was involved (person/role)
    actorType: null,        // Category of actor (worker, operator, supervisor, etc.)
    actorIsSpecialist: false, // Is the actor a specialist role?
    actorSuggestedHazard: null, // Hazard suggested by actor role
    actorHazardConfidence: 0, // Confidence from actor role
    object: null,           // WHAT was involved (equipment/material)
    objectType: null,       // Category of object
    objectSuggestedHazard: null, // Hazard suggested by object
    objectHazardConfidence: 0, // Confidence from object
    action: null,           // WHAT happened (verb/action)
    actionType: null,       // Type of action (incident, condition, work, observation)
    ambiguities: [],        // Ambiguous words and their resolutions
    confidence: 0,          // Overall parsing confidence
    pattern: null,          // Which pattern matched
    summary: null,          // WHO/WHAT/WHERE summary for root cause
  }

  // Step 0: Extract actor (WHO) - do this first as it helps with context
  const actorInfo = extractActor(normalizedText)
  if (actorInfo) {
    result.actor = actorInfo.actor
    result.actorType = actorInfo.type
    result.actorIsSpecialist = actorInfo.isSpecialist || false
    result.actorSuggestedHazard = actorInfo.suggestedHazard
    result.actorHazardConfidence = actorInfo.hazardConfidence || 0.6

    // Specialist roles get higher keyword weight
    const actorWeight = actorInfo.isSpecialist ? 0.85 : 0.6
    result.keywords.push({
      text: actorInfo.actor,
      role: 'ACTOR',
      weight: actorWeight,
      suggestedHazard: actorInfo.suggestedHazard,
      isSpecialist: actorInfo.isSpecialist
    })
  }

  // Step 0b: Extract object (WHAT) - physical item involved
  const objectInfo = extractObject(normalizedText)
  if (objectInfo) {
    result.object = objectInfo.object
    result.objectType = objectInfo.type
    result.objectSuggestedHazard = objectInfo.suggestedHazard
    result.objectHazardConfidence = objectInfo.hazardConfidence || DEFAULT_CONFIDENCE

    result.keywords.push({
      text: objectInfo.object,
      role: 'OBJECT',
      weight: objectInfo.hazardConfidence || DEFAULT_CONFIDENCE,
      suggestedHazard: objectInfo.suggestedHazard
    })
  }

  // Step 0c: Extract action (WHAT HAPPENED) - verb/action
  const actionInfo = extractAction(normalizedText)
  if (actionInfo) {
    result.action = actionInfo.action
    result.actionType = actionInfo.type
    result.keywords.push({ text: actionInfo.action, role: 'ACTION', weight: 0.5 })
  }

  // Step 0d: Extract location with preposition analysis
  const locationInfo = extractLocation(normalizedText)
  if (locationInfo) {
    result.locationInfo = locationInfo
    // Don't overwrite if already set by pattern matching
    if (!result.location) {
      result.location = locationInfo.location
    }
  }

  // Step 0e: Check for ambiguous words and resolve them
  for (const ambiguousWord of Object.keys(AMBIGUOUS_WORDS)) {
    if (normalizedText.includes(ambiguousWord)) {
      const resolution = resolveAmbiguity(normalizedText, ambiguousWord)
      if (resolution) {
        result.ambiguities.push(resolution)
      }
    }
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
              result.keywords.push({ text: value, role: role, weight: role === 'PRIMARY' ? DEFAULT_CONFIDENCE : LOW_CONFIDENCE })
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

  // Step 4: Extract main keyword and filter noise
  const filteredWords = filterNoiseWords(normalizedText)
  result.filteredKeywords = filteredWords  // Non-noise words only

  const mainKw = extractMainKeyword(normalizedText)
  if (mainKw) {
    result.mainKeyword = mainKw.keyword
    result.mainKeywordIsSignal = mainKw.isSignal
  }

  // Step 5: Summarize WHO/WHAT/WHERE for root cause analysis
  result.summary = {
    who: result.actor || null,
    what: result.mainSubject || result.object || result.mainKeyword || null,
    where: result.location || null,
    issue: result.deviation || result.mainSubject || null,
    mainKeyword: result.mainKeyword || null,
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
    analysis.consequenceConfidence = parsed.confidence * DEFAULT_CONFIDENCE
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
