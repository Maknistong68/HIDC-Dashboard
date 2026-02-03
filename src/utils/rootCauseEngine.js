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
      // Core terms
      'scaffold', 'scaffolds', 'scaffolding', 'scaffolded', 'scaffolder', 'scaffolders',
      // Misspellings
      'scafold', 'scaffhold', 'scafolding', 'scaffoldin', 'scafholding', 'scaffoling',
      'scaffoding', 'scafolld', 'scaffoldig', 'scaffolding', 'scaffoldin', 'scafffold',
      // Types
      'tube scaffold', 'system scaffold', 'frame scaffold', 'mobile scaffold',
      'suspended scaffold', 'cantilever scaffold', 'independent scaffold',
      'birdcage scaffold', 'tower scaffold', 'rolling scaffold', 'kwikstage',
      'cuplock', 'ringlock', 'layher', 'aluminium scaffold', 'aluminum scaffold',
      // Components
      'scaffold tag', 'scafftag', 'scaffold board', 'scaffold boards', 'scaffold plank',
      'scaffold planks', 'toe board', 'toeboard', 'kick board', 'kickboard',
      'putlog', 'putlogs', 'transom', 'transoms', 'ledger', 'ledgers',
      'standard', 'standards', 'brace', 'braces', 'bracing', 'diagonal brace',
      'base plate', 'base plates', 'sole plate', 'sole plates', 'jack', 'jacks',
      'adjustable jack', 'scaffold tube', 'scaffold tubes', 'coupler', 'couplers',
      'swivel coupler', 'right angle coupler', 'sleeve coupler',
      // Issues
      'incomplete scaffold', 'unsafe scaffold', 'scaffold incomplete', 'scaffold unsafe',
      'scaffold damage', 'scaffold damaged', 'scaffold overload', 'scaffold overloaded',
      'scaffold erection', 'scaffold dismantling', 'scaffold alteration',
      'scaffold not tagged', 'scaffold tag missing', 'red tag', 'green tag',
      'scaffold inspection', 'scaffold uninspected', 'scaffold not inspected',
      'scaffold gap', 'scaffold opening', 'scaffold hole', 'scaffold defect',
      'scaffold defective', 'scaffold failure', 'scaffold collapse', 'scaffold bent',
      'scaffold rusty', 'scaffold corroded', 'scaffold unstable', 'scaffold wobbly',
      'scaffold inadequate', 'scaffold insufficient', 'scaffold improper'
    ],
    'MEWP malfunction': [
      // Core terms
      'mewp', 'mewps', 'm.e.w.p', 'mobile elevating work platform',
      // Misspellings
      'mwep', 'meep', 'mewep', 'mwp',
      // Types
      'cherry picker', 'cherry-picker', 'cherrypicker', 'boom lift', 'boomlift',
      'scissor lift', 'scissorlift', 'aerial platform', 'aerial lift',
      'elevated work platform', 'ewp', 'awp', 'aerial work platform',
      'access platform', 'man lift', 'manlift', 'personnel lift',
      'articulating boom', 'telescopic boom', 'straight boom', 'jlg', 'genie',
      'skyjack', 'haulotte', 'niftylift', 'snorkel', 'manitou',
      'spider lift', 'truck mounted', 'trailer mounted', 'self propelled',
      // Issues
      'mewp defect', 'mewp defective', 'mewp malfunction', 'mewp malfunctioning',
      'mewp inspection', 'mewp uninspected', 'mewp not inspected', 'mewp overdue',
      'platform malfunction', 'lift malfunction', 'boom malfunction',
      'mewp failure', 'mewp breakdown', 'mewp not working', 'mewp stuck',
      'mewp unstable', 'mewp overloaded', 'mewp tipped', 'mewp collision',
      'mewp certificate', 'mewp certification', 'mewp expired', 'mewp overdue',
      'outrigger', 'outriggers', 'outrigger not deployed', 'stabilizer', 'stabilizers',
      'guardrail mewp', 'mewp guardrail', 'lanyard mewp', 'harness mewp',
      'mewp controls', 'controls malfunction', 'mewp hydraulic', 'hydraulic leak'
    ],
    'Ladder positioning': [
      // Core terms
      'ladder', 'ladders', 'laddering',
      // Misspellings
      'lader', 'laddar', 'ladar', 'laddr', 'laddder', 'ladde', 'ladeer',
      // Types
      'step ladder', 'stepladder', 'step-ladder', 'extension ladder', 'extending ladder',
      'a-frame', 'a frame', 'aframe', 'combination ladder', 'multi-purpose ladder',
      'platform ladder', 'podium ladder', 'fixed ladder', 'portable ladder',
      'roof ladder', 'access ladder', 'industrial ladder', 'fiberglass ladder',
      'fibreglass ladder', 'aluminum ladder', 'aluminium ladder', 'wooden ladder',
      'single section', 'double section', 'triple section', 'telescopic ladder',
      'attic ladder', 'loft ladder', 'folding ladder',
      // Issues
      'ladder not secured', 'unsecured ladder', 'ladder unsecured', 'ladder loose',
      'leaning ladder', 'ladder leaning', 'ladder angle', 'wrong angle', '75 degree',
      'ladder footing', 'ladder feet', 'ladder base', 'ladder slip', 'ladder slipped',
      'ladder extending', 'ladder overreach', 'overreaching', 'over reaching',
      'three points contact', 'three point contact', '3 point contact', '3 points',
      'damaged ladder', 'ladder damaged', 'defective ladder', 'ladder defective',
      'broken ladder', 'ladder broken', 'bent ladder', 'ladder bent',
      'missing rung', 'rung missing', 'broken rung', 'rung broken', 'rung damaged',
      'ladder inspection', 'ladder uninspected', 'ladder not inspected',
      'ladder stile', 'stile damage', 'stile bent', 'ladder spreader',
      'spreader bar', 'ladder feet worn', 'anti-slip', 'ladder tie', 'ladder secured'
    ],
    'Guardrail/edge gap': [
      // Core terms
      'guardrail', 'guardrails', 'guard rail', 'guard rails', 'guard-rail',
      // Misspellings
      'gaurd rail', 'gaurdrail', 'guardrails', 'guardriale', 'guadrail', 'guarrail',
      // Types
      'handrail', 'handrails', 'hand rail', 'hand rails', 'hand-rail',
      'mid rail', 'midrail', 'mid-rail', 'middle rail', 'knee rail',
      'top rail', 'toprail', 'top-rail', 'upper rail',
      'edge protection', 'edge-protection', 'perimeter protection', 'fall protection',
      'temporary guardrail', 'permanent guardrail', 'removable guardrail',
      'mesh guardrail', 'panel guardrail', 'tube guardrail', 'wire guardrail',
      // Issues
      'unguarded edge', 'edge unguarded', 'open edge', 'exposed edge',
      'guardrail missing', 'missing guardrail', 'no guardrail', 'guardrail absent',
      'guardrail damaged', 'damaged guardrail', 'guardrail bent', 'guardrail broken',
      'guardrail gap', 'gap in guardrail', 'guardrail opening', 'guardrail hole',
      'edge unprotected', 'unprotected edge', 'leading edge', 'roof edge',
      'floor edge', 'platform edge', 'stairway edge', 'ramp edge', 'mezzanine edge',
      'guardrail loose', 'guardrail wobbly', 'guardrail unstable', 'guardrail inadequate',
      'guardrail height', 'guardrail too low', 'guardrail insufficient',
      'guardrail removed', 'guardrail not installed', 'guardrail not replaced'
    ],
    'Safety net missing': [
      // Core terms
      'safety net', 'safety nets', 'safetynet', 'safety-net',
      // Misspellings
      'saftey net', 'safty net', 'safetey net', 'saftey nett',
      // Types
      'catch net', 'catch nets', 'debris net', 'debris nets', 'fall net', 'fall nets',
      'personnel net', 'construction net', 'scaffold net', 'edge net',
      'horizontal net', 'vertical net', 'system net', 'fan net',
      // Issues
      'net missing', 'missing net', 'no safety net', 'no net', 'net absent',
      'net inadequate', 'inadequate net', 'net damaged', 'damaged net',
      'net hole', 'hole in net', 'net torn', 'torn net', 'net gap',
      'net not installed', 'net removed', 'net inspection', 'net overdue',
      'net sagging', 'sagging net', 'net loose', 'loose net', 'net unsecured',
      'border rope', 'tie rope', 'net attachment', 'attachment point'
    ],
    'Anchor point issue': [
      // Core terms
      'anchor', 'anchors', 'anchorage', 'anchorages', 'anchor point', 'anchor points',
      // Misspellings
      'ancher', 'anchour', 'ancor', 'ankor', 'anchorpoint', 'anchorage point',
      // Types
      'tie off', 'tie-off', 'tieoff', 'tie off point', 'attachment point',
      'fall arrest anchor', 'personal anchor', 'temporary anchor', 'permanent anchor',
      'roof anchor', 'beam anchor', 'concrete anchor', 'structural anchor',
      'engineered anchor', 'certified anchor', 'mobile anchor', 'trolley anchor',
      'horizontal lifeline', 'vertical lifeline', 'static line', 'inertia reel',
      // Issues
      'anchor inadequate', 'inadequate anchor', 'anchor weak', 'weak anchor',
      'no anchor', 'anchor missing', 'missing anchor', 'anchor absent',
      'anchor not tested', 'untested anchor', 'anchor uncertified', 'anchor expired',
      'lanyard anchor', 'anchor capacity', 'anchor strength', 'anchor load',
      'anchor location', 'anchor height', 'anchor too low', 'anchor overhead',
      'anchor damaged', 'damaged anchor', 'anchor corroded', 'corroded anchor',
      'anchor loose', 'loose anchor', 'anchor unstable', 'anchor failure',
      'anchor inspection', 'anchor not inspected', 'anchor overdue'
    ],
    'Opening unprotected': [
      // Core terms
      'opening', 'openings', 'floor opening', 'floor openings',
      // Misspellings
      'opning', 'openning', 'oppening', 'openiing', 'opeining',
      // Types
      'hole', 'holes', 'floor hole', 'roof hole', 'wall opening', 'slab opening',
      'penetration', 'penetrations', 'pipe penetration', 'duct penetration',
      'shaft', 'shafts', 'elevator shaft', 'lift shaft', 'stairwell shaft',
      'void', 'voids', 'floor void', 'service void', 'atrium void',
      'skylight', 'skylights', 'roof light', 'roof hatch', 'access hatch',
      'manhole', 'manholes', 'inspection opening', 'service opening',
      // Issues
      'unprotected opening', 'opening unprotected', 'uncovered opening', 'open hole',
      'uncovered hole', 'hole uncovered', 'opening exposed', 'exposed opening',
      'opening cover', 'hole cover', 'cover missing', 'missing cover', 'no cover',
      'cover inadequate', 'cover damaged', 'cover loose', 'cover unsecured',
      'opening barrier', 'barrier missing', 'guardrail missing', 'fall hazard',
      'fall through', 'step through', 'walk into', 'trip hazard'
    ]
  },

  'Lifting': {
    'Rigging deficiency': [
      // Core terms
      'rigging', 'rigged', 'rigger', 'riggers', 'rig', 'rigs',
      // Misspellings
      'riging', 'riggng', 'riging', 'riggin', 'riggger', 'riggging',
      // Slings
      'sling', 'slings', 'slinging', 'slinged', 'round sling', 'flat sling',
      'web sling', 'webbing sling', 'chain sling', 'wire sling', 'rope sling',
      'synthetic sling', 'nylon sling', 'polyester sling', 'endless sling',
      'sling leg', 'sling legs', 'multi-leg sling', 'single leg sling',
      // Shackles
      'shackle', 'shackles', 'shackled', 'bow shackle', 'd-shackle', 'dee shackle',
      'anchor shackle', 'chain shackle', 'screw pin', 'bolt type',
      // Hooks
      'hook', 'hooks', 'hooked', 'hooking', 'crane hook', 'safety hook',
      'swivel hook', 'grab hook', 'slip hook', 'eye hook', 'sorting hook',
      'hook latch', 'latch missing', 'latch broken', 'latch open',
      // Other hardware
      'lifting gear', 'lifting equipment', 'lifting tackle', 'below the hook',
      'chain', 'chains', 'chained', 'grade 80', 'grade 100', 'alloy chain',
      'wire rope', 'wire ropes', 'cable', 'steel cable', 'wire cable',
      'webbing', 'webbings', 'turnbuckle', 'turnbuckles', 'eye bolt', 'eyebolt',
      'master link', 'connecting link', 'swivel', 'swivels', 'thimble', 'thimbles',
      'load binder', 'lever hoist', 'chain block', 'come along', 'grip',
      // Issues
      'rigging defect', 'defective rigging', 'rigging damaged', 'damaged rigging',
      'sling damage', 'damaged sling', 'sling cut', 'sling worn', 'sling frayed',
      'rigging inspection', 'rigging uninspected', 'rigging not inspected',
      'rigging overdue', 'color code', 'colour code', 'inspection tag',
      'swl exceeded', 'wll exceeded', 'rated capacity', 'capacity exceeded',
      'rigging inadequate', 'improper rigging', 'wrong rigging', 'incorrect rigging'
    ],
    'Lift plan inadequate': [
      // Core terms
      'lift plan', 'lifting plan', 'lift plans', 'lifting plans',
      // Misspellings
      'liftplan', 'lift plann', 'lifing plan', 'lift paln', 'lift pln',
      // Types
      'method statement', 'method statements', 'lift method', 'lifting method',
      'lift study', 'lifting study', 'lift procedure', 'lifting procedure',
      'lift assessment', 'lifting assessment', 'lift risk assessment',
      'critical lift', 'critical lift plan', 'tandem lift', 'tandem lift plan',
      'engineered lift', 'complex lift', 'non-routine lift', 'heavy lift',
      'crane lift plan', 'rigging plan', 'load plan', 'pick plan',
      // Issues
      'no plan', 'no lift plan', 'plan missing', 'missing plan', 'without plan',
      'plan inadequate', 'inadequate plan', 'plan incomplete', 'incomplete plan',
      'plan not followed', 'deviated from plan', 'plan not approved',
      'plan outdated', 'plan not reviewed', 'plan not signed',
      'radius', 'boom length', 'load weight', 'load chart', 'configuration',
      'ground conditions', 'outrigger setup', 'wind speed', 'weather conditions'
    ],
    'Crane defect': [
      // Core terms
      'crane', 'cranes', 'craned', 'craning',
      // Misspellings
      'crain', 'craine', 'craen', 'cran', 'cranee',
      // Types
      'tower crane', 'tower cranes', 'mobile crane', 'mobile cranes',
      'crawler crane', 'crawler cranes', 'rough terrain', 'all terrain',
      'truck crane', 'truck mounted', 'carry deck', 'pick and carry',
      'overhead crane', 'gantry crane', 'portal crane', 'jib crane',
      'hammerhead crane', 'luffing crane', 'derrick crane', 'hoist',
      'hoists', 'chain hoist', 'electric hoist', 'manual hoist',
      'liebherr', 'tadano', 'grove', 'terex', 'kobelco', 'potain',
      // Issues
      'crane defect', 'defective crane', 'crane defective', 'crane damage',
      'crane damaged', 'crane malfunction', 'crane malfunctioning',
      'crane inspection', 'crane uninspected', 'crane not inspected',
      'crane overload', 'crane overloaded', 'overloading crane',
      'lmi', 'load moment indicator', 'lmi bypass', 'lmi disabled',
      'anti two block', 'two block', 'atb', 'limit switch',
      'crane certificate', 'crane certification', 'crane expired',
      'crane operator', 'operator error', 'operator competency',
      'boom', 'jib', 'counterweight', 'outrigger', 'stabilizer',
      'slew', 'slewing', 'hoist rope', 'pendant', 'wire rope'
    ],
    'Tag line missing': [
      // Core terms
      'tag line', 'tagline', 'tag lines', 'taglines', 'tag-line',
      // Misspellings
      'taglin', 'tag lin', 'tage line', 'taglien', 'tag lien',
      // Types
      'guide rope', 'guide ropes', 'tag rope', 'tag ropes', 'guide line',
      'control line', 'control rope', 'steadying line', 'restraint line',
      'snub line', 'drift line', 'trail line',
      // Issues
      'no tag line', 'no tagline', 'tag line missing', 'missing tag line',
      'tagline absent', 'tagline not used', 'without tag line', 'lacks tag line',
      'load control', 'load uncontrolled', 'load swing', 'swinging load',
      'load spinning', 'load rotation', 'load drift', 'drifting load',
      'load not controlled', 'uncontrolled load', 'free swinging',
      'tag line length', 'tag line too short', 'tag line inadequate'
    ],
    'Overload': [
      // Core terms
      'overload', 'overloads', 'overloaded', 'overloading', 'over load',
      // Misspellings
      'overlaod', 'overlaoded', 'overlod', 'overloard', 'over loaded',
      // Capacity terms
      'over capacity', 'overcapacity', 'exceeded capacity', 'capacity exceeded',
      'swl', 's.w.l', 'safe working load', 'wll', 'w.l.l', 'working load limit',
      'rated capacity', 'maximum capacity', 'max capacity', 'load rating',
      'weight exceeded', 'exceeds weight', 'too heavy', 'excess weight',
      'load limit', 'limit exceeded', 'above limit', 'over limit',
      // Load chart
      'load chart', 'load charts', 'capacity chart', 'crane chart',
      'radius', 'boom radius', 'working radius', 'lift radius',
      'boom angle', 'boom length', 'configuration', 'setup',
      // Issues
      'crane overload', 'hoist overload', 'sling overload', 'rigging overload',
      'structural overload', 'platform overload', 'scaffold overload',
      'weight limit', 'load exceeded', 'grossly overloaded', 'severely overloaded'
    ],
    'Load shifting': [
      // Core terms
      'load shift', 'load shifting', 'shifting load', 'load shifted',
      // Misspellings
      'load shifte', 'laod shift', 'load shfit', 'laod shifting',
      // Movement
      'load unsecured', 'unsecured load', 'load unstable', 'unstable load',
      'load loose', 'loose load', 'load movement', 'moving load',
      'load swing', 'swinging load', 'load spin', 'spinning load',
      'load tilt', 'tilting load', 'load tip', 'tipping load',
      // Balance
      'unbalanced load', 'load unbalanced', 'off balance', 'imbalanced',
      'center of gravity', 'centre of gravity', 'cog', 'c.o.g',
      'pick point', 'pick points', 'lift point', 'lift points',
      'balance point', 'balance issue', 'weight distribution',
      // Issues
      'load slipped', 'slipped load', 'load dropped', 'dropped load',
      'load fell', 'falling load', 'load failure', 'rigging failure',
      'inadequate securing', 'securing inadequate', 'improperly secured'
    ]
  },

  'Confined Spaces': {
    'Atmospheric hazard': [
      // Core terms
      'atmospheric', 'atmospherics', 'atmosphere', 'atmospheres', 'atmo',
      // Misspellings
      'atmosferic', 'atmosphric', 'atmopheric', 'atmospher', 'atmosphear',
      // Gas testing
      'gas test', 'gas tests', 'gas testing', 'gas tested', 'gas tester',
      'gas detection', 'gas detector', 'gas detectors', 'gas monitoring',
      'gas monitor', 'gas monitors', 'continuous monitoring', 'bump test',
      'calibration', 'calibrated', 'four gas', '4 gas', 'multi gas', 'single gas',
      // Oxygen
      'oxygen', 'o2', 'oxygen level', 'oxygen deficient', 'oxygen enriched',
      'low oxygen', 'high oxygen', 'hypoxia', 'asphyxiation', 'asphyxiant',
      'oxygen depletion', 'oxygen concentration', '19.5%', '23.5%',
      // Toxic gases
      'toxic gas', 'toxic gases', 'toxic atmosphere', 'toxic fumes',
      'h2s', 'hydrogen sulfide', 'hydrogen sulphide', 'sour gas',
      'co', 'carbon monoxide', 'carbon dioxide', 'co2', 'methane', 'ch4',
      'ammonia', 'nh3', 'chlorine', 'cl2', 'so2', 'sulfur dioxide',
      'nitrogen', 'n2', 'argon', 'inert gas', 'inert atmosphere',
      // Explosive
      'lel', 'l.e.l', 'lower explosive limit', 'uel', 'upper explosive limit',
      'flammable atmosphere', 'explosive atmosphere', 'combustible gas',
      '%lel', 'percent lel', 'explosive range', 'flash point',
      // Issues
      'gas alarm', 'alarm activation', 'high reading', 'abnormal reading',
      'test not done', 'test overdue', 'continuous testing', 'pre-entry test'
    ],
    'Rescue plan missing': [
      // Core terms
      'rescue plan', 'rescue plans', 'rescue', 'rescuer', 'rescuers',
      // Misspellings
      'resuce plan', 'resque plan', 'recue plan', 'rescue pln', 'resue plan',
      // Equipment
      'rescue equipment', 'rescue gear', 'rescue team', 'rescue standby',
      'emergency rescue', 'rescue capability', 'rescue provisions',
      'tripod', 'tripods', 'rescue tripod', 'entry tripod',
      'davit', 'davits', 'davit arm', 'davit base',
      'retrieval system', 'retrieval systems', 'retrieval line', 'retrieval device',
      'rescue winch', 'winch', 'man riding winch', 'fall arrest winch',
      'breathing apparatus', 'ba', 'scba', 'escape set', 'emergency breathing',
      'stretcher', 'basket stretcher', 'rescue basket', 'spine board',
      // Procedure
      'rescue procedure', 'rescue procedures', 'self rescue', 'self-rescue',
      'emergency procedure', 'evacuation procedure', 'entry procedure',
      // Issues
      'no rescue plan', 'rescue plan missing', 'missing rescue plan',
      'rescue plan inadequate', 'inadequate rescue', 'no rescue equipment',
      'rescue equipment missing', 'rescue team not available', 'no standby'
    ],
    'Attendant absent': [
      // Core terms
      'attendant', 'attendants', 'attend', 'attended', 'attending',
      // Misspellings
      'attendent', 'attendnet', 'attendat', 'atendant', 'attendand',
      // Roles
      'hole watch', 'holewatch', 'hole watcher', 'top man', 'topman',
      'entry attendant', 'confined space attendant', 'csa',
      'standby person', 'standby man', 'standby', 'stand-by',
      'watchman', 'watch man', 'safety watch', 'safety watcher',
      'entry supervisor', 'entry controller', 'permit holder',
      'outside attendant', 'exterior attendant',
      // Issues
      'no attendant', 'attendant absent', 'attendant missing', 'missing attendant',
      'attendant not present', 'attendant left', 'unattended entry',
      'attendant distracted', 'attendant away', 'no one watching',
      'lone entry', 'solo entry', 'entered alone', 'working alone'
    ],
    'Ventilation inadequate': [
      // Core terms
      'ventilation', 'ventilate', 'ventilated', 'ventilating', 'vent',
      // Misspellings
      'ventilaton', 'ventillation', 'ventilaiton', 'ventialtion', 'ventlation',
      // Types
      'forced air', 'forced ventilation', 'mechanical ventilation',
      'natural ventilation', 'continuous ventilation', 'local ventilation',
      'blower', 'blowers', 'fan', 'fans', 'air mover', 'air movers',
      'ducting', 'ductwork', 'flexible duct', 'ventilation duct',
      'air supply', 'fresh air supply', 'supply air', 'inlet air',
      'exhaust', 'exhaust air', 'extraction', 'air extraction',
      // Issues
      'air circulation', 'poor circulation', 'stagnant air', 'dead air',
      'no ventilation', 'ventilation missing', 'missing ventilation',
      'inadequate ventilation', 'insufficient ventilation', 'poor ventilation',
      'ventilation failure', 'ventilation failed', 'fan not working',
      'fresh air', 'no fresh air', 'air quality', 'poor air quality',
      'air change', 'air changes', 'cfm', 'air flow', 'airflow'
    ],
    'Isolation failure': [
      // Core terms
      'isolation', 'isolate', 'isolated', 'isolating', 'isolator',
      // Misspellings
      'isolaton', 'isolaiton', 'isloation', 'isolatoin', 'isolatioin',
      // Methods
      'lockout', 'lock out', 'lock-out', 'loto', 'lototo',
      'tagout', 'tag out', 'tag-out', 'lockout tagout', 'lock out tag out',
      'energy isolation', 'electrical isolation', 'mechanical isolation',
      'process isolation', 'pipeline isolation', 'system isolation',
      'blind', 'blinds', 'blinding', 'spectacle blind', 'spade', 'paddle',
      'blank flange', 'blank flanges', 'blanking plate', 'blanked',
      'double block', 'double block and bleed', 'dbb', 'block and bleed',
      'valve isolation', 'valve closed', 'valve locked', 'valve tagged',
      // Issues
      'not isolated', 'isolation failure', 'isolation failed', 'failed isolation',
      'partial isolation', 'incomplete isolation', 'inadequate isolation',
      'isolation breached', 'isolation bypassed', 'isolation removed',
      'isolation not verified', 'zero energy', 'stored energy', 'residual energy'
    ]
  },

  'Energized System': {
    'LOTO not applied': [
      // Core terms
      'loto', 'l.o.t.o', 'lototo', 'lockout', 'lock out', 'lock-out',
      // Misspellings
      'loto', 'lockou', 'lok out', 'lockot', 'lock outt', 'lockouttag',
      // Tagout
      'tagout', 'tag out', 'tag-out', 'tagging', 'tagged',
      'lockout tagout', 'lock out tag out', 'lockout/tagout',
      // Energy isolation
      'energy isolation', 'energy control', 'hazardous energy',
      'control of hazardous energy', 'cohe', 'safe isolation',
      // Issues
      'no lockout', 'lockout missing', 'missing lockout', 'without lockout',
      'loto missing', 'loto not applied', 'loto not performed',
      'lock missing', 'no lock', 'tag missing', 'no tag',
      'isolation not applied', 'not isolated', 'live work',
      'stored energy', 'residual energy', 'potential energy',
      'capacitor', 'spring', 'gravity', 'hydraulic', 'pneumatic',
      'try out', 'try-out', 'verification', 'verification not done',
      'personal lock', 'group lock', 'lock box', 'hasp', 'multi lock'
    ],
    'Live exposure': [
      // Core terms
      'live', 'energized', 'energised', 'powered', 'active',
      // Misspellings
      'enrgized', 'energzed', 'energied', 'energiezd', 'engerized',
      // Work types
      'live work', 'live working', 'working live', 'hot work',
      'live line', 'live line work', 'barehand', 'bare hand',
      // Exposure
      'live conductor', 'live wire', 'live wires', 'live circuit',
      'live parts', 'live components', 'exposed live', 'live exposed',
      'electrical exposure', 'contact with live', 'touch live',
      // Hazards
      'shock hazard', 'electric shock', 'electrical shock', 'electrocution',
      'arc flash', 'arc blast', 'arc hazard', 'flash hazard',
      'arc rated', 'arc flash boundary', 'incident energy',
      'voltage', 'high voltage', 'hv', 'low voltage', 'lv', 'medium voltage', 'mv',
      'current', 'amperage', 'amps', 'danger of death', 'fatal'
    ],
    'Exposed conductor': [
      // Core terms
      'exposed wire', 'exposed wires', 'exposed conductor', 'exposed conductors',
      // Misspellings
      'exposd wire', 'exposed wier', 'exopsed', 'expossed', 'expoed conductor',
      // Types
      'bare wire', 'bare wires', 'bare conductor', 'naked wire',
      'uninsulated', 'uninsulated wire', 'uninsulated conductor',
      'stripped wire', 'stripped conductor', 'wire stripping',
      // Cable issues
      'damaged cable', 'cable damage', 'cable damaged', 'damaged cord',
      'insulation damage', 'insulation damaged', 'damaged insulation',
      'insulation cut', 'insulation torn', 'insulation worn',
      'frayed wire', 'frayed cable', 'frayed cord', 'fraying',
      'conductor exposed', 'copper exposed', 'wire showing',
      'cable sheath', 'outer sheath', 'inner insulation',
      'pinched cable', 'crushed cable', 'burnt cable', 'melted insulation',
      'cable deterioration', 'cable degradation', 'cable aging'
    ],
    'Panel/enclosure open': [
      // Core terms
      'panel open', 'panel opened', 'open panel', 'enclosure open',
      // Misspellings
      'pannel open', 'panal open', 'pnel open', 'encloser open', 'enlosure open',
      // Types
      'switchboard', 'switchboards', 'distribution board', 'db',
      'mcc', 'motor control center', 'motor control centre',
      'electrical panel', 'panel board', 'panelboard', 'breaker panel',
      'junction box', 'j-box', 'jb', 'pull box', 'terminal box',
      'control panel', 'control cabinet', 'electrical enclosure',
      'transformer', 'transformer enclosure', 'substation',
      'vfd', 'variable frequency drive', 'starter', 'motor starter',
      // Issues
      'panel cover', 'panel door', 'cover missing', 'door missing',
      'cover open', 'door open', 'cover removed', 'door removed',
      'enclosure unsecured', 'panel unsecured', 'not closed', 'left open',
      'knockout missing', 'knockout open', 'cable entry', 'gland missing',
      'dead front', 'live front', 'finger safe', 'ip rating'
    ],
    'Grounding fault': [
      // Core terms
      'ground', 'grounding', 'grounded', 'grounds',
      'earth', 'earthing', 'earthed', 'earths',
      // Misspellings
      'grouding', 'grouning', 'gronduing', 'earthign', 'eathing', 'erth',
      // Types
      'ground fault', 'earth fault', 'ground-fault', 'earth-fault',
      'gfci', 'gfi', 'rcd', 'residual current', 'elcb', 'rcbo',
      'equipment grounding', 'system grounding', 'protective earth',
      'ground connection', 'earth connection', 'ground wire', 'earth wire',
      'bonding', 'bonded', 'equipotential', 'equipotential bonding',
      'grounding conductor', 'earth conductor', 'ground cable', 'earth cable',
      'ground rod', 'earth rod', 'ground electrode', 'earth electrode',
      // Issues
      'grounding missing', 'no ground', 'no grounding', 'ground missing',
      'earthing missing', 'no earth', 'no earthing', 'earth missing',
      'ground disconnected', 'earth disconnected', 'ground broken',
      'inadequate grounding', 'insufficient earthing', 'poor ground',
      'ground continuity', 'earth continuity', 'ground resistance', 'earth loop'
    ]
  },

  'Hot Work': {
    'Fire watch absent': [
      // Core terms
      'fire watch', 'firewatch', 'fire-watch', 'fire watcher', 'fire watchers',
      // Misspellings
      'fier watch', 'fire wach', 'fire wtach', 'firewtch', 'firewatcher',
      // Types
      'fire patrol', 'fire patrolman', 'hot work watch', 'hot work watcher',
      'spark watch', 'spark watcher', 'watch person', 'watchman',
      'fire safety watch', 'fire guard', 'fire sentry', 'fire duty',
      // Timing
      'fire watch during', 'fire watch after', 'post-weld watch',
      '30 minute watch', '60 minute watch', 'continuous watch',
      // Issues
      'no fire watch', 'fire watch absent', 'fire watch missing',
      'missing fire watch', 'without fire watch', 'fire watch not present',
      'fire watch left', 'fire watch departed', 'abandoned fire watch',
      'fire watch inadequate', 'insufficient fire watch'
    ],
    'Welding screen missing': [
      // Core terms
      'welding screen', 'weld screen', 'welding screens', 'weld screens',
      // Misspellings
      'weding screen', 'weldin screen', 'weld screan', 'welding scren',
      // Types
      'flash screen', 'flash screens', 'welding curtain', 'welding curtains',
      'flash curtain', 'flash curtains', 'weld shield', 'welding shield',
      'spatter screen', 'spatter curtain', 'protective screen', 'spark screen',
      'welding blanket', 'fire blanket', 'welding mat', 'fire mat',
      // Issues
      'screen missing', 'missing screen', 'no screen', 'screen absent',
      'curtain missing', 'missing curtain', 'no curtain', 'shield missing',
      'screen not installed', 'screen removed', 'screen inadequate',
      'screen damaged', 'screen hole', 'screen torn', 'screen gap'
    ],
    'Spark escape': [
      // Core terms
      'spark', 'sparks', 'sparking', 'sparked',
      // Misspellings
      'sparks', 'sprk', 'sparkes', 'sparkz', 'spatk',
      // Types
      'spatter', 'spatters', 'spattered', 'spattering', 'weld spatter',
      'slag', 'slags', 'hot slag', 'flying slag', 'molten slag',
      'molten metal', 'molten', 'hot metal', 'burning metal',
      'grinding sparks', 'cutting sparks', 'welding sparks',
      // Issues
      'spark containment', 'spark control', 'spark escape', 'spark escaped',
      'flying sparks', 'sparks flying', 'sparks escaping', 'loose sparks',
      'uncontained sparks', 'spark spread', 'spark travel', 'spark drift',
      'hot particle', 'hot particles', 'incandescent', 'ember', 'embers',
      'spark ignition', 'spark fire', 'spark started fire'
    ],
    'Cylinder unsecured': [
      // Core terms
      'cylinder', 'cylinders', 'gas cylinder', 'gas cylinders',
      // Misspellings
      'cylindar', 'cylander', 'cilinder', 'cylindr', 'cylindre', 'clinder',
      // Types
      'bottle', 'bottles', 'gas bottle', 'gas bottles',
      'oxygen cylinder', 'oxygen bottle', 'o2 cylinder', 'o2 bottle',
      'acetylene', 'acetylene cylinder', 'acetylene bottle', 'c2h2',
      'propane', 'propane cylinder', 'lpg', 'lpg cylinder',
      'argon', 'argon cylinder', 'co2 cylinder', 'nitrogen cylinder',
      'shielding gas', 'fuel gas', 'inert gas cylinder',
      // Security
      'cylinder unsecured', 'unsecured cylinder', 'cylinder loose',
      'cylinder not chained', 'unchained', 'cylinder not secured',
      'cylinder not strapped', 'cylinder fallen', 'cylinder tipped',
      'cylinder storage', 'cylinder stand', 'cylinder trolley', 'cylinder cart',
      'cylinder handling', 'cylinder transport', 'cylinder moving',
      // Components
      'regulator', 'regulators', 'pressure regulator', 'flow regulator',
      'flashback arrestor', 'flashback arrestors', 'flash arrestor',
      'check valve', 'hose', 'hoses', 'gas hose', 'twin hose',
      'valve', 'cylinder valve', 'valve cap', 'cap missing'
    ],
    'Combustible nearby': [
      // Core terms
      'combustible', 'combustibles', 'flammable', 'flammables',
      // Misspellings
      'combustable', 'combusible', 'flamable', 'flameable', 'flamible',
      // Materials
      'flammable material', 'flammable materials', 'combustible material',
      'combustible materials', 'flammable substance', 'combustible substance',
      'fuel', 'fuels', 'petrol', 'gasoline', 'diesel', 'kerosene',
      'solvent', 'solvents', 'thinner', 'thinners', 'acetone',
      'paint', 'paints', 'lacquer', 'varnish', 'coating', 'coatings',
      'oil', 'oils', 'grease', 'lubricant', 'lubricants',
      'wood', 'wooden', 'timber', 'lumber', 'plywood', 'mdf', 'osb',
      'cardboard', 'paper', 'papers', 'packaging', 'pallet', 'pallets',
      'plastic', 'plastics', 'foam', 'insulation', 'polystyrene',
      'rags', 'oily rags', 'cloth', 'fabric', 'textile',
      // Proximity
      'combustible nearby', 'flammable nearby', 'near combustible',
      'near flammable', 'close to', 'adjacent to', 'in proximity',
      'fire load', 'fuel load', 'clearance', 'safe distance',
      '35 feet', '35 foot', '11 meters', '11 metres', 'hot work radius'
    ]
  },

  'Fire': {
    'Extinguisher missing/expired': [
      // Core terms
      'extinguisher', 'extinguishers', 'fire extinguisher', 'fire extinguishers',
      // Misspellings
      'extingusher', 'extinghisher', 'extinguiser', 'extingisher', 'extingiusher',
      'extinguishr', 'extiguisher', 'extingisher', 'fire extinghisher',
      // Types
      'abc extinguisher', 'co2 extinguisher', 'water extinguisher',
      'foam extinguisher', 'powder extinguisher', 'wet chemical',
      'class a', 'class b', 'class c', 'class d', 'class k',
      // Issues
      'extinguisher missing', 'missing extinguisher', 'no extinguisher',
      'extinguisher expired', 'expired extinguisher', 'extinguisher out of date',
      'extinguisher overdue', 'extinguisher inspection', 'extinguisher service',
      'fire fighting equipment', 'firefighting equipment',
      'extinguisher empty', 'extinguisher discharged', 'extinguisher used',
      'extinguisher damaged', 'extinguisher tampered', 'seal broken',
      'pressure low', 'gauge red', 'pin missing', 'nozzle missing',
      'extinguisher obstructed', 'extinguisher blocked', 'not accessible'
    ],
    'Exit blocked': [
      // Core terms
      'exit blocked', 'blocked exit', 'exit obstruction', 'exit obstructed',
      // Misspellings
      'exti blocked', 'exit bloked', 'exit block', 'exitblocked', 'blockd exit',
      // Types
      'emergency exit', 'fire exit', 'escape exit', 'egress',
      'escape route', 'escape routes', 'evacuation route', 'evacuation routes',
      'exit door', 'exit doors', 'fire door', 'fire doors',
      'means of escape', 'means of egress', 'escape path', 'escape paths',
      'stairway', 'stairwell', 'fire stair', 'emergency stair',
      'corridor', 'corridors', 'hallway', 'hallways', 'passageway',
      // Issues
      'egress blocked', 'blocked egress', 'route blocked', 'blocked route',
      'obstruction', 'obstructed', 'blocked', 'congested', 'impassable',
      'materials blocking', 'equipment blocking', 'storage blocking',
      'door locked', 'door stuck', 'door jammed', 'door blocked',
      'exit sign', 'exit sign missing', 'exit sign not lit', 'exit sign obscured'
    ],
    'Alarm failure': [
      // Core terms
      'fire alarm', 'fire alarms', 'alarm', 'alarms',
      // Misspellings
      'alram', 'alrm', 'alarrm', 'fier alarm', 'fire alram',
      // Types
      'smoke detector', 'smoke detectors', 'smoke alarm', 'smoke alarms',
      'heat detector', 'heat detectors', 'thermal detector',
      'flame detector', 'flame detectors', 'uv detector', 'ir detector',
      'manual call point', 'mcp', 'pull station', 'break glass',
      'fire detection', 'fire detection system', 'alarm system',
      'sounder', 'sounders', 'bell', 'bells', 'siren', 'sirens',
      'strobe', 'strobes', 'beacon', 'beacons', 'visual alarm',
      'annunciator', 'fire panel', 'control panel',
      // Issues
      'alarm failure', 'alarm failed', 'alarm not working', 'alarm faulty',
      'alarm disabled', 'alarm silenced', 'alarm isolated', 'alarm bypassed',
      'detector', 'detector faulty', 'detector covered', 'detector dirty',
      'detector missing', 'detector damaged', 'detector obstructed',
      'false alarm', 'nuisance alarm', 'unwanted alarm', 'test overdue'
    ],
    'Ignition source': [
      // Core terms
      'ignition', 'ignitions', 'ignited', 'igniting', 'ignite',
      // Misspellings
      'igntion', 'igniton', 'ignission', 'ingnition', 'ignishon',
      // Sources
      'ignition source', 'ignition sources', 'source of ignition',
      'spark source', 'spark', 'sparks', 'sparking', 'electrical spark',
      'hot surface', 'hot surfaces', 'hot work', 'heat source', 'heat sources',
      'naked flame', 'open flame', 'open fire', 'flame', 'flames',
      'pilot light', 'pilot flame', 'burner', 'burners', 'torch',
      'lighter', 'matches', 'match', 'smoking', 'cigarette', 'smoke',
      // Electrical
      'electrical ignition', 'electrical spark', 'arc', 'arcing',
      'short circuit', 'electrical fault', 'overheated', 'overheating',
      'static', 'static electricity', 'static discharge', 'esd',
      // Other sources
      'friction', 'impact spark', 'mechanical spark', 'exhaust',
      'engine', 'motor', 'heater', 'heating element', 'light bulb'
    ],
    'Fire door propped': [
      // Core terms
      'fire door', 'fire doors', 'firedoor', 'fire-door',
      // Misspellings
      'fier door', 'fire dor', 'fire dorr', 'firedorr', 'fire doar',
      // Actions
      'fire door propped', 'door propped', 'propped open', 'propped door',
      'fire door open', 'fire door left open', 'fire door ajar',
      'fire door wedged', 'wedged open', 'door wedge', 'doorstop',
      'fire door held', 'held open', 'fire door tied', 'tied back',
      // Components
      'door closer', 'self closing', 'automatic closer', 'closer failed',
      'closer missing', 'closer disabled', 'closer bypassed',
      'intumescent', 'intumescent strip', 'smoke seal', 'seal damaged',
      // Fire safety
      'fire separation', 'fire compartment', 'compartmentation',
      'fire rating', 'fire rated', '30 minute', '60 minute', '90 minute',
      'fire barrier', 'fire stop', 'fire stopping', 'breach'
    ]
  },

  'Mobile Plant & Equipment': {
    'Banksman/Flagman absent': [
      // Core terms
      'banksman', 'banksmen', 'banks man', 'banks-man', 'bankswoman',
      // Misspellings
      'bankman', 'bankmans', 'banksmn', 'bansman', 'banksmen', 'bacnksman',
      // Alternative roles
      'spotter', 'spotters', 'spot man', 'no spotter', 'spotter absent',
      'signaller', 'signallers', 'signaler', 'signalers', 'signal man',
      'signalman', 'signalmen', 'signalperson',
      'guide', 'guides', 'guiding', 'guided', 'no guide', 'guide absent',
      'flagman', 'flagmen', 'flag man', 'flagger', 'flaggers', 'flagman missing',
      'no flagman', 'flagman absent', 'without flagman', 'missing flagman',
      'traffic marshal', 'traffic controller', 'traffic management',
      'ground traffic controller', 'gtc',
      // Issues
      'no banksman', 'banksman absent', 'banksman missing', 'missing banksman',
      'without banksman', 'banksman not present', 'banksman left',
      'reversing without', 'unsupervised reversing', 'unguided',
      'no signals', 'signals not used', 'hand signals', 'radio communication'
    ],
    'Man-Machine Interface': [
      // Core terms - highly specific
      'man machine interface', 'man-machine interface', 'mmi', 'm-m-i',
      'man machine', 'man-machine', 'mepi', 'm.e.p.i',
      'man and machine interface', 'man & machine interface',
      // NEOM specific
      'no boots on ground', 'boots on ground', 'no boots on the ground',
      'boots on the ground policy', 'boots on ground policy',
      // Proximity issues
      'too close to equipment', 'close proximity to equipment', 'near equipment',
      'close to moving', 'near moving equipment', 'working close to',
      'standing close to', 'walking close to', 'close to excavator',
      'close to loader', 'close to plant', 'close to machine',
      'within the swing', 'swing radius', 'operating area',
      // Worker position issues
      'workers in red zone', 'red zone', 'in the line of fire', 'line of fire',
      'struck by hazard', 'struck-by', 'hit by', 'struck by',
      'workers very close', 'operative very close', 'person near',
      'personnel near', 'standing behind', 'walking behind',
      'behind the truck', 'behind equipment', 'behind the excavator',
      'in front of equipment', 'in front of excavator',
      // Interface violations
      'interface violation', 'interface observed', 'interface issue',
      'plant and people interface', 'people interface', 'plant interface',
      'worker interface', 'poor plant and people', 'poor interface',
      // Separator issues
      'no separation', 'no segregation', 'without separation',
      'workers and equipment', 'people and machines'
    ],
    'VVS/NEOM Inspection': [
      // VVS system - primary identifiers
      'vvs', 'v.v.s', 'vehicle verification system', 'neom vvs',
      'vvs inspection', 'vvs system', 'vvs status', 'vvs application',
      'under neom vvs', 'in neom vvs', 'on vvs',
      // NEOM Veri-Fi - primary identifiers
      'veri-fi', 'verifi', 'veri fi', 'veri-fy', 'verif-fi',
      'neom veri-fi', 'neom verifi', 'neom veri fi', 'neom veri-fy',
      'veri-fi inspection', 'verifi inspection', 'veri fi inspection',
      'veri-fi status', 'verifi status', 'veri fi status',
      'neom verification', 'neom verified',
      // QR Code - equipment specific
      'qr code', 'qrcode', 'qr-code', 'q.r code', 'qr sticker',
      'no qr code', 'without qr code', 'qr code missing', 'missing qr code',
      'qr code red', 'red qr code', 'qr code status', 'qr code expired',
      'neom qr code', 'neom qr', 'does not have qr', 'does not have neom qr',
      'without neom qr', 'no neom qr',
      // Status issues - with context
      'red status', 'access denied', 'red category', 'denied status',
      'expired veri-fi', 'expired verifi', 'overdue veri-fi',
      'green status', 'amber status',
      // NEOM inspection - equipment specific
      'neom inspection', 'neom sticker', 'neom inspection sticker',
      'without neom inspection', 'no neom inspection', 'neom inspection missing',
      'neom inspection expired', 'neom plant inspection',
      'neom vehicle inspection', 'neom equipment inspection',
      'not inspected by neom', 'not subjected to neom',
      'without being subjected to neom', 'not underwent veri-fi'
    ],
    'Equipment checklist missing': [
      // Daily checklist
      'daily checklist', 'daily inspection checklist', 'operator checklist',
      'daily check list', 'pre-use checklist', 'preuse checklist',
      'checklist missing', 'checklist not available', 'no checklist',
      'checklist unavailable', 'checklist not filled', 'checklist not updated',
      'incomplete checklist', 'checklist incomplete', 'checklist not done',
      // Inspection records
      'inspection checklist', 'check list', 'equipment checklist',
      'weekly inspection', 'monthly inspection', 'periodic inspection',
      'inspection record', 'maintenance record', 'service record',
      'no inspection record', 'record not available', 'records missing',
      // Specific equipment
      'excavator checklist', 'loader checklist', 'truck checklist',
      'jcb checklist', 'grader checklist', 'compactor checklist',
      'roller checklist', 'bulldozer checklist', 'plant checklist'
    ],
    'PWAS/Camera missing': [
      // PWAS system
      'pwas', 'p.w.a.s', 'proximity warning', 'proximity warning system',
      'proximity alert', 'proximity alarm', 'proximity detection',
      'pwas missing', 'pwas not installed', 'no pwas', 'without pwas',
      'pwas not working', 'pwas not functioning', 'pwas defective',
      // Cameras
      '360 camera', '360 degree camera', '360-degree', '360 degree',
      'camera missing', 'camera not installed', 'no camera',
      'rear camera', 'reversing camera', 'backup camera', 'side camera',
      'camera not working', 'camera defective', 'camera obscured',
      // Sensors
      'proximity sensor', 'sensor missing', 'detection system',
      'warning system', 'alert system', 'collision avoidance'
    ],
    'Operator license/TUV expired': [
      // SAG License
      'sag license', 'sag licence', 'sag driving license', 'sag driving licence',
      'no sag license', 'sag license missing', 'sag license expired',
      'without sag license', 'sag licence expired', 'sag expired',
      // TUV certification
      'tuv', 't.u.v', 'tuv certificate', 'tuv certification',
      'tuv expired', 'tuv missing', 'no tuv', 'expired tuv',
      'tuv not valid', 'tuv overdue', 'operator tuv',
      // KSA License
      'ksa license', 'ksa licence', 'ksa driving license', 'ksa driving licence',
      'without ksa', 'no ksa license', 'ksa license expired',
      // Operator license general
      'operator license', 'operator licence', 'driving license expired',
      'license expired', 'licence expired', 'expired license',
      'no driving license', 'without license', 'license missing',
      'unlicensed operator', 'unauthorized operator',
      // Freelancer
      'freelancer', 'freelance', 'freelance driver', 'freelancer driver',
      'freelance operator', 'not under company', 'not on ajeer',
      'ajeer', 'no ajeer', 'ajeer contract', 'ajeer missing'
    ],
    'TPC/Third party certification': [
      // TPC
      'tpc', 't.p.c', 'third party', 'third-party', '3rd party',
      'third party certificate', 'third party certification',
      'tpc expired', 'tpc missing', 'no tpc', 'tpc not available',
      'expired tpc', 'invalid tpc', 'tpc overdue',
      // Equipment certification
      'mvp certificate', 'mvp expired', 'equipment certificate',
      'valid certification', 'certification expired', 'certificate expired',
      'plant certification', 'equipment certification', 'vehicle certification',
      '3rd party inspection', 'third party inspection',
      // Registration
      'registration', 'vehicle registration', 'equipment registration',
      'no registration', 'registration missing', 'registration expired',
      'insurance', 'insurance expired', 'insurance copy', 'no insurance'
    ],
    'Beacon light issue': [
      // Beacon
      'beacon', 'beacons', 'beacon light', 'beacon lights',
      'amber beacon', 'amber light', 'flashing beacon', 'rotating beacon',
      'warning light', 'warning beacon', 'strobe', 'strobe light',
      // Issues
      'beacon missing', 'beacon not working', 'beacon off', 'beacon turned off',
      'no beacon', 'beacon light missing', 'beacon not functioning',
      'beacon defective', 'beacon broken', 'blinking light not working',
      'blinking lights not functioning', 'beacon not switched on'
    ],
    'Reverse alarm issue': [
      // Reverse alarm
      'reverse alarm', 'reversing alarm', 'backup alarm', 'back up alarm',
      'reverse horn', 'reversing horn', 'beeper', 'reverse beeper',
      'audible alarm', 'warning alarm', 'motion alarm',
      // Issues
      'no reverse alarm', 'reverse alarm missing', 'alarm not working',
      'alarm not functioning', 'alarm defective', 'alarm broken',
      'low audible', 'not audible', 'alarm not heard', 'horn missing',
      'horn not working', 'horn defective'
    ],
    'Wheel chock missing': [
      // Wheel chock
      'wheel chock', 'wheel chocks', 'wheel-chock', 'chock', 'chocks',
      'tyre chock', 'tire chock', 'wheel stopper', 'wheel block',
      // Issues
      'no wheel chock', 'wheel chock missing', 'chocks not used',
      'without wheel chock', 'chock not placed', 'chock missing',
      'wheel chock not in use', 'no chock', 'chocks not available',
      // Related
      'parked without chock', 'stopped without', 'stationary without'
    ],
    'Exclusion zone missing': [
      // Core terms
      'exclusion zone', 'exclusion zones', 'exclusion area', 'exclusion areas',
      // Misspellings
      'exlusion zone', 'excluson zone', 'eclusion zone', 'exculison zone',
      // Types
      'danger zone', 'danger zones', 'hazard zone', 'hazard area',
      'swing radius', 'swing zone', 'slew zone', 'tail swing', 'counterweight swing',
      'drop zone', 'drop area', 'lift zone', 'crane zone', 'working zone',
      'safety zone', 'keep out zone', 'restricted zone', 'no go zone',
      'operating radius', 'machine radius', 'equipment radius',
      // Issues
      'zone breach', 'breached zone', 'entered zone', 'in zone',
      'zone incursion', 'zone violation', 'inside zone', 'within zone',
      'no exclusion zone', 'zone not established', 'zone not marked',
      'zone inadequate', 'zone too small', 'zone barriers', 'zone demarcation',
      // Barriers
      'no barriers', 'no barricades', 'barricades missing', 'barriers missing',
      'without barricade', 'without barrier', 'not barricaded'
    ],
    'Operator seatbelt': [
      // Core terms
      'seatbelt', 'seatbelts', 'seat belt', 'seat belts', 'seat-belt',
      // Misspellings
      'seatblet', 'setbelt', 'seatbelt', 'seat blet', 'seatbel',
      // Issues
      'no seatbelt', 'seatbelt not worn', 'not wearing seatbelt',
      'unbuckled', 'unbuckled seatbelt', 'belt not worn', 'belt unbuckled',
      'seatbelt unfastened', 'unfastened', 'seatbelt off',
      'seatbelt defective', 'seatbelt broken', 'seatbelt damaged',
      'seatbelt not fastened', 'operator seatbelt', 'driver seatbelt',
      'operator not wearing', 'did not fasten'
    ],
    'Operator distraction': [
      // Phone use
      'phone', 'mobile phone', 'cell phone', 'using phone', 'on phone',
      'phone while operating', 'phone while driving', 'hand free', 'hands-free',
      'handsfree', 'using mobile', 'speaking on phone', 'talking on phone',
      // Headphones
      'headphone', 'headphones', 'earphone', 'earphones', 'ear phone',
      'earbuds', 'ear buds', 'wearing headphone', 'using headphone',
      'wearing earphone', 'headset', 'ear piece', 'earpiece',
      // Distraction
      'distracted', 'distraction', 'not paying attention', 'inattentive',
      'looking away', 'not focused', 'loss of attention'
    ],
    'Visibility obstruction': [
      // Core terms
      'blind spot', 'blind spots', 'blindspot', 'blindspots', 'blind-spot',
      // Visibility
      'blind area', 'blind areas', 'visibility', 'poor visibility',
      'cannot see', 'can not see', 'could not see', 'no visibility',
      'obstructed view', 'view obstructed', 'blocked view', 'view blocked',
      'limited visibility', 'restricted view', 'sight line', 'line of sight',
      'restricted vision', '360 degree visibility', 'clear view',
      // Windscreen issues
      'windscreen', 'windshield', 'wind screen', 'wind shield',
      'windscreen dirty', 'windscreen covered', 'curtain', 'curtain covered',
      'covered windscreen', 'obstructed windscreen', 'sticker on windscreen',
      'dirt on windscreen', 'dirty windscreen', 'blocked windscreen',
      // Equipment
      'mirror', 'mirrors', 'side mirror', 'rear mirror', 'wing mirror',
      'mirror missing', 'mirror broken', 'mirror dirty', 'mirror adjusted',
      'camera not working', 'camera obscured', 'camera dirty'
    ],
    'Equipment leakage': [
      // Oil leakage
      'oil leak', 'oil leakage', 'oil spill', 'oil spillage',
      'hydraulic leak', 'hydraulic leakage', 'fluid leak', 'fluid leakage',
      'leaking oil', 'leaking hydraulic', 'leaking fluid',
      // Fuel leakage
      'fuel leak', 'fuel leakage', 'diesel leak', 'diesel leakage',
      'fuel spill', 'fuel spillage', 'leaking fuel', 'leaking diesel',
      // General
      'leakage', 'leaking', 'leak observed', 'spill', 'spillage',
      'drip tray', 'chemical spill', 'spilled', 'oil on ground'
    ],
    'Equipment overloading': [
      // Overloading
      'overload', 'overloaded', 'overloading', 'over load', 'over-load',
      'excessive load', 'excess load', 'too much load',
      'exceeded capacity', 'capacity exceeded', 'over capacity',
      // Specific
      'truck overloaded', 'trailer overloaded', 'dump truck overloaded',
      'loaded beyond', 'beyond capacity', 'exceeding capacity'
    ],
    'Parking violation': [
      // Parking issues
      'parked', 'parking', 'undesignated area', 'undesignated parking',
      'not designated', 'designated area', 'designated parking',
      'improper parking', 'wrong parking', 'parking violation',
      'parked on road', 'parked on access', 'blocking road', 'blocking access',
      'obstructing', 'obstruction', 'parked randomly', 'randomly parked',
      // Specific
      'equipment parked', 'vehicle parked', 'truck parked',
      'not in designated', 'outside designated', 'parked in work area',
      'parked near', 'parked on slope'
    ],
    'Equipment emissions': [
      // Black smoke
      'black smoke', 'smoke', 'emitting smoke', 'emissions',
      'exhaust', 'exhaust smoke', 'diesel smoke', 'engine smoke',
      'excessive smoke', 'visible smoke', 'smoke from exhaust',
      'releasing smoke', 'smoke releasing', 'pollution'
    ],
    'Equipment age/condition': [
      // Age
      'older than 15', 'over 15 years', 'more than 15 years',
      'equipment age', 'old equipment', 'aged equipment',
      // Condition
      'poor condition', 'bad condition', 'unsatisfactory condition',
      'poor tyre', 'poor tire', 'tyre condition', 'tire condition',
      'worn tyre', 'worn tire', 'bald tyre', 'bald tire',
      // Maintenance
      'maintenance', 'poor maintenance', 'lack of maintenance',
      'maintenance record', 'preventive maintenance', 'service record'
    ],
    'Equipment identification': [
      // Company sticker
      'company sticker', 'company logo', 'logo sticker', 'identification sticker',
      'no company sticker', 'sticker missing', 'logo missing',
      'without company', 'no logo', 'no identification',
      // Operator details
      'operator details', 'operator name', 'authorized operator',
      'details not displayed', 'not displayed', 'identification missing'
    ]
  },

  'Breaking Ground & Excavation': {
    'Services not located': [
      // Core terms
      'service strike', 'services strike', 'struck service', 'hit service',
      // Misspellings
      'servise strike', 'sevice strike', 'service stike', 'serivce',
      // Services
      'underground service', 'underground services', 'buried service',
      'utility', 'utilities', 'utility strike', 'utility damage',
      'cable strike', 'cable', 'cables', 'power cable', 'electrical cable',
      'pipe strike', 'pipe', 'pipes', 'gas pipe', 'water pipe', 'sewer',
      'fibre', 'fiber', 'fibre optic', 'fiber optic', 'telecom', 'telecoms',
      // Detection
      'cat scan', 'cat scanner', 'cable avoidance tool', 'cat and genny',
      'gpr', 'ground penetrating radar', 'ground radar',
      'service location', 'locate', 'locator', 'locating', 'located',
      'utility location', 'utility locator', 'mark out', 'marked out',
      'dial before dig', 'call before dig', 'one call', '811',
      'service drawing', 'as built', 'as-built', 'service plan',
      // Issues
      'services not located', 'services unknown', 'no service check',
      'service check not done', 'hand dig', 'trial hole', 'trial pit'
    ],
    'Shoring inadequate': [
      // Core terms
      'shoring', 'shore', 'shores', 'shored', 'shorer',
      // Misspellings
      'shoreing', 'shorring', 'shoring', 'shoaring', 'shorng',
      // Types
      'trench box', 'trench boxes', 'trench shield', 'trench shields',
      'hydraulic shores', 'timber shoring', 'steel shoring', 'aluminum shoring',
      'battering', 'battered', 'batter', 'slope', 'sloped', 'sloping',
      'benching', 'benched', 'bench', 'stepped', 'stepping',
      'sheet pile', 'sheet piles', 'sheet piling', 'soldier pile',
      'waler', 'walers', 'strut', 'struts', 'strutting',
      // Issues
      'shoring inadequate', 'inadequate shoring', 'insufficient shoring',
      'no shoring', 'shoring missing', 'shoring not installed',
      'support inadequate', 'trench support', 'excavation support',
      'shoring damaged', 'shoring moved', 'shoring removed'
    ],
    'Collapse risk': [
      // Core terms
      'collapse', 'collapses', 'collapsed', 'collapsing',
      // Misspellings
      'colapse', 'collaspe', 'collapase', 'colapse', 'collaps',
      // Types
      'cave in', 'cave-in', 'caved in', 'caving', 'caving in',
      'trench collapse', 'excavation collapse', 'wall collapse',
      'side collapse', 'edge collapse', 'bank collapse',
      'soil failure', 'ground failure', 'earth movement', 'landslip',
      'ground movement', 'soil movement', 'earth shift',
      'instability', 'unstable', 'unstable ground', 'unstable soil',
      'subsidence', 'sinkhole', 'undermining', 'undermine',
      // Conditions
      'crack', 'cracks', 'cracking', 'fissure', 'tension crack',
      'bulging', 'bulge', 'heaving', 'heave', 'sloughing'
    ],
    'Spoil too close': [
      // Core terms
      'spoil', 'spoils', 'excavated material', 'excavated soil',
      // Misspellings
      'spoile', 'spoill', 'spiol', 'spoil', 'excvated',
      // Terms
      'spoil pile', 'spoil piles', 'spoil heap', 'spoil heaps',
      'muck pile', 'dirt pile', 'earth pile', 'material pile',
      'stockpile', 'stockpiled', 'piled material',
      // Issues
      'spoil too close', 'too close to edge', 'near edge', 'at edge',
      'material edge', 'edge loading', 'surcharge', 'surcharging',
      'overburden', 'loading edge', 'weight on edge',
      'spoil distance', 'setback', 'setback distance', 'minimum distance',
      '2 feet', '0.6m', '1 meter', '1 metre', 'clear zone'
    ],
    'Water ingress': [
      // Core terms
      'water ingress', 'water entry', 'water intrusion', 'water infiltration',
      // Misspellings
      'water ingres', 'water ingrees', 'water entery', 'water intress',
      // Types
      'flooding', 'flooded', 'flood', 'floods', 'inundation',
      'groundwater', 'ground water', 'water table', 'high water table',
      'seepage', 'seeping', 'seep', 'percolation', 'infiltration',
      'water accumulation', 'water build up', 'water buildup', 'pooling',
      'standing water', 'water pooled', 'water collected',
      // Management
      'dewatering', 'de-watering', 'pumping', 'pump', 'pumps',
      'sump', 'sumps', 'sump pump', 'well point', 'wellpoint',
      'drainage', 'drain', 'drains', 'drained', 'undrained'
    ]
  },

  'Temporary Works': {
    'Design inadequate': [
      // Core terms
      'design', 'designs', 'designed', 'designing', 'designer',
      // Misspellings
      'desgin', 'desgn', 'desing', 'designe', 'deisgn',
      // Types
      'design inadequate', 'inadequate design', 'poor design', 'bad design',
      'calculation', 'calculations', 'calc', 'structural calculation',
      'engineering', 'engineered', 'engineer', 'structural engineer',
      'twc', 't.w.c', 'temporary works coordinator', 'tw coordinator',
      'twp', 'temporary works permit', 'tw permit',
      'design check', 'design checking', 'checker', 'check engineer',
      // Issues
      'no design', 'design missing', 'design not done', 'undesigned',
      'design approval', 'approval missing', 'not approved', 'unapproved',
      'design review', 'review not done', 'not reviewed',
      'design change', 'site modification', 'deviation from design'
    ],
    'Overloaded': [
      // Core terms
      'overload', 'overloads', 'overloaded', 'overloading', 'over-load',
      // Misspellings
      'overlaod', 'overloard', 'over laoded', 'overloadd', 'overlaoded',
      // Issues
      'exceeded capacity', 'capacity exceeded', 'over capacity', 'overcapacity',
      'load exceeded', 'excessive load', 'too much load', 'excess load',
      'weight exceeded', 'too heavy', 'excessive weight', 'too much weight',
      'structural overload', 'platform overload', 'scaffold overload',
      'formwork overload', 'falsework overload', 'propping overload',
      'concrete pour', 'pour rate', 'pour sequence'
    ],
    'Bracing missing': [
      // Core terms
      'bracing', 'brace', 'braces', 'braced', 'unbraced',
      // Misspellings
      'braceing', 'braicing', 'brcaing', 'bracing', 'bracng',
      // Types
      'prop', 'props', 'propping', 'propped', 'acrow prop', 'acrow',
      'strut', 'struts', 'strutting', 'strutted',
      'shore', 'shores', 'shoring', 'flying shore',
      'lateral support', 'lateral bracing', 'cross bracing', 'diagonal bracing',
      'diagonal brace', 'knee brace', 'tie', 'ties', 'tie rod',
      // Issues
      'bracing missing', 'missing bracing', 'no bracing', 'bracing absent',
      'bracing inadequate', 'inadequate bracing', 'insufficient bracing',
      'bracing removed', 'bracing damaged', 'bracing loose'
    ],
    'Foundation unstable': [
      // Core terms
      'foundation', 'foundations', 'founding', 'founded',
      // Misspellings
      'foundaton', 'fondation', 'foundaiton', 'foundtion', 'foudnation',
      // Types
      'base', 'bases', 'base plate', 'base plates', 'baseplate',
      'sole plate', 'sole plates', 'soleplate', 'sill', 'sills',
      'footing', 'footings', 'pad', 'pads', 'bearer', 'bearers',
      'ground bearing', 'bearing capacity', 'bearing pressure',
      // Conditions
      'soft ground', 'soft soil', 'weak ground', 'poor ground',
      'unstable foundation', 'foundation unstable', 'foundation movement',
      'settlement', 'settling', 'settled', 'differential settlement',
      'subsidence', 'sinking', 'heave', 'heaving'
    ],
    'Strike damage': [
      // Core terms
      'struck', 'strike', 'strikes', 'striking', 'stricken',
      // Misspellings
      'struk', 'stike', 'strick', 'struked', 'striked',
      // Types
      'strike damage', 'struck damage', 'impact damage', 'collision damage',
      'vehicle strike', 'plant strike', 'machine strike', 'equipment strike',
      'impact', 'impacts', 'impacted', 'collision', 'collided',
      'hit by vehicle', 'hit by plant', 'hit by equipment', 'knocked',
      'plant damage', 'equipment damage', 'accidental damage',
      // Results
      'bent', 'buckled', 'deformed', 'displaced', 'moved',
      'cracked', 'broken', 'fractured', 'damaged member'
    ]
  },

  'Driving': {
    'Speeding': [
      // Core terms
      'speed', 'speeds', 'speeding', 'speeded', 'sped',
      // Misspellings
      'speeed', 'speding', 'speediing', 'speedng', 'spedin',
      // Descriptions
      'excessive speed', 'excess speed', 'over speed', 'overspeed',
      'fast', 'too fast', 'driving fast', 'traveling fast', 'travelling fast',
      'high speed', 'reckless speed', 'unsafe speed', 'inappropriate speed',
      // Limits
      'speed limit', 'speed limits', 'posted speed', 'site speed limit',
      'speed restriction', 'speed zone', 'speed violation', 'speed breach',
      'over the limit', 'exceeding limit', 'above limit', 'breaking limit',
      'mph', 'kph', 'km/h', 'kilometers per hour', 'kilometres per hour'
    ],
    'Seatbelt not worn': [
      // Core terms
      'seatbelt', 'seatbelts', 'seat belt', 'seat belts', 'seat-belt',
      // Misspellings
      'seatblet', 'setbelt', 'seatbelt', 'seat blet', 'seatbel',
      // Types
      'restraint', 'restraints', 'safety belt', 'safety belts',
      'lap belt', 'shoulder belt', 'harness', 'three point',
      // Issues
      'no seatbelt', 'seatbelt not worn', 'not wearing seatbelt',
      'unbuckled', 'unbuckled seatbelt', 'belt not worn', 'belt unbuckled',
      'seatbelt unfastened', 'unfastened', 'seatbelt off',
      'seatbelt defective', 'seatbelt broken', 'seatbelt damaged',
      'seatbelt warning', 'seatbelt alarm', 'buckle up', 'belt up'
    ],
    'Phone use': [
      // Core terms
      'phone', 'phones', 'telephone', 'mobile', 'cell', 'cellular',
      // Misspellings
      'phoen', 'fone', 'phon', 'mobile fone', 'cel phone',
      // Types
      'mobile phone', 'cell phone', 'cellphone', 'smartphone', 'smart phone',
      'handheld device', 'handheld', 'electronic device', 'device',
      // Actions
      'phone use', 'using phone', 'phone while driving', 'on phone',
      'texting', 'text', 'texted', 'text message', 'sms',
      'calling', 'making call', 'taking call', 'answering phone',
      'distracted driving', 'distracted', 'distraction', 'inattention',
      // Issues
      'hands free', 'handsfree', 'hands-free', 'bluetooth', 'earpiece',
      'phone holder', 'phone mount', 'cradle'
    ],
    'Driver fatigue': [
      // Core terms
      'fatigue', 'fatigued', 'fatiguing',
      // Misspellings
      'fatigue', 'fatiqued', 'fatige', 'fatiuge', 'fatiguie',
      // Descriptions
      'tired', 'tiredness', 'exhausted', 'exhaustion', 'weary',
      'drowsy', 'drowsiness', 'sleepy', 'sleepiness', 'dozing',
      'driver fatigue', 'fatigued driver', 'fatigued driving',
      'fatigue driving', 'tired driver', 'drowsy driver',
      // Causes
      'rest break', 'rest breaks', 'no break', 'without break',
      'driving hours', 'hours driving', 'long drive', 'continuous driving',
      'night driving', 'shift work', 'long shift', 'overtime',
      // Management
      'fatigue management', 'fatigue risk', 'journey management',
      'fit for duty', 'fitness for duty', 'work rest', 'work-rest cycle'
    ],
    'Vehicle defect': [
      // Core terms
      'vehicle defect', 'vehicle defects', 'car defect', 'truck defect',
      // Misspellings
      'vehical defect', 'vehicel defect', 'vehcile', 'vechile',
      // Components
      'tyre', 'tyres', 'tire', 'tires', 'flat tyre', 'bald tyre', 'worn tyre',
      'brake', 'brakes', 'braking', 'brake failure', 'brake defect',
      'light', 'lights', 'headlight', 'tail light', 'brake light', 'indicator',
      'steering', 'suspension', 'wheel', 'wheels', 'windscreen', 'windshield',
      'wiper', 'wipers', 'horn', 'mirror', 'mirrors',
      // Issues
      'defective vehicle', 'vehicle defective', 'vehicle damage',
      'vehicle inspection', 'pre-trip', 'pre-trip inspection', 'pre-start',
      'vehicle check', 'daily check', 'walkaround', 'walk around',
      'roadworthy', 'road worthy', 'unroadworthy', 'cof', 'mot', 'wof'
    ]
  },

  'Working in Heat': {
    'Dehydration': [
      // Core terms
      'dehydration', 'dehydrated', 'dehydrate', 'dehydrating',
      // Misspellings
      'dehidration', 'dehdyration', 'dehydraton', 'deydration', 'dehyration',
      'dehydratioin', 'dehyrdation', 'dehdration', 'dehydratoin', 'dehyrdated',
      // Hydration
      'hydration', 'hydrate', 'hydrated', 'hydrating', 'rehydrate', 'rehydration',
      'drinking water', 'potable water', 'water intake', 'fluid intake',
      'water consumption', 'fluid replacement', 'electrolyte', 'electrolytes',
      'sports drink', 'oral rehydration', 'fluid loss', 'water loss',
      // Symptoms
      'thirst', 'thirsty', 'dry mouth', 'dark urine', 'no urine', 'reduced urine',
      'headache', 'dizziness', 'dizzy', 'fatigue', 'weakness', 'lethargy',
      'dry skin', 'sunken eyes', 'rapid heartbeat', 'low blood pressure',
      'muscle cramps', 'muscle cramping', 'cramp', 'cramps', 'cramping',
      // Issues
      'not drinking', 'insufficient water', 'no water available', 'water shortage',
      'water not provided', 'water station', 'hydration station', 'water cooler',
      'water break', 'drinking break', 'hydration break', 'fluid break',
      'inadequate hydration', 'poor hydration', 'lack of water', 'no fluids'
    ],
    'No rest breaks': [
      // Core terms
      'rest break', 'rest breaks', 'rest period', 'rest periods', 'break',
      // Misspellings
      'rest brak', 'rest braek', 'rest berak', 'restbreak', 'rest brk',
      'rest preiod', 'rest perioud', 'restperiod', 'rest peirod',
      // Types
      'cooling break', 'cooling period', 'cool down', 'cooldown', 'cool-down',
      'recovery break', 'recovery period', 'recovery time', 'recuperation',
      'work break', 'work-rest', 'work rest', 'work rest cycle', 'work-rest cycle',
      'scheduled break', 'mandatory break', 'required break', 'break time',
      'micro break', 'microbreak', 'micro-break', 'short break', 'brief break',
      // Issues
      'no break', 'no breaks', 'no rest', 'without break', 'without rest',
      'skipped break', 'missed break', 'break skipped', 'break missed',
      'continuous work', 'non-stop', 'nonstop', 'worked through', 'no respite',
      'inadequate break', 'insufficient break', 'short break', 'breaks inadequate',
      'break frequency', 'break duration', 'rest inadequate', 'rest insufficient'
    ],
    'No shade': [
      // Core terms
      'shade', 'shaded', 'shading', 'shadow', 'shadows',
      // Misspellings
      'shad', 'shaed', 'shdae', 'sahde', 'shadde', 'shaide',
      // Shelter types
      'shelter', 'shelters', 'sheltered', 'canopy', 'canopies', 'awning', 'awnings',
      'tent', 'tents', 'marquee', 'gazebo', 'sun shelter', 'sun shade', 'sunshade',
      'umbrella', 'umbrellas', 'parasol', 'cover', 'covered', 'covering',
      'overhead cover', 'overhead protection', 'roof', 'roofed',
      // Sun exposure
      'sun exposure', 'sun exposed', 'exposed to sun', 'direct sun', 'direct sunlight',
      'full sun', 'unshaded', 'no shade', 'without shade', 'shade unavailable',
      'sun protection', 'uv exposure', 'uv protection', 'solar radiation',
      // Issues
      'shaded area', 'shaded rest area', 'cooling station', 'cooling area',
      'rest shelter', 'no shelter', 'shelter missing', 'no canopy', 'canopy missing',
      'working in sun', 'under sun', 'exposed area', 'open area'
    ],
    'Heat illness signs': [
      // Core terms
      'heat stroke', 'heatstroke', 'heat-stroke', 'heat exhaustion',
      // Misspellings
      'heat stoke', 'heat strke', 'heatstrok', 'heat exhastion', 'heat exaustion',
      'heat exhaution', 'heat exhuastion', 'heatexhaustion', 'heat exaustion',
      // Heat conditions
      'heat stress', 'heat strain', 'heat illness', 'heat injury', 'heat casualty',
      'heat cramp', 'heat cramps', 'heat syncope', 'heat rash', 'heat edema',
      'hyperthermia', 'heat related', 'heat-related', 'thermal stress',
      'heat disorder', 'heat emergency', 'heat incident', 'heat victim',
      // Symptoms
      'dizziness', 'dizzy', 'lightheaded', 'light headed', 'light-headed',
      'nausea', 'nauseous', 'vomiting', 'vomit', 'sick', 'feeling unwell',
      'confusion', 'confused', 'disoriented', 'disorientation', 'altered mental',
      'excessive sweating', 'profuse sweating', 'heavy sweating', 'sweating',
      'pale', 'pallor', 'flushed', 'red skin', 'hot skin', 'dry skin',
      'headache', 'head ache', 'throbbing head', 'migraine',
      'rapid pulse', 'fast heartbeat', 'racing heart', 'weak pulse',
      'fainting', 'faint', 'collapse', 'collapsed', 'unconscious',
      'slurred speech', 'seizure', 'convulsion', 'high temperature', 'fever'
    ],
    'Not acclimatized': [
      // Core terms
      'acclimatize', 'acclimatized', 'acclimatizing', 'acclimatisation', 'acclimatization',
      // Misspellings
      'aclimitize', 'acclimatise', 'acclimatised', 'acclimitised', 'acclimitized',
      'aclimitized', 'acclamatized', 'acclamitized', 'acclametized', 'acclmatized',
      // Alternative terms
      'acclimate', 'acclimated', 'acclimating', 'acclamation', 'heat adjustment',
      'heat adaptation', 'adapt to heat', 'adapted to heat', 'heat tolerance',
      'heat accustomed', 'accustomed to heat', 'used to heat', 'heat ready',
      // Worker status
      'new worker', 'new employee', 'new hire', 'new starter', 'newcomer',
      'first day', 'first week', 'recently started', 'just started',
      'returning worker', 'returned from leave', 'back from holiday',
      'not accustomed', 'unaccustomed', 'inexperienced', 'unfamiliar',
      // Process
      'acclimatization period', 'adjustment period', 'build up', 'gradual exposure',
      'heat acclimation', 'heat conditioning', 'progressive exposure'
    ]
  },

  'Working on or Near Water': {
    'Life jacket missing': [
      // Core terms
      'life jacket', 'life jackets', 'lifejacket', 'lifejackets', 'life-jacket',
      // Misspellings
      'life jaket', 'life jackt', 'lifejackt', 'life jakcet', 'lief jacket',
      'lifejakt', 'life jakect', 'lifejacet', 'lfie jacket',
      // Types
      'pfd', 'pfds', 'p.f.d', 'personal flotation', 'personal flotation device',
      'buoyancy aid', 'buoyancy aids', 'flotation device', 'flotation vest',
      'life vest', 'lifevest', 'life preserver', 'life saver', 'lifesaver',
      'inflatable jacket', 'inflatable vest', 'auto-inflate', 'manual inflate',
      'foam jacket', 'inherent buoyancy', 'work vest', 'offshore vest',
      // Issues
      'no life jacket', 'life jacket missing', 'missing life jacket', 'without life jacket',
      'life jacket not worn', 'not wearing life jacket', 'pfd not worn',
      'pfd missing', 'no pfd', 'buoyancy aid missing', 'buoyancy aid not worn',
      'life jacket damaged', 'life jacket defective', 'life jacket expired',
      'life jacket inspection', 'life jacket service', 'life jacket condition'
    ],
    'Rescue equipment absent': [
      // Core terms
      'rescue equipment', 'rescue gear', 'rescue apparatus', 'rescue device',
      // Misspellings
      'resque equipment', 'resue equipment', 'rescue equipement', 'rescue equpiment',
      'rescure equipment', 'rscue equipment', 'resuce equipment',
      // Equipment types
      'throw bag', 'throw bags', 'throw line', 'throw rope', 'rescue rope',
      'rescue buoy', 'rescue buoys', 'life ring', 'life rings', 'life buoy',
      'lifebuoy', 'life buoys', 'ring buoy', 'perry buoy', 'rescue ring',
      'rescue pole', 'rescue poles', 'reaching pole', 'shepherd hook',
      'rescue boat', 'rescue boats', 'rescue craft', 'safety boat', 'standby boat',
      'rescue ladder', 'rescue platform', 'rescue station', 'rescue point',
      // Man overboard
      'man overboard', 'mob', 'm.o.b', 'person overboard', 'overboard',
      'mob equipment', 'mob station', 'mob alarm', 'mob procedure',
      // Issues
      'no rescue equipment', 'rescue equipment missing', 'missing rescue equipment',
      'rescue equipment absent', 'without rescue equipment', 'rescue unavailable',
      'life ring missing', 'throw bag missing', 'rescue rope missing'
    ],
    'Strong current': [
      // Core terms
      'current', 'currents', 'water current', 'water currents',
      // Misspellings
      'curent', 'currant', 'currrent', 'currennt', 'curernt', 'currnet',
      // Types
      'strong current', 'swift current', 'fast current', 'rapid current',
      'powerful current', 'dangerous current', 'hazardous current',
      'flow', 'water flow', 'fast flow', 'rapid flow', 'stream', 'streaming',
      'tide', 'tides', 'tidal', 'tidal current', 'tidal flow', 'tidal stream',
      'ebb tide', 'flood tide', 'spring tide', 'neap tide', 'tidal range',
      'fast water', 'moving water', 'water movement', 'water velocity',
      'undertow', 'undercurrent', 'rip current', 'rip', 'rip tide', 'riptide',
      // Hazards
      'swept away', 'dragged', 'pulled under', 'strong pull', 'water force',
      'current hazard', 'current danger', 'current risk', 'flow hazard',
      'downstream', 'upstream', 'crosscurrent', 'cross current', 'eddy',
      'whirlpool', 'turbulence', 'turbulent', 'swirling', 'rapids'
    ],
    'Vessel defect': [
      // Core terms
      'vessel', 'vessels', 'boat', 'boats', 'craft', 'watercraft',
      // Misspellings
      'vessal', 'vessl', 'vesell', 'veesel', 'vessle', 'voat', 'boad',
      // Types
      'barge', 'barges', 'pontoon', 'pontoons', 'workboat', 'workboats',
      'work boat', 'work boats', 'tender', 'tenders', 'launch', 'launches',
      'tug', 'tugs', 'tugboat', 'dinghy', 'dinghies', 'rib', 'ribs',
      'inflatable boat', 'rigid inflatable', 'safety boat', 'rescue boat',
      'jack up', 'jack-up', 'floating platform', 'floating barge',
      // Defects
      'vessel defect', 'vessel defects', 'boat defect', 'vessel damage',
      'hull damage', 'hull breach', 'hull integrity', 'hull condition',
      'leak', 'leaking', 'taking water', 'sinking', 'listing',
      'stability', 'unstable', 'stability issue', 'trim', 'ballast',
      'engine failure', 'engine problem', 'propulsion', 'steering failure',
      // Inspection
      'boat inspection', 'vessel inspection', 'vessel survey', 'boat survey',
      'seaworthiness', 'sea worthy', 'vessel condition', 'vessel maintenance',
      'boat condition', 'boat maintenance', 'vessel certificate', 'boat certificate'
    ],
    'Lone working': [
      // Core terms
      'lone working', 'lone worker', 'lone workers', 'working alone',
      // Misspellings
      'lone workng', 'lone workin', 'loneworking', 'loan working', 'lone wokring',
      // Terms
      'solo', 'solo work', 'solo working', 'by oneself', 'by himself', 'by herself',
      'unaccompanied', 'unattended', 'single person', 'one person', 'alone',
      'isolated worker', 'isolated working', 'remote working', 'remote worker',
      // Buddy system
      'buddy', 'buddies', 'buddy system', 'no buddy', 'buddy missing', 'without buddy',
      'two person', 'two-person', 'pair', 'paired', 'partner', 'partnered',
      'team of two', 'minimum two', 'at least two', 'always two',
      // Issues
      'lone worker policy', 'lone working policy', 'lone worker risk',
      'lone working risk', 'lone worker assessment', 'lone working assessment',
      'check in', 'check-in', 'welfare check', 'communication', 'contact'
    ]
  },

  'Working on or Near Live Roads': {
    'Traffic controller absent': [
      // Core terms
      'traffic controller', 'traffic controllers', 'traffic control',
      // Misspellings
      'trafic controller', 'traffic controler', 'traffic contorller', 'traffic contrller',
      'trafic control', 'traffc controller', 'traffic controllr',
      // Roles
      'tc', 't.c', 'ttm', 'traffic management', 'traffic marshal', 'traffic marshaller',
      'stop go', 'stop/go', 'stop-go', 'stop go operator', 'stop go person',
      'flagman', 'flagmen', 'flagger', 'flaggers', 'flag person',
      'banksman', 'guide', 'guiding traffic', 'traffic guide',
      // Equipment
      'stop bat', 'stop paddle', 'lollipop', 'traffic wand', 'traffic light',
      'temporary traffic light', 'portable traffic light', 'traffic signal',
      // Issues
      'no traffic control', 'traffic control missing', 'missing traffic control',
      'controller absent', 'no controller', 'controller missing', 'tc absent',
      'uncontrolled traffic', 'traffic not controlled', 'unmanaged traffic',
      'no traffic management', 'traffic management missing'
    ],
    'Vehicle incursion risk': [
      // Core terms
      'incursion', 'incursions', 'vehicle incursion', 'traffic incursion',
      // Misspellings
      'incurson', 'incursoin', 'incursuion', 'incusrion', 'incursion',
      // Terms
      'vehicle entry', 'unauthorized vehicle', 'vehicle breach', 'breached',
      'vehicle penetration', 'vehicle intrusion', 'vehicle entered',
      'struck by vehicle', 'hit by vehicle', 'run over', 'run down',
      'vehicle strike', 'vehicle collision', 'vehicle impact',
      'encroachment', 'encroaching', 'entered work zone', 'into work zone',
      // Protection
      'crash barrier', 'crash barriers', 'crash cushion', 'impact attenuator',
      'vehicle barrier', 'concrete barrier', 'jersey barrier', 'k-rail',
      'crash truck', 'tma', 'truck mounted attenuator', 'shadow vehicle',
      // Issues
      'incursion risk', 'vehicle risk', 'traffic risk', 'exposure to traffic',
      'unprotected from traffic', 'vehicles approaching', 'close to traffic'
    ],
    'Poor visibility': [
      // Core terms
      'visibility', 'visible', 'vision', 'sight', 'sighting',
      // Misspellings
      'visability', 'visiblity', 'visibilty', 'visibiltiy', 'visbility',
      // Conditions
      'poor visibility', 'limited visibility', 'reduced visibility', 'low visibility',
      'not visible', 'cannot see', 'hard to see', 'difficult to see',
      'sight distance', 'stopping distance', 'seeing distance', 'line of sight',
      'blind curve', 'blind corner', 'blind bend', 'blind spot', 'blind area',
      // Factors
      'lighting', 'poor lighting', 'inadequate lighting', 'dark', 'darkness',
      'night work', 'night time', 'dusk', 'dawn', 'low light',
      'reflective', 'reflective clothing', 'hi-vis', 'high vis', 'conspicuity',
      'conspicuous', 'fluorescent', 'retroreflective', 'reflective tape',
      'fog', 'foggy', 'mist', 'misty', 'rain', 'heavy rain', 'glare', 'sun glare',
      // Issues
      'workers not visible', 'site not visible', 'hard to spot', 'camouflaged'
    ],
    'Inadequate separation': [
      // Core terms
      'separation', 'separated', 'separating', 'segregation', 'segregated',
      // Misspellings
      'seperation', 'seperaton', 'seperation', 'seperration', 'segragation',
      // Terms
      'buffer', 'buffer zone', 'buffer space', 'buffer area', 'safety buffer',
      'safety zone', 'safe zone', 'work zone', 'work area', 'construction zone',
      'clearance', 'clear zone', 'clear distance', 'minimum clearance',
      'distance from traffic', 'separation distance', 'setback', 'offset',
      // Physical separation
      'physical separation', 'positive separation', 'positive protection',
      'hard separation', 'barrier separation', 'concrete separation',
      // Issues
      'inadequate separation', 'insufficient separation', 'poor separation',
      'no separation', 'separation missing', 'too close to traffic',
      'close to carriageway', 'near traffic', 'adjacent to traffic',
      'working in traffic', 'exposed to traffic', 'proximity to traffic'
    ]
  },

  'Explosives & Blasting': {
    'Shot firer absent': [
      // Core terms
      'shot firer', 'shot firers', 'shot-firer', 'shotfirer', 'shot fire',
      // Misspellings
      'shot fier', 'shot fierer', 'shot fireer', 'shotfier', 'shot firre',
      // Roles
      'blaster', 'blasters', 'explosives engineer', 'explosives technician',
      'explosives handler', 'explosives operator', 'demolition expert',
      'certified blaster', 'licensed blaster', 'qualified blaster',
      'blasting supervisor', 'blast supervisor', 'explosives supervisor',
      // Issues
      'no shot firer', 'shot firer absent', 'shot firer missing',
      'missing shot firer', 'without shot firer', 'blaster absent',
      'blaster missing', 'no blaster', 'unlicensed blaster',
      'unqualified blaster', 'uncertified', 'license expired'
    ],
    'Misfire risk': [
      // Core terms
      'misfire', 'misfires', 'misfired', 'misfiring', 'mis-fire',
      // Misspellings
      'misifer', 'missfier', 'misfir', 'missfire', 'misfirer',
      // Types
      'hang fire', 'hangfire', 'hang-fire', 'delayed detonation',
      'failed detonation', 'partial detonation', 'incomplete detonation',
      'unexploded', 'unexploded ordnance', 'uxo', 'u.x.o', 'uxb',
      'unexploded charge', 'undetonated', 'dud', 'duds', 'blind',
      // Procedures
      'misfire procedure', 'misfire protocol', 'misfire handling',
      'misfire response', 'misfire wait', 'wait time', 'waiting period',
      'approach misfire', 'investigating misfire', 're-fire', 'refire',
      // Hazards
      'misfire hazard', 'misfire risk', 'misfire danger', 'explosive hazard',
      'live charge', 'live explosive', 'sensitive explosive', 'unstable'
    ],
    'Blast radius breach': [
      // Core terms
      'blast radius', 'blast zone', 'blast area', 'blasting zone',
      // Misspellings
      'blst radius', 'blast raduis', 'blast raidus', 'blast readius',
      // Terms
      'exclusion radius', 'exclusion zone', 'exclusion area', 'exclusion distance',
      'danger zone', 'danger area', 'danger radius', 'hazard zone', 'hazard area',
      'clearance zone', 'clearance area', 'clearance distance', 'clear zone',
      'safe distance', 'safe zone', 'safety distance', 'safety zone',
      'evacuation zone', 'evacuation area', 'evacuation distance', 'evacuation radius',
      // Breaches
      'zone breach', 'breached zone', 'entered zone', 'in zone', 'inside zone',
      'within zone', 'zone incursion', 'zone violation', 'boundary breach',
      'perimeter breach', 'guard breach', 'sentry breach',
      // Issues
      'too close', 'within blast radius', 'inside blast zone', 'not evacuated',
      'failed to clear', 'remained in area', 'unauthorized entry'
    ],
    'Flyrock hazard': [
      // Core terms
      'flyrock', 'fly rock', 'fly-rock', 'flying rock', 'flying rocks',
      // Misspellings
      'flyrok', 'flirock', 'fly rokc', 'flyroc', 'flrock',
      // Terms
      'flying debris', 'flying material', 'airborne debris', 'airborne rock',
      'projectile', 'projectiles', 'projected material', 'thrown material',
      'rock throw', 'rock projection', 'rock trajectory', 'rock flight',
      'blast projection', 'blast debris', 'blast fragment', 'fragments',
      // Effects
      'impact', 'struck by', 'hit by', 'injury from flyrock', 'property damage',
      'vehicle damage', 'equipment damage', 'structural damage',
      // Control
      'flyrock control', 'flyrock protection', 'flyrock mitigation',
      'blast mat', 'blast mats', 'blasting mat', 'cover mat',
      'burden', 'stemming', 'charge weight', 'powder factor'
    ],
    'Warning failure': [
      // Core terms
      'blast warning', 'blasting warning', 'warning', 'warnings',
      // Misspellings
      'blast warnng', 'blast warining', 'blast waning', 'blsat warning',
      // Signals
      'siren', 'sirens', 'blast siren', 'warning siren', 'audible warning',
      'horn', 'horns', 'air horn', 'warning horn', 'blast horn',
      'all clear', 'all-clear', 'clear signal', 'clearance signal',
      'warning signal', 'warning device', 'audible signal', 'visual signal',
      'pre-blast warning', 'pre-blast signal', 'countdown', 'blast countdown',
      // Notification
      'notification', 'notifications', 'notice', 'blast notice', 'blast notification',
      'advance warning', 'prior notification', 'public warning', 'community notice',
      // Failures
      'warning failure', 'failed warning', 'no warning', 'warning missing',
      'missed warning', 'warning not given', 'inadequate warning',
      'insufficient warning', 'late warning', 'siren failure', 'horn failure'
    ]
  },

  // ==================== SUB-SIGNIFICANT HAZARDS (13) ====================

  'Physical Hazard': {
    'Exposed rebar': [
      // Core terms
      'rebar', 're-bar', 'rebars', 're-bars', 'reinforcement', 'reinforcing',
      // Misspellings
      'rber', 'rabar', 'rebar', 'rebr', 'reabar', 'rebbar', 'rebor',
      // Types
      'reinforcement bar', 'reinforcing bar', 'reinforcing steel', 'reo bar',
      'reo', 'steel bar', 'steel bars', 'starter bar', 'starter bars',
      'dowel', 'dowels', 'dowel bar', 'tie wire', 'mesh', 'reo mesh',
      // Exposed conditions
      'exposed rebar', 'rebar exposed', 'uncapped rebar', 'rebar uncapped',
      'rebar cap', 'rebar caps', 'mushroom cap', 'mushroom caps', 'impalement cap',
      'exposed reinforcement', 'reinforcement exposed', 'protruding rebar',
      'rebar protruding', 'steel bar protruding', 'vertical rebar', 'upstanding rebar',
      // Hazards
      'impalement', 'impalement hazard', 'impale', 'impaling', 'puncture',
      'pierce', 'penetrate', 'stab', 'stabbing', 'rebar injury'
    ],
    'Sharp edge': [
      // Core terms
      'sharp', 'sharps', 'sharpen', 'sharpened', 'sharpness',
      // Misspellings
      'shrp', 'shapr', 'sharrp', 'shrap', 'sahpr', 'shrap',
      // Types
      'sharp edge', 'sharp edges', 'cutting edge', 'razor sharp', 'razor edge',
      'jagged', 'jagged edge', 'rough edge', 'burr', 'burrs', 'burr edge',
      'pointed', 'point', 'points', 'pointed edge', 'spike', 'spikes', 'spiked',
      // Objects
      'nail', 'nails', 'screw', 'screws', 'staple', 'staples', 'tack', 'tacks',
      'wire', 'wires', 'wire end', 'wire ends', 'barbed wire', 'barb', 'barbs',
      'metal edge', 'sheet metal', 'tin', 'tin edge', 'glass', 'broken glass',
      'blade', 'blades', 'knife', 'knives', 'cutter', 'cutters',
      // Hazards
      'cut', 'cuts', 'cutting', 'laceration', 'lacerations', 'slash', 'gash',
      'laceration hazard', 'cut hazard', 'cutting hazard', 'sharps injury'
    ],
    'Struck-by risk': [
      // Core terms
      'struck by', 'struck-by', 'stricken', 'strike', 'strikes', 'striking',
      // Misspellings
      'struk by', 'stuck by', 'strick by', 'sruck by', 'struked',
      // Terms
      'hit by', 'hit-by', 'impacted by', 'contact with', 'contacted by',
      'falling object', 'falling objects', 'dropped object', 'dropped objects',
      'overhead', 'overhead hazard', 'overhead work', 'work overhead',
      'swing', 'swinging', 'swung', 'swing radius', 'swing hazard',
      'impact', 'impacts', 'impacted', 'collision', 'collide', 'collided',
      // Types
      'struck by equipment', 'struck by tool', 'struck by material',
      'struck by vehicle', 'struck by plant', 'struck by load', 'struck by crane',
      'falling material', 'falling tool', 'falling equipment', 'falling load',
      'dropped tool', 'dropped material', 'dropped load', 'dropped equipment',
      // Protection
      'drop zone', 'exclusion zone', 'hard hat area', 'helmet required'
    ],
    'Pinch point': [
      // Core terms
      'pinch', 'pinched', 'pinching', 'pinch point', 'pinch points',
      // Misspellings
      'pnich', 'pinc', 'pinsh', 'pinchpoint', 'piinch', 'pincth',
      // Types
      'crush', 'crushed', 'crushing', 'crush point', 'crush points', 'crush zone',
      'caught between', 'caught-between', 'between objects', 'caught in between',
      'caught in', 'caught-in', 'entangle', 'entangled', 'entanglement',
      'nip point', 'nip points', 'nipping', 'nipped', 'squeeze', 'squeezed',
      'trap', 'trapped', 'trapping', 'compression', 'compressed',
      // Hazards
      'pinch hazard', 'crush hazard', 'nip hazard', 'pinch injury',
      'crush injury', 'amputation hazard', 'finger trap', 'hand trap',
      'moving parts', 'rotating parts', 'closing parts', 'converging'
    ],
    'Protruding object': [
      // Core terms
      'protruding', 'protrude', 'protrudes', 'protrusion', 'protrusions',
      // Misspellings
      'portruding', 'protrudin', 'protuding', 'protrding', 'protrudng',
      // Terms
      'sticking out', 'stick out', 'sticks out', 'extending', 'extends',
      'projection', 'projections', 'projecting', 'project out',
      'jutting', 'jut out', 'juts out', 'jutted', 'overhang', 'overhanging',
      // Objects
      'protruding bolt', 'protruding nail', 'protruding screw', 'protruding bar',
      'protruding pipe', 'protruding beam', 'protruding edge', 'protruding object',
      'exposed bolt', 'exposed pipe', 'exposed beam', 'exposed edge',
      // Hazards
      'head hazard', 'eye hazard', 'body hazard', 'walk into', 'bump into',
      'collision hazard', 'impact hazard', 'obstruction'
    ]
  },

  'Mechanical Hazard': {
    'Guard missing': [
      // Core terms
      'guard', 'guards', 'guarded', 'guarding', 'unguarded',
      // Misspellings
      'gaurd', 'gard', 'guardd', 'gauard', 'gurd', 'gurad',
      // Types
      'machine guard', 'machine guards', 'safety guard', 'safety guards',
      'protective guard', 'fixed guard', 'interlocked guard', 'adjustable guard',
      'self-adjusting guard', 'barrier guard', 'enclosure', 'enclosures',
      'cover', 'covers', 'protective cover', 'safety cover', 'panel', 'panels',
      'shield', 'shields', 'protective shield', 'splash guard', 'chip guard',
      'belt guard', 'chain guard', 'gear guard', 'pulley guard', 'fan guard',
      // Issues
      'guard missing', 'missing guard', 'no guard', 'guard absent', 'without guard',
      'guard removed', 'removed guard', 'guard taken off', 'guard not installed',
      'guard damaged', 'damaged guard', 'guard broken', 'guard bent',
      'guard inadequate', 'inadequate guard', 'insufficient guard'
    ],
    'Rotating parts exposed': [
      // Core terms
      'rotating', 'rotation', 'rotate', 'rotates', 'rotary', 'revolving',
      // Misspellings
      'rotatng', 'roatating', 'rotaing', 'rotateing', 'roating',
      // Parts
      'rotating parts', 'rotating equipment', 'moving parts', 'moving equipment',
      'belt', 'belts', 'v-belt', 'v belt', 'timing belt', 'drive belt',
      'pulley', 'pulleys', 'sheave', 'sheaves', 'wheel', 'wheels', 'flywheel',
      'gear', 'gears', 'gearing', 'cog', 'cogs', 'sprocket', 'sprockets',
      'shaft', 'shafts', 'drive shaft', 'rotating shaft', 'spindle', 'spindles',
      'coupling', 'couplings', 'chuck', 'chucks', 'mandrel', 'arbor',
      'blade', 'blades', 'cutting blade', 'saw blade', 'fan', 'fans', 'fan blade',
      // Exposure
      'exposed shaft', 'shaft exposed', 'exposed belt', 'exposed pulley',
      'exposed gear', 'exposed blade', 'unguarded rotation', 'unguarded shaft',
      // Hazards
      'entanglement', 'entangle', 'entangled', 'caught in', 'drawn in',
      'wrap around', 'hair caught', 'clothing caught', 'finger caught'
    ],
    'E-stop absent': [
      // Core terms
      'e-stop', 'estop', 'e stop', 'emergency stop', 'emergency-stop',
      // Misspellings
      'e-stpo', 'estop', 'e-sotp', 'emergancy stop', 'emergeny stop',
      // Types
      'kill switch', 'killswitch', 'kill-switch', 'panic button', 'panic switch',
      'emergency button', 'emergency switch', 'emergency shut off', 'emergency shutoff',
      'emergency shutdown', 'emo', 'emergency machine off', 'epo', 'emergency power off',
      'red button', 'mushroom button', 'slam button', 'stop button',
      // Issues
      'e-stop missing', 'missing e-stop', 'no e-stop', 'no emergency stop',
      'e-stop absent', 'e-stop not working', 'e-stop faulty', 'e-stop defective',
      'e-stop bypassed', 'bypassed e-stop', 'e-stop disabled', 'disabled e-stop',
      'e-stop inaccessible', 'cannot reach e-stop', 'e-stop obstructed',
      'e-stop damaged', 'e-stop broken', 'e-stop not tested'
    ],
    'Unexpected startup': [
      // Core terms
      'unexpected startup', 'unexpected start', 'unexpected activation',
      // Misspellings
      'unexpeted startup', 'unexpected statup', 'unexpcted start', 'unexepected',
      // Terms
      'unexpected energization', 'unexpected energisation', 'unexpected power',
      'sudden startup', 'sudden start', 'sudden activation', 'sudden movement',
      'inadvertent startup', 'inadvertent start', 'inadvertent activation',
      'accidental start', 'accidental startup', 'accidental activation',
      'unintended start', 'unintended startup', 'unintended activation',
      'premature start', 'early start', 'unauthorized start',
      // Causes
      'stored energy', 'residual energy', 'potential energy', 'kinetic energy',
      'gravity', 'spring', 'hydraulic pressure', 'pneumatic pressure',
      'capacitor', 'electrical charge', 'battery backup',
      // Prevention
      'loto', 'lockout', 'tagout', 'isolation', 'de-energize', 'deenergize'
    ]
  },

  'COSHH (Chemical)': {
    'SDS missing': [
      // Core terms
      'sds', 's.d.s', 'msds', 'm.s.d.s', 'safety data sheet', 'data sheet',
      // Misspellings
      'sds', 'sdss', 'mdsds', 'msds', 'safty data sheet', 'saftey data sheet',
      // Terms
      'safety data', 'material safety', 'material safety data sheet', 'chemical data',
      'chemical information', 'chemical data sheet', 'product data sheet',
      'coshh', 'c.o.s.h.h', 'coshh assessment', 'coshh data', 'substance data',
      'hazard information', 'hazard data', 'product information',
      // Issues
      'no sds', 'sds missing', 'missing sds', 'sds unavailable', 'sds not available',
      'msds missing', 'no msds', 'data sheet missing', 'no data sheet',
      'chemical unknown', 'unknown substance', 'unidentified chemical',
      'coshh missing', 'no coshh', 'coshh not done', 'assessment missing'
    ],
    'Unlabeled container': [
      // Core terms
      'unlabeled', 'unlabelled', 'unlebeled', 'unlabled', 'un-labeled',
      // Misspellings
      'unlabled', 'unlabeld', 'unlablled', 'unlaebeled', 'unlabeleld',
      // Terms
      'no label', 'label missing', 'missing label', 'without label', 'label absent',
      'unmarked', 'unmarked container', 'unidentified', 'unidentified container',
      'container labeling', 'container labelling', 'label required', 'labeling required',
      // Container types
      'decanted', 'decanting', 'transfer', 'transferred', 'secondary container',
      'spray bottle', 'bottle', 'bottles', 'can', 'cans', 'drum', 'drums',
      'jerry can', 'jerrycan', 'jerry-can', 'ibc', 'intermediate bulk container',
      'tank', 'tanks', 'tote', 'totes', 'bucket', 'buckets', 'pail', 'pails',
      // Issues
      'label damaged', 'label faded', 'label illegible', 'cannot read label',
      'wrong label', 'incorrect label', 'mislabeled', 'mislabelled'
    ],
    'Incompatible storage': [
      // Core terms
      'incompatible', 'incompatibility', 'compatibility', 'compatible',
      // Misspellings
      'incompatable', 'incompatabile', 'incompatble', 'imcompatible',
      // Terms
      'incompatible chemicals', 'incompatible substances', 'chemical reaction',
      'reactive', 'reactivity', 'react', 'reacting', 'violent reaction',
      'storage', 'storing', 'stored', 'store', 'stores',
      'segregation', 'segregated', 'segregate', 'separate', 'separated',
      'chemical storage', 'substance storage', 'hazmat storage', 'flammable storage',
      'storage area', 'storage room', 'storage cabinet', 'chemical cabinet',
      'flammable cabinet', 'corrosive cabinet', 'acid cabinet', 'alkali cabinet',
      // Issues
      'stored together', 'stored near', 'adjacent storage', 'mixed storage',
      'improper storage', 'incorrect storage', 'poor storage', 'wrong storage',
      'not segregated', 'no segregation', 'segregation missing'
    ],
    'Spill uncontained': [
      // Core terms
      'spill', 'spills', 'spilled', 'spilling', 'spillage', 'spillages',
      // Misspellings
      'spil', 'spilage', 'spillige', 'sipll', 'speel', 'spilage',
      // Types
      'leak', 'leaks', 'leaked', 'leaking', 'leakage', 'seepage', 'seeping',
      'drip', 'drips', 'dripped', 'dripping', 'overflow', 'overflowed', 'overflowing',
      // Equipment
      'spill kit', 'spill kits', 'absorbent', 'absorbents', 'pads', 'socks', 'pillows',
      'bund', 'bunds', 'bunding', 'bunded', 'containment', 'secondary containment',
      'drip tray', 'drip trays', 'catch tray', 'spill tray', 'sump', 'sumps',
      // Issues
      'uncontained', 'uncontained spill', 'spill not contained', 'no containment',
      'no bund', 'bund missing', 'bund breached', 'bund overfilled',
      'no spill kit', 'spill kit missing', 'spill kit empty', 'spill not cleaned'
    ]
  },

  'Respiratory Hazard': {
    'Dust/fume exposure': [
      // Core terms
      'dust', 'dusts', 'dusty', 'fume', 'fumes', 'fuming',
      // Misspellings
      'duts', 'dusst', 'duust', 'fums', 'fumme', 'feum',
      // Types
      'smoke', 'smoky', 'vapor', 'vapour', 'vapors', 'vapours', 'vaporize',
      'mist', 'mists', 'misty', 'aerosol', 'aerosols', 'spray', 'sprays',
      'particle', 'particles', 'particulate', 'particulates', 'pm', 'pm2.5', 'pm10',
      // Specific types
      'silica', 'silica dust', 'crystalline silica', 'respirable silica', 'rcs',
      'asbestos', 'asbstos', 'asbestos fibre', 'asbestos fiber', 'acm',
      'welding fume', 'welding fumes', 'metal fume', 'metal fumes',
      'wood dust', 'sawdust', 'mdf dust', 'concrete dust', 'cement dust',
      'grinding dust', 'cutting dust', 'sanding dust', 'paint fume', 'paint spray',
      // Exposure
      'airborne', 'airborne dust', 'airborne particles', 'air contamination',
      'inhalation', 'inhale', 'inhaled', 'inhaling', 'breathing', 'breathe', 'breathed',
      'exposure', 'exposed', 'overexposure', 'occupational exposure', 'oel', 'wel'
    ],
    'Wrong RPE type': [
      // Core terms
      'rpe', 'r.p.e', 'respiratory protective equipment', 'respirator', 'respirators',
      // Misspellings
      'rpe', 'repirator', 'respirater', 'repsirator', 'resporator',
      // Types
      'mask', 'masks', 'face mask', 'dust mask', 'half mask', 'full face mask',
      'filter', 'filters', 'cartridge', 'cartridges', 'canister', 'canisters',
      'n95', 'n-95', 'ffp1', 'ffp2', 'ffp3', 'p100', 'p95',
      'papr', 'powered air purifying', 'supplied air', 'scba', 'air line',
      // Issues
      'wrong mask', 'incorrect mask', 'wrong filter', 'incorrect filter',
      'wrong respirator', 'incorrect respirator', 'wrong type', 'incorrect type',
      'rpe selection', 'mask selection', 'filter selection', 'wrong protection level',
      'inadequate protection', 'insufficient protection', 'not suitable', 'unsuitable'
    ],
    'Fit test overdue': [
      // Core terms
      'fit test', 'fit-test', 'fittest', 'fit testing', 'fit tested',
      // Misspellings
      'fit tset', 'fitt test', 'fit testt', 'fti test', 'fittet',
      // Types
      'face fit', 'facefit', 'face-fit', 'face fit test', 'face fit testing',
      'quantitative fit', 'qualitative fit', 'portacount', 'bitrex', 'saccharin',
      'seal check', 'user seal check', 'fit check', 'positive pressure', 'negative pressure',
      // Timing
      'fit test overdue', 'overdue fit test', 'fit test expired', 'expired fit test',
      'no fit test', 'fit test missing', 'fit test not done', 'never fit tested',
      'fit test required', 'annual fit test', 'fit test due', 'fit test needed',
      // Issues
      'respirator fit', 'poor fit', 'bad fit', 'loose fit', 'tight fit',
      'facial hair', 'beard', 'stubble', 'clean shaven', 'face seal', 'seal failure'
    ],
    'LEV not working': [
      // Core terms
      'lev', 'l.e.v', 'local exhaust ventilation', 'local exhaust', 'exhaust ventilation',
      // Misspellings
      'lve', 'levv', 'local exhuast', 'local exaust', 'exhuast ventilation',
      // Types
      'extraction', 'extract', 'extractor', 'extractors', 'extract fan',
      'fume extraction', 'dust extraction', 'welding extraction', 'grinding extraction',
      'fume hood', 'fume cupboard', 'extraction hood', 'capture hood', 'slot hood',
      'on-tool extraction', 'tool extraction', 'integrated extraction',
      'downdraft', 'downdraft table', 'cross draft', 'bench extraction',
      // Components
      'duct', 'ducts', 'ducting', 'ductwork', 'capture velocity', 'face velocity',
      'damper', 'dampers', 'filter', 'filters', 'collector', 'dust collector',
      // Issues
      'lev not working', 'lev failure', 'lev failed', 'extraction failure',
      'extraction not working', 'extractor not working', 'lev defective',
      'lev inspection', 'lev test', 'thorough examination', '14 month test',
      'lev ineffective', 'poor extraction', 'inadequate extraction'
    ]
  },

  'Slip and Trip': {
    'Wet surface': [
      // Core terms
      'wet', 'wetting', 'wetted', 'wetness', 'moisture', 'moist',
      // Misspellings
      'wett', 'weet', 'wte', 'moitsure', 'mosture',
      // Types
      'wet floor', 'wet surface', 'wet ground', 'wet pavement', 'wet concrete',
      'slippery', 'slippery floor', 'slippery surface', 'slick', 'slick surface',
      'water on floor', 'water on ground', 'standing water', 'puddle', 'puddles',
      'oil on floor', 'oily floor', 'oily surface', 'grease on floor', 'greasy',
      'spill', 'spilled', 'spillage', 'liquid spill', 'leaked', 'leakage',
      'rain', 'rainwater', 'rain water', 'rain wet', 'snow', 'ice', 'icy', 'frost',
      'condensation', 'condensed', 'dew', 'humidity', 'humid',
      // Issues
      'slip hazard', 'slipping hazard', 'fall hazard', 'slip risk',
      'no wet floor sign', 'wet floor sign missing', 'caution wet floor'
    ],
    'Uneven ground': [
      // Core terms
      'uneven', 'uneven ground', 'uneven surface', 'uneven floor',
      // Misspellings
      'unevan', 'unevn', 'unevenn', 'unven', 'ueneven',
      // Types
      'pothole', 'potholes', 'pot hole', 'pot holes', 'hole', 'holes',
      'depression', 'depressions', 'dip', 'dips', 'rut', 'ruts', 'rutted',
      'bump', 'bumps', 'bumpy', 'ridge', 'ridges', 'ridge in floor',
      'step', 'steps', 'unexpected step', 'step up', 'step down',
      'level change', 'level difference', 'change in level', 'elevation change',
      'broken surface', 'damaged floor', 'cracked floor', 'cracked pavement',
      'loose material', 'loose gravel', 'loose stone', 'unstable ground',
      // Issues
      'trip hazard', 'tripping hazard', 'stumble', 'stumbling', 'fall hazard',
      'uneven walking surface', 'walking surface', 'floor condition'
    ],
    'Cable across path': [
      // Core terms
      'cable', 'cables', 'cabling', 'cord', 'cords',
      // Misspellings
      'cabel', 'calbe', 'cble', 'cabble', 'corrd', 'chords',
      // Types
      'cable across', 'cables across', 'cable across path', 'cable on floor',
      'trailing cable', 'trailing cables', 'trailing lead', 'trailing cord',
      'extension cord', 'extension lead', 'power cord', 'power cable',
      'hose', 'hoses', 'hose across', 'air hose', 'water hose', 'welding hose',
      'lead', 'leads', 'electrical lead', 'flex', 'flexible cable',
      'wire', 'wires', 'wiring', 'cable run', 'cable route',
      // Issues
      'trip hazard', 'tripping hazard', 'tripping', 'trip risk', 'trip over',
      'cable management', 'cable routing', 'cable protection', 'cable cover',
      'cable ramp', 'cable bridge', 'cable tray', 'overhead cables',
      'unprotected cable', 'unsecured cable', 'loose cable'
    ],
    'Poor lighting': [
      // Core terms
      'lighting', 'lights', 'light', 'lit', 'illumination', 'illuminated',
      // Misspellings
      'lightng', 'lighitng', 'ligting', 'illumnation', 'ilumination',
      // Conditions
      'poor lighting', 'inadequate lighting', 'insufficient lighting', 'bad lighting',
      'dark', 'darkness', 'dim', 'dimly lit', 'dimness', 'low light', 'too dark',
      'no lighting', 'no lights', 'lighting missing', 'lights missing',
      'light out', 'lights out', 'light failure', 'light not working', 'bulb out',
      'flickering', 'flickering light', 'intermittent', 'faulty light',
      // Areas
      'shadowy', 'shadows', 'shadow area', 'dark corner', 'dark area',
      'unlit', 'unlit area', 'unlighted', 'poorly lit', 'under lit',
      // Issues
      'visibility', 'poor visibility', 'cannot see', 'hard to see', 'visibility poor',
      'emergency lighting', 'backup lighting', 'task lighting', 'work lighting',
      'lux level', 'lux', 'light level', 'foot candle', 'luminance'
    ]
  },

  'Tools': {
    'Tool defective': [
      // Core terms
      'tool defect', 'tool defects', 'defective tool', 'defective tools',
      // Misspellings
      'tool defet', 'tool deffect', 'defetive tool', 'deffective tool',
      // Issues
      'damaged tool', 'damaged tools', 'tool damage', 'tool damaged',
      'broken tool', 'broken tools', 'tool broken', 'cracked tool',
      'faulty tool', 'faulty tools', 'tool faulty', 'tool fault',
      'tool failure', 'tool failed', 'failed tool', 'tool malfunction',
      'worn tool', 'worn out tool', 'tool wear', 'tool worn',
      // Specific defects
      'loose handle', 'handle loose', 'cracked handle', 'split handle',
      'mushroomed head', 'chipped', 'chipped blade', 'dull blade', 'blunt blade',
      'bent', 'bent tool', 'warped', 'corroded', 'rusty', 'rusted',
      'missing guard', 'guard missing', 'guard damaged', 'guard broken',
      // Types
      'hand tool', 'hand tools', 'power tool', 'power tools', 'pneumatic tool',
      'electric tool', 'cordless tool', 'air tool', 'hydraulic tool'
    ],
    'Wrong tool for job': [
      // Core terms
      'wrong tool', 'incorrect tool', 'improper tool', 'unsuitable tool',
      // Misspellings
      'worng tool', 'wrong tol', 'incorect tool', 'wrogn tool',
      // Terms
      'wrong tool for job', 'wrong tool for task', 'not the right tool',
      'improvised', 'improvised tool', 'improvising', 'makeshift', 'makeshift tool',
      'homemade', 'homemade tool', 'modified tool', 'altered tool',
      'tool selection', 'tool choice', 'tool chosen', 'choosing wrong tool',
      'appropriate tool', 'right tool', 'proper tool', 'suitable tool', 'correct tool',
      // Misuse
      'tool misuse', 'misusing tool', 'misused', 'tool abuse', 'abusing tool',
      'using incorrectly', 'incorrect use', 'improper use', 'not designed for',
      'screwdriver as chisel', 'wrench as hammer', 'using pliers', 'using knife'
    ],
    'Guard bypassed': [
      // Core terms
      'guard bypassed', 'bypassed guard', 'bypass guard', 'guard bypass',
      // Misspellings
      'gaurd bypassed', 'guard bypased', 'guard bypassd', 'guard bypased',
      // Terms
      'guard removed', 'removed guard', 'guard taken off', 'guard off',
      'guard disabled', 'disabled guard', 'guard defeated', 'defeated guard',
      'interlock', 'interlocked', 'interlock bypassed', 'bypassed interlock',
      'interlock disabled', 'interlock defeated', 'interlock removed',
      'safety bypassed', 'safety disabled', 'safety defeated', 'safety removed',
      'safety override', 'override safety', 'override switch', 'jumpered',
      'tied back', 'wedged', 'wedged open', 'held open', 'taped', 'taped open'
    ],
    'Inspection overdue': [
      // Core terms
      'inspection overdue', 'overdue inspection', 'inspection expired',
      // Misspellings
      'inspection overdew', 'inpection overdue', 'inspction overdue',
      // Terms
      'not inspected', 'uninspected', 'no inspection', 'inspection missing',
      'overdue', 'out of date', 'expired', 'past due', 'lapsed',
      'tool inspection', 'inspection date', 'inspection due', 'inspection required',
      // Specific inspections
      'pat test', 'pat testing', 'portable appliance test', 'electrical test',
      'visual inspection', 'pre-use inspection', 'daily inspection',
      'color coding', 'colour coding', 'inspection tag', 'inspection sticker',
      'test date', 'next test due', 'last inspected', 'due date',
      // Issues
      'inspection interval', 'inspection frequency', 'inspection schedule',
      'never inspected', 'inspection record', 'inspection register'
    ]
  },

  'Traffic Management': {
    'Route confusion': [
      // Core terms
      'route', 'routes', 'routing', 'routed', 'reroute', 'rerouting',
      // Misspellings
      'rout', 'rooute', 'roue', 'routte', 'rouite',
      // Issues
      'route confusion', 'confused route', 'confusing route', 'unclear route',
      'direction', 'directions', 'directional', 'wrong direction', 'misdirection',
      'wayfinding', 'way finding', 'way-finding', 'navigation', 'navigate',
      'lost', 'got lost', 'disoriented', 'unsure', 'uncertain',
      'wrong way', 'wrong turn', 'wrong direction', 'incorrect route',
      // Signage
      'no signs', 'signs missing', 'missing signs', 'inadequate signs',
      'confusing signs', 'conflicting signs', 'poor signage', 'unclear signage',
      'directional sign', 'direction sign', 'arrow', 'arrows', 'pointing',
      // Plan
      'traffic plan', 'site plan', 'route map', 'site map', 'traffic route',
      'designated route', 'approved route', 'one way', 'one-way', 'two way'
    ],
    'Pedestrian mixing': [
      // Core terms
      'pedestrian mixing', 'mixed traffic', 'pedestrian and vehicle',
      // Misspellings
      'pedstrian mixing', 'pedestrain mixing', 'pedistrian mixing',
      // Terms
      'pedestrian vehicle', 'vehicles and pedestrians', 'people and vehicles',
      'no segregation', 'no separation', 'not segregated', 'not separated',
      'pedestrian separation', 'vehicle separation', 'traffic segregation',
      'shared space', 'shared area', 'common area', 'same area',
      // Issues
      'mixing hazard', 'interface', 'pedestrian interface', 'vehicle interface',
      'pedestrian conflict', 'vehicle conflict', 'near miss', 'close call',
      'pedestrian struck', 'pedestrian hit', 'pedestrian injury',
      // Solutions
      'pedestrian route', 'pedestrian path', 'pedestrian walkway', 'footpath',
      'vehicle route', 'vehicle path', 'haul road', 'segregated route',
      'physical barrier', 'pedestrian barrier', 'fence', 'fencing'
    ],
    'Speed not controlled': [
      // Core terms
      'speed', 'speeds', 'speeding', 'speeded', 'velocity',
      // Misspellings
      'spee', 'spped', 'speeed', 'speedng', 'speding',
      // Control measures
      'speed control', 'speed management', 'speed reduction', 'speed calming',
      'speed bump', 'speed bumps', 'speed hump', 'speed humps', 'sleeping policeman',
      'speed limit', 'speed limits', 'speed restriction', 'speed zone',
      'speed sign', 'speed signs', 'posted speed', 'mph', 'kph', 'km/h',
      // Issues
      'no speed control', 'no speed limit', 'speed not controlled', 'uncontrolled speed',
      'excessive speed', 'too fast', 'driving fast', 'speeding vehicle',
      'over speed', 'over the limit', 'exceeding speed', 'speed violation',
      'radar', 'speed camera', 'speed check', 'speed monitoring'
    ],
    'Crossing unsafe': [
      // Core terms
      'crossing', 'crossings', 'cross', 'crossed', 'crossing point',
      // Misspellings
      'crossng', 'corsssing', 'crosing', 'crossign', 'crssing',
      // Types
      'pedestrian crossing', 'pedestrian crossings', 'crosswalk', 'cross walk',
      'crossing point', 'crossing points', 'designated crossing', 'safe crossing',
      'zebra crossing', 'pelican crossing', 'puffin crossing', 'toucan crossing',
      // Issues
      'unsafe crossing', 'dangerous crossing', 'hazardous crossing', 'risky crossing',
      'no crossing', 'no crossing point', 'crossing missing', 'crossing absent',
      'crossing not marked', 'unmarked crossing', 'crossing not visible',
      'crossing obstructed', 'blocked crossing', 'crossing blocked',
      // Features
      'crossing sign', 'crossing light', 'crossing signal', 'push button',
      'dropped kerb', 'dropped curb', 'tactile paving', 'visibility'
    ]
  },

  'Environmental': {
    'Spill/leak': [
      // Core terms
      'spill', 'spills', 'spilled', 'spilling', 'spillage', 'spillages',
      // Misspellings
      'spil', 'spilll', 'spiled', 'spilage', 'spillige',
      // Types
      'leak', 'leaks', 'leaked', 'leaking', 'leakage', 'leakages',
      'environmental spill', 'chemical spill', 'oil spill', 'fuel spill',
      'contamination', 'contaminated', 'contaminate', 'contaminant',
      'release', 'released', 'releasing', 'discharge', 'discharged', 'discharging',
      'runoff', 'run-off', 'run off', 'surface runoff', 'storm water',
      // Materials
      'oil leak', 'fuel leak', 'diesel leak', 'hydraulic leak', 'coolant leak',
      'chemical leak', 'acid leak', 'solvent leak', 'paint spill',
      'sewage', 'effluent', 'wastewater', 'waste water',
      // Impact
      'ground contamination', 'soil contamination', 'water contamination',
      'watercourse', 'drain', 'drains', 'drainage', 'into drain', 'into water'
    ],
    'Dust emission': [
      // Core terms
      'dust', 'dusty', 'dusting', 'dusted', 'dustiness',
      // Misspellings
      'duts', 'duust', 'dusst', 'dut', 'dustt',
      // Types
      'dust emission', 'dust emissions', 'dust release', 'dust generation',
      'airborne dust', 'fugitive dust', 'nuisance dust', 'construction dust',
      'particulate', 'particulates', 'pm', 'particulate matter', 'fine particles',
      // Sources
      'dust control', 'dust suppression', 'dust management', 'dust mitigation',
      'dusty conditions', 'dusty area', 'dusty site', 'dusty environment',
      'dust cloud', 'dust plume', 'visible dust', 'excessive dust',
      // Control
      'water suppression', 'spraying', 'damping down', 'wetting',
      'dust screen', 'dust barrier', 'wind break', 'enclosure',
      'air quality', 'air monitoring', 'dust monitoring', 'dust measurement'
    ],
    'Noise excessive': [
      // Core terms
      'noise', 'noisy', 'noisiness', 'sound', 'sounds', 'loud', 'loudness',
      // Misspellings
      'niose', 'nois', 'noisse', 'nioise', 'looud', 'luod',
      // Levels
      'excessive noise', 'high noise', 'loud noise', 'intense noise',
      'noise level', 'noise levels', 'sound level', 'sound levels',
      'decibel', 'decibels', 'db', 'dba', 'db(a)', 'noise reading',
      'noise exposure', 'exposure to noise', 'noise dose', 'daily exposure',
      // Control
      'hearing', 'hearing damage', 'hearing loss', 'hearing protection',
      'noise control', 'noise reduction', 'noise mitigation', 'noise management',
      'silencer', 'silencers', 'muffler', 'mufflers', 'damping', 'damper',
      'enclosure', 'acoustic enclosure', 'noise barrier', 'sound barrier',
      // Assessment
      'noise assessment', 'noise survey', 'noise monitoring', 'noise measurement',
      'action level', 'exposure limit', 'oel', 'occupational exposure'
    ],
    'Waste improper': [
      // Core terms
      'waste', 'wastes', 'wasted', 'wasting', 'rubbish', 'garbage', 'trash',
      // Misspellings
      'wast', 'wastee', 'waset', 'rubish', 'rubbis', 'garbge',
      // Types
      'improper waste', 'waste disposal', 'waste management', 'waste handling',
      'waste segregation', 'waste separation', 'waste sorting', 'mixed waste',
      'contaminated waste', 'hazardous waste', 'special waste', 'clinical waste',
      'chemical waste', 'toxic waste', 'dangerous waste', 'controlled waste',
      // Containers
      'skip', 'skips', 'dumpster', 'bin', 'bins', 'waste bin', 'rubbish bin',
      'container', 'containers', 'waste container', 'receptacle', 'receptacles',
      // Issues
      'wrong bin', 'incorrect bin', 'improper disposal', 'incorrect disposal',
      'overflowing', 'overflowing bin', 'bin full', 'waste overflow',
      'illegal dumping', 'fly tipping', 'fly-tipping', 'dumping', 'dumped'
    ]
  },

  'Access': {
    'Route blocked': [
      // Core terms
      'blocked', 'blocking', 'block', 'blockage', 'blockages',
      // Misspellings
      'bloked', 'blockd', 'bloced', 'blokced', 'blocekd',
      // Terms
      'obstruction', 'obstructions', 'obstructed', 'obstructing', 'obstruct',
      'route blocked', 'blocked route', 'path blocked', 'blocked path',
      'access blocked', 'blocked access', 'doorway blocked', 'blocked doorway',
      'congested', 'congestion', 'crowded', 'overcrowded', 'jammed',
      // Areas
      'walkway blocked', 'corridor blocked', 'stairway blocked', 'exit blocked',
      'aisle blocked', 'passage blocked', 'gangway blocked', 'emergency route',
      'escape route blocked', 'fire exit blocked', 'emergency exit blocked',
      // Objects
      'materials blocking', 'equipment blocking', 'pallets blocking', 'boxes blocking',
      'storage blocking', 'parked blocking', 'vehicle blocking', 'debris blocking',
      // Issues
      'cannot pass', 'cannot get through', 'no access', 'restricted access',
      'impassable', 'impeded', 'hindered', 'restricted'
    ],
    'Stair defect': [
      // Core terms
      'stair', 'stairs', 'stairway', 'stairways', 'stairwell', 'stairwells',
      // Misspellings
      'stiar', 'staris', 'staiar', 'starir', 'strair',
      // Types
      'step', 'steps', 'tread', 'treads', 'riser', 'risers', 'landing', 'landings',
      'handrail', 'handrails', 'hand rail', 'hand rails', 'bannister', 'balustrade',
      'nosing', 'nosings', 'stair nosing', 'step nosing', 'anti-slip nosing',
      'newel', 'newel post', 'stringer', 'stringers', 'baluster', 'balusters',
      // Defects
      'stair damage', 'damaged stair', 'stair defect', 'defective stair',
      'broken step', 'step broken', 'cracked step', 'loose step', 'wobbly step',
      'stair worn', 'worn step', 'worn tread', 'slippery step', 'slippery stair',
      'handrail missing', 'missing handrail', 'handrail loose', 'handrail broken',
      'nosing missing', 'nosing loose', 'nosing damaged', 'nosing worn',
      // Issues
      'stair hazard', 'step hazard', 'fall hazard', 'trip hazard',
      'uneven steps', 'irregular steps', 'steep stairs', 'narrow stairs'
    ],
    'Lighting inadequate': [
      // Core terms
      'lighting', 'lights', 'light', 'lit', 'illumination', 'illuminated',
      // Misspellings
      'lightng', 'lighitng', 'ligting', 'litghing', 'ligthing',
      // Conditions
      'inadequate lighting', 'insufficient lighting', 'poor lighting', 'bad lighting',
      'dark', 'darkness', 'too dark', 'very dark', 'pitch dark',
      'dim', 'dimly', 'dimly lit', 'dim lighting', 'low light', 'low lighting',
      'no light', 'no lights', 'no lighting', 'unlit', 'unlighted',
      'light out', 'lights out', 'light failure', 'light not working',
      // Issues
      'visibility poor', 'poor visibility', 'cannot see', 'hard to see',
      'shadow', 'shadows', 'shadowy', 'dark areas', 'dark corners',
      'flickering', 'flicker', 'intermittent', 'unreliable lighting',
      // Types
      'task lighting', 'general lighting', 'emergency lighting', 'backup lighting',
      'temporary lighting', 'work lighting', 'area lighting', 'spot lighting'
    ],
    'Overcrowded': [
      // Core terms
      'overcrowded', 'overcrowding', 'crowded', 'crowding', 'crowd',
      // Misspellings
      'over crowed', 'overcroweded', 'croweded', 'croded', 'crowdd',
      // Terms
      'congested', 'congestion', 'packed', 'jam packed', 'jammed',
      'too many people', 'too many workers', 'too many persons', 'overpopulated',
      'capacity exceeded', 'over capacity', 'exceeds capacity', 'beyond capacity',
      'bottleneck', 'bottle neck', 'bottle-neck', 'pinch point', 'choke point',
      // Areas
      'crowded area', 'congested area', 'busy area', 'high traffic area',
      'crowded walkway', 'crowded corridor', 'crowded stairway', 'crowded room',
      // Issues
      'space limitation', 'limited space', 'cramped', 'cramped conditions',
      'inadequate space', 'insufficient space', 'not enough room', 'tight space',
      'maximum occupancy', 'occupancy limit', 'person limit', 'occupancy exceeded'
    ]
  },

  'Worker Welfare': {
    'Water unavailable': [
      // Core terms
      'water', 'waters', 'drinking water', 'potable water', 'fresh water',
      // Misspellings
      'watter', 'watre', 'watrer', 'wate', 'drnking water',
      // Types
      'drinking water', 'clean water', 'fresh water', 'safe water', 'cold water',
      'water supply', 'water source', 'water point', 'water tap', 'water cooler',
      'water dispenser', 'water fountain', 'drinking fountain', 'water bottle',
      // Issues
      'no water', 'water unavailable', 'water not available', 'water missing',
      'water shortage', 'lack of water', 'without water', 'water absent',
      'water not provided', 'no drinking water', 'no potable water',
      'contaminated water', 'unsafe water', 'dirty water', 'unclean water',
      // Related
      'hydration', 'hydrate', 'hydrating', 'dehydration', 'thirst', 'thirsty',
      'water station', 'hydration station', 'water break', 'drinking break'
    ],
    'Toilet unclean': [
      // Core terms
      'toilet', 'toilets', 'restroom', 'restrooms', 'washroom', 'washrooms',
      // Misspellings
      'toilte', 'toliet', 'toielt', 'toilett', 'restrom', 'washrom',
      // Types
      'wc', 'w.c', 'lavatory', 'lavatories', 'bathroom', 'bathrooms',
      'latrine', 'latrines', 'porta potty', 'portapotty', 'portable toilet',
      'chemical toilet', 'temporary toilet', 'site toilet', 'welfare toilet',
      // Issues
      'toilet unclean', 'unclean toilet', 'dirty toilet', 'toilet dirty',
      'toilet condition', 'poor condition', 'unsanitary', 'unhygienic',
      'toilet blocked', 'blocked toilet', 'toilet not working', 'toilet broken',
      'toilet full', 'toilet overflow', 'smell', 'smelly', 'odor', 'odour',
      'no toilet paper', 'toilet paper missing', 'soap missing', 'no soap',
      // Sanitation
      'sanitation', 'sanitary', 'hygiene', 'hygienic', 'cleanliness',
      'hand washing', 'handwashing', 'hand wash', 'wash hands'
    ],
    'Rest area missing': [
      // Core terms
      'rest area', 'rest areas', 'break area', 'break areas', 'rest room',
      // Misspellings
      'rest aire', 'rest aria', 'break aire', 'rest arear', 'breakarea',
      // Types
      'canteen', 'canteens', 'mess room', 'mess hall', 'eating area', 'dining area',
      'shelter', 'shelters', 'sheltered area', 'covered area', 'shaded area',
      'shade', 'shade area', 'cooling area', 'warming area', 'heated area',
      'welfare', 'welfare facilities', 'welfare facility', 'welfare unit',
      'site cabin', 'site office', 'portakabin', 'welfare cabin',
      // Issues
      'no rest area', 'rest area missing', 'missing rest area', 'rest area unavailable',
      'no shelter', 'shelter missing', 'no canteen', 'canteen missing',
      'inadequate welfare', 'insufficient welfare', 'poor welfare', 'welfare inadequate',
      'no break room', 'break room missing', 'nowhere to rest', 'nowhere to sit',
      // Features
      'seating', 'seats', 'chairs', 'benches', 'tables', 'heating', 'cooling', 'ventilation'
    ],
    'First aid kit empty': [
      // Core terms
      'first aid', 'first-aid', 'firstaid', 'first aid kit', 'first aid box',
      // Misspellings
      'frist aid', 'first aide', 'firsst aid', 'first iad', 'fist aid',
      // Types
      'medical', 'medical kit', 'medical supplies', 'medical equipment',
      'first aid supplies', 'first aid equipment', 'first aid contents',
      'first aid station', 'first aid point', 'first aid room', 'medical room',
      'trauma kit', 'emergency kit', 'workplace first aid', 'travel first aid',
      // Contents
      'bandage', 'bandages', 'dressing', 'dressings', 'plaster', 'plasters',
      'sterile', 'sterile dressing', 'gauze', 'gauze pad', 'tape', 'medical tape',
      'antiseptic', 'antiseptic wipe', 'eye wash', 'eyewash', 'saline',
      'burn dressing', 'burn gel', 'triangular bandage', 'gloves', 'medical gloves',
      // Issues
      'first aid empty', 'empty first aid', 'first aid kit empty', 'kit empty',
      'supplies missing', 'contents missing', 'expired contents', 'expired supplies',
      'first aid incomplete', 'incomplete kit', 'first aid inadequate',
      'first aid inspection', 'first aid check', 'restock', 'restocking'
    ]
  },

  'Noise': {
    'Hearing zone unmarked': [
      // Core terms
      'hearing zone', 'hearing zones', 'noise zone', 'noise zones',
      // Misspellings
      'hearng zone', 'hearing zoen', 'niose zone', 'nosie zone',
      // Types
      'hearing protection area', 'hearing protection zone', 'mandatory hearing area',
      'ear protection zone', 'ear protection area', 'hpp zone', 'hpp area',
      'noise area', 'high noise area', 'loud area', 'noisy area',
      'designated zone', 'designated area', 'controlled zone', 'restricted zone',
      // Issues
      'zone unmarked', 'unmarked zone', 'no marking', 'marking missing',
      'zone not marked', 'area not marked', 'sign missing', 'no sign',
      'signage missing', 'no signage', 'boundary not marked', 'boundary unmarked',
      'zone not identified', 'zone unknown', 'zone unclear',
      // Signs
      'hearing protection sign', 'ear protection sign', 'mandatory sign',
      'noise warning sign', 'warning sign', 'blue sign', 'ppe sign'
    ],
    'Source uncontrolled': [
      // Core terms
      'noise source', 'sound source', 'source', 'sources',
      // Misspellings
      'niose source', 'noise soure', 'noies source', 'nois source',
      // Terms
      'uncontrolled', 'uncontrolled noise', 'uncontrolled source', 'not controlled',
      'noise reduction', 'noise control', 'source control', 'engineering control',
      'silencer', 'silencers', 'muffler', 'mufflers', 'attenuator', 'attenuators',
      'enclosure', 'enclosures', 'acoustic enclosure', 'sound enclosure',
      'noise barrier', 'sound barrier', 'acoustic barrier', 'screen', 'screening',
      'damping', 'damper', 'dampers', 'vibration damping', 'anti-vibration',
      // Issues
      'no control', 'control missing', 'no silencer', 'silencer missing',
      'no enclosure', 'enclosure missing', 'barrier missing', 'no damping',
      'source not treated', 'untreated source', 'exposed source'
    ],
    'Exposure excessive': [
      // Core terms
      'exposure', 'exposed', 'exposing', 'noise exposure', 'sound exposure',
      // Misspellings
      'expsoure', 'exposrue', 'expsure', 'exposer', 'expossure',
      // Levels
      'excessive', 'excessive exposure', 'overexposure', 'over exposure',
      'over limit', 'above limit', 'exceeds limit', 'limit exceeded',
      'high exposure', 'prolonged exposure', 'continuous exposure', 'long exposure',
      // Measurement
      'time weighted', 'time-weighted average', 'twa', 'daily exposure', 'leq',
      'dosimeter', 'dosimetry', 'noise dosimeter', 'dose', 'noise dose',
      'noise level', 'sound level', 'decibel', 'db', 'dba', 'db(a)',
      // Limits
      'action level', 'action value', 'lower action', 'upper action',
      'exposure limit', 'exposure limit value', 'elv', 'oel', 'occupational exposure',
      // Effects
      'hearing damage', 'hearing loss', 'hearing impairment', 'tinnitus', 'nihl',
      'noise induced', 'noise-induced hearing loss', 'permanent damage'
    ]
  },

  'General Site Issues': {
    'Unclassified': [
      // Core terms
      'issue', 'issues', 'problem', 'problems', 'concern', 'concerns',
      // Misspellings
      'isue', 'isseu', 'isssue', 'problm', 'problme', 'concen',
      // Terms
      'observation', 'observations', 'finding', 'findings', 'noted', 'observed',
      'unsafe', 'unsafe act', 'unsafe condition', 'unsafe practice', 'unsafe situation',
      'hazard', 'hazards', 'hazardous', 'danger', 'dangerous', 'risky', 'risk',
      'deficiency', 'deficiencies', 'defect', 'defects', 'fault', 'faults',
      'non-compliance', 'noncompliance', 'non compliance', 'violation', 'breach',
      // General
      'general', 'general issue', 'general concern', 'general observation',
      'miscellaneous', 'misc', 'other', 'other issue', 'various', 'unspecified'
    ],
    'Multiple factors': [
      // Core terms
      'multiple', 'multiples', 'several', 'various', 'numerous', 'many',
      // Misspellings
      'mutiple', 'multple', 'multipel', 'sevral', 'varios',
      // Terms
      'combination', 'combinations', 'combined', 'combining', 'combined factors',
      'different issues', 'different factors', 'different problems', 'various issues',
      'multiple factors', 'multiple issues', 'multiple concerns', 'multiple hazards',
      'several factors', 'several issues', 'several concerns', 'several hazards',
      'compound', 'compounded', 'cumulative', 'accumulated', 'aggregate',
      // Complex
      'complex issue', 'complex situation', 'complex problem', 'interrelated',
      'interconnected', 'overlapping', 'overlapping issues', 'contributing factors'
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

  // STEP 2: Detect HAZARD-SPECIFIC FACTORS across ALL hazards
  // Search all hazard categories for matching keywords
  for (const [hazardCategory, specificFactors] of Object.entries(HAZARD_SPECIFIC_FACTORS)) {
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
            category: hazardCategory // Use the hazard category where this factor is defined
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
 * Also builds byFactorHazard mapping for factor-to-hazard drill-down
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
  const byFactorHazard = {} // Maps factor -> { hazard -> count }
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

          // Build factor -> hazard mapping
          if (hazardName) {
            if (!byFactorHazard[name]) {
              byFactorHazard[name] = {}
            }
            byFactorHazard[name][hazardName] = (byFactorHazard[name][hazardName] || 0) + 1
          }
        }
      })
    }
  })

  const total = filtered.length
  const factors = Object.entries(factorCounts)
    .map(([name, count]) => ({
      name,
      factor: name, // Backward compatibility alias
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
    // Factor to hazard mapping for drill-down
    byFactorHazard,
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
  const causes = detectAllCausesUnified(description, options.hazardName || null)
  // Add 'factor' property for backward compatibility (some components use f.factor instead of f.name)
  return causes.map(c => ({
    ...c,
    factor: c.name
  }))
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
