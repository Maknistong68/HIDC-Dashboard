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
    'Banksman absent': [
      // Core terms
      'banksman', 'banksmen', 'banks man', 'banks-man', 'bankswoman',
      // Misspellings
      'bankman', 'bankmans', 'banksmn', 'bansman', 'banksmen', 'bacnksman',
      // Alternative roles
      'spotter', 'spotters', 'spot man', 'no spotter', 'spotter absent',
      'signaller', 'signallers', 'signaler', 'signalers', 'signal man',
      'signalman', 'signalmen', 'signalperson',
      'guide', 'guides', 'guiding', 'guided', 'no guide', 'guide absent',
      'flagman', 'flagmen', 'flag man', 'flagger', 'flaggers',
      'traffic marshal', 'traffic controller', 'traffic management',
      // Issues
      'no banksman', 'banksman absent', 'banksman missing', 'missing banksman',
      'without banksman', 'banksman not present', 'banksman left',
      'reversing without', 'unsupervised reversing', 'unguided',
      'no signals', 'signals not used', 'hand signals', 'radio communication'
    ],
    'Exclusion zone breach': [
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
      'zone inadequate', 'zone too small', 'zone barriers', 'zone demarcation'
    ],
    'Blind spot': [
      // Core terms
      'blind spot', 'blind spots', 'blindspot', 'blindspots', 'blind-spot',
      // Misspellings
      'blnd spot', 'blind sopt', 'blidspot', 'blind spott',
      // Visibility
      'blind area', 'blind areas', 'visibility', 'poor visibility',
      'cannot see', 'can not see', 'could not see', 'no visibility',
      'obstructed view', 'view obstructed', 'blocked view', 'view blocked',
      'limited visibility', 'restricted view', 'sight line', 'line of sight',
      // Equipment
      'mirror', 'mirrors', 'side mirror', 'rear mirror', 'wing mirror',
      'camera', 'cameras', 'reversing camera', 'rear camera', 'backup camera',
      'rear view', 'rearview', 'rear-view', 'reverse view',
      'monitor', 'display', 'screen', 'cctv',
      // Issues
      'mirror missing', 'mirror broken', 'mirror dirty', 'mirror adjusted',
      'camera not working', 'camera obscured', 'camera dirty'
    ],
    'Equipment defect': [
      // Core terms
      'defect', 'defects', 'defective', 'deficiency', 'deficiencies',
      // Misspellings
      'defct', 'deffect', 'defet', 'defecte', 'defetive', 'deffective',
      // Issues
      'fault', 'faults', 'faulty', 'faulted', 'malfunction', 'malfunctioning',
      'broken', 'broke', 'breaking', 'damaged', 'damage', 'damaging',
      'not working', 'doesn\'t work', 'won\'t work', 'stopped working',
      'out of order', 'out of service', 'inoperable', 'inoperative',
      'equipment failure', 'mechanical failure', 'hydraulic failure',
      'engine failure', 'brake failure', 'steering failure',
      // Inspection
      'pre-use check', 'preuse', 'daily check', 'daily inspection',
      'defect report', 'defect reported', 'defect tag', 'quarantine',
      'machine defect', 'plant defect', 'vehicle defect'
    ],
    'Pedestrian conflict': [
      // Core terms
      'pedestrian', 'pedestrians', 'pedestrain', 'pedestiran',
      // Misspellings
      'pedetrian', 'pedestrien', 'pedistrian', 'pedestrain', 'pedestrianss',
      // Conflict types
      'pedestrian conflict', 'pedestrian interface', 'pedestrian interaction',
      'pedestrian crossing', 'pedestrian crossings', 'people crossing',
      'pedestrian route', 'pedestrian routes', 'pedestrian path',
      'foot traffic', 'foot traffic area', 'walking area',
      'pedestrian separation', 'segregation', 'no segregation',
      'pedestrian walkway', 'walkway', 'walkways', 'footpath',
      // Incidents
      'pedestrian struck', 'struck pedestrian', 'hit pedestrian',
      'pedestrian injury', 'pedestrian near miss', 'close call',
      'pedestrian in path', 'people in way', 'workers nearby'
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
      // Hydration
      'water', 'waters', 'fluid', 'fluids', 'hydration', 'hydrate', 'hydrated',
      'drinking water', 'potable water', 'water intake', 'fluid intake',
      'water consumption', 'fluid replacement', 'electrolyte', 'electrolytes',
      // Symptoms
      'thirst', 'thirsty', 'dry mouth', 'dark urine', 'no urine',
      'headache', 'dizziness', 'dizzy', 'fatigue', 'weakness',
      // Issues
      'not drinking', 'insufficient water', 'no water available',
      'water not provided', 'water station', 'hydration station'
    ],
    'No rest breaks': [
      // Core terms
      'rest break', 'rest breaks', 'rest period', 'rest periods',
      // Misspellings
      'rest brak', 'rest braek', 'rest berak', 'restbreak',
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
