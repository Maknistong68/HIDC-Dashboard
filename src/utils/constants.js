// Incident Types with severity levels
export const INCIDENT_TYPES = [
  { value: 'lti', label: 'Lost Time Injury (LTI)', severity: 'critical', color: '#dc2626' },
  { value: 'mti', label: 'Medical Treatment Injury (MTI)', severity: 'high', color: '#f97316' },
  { value: 'fac', label: 'First Aid Case (FAC)', severity: 'medium', color: '#eab308' },
  { value: 'near-miss', label: 'Near Miss', severity: 'low', color: '#3b82f6' },
  { value: 'ncr', label: 'Non-Conformance', severity: 'low', color: '#9333ea' },
  { value: 'unsafe-act', label: 'Unsafe Act', severity: 'observation', color: '#8b5cf6' },
  { value: 'unsafe-condition', label: 'Unsafe Condition', severity: 'observation', color: '#6366f1' },
  { value: 'positive', label: 'Positive Observation', severity: 'positive', color: '#22c55e' },
  { value: 'leadership', label: 'Leadership Event', severity: 'leadership', color: '#0891b2' },
]

// 26 Approved Hazard Categories (True hazards only - root causes/controls removed)
export const HAZARD_CATEGORIES = [
  // === 15 MAJOR HAZARDS ===
  'Confined Spaces',
  'Energized System',
  'Mobile Plant & Equipment',
  'Breaking Ground & Excavation',
  'Fire',
  'Hot Work',
  'Lifting',
  'Temporary Works',
  'Working on or Near Live Roads',
  'Working on or Near Water',
  'Driving',
  'Working at Height',
  'Working in Heat',
  'Physical Hazard',           // Struck-by, falling objects, sharp objects, impalement
  'Mechanical Hazard',         // Caught-in/between, crushing, pinch points, machinery
  // === 11 SUB-SIGNIFICANT HAZARDS ===
  'COSHH',
  'Respiratory Hazard',        // Dust, silica, fumes, particles, airborne
  'Housekeeping',
  'Site Security',
  'Access',
  'Worker Welfare',            // Welfare facilities, camps, accommodation
  'Tools',
  'Traffic Management',
  'Work Environment',
  'Environmental',
  'Slip and Trip',             // Slip/trip hazards (falls → Working at Height)
]

// 15 Major (Significant) Hazards - HIGHEST PRIORITY in classification
// Physical Hazard and Mechanical Hazard added (OSHA Fatal Four)
export const MAJOR_HAZARDS = [
  'Breaking Ground & Excavation',
  'Confined Spaces',
  'Energized System',
  'Fire',
  'Hot Work',
  'Lifting',
  'Mobile Plant & Equipment',
  'Physical Hazard',           // NEW - struck-by is OSHA Fatal Four
  'Mechanical Hazard',         // NEW - caught-in is OSHA Fatal Four
  'Temporary Works',
  'Working in Heat',
  'Working at Height',
  'Working on or Near Live Roads',
  'Working on or Near Water',
  'Driving',
]

// 11 Sub-Significant Hazards - LOWER PRIORITY in classification
// Root causes/controls removed: PPE, Training, Supervision, Permits, BBS, Signs, Emergency Prep, Barricades
export const SUB_SIGNIFICANT_HAZARDS = [
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
  'Work Environment',
]

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
    'hot conditions', 'hot work permit', 'hot cell', 'hot zone',
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
    'waterfall', 'free fall', 'fall behind', 'fall short'
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
    // Welfare-related water (drinking, amenities)
    'water cooler', 'drinking water', 'water bottle', 'water down',
    'water resistant', 'waterproof', 'water supply', 'water tank',
    'water pipe', 'water main', 'potable water', 'water storage',
    'water treatment', 'waste water', 'wastewater', 'water test',
    // Additional welfare exclusions
    'water dispenser', 'water station', 'water jug', 'water container',
    'filtered water', 'clean water', 'safe water', 'hot water', 'cold water',
    'washing water', 'hand washing', 'sanitary water', 'hygiene water',
    'water shortage', 'water issue', 'water problem', 'water complaint',
    'water not available', 'water not provided', 'no drinking water',
    'water for drinking', 'supply of water', 'lack of water',
    // PPE-related exclusions (clearly not water hazard)
    'safety shoes', 'safety boots', 'not wearing', 'ppe', 'personal protective equipment',
    'hard hat', 'helmet', 'safety vest', 'hi-vis', 'high visibility', 'gloves',
    'safety glasses', 'goggles', 'ear protection', 'hearing protection',
    // Welfare/sanitation exclusions (clearly not water hazard)
    'toilet', 'toilets', 'contamination', 'odor', 'odour', 'pest', 'pest attraction',
    'sanitation', 'hygiene', 'proper sealing', 'storage area',
    // Personnel/vehicle exclusions (clearly not water hazard)
    'nurse', 'ambulance', 'driver', 'truck driver', 'equipment inspection',
    'morning inspection', 'daily inspection', 'performing task'
  ],
  'Working in Heat': [
    'heat treatment', 'heat exchanger', 'heat insulation', 'heat shield',
    'central heating', 'heating system', 'heat pump', 'heat recovery'
  ],
  'COSHH': [
    // Exclude food/hygiene related "poison" - these are Site Welfare, not chemical hazards
    'food poison', 'food poisoning', 'food storage', 'food stored', 'food safety',
    'food contamination', 'spoiled food', 'expired food', 'rotten food'
  ],
  'Work Environment': [
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
  ]
}

// CONTEXT_REDIRECTS - Remap misleading terms to the CORRECT category
// Checked FIRST before any other classification (highest priority)
export const CONTEXT_REDIRECTS = {
  // Fire-related terms → Correct category
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
  'hot work permit': 'Permit and RAMS',

  // RAMS/Permit/Documentation → Permit and RAMS (prevent "lifting" in ref quotes from hijacking)
  'no copy of approved': 'Permit and RAMS',
  'no copy of rams': 'Permit and RAMS',
  'no copy of msra': 'Permit and RAMS',
  'no approved rams': 'Permit and RAMS',
  'no approved msra': 'Permit and RAMS',
  'no rams available': 'Permit and RAMS',
  'no msra available': 'Permit and RAMS',
  'missing rams': 'Permit and RAMS',
  'missing msra': 'Permit and RAMS',
  'rams not available': 'Permit and RAMS',
  'msra not available': 'Permit and RAMS',
  'approved msra': 'Permit and RAMS',
  'approved rams': 'Permit and RAMS',
  'risk assessment': 'Permit and RAMS',
  'method statement': 'Permit and RAMS',
  'no means of guideline': 'Permit and RAMS',
  'no guideline': 'Permit and RAMS',
  'tmp on the working': 'Permit and RAMS',
  'tmp at site': 'Permit and RAMS',
  'work activities at site': 'Permit and RAMS',
  'permit to work': 'Permit and RAMS',
  'ptw not': 'Permit and RAMS',
  'no ptw': 'Permit and RAMS',
  'permit not mentioned': 'Permit and RAMS',
  'not mentioned on permit': 'Permit and RAMS',
  'not mentioned on rams': 'Permit and RAMS',

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

  // PPE-specific terms → Route to actual hazard or Work Environment
  'hard hat': 'Work Environment',
  'safety glasses': 'Work Environment',
  'safety boots': 'Work Environment',
  'safety shoes': 'Work Environment',
  'hi-vis': 'Work Environment',
  'high visibility': 'Work Environment',
  'safety harness': 'Working at Height',
  'fall harness': 'Working at Height',
  // Not wearing PPE patterns → Work Environment
  'not wearing': 'Work Environment',
  'were not wearing': 'Work Environment',
  'was not wearing': 'Work Environment',
  'without ppe': 'Work Environment',
  'without safety': 'Work Environment',
  'no ppe': 'Work Environment',
  'missing ppe': 'Work Environment',
  'ppe not worn': 'Work Environment',
  'ppe compliance': 'Work Environment',
  'personal protective equipment': 'Work Environment',

  // Signage/Traffic - prevent "fall" matching Working at Height
  'traffic signage': 'Traffic Management',
  'traffic sign': 'Traffic Management',
  'haul road': 'Traffic Management',
  'fallen sign': 'Work Environment',
  'fallen signage': 'Work Environment',
  'sign fell': 'Work Environment',
  'signage fell': 'Work Environment',
  'blown over': 'Work Environment',
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
  'work environment:': 'Work Environment',
  'work enironment:': 'Work Environment',
  'work enironment;': 'Work Environment',
  'equipment:': 'Mobile Plant & Equipment',
  'ppe:': 'Work Environment',
  'housekeeping:': 'Housekeeping',
  'housekeeping;': 'Housekeeping',
  'access:': 'Access',
  'fire:': 'Fire',
  'fire protection:': 'Fire',
  'electrical:': 'Energized System',
  'barricades:': 'Access',
  'safety signs:': 'Work Environment',
  'safety sign:': 'Work Environment',
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
  'bulletin board': 'Work Environment',
  'bulletien board': 'Work Environment',
  'hsse board': 'Work Environment',
  'hsse bulletin': 'Work Environment',
  'notice board': 'Work Environment',
  'missing sign': 'Work Environment',
  'no signage': 'Work Environment',
  'lacks signage': 'Work Environment',
  'without signage': 'Work Environment',
  'signage missing': 'Work Environment',
  'signage is missing': 'Work Environment',
  'awareness signage': 'Work Environment',
  'missing awareness': 'Work Environment',

  // Welding equipment → Hot Work (not just Tools)
  'welding machine': 'Hot Work',
  'welding equipment': 'Hot Work',
  'cutting machine': 'Hot Work',
  'grinding machine': 'Tools',

  // Chemical storage → COSHH
  'chemical stored': 'COSHH',
  'chemicals stored': 'COSHH',
  'drip tray': 'COSHH',
  'chemical storage': 'COSHH',
  'msds': 'COSHH',
  'sds': 'COSHH',

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

  // Rebar/materials storage → Housekeeping or Work Environment
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

  // Concrete activity → Work Environment
  'concrete activity': 'Work Environment',
  'concrete has been observed': 'Work Environment',
  'spikes protruding': 'Work Environment',

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

  // Generator → Energized System
  'generator running': 'Energized System',
  'diesel generator': 'Energized System',
  'backup generator': 'Energized System',
  'portable generator': 'Energized System',
  'generator fuel': 'Energized System',
  'generator maintenance': 'Energized System',

  // Compressor → Energized System (not Tools)
  'air compressor': 'Energized System',
  'compressor running': 'Energized System',
  'compressor hose': 'Energized System',

  // Scaffold storage → Housekeeping (not Temporary Works)
  'scaffold material stored': 'Housekeeping',
  'scaffold parts stored': 'Housekeeping',
  'scaffold components lying': 'Housekeeping',

  // Safety equipment inspection → Work Environment
  'ppe inspection': 'Work Environment',
  'helmet inspection': 'Work Environment',
  'gloves inspection': 'Work Environment',
  'safety glasses inspection': 'Work Environment',

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

  // Confined Spaces (override inspection context)
  'gas test': 'Confined Spaces',
  'gas test was not': 'Confined Spaces',
  'confined space entry': 'Confined Spaces',

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

  // Sharp objects / Impalement → Physical Hazard (primary hazard is impalement injury)
  // NEOM PHSAS 37.9 Sharp Objects standard
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
  'did not comply with the approved': 'Permit and RAMS',
  'not comply with': 'Permit and RAMS',
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

  // Material storage/stacking → Work Environment (collapse hazard)
  'not properly stacked': 'Work Environment',
  'improper stacking': 'Work Environment',
  'without stoppers': 'Work Environment',
  'prevent rolling': 'Work Environment',
  'risk of collapse': 'Work Environment',
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
    'control panel', 'motor', 'pump', 'compressor', 'inverter', 'ups', 'battery bank'
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
    'formwork deck', 'elevated walkway', 'aerial work', 'skylight', 'fragile roof'
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
    // NEOM Standard
    'phsas 37.9', 'neom phsas 37.9'
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
    'mechanical hazard', 'machinery hazard'
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
    // Medical facilities
    'first aid room', 'medical facility', 'clinic',
    // Changing facilities
    'changing room', 'locker room', 'locker',
    // Other welfare
    'prayer room', 'worship area', 'recreation', 'recreational facility',
    'hand washing', 'hygiene'
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
  'Work Environment': [
    'work environment', 'environment', 'weather', 'temperature', 'heat stress',
    'cold stress', 'lighting', 'illumination', 'noise', 'vibration', 'ergonomic',
    'ventilation', 'air quality', 'humidity', 'wind', 'rain', 'storm', 'condition',
    'climate', 'comfort', 'fatigue', 'shift work', 'working hours'
  ],
  'Working in Heat': [
    'working in heat', 'heat', 'hot surface', 'burn hazard', 'thermal', 'steam',
    'hot pipe', 'hot equipment', 'molten', 'furnace', 'oven', 'kiln', 'boiler',
    'heat exchanger', 'insulation', 'lagging', 'heat exposure', 'scalding', 'scald',
    'heat stress', 'hydration', 'shade', 'cooling', 'rest break'
  ],
  'Working on or Near Water': [
    'working on water', 'working near water', 'over water', 'near water', 'water work',
    'marine', 'river', 'lake', 'pond', 'canal', 'dock', 'jetty', 'pier', 'quay',
    'waterway', 'waterfront', 'shoreline', 'embankment', 'flood', 'flooding',
    'drowning', 'life jacket', 'life vest', 'buoyancy', 'rescue boat', 'water rescue',
    'man overboard', 'fall into water', 'open water', 'deep water', 'swimming',
    'diving', 'underwater', 'maritime', 'coastal', 'offshore', 'barge', 'boat',
    'vessel', 'pontoon', 'floating', 'water edge', 'bank', 'stream', 'creek'
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
    'power isolation', 'electrical safety'
  ],
  'Working at Height': [
    'working at height', 'work at height', 'fall protection', 'edge protection', 'roof work',
    'working on roof', 'ladder work', 'scaffold work', 'elevated work', 'above ground',
    'fall from height', 'height work', 'working above'
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
    'working on water', 'working near water', 'over water', 'near water', 'water hazard',
    'drowning risk', 'life jacket', 'water rescue', 'man overboard', 'fall into water',
    'near river', 'near sea', 'near lake', 'near pond', 'near canal', 'offshore work',
    'marine work', 'barge work', 'dock work', 'waterfront work', 'pier work', 'jetty work',
    'flood risk', 'water body', 'open water', 'deep water', 'submerged', 'submersion',
    'life vest', 'life buoy', 'flotation device', 'buoyancy aid', 'rescue boat',
    'fell into water', 'in water', 'into water', 'beside water', 'water edge'
  ],
  'Physical Hazard': [
    'struck by', 'hit by', 'falling object', 'dropped object',
    'sharp object', 'protruding rebar', 'exposed rebar', 'impalement hazard',
    'flying debris', 'projectile', 'sharp edge', 'laceration hazard'
  ],
  'Mechanical Hazard': [
    'caught in', 'caught between', 'pinch point', 'nip point',
    'crushing hazard', 'moving parts', 'rotating parts', 'entanglement',
    'unguarded machinery', 'machine guard', 'amputation hazard'
  ],
  'Slip and Trip': [
    'slip hazard', 'trip hazard', 'slippery floor', 'slippery surface',
    'tripping hazard', 'uneven surface', 'wet floor', 'obstacle'
  ],
}

// Category priority order - MAJOR HAZARDS FIRST, then Sub-Significant
// When checking single keywords, categories are checked in this order
export const CATEGORY_PRIORITY = [
  // === 15 MAJOR (SIGNIFICANT) HAZARDS - Checked First ===
  'Confined Spaces',              // 1 - IDLH environment
  'Energized System',             // 2 - Electrocution risk
  'Working at Height',            // 3 - Fatal fall risk
  'Hot Work',                     // 4 - Fire/explosion risk
  'Lifting',                      // 5 - Suspended load risk
  'Breaking Ground & Excavation', // 6 - Cave-in risk
  'Fire',                         // 7 - Fire risk
  'Mobile Plant & Equipment',     // 8 - Plant strike risk
  'Physical Hazard',              // 9 - Struck-by risk (OSHA Fatal Four)
  'Mechanical Hazard',            // 10 - Caught-in risk (OSHA Fatal Four)
  'Working on or Near Live Roads', // 11 - Traffic risk
  'Working on or Near Water',     // 12 - Drowning risk
  'Driving',                      // 13 - Vehicle incident
  'Temporary Works',              // 14 - Structural collapse
  'Working in Heat',              // 15 - Heat stress/burn risk

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
  'Work Environment',             // 26 - Most generic (default fallback)
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
