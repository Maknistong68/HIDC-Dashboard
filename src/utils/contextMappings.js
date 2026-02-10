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

  // Mobile Plant & Equipment outcomes (vehicle-related)
  'struck by vehicle': 'Mobile Plant & Equipment',
  'struck by equipment': 'Mobile Plant & Equipment',
  'struck by plant': 'Mobile Plant & Equipment',
  'run over': 'Mobile Plant & Equipment',
  'ran over': 'Mobile Plant & Equipment',
  'equipment strike': 'Mobile Plant & Equipment',
  'hit by excavator': 'Mobile Plant & Equipment',
  'hit by forklift': 'Mobile Plant & Equipment',
  'hit by crane': 'Mobile Plant & Equipment',
  'struck by boom': 'Mobile Plant & Equipment',
  'struck by bucket': 'Mobile Plant & Equipment',
  'line of fire': 'Mobile Plant & Equipment', // NOT Fire!

  // Mechanical Hazard outcomes (caught-in/between, crushing, machinery)
  'caught in': 'Mechanical Hazard',
  'caught-in': 'Mechanical Hazard',
  'caught between': 'Mechanical Hazard',
  'caught-between': 'Mechanical Hazard',
  'crushing': 'Mechanical Hazard',
  'crushed': 'Mechanical Hazard',
  'pinned': 'Mechanical Hazard',
  'pinned by': 'Mechanical Hazard',
  'pinch point': 'Mechanical Hazard',
  'nip point': 'Mechanical Hazard',
  'shear point': 'Mechanical Hazard',
  'entanglement': 'Mechanical Hazard',
  'entangled': 'Mechanical Hazard',
  'amputation': 'Mechanical Hazard',
  'amputated': 'Mechanical Hazard',
  'severed': 'Mechanical Hazard',
  'struck by machine': 'Mechanical Hazard',
  'machine contact': 'Mechanical Hazard',
  'rotating parts': 'Mechanical Hazard',
  'moving parts': 'Mechanical Hazard',

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

  // Explosives & Blasting outcomes (NEOM Eltizam Hazard #12)
  'blasting injury': 'Explosives & Blasting',
  'blast injury': 'Explosives & Blasting',
  'flyrock': 'Explosives & Blasting',
  'fly rock': 'Explosives & Blasting',
  'flyrock injury': 'Explosives & Blasting',
  'misfire': 'Explosives & Blasting',
  'misfired': 'Explosives & Blasting',
  'unexploded': 'Explosives & Blasting',
  'premature detonation': 'Explosives & Blasting',
  'unplanned detonation': 'Explosives & Blasting',
  'ground vibration damage': 'Explosives & Blasting',
  'blast damage': 'Explosives & Blasting',
  'blasting incident': 'Explosives & Blasting',

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
  'roadside incident': 'Working on or Near Live Roads',

  // Physical Hazard outcomes (sharp objects, falling objects, impalement)
  'impalement': 'Physical Hazard',
  'impaled': 'Physical Hazard',
  'impalement injury': 'Physical Hazard',
  'impalement hazard': 'Physical Hazard',
  'puncture': 'Physical Hazard',
  'puncture wound': 'Physical Hazard',
  'punctured': 'Physical Hazard',
  'pierced': 'Physical Hazard',
  'penetration injury': 'Physical Hazard',
  'struck by rebar': 'Physical Hazard',
  'struck by nail': 'Physical Hazard',
  'struck by sharp': 'Physical Hazard',
  'struck by object': 'Physical Hazard',
  'struck by falling': 'Physical Hazard',
  'hit by object': 'Physical Hazard',
  'hit by falling': 'Physical Hazard',
  'falling object': 'Physical Hazard',
  'falling objects': 'Physical Hazard',
  'dropped object': 'Physical Hazard',
  'object fell': 'Physical Hazard',
  'cut by': 'Physical Hazard',
  'laceration': 'Physical Hazard',
  'lacerated': 'Physical Hazard',

  // Environmental outcomes
  'contamination': 'Environmental',
  'ground contamination': 'Environmental',
  'soil contamination': 'Environmental',
  'environmental contamination': 'Environmental',
  'pollution': 'Environmental',
  'polluted': 'Environmental',
  'environmental damage': 'Environmental',
  'environmental hazard': 'Environmental',
  'overflow': 'Environmental',
  'overflowing': 'Environmental',
  'septic overflow': 'Environmental',
  'sewage': 'Environmental',
  'sewage overflow': 'Environmental'
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
    'power strip', 'multi plug', 'overloaded socket', 'daisy chain',
    // Additional electrical objects
    'distribution panel', 'db', 'tower light', 'inspection tag',
    'exhaust fan', 'smoke detector', 'ac unit', 'pedestal fan'
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
    'attic', 'loft', 'mezzanine', 'balcony', 'gantry',
    // Additional WAH objects
    'stakkabox', 'stakka box', 'manlift', 'man lift',
    'retractable lifeline', 'ginwheel', 'gin wheel'
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
    'electrical water pump', 'water pump', 'pump near water',
    // Pneumatic Equipment (mechanical hazards)
    'pneumatic', 'pneumatic tool', 'pneumatic tools', 'pneumatic drill',
    'pneumatic hammer', 'jack hammer', 'jackhammer', 'air hammer',
    'pneumatic nailer', 'nail gun', 'air compressor', 'compressed air',
    'air hose', 'air line', 'pneumatic system', 'pneumatic equipment',
    'breaker', 'pneumatic breaker', 'chipping hammer',
    // Hydraulic Equipment (mechanical hazards)
    'hydraulic', 'hydraulic system', 'hydraulic line', 'hydraulic hose',
    'hydraulic press', 'hydraulic jack', 'hydraulic cylinder',
    'hydraulic pump', 'hydraulic fluid', 'hydraulic oil',
    'hydraulic test', 'hydraulic testing', 'hydraulic pressure',
    'hydraulic failure', 'hydraulic leak', 'burst hose', 'hose burst',
    // Pressure Testing
    'pressure test', 'pressure testing', 'hydrostatic test',
    'hydro test', 'hydrotest', 'pressure gauge',
    'pressure relief', 'over pressure', 'pressure buildup', 'high pressure',
    // Common misspellings and variations
    'bldozer', 'blodozer', 'excevator', 'loder',
    // Water tanker variants
    'water tanker', 'vacuum tanker',
    // Dump truck variants
    'dumptruck', 'dump trucks', 'dumper trucks', 'tipper trucks',
    // Roller variants
    'compact roller', 'roller compactor', 'drum roller',
    // Additional equipment
    'front loader', 'back hoe', 'earth moving equipment',
    'crusher plant', 'portable generator',
    // Man-machine interface keywords
    'man-machine interface', 'man machine interface', 'mepi',
    // Equipment verification keywords
    'qr code', 'veri-fi', 'verifi', 'vvs',
    // Equipment safety features
    'beacon light', 'beacon lights', 'pwas', 'pwas camera',
    'rotating parts', 'moving parts', 'protection guard',
    'wheel chock', 'wheel chocks', 'whip check', 'whiplash arrestor'
  ],

  'Fire': [
    'flame', 'flames', 'open flame', 'naked flame',
    'spark', 'sparks', 'electrical spark',
    'fuel', 'petrol', 'gasoline', 'diesel', 'kerosene',
    'gas cylinder', 'gas bottle', 'lpg', 'propane', 'acetylene',
    'flammable liquid', 'flammable', 'combustible', 'inflammable',
    'ignition source', 'heat source', 'hot surface',
    'candle', 'lighter', 'match', 'matches',
    'fire', 'fire hazard', 'fire risk', 'fire hazards',
    'oxygen', 'oxidizer', 'oxidizing agent',
    'chemical', 'solvent', 'thinner', 'paint',
    'electrical fire', 'short circuit',
    // Diesel/fuel spills and drip trays
    'drip tray full of diesel', 'drip tray was full of diesel', 'drip tray was full',
    'dip tray full of diesel', 'dip tray was full', 'full of diesel',
    'diesel spill', 'diesel overflow', 'fuel spill', 'fuel overflow',
    'generator drip tray', 'generator dip tray', 'increases the chance of fire',
    // Compressed Gas Hazards
    'gas cylinder', 'gas cylinders', 'cylinder', 'compressed gas',
    'oxygen cylinder', 'acetylene cylinder', 'nitrogen cylinder',
    'argon cylinder', 'co2 cylinder', 'propane cylinder', 'lpg cylinder',
    'gas regulator', 'pressure regulator', 'cylinder valve',
    'gas hose', 'flashback arrestor', 'gas manifold',
    'cylinder storage', 'cylinder secured', 'unsecured cylinder',
    'cylinder cap', 'cylinder chain', 'cylinder trolley',
    'cylinder leak', 'gas leak', 'gas release',
    'cylinder transport', 'cylinder handling', 'gas storage',
    'pressure vessel', 'air receiver', 'receiver tank'
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
    'road', 'highway', 'motorway', 'freeway',
    // NEOM Standard additions
    'seatbelt', 'seat belt', 'safety belt',
    'driver license', 'driving license', 'driving permit',
    'speed limit', 'speed sign', 'speed camera',
    'mobile phone', 'handheld device', 'distraction',
    // Three factor risk assessment
    'driver competency', 'driver training', 'defensive driving',
    'vehicle fitness', 'vehicle inspection', 'vehicle maintenance',
    'route planning', 'journey management', 'journey plan',
    // Site driving rules
    'reverse parking', 'reverse park', 'designated route',
    'tailgating', 'safe following distance', 'overtaking',
    'vehicle rollover', 'rollover protection'
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
    'exclusion zone', 'exclusion zones', 'lifting zone', 'drop zone',
    // Extended lifting/rigging terms
    'tagline', 'tag line', 'control line', 'guide rope',
    'snatch block', 'pulley block', 'sheave',
    'load cell', 'dynamometer', 'load indicator',
    'lifting clamp', 'plate clamp', 'beam clamp', 'pipe clamp',
    'magnetic lifter', 'lifting magnet', 'magnet lift',
    'vacuum lifter', 'suction lifter', 'vacuum pad',
    'lifting lug', 'd-ring', 'lift point',
    'choker hitch', 'basket hitch', 'vertical hitch',
    'banksman', 'rigger', 'slinger', 'signalman', 'signal person',
    'load chart', 'lift plan', 'rigging plan', 'method statement',
    'proof load', 'test certificate', 'thorough examination',
    'synthetic sling', 'endless sling', 'round sling',
    'anchor shackle', 'screw pin shackle', 'bolt type shackle',
    'come along', 'lever hoist', 'pull lift',
    'gantry crane', 'overhead crane', 'jib crane', 'davit',
    'safe working load', 'working load limit', 'swl', 'wll'
  ],

  // Working on or Near Water - removed keyword auto-detection
  // Classification only from explicit Excel hazard column data
  'Working on or Near Water': [],

  'Hot Work': [
    // Direct hot work terms
    'hot work', 'hot work activities', 'hot work activity', 'hot work area',
    // Welding
    'welding', 'welding equipment', 'welder', 'welding machine', 'mig welder', 'tig welder',
    // Cutting
    'cutting torch', 'oxy torch', 'gas torch', 'plasma cutter', 'thermal cutting',
    // Grinding
    'grinder', 'angle grinder', 'disc grinder', 'grinding wheel', 'grinding',
    // Hot materials
    'hot metal', 'molten metal', 'molten material',
    // Brazing/soldering
    'brazing equipment', 'brazing torch', 'brazing',
    'soldering iron', 'soldering equipment', 'soldering',
    // Other
    'heat gun', 'hot air gun',
    'welding rod', 'electrode', 'filler wire',
    'welding slag', 'spatter', 'weld spatter',
    'spark', 'sparks', 'fire watch', 'fire watcher'
  ],

  // Explosives & Blasting (NEOM Eltizam Hazard #12)
  // Only actual explosion events - blasting operations moved to Mechanical Hazard
  'Explosives & Blasting': [],

  'Breaking Ground & Excavation': [
    'excavation', 'excavations', 'dig', 'digging',
    'trench', 'trenches', 'trenching',
    'hole', 'holes', 'pit', 'pits',
    'foundation', 'foundations', 'footing',
    'ground opening', 'earth opening',
    'utilities', 'underground utilities', 'buried services',
    'underground service', 'underground cable', 'underground pipe',
    'gas main', 'water main', 'sewer', 'storm drain',
    'soil', 'earth', 'ground', 'spoil',
    // NEOM Standard additions - Service detection
    'cat and genny', 'cat/genny', 'cable avoidance tool', 'genny',
    'gpr', 'ground penetrating radar', 'service detection',
    'service locator', 'utility locator', 'cable locator',
    // Permit system
    'permit to dig', 'dig permit', 'excavation permit',
    'breaking ground permit', 'hold point',
    // Design and stability
    'soil sampling', 'ground conditions', 'soil conditions',
    'water table', 'groundwater level', 'stability assessment',
    'dewatering', 'wellpoint', 'sump pump',
    'surface water', 'water diversion',
    // Edge protection (NEOM specific)
    'excavation edge', 'setback from edge', '1m setback',
    'stop block', 'stop blocks', 'vehicle stop',
    'bund wall', 'material bund'
  ],

  'Temporary Works': [
    'formwork', 'shuttering', 'falsework',
    'shoring', 'shores', 'props', 'propping',
    'bracing', 'braces', 'lateral support',
    'temporary structure', 'temporary support', 'temporary supports',
    'hoarding', 'site hoarding', 'fencing',
    'temporary platform', 'temporary access',
    'edge protection', 'temporary guardrail',
    'access ramp', 'temporary ramp',
    // Makeshift supports
    'makeshift wooden', 'makeshift support', 'makeshift supports',
    'makeshift wooden planks', 'supported using makeshift',
    'unstable support', 'unstable supports',
    'pipes elevated', 'pipe elevated', 'hdpe pipe', 'hdpe pipes',
    // NEOM Standard additions - Personnel
    'twc', 'temporary works coordinator', 'tw coordinator',
    'tws', 'temporary works supervisor', 'tw supervisor',
    'designated individual', 'di',
    // BS5975 stages
    'permission to load', 'permission to strike', 'permission to dismantle',
    'permission to install', 'design check', 'design approval',
    // Design categories
    'category 0', 'category 1', 'category 2', 'category 3',
    'tw design', 'tw register', 'temporary works register',
    // Specific TW elements
    'crane foundation', 'tower crane base', 'grillage',
    'piling mat', 'crane mat', 'access bridge',
    'loading tower', 'waste chute', 'anchor point',
    'hoist base', 'cantilever', 'temporary roof'
  ],

  'Working in Heat': [
    'hot environment', 'hot weather', 'high temperature',
    'sun', 'sunlight', 'direct sun', 'solar radiation',
    'heat', 'extreme heat', 'hot conditions',
    'furnace', 'oven', 'kiln', 'boiler',
    // NEOM Standard additions - TWL categories
    'thermal work limit', 'twl', 'twl category',
    'work rest cycle', 'rest cycle', 'cooling period',
    // Heat illness
    'heat stroke', 'heatstroke', 'heat exhaustion',
    'heat stress', 'heat cramps', 'heat syncope',
    'hyperthermia', 'overheating',
    // Hydration
    'hydration', 'dehydration', 'dehydrated',
    'water station', 'hydration station', 'drinking water',
    // Shade and cooling
    'shade area', 'shaded area', 'cooling area',
    'shade shelter', 'rest shelter', 'cooling tent',
    // Acclimatization
    'acclimatization', 'acclimation', 'new worker heat',
    // Weather monitoring
    'weather station', 'temperature monitoring', 'wbgt'
  ],

  'Working on or Near Live Roads': [
    'live road', 'live traffic', 'open road',
    'highway', 'motorway', 'freeway', 'expressway',
    'traffic lane', 'travel lane', 'carriageway',
    'work zone', 'construction zone', 'road works',
    'traffic management', 'traffic control',
    'road closure', 'lane closure',
    // NEOM Standard additions
    'live carriageway', 'live lane', 'open lane',
    'temporary traffic management', 'ttm', 'ttm plan',
    'traffic management plan', 'traffic logistics plan',
    // Barriers (NEOM specific - jersey barriers required within 10m)
    'jersey barrier', 'jersey barriers', 'water filled barrier',
    'concrete barrier', 'new jersey barrier',
    // Access/egress
    'work zone access', 'work zone egress', 'access point',
    'egress point', 'controlled crossing', 'crossing point',
    // High visibility
    'high visibility', 'hi-vis', 'reflective clothing',
    // Ministry coordination
    'ministry of transport', 'mot approval', 'mot coordination',
    // Roadside hazards
    'roadside work', 'highway maintenance', 'road maintenance',
    'struck by passing', 'vehicle intrusion', 'runaway vehicle'
  ],

  // Physical Hazard - Sharp objects, falling objects, protruding items causing injury
  'Physical Hazard': [
    // Protruding rebars and sharp objects (primary hazard = impalement/puncture)
    'protruding rebar', 'protruding rebars', 'exposed rebar', 'exposed rebars',
    'rebars protruding', 'rebar protruding', 'rebars exposed', 'rebar exposed',
    'rebar without cap', 'rebars without cap', 'without rebar cap', 'without rebar caps',
    'no rebar cap', 'no rebar caps', 'rebar cap missing', 'rebar caps missing',
    'unprotected rebar', 'unprotected rebars', 'uncapped rebar', 'uncapped rebars',
    'sharp rebar', 'sharp rebars', 'sharp steel rebar', 'sharp steel rebars',
    'steel bar protruding', 'steel rebars protruding', 'protruding steel',
    'exposed steel bar', 'sharp steel', 'extended rebars', 'extending rebars',
    'rebar cap', 'rebar caps', 'impalement', 'impaled', 'impalement hazard',
    'risk of impalement', 'impalement risk', 'impalement injury', 'impalement injuries',
    'puncture hazard', 'puncture risk', 'struck on these rods', 'struck onto these rebars',
    // Tie rods
    'tie rod', 'tie rods', 'tie rod without', 'tie rods used', 'tie rods without',
    // Protruding nails
    'protruding nail', 'protruding nails', 'exposed nail', 'exposed nails',
    'nail protruding', 'nails protruding', 'timber with nails', 'wood with nails',
    'planks with nails', 'plywood with nails', 'had exposed nails', 'sheets had exposed nails',
    // Falling objects
    'falling object', 'falling objects', 'dropped object', 'dropped objects',
    'object falling', 'objects falling', 'material falling', 'debris falling', 'falling debris',
    'falling hazard', 'drop hazard', 'overhead hazard', 'falling material',
    'unsecured load', 'unsecured material', 'unstable stack', 'unstable stacking',
    'on top of pillars', 'on top of the pillars', 'timber on top', 'placed on top of',
    'risk of injury to workers passing', 'risk of injury to workers below',
    // Sharp edges and objects
    'sharp edge', 'sharp edges', 'sharp corner', 'sharp metal', 'sharp object', 'sharp objects',
    'cutting hazard', 'laceration hazard', 'cut hazard',
    // Extended physical hazards
    'physical hazard', 'physical hazards', 'sharp object hazard',
    'jagged edge', 'burr', 'metal burr', 'rough edge', 'ragged edge',
    'projecting', 'projection', 'protrusion', 'protrusions',
    'extended rebar', 'extended steel', 'steel projection',
    'tie rod exposed', 'tie rods exposed', 'exposed tie rod', 'exposed tie rods',
    'formwork tie', 'form work tie', 'she bolt', 'she bolts',
    'anchor bolt exposed', 'bolt protruding', 'bolt exposed', 'bolts protruding',
    'wire protruding', 'wires protruding', 'metal protruding',
    'spikes', 'spikes protruding', 'metal spikes', 'steel spikes',
    // Wooden hazards with nails
    'wooden cover with nails', 'plywood sheets with nails', 'sheets had exposed',
    // NEOM Standard reference
    'phsas 37.9', 'neom phsas 37.9', '37.9 sharp objects'
  ],

  // Mechanical Hazard - Caught-in/between, crushing, pinch points, machinery, blasting ops
  'Mechanical Hazard': [
    // Caught-in/between hazards
    'caught in', 'caught-in', 'caught between', 'caught-between',
    // Pinch/nip/shear points
    'pinch point', 'pinch points', 'nip point', 'nip points',
    'shear point', 'shear points', 'shearing',
    // Crushing
    'crushing', 'crushed', 'crush hazard', 'crushing hazard',
    // Moving/rotating parts
    'moving parts', 'rotating parts', 'rotating equipment', 'rotating machinery',
    'moving machinery', 'spinning', 'rotating shaft',
    // Entanglement
    'entanglement', 'entangled', 'entangle', 'snagged', 'caught in machinery',
    // Specific machinery components
    'conveyor', 'conveyor belt', 'roller', 'rollers',
    'gear', 'gears', 'pulley', 'pulleys', 'belt', 'belts',
    'shaft', 'chain drive', 'belt drive', 'sprocket',
    // Guards
    'unguarded', 'unguarded machinery', 'machine guard', 'guard removed',
    'missing guard', 'no guard', 'guard missing', 'interlocked guard',
    // Severe outcomes
    'amputation', 'amputated', 'severed', 'degloving',
    // General terms
    'mechanical hazard', 'machinery hazard', 'machine hazard',
    // Blasting operations (moved from Explosives & Blasting)
    'detonator', 'detonators', 'detonating cord', 'det cord', 'detcord',
    'primer', 'primers', 'booster', 'boosters', 'initiator',
    'blasting cap', 'blasting caps', 'electric detonator',
    'non-electric detonator', 'nonel', 'shock tube',
    'blast', 'blasting', 'blasting operation', 'blasting activity',
    'drill and blast', 'controlled blasting', 'presplit blasting',
    'smooth blasting', 'cushion blasting', 'blast hole', 'blast holes',
    'shot hole', 'shot holes', 'blast pattern', 'blast design',
    'shot firer', 'shot firing', 'blasting engineer', 'explosives engineer',
    'blasting supervisor', 'sentry', 'sentries', 'explosives handler',
    'magazine', 'explosives magazine', 'explosive store', 'explosive storage',
    'detonator storage', 'magazine key', 'magazine register',
    'blast signal', 'blasting signal', 'blast warning', 'blast siren',
    'blast zone', 'exclusion zone', 'blast radius', 'danger zone',
    'misfire', 'unexploded', 'blind hole', 'bootleg',
    'flyrock', 'fly rock', 'fragmentation',
    'seismograph', 'vibration monitor', 'ppv', 'peak particle velocity',
    'ground vibration', 'air overpressure', 'blast vibration',
    'blasting permit', 'blasting schedule', 'blasting plan',
    'blast log', 'shot record', 'post blast inspection'
  ],

  // Environmental - Contamination, pollution, waste affecting environment
  'Environmental': [
    'contamination', 'contaminated', 'ground contamination', 'soil contamination',
    'environmental contamination', 'pollution', 'polluted', 'polluting',
    'environmental damage', 'environmental hazard', 'environmental risk',
    'septic tank', 'septic overflow', 'sewage', 'sewage overflow', 'sewage leak',
    'effluent', 'wastewater', 'waste water',
    'diesel spill', 'oil spill', 'fuel spill', 'chemical spill',
    'drip tray full', 'drip tray overflow', 'drip tray overflowing',
    'concrete waste', 'concrete on soil', 'waste on soil', 'dumping',
    'illegal dumping', 'improper disposal', 'environmental violation'
  ],

  // Slip and Trip - Ground-level slip/trip hazards (falls moved to Working at Height)
  'Slip and Trip': [
    // Slip hazards
    'slip', 'slipped', 'slipping', 'slippery', 'slippery floor', 'slippery surface',
    // Trip hazards
    'trip', 'tripped', 'tripping', 'trip hazard', 'tripping hazard',
    // Surface conditions
    'uneven surface', 'uneven floor', 'uneven ground',
    'wet floor', 'wet surface', 'water on floor', 'oil on floor',
    // Obstructions
    'obstacle', 'obstruction', 'obstructed', 'blocked pathway',
    'cables on floor', 'hoses on floor', 'materials on floor',
    'loose cable', 'cable across', 'pothole', 'hole in ground',
    // Environmental factors
    'poor lighting', 'inadequate lighting', 'dark area',
    'broken step', 'damaged floor'
    // NOTE: 'fall', 'fell', 'falling', 'fall hazard' moved to Working at Height
  ],

  // ============================================================================
  // SUB-SIGNIFICANT HAZARD OBJECTS (NEW - 17 categories added)
  // ============================================================================

  'Worker Welfare': [
    // Camps and Accommodation (expanded)
    'camp', 'camps', 'labor camp', 'labour camp', 'worker camp', 'workers camp',
    'accommodation', 'worker accommodation', 'staff accommodation', 'living quarters',
    'dormitory', 'dorm', 'dorms', 'dormitories', 'barracks',
    'housing', 'worker housing', 'temporary housing',
    // Water
    'drinking water', 'potable water', 'water cooler', 'water dispenser', 'water station',
    'water supply', 'water bottle', 'hydration', 'dehydrated', 'no water', 'water not provided',
    'water not available', 'lack of water', 'insufficient water',
    // Toilets
    'toilet', 'toilets', 'toilet facility', 'toilet facilities', 'restroom', 'bathroom',
    'lavatory', 'latrine', 'portable toilet', 'porta potty', 'sanitation', 'urinal',
    'toilet checklist', 'toilet inspection', 'washroom', 'wc',
    // Rest Areas
    'welfare', 'welfare facility', 'welfare facilities', 'welfare area',
    'rest shelter', 'rest area', 'break room', 'rest room',
    'shade', 'shade area', 'shaded area', 'cooling area', 'resting place', 'shelter',
    // Food Facilities
    'canteen', 'mess hall', 'mess', 'cafeteria', 'kitchen', 'dining facility',
    'food', 'meal', 'lunch', 'breakfast', 'dinner', 'eating area', 'dining',
    'food poisoning', 'sick from food', 'food storage',
    // Hygiene
    'hygiene', 'cleanliness', 'hand wash', 'hand washing', 'soap', 'sanitizer', 'sanitiser',
    'hand sanitizer', 'washing facility', 'shower', 'changing room', 'locker room',
    // Additional welfare facilities
    'first aid room', 'medical facility', 'clinic', 'prayer room', 'worship area',
    'recreation', 'recreational facility', 'recreation room',
    // Missing facilities
    'toilet not provided', 'toilets not provided', 'waste bin not provided', 'bulletin board not provided',
    'facilities not provided', 'welfare not provided', 'sanitation not provided',
    // Waste bin issues
    'waste bin liner', 'polythene bag not changed', 'polythene bag in the waste bin',
    'garbage bag was not replaced', 'garbage bag not replaced', 'waste bin was full',
    'waste bin full', 'bin was overflowing', 'bin overflowing', 'poor hygiene',
    'unpleasant odor', 'unpleasant odour', 'pest attraction', 'pest risks',
    // Food waste
    'food waste', 'food waste not removed', 'food waste was not removed', 'food waste was observed',
    'hygiene risk', 'hygiene concerns', 'hygiene issues'
  ],

  'Housekeeping': [
    // Core housekeeping terms
    'housekeeping', 'house keeping', 'cleanup', 'clean up', 'cleaning', 'clean',
    'tidy', 'tidying', 'organized', 'organisation', 'organization',
    'poor housekeeping', 'good housekeeping', 'housekeeping issue',
    // Waste management (true housekeeping)
    'waste', 'waste bin', 'rubbish', 'garbage', 'trash', 'litter',
    'food waste', 'wrappers', 'refuse', 'waste management', 'bin overflowing',
    'overflowing bin', 'waste disposal', 'empty bags', 'cement bags', 'empty cement bags',
    'garbage bag', 'polythene bag', 'waste not removed', 'bin not changed',
    // Disorder & clutter (without injury hazard)
    'clutter', 'cluttered', 'mess', 'messy', 'disorganized', 'untidy',
    'scattered materials', 'strewn', 'disorder', 'disorderly',
    'unwanted materials', 'unwanted wood', 'wood materials', 'wooden planks',
    // Storage issues (organizational, not safety-critical)
    'improper storage', 'stored incorrectly', 'poor storage', 'improper stacking',
    'materials not sorted', 'unsorted materials', 'rebar storage',
    'storage area', 'material storage',
    // Misc housekeeping
    'empty oil can', 'oil can', 'polythene covering', 'without covering',
    'water drum', 'need to be removed', 'not removed from site',
    'not replaced', 'not changed', 'cabin housekeeping'
    // NOTE: Rebar/impalement hazards moved to 'Physical Hazard'
    // NOTE: Slip/trip hazards moved to 'Slip and Trip'
    // NOTE: Falling objects moved to 'Physical Hazard'
  ],

  'Respiratory Hazard': [
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
    'entry point', 'exit point', 'ingress', 'means of access',
    // Walkways and steps
    'wooden steps', 'steps not properly', 'steps are not properly', 'steps used for',
    'wooden walkway', 'wooden walkways', 'walkway not provided', 'walkways not provided',
    'walkways were not provided', 'planks were not provided', 'planks not provided',
    'no walkway', 'no walkways', 'posing a risk of falls', 'risk of falls',
    'not properly fixed', 'stairs not fixed', 'steps not fixed'
  ],

  'General Site Issues': [
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

  // Blasting actions → Explosives & Blasting (NEOM Eltizam #12)
  'blasting': [
    'blasting', 'blasted', 'blast',
    'detonating', 'detonated', 'detonate',
    'firing', 'fired', 'shot firing',
    'drilling blast holes', 'charging', 'charged',
    'priming', 'primed', 'stemming',
    'connecting detonators', 'wiring up',
    'clearing blast zone', 'evacuating blast area',
    'post blast inspection', 'inspecting blast'
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
  { pattern: 'fire extinguisher', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire extinguisher missing', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire extinguisher expired', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire exit', wrongCategory: null, correctCategory: 'Fire', reason: 'fire evacuation' },
  { pattern: 'fire escape', wrongCategory: null, correctCategory: 'Fire', reason: 'fire evacuation' },
  { pattern: 'fire drill', wrongCategory: null, correctCategory: 'Fire', reason: 'fire training' },
  { pattern: 'fire alarm', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire alarm test', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire watch', wrongCategory: 'Fire', correctCategory: 'Hot Work', reason: 'hot work control measure' },
  { pattern: 'fire watcher', wrongCategory: 'Fire', correctCategory: 'Hot Work', reason: 'hot work control' },
  { pattern: 'fire blanket', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire hose', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire hydrant', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'fire assembly', wrongCategory: null, correctCategory: 'Fire', reason: 'fire evacuation' },
  { pattern: 'fire muster', wrongCategory: null, correctCategory: 'Fire', reason: 'fire evacuation' },
  { pattern: 'fire prevention', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety' },
  { pattern: 'fire risk assessment', wrongCategory: 'Fire', correctCategory: 'General Site Issues', reason: 'documentation' },

  // Lifting disambiguations
  { pattern: 'forklift', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'vehicle, not crane lifting' },
  { pattern: 'forklift lifting', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'forklift is mobile plant' },
  { pattern: 'forklift operator', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'vehicle operator' },
  { pattern: 'scissor lift', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'boom lift', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'cherry picker', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'mewp', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'mobile elevated platform' },
  { pattern: 'ewp', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'elevated work platform' },
  { pattern: 'lifting morale', wrongCategory: 'Lifting', correctCategory: 'General Site Issues', reason: 'figurative expression' },
  { pattern: 'lifting spirits', wrongCategory: 'Lifting', correctCategory: 'General Site Issues', reason: 'figurative expression' },
  { pattern: 'pallet jack', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'manual handling equipment' },
  { pattern: 'hand pallet truck', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'manual handling equipment' },

  // Confined Spaces disambiguations
  { pattern: 'open pit', wrongCategory: 'Confined Spaces', correctCategory: 'Breaking Ground & Excavation', reason: 'excavation hazard, not confined space' },
  { pattern: 'open pits', wrongCategory: 'Confined Spaces', correctCategory: 'Breaking Ground & Excavation', reason: 'excavation hazard, not confined space' },
  { pattern: 'pit without barricade', wrongCategory: 'Confined Spaces', correctCategory: 'Breaking Ground & Excavation', reason: 'excavation hazard' },
  { pattern: 'office space', wrongCategory: 'Confined Spaces', correctCategory: 'General Site Issues', reason: 'work area, not confined space' },
  { pattern: 'storage space', wrongCategory: 'Confined Spaces', correctCategory: 'Housekeeping', reason: 'storage area' },
  { pattern: 'parking space', wrongCategory: 'Confined Spaces', correctCategory: 'Traffic Management', reason: 'vehicle parking' },
  { pattern: 'work space', wrongCategory: 'Confined Spaces', correctCategory: 'General Site Issues', reason: 'work area' },
  { pattern: 'living space', wrongCategory: 'Confined Spaces', correctCategory: 'Worker Welfare', reason: 'accommodation' },

  // Working at Height disambiguations
  { pattern: 'fallen sign', wrongCategory: 'Working at Height', correctCategory: 'General Site Issues', reason: 'object on ground' },
  { pattern: 'fallen signage', wrongCategory: 'Working at Height', correctCategory: 'General Site Issues', reason: 'signage issue' },
  { pattern: 'fallen barrier', wrongCategory: 'Working at Height', correctCategory: 'Access', reason: 'barrier issue' },
  { pattern: 'fallen barricade', wrongCategory: 'Working at Height', correctCategory: 'Access', reason: 'barricade issue' },
  { pattern: 'fallen cone', wrongCategory: 'Working at Height', correctCategory: 'Traffic Management', reason: 'traffic equipment' },
  { pattern: 'fall protection', wrongCategory: 'Working at Height', correctCategory: 'Working at Height', reason: 'confirm - height safety equipment' },
  { pattern: 'height of scaffold', wrongCategory: 'Working at Height', correctCategory: 'Working at Height', reason: 'confirm - scaffold measurement' },
  { pattern: 'tall building', wrongCategory: 'Working at Height', correctCategory: 'General Site Issues', reason: 'structure description' },
  { pattern: 'height measurement', wrongCategory: 'Working at Height', correctCategory: 'General Site Issues', reason: 'measurement activity' },

  // COSHH / Chemical disambiguations
  { pattern: 'food poisoning', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'illness from food, not chemical' },
  { pattern: 'food poison', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'illness from food' },
  { pattern: 'stomach bug', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'illness' },
  { pattern: 'sick from food', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'food-related illness' },

  // PPE disambiguations → Unclassified (PPE is a control, not a hazard)
  { pattern: 'ppe available', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE availability' },
  { pattern: 'ppe missing', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE issue' },
  { pattern: 'ppe not worn', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },

  // Driving disambiguations
  { pattern: 'driving rain', wrongCategory: 'Driving', correctCategory: 'General Site Issues', reason: 'weather condition' },
  { pattern: 'driving wind', wrongCategory: 'Driving', correctCategory: 'General Site Issues', reason: 'weather condition' },
  { pattern: 'pile driving', wrongCategory: 'Driving', correctCategory: 'Breaking Ground & Excavation', reason: 'piling operation' },
  { pattern: 'sheet pile driving', wrongCategory: 'Driving', correctCategory: 'Breaking Ground & Excavation', reason: 'piling operation' },

  // Training/meetings → Unclassified (training is a control, not a hazard)
  { pattern: 'toolbox talk', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety engagement activity' },
  { pattern: 'safety meeting', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety engagement' },
  { pattern: 'safety briefing', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety engagement' },
  { pattern: 'safety induction', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'training activity' },
  { pattern: 'site induction', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'training activity' },
  { pattern: 'good catch', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'positive observation' },
  { pattern: 'near miss report', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'reporting activity' },

  // ============================================================================
  // NEW DISAMBIGUATION RULES (for common phrases from real data)
  // ============================================================================

  // Checklist and inspection patterns
  { pattern: 'checklist updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection compliance' },
  { pattern: 'checklist not updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },
  { pattern: 'checklist was updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection compliance' },
  { pattern: 'checklist found updated', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection compliance' },
  { pattern: 'toilet checklist', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare inspection' },
  { pattern: 'ambulance checklist', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency equipment' },
  { pattern: 'generator checklist', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment inspection' },
  { pattern: 'welding machine checklist', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment inspection' },
  { pattern: 'first aid box checklist', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency equipment' },
  { pattern: 'inspection tag', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment inspection' },
  { pattern: 'color coding', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection system' },
  { pattern: 'colour coding', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection system' },
  { pattern: 'not inspected', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },
  { pattern: 'not color coded', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },
  { pattern: 'not colour coded', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },

  // Water and welfare patterns
  { pattern: 'drinking water not', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare issue' },
  { pattern: 'drinking water available', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare positive' },
  { pattern: 'drinking water was not', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare issue' },
  { pattern: 'water not provided', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare issue' },
  { pattern: 'potable water', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare item' },
  { pattern: 'no water provided', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare issue' },
  { pattern: 'water sprinkling', wrongCategory: 'Working on or Near Water', correctCategory: 'Respiratory Hazard', reason: 'dust suppression' },
  { pattern: 'water spraying', wrongCategory: 'Working on or Near Water', correctCategory: 'Respiratory Hazard', reason: 'dust suppression' },
  { pattern: 'water spray', wrongCategory: 'Working on or Near Water', correctCategory: 'Respiratory Hazard', reason: 'dust suppression' },
  { pattern: 'welfare facility', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare area' },
  { pattern: 'rest shelter', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare area' },

  // Safety officer and supervision patterns → Unclassified (supervision is a control)
  { pattern: 'safety officer not present', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision issue' },
  { pattern: 'no safety officer', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision issue' },
  { pattern: 'without safety coverage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision issue' },
  { pattern: 'safety personnel', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision' },
  { pattern: 'without supervision', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision issue' },
  { pattern: 'without safety officer', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision issue' },
  { pattern: 'safety coverage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision' },
  { pattern: 'lack of supervision', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision issue' },

  // PPE patterns → Unclassified (PPE is a control, not a hazard)
  { pattern: 'not wearing ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'without ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'ppe not worn', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'ear protection', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'hearing PPE' },
  { pattern: 'safety glasses', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'eye PPE' },
  { pattern: 'safety goggles', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'eye PPE' },
  { pattern: 'not wearing proper ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'incomplete ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'proper ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE requirement' },

  // Training and briefing patterns → Unclassified (training is a control)
  { pattern: 'pre-task briefing', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'briefing activity' },
  { pattern: 'pre task briefing', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'briefing activity' },
  { pattern: 'tbt', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'toolbox talk' },
  { pattern: 'lmra', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'risk assessment' },
  { pattern: 'safety standout', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety meeting' },
  { pattern: 'safety stand down', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety meeting' },
  { pattern: 'competent person', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'competency' },

  // Positive observation patterns → Unclassified (behavioral observations)
  { pattern: 'positive observation', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'behavioral safety' },
  { pattern: 'positive culture', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety culture' },
  { pattern: 'best performer', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'recognition' },
  { pattern: 'gift card', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'recognition/reward' },
  { pattern: 'indicating a positive', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'positive observation' },

  // Housekeeping patterns
  { pattern: 'poor housekeeping', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping issue' },
  { pattern: 'good housekeeping', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping positive' },
  { pattern: 'housekeeping done', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping activity' },
  { pattern: 'housekeeping not done', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping issue' },
  { pattern: 'housekeeping is on going', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping activity' },
  { pattern: 'food waste', wrongCategory: 'Worker Welfare', correctCategory: 'Housekeeping', reason: 'cleanliness issue' },
  { pattern: 'waste bin', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste management' },
  { pattern: 'bin overflowing', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste management' },
  { pattern: 'overflowing', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste issue' },
  { pattern: 'stacked improperly', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'storage issue' },
  { pattern: 'protruding nail', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement/puncture hazard' },
  { pattern: 'protruding nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement/puncture hazard' },

  // Access patterns
  { pattern: 'obstructed access', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },
  { pattern: 'blocked access', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },
  { pattern: 'safe access', wrongCategory: null, correctCategory: 'Access', reason: 'access requirement' },
  { pattern: 'obstructed by', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },
  { pattern: 'no planks', wrongCategory: null, correctCategory: 'Access', reason: 'safe movement/walkway missing' },
  { pattern: 'planks have been provided', wrongCategory: null, correctCategory: 'Access', reason: 'walkway provided' },
  { pattern: 'safe movement', wrongCategory: null, correctCategory: 'Access', reason: 'access requirement' },
  { pattern: 'walkway access', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },
  { pattern: 'access area', wrongCategory: null, correctCategory: 'Access', reason: 'access issue' },

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

  // Signage patterns → Unclassified (signage is a control)
  { pattern: 'no signage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage missing' },
  { pattern: 'signage not', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage issue' },
  { pattern: 'sign not installed', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage missing' },
  { pattern: 'suitable signage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage requirement' },
  { pattern: 'no awareness signage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage missing' },
  { pattern: 'awareness signage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage required' },
  { pattern: 'warning signage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage requirement' },

  // Equipment and tools specific
  { pattern: 'rotating part', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'machine guarding' },
  { pattern: 'machine guard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'machine guarding' },
  { pattern: 'damaged wheelbarrow', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment condition' },
  { pattern: 'damaged equipment', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment condition' },
  { pattern: 'damaged tool', wrongCategory: null, correctCategory: 'Tools', reason: 'tool condition' },

  // Barricade specific → Route to actual hazard
  { pattern: 'barricade left open', wrongCategory: null, correctCategory: 'Access', reason: 'barricade issue' },
  { pattern: 'barricade was left', wrongCategory: null, correctCategory: 'Access', reason: 'barricade issue' },
  { pattern: 'without barricade', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'barricade missing' },
  { pattern: 'unprotected edge', wrongCategory: null, correctCategory: 'Working at Height', reason: 'edge protection' },

  // Dust control specific
  { pattern: 'dust control', wrongCategory: null, correctCategory: 'Respiratory Hazard', reason: 'dust management' },
  { pattern: 'suppress dust', wrongCategory: null, correctCategory: 'Respiratory Hazard', reason: 'dust management' },
  { pattern: 'reduce dust', wrongCategory: null, correctCategory: 'Respiratory Hazard', reason: 'dust management' },
  { pattern: 'air quality', wrongCategory: null, correctCategory: 'Respiratory Hazard', reason: 'air quality' },
  { pattern: 'too much dust', wrongCategory: null, correctCategory: 'Respiratory Hazard', reason: 'dust issue' },

  // Emergency preparedness specific → Worker Welfare or Fire
  { pattern: 'first aid kit', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency equipment' },
  { pattern: 'first aid box', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency equipment' },
  { pattern: 'first aider', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency response' },
  { pattern: 'fire extinguisher not inspected', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'extinguisher inspection', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'spill kit', wrongCategory: null, correctCategory: 'COSHH', reason: 'chemical spill equipment' },
  { pattern: 'assembly point', wrongCategory: null, correctCategory: 'Fire', reason: 'fire evacuation procedure' },

  // Weather and environment patterns
  { pattern: 'weather station', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'weather monitoring' },
  { pattern: 'insufficient lighting', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'lighting issue' },
  { pattern: 'poor lighting', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'lighting issue' },
  { pattern: 'poorly illuminated', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'lighting issue' },

  // ============================================================================
  // NEW DISAMBIGUATION RULES (from low confidence analysis)
  // ============================================================================

  // Rebar and steel protection patterns - PHYSICAL HAZARDS → Physical Hazard
  { pattern: 'rebar cap', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'sharp object protection' },
  { pattern: 'rebar caps', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'sharp object protection' },
  { pattern: 'protruding rebar', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement hazard' },
  { pattern: 'exposed rebar', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement hazard' },
  { pattern: 'protruding rebars', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement hazard' },
  { pattern: 'without rebar cap', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement hazard' },
  { pattern: 'no rebar caps', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement hazard' },
  { pattern: 'steel bar without', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'impalement hazard' },
  { pattern: 'sharp steel', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'impalement hazard', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'physical hazard' },
  { pattern: 'impalement', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'physical hazard' },
  { pattern: 'risk of impalement', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'physical hazard' },
  { pattern: 'safety cap', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'rebar protection' },
  { pattern: 'wooden coverings', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'rebar protection' },
  { pattern: 'tie rod', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'sharp object' },
  { pattern: 'tie rods', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'sharp object' },
  { pattern: 'exposed tie rod', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'sharp object' },

  // Wood and timber patterns (with exposed nails → Physical Hazard, plain wood → Housekeeping)
  { pattern: 'wood timbers', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material hazard' },
  { pattern: 'wooden planks', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material' },
  { pattern: 'nails not removed', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'unwanted wood', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'cleanup required' },
  { pattern: 'timber with nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'timber with exposed', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'exposed nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'plywood with nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },

  // Cement and materials patterns
  { pattern: 'cement bags', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material storage' },
  { pattern: 'empty cement bags', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'cleanup required' },
  { pattern: 'empty bags', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'cleanup required' },
  { pattern: 'polythene covering', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material protection' },
  { pattern: 'without covering', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'storage issue' },

  // NOTE: Removed inspection context patterns that were overriding actual hazards
  // "during site inspection", "it was observed" etc. are CONTEXT, not the hazard itself
  // The WHAT (actual hazard) should take priority over WHEN/WHERE (inspection context)

  // Manlift and aerial platform patterns
  { pattern: 'operating the manlift', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'aerial platform operation' },
  { pattern: 'manlift in area', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'aerial platform' },
  { pattern: 'standing on the side', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'improper positioning in platform' },
  { pattern: 'of the basket', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'aerial platform positioning' },

  // Water pump / electrical near water patterns
  { pattern: 'electrical water pump', wrongCategory: 'Working on or Near Water', correctCategory: 'Energized System', reason: 'electrical equipment' },
  { pattern: 'water pump near', wrongCategory: 'Working on or Near Water', correctCategory: 'Energized System', reason: 'electrical equipment near water' },
  { pattern: 'pumps near to water', wrongCategory: 'Working on or Near Water', correctCategory: 'Energized System', reason: 'electrical hazard' },

  // Open floor / excavation protection patterns → Actual hazard
  { pattern: 'open floor', wrongCategory: null, correctCategory: 'Working at Height', reason: 'fall hazard' },
  { pattern: 'open floors', wrongCategory: null, correctCategory: 'Working at Height', reason: 'fall hazard' },
  { pattern: 'unprotected excavated', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'excavation protection' },
  { pattern: 'excavated area', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'excavation hazard' },
  { pattern: 'unsecured grating', wrongCategory: null, correctCategory: 'Working at Height', reason: 'fall hazard' },
  { pattern: 'green mesh', wrongCategory: null, correctCategory: 'Access', reason: 'safety mesh/barrier' },

  // Suggestion box / positive culture patterns → Unclassified
  { pattern: 'suggestion box', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'employee engagement' },
  { pattern: 'ideas and feedback', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety culture' },
  { pattern: 'continuous improvement', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety culture' },
  { pattern: 'overconfidence', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'behavioral observation' },
  { pattern: 'lack of proper positioning', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'behavioral observation' },

  // Driving campaign patterns → Unclassified
  { pattern: 'safe driving campaign', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety campaign' },
  { pattern: 'driving campaign', wrongCategory: 'Driving', correctCategory: 'General Site Issues', reason: 'safety campaign not driving activity' },
  { pattern: 'campaign was found', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'safety campaign' },

  // Proper arrangement / lifting positive patterns
  { pattern: 'proper arrangement', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting preparation' },
  { pattern: 'lifting operation', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting activity' },

  // Bulletin board patterns → Unclassified
  { pattern: 'bulletin board', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'information display' },
  { pattern: 'campaign bulletin', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'information display' },
  { pattern: 'weekly campaign bulletin', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'information display' },

  // Backfilling / interference patterns
  { pattern: 'backfilling work', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'excavation activity' },
  { pattern: 'too close to each other', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'activity interference' },
  { pattern: 'interference between', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'activity interference' },

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

  // Exposed nails patterns → Physical Hazard
  // Note: Already defined above in rebar section

  // Falling object patterns (Working at Height - objects from elevation)
  { pattern: 'falling object hazard', wrongCategory: null, correctCategory: 'Working at Height', reason: 'dropped object from height' },
  { pattern: 'falling object', wrongCategory: null, correctCategory: 'Working at Height', reason: 'dropped object from height' },
  { pattern: 'on top of the pillars', wrongCategory: null, correctCategory: 'Working at Height', reason: 'elevated location' },

  // Exclusion zone patterns (Lifting)
  { pattern: 'exclusion zone', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting safety zone' },
  { pattern: 'exclusion zones', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting safety zone' },
  { pattern: 'lifting activity', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting operation' },

  // Slip trip fall patterns (Housekeeping)
  { pattern: 'slip, trip, and fall', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'walking surface hazard' },
  { pattern: 'slip trip fall', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'walking surface hazard' },
  { pattern: 'spikes protruding', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },

  // Emergency contact patterns
  { pattern: 'emergency contact number', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'emergency information' },
  { pattern: 'contact number displayed', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'emergency information' },

  // Confined space protection
  { pattern: 'hard protection for', wrongCategory: null, correctCategory: 'Confined Spaces', reason: 'confined space barrier' },
  { pattern: 'protection for the confined', wrongCategory: null, correctCategory: 'Confined Spaces', reason: 'confined space barrier' },

  // Pressure washer / equipment inspection
  { pattern: 'pressure washer', wrongCategory: null, correctCategory: 'Tools', reason: 'equipment' },
  { pattern: 'has not been inspected', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection issue' },

  // Environmental hazards (sewage, contamination, spills)
  { pattern: 'sewage tank is full', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental/hygiene hazard' },
  { pattern: 'sewage tank full', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental/hygiene hazard' },
  { pattern: 'septic tank is full', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental/hygiene hazard' },
  { pattern: 'septic tank full', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental/hygiene hazard' },
  { pattern: 'septic tank is overflowing', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental contamination' },
  { pattern: 'septic tank overflowing', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental contamination' },
  { pattern: 'septic tank was found full', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental contamination' },
  { pattern: 'toilet sewage tank', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental/hygiene hazard' },
  { pattern: 'sewage overflow', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental contamination' },
  { pattern: 'septic overflow', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental contamination' },
  { pattern: 'environmental hazard', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental issue' },
  { pattern: 'environmental contamination', wrongCategory: null, correctCategory: 'Environmental', reason: 'contamination' },
  { pattern: 'environmental risk', wrongCategory: null, correctCategory: 'Environmental', reason: 'environmental issue' },
  { pattern: 'hygiene hazard', wrongCategory: null, correctCategory: 'Environmental', reason: 'hygiene/environmental' },
  { pattern: 'hygiene risk', wrongCategory: null, correctCategory: 'Environmental', reason: 'hygiene/environmental' },
  { pattern: 'oil spillage', wrongCategory: null, correctCategory: 'Environmental', reason: 'spill/contamination' },
  { pattern: 'oil spill', wrongCategory: null, correctCategory: 'Environmental', reason: 'spill/contamination' },
  { pattern: 'minor oil leakage', wrongCategory: null, correctCategory: 'Environmental', reason: 'spill/contamination' },
  { pattern: 'oil leakage', wrongCategory: null, correctCategory: 'Environmental', reason: 'spill/contamination' },

  // Temporary Works hazards (makeshift, collapse risk)
  { pattern: 'makeshift scaffold', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'temporary structure' },
  { pattern: 'makeshift rack', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'temporary structure' },
  { pattern: 'risk of collapse', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'structural hazard' },
  { pattern: 'high risk of collapse', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'structural hazard' },
  { pattern: 'unstable and overloaded', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'structural hazard' },
  { pattern: 'overloaded makeshift', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'structural hazard' },
  { pattern: 'unstable rack', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'structural hazard' },
  { pattern: 'unstable storage', wrongCategory: null, correctCategory: 'Temporary Works', reason: 'structural hazard' },

  // Fire hazards (fuel, flammable materials)
  { pattern: 'drip tray full', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable liquid hazard' },
  { pattern: 'drip tray full of diesel', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable liquid hazard' },
  { pattern: 'drip tray full of oil', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable liquid hazard' },
  { pattern: 'drip tray overflow', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable liquid hazard' },
  { pattern: 'chance of fire', wrongCategory: null, correctCategory: 'Fire', reason: 'fire risk' },
  { pattern: 'fire hazard', wrongCategory: null, correctCategory: 'Fire', reason: 'fire risk' },
  { pattern: 'fire hazards', wrongCategory: null, correctCategory: 'Fire', reason: 'fire risk' },
  { pattern: 'fire risk', wrongCategory: null, correctCategory: 'Fire', reason: 'fire risk' },
  { pattern: 'diesel storage', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable storage' },
  { pattern: 'fuel storage', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable storage' },
  { pattern: 'flammable liquid', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable material' },
  { pattern: 'flammable material', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable material' },
  { pattern: 'accumulated diesel', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable liquid hazard' },
  { pattern: 'diesel leak', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable liquid hazard' },
  { pattern: 'fuel leak', wrongCategory: null, correctCategory: 'Fire', reason: 'flammable liquid hazard' },

  // Emergency Preparedness (first aid, welfare facilities)
  { pattern: 'first aid box not provided', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'first aid not provided', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'no first aid', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'first aid box not available', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'first aid box missing', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'toilet not provided', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'no toilet provided', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'toilet not available', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'welfare facility', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare/hygiene' },
  { pattern: 'welfare facilities', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare/hygiene' },
  { pattern: 'drinking water not provided', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },
  { pattern: 'no drinking water', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'welfare facility' },

  // Slips Trips Falls hazards
  { pattern: 'risk of falls', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'fall hazard' },
  { pattern: 'risk of fall', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'fall hazard' },
  { pattern: 'risk of slipping', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'slip hazard' },
  { pattern: 'risk of tripping', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'trip hazard' },
  { pattern: 'not properly fixed', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'unstable surface' },
  { pattern: 'not properly secured', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'unstable surface' },
  { pattern: 'wooden steps', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'walking surface' },
  { pattern: 'stairs not', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'stairway hazard' },
  { pattern: 'steps not', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'stairway hazard' },
  { pattern: 'uneven surface', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'trip hazard' },
  { pattern: 'slippery surface', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'slip hazard' },
  { pattern: 'wet floor', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'slip hazard' },
  { pattern: 'floor hazard', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'walking surface hazard' },
  { pattern: 'floor not level', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'trip hazard' },
  { pattern: 'loose flooring', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'trip hazard' },

  // Access hazards (obstructed pathways, egress)
  { pattern: 'across access pathway', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed pathway' },
  { pattern: 'blocking access', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed access' },
  { pattern: 'obstructed pathway', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed pathway' },
  { pattern: 'obstructed access', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed access' },
  { pattern: 'obstructed egress', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed egress' },
  { pattern: 'egress pathway', wrongCategory: null, correctCategory: 'Access', reason: 'egress route' },
  { pattern: 'egress route', wrongCategory: null, correctCategory: 'Access', reason: 'egress route' },
  { pattern: 'emergency exit blocked', wrongCategory: null, correctCategory: 'Access', reason: 'blocked egress' },
  { pattern: 'exit blocked', wrongCategory: null, correctCategory: 'Access', reason: 'blocked egress' },
  { pattern: 'pathway blocked', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed pathway' },
  { pattern: 'access blocked', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed access' },
  { pattern: 'obstructing clear movement', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed movement' },
  { pattern: 'clear movement', wrongCategory: null, correctCategory: 'Access', reason: 'movement obstruction' },
  { pattern: 'safe movement', wrongCategory: null, correctCategory: 'Access', reason: 'movement/access issue' },
  { pattern: 'no proper access', wrongCategory: null, correctCategory: 'Access', reason: 'inadequate access' },
  { pattern: 'adequate access', wrongCategory: null, correctCategory: 'Access', reason: 'access assessment' },
  { pattern: 'access issue', wrongCategory: null, correctCategory: 'Access', reason: 'access hazard' },
  { pattern: 'walkway obstructed', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed walkway' },
  { pattern: 'walkway blocked', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed walkway' },
  { pattern: 'steel rebars across', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed pathway' },
  { pattern: 'materials across pathway', wrongCategory: null, correctCategory: 'Access', reason: 'obstructed pathway' },

  // Protruding nails variations (Physical Hazard)
  { pattern: 'protruding nail', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'protruding nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'nails protruding', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'nail protruding', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'sharp nail', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'sharp nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'rusty nail', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },
  { pattern: 'rusty nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' },

  // ============================================================================
  // MAN-MACHINE INTERFACE (MEPI) PATTERNS → Mobile Plant & Equipment
  // These are about workers in proximity to moving equipment
  // ============================================================================
  { pattern: 'man-machine interface', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - worker near moving equipment' },
  { pattern: 'man machine interface', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - worker near moving equipment' },
  { pattern: 'man and machine interface', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - worker near moving equipment' },
  { pattern: 'man & machine interface', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - worker near moving equipment' },
  { pattern: 'mepi', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'man-machine', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'no boots on ground', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI policy violation' },
  { pattern: 'boots on ground', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI policy' },
  { pattern: 'working in man-machine', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'in man-machine interface', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'close proximity to', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - worker near equipment' },
  { pattern: 'close to operation equipment', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'close to operating equipment', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'near moving equipment', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'near moving plant', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'near active', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - near active equipment' },
  { pattern: 'struck-by hazard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'struck-by hazard from equipment' },
  { pattern: 'struck by hazard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'struck-by hazard from equipment' },
  { pattern: 'line of fire', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'struck-by hazard zone, not fire' },
  { pattern: 'directing dump truck', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - person directing equipment' },
  { pattern: 'standing in line of fire', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'struck-by hazard zone, not fire' },
  { pattern: 'within the line of fire', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'struck-by hazard zone, not fire' },
  { pattern: 'roaming close to', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - worker near equipment' },
  { pattern: 'moving around mobile plant', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'positioned in between', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - between moving equipment' },
  { pattern: 'few meters from', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - proximity to equipment' },
  { pattern: 'operatives were observed working very close', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'working very close to a moving', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'insufficient clearance between', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard - inadequate separation' },

  // ============================================================================
  // QR CODE / VERI-FI / VVS STATUS PATTERNS → Mobile Plant & Equipment
  // Equipment verification and certification status
  // ============================================================================
  { pattern: 'qr code', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment verification status' },
  { pattern: 'qr-code', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment verification status' },
  { pattern: 'veri-fi', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM equipment verification' },
  { pattern: 'verifi', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM equipment verification' },
  { pattern: 'veri fi', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM equipment verification' },
  { pattern: 'neom qr code', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM equipment verification' },
  { pattern: 'vvs system', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'vehicle verification system' },
  { pattern: 'vvs status', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'vehicle verification system' },
  { pattern: 'red status', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment red status - non-compliant' },
  { pattern: 'red category', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment red category - non-compliant' },
  { pattern: 'access denied status', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment access denied' },
  { pattern: 'exp qr code', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'expired QR code' },
  { pattern: 'expired qr', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'expired QR code' },
  { pattern: 'baar code expired', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'expired barcode/QR' },
  { pattern: 'bar code expired', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'expired barcode/QR' },
  { pattern: 'barcode expired', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'expired barcode/QR' },

  // ============================================================================
  // EQUIPMENT CERTIFICATION PATTERNS → Mobile Plant & Equipment
  // Third party certification, TPC, MVP certificates
  // ============================================================================
  { pattern: 'third party certified', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment certification' },
  { pattern: 'third party certification', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment certification' },
  { pattern: 'third-party certified', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment certification' },
  { pattern: 'tpc expired', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'third party certification expired' },
  { pattern: 'tpc found expired', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'third party certification expired' },
  { pattern: 'tpc was expired', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'third party certification expired' },
  { pattern: 'tpc of the', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'third party certification' },
  { pattern: 'mvp certificate', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment MVP certification' },
  { pattern: 'expired mvp', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'expired MVP certificate' },
  { pattern: '3rd party certificate', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment certification' },
  { pattern: 'certificate was expired', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment certification expired' },
  { pattern: 'proof of worthiness', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment fitness verification' },
  { pattern: 'verifiable proof', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment verification' },

  // ============================================================================
  // PWAS / CAMERA PATTERNS → Mobile Plant & Equipment
  // Proximity Warning and Alert System cameras
  // ============================================================================
  { pattern: 'pwas', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'proximity warning system' },
  { pattern: 'pwas camera', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'proximity warning camera' },
  { pattern: 'pwas cameras', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'proximity warning cameras' },
  { pattern: 'pwas-360', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: '360 proximity warning camera' },
  { pattern: 'pwas system', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'proximity warning system' },
  { pattern: 'pwas not installed', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'missing PWAS' },
  { pattern: 'without pwas', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'missing PWAS' },
  { pattern: 'non-availability pwas', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'missing PWAS' },
  { pattern: '360 camera', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment camera system' },
  { pattern: 'camera was missing', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment camera missing' },
  { pattern: 'cameras were not installed', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment cameras missing' },
  { pattern: 'alarm feature', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment alarm system' },

  // ============================================================================
  // BEACON LIGHT / WARNING LIGHT PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'beacon light', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment warning light' },
  { pattern: 'beacon lights', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment warning lights' },
  { pattern: 'blinking light', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment warning light' },
  { pattern: 'blinking lights', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment warning lights' },
  { pattern: 'beacon was missing', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'missing beacon light' },
  { pattern: 'beacon light was turned off', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'beacon not activated' },
  { pattern: 'beacon light was not switched', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'beacon not activated' },
  { pattern: 'lights not functioning', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment lights malfunction' },
  { pattern: 'strobe light', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment warning light' },
  { pattern: 'warning light', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment warning light' },
  { pattern: 'rotating beacon', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment warning light' },

  // ============================================================================
  // BLACK SMOKE / EMISSIONS PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'black smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment emissions issue' },
  { pattern: 'emitting black smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment emissions' },
  { pattern: 'emitting smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment emissions' },
  { pattern: 'too much smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment emissions' },
  { pattern: 'make black smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment emissions' },
  { pattern: 'exhaust smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment emissions' },
  { pattern: 'bldozer black smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'bulldozer emissions' },
  { pattern: 'bulldozer black smoke', wrongCategory: 'Fire', correctCategory: 'Mobile Plant & Equipment', reason: 'bulldozer emissions' },

  // ============================================================================
  // WHEEL CHOCK PATTERNS → Mobile Plant & Equipment (maintenance context)
  // ============================================================================
  { pattern: 'wheel chock', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance safety' },
  { pattern: 'wheel chocks', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance safety' },
  { pattern: 'wheel chock not in use', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'maintenance without wheel chock' },
  { pattern: 'wheel chocks not in use', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'maintenance without wheel chock' },
  { pattern: 'wheel chocks were not placed', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'missing wheel chocks' },
  { pattern: 'without wheel chock', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'missing wheel chocks' },
  { pattern: 'chocks were not placed', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'missing wheel chocks' },
  { pattern: 'did not provide wheel chock', wrongCategory: 'Traffic Management', correctCategory: 'Mobile Plant & Equipment', reason: 'missing wheel chocks' },
  { pattern: 'truck may move during', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'uncontrolled equipment movement risk' },

  // ============================================================================
  // HYDRAULIC / OIL LEAK PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'hydraulic leak', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment hydraulic failure' },
  { pattern: 'hydraulic leaked', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment hydraulic failure' },
  { pattern: 'hydraulic pump leaked', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment hydraulic failure' },
  { pattern: 'hydrolic leak', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment hydraulic failure (typo)' },
  { pattern: 'oil leak', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment oil leak' },
  { pattern: 'oil leakage', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment oil leak' },
  { pattern: 'oil spil', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment oil spill (typo)' },
  { pattern: 'leaking hydraulic', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment hydraulic failure' },
  { pattern: 'rusty and unlubricated', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance issue' },
  { pattern: 'crawler tracks', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'tracked equipment' },

  // ============================================================================
  // ROTATING PARTS / MACHINE GUARD PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'rotating parts', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'unguarded rotating parts' },
  { pattern: 'rotating part', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'unguarded rotating parts' },
  { pattern: 'moving parts', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'unguarded moving parts' },
  { pattern: 'moving machine parts', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'unguarded moving parts' },
  { pattern: 'protection guard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment guarding' },
  { pattern: 'protection gurad', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment guarding (typo)' },
  { pattern: 'without guard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'unguarded equipment' },
  { pattern: 'without any guard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'unguarded equipment' },
  { pattern: 'safety guard', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment guarding' },
  { pattern: 'safety guards', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment guarding' },
  { pattern: 'safeguarded adequately', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment guarding' },
  { pattern: 'not safeguarded', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'inadequate equipment safeguards' },
  { pattern: 'not adequately safeguarded', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'inadequate equipment safeguards' },
  { pattern: 'missing safety panels', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'missing equipment guards' },
  { pattern: 'missing guards', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'missing equipment guards' },
  { pattern: 'exposing the rotating', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'exposed rotating parts' },

  // ============================================================================
  // COMPRESSOR / AIR HOSE PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'whip check', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'air hose safety' },
  { pattern: 'whip lash arrestor', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'air hose safety' },
  { pattern: 'whiplash arrestor', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'air hose safety' },
  { pattern: 'whip lash arrester', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'air hose safety' },
  { pattern: 'air hose compressor', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compressor equipment' },
  { pattern: 'air hose joints', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compressor air hose' },
  { pattern: 'air receiving tank', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compressor pressure vessel' },
  { pattern: 'compressor was not', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compressor equipment' },

  // ============================================================================
  // BUCKET / PIN ASSEMBLY PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'bucket with iron rod', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'improper bucket attachment' },
  { pattern: 'instead of a cotter pin', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'improper pin assembly' },
  { pattern: 'pin assembly', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment pin assembly' },
  { pattern: 'fixing the pin', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance' },
  { pattern: 'excavator bucket', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'excavator attachment' },
  { pattern: 'backhoe bucket', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'backhoe attachment' },
  { pattern: 'makeshift welded', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'improper equipment repair' },
  { pattern: 'counter pin lock', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment locking mechanism' },
  { pattern: 'locking system', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment locking' },
  { pattern: 'backshield protection', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment protection' },

  // ============================================================================
  // DUMP TRUCK / TIPPER SPECIFIC PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'dump truck', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dump truck equipment' },
  { pattern: 'dumper truck', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dump truck equipment' },
  { pattern: 'tipper truck', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'tipper truck equipment' },
  { pattern: 'haul truck', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'haul truck equipment' },
  { pattern: 'back door no open', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dump truck door malfunction' },
  { pattern: 'door no moving', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dump truck door malfunction' },
  { pattern: 'no good working', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment malfunction' },
  { pattern: 'retro reflective tape', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment visibility marking' },
  { pattern: 'retroreflective tape', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment visibility marking' },
  { pattern: 'heap shape', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'improper material hauling' },
  { pattern: 'carrying spoil', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'spoil hauling' },
  { pattern: 'hauling operation', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'hauling operation' },
  { pattern: 'front cabnet open', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment cab door issue (typo)' },
  { pattern: 'front cabinet open', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment cab door issue' },
  { pattern: 'tipping operations', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dump truck tipping' },
  { pattern: 'dumping material', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dumping operation' },
  { pattern: 'during dumping', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dumping operation' },
  { pattern: 'at the time of dumping', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'dumping operation' },
  { pattern: 'tarping station', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'tarping operation near equipment' },
  { pattern: 'ticket counter', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'ticket counter in MEPI zone' },

  // ============================================================================
  // OBSTRUCTED VIEW / VISIBILITY PATTERNS → Driving
  // ============================================================================
  { pattern: 'curtain on a window', wrongCategory: null, correctCategory: 'Driving', reason: 'obstructed driver view' },
  { pattern: 'curtain on window', wrongCategory: null, correctCategory: 'Driving', reason: 'obstructed driver view' },
  { pattern: 'curtains used to cover', wrongCategory: null, correctCategory: 'Driving', reason: 'obstructed driver view' },
  { pattern: 'obstructive view', wrongCategory: null, correctCategory: 'Driving', reason: 'obstructed driver view' },
  { pattern: 'restricted vision', wrongCategory: null, correctCategory: 'Driving', reason: 'obstructed driver view' },
  { pattern: 'dirt on windscreen', wrongCategory: null, correctCategory: 'Driving', reason: 'obstructed driver view' },
  { pattern: 'windscreens and side window', wrongCategory: null, correctCategory: 'Driving', reason: 'obstructed driver view' },
  { pattern: 'traditional dress kurta', wrongCategory: null, correctCategory: 'Driving', reason: 'driver dress code violation' },
  { pattern: 'freelancer driver', wrongCategory: null, correctCategory: 'Driving', reason: 'unauthorized driver' },
  { pattern: 'driver competency', wrongCategory: null, correctCategory: 'Driving', reason: 'driver qualification' },

  // ============================================================================
  // PARKING / DESIGNATED AREA PATTERNS → Traffic Management
  // ============================================================================
  { pattern: 'designated parking', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'parking area issue' },
  { pattern: 'undesignated area', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'unauthorized area' },
  { pattern: 'undesignated parking', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'unauthorized parking' },
  { pattern: 'designated area', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'designated area compliance' },
  { pattern: 'not designated', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'unauthorized area' },
  { pattern: 'parked on designated', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'parking compliance' },
  { pattern: 'equipment parking area', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'equipment parking' },
  { pattern: 'heavy equipment parking', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'equipment parking' },
  { pattern: 'light vehicle parking', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'vehicle parking' },
  { pattern: 'parked in laydown area', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'unauthorized parking' },
  { pattern: 'unauthorized parking', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'unauthorized parking' },
  { pattern: 'parked in wrong way', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'improper parking' },
  { pattern: 'parked in an undesignated', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'unauthorized parking' },
  { pattern: 'parked near the edge', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'unsafe parking location' },
  { pattern: 'obstructing access', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'vehicle obstructing access' },
  { pattern: 'obstructing the designated', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'vehicle obstructing designated area' },
  { pattern: 'separate parking for light and heavy', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'segregated parking requirement' },
  { pattern: 'parked on the access road', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'vehicle blocking access' },

  // ============================================================================
  // TRAFFIC CONTROLLER / MANAGEMENT PATTERNS → Traffic Management
  // ============================================================================
  { pattern: 'traffic controller', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'traffic control' },
  { pattern: 'traffic controllers', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'traffic control' },
  { pattern: 'traffic management', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'traffic management' },
  { pattern: 'vehicle movement', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'traffic management' },
  { pattern: 'improper traffic', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'traffic management issue' },
  { pattern: 'blocked by dumper', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road blockage' },
  { pattern: 'internal road was blocked', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road blockage' },
  { pattern: 'entry and exit signage', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'traffic signage' },
  { pattern: 'pick and drop', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'pick up/drop off point' },
  { pattern: 'pick up and drop off', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'pick up/drop off point' },
  { pattern: 'bus pick up', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'bus stop location' },

  // ============================================================================
  // ILLUMINATION / LIGHTING PATTERNS → Traffic Management (for roads) or General
  // ============================================================================
  { pattern: 'tower light', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road illumination' },
  { pattern: 'tower lights', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road illumination' },
  { pattern: 'haul road', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'haul road traffic' },
  { pattern: 'haul roads', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'haul road traffic' },
  { pattern: 'access road', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'access road traffic' },
  { pattern: 'adequately lit', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road illumination' },
  { pattern: 'adequately illuminated', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road illumination' },
  { pattern: 'no illumination', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'missing road illumination' },
  { pattern: 'totally dark', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'inadequate illumination' },
  { pattern: 'lux reading', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'illumination measurement' },
  { pattern: 'lux meter', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'illumination measurement' },
  { pattern: 'lux level', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'illumination level' },
  { pattern: 'no lights available', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'missing illumination' },
  { pattern: 'width of road', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road dimension issue' },
  { pattern: 'unsafe road', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road safety issue' },
  { pattern: 'road edge', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'road edge protection' },
  { pattern: 'signage installed in equipment parking', wrongCategory: null, correctCategory: 'Traffic Management', reason: 'parking signage' },

  // ============================================================================
  // STOCKPILE / OVERHANG / COLLAPSE PATTERNS → Breaking Ground & Excavation
  // ============================================================================
  { pattern: 'stockpile', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'stockpile hazard' },
  { pattern: 'stockpiles', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'stockpile hazard' },
  { pattern: 'stock pile', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'stockpile hazard' },
  { pattern: 'stuckpile', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'stockpile hazard (typo)' },
  { pattern: 'overhang of soil', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'soil overhang collapse risk' },
  { pattern: 'soil overhang', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'soil overhang collapse risk' },
  { pattern: 'significant overhang', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'overhang collapse risk' },
  { pattern: 'risk of detachment', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'soil collapse risk' },
  { pattern: 'subsequent collapse', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'soil collapse risk' },
  { pattern: 'unsupported by any underlying', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'unsupported soil' },
  { pattern: 'insecurely balanced', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'unstable stockpile' },
  { pattern: 'susceptible to vibrations', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'vibration collapse risk' },
  { pattern: 'collapsing over the equipment', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'soil collapse on equipment' },
  { pattern: 'buried under the falling', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'burial hazard' },
  { pattern: 'huge collapse', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'collapse hazard' },
  { pattern: 'removing materials from stockpiles', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'stockpile operations' },
  { pattern: 'backfilling area', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'backfilling operations' },
  { pattern: 'dumping yard', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'dumping area' },

  // ============================================================================
  // OVERHEAD POWER LINE PATTERNS → Energized System
  // ============================================================================
  { pattern: 'overhead power line', wrongCategory: null, correctCategory: 'Energized System', reason: 'overhead electrical hazard' },
  { pattern: 'overhead high voltage', wrongCategory: null, correctCategory: 'Energized System', reason: 'overhead electrical hazard' },
  { pattern: 'under overhead', wrongCategory: null, correctCategory: 'Energized System', reason: 'work under power lines' },
  { pattern: 'directly under overhead', wrongCategory: null, correctCategory: 'Energized System', reason: 'work under power lines' },

  // ============================================================================
  // WELFARE / REST SHELTER PATTERNS → Worker Welfare
  // ============================================================================
  { pattern: 'rest shelter', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'worker welfare facility' },
  { pattern: 'resting shelter', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'worker welfare facility' },
  { pattern: 'welfare facilities', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'worker welfare' },
  { pattern: 'welfare areas', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'worker welfare area' },
  { pattern: 'welfare area', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'worker welfare area' },
  { pattern: 'security cabin', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'site facility' },
  { pattern: 'sitting under heavy equipment', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'unsafe resting location' },
  { pattern: 'resting underneath', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'unsafe resting location' },
  { pattern: 'sitting/resting underneath', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'unsafe resting location' },
  { pattern: 'drinking water station', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'drinking water facility' },
  { pattern: 'lone worker', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'lone working hazard' },
  { pattern: 'working alone', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'lone working hazard' },
  { pattern: 'found working alone', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'lone working hazard' },
  { pattern: 'absence of supervision', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'supervision issue' },
  { pattern: 'immediate assistance', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency response' },
  { pattern: 'emergency procedure', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency preparedness' },
  { pattern: 'emergency numbers', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'emergency information' },
  { pattern: 'insufficient safety coverage', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'supervision issue' },
  { pattern: 'safety officer is present', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'supervision' },
  { pattern: 'iqama is expired', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'documentation compliance' },
  { pattern: 'sewage waste', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'sanitation issue' },
  { pattern: 'pump out the sewage', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'sanitation issue' },
  { pattern: 'tank is full', wrongCategory: null, correctCategory: 'Worker Welfare', reason: 'sanitation issue' },

  // ============================================================================
  // PPE VIOLATIONS → General Site Issues (PPE is a control)
  // ============================================================================
  { pattern: 'mandatory ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'mandatory ppes', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'without mandatory ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE violation' },
  { pattern: 'without basic mandatory ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE violation' },
  { pattern: 'substandard helmet', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE quality issue' },
  { pattern: 'sub standard helmet', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE quality issue' },
  { pattern: 'not wearing safety', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE violation' },
  { pattern: 'without safety gloves', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE violation' },
  { pattern: 'without safety shoes', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE violation' },
  { pattern: 'job specific ppe', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE requirement' },
  { pattern: 'face shield', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE item' },
  { pattern: 'ear plugs', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE item' },
  { pattern: 'improper storage of face shield', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE storage' },
  { pattern: 'wearing safety goggles', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'proper helmet', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE compliance' },
  { pattern: 'without ppes', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE violation' },
  { pattern: 'eye protection and hand protection', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'PPE requirement' },

  // ============================================================================
  // NEOM ID / INDUCTION PATTERNS → Site Security
  // ============================================================================
  { pattern: 'neom id', wrongCategory: null, correctCategory: 'Site Security', reason: 'site ID requirement' },
  { pattern: 'site induction', wrongCategory: null, correctCategory: 'Site Security', reason: 'induction requirement' },
  { pattern: 'site safety induction', wrongCategory: null, correctCategory: 'Site Security', reason: 'induction requirement' },
  { pattern: 'without site induction', wrongCategory: null, correctCategory: 'Site Security', reason: 'induction violation' },
  { pattern: 'unauthorized operatives', wrongCategory: null, correctCategory: 'Site Security', reason: 'unauthorized access' },
  { pattern: 'unauthorized area', wrongCategory: null, correctCategory: 'Site Security', reason: 'unauthorized access' },
  { pattern: 'entered in an unauthorized', wrongCategory: null, correctCategory: 'Site Security', reason: 'unauthorized entry' },
  { pattern: 'company logo stickers', wrongCategory: null, correctCategory: 'Site Security', reason: 'vehicle identification' },
  { pattern: 'identification', wrongCategory: null, correctCategory: 'Site Security', reason: 'identification requirement' },

  // ============================================================================
  // HOUSEKEEPING / STORAGE PATTERNS → Housekeeping
  // ============================================================================
  { pattern: 'cardboard waste', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste accumulation' },
  { pattern: 'cardboards and packing', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste accumulation' },
  { pattern: 'accumulated', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material accumulation' },
  { pattern: 'unwanted material', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'waste material' },
  { pattern: 'cable drum roller', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'equipment storage' },
  { pattern: 'cables drum', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'equipment storage' },
  { pattern: 'unsafe storage', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'storage issue' },
  { pattern: 'without any stopper', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'unsecured storage' },
  { pattern: 'proper housekeeping', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping requirement' },
  { pattern: 'strict housekeeping', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'housekeeping requirement' },
  { pattern: 'gre pipes are stored', wrongCategory: null, correctCategory: 'Housekeeping', reason: 'material storage issue' },

  // ============================================================================
  // TOOLS / EQUIPMENT INSPECTION PATTERNS → Tools
  // ============================================================================
  { pattern: 'drill machine', wrongCategory: null, correctCategory: 'Tools', reason: 'power tool' },
  { pattern: 'without handle', wrongCategory: null, correctCategory: 'Tools', reason: 'tool defect' },
  { pattern: 'lacks a handle', wrongCategory: null, correctCategory: 'Tools', reason: 'tool defect' },
  { pattern: 'without installing the handle', wrongCategory: null, correctCategory: 'Tools', reason: 'improper tool use' },
  { pattern: 'color code', wrongCategory: null, correctCategory: 'Tools', reason: 'inspection color coding' },
  { pattern: 'rotate over hazards', wrongCategory: null, correctCategory: 'Tools', reason: 'tool rotation hazard' },

  // ============================================================================
  // STAIRCASE / ACCESS PATTERNS → Slip and Trip or Access
  // ============================================================================
  { pattern: 'staircase was not designed', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'staircase design issue' },
  { pattern: 'depth of the tread', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'staircase dimension issue' },
  { pattern: 'inadequate width', wrongCategory: null, correctCategory: 'Slip and Trip', reason: 'dimension issue' },

  // ============================================================================
  // SIGNAGE PATTERNS → General Site Issues
  // ============================================================================
  { pattern: 'driving safety signage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage issue' },
  { pattern: 'signage found fell down', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'signage maintenance' },
  { pattern: 'warning signage for stalled', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'warning signage' },
  { pattern: 'missing warning signage', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'missing signage' },

  // ============================================================================
  // HOT WORK / WELDING RELATED IN EQUIPMENT CONTEXT → Hot Work
  // ============================================================================
  { pattern: 'hot work activities', wrongCategory: null, correctCategory: 'Hot Work', reason: 'hot work operation' },
  { pattern: 'cutting and grinding', wrongCategory: null, correctCategory: 'Hot Work', reason: 'hot work activities' },
  { pattern: 'fence removal', wrongCategory: null, correctCategory: 'Hot Work', reason: 'hot work for cutting' },
  { pattern: 'butt fusion', wrongCategory: null, correctCategory: 'Hot Work', reason: 'fusion welding' },
  { pattern: 'butt fusion-welding', wrongCategory: null, correctCategory: 'Hot Work', reason: 'fusion welding' },

  // ============================================================================
  // REFUELING / FUEL STORAGE PATTERNS → Fire
  // ============================================================================
  { pattern: 'designated refueling', wrongCategory: null, correctCategory: 'Fire', reason: 'refueling area requirement' },
  { pattern: 'refueling area', wrongCategory: null, correctCategory: 'Fire', reason: 'refueling operation' },
  { pattern: 'diesel tanker', wrongCategory: null, correctCategory: 'Fire', reason: 'fuel handling' },
  { pattern: 'refueling excavator', wrongCategory: null, correctCategory: 'Fire', reason: 'fuel handling' },
  { pattern: 'substandard bottles', wrongCategory: null, correctCategory: 'Fire', reason: 'improper fuel storage' },
  { pattern: 'fuel storage', wrongCategory: null, correctCategory: 'Fire', reason: 'fuel storage' },
  { pattern: 'without drip tray', wrongCategory: null, correctCategory: 'Fire', reason: 'spill containment missing' },
  { pattern: 'drip tray', wrongCategory: null, correctCategory: 'Fire', reason: 'spill containment' },
  { pattern: 'chemical spill', wrongCategory: null, correctCategory: 'Fire', reason: 'spill hazard' },
  { pattern: 'cleaned up', wrongCategory: null, correctCategory: 'Fire', reason: 'spill cleanup' },

  // ============================================================================
  // FIRE EXTINGUISHER PATTERNS → Fire
  // ============================================================================
  { pattern: 'fire extinguisher', wrongCategory: null, correctCategory: 'Fire', reason: 'fire safety equipment' },
  { pattern: 'de-pressurized', wrongCategory: null, correctCategory: 'Fire', reason: 'fire extinguisher condition' },
  { pattern: 'depressurized', wrongCategory: null, correctCategory: 'Fire', reason: 'fire extinguisher condition' },

  // ============================================================================
  // MEWP / STRANDED PATTERNS → Working at Height
  // ============================================================================
  { pattern: 'stranded on roof', wrongCategory: null, correctCategory: 'Working at Height', reason: 'workers stranded at height' },
  { pattern: 'stranded on rooftop', wrongCategory: null, correctCategory: 'Working at Height', reason: 'workers stranded at height' },
  { pattern: 'leaving operatives stranded', wrongCategory: null, correctCategory: 'Working at Height', reason: 'workers stranded at height' },
  { pattern: 'mewp as access', wrongCategory: null, correctCategory: 'Working at Height', reason: 'MEWP access issue' },
  { pattern: 'absence of alternate access', wrongCategory: null, correctCategory: 'Working at Height', reason: 'access to height issue' },
  { pattern: 'on top of portable', wrongCategory: null, correctCategory: 'Working at Height', reason: 'working at height' },
  { pattern: 'on top of wall', wrongCategory: null, correctCategory: 'Working at Height', reason: 'working at height' },
  { pattern: 'top of wall', wrongCategory: null, correctCategory: 'Working at Height', reason: 'working at height' },

  // ============================================================================
  // PERMIT / MSRA PATTERNS → General Site Issues
  // ============================================================================
  { pattern: 'permit to work', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'permit requirement' },
  { pattern: 'no permit', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'missing permit' },
  { pattern: 'method statement', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'MSRA requirement' },
  { pattern: 'risk assessment', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'MSRA requirement' },
  { pattern: 'msra', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'MSRA requirement' },
  { pattern: 'no supervision', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'supervision requirement' },
  { pattern: 'planned scope of work', wrongCategory: null, correctCategory: 'General Site Issues', reason: 'scope deviation' },

  // ============================================================================
  // EQUIPMENT AGE / CONDITION PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'over 15 years old', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment age compliance' },
  { pattern: 'older than 15 years', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment age compliance' },
  { pattern: 'aging components', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment age' },
  { pattern: 'manufacture date', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment age verification' },
  { pattern: 'air conditioning system', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment modification' },
  { pattern: 'make shift air conditioning', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'makeshift equipment modification' },
  { pattern: 'taped electrical cable', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'improper equipment repair' },

  // ============================================================================
  // ADDITIONAL EQUIPMENT TYPES → Mobile Plant & Equipment
  // From 212 observation analysis
  // ============================================================================
  { pattern: 'plate compactor', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compaction equipment' },
  { pattern: 'walk behind plate compactor', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compaction equipment' },
  { pattern: 'portable generator', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'portable power equipment' },
  { pattern: 'water tanker', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'water tanker vehicle' },
  { pattern: 'vacuum tanker', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'vacuum tanker vehicle' },
  { pattern: 'roller compactor', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compaction equipment' },
  { pattern: 'drum roller', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compaction equipment' },
  { pattern: 'compact roller', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'compaction equipment' },
  { pattern: 'motor grader', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'grading equipment' },
  { pattern: 'grader', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'grading equipment' },
  { pattern: 'bulldozer', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'earth moving equipment' },
  { pattern: 'bldozer', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'bulldozer (typo)' },
  { pattern: 'blodozer', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'bulldozer (typo)' },
  { pattern: 'loder', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'loader (typo)' },
  { pattern: 'loader', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'loader equipment' },
  { pattern: 'backhoe', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'backhoe equipment' },
  { pattern: 'front and backhoe', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment PWAS cameras' },
  { pattern: 'earth moving equipment', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'earth moving' },
  { pattern: 'breaker', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'hydraulic breaker' },
  { pattern: 'jcb', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'JCB equipment' },
  { pattern: 'crusher plant', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'crusher equipment' },
  { pattern: 'workers buses', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'personnel transport' },
  { pattern: 'staff bus', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'personnel transport' },
  { pattern: 'trailer', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'trailer equipment' },

  // ============================================================================
  // EQUIPMENT MAINTENANCE / FACILITY PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'plant maintenance facility', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance facility' },
  { pattern: 'plant maintenance', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance' },
  { pattern: 'maintenance of the truck', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'truck maintenance' },
  { pattern: 'maintenance work activity', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance' },
  { pattern: 'maintenance team', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance' },
  { pattern: 'usual maintenance', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance' },
  { pattern: 'during maintenance', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance' },
  { pattern: 'bucket replacement', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment maintenance' },
  { pattern: 'equipment and plants', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'mobile plant equipment' },
  { pattern: 'heavy equipment and plants', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'mobile plant equipment' },
  { pattern: 'plants and heavy trucks', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'mobile plant equipment' },

  // ============================================================================
  // EQUIPMENT PLATE / ID PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'plate no', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment identification' },
  { pattern: 'plate number', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment identification' },
  { pattern: 'plate#', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment identification' },
  { pattern: 'equipment no', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment identification' },
  { pattern: 's.no.', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment serial number' },

  // ============================================================================
  // SITTING/STANDING UNDER EQUIPMENT → Mobile Plant & Equipment (MEPI)
  // ============================================================================
  { pattern: 'sitting under heavy equipment', wrongCategory: 'Worker Welfare', correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI - unsafe position near equipment' },
  { pattern: 'sitting underneath', wrongCategory: 'Worker Welfare', correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI - unsafe position near equipment' },
  { pattern: 'underneath of excavator', wrongCategory: 'Worker Welfare', correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI - unsafe position near equipment' },
  { pattern: 'underneath excavator', wrongCategory: 'Worker Welfare', correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI - unsafe position near equipment' },
  { pattern: 'drivers sitting under', wrongCategory: 'Worker Welfare', correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI - unsafe position near equipment' },
  { pattern: 'some drivers sitting under', wrongCategory: 'Worker Welfare', correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI - unsafe position near equipment' },
  { pattern: 'check some things around dump truck', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'unsafe activity near equipment' },

  // ============================================================================
  // DRIVING / DRIVER SPECIFIC PATTERNS → Driving
  // ============================================================================
  { pattern: 'driver found without', wrongCategory: null, correctCategory: 'Driving', reason: 'driver compliance' },
  { pattern: 'driver was driving', wrongCategory: null, correctCategory: 'Driving', reason: 'driving activity' },
  { pattern: 'dump truck driver', wrongCategory: null, correctCategory: 'Driving', reason: 'driver issue' },
  { pattern: 'tipper truck driver', wrongCategory: null, correctCategory: 'Driving', reason: 'driver issue' },
  { pattern: 'equipment drivers', wrongCategory: null, correctCategory: 'Driving', reason: 'driver training' },
  { pattern: 'drive his car', wrongCategory: null, correctCategory: 'Driving', reason: 'driving issue' },
  { pattern: 'too closer to', wrongCategory: null, correctCategory: 'Driving', reason: 'unsafe distance driving' },

  // ============================================================================
  // RIPRAP / GROUND WORK PATTERNS → Breaking Ground & Excavation
  // ============================================================================
  { pattern: 'riprap', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'riprap activity' },
  { pattern: 'riprap activity', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'riprap work' },
  { pattern: 'riprap activities', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'riprap work' },
  { pattern: 'soil haulage', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'earth moving operation' },
  { pattern: 'non compacted soil', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'unstable ground' },
  { pattern: 'legs were buried', wrongCategory: null, correctCategory: 'Breaking Ground & Excavation', reason: 'burial hazard' },

  // ============================================================================
  // ADDITIONAL SAFETY PATTERNS
  // ============================================================================
  { pattern: 'in direct sunlight', wrongCategory: null, correctCategory: 'Working in Heat', reason: 'heat exposure' },
  { pattern: 'direct sunlight', wrongCategory: null, correctCategory: 'Working in Heat', reason: 'heat exposure' },
  { pattern: 'stand in direct', wrongCategory: null, correctCategory: 'Working in Heat', reason: 'heat exposure' },
  { pattern: 'movement of heavy equipment', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment movement hazard' },
  { pattern: 'maneuvering heavy equipment', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment movement hazard' },
  { pattern: 'frequent movement of heavy', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'equipment movement hazard' },
  { pattern: 'from moving vehicles and plant', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'moving equipment and plants', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },
  { pattern: 'near moving equipment', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'MEPI hazard' },

  // ============================================================================
  // HAZARD STANDARD REFERENCE PATTERNS → Mobile Plant & Equipment
  // ============================================================================
  { pattern: 'neom phsas 17', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM standard for Mobile Plant' },
  { pattern: 'phsas 17', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM standard for Mobile Plant' },
  { pattern: 'section-17', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM standard section 17' },
  { pattern: 'section 17', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM standard section 17' },
  { pattern: 'neom-npr-std-001', wrongCategory: null, correctCategory: 'Mobile Plant & Equipment', reason: 'NEOM HSE standard' }
]

// ============================================================================
// SECTION E: HAZARD SEVERITY RANKING
// For compound scenarios, use highest severity hazard
// ============================================================================

export const HAZARD_SEVERITY = {
  // Level 1 - Fatal/Catastrophic (highest priority)
  'Confined Spaces': 1,
  'Energized System': 1,
  'Explosives & Blasting': 1,  // NEOM Eltizam #12 - Fatal/Catastrophic
  'Working at Height': 1,
  'Lifting': 1,
  'Mobile Plant & Equipment': 1,
  'Physical Hazard': 1,        // OSHA Fatal Four - struck-by
  'Mechanical Hazard': 1,      // OSHA Fatal Four - caught-in

  // Level 2 - Serious/Major
  'Breaking Ground & Excavation': 2,
  'Fire': 2,
  'Hot Work': 2,
  'Working on or Near Water': 2,
  'Driving': 2,
  'Temporary Works': 2,
  'Working on or Near Live Roads': 2,
  'Working in Heat': 2,

  // Level 3 - Moderate (Sub-significant hazards only)
  'COSHH': 3,
  'Respiratory Hazard': 3,
  'Traffic Management': 3,
  'Tools': 3,
  'Site Security': 3,
  'Worker Welfare': 3,
  'Housekeeping': 3,
  'Access': 3,
  'Slip and Trip': 3,
  'Environmental': 3,
  'General Site Issues': 4 // Lowest priority (default)
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

// 14 SIGNIFICANT HAZARDS - NEOM Eltizam Program
// These match the order and list from constants.js (NEOM-NPR-STD-001 Rev 01.00)
export const SIGNIFICANT_HAZARDS = [
  'Breaking Ground & Excavation',
  'Confined Spaces',
  'Energized System',
  'Explosives & Blasting',        // NEOM Eltizam Hazard #12 - Safe Use of Explosives and Blasting
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

// 13 ADDITIONAL HAZARDS - Sub-significant categories for detailed classification
// Physical Hazard and Mechanical Hazard moved from SIGNIFICANT_HAZARDS
export const SUB_SIGNIFICANT_HAZARDS = [
  'Physical Hazard',           // Struck-by, falling objects, sharp objects, impalement
  'Mechanical Hazard',         // Caught-in/between, crushing, pinch points, machinery
  'COSHH',
  'Respiratory Hazard',
  'Traffic Management',
  'Tools',
  'Site Security',
  'Worker Welfare',
  'Housekeeping',
  'Access',
  'Environmental',
  'Slip and Trip',
  'General Site Issues',       // Fallback for observations requiring manual review
]

// ============================================================================
// SECTION H: HSE ABBREVIATIONS EXPANSION
// Maps common HSE abbreviations to their full forms for better classification
// ============================================================================

export const HSE_ABBREVIATIONS = {
  // Working at Height & Fall Protection
  'wah': 'working at height',
  'wah violation': 'working at height violation',
  'wah issue': 'working at height issue',
  'fbh': 'full body harness',
  'fph': 'fall protection harness',
  'pfas': 'personal fall arrest system',
  'srl': 'self retracting lifeline',

  // Permits & Procedures
  'ptw': 'permit to work',
  'loto': 'lockout tagout',
  'lototo': 'lockout tagout tryout',
  'jsa': 'job safety analysis',
  'jha': 'job hazard analysis',
  'tbt': 'toolbox talk',
  'swms': 'safe work method statement',
  'rams': 'risk assessment method statement',
  'ssow': 'safe system of work',
  'flra': 'field level risk assessment',
  'lmra': 'last minute risk assessment',
  'moc': 'management of change',
  'hazop': 'hazard and operability study',
  'hra': 'health risk assessment',
  'tra': 'task risk assessment',
  'sta': 'safe task analysis',

  // Equipment Load Limits
  'swl': 'safe working load',
  'wll': 'working load limit',
  'mbl': 'minimum breaking load',
  'bwl': 'basic working load',

  // Mobile Equipment
  'mewp': 'mobile elevated work platform',
  'ewp': 'elevated work platform',
  'spmt': 'self propelled modular transporter',
  'adt': 'articulated dump truck',
  'rtg': 'rubber tyred gantry',

  // Incident Types
  'lti': 'lost time injury',
  'mti': 'medical treatment injury',
  'fac': 'first aid case',
  'rwc': 'restricted work case',
  'hpi': 'high potential incident',
  'hipo': 'high potential incident',
  'ncr': 'non conformance report',
  'nmiss': 'near miss',

  // Electrical Safety
  'gfci': 'ground fault circuit interrupter',
  'rcd': 'residual current device',
  'elcb': 'earth leakage circuit breaker',
  'mcb': 'miniature circuit breaker',
  'mccb': 'molded case circuit breaker',

  // Operations
  'simops': 'simultaneous operations',
  'sop': 'standard operating procedure',
  'erp': 'emergency response plan',
  'eap': 'emergency action plan',
  'iipp': 'injury illness prevention program',

  // Standards & Regulations
  'osha': 'occupational safety health administration',
  'ansi': 'american national standards institute',
  'nfpa': 'national fire protection association',
  'nebosh': 'national examination board occupational safety health',
  'iosh': 'institution of occupational safety health',

  // PPE Related
  'ppe': 'personal protective equipment',
  'rpe': 'respiratory protective equipment',
  'frc': 'flame resistant clothing',
  'scba': 'self contained breathing apparatus',
  'ffs': 'full face shield',

  // Confined Space
  'cse': 'confined space entry',
  'cs': 'confined space',
  'csep': 'confined space entry permit',

  // Lifting Operations
  'loler': 'lifting operations lifting equipment regulations',
  'leea': 'lifting equipment engineers association',
  'cpcs': 'construction plant competence scheme',
  'npors': 'national plant operators registration scheme',

  // Behavior Based Safety
  'bbs': 'behavior based safety',
  'dddm': 'data driven decision making',
  'kpi': 'key performance indicator',
  'lagging': 'lagging indicator',
  'leading': 'leading indicator',

  // NEOM Equipment Verification
  'vvs': 'vehicle verification system',
  'tpc': 'third party certification',
  'mvp': 'motor vehicle pass',
  'pwas': 'proximity warning and alert system',
  'mepi': 'man equipment personnel interface',

  // Equipment Types
  'jcb': 'backhoe loader',
  'adt': 'articulated dump truck',
  'rtc': 'rough terrain crane',
  'atc': 'all terrain crane',

  // Site Management
  'msra': 'method statement risk assessment',
  'isf': 'interim support facility',
  'pwp': 'portable water pump',

  // Additional abbreviations
  'db': 'distribution board',
  'ohpl': 'overhead power line',
  'w@h': 'work at height',
  'mp&e': 'mobile plant and equipment',
  'genset': 'generator set'
}

// ============================================================================
// SECTION I: EQUIPMENT SYNONYM FAMILIES
// Groups equivalent equipment terms for consistent classification
// ============================================================================

export const EQUIPMENT_SYNONYMS = {
  // Working at Height Equipment Family
  'boom_lift': ['boom lift', 'cherry picker', 'mewp', 'aerial lift', 'man lift', 'personnel lift', 'jlg', 'genie lift', 'articulating boom', 'telescopic boom', 'knuckle boom'],
  'scissor_lift': ['scissor lift', 'scissor platform', 'elevated platform', 'slab scissor', 'rough terrain scissor'],
  'scaffold': ['scaffold', 'scaffolding', 'scaffolds', 'staging', 'work platform', 'tube and fitting', 'system scaffold', 'ringlock', 'cuplock', 'kwikstage'],
  'rope_access': ['rope access', 'abseil', 'rappel', 'industrial climbing', 'irata', 'sprat', 'rope work'],
  'ladder': ['ladder', 'step ladder', 'extension ladder', 'a-frame ladder', 'platform ladder', 'podium ladder', 'cage ladder', 'fixed ladder'],

  // Mobile Plant Family
  'excavator': ['excavator', 'backhoe', 'digger', 'trackhoe', 'hydraulic excavator', 'mini excavator', 'micro excavator', 'tracked excavator', 'wheeled excavator', '360 excavator'],
  'loader': ['loader', 'bobcat', 'skid steer', 'skid loader', 'compact loader', 'wheel loader', 'front loader', 'pay loader', 'end loader', 'front end loader'],
  'dozer': ['dozer', 'bulldozer', 'crawler dozer', 'track dozer', 'd6', 'd8', 'd9', 'blade'],
  'dump_truck': ['dump truck', 'dumper', 'tipper', 'adt', 'articulated dump truck', 'haul truck', 'off highway truck', 'rock truck', 'rigid dump'],
  'crane': ['crane', 'mobile crane', 'tower crane', 'crawler crane', 'rough terrain crane', 'all terrain crane', 'pick and carry', 'truck crane', 'hydraulic crane', 'lattice boom crane'],
  'forklift': ['forklift', 'fork lift', 'lift truck', 'reach truck', 'counterbalance', 'telehandler', 'telescopic handler', 'zoom boom', 'reach stacker'],
  'roller': ['roller', 'compactor', 'road roller', 'vibratory roller', 'smooth drum', 'padfoot roller', 'sheepsfoot', 'tandem roller', 'combination roller'],
  'grader': ['grader', 'motor grader', 'road grader', 'blade grader', 'maintainer'],
  'paver': ['paver', 'asphalt paver', 'finisher', 'paving machine', 'track paver', 'wheeled paver'],
  'piling_rig': ['piling rig', 'pile driver', 'bore pile rig', 'cfa rig', 'rotary rig', 'driven pile rig', 'vibro hammer'],
  'concrete_pump': ['concrete pump', 'boom pump', 'line pump', 'placing boom', 'stationary pump', 'trailer pump'],

  // Lifting Equipment Family
  'sling': ['sling', 'webbing sling', 'chain sling', 'wire rope sling', 'synthetic sling', 'endless sling', 'round sling', 'polyester sling', 'nylon sling'],
  'rigging': ['rigging', 'rigging gear', 'lifting gear', 'lifting tackle', 'below the hook', 'rigging hardware'],
  'shackle': ['shackle', 'shackles', 'bow shackle', 'd shackle', 'anchor shackle', 'screw pin shackle', 'safety shackle'],
  'hoist': ['hoist', 'chain block', 'lever block', 'come along', 'manual hoist', 'electric hoist', 'air hoist', 'pull lift'],

  // Hot Work Equipment Family
  'welder': ['welder', 'welding machine', 'arc welder', 'mig welder', 'tig welder', 'stick welder', 'smaw', 'fcaw', 'gmaw', 'gtaw'],
  'grinder': ['grinder', 'angle grinder', 'disc grinder', 'bench grinder', 'die grinder', 'straight grinder', 'pneumatic grinder'],
  'cutting': ['cutting torch', 'oxy torch', 'plasma cutter', 'gas cutter', 'thermal lance', 'oxy acetylene', 'oxy fuel'],
  'saw': ['circular saw', 'reciprocating saw', 'chop saw', 'cut off saw', 'band saw', 'skill saw', 'demolition saw'],

  // Electrical Equipment Family
  'panel': ['electrical panel', 'distribution board', 'switchboard', 'panel board', 'mcc', 'motor control center', 'db', 'switch gear'],
  'generator': ['generator', 'genset', 'power generator', 'diesel generator', 'portable generator', 'standby generator']
}

// ============================================================================
// SECTION J: CATEGORY MAPPING FOR EQUIPMENT FAMILIES
// Maps equipment family keys to their hazard categories
// ============================================================================

export const EQUIPMENT_TO_CATEGORY = {
  // Working at Height
  'boom_lift': 'Working at Height',
  'scissor_lift': 'Working at Height',
  'scaffold': 'Working at Height',
  'rope_access': 'Working at Height',
  'ladder': 'Working at Height',

  // Mobile Plant & Equipment
  'excavator': 'Mobile Plant & Equipment',
  'loader': 'Mobile Plant & Equipment',
  'dozer': 'Mobile Plant & Equipment',
  'dump_truck': 'Mobile Plant & Equipment',
  'forklift': 'Mobile Plant & Equipment',
  'roller': 'Mobile Plant & Equipment',
  'grader': 'Mobile Plant & Equipment',
  'paver': 'Mobile Plant & Equipment',
  'piling_rig': 'Mobile Plant & Equipment',
  'concrete_pump': 'Mobile Plant & Equipment',

  // Lifting
  'crane': 'Lifting',
  'sling': 'Lifting',
  'rigging': 'Lifting',
  'shackle': 'Lifting',
  'hoist': 'Lifting',

  // Hot Work
  'welder': 'Hot Work',
  'grinder': 'Hot Work',
  'cutting': 'Hot Work',
  'saw': 'Hot Work',

  // Energized System
  'panel': 'Energized System',
  'generator': 'Energized System'
}

// ============================================================================
// SECTION K: CONTROL-TO-HAZARD CONTEXT LINKING
// When a control issue is detected (signage, PPE, permit, RAMS, etc.),
// use these context keywords to determine the underlying hazard category.
// This implements Option C: Link controls to underlying hazards.
// ============================================================================

/**
 * Keywords that indicate an observation is about a CONTROL (not a hazard itself)
 */
export const CONTROL_KEYWORDS = [
  // Signage controls
  'signage', 'sign', 'signages', 'signs', 'label', 'labels', 'labeling', 'labelling',
  'awareness signage', 'warning sign', 'safety sign', 'identification signage',
  'no signage', 'missing signage', 'lacks signage', 'without signage',

  // PPE controls
  'ppe', 'personal protective equipment', 'safety glasses', 'goggles', 'gloves',
  'helmet', 'hard hat', 'hi-vis', 'high visibility', 'ear protection', 'hearing protection',
  'safety boots', 'safety shoes', 'coverall', 'overalls', 'face shield', 'respirator',
  'not wearing', 'without wearing', 'sub-standard', 'substandard', 'improper ppe',

  // Permit/RAMS controls
  'permit', 'ptw', 'permit to work', 'permits', 'risk assessment', 'method statement',
  'rams', 'swms', 'jsea', 'jsa', 'not applicable', 'not filled', 'improperly completed',
  'incomplete permit', 'missing permit', 'expired permit', 'no permit',
  'permit receiver', 'permit issuer', 'activity briefing',

  // Documentation controls
  'checklist', 'documentation', 'documents', 'form', 'forms', 'record', 'records',
  'not documented', 'missing documentation', 'incomplete documentation',

  // Inspection controls
  'inspection', 'inspected', 'not inspected', 'without inspection', 'color coded',
  'colour coded', 'inspection tag', 'inspection sticker',

  // Training/competency controls
  'training', 'trained', 'competent', 'certified', 'qualified', 'induction',
  'toolbox talk', 'tbt', 'briefing', 'safety briefing',

  // Supervision controls
  'supervision', 'supervisor', 'safety officer', 'no supervision', 'unsupervised'
]

/**
 * Hazard context keywords - when found alongside control issues,
 * these determine which hazard category the observation belongs to
 */
export const CONTROL_HAZARD_CONTEXT = {
  'Working at Height': [
    'scaffold', 'scaffolding', 'scaffolds', 'ladder', 'ladders', 'roof', 'rooftop',
    'edge', 'edges', 'platform', 'elevated', 'height', 'heights', 'high level',
    'harness', 'lanyard', 'fall protection', 'fbh', 'full body harness', 'body harness',
    'shock absorber', 'anchor', 'lifeline', 'fall arrest', 'mewp', 'ewp',
    'boom lift', 'scissor lift', 'cherry picker', 'formwork', 'de-shuttering',
    'deform', 'shuttering', 'falsework', 'atrium', 'void', 'opening', 'floor opening',
    'guardrail', 'handrail', 'toe board', 'access tower', 'cladding', 'cladding sheet',
    'at height', 'above ground', 'elevated work', 'working on roof'
  ],

  'Hot Work': [
    'welding', 'weld', 'welder', 'grinding', 'grinder', 'cutting', 'torch',
    'flame', 'spark', 'sparks', 'hot work', 'hot work activities', 'oxy', 'acetylene', 'brazing',
    'soldering', 'burning', 'fire watch', 'fire watcher', 'arc welding', 'gas cutting',
    'thermal cutting', 'hot cutting', 'metal cutting', 'abrasive wheel'
  ],

  'Lifting': [
    'crane', 'cranes', 'lift', 'lifting', 'hoist', 'hoisting', 'rigging', 'rigger', 'riggers',
    'sling', 'slings', 'load', 'loads', 'banksman', 'slinger', 'signaler',
    'signaller', 'chain block', 'come-along', 'winch', 'suspended load',
    'lifting operation', 'lifting gear', 'lifting equipment', 'shackle', 'hook'
  ],

  'Breaking Ground & Excavation': [
    'excavation', 'excavating', 'excavated', 'trench', 'trenching', 'digging', 'dig',
    'backfill', 'backfilling', 'pit', 'pits', 'hole', 'underground', 'buried',
    'utility', 'utilities', 'cable strike', 'pipe strike', 'shoring', 'benching',
    'ground work', 'groundwork', 'earthwork', 'earth moving'
  ],

  'Energized System': [
    'electrical', 'electric', 'power', 'cable', 'cables', 'wiring', 'wire',
    'panel', 'distribution board', 'switchboard', 'voltage', 'live', 'energized',
    'circuit', 'breaker', 'fuse', 'transformer', 'generator', 'socket', 'outlet',
    'junction box', 'conduit', 'loto', 'lockout', 'tagout', 'isolation',
    'db box', 'db panel', 'electrical panel', 'power supply', 'mains'
  ],

  'Confined Spaces': [
    'confined', 'confined space', 'tank', 'tanks', 'vessel', 'vessels', 'manhole',
    'manholes', 'pit', 'silo', 'silos', 'chamber', 'culvert', 'pipe', 'tunnel',
    'enclosed', 'restricted entry', 'atmosphere', 'ventilation', 'rescue',
    'sewage', 'sewer', 'septic', 'underground chamber'
  ],

  'Mobile Plant & Equipment': [
    'vehicle', 'vehicles', 'excavator', 'forklift', 'loader', 'truck', 'trucks',
    'plant', 'equipment', 'tanker', 'concrete pouring', 'concrete pouring tanker', 'mixer', 'dumper',
    'roller', 'compactor', 'grader', 'bulldozer', 'dozer', 'backhoe', 'jcb',
    'telehandler', 'operator', 'operating', 'reversing', 'moving plant',
    'heavy equipment', 'mobile equipment', 'plant movement', 'equipment movement',
    // Extended equipment types
    'dump truck', 'tipper', 'water tanker', 'water truck', 'vacuum tanker',
    'crawler', 'earth moving', 'piling rig', 'drill rig', 'crusher',
    'air compressor', 'portable generator', 'front loader', 'wheel loader',
    // Man-machine interface
    'man-machine interface', 'man machine interface', 'mepi', 'boots on ground',
    'proximity', 'struck by', 'struck-by', 'line of fire',
    // Equipment verification
    'qr code', 'veri-fi', 'verifi', 'vvs', 'tpc', 'third party certification',
    'mvp certificate', 'access denied', 'red status', 'red category',
    // Equipment safety features
    'beacon light', 'pwas', 'pwas camera', '360 camera', 'blinking light',
    'rotating parts', 'moving parts', 'guard', 'protection guard',
    'wheel chock', 'whip check', 'whiplash arrestor',
    // Equipment issues
    'black smoke', 'hydraulic leak', 'oil leak', 'bucket', 'pin assembly',
    'retro reflective', 'beacon', 'alarm', 'backshield'
  ],

  'Traffic Management': [
    'parking', 'parked', 'parking area', 'vehicle movement', 'traffic', 'pedestrian', 'road',
    'reverse', 'reversing', 'reverse parking', 'designated area', 'drop bar',
    'access point', 'entry point', 'exit point', 'speed', 'speeding',
    'haul road', 'vehicle access', 'pedestrian crossing', 'walkway'
  ],

  'Fire': [
    'fire', 'flammable', 'combustible', 'fuel', 'diesel', 'petrol', 'gas',
    'extinguisher', 'emergency', 'evacuation', 'fire exit', 'assembly point',
    'smoke detector', 'fire alarm', 'fire blanket', 'fire hose', 'hydrant',
    'emergency response', 'emergency preparedness'
  ],

  'COSHH': [
    'chemical', 'chemicals', 'hazardous', 'substance', 'substances', 'sds', 'msds',
    'toxic', 'corrosive', 'irritant', 'flammable liquid', 'solvent', 'paint',
    'coating', 'adhesive', 'fuel', 'spill', 'spillage', 'containment',
    'painting', 'painting activities', 'painting work', 'spray painting',
    'hazardous material', 'curing', 'curing water', 'chemical storage'
  ],

  'Worker Welfare': [
    'drinking water', 'water tank', 'legionnaires', 'water analysis', 'water test',
    'first aid', 'first aider', 'first aider numbers', 'toilet', 'welfare', 'rest', 'shelter', 'shade',
    'defibrillator', 'aed', 'medical', 'ambulance', 'potable', 'hygiene', 'sanitation',
    'emergency response', 'response time', 'welfare facility', 'camp', 'accommodation',
    'canteen', 'drinking', 'water cooler', 'water dispenser', 'backup batteries'
  ],

  'Temporary Works': [
    'formwork', 'falsework', 'propping', 'shoring', 'temporary structure',
    'temporary support', 'scaffolding', 'access platform', 'staging', 'hoarding',
    'temporary barrier', 'edge protection system', 'form work', 'de-shuttering', 'deform',
    'shuttering', 'prop', 'props', 'temporary works'
  ],

  'Housekeeping': [
    'materials', 'storage', 'wooden', 'wooden materials', 'scattered', 'waste', 'debris', 'cleanup',
    'clean up', 'unusable', 'unusable materials', 'scrap', 'clutter', 'tidy', 'orderly', 'stacked',
    'stacking', 'piled', 'organized', 'organised', 'housekeeping', 'workplace',
    'boxes', 'stored', 'stored properly', 'material storage'
  ],

  'Tools': [
    'tool', 'tools', 'hand tool', 'hand tools', 'power tool', 'power tools',
    'cabinet', 'toolbox', 'tool box', 'tool cabinet', 'hand tools cabinet',
    'equipment', 'grinder', 'drill', 'saw', 'hammer', 'wrench', 'spanner',
    'pressure washer', 'power washer', 'cutting tool'
  ],

  'Respiratory Hazard': [
    'dust', 'dusty', 'silica', 'asbestos', 'fumes', 'vapour', 'vapor',
    'respiratory', 'breathing', 'mask', 'respirator', 'air quality',
    'inhalation', 'airborne', 'particulate'
  ],

  'Slip and Trip': [
    'floor', 'surface', 'walkway', 'pathway', 'stairs', 'steps', 'slippery',
    'wet', 'uneven', 'trip hazard', 'slip hazard', 'walking surface'
  ],

  'Access': [
    'access', 'egress', 'barricade', 'barricaded', 'barrier', 'access point',
    'entry', 'exit', 'closed', 'blocked', 'restricted', 'authorized', 'unauthorised'
  ],

  'Environmental': [
    'irrigation', 'plants', 'vegetation', 'soil', 'contamination', 'sewage',
    'waste water', 'wastewater', 'environment', 'environmental'
  ]
}
