/**
 * Root Cause Detection Engine
 * Restructured with COMMON_FACTORS + HAZARD_SPECIFIC_FACTORS
 *
 * Rule: If it's in Common, it's NOT in Specific.
 *
 * Common Factors (7) - Universal controls that apply to EVERY hazard
 * Specific Factors - Technical/operational factors UNIQUE to each hazard
 */

// ============================================================================
// NEGATION DETECTION
// Prevents false positives from phrases like "No defects found"
// ============================================================================

const NEGATION_PATTERNS = [
  /\bno\s+$/i,
  /\bnot\s+$/i,
  /\bwithout\s+$/i,
  /\bfree\s+from\s*$/i,
  /\babsence\s+of\s*$/i,
  /\bnone\s*$/i,
  /\bproperly\s+$/i,
  /\bcorrectly\s+$/i,
  /\badequate\s+$/i,
  /\bappropriate\s+$/i,
  /\bcompliant\s+$/i,
  /\bin\s+place\s*$/i,
  /\bfound\s+no\s*$/i,
  /\bzero\s+$/i,
  /\bn\/a\s*$/i,
  /\bnot\s+a\s+$/i,
  /\bno\s+issues?\s+with\s*$/i,
  /\ball\s+$/i,
  /\bgood\s+$/i,
  /\bproper\s+$/i
]

const POSITIVE_SUFFIX_PATTERNS = [
  /^\s*(?:in\s+place|available|present|installed|provided|worn|used|completed|done|checked|inspected|found|ok|good|compliant|secured|attached)/i,
  /^\s*(?:is\s+)?(?:ok|good|fine|adequate|proper|correct|complete|available)/i
]

const hasNegationContext = (text, keywordIndex, keywordLength) => {
  const prefixStart = Math.max(0, keywordIndex - 25)
  const prefix = text.substring(prefixStart, keywordIndex)

  for (const pattern of NEGATION_PATTERNS) {
    if (pattern.test(prefix)) {
      return true
    }
  }

  const suffixEnd = Math.min(text.length, keywordIndex + keywordLength + 30)
  const suffix = text.substring(keywordIndex + keywordLength, suffixEnd)

  for (const pattern of POSITIVE_SUFFIX_PATTERNS) {
    if (pattern.test(suffix)) {
      return true
    }
  }

  return false
}

// ============================================================================
// COMMON FACTORS (7) - Apply to ALL Hazards
// These are universal controls that should be checked for every hazard
// ============================================================================

export const COMMON_FACTORS = {
  'Permit to Work': {
    keywords: [
      // Core terms
      'permit', 'permits', 'permitted', 'permitting', 'ptw', 'ptws',
      // Missing/absent
      'no permit', 'without permit', 'permit missing', 'missing permit', 'lacks permit',
      'permit not obtained', 'permit not issued', 'permit absent', 'unpermitted',
      // Expired/invalid
      'permit expired', 'expired permit', 'permit out of date', 'permit invalid',
      'permit lapsed', 'permit not valid', 'permit outdated', 'overdue permit',
      // Wrong type
      'wrong permit', 'incorrect permit', 'invalid permit type', 'permit mismatch',
      // Specific permit types
      'work permit', 'hot work permit', 'excavation permit', 'dig permit',
      'confined space permit', 'entry permit', 'lifting permit', 'crane permit',
      'electrical permit', 'isolation permit', 'height permit', 'working at height permit',
      'cold work permit', 'general permit', 'special permit', 'high risk permit',
      // Violations
      'permit violation', 'permit breach', 'permit conditions', 'permit scope',
      'outside permit scope', 'permit not followed', 'permit requirements',
      // Misspellings
      'premit', 'permt', 'permitt', 'pernit', 'pemit', 'permision'
    ],
    description: 'Missing, expired, or wrong permit type'
  },

  'PPE': {
    keywords: [
      // Core terms
      'ppe', 'p.p.e', 'personal protective equipment', 'personal protective',
      'protective equipment', 'safety equipment', 'safety gear',
      // Head protection
      'helmet', 'helmets', 'hard hat', 'hardhat', 'hard hats', 'hardhats',
      'bump cap', 'head protection', 'no helmet', 'without helmet', 'helment', 'hemlet',
      // Eye protection
      'goggles', 'goggle', 'safety glasses', 'safety glass', 'eye protection',
      'face shield', 'faceshield', 'visor', 'visors', 'eye wear', 'eyewear',
      'tinted glasses', 'clear glasses', 'prescription safety', 'goggels', 'googles',
      // Hand protection
      'gloves', 'glove', 'hand protection', 'no gloves', 'without gloves',
      'missing gloves', 'cut resistant', 'chemical gloves', 'leather gloves',
      'nitrile gloves', 'latex gloves', 'welding gloves', 'glovs', 'golves',
      // Fall protection PPE
      'harness', 'harnesses', 'harnessed', 'body harness', 'full body harness',
      'safety harness', 'fall harness', 'no harness', 'without harness', 'missing harness',
      'harness not worn', 'harnes', 'harnass', 'harnis', 'harneses',
      'lanyard', 'lanyards', 'shock absorbing', 'shock absorber', 'retractable',
      'self retracting', 'srl', 'laniard', 'lanard', 'lanyrd',
      // Foot protection
      'safety boot', 'safety boots', 'safety shoe', 'safety shoes', 'steel toe',
      'steel cap', 'footwear', 'foot protection', 'work boots', 'protective footwear',
      'metatarsal', 'ankle support', 'safety footware', 'safty boots',
      // Hearing protection
      'ear plug', 'earplugs', 'ear plugs', 'ear muff', 'earmuffs', 'ear muffs',
      'hearing protection', 'ear protection', 'ear defenders', 'ear protector',
      'noise protection', 'earplug', 'earmuf', 'ear defender',
      // Respiratory protection
      'respirator', 'respirators', 'mask', 'masks', 'dust mask', 'n95',
      'half mask', 'full face', 'ffp2', 'ffp3', 'p100', 'breathing apparatus',
      'scba', 'rpe', 'air purifying', 'powered respirator', 'papr',
      'resprator', 'respirater', 'resporator', 'massk', 'maks',
      // High visibility
      'high vis', 'hi vis', 'hi-vis', 'high-vis', 'hivis', 'hiviz',
      'vest', 'vests', 'reflective', 'reflective vest', 'visibility vest',
      'fluorescent', 'hi visibility', 'high visibility', 'hivs', 'hiviz vest',
      // Water safety PPE
      'life jacket', 'lifejacket', 'life jackets', 'pfd', 'buoyancy aid',
      'personal flotation', 'flotation device', 'life vest', 'lifevest',
      // General PPE issues
      'not wearing', 'ppe missing', 'no ppe', 'missing ppe', 'ppe not worn',
      'damaged ppe', 'defective ppe', 'wrong ppe', 'incorrect ppe', 'ppe issue',
      'ppe defect', 'ppe inadequate', 'improper ppe', 'insufficient ppe',
      'fit test', 'face fit', 'clean shaven', 'facial hair'
    ],
    description: 'Missing, wrong type, damaged, or not worn'
  },

  'Barriers & Signage': {
    keywords: [
      // Barriers
      'barrier', 'barriers', 'barriered', 'no barrier', 'missing barrier',
      'barrier removed', 'barrier down', 'barrier missing', 'inadequate barrier',
      'barricade', 'barricades', 'barricaded', 'barricading', 'unbarricaded',
      'baricade', 'barracade', 'barrricade', 'bariccade',
      // Fencing/hoarding
      'fence', 'fences', 'fencing', 'fenced', 'unfenced', 'hoarding', 'hoardings',
      'temporary fence', 'temp fence', 'chain link', 'mesh fence',
      // Tape
      'tape', 'tapes', 'taped', 'taping', 'caution tape', 'hazard tape',
      'warning tape', 'barrier tape', 'red tape', 'danger tape', 'police tape',
      // Signs
      'sign', 'signs', 'signage', 'signed', 'signing', 'no sign', 'missing sign',
      'sign missing', 'inadequate signage', 'poor signage', 'sign not visible',
      'warning sign', 'danger sign', 'safety sign', 'hazard sign', 'caution sign',
      'prohibition sign', 'mandatory sign', 'information sign', 'emergency sign',
      'traffic sign', 'road sign', 'speed sign', 'stop sign', 'yield sign',
      'sinage', 'signeage', 'signege',
      // Labels
      'label', 'labels', 'labeled', 'labelled', 'labeling', 'labelling',
      'unlabeled', 'unlabelled', 'no label', 'label missing', 'mislabeled',
      // Demarcation
      'demarcation', 'demarcated', 'demarcating', 'zone marking', 'floor marking',
      'line marking', 'painted lines', 'boundary marking', 'area marking',
      'marking', 'markings', 'marked', 'unmarked', 'not marked', 'poorly marked',
      // Delineators
      'delineator', 'delineators', 'cone', 'cones', 'traffic cone', 'bollard',
      'bollards', 'post', 'posts', 'stanchion', 'stanchions', 'delinator'
    ],
    description: 'Missing barriers, warning signs, or demarcation'
  },

  'Training & Competency': {
    keywords: [
      // Training
      'training', 'trained', 'trainer', 'trainee', 'untrained', 'not trained',
      'training missing', 'no training', 'lack of training', 'lacking training',
      'insufficient training', 'inadequate training', 'training expired',
      'training overdue', 'training required', 'training needed',
      'traning', 'trainning', 'trainin', 'trainig',
      // Competency
      'competent', 'competency', 'competence', 'incompetent', 'not competent',
      'competent person', 'competency issue', 'competancy', 'compentent',
      // Qualification
      'qualified', 'qualification', 'qualifications', 'unqualified', 'not qualified',
      'no qualification', 'qualification expired', 'qualification missing',
      'qualifed', 'quailfied', 'qualifcation',
      // Certification
      'certified', 'certification', 'certificate', 'uncertified', 'not certified',
      'expired cert', 'certification expired', 'certificate expired',
      'certificate missing', 'no certificate', 'invalid certificate',
      'certificat', 'certifcate', 'cretificate', 'certficate',
      // License
      'license', 'licence', 'licensed', 'licenced', 'unlicensed', 'unlicenced',
      'no license', 'license expired', 'licence expired', 'invalid license',
      'liscense', 'lisence', 'licnese',
      // Induction
      'induction', 'inducted', 'no induction', 'induction missing',
      'site induction', 'safety induction', 'orientation', 'onboarding',
      // Experience
      'experience', 'experienced', 'inexperienced', 'no experience',
      'lack of experience', 'first time', 'new worker', 'new employee',
      'new starter', 'newcomer', 'novice', 'beginner', 'inexpereinced',
      // Skills/Knowledge
      'skill', 'skills', 'skilled', 'unskilled', 'knowledge', 'awareness',
      'refresher', 'refresher training', 'retraining', 'update training'
    ],
    description: 'Not trained, expired certification, or unqualified'
  },

  'Housekeeping': {
    keywords: [
      // Core terms
      'housekeeping', 'house keeping', 'house-keeping', 'houskeeping', 'houskepping',
      'good housekeeping', 'poor housekeeping', 'bad housekeeping',
      // Debris/waste
      'debris', 'rubble', 'rubbish', 'trash', 'garbage', 'waste', 'litter',
      'scrap', 'offcuts', 'cuttings', 'sweepings', 'detritus',
      // Clutter/mess
      'clutter', 'cluttered', 'mess', 'messy', 'untidy', 'disorganized',
      'disorganised', 'disorder', 'disorderly', 'chaotic', 'jumbled',
      // Scattered materials
      'scattered', 'scattering', 'strewn', 'spread', 'left lying',
      'material scattered', 'tools scattered', 'equipment scattered',
      // Cleanliness
      'clean', 'cleaning', 'cleaned', 'unclean', 'dirty', 'filthy',
      'work area dirty', 'area not cleaned', 'not cleaned up',
      // Organization
      'tidy', 'tidied', 'tidying', 'organized', 'organised', 'organization',
      'poor organization', 'poor organisation', 'lack of organization',
      // Storage issues
      'stockpile', 'stockpiled', 'piled up', 'stacked poorly', 'stored incorrectly',
      'improper storage', 'materials left', 'left behind', 'not cleared',
      // Spillage
      'spillage', 'spilled', 'spilt', 'leak', 'leaking', 'drip', 'dripping',
      'puddle', 'pool', 'standing water'
    ],
    description: 'Debris, clutter, waste, or poor organization'
  },

  'Supervision': {
    keywords: [
      // Supervisor terms
      'supervision', 'supervisor', 'supervisors', 'supervise', 'supervised',
      'supervising', 'unsupervised', 'no supervisor', 'supervisor absent',
      'supervisor missing', 'lack of supervision', 'inadequate supervision',
      'poor supervision', 'insufficient supervision', 'supervison', 'supervisior',
      // Foreman
      'foreman', 'foremen', 'no foreman', 'foreman absent', 'site foreman',
      'general foreman', 'trade foreman', 'foremn', 'forman',
      // Oversight
      'oversight', 'no oversight', 'lack of oversight', 'inadequate oversight',
      'poor oversight', 'oversee', 'overseeing', 'overseen',
      // Management
      'management', 'manager', 'managed', 'unmanaged', 'no management',
      'site management', 'line manager', 'managment', 'managr',
      // Working alone
      'unattended', 'left alone', 'working alone', 'lone worker', 'lone working',
      'solo work', 'solo working', 'by himself', 'by herself', 'by themselves',
      // Leadership roles
      'coordinator', 'co-ordinator', 'charge hand', 'chargehand', 'team leader',
      'team lead', 'gang leader', 'leadman', 'leadership', 'leading hand',
      // Monitoring
      'monitoring', 'monitored', 'not monitored', 'unmonitored', 'watch',
      'watching', 'observed', 'observation', 'safety watch'
    ],
    description: 'No supervisor or inadequate oversight'
  },

  'Site Access & Security': {
    keywords: [
      // Security
      'security', 'secure', 'secured', 'unsecured', 'insecure', 'unsecure',
      'security breach', 'security issue', 'security guard', 'security officer',
      'secuirty', 'securty', 'secutiry',
      // Unauthorized
      'unauthorized', 'unauthorised', 'unauthorized access', 'unauthorised access',
      'not authorized', 'not authorised', 'without authorization', 'no authority',
      'unautorized', 'unathorized', 'unauthorzied',
      // Access control
      'access control', 'access denied', 'access restricted', 'controlled access',
      'no access control', 'access point', 'entry point', 'checkpoint',
      // ID/Badge
      'badge', 'badges', 'id card', 'id badge', 'identification', 'no badge',
      'badge missing', 'without badge', 'id issue', 'id not shown', 'no id',
      // Perimeter
      'perimeter', 'perimeter breach', 'perimeter fence', 'perimeter security',
      'boundary', 'boundary breach', 'perimiter', 'perimeter compromised',
      // Gate
      'gate', 'gates', 'gated', 'gate unsecured', 'gate open', 'gate unlocked',
      'gatehouse', 'entry gate', 'exit gate', 'main gate',
      // Intruders
      'intruder', 'intruders', 'trespass', 'trespasser', 'trespassing',
      'stranger', 'unknown person', 'unidentified', 'visitor', 'unescorted',
      'escorted', 'escort required',
      // Surveillance
      'cctv', 'camera', 'cameras', 'surveillance', 'monitoring camera',
      'security camera', 'video surveillance',
      // Restricted areas
      'restricted', 'restricted area', 'no entry', 'keep out', 'authorized only',
      'authorised only', 'personnel only', 'staff only', 'off limits'
    ],
    description: 'Unauthorized access, perimeter breach, or ID issue'
  }
}

// ============================================================================
// HAZARD_SPECIFIC_FACTORS - UNIQUE factors for each hazard
// Rule: No overlap with COMMON_FACTORS
// ============================================================================

export const HAZARD_SPECIFIC_FACTORS = {
  // ==================== SIGNIFICANT HAZARDS (14) ====================

  'Working at Height': {
    'Scaffold deficiency': [
      'scaffold', 'scaffolds', 'scaffolding', 'scafold', 'scaffhold',
      'scaffold tag', 'incomplete scaffold', 'unsafe scaffold',
      'scaffold board', 'scaffold plank', 'putlog', 'tube and fitting',
      'scaffold erection', 'scaffold dismantling', 'scaffold incomplete',
      'scaffold damage', 'scaffold overload'
    ],
    'MEWP malfunction': [
      'mewp', 'cherry picker', 'boom lift', 'scissor lift', 'aerial platform',
      'elevated work platform', 'ewp', 'access platform', 'mewp defect',
      'mewp inspection', 'platform malfunction', 'lift malfunction'
    ],
    'Ladder positioning': [
      'ladder', 'ladders', 'step ladder', 'stepladder', 'extension ladder',
      'a-frame', 'ladder not secured', 'unsecured ladder', 'leaning ladder',
      'damaged ladder', 'defective ladder', 'broken ladder', 'ladder angle',
      'ladder footing', 'ladder extending', 'three points contact'
    ],
    'Guardrail/edge gap': [
      'guardrail', 'guard rail', 'handrail', 'mid rail', 'top rail',
      'edge protection', 'perimeter protection', 'unguarded edge',
      'guardrail missing', 'guardrail damaged', 'guardrail gap',
      'edge unprotected', 'open edge'
    ],
    'Safety net missing': [
      'safety net', 'catch net', 'debris net', 'net missing', 'fall net',
      'no safety net', 'missing net', 'net inadequate'
    ],
    'Anchor point issue': [
      'anchor', 'anchorage', 'anchor point', 'tie off', 'tie-off',
      'attachment point', 'anchor inadequate', 'no anchor', 'weak anchor',
      'anchor not tested', 'lanyard anchor'
    ],
    'Opening unprotected': [
      'opening', 'floor opening', 'hole', 'uncovered hole', 'open hole',
      'penetration', 'shaft', 'void', 'unprotected opening', 'uncovered opening',
      'opening cover', 'hole cover missing'
    ]
  },

  'Lifting': {
    'Rigging deficiency': [
      'rigging', 'sling', 'slings', 'shackle', 'shackles', 'hook', 'hooks',
      'lifting gear', 'chain', 'wire rope', 'webbing', 'rigging defect',
      'sling damage', 'rigging inspection', 'swl exceeded', 'wll exceeded'
    ],
    'Lift plan inadequate': [
      'lift plan', 'lifting plan', 'method statement', 'lift study',
      'lifting procedure', 'no plan', 'without plan', 'plan inadequate',
      'lift assessment', 'critical lift'
    ],
    'Crane defect': [
      'crane', 'tower crane', 'mobile crane', 'crawler crane', 'hoist',
      'crane defect', 'crane inspection', 'crane overload', 'lmi',
      'load moment indicator', 'crane malfunction', 'crane certificate'
    ],
    'Tag line missing': [
      'tag line', 'tagline', 'guide rope', 'tag rope', 'no tag line',
      'missing tag line', 'load control', 'load swing'
    ],
    'Overload': [
      'overload', 'overloaded', 'over capacity', 'swl', 'wll',
      'safe working load', 'capacity exceeded', 'weight exceeded',
      'load limit', 'load chart'
    ],
    'Load shifting': [
      'load shift', 'shifting load', 'load unsecured', 'load unstable',
      'unbalanced load', 'center of gravity', 'cog', 'load movement'
    ]
  },

  'Confined Spaces': {
    'Atmospheric hazard': [
      'atmospheric', 'atmosphere', 'gas test', 'gas detection', 'oxygen',
      'toxic gas', 'h2s', 'hydrogen sulfide', 'co', 'carbon monoxide',
      'lel', 'lower explosive limit', 'toxic atmosphere', 'oxygen deficient',
      'gas monitor', 'four gas', '4 gas'
    ],
    'Rescue plan missing': [
      'rescue plan', 'rescue equipment', 'rescue team', 'emergency rescue',
      'tripod', 'davit', 'retrieval system', 'rescue winch', 'no rescue plan',
      'rescue procedure', 'self rescue'
    ],
    'Attendant absent': [
      'attendant', 'hole watch', 'top man', 'entry attendant', 'standby person',
      'no attendant', 'attendant absent', 'watchman', 'safety watch'
    ],
    'Ventilation inadequate': [
      'ventilation', 'forced air', 'blower', 'fan', 'air supply',
      'air circulation', 'no ventilation', 'inadequate ventilation',
      'ventilation failure', 'fresh air'
    ],
    'Isolation failure': [
      'isolation', 'isolate', 'isolated', 'lockout', 'lock out', 'loto',
      'energy isolation', 'not isolated', 'isolation failure', 'blind',
      'blank flange', 'double block', 'bleed'
    ]
  },

  'Energized System': {
    'LOTO not applied': [
      'loto', 'lockout', 'lock out', 'tagout', 'tag out', 'lockout tagout',
      'energy isolation', 'no lockout', 'loto missing', 'lock missing',
      'isolation not applied', 'stored energy'
    ],
    'Live exposure': [
      'live', 'energized', 'energised', 'live work', 'working live',
      'live conductor', 'live wire', 'live circuit', 'live parts',
      'electrical exposure', 'shock hazard', 'arc flash'
    ],
    'Exposed conductor': [
      'exposed wire', 'exposed conductor', 'bare wire', 'damaged cable',
      'insulation damage', 'cable damage', 'frayed wire', 'conductor exposed'
    ],
    'Panel/enclosure open': [
      'panel open', 'enclosure open', 'switchboard', 'distribution board',
      'mcc', 'panel cover', 'panel door', 'electrical panel', 'junction box',
      'cover missing', 'enclosure unsecured'
    ],
    'Grounding fault': [
      'ground', 'grounding', 'earthing', 'earth', 'ground fault',
      'grounding missing', 'no ground', 'earth connection', 'bonding',
      'equipotential', 'ground cable'
    ]
  },

  'Hot Work': {
    'Fire watch absent': [
      'fire watch', 'firewatch', 'fire watcher', 'fire patrol',
      'no fire watch', 'fire watch absent', 'fire watch missing',
      'hot work watch', 'spark watch'
    ],
    'Welding screen missing': [
      'welding screen', 'weld screen', 'flash screen', 'welding curtain',
      'flash curtain', 'screen missing', 'no screen', 'weld shield'
    ],
    'Spark escape': [
      'spark', 'sparks', 'spatter', 'slag', 'spark containment',
      'spark escape', 'flying sparks', 'hot slag', 'molten metal'
    ],
    'Cylinder unsecured': [
      'cylinder', 'gas cylinder', 'bottle', 'oxygen cylinder', 'acetylene',
      'cylinder unsecured', 'cylinder not chained', 'cylinder storage',
      'cylinder handling', 'regulator', 'flashback arrestor'
    ],
    'Combustible nearby': [
      'combustible', 'flammable', 'flammable material', 'combustible material',
      'fuel', 'solvent', 'paint', 'wood', 'cardboard', 'paper',
      'combustible nearby', 'flammable nearby', 'fire load'
    ]
  },

  'Fire': {
    'Extinguisher missing/expired': [
      'extinguisher', 'fire extinguisher', 'extinguisher missing',
      'extinguisher expired', 'no extinguisher', 'extinguisher inspection',
      'extinguisher service', 'fire fighting equipment'
    ],
    'Exit blocked': [
      'exit blocked', 'emergency exit', 'fire exit', 'egress blocked',
      'escape route', 'exit obstruction', 'blocked exit', 'exit door',
      'evacuation route', 'means of escape'
    ],
    'Alarm failure': [
      'fire alarm', 'alarm', 'smoke detector', 'heat detector',
      'alarm failure', 'alarm disabled', 'detector', 'alarm not working',
      'fire detection', 'alarm system'
    ],
    'Ignition source': [
      'ignition', 'ignition source', 'spark source', 'hot surface',
      'naked flame', 'open flame', 'heat source', 'pilot light',
      'electrical ignition'
    ],
    'Fire door propped': [
      'fire door', 'fire door propped', 'door propped', 'fire door open',
      'fire door wedged', 'fire separation', 'compartmentation'
    ]
  },

  'Mobile Plant & Equipment': {
    'Banksman absent': [
      'banksman', 'banks man', 'spotter', 'signaller', 'signaler',
      'signal man', 'no banksman', 'banksman absent', 'guide',
      'flagman', 'traffic marshal', 'no spotter'
    ],
    'Exclusion zone breach': [
      'exclusion zone', 'danger zone', 'swing radius', 'swing zone',
      'drop zone', 'zone breach', 'entered zone', 'exclusion area',
      'no exclusion zone', 'zone not established'
    ],
    'Blind spot': [
      'blind spot', 'blind area', 'visibility', 'cannot see',
      'obstructed view', 'mirror', 'camera', 'reversing camera',
      'rear view', 'view blocked'
    ],
    'Equipment defect': [
      'defect', 'defective', 'fault', 'faulty', 'broken', 'damaged',
      'malfunction', 'not working', 'out of order', 'inoperable',
      'equipment failure', 'mechanical failure'
    ],
    'Pedestrian conflict': [
      'pedestrian', 'pedestrian conflict', 'pedestrian interface',
      'pedestrian crossing', 'pedestrian route', 'foot traffic',
      'pedestrian separation', 'pedestrian walkway', 'pedestrian struck'
    ]
  },

  'Breaking Ground & Excavation': {
    'Services not located': [
      'service strike', 'underground service', 'utility', 'cable strike',
      'pipe strike', 'cat scan', 'cable avoidance', 'gpr', 'ground penetrating',
      'service location', 'utility location', 'buried service', 'dial before dig'
    ],
    'Shoring inadequate': [
      'shoring', 'trench box', 'trench shield', 'battering', 'benching',
      'shoring inadequate', 'no shoring', 'support inadequate',
      'trench support', 'excavation support'
    ],
    'Collapse risk': [
      'collapse', 'cave in', 'cave-in', 'trench collapse', 'wall collapse',
      'soil failure', 'ground movement', 'instability', 'subsidence'
    ],
    'Spoil too close': [
      'spoil', 'excavated material', 'spoil pile', 'spoil heap',
      'spoil too close', 'material edge', 'surcharge', 'edge loading'
    ],
    'Water ingress': [
      'water ingress', 'water entry', 'flooding', 'groundwater',
      'dewatering', 'water accumulation', 'pump', 'pumping', 'seepage'
    ]
  },

  'Temporary Works': {
    'Design inadequate': [
      'design', 'design inadequate', 'calculation', 'engineering',
      'twc', 'temporary works coordinator', 'design check', 'no design',
      'design approval', 'design review'
    ],
    'Overloaded': [
      'overload', 'overloaded', 'exceeded capacity', 'over capacity',
      'load exceeded', 'weight exceeded', 'structural overload'
    ],
    'Bracing missing': [
      'bracing', 'brace', 'prop', 'propping', 'strut', 'strutting',
      'bracing missing', 'no bracing', 'lateral support', 'diagonal brace'
    ],
    'Foundation unstable': [
      'foundation', 'base', 'base plate', 'sole plate', 'footing',
      'ground bearing', 'soft ground', 'unstable foundation', 'settlement'
    ],
    'Strike damage': [
      'struck', 'strike damage', 'vehicle strike', 'impact', 'collision',
      'hit by vehicle', 'plant damage', 'accidental damage'
    ]
  },

  'Driving': {
    'Speeding': [
      'speed', 'speeding', 'excessive speed', 'over speed', 'fast',
      'speed limit', 'speed violation', 'too fast'
    ],
    'Seatbelt not worn': [
      'seatbelt', 'seat belt', 'restraint', 'no seatbelt', 'unbuckled',
      'not wearing seatbelt', 'belt not worn'
    ],
    'Phone use': [
      'phone', 'mobile phone', 'cell phone', 'phone use', 'texting',
      'distracted driving', 'phone while driving', 'handheld device'
    ],
    'Driver fatigue': [
      'fatigue', 'tired', 'drowsy', 'fatigued driver', 'driver fatigue',
      'rest break', 'driving hours', 'fatigue management'
    ],
    'Vehicle defect': [
      'vehicle defect', 'tyre', 'tire', 'brake', 'light', 'defective vehicle',
      'vehicle inspection', 'pre-trip', 'vehicle check', 'roadworthy'
    ]
  },

  'Working in Heat': {
    'Dehydration': [
      'dehydration', 'dehydrated', 'water', 'fluid', 'hydration',
      'drinking water', 'water intake', 'fluid intake', 'thirst'
    ],
    'No rest breaks': [
      'rest break', 'break', 'rest period', 'cool down', 'recovery',
      'no break', 'working continuously', 'no rest', 'work rest cycle'
    ],
    'No shade': [
      'shade', 'shelter', 'canopy', 'no shade', 'sun exposure',
      'direct sun', 'sun protection', 'shaded area', 'cooling station'
    ],
    'Heat illness signs': [
      'heat stroke', 'heat exhaustion', 'heat stress', 'heat cramp',
      'dizziness', 'nausea', 'confusion', 'excessive sweating', 'pale'
    ],
    'Not acclimatized': [
      'acclimatize', 'acclimatized', 'acclimatisation', 'acclimatization',
      'new worker', 'not accustomed', 'heat adjustment'
    ]
  },

  'Working on or Near Water': {
    'Life jacket missing': [
      'life jacket', 'lifejacket', 'pfd', 'personal flotation',
      'buoyancy aid', 'no life jacket', 'life jacket not worn'
    ],
    'Rescue equipment absent': [
      'rescue equipment', 'throw bag', 'rescue buoy', 'life ring',
      'life buoy', 'rescue pole', 'rescue boat', 'man overboard'
    ],
    'Strong current': [
      'current', 'strong current', 'flow', 'water flow', 'tide',
      'tidal', 'fast water', 'water movement', 'undertow'
    ],
    'Vessel defect': [
      'vessel', 'boat', 'barge', 'pontoon', 'workboat', 'vessel defect',
      'boat inspection', 'vessel inspection', 'hull', 'stability'
    ],
    'Lone working': [
      'lone working', 'working alone', 'solo', 'unaccompanied',
      'buddy system', 'lone worker', 'no buddy'
    ]
  },

  'Working on or Near Live Roads': {
    'Traffic controller absent': [
      'traffic controller', 'traffic control', 'traffic management',
      'tc', 'stop go', 'no traffic control', 'controller absent'
    ],
    'Vehicle incursion risk': [
      'incursion', 'vehicle incursion', 'traffic incursion',
      'vehicle entry', 'vehicle breach', 'struck by vehicle'
    ],
    'Poor visibility': [
      'visibility', 'poor visibility', 'not visible', 'sight distance',
      'blind curve', 'lighting', 'reflective', 'conspicuity'
    ],
    'Inadequate separation': [
      'separation', 'buffer', 'safety zone', 'work zone',
      'clearance', 'distance from traffic', 'separation distance'
    ]
  },

  'Explosives & Blasting': {
    'Shot firer absent': [
      'shot firer', 'blaster', 'explosives engineer', 'shot fire',
      'no shot firer', 'blaster absent', 'licensed blaster'
    ],
    'Misfire risk': [
      'misfire', 'hang fire', 'misfired', 'unexploded', 'uxo',
      'failed detonation', 'misfire procedure'
    ],
    'Blast radius breach': [
      'blast radius', 'blast zone', 'exclusion radius', 'danger zone',
      'clearance zone', 'blast area', 'safe distance'
    ],
    'Flyrock hazard': [
      'flyrock', 'fly rock', 'flying debris', 'projectile',
      'rock throw', 'blast projection', 'blast debris'
    ],
    'Warning failure': [
      'blast warning', 'siren', 'horn', 'all clear', 'warning signal',
      'pre-blast warning', 'warning failure', 'notification'
    ]
  },

  // ==================== SUB-SIGNIFICANT HAZARDS (13) ====================

  'Physical Hazard': {
    'Exposed rebar': [
      'rebar', 're-bar', 'reinforcement bar', 'reinforcing bar',
      'exposed rebar', 'uncapped rebar', 'rebar cap', 'mushroom cap',
      'exposed reinforcement', 'steel bar protruding'
    ],
    'Sharp edge': [
      'sharp', 'sharp edge', 'cutting', 'cut', 'pointed', 'nail',
      'screw', 'wire', 'burr', 'jagged', 'laceration hazard'
    ],
    'Struck-by risk': [
      'struck by', 'struck-by', 'hit by', 'falling object',
      'overhead', 'swing', 'impact', 'dropped object'
    ],
    'Pinch point': [
      'pinch', 'pinch point', 'crush', 'crush point', 'caught between',
      'caught in', 'nip point', 'crushing'
    ],
    'Protruding object': [
      'protruding', 'sticking out', 'projection', 'protrusion',
      'jutting', 'jut out', 'projecting'
    ]
  },

  'Mechanical Hazard': {
    'Guard missing': [
      'guard', 'guarding', 'machine guard', 'guard missing', 'no guard',
      'guard removed', 'unguarded', 'cover missing', 'protective cover'
    ],
    'Rotating parts exposed': [
      'rotating', 'rotating parts', 'moving parts', 'belt', 'pulley',
      'gear', 'shaft', 'exposed shaft', 'unguarded rotation'
    ],
    'E-stop absent': [
      'e-stop', 'emergency stop', 'estop', 'kill switch', 'emergency button',
      'e-stop missing', 'no emergency stop', 'e-stop not working'
    ],
    'Unexpected startup': [
      'unexpected startup', 'unexpected start', 'unexpected energization',
      'sudden startup', 'inadvertent startup', 'accidental start'
    ]
  },

  'COSHH (Chemical)': {
    'SDS missing': [
      'sds', 'msds', 'safety data sheet', 'data sheet', 'no sds',
      'sds missing', 'chemical information', 'coshh assessment'
    ],
    'Unlabeled container': [
      'unlabeled', 'unlabelled', 'no label', 'label missing', 'unmarked container',
      'container labeling', 'decanted', 'secondary container'
    ],
    'Incompatible storage': [
      'incompatible', 'storage', 'segregation', 'chemical storage',
      'incompatible chemicals', 'storage area', 'chemical cabinet'
    ],
    'Spill uncontained': [
      'spill', 'leak', 'spillage', 'leaking', 'spill kit', 'bund',
      'secondary containment', 'uncontained', 'drip tray'
    ]
  },

  'Respiratory Hazard': {
    'Dust/fume exposure': [
      'dust', 'fume', 'fumes', 'smoke', 'vapor', 'vapour', 'mist',
      'airborne', 'inhalation', 'breathing', 'exposure'
    ],
    'Wrong RPE type': [
      'rpe', 'respirator', 'mask', 'wrong mask', 'incorrect mask',
      'filter', 'cartridge', 'wrong filter', 'rpe selection'
    ],
    'Fit test overdue': [
      'fit test', 'face fit', 'fit testing', 'fit test overdue',
      'no fit test', 'seal check', 'respirator fit'
    ],
    'LEV not working': [
      'lev', 'local exhaust', 'extraction', 'ventilation', 'fume extraction',
      'dust extraction', 'lev not working', 'extraction failure'
    ]
  },

  'Slip and Trip': {
    'Wet surface': [
      'wet', 'wet floor', 'wet surface', 'slippery', 'water on floor',
      'oil on floor', 'spill', 'rain', 'condensation'
    ],
    'Uneven ground': [
      'uneven', 'uneven ground', 'uneven surface', 'pothole', 'depression',
      'step', 'level change', 'broken surface', 'damaged floor'
    ],
    'Cable across path': [
      'cable', 'cable across', 'trailing cable', 'trip hazard', 'hose',
      'hose across', 'lead', 'extension cord', 'cable management'
    ],
    'Poor lighting': [
      'lighting', 'poor lighting', 'dark', 'dim', 'no lighting',
      'inadequate lighting', 'light out', 'visibility'
    ]
  },

  'Tools': {
    'Tool defective': [
      'tool defect', 'defective tool', 'damaged tool', 'broken tool',
      'faulty tool', 'tool failure', 'tool damage'
    ],
    'Wrong tool for job': [
      'wrong tool', 'incorrect tool', 'improvised', 'makeshift',
      'tool selection', 'appropriate tool', 'right tool'
    ],
    'Guard bypassed': [
      'guard bypassed', 'guard removed', 'guard disabled', 'interlock',
      'interlock bypassed', 'safety bypassed'
    ],
    'Inspection overdue': [
      'inspection overdue', 'not inspected', 'overdue', 'out of date',
      'tool inspection', 'pat test', 'electrical test'
    ]
  },

  'Traffic Management': {
    'Route confusion': [
      'route', 'route confusion', 'unclear route', 'direction',
      'wayfinding', 'lost', 'wrong way'
    ],
    'Pedestrian mixing': [
      'pedestrian mixing', 'mixed traffic', 'pedestrian vehicle',
      'no segregation', 'pedestrian separation'
    ],
    'Speed not controlled': [
      'speed', 'speed control', 'speeding', 'speed bump', 'speed limit',
      'no speed control', 'excessive speed'
    ],
    'Crossing unsafe': [
      'crossing', 'unsafe crossing', 'pedestrian crossing', 'crosswalk',
      'crossing point', 'no crossing'
    ]
  },

  'Environmental': {
    'Spill/leak': [
      'spill', 'leak', 'spillage', 'environmental spill', 'contamination',
      'release', 'discharge', 'runoff'
    ],
    'Dust emission': [
      'dust', 'dust emission', 'dust control', 'dusty', 'particulate',
      'air quality', 'dust suppression'
    ],
    'Noise excessive': [
      'noise', 'loud', 'excessive noise', 'noise level', 'decibel',
      'noise exposure', 'hearing', 'noise control'
    ],
    'Waste improper': [
      'waste', 'improper waste', 'waste disposal', 'waste segregation',
      'contaminated waste', 'hazardous waste', 'skip', 'bin'
    ]
  },

  'Access': {
    'Route blocked': [
      'blocked', 'obstruction', 'route blocked', 'path blocked',
      'access blocked', 'obstructed', 'congested'
    ],
    'Stair defect': [
      'stair', 'stairs', 'stairway', 'step', 'handrail', 'nosing',
      'stair damage', 'stair defect', 'broken step'
    ],
    'Lighting inadequate': [
      'lighting', 'light', 'dark', 'dim', 'inadequate lighting',
      'no light', 'visibility poor'
    ],
    'Overcrowded': [
      'overcrowded', 'congested', 'crowded', 'too many people',
      'capacity exceeded', 'bottleneck'
    ]
  },

  'Worker Welfare': {
    'Water unavailable': [
      'water', 'drinking water', 'potable water', 'no water',
      'water unavailable', 'hydration', 'water station'
    ],
    'Toilet unclean': [
      'toilet', 'restroom', 'washroom', 'wc', 'toilet unclean',
      'dirty toilet', 'toilet condition', 'sanitation'
    ],
    'Rest area missing': [
      'rest area', 'break area', 'rest room', 'canteen', 'shelter',
      'shade', 'welfare facility', 'no rest area'
    ],
    'First aid kit empty': [
      'first aid', 'first aid kit', 'medical', 'first aid empty',
      'first aid supplies', 'bandage', 'dressing'
    ]
  },

  'Noise': {
    'Hearing zone unmarked': [
      'hearing zone', 'noise zone', 'hearing protection area',
      'zone unmarked', 'no marking', 'ear protection zone'
    ],
    'Source uncontrolled': [
      'noise source', 'uncontrolled', 'noise reduction', 'silencer',
      'enclosure', 'noise barrier', 'damping'
    ],
    'Exposure excessive': [
      'exposure', 'noise exposure', 'excessive', 'over limit',
      'time weighted', 'dosimeter', 'noise level'
    ]
  },

  'General Site Issues': {
    'Unclassified': [
      'issue', 'problem', 'concern', 'observation', 'finding',
      'unsafe', 'hazard', 'risk'
    ],
    'Multiple factors': [
      'multiple', 'several', 'combination', 'various', 'different issues'
    ]
  }
}

// ============================================================================
// FACTOR TYPE CLASSIFICATION
// Used to identify whether a factor is Common or Specific
// ============================================================================

export const FACTOR_TYPE = {
  COMMON: 'common',
  SPECIFIC: 'specific'
}

/**
 * Check if a factor name is a Common Factor
 */
export const isCommonFactor = (factorName) => {
  return COMMON_FACTORS.hasOwnProperty(factorName)
}

/**
 * Get the type of a factor (common or specific)
 */
export const getFactorType = (factorName) => {
  if (isCommonFactor(factorName)) {
    return FACTOR_TYPE.COMMON
  }
  return FACTOR_TYPE.SPECIFIC
}

/**
 * Get all Common Factor names
 */
export const getCommonFactorNames = () => {
  return Object.keys(COMMON_FACTORS)
}

/**
 * Get all Specific Factor names for a hazard
 */
export const getSpecificFactorNames = (hazardName) => {
  if (!hazardName || !HAZARD_SPECIFIC_FACTORS[hazardName]) {
    return []
  }
  return Object.keys(HAZARD_SPECIFIC_FACTORS[hazardName])
}

// ============================================================================
// DETECTION ENGINE
// ============================================================================

/**
 * Detect all causes (both Common and Specific) from a description
 * @param {string} description - The observation description
 * @param {string} hazardName - The hazard category (optional, for specific factors)
 * @returns {Array} Array of { name, type, category } objects
 */
export const detectAllCausesUnified = (description, hazardName = null) => {
  if (!description || typeof description !== 'string') {
    return []
  }

  const text = description.toLowerCase()
  const detected = []
  const seenFactors = new Set()

  // STEP 1: Detect COMMON FACTORS (apply to all hazards)
  for (const [factorName, factorData] of Object.entries(COMMON_FACTORS)) {
    if (seenFactors.has(factorName)) continue

    for (const keyword of factorData.keywords) {
      let matched = false
      const keywordLower = keyword.toLowerCase()

      // Use word boundary for short keywords (5 chars or less)
      if (keyword.length <= 5) {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        matched = regex.test(text)
      } else {
        const keywordIndex = text.indexOf(keywordLower)
        if (keywordIndex !== -1) {
          // Check for negation context
          matched = !hasNegationContext(text, keywordIndex, keywordLower.length)
        }
      }

      if (matched) {
        detected.push({
          name: factorName,
          type: FACTOR_TYPE.COMMON,
          category: 'Common Factor'
        })
        seenFactors.add(factorName)
        break
      }
    }
  }

  // STEP 2: Detect HAZARD-SPECIFIC FACTORS (only if hazard is specified)
  if (hazardName && HAZARD_SPECIFIC_FACTORS[hazardName]) {
    const specificFactors = HAZARD_SPECIFIC_FACTORS[hazardName]

    for (const [factorName, keywords] of Object.entries(specificFactors)) {
      if (seenFactors.has(factorName)) continue

      for (const keyword of keywords) {
        let matched = false
        const keywordLower = keyword.toLowerCase()

        if (keyword.length <= 5) {
          const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
          matched = regex.test(text)
        } else {
          const keywordIndex = text.indexOf(keywordLower)
          if (keywordIndex !== -1) {
            matched = !hasNegationContext(text, keywordIndex, keywordLower.length)
          }
        }

        if (matched) {
          detected.push({
            name: factorName,
            type: FACTOR_TYPE.SPECIFIC,
            category: hazardName
          })
          seenFactors.add(factorName)
          break
        }
      }
    }
  }

  return detected
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

export const NEGATIVE_TYPES = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr', 'fac', 'mti', 'lti']
export const POSITIVE_TYPES = ['positive']

/**
 * Aggregate root causes for all incidents in a hazard
 * Returns both Common and Specific factors with counts
 */
export const aggregateRootCausesForHazard = (incidents, hazardName, observationType = 'negative') => {
  let hazardIncidents = incidents.filter(i => i.location === hazardName)

  if (observationType === 'negative') {
    hazardIncidents = hazardIncidents.filter(i => NEGATIVE_TYPES.includes(i.type))
  } else if (observationType === 'positive') {
    hazardIncidents = hazardIncidents.filter(i => POSITIVE_TYPES.includes(i.type))
  }

  if (hazardIncidents.length === 0) {
    return {
      breakdown: [],
      commonFactors: [],
      specificFactors: [],
      total: 0,
      topCause: null,
      hasData: false,
      observationType
    }
  }

  const causeCounts = {}
  const causeTypes = {}
  const causeCategories = {}
  let matchedIncidents = 0

  hazardIncidents.forEach(incident => {
    const description = incident.description || ''
    if (!description.trim()) return

    const allCauses = detectAllCausesUnified(description, hazardName)

    if (allCauses.length > 0) {
      matchedIncidents++
      const seenInThisIncident = new Set()
      allCauses.forEach(({ name, type, category }) => {
        if (!seenInThisIncident.has(name)) {
          seenInThisIncident.add(name)
          causeCounts[name] = (causeCounts[name] || 0) + 1
          causeTypes[name] = type
          causeCategories[name] = category
        }
      })
    }
  })

  const total = hazardIncidents.length

  // Build full breakdown
  let breakdown = Object.entries(causeCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
      type: causeTypes[name],
      category: causeCategories[name]
    }))
    .sort((a, b) => b.count - a.count)

  // Separate into Common and Specific
  const commonFactors = breakdown.filter(f => f.type === FACTOR_TYPE.COMMON)
  const specificFactors = breakdown.filter(f => f.type === FACTOR_TYPE.SPECIFIC)

  // Add "Not Specified" for unmatched observations
  const unmatchedCount = total - matchedIncidents
  if (unmatchedCount > 0 && unmatchedCount > total * 0.1) {
    breakdown.push({
      name: 'Not Specified',
      count: unmatchedCount,
      percentage: total > 0 ? ((unmatchedCount / total) * 100).toFixed(1) : '0.0',
      type: 'unclassified',
      category: 'Unclassified'
    })
    breakdown.sort((a, b) => b.count - a.count)
  }

  return {
    breakdown,
    commonFactors,
    specificFactors,
    total,
    topCause: breakdown[0] || null,
    hasData: total > 0,
    observationType,
    matchedPercent: total > 0 ? ((matchedIncidents / total) * 100).toFixed(1) : '0.0'
  }
}

/**
 * Get observation type statistics for a hazard
 */
export const getObservationTypeStats = (incidents, hazardName) => {
  const hazardIncidents = incidents.filter(i => i.location === hazardName)

  const negativeCount = hazardIncidents.filter(i => NEGATIVE_TYPES.includes(i.type)).length
  const positiveCount = hazardIncidents.filter(i => POSITIVE_TYPES.includes(i.type)).length
  const totalCount = hazardIncidents.length

  return {
    negative: negativeCount,
    positive: positiveCount,
    total: totalCount,
    negativePercent: totalCount > 0 ? ((negativeCount / totalCount) * 100).toFixed(1) : '0.0',
    positivePercent: totalCount > 0 ? ((positiveCount / totalCount) * 100).toFixed(1) : '0.0'
  }
}

/**
 * Get list of available hazards
 */
export const getAvailableHazards = () => {
  return Object.keys(HAZARD_SPECIFIC_FACTORS)
}

/**
 * Get root cause definitions for a specific hazard
 * Returns both Common and Specific factors
 */
export const getRootCauseDefinitions = (hazardName) => {
  const common = Object.entries(COMMON_FACTORS).map(([name, data]) => ({
    name,
    type: FACTOR_TYPE.COMMON,
    description: data.description
  }))

  const specific = hazardName && HAZARD_SPECIFIC_FACTORS[hazardName]
    ? Object.keys(HAZARD_SPECIFIC_FACTORS[hazardName]).map(name => ({
        name,
        type: FACTOR_TYPE.SPECIFIC,
        description: `Specific to ${hazardName}`
      }))
    : []

  return { common, specific }
}

/**
 * Aggregate contributing factors across all incidents
 * Groups by Common vs Specific
 */
export const aggregateContributingFactors = (incidents, observationType = 'all', options = {}) => {
  let filtered = [...incidents]

  if (observationType === 'negative') {
    filtered = filtered.filter(i => NEGATIVE_TYPES.includes(i.type))
  } else if (observationType === 'positive') {
    filtered = filtered.filter(i => POSITIVE_TYPES.includes(i.type))
  }

  const factorCounts = {}
  const factorTypes = {}
  let matchedCount = 0

  filtered.forEach(incident => {
    const description = incident.description || ''
    const hazardName = incident.location || null

    if (!description.trim()) return

    const causes = detectAllCausesUnified(description, hazardName)

    if (causes.length > 0) {
      matchedCount++
      const seenInThisIncident = new Set()
      causes.forEach(({ name, type }) => {
        if (!seenInThisIncident.has(name)) {
          seenInThisIncident.add(name)
          factorCounts[name] = (factorCounts[name] || 0) + 1
          factorTypes[name] = type
        }
      })
    }
  })

  const total = filtered.length
  const factors = Object.entries(factorCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
      type: factorTypes[name],
      category: factorTypes[name] === FACTOR_TYPE.COMMON ? 'Common Factor' : 'Specific Factor'
    }))
    .sort((a, b) => b.count - a.count)

  const commonFactors = factors.filter(f => f.type === FACTOR_TYPE.COMMON)
  const specificFactors = factors.filter(f => f.type === FACTOR_TYPE.SPECIFIC)

  return {
    // New structure
    factors,
    commonFactors,
    specificFactors,
    total,
    matchedCount,
    matchedPercent: total > 0 ? ((matchedCount / total) * 100).toFixed(1) : '0.0',
    // Backward compatibility aliases
    byFactor: factors,
    analyzed: matchedCount
  }
}

// ============================================================================
// LEGACY COMPATIBILITY EXPORTS
// These maintain backward compatibility with existing code
// ============================================================================

export const HAZARD_ROOT_CAUSES = HAZARD_SPECIFIC_FACTORS

export const detectRootCauses = (description, hazardName) => {
  return detectAllCausesUnified(description, hazardName)
}

export const detectAllRootCauses = (description, hazardName) => {
  return detectAllCausesUnified(description, hazardName)
}

// For backwards compatibility with factor synonyms
export const FACTOR_SYNONYMS = {
  'Common Factors': Object.keys(COMMON_FACTORS)
}

export const getConsolidatedFactor = (factorName) => {
  return factorName
}

export const expandFactorGroup = (groupName) => {
  if (groupName === 'Common Factors') {
    return Object.keys(COMMON_FACTORS)
  }
  return [groupName]
}

// CONSOLIDATED_FACTOR_CATEGORIES for color mapping compatibility
export const CONSOLIDATED_FACTOR_CATEGORIES = {
  // Common Factors
  'Permit to Work': 'Common Factor',
  'PPE': 'Common Factor',
  'Barriers & Signage': 'Common Factor',
  'Training & Competency': 'Common Factor',
  'Housekeeping': 'Common Factor',
  'Supervision': 'Common Factor',
  'Site Access & Security': 'Common Factor',

  // Default for specifics
  'default': 'Specific Factor'
}

// CONSOLIDATED_FACTOR_KEYWORDS merged from both Common and Specific
export const CONSOLIDATED_FACTOR_KEYWORDS = {
  ...Object.fromEntries(
    Object.entries(COMMON_FACTORS).map(([name, data]) => [name, data.keywords])
  )
}

// Add all specific factors to CONSOLIDATED_FACTOR_KEYWORDS
Object.entries(HAZARD_SPECIFIC_FACTORS).forEach(([hazard, factors]) => {
  Object.entries(factors).forEach(([factorName, keywords]) => {
    if (!CONSOLIDATED_FACTOR_KEYWORDS[factorName]) {
      CONSOLIDATED_FACTOR_KEYWORDS[factorName] = keywords
    }
  })
})

// UNIVERSAL_CONTRIBUTING_FACTORS - legacy export (now merged into Common)
export const UNIVERSAL_CONTRIBUTING_FACTORS = {
  'Common Controls': COMMON_FACTORS
}

export const detectContributingFactors = (description, options = {}) => {
  return detectAllCausesUnified(description, options.hazardName || null)
}

export const analyzeUnmatchedObservations = (incidents, limit = 50) => {
  const unmatched = []

  for (const incident of incidents) {
    if (unmatched.length >= limit) break

    const description = incident.description || ''
    if (!description.trim()) continue

    const causes = detectAllCausesUnified(description, incident.location)
    if (causes.length === 0) {
      unmatched.push({
        description,
        hazard: incident.location,
        type: incident.type,
        date: incident.date || incident.observationDate
      })
    }
  }

  return unmatched
}

/**
 * Debug function to see what factors are detected for a description
 */
export const debugRootCauses = (incidents, hazardName) => {
  const hazardIncidents = incidents.filter(i => i.location === hazardName).slice(0, 10)

  return hazardIncidents.map(incident => {
    const description = incident.description || ''
    const causes = detectAllCausesUnified(description, hazardName)

    return {
      description: description.substring(0, 100),
      detected: causes.map(c => `${c.name} (${c.type})`),
      count: causes.length
    }
  })
}
