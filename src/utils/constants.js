// Incident Types with severity levels
export const INCIDENT_TYPES = [
  { value: 'lti', label: 'Lost Time Injury (LTI)', severity: 'critical', color: '#dc2626' },
  { value: 'mti', label: 'Medical Treatment Injury (MTI)', severity: 'high', color: '#f97316' },
  { value: 'fac', label: 'First Aid Case (FAC)', severity: 'medium', color: '#eab308' },
  { value: 'near-miss', label: 'Near Miss', severity: 'low', color: '#3b82f6' },
  { value: 'unsafe-act', label: 'Unsafe Act', severity: 'observation', color: '#8b5cf6' },
  { value: 'unsafe-condition', label: 'Unsafe Condition', severity: 'observation', color: '#6366f1' },
  { value: 'positive', label: 'Positive Observation', severity: 'positive', color: '#22c55e' },
]

// 29 Approved Significant Hazard Categories (Fixed - No "Others" allowed)
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
  'Driving',
  'Working at Height',
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
  'Working on Heat',
]

// Hazard category patterns for auto-classification (29 approved categories)
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
    'isolation', 'de-energize', 'energised'
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
    'access tower', 'stepladder', 'fall hazard', 'unprotected edge', 'opening'
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
    'skip', 'bin', 'container', '5s', 'workplace organization'
  ],
  'PPE': [
    'ppe', 'personal protective', 'helmet', 'hard hat', 'safety glasses', 'goggles',
    'gloves', 'safety boots', 'steel toe', 'hi-vis', 'high visibility', 'vest',
    'ear protection', 'ear plugs', 'ear muffs', 'face shield', 'respirator',
    'mask', 'coverall', 'protective clothing', 'safety equipment', 'fall protection'
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
    'monitoring', 'inspection', 'audit', 'leadership', 'management', 'accountability',
    'safety meeting', 'toolbox talk', 'briefing', 'induction'
  ],
  'Tools': [
    'tool', 'hand tool', 'power tool', 'equipment', 'wrench', 'hammer', 'screwdriver',
    'drill', 'saw', 'grinder', 'cutter', 'pliers', 'chisel', 'knife', 'blade',
    'defective tool', 'damaged tool', 'tool inspection', 'wrong tool', 'improvised tool',
    'tool storage', 'tool box', 'sharp', 'cutting tool'
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
  'Working on Heat': [
    'working on heat', 'heat', 'hot surface', 'burn hazard', 'thermal', 'steam',
    'hot pipe', 'hot equipment', 'molten', 'furnace', 'oven', 'kiln', 'boiler',
    'heat exchanger', 'insulation', 'lagging', 'heat exposure', 'scalding', 'scald'
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
  'Working on Heat': [
    'hot surface', 'burn hazard', 'thermal hazard', 'heat exposure', 'steam hazard',
    'hot pipe', 'hot equipment'
  ],
  'Safety Sign': [
    'safety signage', 'warning sign', 'missing sign', 'safety sign', 'no signage'
  ],
}

// Category priority order (high-risk first, generic last) - Layer 3
// When checking single keywords, categories are checked in this order
export const CATEGORY_PRIORITY = [
  'Confined Spaces',              // 1 - Highest risk - IDLH environment
  'Energized System',             // 2 - Electrocution risk
  'Working at Height',            // 3 - Fatal fall risk
  'Hot Work',                     // 4 - Fire/explosion risk
  'Lifting',                      // 5 - Suspended load risk
  'Breaking Ground & Excavation', // 6 - Cave-in risk
  'Fire',                         // 7 - Fire risk
  'Mobile Plant & Equipment',     // 8 - Struck-by risk
  'COSHH',                        // 9 - Chemical exposure
  'Working on or Near Live Roads', // 10 - Traffic risk
  'Driving',                      // 11 - Vehicle incident
  'Temporary Works',              // 12 - Structural collapse
  'Working on Heat',              // 13 - Burn risk
  'Barricades',                   // 14 - Exclusion zone
  'Dust Control',                 // 15 - Respiratory hazard
  'Traffic Management',           // 16 - Site traffic
  'PPE',                          // 17 - Personal protection
  'Tools',                        // 18 - Hand/power tools
  'Safety Sign',                  // 19 - Signage
  'Site Security',                // 20 - Access control
  'Site Welfare',                 // 21 - Welfare facilities
  'Safety Supervision',           // 22 - Supervision
  'Training and Competency',      // 23 - Competency
  'Emergency Preparedness',       // 24 - Emergency response
  'Permit and RAMS',              // 25 - Permits
  'BBS',                          // 26 - Behavioral
  'Housekeeping',                 // 27 - Generic - housekeeping
  'Access',                       // 28 - Generic - access/egress
  'Work Environment',             // 29 - Most generic (default fallback)
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
