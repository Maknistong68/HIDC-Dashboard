// Fallback category for observations requiring manual review
export const FALLBACK_CATEGORY = 'General Site Issues'

// Sub-region options for filter dropdowns
export const SUB_REGION_OPTIONS = [
  { value: 'SUB REGION 1', label: 'Sub Region 1' },
  { value: 'SUB REGION 2', label: 'Sub Region 2' },
  { value: 'SUB REGION 3', label: 'Sub Region 3' },
  { value: 'SUB REGION 4', label: 'Sub Region 4' },
  { value: 'SUB REGION 5', label: 'Sub Region 5' },
]

// Incident Types with severity levels
// Colors follow full-spectrum gradient matching PYRAMID_SECTIONS
export const INCIDENT_TYPES = [
  // Human Injury/Illness (HUM) - Red spectrum
  { value: 'fatality', label: 'Fatality', severity: 'critical', color: '#991b1b' },
  { value: 'lti', label: 'Lost Time Injury (LTI)', severity: 'critical', color: '#dc2626' },
  { value: 'mti', label: 'Medical Treatment Injury (MTI)', severity: 'high', color: '#ea580c' },
  { value: 'fac', label: 'First Aid Case (FAC)', severity: 'medium', color: '#f59e0b' },
  // Env / Property / Other
  { value: 'environmental', label: 'Environmental', severity: 'medium', color: '#d97706' },
  { value: 'fire', label: 'Fire', severity: 'high', color: '#ef4444' },
  { value: 'security', label: 'Security', severity: 'medium', color: '#78716c' },
  { value: 'damage-to-property', label: 'Damage to Property', severity: 'medium', color: '#65a30d' },
  // Legacy sub-types (mapped to consolidated types during parsing)
  { value: 'env-major', label: 'ENV Major/Severe (P1)', severity: 'high', color: '#d97706' },
  { value: 'env-moderate', label: 'ENV Moderate (P2)', severity: 'medium', color: '#d97706' },
  { value: 'env-minor', label: 'ENV Minor (P3)', severity: 'low', color: '#d97706' },
  { value: 'dmg-light-vehicle', label: 'Light Vehicle / MV', severity: 'medium', color: '#65a30d' },
  { value: 'dmg-heavy-plant', label: 'Heavy Plant', severity: 'medium', color: '#65a30d' },
  { value: 'dmg-truck-trailer', label: 'Truck & Trailer', severity: 'medium', color: '#65a30d' },
  { value: 'dmg-static-equipment', label: 'Static Equipment', severity: 'medium', color: '#65a30d' },
  { value: 'property-damage', label: 'Property Damage', severity: 'medium', color: '#65a30d' },
  // Observations - Teal/Cyan/Blue spectrum
  { value: 'near-miss', label: 'Near Miss', severity: 'low', color: '#059669' },
  { value: 'ncr', label: 'Non-Conformance', severity: 'low', color: '#0d9488' },
  { value: 'unsafe-act', label: 'Unsafe Act', severity: 'observation', color: '#0891b2' },
  { value: 'unsafe-condition', label: 'Unsafe Condition', severity: 'observation', color: '#0284c7' },
  // Proactive - Blue/Violet/Purple spectrum
  { value: 'positive', label: 'Positive Observation', severity: 'positive', color: '#2563eb' },
  { value: 'leadership', label: 'Leadership Event', severity: 'leadership', color: '#7c3aed' },
  { value: 'emergency-drill', label: 'Emergency Drill', severity: 'proactive', color: '#9333ea' },
]

// Type groupings for aggregation
// Recordable incidents (all consequence-based sub-types + legacy types)
export const RECORDABLE_INCIDENT_TYPES = [
  'fatality', 'lti', 'mti', 'fac',
  'environmental', 'fire', 'security', 'damage-to-property',
  'env-major', 'env-moderate', 'env-minor',
  'dmg-light-vehicle', 'dmg-heavy-plant', 'dmg-truck-trailer', 'dmg-static-equipment',
  'property-damage'
]

// Sub-types for incident breakdown display (full-spectrum gradient)
export const INCIDENT_SUB_TYPES = [
  { key: 'fatality', label: 'Fatality', color: '#991b1b' },
  { key: 'lti', label: 'LTI', color: '#dc2626' },
  { key: 'mti', label: 'MTI', color: '#ea580c' },
  { key: 'fac', label: 'FAC', color: '#f59e0b' },
  { key: 'environmental', label: 'Environmental', color: '#d97706' },
  { key: 'fire', label: 'Fire', color: '#ef4444' },
  { key: 'security', label: 'Security', color: '#78716c' },
  { key: 'damage-to-property', label: 'Damage to Property', color: '#65a30d' },
]

// Pyramid sections - defines the grouped, severity-ordered structure
// Colors follow full-spectrum gradient: RED → ORANGE → YELLOW → GREEN → TEAL → BLUE → PURPLE
export const PYRAMID_SECTIONS = [
  {
    id: 'incidents-hum',
    label: 'Injury / Illness',
    types: [
      { key: 'fatality', label: 'Fatality', color: '#991b1b', bgColor: '#fef2f2' },
      { key: 'lti', label: 'Lost Time Injury', color: '#dc2626', bgColor: '#fef2f2' },
      { key: 'mti', label: 'Medical Treatment', color: '#ea580c', bgColor: '#fff7ed' },
      { key: 'fac', label: 'First Aid', color: '#f59e0b', bgColor: '#fffbeb' },
    ]
  },
  {
    id: 'incidents-env-dmg',
    label: 'Env / Property / Other',
    types: [
      { key: 'environmental', label: 'Environmental', color: '#d97706', bgColor: '#fffbeb' },
      { key: 'fire', label: 'Fire', color: '#ef4444', bgColor: '#fef2f2' },
      { key: 'security', label: 'Security', color: '#78716c', bgColor: '#f5f5f4' },
      { key: 'damage-to-property', label: 'Damage to Property', color: '#65a30d', bgColor: '#f7fee7' },
    ]
  },
  {
    id: 'observations',
    label: 'Observations',
    types: [
      { key: 'near-miss', label: 'Near Miss', color: '#059669', bgColor: '#ecfdf5' },
      { key: 'ncr', label: 'Non-Conformance', color: '#0d9488', bgColor: '#f0fdfa' },
      { key: 'unsafe-act', label: 'Unsafe Act', color: '#0891b2', bgColor: '#ecfeff' },
      { key: 'unsafe-condition', label: 'Unsafe Condition', color: '#0284c7', bgColor: '#f0f9ff' },
    ]
  },
  {
    id: 'proactive',
    label: 'Proactive',
    types: [
      { key: 'positive', label: 'Positive Observation', color: '#2563eb', bgColor: '#eff6ff' },
      { key: 'leadership', label: 'Leadership Event', color: '#7c3aed', bgColor: '#f5f3ff' },
      { key: 'emergency-drill', label: 'Emergency Drill', color: '#9333ea', bgColor: '#faf5ff' },
    ]
  },
]

// Negative observation types (for ratio calculations)
export const NEGATIVE_OBSERVATION_TYPES = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr']

// Derived type groupings for chart categorization (aligned with PYRAMID_SECTIONS)
export const INCIDENT_CATEGORY_TYPES = [
  'fatality', 'lti', 'mti', 'fac',
  'environmental', 'fire', 'security', 'damage-to-property'
]
export const PROACTIVE_TYPES = ['positive', 'leadership', 'emergency-drill']

// 27 Approved Hazard Categories (HAZARDS ONLY - controls removed)
// 14 Significant Hazards + 13 Additional Hazards
// Observations without clear hazard keywords → "General Site Issues" for manual review
export const HAZARD_CATEGORIES = [
  // === 14 SIGNIFICANT HAZARDS ===
  'Breaking Ground & Excavation',
  'Confined Spaces',
  'Energized System',
  'Explosives & Blasting',
  'Fire',
  'Hot Work',
  'Lifting',
  'Mobile Plant & Equipment',
  'Temporary Works',
  'Driving',
  'Working at Height',
  'Working in Heat',
  'Working on or Near Live Roads',
  'Working on or Near Water',
  // === 13 ADDITIONAL HAZARDS ===
  'Physical Hazard',           // Struck-by, falling objects, sharp objects, impalement
  'Mechanical Hazard',         // Caught-in/between, crushing, pinch points, machinery
  'COSHH',
  'Respiratory Hazard',        // Dust, silica, fumes, particles, airborne
  'Housekeeping',
  'Site Security',
  'Access',
  'Worker Welfare',            // Welfare facilities, camps, accommodation
  'Tools',
  'Traffic Management',
  'Environmental',
  'Slip and Trip',             // Slip/trip hazards (falls → Working at Height)
  'General Site Issues',       // Fallback for observations requiring manual review
]

// 14 SIGNIFICANT HAZARDS - Significant Hazards Program
// These are the 14 significant hazards for HSE classification
export const SIGNIFICANT_HAZARDS = [
  'Breaking Ground & Excavation',
  'Confined Spaces',
  'Energized System',
  'Explosives & Blasting',
  'Fire',
  'Hot Work',
  'Lifting',
  'Mobile Plant & Equipment',
  'Temporary Works',
  'Driving',
  'Working at Height',
  'Working in Heat',
  'Working on or Near Live Roads',
  'Working on or Near Water',
]

// MAJOR_HAZARDS is an alias for SIGNIFICANT_HAZARDS for backward compatibility
export const MAJOR_HAZARDS = SIGNIFICANT_HAZARDS

// 13 ADDITIONAL HAZARDS - Sub-significant categories for detailed classification
// NOTE: Physical Hazard and Mechanical Hazard moved here from MAJOR_HAZARDS
// These are important hazards but not in the 14 Significant Hazards
export const SUB_SIGNIFICANT_HAZARDS = [
  'Physical Hazard',           // Struck-by, falling objects, sharp objects, impalement
  'Mechanical Hazard',         // Caught-in/between, crushing, pinch points, machinery
  'COSHH',
  'Respiratory Hazard',        // Dust, silica, fumes, particles
  'Traffic Management',
  'Site Security',
  'Housekeeping',
  'Slip and Trip',             // Slip/trip hazards (falls → Working at Height)
  'Worker Welfare',            // Welfare facilities, camps, accommodation
  'Environmental',
  'Tools',
  'Access',
  'General Site Issues',       // LAST - fallback for observations requiring manual review
]

// ALL_HAZARDS - Complete list of all hazard categories for Safety Outlook
// Combines significant hazards + sub-significant hazards (26 total)
export const ALL_HAZARDS = [...SIGNIFICANT_HAZARDS, ...SUB_SIGNIFICANT_HAZARDS]

// PRIMARY_FACTORS - Directly cause harm (1.5x weight in risk prediction)
export const PRIMARY_FACTORS = [
  'Barriers', 'Safety Devices', 'Machine Guarding', 'Signage',
  'Maintenance', 'Working at Height', 'Lifting Operations',
  'Electrical Safety', 'Excavation & Trenching', 'Confined Space',
  'Fire Safety', 'Mobile Plant & Equipment', 'Material Handling',
  'Traffic Management', 'Housekeeping', 'Environment', 'PPE',
  'No Authorization'
]

// CONTRIBUTING_FACTORS - Systemic enablers (1.0x weight in risk prediction)
export const CONTRIBUTING_FACTORS = [
  'Training', 'Supervision', 'Behavioural', 'Leadership',
  'Planning', 'Permit', 'Documentations', 'Inspections',
  'Communication', 'Procurement', 'Interfaces', 'Testing',
  'Emergency Preparedness'
]

// =============================================================================
// CRITICAL_HAZARD_KEYWORDS - ALWAYS win over location/context words
// These are checked FIRST and override any other classification
// Organized by PRIORITY (higher priority categories listed first)
// =============================================================================
export const CRITICAL_HAZARD_KEYWORDS = {
  // PRIORITY 1: Life-threatening hazards
  'Fire': [
    'petrol stored', 'petrol kept', 'petrol found', 'petrol in',
    'diesel stored', 'diesel kept', 'diesel found', 'diesel in open',
    'gasoline stored', 'gasoline kept', 'fuel stored improperly',
    'flammable liquid', 'flammable material stored', 'flammable gas',
    'fire hazard', 'ignition source', 'spark hazard', 'combustible',
    'lpg cylinder', 'gas cylinder stored', 'naked flame',
  ],
  'Energized System': [
    'live wire', 'live cable', 'exposed wire', 'exposed cable',
    'electrocution', 'electric shock', 'electrical hazard',
    'energized equipment', 'energized system', 'unprotected electrical',
    'damaged cable', 'frayed wire', 'no lockout', 'no loto',
  ],
  'Confined Spaces': [
    'confined space entry', 'entered confined', 'working in confined',
    'manhole entry', 'tank entry', 'vessel entry', 'pit entry',
    'confined space without', 'confined space permit',
  ],
  'Explosives & Blasting': [
    // Empty - no keyword auto-detection. Only classify from explicit Excel data.
  ],
  'Mechanical Hazard': [
    // Blasting operations (moved from Explosives & Blasting)
    'blasting', 'blast', 'blasting operation', 'blasting activity',
    'drill and blast', 'controlled blasting', 'blasting area',
    'blast zone', 'blast radius', 'blasting schedule',
    'detonator', 'detonators', 'detonation', 'detonating cord',
    'blasting primer', 'primer charge', 'booster', 'initiator', 'blasting cap',
    'shot firer', 'shot firing', 'blasting engineer', 'explosives engineer',
    'misfire', 'unexploded', 'flyrock', 'fly rock', 'blast damage',
    'ground vibration', 'ppv', 'peak particle velocity',
    'magazine', 'explosives magazine', 'explosive store',
    'blasting permit', 'blasting signal', 'blast warning',
    // Caught-in/between hazards
    'caught in', 'caught-in', 'caught between', 'caught-between',
    'pinch point', 'nip point', 'crushing hazard', 'moving parts', 'rotating parts',
    'entanglement', 'unguarded machinery', 'amputation',
  ],
  'Working at Height': [
    'fall from', 'fell from', 'falling from', 'fallen from',
    'working at height', 'work at height', 'roof work', 'rooftop',
    'scaffold', 'scaffolding', 'ladder', 'elevated platform',
    'unprotected edge', 'leading edge', 'fall protection', 'harness',
    'guardrail missing', 'no guardrail', 'open edge',
    'expired scaffolding tag', 'scaffold tag expired',
  ],
  'Breaking Ground & Excavation': [
    'excavation', 'excavating', 'trench', 'trenching',
    'digging', 'ground breaking', 'underground', 'buried cable',
    'buried pipe', 'utility strike', 'open pit', 'deep excavation',
    'shoring', 'benching', 'sloping', 'cave-in', 'collapse of excavation',
    // Service detection
    'cat and genny', 'cat/genny', 'cable avoidance tool', 'genny',
    'gpr', 'ground penetrating radar', 'service detection',
    'permit to dig', 'dig permit', 'breaking ground permit',
    // Design and stability
    'soil sampling', 'ground conditions', 'water table',
    'dewatering', 'surface water diversion', 'groundwater',
    // Edge protection
    'excavation edge protection', 'stop blocks', 'jersey barrier',
    'bund wall', 'material bund', 'setback from edge',
  ],
  'Lifting': [
    'crane', 'lifting operation', 'rigging', 'sling', 'shackle',
    'lift plan', 'lifting gear', 'load chart', 'outrigger',
    'banksman', 'slinger', 'signaller', 'hoisting',
    'suspended load', 'lifting accessory', 'lifting equipment',
  ],
  'Mobile Plant & Equipment': [
    'excavator', 'forklift', 'loader', 'bulldozer', 'grader',
    'roller', 'compactor', 'dump truck', 'tipper', 'concrete mixer',
    'telehandler', 'backhoe', 'plant operator', 'heavy equipment',
    'mobile plant', 'moving machinery', 'reversing vehicle',
    'banksman not', 'no banksman', 'spotter not', 'no spotter',
  ],

  // PRIORITY 2: Chemical/Health hazards
  'COSHH': [
    'chemical', 'hazardous substance', 'toxic', 'corrosive',
    'msds', 'sds', 'material safety data sheet', 'coshh assessment',
    'chemical handling', 'chemical storage', 'chemical spill',
    'hazardous material', 'dangerous goods', 'carcinogen',
    'without msds', 'no msds', 'msds not available', 'msds missing',
  ],
  'Environmental': [
    'contamination of soil', 'soil contamination', 'ground contamination',
    'oil spill', 'fuel spill', 'chemical spill', 'pollution',
    'environmental damage', 'waste disposal', 'illegal dumping',
    'water contamination', 'groundwater', 'environmental incident',
  ],

  // PRIORITY 3: Traffic/Driving
  'Traffic Management': [
    'traffic sign', 'traffic signage', 'traffic cone', 'traffic barrier',
    'haul road', 'speed limit', 'overspeeding', 'traffic control',
    'pedestrian crossing', 'traffic marshal', 'traffic management plan',
    'vehicle access', 'traffic awareness',
    'temporary traffic management', 'ttm', 'ttm plan',
    'work zone', 'work zone access', 'work zone egress',
    'vehicle intrusion', 'vehicle pedestrian segregation',
    'jersey barrier', 'water filled barrier',
    'ministry of transport', 'mot coordination',
  ],
  'Driving': [
    'driver', 'driving without', 'seatbelt not worn', 'no seatbelt',
    'speeding', 'reckless driving', 'distracted driving',
    'driver fatigue', 'driver competency', 'driving license',
    'vehicle inspection', 'pre-trip inspection',
    'reverse parking', 'not reverse parked', 'forward parked',
    'tailgating', 'following too close', 'safe distance',
    'defensive driving', 'defensive driver training',
    'mobile phone while driving', 'phone while driving',
    'unsecure load', 'unsecured load', 'load not secured',
    'route not followed', 'shortcut', 'designated route',
    'overtaking', 'unsafe overtaking', 'vehicle rollover',
  ],

  // PRIORITY 4: Other Significant Hazards
  'Working on or Near Live Roads': [
    'live road', 'live traffic', 'live carriageway',
    'roadworks', 'road works', 'highway works',
    'work zone intrusion', 'vehicle intrusion',
    'temporary traffic management', 'ttm',
    'struck by passing vehicle', 'hit by traffic',
    'roadside working', 'working near traffic',
  ],
  'Working on or Near Water': [
    // Empty - no keyword auto-detection. Only classify from explicit Excel data.
  ],
  'Working in Heat': [
    'heat stress', 'heat stroke', 'heat exhaustion',
    'thermal work limit', 'twl', 'hydration',
    'work rest cycle', 'shade area', 'cooling',
    'acclimatization', 'acclimation', 'heat illness',
    'dehydration', 'hyperthermia', 'hot environment',
  ],
  'Temporary Works': [
    'formwork', 'falsework', 'shoring', 'propping',
    'temporary structure', 'temporary support',
    'twc', 'temporary works coordinator', 'designated individual',
    'permission to load', 'permission to strike',
    'scaffold design', 'temporary stability',
  ],

  // NOTE: Permit and RAMS, Safety Supervision, Training and Competency REMOVED
  // These are CONTROLS, not hazards. The control failure belongs to the UNDERLYING hazard.
  // Example: "No permit for excavation" → Breaking Ground & Excavation (the hazard)
  // Example: "No safety officer at height work" → Working at Height (the hazard)
}

// Function to check CRITICAL_HAZARD_KEYWORDS (used in categorizeHazard)
// FIXED: Sort keywords by length (longest first) to prevent short keywords from matching before longer, more specific ones
// Example: "fire hazard" should match before "fire"
export const checkCriticalKeywords = (text) => {
  const lowerText = text.toLowerCase()

  // Check each category in priority order
  for (const [category, keywords] of Object.entries(CRITICAL_HAZARD_KEYWORDS)) {
    // Sort keywords by length descending - longer (more specific) keywords first
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)
    for (const keyword of sortedKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category
      }
    }
  }
  return null
}

// HAZARD_EXCLUSIONS - Terms that should EXCLUDE a category from matching
// These prevent misclassification when text contains misleading keywords
export const HAZARD_EXCLUSIONS = {
  'Fire': [
    'fire extinguisher', 'fire alarm', 'fire exit', 'fire drill',
    'fire watch', 'fire door', 'fire blanket', 'fire prevention',
    'fire fighting', 'fire break out', 'line of fire', 'crossfire',
    'firewall', 'fire risk assessment', 'fire warden', 'fire point',
    'fire marshal', 'fire escape route', 'fire assembly', 'fire muster',
    'firefighting equipment', 'fire hose', 'fire hydrant', 'fire brigade',
    'fire station', 'fire safety officer', 'fire resistant', 'fireproof'
  ],
  'Hot Work': [
    'hot spot', 'hot surface', 'hot pipe', 'hot equipment', 'hot tap',
    'heat stroke', 'heat exhaustion', 'hot weather', 'hotline', 'hot day',
    'hot conditions', 'hot cell', 'hot zone',
    // Exclude welfare-related observations in hot work area
    'no welfare', 'welfare facility', 'welfare not', 'lack of welfare',
    'missing welfare', 'welfare issue', 'welfare problem'
  ],
  'Lifting': [
    'forklift', 'pallet jack', 'shoplifting', 'morale lifting',
    'lifting supervisor', 'scissor lift', 'boom lift', 'cherry picker',
    'mewp', 'aerial lift', 'man lift', 'personnel lift', 'face lift',
    'lift shaft', 'elevator lift', 'platform lift'
  ],
  'Driving': [
    'pile driver', 'driven pile', 'drive shaft', 'driving rain',
    'drive coupling', 'hard drive', 'pile driving', 'sheet pile',
    'driving force', 'driving factor', 'driving motivation'
  ],
  'Working at Height': [
    'overhead hazard', 'overhead work', 'height of system',
    'tall building', 'height specification', 'height requirement',
    'height measurement', 'full height', 'at height risk',
    // Exclude "fall/fallen" when referring to objects falling over, not people
    'fallen sign', 'fallen signage', 'fallen barrier', 'fallen barricade',
    'fallen due to wind', 'fallen over', 'found fallen', 'sign fell',
    'fell down', 'fell over', 'blown over', 'knocked over', 'tipped over',
    'fallen fence', 'fallen post', 'fallen cone', 'fallen board',
    'price fall', 'fall in temperature', 'fall in pressure', 'rainfall',
    'waterfall', 'free fall', 'fall behind', 'fall short',

    // ========================================================================
    // EXCAVATION-RELATED - Should be "Breaking Ground & Excavation"
    // "Fall into excavation" is an excavation hazard, NOT working at height
    // ========================================================================
    'deep excavation', 'excavation is present', 'excavation without',
    'excavation area', 'excavation edge', 'edge of excavation',
    'edges of the deep excavation', 'edges of deep excavation',
    'unprotected edges of the deep excavation', 'unprotected edges of deep excavation',
    'unprotected edges of a deep excavation', 'unprotected edges of deep trenches',
    'unprotected edges of the deep trenches', 'edges of deep trenches',
    'falling into excavation', 'fall into excavation', 'falling in excavation',
    'falling into the excavation', 'fall into the excavation',
    'into the excavation', 'into excavation', 'in the excavation',
    'risk of vehicles or workers falling in', 'risk of falling in',
    'workers falling in', 'vehicles falling in', 'equipment falling in',
    'open ditch', 'ditch without', 'open ditches', 'ditches in the area',
    'open trench', 'trench without', 'deep trench', 'deep trenches',
    // NOTE: 'open manhole' exclusions removed — many are legitimate fall-from-height hazards
    'access to the excavation', 'egress to the excavation',
    'access and egress to the excavation', 'inside the excavation',
    'chamber preparations', 'shuttering activities inside the excavation',
    'excavation close to', 'close to the excavation',
    'near the excavation', 'excavation lacks',
    'near the edges of the deep excavation', 'near the unprotected edges',
    'ramp going to site and leading to open deep excavation',
    'leading to open deep excavation', 'leading to excavation',
    'stockpile of backfilling materials', 'backfilling materials',
    'stockpile', 'dangerously stacked', 'stacked',
    'collapse and fall onto the equipment', 'collapse onto',
    'handmade wooden ladder', 'wooden ladder',
    'dewatering activity',
    'deep pit', 'open space was observed in the deep pit', 'in the deep pit',
    'deep pit at area', 'posing a fall hazard',
    'unsafe activities in deep trenches', 'activities in deep trenches',
    'tasks in deep excavations', 'performing tasks in deep',

    // ========================================================================
    // HOUSEKEEPING-RELATED - Should be "Housekeeping"
    // Scattered materials are housekeeping, not working at height
    // ========================================================================
    'materials scattered', 'scaffolding materials scattered',
    'scaffold materials scattered', 'materials were found scattered',
    'found scattered on the ground', 'scattered on the ground',
    'scaffolding materials were thrown scattered', 'thrown scattered across the site',
    'scattered across the site', 'scaffold materials were observed scattered',
    'materials were observed scattered', 'observed scattered on the ground',
    'scaffolding materials were improperly placed on the ground',
    'improperly placed on the ground', 'placed on the ground',
    'creating a potential slip and trip hazard', 'slip and trip hazard',
    'wooden pieces and scaffolding materials were found scattered',
    'unwanted wooden pieces', 'unwanted scaffolding',
    'unwanted scaffold barricades', 'found unwanted scaffold',
    'creating a potential trip hazard', 'creating potential trip hazard',
    'creating trip hazard', 'trip hazard and contributing',
    'contributing to poor housekeeping', 'poor housekeeping conditions',
    'poor housekeeping', 'housekeeping conditions',
    'poor housekeeping observed in the scaffold material storage',
    'scaffold material storage access', 'slipping and tripping hazards',
    'slipping and tripping hazards during material shifting',
    'improper materials arrangements', 'improper materials',
    'materials arrangements', 'materials stored near the access',
    'obstructing safe movement', 'obstructing movement',
    'collision hazards for workers', 'collision hazards',
    'lying unattended', 'left unattended', 'found lying',
    'step ladders were found lying', 'ladders were found lying',
    'cement bags and scaffolding materials',
    'unsecured grating', 'grating was observed',
    'slips, trips, or falls', 'trips, or falls',
    'wooden planks are stored on an unstable', 'stored on an unstable',
    'overloaded makeshift scaffold', 'makeshift scaffold/rack',
    'high risk of collapse', 'posing a high risk of collapse',
    'scaffolding material storage area is not properly barricaded',
    'material storage area is not properly barricaded',
    'not properly barricaded, posing a risk of unauthorized access',
    'nails were observed protruding', 'nails protruding',
    'protruding from the plywood', 'nails were not removed',

    // ========================================================================
    // FIRE POINT BLOCKED - Should be "Fire"
    // Fire point access issues are fire hazards, not working at height
    // ========================================================================
    'firepoint', 'fire point', 'fire point blocked',
    'firepoint blocked', 'firepoint at the', 'fire point at the',
    'blocked by the scaffold barricade', 'blocked by scaffold barricade',
    'hindering easy access during an emergency', 'hindering access',

    // ========================================================================
    // SAFETY SIGN FALLEN - Should be "General Site Issues"
    // Fallen signage is not a working at height issue
    // ========================================================================
    'safety sign board had fallen down', 'sign board had fallen',
    'safety sign board was found fell down', 'sign board was found fell',
    'sign board fell', 'signage had fallen',

    // ========================================================================
    // CONFINED SPACE SUPERVISION - Should be "Confined Spaces"
    // Confined space work issues are not working at height
    // ========================================================================
    'safety officer in charge of confined space', 'in charge of confined space',
    'confined space does not have', 'no safety supervision in your confined space',
    'safety supervision in your confined space work', 'confined space work',

    // ========================================================================
    // PERMIT/DOCUMENTATION - Should be "General Site Issues"
    // Permit issues are administrative, not working at height
    // ========================================================================
    'permit to work was not filled', 'permit not filled',
    'cold work permit is used', 'cold work permit',
    'not the appropriate permit', 'inappropriate permit',
    'temporary works was not mentioned', 'not mentioned as a significant hazard',

    // ========================================================================
    // CONFINED SPACE - Should be "Confined Spaces"
    // ========================================================================
    'edge of the confined space', 'confined space are incomplete',
    'barricades at the edge of the confined space',

    // ========================================================================
    // LIFTING - Should be "Lifting"
    // ========================================================================
    'tripod used for lifting', 'used for lifting',
    'lifting an electrical grounding rod',

    // ========================================================================
    // PHYSICAL HAZARD - Should be "Physical Hazard"
    // Workers below scaffolding = struck-by hazard, not WAH
    // ========================================================================
    'sitting beneath scaffolding', 'beneath scaffolding activity',
    'materials could potentially fall on him', 'fall on him',
    'walking underneath', 'underneath the scaffold',

    // ========================================================================
    // EXCAVATION CAVE-IN/COLLAPSE - Should be "Breaking Ground & Excavation"
    // Cave-ins and soil collapse are excavation hazards, not WAH
    // ========================================================================
    'cave-in', 'cave in', 'cavein', 'cave-ins', 'cave ins',
    'soil collapse', 'soil collapsing', 'collapse of soil',
    'ground collapse', 'trench collapse', 'excavation collapse',
    'vibration from the compactor', 'high vibration from',
    'vibration can cause collapse', 'vibration could result in cave',
    'compaction activities', 'compactor and vehicle movement',
    'removal of excavated materials', 'excavated materials from unprotected',
    'excavation was observed without any isolation',
    'excavation was observed without',

    // ========================================================================
    // WEATHER/SIGNAGE - Should be "General Site Issues"
    // Signs falling due to weather conditions
    // ========================================================================
    'sand storm', 'sand stom', 'sandstorm', 'dust storm',
    'storm some sign', 'due to storm', 'due to wind',
    'sign fall down', 'signs fall down', 'signage fall down',

    // ========================================================================
    // GROUND-LEVEL TRIP - Should be "Housekeeping" or "Slips/Trips/Falls"
    // Tripping on materials on the ground level, not working at height
    // ========================================================================
    'tripped and almost', 'got tripped', 'about to fall down',
    'put his foot on the scaffold pipe', 'foot on the scaffold pipe',
    'scaffold pipe laying at the ground', 'pipe laying at the ground',
    'scaffold pipe on the ground', 'stepped on', 'stumbled on',
    'tripping hazard on the ground', 'trip hazard on ground',
    'materials lying on the ground', 'pipes on the ground',

    // ========================================================================
    // ELECTRICAL - Should be "Energized System"
    // Electrical contact with scaffolding is electrical hazard, not WAH
    // ========================================================================
    'electrical cable came into contact', 'cable came into contact with the scaffolding',
    'live electrical cable came into contact', 'cable contact with scaffold',
    'wire is in contact with the scaffold', 'wire in contact with scaffold',
    'wire was in contact with the scaffold', 'electrical cable in contact',
    'cable touching scaffold', 'wire touching scaffold',
    'scaffold in contact with cable', 'scaffolding in contact with cable',
    'scaffold standard in contact', 'contact with the scaffold standard',

    // ========================================================================
    // PPE ISSUES - Should be "PPE"
    // PPE compliance issues unrelated to working at height
    // ========================================================================
    'boots with no steel toe', 'no steel toe', 'without steel toe',
    'long boots with no steel', 'boots without steel toe',
    'safety boots missing', 'improper footwear',
    'inspector found on site with long boots',

    // ========================================================================
    // PATHWAY/ACCESS BLOCKING - Should be "Housekeeping"
    // Access blocked by materials is housekeeping, not WAH
    // ========================================================================
    'pedestrian walkway was blocked', 'walkway was blocked due to',
    'scaffold access was blocked', 'access was blocked due to',
    'scaffolding materials obstructed', 'materials obstructed the entire',
    'obstructed the entire pathway', 'blocked due to scaffold',
    'blocked due to the timbers', 'scaffolding materials were scattered along',
    'scaffold materials were scattered along', 'dispersed across the work zone',
    'materials are dispersed across', 'scaffold materials dispersed',
    'materials were observed stacked at the edge of the excavation',
    'stacked at the edge of excavation', 'stored on the unprotected edge',
    'stored on the edge of', 'stacked improperly at the edge',
    'stacked improperly at edge', 'positioned on the scaffold platform',
    'ledgers were positioned on', 'ledgers on top of the working platform',
    'loose material was stored on', 'materials stored on the incomplete',
    'excessive amount of wood was placed on', 'wood was placed on the scaffold',
    'several wood was placed on', 'water igloo was observed placed',
    'igloo placed on top of scaffold', 'wooden planks stored',
    'scaffolding material was inadequately placed at site',
    'scaffolding material was stacked improperly', 'material was stacked improperly',
    'scaffolding materials were obstructed', 'materials were obstructed'
  ],
  'Breaking Ground & Excavation': [
    'breeding ground', 'common ground', 'groundswell', 'background',
    'digging deeper', 'excavator', 'ground level', 'ground floor',
    'grounding', 'ground connection', 'ground wire', 'ground fault',
    'on the ground', 'playground'
  ],
  'Confined Spaces': [
    'office space', 'living space', 'storage space', 'work space',
    'spacing', 'space shuttle', 'open space', 'parking space',
    'space between', 'adequate space', 'sufficient space', 'clear space',
    // Exclude "pit" when it's about open pits/barricading, not confined space entry
    'open pit', 'open pits', 'without barricad', 'without proper barricad',
    'no barricad', 'missing barricad', 'unbarricaded', 'pit without',
    'pits without', 'pit observed', 'pits observed'
  ],
  'Working on or Near Water': [
    // Empty - no keyword auto-detection needed since keywords are also empty
  ],
  'Working in Heat': [
    'heat treatment', 'heat exchanger', 'heat insulation', 'heat shield',
    'central heating', 'heating system', 'heat pump', 'heat recovery'
  ],
  'COSHH': [
    // Exclude food/hygiene related "poison" - these are Site Welfare, not chemical hazards
    'food poison', 'food poisoning', 'food storage', 'food stored', 'food safety',
    'food contamination', 'spoiled food', 'expired food', 'rotten food',
    // Exclude fire extinguisher types - "dry chemical" is extinguisher type, not hazardous substance
    'dry chemical fire extinguisher', 'chemical fire extinguisher', 'dry chemical extinguisher',
    'co2 extinguisher', 'co2 fire extinguisher', 'foam extinguisher', 'powder extinguisher',
    'extinguish the electrical fire', 'extinguish electrical fire', 'electrical fire',
    'suitable to extinguish', 'not suitable to extinguish'
  ],
  'General Site Issues': [
    // Exclude "inspection" when it's just context for WHEN something was observed
    'during the inspection', 'during inspection', 'observed during inspection',
    'found during inspection', 'noted during inspection', 'seen during inspection',
    'inspection revealed', 'inspection found', 'inspection showed',
    'on-site inspection', 'site inspection found', 'waste was observed',
    'was observed on-site', 'was observed on site', 'observed on-site'
  ],
  'Mechanical Hazard': [
    // Exclude vehicle-related terms → Mobile Plant & Equipment
    'vehicle', 'forklift', 'excavator', 'crane', 'loader', 'bulldozer',
    'dump truck', 'mobile plant', 'heavy equipment'
  ],
  'Slip and Trip': [
    // Exclude fall-from-height contexts → Working at Height
    'fall from height', 'fell from', 'fall off', 'fell off', 'fallen from',
    'fall from scaffold', 'fall from ladder', 'fall from roof',
    'fall from platform', 'fall through opening'
  ],
  'Explosives & Blasting': [
    // Empty - no keyword auto-detection needed since keywords are also empty
  ],
  'Site Security': [
    // Exclude lifting operations - "unauthorized entry" in exclusion zone context
    'lifting activity', 'lifting operation', 'lifting work', 'lifting of',
    'crane operation', 'crane activity', 'rigging', 'rigger',
    'exclusion zone was properly established', 'exclusion zone properly established',
    'exclusion zone was established', 'restricting unauthorized entry',
    'ensuring safe operations', 'safe operations in the work area',
    // Exclude hot work - barricading to prevent unauthorized entry during welding
    'welding activities', 'welding activity', 'welding work', 'welding area',
    'hot work', 'hot works', 'fire watcher', 'fire blanket', 'cutting activities',
    'grinding activities', 'brazing', 'soldering',
    // Exclude excavation/WAH - manhole barricades for fall protection, not security
    'manhole barricade', 'manhole barrier', 'edge protection', 'fall hazard',
    'fall protection', 'excavation edge', 'excavation barricade',
    'trench barricade', 'unprotected edge', 'leading edge',
    // Exclude scaffolding contexts
    'scaffold barricade', 'scaffolding barricade', 'scaffolding barrier',
    'scaffold erection', 'scaffold dismantling', 'working platform'
  ]
}

// CONTEXT_REDIRECTS - Remap misleading terms to the CORRECT category
// Checked FIRST before any other classification (highest priority)
// IMPORTANT: Longer, more specific patterns MUST come before shorter patterns
export const CONTEXT_REDIRECTS = {
  // ============================================================================
  // PRIORITY 1: Multi-hazard observations - route to PRIMARY hazard
  // These patterns prevent "Working at Height" from capturing unrelated hazards
  // ============================================================================

  // Fire point/equipment access blocked → Fire (not Working at Height even if scaffold mentioned)
  'fire point access': 'Fire',
  'fire point was blocked': 'Fire',
  'fire point blocked': 'Fire',
  'fire extinguisher access': 'Fire',
  'fire extinguisher blocked': 'Fire',
  'blocked by scaffold materials': 'Fire',  // fire point context

  // Scaffolding/materials scattered = Housekeeping (not Working at Height)
  'scaffolding components were found scattered': 'Housekeeping',
  'scaffolding components found scattered': 'Housekeeping',
  'scaffolding components scattered': 'Housekeeping',
  'scaffold materials scattered': 'Housekeeping',
  'scaffolding materials were observed stored in a mixed': 'Housekeeping',
  'scaffolding materials stored in mixed': 'Housekeeping',
  'scaffolding clamps were found scattered': 'Housekeeping',
  'scaffolding clamps found scattered': 'Housekeeping',
  'scaffolding clamps scattered': 'Housekeeping',
  'scaffold pipe has been stored on the site on the access way': 'Housekeeping',
  'scaffold pipe stored on access way': 'Housekeeping',
  'creating trip hazards and contributing to poor housekeeping': 'Housekeeping',
  'creating trip hazards and poor housekeeping': 'Housekeeping',
  'creating a tripping hazard and contributing to poor housekeeping': 'Housekeeping',
  'left unattended on site, no housekeeping': 'Housekeeping',
  'no housekeeping': 'Housekeeping',
  'poor housekeeping': 'Housekeeping',
  'wood timber was disposed of, but the nails were not removed': 'Housekeeping',
  'nails were not removed': 'Housekeeping',

  // Drone/theft/missing equipment → Site Security
  'drone was no longer': 'Site Security',
  'drone was missing': 'Site Security',
  'missing drone': 'Site Security',
  'theft': 'Site Security',
  'stolen': 'Site Security',
  'disappeared': 'Site Security',
  'potential theft': 'Site Security',
  'office security': 'Site Security',
  'access control': 'Site Security',

  // Deep excavation/trench/ditch hazards → Breaking Ground & Excavation
  'close to the unprotected edges of a deep excavation': 'Breaking Ground & Excavation',
  'unprotected edges of a deep excavation': 'Breaking Ground & Excavation',
  'edges of a deep excavation': 'Breaking Ground & Excavation',
  'deep excavation without': 'Breaking Ground & Excavation',
  'deep excavation area': 'Breaking Ground & Excavation',
  'excavation area': 'Breaking Ground & Excavation',
  'material management activities near the deep excavation': 'Breaking Ground & Excavation',
  'climbing in and out of the excavation': 'Breaking Ground & Excavation',
  'inside an excavation pit': 'Breaking Ground & Excavation',
  'excavation pit without': 'Breaking Ground & Excavation',
  'access/egress structure': 'Breaking Ground & Excavation',
  'entering and exiting a deep excavation': 'Breaking Ground & Excavation',
  'unprotected edges were found around a deep trench': 'Breaking Ground & Excavation',
  'unprotected edges around a deep trench': 'Breaking Ground & Excavation',
  'deep trench': 'Breaking Ground & Excavation',
  'barricades on the ditch': 'Breaking Ground & Excavation',
  'barricades around the ditch': 'Breaking Ground & Excavation',
  'installed around the ditch': 'Breaking Ground & Excavation',
  'installed on the ditch': 'Breaking Ground & Excavation',
  'ditch where there is a risk': 'Breaking Ground & Excavation',

  // Scaffold access on roadway → Traffic Management
  'scaffold access entrance is positioned directly on an active roadway': 'Traffic Management',
  'positioned directly on an active roadway': 'Traffic Management',
  'on an active roadway': 'Traffic Management',
  'active roadway': 'Traffic Management',
  'exposing personnel to vehicular traffic': 'Traffic Management',
  'vehicular traffic and collision': 'Traffic Management',
  'vehicular traffic': 'Traffic Management',

  // Barriers near slope/ramp for vehicles → Traffic Management or Access
  'barriers were not installed on the opposite side of the newly used ramp': 'Traffic Management',
  'risk of fall of vehicles and equipment': 'Traffic Management',
  'fall of vehicles': 'Traffic Management',
  'jersey barriers had been placed very close to the edge of a slope': 'Traffic Management',
  'close to the edge of a slope': 'Traffic Management',

  // Harnesses stored improperly (not height work) → Housekeeping
  'harnesses were found hanging on the access ladder': 'Housekeeping',
  'harnesses hanging on the access ladder': 'Housekeeping',
  'harness storage point': 'Housekeeping',
  'harness storage': 'Housekeeping',
  'harness stored direct to the sunlight': 'Housekeeping',
  'harness has been stored on the wheelbarrows': 'Housekeeping',
  'harness stored on wheelbarrows': 'Housekeeping',
  'full body harness harness stored direct to the sunlight': 'Housekeeping',
  'full body harness stored': 'Housekeeping',
  'blocked by stored materials': 'Housekeeping',

  // Trip hazard signage → Access or Slip and Trip
  'watch your step signage': 'Slip and Trip',
  'no watch your step signage': 'Slip and Trip',
  'trip hazard for workers': 'Slip and Trip',
  'potentially posing a trip hazard': 'Slip and Trip',
  'posing a trip hazard': 'Slip and Trip',

  // Confined space work → Confined Spaces (not Working at Height)
  'inside confined space': 'Confined Spaces',
  'formwork is in progress inside confined space': 'Confined Spaces',
  'dismantling of formwork is in progress inside confined space': 'Confined Spaces',
  'safety officer in charge of confined space does not have': 'Confined Spaces',
  'safety officer in charge of confined space': 'Confined Spaces',
  'in charge of confined space': 'Confined Spaces',
  'no safety supervision in your confined space work': 'Confined Spaces',
  'safety supervision in your confined space': 'Confined Spaces',
  'confined space work': 'Confined Spaces',

  // Fire point blocked → Fire (not Working at Height)
  'firepoint at the': 'Fire',
  'fire point at the': 'Fire',
  'firepoint blocked': 'Fire',
  'fire point blocked': 'Fire',
  'blocked by the scaffold barricade, hindering easy access': 'Fire',
  'blocked by scaffold barricade, hindering': 'Fire',
  'hindering easy access during an emergency': 'Fire',

  // Safety sign fallen → General Site Issues (not Working at Height)
  'safety sign board had fallen down': 'General Site Issues',
  'sign board had fallen down': 'General Site Issues',
  'safety sign board was found fell down': 'General Site Issues',
  'sign board was found fell down': 'General Site Issues',
  'safety sign board fell': 'General Site Issues',

  // Nails protruding → Physical Hazard (not Working at Height)
  'nails were observed protruding from the plywood': 'Physical Hazard',
  'nails were observed protruding': 'Physical Hazard',
  'nails protruding from the plywood': 'Physical Hazard',
  'nails protruding': 'Physical Hazard',

  // Lifting operations → Lifting
  'lifting scaffolding material manually with a rope': 'Lifting',
  'lifting material manually with a rope': 'Lifting',
  'lifting manually with a rope': 'Lifting',
  'without using proper equipment like a pulley': 'Lifting',
  'risk of falling objects': 'Physical Hazard',
  'uninspected scaffold structure tripod used for lifting': 'Lifting',
  'tripod used for lifting': 'Lifting',

  // ============================================================================
  // EXCAVATION HAZARDS → Breaking Ground & Excavation
  // These override "fall" keywords when excavation is the context
  // ============================================================================
  'deep excavation is present without sturdy barriers': 'Breaking Ground & Excavation',
  'deep excavation is present without any barriers': 'Breaking Ground & Excavation',
  'deep excavation is present without': 'Breaking Ground & Excavation',
  'deep excavation without': 'Breaking Ground & Excavation',
  'excavation is present without': 'Breaking Ground & Excavation',
  'risk of vehicles or workers falling in': 'Breaking Ground & Excavation',
  'posing a risk of vehicles or workers falling': 'Breaking Ground & Excavation',
  'immediate installation of protective barriers': 'Breaking Ground & Excavation',
  'installation of protective barriers': 'Breaking Ground & Excavation',
  'chamber preparations and shuttering activities inside the excavation': 'Breaking Ground & Excavation',
  'shuttering activities inside the excavation': 'Breaking Ground & Excavation',
  'inside the excavation area': 'Breaking Ground & Excavation',
  'lack of safe access and egress': 'Breaking Ground & Excavation',
  'only one ladder was available for workers to enter and exit the excavation': 'Breaking Ground & Excavation',
  'enter and exit the excavation': 'Breaking Ground & Excavation',
  'stockpile of backfilling materials is dangerously stacked': 'Breaking Ground & Excavation',
  'backfilling materials is dangerously stacked': 'Breaking Ground & Excavation',
  'dangerously stacked': 'Breaking Ground & Excavation',
  'near 90-degree cut': 'Breaking Ground & Excavation',
  'too steep and unstable': 'Breaking Ground & Excavation',
  'could collapse and fall onto the equipment': 'Breaking Ground & Excavation',
  'collapse and fall onto': 'Breaking Ground & Excavation',
  'unwanted ramp going to site and leading to open deep excavation': 'Breaking Ground & Excavation',
  'leading to open deep excavation': 'Breaking Ground & Excavation',
  'ramp leading to excavation': 'Breaking Ground & Excavation',
  'excavation close to the vehicle access': 'Breaking Ground & Excavation',
  'close to the vehicle access': 'Breaking Ground & Excavation',
  'prevent the man/equipment from falling on the deep excavation': 'Breaking Ground & Excavation',
  'falling on the deep excavation': 'Breaking Ground & Excavation',
  'deep excavation close to the access road': 'Breaking Ground & Excavation',
  'excavation close to the access road': 'Breaking Ground & Excavation',
  'preventing vehicles or equipment from falling': 'Breaking Ground & Excavation',
  'access and egress to the excavation were being made using': 'Breaking Ground & Excavation',
  'egress to the excavation': 'Breaking Ground & Excavation',
  'handmade wooden ladder': 'Breaking Ground & Excavation',
  'ladder was not secured, appeared unstable': 'Breaking Ground & Excavation',
  'steel works are ongoing on top of the pit': 'Breaking Ground & Excavation',
  'on top of the pit where the edges are open': 'Breaking Ground & Excavation',
  'top of the pit': 'Breaking Ground & Excavation',

  // Deep pit → Breaking Ground & Excavation
  'open space was observed in the deep pit': 'Breaking Ground & Excavation',
  'deep pit at area': 'Breaking Ground & Excavation',
  'in the deep pit': 'Breaking Ground & Excavation',
  'deep pit': 'Breaking Ground & Excavation',

  // Unprotected edges of excavation/trenches → Breaking Ground & Excavation
  'unprotected edges of the deep excavation': 'Breaking Ground & Excavation',
  'unprotected edges of deep excavation': 'Breaking Ground & Excavation',
  'unprotected edges of a deep excavation': 'Breaking Ground & Excavation',
  'unprotected edges of deep trenches': 'Breaking Ground & Excavation',
  'unprotected edges of the deep trenches': 'Breaking Ground & Excavation',
  'edges of the deep excavation': 'Breaking Ground & Excavation',
  'edges of deep excavation': 'Breaking Ground & Excavation',
  'edges of deep trenches': 'Breaking Ground & Excavation',
  'near the edges of the deep excavation': 'Breaking Ground & Excavation',
  'near the unprotected edges': 'Breaking Ground & Excavation',
  'standing near the unprotected edges': 'Breaking Ground & Excavation',
  'outside the barricades near the edges of the deep excavation': 'Breaking Ground & Excavation',
  'site supervisor found outside the barricades': 'Breaking Ground & Excavation',
  'placed at the unprotected edges of the deep excavation': 'Breaking Ground & Excavation',
  'at the unprotected edges': 'Breaking Ground & Excavation',
  'pose a significant fall hazard': 'Breaking Ground & Excavation',
  'posed a significant fall hazard': 'Breaking Ground & Excavation',
  'significant fall hazard to workers and vehicles': 'Breaking Ground & Excavation',
  'risk of workers or equipment falling into the excavation': 'Breaking Ground & Excavation',
  'falling into the excavation': 'Breaking Ground & Excavation',
  'unsafe activities in deep trenches': 'Breaking Ground & Excavation',
  'tasks in deep excavations': 'Breaking Ground & Excavation',
  'working in deep excavations': 'Breaking Ground & Excavation',
  'unprotected edges of deep excavations': 'Breaking Ground & Excavation',
  'standing at the unprotected edges of deep excavations': 'Breaking Ground & Excavation',
  'workers are standing at the unprotected edges': 'Breaking Ground & Excavation',

  // Open manhole — removed blanket Confined Spaces override
  // Many open manhole observations are about fall hazards (WAH), not confined space entry
  // Let the classifier determine the correct category from description context

  // Confined space with barricade issues
  'barricades at the edge of the confined space are incomplete': 'Confined Spaces',
  'edge of the confined space are incomplete': 'Confined Spaces',
  'open ditches in the area': 'Breaking Ground & Excavation',

  // Dewatering activity → Breaking Ground & Excavation (water management in excavation)
  'dewatering activity has commenced': 'Breaking Ground & Excavation',
  'dewatering activity': 'Breaking Ground & Excavation',

  // ============================================================================
  // HOUSEKEEPING HAZARDS → Housekeeping
  // Scattered materials, improper storage, trip hazards from materials
  // ============================================================================
  'unwanted wooden pieces and scaffolding materials were found scattered': 'Housekeeping',
  'wooden pieces and scaffolding materials were found scattered': 'Housekeeping',
  'scaffolding materials were found scattered': 'Housekeeping',
  'found scattered on the ground': 'Housekeeping',
  'creating a potential trip hazard and contributing to poor housekeeping': 'Housekeeping',
  'potential trip hazard and contributing to poor housekeeping': 'Housekeeping',
  'contributing to poor housekeeping conditions': 'Housekeeping',
  'poor housekeeping conditions on-site': 'Housekeeping',
  'improper materials arrangements for scaffold materials': 'Housekeeping',
  'improper materials arrangements': 'Housekeeping',
  'cement bags and scaffolding materials were observed stored near the access': 'Housekeeping',
  'stored near the access point': 'Housekeeping',
  'obstructing safe movement and creating potential trip': 'Housekeeping',
  'obstructing safe movement': 'Housekeeping',
  'creating potential trip and collision hazards': 'Housekeeping',
  'step ladders were found lying unattended': 'Housekeeping',
  'ladders were found lying unattended': 'Housekeeping',
  'lying unattended in various work areas': 'Housekeeping',
  'creating potential trip hazards and obstructing': 'Housekeeping',

  // Scaffolding materials scattered/stored improperly → Housekeeping
  'scaffolding materials were thrown scattered across the site': 'Housekeeping',
  'scaffolding materials were thrown scattered': 'Housekeeping',
  'thrown scattered across the site': 'Housekeeping',
  'scaffold materials were observed scattered on the ground': 'Housekeeping',
  'scaffold materials were observed scattered': 'Housekeeping',
  'materials were observed scattered on the ground': 'Housekeeping',
  'scaffolding materials were improperly placed on the ground': 'Housekeeping',
  'improperly placed on the ground, creating a potential slip': 'Housekeeping',
  'creating a potential slip and trip hazard': 'Housekeeping',
  'potential slip and trip hazard': 'Housekeeping',
  'poor housekeeping observed in the scaffold material storage': 'Housekeeping',
  'scaffold material storage access': 'Housekeeping',
  'slipping and tripping hazards during material shifting': 'Housekeeping',
  'wooden planks are stored on an unstable and overloaded': 'Housekeeping',
  'stored on an unstable and overloaded': 'Housekeeping',
  'unstable and overloaded makeshift scaffold': 'Housekeeping',
  'overloaded makeshift scaffold/rack': 'Housekeeping',
  'makeshift scaffold/rack, posing a high risk of collapse': 'Housekeeping',
  'high risk of collapse': 'Housekeeping',
  'scaffolding material storage area is not properly barricaded': 'Housekeeping',
  'material storage area is not properly barricaded': 'Housekeeping',
  'not properly barricaded, posing a risk of unauthorized access': 'Site Security',
  'risk of unauthorized access': 'Site Security',
  'found unwanted scaffold barricades in front of': 'Housekeeping',
  'unwanted scaffold barricades in front of the warehouse': 'Housekeeping',
  'unwanted scaffold barricades': 'Housekeeping',

  // Unsecured grating → Slip and Trip
  'unsecured grating was observed': 'Slip and Trip',
  'unsecured grating': 'Slip and Trip',
  'potential risk of slips, trips, or falls': 'Slip and Trip',
  'risk of slips, trips': 'Slip and Trip',

  // ============================================================================
  // PERMIT/DOCUMENTATION ISSUES → General Site Issues
  // Administrative issues during scaffolding work
  // ============================================================================
  'scaffolding activity was ongoing while permit to work was not filled': 'General Site Issues',
  'permit to work was not filled 100%': 'General Site Issues',
  'permit to work was not filled': 'General Site Issues',
  'temporary works was not mentioned as a significant hazard': 'General Site Issues',
  'not mentioned as a significant hazard': 'General Site Issues',
  'cold work permit is used but not the appropriate permit': 'General Site Issues',
  'not the appropriate permit for haulage': 'General Site Issues',
  'not the appropriate permit': 'General Site Issues',

  // ============================================================================
  // PHYSICAL HAZARD (Struck-by) → Physical Hazard
  // Workers beneath scaffolding or in drop zone
  // ============================================================================
  'worker is sitting beneath scaffolding activity area': 'Physical Hazard',
  'sitting beneath scaffolding activity': 'Physical Hazard',
  'beneath scaffolding activity area': 'Physical Hazard',
  'materials could potentially fall on him': 'Physical Hazard',
  'potentially fall on him': 'Physical Hazard',

  // ============================================================================
  // Fire-related terms → Correct category
  // ============================================================================
  // Electrical fire + extinguisher issues → Fire (not COSHH)
  'live electrical panel with provision of dry chemical fire extinguisher': 'Fire',
  'dry chemical fire extinguisher which is not suitable to extinguish': 'Fire',
  'not suitable to extinguish the electrical fire': 'Fire',
  'extinguish the electrical fire': 'Fire',
  'electrical fire': 'Fire',
  'co2 extinguisher': 'Fire',
  'co2 fire extinguisher': 'Fire',
  'dry chemical fire extinguisher': 'Fire',
  'dry chemical extinguisher': 'Fire',
  'powder extinguisher': 'Fire',
  'foam extinguisher': 'Fire',

  'fire extinguisher': 'Fire',
  'fire alarm': 'Fire',
  'fire exit': 'Fire',
  'fire drill': 'Fire',
  'fire escape': 'Fire',
  'fire blanket': 'Fire',
  'fire fighting': 'Fire',
  'firefighting': 'Fire',
  'fire hose': 'Fire',
  'fire hydrant': 'Fire',
  'fire brigade': 'Fire',
  'fire station': 'Fire',
  'fire muster': 'Fire',
  'fire assembly': 'Fire',
  'fire warden': 'Fire',
  'fire watch': 'Fire',
  'fire marshal': 'Fire',
  'fire safety officer': 'Fire',
  'fire door': 'Access',
  'fire prevention': 'Fire',
  'fire risk assessment': 'Fire',
  'line of fire': 'Mobile Plant & Equipment',
  'crossfire': 'Mobile Plant & Equipment',

  // Hot-related terms → Correct category
  'hot surface': 'Working in Heat',
  'hot pipe': 'Working in Heat',
  'hot equipment': 'Working in Heat',
  'heat stroke': 'Working in Heat',
  'heat exhaustion': 'Working in Heat',
  'hot weather': 'Working in Heat',
  'hot day': 'Working in Heat',
  'hot conditions': 'Working in Heat',
  'hot tap': 'Energized System',
  'hot work permit': 'Hot Work',

  // RAMS/Permit/Documentation → General Site Issues (control failures require manual review to identify underlying hazard)
  'no copy of approved': 'General Site Issues',
  'no copy of rams': 'General Site Issues',
  'no copy of msra': 'General Site Issues',
  'no approved rams': 'General Site Issues',
  'no approved msra': 'General Site Issues',
  'no rams available': 'General Site Issues',
  'no msra available': 'General Site Issues',
  'missing rams': 'General Site Issues',
  'missing msra': 'General Site Issues',
  'rams not available': 'General Site Issues',
  'msra not available': 'General Site Issues',
  'approved msra': 'General Site Issues',
  'approved rams': 'General Site Issues',
  'risk assessment': 'General Site Issues',
  'method statement': 'General Site Issues',
  'no means of guideline': 'General Site Issues',
  'no guideline': 'General Site Issues',
  'tmp on the working': 'General Site Issues',
  'tmp at site': 'General Site Issues',
  'work activities at site': 'General Site Issues',
  'permit to work': 'General Site Issues',
  'ptw not': 'General Site Issues',
  'no ptw': 'General Site Issues',
  'permit not mentioned': 'General Site Issues',
  'not mentioned on permit': 'General Site Issues',
  'not mentioned on rams': 'General Site Issues',

  // Lifting equipment → Mobile Plant & Equipment
  'forklift': 'Mobile Plant & Equipment',
  'scissor lift': 'Mobile Plant & Equipment',
  'boom lift': 'Mobile Plant & Equipment',
  'pallet jack': 'Mobile Plant & Equipment',
  'cherry picker': 'Mobile Plant & Equipment',
  'mewp': 'Mobile Plant & Equipment',
  'aerial lift': 'Mobile Plant & Equipment',
  'man lift': 'Mobile Plant & Equipment',
  'personnel lift': 'Mobile Plant & Equipment',
  'platform lift': 'Mobile Plant & Equipment',

  // Driving-related terms → Correct category
  'pile driver': 'Mobile Plant & Equipment',
  'pile driving': 'Breaking Ground & Excavation',
  'driven pile': 'Breaking Ground & Excavation',
  'sheet pile': 'Breaking Ground & Excavation',

  // Excavation equipment → Mobile Plant & Equipment
  'excavator': 'Mobile Plant & Equipment',
  'digger': 'Mobile Plant & Equipment',
  'backhoe': 'Mobile Plant & Equipment',
  'bulldozer': 'Mobile Plant & Equipment',
  'loader': 'Mobile Plant & Equipment',
  'grader': 'Mobile Plant & Equipment',
  'roller': 'Mobile Plant & Equipment',
  'compactor': 'Mobile Plant & Equipment',

  // Equipment brand names → Mobile Plant & Equipment (longer patterns first)
  'a jcb did not have any requirements': 'Mobile Plant & Equipment',
  'jcb did not have any requirements': 'Mobile Plant & Equipment',
  'jcb did not have': 'Mobile Plant & Equipment',
  'observed that a jcb': 'Mobile Plant & Equipment',
  'jcb operator': 'Mobile Plant & Equipment',
  'jcb was not': 'Mobile Plant & Equipment',
  'jcb': 'Mobile Plant & Equipment',
  'caterpillar': 'Mobile Plant & Equipment',
  'komatsu': 'Mobile Plant & Equipment',
  'volvo': 'Mobile Plant & Equipment',
  'hitachi': 'Mobile Plant & Equipment',
  'liebherr': 'Mobile Plant & Equipment',
  'bobcat': 'Mobile Plant & Equipment',
  'john deere': 'Mobile Plant & Equipment',
  'case': 'Mobile Plant & Equipment',
  'hyundai': 'Mobile Plant & Equipment',
  'doosan': 'Mobile Plant & Equipment',
  'kobelco': 'Mobile Plant & Equipment',
  'tadano': 'Mobile Plant & Equipment',
  'manitou': 'Mobile Plant & Equipment',
  'terex': 'Mobile Plant & Equipment',
  'sany': 'Mobile Plant & Equipment',
  'xcmg': 'Mobile Plant & Equipment',
  'zoomlion': 'Mobile Plant & Equipment',

  // Height-related terms → Correct category
  'overhead hazard': 'Mobile Plant & Equipment',
  'overhead work': 'Mobile Plant & Equipment',
  'overhead crane': 'Lifting',

  // Water equipment terms → Correct category
  'drinking water': 'Worker Welfare',
  'water cooler': 'Worker Welfare',
  'potable water': 'Worker Welfare',
  'water supply': 'Worker Welfare',
  'water bottle': 'Worker Welfare',

  // Electrical grounding → Correct category
  'grounding': 'Energized System',
  'ground connection': 'Energized System',
  'ground wire': 'Energized System',
  'ground fault': 'Energized System',

  // Access-related terms
  'lift shaft': 'Access',
  'elevator': 'Access',

  // Tool-specific terms
  'power tool': 'Tools',
  'hand tool': 'Tools',
  'cutting tool': 'Tools',
  'grinding tool': 'Tools',

  // PPE-specific terms → Route to actual hazard or Unclassified
  'hard hat': 'General Site Issues',
  'safety glasses': 'General Site Issues',
  'safety boots': 'General Site Issues',
  'safety shoes': 'General Site Issues',
  'hi-vis': 'General Site Issues',
  'high visibility': 'General Site Issues',
  'safety harness': 'Working at Height',
  'fall harness': 'Working at Height',
  // Not wearing PPE patterns → General Site Issues
  'not wearing': 'General Site Issues',
  'were not wearing': 'General Site Issues',
  'was not wearing': 'General Site Issues',
  'without ppe': 'General Site Issues',
  'without safety': 'General Site Issues',
  'no ppe': 'General Site Issues',
  'missing ppe': 'General Site Issues',
  'ppe not worn': 'General Site Issues',
  'ppe compliance': 'General Site Issues',
  'personal protective equipment': 'General Site Issues',

  // Signage/Traffic - prevent "fall" matching Working at Height (longer patterns first)
  'using the access road, which lacks a designated pedestrian walkway': 'Traffic Management',
  'lacks a designated pedestrian walkway': 'Traffic Management',
  'designated pedestrian walkway': 'Traffic Management',
  'using the access road': 'Traffic Management',
  'pedestrian walkway': 'Traffic Management',
  'pedestrian access': 'Traffic Management',
  'pedestrian crossing': 'Traffic Management',
  'pedestrian route': 'Traffic Management',
  'traffic signage': 'Traffic Management',
  'traffic sign': 'Traffic Management',
  'haul road': 'Traffic Management',
  'access road': 'Traffic Management',
  'vehicle access': 'Traffic Management',
  'fallen sign': 'General Site Issues',
  'fallen signage': 'General Site Issues',
  'sign fell': 'General Site Issues',
  'signage fell': 'General Site Issues',
  'blown over': 'General Site Issues',
  'fallen barrier': 'Access',
  'fallen barricade': 'Access',
  'fallen cone': 'Traffic Management',
  'fallen fence': 'Access',

  // Food/Hygiene - prevent "poison" matching COSHH
  'food storage': 'Worker Welfare',
  'food stored': 'Worker Welfare',
  'food poison': 'Worker Welfare',
  'food poisoning': 'Worker Welfare',
  'food safety': 'Worker Welfare',
  'food contamination': 'Worker Welfare',
  'spoiled food': 'Worker Welfare',
  'expired food': 'Worker Welfare',
  'canteen': 'Worker Welfare',
  'kitchen': 'Worker Welfare',
  'mess hall': 'Worker Welfare',
  'eating area': 'Worker Welfare',

  // Chemical spill / Environmental contamination → Environmental
  'chemical spill': 'Environmental',
  'spill was observed': 'Environmental',
  'contamination of the soil': 'Environmental',
  'soil contamination': 'Environmental',
  'ground contamination': 'Environmental',
  'oil spill': 'Environmental',
  'fuel spill': 'Environmental',
  'diesel spill': 'Environmental',
  'petrol spill': 'Environmental',
  'leaked onto': 'Environmental',
  'spilled onto ground': 'Environmental',
  'spilled on ground': 'Environmental',
  'polluting': 'Environmental',
  'pollution': 'Environmental',

  // Flammable fuel storage → Fire (even if in welfare/rest shelter)
  'diesel tanker found refueling': 'Fire',
  'diesel tanker refueling': 'Fire',
  'refueling excavator at job site': 'Fire',
  'refueling at job site': 'Fire',
  'designated refueling area not provided': 'Fire',
  'refueling area not provided': 'Fire',
  'diesel kept': 'Fire',
  'diesel is kept': 'Fire',
  'diesel being kept': 'Fire',
  'diesel stored': 'Fire',
  'diesel found stored': 'Fire',
  'diesel in open container': 'Fire',
  'petrol kept': 'Fire',
  'petrol is kept': 'Fire',
  'petrol being kept': 'Fire',
  'petrol stored': 'Fire',
  'petrol found stored': 'Fire',
  'petrol was found': 'Fire',
  'petrol in open container': 'Fire',
  'fuel stored': 'Fire',
  'fuel kept': 'Fire',
  'gasoline stored': 'Fire',
  'gasoline kept': 'Fire',
  'flammable liquid': 'Fire',
  'flammable material stored': 'Fire',
  'poses serious fire': 'Fire',
  'fire and health hazard': 'Fire',
  'fire hazard': 'Fire',

  // Waste/Debris - prevent "inspection" matching Safety Supervision
  'concrete waste': 'Housekeeping',
  'waste observed': 'Housekeeping',
  'waste on-site': 'Housekeeping',
  'waste on site': 'Housekeeping',
  'construction waste': 'Housekeeping',
  'debris observed': 'Housekeeping',
  'debris on-site': 'Housekeeping',
  'debris on site': 'Housekeeping',
  'rubbish observed': 'Housekeeping',
  'garbage observed': 'Housekeeping',
  'scrap material': 'Housekeeping',
  'leftover material': 'Housekeeping',
  'material waste': 'Housekeeping',

  // Open pits/holes - route to actual hazard
  'open pit': 'Breaking Ground & Excavation',
  'open pits': 'Breaking Ground & Excavation',
  'without barricad': 'Breaking Ground & Excavation',
  'without proper barricad': 'Breaking Ground & Excavation',
  'no barricad': 'Breaking Ground & Excavation',
  'missing barricad': 'Breaking Ground & Excavation',
  'unbarricaded': 'Breaking Ground & Excavation',
  'open hole': 'Breaking Ground & Excavation',
  'open holes': 'Breaking Ground & Excavation',
  'unprotected opening': 'Working at Height',
  'unprotected edge': 'Working at Height',
  'posing a fall hazard': 'Working at Height',

  // Description prefixes (common in Enablon data)
  'welfare facility:': 'Worker Welfare',
  'welfare facility observed': 'Worker Welfare',
  'confined space:': 'Confined Spaces',
  'work environment:': 'General Site Issues',
  'work enironment:': 'General Site Issues',
  'work enironment;': 'General Site Issues',
  'equipment:': 'Mobile Plant & Equipment',
  'ppe:': 'General Site Issues',
  'housekeeping:': 'Housekeeping',
  'housekeeping;': 'Housekeeping',
  'access:': 'Access',
  'fire:': 'Fire',
  'fire protection:': 'Fire',
  'electrical:': 'Energized System',
  'barricades:': 'Access',
  'safety signs:': 'General Site Issues',
  'safety sign:': 'General Site Issues',
  'hotwork:': 'Hot Work',
  'hotwork;': 'Hot Work',
  'hot work:': 'Hot Work',
  'hot work;': 'Hot Work',

  // Toilet/Hygiene keywords → Site Welfare
  'toilet flush': 'Worker Welfare',
  'toilet not working': 'Worker Welfare',
  'toilet checklist': 'Worker Welfare',
  'unused toilet': 'Worker Welfare',
  'unused toilets': 'Worker Welfare',
  'toilets were stored': 'Worker Welfare',
  'toilet stored': 'Worker Welfare',
  'toilets stored': 'Worker Welfare',
  'contamination': 'Worker Welfare',
  'odor issues': 'Worker Welfare',
  'odour issues': 'Worker Welfare',
  'pest attraction': 'Worker Welfare',
  'proper sealing': 'Worker Welfare',
  'without proper sealing': 'Worker Welfare',
  'toilets not clean': 'Worker Welfare',
  'toilet is not clean': 'Worker Welfare',
  'toilets are being cleaned': 'Worker Welfare',
  'toilet cleaning': 'Worker Welfare',
  'toilets are cleaned': 'Worker Welfare',
  'clean and hygienic': 'Worker Welfare',
  'hygienic environment': 'Worker Welfare',
  'cleanliness standards': 'Worker Welfare',
  'sanitation supplies': 'Worker Welfare',
  'hygiene issues': 'Worker Welfare',
  'welfare facility': 'Worker Welfare',
  'rest shelter': 'Worker Welfare',

  // First Aid → Worker Welfare, Emergency exits → Fire
  'first aid box': 'Worker Welfare',
  'first aid kit': 'Worker Welfare',
  'first aid room': 'Worker Welfare',
  'ambulance driver': 'Worker Welfare',
  'ambulance': 'Worker Welfare',
  'nurse': 'Worker Welfare',
  'male nurse': 'Worker Welfare',
  'site nurse': 'Worker Welfare',
  'medical facility': 'Worker Welfare',
  'clinic': 'Worker Welfare',
  'emergency exit': 'Fire',
  'assembly point': 'Fire',
  'muster point': 'Fire',

  // Electrical exposure → Energized System
  'electric motor': 'Energized System',
  'electric hazard': 'Energized System',
  'electrical hazard': 'Energized System',
  'exposed wire': 'Energized System',
  'exposed cable': 'Energized System',
  'electrical panel': 'Energized System',
  'power supply': 'Energized System',
  'electrical cable': 'Energized System',
  'electrical wire': 'Energized System',
  'damaged cable': 'Energized System',
  'damaged wire': 'Energized System',
  'electrical management': 'Energized System',
  'management of electrical': 'Energized System',

  // Tool inspection → Tools
  'power tool': 'Tools',
  'tool without inspection': 'Tools',
  'tool inspection': 'Tools',
  'monthly colour code': 'Tools',
  'monthly color code': 'Tools',
  'colour coding': 'Tools',
  'color coding': 'Tools',

  // Unauthorized access → Site Security
  'unauthorized person': 'Site Security',
  'unauthorised person': 'Site Security',
  'un authorized person': 'Site Security',
  'unauthorized entry': 'Site Security',
  'unauthorised entry': 'Site Security',
  'un authorized': 'Site Security',
  'trespassing': 'Site Security',

  // Materials scattered → Housekeeping
  'materials scattered': 'Housekeeping',
  'material scattered': 'Housekeeping',
  'left scattered': 'Housekeeping',
  'not properly managed': 'Housekeeping',
  'waste skip': 'Housekeeping',
  'waste skips': 'Housekeeping',
  'general waste': 'Housekeeping',

  // Bulletin board/signage → Safety Sign
  'bulletin board': 'General Site Issues',
  'bulletien board': 'General Site Issues',
  'hsse board': 'General Site Issues',
  'hsse bulletin': 'General Site Issues',
  'notice board': 'General Site Issues',
  'missing sign': 'General Site Issues',
  'no signage': 'General Site Issues',
  'lacks signage': 'General Site Issues',
  'without signage': 'General Site Issues',
  'signage missing': 'General Site Issues',
  'signage is missing': 'General Site Issues',
  'awareness signage': 'General Site Issues',
  'missing awareness': 'General Site Issues',

  // Welding equipment → Hot Work (not just Tools)
  'welding machine': 'Hot Work',
  'welding equipment': 'Hot Work',
  'cutting machine': 'Hot Work',
  'grinding machine': 'Tools',

  // Chemical storage → COSHH (longer patterns to override PPE patterns)
  'cleanup of the generator drip tray': 'COSHH',
  'during the cleanup of the generator drip tray': 'COSHH',
  'generator drip tray': 'COSHH',
  'drip tray cleanup': 'COSHH',
  'drip tray': 'COSHH',
  'chemical stored': 'COSHH',
  'chemicals stored': 'COSHH',
  'chemical storage': 'COSHH',
  'msds': 'COSHH',
  'sds': 'COSHH',
  'fuel handling': 'COSHH',
  'oil spill cleanup': 'COSHH',

  // Tripping hazard → Access
  'tripping hazard': 'Access',
  'trip hazard': 'Access',
  'tripping': 'Access',
  'floor is open': 'Access',

  // Water cooler/igloo → Site Welfare (not Water hazard)
  'water cooler': 'Worker Welfare',
  'igloo cooler': 'Worker Welfare',
  'water station': 'Worker Welfare',
  'drinking bottle': 'Worker Welfare',

  // Fire point/extinguisher → Fire
  'fire point': 'Fire',
  'no fire point': 'Fire',
  'fire extinguisher inspection': 'Fire',
  'fire extinguisher not inspected': 'Fire',

  // Vehicle inspection (VVS) → Mobile Plant & Equipment
  'vvs inspection': 'Mobile Plant & Equipment',
  'vehicle inspection': 'Mobile Plant & Equipment',
  'light vehicle': 'Mobile Plant & Equipment',
  'heavy equipment parking': 'Mobile Plant & Equipment',
  'equipment parking': 'Mobile Plant & Equipment',
  'moving equipment': 'Mobile Plant & Equipment',
  'unsafe distance from moving': 'Mobile Plant & Equipment',
  'distance from moving equipment': 'Mobile Plant & Equipment',
  'wheel choke': 'Mobile Plant & Equipment',
  'wheel chokes': 'Mobile Plant & Equipment',
  'wheel chock': 'Mobile Plant & Equipment',
  'wheel chocks': 'Mobile Plant & Equipment',
  'water tanker': 'Mobile Plant & Equipment',
  'unintended movement': 'Mobile Plant & Equipment',
  'prevent movement': 'Mobile Plant & Equipment',
  'movement of the equipment': 'Mobile Plant & Equipment',
  'movement of equipment': 'Mobile Plant & Equipment',

  // Rebar/materials storage → Housekeeping or Unclassified
  'rebar material': 'Housekeeping',
  'materials not properly stored': 'Housekeeping',
  'material not properly stored': 'Housekeeping',
  'not properly stored': 'Housekeeping',
  'lacked proper barricad': 'Breaking Ground & Excavation',

  // Concrete mixer → Mobile Plant & Equipment
  'concrete mixer': 'Mobile Plant & Equipment',

  // Unprotected board/wood → Housekeeping
  'unprotected wooden': 'Housekeeping',
  'wooden board': 'Housekeeping',

  // Extension cord/electrical repairs → Energized System
  'extension cord': 'Energized System',
  'repaired using plastic tape': 'Energized System',
  'repaired using tape': 'Energized System',

  // Deep excavation → Breaking Ground & Excavation
  'deep open excavation': 'Breaking Ground & Excavation',
  'deep excavation': 'Breaking Ground & Excavation',
  'open excavation': 'Breaking Ground & Excavation',
  'excavation unprotected': 'Breaking Ground & Excavation',
  'excavation not properly barricaded': 'Breaking Ground & Excavation',
  'not properly barricaded': 'Breaking Ground & Excavation',
  'no exclusion zone': 'Breaking Ground & Excavation',
  'no exlusion zone': 'Breaking Ground & Excavation',

  // Garbage/waste → Housekeeping
  'garbage accumulated': 'Housekeeping',
  'garbage is accumulated': 'Housekeeping',
  'unwanted materials': 'Housekeeping',

  // Access stairs → Access
  'access stair': 'Access',
  'stair is not safe': 'Access',
  'no handrail': 'Access',
  'without handrail': 'Access',

  // Drinking water → Site Welfare
  'drinking water station': 'Worker Welfare',
  'water station need': 'Worker Welfare',

  // Dust generation → Dust Control
  'dust is being generated': 'Respiratory Hazard',
  'dust being generated': 'Respiratory Hazard',
  'generating dust': 'Respiratory Hazard',

  // Fire blanket → Hot Work
  'fire blanket': 'Hot Work',
  'fire blanket is not': 'Hot Work',
  'fire blanket not in place': 'Hot Work',
  'welder performing': 'Hot Work',
  'performing hot work': 'Hot Work',

  // Slip trip fall → Access
  'slip, trip': 'Access',
  'slip trip': 'Access',
  'trip and fall': 'Access',
  'stones in the worker area': 'Housekeeping',

  // Concrete activity → General Site Issues
  'concrete activity': 'General Site Issues',
  'concrete has been observed': 'General Site Issues',
  'spikes protruding': 'General Site Issues',

  // Poor housekeeping variations → Housekeeping
  'poor housekeeping': 'Housekeeping',
  'garbage is accumulated': 'Housekeeping',
  'left scattered': 'Housekeeping',
  'been left': 'Housekeeping',
  'have been lef': 'Housekeeping',
  'concrete-contaminat': 'Housekeeping',

  // Toilet variations (typos) → Site Welfare
  'toiltes': 'Worker Welfare',
  'toilets was not cleaned': 'Worker Welfare',
  'toilet was not cleaned': 'Worker Welfare',

  // Spill kit → Emergency Preparedness
  'spill kit': 'COSHH',
  'spill response': 'COSHH',

  // Unsafe bucket access → Working at Height
  'bucket to access': 'Working at Height',
  'using a bucket': 'Working at Height',
  'improvised ladder': 'Working at Height',
  'elevated work area': 'Working at Height',

  // Excavation edge → Breaking Ground & Excavation
  'excavation edge': 'Breaking Ground & Excavation',
  'edge was not protected': 'Breaking Ground & Excavation',
  'not protected by hard barrier': 'Breaking Ground & Excavation',
  'not protected by barrier': 'Breaking Ground & Excavation',

  // Trailer/Driver → Driving (prevent misclassification)
  'trailer driver': 'Driving',
  'trailer was not': 'Driving',
  'left the vehicle': 'Driving',

  // Ladder storage → Housekeeping (not Working at Height)
  'ladder stored': 'Housekeeping',
  'ladder lying': 'Housekeeping',
  'ladder on ground': 'Housekeeping',
  'ladder not stored': 'Housekeeping',
  'storing ladder': 'Housekeeping',

  // Harness storage/inspection → Working at Height (harness relates to height work)
  'harness stored': 'Working at Height',
  'harness on rack': 'Working at Height',
  'harness inspection': 'Working at Height',
  'harness storage': 'Working at Height',
  'body harness inspection': 'Working at Height',
  'harness not inspected': 'Working at Height',
  'expired harness': 'Working at Height',
  'damaged harness': 'Working at Height',
  'fbh': 'Working at Height',
  'full body harness': 'Working at Height',
  'shock absorber': 'Working at Height',
  'lanyard': 'Working at Height',
  'fall arrest': 'Working at Height',

  // Generator → Energized System
  'generator running': 'Energized System',
  'diesel generator': 'Energized System',
  'backup generator': 'Energized System',
  'portable generator': 'Energized System',
  'generator fuel': 'Energized System',
  'generator maintenance': 'Energized System',
  'a dg ': 'Energized System',
  'the dg ': 'Energized System',
  'dg did not': 'Energized System',
  'dg was not': 'Energized System',
  'dg inspection': 'Energized System',

  // Compressor → Energized System (not Tools)
  'air compressor': 'Energized System',
  'compressor running': 'Energized System',
  'compressor hose': 'Energized System',

  // Scaffold storage → Housekeeping (not Temporary Works)
  'scaffold material stored': 'Housekeeping',
  'scaffold parts stored': 'Housekeeping',
  'scaffold components lying': 'Housekeeping',

  // Safety equipment inspection → General Site Issues
  'ppe inspection': 'General Site Issues',
  'helmet inspection': 'General Site Issues',
  'gloves inspection': 'General Site Issues',
  'safety glasses inspection': 'General Site Issues',

  // Site Welfare patterns (override inspection context)
  'toilet was not': 'Worker Welfare',
  'toilet not cleaned': 'Worker Welfare',
  'toilets not cleaned': 'Worker Welfare',
  'no water available': 'Worker Welfare',
  'water not available': 'Worker Welfare',
  'water was not available': 'Worker Welfare',
  'drinking water container': 'Worker Welfare',
  'water color': 'Worker Welfare',
  'water cooler': 'Worker Welfare',
  'smoking tray': 'Worker Welfare',
  'smoking shelter': 'Worker Welfare',

  // Housekeeping patterns (override inspection context)
  'housekeeping was not': 'Housekeeping',
  'housekeeping not conducted': 'Housekeeping',
  'waste material': 'Housekeeping',
  'waste not removed': 'Housekeeping',
  'scattered materials': 'Housekeeping',
  'empty bottles': 'Housekeeping',
  'empty cement bag': 'Housekeeping',
  'empty bags': 'Housekeeping',
  'steel rebar was found': 'Housekeeping',
  'rebar was found stored': 'Housekeeping',
  'material was found stored': 'Housekeeping',
  'found scattered': 'Housekeeping',

  // Dust Control (override inspection context)
  'dust was observed': 'Respiratory Hazard',
  'dust accumulating': 'Respiratory Hazard',
  'dust observed': 'Respiratory Hazard',
  'no dust control': 'Respiratory Hazard',
  'dust control': 'Respiratory Hazard',
  'without dust control': 'Respiratory Hazard',
  'airborne debris': 'Respiratory Hazard',
  'not wearing mask': 'Respiratory Hazard',
  'without mask': 'Respiratory Hazard',
  'coring activities': 'Respiratory Hazard',
  'coring process': 'Respiratory Hazard',

  // Working on or Near Water - removed keyword auto-detection
  // Classification only from explicit Excel hazard column data

  // Confined Spaces (override inspection context)
  'gas test': 'Confined Spaces',
  'gas test was not': 'Confined Spaces',
  'confined space entry': 'Confined Spaces',
  'confined space activity': 'Confined Spaces',
  'confined space work': 'Confined Spaces',
  'inside confined': 'Confined Spaces',
  'entering confined': 'Confined Spaces',
  'confined space attendant': 'Confined Spaces',

  // Breaking Ground & Excavation (override inspection context)
  'deep excavation': 'Breaking Ground & Excavation',
  'deep trench': 'Breaking Ground & Excavation',
  'trench was left': 'Breaking Ground & Excavation',
  'excavation walls': 'Breaking Ground & Excavation',

  // Excavation protection → Breaking Ground & Excavation
  'excavation left open': 'Breaking Ground & Excavation',
  'without any physical barriers': 'Breaking Ground & Excavation',
  'without barriers': 'Breaking Ground & Excavation',
  'no barriers': 'Breaking Ground & Excavation',
  'no barricades': 'Breaking Ground & Excavation',
  'jersey barriers': 'Traffic Management',
  'left open without': 'Breaking Ground & Excavation',
  'unprotected edges': 'Working at Height',
  'edges of a deep': 'Breaking Ground & Excavation',
  'trench edges': 'Breaking Ground & Excavation',

  // Mobile Plant & Equipment (override inspection context)
  'excavator documents': 'Mobile Plant & Equipment',
  'jcb documents': 'Mobile Plant & Equipment',
  'wheel loader checklist': 'Mobile Plant & Equipment',
  'compactor is not equipped': 'Mobile Plant & Equipment',
  'pwas': 'Mobile Plant & Equipment',
  'proximity warning': 'Mobile Plant & Equipment',
  'dump truck without': 'Mobile Plant & Equipment',

  // Energized System (override inspection context)
  'electrical cables': 'Energized System',
  'electrical cable': 'Energized System',
  'exposed conductors': 'Energized System',
  'exposed wire': 'Energized System',
  'loose connection': 'Energized System',
  'earthing rod': 'Energized System',
  'grounding': 'Energized System',
  'generator inspection': 'Energized System',
  'quarterly sticker': 'Tools',

  // Site Security (override inspection context)
  'security was not available': 'Site Security',
  'no security personnel': 'Site Security',
  'security log sheet': 'Site Security',
  'security cabin': 'Site Security',

  // Lifting (override inspection context)
  'lifting activity': 'Lifting',
  'lifting operation': 'Lifting',
  'crane operating': 'Lifting',
  'exclusion zone': 'Lifting',

  // Hot Work (override inspection context)
  'welding activities': 'Hot Work',
  'welding machine': 'Hot Work',
  'hot work activities': 'Hot Work',
  'hot work activity': 'Hot Work',
  'grinding activities': 'Hot Work',
  'grinding activity': 'Hot Work',

  // Rigger → Lifting (rigger is a specialist role for lifting operations)
  'rigger wearing': 'Lifting',
  'rigger observed': 'Lifting',
  'rigger not': 'Lifting',
  'rigger without': 'Lifting',

  // Distribution board → Energized System
  'distribution board': 'Energized System',
  'db board': 'Energized System',
  'db panel': 'Energized System',
  'electrical panel': 'Energized System',

  // Drinking water → Worker Welfare
  'drinking water': 'Worker Welfare',
  'drinking water tank': 'Worker Welfare',
  'water tank': 'Worker Welfare',
  'potable water': 'Worker Welfare',
  'water analysis': 'Worker Welfare',
  'water analysis test': 'Worker Welfare',
  'water delivery': 'Worker Welfare',
  'water delivery date': 'Worker Welfare',
  'water igloo': 'Worker Welfare',
  'igloo': 'Worker Welfare',

  // Complaint box / Admin → General Site Issues
  'complaint box': 'General Site Issues',
  'complaint form': 'General Site Issues',

  // Shoes stored in wrong place → Housekeeping
  'shoes were found stored': 'Housekeeping',
  'shoes found stored': 'Housekeeping',
  'shoes stored inside': 'Housekeeping',
  'stored inside a water': 'Housekeeping',
  'inside a water drum': 'Housekeeping',
  'water drum': 'Housekeeping',

  // Painting activities → COSHH
  'painting activities': 'COSHH',
  'painting activity': 'COSHH',
  'spray painting': 'COSHH',
  'paint without ppe': 'COSHH',
  'painting without ppe': 'COSHH',

  // Signage + hot work context → Hot Work
  'no signage for hot work': 'Hot Work',
  'no signages for hot work': 'Hot Work',
  'signage for hot work': 'Hot Work',
  'signages for hot work': 'Hot Work',
  'hot work no signage': 'Hot Work',
  'hot work signage': 'Hot Work',

  // Signage + lifting context → Lifting
  'no signage for lifting': 'Lifting',
  'lifting signage': 'Lifting',
  'crane signage': 'Lifting',

  // Signage + excavation context → Breaking Ground & Excavation
  'excavation signage': 'Breaking Ground & Excavation',
  'no signage for excavation': 'Breaking Ground & Excavation',

  // Signage + electrical context → Energized System
  'electrical signage': 'Energized System',
  'db signage': 'Energized System',

  // DB/Electrical lacks label → Energized System
  'distribution board lacks': 'Energized System',
  'db lacks label': 'Energized System',
  'db board lacks': 'Energized System',
  'panel lacks label': 'Energized System',

  // Sharp objects / Impalement → Physical Hazard (primary hazard is impalement injury)
  // PHSAS 37.9 Sharp Objects standard
  'phsas 37.9': 'Physical Hazard',
  'sharp objects': 'Physical Hazard',
  '37.9 sharp objects': 'Physical Hazard',
  // Protruding rebars (various phrasings)
  'protruding rebar': 'Physical Hazard',
  'protruding rebars': 'Physical Hazard',
  'rebars protruding': 'Physical Hazard',
  'rebar protruding': 'Physical Hazard',
  'exposed rebar': 'Physical Hazard',
  'exposed rebars': 'Physical Hazard',
  'rebars exposed': 'Physical Hazard',
  'rebar exposed': 'Physical Hazard',
  'unprotected rebar': 'Physical Hazard',
  'unprotected rebars': 'Physical Hazard',
  'uncapped rebar': 'Physical Hazard',
  'uncapped rebars': 'Physical Hazard',
  'sharp rebar': 'Physical Hazard',
  'sharp rebars': 'Physical Hazard',
  'sharp steel rebar': 'Physical Hazard',
  'sharp steel rebars': 'Physical Hazard',
  'steel rebar protruding': 'Physical Hazard',
  'steel rebars protruding': 'Physical Hazard',
  'extended rebars': 'Physical Hazard',
  'extending rebars': 'Physical Hazard',
  // Rebar caps (any mention typically indicates impalement hazard)
  'rebar cap': 'Physical Hazard',
  'rebar caps': 'Physical Hazard',
  'rebar without cap': 'Physical Hazard',
  'rebars without cap': 'Physical Hazard',
  'without rebar cap': 'Physical Hazard',
  'without rebar caps': 'Physical Hazard',
  'rebar caps missing': 'Physical Hazard',
  'missing rebar cap': 'Physical Hazard',
  'no rebar cap': 'Physical Hazard',
  'no rebar caps': 'Physical Hazard',
  // Impalement hazard phrases
  'impalement': 'Physical Hazard',
  'impaled': 'Physical Hazard',
  'impalement hazard': 'Physical Hazard',
  'risk of impalement': 'Physical Hazard',
  'impalement injuries': 'Physical Hazard',
  'impalement injury': 'Physical Hazard',
  'struck on these rods': 'Physical Hazard',
  'struck onto these rebars': 'Physical Hazard',
  // Sharp steel and objects
  'sharp steel': 'Physical Hazard',
  'sharp object': 'Physical Hazard',
  'sharp edge': 'Physical Hazard',
  'sharp edges': 'Physical Hazard',
  // Nails protruding
  'exposed nails': 'Physical Hazard',
  'exposed nail': 'Physical Hazard',
  'timber with nails': 'Physical Hazard',
  'wood with nails': 'Physical Hazard',
  'plywood with nails': 'Physical Hazard',
  'planks with nails': 'Physical Hazard',
  'nails protruding': 'Physical Hazard',
  'nail protruding': 'Physical Hazard',
  'protruding nails': 'Physical Hazard',
  'protruding nail': 'Physical Hazard',
  'had exposed nails': 'Physical Hazard',
  'sheets had exposed nails': 'Physical Hazard',
  // Falling objects
  'falling object': 'Physical Hazard',
  'falling objects': 'Physical Hazard',
  'object fell': 'Physical Hazard',
  'objects falling': 'Physical Hazard',
  'dropped object': 'Physical Hazard',
  'falling material': 'Physical Hazard',
  // Tie rods
  'tie rod': 'Physical Hazard',
  'tie rods': 'Physical Hazard',
  'tie rods used': 'Physical Hazard',

  // Environmental contamination → Environmental
  'septic tank': 'Environmental',
  'septic tank overflowing': 'Environmental',
  'septic tank was found': 'Environmental',
  'septic overflow': 'Environmental',
  'sewage overflow': 'Environmental',
  'environmental contamination': 'Environmental',
  'ground contamination': 'Environmental',
  'soil contamination': 'Environmental',
  'concrete waste on soil': 'Environmental',
  'waste on soil': 'Environmental',

  // Food waste/hygiene → Site Welfare (still appropriate)
  'food waste was not removed': 'Worker Welfare',
  'food waste was observed': 'Worker Welfare',
  'food waste not removed': 'Worker Welfare',
  'food waste': 'Worker Welfare',
  'hygiene risk': 'Worker Welfare',
  'hygiene concerns': 'Worker Welfare',
  'hygiene issues': 'Worker Welfare',
  'pest attraction': 'Worker Welfare',
  'pest risks': 'Worker Welfare',
  'unpleasant odor': 'Worker Welfare',
  'unpleasant odour': 'Worker Welfare',
  // Missing welfare facilities → Site Welfare
  'no welfare': 'Worker Welfare',
  'no welfare on': 'Worker Welfare',
  'no welfare in': 'Worker Welfare',
  'no welfare at': 'Worker Welfare',
  'welfare on the': 'Worker Welfare',
  'welfare in the': 'Worker Welfare',
  'welfare at the': 'Worker Welfare',
  'lack of welfare': 'Worker Welfare',
  'missing welfare': 'Worker Welfare',
  'welfare issue': 'Worker Welfare',
  'welfare problem': 'Worker Welfare',
  'welfare facilities not': 'Worker Welfare',
  'toilet not provided': 'Worker Welfare',
  'toilet were not provided': 'Worker Welfare',
  'toilets not provided': 'Worker Welfare',
  'waste bin not provided': 'Worker Welfare',
  'waste bin were not provided': 'Worker Welfare',
  'bulletin board not provided': 'Worker Welfare',
  'bulletin board were not provided': 'Worker Welfare',
  'welfare not provided': 'Worker Welfare',
  'facilities not provided': 'Worker Welfare',
  'sanitation not provided': 'Worker Welfare',
  'waste bin liner': 'Worker Welfare',
  'polythene bag not changed': 'Worker Welfare',
  'polythene bag in the waste bin': 'Worker Welfare',
  'garbage bag was not replaced': 'Worker Welfare',
  'garbage bag not replaced': 'Worker Welfare',
  'waste bin was full': 'Worker Welfare',
  'waste bin full': 'Worker Welfare',
  'bin was overflowing': 'Worker Welfare',
  'bin overflowing': 'Worker Welfare',
  'poor hygiene': 'Worker Welfare',
  // First Aid → Worker Welfare
  'first aid box': 'Worker Welfare',
  'first aid kit': 'Worker Welfare',
  'first aid box not provided': 'Worker Welfare',
  'first aid not provided': 'Worker Welfare',

  // Structural/Support → Temporary Works
  'makeshift wooden': 'Temporary Works',
  'makeshift support': 'Temporary Works',
  'makeshift supports': 'Temporary Works',
  'makeshift wooden planks': 'Temporary Works',
  'supported using makeshift': 'Temporary Works',
  'unstable support': 'Temporary Works',
  'unstable supports': 'Temporary Works',
  'pipes elevated': 'Temporary Works',
  'pipe elevated': 'Temporary Works',
  'hdpe pipe': 'Temporary Works',
  'hdpe pipes': 'Temporary Works',
  'did not comply with the approved': 'General Site Issues',
  'not comply with': 'General Site Issues',
  // Access-related hazards
  'not properly fixed': 'Access',
  'wooden steps': 'Access',
  'steps not properly': 'Access',
  'steps are not properly': 'Access',
  'steps used for': 'Access',
  'wooden walkway': 'Access',
  'wooden walkways': 'Access',
  'walkway not provided': 'Access',
  'walkways not provided': 'Access',
  'walkways were not provided': 'Access',
  'planks were not provided': 'Access',
  'planks not provided': 'Access',
  'no walkway': 'Access',
  'no walkways': 'Access',
  'posing a risk of falls': 'Access',
  'risk of falls': 'Access',
  'slip, trip, and fall': 'Slip and Trip',
  'slip, trip and fall': 'Slip and Trip',
  'trip hazard': 'Slip and Trip',
  'tripping hazard': 'Slip and Trip',

  // Electrical cables → Energized System (not Housekeeping)
  'grounding cables': 'Energized System',
  'grounding cable': 'Energized System',
  'earthing cables': 'Energized System',

  // Fire/Chemical hazards → Fire (diesel = fire hazard)
  'drip tray full of diesel': 'Fire',
  'drip tray was full of diesel': 'Fire',
  'drip tray was full': 'Fire',
  'dip tray full of diesel': 'Fire',
  'dip tray was full': 'Fire',
  'full of diesel': 'Fire',
  'diesel spill': 'Fire',
  'diesel overflow': 'Fire',
  'fuel spill': 'Fire',
  'fire hazards': 'Fire',
  'fire hazard': 'Fire',
  'increases the chance of fire': 'Fire',
  'oil spill': 'COSHH',
  'generator drip tray': 'Fire',
  'generator dip tray': 'Fire',

  // Material storage/stacking → General Site Issues (collapse hazard)
  // Unstable stacking/collapse risk → Physical Hazard (struck-by falling materials)
  'not properly stacked': 'Physical Hazard',
  'improper stacking': 'Physical Hazard',
  'without stoppers': 'Physical Hazard',
  'prevent rolling': 'Physical Hazard',
  'risk of collapse': 'Physical Hazard',
  'stacked on slope': 'Physical Hazard',
  'stacked without support': 'Physical Hazard',
  'unsecured stacking': 'Physical Hazard',
  'pipes sliding': 'Physical Hazard',
  'pipes rolling': 'Physical Hazard',
  'risk of sliding': 'Physical Hazard',
  'risk of rolling': 'Physical Hazard',
  'cement bags on ground': 'Housekeeping',
  'cement bags placed on ground': 'Housekeeping',
  'placed directly on the ground': 'Housekeeping',

  // Falling objects from height → Physical Hazard (primary hazard)
  'falling object hazard': 'Physical Hazard',
  'on top of pillars': 'Physical Hazard',
  'on top of the pillars': 'Physical Hazard',
  'timber on top': 'Physical Hazard',
  'placed on top of': 'Physical Hazard',
  'posed a serious falling object': 'Physical Hazard',
  'falling object hazard': 'Physical Hazard',
  'risk of injury to workers passing': 'Physical Hazard',
  'risk of injury to workers below': 'Physical Hazard',
  'working below': 'Physical Hazard',

  // Security cabin issues → Site Security
  'security cabin': 'Site Security',
  'sleeping during duty': 'Site Security',
  'sleeping purposes during duty': 'Site Security',
  'used for sleeping': 'Site Security',

  // Mechanical Hazard - caught-in/between, crushing, pinch points (NEW)
  'caught in': 'Mechanical Hazard',
  'caught-in': 'Mechanical Hazard',
  'caught between': 'Mechanical Hazard',
  'caught-between': 'Mechanical Hazard',
  'caught in between': 'Mechanical Hazard',
  'pinch point': 'Mechanical Hazard',
  'pinch points': 'Mechanical Hazard',
  'nip point': 'Mechanical Hazard',
  'shear point': 'Mechanical Hazard',
  'crushing hazard': 'Mechanical Hazard',
  'crush hazard': 'Mechanical Hazard',
  'moving parts': 'Mechanical Hazard',
  'rotating parts': 'Mechanical Hazard',
  'rotating equipment': 'Mechanical Hazard',
  'entanglement': 'Mechanical Hazard',
  'entangled': 'Mechanical Hazard',
  'unguarded machinery': 'Mechanical Hazard',
  'machine guard': 'Mechanical Hazard',
  'missing guard': 'Mechanical Hazard',
  'no guard': 'Mechanical Hazard',
  'amputation': 'Mechanical Hazard',
  'amputated': 'Mechanical Hazard',
  'conveyor belt': 'Mechanical Hazard',
  'roller mechanism': 'Mechanical Hazard',
  'gear mechanism': 'Mechanical Hazard',
  'pulley system': 'Mechanical Hazard',
  'belt drive': 'Mechanical Hazard',
  'shaft exposed': 'Mechanical Hazard',

  // Scaffolding components scattered → Housekeeping (unless structural)
  'scaffolding components': 'Housekeeping',
  'scaffold components': 'Housekeeping',
  'scaffolding clamps': 'Housekeeping',
  'scaffold clamps': 'Housekeeping',
  'scattered on the ground': 'Housekeeping',
  'found scattered': 'Housekeeping',
  'lying on the ground': 'Housekeeping',
  'scattered across': 'Housekeeping',

  // ============================================================================
  // SCAFFOLD CONTEXT OVERRIDES - Prevent "Working at Height" over-matching
  // When scaffold is mentioned but the actual hazard is something else
  // ============================================================================

  // Ladder/access obstructed by materials → Housekeeping (not Working at Height)
  'access ladder to the scaffold was obstructed': 'Housekeeping',
  'access ladder was obstructed': 'Housekeeping',
  'ladder was obstructed by': 'Housekeeping',
  'obstructed by unwanted materials': 'Housekeeping',
  'obstructed by materials': 'Housekeeping',

  // Scaffolding materials scattered = Housekeeping (explicit "housekeeping issues")
  'unwanted scaffolding materials were found scattered': 'Housekeeping',
  'scaffolding materials were found scattered': 'Housekeeping',
  'creating housekeeping issues': 'Housekeeping',
  'housekeeping issues': 'Housekeeping',
  'risk of trips, falls, and restricted access': 'Housekeeping',

  // Safety signage fallen → Housekeeping/General (not Working at Height)
  'safety signage had fallen down': 'Housekeeping',
  'safety signage had fallen': 'Housekeeping',
  'sign board wads found fall': 'Housekeeping',
  'signage had fallen': 'Housekeeping',

  // Scaffold barricades near excavation → Breaking Ground & Excavation
  'scaffold barricades were installed too close to the excavation': 'Breaking Ground & Excavation',
  'barricades were installed too close to the excavation': 'Breaking Ground & Excavation',
  'too close to the excavation edges': 'Breaking Ground & Excavation',
  'close to the excavation edges': 'Breaking Ground & Excavation',

  // Forklift transporting materials → Mobile Plant & Equipment
  'forklift operator was transporting': 'Mobile Plant & Equipment',
  'forklift was in motion': 'Mobile Plant & Equipment',
  'operator\'s view was obstructed': 'Mobile Plant & Equipment',
  'positioned himself in the line of fire': 'Mobile Plant & Equipment',

  // Scaffolding clamps obstructing walkway/staircase → Housekeeping
  'scaffolding clamps were found placed in the main staircase': 'Housekeeping',
  'scaffolding clamps were found placed': 'Housekeeping',
  'clamps were found placed in': 'Housekeeping',
  'placed in the main staircase access': 'Housekeeping',
  'obstructing the walkway': 'Housekeeping',
  'creating a potential trip hazard for workers': 'Housekeeping',

  // Scaffold ladder on excavation edge → Breaking Ground & Excavation
  'scaffolding access ladder\'s landing is positioned on the edge of the excavation': 'Breaking Ground & Excavation',
  'ladder\'s landing is positioned on the edge of the excavation': 'Breaking Ground & Excavation',
  'landing is positioned on the edge of the excavation': 'Breaking Ground & Excavation',
  'on the edge of the excavation': 'Breaking Ground & Excavation',

  // Damaged bucket for lifting → Lifting
  'bucket used for shifting and lifting': 'Lifting',
  'bucket used for lifting': 'Lifting',
  'lifting scaffolding materials was found damaged': 'Lifting',
  'damaged with a hole': 'Lifting',
  'material falling during lifting operations': 'Lifting',
  'risk of material falling during lifting': 'Lifting',

  // Electrical cables obstructing access → Energized System
  'electrical cables were found obstructing': 'Energized System',
  'cables were found obstructing the access ladder': 'Energized System',
  'electrical cables obstructing': 'Energized System',
  'cables obstructing the access': 'Energized System',

  // Excavation access blocked → Breaking Ground & Excavation
  'access to the excavated area was found blocked': 'Breaking Ground & Excavation',
  'access to the excavated area': 'Breaking Ground & Excavation',
  'excavated area was found blocked': 'Breaking Ground & Excavation',
  'excavated area blocked': 'Breaking Ground & Excavation',

  // Platform blocked by materials → Housekeeping
  'working platform for piping installation was blocked': 'Housekeeping',
  'platform was blocked by piping materials': 'Housekeeping',
  'blocked by piping materials': 'Housekeeping',
  'hindering the safe movement of workers': 'Housekeeping',

  // Chamber/pit access issues → Breaking Ground & Excavation
  'loose wooden planks were being used to provide access': 'Breaking Ground & Excavation',
  'loose wooden planks were being used': 'Breaking Ground & Excavation',
  'access and exit to/from the chamber': 'Breaking Ground & Excavation',
  'access to/from the chamber': 'Breaking Ground & Excavation',
  'chamber had unprotected edges': 'Breaking Ground & Excavation',
  'unprotected edges around the perimeter': 'Breaking Ground & Excavation',
  'no guardrails, toe boards, or fall prevention': 'Breaking Ground & Excavation',
  'fall into excavations, pits, and holes': 'Breaking Ground & Excavation',

  // Deep trench without protection → Breaking Ground & Excavation
  'deep trench approximately': 'Breaking Ground & Excavation',
  'trench without proper edge protection': 'Breaking Ground & Excavation',
  'without proper edge protection or barricading': 'Breaking Ground & Excavation',
  'no signage or warning indicators': 'Breaking Ground & Excavation',
  'posing a fall hazard to workers and equipment': 'Breaking Ground & Excavation',
  'fall hazard to workers and equipment': 'Breaking Ground & Excavation',

  // Hot workshop area → Hot Work
  'hot workshop area': 'Hot Work',
  'near the hot workshop area': 'Hot Work',
  'hot workshop': 'Hot Work',

  // No safe access to chamber → Breaking Ground & Excavation
  'no safe access and egress provided for operatives': 'Breaking Ground & Excavation',
  'no safe access and egress': 'Breaking Ground & Excavation',
  'shuttering and reinforcement activities inside a': 'Breaking Ground & Excavation',
  'inside a 3-meter-deep chamber': 'Breaking Ground & Excavation',
  'deep chamber': 'Breaking Ground & Excavation',
  'unsecured, loose platform to gain access': 'Breaking Ground & Excavation',
  'loose platform to gain access': 'Breaking Ground & Excavation',

  // PPE non-compliance (scaffold supervisor) → General Site Issues (PPE)
  'scaffolding supervisor in phase': 'General Site Issues',
  'supervisor not wearing standard safety glasses': 'General Site Issues',
  'not wearing standard safety glasses': 'General Site Issues',
  'noncompliance with required ppe': 'General Site Issues',

  // Scaffold planks improperly placed → Housekeeping
  'scaffolding planks were found improperly placed': 'Housekeeping',
  'scaffolding planks improperly placed': 'Housekeeping',
  'planks were found improperly placed': 'Housekeeping',
  'improperly placed on top of the material rack': 'Housekeeping',
  'on top of the material rack': 'Housekeeping',
  'potential falling object or collapse hazard': 'Housekeeping',

  // ============================================================================
  // EXCAVATION-RELATED - Override "Working at Height" when excavation is context
  // ============================================================================

  // Deep excavation patterns → Breaking Ground & Excavation
  'deep excavation is present without sturdy barriers': 'Breaking Ground & Excavation',
  'deep excavation is present without any barriers': 'Breaking Ground & Excavation',
  'posing a risk of vehicles or workers falling in': 'Breaking Ground & Excavation',
  'risk of vehicles or workers falling in': 'Breaking Ground & Excavation',
  'immediate installation of protective barriers': 'Breaking Ground & Excavation',
  'fall into excavations, pits': 'Breaking Ground & Excavation',

  // Dewatering activity → Breaking Ground & Excavation
  'dewatering activity has commenced': 'Breaking Ground & Excavation',
  'dewatering activity': 'Breaking Ground & Excavation',
  'workers do not have proper access or a stable platform': 'Breaking Ground & Excavation',

  // Chamber/shuttering inside excavation → Breaking Ground & Excavation
  'chamber preparations and shuttering activities inside the excavation': 'Breaking Ground & Excavation',
  'shuttering activities inside the excavation area': 'Breaking Ground & Excavation',
  'inside the excavation area': 'Breaking Ground & Excavation',
  'enter and exit the excavation': 'Breaking Ground & Excavation',
  'only one ladder was available for workers': 'Breaking Ground & Excavation',

  // Stockpile/backfilling materials → Breaking Ground & Excavation
  'stockpile of backfilling materials is dangerously stacked': 'Breaking Ground & Excavation',
  'backfilling materials is dangerously stacked': 'Breaking Ground & Excavation',
  'near 90-degree cut': 'Breaking Ground & Excavation',
  'too steep and unstable for loose soil': 'Breaking Ground & Excavation',
  'collapse and fall onto the equipment': 'Breaking Ground & Excavation',

  // Unwanted ramp to excavation → Breaking Ground & Excavation
  'unwanted ramp going to site and leading to open deep excavation': 'Breaking Ground & Excavation',
  'leading to open deep excavation': 'Breaking Ground & Excavation',
  'fall of equipmwnt/vehicles in excavation': 'Breaking Ground & Excavation',
  'fall of equipment/vehicles in excavation': 'Breaking Ground & Excavation',

  // Steel works on pit → Breaking Ground & Excavation
  'steel works are ongoing on top of the pit': 'Breaking Ground & Excavation',
  'on top of the pit where the edges are open': 'Breaking Ground & Excavation',
  'top of the pit where the edges': 'Breaking Ground & Excavation',

  // Excavation close to access road → Breaking Ground & Excavation
  'excavation close to the vehicle access lacks': 'Breaking Ground & Excavation',
  'excavation close to the vehicle access': 'Breaking Ground & Excavation',
  'prevent the man/equipment from falling on the deep excation': 'Breaking Ground & Excavation',
  'prevent the man/equipment from falling on the deep excavation': 'Breaking Ground & Excavation',
  'falling on the deep excation': 'Breaking Ground & Excavation',
  'deep excavation close to the access road': 'Breaking Ground & Excavation',
  'preventing vehicles or equipment from falling': 'Breaking Ground & Excavation',

  // Handmade ladder for excavation → Breaking Ground & Excavation
  'access and egress to the excavation were being made using a handmade': 'Breaking Ground & Excavation',
  'handmade wooden ladder': 'Breaking Ground & Excavation',
  'ladder was not secured, appeared unstable': 'Breaking Ground & Excavation',
  'did not meet standard safety requirements for excavation': 'Breaking Ground & Excavation',

  // ============================================================================
  // PERMIT/DOCUMENTATION ISSUES → General Site Issues
  // ============================================================================
  'cold work permit is used but not the appropriate permit': 'General Site Issues',
  'cold work permit not appropriate': 'General Site Issues',
  'not the appropriate permit for haulage': 'General Site Issues',
  'permit to work was not filled 100%': 'General Site Issues',
  'permit was not filled 100%': 'General Site Issues',
  'temporary works was not mentioned as a significant hazard': 'General Site Issues',

  // ============================================================================
  // HOUSEKEEPING - Materials stored/scattered improperly
  // ============================================================================
  'improper materials arrangements for scaffold': 'Housekeeping',
  'improper materials arrangements': 'Housekeeping',
  'cement bags and scaffolding materials were observed stored near': 'Housekeeping',
  'stored near the access point': 'Housekeeping',
  'obstructing safe movement and creating potential trip': 'Housekeeping',

  // Step ladders lying unattended → Housekeeping
  'step ladders were found lying unattended': 'Housekeeping',
  'ladders were found lying unattended': 'Housekeeping',
  'lying unattended in various work areas': 'Housekeeping',
  'creating potential trip hazards and obstructing': 'Housekeeping',

  // ============================================================================
  // PHYSICAL HAZARD - Struck-by/Falling objects
  // ============================================================================
  'worker is sitting beneath scaffolding activity area': 'Physical Hazard',
  'sitting beneath scaffolding activity': 'Physical Hazard',
  'beneath scaffolding activity area': 'Physical Hazard',
  'where materials could potentially fall on him': 'Physical Hazard',
  'materials could potentially fall': 'Physical Hazard',

  // ============================================================================
  // LIFTING - Uninspected equipment for lifting
  // ============================================================================
  'uninspected scaffold structure tripod used for lifting': 'Lifting',
  'tripod used for lifting': 'Lifting',
  'used for lifting an electrical grounding rod': 'Lifting',
  'risk of collapse of scaffolding': 'Lifting',

  // ============================================================================
  // MORE EXCAVATION OVERRIDES - Deep trench/excavation patterns
  // ============================================================================
  'standing near the unprotected edges of a deep trench': 'Breaking Ground & Excavation',
  'unprotected edges of a deep trench': 'Breaking Ground & Excavation',
  'manually backfilling and removing soil': 'Breaking Ground & Excavation',
  'trench appeared to be unstable': 'Breaking Ground & Excavation',

  'accesses and egress slope to a deep excavation': 'Breaking Ground & Excavation',
  'egress slope to a deep excavation': 'Breaking Ground & Excavation',
  'slope appeared steep and lacked proper support': 'Breaking Ground & Excavation',
  'workers losing footing or falling into the excavation': 'Breaking Ground & Excavation',

  'access to the deep excavation has been obstructed': 'Breaking Ground & Excavation',
  'deep excavation has been obstructed by scaffold': 'Breaking Ground & Excavation',
  'obstructed by scaffold materials': 'Breaking Ground & Excavation',

  'unprotected edges were found around a deep excavation': 'Breaking Ground & Excavation',
  'around a deep excavation': 'Breaking Ground & Excavation',

  'unprotected edges of deep trenches were observed': 'Breaking Ground & Excavation',
  'unprotected edges of deep trenches': 'Breaking Ground & Excavation',
  'unprotected edges of a deep excavation': 'Breaking Ground & Excavation',
  'unprotected edges of the deep excavation': 'Breaking Ground & Excavation',
  'at several locations of the deep excavation': 'Breaking Ground & Excavation',
  'several locations around the site had unprotected edges of deep excavations': 'Breaking Ground & Excavation',

  'site supervisor found outside the barricades near the edges of the deep excavation': 'Breaking Ground & Excavation',
  'outside the barricades near the edges': 'Breaking Ground & Excavation',

  'hydrotesting device was found placed at the unprotected edges of the deep excavation': 'Breaking Ground & Excavation',
  'placed at the unprotected edges of the deep excavation': 'Breaking Ground & Excavation',

  'site engineer standing near the unprotected edges of a deep excavation': 'Breaking Ground & Excavation',
  'very close to the moving radius of an active excavator': 'Mobile Plant & Equipment',

  'unsafe activities in deep trenches': 'Breaking Ground & Excavation',
  'performing tasks in deep excavations': 'Breaking Ground & Excavation',
  'workers are standing at the unprotected edges of deep excavations': 'Breaking Ground & Excavation',

  // ============================================================================
  // CONFINED SPACES - Override WAH when confined space is the context
  // ============================================================================
  'scaffold platform within the confined space': 'Confined Spaces',
  'within the confined space has only one access point': 'Confined Spaces',
  'ensure easy evacuation during an emergency': 'Confined Spaces',

  'safety officer in charge of confined space does not have': 'Confined Spaces',
  'safety officer in charge of confined space': 'Confined Spaces',
  'no safety supervision in your confined space work': 'Confined Spaces',

  // ============================================================================
  // FIRE - Fire point blocked
  // ============================================================================
  'firepoint at the tsf area is blocked': 'Fire',
  'firepoint at the.*area is blocked': 'Fire',
  'blocked by the scaffold barricade, hindering easy access': 'Fire',
  'hindering easy access during an emergency': 'Fire',

  // ============================================================================
  // MORE HOUSEKEEPING - Scaffold materials stored/scattered improperly
  // ============================================================================
  'water shelter was kept on a slope': 'Housekeeping',
  'possibility to fall from the slope': 'Housekeeping',
  'potential to harm workers': 'Housekeeping',

  'scaffolding materials were found stacked improperly': 'Housekeeping',
  'stacked improperly at both the entrance and exit': 'Housekeeping',
  'obstructing safe access and egress': 'Housekeeping',
  'stacked materials were not securely arranged': 'Housekeeping',

  'damaged or deformed scaffolding materials stored': 'Housekeeping',
  'deformed scaffolding materials stored on-site': 'Housekeeping',
  'pose a risk of being reused': 'Housekeeping',

  'scaffold ladder was observed placed in an undesignated area': 'Housekeeping',
  'placed in an undesignated area': 'Housekeeping',
  'create tripping hazards and obstruct pathways': 'Housekeeping',
  'can damaged the materials itself': 'Housekeeping',

  'steel materials and electric cables have been placed on scaffolding': 'Housekeeping',
  'electric cables have been placed on scaffolding materials': 'Housekeeping',
  'creating a potential obstruction for the safe movement': 'Housekeeping',

  'signages were not installed at the edges': 'General Site Issues',
  'signages all over the site were fallen': 'Housekeeping',
  'fallen all over the place due to high winds': 'Housekeeping',
  'due to high winds': 'Housekeeping',

  'scaffold materials were observed to be scattered': 'Housekeeping',
  'scaffold materials were observed scattered': 'Housekeeping',
  'creating potential tripping hazards and compromising site organization': 'Housekeeping',
  'they should be properly stored': 'Housekeeping',

  'fbh has not been stored in the designated area': 'Housekeeping',
  'left on the scaffold platform, posing potential risks of damage': 'Housekeeping',
  'posing potential risks of damage and misuse': 'Housekeeping',

  'observed scaffold tubes on-site that were damaged': 'Housekeeping',
  'scaffold tubes on-site that were damaged': 'Housekeeping',

  'scaffolding materials were thrown scattered': 'Housekeeping',
  'thrown scattered across the site': 'Housekeeping',

  'unwanted scaffold barricades in front of the warehouse': 'Housekeeping',
  'front of the warehouse at the tsf area': 'Housekeeping',

  'poor housekeeping observed in the scaffold material storage': 'Housekeeping',
  'scaffold material storage access': 'Housekeeping',
  'slipping and tripping hazards during material shifting': 'Housekeeping',

  'wooden planks are stored on an unstable': 'Housekeeping',
  'unstable and overloaded makeshift scaffold/rack': 'Housekeeping',
  'posing a high risk of collapse': 'Housekeeping',

  'scaffolding material storage area is not properly barricaded': 'Site Security',
  'not properly barricaded, posing a risk of unauthorized access': 'Site Security',

  // ============================================================================
  // PREVENT EXCAVATION OVER-MATCHING - These should NOT be Breaking Ground
  // ============================================================================

  // Waste bin issues → Worker Welfare (even if near excavation)
  'polythene bag of the waste bin was not changed': 'Worker Welfare',
  'polythene bag of waste bin was not changed': 'Worker Welfare',
  'waste bin was not changed': 'Worker Welfare',
  'polythene bag in the waste bin': 'Worker Welfare',
  'waste bin was full': 'Worker Welfare',

  // Toilet checklist near excavation → Worker Welfare
  'toilet check was not available for the toilet': 'Worker Welfare',
  'toilet check was not available': 'Worker Welfare',
  'toilet which was placed near': 'Worker Welfare',

  // Earthing/grounding issues → Energized System
  'improper non effective earthing': 'Energized System',
  'non effective earthing': 'Energized System',
  'earthing on concrete': 'Energized System',
  'earthing for the.*panel': 'Energized System',
  'improper earthing': 'Energized System',

  // Dust control during excavation → Respiratory Hazard
  'no dust control measures were in place': 'Respiratory Hazard',
  'no dust control measures in place': 'Respiratory Hazard',
  'dust control measures were in place': 'Respiratory Hazard',
  'no visible dust control measures': 'Respiratory Hazard',
  'generating significant airborne dust': 'Respiratory Hazard',
  'airborne dust': 'Respiratory Hazard',
  'dust was observed spreading': 'Respiratory Hazard',
  'reducing visibility and potentially impacting worker health': 'Respiratory Hazard',

  // Interface fence / unauthorized entry → Site Security (not excavation)
  'interface fence was temporarily open': 'Site Security',
  'interface fence was.*open': 'Site Security',
  'creating a risk of unauthorized entry': 'Site Security',
  'risk of unauthorized entry': 'Site Security',

  // Fire extinguisher in excavator → Fire (equipment inspection, not excavation)
  'fire extinguisher in the excavator was not updated': 'Fire',
  'fire extinguisher in the excavator': 'Fire',
  'fire extinguisher.*excavator.*not updated': 'Fire',
  'fire extinguisher.*not updated': 'Fire',

  // Generic materials stored without barricades → Housekeeping (not excavation-specific)
  'materials were found stored without barricades': 'Housekeeping',
  'materials found stored without barricades': 'Housekeeping',
  'stored without barricades or safety signages': 'Housekeeping',

  // ============================================================================
  // ELECTRICAL HAZARDS - Even in welfare context
  // ============================================================================
  'live electrical socket was found in direct contact': 'Energized System',
  'live electrical socket': 'Energized System',
  'electrical socket.*water cooler': 'Energized System',
  'exposed the plug and socket to possible condensation': 'Energized System',
  'potential for electrical shock': 'Energized System',
  'electrical shock, short-circuiting, or fire': 'Energized System',

  // ============================================================================
  // MISCELLANEOUS CONTEXT FIXES
  // ============================================================================

  // Equipment left by unknown firm → Site Security (not Tools)
  'equipment was found at the entrance of the site parked/left by unknown firm': 'Site Security',
  'left by unknown firm': 'Site Security',
  'parked/left by unknown firm': 'Site Security',
  'by unknown firm': 'Site Security',

  // Worker not attending briefing → General Site Issues (not Tools)
  'worker not attending pre-task briefing': 'General Site Issues',
  'not attending pre-task briefing': 'General Site Issues',
  'instead he is hiding and just using mobile phone': 'General Site Issues',
  'hiding and just using mobile phone': 'General Site Issues',

  // Parking signage → Traffic Management
  'no signage indicating the parking area': 'Traffic Management',
  'signage indicating the parking area': 'Traffic Management',
  'parking area or reverse parking': 'Traffic Management',
  'reverse parking': 'Traffic Management',

  // Workers painting without PPE → COSHH
  'workers were observed performing painting activities without wearing proper': 'COSHH',
  'performing painting activities without wearing': 'COSHH',
  'painting activities without.*ppe': 'COSHH',
  'workers are performing painting activities, but the required specific ppe': 'COSHH',
  'painting activities, but the required specific ppe': 'COSHH',

  // Unusable materials → Housekeeping
  'unusable materials were observed in the workplace': 'Housekeeping',
  'unusable materials were observed': 'Housekeeping',
  'unusable materials in workplace': 'Housekeeping',

  // ============================================================================
  // MORE SCAFFOLD CONTEXT OVERRIDES - Prevent WAH over-matching
  // ============================================================================

  // Signage fallen due to weather → Housekeeping
  'due to sand storm some sign fall down': 'Housekeeping',
  'sand storm some sign fall': 'Housekeeping',
  'due to sand storm': 'Housekeeping',

  // Deep excavation with cave-in/collapse risk → Breaking Ground & Excavation
  'deep excavation was observed without any isolation': 'Breaking Ground & Excavation',
  'vibration from the compactor': 'Breaking Ground & Excavation',
  'cave-ins or soil collapse': 'Breaking Ground & Excavation',
  'cave-ins': 'Breaking Ground & Excavation',
  'soil collapse incidents': 'Breaking Ground & Excavation',
  'soil collapse': 'Breaking Ground & Excavation',

  // Stockpile edge protection → Breaking Ground & Excavation
  'edge protection for stockpiles is not available': 'Breaking Ground & Excavation',
  'edge protection for stockpiles': 'Breaking Ground & Excavation',
  'edge protection for stockpiles was not provided': 'Breaking Ground & Excavation',

  // TMP (Traffic Management Plan) → Traffic Management
  'non-availability of proper tmp': 'Traffic Management',
  'proper tmp and edge protection': 'Traffic Management',

  // Permit not issued → General Site Issues
  'permit not issued for de-shuttering': 'General Site Issues',
  'permit not issued for': 'General Site Issues',

  // Wire/cable in contact with scaffold → Energized System
  'wire is in contact with the scaffold': 'Energized System',
  'wire was in contact with the scaffold': 'Energized System',
  'live electrical cable came into contact with the scaffolding': 'Energized System',
  'electrical cable came into contact with': 'Energized System',
  'cable came into contact with the scaffolding': 'Energized System',

  // Scaffold materials scattered/obstructing → Housekeeping
  'scaffold materials were observed scattered along the way': 'Housekeeping',
  'scattered along the way': 'Housekeeping',
  'scaffold ledgers were scattered and cluttered': 'Housekeeping',
  'scattered and cluttered throughout': 'Housekeeping',
  'scaffolding materials were scattered along the edge': 'Housekeeping',
  'scaffold materials are dispersed across the work zone': 'Housekeeping',
  'dispersed across the work zone': 'Housekeeping',
  'pedestrian walkway was blocked due to scaffold scattered material': 'Housekeeping',
  'walkway was blocked due to scaffold': 'Housekeeping',
  'scaffolding materials obstructed the entire pathway': 'Housekeeping',
  'obstructed the entire pathway': 'Housekeeping',
  'scaffolding material was inadequately placed at site': 'Housekeeping',
  'inadequately placed at site': 'Housekeeping',
  'scaffold access was blocked due to the timbers': 'Housekeeping',
  'access was blocked due to the timbers': 'Housekeeping',

  // Materials accumulated at working zone → Housekeeping
  'construction material includes such as shuttering tie rods, waste plywood, and scaffolding ledgers were accumulated': 'Housekeeping',
  'shuttering tie rods, waste plywood, and scaffolding ledgers were accumulated': 'Housekeeping',
  'accumulated at working zone': 'Housekeeping',

  // Poor housekeeping explicitly mentioned → Housekeeping
  'poor housekeeping at the workplace': 'Housekeeping',
  'construction materials and scaffold tubes accumulating': 'Housekeeping',
  'clutter and disorganization': 'Housekeeping',

  // Worker/person on edge of excavation → Breaking Ground & Excavation
  'worker was observed standing on the unprotected edge of an excavation': 'Breaking Ground & Excavation',
  'standing on the unprotected edge of an excavation': 'Breaking Ground & Excavation',
  'standing on the unprotected edge of the deep excavation': 'Breaking Ground & Excavation',
  'concrete pump operator.*found standing on the edge of the deep excavation': 'Breaking Ground & Excavation',
  'standing on the edge of the deep excavation': 'Breaking Ground & Excavation',
  'steel fixer on the unprotected edge of the deep excavation': 'Breaking Ground & Excavation',
  'on the unprotected edge of the deep excavation': 'Breaking Ground & Excavation',
  'land surveyor found on the edge of the deep excavation': 'Breaking Ground & Excavation',
  'found on the edge of the deep excavation': 'Breaking Ground & Excavation',
  'workers found walking/ working on the unprotected edge': 'Breaking Ground & Excavation',
  'walking/ working on the unprotected edge': 'Breaking Ground & Excavation',
  'crossing the installed rigid barricades': 'Breaking Ground & Excavation',

  // Water igloo on scaffold → Housekeeping (not WAH)
  'water igloo was observed placed on the scaffold platform': 'Housekeeping',
  'igloo placed on top of scaffold platform': 'Housekeeping',
  'igloo placed on scaffold platform': 'Housekeeping',

  // Scaffold inspector PPE issue → General Site Issues
  'scaffold inspector found on site with long boots with no steel toe': 'General Site Issues',
  'scaffold inspector found.*with no steel toe': 'General Site Issues',
  'long boots with no steel toe': 'General Site Issues',
  'no steel toe and sole': 'General Site Issues',

  // ============================================================================
  // GENERAL SITE ISSUES OVERRIDES - Route to more specific categories
  // ============================================================================

  // Rest shelter protection → Worker Welfare
  'rest shelter was not protected with sand berm': 'Worker Welfare',
  'rest shellter was not protected': 'Worker Welfare',
  'rest shelter was not protected': 'Worker Welfare',

  // Sitting arrangements → Worker Welfare
  'sitting arrangements for operatives was not provided': 'Worker Welfare',
  'sitting arrangements.*not provided': 'Worker Welfare',

  // Jersey barrier alignment → Traffic Management
  'jersey barrier were not aligned': 'Traffic Management',
  'jersey barriers were not aligned': 'Traffic Management',
  'readjusted after its displacement': 'Traffic Management',

  // Stones/materials in walkway → Housekeeping
  'stones are laying in the walk way area': 'Housekeeping',
  'stones are laying in the walkway': 'Housekeeping',
  'laying in the walk way': 'Housekeeping',
  'making hurdles for passer byers': 'Housekeeping',
  'hurdles for passer byers': 'Housekeeping',

  // Material not arranged → Housekeeping
  'material that is not arranged': 'Housekeeping',
  'not arranged and making problem for the passer byers': 'Housekeeping',
  'making problem for the passer byers': 'Housekeeping',

  // Bricks need to be arranged → Housekeeping
  'bricks need to be arranged': 'Housekeeping',

  // Crusher panel board → Energized System
  'crusher pannel board was not fix': 'Energized System',
  'crusher panel board was not fix': 'Energized System',
  'panel board was not fix in side wall': 'Energized System',

  // ============================================================================
  // MOBILE PLANT OVERRIDES - Route to more specific categories
  // ============================================================================

  // Security breach / unauthorized access → Site Security
  'serious concerns about the security procedures': 'Site Security',
  'breach of security protocols': 'Site Security',
  'security personnel did not properly check': 'Site Security',
  'security personnel did not.*check the status': 'Site Security',
  'allowing unauthorized trucks to enter': 'Site Security',
  'unauthorized trucks to enter': 'Site Security',
  'thoroughly verify the access status': 'Site Security',
  'verify the access status of every vehicle': 'Site Security',

  // PPE non-compliance at equipment → General Site Issues
  'operative working with rebar bending machine without mandatory ppe': 'General Site Issues',
  'working with rebar bending machine without.*ppe': 'General Site Issues',
  'site engineer and cm not worn mandatory ppe': 'General Site Issues',
  'not worn mandatory ppe': 'General Site Issues',

  // Damaged signboards by equipment → Housekeeping
  'damaged signboards were observed': 'Housekeeping',
  'excavator operator damaged all existing signages': 'Housekeeping',
  'excavator operator damaged.*signages': 'Housekeeping',

  // ============================================================================
  // MORE MOBILE PLANT OVERRIDES
  // ============================================================================

  // Carpenter/steel fixing table - ergonomics → Tools
  'no carpenter table or steel fixing table provided': 'Tools',
  'carpenter table or steel fixing table': 'Tools',
  'poor ergonomics for the operators': 'Tools',
  'whilst operating circular saw by carpenters': 'Tools',
  'angle grinder by steel fixers involved in cutting': 'Tools',

  // Handrailing on staircase → Access
  'handrailing was not provided on staircase': 'Access',
  'hand railing was not provided along the staircase': 'Access',
  'handrailing was not provided': 'Access',
  'hand railing was not provided': 'Access',

  // Electrical connection overloading → Energized System
  'overloading of electrical connection with tower light generator': 'Energized System',
  'overloading of electrical connection': 'Energized System',
  'without installing any safety devices to get the circuit tripped': 'Energized System',
  'in case of any current leakage': 'Energized System',

  // GFCI not installed → Energized System
  'gfci was not installed in power distribution': 'Energized System',
  'gfci was not installed': 'Energized System',
  'power distribution system to crusher plant': 'Energized System',

  // Steel fixers inside retaining wall foundation → Breaking Ground & Excavation
  'steel fixers fixing steel inside the retaining wall foundation reinforcement': 'Breaking Ground & Excavation',
  'inside the retaining wall foundation reinforcement': 'Breaking Ground & Excavation',
  'no safe access egress and rescue arrangements': 'Breaking Ground & Excavation',
  'inadequate for rescue in case of any emergency': 'Breaking Ground & Excavation',

  // Operator PPE non-compliance → General Site Issues
  'loader operator did not wear helmet, safety shoes and safety glass': 'General Site Issues',
  'operator did not wear helmet': 'General Site Issues',

  // ============================================================================
  // GENERAL SITE ISSUES → HOUSEKEEPING
  // ============================================================================

  // Materials left unkept → Housekeeping
  'surplus piping materials left at work location unkept': 'Housekeeping',
  'piping materials left at work location unkept': 'Housekeeping',
  'left at work location unkept': 'Housekeeping',
  'needs removal to provide space': 'Housekeeping',

  // Steel sticks/barricades left unkept → Housekeeping
  'steel sticks used for barricades, survey markers are left unkept': 'Housekeeping',
  'survey markers are left unkept': 'Housekeeping',
  'left unkept anywhere after its use': 'Housekeeping',

  // Work materials thrown → Lifting
  'work materials thrown up/down on air': 'Lifting',
  'thrown up/down on air': 'Lifting',
  'not by bucket and rope': 'Lifting',

  // ============================================================================
  // MORE WORKING AT HEIGHT OVERRIDES - Additional patterns from test data
  // ============================================================================

  // Rocks/stones fallen from stockpile → Housekeeping (not WAH)
  'rocks are fallen down from the steps of old stock pile': 'Housekeeping',
  'rocks fallen down from the steps': 'Housekeeping',
  'rocks fallen from stockpile': 'Housekeeping',
  'rocks fallen from stock pile': 'Housekeeping',
  'fallen down from the steps': 'Housekeeping',
  'from the steps of old stock pile': 'Housekeeping',
  'old stock pile': 'Housekeeping',
  'stockpile debris': 'Housekeeping',

  // Inappropriate gloves/hand protection for waterproofing → COSHH
  'inappropriate hand protection worn by workers involved in waterproofing': 'COSHH',
  'inappropriate hand protection.*waterproofing': 'COSHH',
  'workers involved in waterproofing': 'COSHH',
  'waterproofing activities': 'COSHH',
  'waterproofing work': 'COSHH',
  'waterproofing without.*gloves': 'COSHH',
  'waterproofing without.*ppe': 'COSHH',

  // Tower light checklist → Mobile Plant & Equipment (inspection/checklist)
  'tower light checklist filled out daily': 'Mobile Plant & Equipment',
  'tower light checklist': 'Mobile Plant & Equipment',
  'tower light inspection': 'Mobile Plant & Equipment',
  'light tower checklist': 'Mobile Plant & Equipment',
  'light tower inspection': 'Mobile Plant & Equipment',

  // Scaffold tag/inspection (structural safety) → Working at Height (keep)
  'expired scaffolding tag': 'Working at Height',
  'scaffolding tag expired': 'Working at Height',
  'scaffold tag expired': 'Working at Height',
  'expired scaffold tag': 'Working at Height',
  'scaffold tag': 'Working at Height',
  'scaffolding tag': 'Working at Height',

  // Electric wire on scaffold → Energized System (override WAH)
  'electric wire in contact with scaffold': 'Energized System',
  'electrical wire in contact with scaffold': 'Energized System',
  'wire touching scaffold': 'Energized System',
  'cable touching scaffold': 'Energized System',
  'wire on scaffold': 'Energized System',
  'cable on scaffold': 'Energized System',

  // Scaffold materials not segregated → Housekeeping
  'scaffold materials not segregated': 'Housekeeping',
  'scaffolding materials not segregated': 'Housekeeping',
  'materials not segregated': 'Housekeeping',
  'not segregated properly': 'Housekeeping',

  // Scaffold platform as storage → Housekeeping
  'scaffold platform used as storage': 'Housekeeping',
  'scaffold platform being used for storage': 'Housekeeping',
  'using scaffold platform for storage': 'Housekeeping',
  'materials stored on scaffold platform': 'Housekeeping',

  // Scaffold adjacent to excavation → Breaking Ground & Excavation
  'scaffold adjacent to excavation': 'Breaking Ground & Excavation',
  'scaffolding adjacent to excavation': 'Breaking Ground & Excavation',
  'scaffold near excavation edge': 'Breaking Ground & Excavation',
  'scaffolding near excavation': 'Breaking Ground & Excavation',

  // ============================================================================
  // ADDITIONAL WORKING AT HEIGHT OVERRIDES - More specific patterns
  // ============================================================================

  // Standing very close to excavation edges → Breaking Ground & Excavation
  'standing very close to the unprotected edges of a deep excavation': 'Breaking Ground & Excavation',
  'standing very close to the unprotected edges': 'Breaking Ground & Excavation',
  'standing close to the unprotected edges': 'Breaking Ground & Excavation',
  'very close to the unprotected edges': 'Breaking Ground & Excavation',
  'operatives were observed standing very close': 'Breaking Ground & Excavation',

  // Scaffolding supervisor TUV card → General Site Issues (documentation/competency)
  'scaffolding supervisor does not possess a physical tuv card': 'General Site Issues',
  'does not possess a physical tuv card': 'General Site Issues',
  'tuv card': 'General Site Issues',
  'tuv certification': 'General Site Issues',

  // Scaffold materials in mixed/unorganized manner → Housekeeping
  'scaffolding materials were observed stored in a mixed and unorganized manner': 'Housekeeping',
  'stored in a mixed and unorganized manner': 'Housekeeping',
  'mixed and unorganized manner': 'Housekeeping',
  'without proper segregation and arrangement': 'Housekeeping',

  // Scaffold access blocked by materials → Fire (fire point context)
  'fire point access in': 'Fire',
  'fire point access was blocked': 'Fire',
  'was blocked by scaffold materials': 'Fire',

  // Ongoing formwork/rebar lack edge protection → Working at Height (correct)
  // Keep as WAH - this is about edge protection at height

  // Haulage operations multiple hazards → Driving/Traffic Management
  'during haulage operations': 'Driving',
  'haulage operations': 'Driving',
  'haulage activities were conducted': 'Driving',
  'dump truck drivers were seen climbing on top': 'Working at Height',
  'manually tie tarpaulins': 'Working at Height',
  'trapping station': 'Working at Height',

  // Unprotected edges around deep trench → Breaking Ground & Excavation
  'unprotected edges were found around a deep trench at the site': 'Breaking Ground & Excavation',
  'found around a deep trench at the site': 'Breaking Ground & Excavation',
  'around a deep trench at the site': 'Breaking Ground & Excavation',
  'no physical barriers, guardrails, or warning signs': 'Breaking Ground & Excavation',

  // Working inside excavation pit → Breaking Ground & Excavation
  'working inside an excavation pit without': 'Breaking Ground & Excavation',
  'found working inside an excavation pit': 'Breaking Ground & Excavation',
  'excavation pit without a proper access': 'Breaking Ground & Excavation',

  // No barricades on ditch → Breaking Ground & Excavation
  'no installed barricades on the ditch': 'Breaking Ground & Excavation',
  'installed barricades on the ditch': 'Breaking Ground & Excavation',

  // Scaffold entrance on active roadway → Traffic Management
  'scaffold access entrance is positioned directly on an active roadway': 'Traffic Management',
  'access entrance is positioned directly on an active roadway': 'Traffic Management',
  'positioned directly on an active roadway': 'Traffic Management',

  // Harness storage blocked → Housekeeping
  'harness storage point for safety harnesses': 'Housekeeping',
  'harness storage point.*was found blocked': 'Housekeeping',
  'storage point.*was found blocked by stored materials': 'Housekeeping',

  // Handmade access for excavation → Breaking Ground & Excavation
  'handmade, substandard access/egress structure': 'Breaking Ground & Excavation',
  'substandard access/egress structure': 'Breaking Ground & Excavation',
  'for entering and exiting a deep excavation area': 'Breaking Ground & Excavation',
  'exiting a deep excavation area': 'Breaking Ground & Excavation',

  // Lifting scaffold material with rope → Lifting
  'lifting scaffolding material manually': 'Lifting',
  'worker was lifting scaffolding material': 'Lifting',
  'lifting scaffolding material manually with a rope': 'Lifting',

  // Scaffold barricades unattended, no housekeeping → Housekeeping
  'unwanted scaffolding barricades left unattended': 'Housekeeping',
  'scaffolding barricades left unattended': 'Housekeeping',
  'barricades left unattended on site': 'Housekeeping',
  'concrete barriers not returned to their original position': 'Housekeeping',

  // Formwork inside confined space → Confined Spaces
  'formwork is in progress inside confined space': 'Confined Spaces',
  'in progress inside confined space used scaffolding platform': 'Confined Spaces',
  'inside confined space used scaffolding platform': 'Confined Spaces',
  'scaffolding access is red tagged': 'Working at Height',

  // Material management near excavation → Breaking Ground & Excavation
  'conducting material management activities near the deep excavation': 'Breaking Ground & Excavation',
  'material management activities near the deep excavation area': 'Breaking Ground & Excavation',
  'operative was climbing in and out of the excavation': 'Breaking Ground & Excavation',

  // Scaffold tubes on platform → Physical Hazard (falling objects) or WAH
  'scaffolding tubes were observed stored on the scaffold platform': 'Physical Hazard',
  'stored on the scaffold platform, creating an unsafe condition': 'Physical Hazard',
  'increasing the risk of falling objects': 'Physical Hazard',

  // Worker walking under scaffold dismantling → Physical Hazard
  'walking underneath the scaffold while it is under dismantling': 'Physical Hazard',
  'underneath the scaffold while.*dismantling': 'Physical Hazard',
  'underneath.*scaffold.*dismantling': 'Physical Hazard',

  // ============================================================================
  // ENERGIZED SYSTEM OVERRIDES - Redirect to correct categories
  // ============================================================================

  // Speed breakers/humps → Traffic Management (not electrical)
  'speed breakers are not provided': 'Traffic Management',
  'speed breaker was not provided': 'Traffic Management',
  'speed breakers not provided': 'Traffic Management',
  'hump was not provided': 'Traffic Management',
  'humps not provided': 'Traffic Management',
  'adequate numbers of speed breaker': 'Traffic Management',

  // Air compressor hose/whip check → Mechanical Hazard (pneumatic, not electrical)
  'hose is danged and no wipe chaim': 'Mechanical Hazard',
  'hose is damaged and no whip chain': 'Mechanical Hazard',
  'no whip chain in air compressor': 'Mechanical Hazard',
  'no wipe chaim in air compressor': 'Mechanical Hazard',
  'air hose connections continues without whip checks': 'Mechanical Hazard',
  'compressed air hose connections without whip checks': 'Mechanical Hazard',
  'without whip checks': 'Mechanical Hazard',
  'whip checks': 'Mechanical Hazard',
  'whip chain': 'Mechanical Hazard',
  'air hose suddenly came loose': 'Mechanical Hazard',
  'hose came loose from its position under pressure': 'Mechanical Hazard',

  // Rotating parts not safeguarded → Mechanical Hazard
  'rotating parts of the air compressor was not safeguarded': 'Mechanical Hazard',
  'rotating parts.*not safeguarded': 'Mechanical Hazard',
  'rotating motor haft was not safeguarded': 'Mechanical Hazard',
  'rotating motor shaft was not safeguarded': 'Mechanical Hazard',
  'motor shaft was not safeguarded': 'Mechanical Hazard',

  // Boulders near generators → Housekeeping (material placement)
  'boulders are near the generators': 'Housekeeping',
  'boulders near the generators': 'Housekeeping',
  'rocks near generators': 'Housekeeping',

  // Falling loose boulders from stockpile → Physical Hazard
  'falling of loose boulders were observed from a stock pile': 'Physical Hazard',
  'falling of loose boulders': 'Physical Hazard',
  'loose boulders were observed from a stock pile': 'Physical Hazard',
  'loose boulders from stockpile': 'Physical Hazard',
  'loose boulders from stock pile': 'Physical Hazard',
  'posing a continues risk for the motorists': 'Physical Hazard',

  // Generator without fire extinguisher → Fire
  'portable generator without fire extinguisher': 'Fire',
  'generator without fire extinguisher': 'Fire',
  'found portable generator without fire': 'Fire',

  // Diesel stored improperly → Fire (not just electrical panel proximity)
  'diesel was stored in a plastic container': 'Fire',
  'diesel stored in a plastic container': 'Fire',
  'diesel container was not labeled': 'Fire',
  'diesel container was stored behind': 'Fire',

  // Clinic/welfare not established → Worker Welfare
  'failed to establish satellite office and a clinic': 'Worker Welfare',
  'failed to establish.*clinic': 'Worker Welfare',
  'first aid and medical arrangements are insufficient': 'Worker Welfare',
  'medical arrangements are insufficient': 'Worker Welfare',
  'no welfare facilities and power supply provided': 'Worker Welfare',

  // Fire walls in genset room → Fire
  'fire walls were not provided in genset room': 'Fire',
  'fire walls were not provided': 'Fire',
  'emergency on/off switch was not provided out side the genset': 'Fire',

  // Workers standing on fuel tank → Working at Height (fall hazard)
  'standing on top of a fuel tank': 'Working at Height',
  'on top of a fuel tank': 'Working at Height',
  'exposing themselves to fall hazards': 'Working at Height',

  // Compressor not certified (without electrical context) → Mobile Plant & Equipment
  'compressor was not third party certified': 'Mobile Plant & Equipment',
  'air compressor without third party certificates': 'Mobile Plant & Equipment',

  // PPE during generator maintenance → General Site Issues
  'did not wear safety glass and hand gloves while doing maintenance of generator': 'General Site Issues',
  'not wear safety glass.*maintenance of generator': 'General Site Issues',

  // Welder earth clamp issues → Hot Work (welding context)
  'welder is using a broken clamp connected to return earth cable': 'Hot Work',
  'welder is using a broken clamp': 'Hot Work',
  'return earth clamp was not properly clamped': 'Hot Work',

  // ============================================================================
  // MOBILE PLANT & EQUIPMENT OVERRIDES - Redirect to correct categories
  // ============================================================================

  // Vehicle collision due to road conditions → Driving
  'tipper trucks collided': 'Driving',
  'trucks collided': 'Driving',
  'due to wet slippery road condition': 'Driving',
  'wet slippery road': 'Driving',
  'adapting driving behavior to the prevailing road conditions': 'Driving',
  'adapting driving behavior': 'Driving',

  // Boulders rolling from stockpile → Physical Hazard
  'boulders rolling from the top of the stockpile': 'Physical Hazard',
  'boulders rolling from the top': 'Physical Hazard',
  'boulders rolling from stockpile': 'Physical Hazard',
  'leading to the boulders rolling': 'Physical Hazard',
  'towards the vehicle and people movement area': 'Physical Hazard',

  // GFCI not installed → Energized System
  'gfci was not installed in power distribution': 'Energized System',
  'gfci was not installed': 'Energized System',
  'gfci not installed': 'Energized System',

  // Air hose not secured → Mechanical Hazard
  'air hose was not adequately secured': 'Mechanical Hazard',
  'pneumatic hose.*was not adequately secured': 'Mechanical Hazard',
  'pneumatic hose of the compressor was not adequately secured': 'Mechanical Hazard',
  'hose was not adequately secured': 'Mechanical Hazard',
  'in an event of failure of coupler': 'Mechanical Hazard',

  // Excavator used for unsafe lifting → Lifting
  'excavator was used in an unsafe lifting': 'Lifting',
  'unsafe lifting of crusher plant': 'Lifting',
  'used in an unsafe lifting': 'Lifting',

  // Operator on phone while driving → Driving
  'operator was on cell phone call while driving': 'Driving',
  'on cell phone call while driving': 'Driving',
  'cell phone while driving': 'Driving',
  'on phone while driving': 'Driving',

  // Fire extinguisher de-pressurized → Fire
  'fire extinguisher provided in the excavator was de-pressurized': 'Fire',
  'fire extinguisher.*was de-pressurized': 'Fire',
  'fire extinguisher was de-pressurized': 'Fire',
  'fire extinguisher de-pressurized': 'Fire',
  'fe observed with broken handle': 'Fire',

  // Stockpile collapse over equipment → Breaking Ground & Excavation
  'unsafe method for removing materials from stockpiles': 'Breaking Ground & Excavation',
  'soil is collapsing over the equipment': 'Breaking Ground & Excavation',
  'risk of huge collapse of stockpiles': 'Breaking Ground & Excavation',
  'equipment that can be buried under the falling material': 'Breaking Ground & Excavation',
  'buried under the falling material': 'Breaking Ground & Excavation',

  // Dumper unloading on edge of stockpile → Physical Hazard (edge collapse)
  'dumper is unloading the soil material on the edge of the stock pile': 'Physical Hazard',
  'unloading.*on the edge of the stock pile': 'Physical Hazard',
  'on the edge of the stock pile': 'Physical Hazard',
}

// Hazard category patterns for auto-classification (30 approved categories)
export const HAZARD_PATTERNS = {
  'Confined Spaces': [
    'confined space', 'confined', 'manhole', 'tank entry', 'vessel entry', 'pit', 'silo',
    'enclosed space', 'limited access', 'restricted space', 'chamber', 'vault', 'tunnel',
    'underground', 'cellar', 'basement', 'shaft', 'crawl space', 'duct', 'pipeline entry'
  ],
  'Energized System': [
    'energized', 'electrical', 'live wire', 'power line', 'voltage', 'electric shock',
    'electrocution', 'circuit', 'switchboard', 'transformer', 'generator', 'cable',
    'wiring', 'panel', 'breaker', 'fuse', 'arc flash', 'loto', 'lockout', 'tagout',
    'isolation', 'de-energize', 'energised', 'db box', 'distribution box', 'junction box',
    'power cable', 'electrical connection', 'grounding', 'earthing', 'socket', 'outlet',
    'plug', 'conduit', 'busbar', 'electrical tape', 'insulation tape', 'wire splice',
    'mccb', 'mcb', 'rcd', 'elcb', 'power distribution', 'electrical panel', 'db board',
    'control panel', 'motor', 'pump', 'compressor', 'inverter', 'ups', 'battery bank',
    'distribution panel', 'db panel', 'electrical db', 'tower light', 'genset',
    'octopus socket', 'multi socket', 'earth pin', 'earthing rod'
  ],
  'Explosives & Blasting': [
    // Empty - no keyword auto-detection. Only classify from explicit Excel data.
  ],
  'Mobile Plant & Equipment': [
    'mobile plant', 'heavy equipment', 'excavator', 'bulldozer', 'loader', 'grader',
    'roller', 'compactor', 'backhoe', 'dump truck', 'tipper', 'concrete mixer',
    'crane', 'boom', 'jcb', 'bobcat', 'skid steer', 'telehandler', 'piling rig',
    'drilling rig', 'plant operator', 'machinery', 'machine'
  ],
  'Breaking Ground & Excavation': [
    'excavation', 'trench', 'digging', 'breaking ground', 'ground disturbance',
    'soil', 'cave-in', 'shoring', 'benching', 'sloping', 'trench box', 'spoil',
    'foundation', 'footing', 'utility strike', 'underground service', 'buried cable',
    'buried pipe', 'locate', 'potholing', 'hand dig'
  ],
  'Fire': [
    'fire', 'flame', 'burning', 'combustible', 'flammable', 'ignition', 'smoke',
    'fire extinguisher', 'fire alarm', 'fire exit', 'evacuation', 'fire risk',
    'fire hazard', 'fire prevention', 'fire fighting', 'fire watch', 'fire door',
    'sprinkler', 'fire blanket', 'burn'
  ],
  'Hot Work': [
    'hot work', 'welding', 'cutting', 'grinding', 'brazing', 'soldering', 'torch',
    'oxy-acetylene', 'arc welding', 'mig', 'tig', 'plasma', 'spark', 'slag',
    'weld', 'welder', 'flame cutting', 'gas cutting', 'hot tap', 'burning operation'
  ],
  'Lifting': [
    'lifting', 'crane', 'hoist', 'rigging', 'sling', 'shackle', 'hook', 'load',
    'suspended load', 'lifting plan', 'lift supervisor', 'banksman', 'signaller',
    'swl', 'safe working load', 'rated capacity', 'lifting gear', 'chain block',
    'come along', 'winch', 'pulley', 'forklift', 'pallet jack', 'manual handling'
  ],
  'Temporary Works': [
    'temporary works', 'scaffold', 'scaffolding', 'formwork', 'falsework', 'shutter',
    'propping', 'bracing', 'temporary structure', 'temporary support', 'staging',
    'platform', 'temporary bridge', 'temporary barrier', 'hoarding', 'temp works'
  ],
  'Working on or Near Live Roads': [
    'live road', 'live traffic', 'road work', 'highway', 'carriageway', 'roadside',
    'traffic cone', 'road closure', 'lane closure', 'traffic control', 'road diversion',
    'public road', 'ttm', 'chapter 8', 'near traffic', 'active roadway'
  ],
  'Driving': [
    'driving', 'driver', 'vehicle', 'car', 'van', 'truck', 'speeding', 'seatbelt',
    'reversing', 'blind spot', 'fatigue driving', 'distracted driving', 'mobile phone',
    'drink driving', 'journey management', 'defensive driving', 'road safety',
    'collision', 'accident', 'crash', 'transport'
  ],
  'Working at Height': [
    'working at height', 'height', 'fall', 'ladder', 'roof', 'edge protection',
    'guardrail', 'handrail', 'fall arrest', 'harness', 'lanyard', 'anchor point',
    'elevated', 'platform', 'mewp', 'scissor lift', 'cherry picker', 'boom lift',
    'access tower', 'stepladder', 'fall hazard', 'unprotected edge', 'opening',
    'elevated platform', 'roof work', 'rooftop', 'parapet', 'toe board', 'catch net',
    'safety net', 'lifeline', 'fall arrest system', 'retractable lanyard', 'srl',
    'vertical lifeline', 'horizontal lifeline', 'edge of slab', 'floor opening',
    'void', 'shaft opening', 'stairwell opening', 'leading edge', 'perimeter edge',
    'scaffolding access', 'ladder climbing', 'roofing work', 'structural steel',
    'formwork deck', 'elevated walkway', 'aerial work', 'skylight', 'fragile roof',
    'manlift', 'man lift', 'stakkabox', 'stakka box', 'fbh', 'full body harness',
    'retractable lifeline', 'manhole'
  ],
  'COSHH': [
    'coshh', 'chemical', 'hazardous substance', 'toxic', 'corrosive', 'irritant',
    'sds', 'msds', 'material safety', 'chemical storage', 'spill', 'leak',
    'fumes', 'vapour', 'vapor', 'solvent', 'acid', 'alkali', 'paint', 'adhesive',
    'resin', 'epoxy', 'hazmat', 'dangerous goods', 'poison', 'carcinogen'
  ],
  'Physical Hazard': [
    // Struck-by hazards (OSHA Fatal Four)
    'struck by', 'struck-by', 'hit by', 'hit by object',
    // Protruding rebars and sharp objects
    'protruding rebar', 'protruding rebars', 'exposed rebar', 'exposed rebars',
    'rebar cap', 'rebar caps', 'impalement', 'risk of impalement', 'impalement hazard',
    'sharp rebar', 'sharp rebars', 'sharp steel', 'sharp objects', 'sharp object',
    'uncapped rebar', 'uncapped rebars', 'unprotected rebar', 'unprotected rebars',
    // Protruding nails
    'protruding nail', 'protruding nails', 'exposed nail', 'exposed nails',
    'timber with nails', 'wood with nails', 'planks with nails', 'plywood with nails',
    // Tie rods
    'tie rod', 'tie rods',
    // Falling objects
    'falling object', 'falling objects', 'dropped object', 'dropped objects',
    'overhead hazard', 'object fell', 'objects falling', 'flying debris', 'projectile',
    // Sharp edges
    'sharp edge', 'sharp edges', 'cutting hazard', 'laceration', 'puncture',
    // Standards
    'phsas 37.9'
  ],
  'Mechanical Hazard': [
    // Caught-in/between hazards (OSHA Fatal Four)
    'caught in', 'caught-in', 'caught between', 'caught-between', 'caught in between',
    // Pinch/nip points
    'pinch point', 'pinch points', 'nip point', 'nip points', 'shear point', 'shear points',
    // Crushing hazards
    'crushing', 'crushed', 'crush hazard', 'crushing hazard',
    // Moving/rotating parts
    'moving parts', 'rotating parts', 'rotating equipment', 'rotating machinery',
    // Entanglement
    'entanglement', 'entangled', 'entangle',
    // Machinery and equipment
    'conveyor', 'conveyor belt', 'roller', 'gear', 'gears', 'pulley', 'pulleys',
    'belt', 'shaft', 'chain drive', 'belt drive',
    // Guards and protection
    'unguarded machinery', 'machine guard', 'missing guard', 'no guard', 'guard removed',
    // Severe outcomes
    'amputation', 'amputated', 'severed',
    // General mechanical terms
    'mechanical hazard', 'machinery hazard',
    // Blasting operations (moved from Explosives & Blasting)
    'blasting', 'blast', 'blasting operation', 'blasting activity',
    'drill and blast', 'controlled blasting', 'blast zone', 'blast radius',
    'detonator', 'detonators', 'detonation', 'detonating cord',
    'blasting primer', 'primer charge', 'booster', 'initiator', 'blasting cap', 'stemming',
    'shot firer', 'shot firing', 'blasting engineer', 'explosives engineer',
    'misfire', 'unexploded', 'flyrock', 'fly rock', 'blast damage',
    'ground vibration', 'ppv', 'peak particle velocity', 'air overpressure',
    'magazine', 'explosives magazine', 'explosive storage',
    'blast signal', 'blasting signal', 'blast warning', 'blast siren',
    'post blast', 'pre blast', 'blasting permit', 'blasting schedule', 'blast pattern',
    'exclusion zone blasting', 'sentry', 'sentries'
  ],
  'Environmental': [
    'environmental', 'contamination', 'pollution', 'ground contamination',
    'soil contamination', 'environmental damage', 'septic tank', 'septic overflow',
    'sewage', 'sewage overflow', 'effluent', 'wastewater', 'waste water'
  ],
  'Slip and Trip': [
    // Slip hazards (same level)
    'slip', 'slipped', 'slippery', 'slippery floor', 'slippery surface',
    // Trip hazards (same level)
    'trip', 'tripped', 'tripping hazard', 'trip hazard',
    // Surface conditions
    'uneven surface', 'uneven ground', 'uneven floor',
    'wet floor', 'wet surface', 'water on floor',
    'loose cable', 'cable across', 'cables on floor',
    'pothole', 'hole in ground', 'obstacle', 'obstruction'
    // NOTE: 'fall', 'fell', 'fall from' moved to Working at Height
  ],
  'Respiratory Hazard': [
    // Dust hazards
    'dust', 'dusty', 'dust control', 'dust suppression',
    // Silica
    'silica', 'silicosis', 'crystalline silica',
    // Fumes and particles
    'fumes', 'welding fumes', 'metal fumes', 'smoke', 'welding smoke',
    'particles', 'particulates', 'particulate', 'airborne particles', 'airborne',
    // Inhalation hazards
    'inhalation', 'inhalation hazard', 'respiratory', 'respiratory hazard', 'breathing',
    // Ventilation
    'ventilation', 'poor ventilation', 'no ventilation',
    'air quality', 'poor air quality',
    // Specific materials
    'asbestos', 'fiber', 'fibres', 'asbestosis', 'pneumoconiosis',
    // Dust types
    'concrete dust', 'cement dust', 'wood dust', 'grinding dust', 'cutting dust',
    'sanding', 'sanding dust', 'mist', 'spray', 'aerosol',
    // Protection
    'dust mask', 'respirator', 'rpf', 'dust extraction', 'vacuum', 'wet cutting',
    'respirable', 'water spray', 'lung'
  ],
  'Housekeeping': [
    'housekeeping', 'clutter', 'debris', 'clean', 'tidy', 'storage', 'obstruction',
    'mess', 'disorganized', 'untidy', 'waste', 'rubbish', 'garbage', 'sorting',
    'stacking', 'pile', 'trip hazard', 'walkway blocked', 'aisle', 'clear access',
    'skip', 'bin', 'container', '5s', 'workplace organization', 'cluttered',
    'messy', 'cleanup', 'clean up', 'tidying', 'organize', 'organised', 'organized',
    'sort out', 'dispose', 'disposal', 'clear area', 'scrap', 'offcuts', 'leftover',
    'scattered material', 'loose material', 'unorganized', 'disorderly', 'disorder',
    'accumulation', 'accumulated', 'piled up', 'lying around', 'dumped', 'abandoned',
    'unused material', 'excess material', 'material stacking', 'material storage'
  ],
  'Site Security': [
    'site security', 'security', 'access control', 'gate', 'guard', 'trespassing',
    'unauthorized', 'unauthorised', 'intruder', 'theft', 'vandalism', 'fencing',
    'perimeter security', 'cctv', 'visitor', 'badge', 'id card', 'check-in'
  ],
  'Access': [
    'access', 'egress', 'entry', 'exit', 'pathway', 'walkway', 'stairway', 'stairs',
    'ladder access', 'ramp', 'doorway', 'corridor', 'passage', 'route', 'accessway',
    'means of access', 'safe access', 'blocked access', 'slip', 'trip', 'uneven surface'
  ],
  'Worker Welfare': [
    // Core welfare terms
    'welfare', 'welfare facility', 'welfare facilities',
    // Camps and accommodation
    'camp', 'camps', 'labor camp', 'labour camp', 'worker camp',
    'accommodation', 'worker accommodation', 'staff accommodation',
    'dormitory', 'dorm', 'living quarters',
    // Toilet and sanitation
    'toilet', 'toilets', 'washroom', 'restroom', 'bathroom', 'latrine',
    'sanitation', 'portable toilet', 'urinal',
    // Food facilities
    'canteen', 'mess hall', 'dining facility', 'kitchen', 'cafeteria',
    // Drinking water
    'drinking water', 'potable water', 'water station', 'water cooler',
    // Rest areas
    'rest area', 'break room', 'shade area', 'resting place', 'shelter',
    'rest shelter',
    // Medical facilities
    'first aid room', 'medical facility', 'clinic',
    // Changing facilities
    'changing room', 'locker room', 'locker',
    // Other welfare
    'prayer room', 'worship area', 'recreation', 'recreational facility',
    'hand washing', 'hygiene',
    // Additional welfare facilities
    'water filter', 'water igloo', 'security cabin', 'ac unit', 'air conditioner',
    'ventilation fan', 'gym', 'pedestal fan'
  ],
  'Tools': [
    'tool', 'hand tool', 'power tool', 'equipment', 'wrench', 'hammer', 'screwdriver',
    'drill', 'saw', 'grinder', 'cutter', 'pliers', 'chisel', 'knife', 'blade',
    'defective tool', 'damaged tool', 'tool inspection', 'wrong tool', 'improvised tool',
    'tool storage', 'tool box', 'sharp', 'cutting tool', 'impact driver', 'angle grinder',
    'circular saw', 'reciprocating saw', 'jigsaw', 'mitre saw', 'bench grinder',
    'wire brush', 'file', 'rasp', 'level', 'measuring tape', 'tape measure', 'spirit level',
    'crowbar', 'pry bar', 'bolt cutter', 'cable cutter', 'pipe wrench', 'adjustable wrench',
    'socket set', 'ratchet', 'allen key', 'hex key', 'torque wrench', 'multimeter',
    'inspection sticker', 'color code', 'colour code', 'quarterly inspection'
  ],
  'Traffic Management': [
    'traffic management', 'traffic control', 'pedestrian', 'segregation', 'crossing',
    'speed limit', 'one way', 'traffic flow', 'vehicle movement', 'banksman',
    'spotter', 'reversing assistant', 'traffic marshal', 'traffic plan', 'haul road',
    'site traffic', 'internal traffic', 'delivery', 'loading', 'unloading'
  ],
  'General Site Issues': [
    // NOTE: These generic terms no longer auto-classify
    // Observations with only these keywords require manual review
    'work environment', 'environment', 'weather', 'temperature',
    'cold stress', 'lighting', 'illumination', 'noise', 'vibration', 'ergonomic',
    'ventilation', 'air quality', 'humidity', 'wind', 'rain', 'storm', 'condition',
    'climate', 'comfort', 'fatigue', 'shift work', 'working hours'
  ],
  'Working in Heat': [
    'working in heat', 'heat', 'hot surface', 'burn hazard', 'thermal', 'steam',
    'hot pipe', 'hot equipment', 'molten', 'furnace', 'oven', 'kiln', 'boiler',
    'heat exchanger', 'insulation', 'lagging', 'heat exposure', 'scalding', 'scald',
    'heat stress', 'hydration', 'shade', 'cooling', 'rest break',
    'drinking water', 'water igloo', 'ice', 'welfare flag', 'heat flag',
    'heat index', 'personal hydration', 'water jug', 'restricted hours', 'direct sunlight'
  ],
  'Working on or Near Water': [
    // Empty - no keyword auto-detection. Only classify from explicit Excel data.
  ],
}

// Priority phrase patterns (checked BEFORE single keywords) - Layer 2
// These multi-word phrases take precedence to avoid wrong classification from generic words
export const HAZARD_PHRASES = {
  'Confined Spaces': [
    'confined space entry', 'confined space', 'tank entry', 'vessel entry', 'manhole entry',
    'entering confined', 'work in confined', 'confined area'
  ],
  'Energized System': [
    'live wire', 'electrical isolation', 'lockout tagout', 'arc flash', 'electrical work',
    'live electrical', 'energized equipment', 'de-energize', 'electrical hazard',
    'power isolation', 'electrical safety',
    'cable management', 'cable routing', 'cable splicing', 'poor cable',
    'unsafe electrical', 'electrical cable', 'exposed cable', 'live cable', 'damaged cable'
  ],
  'Explosives & Blasting': [
    // Empty - no keyword auto-detection. Only classify from explicit Excel data.
  ],
  'Working at Height': [
    'working at height', 'work at height', 'fall protection', 'edge protection', 'roof work',
    'working on roof', 'ladder work', 'scaffold work', 'elevated work', 'above ground',
    'fall from height', 'height work', 'working above', 'open manhole'
  ],
  'Hot Work': [
    'hot work permit', 'hot work', 'welding work', 'cutting work', 'grinding work',
    'welding operation', 'flame cutting', 'gas cutting', 'arc welding'
  ],
  'Lifting': [
    'lifting operation', 'crane lift', 'suspended load', 'rigging operation', 'lift plan',
    'lifting gear', 'crane operation', 'hoist operation', 'load lifting'
  ],
  'Breaking Ground & Excavation': [
    'breaking ground', 'ground disturbance', 'excavation work', 'trench work',
    'digging operation', 'underground work'
  ],
  'Mobile Plant & Equipment': [
    'mobile plant', 'heavy equipment', 'plant operation', 'equipment operation',
    'machinery operation', 'plant movement'
  ],
  'Fire': [
    'fire hazard', 'fire risk', 'fire prevention', 'fire safety', 'fire watch',
    'fire alarm', 'fire fighting', 'fire break out', 'open flame'
  ],
  'COSHH': [
    'hazardous substance', 'chemical storage', 'chemical handling', 'chemical spill',
    'toxic substance', 'dangerous goods', 'material safety', 'coshh assessment'
  ],
  'Temporary Works': [
    'temporary works', 'scaffold erection', 'scaffold inspection', 'formwork installation',
    'temporary structure', 'scaffold platform'
  ],
  'Traffic Management': [
    'traffic management', 'traffic control', 'pedestrian segregation', 'vehicle segregation',
    'traffic plan', 'site traffic', 'vehicle movement'
  ],
  'Housekeeping': [
    'poor housekeeping', 'site housekeeping', 'housekeeping issue', 'material storage',
    'waste management', 'debris accumulation'
  ],
  'Access': [
    'blocked access', 'safe access', 'means of access', 'access route', 'egress route',
    'emergency access', 'pedestrian access', 'vehicle access'
  ],
  'Tools': [
    'defective tool', 'damaged tool', 'wrong tool', 'tool inspection', 'power tool',
    'hand tool', 'tool maintenance'
  ],
  'Driving': [
    'driving safety', 'vehicle safety', 'driver behavior', 'speeding vehicle',
    'seat belt', 'journey management', 'defensive driving'
  ],
  'Site Security': [
    'site security', 'access control', 'unauthorized access', 'security breach',
    'perimeter security'
  ],
  'Worker Welfare': [
    'welfare facilities', 'drinking water', 'toilet facilities', 'rest area',
    'first aid room', 'welfare provision', 'potable water', 'water cooler',
    'water dispenser', 'water station', 'water not available', 'water not provided',
    'no drinking water', 'clean water', 'water shortage', 'hand washing',
    'sanitary water', 'water bottle', 'water jug', 'filtered water',
    'hot water', 'cold water', 'washing water', 'hygiene water'
  ],
  'Respiratory Hazard': [
    'dust control', 'dust suppression', 'silica dust', 'respirable dust',
    'dust exposure', 'airborne dust'
  ],
  'Working on or Near Live Roads': [
    'live road', 'live traffic', 'road work', 'near traffic', 'highway work',
    'public highway'
  ],
  'Working in Heat': [
    'hot surface', 'burn hazard', 'thermal hazard', 'heat exposure', 'steam hazard',
    'hot pipe', 'hot equipment', 'heat stress', 'working in heat', 'hot conditions'
  ],
  'Working on or Near Water': [
    // Empty - no keyword auto-detection. Only classify from explicit Excel data.
  ],
  'Physical Hazard': [
    'struck by', 'hit by', 'falling object', 'dropped object',
    'sharp object', 'protruding rebar', 'exposed rebar', 'impalement hazard',
    'flying debris', 'projectile', 'sharp edge', 'laceration hazard'
  ],
  'Mechanical Hazard': [
    'caught in', 'caught between', 'pinch point', 'nip point',
    'crushing hazard', 'moving parts', 'rotating parts', 'entanglement',
    'unguarded machinery', 'machine guard', 'amputation hazard',
    // Blasting operations (moved from Explosives & Blasting)
    'blasting operation', 'blasting activity', 'drill and blast', 'controlled blasting',
    'blast zone', 'blasting permit', 'shot firer', 'explosives handling',
    'explosive storage', 'detonator storage', 'blast signal', 'post blast inspection',
    'misfire procedure', 'unexploded charge', 'ground vibration monitoring'
  ],
  'Slip and Trip': [
    'slip hazard', 'trip hazard', 'slippery floor', 'slippery surface',
    'tripping hazard', 'uneven surface', 'wet floor', 'obstacle'
  ],
}

// Category priority order - MAJOR HAZARDS FIRST, then Sub-Significant
// When checking single keywords, categories are checked in this order
// NOTE: Control categories (Safety Supervision, Training and Competency, Permit and RAMS) REMOVED
// These are controls, not hazards - classify by the UNDERLYING hazard instead
export const CATEGORY_PRIORITY = [
  // === 16 MAJOR (SIGNIFICANT) HAZARDS - Checked First ===
  // Includes 14 Significant Hazards + Physical Hazard + Mechanical Hazard
  'Confined Spaces',              // 1 - IDLH environment
  'Energized System',             // 2 - Electrocution risk
  'Explosives & Blasting',        // 3 - Blast/explosion risk
  'Working at Height',            // 4 - Fatal fall risk
  'Hot Work',                     // 5 - Fire/explosion risk
  'Lifting',                      // 6 - Suspended load risk
  'Breaking Ground & Excavation', // 7 - Cave-in risk
  'Fire',                         // 8 - Fire risk
  'Mobile Plant & Equipment',     // 9 - Plant strike risk
  'Physical Hazard',              // 10 - Struck-by risk (OSHA Fatal Four)
  'Mechanical Hazard',            // 11 - Caught-in risk (OSHA Fatal Four)
  'Working on or Near Live Roads', // 12 - Traffic risk
  'Working on or Near Water',     // 13 - Drowning risk
  'Driving',                      // 14 - Vehicle incident
  'Temporary Works',              // 15 - Structural collapse
  'Working in Heat',              // 16 - Heat stress/burn risk

  // === 11 SUB-SIGNIFICANT HAZARDS - Checked After Major ===
  'COSHH',                        // 16 - Chemical exposure
  'Respiratory Hazard',           // 17 - Respiratory hazard (dust, silica, fumes)
  'Traffic Management',           // 18 - Site traffic
  'Site Security',                // 19 - Security hazards
  'Housekeeping',                 // 20 - Housekeeping hazards
  'Slip and Trip',                // 21 - Slip/trip hazards (same level)
  'Worker Welfare',               // 22 - Welfare facilities, camps
  'Environmental',                // 23 - Environmental contamination
  'Tools',                        // 24 - Tool hazards
  'Access',                       // 25 - Access/egress hazards
  'General Site Issues',          // 26 - Requires manual review (LAST - no garbage bucket)
]

// Engagement Types
export const ENGAGEMENT_TYPES = [
  { value: 'site-inspection', label: 'Site Safety Inspection', icon: 'ClipboardCheck' },
  { value: 'toolbox-talk', label: 'Toolbox Talk / Safety Briefing', icon: 'Users' },
  { value: 'safety-meeting', label: 'Safety Committee Meeting', icon: 'UserCircle' },
  { value: 'internal-audit', label: 'Internal Audit', icon: 'FileSearch' },
  { value: 'external-audit', label: 'External Audit', icon: 'FileCheck' },
  { value: 'training', label: 'Training Session', icon: 'GraduationCap' },
  { value: 'management-walk', label: 'Management Safety Walk', icon: 'Footprints' },
  { value: 'emergency-drill', label: 'Emergency Drill', icon: 'Siren' },
  { value: 'permit-review', label: 'Permit-to-Work Review', icon: 'FileText' },
  { value: 'risk-assessment', label: 'Risk Assessment Review', icon: 'AlertTriangle' },
]

// Compliance Types
export const COMPLIANCE_TYPES = [
  { value: 'hot-work', label: 'Hot Work Permit', category: 'permits' },
  { value: 'confined-space', label: 'Confined Space Permit', category: 'permits' },
  { value: 'height-work', label: 'Work at Height Permit', category: 'permits' },
  { value: 'excavation', label: 'Excavation Permit', category: 'permits' },
  { value: 'lifting', label: 'Lifting Operation Permit', category: 'permits' },
  { value: 'rigger-cert', label: 'Rigger Certification', category: 'certifications' },
  { value: 'scaffolder-cert', label: 'Scaffolder Certification', category: 'certifications' },
  { value: 'crane-operator', label: 'Crane Operator License', category: 'certifications' },
  { value: 'first-aid', label: 'First Aid Certification', category: 'certifications' },
  { value: 'crane-inspection', label: 'Crane Inspection', category: 'equipment' },
  { value: 'scaffold-inspection', label: 'Scaffolding Inspection', category: 'equipment' },
  { value: 'ppe-inspection', label: 'PPE Inspection', category: 'equipment' },
  { value: 'fire-extinguisher', label: 'Fire Extinguisher Inspection', category: 'equipment' },
  { value: 'insurance', label: 'Insurance Policy', category: 'documents' },
  { value: 'license', label: 'Business License', category: 'documents' },
  { value: 'method-statement', label: 'Method Statement', category: 'documents' },
]

// Project Statuses
export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active', color: '#22c55e' },
  { value: 'on-hold', label: 'On Hold', color: '#f97316' },
  { value: 'completed', label: 'Completed', color: '#6b7280' },
]

// Action Statuses
export const ACTION_STATUSES = [
  { value: 'open', label: 'Open', color: '#dc2626' },
  { value: 'in-progress', label: 'In Progress', color: '#f97316' },
  { value: 'closed', label: 'Closed', color: '#22c55e' },
]

// Body Parts (for incident reporting)
export const BODY_PARTS = [
  'Head', 'Face', 'Eyes', 'Ears', 'Neck',
  'Shoulder', 'Upper Arm', 'Elbow', 'Forearm', 'Wrist', 'Hand', 'Fingers',
  'Chest', 'Back (Upper)', 'Back (Lower)', 'Abdomen',
  'Hip', 'Thigh', 'Knee', 'Lower Leg', 'Ankle', 'Foot', 'Toes',
  'Multiple Body Parts', 'Other',
]

// Root Cause Categories
export const ROOT_CAUSES = [
  'Inadequate Training',
  'Lack of Supervision',
  'Improper PPE Usage',
  'Equipment Failure',
  'Poor Housekeeping',
  'Unsafe Work Practice',
  'Inadequate Procedure',
  'Environmental Conditions',
  'Human Error',
  'Communication Failure',
  'Fatigue',
  'Time Pressure',
  'Other',
]

// Navigation Items
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/projects', label: 'Projects', icon: 'Building2' },
  { path: '/incidents', label: 'Incidents', icon: 'AlertTriangle' },
  { path: '/engagements', label: 'Engagements', icon: 'CalendarCheck' },
  { path: '/compliance', label: 'Compliance', icon: 'Shield' },
  { path: '/reports', label: 'Reports', icon: 'FileBarChart' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
]

// Default Engagement Targets
export const DEFAULT_TARGETS = {
  weekly: {
    'site-inspection': 5,
    'toolbox-talk': 5,
    'permit-review': 3,
  },
  monthly: {
    'internal-audit': 1,
    'training': 2,
    'emergency-drill': 1,
    'management-walk': 2,
    'risk-assessment': 2,
  }
}

// Construction/Safety technical terms whitelist - words that should NOT be flagged as misspellings
// These are valid industry terms that standard dictionaries might not recognize
export const SPELL_CHECK_WHITELIST = [
  // Acronyms & Abbreviations
  'ppe', 'mewp', 'loto', 'hiab', 'cpcs', 'cscs', 'rams', 'swms', 'jsea', 'jha', 'pta', 'ptw',
  'coshh', 'msds', 'sds', 'osha', 'hse', 'bbs', 'kpi', 'tlb', 'jcb', 'cctv', 'rfid', 'qr',

  // Equipment & Tools
  'rebar', 'rebars', 'formwork', 'falsework', 'shuttering', 'scafftag', 'banksman',
  'telehandler', 'excavator', 'backhoe', 'bobcat', 'skidsteer', 'dumper', 'tipper',
  'grinder', 'hilti', 'makita', 'dewalt', 'stihl', 'husqvarna', 'kango', 'wacker',
  'breaker', 'compactor', 'vibrator', 'screed', 'trowel', 'bolster', 'stillage',

  // Construction Terms
  'precast', 'insitu', 'situ', 'rfi', 'submittal', 'punchlist', 'snag', 'snagging',
  'backfill', 'subgrade', 'subbase', 'blinding', 'oversite', 'dpm', 'dpc', 'tanking',
  'underpinning', 'piling', 'cfa', 'secant', 'contiguous', 'kingpost', 'waling',
  'shoring', 'propping', 'acrow', 'strongboy', 'needling', 'lintel', 'padstone',

  // Safety Terms
  'toolbox', 'standup', 'walkdown', 'induction', 'signage', 'demarcation',
  'exclusion', 'barricading', 'isolator', 'lockout', 'tagout', 'energised', 'energized',
  'deenergised', 'deenergized', 'earthing', 'bonding', 'equipotential',

  // Materials
  'geotextile', 'geomembrane', 'geocell', 'gabion', 'riprap', 'aggregates',
  'bitumen', 'asphalt', 'macadam', 'tarmac', 'screedable', 'pourable',

  // Certifications & Documents
  'competency', 'briefing', 'debriefing', 'walkthrough', 'signoff', 'checklist',

  // Common site words
  'hoarding', 'heras', 'fencing', 'welfare', 'canteen', 'drying', 'muster',
  'laydown', 'hardstanding', 'haul', 'haulage', 'spoil', 'arisings', 'muckaway',

  // Brands often used generically
  'portakabin', 'portaloo', 'acrow', 'kee', 'klamp', 'scaffolders', 'scaffolder',

  // Common English words that fuzzy matching might incorrectly flag
  // (words similar to other words but are valid themselves)
  'unavailable', 'available', 'workers', 'worker', 'areas', 'area',
  'current', 'correct', 'house', 'hose', 'houses', 'hoses',
  'form', 'forms', 'from', 'were', 'where', 'wear', 'there', 'their', 'they',
  'than', 'then', 'through', 'though', 'thorough',
  'loose', 'lose', 'loss', 'lost',
  'quite', 'quiet', 'quit',
  'affect', 'effect', 'effects', 'affects',
  'accept', 'except', 'expect',
  'advice', 'advise',
  'ensure', 'insure', 'assure',
  'beside', 'besides',
  'farther', 'further',
  'principal', 'principle',
  'stationary', 'stationery',
  'complement', 'compliment',
  'desert', 'dessert',
  'personal', 'personnel',
  'proceed', 'precede',
  'continuous', 'continual',
  'discreet', 'discrete',
  'elicit', 'illicit',
  'emigrate', 'immigrate',
  'eminent', 'imminent',
  'ensure', 'insure',
  'weather', 'whether',
  'whose', 'whos',
  'later', 'latter',
  'lead', 'led',
  'maybe', 'may',
  'passed', 'past',
  'piece', 'peace',
  'plain', 'plane',
  'presence', 'presents',
  'raise', 'rise',
  'role', 'roll',
  'sight', 'site', 'cite',
  'than', 'then',
  'threw', 'through',
  'week', 'weak',
  'which', 'witch',
]

// Comprehensive foul/inappropriate words list (case-insensitive matching)
// Used by data quality auditing to flag unprofessional language in observation descriptions
export const FOUL_WORDS_LIST = [
  // Mild workplace-inappropriate
  'damn', 'dammit', 'damned', 'hell', 'crap', 'crappy', 'stupid', 'idiot', 'idiotic',
  'dumb', 'dumbass', 'fool', 'foolish', 'moron', 'moronic', 'jerk',
  // Strong profanity
  'shit', 'shitty', 'bullshit', 'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker',
  'ass', 'asshole', 'bastard', 'bitch', 'bitchy', 'piss', 'pissed', 'pissing',
  'dick', 'dickhead', 'cock', 'cunt', 'whore', 'slut',
  // Slurs and discriminatory terms
  'retard', 'retarded', 'spastic', 'spaz', 'tard',
  // Aggressive/threatening language (context-dependent but flagged for review)
  'kill', 'murder', 'die', 'hate',
  // Common typo/evasion variations
  'fuk', 'fck', 'fcking', 'sht', 'azz', 'btch', 'fking', 'effing', 'wtf', 'stfu',
  // Additional inappropriate terms
  'screw', 'screwed', 'suck', 'sucks', 'sucked', 'sucker', 'loser', 'useless',
  'incompetent', 'worthless', 'pathetic', 'disgusting', 'gross',
]

// Vague hazard terms that need specifics - flag when used alone without detail
// These indicate lazy or low-quality observation descriptions
export const VAGUE_HAZARD_TERMS = [
  { term: 'unsafe', requires: 'specific unsafe condition or behavior' },
  { term: 'risk', requires: 'what the specific risk is' },
  { term: 'danger', requires: 'what the specific danger is' },
  { term: 'dangerous', requires: 'what makes it dangerous' },
  { term: 'hazard', requires: 'type of hazard' },
  { term: 'hazardous', requires: 'what makes it hazardous' },
  { term: 'issue', requires: 'specific issue description' },
  { term: 'problem', requires: 'specific problem' },
  { term: 'concern', requires: 'specific concern' },
  { term: 'bad', requires: 'what specifically is bad' },
  { term: 'wrong', requires: 'what specifically is wrong' },
  { term: 'poor', requires: 'what specifically is poor' },
  { term: 'not good', requires: 'what specifically is not good' },
  { term: 'not safe', requires: 'what specifically is not safe' },
  { term: 'needs attention', requires: 'what specific attention is needed' },
  { term: 'needs improvement', requires: 'what specific improvement is needed' },
]

// Contributing Factor Colors - TRUE ROOT CAUSES (WHY it happened)
// These are organizational/systemic factors, NOT physical deficiencies
export const CONTRIBUTING_FACTOR_COLORS = {
  'Human Factors': '#ef4444',           // Red - Worker behavior (fatigue, complacency, rushing)
  'Supervision': '#f97316',             // Orange - Oversight failures
  'Training & Competency': '#eab308',   // Yellow - Knowledge/skill gaps
  'Planning & Procedures': '#22c55e',   // Green - System/process failures
  'Communication': '#06b6d4',           // Cyan - Information flow issues
  'Organizational': '#ec4899',          // Pink - Management/culture issues
  'Environmental': '#8b5cf6',           // Purple - External conditions
  'Equipment Management': '#3b82f6'     // Blue - Maintenance/inspection failures
}

// =============================================================================
// HAZARD_RECOMMENDED_ACTIONS - Maps hazards to recommended interventions
// Used by Scenario Simulator Compact for hazard-specific recommendations
// =============================================================================
export const HAZARD_RECOMMENDED_ACTIONS = {
  'Working at Height': [
    { factor: 'Training', action: 'WAH Competency Assessment', priority: 'high', effect: 20 },
    { factor: 'Barriers', action: 'Edge Protection Audit', priority: 'high', effect: 18 },
    { factor: 'Inspections', action: 'Daily Scaffold Checks', priority: 'medium', effect: 12 },
    { factor: 'PPE', action: 'Harness Inspection Program', priority: 'high', effect: 15 },
    { factor: 'Supervision', action: 'WAH Supervisor Allocation', priority: 'medium', effect: 10 }
  ],
  'Mobile Plant & Equipment': [
    { factor: 'Training', action: 'Operator Certification', priority: 'high', effect: 22 },
    { factor: 'Barriers', action: 'Exclusion Zones', priority: 'high', effect: 20 },
    { factor: 'Supervision', action: 'Banksman Allocation', priority: 'medium', effect: 15 },
    { factor: 'Inspections', action: 'Pre-Start Checks', priority: 'high', effect: 18 },
    { factor: 'Communication', action: 'Radio Protocol', priority: 'medium', effect: 10 }
  ],
  'Lifting': [
    { factor: 'Planning', action: 'Lift Plan Reviews', priority: 'high', effect: 25 },
    { factor: 'Competency', action: 'Rigger Certification', priority: 'high', effect: 20 },
    { factor: 'Communication', action: 'Radio Protocol', priority: 'medium', effect: 12 },
    { factor: 'Inspections', action: 'Lifting Gear Inspections', priority: 'high', effect: 18 },
    { factor: 'Barriers', action: 'Exclusion Zone Enforcement', priority: 'medium', effect: 15 }
  ],
  'Confined Spaces': [
    { factor: 'Permit', action: 'PTW Audit', priority: 'high', effect: 25 },
    { factor: 'Training', action: 'Rescue Drill Training', priority: 'high', effect: 20 },
    { factor: 'Supervision', action: 'Entry Supervisor', priority: 'medium', effect: 15 },
    { factor: 'Safety Devices', action: 'Gas Detection Equipment', priority: 'high', effect: 22 },
    { factor: 'Communication', action: 'Emergency Response Plan', priority: 'medium', effect: 12 }
  ],
  'Breaking Ground & Excavation': [
    { factor: 'Permit', action: 'Dig Permit Compliance', priority: 'high', effect: 25 },
    { factor: 'Barriers', action: 'Edge Protection', priority: 'high', effect: 20 },
    { factor: 'Inspections', action: 'Daily Excavation Inspections', priority: 'high', effect: 18 },
    { factor: 'Planning', action: 'Utility Detection Survey', priority: 'high', effect: 22 },
    { factor: 'Supervision', action: 'Competent Person On-Site', priority: 'medium', effect: 15 }
  ],
  'Hot Work': [
    { factor: 'Permit', action: 'Hot Work Permit Compliance', priority: 'high', effect: 25 },
    { factor: 'Training', action: 'Fire Watch Training', priority: 'high', effect: 18 },
    { factor: 'Safety Devices', action: 'Fire Extinguisher Placement', priority: 'high', effect: 20 },
    { factor: 'Inspections', action: 'Post-Work Inspections', priority: 'medium', effect: 15 },
    { factor: 'Housekeeping', action: 'Combustible Material Removal', priority: 'high', effect: 18 }
  ],
  'Energized System': [
    { factor: 'Permit', action: 'LOTO Compliance Audit', priority: 'high', effect: 28 },
    { factor: 'Training', action: 'Electrical Safety Training', priority: 'high', effect: 22 },
    { factor: 'Barriers', action: 'Electrical Isolation Barriers', priority: 'high', effect: 20 },
    { factor: 'Signage', action: 'Warning Sign Audit', priority: 'medium', effect: 12 },
    { factor: 'Safety Devices', action: 'Earth Leakage Protection', priority: 'high', effect: 18 }
  ],
  'Fire': [
    { factor: 'Housekeeping', action: 'Combustible Storage Audit', priority: 'high', effect: 22 },
    { factor: 'Safety Devices', action: 'Fire Detection Systems', priority: 'high', effect: 20 },
    { factor: 'Training', action: 'Fire Response Training', priority: 'high', effect: 18 },
    { factor: 'Emergency Preparedness', action: 'Evacuation Drills', priority: 'medium', effect: 15 },
    { factor: 'Inspections', action: 'Fire Equipment Inspections', priority: 'high', effect: 16 }
  ],
  'Temporary Works': [
    { factor: 'Planning', action: 'TWC Design Review', priority: 'high', effect: 25 },
    { factor: 'Inspections', action: 'Permission to Load Checks', priority: 'high', effect: 22 },
    { factor: 'Competency', action: 'Designated Individual Training', priority: 'high', effect: 18 },
    { factor: 'Documentations', action: 'Method Statement Review', priority: 'medium', effect: 15 },
    { factor: 'Supervision', action: 'TWC Oversight', priority: 'medium', effect: 12 }
  ],
  'Driving': [
    { factor: 'Training', action: 'Defensive Driving Training', priority: 'high', effect: 22 },
    { factor: 'Supervision', action: 'Journey Management', priority: 'medium', effect: 15 },
    { factor: 'Inspections', action: 'Vehicle Pre-Trip Inspections', priority: 'high', effect: 18 },
    { factor: 'Behavioural', action: 'Driver Behavior Monitoring', priority: 'medium', effect: 14 },
    { factor: 'Communication', action: 'Route Planning Brief', priority: 'medium', effect: 10 }
  ],
  'Working in Heat': [
    { factor: 'Planning', action: 'Work-Rest Cycle Planning', priority: 'high', effect: 22 },
    { factor: 'Environment', action: 'Shade/Cooling Stations', priority: 'high', effect: 20 },
    { factor: 'Training', action: 'Heat Illness Awareness', priority: 'high', effect: 18 },
    { factor: 'Supervision', action: 'TWL Monitoring', priority: 'medium', effect: 15 },
    { factor: 'Communication', action: 'Heat Alert System', priority: 'medium', effect: 12 }
  ],
  'Working on or Near Live Roads': [
    { factor: 'Barriers', action: 'Vehicle Intrusion Protection', priority: 'high', effect: 25 },
    { factor: 'Planning', action: 'TTM Plan Review', priority: 'high', effect: 22 },
    { factor: 'Training', action: 'Traffic Marshal Training', priority: 'high', effect: 18 },
    { factor: 'PPE', action: 'High-Visibility Clothing Audit', priority: 'medium', effect: 12 },
    { factor: 'Communication', action: 'MOT Coordination', priority: 'medium', effect: 15 }
  ],
  'Working on or Near Water': [
    { factor: 'Safety Devices', action: 'Lifebuoy Placement', priority: 'high', effect: 25 },
    { factor: 'Training', action: 'Water Rescue Training', priority: 'high', effect: 22 },
    { factor: 'PPE', action: 'Life Jacket Compliance', priority: 'high', effect: 20 },
    { factor: 'Supervision', action: 'Buddy System Enforcement', priority: 'medium', effect: 15 },
    { factor: 'Emergency Preparedness', action: 'Rescue Boat Availability', priority: 'high', effect: 18 }
  ],
  'Explosives & Blasting': [
    { factor: 'Permit', action: 'Blasting Permit Compliance', priority: 'high', effect: 28 },
    { factor: 'Competency', action: 'Shot Firer Certification', priority: 'high', effect: 25 },
    { factor: 'Barriers', action: 'Blast Zone Exclusion', priority: 'high', effect: 22 },
    { factor: 'Communication', action: 'Blast Warning System', priority: 'high', effect: 20 },
    { factor: 'Inspections', action: 'Misfire Procedures', priority: 'high', effect: 18 }
  ],
  'Physical Hazard': [
    { factor: 'Barriers', action: 'Struck-By Prevention Barriers', priority: 'high', effect: 20 },
    { factor: 'PPE', action: 'Hard Hat/Safety Glasses Compliance', priority: 'high', effect: 18 },
    { factor: 'Housekeeping', action: 'Overhead Work Exclusion Zones', priority: 'medium', effect: 15 },
    { factor: 'Signage', action: 'Warning Sign Placement', priority: 'medium', effect: 12 },
    { factor: 'Training', action: 'Hazard Awareness Training', priority: 'medium', effect: 14 }
  ],
  'Mechanical Hazard': [
    { factor: 'Machine Guarding', action: 'Guard Installation Audit', priority: 'high', effect: 25 },
    { factor: 'Safety Devices', action: 'Emergency Stop Checks', priority: 'high', effect: 20 },
    { factor: 'Training', action: 'Machine-Specific Training', priority: 'high', effect: 18 },
    { factor: 'Inspections', action: 'Moving Parts Inspection', priority: 'medium', effect: 15 },
    { factor: 'Permit', action: 'LOTO Compliance', priority: 'high', effect: 22 }
  ],
  'COSHH': [
    { factor: 'Documentations', action: 'COSHH Assessment Review', priority: 'high', effect: 22 },
    { factor: 'Training', action: 'Chemical Handling Training', priority: 'high', effect: 20 },
    { factor: 'PPE', action: 'Chemical PPE Compliance', priority: 'high', effect: 18 },
    { factor: 'Housekeeping', action: 'Chemical Storage Audit', priority: 'medium', effect: 15 },
    { factor: 'Signage', action: 'MSDS Availability', priority: 'medium', effect: 12 }
  ],
  'Respiratory Hazard': [
    { factor: 'PPE', action: 'Respirator Fit Testing', priority: 'high', effect: 22 },
    { factor: 'Environment', action: 'Dust Suppression', priority: 'high', effect: 20 },
    { factor: 'Training', action: 'RPE Training', priority: 'high', effect: 18 },
    { factor: 'Inspections', action: 'Air Quality Monitoring', priority: 'high', effect: 20 },
    { factor: 'Barriers', action: 'Isolation/Ventilation', priority: 'medium', effect: 15 }
  ],
  'Housekeeping': [
    { factor: 'Supervision', action: 'Housekeeping Inspections', priority: 'high', effect: 20 },
    { factor: 'Training', action: '5S/6S Training', priority: 'medium', effect: 15 },
    { factor: 'Inspections', action: 'Daily Walkthrough Audits', priority: 'high', effect: 18 },
    { factor: 'Communication', action: 'Clean-As-You-Go Campaign', priority: 'medium', effect: 12 },
    { factor: 'Behavioural', action: 'Housekeeping Recognition', priority: 'medium', effect: 10 }
  ],
  'Site Security': [
    { factor: 'Barriers', action: 'Access Control Audit', priority: 'high', effect: 22 },
    { factor: 'Training', action: 'Security Awareness Training', priority: 'medium', effect: 15 },
    { factor: 'Inspections', action: 'Perimeter Inspections', priority: 'high', effect: 18 },
    { factor: 'Communication', action: 'Visitor Management System', priority: 'medium', effect: 12 },
    { factor: 'Signage', action: 'Restricted Area Signage', priority: 'medium', effect: 10 }
  ],
  'Access': [
    { factor: 'Barriers', action: 'Safe Access Routes', priority: 'high', effect: 22 },
    { factor: 'Signage', action: 'Wayfinding Signage', priority: 'medium', effect: 15 },
    { factor: 'Housekeeping', action: 'Clear Access Pathways', priority: 'high', effect: 18 },
    { factor: 'Inspections', action: 'Access Point Inspections', priority: 'medium', effect: 14 },
    { factor: 'Training', action: 'Site Induction Routes', priority: 'medium', effect: 12 }
  ],
  'Worker Welfare': [
    { factor: 'Environment', action: 'Welfare Facility Audit', priority: 'high', effect: 22 },
    { factor: 'Inspections', action: 'Daily Welfare Checks', priority: 'high', effect: 18 },
    { factor: 'Communication', action: 'Worker Feedback System', priority: 'medium', effect: 15 },
    { factor: 'Supervision', action: 'Welfare Supervisor Assignment', priority: 'medium', effect: 12 },
    { factor: 'Planning', action: 'Welfare Provision Planning', priority: 'medium', effect: 14 }
  ],
  'Tools': [
    { factor: 'Inspections', action: 'Tool Inspection Program', priority: 'high', effect: 22 },
    { factor: 'Training', action: 'Tool-Specific Training', priority: 'high', effect: 18 },
    { factor: 'Housekeeping', action: 'Tool Storage Audit', priority: 'medium', effect: 15 },
    { factor: 'PPE', action: 'Tool-Related PPE Compliance', priority: 'medium', effect: 14 },
    { factor: 'Safety Devices', action: 'Tool Safety Features Check', priority: 'medium', effect: 12 }
  ],
  'Traffic Management': [
    { factor: 'Planning', action: 'TMP Review', priority: 'high', effect: 25 },
    { factor: 'Barriers', action: 'Vehicle/Pedestrian Segregation', priority: 'high', effect: 22 },
    { factor: 'Training', action: 'Traffic Marshal Training', priority: 'high', effect: 18 },
    { factor: 'Signage', action: 'Traffic Signage Audit', priority: 'medium', effect: 15 },
    { factor: 'Supervision', action: 'Traffic Control Monitoring', priority: 'medium', effect: 12 }
  ],
  'Environmental': [
    { factor: 'Planning', action: 'Environmental Impact Assessment', priority: 'high', effect: 22 },
    { factor: 'Training', action: 'Spill Response Training', priority: 'high', effect: 18 },
    { factor: 'Inspections', action: 'Environmental Compliance Audits', priority: 'high', effect: 20 },
    { factor: 'Housekeeping', action: 'Waste Segregation Audit', priority: 'medium', effect: 15 },
    { factor: 'Emergency Preparedness', action: 'Spill Kit Availability', priority: 'medium', effect: 14 }
  ],
  'Slip and Trip': [
    { factor: 'Housekeeping', action: 'Walking Surface Audit', priority: 'high', effect: 22 },
    { factor: 'Inspections', action: 'Daily Walkway Inspections', priority: 'high', effect: 18 },
    { factor: 'Signage', action: 'Wet Floor/Hazard Signs', priority: 'medium', effect: 15 },
    { factor: 'Environment', action: 'Drainage Improvements', priority: 'medium', effect: 14 },
    { factor: 'PPE', action: 'Appropriate Footwear Audit', priority: 'medium', effect: 12 }
  ],
  'General Site Issues': [
    { factor: 'Inspections', action: 'Comprehensive Site Audit', priority: 'high', effect: 20 },
    { factor: 'Supervision', action: 'Increased Supervisor Presence', priority: 'medium', effect: 15 },
    { factor: 'Training', action: 'General Safety Awareness', priority: 'medium', effect: 14 },
    { factor: 'Communication', action: 'Safety Stand-Down', priority: 'medium', effect: 12 },
    { factor: 'Housekeeping', action: 'General Housekeeping Drive', priority: 'medium', effect: 15 }
  ]
}

// Quick Action Presets for Scenario Simulator
export const QUICK_ACTION_PRESETS = [
  {
    id: 'engineering-boost',
    label: 'Engineering+',
    description: 'Boost engineering controls (barriers, guards, devices)',
    icon: 'Settings',
    color: 'blue',
    effect: { barriers: 75, guards: 75, devices: 75, signage: 60 },
    estimatedImpact: -15
  },
  {
    id: 'admin-boost',
    label: 'Admin+',
    description: 'Increase administrative controls (training, supervision)',
    icon: 'Shield',
    color: 'indigo',
    effect: { training: 80, inspections: 70, supervision: 60, permits: 75 },
    estimatedImpact: -12
  },
  {
    id: 'ppe-push',
    label: 'PPE Push',
    description: 'Maximum PPE compliance drive',
    icon: 'User',
    color: 'amber',
    effect: { ppe: 100 },
    estimatedImpact: -8
  },
  {
    id: 'close-actions',
    label: 'Close Actions',
    description: 'Close all open corrective actions',
    icon: 'CheckCircle',
    color: 'green',
    effect: { actionsToClose: 'max' },
    estimatedImpact: -10
  }
]
