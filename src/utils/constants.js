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

// 30 Approved Hazard Categories (Fixed - No "Others" allowed)
export const HAZARD_CATEGORIES = [
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
  'Barricades',
  'COSHH',
  'Dust Control',
  'BBS',
  'Housekeeping',
  'PPE',
  'Safety Sign',
  'Site Security',
  'Access',
  'Site Welfare',
  'Safety Supervision',
  'Tools',
  'Traffic Management',
  'Work Environment',
  'Permit and RAMS',
  'Training and Competency',
  'Emergency Preparedness',
  'Struck By',
  'Environmental',
  'Slips Trips Falls',
]

// 13 Major (Significant) Hazards - HIGHEST PRIORITY in classification
export const MAJOR_HAZARDS = [
  'Breaking Ground & Excavation',
  'Confined Spaces',
  'Energized System',
  'Fire',
  'Hot Work',
  'Lifting',
  'Mobile Plant & Equipment',
  'Temporary Works',
  'Working in Heat',
  'Working at Height',
  'Working on or Near Live Roads',
  'Working on or Near Water',
  'Driving',
]

// 20 Sub-Significant Hazards - LOWER PRIORITY in classification
export const SUB_SIGNIFICANT_HAZARDS = [
  'Traffic Management',
  'Tools',
  'Training and Competency',
  'Safety Sign',
  'PPE',
  'Permit and RAMS',
  'Work Environment',
  'Emergency Preparedness',
  'Dust Control',
  'Access',
  'Barricades',
  'COSHH',
  'BBS',
  'Housekeeping',
  'Site Security',
  'Site Welfare',
  'Safety Supervision',
  'Struck By',
  'Environmental',
  'Slips Trips Falls',
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
    'hot conditions', 'hot work permit', 'hot cell', 'hot zone'
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
    'water cooler', 'drinking water', 'water bottle', 'water down',
    'water resistant', 'waterproof', 'water supply', 'water tank',
    'water pipe', 'water main', 'potable water', 'water storage',
    'water treatment', 'waste water', 'wastewater', 'water test'
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
  'Safety Supervision': [
    // Exclude "inspection" when it's just context for WHEN something was observed
    'during the inspection', 'during inspection', 'observed during inspection',
    'found during inspection', 'noted during inspection', 'seen during inspection',
    'inspection revealed', 'inspection found', 'inspection showed',
    'on-site inspection', 'site inspection found', 'waste was observed',
    'was observed on-site', 'was observed on site', 'observed on-site'
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
  'fire warden': 'Safety Supervision',
  'fire watch': 'Safety Supervision',
  'fire marshal': 'Safety Supervision',
  'fire safety officer': 'Safety Supervision',
  'fire door': 'Access',
  'fire prevention': 'Training and Competency',
  'fire risk assessment': 'Permit and RAMS',
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
  'drinking water': 'Site Welfare',
  'water cooler': 'Site Welfare',
  'potable water': 'Site Welfare',
  'water supply': 'Site Welfare',
  'water bottle': 'Site Welfare',

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

  // PPE-specific terms
  'hard hat': 'PPE',
  'safety glasses': 'PPE',
  'safety boots': 'PPE',
  'hi-vis': 'PPE',
  'high visibility': 'PPE',
  'safety harness': 'PPE',
  'fall harness': 'PPE',

  // Signage/Traffic - prevent "fall" matching Working at Height
  'traffic signage': 'Traffic Management',
  'traffic sign': 'Traffic Management',
  'haul road': 'Traffic Management',
  'fallen sign': 'Safety Sign',
  'fallen signage': 'Safety Sign',
  'sign fell': 'Safety Sign',
  'signage fell': 'Safety Sign',
  'blown over': 'Work Environment',
  'fallen barrier': 'Barricades',
  'fallen barricade': 'Barricades',
  'fallen cone': 'Traffic Management',
  'fallen fence': 'Barricades',

  // Food/Hygiene - prevent "poison" matching COSHH
  'food storage': 'Site Welfare',
  'food stored': 'Site Welfare',
  'food poison': 'Site Welfare',
  'food poisoning': 'Site Welfare',
  'food safety': 'Site Welfare',
  'food contamination': 'Site Welfare',
  'spoiled food': 'Site Welfare',
  'expired food': 'Site Welfare',
  'canteen': 'Site Welfare',
  'kitchen': 'Site Welfare',
  'mess hall': 'Site Welfare',
  'eating area': 'Site Welfare',

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

  // Open pits/holes - prevent "pit" matching Confined Spaces
  'open pit': 'Barricades',
  'open pits': 'Barricades',
  'without barricad': 'Barricades',
  'without proper barricad': 'Barricades',
  'no barricad': 'Barricades',
  'missing barricad': 'Barricades',
  'unbarricaded': 'Barricades',
  'open hole': 'Barricades',
  'open holes': 'Barricades',
  'unprotected opening': 'Barricades',
  'unprotected edge': 'Barricades',
  'posing a fall hazard': 'Barricades',

  // Description prefixes (common in Enablon data)
  'welfare facility:': 'Site Welfare',
  'welfare facility observed': 'Site Welfare',
  'confined space:': 'Confined Spaces',
  'work environment:': 'Work Environment',
  'work enironment:': 'Work Environment',
  'work enironment;': 'Work Environment',
  'equipment:': 'Mobile Plant & Equipment',
  'ppe:': 'PPE',
  'housekeeping:': 'Housekeeping',
  'housekeeping;': 'Housekeeping',
  'access:': 'Access',
  'fire:': 'Fire',
  'fire protection:': 'Fire',
  'electrical:': 'Energized System',
  'barricades:': 'Barricades',
  'safety signs:': 'Safety Sign',
  'safety sign:': 'Safety Sign',
  'hotwork:': 'Hot Work',
  'hotwork;': 'Hot Work',
  'hot work:': 'Hot Work',
  'hot work;': 'Hot Work',

  // Toilet/Hygiene keywords → Site Welfare
  'toilet flush': 'Site Welfare',
  'toilet not working': 'Site Welfare',
  'toilet checklist': 'Site Welfare',
  'toilets not clean': 'Site Welfare',
  'toilet is not clean': 'Site Welfare',
  'toilets are being cleaned': 'Site Welfare',
  'toilet cleaning': 'Site Welfare',
  'toilets are cleaned': 'Site Welfare',
  'clean and hygienic': 'Site Welfare',
  'hygienic environment': 'Site Welfare',
  'cleanliness standards': 'Site Welfare',
  'sanitation supplies': 'Site Welfare',
  'hygiene issues': 'Site Welfare',
  'welfare facility': 'Site Welfare',
  'rest shelter': 'Site Welfare',

  // First Aid → Emergency Preparedness
  'first aid box': 'Emergency Preparedness',
  'first aid kit': 'Emergency Preparedness',
  'first aid room': 'Emergency Preparedness',
  'emergency exit': 'Emergency Preparedness',
  'assembly point': 'Emergency Preparedness',
  'muster point': 'Emergency Preparedness',

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
  'bulletin board': 'Safety Sign',
  'bulletien board': 'Safety Sign',
  'hsse board': 'Safety Sign',
  'hsse bulletin': 'Safety Sign',
  'notice board': 'Safety Sign',
  'missing sign': 'Safety Sign',
  'no signage': 'Safety Sign',
  'lacks signage': 'Safety Sign',
  'without signage': 'Safety Sign',
  'signage missing': 'Safety Sign',
  'signage is missing': 'Safety Sign',
  'awareness signage': 'Safety Sign',
  'missing awareness': 'Safety Sign',

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
  'water cooler': 'Site Welfare',
  'igloo cooler': 'Site Welfare',
  'water station': 'Site Welfare',
  'drinking bottle': 'Site Welfare',

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
  'lacked proper barricad': 'Barricades',

  // Concrete mixer → Mobile Plant & Equipment
  'concrete mixer': 'Mobile Plant & Equipment',

  // Unprotected board/wood → Housekeeping
  'unprotected wooden': 'Housekeeping',
  'wooden board': 'Housekeeping',

  // Extension cord/electrical repairs → Energized System
  'extension cord': 'Energized System',
  'repaired using plastic tape': 'Energized System',
  'repaired using tape': 'Energized System',

  // Deep excavation → Breaking Ground & Excavation or Barricades
  'deep open excavation': 'Breaking Ground & Excavation',
  'deep excavation': 'Breaking Ground & Excavation',
  'open excavation': 'Breaking Ground & Excavation',
  'excavation unprotected': 'Barricades',
  'excavation not properly barricaded': 'Barricades',
  'not properly barricaded': 'Barricades',
  'no exclusion zone': 'Barricades',
  'no exlusion zone': 'Barricades',

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
  'drinking water station': 'Site Welfare',
  'water station need': 'Site Welfare',

  // Dust generation → Dust Control
  'dust is being generated': 'Dust Control',
  'dust being generated': 'Dust Control',
  'generating dust': 'Dust Control',

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
  'toiltes': 'Site Welfare',
  'toilets was not cleaned': 'Site Welfare',
  'toilet was not cleaned': 'Site Welfare',

  // Spill kit → Emergency Preparedness
  'spill kit': 'Emergency Preparedness',
  'spill response': 'Emergency Preparedness',

  // Unsafe bucket access → Working at Height
  'bucket to access': 'Working at Height',
  'using a bucket': 'Working at Height',
  'improvised ladder': 'Working at Height',
  'elevated work area': 'Working at Height',

  // Excavation edge → Barricades
  'excavation edge': 'Barricades',
  'edge was not protected': 'Barricades',
  'not protected by hard barrier': 'Barricades',
  'not protected by barrier': 'Barricades',

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

  // Harness storage/inspection → PPE (not Working at Height)
  'harness stored': 'PPE',
  'harness on rack': 'PPE',
  'harness inspection': 'PPE',
  'harness storage': 'PPE',
  'body harness inspection': 'PPE',
  'harness not inspected': 'PPE',
  'expired harness': 'PPE',
  'damaged harness': 'PPE',

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

  // Safety equipment inspection → PPE
  'ppe inspection': 'PPE',
  'helmet inspection': 'PPE',
  'gloves inspection': 'PPE',
  'safety glasses inspection': 'PPE',

  // Site Welfare patterns (override inspection context)
  'toilet was not': 'Site Welfare',
  'toilet not cleaned': 'Site Welfare',
  'toilets not cleaned': 'Site Welfare',
  'no water available': 'Site Welfare',
  'water not available': 'Site Welfare',
  'water was not available': 'Site Welfare',
  'drinking water container': 'Site Welfare',
  'water color': 'Site Welfare',
  'water cooler': 'Site Welfare',
  'smoking tray': 'Site Welfare',
  'smoking shelter': 'Site Welfare',

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
  'dust was observed': 'Dust Control',
  'dust accumulating': 'Dust Control',
  'dust observed': 'Dust Control',

  // Confined Spaces (override inspection context)
  'gas test': 'Confined Spaces',
  'gas test was not': 'Confined Spaces',
  'confined space entry': 'Confined Spaces',

  // Breaking Ground & Excavation (override inspection context)
  'deep excavation': 'Breaking Ground & Excavation',
  'deep trench': 'Breaking Ground & Excavation',
  'trench was left': 'Breaking Ground & Excavation',
  'excavation walls': 'Breaking Ground & Excavation',

  // Barricades (override inspection context)
  'excavation left open': 'Barricades',
  'without any physical barriers': 'Barricades',
  'without barriers': 'Barricades',
  'no barriers': 'Barricades',
  'no barricades': 'Barricades',
  'jersey barriers': 'Barricades',
  'left open without': 'Barricades',
  'unprotected edges': 'Barricades',
  'edges of a deep': 'Barricades',
  'trench edges': 'Barricades',

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

  // Sharp objects / Impalement → Struck By (primary hazard is impalement injury)
  // NEOM PHSAS 37.9 Sharp Objects standard
  'phsas 37.9': 'Struck By',
  'sharp objects': 'Struck By',
  '37.9 sharp objects': 'Struck By',
  // Protruding rebars (various phrasings)
  'protruding rebar': 'Struck By',
  'protruding rebars': 'Struck By',
  'rebars protruding': 'Struck By',
  'rebar protruding': 'Struck By',
  'exposed rebar': 'Struck By',
  'exposed rebars': 'Struck By',
  'rebars exposed': 'Struck By',
  'rebar exposed': 'Struck By',
  'unprotected rebar': 'Struck By',
  'unprotected rebars': 'Struck By',
  'uncapped rebar': 'Struck By',
  'uncapped rebars': 'Struck By',
  'sharp rebar': 'Struck By',
  'sharp rebars': 'Struck By',
  'sharp steel rebar': 'Struck By',
  'sharp steel rebars': 'Struck By',
  'steel rebar protruding': 'Struck By',
  'steel rebars protruding': 'Struck By',
  'extended rebars': 'Struck By',
  'extending rebars': 'Struck By',
  // Rebar caps (any mention typically indicates impalement hazard)
  'rebar cap': 'Struck By',
  'rebar caps': 'Struck By',
  'rebar without cap': 'Struck By',
  'rebars without cap': 'Struck By',
  'without rebar cap': 'Struck By',
  'without rebar caps': 'Struck By',
  'rebar caps missing': 'Struck By',
  'missing rebar cap': 'Struck By',
  'no rebar cap': 'Struck By',
  'no rebar caps': 'Struck By',
  // Impalement hazard phrases
  'impalement': 'Struck By',
  'impaled': 'Struck By',
  'impalement hazard': 'Struck By',
  'risk of impalement': 'Struck By',
  'impalement injuries': 'Struck By',
  'impalement injury': 'Struck By',
  'struck on these rods': 'Struck By',
  'struck onto these rebars': 'Struck By',
  // Sharp steel and objects
  'sharp steel': 'Struck By',
  'sharp object': 'Struck By',
  'sharp edge': 'Struck By',
  'sharp edges': 'Struck By',
  // Nails protruding
  'exposed nails': 'Struck By',
  'exposed nail': 'Struck By',
  'timber with nails': 'Struck By',
  'wood with nails': 'Struck By',
  'plywood with nails': 'Struck By',
  'planks with nails': 'Struck By',
  'nails protruding': 'Struck By',
  'nail protruding': 'Struck By',
  'protruding nails': 'Struck By',
  'protruding nail': 'Struck By',
  'had exposed nails': 'Struck By',
  'sheets had exposed nails': 'Struck By',
  // Falling objects
  'falling object': 'Struck By',
  'falling objects': 'Struck By',
  'object fell': 'Struck By',
  'objects falling': 'Struck By',
  'dropped object': 'Struck By',
  'falling material': 'Struck By',
  // Tie rods
  'tie rod': 'Struck By',
  'tie rods': 'Struck By',
  'tie rods used': 'Struck By',

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
  'food waste was not removed': 'Site Welfare',
  'food waste was observed': 'Site Welfare',
  'food waste not removed': 'Site Welfare',
  'food waste': 'Site Welfare',
  'hygiene risk': 'Site Welfare',
  'hygiene concerns': 'Site Welfare',
  'hygiene issues': 'Site Welfare',
  'pest attraction': 'Site Welfare',
  'pest risks': 'Site Welfare',
  'unpleasant odor': 'Site Welfare',
  'unpleasant odour': 'Site Welfare',
  // Missing welfare facilities → Site Welfare
  'toilet not provided': 'Site Welfare',
  'toilet were not provided': 'Site Welfare',
  'toilets not provided': 'Site Welfare',
  'waste bin not provided': 'Site Welfare',
  'waste bin were not provided': 'Site Welfare',
  'bulletin board not provided': 'Site Welfare',
  'bulletin board were not provided': 'Site Welfare',
  'welfare not provided': 'Site Welfare',
  'facilities not provided': 'Site Welfare',
  'sanitation not provided': 'Site Welfare',
  'waste bin liner': 'Site Welfare',
  'polythene bag not changed': 'Site Welfare',
  'polythene bag in the waste bin': 'Site Welfare',
  'garbage bag was not replaced': 'Site Welfare',
  'garbage bag not replaced': 'Site Welfare',
  'waste bin was full': 'Site Welfare',
  'waste bin full': 'Site Welfare',
  'bin was overflowing': 'Site Welfare',
  'bin overflowing': 'Site Welfare',
  'poor hygiene': 'Site Welfare',
  // First Aid → Emergency Preparedness
  'first aid box': 'Emergency Preparedness',
  'first aid kit': 'Emergency Preparedness',
  'first aid box not provided': 'Emergency Preparedness',
  'first aid not provided': 'Emergency Preparedness',

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
  'slip, trip, and fall': 'Slips Trips Falls',
  'slip, trip and fall': 'Slips Trips Falls',
  'trip hazard': 'Slips Trips Falls',
  'tripping hazard': 'Slips Trips Falls',

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

  // Falling objects from height → Struck By (primary hazard)
  'falling object hazard': 'Struck By',
  'on top of pillars': 'Struck By',
  'on top of the pillars': 'Struck By',
  'timber on top': 'Struck By',
  'placed on top of': 'Struck By',
  'posed a serious falling object': 'Struck By',
  'falling object hazard': 'Struck By',
  'risk of injury to workers passing': 'Struck By',
  'risk of injury to workers below': 'Struck By',
  'working below': 'Struck By',

  // Security cabin issues → Site Security
  'security cabin': 'Site Security',
  'sleeping during duty': 'Site Security',
  'sleeping purposes during duty': 'Site Security',
  'used for sleeping': 'Site Security',

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
  'Barricades': [
    'barricade', 'barrier', 'fencing', 'exclusion zone', 'safety fence', 'tape',
    'warning tape', 'red zone', 'keep out', 'restricted area', 'demarcation',
    'perimeter', 'safety barrier', 'guard rail', 'bollard', 'delineator'
  ],
  'COSHH': [
    'coshh', 'chemical', 'hazardous substance', 'toxic', 'corrosive', 'irritant',
    'sds', 'msds', 'material safety', 'chemical storage', 'spill', 'leak',
    'fumes', 'vapour', 'vapor', 'solvent', 'acid', 'alkali', 'paint', 'adhesive',
    'resin', 'epoxy', 'hazmat', 'dangerous goods', 'poison', 'carcinogen'
  ],
  'Struck By': [
    // Protruding rebars and sharp objects
    'protruding rebar', 'protruding rebars', 'exposed rebar', 'exposed rebars',
    'rebar cap', 'rebar caps', 'impalement', 'risk of impalement', 'impalement hazard',
    'sharp rebar', 'sharp rebars', 'sharp steel', 'sharp objects', 'sharp object',
    'uncapped rebar', 'uncapped rebars', 'unprotected rebar', 'unprotected rebars',
    // Protruding nails
    'protruding nail', 'protruding nails', 'exposed nail', 'exposed nails',
    'timber with nails', 'wood with nails', 'planks with nails',
    // Tie rods
    'tie rod', 'tie rods',
    // Falling objects
    'falling object', 'falling objects', 'dropped object', 'struck by',
    'overhead hazard', 'object fell', 'objects falling',
    // Sharp edges
    'sharp edge', 'sharp edges', 'cutting hazard', 'laceration',
    // NEOM Standard
    'phsas 37.9', 'neom phsas 37.9'
  ],
  'Environmental': [
    'environmental', 'contamination', 'pollution', 'ground contamination',
    'soil contamination', 'environmental damage', 'septic tank', 'septic overflow',
    'sewage', 'sewage overflow', 'effluent', 'wastewater', 'waste water'
  ],
  'Slips Trips Falls': [
    'slip', 'trip', 'fall', 'slippery', 'tripping hazard', 'trip hazard',
    'uneven surface', 'wet floor', 'slipped', 'tripped', 'fell'
  ],
  'Dust Control': [
    'dust', 'silica', 'respirable', 'particulate', 'dust suppression', 'water spray',
    'dust mask', 'respiratory', 'rpf', 'dust extraction', 'vacuum', 'wet cutting',
    'airborne', 'inhalation', 'lung', 'pneumoconiosis', 'asbestosis', 'asbestos'
  ],
  'BBS': [
    'bbs', 'behavior', 'behaviour', 'behavioral', 'safe behavior', 'unsafe behavior',
    'safety observation', 'peer observation', 'safety conversation', 'safety interaction',
    'near miss', 'close call', 'near-miss', 'good catch', 'stop work', 'intervention'
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
  'PPE': [
    'ppe', 'personal protective', 'helmet', 'hard hat', 'safety glasses', 'goggles',
    'gloves', 'safety boots', 'steel toe', 'hi-vis', 'high visibility', 'vest',
    'ear protection', 'ear plugs', 'ear muffs', 'face shield', 'respirator',
    'mask', 'coverall', 'protective clothing', 'safety equipment', 'fall protection',
    'safety shoe', 'safety boot', 'safety helmet', 'bump cap', 'n95', 'dust mask',
    'half mask', 'full face mask', 'scba', 'safety harness', 'body harness',
    'reflective vest', 'safety vest', 'work glove', 'leather glove', 'nitrile glove',
    'cut resistant', 'impact glove', 'chemical glove', 'hearing protection',
    'safety lanyard', 'chin strap', 'safety gear', 'protective gear', 'safety wear',
    'eye protection', 'hand protection', 'foot protection', 'head protection'
  ],
  'Safety Sign': [
    'safety sign', 'signage', 'warning sign', 'caution sign', 'danger sign',
    'prohibition sign', 'mandatory sign', 'emergency sign', 'exit sign', 'no entry',
    'restricted', 'label', 'marking', 'notice', 'instruction', 'information sign'
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
  'Site Welfare': [
    'welfare', 'toilet', 'washroom', 'restroom', 'drinking water', 'canteen',
    'rest area', 'break room', 'first aid', 'medical', 'shelter', 'changing room',
    'locker', 'sanitation', 'hygiene', 'hand washing', 'accommodation', 'camp'
  ],
  'Safety Supervision': [
    'supervision', 'supervisor', 'competent person', 'safety officer', 'hse',
    'safety manager', 'site manager', 'foreman', 'charge hand', 'oversight',
    'monitoring', 'leadership', 'management', 'accountability', 'safety meeting',
    'unsupervised', 'no supervision', 'lack of supervision', 'without supervision'
    // NOTE: Removed 'inspection', 'audit', 'toolbox talk', 'briefing', 'induction'
    // These are either too generic or belong to Training and Competency
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
  'Permit and RAMS': [
    'permit', 'ptw', 'permit to work', 'rams', 'risk assessment', 'method statement',
    'safe system', 'swms', 'jsea', 'jsa', 'job safety', 'task risk', 'procedure',
    'work instruction', 'sop', 'safe operating', 'control measure', 'mitigation',
    'authorization', 'authorisation', 'approval', 'sign off'
  ],
  'Training and Competency': [
    'training', 'competency', 'competence', 'certification', 'certificate', 'license',
    'licence', 'qualification', 'skilled', 'unskilled', 'untrained', 'inexperienced',
    'induction', 'orientation', 'refresher', 'course', 'awareness', 'education',
    'assessment', 'test', 'evaluation', 'capability'
  ],
  'Emergency Preparedness': [
    'emergency', 'evacuation', 'drill', 'assembly point', 'muster', 'rescue',
    'first aid', 'ambulance', 'hospital', 'injury', 'incident', 'alarm', 'siren',
    'emergency response', 'erp', 'contingency', 'crisis', 'disaster', 'spill response',
    'fire drill', 'emergency exit', 'escape route'
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
  'PPE': [
    'no helmet', 'no harness', 'no gloves', 'no goggles', 'no safety glasses',
    'missing ppe', 'without ppe', 'ppe not worn', 'not wearing ppe', 'improper ppe',
    'ppe violation', 'no hard hat', 'no safety boots', 'no hi-vis', 'no vest',
    'removed helmet', 'removed harness', 'ppe compliance'
  ],
  'Safety Supervision': [
    'toolbox talk', 'safety briefing', 'safety meeting', 'safety induction',
    'site induction', 'safety inspection', 'safety audit', 'safety walkthrough',
    'supervisor present', 'lack of supervision', 'no supervision'
  ],
  'Emergency Preparedness': [
    'fire extinguisher', 'first aid kit', 'emergency drill', 'evacuation route',
    'emergency exit', 'assembly point', 'muster point', 'emergency response',
    'fire drill', 'evacuation drill', 'rescue plan', 'emergency plan'
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
  'Permit and RAMS': [
    'permit to work', 'work permit', 'risk assessment', 'method statement',
    'safe system of work', 'job safety analysis', 'task risk assessment'
  ],
  'Training and Competency': [
    'not trained', 'untrained worker', 'lack of training', 'competency assessment',
    'training required', 'no certification', 'expired certification'
  ],
  'Barricades': [
    'no barricade', 'missing barrier', 'inadequate fencing', 'exclusion zone',
    'restricted area', 'safety barrier'
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
  'Site Welfare': [
    'welfare facilities', 'drinking water', 'toilet facilities', 'rest area',
    'first aid room', 'welfare provision'
  ],
  'Dust Control': [
    'dust control', 'dust suppression', 'silica dust', 'respirable dust',
    'dust exposure', 'airborne dust'
  ],
  'Working on or Near Live Roads': [
    'live road', 'live traffic', 'road work', 'near traffic', 'highway work',
    'public highway'
  ],
  'BBS': [
    'safe behavior', 'unsafe behavior', 'behavioral safety', 'safety observation',
    'peer observation', 'stop work authority', 'good catch'
  ],
  'Working in Heat': [
    'hot surface', 'burn hazard', 'thermal hazard', 'heat exposure', 'steam hazard',
    'hot pipe', 'hot equipment', 'heat stress', 'working in heat', 'hot conditions'
  ],
  'Working on or Near Water': [
    'working on water', 'working near water', 'over water', 'near water', 'water hazard',
    'drowning risk', 'life jacket', 'water rescue', 'man overboard', 'fall into water'
  ],
  'Safety Sign': [
    'safety signage', 'warning sign', 'missing sign', 'safety sign', 'no signage'
  ],
}

// Category priority order - MAJOR HAZARDS FIRST, then Sub-Significant
// When checking single keywords, categories are checked in this order
export const CATEGORY_PRIORITY = [
  // === 13 MAJOR (SIGNIFICANT) HAZARDS - Checked First ===
  'Confined Spaces',              // 1 - IDLH environment
  'Energized System',             // 2 - Electrocution risk
  'Working at Height',            // 3 - Fatal fall risk
  'Hot Work',                     // 4 - Fire/explosion risk
  'Lifting',                      // 5 - Suspended load risk
  'Breaking Ground & Excavation', // 6 - Cave-in risk
  'Fire',                         // 7 - Fire risk
  'Mobile Plant & Equipment',     // 8 - Struck-by risk
  'Working on or Near Live Roads', // 9 - Traffic risk
  'Working on or Near Water',     // 10 - Drowning risk
  'Driving',                      // 11 - Vehicle incident
  'Temporary Works',              // 12 - Structural collapse
  'Working in Heat',              // 13 - Heat stress/burn risk

  // === 17 SUB-SIGNIFICANT HAZARDS - Checked After Major ===
  'COSHH',                        // 14 - Chemical exposure
  'Dust Control',                 // 15 - Respiratory hazard
  'Traffic Management',           // 16 - Site traffic
  'Barricades',                   // 17 - Exclusion zone
  'PPE',                          // 18 - Personal protection
  'Tools',                        // 19 - Hand/power tools
  'Safety Sign',                  // 20 - Signage
  'Site Security',                // 21 - Access control
  'Site Welfare',                 // 22 - Welfare facilities
  'Safety Supervision',           // 23 - Supervision
  'Training and Competency',      // 24 - Competency
  'Emergency Preparedness',       // 25 - Emergency response
  'Permit and RAMS',              // 26 - Permits
  'BBS',                          // 27 - Behavioral
  'Housekeeping',                 // 28 - Housekeeping
  'Access',                       // 29 - Access/egress
  'Work Environment',             // 30 - Most generic (default fallback)
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
