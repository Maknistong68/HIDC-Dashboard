/**
 * Root Cause Detection Engine
 * Predefined root causes per hazard with keyword detection
 *
 * Instead of extracting free text from descriptions, this engine uses
 * predefined root causes (10 per hazard category) with keyword patterns
 * to detect and categorize issues accurately.
 */

/**
 * COMMON_MISSPELLINGS
 * Database of frequently misspelled safety terms
 */
const COMMON_MISSPELLINGS = {
  // Equipment
  scaffold: ['scafold', 'scaffhold', 'scafolding', 'scaffoldin'],
  harness: ['harnes', 'harnass', 'harnis', 'harneses'],
  guardrail: ['gaurd rail', 'gaurdrail', 'guard rail', 'guardrails'],
  ladder: ['lader', 'laddar', 'ladar'],
  lanyard: ['laniard', 'lanard', 'lanyrd'],
  extinguisher: ['extingusher', 'extinghisher', 'extinguiser', 'extingisher'],
  cylinder: ['cylindar', 'cylander', 'cilinder'],
  respirator: ['resprator', 'respirater', 'resporator'],
  ventilation: ['ventilaton', 'ventillation', 'ventilaiton'],
  maintenance: ['maintainance', 'maintenace', 'maintanence'],
  inspection: ['inpection', 'inspcetion', 'insepction'],
  equipment: ['equipement', 'equpment', 'equipemnt'],
  hazardous: ['hazardos', 'hazerdous', 'hazardeous'],
  flammable: ['flamable', 'flameable', 'flamible'],
  combustible: ['combustable', 'combusible'],
  segregation: ['segragation', 'segregaton', 'segragtion'],
  barricade: ['baricade', 'barracade', 'barrricade'],
  delineator: ['delinator', 'delineater'],
  pedestrian: ['pedestrain', 'pedestiran', 'pedestion'],
  excavation: ['excation', 'excavaton', 'excevation'],
  certificate: ['certificat', 'certifcate', 'cretificate'],
  competent: ['competant', 'compentent', 'competnet'],
  authorized: ['authorised', 'autherized', 'authroized'],
  procedure: ['proceedure', 'procedur', 'procedue'],
  emergency: ['emergancy', 'emergncy', 'emergeny']
}

/**
 * HAZARD_ROOT_CAUSES
 * 26 hazard categories with 10 root causes each = 260 total definitions
 * Each root cause has an array of keywords that trigger detection
 */
export const HAZARD_ROOT_CAUSES = {
  // 1. Working at Height
  'Working at Height': {
    'Missing fall protection': [
      'harness', 'harnesses', 'harnessed', 'harnessing', 'harnes', 'harnass',
      'lanyard', 'lanyards', 'laniard', 'lanard',
      'fall arrest', 'fall protection', 'fall restraint',
      'not wearing harness', 'no harness', 'without harness', 'missing harness', 'harness missing',
      'body harness', 'full body', 'safety harness',
      'fell from', 'falling from', 'fallen from', 'fall from height',
      'no fall protection', 'unprotected'
    ],
    'Guardrail missing/damaged': [
      'guardrail', 'guardrails', 'guard rail', 'guard rails', 'gaurd rail', 'gaurdrail',
      'handrail', 'handrails', 'hand rail',
      'mid rail', 'midrail', 'top rail', 'toprail',
      'no guardrail', 'missing guardrail', 'broken guardrail', 'damaged guardrail',
      'edge protection', 'perimeter protection', 'unguarded edge'
    ],
    'Unsafe ladder use': [
      'ladder', 'ladders', 'lader', 'laddar',
      'step ladder', 'stepladder', 'extension ladder', 'a-frame', 'a frame',
      'ladder not secured', 'unsecured ladder', 'leaning ladder',
      'damaged ladder', 'defective ladder', 'broken ladder',
      'ladder inspection', 'climbing ladder', 'climbed ladder'
    ],
    'Scaffold deficiency': [
      'scaffold', 'scaffolds', 'scaffolded', 'scaffolding',
      'scafold', 'scaffhold', 'scafolding',
      'scaffold tag', 'incomplete scaffold', 'unsafe scaffold',
      'scaffold board', 'scaffold boards', 'scaffold plank', 'scaffold planks',
      'putlog', 'putlogs', 'tube and fitting', 'tube and clamp',
      'scaffold erection', 'scaffold dismantling'
    ],
    'Unprotected opening': [
      'opening', 'openings', 'floor opening', 'floor openings',
      'hole', 'holes', 'uncovered hole', 'open hole', 'unprotected hole',
      'penetration', 'penetrations', 'shaft', 'void', 'voids',
      'unprotected edge', 'unprotected opening', 'uncovered opening'
    ],
    'Missing toe board': [
      'toe board', 'toeboards', 'toeboard', 'toe-board',
      'kick board', 'kickboard', 'kick boards',
      'missing toeboard', 'no toeboard'
    ],
    'Working without permit': [
      'permit', 'permits', 'permitted',
      'no permit', 'without permit', 'missing permit',
      'ptw', 'work permit', 'height permit', 'working at height permit'
    ],
    'Inadequate access': [
      'access', 'accessed', 'accessing',
      'safe access', 'improper access', 'inadequate access',
      'access ladder', 'means of access', 'egress',
      'access route', 'access point'
    ],
    'Safety net missing': [
      'safety net', 'safety nets', 'catch net', 'catch nets',
      'debris net', 'debris nets', 'net missing', 'fall net',
      'no safety net', 'missing net'
    ],
    'Training/competency': [
      'training', 'trained', 'untrained', 'not trained',
      'competent', 'competency', 'incompetent',
      'certified', 'certification', 'uncertified',
      'qualification', 'qualified', 'unqualified'
    ]
  },

  // 2. Physical Hazard
  'Physical Hazard': {
    'Exposed rebar': [
      'rebar', 'rebars', 're-bar', 're-bars',
      'reinforcement bar', 'reinforcement bars', 'reinforcing bar',
      'protruding rebar', 'exposed rebar', 'uncapped rebar',
      'rebar cap', 'rebar caps', 'mushroom cap', 'mushroom caps',
      'exposed reinforcement', 'steel bar', 'steel bars'
    ],
    'Sharp edges/objects': [
      'sharp', 'sharps', 'sharpened',
      'edge', 'edges', 'sharp edge', 'sharp edges',
      'cutting', 'cut', 'cuts',
      'pointed', 'point', 'points',
      'nail', 'nails', 'nailed',
      'screw', 'screws', 'screwed',
      'wire', 'wires', 'wired', 'wiring',
      'burr', 'burrs', 'jagged'
    ],
    'Struck by hazard': [
      'struck', 'struck by', 'struck-by',
      'hit', 'hitting', 'hits',
      'falling object', 'falling objects', 'dropped', 'dropping',
      'overhead', 'overhead hazard',
      'swing', 'swinging', 'swung',
      'impact', 'impacted', 'impacting'
    ],
    'Material storage': [
      'storage', 'stored', 'storing', 'stores',
      'stacking', 'stacked', 'stack', 'stacks',
      'material', 'materials',
      'piled', 'piling', 'pile', 'piles',
      'unsecured material', 'stockpile', 'stockpiled', 'laydown'
    ],
    'Housekeeping issue': [
      'housekeeping', 'house keeping', 'house-keeping',
      'debris', 'clutter', 'cluttered',
      'mess', 'messy', 'scattered', 'scattering',
      'clean', 'cleaning', 'unclean',
      'tidy', 'untidy', 'disorganized', 'disorganised'
    ],
    'Pinch/crush point': [
      'pinch', 'pinched', 'pinching', 'pinch point', 'pinch points',
      'crush', 'crushed', 'crushing', 'crush point',
      'caught between', 'caught in',
      'nip point', 'nip points'
    ],
    'Manual handling': [
      'lifting', 'lifted', 'lift', 'lifts',
      'carrying', 'carried', 'carry', 'carries',
      'manual handling', 'manual handle',
      'ergonomic', 'ergonomics',
      'heavy', 'heavy load', 'heavy item',
      'awkward', 'awkward position',
      'back injury', 'back strain'
    ],
    'Protruding hazard': [
      'protruding', 'protruded', 'protrude', 'protrudes',
      'sticking out', 'stick out', 'sticks out',
      'projection', 'projections', 'projecting',
      'protrusion', 'protrusions',
      'jutting', 'jutted', 'jut out'
    ],
    'Unstable structure': [
      'unstable', 'instability',
      'collapse', 'collapsed', 'collapsing',
      'falling', 'fell', 'fallen',
      'unsecured', 'not secured',
      'leaning', 'leaned', 'lean',
      'tipping', 'tipped', 'tip over',
      'topple', 'toppled', 'toppling',
      'wobble', 'wobbled', 'wobbling', 'wobbly'
    ],
    'Tripping hazard': [
      'trip', 'trips', 'tripped', 'tripping',
      'obstacle', 'obstacles',
      'uneven', 'uneven surface', 'uneven ground',
      'cable across', 'cables across',
      'stepping', 'stepped',
      'stumble', 'stumbled', 'stumbling'
    ]
  },

  // 3. Mobile Plant & Equipment
  'Mobile Plant & Equipment': {
    'No banksman/spotter': [
      'banksman', 'banksmen', 'banks man', 'banks-man',
      'spotter', 'spotters', 'no spotter',
      'signal', 'signals', 'signaled', 'signalled', 'signaling', 'signalling',
      'signalman', 'signalmen', 'signaller', 'signaler',
      'guide', 'guiding', 'guided',
      'flagman', 'flagmen', 'flag man'
    ],
    'Exclusion zone breach': [
      'exclusion', 'exclusion zone', 'exclusion zones',
      'zone', 'zones', 'danger zone',
      'barrier', 'barriers', 'barriered',
      'swing radius', 'swing zone',
      'barricade', 'barricades', 'barricaded', 'baricade',
      'demarcation', 'demarcated', 'demarcating'
    ],
    'Operator competency': [
      'operator', 'operators', 'operated', 'operating',
      'license', 'licenses', 'licensed', 'licence', 'licenced',
      'trained operator', 'competent operator', 'certified operator',
      'operator certificate', 'driving license', 'driving licence',
      'unqualified', 'not qualified', 'unauthorized operator'
    ],
    'Vehicle inspection': [
      'inspection', 'inspections', 'inspected', 'inspecting', 'inpection',
      'checklist', 'checklists', 'check list',
      'pre-use', 'preuse', 'pre use',
      'daily check', 'daily checks', 'daily inspection',
      'defect', 'defects', 'defective',
      'pre-start', 'prestart', 'vehicle check', 'equipment inspection'
    ],
    'Reversing hazard': [
      'reversing', 'reversed', 'reverse', 'reverses',
      'backing', 'backed', 'back up', 'backing up',
      'rear', 'rearward',
      'reversing alarm', 'reverse alarm', 'reverse camera',
      'no banksman while reversing'
    ],
    'Pedestrian interface': [
      'pedestrian', 'pedestrians', 'pedestrain',
      'walkway', 'walkways', 'walk way',
      'segregation', 'segregated', 'segregating', 'segragation',
      'crossing', 'crossings', 'crossed',
      'foot traffic', 'walking', 'walked',
      'pedestrian route', 'pedestrian path'
    ],
    'Load security': [
      'load', 'loads', 'loaded', 'loading',
      'secured', 'securing', 'unsecured', 'not secured',
      'overload', 'overloaded', 'overloading', 'over loaded',
      'capacity', 'over capacity', 'exceeds capacity',
      'shifting load', 'shifted', 'shifting', 'load limit'
    ],
    'Equipment defect': [
      'defect', 'defects', 'defective',
      'fault', 'faults', 'faulty',
      'broken', 'broke', 'breaking',
      'damaged', 'damage', 'damaging',
      'malfunction', 'malfunctioned', 'malfunctioning',
      'not working', 'out of order', 'inoperable'
    ],
    'Seatbelt not worn': [
      'seatbelt', 'seatbelts', 'seat belt', 'seat belts', 'seat-belt',
      'restraint', 'restraints',
      'belt', 'belts', 'belted',
      'buckle', 'buckled', 'unbuckled',
      'not wearing seatbelt', 'no seatbelt'
    ],
    'Speed violation': [
      'speed', 'speeds', 'speeding', 'speeded',
      'fast', 'faster', 'too fast',
      'slow down', 'slowing',
      'speed limit', 'speed limits',
      'excessive speed', 'over speed'
    ]
  },

  // 4. Lifting
  'Lifting': {
    'Rigging deficiency': [
      'rigging', 'rigged', 'rig', 'rigs',
      'sling', 'slings', 'slinged', 'slinging',
      'shackle', 'shackles', 'shackled',
      'hook', 'hooks', 'hooked', 'hooking',
      'lifting gear', 'lifting equipment',
      'chain', 'chains', 'chained',
      'wire rope', 'wire ropes', 'webbing', 'webbings'
    ],
    'Lift plan issue': [
      'lift plan', 'lift plans', 'lifting plan', 'lifting plans',
      'method statement', 'method statements',
      'procedure', 'procedures', 'procedur',
      'lift study', 'lifting procedure', 'no plan', 'without plan'
    ],
    'Exclusion zone missing': [
      'exclusion', 'exclusion zone', 'exclusion zones',
      'barricade', 'barricades', 'barricaded', 'baricade',
      'danger zone', 'drop zone',
      'lifting zone', 'lift zone',
      'barrier', 'barriers', 'no barrier'
    ],
    'Communication failure': [
      'signal', 'signals', 'signaled', 'signalled', 'signaling', 'signalling',
      'communication', 'communications', 'communicated',
      'radio', 'radios', 'two-way', 'two way',
      'hand signal', 'hand signals',
      'no communication', 'lost communication'
    ],
    'Overload risk': [
      'overload', 'overloaded', 'overloading', 'over load',
      'capacity', 'capacities', 'over capacity',
      'swl', 'safe working load',
      'weight', 'weights', 'too heavy', 'heavy load',
      'wll', 'working load limit', 'exceeds capacity'
    ],
    'Crane inspection': [
      'inspection', 'inspections', 'inspected', 'inspecting',
      'certificate', 'certificates', 'certificated', 'certificat',
      'annual', 'annually',
      'defect', 'defects', 'defective',
      'crane certificate', 'third party', 'thorough examination'
    ],
    'Tag line missing': [
      'tag line', 'tagline', 'taglines', 'tag lines',
      'guide rope', 'guide ropes',
      'control', 'controls', 'controlled', 'controlling',
      'control line', 'tag rope', 'no tagline', 'missing tagline'
    ],
    'Weather condition': [
      'wind', 'winds', 'windy',
      'weather', 'weather condition', 'weather conditions',
      'storm', 'storms', 'stormy',
      'visibility', 'poor visibility',
      'rain', 'raining', 'rainy',
      'wind speed', 'high wind'
    ],
    'Rigger competency': [
      'rigger', 'riggers',
      'trained rigger', 'competent rigger', 'certified rigger',
      'rigger certificate', 'rigging training',
      'untrained rigger', 'unqualified rigger'
    ],
    'Load instability': [
      'load', 'loads', 'loaded', 'loading',
      'secured', 'securing', 'unsecured',
      'shifting', 'shifted', 'shift',
      'unstable', 'instability',
      'unbalanced', 'imbalanced', 'off balance',
      'center of gravity', 'centre of gravity', 'load stability'
    ]
  },

  // 5. Energized System
  'Energized System': {
    'Live work exposure': [
      'live', 'live wire', 'live wires', 'live work',
      'energized', 'energised', 'energizing', 'energising',
      'electricity', 'electrical', 'electric',
      'shock', 'shocked', 'shocking', 'electric shock',
      'electrocution', 'electrocuted',
      'power on', 'powered', 'power supply'
    ],
    'Missing LOTO': [
      'loto', 'lo/to', 'lototo',
      'lockout', 'lockouts', 'locked out', 'lock out', 'lock-out',
      'tagout', 'tagouts', 'tagged out', 'tag out', 'tag-out',
      'isolation', 'isolated', 'isolating', 'not isolated',
      'de-energize', 'de-energized', 'deenergize', 'deenergized',
      'energy isolation'
    ],
    'Exposed wiring': [
      'exposed', 'expose', 'exposes', 'exposing',
      'wire', 'wires', 'wired', 'wiring',
      'cable', 'cables', 'cabled', 'cabling', 'cabel',
      'conductor', 'conductors',
      'insulation', 'insulated', 'damaged insulation',
      'exposed wire', 'bare wire', 'damaged cable', 'frayed'
    ],
    'Panel/enclosure open': [
      'panel', 'panels', 'electrical panel', 'electrical panels',
      'enclosure', 'enclosures', 'open enclosure',
      'door', 'doors', 'door open',
      'cover', 'covers', 'uncovered', 'cover missing',
      'open panel', 'db', 'distribution board'
    ],
    'Improper tools': [
      'tool', 'tools', 'tooling',
      'insulated', 'insulated tool', 'insulated tools',
      'rated', 'voltage rated',
      'appropriate', 'inappropriate',
      'proper tool', 'correct tool', 'wrong tool'
    ],
    'No permit': [
      'permit', 'permits', 'permitted',
      'ptw', 'electrical permit', 'work permit',
      'no permit', 'without permit', 'missing permit'
    ],
    'Competency issue': [
      'qualified', 'unqualified', 'qualification',
      'competent', 'incompetent', 'competency', 'competant',
      'electrician', 'electricians',
      'trained', 'untrained', 'training',
      'certification', 'certified', 'uncertified',
      'authorized', 'authorised', 'unauthorized', 'unauthorised',
      'competent person'
    ],
    'Missing barriers': [
      'barrier', 'barriers', 'barriered',
      'barricade', 'barricades', 'barricaded', 'baricade',
      'sign', 'signs', 'signage',
      'warning', 'warnings', 'warned',
      'danger sign', 'caution', 'warning sign'
    ],
    'Grounding issue': [
      'ground', 'grounds', 'grounded', 'grounding',
      'earth', 'earthed', 'earthing',
      'bonding', 'bonded', 'bond',
      'earth connection', 'ground fault'
    ],
    'Testing not done': [
      'test', 'tests', 'tested', 'testing',
      'verify', 'verified', 'verifying', 'verification',
      'dead', 'confirmed dead', 'proved dead',
      'voltage', 'voltage test', 'voltage testing',
      'proving', 'proved', 'proven'
    ]
  },

  // 6. Hot Work
  'Hot Work': {
    'Fire watch missing': [
      'fire watch', 'firewatch', 'fire-watch',
      'fire watcher', 'fire watchers',
      'standby', 'stand by', 'stand-by',
      'fire guard', 'fire guards', 'watch person'
    ],
    'No permit': [
      'permit', 'permits', 'permitted',
      'hot work permit', 'hot-work permit',
      'ptw', 'work permit',
      'no permit', 'without permit', 'missing permit'
    ],
    'Fire extinguisher missing': [
      'extinguisher', 'extinguishers', 'extingusher', 'extinghisher', 'extinguiser',
      'fire extinguisher', 'fire extinguishers',
      'abc', 'abc extinguisher',
      'missing extinguisher', 'no extinguisher'
    ],
    'Welding screen missing': [
      'screen', 'screens', 'screened', 'screening',
      'curtain', 'curtains', 'welding curtain', 'welding curtains',
      'welding screen', 'welding screens',
      'flash', 'flash screen', 'shield', 'shields'
    ],
    'Flammable material nearby': [
      'flammable', 'flammables', 'flamable', 'flameable',
      'combustible', 'combustibles', 'combustable',
      'fuel', 'fuels', 'fueling', 'fuelling',
      'gas', 'gases', 'gasses',
      'chemical', 'chemicals',
      'flammable material', 'combustible material'
    ],
    'PPE deficiency': [
      'ppe', 'p.p.e.',
      'gloves', 'glove', 'gloving',
      'goggles', 'goggle',
      'face shield', 'face shields', 'faceshield',
      'welding mask', 'welding masks', 'welding helmet', 'welding helmets',
      'leather gloves', 'apron', 'aprons'
    ],
    'Ventilation issue': [
      'ventilation', 'ventilated', 'ventilating', 'ventilaton', 'ventillation',
      'fume', 'fumes', 'fuming',
      'smoke', 'smoked', 'smoking', 'smoky',
      'extraction', 'extracted', 'extracting',
      'exhaust', 'exhausted', 'exhausting',
      'fume extraction', 'local exhaust'
    ],
    'Cylinder storage': [
      'cylinder', 'cylinders', 'cylindar', 'cilinder',
      'gas cylinder', 'gas cylinders',
      'acetylene', 'oxygen', 'propane', 'argon',
      'bottle', 'bottles', 'gas bottle', 'gas bottles'
    ],
    'Spark containment': [
      'spark', 'sparks', 'sparked', 'sparking',
      'spatter', 'spatters', 'spattered', 'spattering',
      'hot slag', 'slag',
      'blanket', 'blankets', 'fire blanket', 'fire blankets',
      'spark catcher', 'welding blanket', 'welding blankets'
    ],
    'Competency issue': [
      'welder', 'welders', 'welded', 'welding',
      'certified', 'certification', 'uncertified',
      'trained', 'untrained', 'training',
      'competent', 'incompetent', 'competency', 'competant',
      'welder certificate', 'welding qualification'
    ]
  },

  // 7. Confined Spaces
  'Confined Spaces': {
    'No permit': [
      'permit', 'permits', 'permitted',
      'confined space permit', 'entry permit',
      'ptw', 'work permit',
      'no permit', 'without permit', 'missing permit'
    ],
    'Atmospheric testing': [
      'test', 'tests', 'tested', 'testing',
      'gas', 'gases', 'gasses', 'gas test', 'gas testing',
      'monitor', 'monitors', 'monitored', 'monitoring',
      'detector', 'detectors', 'detection',
      'atmosphere', 'atmospheric', 'atmospheric test', 'atmospheric testing',
      'o2', 'oxygen', 'lel', 'h2s', 'co', 'carbon monoxide'
    ],
    'Rescue plan missing': [
      'rescue', 'rescues', 'rescued', 'rescuing',
      'emergency', 'emergencies', 'emergancy',
      'standby', 'stand by', 'stand-by',
      'retrieval', 'retrieve', 'retrieving',
      'rescue plan', 'emergency plan', 'rescue equipment'
    ],
    'Ventilation issue': [
      'ventilation', 'ventilated', 'ventilating', 'ventilaton', 'ventillation',
      'air', 'fresh air', 'air supply',
      'blower', 'blowers', 'blowing',
      'fan', 'fans', 'fanning',
      'exhaust', 'exhausted', 'exhausting',
      'forced ventilation', 'mechanical ventilation'
    ],
    'Attendant missing': [
      'attendant', 'attendants', 'attended', 'attending',
      'standby', 'stand by', 'stand-by',
      'hole watch', 'hole watcher',
      'top man', 'topman',
      'entry attendant', 'standby person', 'outside attendant'
    ],
    'Entry/exit issue': [
      'entry', 'entries', 'entered', 'entering',
      'exit', 'exits', 'exited', 'exiting',
      'access', 'accessed', 'accessing',
      'egress', 'egressed',
      'ladder', 'ladders', 'lader',
      'entry point', 'exit route'
    ],
    'Communication failure': [
      'communication', 'communications', 'communicated', 'communicating',
      'radio', 'radios', 'two-way radio', 'two way radio',
      'signal', 'signals', 'signaled', 'signalled',
      'contact', 'contacted', 'contacting',
      'communication device', 'no communication'
    ],
    'PPE deficiency': [
      'ppe', 'p.p.e.',
      'respirator', 'respirators', 'resprator',
      'scba', 's.c.b.a.',
      'harness', 'harnesses', 'harnes',
      'breathing apparatus', 'ba', 'escape set'
    ],
    'Isolation issue': [
      'isolation', 'isolations', 'isolated', 'isolating',
      'energy', 'energized', 'energised',
      'lockout', 'locked out', 'lock out',
      'blind', 'blinds', 'blinded', 'blinding',
      'blind flange', 'energy isolation', 'positive isolation'
    ],
    'Training issue': [
      'trained', 'untrained', 'training',
      'competent', 'incompetent', 'competency', 'competant',
      'certified', 'uncertified', 'certification',
      'awareness', 'aware',
      'confined space training', 'not trained'
    ]
  },

  // 8. Fire
  'Fire': {
    'Extinguisher issue': [
      'extinguisher', 'extinguishers', 'extingusher', 'extinghisher',
      'fire extinguisher', 'fire extinguishers',
      'missing', 'expired', 'blocked',
      'no extinguisher', 'extinguisher access', 'extinguisher missing'
    ],
    'Flammable storage': [
      'flammable', 'flammables', 'flamable', 'flameable',
      'storage', 'stored', 'storing',
      'fuel', 'fuels', 'fuel storage',
      'chemical', 'chemicals', 'chemical storage',
      'container', 'containers',
      'flammable storage', 'flammable cabinet'
    ],
    'Ignition source': [
      'ignition', 'ignited', 'igniting',
      'spark', 'sparks', 'sparked', 'sparking',
      'heat', 'heated', 'heating', 'heat source',
      'flame', 'flames', 'flaming',
      'hot work', 'ignition source', 'open flame'
    ],
    'Housekeeping': [
      'housekeeping', 'house keeping', 'house-keeping',
      'debris', 'combustible', 'combustibles', 'combustable',
      'accumulation', 'accumulated', 'accumulating',
      'waste', 'wastes', 'rubbish',
      'clean', 'cleaned', 'cleaning', 'unclean'
    ],
    'Electrical issue': [
      'electrical', 'electric', 'electrically',
      'overload', 'overloaded', 'overloading',
      'short', 'shorted', 'shorting', 'short circuit',
      'wiring', 'wired', 'wire',
      'electrical fire', 'electrical hazard'
    ],
    'Emergency exit blocked': [
      'exit', 'exits', 'exited', 'exiting',
      'emergency exit', 'emergency exits',
      'blocked', 'block', 'blocking',
      'obstructed', 'obstruct', 'obstructing', 'obstruction',
      'sign', 'signs', 'signage',
      'exit blocked', 'egress', 'egress blocked'
    ],
    'Alarm/detection': [
      'alarm', 'alarms', 'alarmed',
      'detector', 'detectors', 'detection',
      'smoke detector', 'smoke detectors',
      'fire alarm', 'fire alarms',
      'heat detector', 'heat detectors',
      'detection system'
    ],
    'Assembly point': [
      'assembly', 'assembled', 'assembling',
      'muster', 'mustered', 'mustering',
      'evacuation', 'evacuated', 'evacuating',
      'drill', 'drills', 'drilled',
      'assembly point', 'muster point'
    ],
    'Fire door issue': [
      'fire door', 'fire doors',
      'door', 'doors', 'doored',
      'propped', 'propping', 'prop open',
      'wedged', 'wedging', 'wedge',
      'fire door open', 'door blocked'
    ],
    'Training issue': [
      'training', 'trained', 'untrained',
      'drill', 'drills', 'drilled',
      'awareness', 'aware',
      'procedure', 'procedures', 'procedur',
      'fire training', 'evacuation drill'
    ]
  },

  // 9. Worker Welfare
  'Worker Welfare': {
    'Drinking water issue': [
      'drinking water', 'potable', 'potable water',
      'water cooler', 'water coolers',
      'water station', 'water stations',
      'drinking', 'water supply', 'no water', 'water point'
    ],
    'Toilet condition': [
      'toilet', 'toilets', 'restroom', 'restrooms',
      'washroom', 'washrooms', 'sanitary',
      'latrine', 'latrines', 'bathroom', 'bathrooms',
      'wc', 'portable toilet'
    ],
    'Rest area issue': [
      'rest', 'rested', 'resting',
      'shade', 'shaded', 'shading',
      'shelter', 'sheltered', 'sheltering',
      'break area', 'break areas', 'canteen', 'canteens',
      'rest area', 'rest areas', 'break room', 'break rooms'
    ],
    'First aid missing': [
      'first aid', 'firstaid', 'first-aid',
      'medical', 'medically',
      'kit', 'kits', 'supplies',
      'first aid kit', 'first aid kits',
      'first aider', 'first aiders',
      'medical supplies', 'no first aid'
    ],
    'Welfare facility': [
      'welfare', 'facility', 'facilities',
      'amenity', 'amenities',
      'accommodation', 'accommodations',
      'camp', 'camps', 'camping',
      'living quarters', 'living area'
    ],
    'Cleanliness issue': [
      'clean', 'cleaned', 'cleaning',
      'dirty', 'dirtied', 'dirtying',
      'hygiene', 'hygienic', 'unhygienic',
      'sanitation', 'sanitized', 'unsanitized',
      'unclean', 'cleanliness'
    ],
    'Temperature/climate': [
      'heat', 'heated', 'heating', 'hot',
      'cold', 'cooled', 'cooling',
      'temperature', 'temperatures',
      'weather', 'shade', 'shaded',
      'ac', 'a/c', 'air conditioning'
    ],
    'Overcrowding': [
      'crowded', 'crowding', 'overcrowded', 'overcrowding',
      'capacity', 'over capacity', 'overcapacity',
      'space', 'spaces', 'spacing',
      'congestion', 'congested',
      'too many', 'too crowded'
    ],
    'Food safety': [
      'food', 'foods', 'feeding',
      'canteen', 'canteens',
      'mess', 'mess hall',
      'contamination', 'contaminated', 'contaminating',
      'food storage', 'food handling', 'expired', 'expiring'
    ],
    'PPE condition': [
      'ppe', 'p.p.e.',
      'worn', 'wearing', 'worn out',
      'damaged', 'damage', 'damaging',
      'replacement', 'replaced', 'replacing',
      'damaged ppe', 'ppe replacement', 'ppe damaged'
    ]
  },

  // 10. Housekeeping
  'Housekeeping': {
    'Debris/waste': [
      'debris', 'waste', 'wastes', 'wasted', 'wasting',
      'rubbish', 'trash', 'garbage',
      'scrap', 'scraps', 'scrapped',
      'litter', 'littered', 'littering'
    ],
    'Material scattered': [
      'scattered', 'scattering', 'scatter',
      'lying', 'lay', 'laying',
      'thrown', 'throw', 'throwing',
      'dumped', 'dump', 'dumping',
      'left', 'leaving', 'abandoned', 'unattended'
    ],
    'Walkway obstruction': [
      'walkway', 'walkways', 'walk way',
      'path', 'paths', 'pathway', 'pathways',
      'access', 'accessed', 'accessing',
      'blocked', 'block', 'blocking',
      'obstructed', 'obstruct', 'obstructing', 'obstruction',
      'access blocked'
    ],
    'Poor organization': [
      'organization', 'organised', 'organized',
      'arranged', 'arrange', 'arranging',
      'tidy', 'tidied', 'tidying',
      'order', 'ordered', 'ordering',
      'disorganized', 'disorganised', 'messy', 'untidy'
    ],
    'Spillage': [
      'spill', 'spills', 'spilled', 'spilling', 'spillage',
      'leak', 'leaks', 'leaked', 'leaking', 'leakage',
      'liquid', 'liquids',
      'oil spill', 'water spill', 'chemical spill'
    ],
    'Stacking issue': [
      'stacking', 'stacked', 'stack', 'stacks',
      'piled', 'pile', 'piles', 'piling',
      'unstable', 'instability',
      'height', 'heights', 'overstacked'
    ],
    'Waste management': [
      'waste', 'wastes', 'wasted',
      'bin', 'bins', 'binned',
      'container', 'containers',
      'disposal', 'disposed', 'disposing',
      'waste bin', 'skip', 'skips', 'dumpster', 'dumpsters'
    ],
    'Cable management': [
      'cable', 'cables', 'cabled', 'cabling', 'cabel',
      'hose', 'hoses', 'hosing',
      'trailing', 'trailed', 'trail',
      'across', 'cable across', 'trailing cable', 'hose across'
    ],
    'Signage issue': [
      'sign', 'signs', 'signed', 'signing', 'signage',
      'warning', 'warnings', 'warned',
      'label', 'labels', 'labeled', 'labelled', 'labeling', 'labelling',
      'marking', 'marked', 'marks',
      'missing sign', 'no sign'
    ],
    'Storage issue': [
      'storage', 'storages', 'stored', 'storing',
      'designated', 'designate', 'designating',
      'area', 'areas',
      'storage area', 'improper storage', 'wrong location'
    ]
  },

  // 11. Environmental
  'Environmental': {
    'Spill/contamination': [
      'spill', 'spills', 'spilled', 'spilling', 'spillage',
      'contamination', 'contaminated', 'contaminating',
      'leak', 'leaks', 'leaked', 'leaking', 'leakage',
      'discharge', 'discharged', 'discharging',
      'pollution', 'polluted', 'polluting',
      'environmental spill'
    ],
    'Waste disposal': [
      'waste', 'wastes', 'wasted', 'wasting',
      'disposal', 'disposed', 'disposing',
      'segregation', 'segregated', 'segregating', 'segragation',
      'waste disposal', 'hazardous waste', 'waste segregation'
    ],
    'Dust/emission': [
      'dust', 'dusts', 'dusted', 'dusting', 'dusty',
      'emission', 'emissions', 'emitted', 'emitting',
      'air quality', 'particulate', 'particulates',
      'dust control', 'smoke', 'smoked', 'smoking',
      'fumes', 'fumed', 'fuming'
    ],
    'Water pollution': [
      'water', 'waters', 'watered', 'watering',
      'runoff', 'run off', 'run-off',
      'drainage', 'drained', 'draining',
      'water pollution', 'water contamination',
      'discharge', 'discharged', 'discharging'
    ],
    'Soil contamination': [
      'soil', 'soils', 'soiled',
      'ground', 'grounds', 'grounded',
      'contamination', 'contaminated', 'contaminating',
      'soil contamination', 'ground contamination'
    ],
    'Noise pollution': [
      'noise', 'noises', 'noisy',
      'sound', 'sounds', 'sounding',
      'loud', 'louder', 'loudly',
      'noise pollution', 'excessive noise',
      'decibel', 'decibels', 'db'
    ],
    'Chemical storage': [
      'chemical', 'chemicals',
      'storage', 'stored', 'storing',
      'bund', 'bunds', 'bunded', 'bunding',
      'containment', 'contained', 'containing',
      'secondary containment', 'chemical storage'
    ],
    'Wildlife/vegetation': [
      'wildlife', 'wild life',
      'vegetation', 'vegetated',
      'tree', 'trees', 'treed',
      'animal', 'animals',
      'protected', 'protect', 'protecting',
      'habitat', 'habitats'
    ],
    'Recycling issue': [
      'recycling', 'recycled', 'recycle', 'recycles',
      'reuse', 'reused', 'reusing',
      'recycling bin', 'recyclable', 'recyclables'
    ],
    'Permit/compliance': [
      'permit', 'permits', 'permitted', 'permitting',
      'compliance', 'compliant', 'non-compliant', 'noncompliant',
      'environmental permit', 'regulation', 'regulations',
      'license', 'licenses', 'licensed', 'licence'
    ]
  },

  // 12. Slip and Trip
  'Slip and Trip': {
    'Wet surface': [
      'wet', 'wets', 'wetted', 'wetting',
      'water', 'waters', 'watered', 'watering',
      'slippery', 'slipped', 'slipping', 'slip',
      'wet floor', 'spill', 'spills', 'spilled', 'spillage',
      'puddle', 'puddles', 'standing water'
    ],
    'Uneven surface': [
      'uneven', 'unevenness',
      'level', 'levels', 'leveled', 'levelled', 'unlevel',
      'surface', 'surfaces',
      'pothole', 'potholes', 'pot hole',
      'crack', 'cracks', 'cracked', 'cracking',
      'uneven ground', 'uneven surface', 'uneven floor'
    ],
    'Debris on floor': [
      'debris', 'material', 'materials',
      'obstacle', 'obstacles',
      'floor', 'floors', 'flooring',
      'scattered', 'scattering', 'scatter',
      'rubbish', 'trash'
    ],
    'Trailing cables': [
      'cable', 'cables', 'cabled', 'cabling', 'cabel',
      'wire', 'wires', 'wired', 'wiring',
      'hose', 'hoses', 'hosing',
      'trailing', 'trailed', 'trail',
      'across', 'trailing cable', 'trip hazard'
    ],
    'Poor lighting': [
      'lighting', 'lighted', 'lit',
      'dark', 'darker', 'darkness',
      'visibility', 'visible', 'invisible',
      'light', 'lights', 'lighted',
      'poorly lit', 'no light', 'dim', 'dimmed', 'dimly'
    ],
    'Missing floor cover': [
      'cover', 'covers', 'covered', 'covering', 'uncovered',
      'plate', 'plates', 'plated',
      'grating', 'gratings', 'grate',
      'missing', 'hole', 'holes',
      'opening', 'openings', 'floor cover'
    ],
    'Stairway hazard': [
      'stair', 'stairs', 'staired',
      'step', 'steps', 'stepped', 'stepping',
      'stairway', 'stairways', 'staircase', 'staircases',
      'handrail', 'handrails', 'hand rail',
      'nosing', 'nosings'
    ],
    'Footwear issue': [
      'footwear', 'foot wear',
      'shoe', 'shoes', 'shoed',
      'boot', 'boots', 'booted',
      'safety shoe', 'safety shoes', 'safety boot',
      'wrong footwear', 'slippery footwear', 'inappropriate footwear'
    ],
    'Signage missing': [
      'sign', 'signs', 'signed', 'signing', 'signage',
      'warning', 'warnings', 'warned',
      'caution', 'cautioned', 'cautioning',
      'wet floor sign', 'no sign', 'missing sign'
    ],
    'Mat/carpet issue': [
      'mat', 'mats', 'matted', 'matting',
      'carpet', 'carpets', 'carpeted', 'carpeting',
      'rug', 'rugs',
      'curled', 'curl', 'curling',
      'loose', 'loosened', 'mat curled', 'trip mat'
    ]
  },

  // 13. Breaking Ground & Excavation
  'Breaking Ground & Excavation': {
    'Permit issue': [
      'permit', 'permits', 'permitted', 'permitting',
      'dig permit', 'excavation permit', 'excation',
      'ptw', 'breaking ground',
      'no permit', 'without permit', 'missing permit'
    ],
    'Underground services': [
      'underground', 'under ground',
      'service', 'services', 'serviced',
      'utility', 'utilities',
      'cable', 'cables', 'cabled', 'cabling',
      'pipe', 'pipes', 'piped', 'piping',
      'underground service', 'buried', 'burying'
    ],
    'Shoring missing': [
      'shoring', 'shored', 'shore',
      'shielding', 'shielded', 'shield',
      'trench box', 'trench boxes',
      'support', 'supports', 'supported', 'supporting',
      'trench shoring', 'no shoring', 'missing shoring'
    ],
    'Edge protection': [
      'edge', 'edges', 'edged', 'edging',
      'barrier', 'barriers', 'barriered',
      'barricade', 'barricades', 'barricaded', 'baricade',
      'edge protection', 'excavation edge', 'no barrier'
    ],
    'Access/egress': [
      'access', 'accessed', 'accessing',
      'egress', 'egressed',
      'ladder', 'ladders', 'lader',
      'ramp', 'ramps', 'ramped',
      'entry', 'entries', 'entered', 'entering',
      'exit', 'exits', 'exited', 'exiting',
      'safe access'
    ],
    'Spoil placement': [
      'spoil', 'spoils', 'spoiled',
      'material', 'materials',
      'excavated', 'excavate', 'excavating',
      'stockpile', 'stockpiled', 'stockpiling',
      'spoil pile', 'too close', 'edge of excavation'
    ],
    'Collapse risk': [
      'collapse', 'collapses', 'collapsed', 'collapsing',
      'cave-in', 'cave in', 'caved in', 'caving in',
      'unstable', 'instability',
      'soil', 'soils', 'ground movement',
      'wall collapse', 'trench collapse'
    ],
    'Water ingress': [
      'water', 'waters', 'watered', 'watering',
      'flooding', 'flooded', 'flood', 'floods',
      'dewatering', 'dewatered', 'de-watering',
      'pump', 'pumps', 'pumped', 'pumping',
      'water in excavation', 'groundwater', 'ground water'
    ],
    'Competent person': [
      'competent', 'competency', 'competant',
      'trained', 'untrained', 'training',
      'supervisor', 'supervisors', 'supervised',
      'competent person', 'qualified', 'unqualified'
    ],
    'Inspection missing': [
      'inspection', 'inspections', 'inspected', 'inspecting', 'inpection',
      'daily', 'check', 'checks', 'checked', 'checking',
      'excavation inspection', 'not inspected', 'uninspected'
    ]
  },

  // 14. Temporary Works
  'Temporary Works': {
    'Design issue': [
      'design', 'designs', 'designed', 'designing',
      'calculation', 'calculations', 'calculated', 'calculating',
      'drawing', 'drawings', 'drawn',
      'specification', 'specifications', 'specified',
      'no design', 'design check', 'design missing'
    ],
    'Permit missing': [
      'permit', 'permits', 'permitted', 'permitting',
      'ptw', 'temporary works permit',
      'no permit', 'without permit', 'missing permit'
    ],
    'Inspection not done': [
      'inspection', 'inspections', 'inspected', 'inspecting', 'inpection',
      'check', 'checks', 'checked', 'checking',
      'verify', 'verified', 'verifying', 'verification',
      'not inspected', 'inspection required', 'uninspected'
    ],
    'Load capacity': [
      'load', 'loads', 'loaded', 'loading',
      'capacity', 'capacities', 'over capacity',
      'overload', 'overloaded', 'overloading',
      'weight', 'weights', 'weighted',
      'load capacity', 'exceeds capacity'
    ],
    'Bracing missing': [
      'bracing', 'braced', 'brace', 'braces',
      'support', 'supports', 'supported', 'supporting',
      'strutting', 'strutted', 'strut', 'struts',
      'propping', 'propped', 'prop', 'props',
      'no bracing', 'missing bracing'
    ],
    'Foundation issue': [
      'foundation', 'foundations', 'founded',
      'base', 'bases', 'based', 'basing',
      'ground', 'grounds', 'grounded',
      'bearing', 'bearings',
      'foundation failure', 'soft ground'
    ],
    'Connection defect': [
      'connection', 'connections', 'connected', 'connecting',
      'joint', 'joints', 'jointed', 'jointing',
      'fixing', 'fixed', 'fix', 'fixes',
      'bolt', 'bolts', 'bolted', 'bolting',
      'loose', 'loosened', 'loosening',
      'connection failure'
    ],
    'Striking issue': [
      'striking', 'struck', 'strike',
      'removal', 'removed', 'removing',
      'dismantling', 'dismantled', 'dismantle',
      'premature', 'prematurely',
      'early striking'
    ],
    'Coordinator missing': [
      'coordinator', 'coordinators', 'coordinated', 'coordinating',
      'twc', 't.w.c.',
      'temporary works coordinator',
      'no coordinator', 'missing coordinator'
    ],
    'Documentation missing': [
      'documentation', 'documented', 'documenting',
      'register', 'registers', 'registered', 'registering',
      'record', 'records', 'recorded', 'recording',
      'paperwork', 'no documentation', 'missing documentation'
    ]
  },

  // 15. Traffic Management
  'Traffic Management': {
    'Barrier missing': [
      'barrier', 'barriers', 'barriered',
      'barricade', 'barricades', 'barricaded', 'baricade',
      'cone', 'cones', 'coned', 'coning',
      'delineator', 'delineators', 'delinator',
      'no barrier', 'missing barrier'
    ],
    'Signage issue': [
      'sign', 'signs', 'signed', 'signing', 'signage',
      'traffic sign', 'traffic signs',
      'warning sign', 'warning signs',
      'missing sign', 'no sign'
    ],
    'Pedestrian segregation': [
      'pedestrian', 'pedestrians', 'pedestrain',
      'segregation', 'segregated', 'segregating', 'segragation',
      'walkway', 'walkways', 'walk way',
      'crossing', 'crossings', 'crossed',
      'footpath', 'footpaths', 'pedestrian route'
    ],
    'Speed control': [
      'speed', 'speeds', 'speeded', 'speeding',
      'speed limit', 'speed limits',
      'speed bump', 'speed bumps', 'speed hump',
      'speed control', 'too fast', 'excessive speed'
    ],
    'One-way violation': [
      'one-way', 'one way', 'oneway',
      'direction', 'directions', 'directional',
      'wrong way', 'wrong direction',
      'route', 'routes', 'routed', 'routing'
    ],
    'Lighting issue': [
      'lighting', 'lighted', 'lit',
      'light', 'lights',
      'visibility', 'visible', 'invisible',
      'dark', 'darker', 'darkness',
      'no light', 'poor lighting', 'inadequate lighting'
    ],
    'Crossing point': [
      'crossing', 'crossings', 'crossed', 'cross',
      'intersection', 'intersections',
      'junction', 'junctions',
      'crossing point', 'no crossing', 'missing crossing'
    ],
    'Traffic controller': [
      'controller', 'controllers', 'controlled', 'controlling',
      'marshall', 'marshalls', 'marshal', 'marshals',
      'flagman', 'flagmen', 'flag man',
      'traffic control', 'no controller', 'missing controller'
    ],
    'TMP compliance': [
      'tmp', 't.m.p.',
      'traffic management plan', 'traffic management plans',
      'plan', 'plans', 'planned', 'planning',
      'compliance', 'compliant', 'non-compliant',
      'not followed', 'not compliant'
    ],
    'Vehicle/plant mixing': [
      'vehicle', 'vehicles', 'vehicular',
      'plant', 'plants',
      'mixing', 'mixed', 'mix',
      'separation', 'separated', 'separating',
      'interface', 'interfaced', 'interfacing',
      'conflict', 'conflicts', 'conflicting'
    ]
  },

  // 16. Driving
  'Driving': {
    'Speeding': [
      'speed', 'speeds', 'speeded', 'speeding',
      'fast', 'faster', 'fastest',
      'speed limit', 'speed limits',
      'excessive speed', 'too fast', 'over speed'
    ],
    'Seatbelt violation': [
      'seatbelt', 'seatbelts', 'seat belt', 'seat belts', 'seat-belt',
      'belt', 'belts', 'belted', 'unbelted',
      'no seatbelt', 'not wearing seatbelt', 'unbuckled'
    ],
    'Mobile phone use': [
      'phone', 'phones', 'phoning',
      'mobile', 'mobiles', 'cell phone', 'cellphone',
      'using phone', 'mobile phone', 'phone use',
      'distracted', 'distraction', 'distracting'
    ],
    'Fatigue/drowsiness': [
      'fatigue', 'fatigued', 'fatiguing',
      'tired', 'tiredness', 'tiring',
      'drowsy', 'drowsiness',
      'sleepy', 'sleepiness',
      'fatigue management', 'rest break', 'rest breaks'
    ],
    'Vehicle condition': [
      'vehicle', 'vehicles', 'vehicular',
      'condition', 'conditions', 'conditioned',
      'defect', 'defects', 'defective',
      'maintenance', 'maintained', 'maintaining', 'maintainance',
      'vehicle defect', 'not roadworthy', 'unroadworthy'
    ],
    'License issue': [
      'license', 'licenses', 'licensed', 'licensing',
      'licence', 'licences', 'licenced', 'licencing',
      'driving license', 'driving licence',
      'no license', 'no licence', 'expired license', 'expired licence'
    ],
    'Unsafe following': [
      'following', 'followed', 'follow',
      'distance', 'distances', 'distanced',
      'tailgating', 'tailgated', 'tailgate',
      'too close', 'following distance', 'safe distance'
    ],
    'Improper overtaking': [
      'overtaking', 'overtook', 'overtake', 'overtaken',
      'passing', 'passed', 'pass',
      'unsafe overtaking', 'dangerous overtaking',
      'improper overtaking'
    ],
    'Journey management': [
      'journey', 'journeys', 'journeyed',
      'jmp', 'j.m.p.',
      'journey management', 'journey management plan',
      'route', 'routes', 'routed', 'routing',
      'journey plan', 'journey planning'
    ],
    'Defensive driving': [
      'defensive', 'defensively',
      'driving', 'drove', 'driven', 'drive',
      'training', 'trained', 'trainer',
      'defensive driving', 'driver training'
    ]
  },

  // 17. Chemical Hazard
  'Chemical Hazard': {
    'SDS missing': [
      'sds', 's.d.s.',
      'msds', 'm.s.d.s.',
      'safety data', 'safety data sheet',
      'data sheet', 'data sheets',
      'no sds', 'missing sds', 'sds missing'
    ],
    'Labeling issue': [
      'label', 'labels', 'labeled', 'labelled', 'labeling', 'labelling',
      'unlabeled', 'unlabelled',
      'no label', 'missing label', 'wrong label', 'incorrect label'
    ],
    'Storage issue': [
      'storage', 'storages', 'stored', 'storing',
      'chemical storage',
      'incompatible', 'incompatibility',
      'wrong storage', 'improper storage'
    ],
    'Containment missing': [
      'containment', 'contained', 'containing',
      'bund', 'bunds', 'bunded', 'bunding',
      'secondary containment', 'spill containment',
      'no bund', 'missing bund', 'no containment'
    ],
    'PPE not worn': [
      'ppe', 'p.p.e.',
      'gloves', 'glove', 'gloving',
      'goggles', 'goggle',
      'respirator', 'respirators', 'resprator',
      'no ppe', 'missing ppe', 'without ppe', 'ppe missing'
    ],
    'Spill response': [
      'spill', 'spills', 'spilled', 'spilling', 'spillage',
      'spill kit', 'spill kits',
      'response', 'responses', 'responded', 'responding',
      'cleanup', 'clean up', 'clean-up', 'cleaned up',
      'no spill kit', 'spill response', 'missing spill kit'
    ],
    'Incompatible storage': [
      'incompatible', 'incompatibility',
      'segregation', 'segregated', 'segregating', 'segragation',
      'separated', 'separate', 'separating',
      'mixed', 'mixing', 'mix',
      'wrong storage', 'chemical segregation'
    ],
    'Ventilation issue': [
      'ventilation', 'ventilated', 'ventilating', 'ventilaton', 'ventillation',
      'fume', 'fumes', 'fumed', 'fuming',
      'exhaust', 'exhausted', 'exhausting',
      'extraction', 'extracted', 'extracting',
      'no ventilation', 'poor ventilation', 'inadequate ventilation'
    ],
    'Training missing': [
      'training', 'trained', 'untrained', 'trainer',
      'awareness', 'aware',
      'chemical training', 'not trained', 'no training'
    ],
    'Exposure control': [
      'exposure', 'exposures', 'exposed', 'exposing',
      'control', 'controls', 'controlled', 'controlling',
      'monitoring', 'monitored', 'monitor',
      'limit', 'limits', 'limited', 'limiting',
      'exposure limit', 'oel', 'occupational exposure limit'
    ]
  },

  // 18. Respiratory Hazard
  'Respiratory Hazard': {
    'Dust exposure': [
      'dust', 'dusts', 'dusted', 'dusting', 'dusty',
      'particulate', 'particulates', 'particle',
      'airborne', 'air borne',
      'dust exposure', 'silica', 'silica dust'
    ],
    'Fume exposure': [
      'fume', 'fumes', 'fumed', 'fuming',
      'welding fume', 'welding fumes',
      'smoke', 'smoked', 'smoking', 'smoky',
      'vapor', 'vapors', 'vapour', 'vapours',
      'gas', 'gases', 'gasses'
    ],
    'RPE not worn': [
      'rpe', 'r.p.e.',
      'mask', 'masks', 'masked', 'masking',
      'respirator', 'respirators', 'resprator',
      'breathing', 'breathe',
      'no mask', 'without rpe', 'missing rpe', 'rpe missing'
    ],
    'RPE wrong type': [
      'wrong', 'wrongly',
      'type', 'types', 'typed',
      'incorrect', 'incorrectly',
      'not suitable', 'unsuitable',
      'wrong rpe', 'wrong mask', 'incorrect rpe'
    ],
    'Ventilation issue': [
      'ventilation', 'ventilated', 'ventilating', 'ventilaton', 'ventillation',
      'extraction', 'extracted', 'extracting',
      'exhaust', 'exhausted', 'exhausting',
      'lev', 'l.e.v.', 'local exhaust', 'local exhaust ventilation',
      'no ventilation', 'poor ventilation'
    ],
    'Fit test missing': [
      'fit test', 'fit tests', 'fit tested', 'fit testing',
      'face fit', 'face fitting',
      'not tested', 'no fit test', 'fit test missing'
    ],
    'Clean shaven': [
      'shaven', 'shaved', 'shaving',
      'beard', 'beards', 'bearded',
      'facial hair', 'clean shaven', 'clean-shaven',
      'not shaven', 'unshaven'
    ],
    'Confined space': [
      'confined', 'confining',
      'enclosed', 'enclosing', 'enclosure',
      'space', 'spaces',
      'confined space', 'confined spaces', 'enclosed space'
    ],
    'Air monitoring': [
      'monitoring', 'monitored', 'monitor', 'monitors',
      'air quality', 'air monitoring',
      'detector', 'detectors', 'detection',
      'no monitoring', 'not monitored'
    ],
    'Control measures': [
      'control', 'controls', 'controlled', 'controlling',
      'measures', 'measure', 'measured',
      'engineering', 'engineered',
      'hierarchy', 'hierarchies',
      'control measures', 'engineering controls'
    ]
  },

  // 19. Noise
  'Noise': {
    'Hearing protection missing': [
      'hearing', 'hear',
      'ear', 'ears',
      'earmuff', 'earmuffs', 'ear muff', 'ear muffs',
      'earplug', 'earplugs', 'ear plug', 'ear plugs',
      'no hearing protection', 'missing ear', 'hearing protection missing'
    ],
    'Noise assessment missing': [
      'assessment', 'assessments', 'assessed', 'assessing',
      'survey', 'surveys', 'surveyed', 'surveying',
      'noise assessment', 'noise survey',
      'not assessed', 'unassessed'
    ],
    'Signage missing': [
      'sign', 'signs', 'signed', 'signing', 'signage',
      'warning', 'warnings', 'warned',
      'noise sign', 'noise signs',
      'hearing protection sign', 'no sign', 'missing sign'
    ],
    'Zone demarcation': [
      'zone', 'zones', 'zoned', 'zoning',
      'demarcation', 'demarcated', 'demarcating',
      'boundary', 'boundaries',
      'noise zone', 'hearing protection zone'
    ],
    'Engineering controls': [
      'engineering', 'engineered',
      'control', 'controls', 'controlled', 'controlling',
      'barrier', 'barriers',
      'silencer', 'silencers', 'silenced',
      'enclosure', 'enclosures', 'enclosed',
      'damping', 'damped', 'damp'
    ],
    'Equipment maintenance': [
      'maintenance', 'maintained', 'maintaining', 'maintainance',
      'equipment', 'equipments', 'equipement',
      'lubrication', 'lubricated', 'lubricating',
      'worn', 'wearing', 'wear',
      'noisy equipment', 'noisy machinery'
    ],
    'Exposure monitoring': [
      'monitoring', 'monitored', 'monitor', 'monitors',
      'exposure', 'exposures', 'exposed',
      'dosimeter', 'dosimeters', 'dosimetry',
      'measurement', 'measurements', 'measured',
      'noise level', 'noise levels'
    ],
    'Audiometric testing': [
      'audiometric', 'audiometry',
      'hearing test', 'hearing tests', 'hearing tested',
      'health surveillance', 'surveillance'
    ],
    'Work rotation': [
      'rotation', 'rotations', 'rotated', 'rotating',
      'duration', 'durations',
      'exposure time', 'time limit', 'time limits',
      'work rotation', 'job rotation'
    ],
    'Training issue': [
      'training', 'trained', 'untrained', 'trainer',
      'awareness', 'aware',
      'noise training', 'not trained', 'no training'
    ]
  },

  // 20. Working on or Near Water
  'Working on or Near Water': {
    'Life jacket missing': [
      'life jacket', 'life jackets', 'lifejacket', 'lifejackets',
      'pfd', 'p.f.d.', 'personal flotation device',
      'buoyancy', 'buoyancy aid',
      'flotation', 'flotation device',
      'no life jacket', 'missing life jacket'
    ],
    'Rescue equipment missing': [
      'rescue', 'rescues', 'rescued', 'rescuing',
      'ring buoy', 'ring buoys',
      'life ring', 'life rings', 'lifering',
      'throw line', 'throw lines',
      'rescue equipment', 'missing rescue equipment'
    ],
    'Barrier missing': [
      'barrier', 'barriers', 'barriered',
      'guardrail', 'guardrails', 'guard rail', 'gaurd rail',
      'edge protection', 'no barrier', 'unprotected edge'
    ],
    'Buddy system': [
      'buddy', 'buddies', 'buddied',
      'pair', 'pairs', 'paired', 'pairing',
      'alone', 'working alone', 'lone working',
      'single person', 'no buddy', 'without buddy'
    ],
    'Current/conditions': [
      'current', 'currents',
      'tide', 'tides', 'tidal',
      'wave', 'waves', 'waving',
      'weather', 'weather conditions',
      'water conditions', 'rough water', 'rough conditions'
    ],
    'Boat safety': [
      'boat', 'boats', 'boating',
      'vessel', 'vessels',
      'craft', 'crafts',
      'marine', 'maritime',
      'boat safety', 'vessel safety'
    ],
    'Permit issue': [
      'permit', 'permits', 'permitted', 'permitting',
      'ptw', 'water permit',
      'no permit', 'without permit', 'missing permit'
    ],
    'Visibility issue': [
      'visibility', 'visible', 'invisible',
      'light', 'lights', 'lighted', 'lit',
      'dark', 'darker', 'darkness',
      'visibility aid', 'high visibility', 'hi-vis'
    ],
    'Communication': [
      'communication', 'communications', 'communicated', 'communicating',
      'radio', 'radios',
      'signal', 'signals', 'signaled', 'signalled',
      'contact', 'contacts', 'contacted',
      'emergency communication'
    ],
    'Training issue': [
      'training', 'trained', 'untrained', 'trainer',
      'swim', 'swims', 'swimming', 'swam',
      'water safety', 'competent', 'competency'
    ]
  },

  // 21. Mechanical Hazard
  'Mechanical Hazard': {
    'Guard missing': [
      'guard', 'guards', 'guarded', 'guarding',
      'machine guard', 'machine guards',
      'no guard', 'missing guard', 'removed guard', 'guard removed'
    ],
    'Lockout missing': [
      'lockout', 'lockouts', 'locked out', 'lock out', 'lock-out',
      'loto', 'lo/to',
      'isolation', 'isolated', 'isolating', 'not isolated',
      'no lockout', 'energized', 'energised'
    ],
    'Rotating parts': [
      'rotating', 'rotated', 'rotate', 'rotation',
      'spinning', 'spun', 'spin',
      'shaft', 'shafts',
      'coupling', 'couplings', 'coupled',
      'belt', 'belts', 'belted',
      'pulley', 'pulleys',
      'exposed rotating', 'rotating machinery'
    ],
    'Pinch point': [
      'pinch', 'pinched', 'pinching', 'pinch point', 'pinch points',
      'nip', 'nipped', 'nipping', 'nip point', 'nip points',
      'caught', 'caught in', 'caught between'
    ],
    'Emergency stop': [
      'e-stop', 'e stop', 'estop',
      'emergency stop', 'emergency stops',
      'stop button', 'stop buttons',
      'no e-stop', 'missing e-stop', 'e-stop missing'
    ],
    'Maintenance issue': [
      'maintenance', 'maintained', 'maintaining', 'maintainance',
      'repair', 'repairs', 'repaired', 'repairing',
      'service', 'services', 'serviced', 'servicing',
      'defect', 'defects', 'defective',
      'breakdown', 'breakdowns', 'broke down',
      'not maintained', 'unmaintained'
    ],
    'Training issue': [
      'training', 'trained', 'untrained', 'trainer',
      'operator', 'operators', 'operated',
      'competent', 'incompetent', 'competency', 'competant',
      'not trained', 'unauthorized', 'unauthorised'
    ],
    'Start-up warning': [
      'start-up', 'startup', 'start up', 'starting up',
      'warning', 'warnings', 'warned',
      'alarm', 'alarms', 'alarmed',
      'signal', 'signals', 'signaled', 'signalled',
      'unexpected start', 'unexpected startup'
    ],
    'Tool/equipment': [
      'tool', 'tools', 'tooling',
      'equipment', 'equipments', 'equipement',
      'wrong tool', 'damaged tool', 'defective tool',
      'defective equipment', 'damaged equipment'
    ],
    'SOP missing': [
      'sop', 's.o.p.', 'sops',
      'procedure', 'procedures', 'procedur',
      'instruction', 'instructions', 'instructed',
      'manual', 'manuals',
      'no procedure', 'missing sop', 'no sop'
    ]
  },

  // 22. Pressure Testing
  'Pressure Testing': {
    'Exclusion zone': [
      'exclusion', 'exclusion zone', 'exclusion zones',
      'zone', 'zones', 'zoned', 'zoning',
      'barrier', 'barriers', 'barriered',
      'barricade', 'barricades', 'barricaded', 'baricade',
      'test zone'
    ],
    'Permit missing': [
      'permit', 'permits', 'permitted', 'permitting',
      'ptw', 'pressure test permit',
      'no permit', 'without permit', 'missing permit'
    ],
    'Pressure gauge': [
      'gauge', 'gauges', 'gauged', 'gauging',
      'pressure gauge', 'pressure gauges',
      'calibration', 'calibrated', 'calibrating',
      'no gauge', 'defective gauge', 'gauge defective'
    ],
    'Relief valve': [
      'relief', 'reliefs',
      'valve', 'valves', 'valved', 'valving',
      'safety valve', 'safety valves',
      'prv', 'p.r.v.', 'pressure relief valve',
      'no relief valve', 'blocked', 'blocking'
    ],
    'Procedure missing': [
      'procedure', 'procedures', 'procedur',
      'method', 'methods',
      'test procedure', 'test procedures',
      'no procedure', 'missing procedure'
    ],
    'Equipment inspection': [
      'inspection', 'inspections', 'inspected', 'inspecting', 'inpection',
      'check', 'checks', 'checked', 'checking',
      'condition', 'conditions', 'conditioned',
      'defect', 'defects', 'defective',
      'not inspected', 'uninspected'
    ],
    'Communication': [
      'communication', 'communications', 'communicated', 'communicating',
      'radio', 'radios',
      'contact', 'contacts', 'contacted', 'contacting',
      'no communication', 'lost contact'
    ],
    'PPE missing': [
      'ppe', 'p.p.e.',
      'face shield', 'face shields', 'faceshield',
      'protection', 'protections', 'protected',
      'no ppe', 'missing ppe', 'ppe missing'
    ],
    'Competent person': [
      'competent', 'competency', 'competant',
      'trained', 'untrained', 'training',
      'authorized', 'authorised', 'unauthorized', 'unauthorised',
      'qualified', 'unqualified',
      'not competent', 'incompetent'
    ],
    'Documentation': [
      'documentation', 'documented', 'documenting',
      'certificate', 'certificates', 'certificated', 'certificat',
      'record', 'records', 'recorded', 'recording',
      'no documentation', 'missing record', 'missing documentation'
    ]
  },

  // 23. Working in Heat
  'Working in Heat': {
    'Hydration issue': [
      'hydration', 'hydrated', 'hydrating',
      'water', 'waters', 'watered',
      'drinking', 'drink', 'drinks', 'drank',
      'dehydration', 'dehydrated',
      'not drinking', 'no water', 'water missing'
    ],
    'Rest breaks missing': [
      'rest', 'rests', 'rested', 'resting',
      'break', 'breaks', 'breaking',
      'cool down', 'cooling down', 'cooled down',
      'shade', 'shaded', 'shading',
      'no rest', 'no break', 'missing break'
    ],
    'Shade/shelter missing': [
      'shade', 'shaded', 'shading', 'shady',
      'shelter', 'sheltered', 'sheltering', 'shelters',
      'canopy', 'canopies',
      'cover', 'covers', 'covered', 'covering',
      'no shade', 'no shelter', 'shade missing'
    ],
    'Work schedule': [
      'schedule', 'schedules', 'scheduled', 'scheduling',
      'timing', 'timed', 'time',
      'shift', 'shifts', 'shifted',
      'cool hours', 'cooler hours',
      'midday', 'mid-day', 'peak heat'
    ],
    'Heat stress signs': [
      'heat stress', 'heat-stress',
      'symptom', 'symptoms', 'symptomatic',
      'dizzy', 'dizziness', 'dizzied',
      'fatigue', 'fatigued', 'fatiguing',
      'cramp', 'cramps', 'cramped', 'cramping',
      'exhaustion', 'exhausted'
    ],
    'Acclimatization': [
      'acclimatization', 'acclimatisation',
      'acclimatised', 'acclimatized', 'acclimated',
      'new worker', 'new workers',
      'not acclimatized', 'not acclimatised', 'unacclimatized'
    ],
    'Buddy system': [
      'buddy', 'buddies', 'buddied',
      'monitor', 'monitors', 'monitored', 'monitoring',
      'watch', 'watched', 'watching',
      'alone', 'working alone', 'lone working',
      'no buddy', 'without buddy'
    ],
    'Cooling measures': [
      'cooling', 'cooled', 'cool',
      'fan', 'fans', 'fanning',
      'mist', 'mists', 'misting', 'misted',
      'ice', 'iced', 'icing',
      'cooling vest', 'cooling vests', 'cool down'
    ],
    'PPE suitability': [
      'ppe', 'p.p.e.',
      'clothing', 'clothed', 'clothes',
      'breathable', 'breathing',
      'light', 'lighter', 'lightweight',
      'heavy ppe', 'hot ppe', 'inappropriate ppe'
    ],
    'Emergency response': [
      'emergency', 'emergencies', 'emergancy',
      'first aid', 'first-aid', 'firstaid',
      'medical', 'medically',
      'response', 'responses', 'responded', 'responding',
      'heat emergency'
    ]
  },

  // 24. Radiation
  'Radiation': {
    'Barrier missing': [
      'barrier', 'barriers', 'barriered',
      'shielding', 'shielded', 'shield', 'shields',
      'lead', 'lead shielding',
      'no barrier', 'missing shield', 'shield missing'
    ],
    'Signage missing': [
      'sign', 'signs', 'signed', 'signing', 'signage',
      'warning', 'warnings', 'warned',
      'radiation sign', 'radiation signs',
      'trefoil', 'no sign', 'missing sign', 'sign missing'
    ],
    'Dosimeter missing': [
      'dosimeter', 'dosimeters', 'dosimetry',
      'badge', 'badges', 'badged',
      'monitoring', 'monitored', 'monitor',
      'tld', 't.l.d.',
      'no dosimeter', 'not worn', 'dosimeter missing'
    ],
    'Exclusion zone': [
      'exclusion', 'exclusion zone', 'exclusion zones',
      'zone', 'zones', 'zoned', 'zoning',
      'controlled area', 'controlled areas',
      'restricted', 'restriction', 'restricted area'
    ],
    'Permit missing': [
      'permit', 'permits', 'permitted', 'permitting',
      'authorization', 'authorisation', 'authorized', 'authorised',
      'license', 'licenses', 'licensed', 'licence',
      'no permit', 'without permit', 'permit missing'
    ],
    'Source security': [
      'source', 'sources',
      'sealed source', 'sealed sources',
      'secure', 'secured', 'securing', 'unsecured',
      'storage', 'stored', 'storing',
      'source security', 'radioactive source'
    ],
    'Competent person': [
      'rpa', 'r.p.a.', 'radiation protection adviser',
      'rps', 'r.p.s.', 'radiation protection supervisor',
      'competent', 'competency', 'competant',
      'trained', 'untrained', 'training',
      'authorized', 'authorised', 'radiation protection'
    ],
    'Emergency plan': [
      'emergency', 'emergencies', 'emergancy',
      'plan', 'plans', 'planned', 'planning',
      'response', 'responses', 'responded', 'responding',
      'incident', 'incidents',
      'emergency plan', 'emergency response'
    ],
    'PPE missing': [
      'ppe', 'p.p.e.',
      'lead apron', 'lead aprons',
      'protection', 'protections', 'protected',
      'no ppe', 'missing ppe', 'ppe missing'
    ],
    'Exposure monitoring': [
      'exposure', 'exposures', 'exposed', 'exposing',
      'monitoring', 'monitored', 'monitor',
      'limit', 'limits', 'limited', 'limiting',
      'dose', 'doses', 'dosed', 'dosing',
      'exposure limit', 'dose limit'
    ]
  },

  // 25. Stored Energy
  'Stored Energy': {
    'LOTO missing': [
      'loto', 'lo/to', 'lototo',
      'lockout', 'lockouts', 'locked out', 'lock out', 'lock-out',
      'tagout', 'tagouts', 'tagged out', 'tag out', 'tag-out',
      'no lockout', 'missing lockout'
    ],
    'Verification missing': [
      'verify', 'verified', 'verifying', 'verification',
      'zero energy', 'zero-energy',
      'test', 'tests', 'tested', 'testing',
      'confirmed', 'confirm', 'confirming',
      'not verified', 'unverified'
    ],
    'Residual energy': [
      'residual', 'residuals',
      'stored', 'store', 'storing',
      'pressure', 'pressures', 'pressured', 'pressurized',
      'spring', 'springs', 'sprung',
      'residual energy', 'not released', 'unreleased'
    ],
    'Isolation point': [
      'isolation', 'isolations', 'isolated', 'isolating',
      'point', 'points',
      'valve', 'valves', 'valved',
      'switch', 'switches', 'switched',
      'isolation point', 'not isolated', 'unisolated'
    ],
    'Bleeding/venting': [
      'bleed', 'bleeds', 'bled', 'bleeding',
      'vent', 'vents', 'vented', 'venting',
      'drain', 'drains', 'drained', 'draining',
      'release', 'releases', 'released', 'releasing',
      'not bled', 'not vented', 'not drained'
    ],
    'Procedure missing': [
      'procedure', 'procedures', 'procedur',
      'isolation procedure', 'isolation procedures',
      'method', 'methods',
      'no procedure', 'missing procedure'
    ],
    'Training issue': [
      'training', 'trained', 'untrained', 'trainer',
      'competent', 'incompetent', 'competency', 'competant',
      'awareness', 'aware',
      'not trained', 'no training'
    ],
    'Permit missing': [
      'permit', 'permits', 'permitted', 'permitting',
      'ptw', 'isolation permit',
      'no permit', 'without permit', 'permit missing'
    ],
    'Multiple energy': [
      'multiple', 'multiples',
      'energy source', 'energy sources',
      'various', 'varied',
      'different energy', 'multiple sources', 'multiple energies'
    ],
    'Re-energization': [
      're-energize', 're-energized', 'reenergize', 'reenergized',
      'restart', 'restarts', 'restarted', 'restarting',
      'unexpected start', 'unexpected startup',
      'premature', 'prematurely',
      'unexpected energization', 'accidental energization'
    ]
  },

  // 26. Biological Hazard
  'Biological Hazard': {
    'Contamination risk': [
      'contamination', 'contaminations', 'contaminated', 'contaminating',
      'infected', 'infecting', 'infection', 'infections',
      'biological', 'biologically',
      'bio-hazard', 'biohazard', 'bio hazard'
    ],
    'PPE missing': [
      'ppe', 'p.p.e.',
      'gloves', 'glove', 'gloving',
      'mask', 'masks', 'masked', 'masking',
      'gown', 'gowns', 'gowned', 'gowning',
      'no ppe', 'without ppe', 'missing ppe', 'ppe missing'
    ],
    'Waste disposal': [
      'waste', 'wastes', 'wasted', 'wasting',
      'disposal', 'disposed', 'disposing',
      'sharps', 'sharp', 'sharps bin',
      'biohazard waste', 'clinical waste', 'hazardous waste'
    ],
    'Hand hygiene': [
      'hand', 'hands', 'handed',
      'wash', 'washed', 'washing', 'washings',
      'hygiene', 'hygienic', 'unhygienic',
      'sanitize', 'sanitized', 'sanitizing', 'sanitise', 'sanitised',
      'handwashing', 'hand washing', 'hand hygiene'
    ],
    'Vaccination': [
      'vaccination', 'vaccinations', 'vaccinated', 'vaccinating',
      'vaccine', 'vaccines',
      'immunization', 'immunisation', 'immunized', 'immunised',
      'not vaccinated', 'unvaccinated', 'vaccination status'
    ],
    'Signage missing': [
      'sign', 'signs', 'signed', 'signing', 'signage',
      'warning', 'warnings', 'warned',
      'biohazard sign', 'biohazard signs',
      'no sign', 'missing sign', 'sign missing'
    ],
    'Training issue': [
      'training', 'trained', 'untrained', 'trainer',
      'awareness', 'aware',
      'not trained', 'no training', 'training missing'
    ],
    'Exposure incident': [
      'exposure', 'exposures', 'exposed', 'exposing',
      'incident', 'incidents',
      'needlestick', 'needle stick', 'needle-stick',
      'splash', 'splashed', 'splashing',
      'exposure incident'
    ],
    'Containment': [
      'containment', 'contained', 'containing',
      'isolation', 'isolated', 'isolating',
      'sealed', 'seal', 'sealing',
      'enclosed', 'enclose', 'enclosing',
      'no containment', 'uncontained'
    ],
    'Decontamination': [
      'decontamination', 'decontaminated', 'decontaminating',
      'disinfection', 'disinfected', 'disinfecting',
      'cleaning', 'cleaned', 'clean',
      'sterilization', 'sterilisation', 'sterilized', 'sterilised',
      'not decontaminated', 'undecontaminated'
    ]
  },

  // 27. Site Security
  'Site Security': {
    'Unauthorized access': [
      'unauthorized', 'unauthorised', 'unauthorized access',
      'access', 'accessed', 'accessing',
      'intruder', 'intruders', 'intrusion',
      'trespasser', 'trespassers', 'trespassing',
      'breach', 'breached', 'breaching',
      'entry', 'entered', 'entering', 'illegal entry'
    ],
    'Perimeter breach': [
      'perimeter', 'perimeters',
      'fence', 'fences', 'fenced', 'fencing',
      'hoarding', 'hoardings',
      'boundary', 'boundaries',
      'breach', 'breached', 'breaching',
      'gap', 'gaps', 'hole', 'holes', 'opening', 'openings'
    ],
    'Gate/access point': [
      'gate', 'gates', 'gated', 'gating',
      'access point', 'access points',
      'entry point', 'entry points',
      'checkpoint', 'checkpoints',
      'turnstile', 'turnstiles',
      'barrier', 'barriers', 'boom gate'
    ],
    'ID/badge issue': [
      'id', 'identification', 'id card', 'id cards',
      'badge', 'badges', 'badged', 'badging',
      'pass', 'passes', 'site pass',
      'credential', 'credentials',
      'no id', 'missing id', 'no badge', 'missing badge',
      'expired', 'invalid'
    ],
    'CCTV/surveillance': [
      'cctv', 'camera', 'cameras',
      'surveillance', 'monitoring',
      'security camera', 'security cameras',
      'not working', 'not functioning', 'blind spot', 'blind spots',
      'coverage', 'uncovered'
    ],
    'Security personnel': [
      'security', 'guard', 'guards', 'guarding',
      'security guard', 'security guards',
      'watchman', 'watchmen',
      'patrol', 'patrols', 'patrolled', 'patrolling',
      'manning', 'manned', 'unmanned',
      'absent', 'missing', 'not present'
    ],
    'Theft/loss': [
      'theft', 'thefts', 'stolen', 'stealing',
      'loss', 'losses', 'lost', 'losing',
      'missing', 'disappeared',
      'pilferage', 'pilfered',
      'material loss', 'equipment loss', 'tool loss'
    ],
    'Lighting issue': [
      'lighting', 'lighted', 'lit',
      'light', 'lights',
      'dark', 'darker', 'darkness',
      'visibility', 'poor visibility',
      'no light', 'inadequate lighting', 'insufficient lighting'
    ],
    'Signage/marking': [
      'sign', 'signs', 'signage', 'signed',
      'marking', 'markings', 'marked',
      'warning', 'warnings',
      'restricted area', 'restricted zone',
      'no entry', 'authorized personnel',
      'missing sign', 'no sign'
    ],
    'Documentation/log': [
      'documentation', 'documented', 'documenting',
      'log', 'logs', 'logged', 'logging',
      'register', 'registers', 'registered',
      'record', 'records', 'recorded',
      'visitor', 'visitors', 'visitor log',
      'entry log', 'access log', 'no record'
    ]
  },

  // 28. Explosives & Blasting
  'Explosives & Blasting': {
    'Blasting permit missing': [
      'permit', 'blasting permit', 'no permit', 'shot firing permit', 'authorization',
      'authorisation', 'approval', 'no approval', 'permission', 'without permit',
      'permit to blast', 'blast permit', 'missing permit', 'expired permit'
    ],
    'Shot firer competency': [
      'shot firer', 'blaster', 'competent', 'certified', 'qualification',
      'certificate', 'licensed', 'unlicensed', 'trained blaster', 'competency',
      'shot firing certificate', 'blasting license', 'not qualified', 'inexperienced'
    ],
    'Exclusion zone breach': [
      'exclusion zone', 'blast zone', 'clearance', 'barrier', 'perimeter',
      'danger zone', 'safe distance', 'blast radius', 'entered zone', 'breach',
      'too close', 'within zone', 'zone violation', 'exclusion area'
    ],
    'Misfire handling': [
      'misfire', 'failed to detonate', 'unexploded', 'dud', 'hang fire',
      'partial detonation', 'incomplete blast', 'failed shot', 'misfire procedure',
      'unexploded explosive', 'uxo', 'blind hole', 'socket'
    ],
    'Explosive storage issue': [
      'magazine', 'storage', 'segregation', 'temperature', 'humidity',
      'explosive store', 'detonator storage', 'incompatible storage', 'locked storage',
      'unlocked', 'storage condition', 'magazine security', 'inventory'
    ],
    'Detonator handling': [
      'detonator', 'initiator', 'blasting cap', 'primer', 'det',
      'electric detonator', 'non-electric', 'nonel', 'shock tube', 'detonating cord',
      'det cord', 'handling', 'transport', 'carrying detonator'
    ],
    'Blast warning failure': [
      'warning', 'siren', 'all clear', 'communication', 'blast signal',
      'horn', 'whistle', 'announcement', 'notification', 'no warning',
      'warning system', 'alert', 'pre-blast warning', 'post-blast'
    ],
    'Flyrock hazard': [
      'flyrock', 'flying rock', 'debris', 'stemming', 'overcharge',
      'ejection', 'projectile', 'rock throw', 'insufficient stemming', 'short stemming',
      'flyrock distance', 'impact', 'flyrock incident'
    ],
    'Ground vibration issue': [
      'vibration', 'ppv', 'seismic', 'monitoring', 'peak particle velocity',
      'ground shake', 'vibration damage', 'vibration limit', 'seismograph',
      'vibration monitoring', 'structure damage', 'crack', 'vibration complaint'
    ],
    'Timing/sequencing issue': [
      'timing', 'delay', 'sequence', 'circuit', 'initiation sequence',
      'delay pattern', 'timing error', 'wrong sequence', 'misfiring sequence',
      'overlap', 'simultaneous', 'burden', 'spacing'
    ]
  },

  // 29. Tools
  'Tools': {
    'Tool inspection': [
      'inspection', 'inspections', 'inspected', 'inspecting', 'inpection',
      'check', 'checks', 'checked', 'checking',
      'examined', 'examine', 'examining',
      'not inspected', 'uninspected', 'no inspection',
      'pre-use', 'pre use', 'preuse'
    ],
    'Defective tool': [
      'defective', 'defect', 'defects',
      'damaged', 'damage', 'damaging',
      'broken', 'broke', 'breaking',
      'faulty', 'fault', 'faults',
      'worn', 'worn out', 'wear',
      'cracked', 'crack', 'cracks'
    ],
    'Wrong tool use': [
      'wrong', 'incorrect', 'improper',
      'misuse', 'misused', 'misusing',
      'inappropriate', 'unsuitable',
      'wrong tool', 'incorrect tool', 'improper tool',
      'not suitable', 'not appropriate'
    ],
    'Tool storage': [
      'storage', 'stored', 'storing',
      'store', 'stores',
      'toolbox', 'tool box', 'tool boxes',
      'organized', 'organised', 'disorganized', 'disorganised',
      'unsecured', 'not secured', 'loose'
    ],
    'Power tool safety': [
      'power tool', 'power tools',
      'electric', 'electrical', 'electric tool',
      'cord', 'cords', 'cable', 'cables',
      'plug', 'plugs', 'plugged',
      'grinder', 'grinders', 'grinding',
      'drill', 'drills', 'drilling',
      'saw', 'saws', 'sawing', 'cutting'
    ],
    'Guard/safety device': [
      'guard', 'guards', 'guarded', 'guarding',
      'safety device', 'safety devices',
      'shield', 'shields', 'shielded',
      'missing guard', 'no guard', 'guard removed',
      'blade guard', 'wheel guard'
    ],
    'Hand tool hazard': [
      'hand tool', 'hand tools',
      'hammer', 'hammers', 'hammering',
      'screwdriver', 'screwdrivers',
      'wrench', 'wrenches', 'spanner', 'spanners',
      'pliers', 'plier',
      'chisel', 'chisels',
      'sharp', 'pointed', 'handle'
    ],
    'Tool competency': [
      'training', 'trained', 'untrained',
      'competent', 'competency', 'incompetent', 'competant',
      'qualified', 'unqualified',
      'authorized', 'authorised', 'unauthorized', 'unauthorised',
      'certification', 'certified', 'uncertified'
    ],
    'Tool housekeeping': [
      'housekeeping', 'house keeping',
      'scattered', 'scattering', 'lying',
      'left', 'leaving', 'unattended',
      'trip hazard', 'tripping',
      'clean', 'cleaning', 'tidy', 'untidy'
    ],
    'PPE for tools': [
      'ppe', 'p.p.e.',
      'gloves', 'glove', 'safety gloves',
      'goggles', 'goggle', 'safety glasses',
      'face shield', 'face shields',
      'ear protection', 'hearing protection',
      'no ppe', 'missing ppe', 'without ppe'
    ]
  }
}

/**
 * Detect root causes from description text
 * Returns the first matched root cause for a given hazard
 *
 * @param {string} description - The observation description text
 * @param {string} hazardName - The hazard category name
 * @returns {string|null} The matched root cause or null if no match
 */
export const detectRootCauses = (description, hazardName) => {
  if (!description || typeof description !== 'string') {
    return null
  }

  const rootCauses = HAZARD_ROOT_CAUSES[hazardName]
  if (!rootCauses) return null

  const lowerDesc = description.toLowerCase()
  const matches = []

  for (const [rootCause, keywords] of Object.entries(rootCauses)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        matches.push(rootCause)
        break // Only count once per root cause
      }
    }
  }

  return matches.length > 0 ? matches[0] : null // Return first match
}

/**
 * Detect all matching root causes from description text
 * Returns all matched root causes for a given hazard
 *
 * @param {string} description - The observation description text
 * @param {string} hazardName - The hazard category name
 * @returns {string[]} Array of matched root causes
 */
export const detectAllRootCauses = (description, hazardName) => {
  const rootCauses = HAZARD_ROOT_CAUSES[hazardName]
  if (!rootCauses) return []

  const lowerDesc = description.toLowerCase()
  const matches = []

  for (const [rootCause, keywords] of Object.entries(rootCauses)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        matches.push(rootCause)
        break // Only count once per root cause
      }
    }
  }

  return matches
}

/**
 * CONSOLIDATED FACTOR CATEGORIES
 * Maps each consolidated factor to its category for UI display
 */
export const CONSOLIDATED_FACTOR_CATEGORIES = {
  // Administrative/Management
  'Permit Issue': 'Planning & Procedures',
  'Planning Issue': 'Planning & Procedures',
  'Procedure Violation': 'Planning & Procedures',
  'No Risk Assessment': 'Planning & Procedures',
  'Poor Planning': 'Planning & Procedures',
  'Method Statement Issue': 'Planning & Procedures',

  // Equipment
  'Defective Equipment': 'Equipment Management',
  'Pre-Use Check Missed': 'Equipment Management',
  'Equipment Misuse': 'Equipment Management',
  'Wrong Equipment': 'Equipment Management',
  'Equipment Not Available': 'Equipment Management',
  'Maintenance Issue': 'Equipment Management',

  // PPE
  'PPE Not Worn': 'PPE',
  'PPE Defective': 'PPE',
  'Wrong PPE': 'PPE',
  'PPE Not Available': 'PPE',

  // Fall Protection
  'Fall Protection Issue': 'Fall Protection',
  'Scaffold Issue': 'Fall Protection',
  'Ladder Issue': 'Fall Protection',
  'Edge Protection Issue': 'Fall Protection',

  // Human Factors
  'Rushing/Time Pressure': 'Human Factors',
  'Complacency/Shortcut': 'Human Factors',
  'Fatigue': 'Human Factors',
  'Distraction/Inattention': 'Human Factors',
  'Overconfidence': 'Human Factors',
  'Improper Body Position': 'Human Factors',

  // Training & Competency
  'Lack of Competency': 'Training & Competency',
  'Insufficient Training': 'Training & Competency',
  'No Induction': 'Training & Competency',
  'Invalid Certification': 'Training & Competency',
  'Language Barrier': 'Training & Competency',

  // Supervision
  'Lack of Supervision': 'Supervision',
  'Contractor Management': 'Organizational',
  'Poor Safety Culture': 'Organizational',
  'Production Pressure': 'Organizational',
  'Resource Constraints': 'Organizational',

  // Communication
  'Poor Communication': 'Communication',
  'Inadequate Warning': 'Communication',
  'No Toolbox Talk': 'Communication',
  'Signage Issue': 'Communication',

  // Environmental
  'Adverse Weather': 'Environmental',
  'Poor Visibility': 'Environmental',
  'Noise': 'Environmental',
  'Congested Workspace': 'Environmental',
  'Poor Lighting': 'Environmental',
  'Housekeeping Issue': 'Environmental',

  // Lifting & Rigging
  'Lifting Plan Issue': 'Lifting & Rigging',
  'Rigging Issue': 'Lifting & Rigging',
  'Load Issue': 'Lifting & Rigging',

  // Hazardous Materials
  'Chemical Handling Issue': 'Hazardous Materials',
  'COSHH Issue': 'Hazardous Materials',
  'Spill/Leak': 'Hazardous Materials',

  // Electrical
  'Electrical Safety Issue': 'Electrical',
  'Isolation Issue': 'Electrical',

  // Excavation
  'Excavation Safety Issue': 'Excavation',
  'Ground Conditions': 'Excavation',

  // Fire
  'Fire Safety Issue': 'Fire Safety',
  'Hot Work Issue': 'Fire Safety',

  // Traffic/Vehicles
  'Traffic Management Issue': 'Traffic Management',
  'Vehicle Issue': 'Traffic Management',

  // Access
  'Access Issue': 'Access',
  'Unauthorized Access': 'Access'
}

/**
 * CONSOLIDATED FACTOR KEYWORDS
 * Direct keyword detection for all 49 consolidated factors
 * Each factor has comprehensive keywords for accurate detection
 */
export const CONSOLIDATED_FACTOR_KEYWORDS = {
  // ============ ADMINISTRATIVE/MANAGEMENT ============
  'Permit Issue': [
    'permit', 'permits', 'ptw', 'no permit', 'without permit', 'permit missing',
    'permit expired', 'work permit', 'hot work permit', 'excavation permit',
    'confined space permit', 'lifting permit', 'electrical permit', 'height permit',
    'permit not obtained', 'permit not issued', 'permit conditions', 'permit scope',
    'tmp', 'traffic management plan', 'permit to work', 'permit violation'
  ],

  'Planning Issue': [
    'risk assessment', 'no risk assessment', 'rams', 'method statement', 'jsa', 'jha',
    'no plan', 'poor planning', 'unplanned', 'procedure', 'sop', 'lift plan',
    'design', 'calculation', 'specification', 'work plan', 'safe system',
    'task analysis', 'hazard not identified', 'scope creep', 'ad hoc', 'reactive',
    'not planned', 'planning failure', 'journey management', 'journey plan'
  ],

  'Documentation Issue': [
    'documentation', 'document', 'record', 'register', 'paperwork', 'log',
    'sds', 'msds', 'safety data sheet', 'data sheet', 'certificate', 'certification',
    'documentation missing', 'no documentation', 'records missing', 'not documented'
  ],

  'Inspection Issue': [
    'inspection', 'inspected', 'not inspected', 'pre-use check', 'preuse', 'pre use',
    'daily check', 'checklist', 'defect', 'defective', 'vehicle inspection',
    'equipment inspection', 'tool inspection', 'crane inspection', 'testing',
    'verification', 'verified', 'audit', 'monitoring', 'not checked', 'uninspected'
  ],

  'Communication Issue': [
    'communication', 'miscommunication', 'not communicated', 'not informed',
    'toolbox talk', 'tbt', 'briefing', 'safety briefing', 'not briefed',
    'handover', 'shift handover', 'poor handover', 'warning', 'not warned',
    'signal', 'no signal', 'radio', 'unclear', 'misunderstood', 'language barrier'
  ],

  'Supervision Issue': [
    'supervision', 'supervisor', 'unsupervised', 'no supervisor', 'foreman',
    'no foreman', 'oversight', 'no oversight', 'unattended', 'left alone',
    'working alone', 'lone worker', 'coordinator', 'attendant', 'watch',
    'safety officer', 'charge hand', 'team leader', 'leadership', 'monitoring'
  ],

  'Signage Issue': [
    'sign', 'signage', 'warning sign', 'no sign', 'missing sign', 'label',
    'labeling', 'unlabeled', 'marking', 'not marked', 'caution sign',
    'danger sign', 'safety sign', 'traffic sign', 'hazard sign'
  ],

  'Training & Competency': [
    'training', 'trained', 'untrained', 'not trained', 'competent', 'incompetent',
    'competency', 'qualified', 'unqualified', 'certified', 'uncertified',
    'certification', 'license', 'licence', 'induction', 'orientation',
    'refresher', 'awareness', 'skill', 'unskilled', 'experience', 'inexperienced',
    'new worker', 'first time', 'knowledge', 'language', 'understand'
  ],

  // ============ PEOPLE/WELFARE ============
  'PPE Issue': [
    'ppe', 'personal protective', 'harness', 'lanyard', 'helmet', 'hard hat',
    'gloves', 'goggles', 'safety glasses', 'face shield', 'respirator', 'mask',
    'ear plug', 'ear muff', 'hearing protection', 'high vis', 'hi vis', 'vest',
    'safety boot', 'safety shoe', 'footwear', 'life jacket', 'pfd',
    'fall protection', 'fall arrest', 'not wearing', 'ppe missing', 'no ppe',
    'rpe', 'breathing apparatus', 'scba', 'fit test', 'clean shaven'
  ],

  'Welfare Issue': [
    'welfare', 'drinking water', 'potable water', 'toilet', 'restroom', 'washroom',
    'rest area', 'break area', 'canteen', 'first aid', 'medical', 'shelter',
    'shade', 'food', 'hygiene', 'sanitation', 'cleanliness', 'overcrowding'
  ],

  'Pedestrian Safety': [
    'pedestrian', 'walkway', 'footpath', 'crossing', 'segregation',
    'pedestrian route', 'foot traffic', 'walking', 'pedestrian interface'
  ],

  'Security Issue': [
    'security', 'unauthorized', 'unauthorised', 'access control', 'badge', 'id card',
    'perimeter', 'gate', 'theft', 'intruder', 'cctv', 'surveillance', 'trespass'
  ],

  // ============ FALL HAZARDS ============
  'Fall Protection Issue': [
    'guardrail', 'guard rail', 'handrail', 'safety net', 'toe board', 'toeboard',
    'kick board', 'opening', 'floor opening', 'hole', 'uncovered', 'unprotected edge',
    'edge protection', 'fall from height', 'unguarded', 'mid rail', 'top rail',
    'perimeter protection', 'void', 'penetration', 'shaft'
  ],

  'Scaffold Issue': [
    'scaffold', 'scaffolding', 'scaffold tag', 'incomplete scaffold', 'scaffold board',
    'scaffold plank', 'putlog', 'tube and fitting', 'scaffold erection',
    'scaffold dismantling', 'bracing', 'brace', 'connection', 'foundation',
    'base plate', 'sole board', 'scaffold defect', 'striking'
  ],

  'Ladder/Stairs Issue': [
    'ladder', 'step ladder', 'extension ladder', 'a-frame', 'ladder secured',
    'ladder inspection', 'climbing', 'stair', 'stairs', 'stairway', 'staircase',
    'step', 'handrail', 'nosing', 'damaged ladder', 'defective ladder'
  ],

  // ============ ELECTRICAL/ENERGY ============
  'Electrical Hazard': [
    'electrical', 'electric', 'electricity', 'electrocution', 'shock',
    'live', 'energized', 'energised', 'loto', 'lockout', 'tagout', 'lock out',
    'isolation', 'isolated', 'de-energize', 'exposed wire', 'wiring', 'cable',
    'panel', 'enclosure', 'grounding', 'earthing', 'residual energy',
    're-energization', 'multiple energy', 'stored energy'
  ],

  // ============ PHYSICAL HAZARDS ============
  'Sharp/Protruding Hazard': [
    'rebar', 're-bar', 'reinforcement bar', 'exposed rebar', 'uncapped',
    'mushroom cap', 'sharp', 'sharp edge', 'pointed', 'protruding', 'protrusion',
    'sticking out', 'nail', 'screw', 'wire', 'burr', 'jagged', 'cut hazard'
  ],

  'Struck-by Hazard': [
    'struck by', 'struck-by', 'hit by', 'falling object', 'dropped', 'overhead',
    'overhead hazard', 'swing', 'swinging', 'impact', 'flying debris'
  ],

  'Machine Guarding Issue': [
    'guard', 'guarding', 'machine guard', 'safety guard', 'pinch point',
    'pinch', 'crush', 'crushing', 'rotating', 'moving parts', 'nip point',
    'caught between', 'caught in', 'emergency stop', 'e-stop', 'interlock'
  ],

  'Slip/Trip Hazard': [
    'slip', 'slippery', 'trip', 'tripping', 'fall', 'wet floor', 'wet surface',
    'spill', 'puddle', 'uneven', 'uneven surface', 'pothole', 'crack',
    'debris', 'obstacle', 'trailing cable', 'hose', 'mat', 'carpet', 'rug'
  ],

  'Structural Issue': [
    'collapse', 'structural', 'unstable', 'stability', 'cave-in', 'cave in',
    'shoring', 'trench box', 'trench shield', 'soil', 'ground movement',
    'spoil', 'stockpile', 'excavation wall', 'retaining', 'underground',
    'utility', 'buried', 'water ingress', 'flooding', 'dewatering'
  ],

  // ============ EQUIPMENT/MATERIALS ============
  'Storage Issue': [
    'storage', 'stored', 'storing', 'stacking', 'stacked', 'pile', 'piled',
    'stockpile', 'laydown', 'material storage', 'chemical storage',
    'flammable storage', 'cylinder storage', 'incompatible', 'segregation',
    'containment', 'bund', 'secondary containment', 'spill containment'
  ],

  'Lifting/Rigging Issue': [
    'rigging', 'sling', 'shackle', 'hook', 'lifting gear', 'chain', 'wire rope',
    'webbing', 'lift plan', 'overload', 'swl', 'safe working load', 'capacity',
    'tag line', 'tagline', 'load', 'load security', 'load stability', 'center of gravity',
    'crane', 'hoist', 'winch', 'rigger'
  ],

  'Equipment Issue': [
    'equipment', 'defect', 'defective', 'fault', 'faulty', 'broken', 'damaged',
    'malfunction', 'not working', 'out of order', 'maintenance', 'repair',
    'worn', 'deteriorated', 'corroded', 'equipment failure'
  ],

  'Tool Safety Issue': [
    'tool', 'hand tool', 'power tool', 'wrong tool', 'improper tool',
    'tool condition', 'tool inspection', 'tool storage', 'tool housekeeping',
    'damaged tool', 'defective tool', 'grinder', 'drill', 'saw', 'cutter'
  ],

  'Vehicle/Plant Safety': [
    'vehicle', 'plant', 'mobile plant', 'forklift', 'excavator', 'crane',
    'truck', 'dumper', 'loader', 'banksman', 'spotter', 'signaller',
    'reversing', 'reverse', 'backing', 'speed', 'speeding', 'seatbelt',
    'seat belt', 'phone', 'mobile phone',
    'license', 'driving', 'overtaking', 'tailgating', 'following distance'
  ],

  // ============ WORK ENVIRONMENT ============
  'Barrier/Zone Issue': [
    'barrier', 'barricade', 'exclusion zone', 'danger zone', 'restricted area',
    'demarcation', 'cone', 'delineator', 'tape', 'fencing', 'hoarding',
    'swing radius', 'drop zone', 'no entry', 'keep out', 'perimeter'
  ],

  'Housekeeping': [
    'housekeeping', 'clean', 'cleaning', 'tidy', 'untidy', 'mess', 'messy',
    'debris', 'rubbish', 'trash', 'waste', 'clutter', 'scattered', 'disorganized',
    'cable management', 'trailing cable', 'hose across', 'obstruction'
  ],

  'Ventilation Issue': [
    'ventilation', 'ventilated', 'fume', 'smoke', 'extraction', 'exhaust',
    'air quality', 'fresh air', 'blower', 'fan', 'dust', 'dusty', 'particulate',
    'airborne', 'welding fume', 'local exhaust', 'lev'
  ],

  'Access/Egress Issue': [
    'access', 'egress', 'entry', 'exit', 'emergency exit', 'escape route',
    'means of access', 'safe access', 'access point', 'blocked', 'obstructed',
    'ladder access', 'ramp', 'stairway access', 'route blocked'
  ],

  'Heat/Weather Issue': [
    'heat', 'hot', 'heat stress', 'heat stroke', 'hydration', 'water',
    'shade', 'shelter', 'rest break', 'cooling', 'temperature', 'weather',
    'wind', 'windy', 'rain', 'storm', 'visibility', 'lighting', 'dark',
    'cold', 'freezing', 'humidity', 'dust storm', 'sandstorm'
  ],

  'Environmental Issue': [
    'spill', 'contamination', 'pollution', 'leak', 'leakage', 'discharge',
    'waste disposal', 'hazardous waste', 'chemical spill', 'oil spill',
    'water pollution', 'soil contamination', 'runoff', 'drainage',
    'recycling', 'segregation', 'environmental', 'wildlife', 'vegetation'
  ],

  // ============ SPECIAL HAZARDS ============
  'Fire/Hot Work Issue': [
    'fire', 'fire extinguisher', 'extinguisher', 'fire watch', 'firewatch',
    'hot work', 'welding', 'cutting', 'grinding', 'spark', 'flame',
    'flammable', 'combustible', 'ignition', 'fire alarm', 'smoke detector',
    'assembly point', 'evacuation', 'fire door', 'fire exit', 'welding screen',
    'fire blanket', 'flash', 'burn'
  ],

  'Confined Space Issue': [
    'confined space', 'confined', 'enclosed space', 'tank', 'vessel', 'pit',
    'manhole', 'chamber', 'sewer', 'atmospheric', 'gas test', 'gas monitor',
    'oxygen', 'o2', 'lel', 'h2s', 'rescue', 'retrieval', 'attendant',
    'entry permit', 'standby', 'top man', 'hole watch'
  ],

  'Pressure System Issue': [
    'pressure', 'pressurized', 'pressurised', 'compressed', 'relief valve',
    'pressure vessel', 'cylinder', 'gas cylinder', 'air receiver',
    'hydraulic', 'pneumatic', 'bleed', 'vent', 'depressurize'
  ],

  'Biological Hazard': [
    'biological', 'biohazard', 'infection', 'infectious', 'bacteria', 'virus',
    'pathogen', 'contamination', 'hygiene', 'hand washing', 'sanitizer',
    'vaccination', 'needle', 'sharps', 'blood', 'bodily fluid'
  ],

  'Marine Safety Issue': [
    'marine', 'water', 'drowning', 'life jacket', 'life ring', 'buoy',
    'boat', 'vessel', 'jetty', 'pier', 'dock', 'current', 'tide',
    'buddy system', 'man overboard', 'rescue boat'
  ],

  'Radiation Issue': [
    'radiation', 'radioactive', 'x-ray', 'xray', 'gamma', 'dosimeter',
    'exposure limit', 'shielding', 'controlled area', 'supervised area',
    'source', 'isotope', 'radiography'
  ],

  'Emergency Response Issue': [
    'emergency', 'emergency plan', 'emergency response', 'evacuation',
    'muster point', 'assembly', 'drill', 'first aid', 'medical emergency',
    'rescue', 'emergency contact', 'emergency number'
  ],

  // ============ HUMAN FACTORS ============
  'Human Factors - Complacency': [
    'complacent', 'complacency', 'shortcut', 'cutting corners', 'bypass',
    'skip', 'skipped', 'routine', 'always done', 'habit', 'careless',
    'negligent', 'reckless', 'ignored', 'disregard', 'took risk', 'lazy'
  ],

  'Human Factors - Distraction': [
    'distracted', 'distraction', 'phone', 'mobile', 'texting', 'talking',
    'inattentive', 'not paying attention', 'lost focus', 'unfocused',
    'multitasking', 'unaware', 'didnt notice', 'overlooked', 'missed'
  ],

  'Human Factors - Rushing': [
    'rushed', 'rushing', 'hurry', 'hurried', 'too fast', 'speeding',
    'haste', 'no time', 'asap', 'urgent'
  ],

  'Human Factors - Fatigue': [
    'fatigue', 'fatigued', 'tired', 'exhausted', 'drowsy', 'sleepy',
    'long shift', 'overtime', 'night shift', 'rest break', 'working hours',
    'consecutive', 'lack of sleep', 'overworked', 'weary'
  ],

  'Human Factors - Overconfidence': [
    'overconfident', 'assumed', 'assumption', 'thought it was', 'expected',
    'underestimate', 'misjudge', 'easy task', 'simple task', 'no big deal',
    'experienced', 'expert', 'years of experience', 'dont need'
  ],

  'Human Factors - Body Position': [
    'posture', 'awkward position', 'bending', 'twisting', 'overreaching',
    'line of fire', 'wrong position', 'too close', 'ergonomic', 'strain',
    'manual handling', 'lifting', 'carrying', 'stooping'
  ],

  // ============ ORGANIZATIONAL ============
  'Organizational - Pressure': [
    'production pressure', 'target', 'deadline', 'schedule pressure',
    'must finish', 'behind schedule', 'delayed', 'milestone', 'kpi',
    'management pressure', 'client pressure', 'cost pressure'
  ],

  'Organizational - Resources': [
    'understaffed', 'short staffed', 'not enough workers', 'manpower',
    'resource shortage', 'insufficient', 'budget', 'cost cutting',
    'skeleton crew', 'reduced workforce', 'limited resources'
  ],

  'Organizational - Culture': [
    'everyone does it', 'common practice', 'normal practice', 'accepted',
    'tolerated', 'not enforced', 'always been done', 'culture',
    'attitude', 'mindset', 'peer pressure', 'safety culture'
  ],

  'Organizational - Contractor': [
    'contractor', 'subcontractor', 'sub-contractor', 'third party',
    'interface', 'coordination', 'multi-contractor', 'responsibility',
    'accountability', 'contractor management'
  ]
}

/**
 * FACTOR CONSOLIDATION MAPPING
 * Maps specific/redundant factor names to general categories
 * This reduces fragmentation and provides clearer insights
 * ~30 consolidated categories for actionable analysis
 */
const FACTOR_CONSOLIDATION = {
  // ============ TRAINING & COMPETENCY ============
  'Training/competency': 'Training & Competency',
  'Competency issue': 'Training & Competency',
  'Rigger competency': 'Training & Competency',
  'Operator competency': 'Training & Competency',
  'Competent person': 'Training & Competency',
  'Training issue': 'Training & Competency',
  'Insufficient Training': 'Training & Competency',
  'Lack of Competency': 'Training & Competency',
  'No Induction': 'Training & Competency',
  'Invalid Certification': 'Training & Competency',
  'Training missing': 'Training & Competency',
  'Language Barrier': 'Training & Competency',
  'Tool competency': 'Training & Competency',
  'License issue': 'Training & Competency',

  // ============ PERMIT ISSUE ============
  'No permit': 'Permit Issue',
  'Permit issue': 'Permit Issue',
  'Permit missing': 'Permit Issue',
  'Working without permit': 'Permit Issue',
  'Permit/compliance': 'Permit Issue',
  'No Permit to Work': 'Permit Issue',
  'TMP compliance': 'Permit Issue',

  // ============ PPE ISSUE ============
  'PPE deficiency': 'PPE Issue',
  'PPE not worn': 'PPE Issue',
  'PPE condition': 'PPE Issue',
  'Missing fall protection': 'PPE Issue',
  'PPE missing': 'PPE Issue',
  'PPE suitability': 'PPE Issue',
  'PPE for tools': 'PPE Issue',
  'Hearing protection missing': 'PPE Issue',
  'RPE not worn': 'PPE Issue',
  'RPE wrong type': 'PPE Issue',
  'Fit test missing': 'PPE Issue',
  'Clean shaven': 'PPE Issue',
  'Life jacket missing': 'PPE Issue',
  'Footwear issue': 'PPE Issue',
  'Exposure control': 'PPE Issue',

  // ============ INSPECTION ISSUE ============
  'Vehicle inspection': 'Inspection Issue',
  'Crane inspection': 'Inspection Issue',
  'Inspection missing': 'Inspection Issue',
  'Inspection not done': 'Inspection Issue',
  'Testing not done': 'Inspection Issue',
  'Inadequate Monitoring': 'Inspection Issue',
  'Equipment inspection': 'Inspection Issue',
  'Tool inspection': 'Inspection Issue',
  'Pre-Use Check Missed': 'Inspection Issue',
  'Verification missing': 'Inspection Issue',
  'Audiometric testing': 'Inspection Issue',

  // ============ COMMUNICATION ISSUE ============
  'Communication': 'Communication Issue',
  'Communication failure': 'Communication Issue',
  'Poor Communication': 'Communication Issue',
  'Poor Handover': 'Communication Issue',
  'No Toolbox Talk': 'Communication Issue',
  'Inadequate Warning': 'Communication Issue',
  'Start-up warning': 'Communication Issue',

  // ============ SUPERVISION ISSUE ============
  'Lack of Supervision': 'Supervision Issue',
  'Poor Leadership': 'Supervision Issue',
  'Coordinator missing': 'Supervision Issue',
  'Attendant missing': 'Supervision Issue',

  // ============ BARRIER/ZONE ISSUE ============
  'Exclusion zone breach': 'Barrier/Zone Issue',
  'Exclusion zone missing': 'Barrier/Zone Issue',
  'Missing barriers': 'Barrier/Zone Issue',
  'Barrier missing': 'Barrier/Zone Issue',
  'Edge protection': 'Barrier/Zone Issue',
  'Exclusion zone': 'Barrier/Zone Issue',
  'Zone demarcation': 'Barrier/Zone Issue',
  'Perimeter breach': 'Barrier/Zone Issue',

  // ============ HOUSEKEEPING ============
  'Housekeeping issue': 'Housekeeping',
  'Housekeeping': 'Housekeeping',
  'Debris/waste': 'Housekeeping',
  'Material scattered': 'Housekeeping',
  'Poor organization': 'Housekeeping',
  'Spillage': 'Housekeeping',
  'Walkway obstruction': 'Housekeeping',
  'Cable management': 'Housekeeping',
  'Tool housekeeping': 'Housekeeping',
  'Debris on floor': 'Housekeeping',
  'Trailing cables': 'Housekeeping',

  // ============ VENTILATION ISSUE ============
  'Ventilation issue': 'Ventilation Issue',
  'Air monitoring': 'Ventilation Issue',
  'Dust/emission': 'Ventilation Issue',
  'Fume exposure': 'Ventilation Issue',
  'Dust exposure': 'Ventilation Issue',

  // ============ ACCESS/EGRESS ISSUE ============
  'Inadequate access': 'Access/Egress Issue',
  'Entry/exit issue': 'Access/Egress Issue',
  'Access/egress': 'Access/Egress Issue',
  'Emergency exit blocked': 'Access/Egress Issue',
  'Gate/access point': 'Access/Egress Issue',
  'Crossing point': 'Access/Egress Issue',

  // ============ PLANNING ISSUE ============
  'Poor Planning': 'Planning Issue',
  'No Risk Assessment': 'Planning Issue',
  'Procedure Violation': 'Planning Issue',
  'Lift plan issue': 'Planning Issue',
  'Design issue': 'Planning Issue',
  'Procedure missing': 'Planning Issue',
  'SOP missing': 'Planning Issue',
  'Journey management': 'Planning Issue',

  // ============ FALL PROTECTION ============
  'Guardrail missing/damaged': 'Fall Protection Issue',
  'Safety net missing': 'Fall Protection Issue',
  'Missing toe board': 'Fall Protection Issue',
  'Unprotected opening': 'Fall Protection Issue',
  'Missing floor cover': 'Fall Protection Issue',

  // ============ SCAFFOLD ISSUE ============
  'Scaffold deficiency': 'Scaffold Issue',
  'Bracing missing': 'Scaffold Issue',
  'Connection defect': 'Scaffold Issue',
  'Foundation issue': 'Scaffold Issue',
  'Striking issue': 'Scaffold Issue',

  // ============ LADDER/STAIRS ============
  'Unsafe ladder use': 'Ladder/Stairs Issue',
  'Stairway hazard': 'Ladder/Stairs Issue',

  // ============ ELECTRICAL HAZARD ============
  'Live work exposure': 'Electrical Hazard',
  'Missing LOTO': 'Electrical Hazard',
  'LOTO missing': 'Electrical Hazard',
  'Lockout missing': 'Electrical Hazard',
  'Exposed wiring': 'Electrical Hazard',
  'Panel/enclosure open': 'Electrical Hazard',
  'Grounding issue': 'Electrical Hazard',
  'Isolation issue': 'Electrical Hazard',
  'Multiple energy': 'Electrical Hazard',
  'Re-energization': 'Electrical Hazard',
  'Residual energy': 'Electrical Hazard',
  'Electrical issue': 'Electrical Hazard',
  'Isolation point': 'Electrical Hazard',

  // ============ SHARP/PROTRUDING HAZARD ============
  'Exposed rebar': 'Sharp/Protruding Hazard',
  'Sharp edges/objects': 'Sharp/Protruding Hazard',
  'Protruding hazard': 'Sharp/Protruding Hazard',

  // ============ STRUCK-BY HAZARD ============
  'Struck by hazard': 'Struck-by Hazard',

  // ============ PINCH/CRUSH HAZARD ============
  'Pinch/crush point': 'Machine Guarding Issue',
  'Pinch point': 'Machine Guarding Issue',
  'Rotating parts': 'Machine Guarding Issue',
  'Guard missing': 'Machine Guarding Issue',
  'Guard/safety device': 'Machine Guarding Issue',
  'Emergency stop': 'Machine Guarding Issue',

  // ============ MATERIAL/STORAGE ISSUE ============
  'Material storage': 'Storage Issue',
  'Storage issue': 'Storage Issue',
  'Stacking issue': 'Storage Issue',
  'Chemical storage': 'Storage Issue',
  'Flammable storage': 'Storage Issue',
  'Incompatible storage': 'Storage Issue',
  'Cylinder storage': 'Storage Issue',
  'Containment': 'Storage Issue',
  'Containment missing': 'Storage Issue',
  'Tool storage': 'Storage Issue',

  // ============ LIFTING/RIGGING ============
  'Rigging deficiency': 'Lifting/Rigging Issue',
  'Load security': 'Lifting/Rigging Issue',
  'Load instability': 'Lifting/Rigging Issue',
  'Load capacity': 'Lifting/Rigging Issue',
  'Overload risk': 'Lifting/Rigging Issue',
  'Tag line missing': 'Lifting/Rigging Issue',

  // ============ VEHICLE/PLANT SAFETY ============
  'No banksman/spotter': 'Vehicle/Plant Safety',
  'Reversing hazard': 'Vehicle/Plant Safety',
  'Speed violation': 'Vehicle/Plant Safety',
  'Speeding': 'Vehicle/Plant Safety',
  'Speed control': 'Vehicle/Plant Safety',
  'Seatbelt not worn': 'Vehicle/Plant Safety',
  'Seatbelt violation': 'Vehicle/Plant Safety',
  'Vehicle condition': 'Vehicle/Plant Safety',
  'Vehicle/plant mixing': 'Vehicle/Plant Safety',
  'Defensive driving': 'Vehicle/Plant Safety',
  'Improper overtaking': 'Vehicle/Plant Safety',
  'Unsafe following': 'Vehicle/Plant Safety',
  'Mobile phone use': 'Vehicle/Plant Safety',
  'One-way violation': 'Vehicle/Plant Safety',

  // ============ PEDESTRIAN SAFETY ============
  'Pedestrian interface': 'Pedestrian Safety',
  'Pedestrian segregation': 'Pedestrian Safety',

  // ============ FIRE/HOT WORK ============
  'Extinguisher issue': 'Fire/Hot Work Issue',
  'Flammable material nearby': 'Fire/Hot Work Issue',
  'Ignition source': 'Fire/Hot Work Issue',
  'Welding screen missing': 'Fire/Hot Work Issue',
  'Spark containment': 'Fire/Hot Work Issue',
  'Fire watch missing': 'Fire/Hot Work Issue',
  'Alarm/detection': 'Fire/Hot Work Issue',
  'Assembly point': 'Fire/Hot Work Issue',
  'Fire door issue': 'Fire/Hot Work Issue',

  // ============ CONFINED SPACE ============
  'Confined space': 'Confined Space Issue',
  'Atmospheric testing': 'Confined Space Issue',
  'Rescue plan missing': 'Confined Space Issue',
  'Rescue equipment missing': 'Confined Space Issue',

  // ============ SLIP/TRIP HAZARD ============
  'Tripping hazard': 'Slip/Trip Hazard',
  'Wet surface': 'Slip/Trip Hazard',
  'Uneven surface': 'Slip/Trip Hazard',
  'Mat/carpet issue': 'Slip/Trip Hazard',

  // ============ STRUCTURAL STABILITY ============
  'Unstable structure': 'Structural Issue',
  'Collapse risk': 'Structural Issue',
  'Shoring missing': 'Structural Issue',
  'Spoil placement': 'Structural Issue',
  'Underground services': 'Structural Issue',
  'Water ingress': 'Structural Issue',

  // ============ ENVIRONMENTAL/SPILL ============
  'Spill/contamination': 'Environmental Issue',
  'Spill response': 'Environmental Issue',
  'Water pollution': 'Environmental Issue',
  'Soil contamination': 'Environmental Issue',
  'Waste disposal': 'Environmental Issue',
  'Waste management': 'Environmental Issue',
  'Recycling issue': 'Environmental Issue',
  'Wildlife/vegetation': 'Environmental Issue',
  'Decontamination': 'Environmental Issue',
  'Contamination risk': 'Environmental Issue',

  // ============ SIGNAGE/MARKING ============
  'Signage issue': 'Signage Issue',
  'Signage missing': 'Signage Issue',
  'Signage/marking': 'Signage Issue',
  'Labeling issue': 'Signage Issue',

  // ============ DOCUMENTATION ============
  'Documentation': 'Documentation Issue',
  'Documentation missing': 'Documentation Issue',
  'Documentation/log': 'Documentation Issue',
  'SDS missing': 'Documentation Issue',

  // ============ EQUIPMENT/MAINTENANCE ============
  'Equipment defect': 'Equipment Issue',
  'Defective Equipment': 'Equipment Issue',
  'Equipment maintenance': 'Equipment Issue',
  'Maintenance issue': 'Equipment Issue',
  'Maintenance Failure': 'Equipment Issue',
  'Defective tool': 'Equipment Issue',
  'Wrong Equipment Used': 'Equipment Issue',

  // ============ TOOL SAFETY ============
  'Hand tool hazard': 'Tool Safety Issue',
  'Power tool safety': 'Tool Safety Issue',
  'Wrong tool use': 'Tool Safety Issue',
  'Improper tools': 'Tool Safety Issue',
  'Tool/equipment': 'Tool Safety Issue',

  // ============ HEAT/WEATHER ============
  'Heat stress signs': 'Heat/Weather Issue',
  'Temperature/climate': 'Heat/Weather Issue',
  'Hydration issue': 'Heat/Weather Issue',
  'Shade/shelter missing': 'Heat/Weather Issue',
  'Rest breaks missing': 'Heat/Weather Issue',
  'Work rotation': 'Heat/Weather Issue',
  'Work schedule': 'Heat/Weather Issue',
  'Acclimatization': 'Heat/Weather Issue',
  'Cooling measures': 'Heat/Weather Issue',
  'Adverse Weather': 'Heat/Weather Issue',
  'Poor Visibility': 'Heat/Weather Issue',
  'Congested Workspace': 'Heat/Weather Issue',
  'Weather condition': 'Heat/Weather Issue',
  'Poor lighting': 'Heat/Weather Issue',
  'Lighting issue': 'Heat/Weather Issue',
  'Visibility issue': 'Heat/Weather Issue',

  // ============ EMERGENCY RESPONSE ============
  'Emergency plan': 'Emergency Response Issue',
  'Emergency response': 'Emergency Response Issue',

  // ============ WELFARE ============
  'Drinking water issue': 'Welfare Issue',
  'Toilet condition': 'Welfare Issue',
  'Rest area issue': 'Welfare Issue',
  'First aid missing': 'Welfare Issue',
  'Food safety': 'Welfare Issue',
  'Cleanliness issue': 'Welfare Issue',
  'Overcrowding': 'Welfare Issue',

  // ============ SECURITY ============
  'Unauthorized access': 'Security Issue',
  'Gate/access point': 'Security Issue',
  'ID/badge issue': 'Security Issue',
  'CCTV/surveillance': 'Security Issue',
  'Theft/loss': 'Security Issue',
  'Source security': 'Security Issue',

  // ============ PRESSURE SYSTEMS ============
  'Relief valve': 'Pressure System Issue',
  'Bleeding/venting': 'Pressure System Issue',

  // ============ BIOLOGICAL HAZARD ============
  'Hand hygiene': 'Biological Hazard',
  'Vaccination': 'Biological Hazard',
  'Exposure incident': 'Biological Hazard',

  // ============ WATER/MARINE ============
  'Boat safety': 'Marine Safety Issue',
  'Current/conditions': 'Marine Safety Issue',
  'Buddy system': 'Marine Safety Issue',

  // ============ RADIATION ============
  'Dosimeter missing': 'Radiation Issue',
  'Exposure monitoring': 'Radiation Issue',
  'Control measures': 'Radiation Issue',
  'Engineering controls': 'Radiation Issue',

  // ============ HUMAN FACTORS ============
  'Complacency/Shortcut': 'Human Factors - Complacency',
  'Distraction/Inattention': 'Human Factors - Distraction',
  'Rushing/Time Pressure': 'Human Factors - Rushing',
  'Fatigue/Alertness': 'Human Factors - Fatigue',
  'Fatigue/drowsiness': 'Human Factors - Fatigue',
  'Overconfidence': 'Human Factors - Overconfidence',
  'Improper Body Position': 'Human Factors - Body Position',

  // ============ ORGANIZATIONAL ============
  'Production Pressure': 'Organizational - Pressure',
  'Resource Constraints': 'Organizational - Resources',
  'Poor Safety Culture': 'Organizational - Culture',
  'Contractor Management': 'Organizational - Contractor'
}

/**
 * Get consolidated factor name
 * Returns the consolidated name if mapping exists, otherwise returns original
 */
const getConsolidatedFactorName = (factorName) => {
  return FACTOR_CONSOLIDATION[factorName] || factorName
}

/**
 * Factor Precedence Configuration
 * When both factors are detected, the higher-precedence one takes priority
 * Key = lower priority factor, Value = higher priority factor that supersedes it
 */
const FACTOR_PRECEDENCE = {
  'Human Factors - Rushing': 'Organizational - Pressure',  // External pressure takes precedence over individual rushing
  'Inspection Issue': 'Training & Competency',  // Root cause (training) over symptom (inspection)
}

/**
 * Mutually Exclusive Factor Groups
 * Only one factor from each group should be reported per observation
 */
const MUTUALLY_EXCLUSIVE_GROUPS = [
  ['Human Factors - Fatigue', 'Human Factors - Rushing'],  // Exhausted people don't rush
]

/**
 * Apply factor precedence and mutual exclusivity rules to deduplicate detected factors
 * @param {Array} factors - Array of detected factors
 * @returns {Array} Filtered array with precedence rules applied
 */
const applyFactorDeduplication = (factors) => {
  if (!factors || factors.length <= 1) return factors

  const factorNames = new Set(factors.map(f => f.name))
  let filtered = [...factors]

  // Apply precedence rules: remove lower-priority factor if higher-priority exists
  for (const [lowerPriority, higherPriority] of Object.entries(FACTOR_PRECEDENCE)) {
    if (factorNames.has(lowerPriority) && factorNames.has(higherPriority)) {
      filtered = filtered.filter(f => f.name !== lowerPriority)
    }
  }

  // Apply mutual exclusivity: keep only the first detected factor from each exclusive group
  for (const group of MUTUALLY_EXCLUSIVE_GROUPS) {
    const foundInGroup = filtered.filter(f => group.includes(f.name))
    if (foundInGroup.length > 1) {
      // Keep only the first one found (order matters - first detected is kept)
      const toKeep = foundInGroup[0].name
      filtered = filtered.filter(f => !group.includes(f.name) || f.name === toKeep)
    }
  }

  return filtered
}

/**
 * UNIFIED CAUSE DETECTION
 * Detects BOTH hazard-specific issues AND universal contributing factors
 * Returns all causes with their category (Physical, Behavioral, Organizational, etc.)
 *
 * @param {string} description - The observation description text
 * @param {string} hazardName - The hazard category name (optional, for hazard-specific causes)
 * @returns {Array} Array of { name, category, type } objects
 */
export const detectAllCausesUnified = (description, hazardName = null) => {
  if (!description || typeof description !== 'string') {
    return []
  }

  const text = description.toLowerCase()
  const detected = []
  const seenFactors = new Set()

  // PRIMARY: Detect using CONSOLIDATED_FACTOR_KEYWORDS (direct detection)
  for (const [factorName, keywords] of Object.entries(CONSOLIDATED_FACTOR_KEYWORDS)) {
    if (seenFactors.has(factorName)) continue

    for (const keyword of keywords) {
      // Use word boundary for short keywords (5 chars or less)
      let matched = false
      if (keyword.length <= 5) {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        matched = regex.test(text)
      } else {
        matched = text.includes(keyword.toLowerCase())
      }

      if (matched) {
        // Determine category based on factor name
        let category = 'Physical/Technical'
        if (factorName.startsWith('Human Factors')) category = 'Human Factors'
        else if (factorName.startsWith('Organizational')) category = 'Organizational'
        else if (['Training & Competency', 'Supervision Issue', 'Communication Issue'].includes(factorName)) category = 'Supervision'
        else if (['Planning Issue', 'Documentation Issue', 'Permit Issue'].includes(factorName)) category = 'Planning & Procedures'
        else if (['Heat/Weather Issue', 'Environmental Issue'].includes(factorName)) category = 'Environmental'

        detected.push({
          name: factorName,
          category: category,
          type: 'consolidated'
        })
        seenFactors.add(factorName)
        break
      }
    }
  }

  // FALLBACK: Also check HAZARD_ROOT_CAUSES for hazard-specific patterns
  if (hazardName && HAZARD_ROOT_CAUSES[hazardName]) {
    const hazardCauses = HAZARD_ROOT_CAUSES[hazardName]
    for (const [causeName, keywords] of Object.entries(hazardCauses)) {
      const consolidatedName = getConsolidatedFactorName(causeName)
      if (seenFactors.has(consolidatedName)) continue

      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          detected.push({
            name: consolidatedName,
            category: 'Physical/Technical',
            type: 'hazard-specific'
          })
          seenFactors.add(consolidatedName)
          break
        }
      }
    }
  }

  // FALLBACK: Also check UNIVERSAL_CONTRIBUTING_FACTORS
  for (const [category, factors] of Object.entries(UNIVERSAL_CONTRIBUTING_FACTORS)) {
    for (const [factorName, keywords] of Object.entries(factors)) {
      const consolidatedName = getConsolidatedFactorName(factorName)
      if (seenFactors.has(consolidatedName)) continue

      for (const keyword of keywords) {
        let matched = false
        if (keyword.length <= 5) {
          const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
          matched = regex.test(text)
        } else {
          matched = text.includes(keyword.toLowerCase())
        }

        if (matched) {
          detected.push({
            name: consolidatedName,
            category: category,
            type: 'contributing-factor'
          })
          seenFactors.add(consolidatedName)
          break
        }
      }
    }
  }

  // Apply deduplication rules before returning
  return applyFactorDeduplication(detected)
}

/**
 * Negative observation types (deficiencies)
 */
export const NEGATIVE_TYPES = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr', 'fac', 'mti', 'lti']

/**
 * Positive observation types (good practices)
 */
export const POSITIVE_TYPES = ['positive']

/**
 * Aggregate root causes for all incidents in a hazard
 * UNIFIED VERSION: Detects BOTH hazard-specific issues AND universal contributing factors
 *
 * @param {Array} incidents - All incidents/observations
 * @param {string} hazardName - The hazard category to filter by
 * @param {string} observationType - 'negative', 'positive', or 'all' (default: 'negative')
 * @returns {Object} Root cause breakdown with counts, percentages, and categories
 */
export const aggregateRootCausesForHazard = (incidents, hazardName, observationType = 'negative') => {
  // Filter incidents for this hazard
  let hazardIncidents = incidents.filter(i => i.location === hazardName)

  // Filter by observation type
  if (observationType === 'negative') {
    hazardIncidents = hazardIncidents.filter(i => NEGATIVE_TYPES.includes(i.type))
  } else if (observationType === 'positive') {
    hazardIncidents = hazardIncidents.filter(i => POSITIVE_TYPES.includes(i.type))
  }
  // 'all' keeps all incidents

  if (hazardIncidents.length === 0) {
    return {
      breakdown: [],
      total: 0,
      topCause: null,
      hasData: false,
      observationType
    }
  }

  const causeCounts = {}
  const causeCategories = {}
  let matchedIncidents = 0

  hazardIncidents.forEach(incident => {
    const description = incident.description || ''
    if (!description.trim()) return

    // Use UNIFIED detection - gets BOTH hazard-specific AND contributing factors
    const allCauses = detectAllCausesUnified(description, hazardName)

    if (allCauses.length > 0) {
      matchedIncidents++
      // Count each unique cause (avoid double-counting per incident)
      const seenInThisIncident = new Set()
      allCauses.forEach(({ name, category }) => {
        if (!seenInThisIncident.has(name)) {
          seenInThisIncident.add(name)
          causeCounts[name] = (causeCounts[name] || 0) + 1
          causeCategories[name] = category
        }
      })
    }
  })

  const total = hazardIncidents.length
  let breakdown = Object.entries(causeCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
      category: causeCategories[name] || 'Other'
    }))
    .sort((a, b) => b.count - a.count)

  // Add "Not Specified" for unmatched observations (only if significant)
  const unmatchedCount = total - matchedIncidents
  if (unmatchedCount > 0 && unmatchedCount > total * 0.1) { // Only show if > 10%
    breakdown.push({
      name: 'Not Specified',
      count: unmatchedCount,
      percentage: total > 0 ? ((unmatchedCount / total) * 100).toFixed(1) : '0.0',
      category: 'Unclassified'
    })
  }

  // Re-sort to ensure correct position
  breakdown.sort((a, b) => b.count - a.count)

  return {
    breakdown,
    total,
    topCause: breakdown[0] || null,
    hasData: total > 0,
    observationType,
    matchedPercent: total > 0 ? ((matchedIncidents / total) * 100).toFixed(1) : '0.0'
  }
}

/**
 * Get observation type statistics for a hazard
 * Returns counts and percentages for positive vs negative observations
 *
 * @param {Array} incidents - All incidents/observations
 * @param {string} hazardName - The hazard category to filter by
 * @returns {Object} Statistics for positive/negative breakdown
 */
export const getObservationTypeStats = (incidents, hazardName) => {
  const hazardIncidents = incidents.filter(i => i.location === hazardName)
  const total = hazardIncidents.length

  const negativeCount = hazardIncidents.filter(i => NEGATIVE_TYPES.includes(i.type)).length
  const positiveCount = hazardIncidents.filter(i => POSITIVE_TYPES.includes(i.type)).length
  const otherCount = total - negativeCount - positiveCount

  return {
    total,
    negative: {
      count: negativeCount,
      percentage: total > 0 ? ((negativeCount / total) * 100).toFixed(1) : '0.0'
    },
    positive: {
      count: positiveCount,
      percentage: total > 0 ? ((positiveCount / total) * 100).toFixed(1) : '0.0'
    },
    other: {
      count: otherCount,
      percentage: total > 0 ? ((otherCount / total) * 100).toFixed(1) : '0.0'
    }
  }
}

/**
 * Get all available hazard categories
 * @returns {string[]} Array of hazard category names
 */
export const getAvailableHazards = () => {
  return Object.keys(HAZARD_ROOT_CAUSES)
}

/**
 * Get root cause definitions for a specific hazard
 * @param {string} hazardName - The hazard category name
 * @returns {Object|null} Root cause definitions or null if hazard not found
 */
export const getRootCauseDefinitions = (hazardName) => {
  return HAZARD_ROOT_CAUSES[hazardName] || null
}

/**
 * Debug function to show observations and their root cause matches
 * Call this from browser console: window.debugRootCauses(incidents, 'Site Security')
 * @param {Array} incidents - All incidents/observations
 * @param {string} hazardName - The hazard category to analyze
 * @returns {Object} Debug report with matched and unmatched observations
 */
export const debugRootCauses = (incidents, hazardName) => {
  const hazardIncidents = incidents.filter(i => i.location === hazardName)

  const matched = []
  const unmatched = []

  hazardIncidents.forEach((incident, idx) => {
    const description = incident.description || ''
    const rootCause = detectRootCauses(description, hazardName)

    if (rootCause) {
      matched.push({
        index: idx + 1,
        description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
        rootCause
      })
    } else {
      unmatched.push({
        index: idx + 1,
        description: description.substring(0, 150) + (description.length > 150 ? '...' : '')
      })
    }
  })

  console.log(`\n===== ${hazardName} Root Cause Analysis =====`)
  console.log(`Total: ${hazardIncidents.length} | Matched: ${matched.length} | Unmatched: ${unmatched.length}`)
  console.log(`Match Rate: ${((matched.length / hazardIncidents.length) * 100).toFixed(1)}%`)

  console.log('\n--- MATCHED OBSERVATIONS ---')
  matched.forEach(m => {
    console.log(`[${m.index}] ${m.rootCause}`)
    console.log(`    "${m.description}"`)
  })

  console.log('\n--- UNMATCHED OBSERVATIONS (need keywords) ---')
  unmatched.forEach(u => {
    console.log(`[${u.index}] "${u.description}"`)
  })

  return { hazardName, total: hazardIncidents.length, matched, unmatched }
}

// Expose debug function globally for browser console access
if (typeof window !== 'undefined') {
  window.debugRootCauses = debugRootCauses
}

// =============================================================================
// UNIVERSAL CONTRIBUTING FACTORS (ROOT CAUSES - WHY IT HAPPENED)
// These are ORGANIZATIONAL/SYSTEMIC factors, NOT physical deficiencies
// Physical deficiencies (WHAT happened) are covered in HAZARD_ROOT_CAUSES (Site Issues)
// EXPANDED VOCABULARY for better detection coverage
// =============================================================================

export const UNIVERSAL_CONTRIBUTING_FACTORS = {
  'Human Factors': {
    'Fatigue/Alertness': [
      // Direct fatigue terms
      'fatigue', 'fatigued', 'tired', 'exhausted', 'exhaustion', 'weary', 'worn out',
      'drowsy', 'sleepy', 'drowsiness', 'lethargy', 'lethargic',
      // Work schedule related
      'long shift', 'overtime', 'rest break', 'night shift', 'night work', 'graveyard shift',
      'working hours', 'extended hours', 'long hours', 'double shift', 'back to back shift',
      'consecutive days', 'consecutive shifts', 'lack of sleep', 'sleep deprived',
      'no break', 'without break', 'skipped break', 'working continuously',
      '12 hour', '14 hour', '16 hour', 'excessive hours', 'overworked',
      // Alertness issues
      'not alert', 'lack of alertness', 'dozed off', 'fell asleep', 'sleeping'
    ],
    'Complacency/Shortcut': [
      // Complacency
      'complacent', 'complacency', 'routine', 'always done', 'always do it',
      'done it before', 'nothing happened', 'never had problem', 'familiar task',
      // Shortcuts
      'shortcut', 'short cut', 'cutting corners', 'took a chance', 'taking chance',
      'skip', 'skipped', 'skipping', 'bypassed', 'bypass', 'bypassing',
      'didnt bother', 'couldnt be bothered', 'easier way', 'quick way', 'faster way',
      // Carelessness
      'careless', 'carelessness', 'casual', 'casual approach', 'casual attitude',
      'negligent', 'negligence', 'reckless', 'recklessness', 'lazy', 'laziness',
      // Disregard
      'ignored', 'ignoring', 'disregard', 'disregarded', 'disregarding',
      'didnt care', 'dont care', 'not bothered', 'unconcerned',
      'took risk', 'risk taking', 'unnecessary risk', 'knowingly',
      // Habit
      'habit', 'habitual', 'habitually', 'old habit', 'bad habit',
      'force of habit', 'automatic', 'without thinking'
    ],
    'Distraction/Inattention': [
      // Distraction
      'distracted', 'distraction', 'got distracted', 'was distracted',
      'phone', 'mobile', 'mobile phone', 'cell phone', 'cellphone', 'smartphone',
      'talking', 'chatting', 'conversation', 'socializing', 'joking around',
      'texting', 'browsing', 'watching video', 'headphones', 'earphones', 'earbuds',
      // Inattention
      'inattentive', 'inattention', 'not paying attention', 'lack of attention',
      'not focused', 'unfocused', 'lost focus', 'losing focus', 'looked away',
      'not concentrating', 'poor concentration', 'mind elsewhere', 'daydreaming',
      'multitasking', 'multi-tasking', 'doing multiple', 'split attention',
      // Awareness
      'unaware', 'not aware', 'lack of awareness', 'situational awareness',
      'didnt notice', 'failed to notice', 'didnt see', 'overlooked', 'missed'
    ],
    'Rushing/Time Pressure': [
      // Rushing
      'rushed', 'rushing', 'hurry', 'hurried', 'hurrying', 'in a hurry',
      'too fast', 'too quick', 'too quickly', 'speeding', 'speed up',
      'running', 'running late', 'race', 'racing', 'haste', 'hasty',
      // Time pressure
      'deadline', 'time pressure', 'time constraint', 'pressed for time',
      'behind schedule', 'running behind', 'catch up', 'catching up',
      'tight schedule', 'tight deadline', 'tight timeline',
      'urgent', 'urgency', 'emergency', 'asap', 'immediately', 'right now',
      'no time', 'short time', 'limited time', 'time crunch',
      // Pressure
      'pressure', 'pressured', 'under pressure', 'felt pressure',
      'push', 'pushed', 'pushing', 'being pushed'
    ],
    'Overconfidence': [
      // Overconfidence
      'overconfident', 'overconfidence', 'too confident', 'cocky',
      'experienced', 'years of experience', 'done many times', 'expert',
      'know what doing', 'know how', 'dont need', 'didnt need',
      // Assumptions
      'assumed', 'assuming', 'assumption', 'took for granted', 'presumed',
      'thought it was', 'thought it would', 'expected', 'expecting',
      'didnt think', 'didnt expect', 'didnt anticipate',
      // Underestimation
      'underestimate', 'underestimated', 'underestimating', 'underestimation',
      'misjudge', 'misjudged', 'miscalculate', 'miscalculated',
      // Complacent expertise
      'easy task', 'simple task', 'routine task', 'straightforward',
      'no big deal', 'nothing serious', 'minor job', 'quick job'
    ],
    'Improper Body Position': [
      // Body mechanics
      'wrong posture', 'bad posture', 'poor posture', 'awkward position',
      'awkward posture', 'bent over', 'bending', 'stooping', 'crouching',
      'overreaching', 'over reaching', 'reaching too far', 'stretched',
      'twisting', 'twisted', 'turning', 'off balance', 'unbalanced',
      // Line of fire
      'line of fire', 'in the way', 'wrong position', 'positioned incorrectly',
      'standing in', 'standing under', 'standing near', 'too close',
      'struck by', 'caught between', 'pinch point', 'crush zone',
      // Ergonomics
      'ergonomic', 'ergonomics', 'strain', 'strained', 'overexertion',
      'lifting incorrectly', 'improper lifting', 'manual handling'
    ]
  },

  'Supervision': {
    'Lack of Supervision': [
      // No supervisor
      'unsupervised', 'no supervisor', 'supervisor absent', 'supervisor not present',
      'supervisor not there', 'supervisor away', 'supervisor missing',
      'no foreman', 'foreman absent', 'foreman not present', 'foreman away',
      'no charge hand', 'charge hand absent', 'no team leader',
      'without supervision', 'lack of supervision', 'inadequate supervision',
      // No oversight
      'no oversight', 'lack of oversight', 'unattended', 'unmonitored',
      'left alone', 'left unsupervised', 'on their own', 'by themselves',
      'no one watching', 'no one checking', 'no one supervising',
      // Working alone
      'working alone', 'lone worker', 'lone working', 'solo', 'by himself',
      'by herself', 'single worker', 'one man', 'one person',
      // Safety personnel
      'no safety officer', 'safety officer absent', 'no hse', 'hse absent',
      'no safety rep', 'safety representative absent'
    ],
    'Inadequate Monitoring': [
      // Monitoring failures
      'not monitored', 'no monitoring', 'lack of monitoring', 'poor monitoring',
      'insufficient monitoring', 'inadequate monitoring', 'sporadic monitoring',
      // Checking failures
      'not checked', 'no checking', 'not verified', 'no verification',
      'not inspected', 'no inspection', 'not audited', 'no audit',
      // Follow-up failures
      'no follow up', 'no follow-up', 'no followup', 'lack of follow up',
      'not followed up', 'wasnt followed up', 'failed to follow up',
      // Oversight issues
      'poor oversight', 'weak oversight', 'insufficient oversight',
      'slipped through', 'fell through cracks', 'went unnoticed'
    ],
    'Poor Leadership': [
      // Leadership failures
      'poor leadership', 'weak leadership', 'lack of leadership',
      'management failure', 'management issue', 'supervisor failure',
      // Bad example
      'led by example', 'set bad example', 'supervisor did same',
      'foreman did same', 'manager did same', 'copied supervisor',
      // Tolerance of violations
      'allowed', 'permitted', 'tolerated', 'accepted', 'condoned',
      'turned blind eye', 'looked away', 'didnt intervene', 'didnt stop',
      'foreman allowed', 'supervisor allowed', 'supervisor tolerated',
      // Direction issues
      'poor direction', 'unclear direction', 'conflicting direction',
      'no guidance', 'lack of guidance', 'no instruction from supervisor'
    ]
  },

  'Training & Competency': {
    'Insufficient Training': [
      // No training
      'no training', 'not trained', 'untrained', 'never trained',
      'without training', 'lack of training', 'training missing',
      // Inadequate training
      'inadequate training', 'insufficient training', 'poor training',
      'minimal training', 'basic training only', 'limited training',
      'training gap', 'training deficiency', 'training shortfall',
      // Training needed
      'needs training', 'require training', 'training required',
      'should be trained', 'must be trained', 'training needed',
      // Specific training
      'no safety training', 'no task training', 'no equipment training',
      'no refresher', 'refresher needed', 'refresher overdue',
      'not trained on', 'not trained for', 'not trained in'
    ],
    'Lack of Competency': [
      // Incompetence
      'incompetent', 'not competent', 'lack competency', 'lacks competency',
      'not qualified', 'unqualified', 'under qualified',
      // Skill issues
      'unskilled', 'not skilled', 'lack of skill', 'lacking skill',
      'low skill', 'poor skill', 'skill gap', 'skill deficiency',
      // Experience issues
      'inexperienced', 'lack of experience', 'no experience', 'little experience',
      'limited experience', 'insufficient experience', 'experience gap',
      'first time', 'new to task', 'new to job', 'new to equipment',
      // Knowledge issues
      'doesnt know', 'didnt know', 'dont know', 'not know',
      'unfamiliar', 'not familiar', 'lack of knowledge', 'knowledge gap',
      'not aware of', 'unaware of', 'didnt understand', 'misunderstand',
      // New worker
      'new worker', 'new employee', 'new hire', 'new joiner', 'new starter',
      'recently joined', 'just started', 'probation', 'probationary'
    ],
    'No Induction': [
      // Induction missing
      'no induction', 'without induction', 'induction not done',
      'induction missing', 'induction not completed', 'skipped induction',
      'site induction missing', 'site induction not done',
      // Orientation issues
      'no orientation', 'orientation missing', 'not oriented',
      'not inducted', 'hasnt been inducted', 'induction pending',
      // New to site
      'new to site', 'first day', 'first time on site', 'just arrived',
      'new arrival', 'new mobilization', 'newly mobilized',
      // Safety induction
      'no safety induction', 'safety induction missing',
      'no hse induction', 'hse induction not done'
    ],
    'Invalid Certification': [
      // Expired
      'expired', 'expired license', 'expired certificate', 'expired certification',
      'license expired', 'certificate expired', 'certification expired',
      'validity expired', 'out of date', 'lapsed', 'overdue',
      // Invalid
      'not valid', 'invalid', 'invalid license', 'invalid certificate',
      'no valid license', 'no valid certificate', 'no valid certification',
      // Missing certification
      'no license', 'no certificate', 'no certification', 'license missing',
      'certificate missing', 'certification missing', 'not certified',
      'without license', 'without certificate', 'without certification',
      // Operator issues
      'unauthorized operator', 'unauthorised operator', 'not authorized',
      'not authorised', 'no operator license', 'operator not certified',
      'operator not licensed', 'unlicensed operator', 'uncertified',
      // Specific licenses
      'sag license', 'sag driving license', 'without sag', 'no sag',
      'ksa license', 'ksa driving license', 'national driving license',
      'tuv license', 'tuv certificate', 'third party certification', 'tpc',
      'ipaf', 'cpcs', 'cscs', 'operator card', 'competency card'
    ],
    'Language Barrier': [
      // Language issues
      'language barrier', 'language issue', 'language problem', 'language gap',
      'language difficulty', 'communication barrier', 'communication issue',
      // Understanding issues
      'didnt understand', 'not understand', 'couldnt understand', 'misunderstand',
      'misunderstood', 'failed to understand', 'difficulty understanding',
      'not comprehend', 'couldnt comprehend', 'confusion', 'confused',
      // Translation needs
      'translation', 'translator', 'interpreter', 'translation needed',
      'interpreter needed', 'no translator', 'no interpreter',
      // Specific languages
      'english', 'arabic', 'hindi', 'urdu', 'bengali', 'tagalog', 'nepali',
      'non-english', 'foreign language', 'different language',
      // Communication
      'couldnt communicate', 'communication difficulty', 'verbal instruction'
    ]
  },

  'Planning & Procedures': {
    'No Risk Assessment': [
      // Risk assessment
      'no risk assessment', 'risk assessment missing', 'risk assessment not done',
      'without risk assessment', 'lack of risk assessment', 'no ra',
      // RAMS/Method statement
      'no rams', 'rams missing', 'rams not done', 'without rams',
      'no method statement', 'method statement missing', 'ms missing',
      'no msra', 'msra missing', 'no swms', 'swms missing',
      // JSA/JHA
      'no jsa', 'jsa missing', 'jsa not done', 'without jsa',
      'no jha', 'jha missing', 'no job safety analysis', 'no job hazard analysis',
      // Task analysis
      'no task analysis', 'task analysis missing', 'no hra',
      'hazard not identified', 'hazard not assessed', 'risk not identified',
      'risk not assessed', 'unassessed risk', 'unidentified hazard',
      // Generic
      'no safe system', 'safe system of work missing', 'ssow missing',
      'no work plan', 'work plan missing', 'no safety plan'
    ],
    'No Permit to Work': [
      // Permit missing
      'no permit', 'permit missing', 'without permit', 'permit not obtained',
      'permit not issued', 'permit not in place', 'permit not displayed',
      'ptw missing', 'no ptw', 'work without permit', 'working without permit',
      // Permit issues
      'permit expired', 'expired permit', 'invalid permit', 'wrong permit',
      'incorrect permit', 'permit not valid', 'permit not signed',
      'permit not authorized', 'permit not approved', 'unsigned permit',
      // Specific permits
      'hot work permit', 'confined space permit', 'excavation permit',
      'lifting permit', 'electrical permit', 'isolation permit',
      'height permit', 'working at height permit', 'entry permit',
      'cold work permit', 'general permit', 'permit to work',
      // Permit conditions
      'permit conditions', 'outside permit', 'beyond permit scope',
      'permit scope', 'permit boundary', 'permit area'
    ],
    'Procedure Violation': [
      // Not following
      'not following', 'not followed', 'didnt follow', 'failed to follow',
      'not as per', 'contrary to', 'against', 'violated', 'violation',
      'deviation', 'deviated', 'deviating', 'departed from',
      // Bypassing
      'bypassed procedure', 'bypassed process', 'bypassed protocol',
      'ignored procedure', 'ignored process', 'ignored protocol',
      'skipped procedure', 'skipped step', 'skipped process',
      // Non-compliance
      'non-compliance', 'noncompliance', 'non compliance', 'noncompliant',
      'not compliant', 'not complying', 'out of compliance',
      // Procedure terms
      'procedure', 'sop', 'standard operating procedure', 'work instruction',
      'method', 'process', 'protocol', 'standard', 'guideline',
      'requirement', 'specification', 'rule', 'regulation',
      // Specific violations
      'not as per sop', 'contrary to procedure', 'against protocol',
      'improper method', 'incorrect method', 'wrong method', 'wrong process'
    ],
    'Poor Planning': [
      // Planning failures
      'poor planning', 'bad planning', 'inadequate planning', 'lack of planning',
      'no planning', 'planning failure', 'planning issue', 'planning gap',
      'insufficient planning', 'minimal planning', 'limited planning',
      // Unplanned work
      'not planned', 'unplanned', 'unplanned work', 'unplanned activity',
      'unplanned task', 'without planning', 'no plan',
      // Scope issues
      'scope creep', 'scope change', 'changed scope', 'additional work',
      'extra work', 'outside scope', 'beyond scope', 'added scope',
      // Reactive work
      'ad hoc', 'adhoc', 'reactive', 'last minute', 'last-minute',
      'emergency work', 'urgent work', 'breakdown work',
      // Preparation
      'no preparation', 'not prepared', 'unprepared', 'ill-prepared',
      'poor preparation', 'inadequate preparation', 'lack of preparation'
    ]
  },

  'Communication': {
    'No Toolbox Talk': [
      // Toolbox talk
      'no toolbox talk', 'toolbox talk missing', 'tbt missing',
      'tbt not done', 'no tbt', 'tbt not conducted', 'skipped tbt',
      'toolbox not done', 'no toolbox', 'toolbox missing',
      // Safety briefing
      'no safety briefing', 'safety briefing missing', 'briefing not done',
      'no briefing', 'briefing missing', 'briefing skipped',
      'no pre-task briefing', 'pre-task briefing missing', 'no pre-start',
      // Morning meetings
      'no morning briefing', 'morning briefing missing', 'no safety talk',
      'no safety meeting', 'safety meeting missed', 'no start of shift',
      // Task briefing
      'not briefed', 'wasnt briefed', 'briefing not given',
      'no task briefing', 'task briefing missing', 'no job briefing'
    ],
    'Poor Communication': [
      // Miscommunication
      'miscommunication', 'miscommunicated', 'mis-communication',
      'poor communication', 'bad communication', 'lack of communication',
      'communication failure', 'communication breakdown', 'communication gap',
      'communication issue', 'communication problem', 'failed to communicate',
      // Information not shared
      'not communicated', 'wasnt communicated', 'not informed', 'wasnt informed',
      'not told', 'wasnt told', 'didnt tell', 'failed to inform',
      'not notified', 'wasnt notified', 'not advised', 'wasnt advised',
      // Unclear information
      'unclear', 'unclear instruction', 'unclear information', 'unclear direction',
      'confusing', 'confusing instruction', 'confusing information',
      'misunderstood', 'misunderstanding', 'misinterpret', 'misinterpreted',
      'ambiguous', 'vague', 'not clear', 'not specific',
      // Wrong information
      'wrong information', 'incorrect information', 'misinformed',
      'misinformation', 'false information', 'inaccurate information'
    ],
    'Poor Handover': [
      // Handover issues
      'poor handover', 'bad handover', 'inadequate handover', 'handover issue',
      'handover failure', 'handover gap', 'handover problem',
      'no handover', 'handover missing', 'incomplete handover',
      // Shift handover
      'shift handover', 'shift change', 'between shifts', 'shift transition',
      'change of shift', 'end of shift', 'start of shift',
      'previous shift', 'oncoming shift', 'outgoing shift', 'incoming shift',
      // Information not passed
      'not passed on', 'wasnt passed on', 'not handed over',
      'information not shared', 'not relayed', 'wasnt relayed',
      'not communicated between', 'lost in handover'
    ],
    'Inadequate Warning': [
      // No warning
      'no warning', 'without warning', 'warning not given', 'not warned',
      'wasnt warned', 'failed to warn', 'didnt warn', 'no alert',
      // Signal issues
      'no signal', 'signal missing', 'no horn', 'horn not used',
      'no siren', 'siren not activated', 'no alarm', 'alarm not sounded',
      // Verbal warning
      'no verbal warning', 'didnt shout', 'didnt call out',
      'no heads up', 'no advance notice', 'no prior warning'
    ]
  },

  'Organizational': {
    'Production Pressure': [
      // Production pressure
      'production pressure', 'pressure to produce', 'output pressure',
      'target pressure', 'deadline pressure', 'schedule pressure',
      'project pressure', 'milestone pressure', 'completion pressure',
      // Must complete
      'must finish', 'must complete', 'had to finish', 'needed to complete',
      'cant stop', 'couldnt stop', 'keep going', 'carry on',
      // Behind schedule
      'behind schedule', 'behind programme', 'behind program', 'running late',
      'delayed', 'delay', 'slippage', 'overrun', 'running behind',
      // Targets
      'target', 'quota', 'output target', 'production target',
      'kpi', 'performance target', 'delivery date', 'handover date',
      // Pressure phrases
      'pushed to', 'pressure from', 'demands from', 'management pressure',
      'client pressure', 'commercial pressure', 'cost pressure'
    ],
    'Resource Constraints': [
      // Staffing issues
      'understaffed', 'under staffed', 'short staffed', 'short-staffed',
      'not enough workers', 'not enough people', 'not enough staff',
      'lack of manpower', 'manpower shortage', 'manpower issue',
      'insufficient manpower', 'insufficient workforce', 'insufficient staff',
      // Resource shortage
      'resource shortage', 'lack of resources', 'resource constraint',
      'limited resources', 'insufficient resources', 'resource issue',
      'shortage', 'shortfall', 'deficit', 'scarcity',
      // Budget
      'budget constraint', 'budget issue', 'budget cut', 'cost cutting',
      'cost reduction', 'cost saving', 'financial constraint',
      // Workforce issues
      'skeleton crew', 'reduced workforce', 'reduced manning',
      'minimum manning', 'lean team', 'small team', 'limited team'
    ],
    'Poor Safety Culture': [
      // Culture phrases
      'everyone does it', 'everyone does', 'all do it', 'common practice',
      'normal practice', 'standard practice', 'accepted practice',
      'usual practice', 'regular practice', 'routine practice',
      // Tolerance
      'tolerated', 'accepted', 'allowed', 'permitted', 'condoned',
      'not enforced', 'no enforcement', 'lack of enforcement',
      // Normalization
      'always been done', 'way things are done', 'how we do it',
      'nothing new', 'been doing it', 'years without incident',
      // Culture terms
      'culture', 'safety culture', 'culture issue', 'cultural issue',
      'attitude', 'mindset', 'mentality', 'behavior', 'behaviour',
      // Peer pressure
      'peer pressure', 'others do it', 'everyone else', 'follow others',
      'copy others', 'fit in', 'group pressure'
    ],
    'Contractor Management': [
      // Contractor issues
      'contractor', 'subcontractor', 'sub-contractor', 'third party',
      'contractor issue', 'contractor failure', 'contractor performance',
      'contractor supervision', 'contractor management', 'contractor control',
      // Interface issues
      'interface', 'interface issue', 'coordination', 'coordination issue',
      'multi-contractor', 'multiple contractors', 'different contractors',
      // Responsibility
      'unclear responsibility', 'responsibility gap', 'accountability',
      'ownership', 'who is responsible', 'conflicting instruction'
    ]
  },

  'Environmental': {
    'Adverse Weather': [
      // Weather conditions
      'weather', 'weather condition', 'bad weather', 'poor weather',
      'severe weather', 'extreme weather', 'adverse weather', 'inclement weather',
      // Wind
      'wind', 'windy', 'high wind', 'strong wind', 'gusty', 'gusting',
      'wind speed', 'wind gust', 'gale', 'storm',
      // Rain
      'rain', 'raining', 'rainy', 'heavy rain', 'downpour', 'wet weather',
      'monsoon', 'flooding', 'flooded', 'waterlogged',
      // Heat
      'heat', 'hot', 'extreme heat', 'heat wave', 'heatwave', 'high temperature',
      'hot weather', 'summer heat', 'scorching', 'sweltering',
      // Cold
      'cold', 'freezing', 'frost', 'frosty', 'icy', 'ice', 'snow', 'snowing',
      // Dust/Sand
      'dust', 'dusty', 'sandstorm', 'sand storm', 'dust storm', 'haboob',
      'visibility due to dust', 'dust cloud', 'blowing dust', 'blowing sand',
      // Humidity
      'humidity', 'humid', 'high humidity', 'moisture', 'damp', 'muggy'
    ],
    'Poor Visibility': [
      // Visibility issues
      'visibility', 'poor visibility', 'low visibility', 'limited visibility',
      'reduced visibility', 'visibility issue', 'visibility problem',
      'cant see', 'couldnt see', 'hard to see', 'difficult to see',
      // Darkness
      'dark', 'darkness', 'dark area', 'dark zone', 'too dark',
      'night', 'night time', 'nighttime', 'after dark', 'before dawn',
      // Lighting issues
      'no lighting', 'no light', 'lighting issue', 'lighting problem',
      'insufficient lighting', 'inadequate lighting', 'poor lighting',
      'dim', 'dim lighting', 'not enough light', 'lack of light',
      // Glare/Blind
      'glare', 'sun glare', 'blinding', 'blind', 'blind spot',
      'obstructed view', 'view obstructed', 'blocked view', 'view blocked'
    ],
    'Congested Workspace': [
      // Congestion
      'congested', 'congestion', 'congested area', 'congested workspace',
      'crowded', 'overcrowded', 'too crowded', 'packed', 'busy',
      // Space issues
      'limited space', 'lack of space', 'tight space', 'cramped',
      'confined', 'restricted space', 'small space', 'narrow',
      'not enough space', 'insufficient space', 'space constraint',
      // Multiple activities
      'concurrent activities', 'simultaneous work', 'multiple activities',
      'multiple trades', 'different trades', 'overlapping work',
      'too many workers', 'too many people', 'high traffic',
      // Work area
      'cluttered', 'clutter', 'obstructed', 'obstruction',
      'messy', 'disorganized', 'disorganised', 'chaotic'
    ],
    'Noise': [
      // Noise issues
      'noise', 'noisy', 'loud', 'loud noise', 'excessive noise',
      'high noise', 'noise level', 'decibel', 'db',
      'couldnt hear', 'didnt hear', 'hard to hear', 'difficult to hear',
      // Communication affected
      'drowned out', 'noise interference', 'shouting', 'yelling',
      'couldnt communicate', 'communication difficult due to noise'
    ]
  },

  'Equipment Management': {
    'Maintenance Failure': [
      // Maintenance not done
      'not maintained', 'poorly maintained', 'unmaintained', 'maintenance overdue',
      'maintenance due', 'maintenance required', 'needs maintenance',
      'lack of maintenance', 'poor maintenance', 'inadequate maintenance',
      'maintenance failure', 'maintenance issue', 'maintenance gap',
      // Service issues
      'service overdue', 'service due', 'not serviced', 'unserviced',
      'no service', 'service required', 'needs service', 'service record',
      // Preventive maintenance
      'preventive maintenance', 'pm', 'pm overdue', 'pm missed',
      'scheduled maintenance', 'routine maintenance', 'periodic maintenance',
      // Breakdown
      'breakdown', 'broke down', 'breaking down', 'keeps breaking',
      'frequent breakdown', 'mechanical failure', 'equipment failure'
    ],
    'Pre-Use Check Missed': [
      // Pre-use inspection
      'no pre-use', 'pre-use missing', 'pre-use not done', 'preuse',
      'pre-use check', 'pre-use inspection', 'pre-start check',
      'pre-start inspection', 'pre-operation', 'pre-operational',
      // Daily inspection
      'daily check', 'daily inspection', 'morning check', 'shift check',
      'no daily check', 'daily check not done', 'daily inspection missed',
      // Checklist
      'checklist', 'checklist not done', 'checklist missing', 'no checklist',
      'inspection checklist', 'check sheet', 'inspection form',
      // Not inspected
      'not inspected', 'uninspected', 'inspection missed', 'inspection skipped',
      'skipped inspection', 'bypassed inspection', 'no inspection',
      'inspection overdue', 'inspection due', 'inspection required',
      // Visual check
      'visual check', 'visual inspection', 'walk around', 'walkaround'
    ],
    'Wrong Equipment Used': [
      // Wrong equipment
      'wrong equipment', 'wrong tool', 'wrong machine', 'incorrect equipment',
      'incorrect tool', 'unsuitable equipment', 'unsuitable tool',
      'not suitable', 'not appropriate', 'not designed for',
      // Improvised
      'improvised', 'improvising', 'makeshift', 'homemade', 'fabricated',
      'modified', 'altered', 'adapted', 'jury rigged', 'jerry rigged',
      // Misuse
      'misuse', 'misused', 'misusing', 'abuse', 'abused', 'abusing',
      'used incorrectly', 'incorrect use', 'improper use', 'wrong use',
      'used for wrong purpose', 'wrong application',
      // Substitution
      'substituted', 'substitute', 'replacement', 'alternative',
      'using instead', 'in place of', 'instead of proper'
    ],
    'Defective Equipment': [
      // Defective
      'defective', 'defect', 'faulty', 'fault', 'malfunction', 'malfunctioning',
      'not working', 'doesnt work', 'broken', 'damaged', 'worn', 'worn out',
      // Condition issues
      'poor condition', 'bad condition', 'deteriorated', 'degraded',
      'corroded', 'corrosion', 'rusted', 'rusty', 'cracked', 'crack',
      'bent', 'dented', 'twisted', 'deformed', 'frayed', 'torn',
      // Known issues
      'known defect', 'known issue', 'known problem', 'existing defect',
      'pre-existing', 'reported defect', 'reported issue', 'red tagged',
      'out of service', 'quarantined', 'condemned', 'unserviceable'
    ]
  }
}

/**
 * Detect contributing factors from observation description
 * Uses CONSOLIDATED_FACTOR_KEYWORDS for comprehensive detection
 *
 * @param {string} description - The observation description text
 * @returns {Array} Array of detected factors with category, factor name, and matched keyword
 */
export const detectContributingFactors = (description) => {
  if (!description || typeof description !== 'string') {
    return []
  }

  const text = description.toLowerCase()
  const detected = []
  const seenFactors = new Set()

  // Use consolidated factor keywords for detection
  for (const [factor, keywords] of Object.entries(CONSOLIDATED_FACTOR_KEYWORDS)) {
    if (seenFactors.has(factor)) continue

    for (const keyword of keywords) {
      // Use word boundary matching for short keywords to avoid false positives
      if (keyword.length <= 5) {
        // Short keyword - use word boundary regex
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        if (regex.test(text)) {
          const category = CONSOLIDATED_FACTOR_CATEGORIES[factor] || 'Other'
          detected.push({ category, factor, keyword })
          seenFactors.add(factor)
          break // One match per factor is enough
        }
      } else {
        // Longer keyword - simple includes is fine
        if (text.includes(keyword)) {
          const category = CONSOLIDATED_FACTOR_CATEGORIES[factor] || 'Other'
          detected.push({ category, factor, keyword })
          seenFactors.add(factor)
          break // One match per factor is enough
        }
      }
    }
  }

  return detected
}

/**
 * Aggregate contributing factors across multiple incidents
 * Returns breakdown by category and by individual factor
 *
 * @param {Array} incidents - Array of incidents/observations
 * @param {string} observationType - 'negative', 'positive', or 'all' (default: 'all')
 * @returns {Object} Aggregated factor data with byFactor and byCategory breakdowns
 */
export const aggregateContributingFactors = (incidents, observationType = 'all') => {
  if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
    return {
      byFactor: [],
      byCategory: [],
      byFactorHazard: {},
      total: 0,
      analyzed: 0
    }
  }

  // Filter by observation type
  let filtered = incidents
  if (observationType === 'negative') {
    filtered = incidents.filter(i => NEGATIVE_TYPES.includes(i.type))
  } else if (observationType === 'positive') {
    filtered = incidents.filter(i => POSITIVE_TYPES.includes(i.type))
  }

  const factorCounts = {}
  const categoryCounts = {}
  const factorToCategory = {}
  const factorHazardMatrix = {}
  let analyzedCount = 0

  filtered.forEach(incident => {
    const description = incident.description || ''
    if (!description.trim()) return

    const hazard = incident.location || 'Unknown'
    const factors = detectContributingFactors(description)

    // Only count as "analyzed" if at least one factor was detected
    if (factors.length > 0) {
      analyzedCount++
    }

    // Track unique factors per incident to avoid double-counting
    const seenFactors = new Set()
    const seenCategories = new Set()

    factors.forEach(({ category, factor }) => {
      // Count each factor only once per incident
      if (!seenFactors.has(factor)) {
        seenFactors.add(factor)
        factorCounts[factor] = (factorCounts[factor] || 0) + 1
        factorToCategory[factor] = category

        // Track which hazards this factor affects
        if (!factorHazardMatrix[factor]) {
          factorHazardMatrix[factor] = {}
        }
        factorHazardMatrix[factor][hazard] = (factorHazardMatrix[factor][hazard] || 0) + 1
      }

      // Count each category only once per incident
      if (!seenCategories.has(category)) {
        seenCategories.add(category)
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })
  })

  const total = filtered.length

  return {
    byFactor: Object.entries(factorCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
        category: factorToCategory[name]
      }))
      .sort((a, b) => b.count - a.count),
    byCategory: Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count),
    byFactorHazard: factorHazardMatrix,
    total,
    analyzed: analyzedCount
  }
}

/**
 * Debug function to analyze unmatched observations
 * Use in browser console: analyzeUnmatched(incidents)
 */
export const analyzeUnmatchedObservations = (incidents, limit = 50) => {
  const NEGATIVE_TYPES = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr', 'fac', 'mti', 'lti']
  const negativeIncidents = incidents.filter(i => NEGATIVE_TYPES.includes(i.type))

  const unmatched = []
  const matched = []

  negativeIncidents.forEach(incident => {
    const description = incident.description || ''
    if (!description.trim()) return

    const factors = detectContributingFactors(description)
    if (factors.length === 0) {
      unmatched.push({
        description: description.substring(0, 200),
        hazard: incident.location,
        date: incident.date
      })
    } else {
      matched.push({ description, factors })
    }
  })

  // Extract common words from unmatched descriptions
  const wordFrequency = {}
  unmatched.forEach(obs => {
    const words = obs.description.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)

    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    })
  })

  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }))

  console.log('=== CONTRIBUTING FACTORS ANALYSIS ===')
  console.log(`Total negative observations: ${negativeIncidents.length}`)
  console.log(`Matched (have factors): ${matched.length} (${((matched.length/negativeIncidents.length)*100).toFixed(1)}%)`)
  console.log(`Unmatched (no factors): ${unmatched.length} (${((unmatched.length/negativeIncidents.length)*100).toFixed(1)}%)`)
  console.log('\n=== TOP WORDS IN UNMATCHED (add these as keywords) ===')
  console.table(topWords)
  console.log('\n=== SAMPLE UNMATCHED OBSERVATIONS ===')
  console.table(unmatched.slice(0, limit))

  return {
    total: negativeIncidents.length,
    matchedCount: matched.length,
    unmatchedCount: unmatched.length,
    matchRate: ((matched.length/negativeIncidents.length)*100).toFixed(1) + '%',
    topUnmatchedWords: topWords,
    sampleUnmatched: unmatched.slice(0, limit)
  }
}

// Expose contributing factors functions globally for browser console testing
if (typeof window !== 'undefined') {
  window.detectContributingFactors = detectContributingFactors
  window.aggregateContributingFactors = aggregateContributingFactors
  window.analyzeUnmatched = analyzeUnmatchedObservations
}
