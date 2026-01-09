/**
 * Context-Aware HSE Classification Mapping Tables
 * Production-Ready: Complete outcomes, objects, actions, and disambiguation rules
 *
 * Philosophy: Understand the risk (potential outcome) BEFORE assigning the category.
 */

// ============================================================================
// SECTION A: POTENTIAL OUTCOMES → HAZARD CATEGORY MAPPING
// Maps harm mechanisms to significant hazard categories
// ============================================================================

export const OUTCOME_TO_HAZARD = {
  // Energized System outcomes
  'electrocution': 'Energized System',
  'electric shock': 'Energized System',
  'electrical shock': 'Energized System',
  'electrical burn': 'Energized System',
  'arc flash': 'Energized System',
  'arc blast': 'Energized System',
  'electrical contact': 'Energized System',
  'electrical injury': 'Energized System',
  'shocked': 'Energized System',
  'electrocuted': 'Energized System',

  // Working at Height outcomes
  'fall from height': 'Working at Height',
  'falling from height': 'Working at Height',
  'fell from height': 'Working at Height',
  'fall from elevation': 'Working at Height',
  'falling from elevation': 'Working at Height',
  'fell off': 'Working at Height',
  'dropped from height': 'Working at Height',
  'plummeted': 'Working at Height',
  'fall off scaffold': 'Working at Height',
  'fall off ladder': 'Working at Height',
  'fall through opening': 'Working at Height',
  'fall from platform': 'Working at Height',
  'fall from roof': 'Working at Height',

  // Mobile Plant & Equipment outcomes
  'struck by vehicle': 'Mobile Plant & Equipment',
  'struck by equipment': 'Mobile Plant & Equipment',
  'struck by machine': 'Mobile Plant & Equipment',
  'struck by plant': 'Mobile Plant & Equipment',
  'run over': 'Mobile Plant & Equipment',
  'ran over': 'Mobile Plant & Equipment',
  'crushing': 'Mobile Plant & Equipment',
  'crushed': 'Mobile Plant & Equipment',
  'pinned': 'Mobile Plant & Equipment',
  'pinned by': 'Mobile Plant & Equipment',
  'caught between': 'Mobile Plant & Equipment',
  'caught in': 'Mobile Plant & Equipment',
  'machine contact': 'Mobile Plant & Equipment',
  'equipment strike': 'Mobile Plant & Equipment',
  'hit by excavator': 'Mobile Plant & Equipment',
  'hit by forklift': 'Mobile Plant & Equipment',
  'hit by crane': 'Mobile Plant & Equipment',
  'struck by boom': 'Mobile Plant & Equipment',
  'struck by bucket': 'Mobile Plant & Equipment',
  'line of fire': 'Mobile Plant & Equipment', // NOT Fire!

  // Driving outcomes
  'vehicle collision': 'Driving',
  'road accident': 'Driving',
  'traffic collision': 'Driving',
  'car crash': 'Driving',
  'truck crash': 'Driving',
  'rollover': 'Driving',
  'rolled over': 'Driving',
  'vehicle overturn': 'Driving',
  'head on collision': 'Driving',
  'rear end collision': 'Driving',
  'side impact': 'Driving',
  'vehicle incident': 'Driving',
  'driving accident': 'Driving',
  'road traffic accident': 'Driving',
  'rta': 'Driving',

  // Confined Spaces outcomes
  'asphyxiation': 'Confined Spaces',
  'asphyxiated': 'Confined Spaces',
  'suffocation': 'Confined Spaces',
  'suffocated': 'Confined Spaces',
  'oxygen depletion': 'Confined Spaces',
  'oxygen deficiency': 'Confined Spaces',
  'toxic atmosphere': 'Confined Spaces',
  'toxic exposure in confined': 'Confined Spaces',
  'engulfment': 'Confined Spaces',
  'engulfed': 'Confined Spaces',
  'trapped in confined': 'Confined Spaces',
  'overcome by fumes': 'Confined Spaces',
  'lack of oxygen': 'Confined Spaces',

  // Working on or Near Water outcomes
  'drowning': 'Working on or Near Water',
  'drowned': 'Working on or Near Water',
  'submersion': 'Working on or Near Water',
  'submerged': 'Working on or Near Water',
  'water immersion': 'Working on or Near Water',
  'swept away': 'Working on or Near Water',
  'fell into water': 'Working on or Near Water',
  'fell in river': 'Working on or Near Water',
  'fell overboard': 'Working on or Near Water',

  // Fire outcomes
  'burn': 'Fire',
  'burns': 'Fire',
  'burned': 'Fire',
  'burnt': 'Fire',
  'thermal burn': 'Fire',
  'thermal injury': 'Fire',
  'fire injury': 'Fire',
  'smoke inhalation': 'Fire',
  'flash fire': 'Fire',
  'caught fire': 'Fire',
  'engulfed in flames': 'Fire',
  'fire spread': 'Fire',

  // Hot Work outcomes
  'explosion': 'Hot Work',
  'exploded': 'Hot Work',
  'blast': 'Hot Work',
  'welding fire': 'Hot Work',
  'cutting fire': 'Hot Work',
  'sparks ignition': 'Hot Work',
  'spark ignited': 'Hot Work',
  'molten metal burn': 'Hot Work',
  'slag burn': 'Hot Work',
  'weld spatter': 'Hot Work',
  'flash burn': 'Hot Work',
  'welding injury': 'Hot Work',

  // Breaking Ground & Excavation outcomes
  'cave-in': 'Breaking Ground & Excavation',
  'cave in': 'Breaking Ground & Excavation',
  'caved in': 'Breaking Ground & Excavation',
  'trench collapse': 'Breaking Ground & Excavation',
  'excavation collapse': 'Breaking Ground & Excavation',
  'soil collapse': 'Breaking Ground & Excavation',
  'ground failure': 'Breaking Ground & Excavation',
  'burial': 'Breaking Ground & Excavation',
  'buried': 'Breaking Ground & Excavation',
  'buried alive': 'Breaking Ground & Excavation',
  'struck utility': 'Breaking Ground & Excavation',
  'hit underground service': 'Breaking Ground & Excavation',

  // Lifting outcomes
  'dropped load': 'Lifting',
  'load dropped': 'Lifting',
  'falling load': 'Lifting',
  'suspended load strike': 'Lifting',
  'struck by load': 'Lifting',
  'rigging failure': 'Lifting',
  'sling failure': 'Lifting',
  'crane tip': 'Lifting',
  'crane tipped': 'Lifting',
  'crane overturn': 'Lifting',
  'load swing': 'Lifting',
  'swinging load': 'Lifting',
  'load shift': 'Lifting',
  'uncontrolled load': 'Lifting',

  // Temporary Works outcomes
  'structural collapse': 'Temporary Works',
  'structure collapse': 'Temporary Works',
  'formwork failure': 'Temporary Works',
  'formwork collapse': 'Temporary Works',
  'scaffold collapse': 'Temporary Works',
  'scaffolding collapse': 'Temporary Works',
  'support failure': 'Temporary Works',
  'shoring failure': 'Temporary Works',
  'propping failure': 'Temporary Works',
  'false work collapse': 'Temporary Works',

  // Working in Heat outcomes
  'heat stroke': 'Working in Heat',
  'heatstroke': 'Working in Heat',
  'heat exhaustion': 'Working in Heat',
  'heat stress': 'Working in Heat',
  'hyperthermia': 'Working in Heat',
  'dehydration': 'Working in Heat',
  'heat cramps': 'Working in Heat',
  'heat syncope': 'Working in Heat',
  'heat collapse': 'Working in Heat',
  'overheating': 'Working in Heat',

  // Working on or Near Live Roads outcomes
  'traffic incident': 'Working on or Near Live Roads',
  'highway strike': 'Working on or Near Live Roads',
  'road worker struck': 'Working on or Near Live Roads',
  'vehicle intrusion': 'Working on or Near Live Roads',
  'hit by passing vehicle': 'Working on or Near Live Roads',
  'struck by traffic': 'Working on or Near Live Roads',
  'work zone incident': 'Working on or Near Live Roads',
  'roadside incident': 'Working on or Near Live Roads'
}

// ============================================================================
// SECTION B: HAZARD OBJECTS → CATEGORY MAPPING
// Physical sources of harm mapped to their primary hazard category
// ============================================================================

export const HAZARD_OBJECTS = {
  'Energized System': [
    'electrical panel', 'electrical box', 'distribution board', 'switchboard',
    'cable', 'cables', 'wire', 'wires', 'wiring', 'conductor',
    'transformer', 'substation', 'switchgear', 'circuit breaker', 'breaker',
    'power line', 'powerline', 'overhead line', 'transmission line',
    'junction box', 'outlet', 'socket', 'receptacle',
    'meter', 'electric meter', 'energy meter',
    'generator', 'genset', 'alternator',
    'battery', 'batteries', 'battery bank', 'ups',
    'capacitor', 'capacitors',
    'busbar', 'bus bar', 'bus duct',
    'fuse box', 'fuse', 'fuses',
    'conduit', 'electrical conduit', 'cable tray',
    'isolator', 'disconnect', 'disconnect switch',
    'motor', 'electric motor', 'pump motor',
    'control panel', 'mcc', 'motor control center',
    'live wire', 'energized', 'live equipment',
    // Improper connections & appliances
    'improper electrical connection', 'improper connection', 'electrical connection',
    'kettle', 'heater', 'electric heater', 'space heater', 'extension cord',
    'power strip', 'multi plug', 'overloaded socket', 'daisy chain'
  ],

  'Working at Height': [
    'scaffold', 'scaffolding', 'scaffolds', 'tube and fitting',
    'ladder', 'ladders', 'step ladder', 'extension ladder', 'a-frame',
    'roof', 'rooftop', 'roofing', 'roof edge', 'roof access',
    'edge', 'leading edge', 'unprotected edge', 'open edge',
    'platform', 'elevated platform', 'work platform', 'access platform',
    'mast', 'mast climber', 'tower', 'communication tower',
    'cherry picker', 'boom lift', 'scissor lift', 'mewp', 'ewp',
    'access tower', 'mobile tower', 'tower scaffold',
    'stairway', 'stairs', 'stairwell', 'staircase',
    'opening', 'floor opening', 'void', 'shaft', 'penetration',
    'skylight', 'fragile roof', 'fragile surface',
    'elevated work area', 'high level', 'above ground',
    'handrail', 'guardrail', 'edge protection', 'toe board',
    'harness', 'lanyard', 'fall arrest', 'lifeline', 'anchor point',
    'attic', 'loft', 'mezzanine', 'balcony', 'gantry'
  ],

  'Mobile Plant & Equipment': [
    'excavator', 'excavators', 'digger', 'backhoe', 'tracked excavator',
    'bulldozer', 'dozer', 'crawler', 'd6', 'd8', 'd9',
    'crane', 'cranes', 'tower crane', 'mobile crane', 'crawler crane',
    'forklift', 'forklifts', 'fork lift', 'reach truck', 'pallet truck',
    'dump truck', 'dumper', 'tipper', 'haul truck', 'articulated dump',
    'loader', 'front end loader', 'wheel loader', 'skid steer', 'bobcat',
    'roller', 'compactor', 'road roller', 'vibratory roller',
    'grader', 'motor grader',
    'piling rig', 'pile driver', 'drilling rig', 'bore pile',
    'concrete mixer', 'mixer truck', 'transit mixer', 'agitator',
    'telehandler', 'telescopic handler', 'rough terrain forklift',
    'jcb', 'backhoe loader',
    'compactor', 'plate compactor', 'rammer',
    'concrete pump', 'boom pump', 'line pump',
    'asphalt paver', 'paver', 'finisher',
    'road sweeper', 'sweeper',
    'water truck', 'water bowser', 'tanker',
    'mobile plant', 'heavy equipment', 'machinery', 'machine',
    // Aerial work platforms
    'manlift', 'man lift', 'aerial lift', 'basket', 'lift basket',
    'operating the manlift', 'operator', 'standing on the side',
    'electrical water pump', 'water pump', 'pump near water'
  ],

  'Fire': [
    'flame', 'flames', 'open flame', 'naked flame',
    'spark', 'sparks', 'electrical spark',
    'fuel', 'petrol', 'gasoline', 'diesel', 'kerosene',
    'gas cylinder', 'gas bottle', 'lpg', 'propane', 'acetylene',
    'flammable liquid', 'flammable', 'combustible', 'inflammable',
    'ignition source', 'heat source', 'hot surface',
    'candle', 'lighter', 'match', 'matches',
    'fire', 'fire hazard', 'fire risk',
    'oxygen', 'oxidizer', 'oxidizing agent',
    'chemical', 'solvent', 'thinner', 'paint',
    'electrical fire', 'short circuit'
  ],

  'Confined Spaces': [
    'tank', 'tanks', 'storage tank', 'water tank', 'fuel tank',
    'vessel', 'pressure vessel', 'reactor',
    'pit', 'pits', 'inspection pit', 'valve pit',
    'silo', 'silos', 'hopper', 'bin',
    'manhole', 'manholes', 'access chamber',
    'chamber', 'chambers', 'underground chamber',
    'vault', 'vaults', 'utility vault',
    'tunnel', 'tunnels', 'culvert', 'pipe tunnel',
    'trench', 'trenches', 'deep trench',
    'duct', 'ducts', 'ductwork', 'air duct',
    'pipeline', 'pipe', 'pipes', 'large diameter pipe',
    'septic tank', 'cesspool', 'cesspit',
    'well', 'wells', 'shaft', 'shafts',
    'enclosed space', 'restricted space', 'limited access',
    'hard protection', 'confined space protection'
  ],

  'Driving': [
    'vehicle', 'vehicles', 'motor vehicle',
    'car', 'cars', 'automobile',
    'truck', 'trucks', 'lorry', 'hgv', 'lgv',
    'bus', 'buses', 'coach', 'minibus',
    'van', 'vans', 'delivery van', 'panel van',
    'motorcycle', 'motorbike', 'scooter',
    'pickup', 'pickup truck', 'ute',
    'suv', '4x4', 'four wheel drive',
    'company vehicle', 'fleet vehicle', 'pool car',
    'road', 'highway', 'motorway', 'freeway'
  ],

  'Lifting': [
    'crane', 'hoist', 'winch', 'block and tackle',
    'sling', 'slings', 'web sling', 'chain sling', 'wire rope sling',
    'rigging', 'rigging equipment', 'lifting gear',
    'shackle', 'shackles', 'd shackle', 'bow shackle',
    'hook', 'hooks', 'crane hook', 'lifting hook',
    'chain', 'chains', 'lifting chain', 'chain block',
    'wire rope', 'steel rope', 'cable',
    'load', 'loads', 'suspended load', 'lifted load',
    'lifting beam', 'spreader beam', 'lifting frame',
    'spreader bar', 'equalizer beam',
    'eye bolt', 'lifting eye', 'pad eye',
    'swivel', 'turnbuckle',
    'exclusion zone', 'exclusion zones', 'lifting zone', 'drop zone'
  ],

  'Working on or Near Water': [
    'river', 'rivers', 'stream', 'creek',
    'pond', 'ponds', 'lake', 'lakes', 'reservoir',
    'sea', 'ocean', 'marine', 'offshore',
    'canal', 'canals', 'waterway',
    'dock', 'docks', 'wharf', 'quay', 'pier', 'jetty',
    'barge', 'barges', 'vessel', 'boat', 'ship',
    'water body', 'body of water', 'open water',
    'flood water', 'flooded', 'flooding',
    'swimming pool', 'pool', 'water tank',
    'drainage', 'drain', 'storm water', 'stormwater'
  ],

  'Hot Work': [
    'welding equipment', 'welder', 'welding machine', 'mig welder', 'tig welder',
    'cutting torch', 'oxy torch', 'gas torch', 'plasma cutter',
    'grinder', 'angle grinder', 'disc grinder', 'grinding wheel',
    'hot metal', 'molten metal', 'molten material',
    'brazing equipment', 'brazing torch',
    'soldering iron', 'soldering equipment',
    'heat gun', 'hot air gun',
    'welding rod', 'electrode', 'filler wire',
    'welding slag', 'spatter', 'weld spatter'
  ],

  'Breaking Ground & Excavation': [
    'excavation', 'excavations', 'dig', 'digging',
    'trench', 'trenches', 'trenching',
    'hole', 'holes', 'pit', 'pits',
    'foundation', 'foundations', 'footing',
    'ground opening', 'earth opening',
    'utilities', 'underground utilities', 'buried services',
    'underground service', 'underground cable', 'underground pipe',
    'gas main', 'water main', 'sewer', 'storm drain',
    'soil', 'earth', 'ground', 'spoil'
  ],

  'Temporary Works': [
    'formwork', 'shuttering', 'falsework',
    'shoring', 'shores', 'props', 'propping',
    'bracing', 'braces', 'lateral support',
    'temporary structure', 'temporary support',
    'hoarding', 'site hoarding', 'fencing',
    'temporary platform', 'temporary access',
    'edge protection', 'temporary guardrail',
    'access ramp', 'temporary ramp'
  ],

  'Working in Heat': [
    'hot environment', 'hot weather', 'high temperature',
    'sun', 'sunlight', 'direct sun', 'solar radiation',
    'heat', 'extreme heat', 'hot conditions',
    'furnace', 'oven', 'kiln', 'boiler'
  ],

  'Working on or Near Live Roads': [
    'live road', 'live traffic', 'open road',
    'highway', 'motorway', 'freeway', 'expressway',
    'traffic lane', 'travel lane', 'carriageway',
    'work zone', 'construction zone', 'road works',
    'traffic management', 'traffic control',
    'road closure', 'lane closure'
  ],

  // ============================================================================
  // SUB-SIGNIFICANT HAZARD OBJECTS (NEW - 17 categories added)
  // ============================================================================

  'Site Welfare': [
    // Water
    'drinking water', 'potable water', 'water cooler', 'water dispenser', 'water station',
    'water supply', 'water bottle', 'hydration', 'dehydrated', 'no water', 'water not provided',
    'water not available', 'lack of water', 'insufficient water',
    // Toilets
    'toilet', 'toilets', 'toilet facility', 'toilet facilities', 'restroom', 'bathroom',
    'lavatory', 'latrine', 'portable toilet', 'porta potty', 'sanitation', 'urinal',
    'toilet checklist', 'toilet inspection', 'washroom', 'wc',
    // Rest Areas
    'welfare', 'welfare facility', 'welfare area', 'rest shelter', 'rest area', 'break room',
    'rest room', 'shade', 'shaded area', 'cooling area', 'resting place', 'shelter',
    // Food
    'canteen', 'mess hall', 'mess', 'cafeteria', 'kitchen', 'food', 'meal', 'lunch',
    'breakfast', 'dinner', 'eating area', 'dining', 'food poisoning', 'sick from food',
    // Hygiene
    'hygiene', 'cleanliness', 'hand wash', 'hand washing', 'soap', 'sanitizer', 'sanitiser',
    'hand sanitizer', 'washing facility', 'shower', 'changing room', 'locker room'
  ],

  'PPE': [
    // General PPE
    'ppe', 'personal protective equipment', 'protective equipment', 'safety equipment',
    'not wearing ppe', 'without ppe', 'ppe not worn', 'improper ppe', 'incomplete ppe',
    'ppe compliance', 'ppe violation', 'ppe missing',
    // Eye Protection
    'safety glasses', 'safety goggles', 'eye protection', 'goggles', 'face shield',
    'welding mask', 'welding helmet', 'visor', 'eye wear', 'protective eyewear',
    // Hearing Protection
    'ear protection', 'hearing protection', 'ear muffs', 'ear plugs', 'ear defender',
    'ear defenders', 'hearing ppe', 'noise protection',
    // Hand Protection
    'gloves', 'safety gloves', 'work gloves', 'leather gloves', 'cut resistant gloves',
    'chemical gloves', 'welding gloves', 'hand protection', 'rubber gloves',
    // Head Protection
    'hard hat', 'helmet', 'safety helmet', 'bump cap', 'head protection',
    'hard hats', 'helmets', 'chin strap',
    // High Visibility
    'hi-vis', 'hi vis', 'high visibility', 'high-visibility', 'reflective vest',
    'safety vest', 'reflective jacket', 'visibility vest', 'reflective clothing',
    // Foot Protection
    'safety boots', 'steel toe', 'steel cap', 'safety shoes', 'protective footwear',
    'safety footwear', 'work boots', 'steel toe cap', 'toe cap',
    // Respiratory
    'respirator', 'dust mask', 'face mask', 'breathing apparatus', 'scba', 'n95',
    'respiratory protection', 'air mask', 'half mask', 'full face mask',
    // Body Protection
    'coverall', 'overalls', 'protective clothing', 'safety suit', 'apron',
    'tyvek suit', 'chemical suit', 'body protection',
    // Fall Protection (PPE specific)
    'harness', 'full body harness', 'fbh', 'lanyard', 'fall arrest', 'safety harness',
    'shock absorber', 'retractable lanyard', 'self retracting lifeline', 'srl'
  ],

  'Housekeeping': [
    'housekeeping', 'house keeping', 'cleanup', 'clean up', 'cleaning', 'clean',
    'tidy', 'tidying', 'organized', 'organisation', 'organization',
    'poor housekeeping', 'good housekeeping', 'housekeeping issue',
    // Waste
    'waste', 'waste bin', 'rubbish', 'garbage', 'trash', 'debris', 'litter',
    'food waste', 'wrappers', 'refuse', 'waste management', 'bin overflowing',
    'overflowing bin', 'waste disposal', 'empty bags', 'cement bags', 'empty cement bags',
    // Disorder
    'clutter', 'cluttered', 'mess', 'messy', 'disorganized', 'untidy',
    'scattered', 'strewn', 'disorder', 'disorderly',
    // Hazards - Rebar & Sharp Objects
    'spillage', 'spill', 'slippery', 'wet floor', 'oil on floor', 'slipping hazard',
    'protruding nail', 'protruding nails', 'sharp edge', 'sharp edges',
    'trip hazard', 'tripping hazard', 'obstruction',
    'rebar cap', 'rebar caps', 'protruding rebar', 'exposed rebar', 'protruding rebars',
    'exposed rebars', 'rebar without cap', 'without rebar cap', 'no rebar cap',
    'steel bar without', 'exposed steel', 'sharp steel', 'puncture hazard',
    'impalement hazard', 'impalement', 'tie rod', 'tie rods', 'extended rebars',
    // Wood & Timber hazards
    'wood timber', 'wood timbers', 'wooden planks', 'timber with nails', 'nails not removed',
    'unwanted wood', 'wood materials', 'planks with nails',
    'exposed nails', 'exposed nail', 'timber with exposed nails',
    'falling object hazard', 'falling object', 'falling objects',
    'spikes protruding', 'spikes', 'protruding spikes',
    'slip trip fall', 'slip, trip, and fall', 'slip trip and fall',
    // Storage
    'stacked improperly', 'improper storage', 'stored incorrectly', 'unstable stack',
    'materials scattered', 'poor storage', 'improper stacking', 'unsecured materials',
    'without proper barrication', 'rebar storage', 'storage area without',
    // Misc housekeeping
    'empty oil can', 'oil can', 'polythene covering', 'without covering',
    'water drum', 'need to be removed', 'not removed from site'
  ],

  'Emergency Preparedness': [
    // Fire Equipment
    'fire extinguisher', 'extinguisher', 'fire suppression', 'fire hose',
    'fire blanket', 'fire bucket', 'fire hydrant', 'extinguisher inspection',
    'extinguisher expired', 'extinguisher not inspected', 'fire fighting equipment',
    // First Aid
    'first aid', 'first aid kit', 'first aid box', 'first aider', 'medical kit',
    'bandage', 'medical supplies', 'eyewash', 'eye wash station', 'first aider unavailable',
    'no first aider', 'first aid box checklist', 'medical emergency',
    // Emergency Response
    'ambulance', 'ambulance checklist', 'emergency vehicle', 'medical response',
    'emergency spill kit', 'spill kit', 'spill response', 'emergency response',
    // Evacuation
    'assembly point', 'muster point', 'evacuation', 'evacuation route',
    'emergency exit', 'fire exit', 'escape route', 'emergency plan',
    'evacuation plan', 'emergency procedure', 'fire escape',
    // Alarms
    'fire alarm', 'alarm system', 'emergency alarm', 'siren', 'warning system',
    'alarm test', 'fire alarm test', 'smoke detector', 'smoke alarm',
    // Emergency Equipment
    'aed', 'defibrillator', 'stretcher', 'emergency shower', 'rescue equipment',
    'emergency lighting', 'emergency generator', 'backup power',
    'emergency contact', 'emergency contact number', 'emergency number displayed'
  ],

  'Safety Supervision': [
    'safety officer', 'safety supervisor', 'safety personnel', 'safety team',
    'safety coverage', 'safety oversight', 'supervision', 'supervised',
    'unsupervised', 'no supervision', 'without supervision', 'lack of supervision',
    'safety presence', 'safety representative', 'safety coordinator',
    'hse officer', 'hse manager', 'safety manager', 'hse supervisor',
    'safety officer not present', 'no safety officer', 'without safety officer',
    'safety officer absent', 'safety officer unavailable',
    'lap', 'lifting appointed person', 'appointed person', 'competent supervisor',
    'banksman', 'signal person', 'spotter', 'flagman', 'signalman',
    'safety watch', 'hole watch', 'fire watch', 'confined space attendant',
    'permit holder', 'permit issuer', 'area authority',
    // Site Inspection & Walkthrough patterns
    'site inspection', 'morning inspection', 'morning site inspection', 'daily inspection',
    'weekly inspection', 'walkthrough', 'site walkthrough', 'management walkthrough',
    'project management walkthrough', 'hsse raised', 'observations raised',
    'raised observations', 'submitted for rectification', 'closed within',
    'observations were closed', 'tksac', 'tcc', 'rectification',
    'actively participated', 'inspection it was observed'
  ],

  'Training and Competency': [
    // Briefings
    'toolbox talk', 'tbt', 'safety toolbox', 'toolbox meeting', 'toolbox',
    'pre-task briefing', 'ptb', 'briefing', 'pre-task', 'pre task',
    'safety briefing', 'morning briefing', 'daily briefing', 'shift briefing',
    'safety standdown', 'stand down', 'standout', 'safety meeting',
    // Risk Assessment
    'lmra', 'last minute risk assessment', 'field level risk assessment',
    'flra', 'take 5', 'step back 5', 'take five', 'dynamic risk assessment',
    // Training
    'training', 'trained', 'untrained', 'induction', 'site induction',
    'safety induction', 'orientation', 'onboarding', 'training record',
    'refresher training', 'training expired', 'no training',
    // Competency
    'competent', 'competent person', 'competency', 'qualified', 'certified',
    'certificate', 'certification', 'license', 'licence', 'permit',
    'experienced', 'inexperienced', 'skill', 'capability', 'authorized',
    'authorised', 'not authorized', 'not certified', 'expired certification'
  ],

  'Safety Sign': [
    'signage', 'sign', 'signs', 'safety sign', 'safety signage',
    'warning sign', 'caution sign', 'danger sign', 'hazard sign',
    'notice', 'poster', 'label', 'labeling', 'labelling',
    'no signage', 'missing sign', 'sign not installed', 'sign missing',
    'faded sign', 'illegible sign', 'damaged sign', 'sign not visible',
    'mandatory sign', 'prohibition sign', 'information sign',
    'exit sign', 'directional sign', 'instruction sign',
    'safety poster', 'warning notice', 'caution notice', 'hazard notice',
    'signboard', 'sign board', 'sign post', 'signpost',
    // Bulletin boards and campaigns
    'bulletin board', 'bulletin', 'notice board', 'information board',
    'campaign', 'safety campaign', 'weekly campaign', 'campaign board',
    'eltizam', 'bord', 'board not clear', 'not translated',
    'survey marking', 'marking bar', 'survey bar'
  ],

  'Barricades': [
    'barricade', 'barricades', 'barrier', 'barriers', 'barricading',
    'fencing', 'fence', 'fenced', 'unfenced', 'temporary fence',
    'delineator', 'delineators', 'cone', 'cones', 'traffic cone', 'witches hat',
    'tape', 'warning tape', 'hazard tape', 'barrier tape', 'caution tape',
    'guardrail', 'guard rail', 'handrail', 'hand rail', 'railing',
    'edge protection', 'fall protection barrier', 'safety barrier',
    'barricade open', 'barricade missing', 'no barricade', 'without barricade',
    'unprotected edge', 'unbarricaded', 'open excavation', 'unprotected opening',
    'soil berm', 'earth berm', 'physical barrier', 'hard barrier',
    // Excavation protection
    'unprotected excavated', 'excavated area', 'unprotected area',
    'open floor', 'open floors', 'falling hazard', 'fall hazard',
    'unsecured grating', 'grating', 'floor grating', 'open grating',
    'green mesh', 'safety mesh', 'mesh replaced'
  ],

  'Dust Control': [
    'dust', 'dust control', 'dust suppression', 'dust mitigation',
    'water sprinkling', 'water spraying', 'water spray', 'sprinkling',
    'air quality', 'airborne dust', 'dust pollution', 'dusty',
    'visibility', 'low visibility', 'reduced visibility', 'poor visibility',
    'respiratory hazard', 'inhalation hazard', 'breathing hazard',
    'dust mask', 'respirator', 'dust extraction', 'ventilation',
    'dust collector', 'dust control measure', 'wet cutting',
    'soil compaction', 'dust free', 'no dust control'
  ],

  'Tools': [
    'tool', 'tools', 'hand tool', 'hand tools', 'power tool', 'power tools',
    'equipment', 'machinery', 'machine', 'apparatus', 'device',
    // Specific Tools
    'wheelbarrow', 'hammer', 'drill', 'grinder', 'saw', 'chisel',
    'wrench', 'spanner', 'screwdriver', 'pliers', 'cutter', 'knife',
    'crowbar', 'pry bar', 'shovel', 'pick', 'axe', 'sledgehammer',
    'pressure washer', 'pressure washing', 'power washer',
    // Inspection
    'inspection tag', 'inspection sticker', 'color coding', 'colour coding',
    'color coded', 'colour coded', 'tagged', 'tagging', 'inspection date',
    'checklist', 'daily inspection', 'tool inspection', 'equipment inspection',
    'quarterly inspection', 'monthly inspection', 'weekly inspection',
    'checklist updated', 'checklist not updated', 'inspection checklist',
    // Condition
    'damaged tool', 'damaged equipment', 'defective', 'faulty', 'broken',
    'broken tool', 'worn out', 'unserviceable', 'malfunctioning',
    'damaged', 'deformed', 'cracked', 'corroded'
  ],

  'Site Security': [
    'security', 'security gate', 'security checkpoint', 'guard', 'security guard',
    'cctv', 'camera', 'surveillance', 'monitoring', 'cctv system',
    'entry log', 'exit log', 'access log', 'log sheet', 'logbook',
    'unauthorized', 'unauthorised', 'unauthorized access', 'trespassing',
    'restricted area', 'controlled access', 'access control',
    'stop barrier', 'security barrier', 'boom gate', 'turnstile',
    'id badge', 'access card', 'security pass', 'visitor pass', 'site pass',
    'perimeter', 'perimeter fence', 'boundary', 'site boundary',
    'intruder', 'intrusion', 'theft', 'vandalism'
  ],

  'Traffic Management': [
    'traffic', 'traffic management', 'traffic control', 'traffic plan',
    'parking', 'parking area', 'designated parking', 'car park', 'vehicle parking',
    'wheel chock', 'wheel chocks', 'wheel stopper', 'chock', 'chocks',
    'vehicle movement', 'traffic flow', 'one way', 'two way',
    'pedestrian', 'pedestrians', 'walkway', 'footpath', 'crossing',
    'pedestrian crossing', 'zebra crossing', 'pedestrian route',
    'speed limit', 'speed bump', 'speed hump', 'rumble strip',
    'traffic sign', 'road marking', 'road markings', 'road sign',
    'traffic marshal', 'traffic controller', 'flagman',
    'segregation', 'vehicle pedestrian segregation', 'haul route'
  ],

  'COSHH': [
    'chemical', 'chemicals', 'hazardous substance', 'hazardous material',
    'toxic', 'corrosive', 'flammable liquid', 'inflammable', 'hazmat',
    'fuel leakage', 'fuel leak', 'diesel spillage', 'oil spill', 'oil leak',
    'contamination', 'contaminated', 'contaminated soil', 'pollution',
    'msds', 'sds', 'safety data sheet', 'coshh assessment', 'coshh',
    'chemical storage', 'chemical cabinet', 'flammable cabinet', 'bunded area',
    'acid', 'solvent', 'paint', 'thinner', 'adhesive', 'glue',
    'hazmat', 'dangerous goods', 'dg', 'classified substance',
    'secondary containment', 'drip tray', 'bund', 'spill containment',
    'water analysis', 'water test', 'water quality'
  ],

  'Access': [
    'access', 'egress', 'entry', 'exit', 'entrance', 'doorway',
    'obstructed', 'blocked', 'obstruction', 'blockage', 'blocked access',
    'safe access', 'safe entry', 'safe exit', 'safe egress',
    'access route', 'escape route', 'means of escape', 'exit route',
    'access ladder', 'access stairs', 'access platform', 'access point',
    'restricted access', 'no access', 'access denied', 'access blocked',
    'entry point', 'exit point', 'ingress', 'means of access'
  ],

  'BBS': [
    // Positive
    'positive observation', 'positive', 'good practice', 'best practice',
    'well done', 'good job', 'excellent', 'commendable', 'outstanding',
    'best performer', 'recognition', 'reward', 'incentive', 'gift card',
    'positive culture', 'safety culture', 'safe behavior', 'safe behaviour',
    'proactive', 'safety conscious', 'safety awareness',
    'possitive observation', 'found possitive', 'also found possitive',
    'suggestion box', 'ideas and feedback', 'continuous improvement',
    'open communication', 'overconfidence', 'lack of proper positioning',
    // Campaigns
    'safe driving campaign', 'driving campaign', 'campaign was found',
    'campaign ongoing', 'neom walkthrough',
    // Negative (for context)
    'unsafe act', 'unsafe action', 'at-risk behavior', 'at-risk behaviour',
    'violation', 'non-compliance', 'shortcut', 'risk taking',
    'unsafe behavior', 'unsafe behaviour', 'risky behavior', 'risky behaviour',
    'complacency', 'complacent', 'negligence', 'negligent'
  ],

  'Permit and RAMS': [
    'permit', 'work permit', 'ptw', 'permit to work', 'permit system',
    'hot work permit', 'excavation permit', 'confined space permit',
    'electrical permit', 'lifting permit', 'working at height permit',
    'rams', 'risk assessment', 'method statement', 'safe work method',
    'swms', 'jsea', 'jsa', 'job safety analysis', 'job hazard analysis',
    'lmra', 'flra', 'task risk assessment', 'site specific risk assessment',
    'ira', 'initial risk assessment', 'dynamic risk assessment',
    'safe system of work', 'ssow', 'safe work procedure', 'work instruction'
  ],

  'Work Environment': [
    // Lighting
    'lighting', 'light', 'illumination', 'poor lighting', 'insufficient lighting',
    'dark', 'dim', 'bright', 'glare', 'task lighting', 'area lighting',
    'low light', 'inadequate lighting', 'lighting level',
    // Weather
    'weather', 'weather conditions', 'rain', 'raining', 'wind', 'windy',
    'storm', 'lightning', 'hot weather', 'cold weather', 'adverse weather',
    'weather station', 'weather monitoring', 'weather alert',
    // Noise
    'noise', 'noisy', 'loud', 'hearing', 'noise level', 'noise hazard',
    'excessive noise', 'noise exposure', 'noise assessment',
    // Vibration
    'vibration', 'vibrating', 'hand arm vibration', 'whole body vibration',
    'havs', 'wbv', 'vibration exposure',
    // Temperature
    'temperature', 'hot', 'cold', 'heat', 'freezing', 'thermal',
    'extreme temperature', 'working in heat', 'working in cold',
    // General
    'environment', 'working conditions', 'workplace', 'work area', 'site conditions',
    'working environment', 'site environment', 'condition', 'conditions'
  ]
}

// ============================================================================
// SECTION C: ACTIONS → EXPOSURE TYPE MAPPING
// Verbs/activities that create exposure to hazards
// ============================================================================

export const HAZARD_ACTIONS = {
  // Movement/Vehicle actions → Driving, Mobile Plant
  'movement': [
    'driving', 'drove', 'drive', 'driver',
    'reversing', 'reversed', 'reverse', 'backing', 'backed',
    'operating', 'operated', 'operate', 'operator',
    'moving', 'moved', 'move',
    'travelling', 'traveled', 'travel',
    'maneuvering', 'manoeuvring', 'maneuvered',
    'turning', 'turned', 'turn',
    'accelerating', 'accelerated',
    'braking', 'braked', 'brake',
    'steering', 'steered',
    'parking', 'parked'
  ],

  // Entry/Access actions → Confined Spaces
  'entry': [
    'entering', 'entered', 'enter', 'entry',
    'accessing', 'accessed', 'access',
    'descending', 'descended', 'descend',
    'climbing into', 'climbed into',
    'going into', 'went into',
    'stepping into', 'stepped into',
    'crawling into', 'crawled into',
    'lowering into', 'lowered into'
  ],

  // Height work actions → Working at Height
  'height_work': [
    'working at height', 'work at height',
    'working on', 'worked on',
    'standing on', 'stood on',
    'climbing', 'climbed', 'climb',
    'ascending', 'ascended', 'ascend',
    'descending', 'descended', 'descend',
    'reaching over', 'reached over',
    'leaning', 'leaned', 'lean',
    'stepping onto', 'stepped onto',
    'working above', 'worked above',
    'accessing roof', 'roof access'
  ],

  // Hot work actions → Hot Work
  'hot_work': [
    'welding', 'welded', 'weld',
    'cutting', 'cut', 'torch cutting',
    'grinding', 'ground', 'grind',
    'brazing', 'brazed', 'braze',
    'soldering', 'soldered', 'solder',
    'burning', 'burned', 'burn',
    'heating', 'heated', 'heat',
    'torching', 'torched'
  ],

  // Lifting actions → Lifting
  'lifting': [
    'lifting', 'lifted', 'lift',
    'hoisting', 'hoisted', 'hoist',
    'rigging', 'rigged', 'rig',
    'slinging', 'slung', 'sling',
    'lowering', 'lowered', 'lower',
    'raising', 'raised', 'raise',
    'swinging', 'swung', 'swing',
    'positioning', 'positioned', 'position',
    'suspending', 'suspended', 'suspend',
    'cranage', 'crane operation'
  ],

  // Excavation actions → Breaking Ground
  'excavation': [
    'digging', 'dug', 'dig',
    'excavating', 'excavated', 'excavate',
    'trenching', 'trenched', 'trench',
    'boring', 'bored', 'bore',
    'drilling', 'drilled', 'drill',
    'breaking ground', 'broke ground',
    'earthworks', 'earthmoving'
  ],

  // Electrical actions → Energized System
  'electrical': [
    'connecting', 'connected', 'connect',
    'disconnecting', 'disconnected', 'disconnect',
    'energizing', 'energized', 'energize',
    'de-energizing', 'de-energized',
    'testing', 'tested', 'test',
    'working on live', 'live work',
    'isolating', 'isolated', 'isolate',
    'switching', 'switched', 'switch',
    'terminating', 'terminated', 'terminate'
  ],

  // Fall-related actions → Working at Height
  'falling': [
    'falling', 'fell', 'fall',
    'slipping', 'slipped', 'slip',
    'tripping', 'tripped', 'trip',
    'stumbling', 'stumbled', 'stumble',
    'losing balance', 'lost balance',
    'dropping', 'dropped', 'drop'
  ],

  // Crossing/Transit actions → Live Roads, Traffic
  'crossing': [
    'crossing', 'crossed', 'cross',
    'walking through', 'walked through',
    'passing', 'passed', 'pass',
    'navigating', 'navigated', 'navigate',
    'traversing', 'traversed', 'traverse'
  ],

  // Water-related actions → Working on/Near Water
  'water_work': [
    'working near water', 'work near water',
    'working over water', 'work over water',
    'crossing water', 'crossed water',
    'boarding vessel', 'boarded vessel',
    'marine operation', 'maritime'
  ],

  // ============================================================================
  // NEW ACTION GROUPS (for Sub-Significant Hazards)
  // ============================================================================

  // Inspection actions → Tools, Equipment, Compliance
  'inspection': [
    'inspecting', 'inspected', 'inspect', 'inspection',
    'checking', 'checked', 'check', 'checking on',
    'examining', 'examined', 'examine', 'examination',
    'reviewing', 'reviewed', 'review',
    'auditing', 'audited', 'audit',
    'verifying', 'verified', 'verify', 'verification',
    'monitoring', 'monitored', 'monitor',
    'observing', 'observed', 'observe', 'observation',
    'walkthrough', 'walk through', 'site inspection', 'site walk',
    'safety inspection', 'daily inspection', 'weekly inspection'
  ],

  // Maintenance actions → Tools, Equipment
  'maintenance': [
    'maintaining', 'maintained', 'maintain', 'maintenance',
    'repairing', 'repaired', 'repair', 'repairs',
    'fixing', 'fixed', 'fix',
    'replacing', 'replaced', 'replace', 'replacement',
    'servicing', 'serviced', 'service', 'serviced',
    'cleaning', 'cleaned', 'clean',
    'updating', 'updated', 'update',
    'calibrating', 'calibrated', 'calibrate', 'calibration',
    'lubricating', 'lubricated', 'lubricate'
  ],

  // Storage actions → Housekeeping
  'storage': [
    'storing', 'stored', 'store', 'storage',
    'stacking', 'stacked', 'stack', 'stacks',
    'placing', 'placed', 'place',
    'arranging', 'arranged', 'arrange',
    'organizing', 'organized', 'organize', 'organising', 'organised',
    'securing', 'secured', 'secure',
    'keeping', 'kept', 'keep',
    'putting', 'put', 'laying', 'laid'
  ],

  // Conducting/Performing actions → Training, Meetings
  'conducting': [
    'conducting', 'conducted', 'conduct',
    'performing', 'performed', 'perform',
    'carrying out', 'carried out',
    'executing', 'executed', 'execute',
    'completing', 'completed', 'complete',
    'undertaking', 'undertaken', 'undertake',
    'doing', 'done', 'did',
    'running', 'ran', 'run',
    'holding', 'held', 'hold'
  ],

  // Providing/Availability actions → Welfare, Equipment
  'providing': [
    'providing', 'provided', 'provide',
    'supplying', 'supplied', 'supply',
    'delivering', 'delivered', 'deliver',
    'available', 'unavailable', 'not available',
    'missing', 'absent', 'lacking', 'without',
    'no', 'not', 'none', 'insufficient',
    'giving', 'gave', 'given',
    'offering', 'offered', 'offer'
  ],

  // Wearing/Using actions → PPE
  'wearing': [
    'wearing', 'wore', 'wear',
    'using', 'used', 'use',
    'donning', 'donned', 'don',
    'putting on', 'put on',
    'equipped', 'equip', 'equipping',
    'not wearing', 'without wearing', 'failure to wear'
  ],

  // Installing/Setting up actions → Various
  'installing': [
    'installing', 'installed', 'install', 'installation',
    'setting up', 'set up', 'setup',
    'erecting', 'erected', 'erect',
    'assembling', 'assembled', 'assemble',
    'constructing', 'constructed', 'construct',
    'building', 'built', 'build',
    'mounting', 'mounted', 'mount',
    'placing', 'placed', 'place'
  ],

  // Removing/Dismantling actions → Various
  'removing': [
    'removing', 'removed', 'remove',
    'dismantling', 'dismantled', 'dismantle',
    'taking down', 'took down', 'take down',
    'uninstalling', 'uninstalled', 'uninstall',
    'disassembling', 'disassembled', 'disassemble',
    'stripping', 'stripped', 'strip'
  ]
}

// ============================================================================
// SECTION D: CONTEXT DISAMBIGUATION RULES
// Override rules for commonly misclassified phrases
// ============================================================================

export const DISAMBIGUATION_RULES = [
  // Fire-related disambiguations (commonly misclassified)
  { pattern: 'line of fire', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'struck-by hazard, not fire hazard' },
  { pattern: 'in the line of fire', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'struck-by hazard' },
  { pattern: 'fire extinguisher', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'safety equipment, not fire hazard' },
  { pattern: 'fire extinguisher missing', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'equipment availability' },
  { pattern: 'fire extinguisher expired', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'equipment maintenance' },
  { pattern: 'fire exit', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'egress route' },
  { pattern: 'fire escape', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'egress route' },
  { pattern: 'fire drill', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'training/exercise' },
  { pattern: 'fire alarm', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'safety equipment' },
  { pattern: 'fire alarm test', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'equipment testing' },
  { pattern: 'fire watch', wrongCategory: 'Fire', correctCategory: 'Hot Work', reason: 'hot work control measure' },
  { pattern: 'fire watcher', wrongCategory: 'Fire', correctCategory: 'Hot Work', reason: 'hot work control' },
  { pattern: 'fire blanket', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'safety equipment' },
  { pattern: 'fire hose', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'safety equipment' },
  { pattern: 'fire hydrant', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'safety equipment' },
  { pattern: 'fire assembly', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'emergency procedure' },
  { pattern: 'fire muster', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'emergency procedure' },
  { pattern: 'fire prevention', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'safety program' },
  { pattern: 'fire risk assessment', wrongCategory: 'Fire', correctCategory: 'Permit and RAMS', reason: 'documentation' },

  // Lifting disambiguations
  { pattern: 'forklift', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'vehicle, not crane lifting' },
  { pattern: 'forklift lifting', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'forklift is mobile plant' },
  { pattern: 'forklift operator', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'vehicle operator' },
  { pattern: 'scissor lift', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'boom lift', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'cherry picker', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'mewp', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'mobile elevated platform' },
  { pattern: 'ewp', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'lifting morale', wrongCategory: 'Lifting', correctCategory: 'BBS', reason: 'figurative expression' },
  { pattern: 'lifting spirits', wrongCategory: 'Lifting', correctCategory: 'BBS', reason: 'figurative expression' },
  { pattern: 'pallet jack', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'manual handling equipment' },
  { pattern: 'hand pallet truck', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'manual handling equipment' },

  // Confined Spaces disambiguations
  { pattern: 'open pit', wrongCategory: 'Confined Spaces', correctCategory: 'Barricades', reason: 'fall hazard, not confined space' },
  { pattern: 'open pits', wrongCategory: 'Confined Spaces', correctCategory: 'Barricades', reason: 'fall hazard, not confined space' },
  { pattern: 'pit without barricade', wrongCategory: 'Confined Spaces', correctCategory: 'Barricades', reason: 'access control issue' },
  { pattern: 'office space', wrongCategory: 'Confined Spaces', correctCategory: 'Work Environment', reason: 'work area, not confined space' },
  { pattern: 'storage space', wrongCategory: 'Confined Spaces', correctCategory: 'Housekeeping', reason: 'storage area' },
  { pattern: 'parking space', wrongCategory: 'Confined Spaces', correctCategory: 'Traffic Management', reason: 'vehicle parking' },
  { pattern: 'work space', wrongCategory: 'Confined Spaces', correctCategory: 'Work Environment', reason: 'work area' },
  { pattern: 'living space', wrongCategory: 'Confined Spaces', correctCategory: 'Site Welfare', reason: 'accommodation' },

  // Working at Height disambiguations
  { pattern: 'fallen sign', wrongCategory: 'Working at Height', correctCategory: 'Safety Sign', reason: 'object on ground' },
  { pattern: 'fallen signage', wrongCategory: 'Working at Height', correctCategory: 'Safety Sign', reason: 'signage issue' },
  { pattern: 'fallen barrier', wrongCategory: 'Working at Height', correctCategory: 'Barricades', reason: 'barrier issue' },
  { pattern: 'fallen barricade', wrongCategory: 'Working at Height', correctCategory: 'Barricades', reason: 'barricade issue' },
  { pattern: 'fallen cone', wrongCategory: 'Working at Height', correctCategory: 'Traffic Management', reason: 'traffic equipment' },
  { pattern: 'fall protection', wrongCategory: 'Working at Height', correctCategory: 'Working at Height', reason: 'confirm - height safety equipment' },
  { pattern: 'height of scaffold', wrongCategory: 'Working at Height', correctCategory: 'Working at Height', reason: 'confirm - scaffold measurement' },
  { pattern: 'tall building', wrongCategory: 'Working at Height', correctCategory: 'Work Environment', reason: 'structure description' },
  { pattern: 'height measurement', wrongCategory: 'Working at Height', correctCategory: 'Work Environment', reason: 'measurement activity' },

  // COSHH / Chemical disambiguations
  { pattern: 'food poisoning', wrongCategory: 'COSHH', correctCategory: 'Site Welfare', reason: 'illness from food, not chemical' },
  { pattern: 'food poison', wrongCategory: 'COSHH', correctCategory: 'Site Welfare', reason: 'illness from food' },
  { pattern: 'stomach bug', wrongCategory: 'COSHH', correctCategory: 'Site Welfare', reason: 'illness' },
  { pattern: 'sick from food', wrongCategory: 'COSHH', correctCategory: 'Site Welfare', reason: 'food-related illness' },

  // PPE disambiguations
  { pattern: 'ppe available', wrongCategory: 'PPE', correctCategory: 'PPE', reason: 'confirm - PPE availability' },
  { pattern: 'ppe missing', wrongCategory: 'PPE', correctCategory: 'PPE', reason: 'confirm - PPE issue' },
  { pattern: 'ppe not worn', wrongCategory: 'PPE', correctCategory: 'PPE', reason: 'confirm - PPE compliance' },

  // Driving disambiguations
  { pattern: 'driving rain', wrongCategory: 'Driving', correctCategory: 'Work Environment', reason: 'weather condition' },
  { pattern: 'driving wind', wrongCategory: 'Driving', correctCategory: 'Work Environment', reason: 'weather condition' },
  { pattern: 'pile driving', wrongCategory: 'Driving', correctCategory: 'Breaking Ground & Excavation', reason: 'piling operation' },
  { pattern: 'sheet pile driving', wrongCategory: 'Driving', correctCategory: 'Breaking Ground & Excavation', reason: 'piling operation' },

  // Miscellaneous disambiguations
  { pattern: 'toolbox talk', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'safety engagement activity' },
  { pattern: 'safety meeting', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'safety engagement' },
  { pattern: 'safety briefing', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'safety engagement' },
  { pattern: 'safety induction', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'training activity' },
  { pattern: 'site induction', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'training activity' },
  { pattern: 'good catch', wrongCategory: null, correctCategory: 'BBS', reason: 'positive observation' },
  { pattern: 'near miss report', wrongCategory: null, correctCategory: 'BBS', reason: 'reporting activity' },

  // ============================================================================
  // NEW DISAMBIGUATION RULES (for common phrases from real data)
  // ============================================================================

  // Checklist and inspection patterns
  { pattern: 'checklist updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection compliance' },
  { pattern: 'checklist not updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },
  { pattern: 'checklist was updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection compliance' },
  { pattern: 'checklist found updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection compliance' },
  { pattern: 'toilet checklist', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare inspection' },
  { pattern: 'ambulance checklist', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency equipment' },
  { pattern: 'generator checklist', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment inspection' },
  { pattern: 'welding machine checklist', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment inspection' },
  { pattern: 'first aid box checklist', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency equipment' },
  { pattern: 'inspection tag', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment inspection' },
  { pattern: 'color coding', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection system' },
  { pattern: 'colour coding', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection system' },
  { pattern: 'not inspected', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },
  { pattern: 'not color coded', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },
  { pattern: 'not colour coded', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },

  // Water and welfare patterns
  { pattern: 'drinking water not', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare issue' },
  { pattern: 'drinking water available', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare positive' },
  { pattern: 'drinking water was not', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare issue' },
  { pattern: 'water not provided', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare issue' },
  { pattern: 'potable water', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare item' },
  { pattern: 'no water provided', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare issue' },
  { pattern: 'water sprinkling', wrongCategory: 'Working on or Near Water', correctCategory: 'Dust Control', reason: 'dust suppression' },
  { pattern: 'water spraying', wrongCategory: 'Working on or Near Water', correctCategory: 'Dust Control', reason: 'dust suppression' },
  { pattern: 'water spray', wrongCategory: 'Working on or Near Water', correctCategory: 'Dust Control', reason: 'dust suppression' },
  { pattern: 'welfare facility', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare area' },
  { pattern: 'rest shelter', wrongCategory: null, correctCategory: 'Site Welfare', reason: 'welfare area' },

  // Safety officer and supervision patterns
  { pattern: 'safety officer not present', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision issue' },
  { pattern: 'no safety officer', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision issue' },
  { pattern: 'without safety coverage', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision issue' },
  { pattern: 'safety personnel', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision' },
  { pattern: 'without supervision', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision issue' },
  { pattern: 'without safety officer', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision issue' },
  { pattern: 'safety coverage', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision' },
  { pattern: 'lack of supervision', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'supervision issue' },

  // PPE patterns
  { pattern: 'not wearing ppe', wrongCategory: null, correctCategory: 'PPE', reason: 'PPE compliance' },
  { pattern: 'without ppe', wrongCategory: null, correctCategory: 'PPE', reason: 'PPE compliance' },
  { pattern: 'ppe not worn', wrongCategory: null, correctCategory: 'PPE', reason: 'PPE compliance' },
  { pattern: 'ear protection', wrongCategory: null, correctCategory: 'PPE', reason: 'hearing PPE' },
  { pattern: 'safety glasses', wrongCategory: null, correctCategory: 'PPE', reason: 'eye PPE' },
  { pattern: 'safety goggles', wrongCategory: null, correctCategory: 'PPE', reason: 'eye PPE' },
  { pattern: 'not wearing proper ppe', wrongCategory: null, correctCategory: 'PPE', reason: 'PPE compliance' },
  { pattern: 'incomplete ppe', wrongCategory: null, correctCategory: 'PPE', reason: 'PPE compliance' },
  { pattern: 'proper ppe', wrongCategory: null, correctCategory: 'PPE', reason: 'PPE requirement' },

  // Training and briefing patterns
  { pattern: 'pre-task briefing', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'briefing activity' },
  { pattern: 'pre task briefing', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'briefing activity' },
  { pattern: 'tbt', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'toolbox talk' },
  { pattern: 'lmra', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'risk assessment' },
  { pattern: 'safety standout', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'safety meeting' },
  { pattern: 'safety stand down', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'safety meeting' },
  { pattern: 'competent person', wrongCategory: null, correctCategory: 'Training and Competency', reason: 'competency' },

  // Positive observation / BBS patterns
  { pattern: 'positive observation', wrongCategory: null, correctCategory: 'BBS', reason: 'behavioral safety' },
  { pattern: 'positive culture', wrongCategory: null, correctCategory: 'BBS', reason: 'safety culture' },
  { pattern: 'best performer', wrongCategory: null, correctCategory: 'BBS', reason: 'recognition' },
  { pattern: 'gift card', wrongCategory: null, correctCategory: 'BBS', reason: 'recognition/reward' },
  { pattern: 'indicating a positive', wrongCategory: null, correctCategory: 'BBS', reason: 'positive observation' },

  // Housekeeping patterns
  { pattern: 'poor housekeeping', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping issue' },
  { pattern: 'good housekeeping', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping positive' },
  { pattern: 'housekeeping done', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping activity' },
  { pattern: 'housekeeping not done', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping issue' },
  { pattern: 'housekeeping is on going', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping activity' },
  { pattern: 'food waste', wrongCategory: 'Site Welfare', correctCategory: 'Housekeeping', reason: 'cleanliness issue' },
  { pattern: 'waste bin', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste management' },
  { pattern: 'bin overflowing', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste management' },
  { pattern: 'overflowing', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste issue' },
  { pattern: 'stacked improperly', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'storage issue' },
  { pattern: 'protruding nail', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'hazard' },
  { pattern: 'protruding nails', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'hazard' },

  // Access patterns
  { pattern: 'obstructed access', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },
  { pattern: 'blocked access', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },
  { pattern: 'safe access', wrongCategory: null, correctCategory: 'Access', reason: 'access requirement' },
  { pattern: 'obstructed by', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },

  // Security patterns
  { pattern: 'security gate', wrongCategory: null, correctCategory: 'Site Security', reason: 'security' },
  { pattern: 'entry log', wrongCategory: null, correctCategory: 'Site Security', reason: 'security documentation' },
  { pattern: 'exit log', wrongCategory: null, correctCategory: 'Site Security', reason: 'security documentation' },
  { pattern: 'cctv', wrongCategory: null, correctCategory: 'Site Security', reason: 'security equipment' },
  { pattern: 'unauthorized', wrongCategory: null, correctCategory: 'Site Security', reason: 'security issue' },

  // Traffic management patterns
  { pattern: 'wheel chock', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'vehicle safety' },
  { pattern: 'wheel chocks', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'vehicle safety' },
  { pattern: 'designated parking', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'parking' },
  { pattern: 'parking area', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'parking' },
  { pattern: 'parked on slope', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'parking issue' },

  // Signage patterns
  { pattern: 'no signage', wrongCategory: null, correctCategory: 'Safety Sign', reason: 'signage missing' },
  { pattern: 'signage not', wrongCategory: null, correctCategory: 'Safety Sign', reason: 'signage issue' },
  { pattern: 'sign not installed', wrongCategory: null, correctCategory: 'Safety Sign', reason: 'signage missing' },
  { pattern: 'suitable signage', wrongCategory: null, correctCategory: 'Safety Sign', reason: 'signage requirement' },

  // Equipment and tools specific
  { pattern: 'rotating part', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'machine guarding' },
  { pattern: 'machine guard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'machine guarding' },
  { pattern: 'damaged wheelbarrow', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment condition' },
  { pattern: 'damaged equipment', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment condition' },
  { pattern: 'damaged tool', wrongCategory: null, correctCategory: 'Tools', reason: 'tool condition' },

  // Barricade specific
  { pattern: 'barricade left open', wrongCategory: null, correctCategory: 'Barricades', reason: 'barricade issue' },
  { pattern: 'barricade was left', wrongCategory: null, correctCategory: 'Barricades', reason: 'barricade issue' },
  { pattern: 'without barricade', wrongCategory: null, correctCategory: 'Barricades', reason: 'barricade missing' },
  { pattern: 'unprotected edge', wrongCategory: null, correctCategory: 'Barricades', reason: 'edge protection' },

  // Dust control specific
  { pattern: 'dust control', wrongCategory: null, correctCategory: 'Dust Control', reason: 'dust management' },
  { pattern: 'suppress dust', wrongCategory: null, correctCategory: 'Dust Control', reason: 'dust management' },
  { pattern: 'reduce dust', wrongCategory: null, correctCategory: 'Dust Control', reason: 'dust management' },
  { pattern: 'air quality', wrongCategory: null, correctCategory: 'Dust Control', reason: 'air quality' },
  { pattern: 'too much dust', wrongCategory: null, correctCategory: 'Dust Control', reason: 'dust issue' },

  // Emergency preparedness specific
  { pattern: 'first aid kit', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency equipment' },
  { pattern: 'first aid box', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency equipment' },
  { pattern: 'first aider', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency response' },
  { pattern: 'fire extinguisher not inspected', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'equipment maintenance' },
  { pattern: 'extinguisher inspection', wrongCategory: 'Fire', correctCategory: 'Emergency Preparedness', reason: 'equipment maintenance' },
  { pattern: 'spill kit', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency equipment' },
  { pattern: 'assembly point', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency procedure' },

  // Weather and environment patterns
  { pattern: 'weather station', wrongCategory: null, correctCategory: 'Work Environment', reason: 'weather monitoring' },
  { pattern: 'insufficient lighting', wrongCategory: null, correctCategory: 'Work Environment', reason: 'lighting issue' },
  { pattern: 'poor lighting', wrongCategory: null, correctCategory: 'Work Environment', reason: 'lighting issue' },
  { pattern: 'poorly illuminated', wrongCategory: null, correctCategory: 'Work Environment', reason: 'lighting issue' },

  // ============================================================================
  // NEW DISAMBIGUATION RULES (from low confidence analysis)
  // ============================================================================

  // Rebar and steel protection patterns
  { pattern: 'rebar cap', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'sharp object protection' },
  { pattern: 'rebar caps', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'sharp object protection' },
  { pattern: 'protruding rebar', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },
  { pattern: 'exposed rebar', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },
  { pattern: 'protruding rebars', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },
  { pattern: 'without rebar cap', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'missing protection' },
  { pattern: 'no rebar caps', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'missing protection' },
  { pattern: 'steel bar without', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'missing cap' },
  { pattern: 'sharp steel', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },
  { pattern: 'impalement hazard', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },
  { pattern: 'safety cap', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'protection' },
  { pattern: 'wooden coverings', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'protection' },
  { pattern: 'tie rod', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'sharp object' },

  // Wood and timber patterns
  { pattern: 'wood timbers', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material hazard' },
  { pattern: 'wooden planks', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material' },
  { pattern: 'nails not removed', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'cleanup required' },
  { pattern: 'unwanted wood', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'cleanup required' },
  { pattern: 'timber with nails', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },

  // Cement and materials patterns
  { pattern: 'cement bags', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material storage' },
  { pattern: 'empty cement bags', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'cleanup required' },
  { pattern: 'empty bags', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'cleanup required' },
  { pattern: 'polythene covering', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material protection' },
  { pattern: 'without covering', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'storage issue' },

  // Site inspection patterns (high priority - common in data)
  { pattern: 'during the site inspection', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'inspection activity' },
  { pattern: 'during site inspection', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'inspection activity' },
  { pattern: 'morning site inspection', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'inspection activity' },
  { pattern: 'during morning site inspection', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'inspection activity' },
  { pattern: 'weekly project management walkthrough', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'management oversight' },
  { pattern: 'it was observed that', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'inspection finding' },
  { pattern: 'observations were closed', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'followup activity' },
  { pattern: 'submitted for rectification', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'followup activity' },
  { pattern: 'closed within', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'followup activity' },
  { pattern: 'hsse raised', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'inspection activity' },
  { pattern: 'tksac raised', wrongCategory: null, correctCategory: 'Safety Supervision', reason: 'inspection activity' },

  // Manlift and aerial platform patterns
  { pattern: 'operating the manlift', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'aerial platform operation' },
  { pattern: 'manlift in area', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'aerial platform' },
  { pattern: 'standing on the side', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'improper positioning in platform' },
  { pattern: 'of the basket', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'aerial platform positioning' },

  // Water pump / electrical near water patterns
  { pattern: 'electrical water pump', wrongCategory: 'Working on or Near Water', correctCategory: 'Energized System', reason: 'electrical equipment' },
  { pattern: 'water pump near', wrongCategory: 'Working on or Near Water', correctCategory: 'Energized System', reason: 'electrical equipment near water' },
  { pattern: 'pumps near to water', wrongCategory: 'Working on or Near Water', correctCategory: 'Energized System', reason: 'electrical hazard' },

  // Open floor / excavation protection patterns
  { pattern: 'open floor', wrongCategory: null, correctCategory: 'Barricades', reason: 'fall hazard requiring barricade' },
  { pattern: 'open floors', wrongCategory: null, correctCategory: 'Barricades', reason: 'fall hazard requiring barricade' },
  { pattern: 'unprotected excavated', wrongCategory: null, correctCategory: 'Barricades', reason: 'excavation protection' },
  { pattern: 'excavated area', wrongCategory: 'Breaking Ground & Excavation', correctCategory: 'Barricades', reason: 'existing excavation needs barricade' },
  { pattern: 'unsecured grating', wrongCategory: null, correctCategory: 'Barricades', reason: 'fall hazard' },
  { pattern: 'green mesh', wrongCategory: null, correctCategory: 'Barricades', reason: 'safety mesh/barrier' },

  // Suggestion box / positive culture patterns
  { pattern: 'suggestion box', wrongCategory: null, correctCategory: 'BBS', reason: 'employee engagement' },
  { pattern: 'ideas and feedback', wrongCategory: null, correctCategory: 'BBS', reason: 'safety culture' },
  { pattern: 'continuous improvement', wrongCategory: null, correctCategory: 'BBS', reason: 'safety culture' },
  { pattern: 'overconfidence', wrongCategory: null, correctCategory: 'BBS', reason: 'behavioral observation' },
  { pattern: 'lack of proper positioning', wrongCategory: null, correctCategory: 'BBS', reason: 'behavioral observation' },

  // Driving campaign patterns
  { pattern: 'safe driving campaign', wrongCategory: null, correctCategory: 'BBS', reason: 'safety campaign' },
  { pattern: 'driving campaign', wrongCategory: 'Driving', correctCategory: 'BBS', reason: 'safety campaign not driving activity' },
  { pattern: 'campaign was found', wrongCategory: null, correctCategory: 'BBS', reason: 'safety campaign' },

  // Proper arrangement / lifting positive patterns
  { pattern: 'proper arrangement', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting preparation' },
  { pattern: 'lifting operation', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting activity' },

  // Bulletin board patterns
  { pattern: 'bulletin board', wrongCategory: null, correctCategory: 'Safety Sign', reason: 'information display' },
  { pattern: 'campaign bulletin', wrongCategory: null, correctCategory: 'Safety Sign', reason: 'information display' },
  { pattern: 'weekly campaign bulletin', wrongCategory: null, correctCategory: 'Safety Sign', reason: 'information display' },

  // Backfilling / interference patterns
  { pattern: 'backfilling work', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'excavation activity' },
  { pattern: 'too close to each other', wrongCategory: null, correctCategory: 'Work Environment', reason: 'activity interference' },
  { pattern: 'interference between', wrongCategory: null, correctCategory: 'Work Environment', reason: 'activity interference' },

  // Rebar work / steel work patterns
  { pattern: 'rebar work', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'steel work activity' },
  { pattern: 'steel work is ongoing', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'steel work activity' },
  { pattern: 'rebar activity', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'steel work activity' },

  // Electrical improper connection patterns
  { pattern: 'improper electrical connection', wrongCategory: null, correctCategory: 'Energized System', reason: 'electrical hazard' },
  { pattern: 'improper connection', wrongCategory: null, correctCategory: 'Energized System', reason: 'electrical hazard' },
  { pattern: 'kettle was found', wrongCategory: null, correctCategory: 'Energized System', reason: 'electrical appliance' },
  { pattern: 'overloaded socket', wrongCategory: null, correctCategory: 'Energized System', reason: 'electrical hazard' },
  { pattern: 'daisy chain', wrongCategory: null, correctCategory: 'Energized System', reason: 'electrical hazard' },

  // Exposed nails patterns (keep in Housekeeping)
  { pattern: 'exposed nails', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },
  { pattern: 'timber with exposed', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'sharp object hazard' },

  // Falling object patterns (Working at Height - objects from elevation)
  { pattern: 'falling object hazard', wrongCategory: null, correctCategory: 'Working at Height', reason: 'dropped object from height' },
  { pattern: 'falling object', wrongCategory: null, correctCategory: 'Working at Height', reason: 'dropped object from height' },
  { pattern: 'on top of the pillars', wrongCategory: null, correctCategory: 'Working at Height', reason: 'elevated location' },

  // Exclusion zone patterns (Lifting)
  { pattern: 'exclusion zone', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting safety zone' },
  { pattern: 'exclusion zones', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting safety zone' },
  { pattern: 'lifting activity', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting operation' },

  // Slip trip fall patterns (Housekeeping)
  { pattern: 'slip, trip, and fall', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'walking surface hazard' },
  { pattern: 'slip trip fall', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'walking surface hazard' },
  { pattern: 'spikes protruding', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'puncture hazard' },

  // Emergency contact patterns
  { pattern: 'emergency contact number', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency information' },
  { pattern: 'contact number displayed', wrongCategory: null, correctCategory: 'Emergency Preparedness', reason: 'emergency information' },

  // Confined space protection
  { pattern: 'hard protection for', wrongCategory: null, correctCategory: 'Confined Spaces', reason: 'confined space barrier' },
  { pattern: 'protection for the confined', wrongCategory: null, correctCategory: 'Confined Spaces', reason: 'confined space barrier' },

  // Pressure washer / equipment inspection
  { pattern: 'pressure washer', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment' },
  { pattern: 'has not been inspected', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' }
]

// ============================================================================
// SECTION E: HAZARD SEVERITY RANKING
// For compound scenarios, use highest severity hazard
// ============================================================================

export const HAZARD_SEVERITY = {
  // Level 1 - Fatal/Catastrophic (highest priority)
  'Confined Spaces': 1,
  'Energized System': 1,
  'Working at Height': 1,
  'Lifting': 1,
  'Mobile Plant & Equipment': 1,

  // Level 2 - Serious/Major
  'Breaking Ground & Excavation': 2,
  'Fire': 2,
  'Hot Work': 2,
  'Working on or Near Water': 2,
  'Driving': 2,
  'Temporary Works': 2,
  'Working on or Near Live Roads': 2,
  'Working in Heat': 2,

  // Level 3 - Moderate (Sub-significant)
  'COSHH': 3,
  'Dust Control': 3,
  'Traffic Management': 3,
  'Barricades': 3,
  'PPE': 3,
  'Tools': 3,
  'Safety Sign': 3,
  'Site Security': 3,
  'Site Welfare': 3,
  'Safety Supervision': 3,
  'Training and Competency': 3,
  'Emergency Preparedness': 3,
  'Permit and RAMS': 3,
  'BBS': 3,
  'Housekeeping': 3,
  'Access': 3,
  'Work Environment': 4 // Lowest priority (default)
}

// ============================================================================
// SECTION F: OBJECT + ACTION → OUTCOME INFERENCE RULES
// When we know object and action, we can infer the most likely outcome
// ============================================================================

export const OBJECT_ACTION_OUTCOMES = {
  // Electrical + Work = Shock/Electrocution
  'electrical_work': {
    objects: ['electrical panel', 'cable', 'wire', 'transformer', 'switchgear', 'live', 'energized'],
    actions: ['working on', 'connecting', 'disconnecting', 'testing', 'isolating'],
    outcome: 'electric shock',
    category: 'Energized System'
  },

  // Height + Fall = Fall from height
  'height_fall': {
    objects: ['scaffold', 'ladder', 'roof', 'edge', 'platform', 'elevated'],
    actions: ['falling', 'fell', 'slipped', 'tripped', 'lost balance'],
    outcome: 'fall from height',
    category: 'Working at Height'
  },

  // Vehicle + Movement = Struck-by / Collision
  'vehicle_movement': {
    objects: ['excavator', 'forklift', 'truck', 'crane', 'loader', 'vehicle', 'plant'],
    actions: ['reversing', 'moving', 'operating', 'driving', 'maneuvering'],
    outcome: 'struck by vehicle',
    category: 'Mobile Plant & Equipment'
  },

  // Crane + Lift = Dropped load
  'crane_lift': {
    objects: ['crane', 'hoist', 'sling', 'load', 'rigging'],
    actions: ['lifting', 'hoisting', 'lowering', 'slinging'],
    outcome: 'dropped load',
    category: 'Lifting'
  },

  // Welding + Work = Fire/Explosion
  'welding_work': {
    objects: ['welding', 'torch', 'grinder', 'hot work'],
    actions: ['welding', 'cutting', 'grinding', 'burning'],
    outcome: 'fire or explosion',
    category: 'Hot Work'
  },

  // Confined + Entry = Asphyxiation
  'confined_entry': {
    objects: ['tank', 'vessel', 'pit', 'manhole', 'confined space', 'silo'],
    actions: ['entering', 'entry', 'descending', 'climbing into'],
    outcome: 'asphyxiation',
    category: 'Confined Spaces'
  },

  // Excavation + Dig = Cave-in
  'excavation_dig': {
    objects: ['trench', 'excavation', 'hole', 'pit', 'dig'],
    actions: ['digging', 'excavating', 'trenching', 'working in'],
    outcome: 'cave-in',
    category: 'Breaking Ground & Excavation'
  },

  // Water + Work = Drowning
  'water_work': {
    objects: ['river', 'water', 'pond', 'canal', 'sea', 'dock'],
    actions: ['working near', 'crossing', 'working over', 'fell into'],
    outcome: 'drowning',
    category: 'Working on or Near Water'
  },

  // Road + Work = Traffic incident
  'road_work': {
    objects: ['road', 'highway', 'traffic', 'live road', 'carriageway'],
    actions: ['working on', 'crossing', 'working near'],
    outcome: 'traffic incident',
    category: 'Working on or Near Live Roads'
  }
}

// ============================================================================
// SECTION G: SIGNIFICANT HAZARD LIST (for reference)
// ============================================================================

export const SIGNIFICANT_HAZARDS = [
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
  'Driving'
]

export const SUB_SIGNIFICANT_HAZARDS = [
  'COSHH',
  'Dust Control',
  'Traffic Management',
  'Barricades',
  'PPE',
  'Tools',
  'Safety Sign',
  'Site Security',
  'Site Welfare',
  'Safety Supervision',
  'Training and Competency',
  'Emergency Preparedness',
  'Permit and RAMS',
  'BBS',
  'Housekeeping',
  'Access',
  'Work Environment'
]
