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
    'pressure relief', 'over pressure', 'pressure buildup', 'high pressure'
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
    'temporary structure', 'temporary support', 'temporary supports',
    'hoarding', 'site hoarding', 'fencing',
    'temporary platform', 'temporary access',
    'edge protection', 'temporary guardrail',
    'access ramp', 'temporary ramp',
    // Makeshift supports
    'makeshift wooden', 'makeshift support', 'makeshift supports',
    'makeshift wooden planks', 'supported using makeshift',
    'unstable support', 'unstable supports',
    'pipes elevated', 'pipe elevated', 'hdpe pipe', 'hdpe pipes'
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

  // Mechanical Hazard - Caught-in/between, crushing, pinch points, machinery
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
    'mechanical hazard', 'machinery hazard', 'machine hazard'
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
  { pattern: 'lifting morale', wrongCategory: 'Lifting', correctCategory: 'Work Environment', reason: 'figurative expression' },
  { pattern: 'lifting spirits', wrongCategory: 'Lifting', correctCategory: 'Work Environment', reason: 'figurative expression' },
  { pattern: 'pallet jack', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'manual handling equipment' },
  { pattern: 'hand pallet truck', wrongCategory: 'Lifting', correctCategory: 'Mobile Plant & Equipment', reason: 'manual handling equipment' },

  // Confined Spaces disambiguations
  { pattern: 'open pit', wrongCategory: 'Confined Spaces', correctCategory: 'Breaking Ground & Excavation', reason: 'excavation hazard, not confined space' },
  { pattern: 'open pits', wrongCategory: 'Confined Spaces', correctCategory: 'Breaking Ground & Excavation', reason: 'excavation hazard, not confined space' },
  { pattern: 'pit without barricade', wrongCategory: 'Confined Spaces', correctCategory: 'Breaking Ground & Excavation', reason: 'excavation hazard' },
  { pattern: 'office space', wrongCategory: 'Confined Spaces', correctCategory: 'Work Environment', reason: 'work area, not confined space' },
  { pattern: 'storage space', wrongCategory: 'Confined Spaces', correctCategory: 'Housekeeping', reason: 'storage area' },
  { pattern: 'parking space', wrongCategory: 'Confined Spaces', correctCategory: 'Traffic Management', reason: 'vehicle parking' },
  { pattern: 'work space', wrongCategory: 'Confined Spaces', correctCategory: 'Work Environment', reason: 'work area' },
  { pattern: 'living space', wrongCategory: 'Confined Spaces', correctCategory: 'Worker Welfare', reason: 'accommodation' },

  // Working at Height disambiguations
  { pattern: 'fallen sign', wrongCategory: 'Working at Height', correctCategory: 'Work Environment', reason: 'object on ground' },
  { pattern: 'fallen signage', wrongCategory: 'Working at Height', correctCategory: 'Work Environment', reason: 'signage issue' },
  { pattern: 'fallen barrier', wrongCategory: 'Working at Height', correctCategory: 'Access', reason: 'barrier issue' },
  { pattern: 'fallen barricade', wrongCategory: 'Working at Height', correctCategory: 'Access', reason: 'barricade issue' },
  { pattern: 'fallen cone', wrongCategory: 'Working at Height', correctCategory: 'Traffic Management', reason: 'traffic equipment' },
  { pattern: 'fall protection', wrongCategory: 'Working at Height', correctCategory: 'Working at Height', reason: 'confirm - height safety equipment' },
  { pattern: 'height of scaffold', wrongCategory: 'Working at Height', correctCategory: 'Working at Height', reason: 'confirm - scaffold measurement' },
  { pattern: 'tall building', wrongCategory: 'Working at Height', correctCategory: 'Work Environment', reason: 'structure description' },
  { pattern: 'height measurement', wrongCategory: 'Working at Height', correctCategory: 'Work Environment', reason: 'measurement activity' },

  // COSHH / Chemical disambiguations
  { pattern: 'food poisoning', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'illness from food, not chemical' },
  { pattern: 'food poison', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'illness from food' },
  { pattern: 'stomach bug', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'illness' },
  { pattern: 'sick from food', wrongCategory: 'COSHH', correctCategory: 'Worker Welfare', reason: 'food-related illness' },

  // PPE disambiguations → Work Environment (PPE is a control, not a hazard)
  { pattern: 'ppe available', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE availability' },
  { pattern: 'ppe missing', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE issue' },
  { pattern: 'ppe not worn', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE compliance' },

  // Driving disambiguations
  { pattern: 'driving rain', wrongCategory: 'Driving', correctCategory: 'Work Environment', reason: 'weather condition' },
  { pattern: 'driving wind', wrongCategory: 'Driving', correctCategory: 'Work Environment', reason: 'weather condition' },
  { pattern: 'pile driving', wrongCategory: 'Driving', correctCategory: 'Breaking Ground & Excavation', reason: 'piling operation' },
  { pattern: 'sheet pile driving', wrongCategory: 'Driving', correctCategory: 'Breaking Ground & Excavation', reason: 'piling operation' },

  // Training/meetings → Work Environment (training is a control, not a hazard)
  { pattern: 'toolbox talk', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety engagement activity' },
  { pattern: 'safety meeting', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety engagement' },
  { pattern: 'safety briefing', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety engagement' },
  { pattern: 'safety induction', wrongCategory: null, correctCategory: 'Work Environment', reason: 'training activity' },
  { pattern: 'site induction', wrongCategory: null, correctCategory: 'Work Environment', reason: 'training activity' },
  { pattern: 'good catch', wrongCategory: null, correctCategory: 'Work Environment', reason: 'positive observation' },
  { pattern: 'near miss report', wrongCategory: null, correctCategory: 'Work Environment', reason: 'reporting activity' },

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

  // Safety officer and supervision patterns → Work Environment (supervision is a control)
  { pattern: 'safety officer not present', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision issue' },
  { pattern: 'no safety officer', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision issue' },
  { pattern: 'without safety coverage', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision issue' },
  { pattern: 'safety personnel', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision' },
  { pattern: 'without supervision', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision issue' },
  { pattern: 'without safety officer', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision issue' },
  { pattern: 'safety coverage', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision' },
  { pattern: 'lack of supervision', wrongCategory: null, correctCategory: 'Work Environment', reason: 'supervision issue' },

  // PPE patterns → Work Environment (PPE is a control, not a hazard)
  { pattern: 'not wearing ppe', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE compliance' },
  { pattern: 'without ppe', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE compliance' },
  { pattern: 'ppe not worn', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE compliance' },
  { pattern: 'ear protection', wrongCategory: null, correctCategory: 'Work Environment', reason: 'hearing PPE' },
  { pattern: 'safety glasses', wrongCategory: null, correctCategory: 'Work Environment', reason: 'eye PPE' },
  { pattern: 'safety goggles', wrongCategory: null, correctCategory: 'Work Environment', reason: 'eye PPE' },
  { pattern: 'not wearing proper ppe', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE compliance' },
  { pattern: 'incomplete ppe', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE compliance' },
  { pattern: 'proper ppe', wrongCategory: null, correctCategory: 'Work Environment', reason: 'PPE requirement' },

  // Training and briefing patterns → Work Environment (training is a control)
  { pattern: 'pre-task briefing', wrongCategory: null, correctCategory: 'Work Environment', reason: 'briefing activity' },
  { pattern: 'pre task briefing', wrongCategory: null, correctCategory: 'Work Environment', reason: 'briefing activity' },
  { pattern: 'tbt', wrongCategory: null, correctCategory: 'Work Environment', reason: 'toolbox talk' },
  { pattern: 'lmra', wrongCategory: null, correctCategory: 'Work Environment', reason: 'risk assessment' },
  { pattern: 'safety standout', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety meeting' },
  { pattern: 'safety stand down', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety meeting' },
  { pattern: 'competent person', wrongCategory: null, correctCategory: 'Work Environment', reason: 'competency' },

  // Positive observation patterns → Work Environment (behavioral observations)
  { pattern: 'positive observation', wrongCategory: null, correctCategory: 'Work Environment', reason: 'behavioral safety' },
  { pattern: 'positive culture', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety culture' },
  { pattern: 'best performer', wrongCategory: null, correctCategory: 'Work Environment', reason: 'recognition' },
  { pattern: 'gift card', wrongCategory: null, correctCategory: 'Work Environment', reason: 'recognition/reward' },
  { pattern: 'indicating a positive', wrongCategory: null, correctCategory: 'Work Environment', reason: 'positive observation' },

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

  // Signage patterns → Work Environment (signage is a control)
  { pattern: 'no signage', wrongCategory: null, correctCategory: 'Work Environment', reason: 'signage missing' },
  { pattern: 'signage not', wrongCategory: null, correctCategory: 'Work Environment', reason: 'signage issue' },
  { pattern: 'sign not installed', wrongCategory: null, correctCategory: 'Work Environment', reason: 'signage missing' },
  { pattern: 'suitable signage', wrongCategory: null, correctCategory: 'Work Environment', reason: 'signage requirement' },
  { pattern: 'no awareness signage', wrongCategory: null, correctCategory: 'Work Environment', reason: 'signage missing' },
  { pattern: 'awareness signage', wrongCategory: null, correctCategory: 'Work Environment', reason: 'signage required' },
  { pattern: 'warning signage', wrongCategory: null, correctCategory: 'Work Environment', reason: 'signage requirement' },

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
  { pattern: 'weather station', wrongCategory: null, correctCategory: 'Work Environment', reason: 'weather monitoring' },
  { pattern: 'insufficient lighting', wrongCategory: null, correctCategory: 'Work Environment', reason: 'lighting issue' },
  { pattern: 'poor lighting', wrongCategory: null, correctCategory: 'Work Environment', reason: 'lighting issue' },
  { pattern: 'poorly illuminated', wrongCategory: null, correctCategory: 'Work Environment', reason: 'lighting issue' },

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

  // Suggestion box / positive culture patterns → Work Environment
  { pattern: 'suggestion box', wrongCategory: null, correctCategory: 'Work Environment', reason: 'employee engagement' },
  { pattern: 'ideas and feedback', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety culture' },
  { pattern: 'continuous improvement', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety culture' },
  { pattern: 'overconfidence', wrongCategory: null, correctCategory: 'Work Environment', reason: 'behavioral observation' },
  { pattern: 'lack of proper positioning', wrongCategory: null, correctCategory: 'Work Environment', reason: 'behavioral observation' },

  // Driving campaign patterns → Work Environment
  { pattern: 'safe driving campaign', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety campaign' },
  { pattern: 'driving campaign', wrongCategory: 'Driving', correctCategory: 'Work Environment', reason: 'safety campaign not driving activity' },
  { pattern: 'campaign was found', wrongCategory: null, correctCategory: 'Work Environment', reason: 'safety campaign' },

  // Proper arrangement / lifting positive patterns
  { pattern: 'proper arrangement', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting preparation' },
  { pattern: 'lifting operation', wrongCategory: null, correctCategory: 'Lifting', reason: 'lifting activity' },

  // Bulletin board patterns → Work Environment
  { pattern: 'bulletin board', wrongCategory: null, correctCategory: 'Work Environment', reason: 'information display' },
  { pattern: 'campaign bulletin', wrongCategory: null, correctCategory: 'Work Environment', reason: 'information display' },
  { pattern: 'weekly campaign bulletin', wrongCategory: null, correctCategory: 'Work Environment', reason: 'information display' },

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
  { pattern: 'emergency contact number', wrongCategory: null, correctCategory: 'Work Environment', reason: 'emergency information' },
  { pattern: 'contact number displayed', wrongCategory: null, correctCategory: 'Work Environment', reason: 'emergency information' },

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
  { pattern: 'rusty nails', wrongCategory: null, correctCategory: 'Physical Hazard', reason: 'puncture hazard' }
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
  'Respiratory Hazard',
  'Traffic Management',
  'Tools',
  'Site Security',
  'Worker Welfare',
  'Housekeeping',
  'Access',
  'Work Environment',
  'Environmental',
  'Slip and Trip'
]

// ============================================================================
// SECTION H: HSE ABBREVIATIONS EXPANSION
// Maps common HSE abbreviations to their full forms for better classification
// ============================================================================

export const HSE_ABBREVIATIONS = {
  // Working at Height
  'wah': 'working at height',
  'wah violation': 'working at height violation',
  'wah issue': 'working at height issue',

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
  'leading': 'leading indicator'
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
