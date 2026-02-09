import { filterByHazard, normalizeText } from './incidentHelpers'

/**
 * Root Cause Engine - Phrase-Based Detection System
 *
 * @version 3.0.0
 * @description Production-ready factor detection using phrase-based matching:
 *   - Strong Patterns: Specific phrases that definitively indicate a factor
 *   - Exclusion Patterns: Phrases that indicate the observation is NOT about this factor
 *   - Ambiguous Keywords: Words that only count when part of specific phrases
 *   - Scoring System: Confidence-based detection with thresholds
 *
 * KEY PRINCIPLES:
 * 1. Match PHRASES, not single keywords
 * 2. "loader" alone doesn't match - "manual loading" or "overloaded" does
 * 3. "loading point" (location) doesn't match Material Handling
 * 4. "during inspection" (context) doesn't match Inspections unless it's ABOUT inspection
 */

// ============================================================================
// PHRASE-BASED FACTOR DETECTION CONFIGURATION
// ============================================================================

/**
 * Factor detection rules using phrase-based matching
 *
 * Each factor has:
 * - strongPatterns: Phrases that strongly indicate this factor (score +10 each)
 * - moderatePatterns: Phrases that moderately indicate this factor (score +5 each)
 * - exclusionPatterns: Phrases that indicate NOT this factor (score -15 each)
 * - minimumScore: Threshold to include this factor (default: 5)
 */
export const FACTOR_PHRASE_CONFIG = {
  'Inspections': {
    strongPatterns: [
      // Missing/lacking inspection
      'not inspected', 'without inspection', 'no inspection', 'uninspected',
      'missing inspection', 'lack of inspection', 'failed inspection',
      'inspection not carried', 'inspection not conducted', 'inspection not done',
      'inspection not performed', 'inspection not updated', 'inspection not available',
      'inspection was not', 'inspection has not', 'inspection overdue',
      // Inspection compliance
      'inspection checklist', 'pre-use inspection', 'preuse inspection',
      'pre-start inspection', 'prestart inspection', 'daily inspection',
      'weekly inspection', 'monthly inspection', 'annual inspection',
      'equipment inspection', 'vehicle inspection', 'plant inspection',
      // VVS/NEOM Veri-Fi inspection status - comprehensive patterns
      'vvs inspection', 'veri-fi inspection', 'verifi inspection', 'neom inspection',
      'veri-fi access denied', 'verifi access denied', 'neom veri-fi access denied',
      'neom veri-fi red', 'veri-fi red status', 'veri-fi red category',
      'neom verifi', 'neom vvs', 'vvs app', 'vvs application',
      'access denied status', 'access denied red status', 'under access denied',
      'with access denied status', 'found with access denied',
      'is in access denied', 'is on access denied',
      'access denied (red)', 'access denied red', '(red) vehicles',
      'neom veri fi access', 'veri fi access', 'neom veri fi',
      'without qr code', 'no qr code', 'expired qr code', 'red qr code',
      'qr code in red', 'qr code not', 'qr code expired',
      // QR Veri fi patterns (with space variations)
      'neom qr veri fi', 'does not have neom qr', 'not have neom qr veri fi',
      'does not have neom qr veri fi', 'without neom qr',
      'without neom verification', 'expired neom verification',
      'without neom veri-fi', 'without neom verifi',
      'without proper neom', 'without verifiable',
      'red status operated', 'red status being operated', 'red status observed',
      'red status operating', 'with red status operating', 'with red status',
      'in red status', 'with the red status', 'found with red status',
      'found a trailer', 'trailer with red status', 'equipment with red status',
      'vehicle with red status', 'dump truck with red status', 'red category dump truck',
      'red category equipment', 'red category vehicle', 'red status equipment',
      'red status vehicles', 'red status still operating', 'still operating in site',
      // Bar code / NEOM bar code patterns (including misspellings)
      'bar code expired', 'barcode expired', 'baar code expired', 'baar code',
      'without neom bar code', 'without neom barcode', 'without neom baar code',
      'no bar code', 'no barcode', 'no baar code', 'neom bar code expired',
      'neom barcode expired', 'neom baar code expired', 'find excavator baar code',
      'come on side without neom', 'without baar code', 'expired baar code',
      'inter in work location', 'without permission and baar',
      // Number plate / Registration
      'without nambr plate', 'without number plate', 'no number plate',
      'number plate missing', 'without registration', 'no registration',
      'without registration', 'steer skid loader without registration',
      'denied access for', 'expired neom verifi',
      'not subjected to neom', 'overdue for inspection',
      // Positive NEOM inspection status
      'access granted status', 'access verified status', 'verified status',
      'green status under', 'with green status', 'found with green status',
      'neom verification access', 'valid neom', 'approved on the vvs',
      // Certification/documentation inspection
      'third party inspection', '3rd party inspection', 'tuv inspection',
      'colour code', 'color code', 'inspection tag', 'inspection sticker',
      'checklist not updated', 'checklist was not', 'checklist not available',
      'checklist not filled', 'checklist found not', 'checklist incomplete',
      'daily plant check', 'prestart checklist', 'pre-start checklist',
      // Operators not inspecting plants daily
      'not inspecting the plants daily', 'operators not inspecting', 'not inspecting plants daily',
      'records not being updated on daily', 'records not being updated', 'on daily basis',
      'plant operators not inspecting', 'construction plant operators not inspecting',
      // Equipment found without NEOM inspection
      'excavating at site without neom inspection', 'without neom inspection and qr',
      'found excavating at site without', 'excavator found excavating at site',
      'violating neom requirements', '3rd party inspection', 'third party inspection',
      '3rd party inspection for', 'inspection for the excavator', 'expiring on',

      // === SCAFFOLD TAGS (inspection/authorization system) ===
      'scaffold tag', 'scaffolding tag', 'scaff tag', 'scaff-tag',
      'scaffold tag not', 'scaffold tag expired', 'scaffold tag missing',
      'scaffolding tag not', 'scaffolding tag expired', 'scaffolding tag missing',
      'scaff tag not', 'scaff tag expired', 'scaff tag missing',
      'no scaffold tag', 'no scaffolding tag', 'no scaff tag', 'without scaff tag',
      'without scaffold tag', 'without any scaff tag', 'without scaffolding tag',
      'expired scaffold tag', 'expired scaffolding tag', 'expired scaff tag',
      'red tag', 'red tagged', 'red-tagged', 'red-tag',
      'green tag', 'green tagged', 'green-tagged', 'green-tag',
      'tag not available', 'tag expired', 'tag missing', 'tag not updated',
      'tagging system', 'tagging system not', 'tag found without',
      'updated scaffold tag', 'valid scaffold tag', 'scaffold tag updated',
      'tag has been updated', 'scaff tag updated', 'scaff tag valid',

      // Positive inspection observations
      'inspection conducted', 'inspection carried out', 'inspection performed',
      'inspection completed', 'inspected and found', 'inspection found',
      'green status', 'valid inspection', 'inspection valid',
      'inspection checklist updated', 'checklist updated', 'checklist available',
      'checklist duly filled', 'checklist found duly',

      // === EQUIPMENT CHECKLISTS ===
      'check list', 'checklist', 'check list was', 'checklist was',
      'check list found', 'checklist found', 'check list available',
      'checklist available', 'check list updated', 'checklist updated',
      'check list not updated', 'checklist not updated', 'check list unavailable',
      'checklist unavailable', 'check list not available', 'checklist not available',
      'up to date', 'up to date status', 'in updated status', 'updated status',
      'found available and updated', 'found unavailable', 'found updated',
      'boom truck check list', 'boom truck checklist', 'boom truck check',
      'crane check list', 'crane checklist', 'crane check', 'crane check list was',
      'excavator check list', 'excavator checklist', 'excavator check',
      'dg generator check list', 'dg check list', 'generator check list',
      'skid loader check list', 'skid loader checklist', 'wheel loader check list',
      'dump truck check list', 'dump truck checklist', 'dumb truck check list',
      'grader check list', 'grader checklist', 'tanker check list',
      'ambulance check list', 'ambulance checklist', 'first aid box check list',
      'firstaid box checklist', 'firstaid check list', 'first aid check list',
      'toilet inspection checklist', 'toilet checklist', 'toilet check list',
      'monthly color coding', 'monthly color-coding', 'color coding was',
      'color coding missing', 'colour coding', 'colour coding was',
      'color code updated', 'colour code updated', 'updated color coding',
      'security entry log', 'security log sheet', 'visitor log sheet',
      'visitors sign in list', 'sign in list', 'visitor sign in', 'visitors log',
      'visitor log', 'visitors log sheet', 'entry log sheet', 'entry exit log',
      // Misspellings
      'chek list', 'checklst', 'checlist', 'cehcklist', 'fristaid',

      // === TOILET INSPECTION / REQUIREMENTS ===
      'toilet facilities and ensuring', 'ensuring that all necessary requirements',
      'requirements are fully met', 'updated the checklist', 'reflect the current status',
      'inspecting the crusher area', 'toilet found in used', 'no daily checklist',
      'ensure that maintained', 'checklist for ensure', 'toilet checklist for',
      'inspecting the crusher area\'s toilet', 'crusher area\'s toilet facilities',
      'all necessary requirements are fully met', 'i updated the checklist',
      'during morning equipment inspection', 'during site inspection',

      // === SECURITY INSPECTION / AUDIT ===
      'security inspection', 'security audit', 'scheduled security inspection',
      'scheduled security audit', 'security inspection report', 'security audit report',
      'security deficiencies', 'security deficiency', 'security violations',
      'security performance', 'security performance rating', 'site security rating',
      'security compliance', 'security non-compliance', 'security assessment',
      // CCTV and surveillance systems (inspection/equipment issue)
      'cctv not installed', 'cctv not operational', 'cctv non-functional',
      'no cctv', 'cctv system', 'surveillance cameras', 'surveillance system',
      'surveillance non-operational', 'cameras non-operational', 'cameras not working',
      'cctv was not', 'cctv found', 'surveillance found', 'monitoring system',
      // Log sheets and records
      'no log sheet', 'log sheet not', 'log sheet missing', 'visitor log',
      'security log', 'entry log', 'log not maintained', 'log sheet maintained'
    ],
    moderatePatterns: [
      'inspected', 'uninspected', 'inspection', 'checklist',
      'qr code', 'qrcode', 'vvs', 'veri-fi', 'verifi',
      'tuv', 'tpc certificate', 'colour code', 'color code'
    ],
    exclusionPatterns: [
      // Behavior issues (not inspection)
      'speaking on phone', 'phone while', 'using phone', 'mobile phone',
      'over speeding', 'overspeeding', 'speeding',
      'standing close', 'too close to', 'unsafe proximity',
      // PPE issues (separate factor)
      'without wearing', 'not wearing ppe', 'without ppe', 'no ppe',
      'safety shoes', 'hard hat', 'helmet not', 'gloves',
      'not wearing seatbelt', 'without seatbelt', 'not fastening',
      // Welfare (not inspection)
      'toilet', 'welfare', 'drinking water',
      // Geological (not inspection)
      'loose rock', 'rock fall',
      // Material handling (separate factor)
      'overloaded', 'manual loading', 'manual unloading', 'line of fire',
      'man machine interface', 'lifting purpose',
      // Physical access roads/routes (not inspection status)
      'access road', 'access route', 'pedestrian access', 'access towards',
      'zone access', 'hauling access', 'internal access'
    ],
    minimumScore: 5
  },

  'Material Handling': {
    strongPatterns: [
      // Manual handling activities - SPECIFIC phrases
      'manual loading', 'manual unloading', 'manual handling',
      'manual material loading', 'manual material unloading',
      'performing manual loading', 'performing manual unloading',
      'carrying out manual', 'operatives loading', 'operatives unloading',
      'manually loading', 'manually unloading',
      'shoveling spoil', 'shoveling material', 'shoveling into',
      // Unsafe loading/unloading with equipment
      'loading material', 'unloading material', 'material loading', 'material unloading',
      'loading into bucket', 'unloading from bucket', 'into bucket', 'from bucket',
      'into excavator bucket', 'from excavator bucket', 'into backhoe bucket',
      'from backhoe bucket', 'into telehandler bucket', 'from telehandler bucket',
      'loading whilst', 'unloading whilst', 'loading while', 'unloading while',
      'loaded materials protruding', 'unsecured loaded materials',
      'loading of material', 'unsafe loading of material',
      // Overloading - specific
      'overloaded', 'overloading', 'over loaded', 'over loading',
      'truck overloaded', 'trailer overloaded', 'dumper overloaded',
      'dump truck was overloaded', 'trucks were overloaded',
      'doing overloading', 'not overloading', 'regarding not overloading',
      // Line of fire ONLY when combined with material handling context
      'in line of fire of', 'line of fire of bucket', 'line of fire of loader',
      'operatives in line of fire of', 'workers in line of fire of',
      'standing in line of fire of bucket',
      // Rigging/lifting materials
      'rigging', 'slinging', 'lifting material', 'lifting load',
      'unsafe lifting', 'lifting of crusher', 'lifting and shifting',
      'load securing', 'lashing belt', 'load not secured',
      'securing the materials', 'materials with lashing',
      // Storage of materials
      'unsafe storage', 'material storage',
      'stacking', 'stacked improperly', 'unstable stack',
      // Transferring/moving materials
      'transferring material', 'moving material', 'shifting material',
      'shifting of porta', 'material into', 'material from',
      'removing materials from stockpile', 'removing materials from',
      'falling of material', 'falling material',

      // === LIFTING EQUIPMENT ===
      'spreader beam', 'lifting spreader beam', 'spreader beam improperly',
      'lifting belt', 'lifting belt color', 'lifting belt monthly',
      'chain sling', 'chain slings', 'chain sling inspection',
      'lifting equipment', 'lifting gear', 'lifting arrangement',
      'lifting activity', 'lifting operation', 'ongoing lifting',
      'during lifting', 'lifting belt monthly color', 'lifting monthly color',

      // === LINE OF FIRE ===
      'line of fire', 'in line of fire', 'working near moving equipment',
      'working near moving', 'near moving equipment', 'line of fire hazard',
      'line of fire safety', 'probability of mepi', 'increase the probability',
      'mepi hazard', 'positioned directly beneath', 'beneath suspended load',
      'beneath the suspended', 'underneath suspended', 'directly beneath',
      'working near roller', 'near roller compactor', 'red zone of compactor',
      'red zone of excavator', 'inside red zone'
    ],
    moderatePatterns: [
      'hoist', 'hoisting', 'sling', 'shackle', 'rigging gear',
      'lifting gear'
    ],
    exclusionPatterns: [
      // VVS/Inspection status (not material handling)
      'green status under', 'red status under', 'vvs', 'veri-fi', 'verifi',
      'neom verification', 'verification system', 'access granted', 'access denied',
      'qr code', 'qrcode', 'inspection checklist', 'checklist not updated',
      // Location mentions (loading point as place, not activity)
      'at zone 3 loading', 'at zone 4 loading', 'at zone 5 loading',
      'at zone 6 loading', 'at zone 7 loading', 'at the zone',
      'loading point', 'at location zone',
      // Equipment inspection (not material handling)
      'equipment inspection', 'vehicle inspection', 'inspection conducted',
      'inspection carried', 'inspection performed', 'pre-use inspection',
      // Phone/behavior issues
      'speaking on phone', 'phone while', 'using phone',
      // Pure Man-Machine Interface observations (NOT material handling)
      // These are about MMI training, awareness, or general pedestrian safety
      'man machine interface training', 'man-machine interface training',
      'mmi training', 'mepi training', 'interface training',
      'man machine interface awareness', 'interface awareness program',
      'trained on the man machine', 'training regarding man machine',
      'training for man machine', 'tbt was conducted', 'tbt regarding',
      'knowledge shared', 'on job training', 'onsite training',
      'physical demonstration', 'awareness program',
      // MMI without material handling context
      'observed man machine interface', 'observed man-machine interface',
      'man machine interface observed', 'man-machine interface observed',
      'working in man-machine interface', 'working in man machine interface',
      'set up in man-machine interface', 'situated on man-machine interface',
      'in man-machine interface area', 'in man machine interface area',
      'prevent man machine interface', 'prevent man-machine interface',
      'protect man machine interface', 'protect from man machine',
      'man machine interface from', 'risk of man machine interface',
      'potential man-machine interface', 'man-machine interface issue',
      'man machine interface at', 'to man machine interface',
      // Pedestrian/walking observations (not material handling)
      'workers walking', 'walking beside', 'walking in the',
      'worker was walking', 'workers were walking', 'passing through',
      'taking a shortcut', 'using undesignated walkway',
      'roaming close to', 'standing too close', 'too close to moving',
      'moving closely at the back', 'close proximity of working',
      // Flagman/supervision without material handling
      'flagman at site', 'flagman has been assigned', 'flagman assigned',
      'flagman not assigned', 'trained flagman',
      // Barriers/zones without material handling
      'barricaded to prevent', 'exclusion zone', 'no exclusion zone',
      'rest shelter', 'welfare area', 'office area',
      'pick and drop', 'drop off point', 'bus pick up',
      // Collisions/incidents (separate issue)
      'collision', 'collided', 'property damage', 'property incident',
      // PPE storage (not material handling)
      'improper storage of face shield', 'storage of ppe', 'ppe storage'
    ],
    minimumScore: 10  // Higher threshold - require strong material handling context
  },

  'PPE': {
    strongPatterns: [
      // Missing PPE - specific phrases (including "did not wear" variations)
      'not wearing helmet', 'without helmet', 'no helmet', 'missing helmet',
      'without safety helmet', 'no safety helmet', 'found this worker without',
      'did not wear helmet', 'didnt wear helmet', 'didn\'t wear helmet',
      'not wearing hard hat', 'without hard hat', 'no hard hat',
      'did not wear hard hat',
      'not wearing gloves', 'without gloves', 'no gloves', 'missing gloves',
      'did not wear gloves', 'without safety gloves',
      'not wearing goggles', 'without goggles', 'no goggles', 'missing goggles',
      'did not wear goggles', 'without safety goggles', 'without eye protection',
      'not wearing safety shoes', 'without safety shoes', 'no safety shoes',
      'did not wear safety shoes', 'without shoes', 'with out safety shoes',
      'didnt wear safety glasses', 'didnt wear safety', 'didnt wear helmet',
      'not wearing boots', 'without boots', 'no boots', 'did not wear boots',
      'not wearing vest', 'without vest', 'no vest', 'missing vest',
      'did not wear vest', 'without reflective vest',
      'not wearing harness', 'without harness', 'no harness', 'did not wear harness',
      'not wearing seatbelt', 'without seatbelt', 'no seatbelt', 'seatbelt compliance',
      'not wearing seat belt', 'without seat belt', 'no seat belt',
      'not fastening seat belt', 'not fastening seatbelt', 'bypassing seat belt',
      'did not wear seat belt', 'did not wear seatbelt',
      'not wearing on the seatbelt', 'not wearing the seatbelt',
      'not wearing ear plug', 'without ear plug', 'no ear plug', 'no ear plugs',
      'not wearing face shield', 'without face shield', 'no face shield',
      'not wearing respirator', 'without respirator', 'no respirator',
      'not wearing safety glass', 'without safety glass', 'no safety glass',
      'without glasses', 'no glasses', 'did not wear safety glass',
      'not wearing dust mask', 'without dust mask', 'no dust mask',
      // Generic PPE missing phrases - multiple variations
      'not wearing ppe', 'without ppe', 'no ppe', 'missing ppe',
      'without mandatory ppe', 'without proper ppe', 'without basic ppe',
      'without basic mandatory ppe', 'without required ppe', 'without any ppe',
      'without any proper ppe', 'not wearing mandatory', 'not wearing proper',
      'not using mandatory ppe', 'not using their mandatory ppe',
      'not using ppe', 'not using proper ppe', 'not complying with ppe',
      'ppe not worn', 'improper ppe', 'inadequate ppe', 'lack of ppe',
      'failed to wear', 'did not wear ppe', 'did not wear',
      'substandard helmet', 'substandard ppe', 'non-standard goggles',
      // Additional PPE phrases
      'without adequate ppe', 'adequate ppe', 'without reflectorized vest',
      'reflectorized vest', 'without reflective vest', 'come to site without',
      'arrived without helmet', 'arrived on site without', 'on site without',
      'without mandatory safety gloves', 'mixing concrete with his hand',
      'without safety gloves', 'harness improperly fitted', 'improperly fitted',
      'harness that was improperly', 'harness was loose', 'loose harness',
      'harness not suitable', 'which is not suitable', 'fall arrest harness',
      'not suitable for this height', 'fall arrest not suitable',
      // Positive PPE observations
      'wearing the required ppe', 'required personal protective',
      'wearing complete ppe', 'complete ppe for the task', 'complying with all required ppe',
      'all required ppe', 'chipping while complying', 'following neom safety standard',

      // === SEATBELT VIOLATIONS (Extended) ===
      'driver was driving without', 'dump truck driver without', 'driver without a seatbelt',
      'truck driver was driving', 'driving on the site without a seatbelt',
      'driving on site without seatbelt', 'without a seatbelt',
      'not fastening their seat belt', 'not fastening his seat belt', 'not fastening seat belt',
      'without fastening seat belt', 'without fastening his seatbelt', 'without fastening of seat belt',
      'bypassing the seat belt', 'bypassing seat belt', 'bypassing it whilst driving',
      'by-passing the seat belt', 'by-passing it whilst', 'found bypassing',
      'driver found not fastening', 'drivers found not fastening', 'found not fastening',
      'tipper truck driver found', 'tipper truck drivers found', 'drivers not fastening',
      'did not fasten the seat belt', 'did not fasten seat belt', 'did not fasten seatbelt',
      'violating seat belt compliance', 'seat belt compliance',
      // Traditional dress violation (PPE)
      'traditional dress', 'kurta pajama', 'found in traditional dress',
      // PPE condition issues
      'damaged ppe', 'worn out ppe', 'defective ppe', 'expired ppe',
      // Positive PPE - wearing properly
      'wearing proper ppe', 'wearing required ppe', 'wearing mandatory ppe',
      'wearing full ppe', 'wearing all ppe', 'with full ppe', 'in full ppe',
      'complying with ppe', 'ppe compliant', 'following ppe',
      'using proper ppe', 'using required ppe', 'using mandatory ppe',
      'anti-vibration gloves', 'using anti-vibration', 'wearing anti-vibration',
      'protective guard', 'using specific ppe', 'with specific ppe',
      'proper safety goggles', 'wearing safety goggles',
      // More positive PPE observations
      'in a full ppe', 'operator in a full ppe', 'found wearing seat belt',
      'wearing seat belt and wearing', 'wearing safety shoes', 'found in a full ppe',
      'working with concrete pump with helmet', 'working with helmet',
      'driver found wearing', 'driver found wearing seat belt',
      // Extended seatbelt violations
      'not in a habit of fastening', 'in a habit of fastening their',
      'not using a seat belt while', 'not using seat belt while driving',
      'operator not using a seat belt', 'driver not using a seat belt',
      'truck operator not using', 'tipper truck operator not using',
      // PPE storage
      'ppe improper storage', 'improper storage of face', 'storage of face shield',

      // === DRIVER PPE ISSUES ===
      'some driver no wear', 'some drivers don\'t', 'driver don\'t have',
      'driver no wear', 'drivers no wear', 'drivers don\'t wear',
      'driver out side without', 'driver outside without', 'driver without healmet',
      'observed not using safety glass', 'not using safety glass', 'not using eye protection',
      'carpenters are not using safety glass', 'carpenters not using safety',
      'carpenter working without using', 'without using eye protection glass',
      'wearing loose clothes', 'wearing home dresses', 'home dresses',
      'poor quality helmet', 'sub standard helmet', 'substandard helmet',
      'majority of the drivers were observed', 'drivers were observed wearing sub',
      // Face mask violations (including misspellings)
      'no wear face mask', 'not wearing face mask', 'without face mask',
      'no face mask', 'person no wear face', 'tickt person no wear',
      'person no wear', 'without wearing safety shoes', 'observed without wearing',
      // Full body harness
      'equipped with full-body harness', 'equipped with harness', 'equipped with full body harness',
      'equipped with harnesses', 'workers equipped with', 'full-body harnesses',
      'full body harnesses', 'full body harness', 'full-body harness',
      'without fall arrest', 'without fall arrest systems', 'fall arrest systems',
      'no fall arrest', 'missing fall arrest', 'fall arrest not',
      'fall protection equipment', 'without fall protection equipment',

      // === TIE-OFF / ANCHORING (Fall Protection) ===
      'not tied off', 'not tie off', 'lanyard not tied', 'lanyard not tie',
      'not anchored', 'not anchoring', 'harness not anchored', 'lanyard not anchored',
      'lanyard not attached', 'not hooked on', 'not hooked to', 'hook not attached',
      '100% anchorage', '100% tie off', '100% tie-off', 'without 100% tie',
      'without tie off', 'failing to tie', 'failing hook', 'failing to hook',
      'fbh not', 'fbh lanyard not', 'fbh lanyard not tie', 'pfas not',
      'without pfas', 'no pfas', 'pfas missing', 'pfas not provided',
      'anchor point', 'acceptable anchor', 'suitable anchor', 'anchor poin',
      'tying off incorrectly', 'tying incorrectly', 'tied off incorrectly',
      'securing anchorage', 'not securing', 'securing 100%',
      'harness lanyard', 'harness and lanyard', 'double lanyard', 'single lanyard',
      'lanyard without shock', 'shock absorber', 'without shock absorber',
      // Working at height without harness
      'working at height without', 'work at height without', 'working from height without',
      'height without using', 'height without harness', 'height without safety harness',
      'let the workers to work from height without', 'exposed to fall',
      'exposed to risk of fall', 'exposed to a fall', 'risk of falling',
      'dismantling scaffold without', 'scaffold without using harness',
      'sitting over the retaining wall', 'walking on the suspended',
      'working on elevated', 'working on the scaffold platform without',
      // Working without proper harness (extended)
      'dismantling the scaffolding without', 'dismantling scaffold without',
      'without using proper safety', 'without proper safety harness',
      'working on the platform without', 'operative working on the platform without',
      'working at height on an unsecured', 'unsecure and damage ladder',
      'unsecure ladder', 'damage ladder', 'unsecured and damaged',
      // PPE violations - boots
      'no steel toe', 'without steel toe', 'long boots with no steel',
      'boots with no steel toe', 'without steel toe and sole',
      // Positive fall protection
      'properly anchored', 'anchored properly', 'tied off properly', 'tie off properly',
      '100% tie off compliant', 'pfas used', 'harness secured', 'lanyard attached',
      'harness point', 'anchor point provided', 'suitable anchoring'
    ],
    moderatePatterns: [
      // Only match these in combination with wearing/not wearing context
      'seat belt', 'seatbelt', 'safety glasses', 'safety goggles',
      'dust mask', 'ear plugs', 'face shield', 'reflective vest',
      'hi-vis vest', 'safety harness', 'eye protection', 'ear protection'
    ],
    exclusionPatterns: [
      // Signage - NOT about PPE compliance
      'ppe signage', 'ppe sign', 'signage installed', 'signage displayed',
      'signage provided', 'signage posted', 'sign board', 'signboard',
      'ppe zone sign', 'mandatory ppe sign', 'non ppe zone',
      'basic ppe signage', '5 point ppe signage', 'ppe sign board',
      // Safety devices - separate factor
      'pwas', 'proximity warning', '360 camera', '360 degree camera',
      'reverse camera', 'beacon light', 'reverse alarm', 'warning system',
      'cameras installed', 'camera not', 'cameras not',
      // Man-machine interface - separate factor
      'no boots on ground', 'boots on ground', 'man machine interface',
      'man-machine interface', 'plant and people interface',
      'plant & people interface', 'poor plant',
      // Inspection/checklist - separate factor
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'verifi',
      'checklist not updated', 'pre-use inspection', 'daily plant check',
      'equipment inspection', 'first aid kit', 'fire extinguisher',
      'green status', 'checklist found', 'checklist duly',
      // Equipment safety - NOT PPE
      'wheel chock', 'wheel choker', 'wheel stopper', 'stopper',
      'chock', 'choker',
      // Collisions/incidents - separate from PPE
      'collision', 'collided', 'overturned', 'roll over', 'rolled over',
      'property damage', 'property incident',
      // Road/traffic issues - NOT PPE
      'safe distance', 'keeping safe distance', 'maintaining safe distance',
      'not maintaining safe distance', 'inadequate width', 'slippery road',
      'road condition', 'single row', 'waiting in',
      // Authorization/access - separate factor
      'unauthorized area', 'without authorization', 'access denied',
      'without sag license', 'without sag driving', 'without license',
      'no sag license', 'no driving license',
      // Housekeeping/environment
      'oil spill', 'spillage', 'oil leak',
      // Equipment issues - NOT PPE
      'bucket shacked', 'fifth wheel', 'hoist', 'curtain on window',
      'tarping', 'tarped', 'loading area', 'unloading area',
      'soil berm', 'ramp', 'backfilling',
      // Training mentions
      'training given', 'training session', 'inducting',
      // Material handling
      'overloaded', 'manual loading', 'line of fire'
    ],
    minimumScore: 10  // Raised threshold - require strong pattern match
  },

  'Training': {
    strongPatterns: [
      // === LACK OF TRAINING - all variations ===
      'not trained', 'without training', 'no training', 'untrained',
      'lack of training', 'insufficient training', 'inadequate training',
      'training not provided', 'training not given', 'training not conducted',
      'not received training', 'did not receive training', 'has not received',
      'training was not', 'training has not', 'training not available',
      // Misspellings
      'not trainned', 'untrainned', 'trainning not', 'no trainning',

      // === INDUCTION/ORIENTATION - all variations ===
      'not inducted', 'without induction', 'no induction', 'uninducted',
      'induction not', 'induction not provided', 'induction not conducted',
      'site induction not', 'safety induction not', 'site specific induction',
      'not oriented', 'without orientation', 'no orientation', 'unoriented',
      'orientation not', 'orientation not provided', 'orientation not conducted',
      // Misspellings
      'inducton not', 'indution not', 'orientaton not',

      // === CERTIFICATE/LICENSE ISSUES ===
      // Expired
      'expired certificate', 'certificate expired', 'certificates expired',
      'expired tpc', 'tpc expired', 'expired third party',
      'expired license', 'license expired', 'licence expired', 'expired licence',
      'expired driving license', 'driving license expired',
      'expired ksa license', 'ksa license expired', 'ksa driving license expired',
      'expired sag license', 'sag license expired',
      // Missing/No
      'no certificate', 'without certificate', 'missing certificate',
      'no tpc', 'without tpc', 'missing tpc', 'tpc not available',
      'no license', 'without license', 'missing license', 'no licence',
      'without licence', 'missing licence', 'licence not available',
      'no driving license', 'without driving license', 'missing driving license',
      'no ksa license', 'without ksa license', 'without ksa driving',
      'no sag license', 'without sag license', 'without sag driving',
      // Invalid
      'invalid certificate', 'invalid tpc', 'invalid license', 'invalid licence',
      'certificate not valid', 'tpc not valid', 'license not valid',
      // Misspellings
      'certficate', 'certificat', 'licens', 'lisence', 'liscense',

      // === COMPETENCY/QUALIFICATION ===
      'not competent', 'incompetent', 'lack of competency', 'without competency',
      'not qualified', 'unqualified', 'lack of qualification', 'without qualification',
      'not authorized to operate', 'unauthorized to operate',
      'not approved to operate', 'not permitted to operate',
      // Work without proper training
      'doing electrical installation works and they were not trained',
      'doing electrical work and not trained', 'electrical works and not trained',
      'found doing electrical', 'workers were found doing', 'workers doing electrical',
      'only trained and competent', 'trained and competent electrician',
      'not trained electrician', 'untrained electrician', 'untrained worker',
      // Misspellings
      'incompetant', 'unqualifed', 'competancy',

      // === POSITIVE TRAINING OBSERVATIONS ===
      // Training provided/conducted
      'training conducted', 'training provided', 'training given',
      'training delivered', 'training session', 'training completed',
      'training has been', 'training was conducted', 'training was provided',
      'on job training', 'on the job training', 'onsite training',
      'on-site training', 'toolbox training', 'safety training',
      'tbt conducted', 'tbt was conducted', 'tbt has been',
      'brief training', 'training arranged', 'arrange a training',

      // === PRE-TASK / LMRA / TOOLBOX TALK ===
      'pre task', 'pre-task', 'pretask', 'pre task conducted', 'pre-task conducted',
      'pre task was conducted', 'pre-task was conducted', 'pre task brief',
      'pre-task brief', 'pre task briefing', 'pre-task briefing',
      'a pre task', 'a pre-task', 'the pre task', 'the pre-task',
      'pre task has been', 'pre-task has been', 'pre task found',
      'lmra', 'lmra conducted', 'lmra was conducted', 'lmra has been conducted',
      'lmra session', 'during lmra', 'the lmra', 'lmra has been',
      'lmra being conducted', 'conducting lmra', 'daily lmra',
      'toolbox talk', 'toolbox talk conducted', 'toolbox talk was conducted',
      'toolbox meeting', 'tool box talk', 'tool box meeting',
      'weekly toolbox', 'weekly safety standout', 'safety standout',
      'safety standout meeting', 'safety standout toll box', 'standout meeting',
      'toolbox has been conducted', 'standout was conducted',
      // Mass TBT variations
      'mass tbt', 'mass tbt conducted', 'mass tbt was', 'tbt was successfully',
      'tbt has been conducted', 'tbt successfully conducted',
      // Hazard awareness
      'aware about the hazards', 'aware of hazards', 'hazards and precautions',
      'precautions before', 'hazards and precautionary', 'identify hazards',
      'related hazards', 'potential hazards', 'associated hazards',
      // Misspellings
      'pretsk', 'pre-taks', 'lrma', 'toollbox', 'toobox', 'tolbox',

      // === NEOM STANDARDS / COMPLIANCE ===
      'neom safety standard', 'neom requirements', 'neom safety standards',
      'following neom safety', 'following neom standard', 'neom requirements standerds',
      'from same company as per neom', 'as per neom requirements',
      'excavator operator was following', 'operator was following neom',
      // Trained personnel
      'trained', 'well trained', 'properly trained', 'fully trained',
      'trained and authorized', 'trained and certified', 'trained operator',
      'trained flagman', 'trained personnel', 'trained workers',
      // Certified/licensed
      'certified', 'valid certificate', 'certificate valid', 'certificates available',
      'valid tpc', 'tpc valid', 'tpc available', 'valid third party',
      'valid license', 'license valid', 'valid licence', 'licence valid',
      'valid driving license', 'driving license valid',
      'valid ksa license', 'ksa license valid', 'approved with license',
      // Induction completed
      'induction completed', 'induction conducted', 'induction provided',
      'orientation completed', 'orientation conducted', 'orientation provided',
      'safety induction', 'site induction', 'inducted', 're-inducted',
      're-inducting', 'inducting'
    ],
    moderatePatterns: [
      'training', 'trained', 'trainee', 'trainer',
      'certificate', 'certification', 'certified',
      'license', 'licence', 'licensed', 'licenced',
      'induction', 'inducted', 'orientation', 'oriented',
      'tpc', 'third party certificate', 'competent', 'competency',
      'qualified', 'qualification', 'sag', 'ksa'
    ],
    exclusionPatterns: [
      // Inspection issues
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'pre-use inspection',
      // Material handling context
      'overloaded', 'manual loading', 'line of fire'
    ],
    minimumScore: 5
  },

  'Supervision': {
    strongPatterns: [
      // === LACK OF SUPERVISION - all variations ===
      'no supervision', 'without supervision', 'lack of supervision',
      'unsupervised', 'not supervised', 'inadequate supervision',
      'insufficient supervision', 'poor supervision', 'supervision not',
      'supervision was not', 'supervision not provided', 'without proper supervision',
      // Supervisor issues
      'no supervisor', 'without supervisor', 'supervisor not present',
      'supervisor not available', 'supervisor absent', 'supervisor was absent',
      'supervisor not assigned', 'missing supervisor', 'no site supervisor',
      // Oversight
      'no oversight', 'lack of oversight', 'without oversight',
      'inadequate oversight', 'poor oversight',
      // Misspellings
      'supervison', 'superviser', 'unsupervized', 'supervission',

      // === FLAGMAN/BANKSMAN/SPOTTER - all variations ===
      // Not assigned/missing
      'no flagman', 'without flagman', 'flagman not', 'missing flagman',
      'flagman not assigned', 'flagman not provided', 'flagman was not',
      'no banksman', 'without banksman', 'banksman not', 'missing banksman',
      'banksman not assigned', 'banksman not provided', 'banksman was not',
      'no spotter', 'without spotter', 'spotter not', 'missing spotter',
      'spotter not assigned', 'spotter not provided', 'spotter was not',
      'no ground guide', 'without ground guide', 'ground guide not',
      'no signal man', 'without signal man', 'signal man not',
      'no signalman', 'without signalman', 'signalman not',
      // Misspellings
      'flagmen not', 'banksmen not', 'spotters not',

      // === FOREMAN/CHARGE HAND ===
      'no foreman', 'without foreman', 'foreman not present',
      'foreman absent', 'foreman not available', 'missing foreman',
      'no charge hand', 'without charge hand', 'charge hand not',
      'no site foreman', 'site foreman absent',

      // === POSITIVE SUPERVISION ===
      // Supervision provided
      'supervised by', 'under supervision', 'with supervision',
      'supervision provided', 'supervision in place', 'proper supervision',
      'adequate supervision', 'continuous supervision',
      'supervisor present', 'supervisor available', 'supervisor on site',
      'supervisor assigned', 'supervision was provided',
      // Flagman/banksman assigned
      'flagman assigned', 'flagman provided', 'flagman present',
      'flagman available', 'flagman at site', 'trained flagman',
      'flagman has been assigned', 'with flagman',
      'banksman assigned', 'banksman provided', 'banksman present',
      'spotter assigned', 'spotter provided', 'spotter present',
      'ground guide assigned', 'signal man assigned', 'signalman assigned',
      // Foreman present
      'foreman present', 'foreman on site', 'foreman available',
      'site foreman present', 'charge hand present',

      // === SAFETY PERSONNEL AVAILABILITY ===
      'without the availability of safety', 'availability of safety personnel',
      'safety personnel not available', 'no safety personnel',
      'without safety personnel', 'safety team not available',
      'availability of safety team', 'safety officer not available'
    ],
    moderatePatterns: [
      'supervision', 'supervisor', 'supervised', 'supervising',
      'foreman', 'overseer', 'oversight', 'charge hand',
      'flagman', 'flagmen', 'banksman', 'banksmen',
      'spotter', 'spotters', 'ground guide', 'signal man', 'signalman'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi'
    ],
    minimumScore: 5
  },

  'Communication': {
    strongPatterns: [
      // Lack of communication
      'not briefed', 'without briefing', 'no briefing', 'unbriefed',
      'not informed', 'without information', 'miscommunication',
      'lack of communication', 'poor communication', 'no communication',
      'toolbox talk not', 'tbt not conducted', 'no tbt',
      'pre-task briefing not', 'no pre-task', 'briefing not conducted',
      // Positive communication
      'briefing conducted', 'tbt conducted', 'toolbox talk conducted',
      'briefed on', 'informed about', 'communication provided',
      'pre-start meeting', 'safety briefing', 'mass tbt',

      // === INFORMING SAFETY TEAM ===
      'without informing', 'not informing', 'informing to the safety',
      'informing the safety team', 'started the activity without informing',
      'activity without informing', 'informing safety team',
      'not clear for all the worker', 'not translated', 'workforce language',
      'bord not clear', 'board not clear', 'language barrier'
    ],
    moderatePatterns: [
      'briefing', 'briefed', 'toolbox', 'tbt', 'communication',
      'informed', 'prestart', 'pre-start'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi'
    ],
    minimumScore: 5
  },

  'Housekeeping': {
    strongPatterns: [
      // === POOR HOUSEKEEPING PHRASES ===
      'poor housekeeping', 'bad housekeeping', 'housekeeping issue',
      'poor house keeping', 'bad house keeping', 'no housekeeping',
      'housekeeping not done', 'housekeeping not maintained',
      'housekeeping was not', 'without housekeeping', 'lack of housekeeping',
      'no regular housekeep', 'housekeep and waste', 'house keeping not',
      'not up to the mark', 'hygiene issues', 'hygiene concerns', 'hygiene risk',
      'poor hygiene', 'hygiene and housekeeping', 'cleanliness standards',

      // === LOOSE ITEMS / ITEMS IN CABIN ===
      'loose items stored', 'loose items inside', 'loose items in cabin',
      'stored inside grader', 'stored inside operator cabin', 'items stored inside',
      'materials inside cabin', 'objects inside cabin', 'items in operator cabin',

      // === CARDBOARD / PACKING MATERIALS LEFT ===
      'cardboards and packing', 'cardboards left', 'packing materials left',
      'cardboard left', 'packing material left', 'cardboard in parking',
      'in heavy equipment parking area', 'materials left in parking',

      // === WASTE ITEMS IN WORKPLACE/SHELTER ===
      'water drinking bottles were accumulated', 'bottles accumulated', 'bottles were accumulated',
      'drinking water bottles accumulated', 'immediately remove from the site',
      'cigarette butts', 'cigarette butts were found', 'thrown by the team',
      'smoking buds on the ground', 'smoking buds', 'buds on the ground',
      'litter box was unchanged', 'litter box unchanged', 'unchanged litter box',
      'cement bag was found exposed', 'cement bag found exposed', 'exposed cement bag',
      'bag exposed inside', 'inside the rest shelter', 'found inside rest shelter',
      'contaminated stagnant water', 'stagnant water and algae', 'algae formation',
      'around chilled water dispenser', 'water dispenser unit',

      // === UNCLEANED/DIRTY - all variations ===
      'not cleaned', 'not clean', 'unclean', 'uncleaned', 'unclensed', 'uncleansed',
      'dirty', 'filthy', 'grimy', 'soiled', 'stained',
      'messy', 'cluttered', 'untidy', 'disorganized', 'disorderly',
      // Common misspellings
      'uncleand', 'unclened', 'diry', 'diryt', 'flithy', 'filthi',
      'mesy', 'messey', 'clutered', 'untidie', 'unorganized', 'visibly dirty',
      // Phrase variations
      'found dirty', 'found unclean', 'found uncleaned', 'found filthy',
      'was dirty', 'was unclean', 'was filthy', 'is dirty', 'is unclean',
      'in dirty condition', 'in a dirty condition', 'dirty condition',
      'looking very messy', 'very messy', 'looking messy',
      'not cleaned properly', 'not cleaned up', 'was not cleaned up',

      // === TOILET/RESTROOM CLEANLINESS ===
      'toilet not cleaned', 'toilet was not cleaned', 'toilet uncleaned',
      'toilet unclean', 'toilet dirty', 'toilet filthy', 'toilet was filthy',
      'toilet was uncleaned', 'toilet found uncleaned', 'toilet found dirty',
      'uncleaned toilet', 'unclean toilet', 'dirty toilet', 'filthy toilet',
      'toilet cleaning not', 'toilet not clean', 'toilet was not clean',
      'toilet checklist not', 'toilet cleaning checklist not',
      'toilet cleaning schedule not', 'cleaning schedule not',
      'toilet cleaning not performed', 'daily cleaning checklist not',
      'cleaning checklist not maintained', 'cleaning checklist not updated',
      'cleaning checklist not provided', 'checklist not provided',
      'toilettes overflow', 'toilets overflow', 'site toilettes',
      'workers toilet', 'workers toilets', 'site toilet', 'portable toilet',
      'toilet in the welfare', 'toilet at the welfare',
      // Misspellings
      'toilettes', 'toilett', 'tolet', 'toliet',
      // Hand wash/soap
      'hand wash soap not', 'soap not provided', 'no soap', 'lack of soap',
      'hand wash not available', 'no hand wash', 'hand wash facility',
      'hand washing facilities', 'lacks hand washing',
      // Positive toilet
      'toilet cleaned', 'toilet was cleaned', 'toilet found cleaned',
      'toilet clean', 'toilet is clean', 'neat and clean',
      'cleaning the toilet', 'toilet cleaning', 'clean toilet',
      'toilet cleaning ongoing', 'engaged in toilet cleaning',
      'genitor is updating', 'janitor is updating',

      // === WASTE/GARBAGE - all variations ===
      'waste not removed', 'waste not disposed', 'waste accumulated',
      'waste scattered', 'waste found', 'accumulated waste', 'accumulation of waste',
      'food waste not removed', 'food waste not disposed', 'food waste scattered',
      'food waste accumulated', 'accumulated food waste', 'food waste found',
      'food waste left', 'food waste in', 'food waste at', 'food waste was',
      'foods waste', 'foods waste scattered', 'huge amount of food',
      'food waste material', 'food waste collection',
      'garbage not removed', 'garbage accumulated', 'garbage scattered',
      'rubbish not removed', 'rubbish accumulated', 'rubbish scattered',
      'debris not removed', 'debris accumulated', 'debris material',
      'unwanted debris', 'unwanted materials', 'unwanted material',
      'scrap material', 'waste material', 'residual material',
      'construction debris', 'mixed waste', 'waste bags accumulated',
      'waste bags observed', 'multiple waste bags',
      'material accumulated', 'materials accumulated', 'construction material accumulated',
      'material at working zone', 'materials at working zone', 'materials were accumulated',
      'material was accumulated', 'remove all the material', 'shifted to designated',
      // Waste bin issues
      'waste bin full', 'waste bin was full', 'waste bin overflowing',
      'bin full', 'bin was full', 'bin overflowing', 'bin overflow',
      'dustbin full', 'dust bin full', 'dustbin overflowing', 'dust bins full',
      'dust bins was full', 'dust bins were full',
      'garbage bin full', 'garbage bag full', 'garbage bag not changed',
      'polythene bag not changed', 'waste bag not changed', 'liner not replaced',
      'bag not replaced', 'bag was overflowing', 'bag overflowing',
      'overflowing with waste', 'overflowing with food', 'overflow with',
      'bins not emptied', 'bin not emptied', 'bins were full',
      'trash is overflowing', 'trash overflowing', 'garbage were posed',
      'waste bin liner', 'bin liner not', 'food waste bucket',
      'overflowing of food', 'bad smells', 'unpleasant odor', 'unpleasant odors',
      'creating bad environment', 'bad environment',
      // Positive waste
      'waste removed', 'waste disposed', 'waste collected',
      'food waste bin provided', 'waste bin provided', 'wastes disposed',
      'waste disposal', 'waste must be disposed',

      // === REST SHELTER/WELFARE CLEANLINESS ===
      'rest shelter not cleaned', 'rest shelter dirty', 'rest shelter unclean',
      'shelter not cleaned', 'shelter dirty', 'shelter unclean',
      'rest area not cleaned', 'rest area dirty', 'welfare not cleaned',
      'welfare area not cleaned', 'welfare dirty', 'welfare facility not',
      'mess hall dirty', 'mess hall not cleaned', 'mess hall unclean',
      'mess hall floor dirty', 'mess hall floor is dirty',
      'dining hall dirty', 'dining hall not cleaned', 'dining area dirty',
      'dining hall unclean', 'dining hall found unclean',
      'cabin dirty', 'cabin not cleaned', 'security cabin dirty',
      'smoking shelter', 'smoking area', 'smoking tray not',
      // Positive rest shelter
      'rest shelter cleaned', 'shelter cleaned', 'shelter clean',
      'rest shelter maintained', 'rest area cleaned', 'welfare cleaned',
      'mess hall cleaned', 'dining hall cleaned', 'cabin cleaned',
      'building cleaned', 'kitchen building cleaned',
      'neat and tidy', 'neat & tidy', 'clean and tidy', 'clean & tidy',
      'maintained neat', 'maintained clean', 'kept clean',
      'well maintained rest', 'well maintained shelter',
      'housekeeping being done', 'being cleaned', 'was being cleaned',
      'house keeping was being', 'cleaning was being done',
      'ongoing house keeping', 'on going house keeping',

      // === WATER/COOLER CLEANLINESS ===
      'water filter dirty', 'water filter unclean', 'filter dirty',
      'water cooler dirty', 'cooler dirty', 'cooler unclean',
      'water color dirty', 'water colour dirty', 'cleaning the water color',
      'water igloo dirty', 'igloo dirty', 'igloo unclean', 'igloo not sealed',
      'igloo outdated', 'igloos outdated', 'igloos unclean', 'igloos placed',
      'water station dirty', 'water station empty', 'water station observed empty',
      'container not cleaned', 'not cleaned and refilled', 'containers not cleaned',
      'no water available', 'water not available', 'non-availability of water',
      'without seal', 'not sealed', 'disposable glasses not provided',
      'no disposable glasses', 'disposable cup not',
      // Positive water
      'filter cleaned', 'cooler cleaned', 'igloo cleaned', 'igloos refilled',
      'water available', 'clean water', 'water supplies replenished',

      // === SPILLAGE ===
      'spillage', 'spill', 'spilled', 'oil spill', 'fuel spill',
      'oil spillage', 'fuel spillage', 'liquid spill', 'chemical spill',
      'spill not cleaned', 'spillage not cleaned',

      // === SEWAGE/OVERFLOW ===
      'sewage overflow', 'sewage overflowed', 'toilet overflow',
      'toilet overflowed', 'over flowed', 'overflow sewage',
      'pump out sewage', 'pumping out sewage', 'sewage waste',
      'overflow sewage waste', 'sewage waste coming out',
      'toilet tank overflow', 'vacuum tanker',

      // === POSITIVE HOUSEKEEPING ===
      'good housekeeping', 'housekeeping done', 'housekeeping maintained',
      'housekeeping being done', 'ongoing housekeeping', 'proper housekeeping',
      'housekeeping was done', 'housekeeping was maintained',
      'clean and orderly', 'orderly and clean', 'well maintained',
      'area cleaned', 'properly stored', 'properly maintained',
      'cleaning crew', 'cleaning team', 'assigned to clean',
      'cleaning crew assigned', 'maintain all rest shelter',
      'rest shelter hygiene', 'good cleaning', 'good condition',

      // === DRINKING WATER/WELFARE ===
      'drinking water', 'drinking water is available', 'drinking water available',
      'drinking water not available', 'drinking water unavailable', 'drinking water was available',
      'drinking water was not available', 'drinking water was unavailable',
      'no water provided', 'water was not provided', 'water not provided',
      'water igloo', 'water igloo unavailable', 'water igloo was unavailable',
      'water igloo available', 'water cooler', 'water cooler available',
      'water cooler unavailable', 'water shelter', 'water shelter available',
      'water station', 'water station available', 'water station unavailable',
      'potable water', 'potable water unavailable', 'potable water not available',
      'potable water available', 'potable water is absent', 'no potable water',
      'availability of drinking water', 'unavailability of drinking water',
      'drinking water cooler', 'water analysis test', 'drinking water station',
      'water delivery date', 'water refilling', 'cooler cover was sealed',
      'cooler cover sealed', 'water is good for consumption', 'sealed and updated',
      'date has been updated', 'date was updated', 'date updated',
      'water was found available', 'water found available', 'water found unavailable',
      'water unavailable in toilet', 'water unavailable in the toilet',
      'no water in toilet', 'toilet water unavailable',
      // Misspellings
      'drinkng water', 'drinkin water', 'watrer', 'warter',

      // === CABLE MANAGEMENT ===
      'cable lying', 'cable lying on ground', 'cable lying on the ground',
      'cables lying', 'cables lying on ground', 'cables lying on the ground',
      'cable on the ground', 'cable on ground', 'cables on ground',
      'improper cable management', 'poor cable management', 'cable management',
      'cable not properly', 'cables not properly', 'cable found lying',
      'cables found lying', 'cable was lying', 'cables were lying',
      'cable was placed', 'cable placed on', 'cables placed on',
      'cable not properly elevated', 'cable not elevated', 'cables not elevated',
      'electric cable was lying', 'electric cable lying', 'electrical cable lying',
      'cable was not properly arranged', 'cable not properly arranged',
      'cables not arranged', 'tangled cables', 'tangled electrical cables',
      'cables draped over', 'cables hanging loosely', 'cables not secured',
      'cable on scaffold', 'cables on scaffold', 'cable on scaffolding',
      'cable on rebar', 'cable placed on rebar', 'cable on the rebar',

      // === ELECTRICAL CABLE EXTENDED PATTERNS ===
      // Cable laying (common misspelling of lying)
      'cable laying', 'cables laying', 'cable is laying', 'cables are laying',
      'cable laying on', 'cables laying on', 'cable laying on ground',
      'cable laying on floor', 'cables laying on floor', 'cable laying on the floor',
      'electrical cable laying', 'electrical cables laying', 'electric cable laying',
      'electrical cable was laying', 'electrical cables were laying',
      'live cable laying', 'live cables laying', 'live electrical cable laying',

      // Cable on floor/pathway
      'cable on floor', 'cables on floor', 'cable on the floor',
      'cables on the floor', 'cable found on floor', 'cables found on floor',
      'cable across pathway', 'cables across pathway', 'cable in pathway',
      'cables in pathway', 'cable lying across', 'cables lying across',
      'cable across the access', 'cables across access', 'cables coiled',

      // Trailing cables
      'trailing cable', 'trailing cables', 'cables trailing', 'cable trailing',
      'trailing through', 'cables trailing through', 'trailing on ground',
      'trailing electrical', 'trailing on steel', 'trailing to scaffolds',
      'trailing to cup lock', 'training to cup lock', 'training to scaffolds',

      // Damaged cables
      'damaged cable', 'damaged cables', 'damaged electrical cable',
      'damaged electrical cables', 'damaged power cable', 'damaged power cables',
      'damaged power cord', 'damaged power cords', 'cable damaged',
      'cables damaged', 'cable was damaged', 'cables were damaged',
      'cable found damaged', 'cables found damaged', 'damage cable',
      'damage power cable', 'worn cable', 'worn cables', 'worn electrical cable',

      // Live cables
      'live cable', 'live cables', 'live electrical cable', 'live electrical cables',
      'live electric cable', 'live electric cables', 'live cable laying',
      'live cables laying', 'live cable lying', 'live cables lying',
      'live cable found', 'live cables found', 'live cable on',
      'live cable in contact', 'live cables in contact', 'live cable was',
      'energized cable', 'energized cables', 'energized electrical',

      // Cable in contact with metal/steel
      'cable in contact', 'cables in contact', 'cable in contact with',
      'cables in contact with', 'in contact with metal', 'contact with metal',
      'contact with the metal', 'contact of metal', 'cable on steel',
      'cables on steel', 'cable on the steel', 'cables on the steel',
      'cable on steel rebar', 'cables on steel rebars', 'cable on rebars',
      'cables on rebars', 'cable touching', 'cables touching',
      'cable on metal', 'cables on metal', 'cable on fence',
      'cables on fence', 'cable on the fence', 'cables on the fence',

      // Unsecured/loose cables
      'unsecured cable', 'unsecured cables', 'unsecured electrical cable',
      'loose cable', 'loose cables', 'loose cable connection',
      'loose connection', 'loose electrical cable', 'cable not secured',
      'cables not secured', 'cable left unattended', 'cables unattended',

      // Exposed cables
      'exposed cable', 'exposed cables', 'exposed electrical cable',
      'exposed electrical cables', 'exposed power cable', 'exposed power cables',
      'exposed conductor', 'exposed conductors', 'exposed wire', 'exposed wires',
      'cable exposed', 'cables exposed', 'bare cable', 'bare cables',
      'bare electrical cable', 'bare wire', 'bare wires', 'bare cable strands',

      // Cable without protection
      'cable without protection', 'cables without protection',
      'cable without conduit', 'cables without conduit', 'without conduit protection',
      'cable without insulation', 'cables without insulation',
      'cable without sleeve', 'cables without sleeve', 'without secondary sleeve',
      'without secondary insulation', 'without external sleeve',
      'without weather protection', 'unprotected cable', 'unprotected cables',
      'unprotected power cable', 'unprotected electrical cable',

      // Cable on scaffold/steel structures
      'cables on scaffolds', 'cable on scaffolds', 'cables on scaffold',
      'cable on steel cage', 'cables on steel cage', 'cable on steel cages',
      'cables on steel cages', 'cable on reinforcement', 'cables on reinforcement',
      'cables hanging from', 'cable hanging from', 'cable draped over',
      'cable found on scaffold', 'cables found on scaffold',
      'cable on scaffolding structure', 'cables on scaffolding structure',
      'cable found on a scaffolding', 'electrical cable on scaffold',

      // Poor electrical management
      'poor electrical management', 'poor electrical management system',
      'improper electrical cable management', 'improper cable management',
      'poor cables management', 'cables management', 'electrical management',
      'cable distributed', 'cables distributed', 'cable scattered',
      'cables scattered', 'cable without any inspection',

      // Misspellings
      'cabel', 'cabels', 'cabl', 'cablle', 'electrcal cable',
      'eletrical cable', 'electical cable', 'elctrical cable', 'electic cable',
      'laing', 'layng', 'lieing', 'lyng',

      // === SCATTERED MATERIALS ===
      'scattered on', 'scattered across', 'scattered materials',
      'materials scattered', 'material scattered', 'found scattered',
      'was scattered', 'were scattered', 'thrown scattered',
      'thrown scatterly', 'thrown on the ground', 'lying on the ground',
      'wood scattered', 'wooden material scattered', 'wood timbers scattered',
      'wood timber scattered', 'timber scattered', 'timbers scattered',
      'unwanted wood', 'unwanted wooden', 'unwanted wooden material',
      'unwanted wooden materials', 'unwanted material placed', 'unwanted material found',
      'scaffold materials scattered', 'scaffolding materials scattered',
      'scaffold materials thrown', 'scaffold materials improperly',
      'scaffolding materials improperly', 'steel scattered', 'steel rods scattered',
      'steel rods lying', 'steel materials scattered', 'stones scattered',
      'stones found scattered', 'plywood sheets scattered', 'plywood scattered',
      'scaffold tubes scattered', 'scaffolding tubes scattered',
      'pipes stored at', 'materials kept on', 'material kept on',
      'stored improperly', 'improperly stored', 'improper arrangement',
      'improper materials arrangement', 'improperly placed on ground',
      'poor materials arrangement', 'poor material arrangement',
      'poor materials arrangements', 'poor material management',
      'found poor materials', 'found poor material', 'properly arranging materials',
      'not a designated storage area', 'not designated storage area',
      'not in designated area', 'not in the designated area',
      'placed near the security cabin', 'materials placed near',
      'construction materials were placed', 'materials were placed near',
      'improperly placed on the ground', 'materials improperly placed',
      'material improperly placed', 'cement bags placed directly',
      'cement bags stacked on ground', 'cement bags on ground',
      'cement bags without protection', 'bags without protective',
      'empty cement bag', 'empty water bottles', 'bottles scattered',
      // Scaffold materials scattering (extended)
      'scattered scaffold material', 'scatted materials on access',
      'scaffold scattered material', 'scaffolders may trip',
      'scattered underneath', 'scattered underneath the scaffold',
      'scaffold & shuttering material', 'scaffold and shuttering',
      'shuttering material was observed', 'increase the severity',
      'materials were observed scattered', 'scaffold materials were observed',
      'materials observed scattered', 'scattered along the way',
      'scattered along the pathway', 'dispersed across', 'dispersed across the work',
      'at access and egress', 'at access points', 'at egress points',

      // === MATERIALS ON SCAFFOLD PLATFORM ===
      'material on scaffold', 'materials on scaffold', 'material on the scaffold',
      'materials on the scaffold', 'material stacked on scaffold',
      'materials stacked on scaffold', 'stacked on the scaffolding',
      'stacked on scaffolding', 'loaded on scaffold', 'loaded on the scaffold',
      'loading on scaffold', 'material was stacked', 'material placed on',
      'materials placed on', 'several wood placed', 'wood placed on top',
      'excessive amount of wood', 'wood was placed on', 'timbers on scaffold',
      'ledgers on scaffold', 'ledgers positioned on', 'ledgers were positioned',
      'loose material on', 'loose materials on', 'loose material stored',
      'loose material was stored', 'material stored on incomplete',
      'stored on the incomplete', 'lifting crew were loaded',
      'lifting crew loaded',

      // === WIRE/CABLE IN CONTACT WITH SCAFFOLD ===
      'wire in contact with', 'wire was in contact', 'electric wire in contact',
      'electrical wire in contact', 'wire contact with scaffold',
      'contact with the scaffold', 'contact with a scaffold',
      'short circuit', 'risk of short', 'posing a risk',
      'binding wire scattered', 'binding wire was scattered',
      // Positive material storage
      'well organized', 'properly arranged', 'storage area well organized',
      'properly placed', 'materials storage area', 'scaffolding materials storage',

      // === ADDITIONAL STORAGE ISSUES ===
      'stored near the access', 'stored at the edge', 'stored near the edge',
      'being stored at the edge', 'wood sheet has been stored', 'wood stored near',
      'wood timbers stored', 'timbers stored at', 'stored at the excavation',
      'potential obstruction', 'posing a potential obstruction', 'safety hazard',
      'beams were left on-site', 'beams left on site', 'left on-site after',
      'support beams left', 'structure support beams',

      // === BIN ISSUES ===
      'bin overfilled', 'bin on site overfilled', 'overfilled bin',
      'exceeding its capacity', 'bin exceeding', 'overflowing bin',

      // === TOILET/WELFARE WATER ISSUES ===
      'water was unavailable in toilet', 'water unavailable in toilet',
      'water unavailable in the toilet', 'toilet water unavailable',
      'no water in the toilet', 'toilet no water', 'unhygienic toilet',
      'unhygienic', 'toilet not clean', 'toilet as not clean',
      'toilet facilities and ensuring', 'requirements are fully met',
      'updated the checklist', 'welfare facilities located',
      'considerable distance', 'distance from the main workplace',

      // === WORKERS ITEMS/STORAGE ===
      'shoes found stored', 'shoes stored inside', 'stored inside a water',
      'water drum', 'shoes were found', 'items stored improperly',

      // === POLYETHYLENE/COVERING ===
      'polyethylene sheets', 'polythene sheets', 'polythene covering',
      'without polythene', 'without protective polythene', 'prevent contamination',

      // === OBSTACLES/OBSTRUCTIONS ===
      'obstacles found', 'obstacles was found', 'obstacle found',
      'obstacles around', 'found around the chamber',

      // === CEMENT BAGS ON GROUND ===
      'cement bags placed directly on ground', 'cement bags observed placed',
      'placed directly on the ground at the storage', 'directly on the ground at storage',
      'moisture absorption', 'compromising the quality', 'usability of the cement',

      // === TOILET WATER PATTERNS ===
      'water unavailable in the toilet', 'water was unavailable in toilet',
      'water unavailable in toilet facilities', 'toilet facilities water unavailable',
      'potable water in the toilet', 'potable water in toilet facilities',
      'no potable water in the site toilet', 'potable water in the toilet facilities',
      'lack of potable water', 'poor hygiene practices', 'health issues',
      'welfare facility standards', 'non-compliance with welfare',
      'there is no potable water', 'is no potable water in', 'no potable water in',
      'water unavailable in the toilet facilities', 'unavailable in the toilet facilities',
      'it was observed that water was unavailable', 'water was unavailable in the toilet',
      'toilet facilities was unavailable', 'water found available in the rest toilet',
      'available in the rest toilet', 'other requirements was found', 'requirements was found available',
      'site toilet which could be unhygienic', 'unhygienic for workers',
      'potable water was unavailable', 'potable water in the toilet facilities was unavailable',
      'no water and no soap', 'no soap', 'no water no soap',
      'the site inspection, it was observed', 'site inspection, it was observed that water',
      'water was unavailable in the toilet facilities', 'unavailable in the toilet facilities',
      'during the site inspection, it was observed that water was unavailable',
      'site inspection, it was observed that water was unavailable',
      'toilet found in used', 'no daily checklist for ensure', 'but no daily checklist',
      'maintained properly', 'unhygienic toilet as not clean', 'not clean',
      'after inspecting the', 'inspecting the crusher', 'crusher area\'s toilet'
    ],
    moderatePatterns: [
      'housekeeping', 'house keeping', 'cleaned', 'cleaning', 'cleanliness',
      'dirty', 'filthy', 'unclean', 'uncleaned', 'messy', 'untidy',
      'waste', 'garbage', 'rubbish', 'debris', 'trash', 'refuse',
      'clutter', 'cluttered', 'spillage', 'spill', 'overflow',
      'hygiene', 'sanitation', 'sanitary', 'toilet', 'toilets'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi',
      'equipment inspection', 'pre-use inspection',
      // Exclude wound cleaning (first aid)
      'laceration was cleaned', 'wound was cleaned', 'cleaned and bandaged',
      'cleaning wounds'
    ],
    minimumScore: 5
  },

  'Safety Devices': {
    strongPatterns: [
      // === PROTRUDING REBAR / SHARP OBJECTS ===
      'protruding rebar', 'protruding rebars', 'protruding nails', 'protruding nail',
      'exposed rebar', 'exposed rebars', 'exposed tie rods', 'exposed tie rod',
      'sharp rebar', 'sharp rebars', 'sharp exposed rebar', 'sharp exposed rebars',
      'sharp steel rebar', 'sharp steel rebars', 'sharp edges of rebar',
      'rebar caps', 'rebar cap', 'no rebar caps', 'without rebar caps',
      'rebar caps not', 'rebar caps missing', 'not capped', 'not protected with rebar',
      'without protective caps', 'rebar without caps', 'rebar not capped',
      'properly capped', 'properly covered', 'covered or capped', 'capped to eliminate',
      'adequately protected', 'not adequately protected', 'without adequate protection',
      'wooden covers', 'wooden cover', 'wood covers', 'wood cover',
      'timber covers', 'timber cover', 'without wooden cover', 'without wooden covers',
      'without wood cover', 'without timber cover', 'protected with wood',
      'tie rod', 'tie rods', 'tie rod sharp', 'tie rods sharp',
      'tie rod not protected', 'tie rods not protected', 'exposed tie rod',
      'impalement hazard', 'impalement', 'risk of impalement', 'impalement injuries',
      'sharp hazard', 'sharp edge hazard', 'sharp edges', 'sharp edge',
      'cuts and punctures', 'puncture injuries', 'puncture hazard',
      'steel bar without safety cap', 'bar without cap', 'bar without safety cap',
      'nails not removed', 'nails were removed', 'nails removed immediately',
      'remove the nails', 'protruding from', 'exposed ends', 'sharp concrete edges',
      // Misspellings
      'protuding', 'protrding', 'protrudig', 'rebars', 'rebar', 'rebarr',

      // === STEEL BAR / NAILS EXPOSED ===
      'steel bar found without', 'steel bar without a safety cap', 'steel bar without safety',
      'bar found without a safety', 'bar without a safety cap', 'bar found without cap',
      'a steel bar was found without', 'steel bar was found without a safety cap',
      'timber with exposed nails', 'wood timber with nails', 'timber with nails',
      'timbers were found full of nails', 'full of nails', 'found full of nails',
      'exposed nails', 'nails exposed', 'nails were not removed', 'nails not removed',
      'railing protection', 'improve railing protection', 'railing not installed',
      'wood timber was disposed', 'disposed of but nails', 'nails were not',
      'on top of the pillars', 'falling object hazard', 'serious falling object',
      'potential injury hazard', 'posing a potential injury',

      // === PWAS (Proximity Warning Alert System) ===
      'no pwas', 'without pwas', 'pwas not', 'pwas missing',
      'pwas not installed', 'pwas not available', 'pwas not fitted',
      'pwas not working', 'pwas not functioning', 'pwas non-operational',
      'pwas not operational', 'pwas faulty', 'pwas defective',
      'found without pwas', 'operating without pwas', 'without active pwas',
      // Positive PWAS
      'pwas installed', 'pwas working', 'pwas operational', 'pwas available',
      'pwas fitted', 'equipped with pwas', 'with pwas', '360 pwas',

      // === CAMERAS ===
      'no camera', 'without camera', 'camera not', 'cameras not',
      'camera not installed', 'camera not working', 'camera not functioning',
      'camera missing', 'cameras missing', 'camera not available',
      '360 camera not', '360 degree camera not', '360-degree camera not',
      'reverse camera not', 'reversing camera not', 'rear camera not',
      'found without camera', 'operating without camera',
      // Positive cameras
      'cameras installed', 'camera installed', 'camera working',
      'camera available', '360 camera', '360 degree camera', '360-degree camera',
      'reverse camera working', 'equipped with camera', 'with camera',

      // === ALARMS ===
      'no reverse alarm', 'without reverse alarm', 'reverse alarm not',
      'reverse alarm not working', 'reverse alarm not functioning',
      'reverse alarm not audible', 'reverse alarm missing',
      'reversing alarm not', 'reversing alarm missing',
      'alarm not working', 'alarm not functioning', 'alarm not audible',
      'alarm faulty', 'alarm defective', 'unserviceable alarm',
      // Positive alarms
      'reverse alarm working', 'reverse alarm installed', 'alarm working',
      'alarm audible', 'alarm functioning',

      // === HORN ===
      'horn not working', 'horn not functioning', 'no horn',
      'horn faulty', 'horn defective', 'horn not audible',
      'horn missing', 'without horn',
      // Positive horn
      'horn working', 'horn functioning', 'horn audible',

      // === BEACON/LIGHTS ===
      'beacon not', 'beacon light not', 'no beacon', 'beacon missing',
      'beacon not working', 'beacon not functioning', 'beacon faulty',
      'unserviceable beacon', 'beacon lights not', 'rotating beacon not',
      'amber beacon not', 'flashing beacon not', 'strobe light not',
      // Positive beacon
      'beacon light working', 'beacon working', 'beacon installed',
      'beacon functioning', 'amber beacon', 'flashing beacon',

      // === WARNING SYSTEM ===
      'warning system not', 'no warning system', 'warning system missing',
      'warning system not working', 'warning system not functioning',
      'proximity warning not', 'collision warning not',
      'non-availability of any warning', 'without any warning system',
      // Positive warning system
      'warning system operational', 'warning system working',
      'warning system installed', 'proximity warning',

      // === SENSORS ===
      'sensor not working', 'sensor not functioning', 'sensor faulty',
      'sensor missing', 'no sensor', 'sensors not working',
      // Positive sensors
      'sensor working', 'sensors installed', 'sensor operational',

      // === GFCI ===
      'gfci not installed', 'gfci was not', 'no gfci', 'without gfci',
      'gfci missing', 'gfci not provided',

      // === SMOKE DETECTOR / FIRE SAFETY ===
      'smoke detector', 'smoke detector not', 'no smoke detector',
      'smoke detector was not provided', 'smoke detector not provided',
      'smoke detector in clinic', 'smoke detector in medical',

      // === REFLECTIVE TAPE ===
      'retro reflective tape', 'retroreflective tape', 'reflective tape not',
      'reflective tape missing', 'did not fix with retro', 'without reflective tape',
      'no reflective tape', 'lacking reflective tape',

      // === STEEL ROD / SURVEY MARKERS ===
      'surveying steel rod', 'steel rod markers', 'rod markers inside trench',
      'without protective cap on top', 'marker without cap', 'markers without cap',
      'markers inside trench without', 'survey rod without', 'survey markers without',

      // === PROTRUDING / HANGING ===
      'partially protruding out', 'protruding out', 'heavy rock at excavation',
      'rock at excavation protruding', 'partially hanging on air', 'hanging on air',
      'left partially hanging', 'blocks supporting cabin',

      // === LIGHTS (Internal/External) ===
      'internal lights were not', 'internal lights not installed', 'no lights available',
      'lights available during', 'no internal lights', 'without internal lights'
    ],
    moderatePatterns: [
      'pwas', 'proximity warning', 'proximity alert',
      'camera', 'cameras', '360 camera', '360 degree', '360-degree',
      'reverse alarm', 'reversing alarm', 'alarm',
      'horn', 'beacon', 'beacon light', 'strobe',
      'sensor', 'sensors', 'warning system', 'collision warning'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi',
      'access denied', 'access granted', 'green status', 'red status'
    ],
    minimumScore: 5
  },

  'Maintenance': {
    strongPatterns: [
      // === POOR MAINTENANCE ===
      'not maintained', 'poorly maintained', 'lack of maintenance',
      'maintenance not', 'no maintenance', 'unmaintained', 'un-maintained',
      'inadequate maintenance', 'insufficient maintenance', 'poor maintenance',
      'maintenance not done', 'maintenance not performed', 'maintenance overdue',
      'needs maintenance', 'requires maintenance', 'due for maintenance',
      // Misspellings
      'maintainance', 'maintanance', 'maintenence', 'maintnance',

      // === BROKEN/DAMAGED ===
      'broken', 'damaged', 'defective', 'faulty', 'malfunction',
      'malfunctioning', 'not working', 'not functioning', 'not operational',
      'inoperable', 'non-operational', 'non-functioning', 'out of order',
      'needs repair', 'requires repair', 'needs fixing', 'requires fixing',
      'found broken', 'found damaged', 'found defective', 'found faulty',
      'was broken', 'was damaged', 'is broken', 'is damaged',
      // Specific equipment issues
      'handle broken', 'step broken', 'steps broken', 'mirror broken',
      'windshield damaged', 'windscreen damaged', 'glass damaged',
      'windshield cracked', 'windscreen cracked', 'cracked windshield',
      'panel damaged', 'panels missing', 'safety panels missing',
      'access step broken', 'access steps missing',
      // Misspellings
      'brocken', 'broaken', 'damged', 'dammaged', 'defektive', 'faulthy',

      // === LEAKS ===
      'hydraulic leak', 'hydraulic leaking', 'hydraulic leakage',
      'oil leak', 'oil leaking', 'oil leakage', 'oil spillage',
      'fuel leak', 'fuel leaking', 'fuel leakage', 'diesel leak',
      'coolant leak', 'coolant leaking', 'water leak', 'fluid leak',
      'leaking', 'leak detected', 'leak observed', 'visible leak',
      'leak from', 'leaking from', 'leakage from',

      // === TYRES/WHEELS ===
      'worn out', 'worn tyres', 'worn tires', 'poor tyres', 'poor tires',
      'tyre condition', 'tire condition', 'bald tyres', 'bald tires',
      'flat tyre', 'flat tire', 'punctured tyre', 'punctured tire',
      'tyre damage', 'tire damage', 'wheel damage',
      // Misspellings
      'tyres worn', 'tires worn', 'tyer', 'tier',

      // === UNSERVICEABLE ===
      'unserviceable', 'un-serviceable', 'not serviceable',
      'unserviceable beacon', 'unserviceable alarm', 'unserviceable horn',
      'found unserviceable', 'in unserviceable condition',

      // === POSITIVE MAINTENANCE ===
      'well maintained', 'properly maintained', 'maintenance done',
      'maintenance completed', 'maintenance performed', 'serviced',
      'repaired', 'fixed', 'good condition', 'working properly',
      'good working condition', 'in good condition', 'serviceable',
      'maintenance carried out', 'maintenance conducted',
      'under maintenance', 'undergoing maintenance', 'being repaired',
      'usual maintenance', 'routine maintenance', 'regular maintenance',

      // === HOMEMADE/IMPROVISED TOOLS ===
      'homemade tools', 'homemade tool', 'improvised tool', 'improvised tools',
      'makeshift tool', 'makeshift tools', 'homemade tools found',
      'homemade tools being used', 'using homemade', 'using improvised',
      'homemade hammer', 'homemade wrench', 'homemade equipment',
      'tool is not approved', 'not approved for use', 'non-designated tool',
      'not specifically designed', 'not designed for', 'used as a mixing tool',

      // === ELECTRICAL PANEL ISSUES ===
      'electrical panel', 'electrical panel unlocked', 'electrical panel not locked',
      'electrical panel left open', 'electrical panel lacks protection',
      'panel unlocked', 'panel left open', 'panel not locked', 'panel not grounded',
      'electrical distribution panel', 'distribution board not grounded',
      'distribution panel', 'panel lacks stability', 'panel exposed',
      'improper electrical connection', 'improper electrical',

      // === GENERATOR ISSUES ===
      'generator not shaded', 'generators not shaded', 'generator overheating',
      'dg not shaded', 'dg overheating', 'generator without shade',
      'generators were not properly shaded', 'generators not properly shaded',
      'not properly shaded', 'can lead to overheating', 'potential equipment damage',
      'generator without drip tray', 'drip tray not placed', 'no drip tray',
      'without drip tray', 'drip tray missing', 'drip tray underneath',
      'exposed live electrical', 'exposed electrical cable', 'exposed cable',
      'electrical cable exposed', 'cable without gland', 'without cable gland',
      'without double insulation', 'cable coming from generator',

      // === TOOL CONDITION ISSUES ===
      'grinding machine without handle', 'grinder without handle',
      'machine without handle', 'tool without handle', 'handle missing',
      'missing handle', 'pipe cutting machine', 'cutting machine',
      'steel cutter', 'drill machine', 'machine missing color',

      // === EQUIPMENT POSITIONING ===
      'outrigger', 'outriggers', 'outrigger not levelled', 'outrigger not level',
      'outrigger pads', 'outrigger pads smaller', 'outrigger pad',
      'outrigger placed on excavation', 'outrigger on excavation edge',
      'crane left without', 'crane without proper', 'boom truck outrigger',
      'improper outrigger', 'outrigger arrangements',

      // === SCAFFOLDING ISSUES ===
      'scaffolding hangers', 'hangers improperly installed', 'box tie',
      'box ties', 'standard box ties', 'special scaffolding',
      'scaffold ladder improperly stored', 'scaffold ladder stored',
      'scaffold platform exceeds', 'platform exceeds', 'insufficient access points',

      // === SCAFFOLD STRUCTURAL COMPONENTS ===
      // Missing ledgers
      'missing ledger', 'ledger missing', 'missing ledgers', 'ledgers missing',
      'no ledger', 'without ledger', 'ledger not installed', 'ledgers not',
      'ledger installed as', 'ledger was installed',
      // Missing bracing
      'missing bracing', 'bracing missing', 'missing diagonal', 'diagonal missing',
      'no bracing', 'without bracing', 'bracing not installed', 'bracing not',
      'diagonal bracing not', 'diagonal bracing missing', 'transverse bracing',
      'longitudinal bracing', 'cross bracing missing', 'sectional bracing',
      // Base plates and sole boards
      'base plate not', 'base plate missing', 'missing base plate', 'no base plate',
      'base plate not inserted', 'base plate is not', 'baseplate not', 'baseplate missing',
      'sole board not', 'sole board missing', 'missing sole board', 'no sole board',
      'soleboard not', 'soleboard missing', 'sole board was not', 'sole board not properly',
      // Lock pins and spigot pins
      'lock pin missing', 'lock pins missing', 'missing lock pin', 'pin missing',
      'spigot pin', 'bolt pin missing', 'bolt pin not', 'pin not fitted',
      'vertical connection pin', 'connection pin lock', 'pin locks missing',
      // Scaffold standards (uprights)
      'upright missing', 'upright is missing', 'uprights missing', 'standard missing',
      'standards missing', 'vertical missing', 'verticals missing',
      // Incomplete scaffolds
      'incomplete scaffold', 'scaffold incomplete', 'uncompleted scaffold',
      'scaffold uncompleted', 'incomplete scaffolding', 'scaffolding incomplete',
      'scaffold not complete', 'partially erected', 'partially completed scaffold',
      'scaffold built poorly', 'poorly built scaffold', 'poorly erected',
      'scaffold was built poorly', 'scaffolding was built poorly',
      // Scaffold platform issues
      'loose plank', 'loose planks', 'plank not secured', 'planks not secured',
      'board not secured', 'boards not secured', 'scaffold board not secured',
      'board clamp open', 'board clamps not', 'platform not fully boarded',
      'not fully boarded', 'gaps on platform', 'open gaps on platform',
      'platform clamps not', 'platform clamps were not', 'clamps not secured',
      'boards installed found not secured', 'boards installed not secured',
      // Scaffold component condition
      'rusted scaffold', 'scaffold rusted', 'scaffold components rusted',
      'rusted scaffolding', 'scaffold unsuitable', 'unsuitable scaffold',
      'scaffold found rusted', 'scaffolding found rusted',
      // Scaffold erection issues
      'scaffold not levelled', 'scaffold not level', 'scaffold not on level',
      'scaffold not erected on', 'scaffold not properly', 'improper scaffold',
      'erection sequence not', 'sequence not followed', 'erection not followed',
      'scaffold collapse', 'scaffolding collapse', 'risk of collapse',
      'may cause collapse', 'may lead to collapse', 'turning over',
      'risk of turning', 'poorly installed', 'improperly installed scaffold',
      // Ring lock / Cuplock specific
      'ring lock scaffold', 'ringlock scaffold', 'cuplock scaffold',
      'lightweight scaffold', 'light weight scaffold',

      // Scaffold jack/kicker issues
      'scaffold jack', 'scaffold crew jack', 'jack extended', 'kicker lift',
      'jack extended more than', 'kicker lift erected',

      // Scaffold clamp issues
      'clamp not fitted', 'clamp not properly', 'clamp was not properly',
      'clamp not secured', 'clamps not secured', 'clamp open', 'clamp was open',
      'board clamp open', 'board clamp was open', 'clamps open',
      'fitted and secured', 'not properly fitted and secured',

      // Scaffold access issues
      'plank mislocated', 'scaffolding plank mislocated', 'mislocated plank',

      // Unsuitable/inappropriate platform
      'unsuitable platform', 'inappropriate platform', 'dangerous platform',
      'potentially dangerous', 'inappropriately installed', 'inappropriate scaffolding',
      'unsuitable for working', 'inappropriate scaffolding platform',
      'found inappropriate', 'unsuitable ladder', 'inappropriate ladder used',

      // Scaffold not level
      'not erected on a level', 'scaffold not level', 'not on level surface',
      'not on a leveled surface', 'not erected on a leveled',
      'wooden supports were used instead', 'instead of planks',

      // Scaffold gap issues
      'gap between the standards', 'gap exceeds', 'exceeds 4 meters',
      'gap between standards', 'standards exceeds',

      // Misuse of materials
      'used a scaffold tube to support', 'scaffold tube to support',
      'support of shutter plywood', 'shutter plywood instead',
      'instead using of ladder', 'instead of using ladder',

      // Material inadequately placed
      'inadequately placed', 'inadequately placed at site', 'material inadequately',
      'inadequate scaffold structure', 'inadequate scaffold',

      // Scaffold nut/bolt/pin issues (extended)
      'nut bolt is missing', 'nut bolt missing', 'nut& bolt is missing',
      'nut and bolt missing', 'bolt is missing', 'nuts and bolts missing',
      'lock pins are missing', 'pins are missing', 'scaffolding lock pins are',

      // Scaffold bracing not installed
      'bracing has not been installed', 'bracing not installed',
      'has not been installed as per', 'not installed as per requirements',
      'not installed as per the requirements', 'coupler was observed missing',

      // Scaffold found not secured
      'found not secured', 'scaffold boards installed in-between',
      'installed in-between', 'boards installed in between',
      'timbers installed on scaffold', 'timbers on scaffold ledgers',

      // Scaffold without ladder
      'without ladder and operative', 'scaffolding with retaining wall without ladder',
      'retaining wall without ladder', 'platform without ladder',

      // Loose material on scaffold (extended)
      'loose material was placed', 'loose material placed on',
      'material was placed on the scaffolding',

      // Uncompleted scaffold (misspellings)
      'scaffolding uncompleted', 'scaffold uncompleted', 'messing the med rail',
      'messing the mid rail', 'messing med rail', 'missing med rail',

      // Ladder without hooks
      'ladders without hooks', 'ladder without hooks', 'scaffold ladders without hooks',

      // === LADDER ISSUES (Working at Height) ===
      'unsecured ladder', 'ladder unsecured', 'ladder not secured', 'ladder without hooks',
      'unsecured straight ladder', 'straight ladder unsecured', 'unsecured a-frame',
      'ladder leaned against', 'ladder leaned', 'ladder leaning', 'leaned against wall',
      'improper ladder', 'inappropriate ladder', 'unsuitable ladder',
      'ladder not extended', 'ladder extending', 'ladder not extend',
      'not extended above', 'extend above platform', 'extended 01 meter',
      'ladder with wide angle', 'wide angle ladder', 'ladder angle',
      'a frame ladder', 'a-frame ladder', 'a frame used as', 'frame ladder',
      'ladder as straight', 'using as straight ladder', 'used as straight',
      'makeshift ladder', 'man made ladder', 'homemade ladder', 'makeshift wooden',
      'step ladder found', 'ladder found to be', 'ladder found unstable',
      'ladder left unattended', 'ladder unattended', 'unattended ladder',
      'ladder improperly', 'ladder ratio', '1:4 ratio', 'ladder 1:4',
      'ladder positioning', 'ladder not complying', 'ladder installed improperly',
      'working on ladder', 'working from ladder', 'work from ladder',
      'above the platform', 'ladder above platform', 'on top rung',
      'top rung of ladder', 'using ladder above', 'using ladder instead',
      'support of ladder', 'ladder for support', 'ladder purpose',
      'scaffold steel ladder', 'steel ladder during',

      // === CABIN/STRUCTURE ISSUES ===
      'step not safe', 'step of the security cabin', 'cabin is not safe',
      'not according to the standard', 'not according to standard',
      'security cabin step', 'step is not safe', 'stairs not safe',

      // === PIPE/TANKER ISSUES ===
      'pipe for refilling', 'tied with rubber', 'secured using clips',
      'not secured using', 'water tanker pipe', 'tanker pipe',
      'gre pipe', 'gre pipe not protected', 'pipe not protected',
      'not properly protected', 'damage caused by nearby',

      // === MODULE/OFFLOADING ===
      'module arrived', 'module offloaded', 'safely and securely offloaded',
      'offloaded and installed', 'securely offloaded', 'offloading',
      'without any incidents', 'following all safety protocols',
      'securing methods', 'proper securing',

      // === EARTHING/GROUNDING ===
      'earthing', 'earthing on concrete', 'non effective earthing',
      'improper earthing', 'grounding issue', 'not grounded',
      'earthing not effective', 'effective earthing',
      'earthing cable', 'earthing cable not', 'earthing not connected',
      'earthing cable coiled', 'earthing cable not connected',
      'earthing rod', 'earth rod', 'earthing clamps', 'earth cable',
      'grounding cable', 'grounding not connected', 'generator not grounded',
      'genset not grounded', 'without grounding', 'without earthing',
      'no earthing', 'no grounding', 'improper grounding', 'improper earth',
      'earthing not provided', 'grounding not provided', 'earthing provided',
      'generator earthing', 'genset earthing', 'tower light earthing',
      'bonding provided', 'no bonding', 'earthing and bonding',

      // === UNSAFE ELECTRICAL CONNECTIONS ===
      'unsafe electrical', 'unsafe electrical connection', 'unsafe electrical connections',
      'unsafe electrical cable', 'unsafe electrical cables', 'unsafe extension',
      'unsafe extension cord', 'unsafe extension cords', 'unsafe cable',
      'improper electrical connection', 'improper electrical', 'improper connection',
      'improper cable connection', 'improper cable joint', 'improper splicing',
      'improperly spliced', 'improper splice', 'unsafe cable splicing',
      'cable splicing', 'spliced cable', 'spliced cables', 'spliced power cable',

      // === TAPED JOINTS / INSULATION TAPE ===
      'taped joint', 'taped joints', 'cable with taped', 'cables with taped',
      'joint covered with tape', 'joints covered with tape', 'insulation tape',
      'tape joint', 'tape joints', 'wrapped with tape', 'wrapped with tapes',
      'concealed with tape', 'concealed with tapes', 'protected with tape',
      'joined by tape', 'joined with tape', 'cable joined by tape',

      // === BARE CABLE / NO PLUG ===
      'bare cable', 'bare cables', 'bare wire', 'bare wires', 'bare strand',
      'bare strands', 'bare cable strands', 'plugless', 'plug less',
      'without plug', 'without plugin', 'cable without plug', 'cables without plug',
      'no plug', 'missing plug', 'missing plugs', 'directly connected to',
      'directly inserted', 'directly connected to power', 'inserted into power',
      'wire directly inserted', 'wires directly inserted', 'strand directly',
      'strands directly', 'prong wire directly', 'directly connected with',

      // === ELECTRICAL DB / DISTRIBUTION BOARD ===
      'electrical db', 'electrical db damaged', 'db damaged', 'damaged db',
      'db not grounded', 'db without', 'distribution board damaged',
      'distribution board not', 'db lying', 'db on ground', 'db is damaged',
      'temporary db', 'temporary electrical db', 'unserviceable elcb',
      'elcb not operational', 'elcb not', 'db not inspected', 'db without protection',
      'electrical db for the', 'live electric circuits exposed',

      // === ELECTRICAL INSPECTION / COLOR CODE ===
      'cable without inspection', 'cables without inspection',
      'without inspection color', 'without color code', 'outdated color code',
      'outdated inspection color', 'no evidence of inspection',
      'cable not inspected', 'cables not inspected', 'electrical not inspected',
      'not color coded', 'not colour coded', 'power tools not inspected',
      'pat testing', 'pat tested', 'not subjected to pat',

      // === DOMESTIC/INDUSTRIAL ELECTRICAL ===
      'domestic type', 'domestic plug', 'domestic socket', 'domestic outlet',
      'domestic electrical', 'domestic type outlet', 'domestic type cabling',
      'non ip rated', 'ip rated', 'industrial plug', 'industrial socket',
      'without industrial plug', 'without industrial socket',
      'industrial plug not', 'terminal block connector',

      // === ELECTRICAL SOCKET/OUTLET ISSUES ===
      'open electrical socket', 'exposed socket', 'live socket',
      'live electrical socket', 'socket exposed', 'socket in contact',
      'socket powering', 'socket directly connected', 'overloaded socket',
      'overloading socket', 'extension board', 'extension drum',
      'cable extension drum', 'power outlet', 'power outlets',

      // === GATE/STOP BAR ===
      'gate stop bar', 'stop bar', 'security gate stop', 'stop bar too short',
      'bar found to be too short', 'blocking the entry', 'entry and exit path',
      'control of vehicle access',

      // === LADDER CONDITION ===
      'ladder found to be unstable', 'step ladder found', 'positioned at an unnecessary',
      'unnecessary height', 'posing a risk of falling', 'ladder at unnecessary height',

      // === PANELS NOT LOCKED ===
      'panels not properly locked', 'panel not properly locked', 'panels on-site not locked',
      'not properly locked', 'exposing them to unauthorized', 'lead to electrical hazards',

      // === GRINDING MACHINE ===
      'grinding machine found without', 'machine found without a handle',
      'without a handle', 'absence of a handle', 'lack of control', 'increasing the risk of accidents',

      // === DRIP TRAY ===
      'drip tray was not placed', 'drip tray not placed', 'without drip tray underneath',
      'underneath the generator as required', 'generator as required',

      // === IMPROPER GROUNDING EXTENDED ===
      'not properly grounded', 'improperly grounded', 'inadequate grounding',
      'inadequate earthing', 'not adequate ground', 'not provided adequate ground',
      'adequate ground not', 'adequate grounding not', 'not provided ground',
      'not provided grounding', 'not provided earthing',

      // === UNSECURED ELECTRICAL ===
      'unsecured electrical', 'unsecured electrical connection', 'unsecured connection',
      'unsecured cable', 'unsecured cables', 'loose cable connection', 'loose electrical connection',
      'loose connection in', 'loose connection at', 'loose connection observed',

      // === EXPOSED CONDUCTORS ===
      'exposed conductors', 'exposed conductor', 'conductors exposed',
      'conductor exposed', 'live conductors', 'live conductor',
      'inner wire exposed', 'inner wires exposed', 'wire exposed',
      'wires exposed', 'bare conductors', 'bare conductor',

      // === WRONG METHOD / IMPROPER METHOD ===
      'wrong method', 'in wrong method', 'connected in wrong', 'improper method',
      'in improper method', 'wrong way', 'in wrong way', 'not correct method',
      'incorrect method', 'improper manner', 'wrong manner',

      // === CERTIFICATE EXPIRED ===
      'certificate expired', 'certificate found expired', 'certificate was expired',
      'third party certificate expired', 'third party certificate found expired',
      'expired certificate', 'expired third party certificate',
      'certification expired', 'certification found expired',
      'air compressor found expired', 'compressor found expired',
      'site found expired', 'use at site found expired',

      // === POSITIVE EARTHING/GROUNDING ===
      'adequately earthed', 'adequately grounded', 'properly earthed',
      'properly grounded', 'correctly earthed', 'correctly grounded',

      // === INTERNAL INSPECTION RECORDS ===
      'internal inspection record', 'inspection record available',
      'without any internal inspection', 'without internal inspection',
      'no internal inspection', 'internal maintenance inspection',
      'maintenance inspection records', 'internal maintenance records',

      // === POORLY MANAGED CABLES ===
      'poorly managed', 'cables poorly managed', 'cable poorly managed',
      'cables found poorly', 'cable found poorly',

      // === WHIP LASH / WHIP CHECK ARRESTOR ===
      'whip lash arrestor', 'whip lash arrester', 'whip check arrestor', 'whip check',
      'whiplash arrestor', 'whiplash arrester', 'no whip check', 'without whip check',
      'whip lash arrestor was not', 'whip lash arrestor not', 'whiplash not',
      'without whip lash', 'without whiplash', 'whip lash not attached',
      'whip lash arrestor not attached', 'air hose joints found without',

      // === BLACK SMOKE / EMISSIONS ===
      'black smoke', 'emitting black smoke', 'was emitting black smoke',
      'emitting smoke', 'excessive smoke', 'too much smoke', 'to much smoke',
      'bulldozer emitting', 'grader emitting', 'equipment emitting',
      'find black smoke', 'found black smoke', 'make black smoke',
      // Misspellings: bldozer, blodozer
      'bldozer black smoke', 'bldozer find black smoke', 'one bldozer find black',
      'find bldozer make black', 'blodozer to much smoke', 'blodozer smoke',
      'bldozer smoke', 'one bldozer', 'find bldozer',

      // === MIRRORS MISSING ===
      'rear view mirror', 'side view mirror', 'mirrors are not installed',
      'mirror not installed', 'mirrors not installed', 'mirror missing',
      'mirrors missing', 'no rear view mirror', 'no side view mirror',

      // === ACCESS STEPS MISSING ===
      'access steps missing', 'access steps to operator', 'steps to operator cabin',
      'operator cabin were missing', 'steps were missing', 'cabin steps missing',

      // === BACKSHIELD PROTECTION ===
      'no backshield', 'backshield protection', 'no backshield protection',
      'without backshield', 'backshield not', 'back shield not',

      // === MAKESHIFT / WELDED REPAIRS ===
      'makeshift welded', 'welded locking system', 'makeshift locking',
      'factory fitted', 'instead of factory', 'makeshift repair',

      // === EQUIPMENT DAMAGE ===
      'damage of disk', 'disk damaged', 'brake fail', 'brake failure',
      'door no moving', 'door not moving', 'door not open', 'back door no open',
      'sluf problem', 'stuck in soil', 'trailer stuck',
      'no good working', 'dump truck no good', 'one dump truck no good',
      'front cabnet open', 'front cabinet open', 'cabin doors kept open',
      'with the cabin doors kept open', 'operated with cabin doors open',
      'immediately brake fail', 'trailer brake fail', 'brake immediately fail',
      'changer tairs rim', 'change tires', 'changing rim',
      'one trailer sluf', 'trailer sluf problem',
      // Doing maintenance in wrong location
      'doing mentince', 'doing maintenance', 'operator doing maintenance',
      'no allow if any one have problem', 'go parking area',

      // === OVERLOADING ===
      'being overloaded', 'trailers where being overloaded', 'overloaded by',
      'trucks overloaded', 'overloading', 'in heap shape'
    ],
    moderatePatterns: [
      'maintenance', 'repair', 'repaired', 'serviced', 'servicing',
      'broken', 'damaged', 'faulty', 'defective', 'malfunction',
      'leak', 'leaking', 'leakage', 'worn', 'cracked',
      'unserviceable', 'inoperable'
    ],
    exclusionPatterns: [
      'inspection checklist', 'vvs', 'veri-fi', 'qr code',
      'access denied', 'access granted'
    ],
    minimumScore: 5
  },

  'Barriers': {
    strongPatterns: [
      // === MISSING BARRIERS ===
      'no barrier', 'without barrier', 'barrier not', 'missing barrier',
      'barrier not installed', 'barrier not provided', 'barrier missing',
      'barriers not', 'barriers missing', 'no barriers',
      'barrier absent', 'barrier removed', 'barrier damaged', 'barrier broken',
      'inadequate barrier', 'insufficient barrier', 'improper barrier',
      'no barricade', 'without barricade', 'barricade not', 'missing barricade',
      'barricade not installed', 'barricade not provided', 'barricades not',
      'barricade missing', 'barricade absent', 'barricade removed',
      'barricade damaged', 'barricade broken', 'barricade fallen',
      'fallen barricade', 'fallen barricades', 'barricade fell',
      'barricading not', 'barricading missing', 'not barricaded',
      'hard barricade not', 'soft barricade not', 'rigid barricade not',
      'hard barricade missing', 'soft barricade missing', 'rigid barricade missing',
      'no guardrail', 'without guardrail', 'guardrail not', 'missing guardrail',
      'guardrail not installed', 'guard rail not', 'guardrails not',
      'guardrail missing', 'guardrail absent', 'guardrail removed',
      'guardrail damaged', 'guardrail broken', 'guardrail bent',
      'no handrail', 'without handrail', 'handrail not', 'missing handrail',
      'hand rail not', 'handrails not', 'handrail missing', 'handrail absent',
      'handrail removed', 'handrail damaged', 'handrail broken', 'handrail loose',
      // Misspellings - barriers/barricades
      'barier', 'bariers', 'barior', 'baricade', 'baricades', 'barricad',
      'barrikade', 'barrikades', 'barrricade', 'barracade', 'baracade',
      // Misspellings - guardrails/handrails
      'gaurd rail', 'gaurdrail', 'gaurdrails', 'guardrails', 'gaurdail',
      'guad rail', 'guard rails', 'guardrail', 'gard rail',
      'handrails', 'handral', 'handrals', 'hanrail', 'hanrails',
      'hand rails', 'hand-rail', 'hand-rails',

      // === EDGE PROTECTION (Working at Height) ===
      'no edge protection', 'without edge protection', 'edge protection not',
      'edge protection missing', 'edge protection absent', 'edge protection removed',
      'unprotected edge', 'unprotected edges', 'edge not protected',
      'edges not protected', 'leading edge not', 'leading edge unprotected',
      'edge unprotected', 'edges unprotected', 'open edge', 'open edges',
      'edges are open', 'edge is open', 'edges open', 'edge open',
      'exposed edge', 'exposed edges', 'edge exposed', 'edges exposed',
      'edge barrier not', 'edge barrier missing', 'perimeter not protected',
      'perimeter unprotected', 'unprotected perimeter', 'perimeter protection not',
      'roof edge not', 'roof edge unprotected', 'platform edge not',
      'slab edge not', 'slab edge unprotected', 'floor edge not',
      'working at the edges', 'working at edges', 'standing at the edges',
      'at the edges of', 'edges of a culvert', 'edges of the culvert',
      'pit where the edges', 'top of the pit', 'edges of excavation',

      // === SCAFFOLD BARRIERS (Working at Height) ===
      'scaffold without handrail', 'scaffold without guardrail', 'scaffold no handrail',
      'scaffold no guardrail', 'scaffolding without handrail', 'scaffolding without guardrail',
      'scaffold missing handrail', 'scaffold missing guardrail', 'scaffolding missing guardrail',
      'scaffold handrail not', 'scaffold guardrail not', 'scaffold handrail missing',
      'scaffold guardrail missing', 'platform without guardrail', 'platform without handrail',
      'platform no guardrail', 'platform no handrail', 'ladder cage not',
      'ladder cage missing', 'no toe board', 'without toe board', 'toe board not',
      'toe board missing', 'toeboard not', 'toeboard missing', 'no toeboard',
      'toe boards not', 'toeboards not', 'toeboards missing', 'toe-board not',
      'no mid rail', 'mid rail not', 'mid rail missing', 'mid-rail not',
      'mid-rail missing', 'midrail not', 'midrail missing', 'no midrail',
      'intermediate rail not', 'intermediate rail missing', 'knee rail not',

      // === SAFETY NETS & CATCH PLATFORMS ===
      'no safety net', 'without safety net', 'safety net not', 'safety net missing',
      'safety netting not', 'safety netting missing', 'safety nets not',
      'no catch net', 'without catch net', 'catch net not', 'catch net missing',
      'catch netting not', 'catch platform not', 'catch platform missing',
      'no debris net', 'debris net not', 'debris netting not', 'debris net missing',
      'fall arrest net not', 'fall net not', 'fall net missing',

      // === PARAPET & WALLS ===
      'parapet not', 'parapet missing', 'no parapet', 'without parapet',
      'parapet wall not', 'parapet too low', 'parapet height not',
      'parapet damaged', 'parapet broken', 'low parapet',
      'retaining wall not', 'retaining wall missing', 'kick wall not',
      'kick plate not', 'kick plate missing', 'kickboard not', 'kickboard missing',

      // === FLOOR OPENINGS & HOLES ===
      'floor opening not', 'floor opening unprotected', 'opening not covered',
      'opening not protected', 'opening unprotected', 'uncovered opening',
      'uncovered openings', 'uncovered opening', 'hole not covered', 'hole not protected',
      'holes not covered', 'holes not protected', 'floor hole not', 'hole uncovered',
      'shaft opening not', 'shaft opening uncovered', 'shaft uncovered',
      'elevator opening not', 'elevator opening uncovered', 'lift opening not', 'lift opening uncovered',
      'stairwell opening not', 'stairwell opening uncovered', 'stairwell uncovered',
      'void not covered', 'void not protected', 'void uncovered', 'voids uncovered',
      'voids not covered', 'open void', 'unprotected void', 'unprotected voids',
      'penetration not covered', 'penetrations not covered', 'penetration uncovered', 'cover missing',
      'hole cover not', 'hole cover missing', 'floor cover not', 'floor uncovered',

      // === FENCING ===
      'no fencing', 'without fencing', 'fence not', 'unfenced',
      'fencing not', 'fencing missing', 'fence missing', 'no fence',
      'fence not installed', 'fencing not provided', 'fencing damaged',
      'fence damaged', 'fence broken', 'fence fallen', 'fence removed',
      'green mesh missing', 'mesh missing', 'mesh damaged', 'mesh torn',
      'mesh removed', 'mesh not', 'wire mesh not', 'wire mesh missing',
      'chain link not', 'chain link missing', 'chainlink not', 'chainlink missing',
      'hoarding not', 'hoarding missing', 'site hoarding not', 'hoarding damaged',
      'temporary fence not', 'temp fence not', 'perimeter fence not',
      // Misspellings - fencing
      'fensing', 'fense', 'fenses', 'fenceing', 'fenc not',

      // === DEMARCATION ===
      'no demarcation', 'without demarcation', 'demarcation not',
      'demarcation missing', 'not demarcated', 'un-demarcated', 'undemarcated',
      'demarcation not provided', 'zone not demarcated',
      'area not demarcated', 'not properly demarcated', 'poorly demarcated',
      'inadequate demarcation', 'insufficient demarcation', 'demarcation removed',
      'demarcation damaged', 'demarcation faded', 'demarcation unclear',
      // Misspellings - demarcation
      'demarcations', 'demaracation', 'demarkation', 'demark', 'demarcaton',
      'deamarcation', 'demarcaion', 'demarcatin', 'demaraction',

      // === CAUTION & WARNING TAPE ===
      'caution tape not', 'caution tape missing', 'no caution tape',
      'without caution tape', 'caution tape removed', 'caution tape broken',
      'warning tape not', 'warning tape missing', 'no warning tape',
      'danger tape not', 'danger tape missing', 'no danger tape',
      'hazard tape not', 'hazard tape missing', 'tape not', 'tape missing',
      'tape removed', 'tape broken', 'tape torn', 'barrier tape not',
      'barrier tape missing', 'red and white tape not', 'red white tape not',
      'yellow tape not', 'safety tape not', 'safety tape missing',
      'tape is being used on site', 'not compliant with neom', 'tape not compliant',
      'warning tap not allowed', 'warning tape not allowed', 'tap not allowed',

      // === EXCLUSION ZONE ===
      'no exclusion zone', 'without exclusion zone', 'exclusion zone not',
      'exclusion zone missing', 'exclusion zone not established',
      'no safe zone', 'safe zone not', 'red zone not', 'red zone missing',
      'amber zone not', 'yellow zone not', 'green zone not',
      'zones not identified', 'zones not established', 'zones not marked',
      'drop zone not', 'drop zone missing', 'no drop zone', 'drop zone unmarked',
      'swing zone not', 'swing radius not', 'danger zone not', 'danger zone missing',
      'restricted zone not', 'restricted area not', 'work zone not',
      'exclusion area not', 'buffer zone not', 'buffer zone missing',

      // === VEHICLE/EQUIPMENT FALL PROTECTION ===
      'preventing vehicles from falling', 'prevent vehicles from falling',
      'vehicles or equipment from falling', 'equipment from falling into',
      'do not have a mean of preventing', 'no mean of preventing',
      'without mean of preventing', 'lack of protection for vehicles',
      'risk of vehicles falling', 'risk of equipment falling',
      'vehicles falling into excavation', 'vehicles falling into the excavation',
      'close to the access road', 'excavation close to road',

      // === BERMS & STOP BLOCKS (Excavation Edge Protection) ===
      'no berm', 'without berm', 'berm not', 'berm missing', 'berms not',
      'berms missing', 'no berms', 'berm not installed', 'berm not provided',
      'sand berm not', 'sand berm missing', 'sand berms not', 'no sand berm',
      'soil berm not', 'soil berm missing', 'soil berms not', 'no soil berm',
      'earth berm not', 'earth berm missing', 'earthen berm not',
      'no stop block', 'stop block not', 'stop block missing', 'stop blocks not',
      'stop blocks missing', 'without stop block', 'no stop blocks',
      'wheel stop not', 'wheel stops not', 'wheel stop missing',
      'vehicle stop not', 'vehicle stops not', 'vehicle stop missing',
      'no vehicle stop', 'without vehicle stop', 'vehicle barrier not',
      'bund not', 'bund missing', 'bunds not', 'bunds missing',
      'earthen barrier not', 'earthen barrier missing',
      'open excavation unprotected', 'unsecured excavation', 'unprotected excavation',
      'excavation not secured', 'excavation not protected', 'excavation unbarricaded',
      'trench not secured', 'trench not protected', 'unsecured trench',

      // === SEGREGATION ===
      'no segregation', 'without segregation', 'not segregated',
      'segregation not', 'segregation missing', 'no separation',
      'not separated', 'without separation', 'separation not',
      'pedestrian not segregated', 'traffic not segregated',
      'pedestrian vehicle segregation not', 'no pedestrian segregation',
      'man machine segregation not', 'people plant segregation not',
      'inadequate segregation', 'poor segregation', 'lack of segregation',
      'worker segregation not', 'work area segregation not',

      // === DELINEATORS ===
      'no delineator', 'delineator not', 'delineator missing', 'delineators not',
      'delineators missing', 'without delineator', 'delineator removed',
      'road delineator not', 'traffic delineator not', 'flexible delineator not',
      'post delineator not', 'reflective delineator not',

      // === CONES/BOLLARDS ===
      'no cones', 'without cones', 'cones not', 'cones missing',
      'traffic cones not', 'no traffic cones', 'cones not placed',
      'cones removed', 'cones absent', 'cone not', 'cone missing',
      'safety cones not', 'safety cones missing', 'road cones not',
      'no bollard', 'without bollard', 'bollard not', 'bollards not',
      'bollards missing', 'no bollards', 'bollard removed', 'bollards removed',
      'bollard damaged', 'bollards damaged', 'flexible bollard not',

      // === WHEEL CHOCKS/STOPPERS ===
      'no wheel chock', 'without wheel chock', 'wheel chock not',
      'wheel chocks not', 'chock not', 'chocks not', 'no chock',
      'chock missing', 'chocks missing', 'wheel chock missing',
      'no wheel stopper', 'without wheel stopper', 'stopper not',
      'stoppers not', 'without stopper', 'no stopper', 'stopper missing',
      'wheel choker not', 'choker not', 'chokers not', 'choker missing',
      'wheel block not', 'wheel blocks not', 'no wheel block',
      // Misspellings - chocks
      'chok not', 'choks not', 'chock not', 'whell chock', 'weel chock',
      'wheel chalk', 'wheel chalks', 'wheel chok', 'wheel choks',
      // Positive chocks
      'wheel chock provided', 'wheel chocks provided', 'chocks in place',
      'chock in place', 'stopper provided', 'stoppers provided',
      'wheel chokers', 'equipped with wheel chock', 'chocks available',

      // === POSITIVE BARRIERS (when barriers ARE in place) ===
      'barrier installed', 'barrier provided', 'barriers in place',
      'barricade in place', 'barricade installed', 'barricaded', 'properly barricaded',
      'hard barricade in place', 'soft barricade in place', 'rigid barricade in place',
      'fenced', 'fencing installed', 'fencing provided', 'fencing in place',
      'demarcated', 'properly demarcated', 'demarcation in place',
      'exclusion zone established', 'exclusion zone in place', 'drop zone marked',
      'segregated', 'properly segregated', 'separation in place',
      'cones placed', 'cones provided', 'traffic cones in place',
      'bollards installed', 'bollards in place', 'delineators in place',
      'guardrail installed', 'guardrails in place', 'handrail installed',
      'handrails in place', 'edge protection in place', 'edge protected',
      'toe board in place', 'toeboards in place', 'mid rail in place',
      'safety net in place', 'safety netting installed', 'catch net installed',
      'floor opening covered', 'holes covered', 'voids covered', 'openings protected',

      // === MID-RAIL / TOP-RAIL / SCAFFOLD PLATFORMS ===
      'mid-rail missing', 'mid rail missing', 'midrail missing', 'mid-rail was missing',
      'mid rail was missing', 'toprail missing', 'top rail missing', 'top-rail missing',
      'scaffolding tube cap', 'tube cap properly installed', 'tube cap installed',
      'tubes properly capped', 'scaffold tubes capped',
      // Missing top rail (observed in data)
      'lacking top rail', 'lacking its top rail', 'was lacking its top rail',
      'scaffold was lacking', 'scaffolding top rail', 'no top rail',
      'without top rail', 'top rail was missing', 'toprail was missing',
      'scaffold lacking top', 'missing top rail', 'scaffold top rail missing',
      // Misspellings
      'midtrial', 'no midtrial', 'midtrail missing', 'midrail missing',

      // === DROP BAR / GATE / SCAFFOLD ACCESS ===
      'no drop bar', 'drop bar not', 'drop bar missing', 'missing drop bar',
      'without drop bar', 'drop bar installed', 'drop bar at scaffold',
      'entry gate missing', 'entry gate not', 'no entry gate', 'scaffold entry gate',
      'scaffold access gate', 'access gate missing', 'platform entrance',
      'scaffold platform entrance', 'at front of access', 'ledger installed as a fall',
      // Scaffold access blocked/obstructed
      'scaffold access blocked', 'access to scaffold blocked', 'access blocked',
      'blocked access', 'access ladder blocked', 'ladder blocked',
      'scaffold access was blocked', 'access was blocked', 'blocked with shuttering',
      'obstructed access', 'access obstructed', 'obstruction at access',
      'cleared from obstruction', 'timbers were placed there', 'materials blocking',

      // === OPENING/HOLE COVERS (Working at Height) ===
      'opening without cover', 'opening not covered', 'openings not covered',
      'hole without cover', 'holes without cover', 'uncovered hole', 'uncovered holes',
      'manhole without cover', 'manhole not covered', 'cover missing',
      'walking surfaces shall be protected', 'protected from falling through',
      'falling through holes', 'holes covers', 'hole covers missing',

      // === FALL PROTECTION GENERAL ===
      'no fall protection', 'fall protection not', 'fall protection missing',
      'without fall protection', 'improper fall protection', 'inadequate fall protection',
      'fall protection to be provided', 'fall protection is missing',
      'no fall protection of worker', 'fall protection - no means',

      // === EXCLUSION ZONE ===
      'no exclusive zone', 'no exclusion zone', 'exclusive zone not',
      'exclusion zone not established', 'exclusion zone missing',
      'without exclusive zone', 'without exclusion zone',

      // === ACCESS/EGRESS ISSUES ===
      'poor access egress', 'poor access and egress', 'access egress arrangements',
      'unsafe access', 'unsafe egress', 'no means of safe access',
      'without proper safe access', 'without safe access', 'proper safe access',
      'access close with materials', 'access closed', 'access found unsafe',
      'loose steps', 'loose step', 'steps that may lead', 'steps that my lead',
      'unprotected ramp access', 'unprotected ramp', 'ramp access along',

      // === SCAFFOLD WITHOUT TAG ===
      'scaffolding at septic without', 'scaffold without any tag',
      'scaffolding without any tag', 'scaffold without tag', 'scaffolding without tag',
      'scaffold with red rag', 'scaffold with red', 'working on scaffold with red',

      // === TOWER LIGHT BOOM POSITION ===
      'tower light boom kept', 'tower light boom stand', 'boom kept upright',
      'boom stand upward', 'upright position after', 'might fall while',
      'lead to fall', 'it lead to fall',
      // Light post/tower on excavation
      'light post on top of excavation', 'light post on excavation',
      'unsecured light post', 'unstable light post', 'unstable & unsecured',
      'light post on top', 'positioned at the edge of an excavation',

      // === SAFETY BERM ===
      'no berm', 'berm not installed', 'no send berm', 'send berm',
      'berm was not', 'safety berm not', 'without berm', 'berm missing',
      'earth berm not', 'earth berm missing',
      'height of the soil berms', 'soil berms provided', 'berms provided at',
      'berm height', 'berms is too low', 'berm is too low', 'too low berm',
      'not meeting with the requirements', 'not meeting requirements',

      // === SAFE DISTANCE / SPACING ===
      'not keeping safe distance', 'not maintaining safe distance', 'safe distance not',
      'not maintain safe distance', 'maintaining safe distance', 'keeping safe distance',
      'found not maintaining safe', 'parked side by side', 'side by side with another',
      'dumping material in stockpiles area when', 'during loading time',
      'worker was not maintaining a safe', 'was not maintaining a safe distance',
      'not maintaining a safe distance from', 'safe distance from the equipment',

      // === SOIL STOCKPILE ===
      'soil stockpile not isolated', 'stockpile not isolated', 'stockpile without',
      'boulders rolling from the top', 'rolling from the top of stockpile',
      'being pushed by the wheel loader', 'towards the vehicle and people',

      // === TARPING STATION ===
      'tarping station', 'de-tarping station', 'detarping station',
      'tarping task not done', 'not at established tarping', 'established tarping station',
      'seating provision', 'seating provision to be made', 'seating provision not provided',
      'seating provision was not', 'worker was standing behind the truck',
      'standing behind the truck at', 'de-trapping by himself', 'detrapping by himself',

      // === UNSAFE/INADEQUATE ARRANGEMENTS ===
      'found unsafe', 'arrangements found unsafe', 'access egress arrangements',
      'toilet water tank found unsafe', 'water tank found unsafe',
      'arrangements for the workers', 'workers toilet water tank',
      'no edge protection provided', 'edge protection provided at the roof',
      'and no edge protection', 'unsafe and no edge',

      // === INAPPROPRIATE OPENING ===
      'inappropriate opening', 'narrow inappropriate opening', 'narrow opening',
      'inappropriate opening provided', 'only one narrow',

      // === EXCLUSIVE ZONE ESTABLISHED (positive) ===
      'exclusive zone was established', 'exclusive zone established',
      'exclusion zone was established', 'exclusion zone found available',
      'zone was established around', 'established around the boom',
      'around the boom radius', 'boom radius area',

      // === EXCAVATION PROTECTION (specific patterns) ===
      'deep excavation', 'deep excavation without protection', 'deep excavation without',
      'excavation without protection', 'excavation edge not protected',
      'excavation edge was not protected', 'excavation edges not protected',
      'no protection done for the deep', 'protection done for the deep',
      'unprotected excavation', 'unprotected excavated area', 'unprotected excavated',
      'excavation without full protection', 'excavation was observed without',
      'excavation close to', 'deep excavation close', 'excavation near access',
      'excavation lacks demarcation', 'excavation without isolation',
      'trench without protection', 'trench not protected', 'deep trench without',
      'deep pit', 'open pit', 'open pit found', 'pit found with',
      'pit without protection', 'pit without edge', 'pit posing',
      'open floors', 'open floors found', 'found open floors',
      'open hole', 'open hole observed', 'open space observed',
      'excavation edge', 'edges of excavation', 'leading edges of excavation',
      'leading edges of the excavation', 'uneven slope', 'loose soil',
      'excavation edges with accumulated', 'accumulated water',
      'excavation protection', 'excavation edge protection',
      'unprotected pipeline', 'pipeline near excavation', 'pipeline not protected',
      // Extended excavation patterns
      'unprotected open excavation', 'open excavation', 'open excavation that could',
      'employees shall be protected', 'protected from open excavations',
      'falling or rolling into', 'pose a hazard by falling',
      'beside loose edge', 'loose edge of excavation', 'resting just beside',
      'near to electrical foundation', 'excavation near to', 'fall due to vibration',
      'excavation or deep area', 'access egress to different elevation',
      'deep area without providing', 'without providing adequate access',
      'unprotected deep trench', 'deep trench edges', 'trench edges adjacent',
      'adjacent to heavy truck', 'adjacent to truck movement',
      'soil berms are not provided', 'soil berms not provided', 'no soil berms',
      'no soil berm provided', 'soil berm not', 'berm provided along',
      'contain rolling stones', 'unstable boulders on the ramp',
      'boulders on the ramp', 'roll down and harm', 'potential to roll down',
      'dumping at the edge', 'dumping at edge of excavation',
      'dum trucks are dumping at the edge', 'trucks dumping at edge',
      'dupming at the edge', 'are dupming at', 'dum trucks are dupming',
      'bulldozer was working at the edge', 'working at the edge of excavation',
      'working at edge of excavation', 'equipment at edge of excavation',
      'boom truck parked near edge', 'parked on unstable ground',
      'unstable ground and near the edge', 'near the edge of an excavation',
      'vehicle tilting', 'overturning', 'ground collapse',
      'undercutting of excavation', 'excavation wall undercutting',
      'no sloping', 'without proper sloping', 'vertical cutting without',
      'vertical cutting without proper', 'sloping or benching',
      'chance of excavation collapse', 'collapse due to vibration',
      'no speed humps for', 'speed humps for the temporary traffic',
      'inside the excavation', 'below the surface', 'traffic below',
      'no pedestrian walkways', 'segregate plant and people below',
      'tower light at edge', 'tower light positioned at edge',
      'positioned at the edge of an excavation', 'edge of an excavation site',
      // Access/egress in excavation
      'no means of access or egress', 'means of access or egress',
      'no means of access provided', 'means of access egress provided',
      'access egress provided outside', 'from inside the foundation',
      'foundation wall shatter', 'steel under erection',
      'safe means of access egress', 'no safe means of access',
      'excavation pit without a proper', 'inside an excavation pit without',
      'such as ladder or ramp', 'excavation safety requirements',
      'steel fixers found walking', 'walking on foundation steel',
      'not safe means of walkways', 'footing of the retaining wall'
    ],
    moderatePatterns: [
      'barrier', 'barriers', 'barricade', 'barricades', 'barricaded', 'barricading',
      'hard barricade', 'soft barricade', 'rigid barricade',
      'guardrail', 'guardrails', 'guard rail', 'guard rails',
      'handrail', 'handrails', 'hand rail', 'hand rails',
      'fence', 'fencing', 'fenced', 'mesh', 'hoarding', 'chainlink',
      'demarcation', 'demarcated', 'exclusion zone', 'safe zone', 'drop zone',
      'segregation', 'segregated', 'separation', 'separated',
      'cones', 'traffic cones', 'safety cones', 'bollard', 'bollards',
      'delineator', 'delineators', 'caution tape', 'warning tape', 'barrier tape',
      'wheel chock', 'wheel chocks', 'chock', 'chocks', 'stopper', 'choker',
      'edge protection', 'perimeter protection', 'leading edge',
      'toe board', 'toeboard', 'mid rail', 'midrail', 'knee rail',
      'safety net', 'catch net', 'debris net', 'fall net',
      'parapet', 'kick plate', 'kickboard', 'floor opening', 'void'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi',
      'barrier cream', 'language barrier', 'communication barrier'
    ],
    minimumScore: 5
  },

  'Signage': {
    strongPatterns: [
      // === MISSING SIGNAGE ===
      'no sign', 'without sign', 'sign not', 'missing sign',
      'no signage', 'without signage', 'signage not', 'missing signage',
      'no signages', 'without signages', 'signages not', 'missing signages',
      'lack of signage', 'lack of signages', 'non-availability of signages',
      'non-availability of any signages', 'signages were not', 'signage was not',
      'no warning sign', 'without warning sign', 'warning sign not', 'warning signs not',
      'no warning signage', 'warning signage not', 'lack of warning signage',
      'no safety sign', 'without safety sign', 'safety sign not',
      'no safety signage', 'safety signage not', 'safety signages not',
      'no caution signage', 'caution signage not', 'lack of caution signage',
      'no awareness signage', 'awareness signage not', 'lack of awareness signage',
      'no identification signage', 'identification signage not', 'lack of identification signage',
      'no communication signage', 'communication signage not', 'lack of communication signage',
      'no label', 'without label', 'label not', 'unlabeled', 'unlabelled',
      'no marking', 'without marking', 'marking not', 'unmarked',

      // === SIGN BOARD PATTERNS ===
      'sign board', 'signboard', 'safety sign board', 'safety signboard',
      'sign board not', 'signboard not', 'signboard fallen', 'sign board fallen',
      'sign board fall', 'signboard fall', 'no sign board', 'no signboard',
      'sign board was', 'signboard was', 'safety sign board not',

      // === SIGNS FALLING/FALLEN ===
      'sign fall down', 'sign fell down', 'sign fallen', 'signs fall down',
      'signage fall down', 'signage fell down', 'signage fallen',
      'fallen signage', 'fallen sign', 'fallen signboard', 'fallen sign board',
      'sign falling', 'signage falling', 'about to fall', 'loose signage',
      'signboard had fallen', 'sign board had fallen', 'signage had fallen',
      'fallindown signage', 'fallindown sign', 'falling down signage',
      'safety signboard was fallen', 'safety sign board was fallen',
      'sign fall due', 'sign fell due', 'signage fell due',
      'some sign fall', 'some signs fall', 'sign fell',

      // === SPECIFIC SIGNAGE TYPES ===
      'wah signage', 'work at height signage', 'working at height signage',
      'watch your step', 'watch your step signage', 'step signage',
      '100% tie off signage', 'tie off signage', 'fbh signage', 'harness signage',
      'fbh required signage', 'harness required signage',
      'no entry signage', 'restricted access signage', 'danger signage',
      'hazard signage', 'risk signage', 'exclusion zone signage',
      'speed signage', 'speed limit signage', 'directional signage',
      'parking signage', 'access signage', 'exit signage', 'emergency signage',

      // === TRAFFIC & STOP SIGNS ===
      'no stop sign', 'stop sign not', 'stop sign missing', 'stop signs not',
      'stop signs missing', 'without stop sign', 'missing stop sign',
      'stop sign not installed', 'stop sign not provided', 'stop sign absent',
      'no yield sign', 'yield sign not', 'yield sign missing',
      'no give way sign', 'give way sign not', 'give way sign missing',
      'no speed limit sign', 'speed limit sign not', 'speed limit sign missing',
      'speed sign not', 'speed sign missing', 'no speed sign',
      'speed limit not displayed', 'speed limit not posted', 'speed limit sign faded',
      'no traffic sign', 'traffic sign not', 'traffic signs not',
      'traffic sign missing', 'traffic signs missing', 'without traffic sign',
      'road sign not', 'road signs not', 'road sign missing',
      'pedestrian sign not', 'pedestrian sign missing', 'no pedestrian sign',
      'crossing sign not', 'crossing sign missing', 'no crossing sign',
      'one way sign not', 'one way sign missing', 'no one way sign',
      'entry sign not', 'no entry sign missing', 'entry sign missing',
      'reversing sign not', 'reversing sign missing', 'no reversing sign',
      'banksman sign not', 'banksman sign missing', 'spotter sign not',

      // === BARRIER/EDGE SIGNAGE ===
      'edge protection signage', 'fall hazard signage', 'fall protection signage',
      'excavation signage', 'trench signage', 'deep excavation signage',
      'unprotected edge signage', 'leading edge signage',
      'barriers or warning signages', 'barriers and warning signages',
      'barricade and signage', 'barricades and signages',
      'edge protection and signage', 'signage and barricade',
      'appropriate signage', 'proper signage', 'sufficient signage',

      // === POSITIVE SIGNAGE ===
      'sign installed', 'signage in place', 'signage posted', 'signs posted',
      'warning sign displayed', 'safety sign posted', 'labeled', 'labelled',
      'marked', 'signs placed', 'signage provided', 'signages provided',
      'signage has been provided', 'signage has been placed', 'signage installed',
      'proper signage placed', 'appropriate signage placed', 'signage displayed',
      'banners and posters', 'posters displayed', 'banners displayed',
      'worker was replacing', 'worker replacing', 'replacing the signage',
      'replacing signage', 'replacing the fallen', 'signage replaced',

      // === MISSPELLINGS ===
      'signges', 'signag', 'sinage', 'singae', 'singage', 'singage',
      'waring sign', 'warining sign', 'saftey sign', 'safty sign'
    ],
    moderatePatterns: [
      // NOTE: Removed 'sign' - too short, matches 'significant', 'assigned', etc.
      // NOTE: Removed 'notice' - matches 'noticed', 'notified', etc. Use 'notice board' instead
      'signs', 'signage', 'signages', 'signboard', 'sign board',
      'label', 'labels', 'marking', 'markings', 'placard', 'placards',
      'poster', 'posters', 'banner', 'banners',
      'warning sign', 'safety sign', 'caution sign', 'danger sign',
      'hazard sign', 'notice board', 'sticker', 'stickers'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi',
      'scaffold tag', 'scaff tag', 'scaffolding tag'
    ],
    minimumScore: 5
  },

  'Emergency Preparedness': {
    strongPatterns: [
      // Emergency equipment issues
      'no fire extinguisher', 'without fire extinguisher', 'fire extinguisher not',
      'fire extinguisher missing', 'fire extinguisher expired',
      'extinguisher not inspected', 'extinguisher not available',
      'no first aid', 'without first aid', 'first aid not', 'first aid missing',
      'first aid kit not', 'first aid kit missing', 'first aid kit expired',
      'no emergency', 'emergency equipment not', 'emergency kit not',
      // Medical supplies not available
      'atropine is not available', 'atropine not available', 'glucagon is not available',
      'glucagon not available', 'amiodarone is not available', 'amiodarone not available',
      'adrenaline is not available', 'adrenaline not available', 'epinephrine not available',
      'airway kit are not available', 'airway kit not available', 'oral and nasal airway',
      'nasal airway kit', 'medical supplies not available', 'medication not available',
      // Positive emergency preparedness
      'fire extinguisher available', 'fire extinguisher inspected',
      'first aid kit available', 'first aid kit inspected',
      'emergency equipment available', 'emergency kit provided',

      // === FIRE HAZARDS / FLAMMABLE MATERIALS ===
      'fire hazard', 'fire hazards', 'potential fire hazard',
      'flammable material', 'flammable materials', 'combustible material',
      'combustible materials', 'petrol stored', 'petrol found stored',
      'fuel stored', 'fuel found stored', 'fuel can stored',
      'empty fuel can', 'fuel can near', 'near the dg', 'near generator',
      'fire and health hazards', 'fire risk', 'fire safety',
      'fire point access', 'fire point access blocked', 'fire fighting equipment',
      'no arrangements made for fire', 'fire fighting arrangements',

      // === EYE WASH / EMERGENCY STATIONS ===
      'eye wash station', 'eye wash provided', 'eyewash station',
      'eye wash bottles', 'portable eye wash', 'eye wash facility',

      // === HEAT STRESS / FLAG SYSTEM ===
      'heat stress', 'heat stress risk', 'flagging system', 'flag system',
      'flag colors', 'heat stress risk levels', 'heat stress precautionary',

      // === EMERGENCY ACCESS ===
      'emergency access', 'emergency routes', 'emergency exit',
      'muster point', 'assembly point', 'evacuation route'
    ],
    moderatePatterns: [
      'fire extinguisher', 'extinguisher', 'first aid', 'first aid kit',
      'emergency', 'evacuation', 'muster', 'assembly point'
    ],
    exclusionPatterns: [
      'qr code', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 5
  },

  'Permit': {
    strongPatterns: [
      // Permit issues
      'no permit', 'without permit', 'permit not', 'missing permit',
      'permit expired', 'invalid permit', 'permit not available',
      'no ptw', 'without ptw', 'ptw not', 'missing ptw',
      'work permit not', 'work permit missing', 'work permit expired',
      'permit to work not', 'permit to work missing',
      'no hot work permit', 'hot work permit not',
      'no excavation permit', 'excavation permit not',
      'incomplete permit', 'permit incomplete',
      // Positive permit observations
      'permit issued', 'permit in place', 'valid permit',
      'ptw issued', 'ptw verified', 'permit available', 'permit checked',

      // === CONFINED SPACE ===
      'confined space', 'confined space activity', 'confined space entry',
      'inside confined space', 'in confined space', 'entering confined space',
      'confined space area', 'confined space without', 'confined space not',
      'gas test', 'gas test conducted', 'gas test was conducted',
      'gas test not conducted', 'gas test was not conducted', 'no gas test',
      'without gas test', 'gas testing', 'atmospheric testing',
      'watchman with log sheet', 'watch man with log', 'watchman log sheet',
      'confined space arrangements', 'proper arrangements', '100% tie off'
    ],
    moderatePatterns: [
      'permit', 'ptw', 'work permit', 'hot work', 'excavation permit',
      'isolation', 'loto', 'lockout', 'tagout'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 5
  },

  'Documentations': {
    strongPatterns: [
      // Documentation issues
      'no documentation', 'without documentation', 'documentation not',
      'documents not available', 'documents missing', 'no documents',
      'method statement not', 'no method statement', 'missing method statement',
      'risk assessment not', 'no risk assessment', 'missing risk assessment',
      'rams not', 'no rams', 'rams not available',
      'jsa not', 'no jsa', 'jsa not available',
      'procedure not', 'no procedure', 'procedure not followed',
      // Positive documentation
      'documents available', 'documentation in place', 'documents verified',
      'method statement available', 'risk assessment available',
      'rams available', 'jsa completed', 'procedure followed',

      // === CHEMICAL STORAGE / MSDS ===
      'msds', 'material safety data sheet', 'safety data sheet', 'sds',
      'msds requirements', 'following the msds', 'not following msds',
      'without following msds', 'chemical without msds', 'chemicals without',
      'msds regarding', 'chemical has been used', 'chemicals used without',
      'chemical storage', 'chemicals stored', 'chemical container',
      'chemical exposed to sunlight', 'chemical directly exposed',
      'chemical silicone', 'unauthorized location', 'cold storage',
      'hazardous chemicals', 'hazardous chemical', 'chemicals without drip',
      'drip trays', 'without drip trays', 'soil contamination',

      // === COMPRESSED GAS CYLINDERS ===
      'compressed gas', 'gas cylinders', 'compressed gas cylinders',
      'unsecured compressed gas', 'unsecured cylinders', 'unsecured gas cylinders',
      'oxygen & acetylene', 'oxygen and acetylene', 'acetylene cylinders',
      'oxygen cylinders', 'no protective caps', 'no protective cap',
      'protective caps at nozzle', 'without trolly', 'without trolley',
      'cylinders without trolley', 'gas cylinder storage', 'cylinder storage',

      // === PAINTING CHEMICALS / COSHH ASSESSMENT ===
      'painting chemicals', 'painting chemical substances', 'chemicals substances',
      'chemicals substances observed', 'no coshh assessment', 'missing coshh assessment',
      'coshh assessment not', 'coshh assessment missing', 'there is no coshh',
      'without coshh assessment', 'coshh not available', 'coshh not done',
      'coshh assessment of hazardous', 'coshh assessment was not',

      // === FLAMMABLE CHEMICAL CONTAINERS ===
      'flammable properties', 'having flammable properties', 'containers having flammable',
      'flammable containers', 'chemical used containers', 'used containers',
      'containers disposed on ground', 'disposed on the ground',
      'disposed on ground', 'chemical containers disposed', 'flammable disposed'
    ],
    moderatePatterns: [
      'documentation', 'documents', 'method statement', 'risk assessment',
      'rams', 'jsa', 'jha', 'procedure', 'sop'
    ],
    exclusionPatterns: [
      'qr code', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 5
  },

  'Behavioural': {
    strongPatterns: [
      // === GENERAL UNSAFE BEHAVIORS ===
      'unsafe act', 'unsafe action', 'unsafe behavior', 'unsafe behaviour',
      'at risk behavior', 'at-risk behavior', 'risky behavior', 'risky behaviour',
      'unsafe practice', 'unsafe work practice', 'unsafe working practice',
      'near miss', 'near-miss', 'nearmiss', 'near hit',
      'good catch', 'stop work', 'stop work authority',

      // === PPE BEHAVIOR VIOLATIONS (not wearing/using PPE) ===
      'not wearing proper ppe', 'not wearing mandatory ppe', 'not wearing required ppe',
      'not wearing ppe', 'without wearing ppe', 'without the required ppe',
      'without mandatory ppe', 'without proper ppe', 'not using ppe',
      'without the mandatory ppe', 'without mandatory ppe', 'on-site without the mandatory',
      'working on-site without the mandatory', 'working without the mandatory ppe',
      'operator was not wearing', 'worker was not wearing', 'workers not wearing',
      'operatives not wearing', 'found not wearing', 'observed not wearing',
      'surveyor was not wearing', 'surveyor working without', 'engineer not wearing',
      'was not wearing helmet', 'was not wearing gloves', 'was not wearing mask',
      'was not wearing seatbelt', 'was not wearing safety shoes', 'was not wearing harness',
      'without wearing helmet', 'without wearing gloves', 'without wearing mask',
      'without wearing harness', 'without wearing safety', 'without wearing hand gloves',
      'working without wearing', 'performing without wearing', 'engaged without wearing',
      'come to site without helmet', 'arrived without ppe', 'found without ppe',
      'not wearing ear protection', 'not wearing safety glasses', 'not wearing hi-vest',
      'not wearing high-visibility', 'not wearing overall', 'not wearing face shield',
      'without the mandatory personal protective', 'without essential personal protective',
      'without mandatory personal protective', 'without required personal protective',
      'without any fall protection', 'without fall protection', 'found without fall protection',
      'outside barricades without', 'found outside barricades',

      // === POSITION/LOCATION VIOLATIONS ===
      'standing on the edges', 'standing on edges', 'standing at edges',
      'standing on unprotected edges', 'standing at unprotected edges',
      'standing near the edges', 'standing close to edges',
      'standing too close', 'working too close', 'found too close',
      'too close to moving', 'too close to the excavator', 'too close to equipment',
      'within the swing radius', 'inside the swing radius', 'within swing radius',
      'inside operating radius', 'within operating radius',
      'standing inside exclusion zone', 'parked inside exclusion zone',
      'parked inside the crane', 'parked inside crane', 'vehicles parked inside',
      'inside the exclusion zone', 'within exclusion zone', 'entered exclusion zone',
      'inside crane exclusion', 'within crane radius', 'inside lifting zone',
      'inside the crane exclusion', 'inside crane zone', 'parked in exclusion',
      'standing very close', 'dangerously close to', 'positioned too close',
      'sitting on the edge', 'sitting at the edge', 'sitting next to',
      'standing on the outrigger', 'standing on scaffold', 'standing on platform',
      'climbing on top', 'climbing onto top', 'on top of the truck',

      // === UNDESIGNATED ACCESS/ROUTE VIOLATIONS ===
      'undesignated walkway', 'undesignated walkways', 'undesignated area',
      'undesignated pedestrian', 'undesignated access', 'undesignated parking',
      'using undesignated', 'walking in undesignated', 'passing through undesignated',
      'taking shortcuts', 'taking a shortcut', 'using shortcuts',
      'walking through equipment area', 'passing through equipment',
      'unsafe access and egress', 'using unsafe access', 'improper access',
      'climbing in and out', 'climbing without ladder', 'climbing without proper',
      'without designated ladders', 'without approved access',
      'placed in undesignated area', 'parked haphazardly', 'parked in wrong area',

      // === DISTRACTION BEHAVIORS ===
      'using mobile phone', 'using mobile', 'using phone while',
      'speaking on phone', 'phone while driving', 'phone while operating',
      'wearing headphone', 'wearing headphones', 'wearing earphones',
      'distracted while', 'not paying attention', 'inattentive',
      'using hand-free', 'using hand free', 'hand-free during', 'hand free during',
      'using bluetooth', 'bluetooth hearing devise', 'bluetooth device',
      'bluetooth whilst', 'distraction of the', 'resulting in distraction',
      // Extended driver distraction patterns
      'on cell phone call', 'cell phone call while', 'alwys use hand free',
      'use handfee', 'use hand fee', 'handfree during driving',
      'driver alwys', 'this trailer driver',

      // === DRIVING VIOLATIONS ===
      'over speeding', 'overspeeding', 'found over speeding', 'found overspeeding',
      'counter-flowing', 'counterflowing', 'counterflow', 'wrong direction',
      'driven in the wrong direction', 'in no entry route', 'blind crash',
      'over taking', 'overtaking', 'doing over taking', 'over taking on work',
      'dumping very closely', 'trucks were dumping very closely',
      'not following safe distance', 'not maintaining safe distance',
      'without driving license', 'without driving linces', 'no driving license',
      'driver don\'t have', 'driver doing drive without',
      'don\'t fallow safety requirements', 'alwys ignore', 'ignore safety',
      'wrong parking', 'not in reverse parking', 'reverse parking of vehicles',

      // === POOR DRIVER BEHAVIOR ===
      'poor conditions', 'poor condition bus', 'not meeting standards',
      'not meeting neom', 'workers transport buses',
      'driver out side', 'driver outside without', 'driver without healmet',
      'drivers don\'t', 'driver don\'t', 'some drivers don\'t',
      'some driver no wear', 'driver no wear', 'drivers no wear',
      'drivers doing', 'some drivers doing', 'driver doing',
      'wearing home dresses', 'wearing loose clothes', 'sub standard helmets',
      'substandard helmets', 'poor quality helmet',

      // === VEHICLE LEFT RUNNING / PARKED ISSUES ===
      'leave his vehicle without', 'without switched off', 'engine running',
      'vehicle without switched off the engine', 'left without switching off',
      'parked near to fire pump', 'near to fire pump', 'near fire pump',
      'parked near control room', 'near control room',
      'checkpoint placed exposed', 'security checkpoint placed',
      'exposed to live vehicles', 'exposed to vehicles and equipment',
      'security vehicle was not available', 'security vehicle not available',
      'ambulance driver was not available', 'ambulance driver not available',
      'collided with', 'vehicle collided', 'vehicles collided',
      'other vehicles that were parked', 'collision', 'collided',

      // === MANEUVERING / OBSTRUCTION ===
      'having dificulty maneuvering', 'difficulty maneuvering', 'obstructing narrow',
      'obstrucgting', 'obstructing', 'long carriage', 'long carriage sent',

      // === BOOTS ON GROUND / MAN-MACHINE ===
      'waking beside the equipment', 'walking beside the equipment',
      'boot-on-the-ground', 'boots on the ground', 'no boots on ground',
      'boots on ground', 'no boot-on-the-ground policy', 'violating no boots',

      // === COSHH / CHEMICALS ===
      'coshh was found', 'coshh found', 'without any precautionary measures',
      'precautionary measures taken', 'without precautionary',

      // === VISION OBSTRUCTION (Equipment) ===
      'cover his wind sheild', 'cover his windshield', 'covered his wind screen',
      'covered his windscreen', 'covered with curtain', 'curtain on windshield',
      'curtains used to cover', 'curtains to cover window', 'window panes covered',
      'window pane covered', 'window pane is covered', 'rear window pane covered',
      'windscreen covered', 'wind screen covered', 'rear view glass covered',
      'glass covered by cloth', 'covered by a cloth', 'covered using thick film',
      'vision obstruction', 'obstructive view', 'restricted vision',
      'dirt on windscreens', 'dirt on windscreen', 'dirty windscreen',
      // Misspellings: sceeen, screeen
      'covered his wind sceeen', 'wind sceeen with curtain', 'wind sceeen covered',
      'covered his wind screeen', 'excavator covered wind',
      // Rear view glass covered
      'rear view glass of dozer', 'glass of dozer covered', 'dozer covered by curtain',
      'rear view glass covered by', 'rear view covered by',

      // === PASSENGERS IN EQUIPMENT CABIN ===
      'transport another worker', 'transporting worker on', 'transporting workers',
      'fellow worker to sit inside', 'fellow worker sit inside', 'worker to sit inside',
      'workers travelling in', 'two workers found travelling', 'worker travelling in',
      'allowed fellow worker', 'allowing the jcb operator to transport',
      'seated on the rear of', 'sitting in the back of', 'worker sitting in back',
      'sitting on the rear', 'worker seated on rear',

      // === AWKWARD POSITION / OFFLOADING ===
      'in awkward position', 'awkward position', 'offloading in awkward',
      'on top of pre-cast', 'on top of precast', 'from trailer bed',
      'for offloading', 'for offliading', 'offloading without protection',
      'without protection from falling',

      // === PARKED NEAR EDGE / UNSAFE PARKING ===
      'parked near the edge', 'parked near edge', 'parked at the edge',
      'parked close to edge', 'jcb was parked near', 'equipment parked near edge',
      'while engaged in backfilling', 'engaged in backfilling around',

      // === TRUCK NOT LEVEL / DUMPING ISSUES ===
      'not on a level surface', 'not on level surface', 'not level surface',
      'truck was not on a level', 'truck not on level',
      'when dumping', 'while dumping', 'during dumping', 'at time of dumping',

      // === SITTING UNDER EQUIPMENT ===
      'sitting under a wheel loader', 'sitting under wheel loader', 'sitting under equipment',
      'sitting under heavy equipment', 'drivers sitting under', 'workers sitting under',
      'under equipment shade', 'under loader shade', 'taking rest under',

      // === NO BOOTS ON GROUND VIOLATIONS ===
      'violating the no boots on ground', 'no boots on ground policy',
      'violating no boots on ground', 'person moving around mobile plant',
      'moving around mobile plant equipment', 'walking at ground while',
      'praying outside the equipment', 'praying outside equipment',

      // === SUPERVISION/COVERAGE ABSENCE (behavioral choice) ===
      'safety officer not present', 'safety officer was not present', 'safety officer were not present',
      'supervisor not present', 'supervisor was not present', 'supervisor were not present',
      'supervisor absent', 'no supervisor available', 'without supervisor', 'lack of supervision',
      'working without supervision', 'no safety coverage', 'lack of safety coverage',
      'safety team not present', 'no competent person present',
      'lap was not present', 'lap were not present', 'lifting appointed person not present',
      'lifting appointed person were not present', 'appointed person not present',
      'were not present at workplace', 'were not present at the workplace',
      'was not present at workplace', 'was not present at the workplace',
      'no banksman present', 'without banksman', 'banksman not present',
      'no spotter present', 'without spotter', 'spotter not available',
      'no standby person', 'without standby person',

      // === IMPROPER EQUIPMENT USE (behavior) ===
      'excavator was being used for lifting', 'used for lifting purpose',
      'equipment used for lifting', 'improper use of equipment',
      'unsafe lifting operations', 'unsafe lifting techniques',
      'unsafe handling', 'improper lifting', 'improper rigging',
      'without proper rigging', 'lifting without plan', 'lifting without supervision',
      'riding the crane hook', 'standing on chain slings', 'standing on suspended',
      'holding onto suspended load', 'unsafe use of', 'improper use of',

      // === OVERREACHING/BALANCE RISKS ===
      'overreaching at height', 'overreaching while', 'risk of loss of balance',
      'loss of balance', 'losing balance', 'could lose balance',
      'leaning over', 'reaching too far', 'stretching beyond',

      // === IDLE/IMPROPER BEHAVIOR ===
      'sitting idle', 'found sitting idle', 'found sleeping',
      'workers sleeping', 'sleeping in rest shelter', 'sitting in site area',
      'sitting next to containers', 'found idle', 'without valid reason',
      'disposing cigarette', 'disposing of cigarette', 'smoking in wrong area',

      // === FATIGUE / TIREDNESS ===
      'fatigue', 'fatigued', 'feeling tired', 'was fatigued', 'driver was fatigued',
      'the driver was fatigued', 'tired driver', 'driver fatigued',

      // === DE-TARPING / TARPING BEHAVIOR ===
      'de-trapping by himself', 'detarping by himself', 'de-tarping by himself',
      'tarping by himself', 'operator found de-trapping', 'operator de-tarping',
      'dump operator found de-trapping', 'standing behind the truck at tarping',
      'worker standing behind truck', 'standing behind truck at tarping',

      // === SPOIL CARRYING ===
      'carrying spoil in heap shape', 'spoil in heap shape', 'heap shape',
      'dump trucks carrying spoil in heap',

      // === FREELANCER / UNAUTHORIZED DRIVER ===
      'freelancer driver', 'a freelancer driver', 'freelancer driver was driving',

      // === WORKING WITHOUT SAFETY MEASURES ===
      'working without fall protection', 'without fall protection',
      'without fall arrest', 'without safety harness', 'without harness',
      'without 100% tie off', 'without tie off', 'not anchored',
      'harness not anchored', 'lanyard not attached', 'not hooked on',
      'working at height without', 'performing at height without',
      'working without safe platform', 'working on unsafe platform',
      'using unsafe platform', 'using an unsafe platform', 'standing on unsafe platform',
      'using unsafe means', 'using an unsafe', 'observed using an unsafe',
      'not using proper platform', 'not using proper and appropriate platform',
      'not using appropriate platform', 'using unstable platform', 'chance of tip over',
      'tip over of unstable', 'unstable platform', 'inappropriate platform',
      'poses a high risk', 'this practice poses', 'practice poses a risk',
      'lifting material manually', 'lifting manually with rope', 'lifting with rope',
      'manually with a rope', 'without using proper equipment',
      'materials kept in rest shelter', 'materials are kept in the rest',
      'may obstruct', 'obstructing', 'obstructed',
      // Climbing behaviors
      'climbed into and out', 'climbing into and out', 'climbed using the rebar',
      'climbing using rebar', 'climbed into the cage', 'climbing into cage',
      'using the rebar frame', 'climbing on rebar', 'falling from height',
      'falling from a height', 'safe access is not provided', 'safe access not provided',
      // Anchor point issues
      'anchor point not rated', 'anchor point is not rated', 'anchor point that is not',
      'unsafe anchor point', 'unsafe anchor points', 'unapproved anchor point',
      'anchor not rated', 'anchorage not rated',
      'improper anchorage point', 'improper anchorage', 'anchorage point observed',
      'spliced pipes', 'spliced pipes are being used', 'not rated to withstand',
      '5,000 lbs', '5000 lbs', 'force in the event of a fall',

      // === WALKING/WORKING UNDERNEATH HAZARDS ===
      'walking underneath', 'working underneath', 'standing underneath',
      'underneath suspended load', 'underneath scaffold', 'underneath crane',
      'standing behind reversing', 'behind reversing vehicle',

      // === DOCUMENTATION/COMPLIANCE BEHAVIORS ===
      'checklist not available', 'checklist was not available',
      'checklist not updated', 'checklist in outdated status',
      'documents not available', 'license not available',
      'without safety induction', 'not undergone induction', 'induction not completed',
      'induction stickers missing', 'without training card',

      // === IMPROPER DISPOSAL/HANDLING ===
      'disposed in general waste', 'disposed directly on ground',
      'placed directly on soil', 'waste placed on soil',
      'improper disposal', 'improper waste handling',

      // === POSITIVE BEHAVIORS ===
      'safe behavior', 'safe behaviour', 'safe act', 'safe practice',
      'positive observation', 'good practice', 'best practice',
      'safety observation', 'safety compliant', 'following safety',
      'adhering to safety', 'wearing proper ppe', 'properly wearing',
      'standby person positioned', 'standby person provided',
      'safety protocols followed', 'safe working practice',

      // === SECURITY GUARD BEHAVIOR (positive safety observations) ===
      // NOTE: Patterns must be specific to guard BEHAVIOR, not general security topics
      'security guard was seen', 'security guard checking', 'security guard verifying',
      'security guard ready', 'security guard on duty', 'security guard monitoring',
      'security guard was available', 'security guard available at',
      'security guard present at', 'security guard observed',
      'security personnel checking', 'security personnel verifying',
      'security personnel present at', 'security personnel on duty',
      'security verifying vehicles', 'verifying vehicles before entry',
      'security checking vehicles', 'checking vehicles at entrance',
      'security guard strict surveillance', 'strict security surveillance',

      // === PROPER ACCESS/PLATFORM (positive observations) ===
      'wooden planks provided', 'planks provided', 'planks have been provided',
      'wooden walkways provided', 'walkways provided', 'walkway provided',
      'pedestrian walkway established', 'pedestrian walkway maintained',
      'proper platform', 'safe platform', 'stable platform', 'working platform',
      'designated harness point', 'harness point created', 'harness storage point',
      'safe access provided', 'proper access provided', 'access provided',

      // === ACCESS VIOLATIONS (behavioral issues) ===
      'no proper access', 'without proper access', 'no safe access',
      'safe access not provided', 'safe access is not provided',
      'proper access not provided', 'access not provided', 'lack of proper access',
      'lack of safe access', 'improper access observed', 'access improper',
      'access way blocked', 'accessway blocked', 'access blocked',
      'blocking the access', 'obstruct the access', 'obstructing access',
      'working without access', 'working without proper access',
      'without access and egress', 'no access and egress', 'access and egress not',
      'egress arrangements not', 'no egress arrangements', 'egress not provided',
      'access has been blocked', 'access blocked by', 'blocked by rebar',
      'blocked by materials', 'blocked by scaffold', 'fire point access blocked',

      // === DRIVING VIOLATIONS ===
      'driving without seatbelt', 'driving without seat belt', 'driving on site without',
      'driver driving without', 'without using seat belt', 'without using seatbelt',
      'reversing without watchman', 'reversing without a watchman',
      'tanker reversing without', 'truck reversing without',

      // === THREE POINT CONTACT VIOLATION ===
      'three points of contact', 'three point contact', '3 point contact',
      'without maintaining three', 'not maintaining three', 'holding tools while climbing',

      // === LADDER VIOLATIONS ===
      'standing on top step', 'top step of ladder', 'on the top step',
      'step ladder unstable', 'ladder unstable', 'ladder not secured',
      'ladder extending more than', 'extending more than 2 meters',
      '6m ladder without rest platform', 'ladder without rest platform',

      // === IMPROPER SITTING/POSITIONING ===
      'improper sitting', 'sitting for painting', 'improper sitting for',
      'sitting inside cabin', 'sitting inside the grader', 'operator sitting inside',
      'sitting inside the cabin', 'equipment was not engaged', 'unnecessary idling',
      'not actively performing', 'not engaged in any operation',

      // === REVERSING/LOW-BED ISSUES ===
      'reversing on a slope', 'reversing on slope', 'low-bed truck reversing',
      'low bed reversing', 'standing behind the low bed', 'behind low bed',
      'personnel standing behind', 'created a potential danger',

      // === ACCESS/EGRESS INSIDE EXCAVATION ===
      'inside an excavation pit without', 'inside excavation without access',
      'excavation pit without a proper access', 'without a proper access/egress',
      'access/egress', 'such as ladder or ramp', 'excavation safety requirements',
      'scaffold platform is blocked', 'blocked by steel materials',
      'blocked by steel', 'blocked by wood', 'materials and wood',

      // === SCAFFOLDING ACCESS LADDER POSITION ===
      'ladder landing', 'access ladder landing', 'ladder\'s landing',
      'landing is positioned on', 'positioned on the edge of excavation',
      'edge of the excavation', 'poses a safety risk to users',

      // === IMPROPER USE OF TOOLS/EQUIPMENT ===
      'improper use', 'improper use for', 'using wood for support',
      'electrical power tools', 'power tools on area', 'improper use of electrical',
      'pumps near to water', 'electrical water pumps', 'near to water',

      // === ADDITIONAL ACCESS ISSUES ===
      'access towards', 'access was not safe', 'access not safe for use',
      'not safe for use', 'need to be closed', 'clean the access',
      'adding proper steps', 'instead of slopes', 'hdd excavated',
      'without access', 'working without access', 'on the top without access',
      'on top without access', 'top of the foundation without access',
      'inside the steel structure without', 'without rest platform',
      'crane dismantling without', 'worker on the top without',
      'Improper/unstable access', 'improper/unstable', 'unstable access',

      // === PEDESTRIAN WALKWAY ===
      'pedestrian walkway has been established', 'pedestrian walkway established',
      'walkway has been established', 'walkway inside the red zone',
      'inside the red zone of the excavator', 'inside red zone of excavator',

      // === SECURITY PRESENCE (simple) ===
      'security was seen', 'a security was seen', 'security seen at the entrance'
    ],
    moderatePatterns: [
      'behavior', 'behaviour', 'unsafe', 'safe act', 'near miss',
      'good catch', 'observation', 'not wearing', 'without wearing',
      'too close', 'undesignated', 'without supervision', 'unsafe practice',
      'overreaching', 'standing on', 'climbing on', 'working without',
      'idle', 'shortcuts', 'distracted'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point',
      'unsafe condition observed', 'unsafe scaffold observed', 'unsafe ladder observed',
      'unsafe access provided', 'unsafe barricade observed', 'unsafe guardrail observed'
    ],
    minimumScore: 5
  },

  'No Authorization': {
    strongPatterns: [
      // Unauthorized personnel/activities - specific phrases
      'unauthorized entrant', 'unauthorized entry', 'unauthorized person',
      'unauthorized personnel', 'unauthorized operative', 'unauthorized operatives',
      'unauthorized worker', 'unauthorized workers', 'unauthorized operator',
      'unauthorized operation', 'unauthorized operators', 'unauthorized use',
      'unauthorized area', 'unauthorized parking', 'unauthorized vehicle',
      'without authorization', 'without authorisation', 'no authorization',
      'not authorized to', 'not authorised to',
      'without permission', 'no permission', 'not permitted to',
      'restricted area violation', 'entered restricted',
      'without approval', 'not approved to', 'unapproved personnel',
      // Positive authorization observations
      'authorized operation', 'authorized operator', 'authorized personnel',
      'authorized to operate', 'trained and authorized',
      'approved and authorized', 'authorized for site',

      // === UNKNOWN FIRM / UNIDENTIFIED ===
      'unknown firm', 'parked/left by unknown', 'left by unknown firm',
      'parked by unknown', 'unauthorized equipment use', 'equipment use unauthorized',
      'unknown contractor', 'unidentified vehicle', 'unidentified equipment'
    ],
    moderatePatterns: [
      // Only match specific authorization context words
      'unauthorized', 'unauthorised', 'without authorization',
      'without permission', 'restricted area'
    ],
    exclusionPatterns: [
      // Veri-Fi/VVS inspection status - these are INSPECTION issues, not authorization
      'veri-fi', 'verifi', 'vvs', 'neom verification', 'neom veri-fi',
      'access denied status', 'access denied red', 'access denied in',
      'access granted status', 'access verified', 'green status',
      'red status', 'expired neom', 'qr code', 'inspection qr',
      'denied for', 'found with access denied', 'under access denied',
      'with access denied', 'is in access denied', 'is on access denied',
      // Physical access - roads, routes, areas (NOT authorization)
      'access road', 'access route', 'access towards', 'access to zone',
      'zone 3 access', 'zone 4 access', 'zone 5 access', 'zone 6 access',
      'zone 7 access', 'hauling access', 'site access road',
      'pedestrian access', 'safe pedestrian access', 'access provision',
      'access cleaning', 'access gate', 'main access', 'internal access',
      'haul road access', 'narrow access', 'proper access',
      // Equipment parts - NOT authorization
      'access step', 'access steps', 'access to operator', 'cabin access',
      'access egress', 'access to elevated',
      // Electrical/panel access - different context
      'access to the internal', 'access to the breaker', 'panel access',
      // Inspected equipment observations
      'inspection checklist', 'loading point', 'equipment inspection',
      'inspected equipment', 'inspected heavy equipment',
      'inspected light vehicle', 'inspected vehicle', 'inspected dump truck',
      'inspected water tanker', 'inspected grader', 'inspected trailer',
      // Water/dust activities on access roads
      'water tanker', 'dust suppression', 'spraying water', 'water spraying',
      'water curing', 'sprinkling on'
    ],
    minimumScore: 10  // Require strong pattern match
  },

  'Planning': {
    strongPatterns: [
      // Planning issues
      'not planned', 'without planning', 'no planning', 'unplanned',
      'poor planning', 'inadequate planning', 'lack of planning',
      'not coordinated', 'without coordination', 'no coordination',
      'poor coordination', 'miscordinated', 'uncoordinated',
      'not scheduled', 'without schedule', 'no schedule',
      'not prepared', 'without preparation', 'unprepared',
      // Simultaneous/concurrent work activities (planning issue)
      'people walking below', 'walking below whilst', 'work at height ongoing',
      'ongoing at height', 'whilst work at height', 'right below',
      'found working below', 'working below the scaffold',
      'erecting steel at the second', 'steel at the second lift',
      'scaffold erection ongoing', 'erection ongoing at',
      'simultaneous activities', 'concurrent activities',
      'multiple activities', 'activities below',
      // Sequence not followed
      'sequence not followed', 'erection sequence not', 'not following sequence',
      'improper sequence', 'wrong sequence', 'out of sequence',
      // Positive planning
      'well planned', 'properly planned', 'planning done',
      'coordinated', 'coordination in place', 'scheduled',
      'prepared', 'preparation completed',

      // === EXCAVATION/GEOTECHNICAL PLANNING ===
      'geotechnical report not', 'geotechnical report missing', 'no geotechnical report',
      'geotechnical survey not', 'geotechnical assessment not', 'no geotechnical',
      'soil report not', 'soil report missing', 'no soil report',
      'soil assessment not', 'soil survey not', 'soil analysis not',
      'utility layout not', 'utility drawing not', 'utility drawings not',
      'utility layout missing', 'utility drawing missing', 'no utility layout',
      'utility mapping not', 'utility survey not', 'utility locator not',
      'utility clearance not', 'no utility clearance', 'utility clearance missing',
      'underground utility not', 'underground utilities not', 'underground survey not',
      'cable route not', 'pipe route not', 'service route not',
      'as-built drawing not', 'as-built drawings not', 'as built drawing not',
      'expired document', 'expired documents', 'document expired',
      'documents expired', 'outdated document', 'outdated documents',
      'outdated drawing', 'outdated drawings', 'drawing outdated',
      'expired permit', 'permit expired', 'expired certificate',
      'certificate expired', 'validity expired', 'expired validity',
      'document unavailability', 'unavailability of document', 'document unavailable',
      'drawing unavailable', 'report unavailable', 'unavailable document',
      'missing document', 'missing documents', 'document missing',
      'documents missing', 'documentation missing', 'missing documentation',
      'safe distance not', 'safe distance missing', 'no safe distance',
      'minimum distance not', 'clearance distance not', 'distance not maintained',

      // === ELECTRICIAN / PERSONNEL AVAILABILITY ===
      'no electrician available', 'electrician not available', 'electrician was not',
      'no electrician on site', 'electrician contact not displayed',
      'electrician name not displayed', 'electrician name and contact',
      'contact number was not displayed', 'not displayed in',

      // === PARKING AREA ISSUES ===
      'parking area was not', 'parking area not set up', 'dedicated parking area',
      'parking area not provided', 'no parking area', 'parking place was not',
      'car parking place was not', 'staff bus parking', 'vehicle parking',
      'parking areas inside welfare', 'light vehicle parking', 'parking not provided',

      // === SEATING PROVISION ===
      'seating provision', 'seating provision to be made', 'seating provision was not',
      'seating provision not provided', 'no seating provision', 'seating not provided',

      // === LANE / ROUTE ISSUES ===
      'incoming and out going lane', 'lane was not provided', 'lane not provided',
      'ticket counter post was not', 'ticket counter not provided', 'no ticket counter',

      // === REST SHELTER / WELFARE FACILITIES ===
      'no rest shelter', 'rest shelter not available', 'rest shelter was not',
      'welfare facilities are not protected', 'welfare not protected',
      'welfare facilities not protected', 'protected from moving vehicles',
      // Extended welfare/rest area patterns
      'no proper rest areas', 'rest areas not provided', 'proper rest areas provided',
      'welfare facilities not provided', 'no welfare facilities', 'welfare not provided',
      'welfare facilities not available', 'inadequate welfare', 'inadequate provision of',
      'welfare facilities in zone', 'failed to provide welfare', 'contractor failed to provide',
      'provision of welfare', 'provision of site welfare', 'adequate welfare facilities',
      'adequately welfare facilities', 'welfare facilities was not', 'welfare facilities are not',
      'welfare facilities not barricated', 'welfare facilities not secured',
      'welfare facilities are not secured', 'welfare facility',
      'minimum welfare facilities', 'without minimum welfare',
      // Washing/dining facilities
      'washing facility was not', 'washing facility not provided', 'no washing facility',
      'dining area', 'mess hall', 'eating at floor', 'eating at the ground',
      'eating at site in the open', 'no place available for', 'workers eating at',
      'workers observed eating', 'eating in the work area', 'no prober place',
      // Tables and benches
      'table and benches', 'tables and benches', 'benches not provided',
      'benches are not provided', 'table not provided', 'tables not provided',
      // Rest area size/accommodation
      'not sufficiently large', 'accommodate all operatives', 'accommodation',
      'properly illuminated', 'not properly illuminated', 'rest area illumination',

      // === SITE CLINIC / MEDICAL FACILITIES ===
      'site clinic', 'site clinic not established', 'clinic not established',
      'site clinic has not been', 'clinic has not been', 'no clinic established',
      'medical clinic', 'medical clinic building', 'clinic building',
      'clinic facilities', 'no medical clinic', 'clinic not yet established',
      'clinic floor', 'floor carpet of medical clinic', 'clinic floor is slippery',
      // Medical personnel
      'male nurse', 'no male nurse', 'nurse not available', 'nurse available',
      'backup nurse', 'no backup nurse', 'nurse coverage', 'medical nurse',
      'moh approval', 'moh approval was not available', 'without moh approval',
      // Ambulance availability
      'ambulance not available', 'ambulance was not present', 'ambulance not present',
      'ambulance did not arrive', 'ambulance arrived late', 'ambulance driver not available',
      'ambulance shelter', 'ambulance shelter not protected', 'no ambulance',

      // === SHELTER / RESTING ISSUES ===
      'sleeping under', 'sleeping at the ground', 'resting at the ground',
      'sleeping beside', 'resting beside', 'operatives sleeping',
      'workers sleeping under', 'drivers resting', 'bus drivers resting',
      'resting right in front', 'resting/sleeping at the ground',
      'shaded work area', 'makeshift sub-standard', 'blown by high wind',
      'shelter in place', 'resting area', 'proper resting area',
      'resting area near', 'shelter at site', 'work shelter',
      // Generic welfare phrases
      'welfare facility', 'welfare facilities', 'worker welfare',
      'welfare facilites', 'facilites are not', 'welfare not barricated',
      'welfare facilities not barricated', 'facilites not barricated',
      // Toilet facilities
      'toilet facilities are not operational', 'toilet facilities not operational',
      'toilet not functional', 'toilet not operational', 'toilets not functional',
      'portable toilets not functional', 'toilets not operational',
      'welfare - toilet facilities', 'welfare - toilet', 'welfare-toilet',
      'portable toilets not functional at', 'toilets not functional at laydown',
      'facilities are not operational', 'are not operational', 'not operational',
      'toilet facilities provided so it should', 'should permanently closed',
      // Water in toilet/shelter
      'water was unavailable', 'water unavailable', 'potable water was unavailable',
      'potable water unavailable', 'water in the toilet facilities',
      'water unavailable in toilet', 'water not available in toilet',
      'water was unavailable in the toilet', 'that water was unavailable',
      'potable water in the toilet facilities was unavailable',
      'potable water in the toilet facilities', 'toilet facilities was unavailable',
      'observed that water was unavailable', 'observed that potable water',
      'it was observed that water was', 'it was observed that potable',
      // Tree/vegetation protection
      'tree was not protected', 'not protected from the vehicles',
      'protected from the vehicles movement', 'trees not protected',
      // Vehicle near shelter
      'vehicle moving very close', 'moving very close to rest', 'close to the rest shelter',
      'vehicles moving close to', 'equipment near welfare', 'near welfare area',

      // === TARPING STATION ISSUES ===
      'tarping station', 'tarping station not', 'de-tarping station',
      'not done at established tarping', 'tarping not done at', 'tarping task not done'
    ],
    moderatePatterns: [
      'planning', 'planned', 'coordination', 'coordinated',
      'schedule', 'scheduled', 'preparation', 'prepared'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 5
  },
  'Machine Guarding': {
    strongPatterns: [
      // Missing guards
      'no guard', 'without guard', 'guard not', 'missing guard',
      'unguarded', 'guard removed', 'guard missing',
      'no machine guard', 'machine guard not', 'machine guard missing',
      'exposed parts', 'exposed moving parts', 'rotating parts exposed',
      'pinch point', 'nip point', 'crush point',
      'entanglement hazard', 'entanglement risk',
      // Positive guarding
      'guarded', 'guard in place', 'guard installed',
      'machine guard installed', 'properly guarded', 'safeguarded'
    ],
    moderatePatterns: [
      'guard', 'guarding', 'guarded', 'unguarded', 'machine guard',
      'rotating', 'pinch point', 'entanglement'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point',
      'security guard'  // Exclude "security guard" - different meaning
    ],
    minimumScore: 5
  },

  'Environment': {
    strongPatterns: [
      // Environmental issues
      'poor lighting', 'inadequate lighting', 'no lighting', 'poor illumination',
      'poor visibility', 'low visibility', 'visibility issue',
      'poor ventilation', 'inadequate ventilation', 'no ventilation',
      'dusty', 'excessive dust', 'dust hazard',
      'weather condition', 'adverse weather', 'windy', 'rainy',
      'hot environment', 'cold environment', 'temperature',
      'noise hazard', 'noise level', 'excessive noise',
      // Positive environment
      'good lighting', 'adequate lighting', 'proper ventilation',
      'visibility good', 'weather suitable', 'conditions favorable',

      // === MUDDY/SLIPPERY SURFACES ===
      'muddy', 'muddy surface', 'muddy and slippery', 'surface muddy',
      'ground muddy', 'slippery surface', 'slippery ground', 'slippery area',
      'slip hazard', 'slip hazards', 'risk of slip', 'slip and trip',
      'trip hazard', 'trip hazards', 'tripping hazard', 'tripping hazards',
      'slip, trip', 'slip trip and fall', 'slip,trip and falls',
      'slip, trip and fall', 'excessive water sprinkling', 'overwatered',
      'making the ground', 'making ground muddy', 'uneven ground',
      'ground surface not level', 'surface is not level', 'ground not level',

      // === LOOSE SOIL / TERRAIN ===
      'loose soil', 'loose soil used', 'soil collapse', 'soil instability',
      'risk of soil', 'uneven slope', 'slope leading to',

      // === LOOSE ROCKS / BOULDERS ===
      'loose rocks', 'loose rock', 'loose boulders', 'loose boulder',
      'rocks rolling', 'boulders rolling', 'rolling from the top',
      'risk of rocks rolling', 'rocks may fall', 'rocks evident',
      'loose rocks are evident', 'loose rocks in this area',
      'significant number of loose rocks', 'remove all loose rocks',
      'remove loose rocks', 'falling rocks', 'rock fall', 'rockfall',
      // Extended loose rocks patterns
      'poses a serious threat', 'serious threat to safety', 'threat to safety',
      'critical issue at zone', 'inspection revealed', 'inspection revealed a significant',
      'due to heavy equipment movements', 'equipment movements may fall',
      'heavy equipment movements may', 'movements may fall', 'loose rocks at zone',

      // === ROAD CONTAMINATION ===
      'road was contaminated', 'road contaminated', 'contaminated by spoil',
      'during hauling', 'hauling operation',

      // === OVERHEAD POWER LINES ===
      'overhead power lines', 'overhead high voltage', 'high tension overhead',
      'under overhead power', 'under high tension', 'near live electricity',
      'near by live electricity', 'directly under overhead', 'high voltage power lines',
      'excavators operated under', 'dumper truck tipping operations',
      'operations carried out directly under', 'doing loading near by live',
      'goalposts', 'need to provide the goalposts', 'provide the goalposts',
      'overhead power line need to', 'power line need to provide',

      // === TRAFFIC MANAGEMENT ===
      'traffic management', 'access road narrow', 'road too narrow',
      'narrow access', 'no separation between', 'lack of traffic',
      'vehicle collision', 'risk of vehicle collision', 'two lanes',
      'haul road', 'haul road access', 'construction access road',
      'vehicle incidents', 'safe movement of workers', 'movement of heavy equipment',
      'near gate entrance', 'direct sunlight', 'standing in direct sunlight',

      // === HUMPS / ROAD WIDTH ===
      'humps are not provided', 'humps not provided', 'adequate numbers of humps',
      'adequate humps', 'no humps provided', 'speed humps not',
      'inadequate width of road', 'width of road', 'road width inadequate',
      'inadequate width', 'road inadequate width',

      // === LIGHTS / ILLUMINATION ===
      'no lights available', 'lights not available', 'lights not installed',
      'internal lights not installed', 'internal lights were not',
      'lux reading was', 'lux reading', 'low lux', 'insufficient lux',
      'during a jcb operation', 'no lights during',

      // === OIL SPILL (including misspellings) ===
      'oil spil', 'oil spil dump truck', 'oil spillage', 'oil spill',
      'substandard bottles', 'substandard bottles being used for fuel',
      'fuel storage', 'without drip try', 'without drip tray',
      'drip tray not', 'equipment without drip',

      // === WATER / MUD ISSUES ===
      'water tanker put more water', 'due to water tanker', 'stop due to water',

      // === ACCESS ROUTES / ROAD CONDITIONS ===
      'access routes', 'access routes towards', 'access routes not compacted',
      'route was not compacted', 'routes not compacted', 'compacted access',
      'uncontrolled traffic route', 'multiple exit points', 'traffic route with',
      'crusher operations adjacent', 'adjacent to live temporary', 'live temporary site traffic',
      'contaminated water at stockpile', 'contaminated water', 'water at stockpile',
      'no have water', 'no available water', 'not available water in rest shelter',
      'no available water in rest', 'water not available in', 'water unavailable in',
      'potable water in the toilet', 'toilet facilities was unavailable',
      'poor hygiene practices', 'health issues', 'non-compliance with welfare'
    ],
    moderatePatterns: [
      'lighting', 'illumination', 'visibility', 'ventilation',
      'dust', 'weather', 'temperature', 'noise', 'environment'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 5
  },

  'Interfaces': {
    strongPatterns: [
      // Interface issues
      'shift handover not', 'no shift handover', 'handover not',
      'changeover not', 'no changeover', 'transition not',
      'simultaneous operations', 'simops', 'simop',
      'interface issue', 'coordination between', 'overlap',
      'multiple contractors', 'inter-contractor',
      // Positive interfaces
      'shift handover done', 'handover completed', 'proper handover',
      'changeover completed', 'transition completed',
      'simops controlled', 'interface managed'
    ],
    moderatePatterns: [
      'handover', 'changeover', 'transition', 'interface', 'simops',
      'overlap', 'simultaneous'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 5
  },

  'Testing': {
    strongPatterns: [
      // Testing issues
      'not tested', 'without testing', 'no testing', 'untested',
      'test not', 'testing not', 'test not conducted',
      'not calibrated', 'calibration expired', 'uncalibrated',
      'calibration not', 'no calibration',
      'not validated', 'validation not', 'unvalidated',
      'not commissioned', 'commissioning not',
      // Positive testing
      'tested', 'test conducted', 'testing completed',
      'calibrated', 'calibration valid', 'calibration done',
      'validated', 'validation completed', 'commissioned',

      // === MOCK TEST / LOAD TEST ===
      'mock test', 'mock test conducted', 'mock test has been conducted',
      'load test', 'load test conducted', 'load testing',
      'redundant pulley', 'assess the reinforcement', 'strength of the pulley',
      'automatic brake', 'test the strength'
    ],
    moderatePatterns: [
      'testing', 'tested', 'calibration', 'calibrated',
      'validation', 'validated', 'commissioning'
    ],
    exclusionPatterns: [
      'inspection checklist', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 5
  },

  'Leadership': {
    strongPatterns: [
      // Leadership issues
      'lack of leadership', 'poor leadership', 'no leadership',
      'management not', 'no management support', 'management failure',
      'lack of accountability', 'no accountability',
      'lack of commitment', 'no commitment',
      // Positive leadership
      'leadership present', 'management support', 'management involvement',
      'accountable', 'committed', 'leadership walkthrough',
      'management walkthrough', 'senior management',

      // === WALKTHROUGHS / SITE VISITS ===
      'walkthrough', 'walk through', 'site walkthrough', 'safety walkthrough',
      'neom walkthrough', 'neom walk through', 'neom safety walkthrough',
      'lpsf walkthrough', 'weekly walkthrough', 'weekly lpsf walkthrough',
      'walkthrough was done', 'walkthrough was conducted', 'walkthrough conducted',
      'neom safety engineer', 'neom corporate safety', 'corporate safety team',
      'visit from neom', 'neom visit', 'site visit', 'site visit at',
      'inspecting the site', 'inspecting site activity', 'site inspection',
      'safety manager inspecting', 'safety engineer inspecting',
      'presence of neom', 'with the presence of', 'tdp key personnel',
      'key personnel', 'management team', 'presence of key personnel',

      // === CAMPAIGNS / INITIATIVES ===
      'safety campaign', 'safe driving campaign', 'line of fire campaign',
      'line of fire safety campaign', 'campaign bulletin', 'bulletin board',
      'welfare hotline', 'hotline posted', 'grievances and concerns',
      'safe driving commitments', 'commitments to safe driving',
      'key chains', 'slogan key chains', 'visual reminder',
      'safe driving neom campaign', 'neom campaign has been conducted',
      'safe driving neom campaign has been', 'campaign has been conducted',

      // === GIFT/RECOGNITION ===
      'gift card', 'best performer', 'recognition', 'award given',

      // === SAFETY MANAGER INSPECTION ===
      'safety manager was inspecting', 'safety manager inspecting',
      'inspecting the site activity', 'inspecting site activity',
      'site activity on regular basis', 'on regular basis', 'regular basis'
    ],
    moderatePatterns: [
      'leadership', 'management', 'manager', 'accountability',
      'commitment', 'responsible', 'responsibility'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point',
      'safety manager'  // Usually part of an observation, not leadership issue
    ],
    minimumScore: 8  // Higher threshold - leadership mentions are often incidental
  },

  'Procurement': {
    strongPatterns: [
      // Procurement issues
      'substandard equipment', 'substandard material', 'non-compliant equipment',
      'wrong specification', 'incorrect specification',
      'supplier issue', 'vendor issue', 'contractor not',
      'procurement issue', 'supply issue',
      // Positive procurement
      'compliant equipment', 'correct specification',
      'approved supplier', 'approved vendor', 'quality equipment'
    ],
    moderatePatterns: [
      'procurement', 'supplier', 'vendor', 'contractor',
      'specification', 'supply'
    ],
    exclusionPatterns: [
      'inspection checklist', 'qr code', 'vvs', 'veri-fi', 'loading point'
    ],
    minimumScore: 8  // Higher threshold - these words often appear incidentally
  },

}
// ============================================================================
// GLOBAL EXCLUSION PATTERNS (apply to all factors)
// ============================================================================

export const GLOBAL_EXCLUSIONS = [
  // Welfare facilities - never about equipment factors (keep minimal)
  'toilet facilities', 'toilet water', 'water unavailable in the toilet',
  'restroom facilities', 'washroom facilities', 'latrine facilities',
  // NOTE: Removed 'loose rock', 'loose rocks', 'rock fall', 'rockfall' from exclusions
  // as they are valid Environment factor detections
  'terrain hazard', 'geological hazard', 'slope stability issue'
  // Note: Removed broad terms like 'rebar', 'scaffolding work', 'formwork'
  // as they appear in many valid BBS observations
]

// ============================================================================
// LEGACY: HAZARD-SPECIFIC FACTOR VALIDATION RULES (kept for compatibility)
// ============================================================================

/**
 * @deprecated Use FACTOR_PHRASE_CONFIG instead
 * Kept for backward compatibility
 */
export const HAZARD_FACTOR_RULES = {
  'Mobile Plant & Equipment': {
    // Common rules for ALL factors in this hazard category
    _common: {
      // Equipment-related context required for ANY factor to be valid
      requiredContext: [
        // Equipment types
        'equipment', 'truck', 'trucks', 'excavator', 'excavators', 'loader', 'loaders',
        'grader', 'graders', 'roller', 'rollers', 'tanker', 'tankers', 'vehicle', 'vehicles',
        'plant', 'plants', 'dozer', 'dozers', 'bulldozer', 'bulldozers', 'backhoe', 'backhoes',
        'jcb', 'bobcat', 'bobcats', 'compactor', 'compactors', 'crane', 'cranes',
        'forklift', 'forklifts', 'trailer', 'trailers', 'dumper', 'dumpers', 'tipper', 'tippers',
        'bus', 'buses', 'pickup', 'pickups', 'car', 'cars', 'van', 'vans',
        'machinery', 'machine', 'machines', 'mewp', 'mewps', 'boom', 'boomtruck',
        'wheel', 'skid', 'steer', 'pneumatic', 'drum', 'crusher', 'mixer',
        // Operator-related
        'operator', 'operators', 'driver', 'drivers',
        // Equipment components
        'pwas', 'camera', 'cameras', 'reverse alarm', 'horn', 'tyre', 'tyres', 'tire', 'tires',
        'cabin', 'windshield', 'windscreen', 'engine', 'brake', 'brakes'
      ],
      // Global exclusions - these exclude from ALL factors
      globalExclusions: [
        // Welfare/facilities - NOT about mobile plant
        'toilet facilities', 'toilet not', 'toilet water', 'toilets', 'welfare facilities',
        'restroom', 'washroom', 'latrine', 'drinking water', 'potable water',
        'water unavailable in the toilet', 'water was unavailable in the toilet',
        // Geological/terrain - NOT about mobile plant
        'loose rock', 'loose rocks', 'rock fall', 'rockfall', 'terrain hazard',
        'geological', 'slope stability', 'ground condition', 'rocks rolling',
        // Construction activities unrelated to equipment
        'concrete grouting', 'bar bending', 'bar bender', 'scaffolding work',
        'grouting activities', 'rebar', 'formwork'
      ]
    },

    // Inspections factor - specific rules
    'Inspections': {
      requiredContext: [
        'checklist', 'checklists', 'tuv', 'tpc', 'qr', 'qrcode', 'barcode', 'bar code',
        'verifi', 'veri-fi', 'vvs', 'neom', 'status', 'green', 'red', 'expired', 'valid',
        'sticker', 'stickers', 'tag', 'tags', 'colour code', 'color code',
        'preuse', 'pre-use', 'prestart', 'pre-start', 'daily', 'weekly', 'monthly',
        'third party', 'thirdparty', '3rd party', 'certification', 'certificate',
        'istamara', 'insurance', 'license', 'licence', 'inspected', 'uninspected',
        'fire extinguisher', 'extinguisher', 'first aid', 'firstaid'
      ],
      exclusionPatterns: [
        // Operator behavior - NOT inspection compliance
        'speaking on phone', 'phone while driving', 'using phone', 'mobile phone while',
        'on the phone while', 'talking on phone',
        'over speeding', 'overspeeding', 'speeding on site', 'speed limit',
        'not wearing seatbelt', 'without seatbelt', 'seatbelt while operating',
        'standing close to', 'standing very close', 'too close to', 'unsafe proximity',
        'within an unsafe proximity', 'close to a moving',
        // PPE issues - separate factor
        'without wearing', 'not wearing ppe', 'without ppe', 'no ppe', 'missing ppe',
        'ear protection', 'hearing protection', 'safety shoes not',
        'none of the operatives were wearing',
        // Parking/traffic - NOT inspection
        'parked on slope', 'parked on a slope', 'parking violation',
        'wheel chock', 'wheel chocks', 'without wheel chocks',
        'stuck on', 'causing blockage', 'blocking traffic',
        'washing his light vehicle', 'washing vehicle',
        // Lifting misuse
        'lifting purpose', 'used for lifting'
      ]
    },

    // PPE factor - specific rules
    'PPE': {
      requiredContext: [
        'ppe', 'helmet', 'hard hat', 'hardhat', 'gloves', 'goggles', 'glasses',
        'vest', 'hi-vis', 'hivis', 'high visibility', 'reflective',
        'boots', 'safety shoes', 'steel toe', 'steeltoe',
        'harness', 'lanyard', 'respirator', 'mask', 'ear plug', 'earplug',
        'ear muff', 'earmuff', 'face shield', 'faceshield', 'seatbelt', 'seat belt',
        'wearing', 'worn', 'donned'
      ],
      exclusionPatterns: [
        // Inspection issues - separate factor
        'qr code', 'qrcode', 'veri-fi', 'verifi', 'vvs', 'tuv', 'tpc',
        'checklist not updated', 'checklist was not', 'expired inspection',
        // Training issues - separate factor
        'not trained', 'without training', 'no training', 'untrained'
      ]
    },

    // Training factor - specific rules
    'Training': {
      requiredContext: [
        'training', 'trained', 'untrained', 'certificate', 'certification', 'certified',
        'license', 'licence', 'licensed', 'induction', 'inducted', 'orientation',
        'competent', 'competency', 'qualified', 'qualification', 'tpc', 'third party',
        'refresher', 'course', 'session'
      ],
      exclusionPatterns: [
        // Inspection issues - separate factor
        'checklist not', 'qr code', 'veri-fi', 'expired tag', 'colour code',
        // PPE issues - separate factor
        'not wearing', 'without ppe', 'missing ppe'
      ]
    },

    // Competency factor - specific rules
    'Competency': {
      requiredContext: [
        'competent', 'competency', 'qualified', 'qualification', 'unqualified',
        'skilled', 'unskilled', 'experienced', 'inexperienced', 'expertise',
        'capable', 'incapable', 'proficient', 'ability', 'knowledge',
        'license', 'licence', 'tpc', 'third party certificate'
      ],
      exclusionPatterns: [
        // Inspection issues
        'checklist not', 'qr code', 'veri-fi', 'expired tag',
        // PPE issues
        'not wearing', 'without ppe'
      ]
    },

    // Supervision factor - specific rules
    'Supervision': {
      requiredContext: [
        'supervisor', 'supervision', 'supervised', 'unsupervised', 'foreman',
        'overseer', 'oversight', 'watchman', 'spotter', 'banksman',
        'monitoring', 'monitored', 'unmonitored'
      ],
      exclusionPatterns: [
        // Inspection issues
        'checklist not', 'qr code', 'veri-fi', 'expired inspection',
        // PPE issues
        'not wearing', 'without ppe'
      ]
    },

    // Communication factor - specific rules
    'Communication': {
      requiredContext: [
        'communication', 'briefing', 'briefed', 'unbriefed', 'toolbox', 'tbt',
        'tailgate', 'prestart', 'prejob', 'informed', 'uninformed', 'radio',
        'signal', 'signaling', 'hand signal'
      ],
      exclusionPatterns: [
        // Inspection issues
        'qr code', 'veri-fi', 'checklist not',
        // PPE issues
        'not wearing', 'without ppe'
      ]
    },

    // Documentations factor - specific rules
    'Documentations': {
      requiredContext: [
        'documentation', 'document', 'documents', 'procedure', 'sop', 'method statement',
        'risk assessment', 'rams', 'jsa', 'jha', 'checklist', 'paperwork',
        'logbook', 'record', 'records', 'permit', 'ptw', 'work instruction'
      ],
      exclusionPatterns: [
        // PPE issues
        'not wearing', 'without ppe',
        // Behavior issues
        'speeding', 'phone while'
      ]
    },

    // Maintenance factor - specific rules
    'Maintenance': {
      requiredContext: [
        'maintenance', 'maintained', 'unmaintained', 'repair', 'repaired',
        'broken', 'defective', 'defect', 'malfunction', 'faulty', 'fault',
        'preventive', 'corrective', 'breakdown', 'service', 'serviced'
      ],
      exclusionPatterns: [
        // Inspection compliance issues
        'qr code', 'veri-fi', 'expired inspection', 'checklist not updated'
      ]
    },

    // Safety Devices factor - specific rules
    'Safety Devices': {
      requiredContext: [
        'alarm', 'reverse alarm', 'horn', 'beacon', 'light', 'camera', 'cameras',
        'pwas', 'sensor', 'detector', 'interlock', 'guard', 'guarding',
        'emergency stop', 'e-stop', 'failsafe', 'warning system'
      ],
      exclusionPatterns: [
        // Inspection compliance issues
        'expired inspection', 'qr code not', 'veri-fi red'
      ]
    },

    // Emergency Preparedness factor - specific rules
    'Emergency Preparedness': {
      requiredContext: [
        'emergency', 'fire extinguisher', 'extinguisher', 'first aid', 'firstaid',
        'evacuation', 'muster', 'assembly', 'rescue', 'ert', 'drill',
        'spill kit', 'emergency kit'
      ],
      exclusionPatterns: [
        // Inspection compliance issues (unless about extinguisher inspection)
        'qr code', 'veri-fi', 'vvs status'
      ]
    },

    // Behavioural (Behavior-Based Safety) factor - specific rules
    'Behavioural': {
      requiredContext: [
        'behavior', 'behaviour', 'unsafe act', 'safe act', 'at risk', 'atrisk',
        'near miss', 'nearmiss', 'good catch', 'stop work', 'observation'
      ],
      exclusionPatterns: [
        // Inspection issues
        'qr code', 'veri-fi', 'checklist not'
      ]
    },

    // Barriers factor - specific rules
    'Barriers': {
      requiredContext: [
        'barrier', 'barricade', 'guardrail', 'handrail', 'fence', 'fencing',
        'bollard', 'cone', 'delineator', 'demarcation', 'exclusion zone',
        'drop zone', 'caution tape'
      ],
      exclusionPatterns: [
        // Inspection issues
        'qr code', 'veri-fi', 'checklist not'
      ]
    },

    // Signage factor - specific rules
    'Signage': {
      requiredContext: [
        'sign', 'signage', 'signboard', 'label', 'marking', 'placard',
        'poster', 'caution', 'warning sign', 'danger sign', 'safety sign',
        'sticker'
      ],
      exclusionPatterns: [
        // Unless specifically about equipment signage
      ]
    },

    // Housekeeping factor - specific rules
    'Housekeeping': {
      requiredContext: [
        'housekeeping', 'clean', 'cleanliness', 'dirty', 'clutter', 'cluttered',
        'debris', 'trash', 'rubbish', 'garbage', 'waste', 'messy', 'tidy',
        'orderly', 'disorderly', 'spillage', 'cabin', 'cabin not cleaned'
      ],
      exclusionPatterns: []
    },

    // Material Handling factor - specific rules
    'Material Handling': {
      requiredContext: [
        // Actual material handling activities
        'material handling', 'manual handling', 'lifting material', 'lifting load',
        'rigging', 'sling', 'slinging', 'shackle',
        'loading material', 'unloading material', 'manual loading', 'manual unloading',
        'stacking', 'stacked', 'storage of material', 'storing material',
        'hoist', 'hoisting', 'load securing', 'lashing',
        'overload', 'overloaded', 'overloading',
        'material into', 'material from', 'load into', 'load from',
        'bucket load', 'bucket unload', 'into bucket', 'from bucket',
        'transferring material', 'moving material', 'shifting material',
        'man machine interface', 'line of fire'
      ],
      exclusionPatterns: [
        // VVS/Inspection status observations - NOT material handling
        'green status under', 'red status under', 'overdue status under',
        'vvs at zone', 'vvs at location', 'verification system at zone',
        'neom verification', 'neom vvs', 'veri-fi', 'verifi',
        'access granted', 'access denied', 'qr code',
        // Equipment inspection issues - NOT material handling
        'checklist not', 'checklist was not', 'inspection checklist',
        'pre-use inspection', 'daily inspection', 'equipment inspection',
        // Location-only mentions (loading point as place, not activity)
        'at zone 3 loading point', 'at zone 4 loading point', 'at zone 5 loading point',
        'at zone 6 loading point', 'at zone 7 loading point',
        'at the zone 3 loading', 'at the zone 4 loading', 'at the zone 5 loading',
        'at the zone 6 loading', 'at the zone 7 loading',
        'at location zone', 'found in green status', 'found in red status',
        // Operator behavior issues - NOT material handling
        'speaking on phone', 'phone while driving', 'using phone',
        'not wearing seatbelt', 'without seatbelt', 'seat belt',
        // Equipment type mentions only (not handling activity)
        'wheel loader inspection', 'loader inspection', 'backhoe inspection',
        'wheel loader check', 'loader check list', 'backhoe check'
      ]
    },

    // No Authorization factor - specific rules
    'No Authorization': {
      requiredContext: [
        'authorization', 'authorisation', 'authorized', 'unauthorised', 'unauthorized',
        'permission', 'permitted', 'unpermitted', 'restricted', 'access',
        'approval', 'approved', 'unapproved', 'denied'
      ],
      exclusionPatterns: []
    },

    // Planning factor - specific rules
    'Planning': {
      requiredContext: [
        'planning', 'planned', 'unplanned', 'schedule', 'scheduled', 'coordination',
        'coordinated', 'preparation', 'prepared', 'unprepared', 'methodology'
      ],
      exclusionPatterns: []
    },

    // Interfaces factor - specific rules
    'Interfaces': {
      requiredContext: [
        'interface', 'handover', 'changeover', 'transition', 'turnover',
        'shift change', 'crew change', 'simultaneous', 'simops', 'overlap'
      ],
      exclusionPatterns: []
    },

    // Testing factor - specific rules
    'Testing': {
      requiredContext: [
        'testing', 'test', 'tested', 'calibration', 'calibrated', 'uncalibrated',
        'validation', 'validated', 'commissioning', 'function test'
      ],
      exclusionPatterns: []
    },

    // Machine Guarding factor - specific rules
    'Machine Guarding': {
      requiredContext: [
        'guard', 'guarding', 'guarded', 'unguarded', 'machinery', 'machine',
        'rotating', 'pinch point', 'nip point', 'crush', 'entanglement',
        'moving parts', 'exposed parts', 'belt guard', 'shaft guard'
      ],
      exclusionPatterns: []
    },

    // Environment factor - specific rules
    'Environment': {
      requiredContext: [
        'environment', 'weather', 'lighting', 'illumination', 'ventilation',
        'temperature', 'humidity', 'dusty', 'dust', 'windy', 'visibility',
        'conditions', 'workplace', 'worksite'
      ],
      exclusionPatterns: []
    },

    // Leadership factor - specific rules
    'Leadership': {
      requiredContext: [
        'leadership', 'leader', 'management', 'manager', 'accountability',
        'responsible', 'responsibility', 'superintendent', 'director',
        'commitment', 'governance'
      ],
      exclusionPatterns: []
    },

    // Procurement factor - specific rules
    'Procurement': {
      requiredContext: [
        'procurement', 'purchase', 'supplier', 'vendor', 'contractor',
        'subcontractor', 'sourcing', 'specification', 'tender'
      ],
      exclusionPatterns: []
    },

    // Permit factor - specific rules
    'Permit': {
      requiredContext: [
        'permit', 'ptw', 'hot work', 'cold work', 'loto', 'lockout', 'tagout',
        'isolation', 'isolated', 'excavation permit', 'confined space',
        'height permit', 'work permit'
      ],
      exclusionPatterns: []
    }
  },

  // Working at Height hazard category
  'Working at Height': {
    _common: {
      requiredContext: [
        'scaffold', 'scaffolding', 'ladder', 'ladders', 'platform', 'platforms',
        'height', 'elevated', 'roof', 'rooftop', 'edge', 'fall', 'falling',
        'harness', 'lanyard', 'anchor', 'lifeline', 'guardrail', 'handrail',
        'mewp', 'cherry picker', 'boom lift', 'scissor lift', 'aerial'
      ],
      globalExclusions: [
        'toilet', 'welfare', 'drinking water'
      ]
    },
    'Inspections': {
      requiredContext: [
        'inspection', 'inspected', 'checklist', 'tag', 'tags', 'colour code',
        'color code', 'scaffold tag', 'green tag', 'red tag'
      ],
      exclusionPatterns: [
        'speeding', 'phone while', 'toilet'
      ]
    },
    'PPE': {
      requiredContext: [
        'harness', 'lanyard', 'helmet', 'hard hat', 'safety net', 'fall arrest',
        'fall protection', 'anchor point', 'lifeline'
      ],
      exclusionPatterns: []
    },
    'Training': {
      requiredContext: [
        'training', 'trained', 'certified', 'competent', 'work at height'
      ],
      exclusionPatterns: []
    },
    'Barriers': {
      requiredContext: [
        // Guardrails/Handrails
        'guardrail', 'guardrails', 'guard rail', 'handrail', 'handrails', 'hand rail',
        'mid rail', 'midrail', 'mid-rail', 'knee rail', 'intermediate rail',
        // Toe boards
        'toe board', 'toeboard', 'toe boards', 'toeboards', 'toe-board', 'kick plate', 'kickboard',
        // Barriers/Barricades
        'barrier', 'barriers', 'barricade', 'barricades', 'barricading',
        'hard barricade', 'soft barricade', 'rigid barricade',
        // Edge protection
        'edge protection', 'edge protected', 'unprotected edge', 'leading edge',
        'perimeter protection', 'perimeter barrier', 'open edge', 'exposed edge',
        // Safety nets
        'safety net', 'safety netting', 'catch net', 'catch netting',
        'catch platform', 'debris net', 'fall net', 'fall arrest net',
        // Parapet/Walls
        'parapet', 'parapet wall', 'kick wall', 'retaining wall',
        // Floor openings
        'floor opening', 'opening cover', 'hole cover', 'void cover',
        'shaft opening', 'stairwell opening', 'elevator opening',
        // Scaffold barriers
        'scaffold guardrail', 'scaffold handrail', 'platform guardrail',
        'scaffold barrier', 'scaffolding barrier', 'ladder cage',
        // Demarcation/Tape
        'demarcation', 'caution tape', 'warning tape', 'barrier tape', 'hazard tape',
        'exclusion zone', 'drop zone', 'danger zone'
      ],
      exclusionPatterns: []
    }
  },

  // Lifting Operations hazard category
  'Lifting Operations': {
    _common: {
      requiredContext: [
        'crane', 'cranes', 'hoist', 'hoists', 'sling', 'slings', 'shackle',
        'lifting', 'lift', 'rigging', 'rigger', 'load', 'swl', 'wll',
        'banksman', 'signaler', 'signaller', 'hook', 'block', 'tackle'
      ],
      globalExclusions: [
        'toilet', 'welfare', 'drinking water'
      ]
    },
    'Inspections': {
      requiredContext: [
        'inspection', 'inspected', 'colour code', 'color code', 'certificate',
        'thorough examination', 'loler', 'checklist', 'tag', 'valid'
      ],
      exclusionPatterns: [
        'speeding', 'phone while', 'toilet'
      ]
    },
    'Competency': {
      requiredContext: [
        'competent', 'qualified', 'rigger', 'banksman', 'crane operator',
        'slinger', 'signaler', 'license', 'certification'
      ],
      exclusionPatterns: []
    },
    'Communication': {
      requiredContext: [
        'signal', 'signaling', 'hand signal', 'radio', 'communication',
        'briefing', 'lift plan'
      ],
      exclusionPatterns: []
    },
    'Planning': {
      requiredContext: [
        'lift plan', 'lifting plan', 'planning', 'method statement', 'rams',
        'radius', 'capacity', 'load chart'
      ],
      exclusionPatterns: []
    }
  },

  // Electrical Safety hazard category
  'Electrical Safety': {
    _common: {
      requiredContext: [
        'electrical', 'electric', 'power', 'voltage', 'current', 'wire', 'wiring',
        'cable', 'cables', 'circuit', 'panel', 'switchboard', 'transformer',
        'generator', 'socket', 'plug', 'extension', 'energized', 'energised',
        'live', 'shock', 'electrocution', 'arc flash'
      ],
      globalExclusions: [
        'toilet', 'welfare'
      ]
    },
    'Inspections': {
      requiredContext: [
        'inspection', 'inspected', 'pat test', 'pat tested', 'visual inspection',
        'checklist', 'tag', 'colour code', 'damaged cable', 'frayed'
      ],
      exclusionPatterns: []
    },
    'Permit': {
      requiredContext: [
        'permit', 'loto', 'lockout', 'tagout', 'isolation', 'isolated',
        'de-energized', 'de-energised', 'electrical permit'
      ],
      exclusionPatterns: []
    },
    'Competency': {
      requiredContext: [
        'electrician', 'qualified', 'competent', 'authorized', 'authorised'
      ],
      exclusionPatterns: []
    }
  },

  // Excavation & Trenching hazard category
  'Excavation & Trenching': {
    _common: {
      requiredContext: [
        'excavation', 'excavate', 'trench', 'trenching', 'dig', 'digging',
        'shoring', 'shored', 'benching', 'sloping', 'cave-in', 'collapse',
        'underground', 'buried', 'utilities', 'soil', 'spoil'
      ],
      globalExclusions: [
        'toilet', 'welfare'
      ]
    },
    'Inspections': {
      requiredContext: [
        'inspection', 'inspected', 'competent person', 'daily inspection',
        'checklist', 'before entry'
      ],
      exclusionPatterns: []
    },
    'Permit': {
      requiredContext: [
        'permit', 'excavation permit', 'dig permit', 'utility clearance',
        'permit to dig'
      ],
      exclusionPatterns: []
    },
    'Barriers': {
      requiredContext: [
        'barrier', 'barricade', 'edge protection', 'guardrail', 'warning tape',
        'demarcation'
      ],
      exclusionPatterns: []
    }
  },

  // Confined Space hazard category
  'Confined Space': {
    _common: {
      requiredContext: [
        'confined space', 'confined', 'tank', 'vessel', 'pit', 'manhole',
        'sewer', 'chamber', 'silo', 'hopper', 'entry', 'entrant', 'attendant',
        'rescue', 'atmosphere', 'ventilation', 'gas test', 'oxygen'
      ],
      globalExclusions: [
        'toilet', 'welfare'
      ]
    },
    'Inspections': {
      requiredContext: [
        'gas test', 'atmospheric test', 'monitoring', 'meter', 'detector',
        'checklist', 'inspection'
      ],
      exclusionPatterns: []
    },
    'Permit': {
      requiredContext: [
        'permit', 'confined space permit', 'entry permit', 'cse permit'
      ],
      exclusionPatterns: []
    },
    'Training': {
      requiredContext: [
        'training', 'trained', 'certified', 'competent', 'entry', 'attendant',
        'rescue'
      ],
      exclusionPatterns: []
    },
    'Emergency Preparedness': {
      requiredContext: [
        'rescue', 'emergency', 'retrieval', 'tripod', 'winch', 'breathing apparatus',
        'scba', 'evacuation'
      ],
      exclusionPatterns: []
    }
  },

  // Fire Safety hazard category
  'Fire Safety': {
    _common: {
      requiredContext: [
        'fire', 'flame', 'flammable', 'combustible', 'ignition', 'spark',
        'hot work', 'welding', 'cutting', 'grinding', 'extinguisher',
        'fire alarm', 'smoke detector', 'sprinkler', 'hydrant', 'hose reel'
      ],
      globalExclusions: [
        'toilet', 'welfare'
      ]
    },
    'Inspections': {
      requiredContext: [
        'inspection', 'inspected', 'checklist', 'tag', 'colour code',
        'monthly inspection', 'annual inspection', 'service'
      ],
      exclusionPatterns: []
    },
    'Permit': {
      requiredContext: [
        'permit', 'hot work permit', 'fire watch', 'fire watcher'
      ],
      exclusionPatterns: []
    },
    'Emergency Preparedness': {
      requiredContext: [
        'extinguisher', 'fire alarm', 'evacuation', 'assembly point', 'drill',
        'fire drill', 'fire warden', 'emergency'
      ],
      exclusionPatterns: []
    }
  },

  // Traffic Management hazard category
  'Traffic Management': {
    _common: {
      requiredContext: [
        'traffic', 'vehicle', 'vehicles', 'pedestrian', 'speed', 'speeding',
        'road', 'route', 'crossing', 'segregation', 'parking', 'reversing',
        'banksman', 'spotter', 'marshal'
      ],
      globalExclusions: [
        'toilet', 'welfare'
      ]
    },
    'Signage': {
      requiredContext: [
        'sign', 'signage', 'speed sign', 'warning sign', 'stop sign',
        'traffic sign', 'road marking'
      ],
      exclusionPatterns: []
    },
    'Barriers': {
      requiredContext: [
        'barrier', 'bollard', 'cone', 'delineator', 'guardrail', 'jersey barrier',
        'segregation', 'separation'
      ],
      exclusionPatterns: []
    },
    'Planning': {
      requiredContext: [
        'traffic plan', 'traffic management plan', 'tmp', 'route', 'planning'
      ],
      exclusionPatterns: []
    }
  }
}

/**
 * Validates if a factor match is a true positive based on hazard-specific rules
 * Uses compound matching (factor keyword + context) and exclusion pattern filtering
 *
 * VALIDATION LOGIC:
 * 1. Check _common.globalExclusions - if matched, REJECT (applies to ALL factors)
 * 2. Check factor-specific exclusionPatterns - if matched, REJECT
 * 3. Check if ANY context matches from _common.requiredContext OR factor.requiredContext
 *
 * @param {string} factorName - The factor being validated (e.g., "Inspections")
 * @param {string} description - Full observation description text
 * @param {string} hazardCategory - The hazard category (e.g., "Mobile Plant & Equipment")
 * @returns {Object} { isValid: boolean, reason: string, matchedPattern?: string, matchedContext?: string }
 */
export const validateFactorMatch = (factorName, description, hazardCategory = null) => {
  // If no hazard category specified or no rules exist, allow the match (backwards compatible)
  if (!hazardCategory || !HAZARD_FACTOR_RULES[hazardCategory]) {
    return { isValid: true, reason: 'no_rules_defined' }
  }

  const hazardRules = HAZARD_FACTOR_RULES[hazardCategory]
  const textLower = description.toLowerCase()

  // Get common rules and factor-specific rules
  const commonRules = hazardRules._common || {}
  const factorRules = hazardRules[factorName] || {}

  // STEP 1: Check global exclusions (apply to ALL factors in this hazard)
  if (commonRules.globalExclusions && commonRules.globalExclusions.length > 0) {
    for (const pattern of commonRules.globalExclusions) {
      if (textLower.includes(pattern.toLowerCase())) {
        return {
          isValid: false,
          reason: 'global_exclusion_matched',
          matchedPattern: pattern
        }
      }
    }
  }

  // STEP 2: Check factor-specific exclusion patterns
  if (factorRules.exclusionPatterns && factorRules.exclusionPatterns.length > 0) {
    for (const pattern of factorRules.exclusionPatterns) {
      if (textLower.includes(pattern.toLowerCase())) {
        return {
          isValid: false,
          reason: 'factor_exclusion_matched',
          matchedPattern: pattern
        }
      }
    }
  }

  // STEP 3: Check required context - need to match from EITHER common OR factor-specific
  const commonContext = commonRules.requiredContext || []
  const factorContext = factorRules.requiredContext || []
  const allRequiredContext = [...commonContext, ...factorContext]

  // If no context rules defined, allow the match (backwards compatible)
  if (allRequiredContext.length === 0) {
    return { isValid: true, reason: 'no_context_rules' }
  }

  // Check if ANY context keyword matches
  for (const context of allRequiredContext) {
    if (textLower.includes(context.toLowerCase())) {
      return {
        isValid: true,
        reason: 'context_matched',
        matchedContext: context
      }
    }
  }

  // No context matched - reject
  return {
    isValid: false,
    reason: 'missing_required_context',
    requiredAny: allRequiredContext.slice(0, 15) // Show first 15 for debugging
  }
}

/**
 * Gets the hazard category from an incident object
 * Supports multiple field names for flexibility
 *
 * @param {Object} incident - The incident object
 * @returns {string|null} The hazard category or null
 */
export const getHazardCategory = (incident) => {
  if (!incident) return null
  // Support multiple possible field names
  return incident.location || incident.hazardCategory || incident.hazard || null
}

// ============================================================================
// FACTOR KEYWORDS MAPPING
// ============================================================================

export const FACTOR_KEYWORDS = {
  // Permit (50+)
  permit: 'Permit',
  permits: 'Permit',
  permitted: 'Permit',
  permiting: 'Permit',
  permitting: 'Permit',
  permt: 'Permit',
  permitt: 'Permit',
  permitts: 'Permit',
  permited: 'Permit',
  permitwork: 'Permit',
  ptw: 'Permit',
  ptwwork: 'Permit',
  workpermit: 'Permit',
  workpermits: 'Permit',
  hotwork: 'Permit',
  hotworks: 'Permit',
  coldwork: 'Permit',
  coldworks: 'Permit',
  loto: 'Permit',
  lotoo: 'Permit',
  lockout: 'Permit',
  lockouts: 'Permit',
  lockedout: 'Permit',
  lockingout: 'Permit',
  tagout: 'Permit',
  tagouts: 'Permit',
  taggedout: 'Permit',
  taggingout: 'Permit',
  lototo: 'Permit',
  isolation: 'Permit',
  isolations: 'Permit',
  isolated: 'Permit',
  isolate: 'Permit',
  isolating: 'Permit',
  unisolated: 'Permit',
  deisolated: 'Permit',
  energized: 'Permit',
  energised: 'Permit',
  deenergized: 'Permit',
  deenergised: 'Permit',
  excavation: 'Permit',
  excavations: 'Permit',
  excavate: 'Permit',
  excavating: 'Permit',
  confinedspace: 'Permit',
  confinedspaces: 'Permit',
  heightpermit: 'Permit',
  heightpermits: 'Permit',
  workatpermit: 'Permit',
  radiography: 'Permit',
  breakinpermit: 'Permit',

  // Training (50+)
  training: 'Training',
  trainings: 'Training',
  trained: 'Training',
  trainer: 'Training',
  trainers: 'Training',
  trainee: 'Training',
  trainees: 'Training',
  trainin: 'Training',
  traning: 'Training',
  trianing: 'Training',
  trainning: 'Training',
  traing: 'Training',
  untrained: 'Training',
  retrained: 'Training',
  retraining: 'Training',
  crosstraining: 'Training',
  crosstrained: 'Training',
  induction: 'Training',
  inductions: 'Training',
  inducted: 'Training',
  inductee: 'Training',
  inductees: 'Training',
  inducion: 'Training',
  orientation: 'Training',
  orientations: 'Training',
  oriented: 'Training',
  orientated: 'Training',
  onboarding: 'Training',
  onboarded: 'Training',
  certified: 'Training',
  certification: 'Training',
  certifications: 'Training',
  recertified: 'Training',
  recertification: 'Training',
  uncertified: 'Training',
  certificate: 'Training',
  certificates: 'Training',
  certificated: 'Training',
  coursework: 'Training',
  courseware: 'Training',
  refresher: 'Training',
  refreshers: 'Training',
  workshop: 'Training',
  workshops: 'Training',
  seminar: 'Training',
  seminars: 'Training',
  classroom: 'Training',
  elearning: 'Training',
  ojt: 'Training',
  onthejob: 'Training',

  // Competency (50+)
  competency: 'Competency',
  competencies: 'Competency',
  competent: 'Competency',
  competance: 'Competency',
  competense: 'Competency',
  compitency: 'Competency',
  compitent: 'Competency',
  incompetent: 'Competency',
  incompetence: 'Competency',
  incompetant: 'Competency',
  qualified: 'Competency',
  qualification: 'Competency',
  qualifications: 'Competency',
  unqualified: 'Competency',
  disqualified: 'Competency',
  requalified: 'Competency',
  prequalified: 'Competency',
  qualifed: 'Competency',
  skilled: 'Competency',
  unskilled: 'Competency',
  skillset: 'Competency',
  skillsets: 'Competency',
  skills: 'Competency',
  skilful: 'Competency',
  skillful: 'Competency',
  deskilled: 'Competency',
  multiskilled: 'Competency',
  experienced: 'Competency',
  inexperienced: 'Competency',
  experience: 'Competency',
  experiences: 'Competency',
  experiance: 'Competency',
  expertise: 'Competency',
  expert: 'Competency',
  experts: 'Competency',
  proficient: 'Competency',
  proficiency: 'Competency',
  nonproficient: 'Competency',
  capable: 'Competency',
  capability: 'Competency',
  capabilities: 'Competency',
  incapable: 'Competency',
  knowledgeable: 'Competency',
  knowlegeable: 'Competency',
  knowledgable: 'Competency',
  knowledge: 'Competency',
  ability: 'Competency',
  abilities: 'Competency',
  inability: 'Competency',
  aptitude: 'Competency',

  // Documentations (50+)
  documentation: 'Documentations',
  documentations: 'Documentations',
  documented: 'Documentations',
  undocumented: 'Documentations',
  documenting: 'Documentations',
  documentaion: 'Documentations',
  documenation: 'Documentations',
  documention: 'Documentations',
  docs: 'Documentations',
  procedure: 'Documentations',
  procedures: 'Documentations',
  procedural: 'Documentations',
  proceedure: 'Documentations',
  proceedures: 'Documentations',
  procedurs: 'Documentations',
  proceduers: 'Documentations',
  sop: 'Documentations',
  sops: 'Documentations',
  swms: 'Documentations',
  swp: 'Documentations',
  ssow: 'Documentations',
  jsa: 'Documentations',
  jsas: 'Documentations',
  jha: 'Documentations',
  jhas: 'Documentations',
  jsea: 'Documentations',
  jseas: 'Documentations',
  rams: 'Documentations',
  ramss: 'Documentations',
  risk: 'Documentations',
  rissk: 'Documentations',
  riskassessment: 'Documentations',
  riskassessments: 'Documentations',
  checklist: 'Documentations',
  checklists: 'Documentations',
  checksheet: 'Documentations',
  checksheets: 'Documentations',
  paperwork: 'Documentations',
  paperworks: 'Documentations',
  logbook: 'Documentations',
  logbooks: 'Documentations',
  logsheet: 'Documentations',
  logsheets: 'Documentations',
  workinstruction: 'Documentations',
  workinstructions: 'Documentations',
  methodstatement: 'Documentations',
  methodstatements: 'Documentations',
  permit: 'Documentations',
  manual: 'Documentations',
  manuals: 'Documentations',

  // Supervision (50+)
  supervision: 'Supervision',
  supervisions: 'Supervision',
  supervisor: 'Supervision',
  supervisors: 'Supervision',
  supervised: 'Supervision',
  supervising: 'Supervision',
  supervisory: 'Supervision',
  supervison: 'Supervision',
  superviser: 'Supervision',
  supervisers: 'Supervision',
  superivision: 'Supervision',
  supervisior: 'Supervision',
  unsupervised: 'Supervision',
  undersupervised: 'Supervision',
  resupervised: 'Supervision',
  foreman: 'Supervision',
  foremans: 'Supervision',
  foremen: 'Supervision',
  forman: 'Supervision',
  formans: 'Supervision',
  overseer: 'Supervision',
  overseers: 'Supervision',
  oversee: 'Supervision',
  overseeing: 'Supervision',
  oversight: 'Supervision',
  oversights: 'Supervision',
  oversite: 'Supervision',
  watchman: 'Supervision',
  watchmen: 'Supervision',
  watchmans: 'Supervision',
  spotter: 'Supervision',
  spotters: 'Supervision',
  spotting: 'Supervision',
  spotted: 'Supervision',
  banksman: 'Supervision',
  banksmen: 'Supervision',
  banksmans: 'Supervision',
  chargehand: 'Supervision',
  chargehands: 'Supervision',
  leadhand: 'Supervision',
  leadhands: 'Supervision',
  gangboss: 'Supervision',
  gangbosses: 'Supervision',
  sitesupervisor: 'Supervision',
  shiftsupervisor: 'Supervision',
  areasupervisor: 'Supervision',
  linesupervisor: 'Supervision',
  teamsupervisor: 'Supervision',
  crewsupervisor: 'Supervision',

  // Environment (50+)
  environment: 'Environment',
  environments: 'Environment',
  environmental: 'Environment',
  enviroment: 'Environment',
  enviromental: 'Environment',
  enviornment: 'Environment',
  enviornmental: 'Environment',
  enviorment: 'Environment',
  envirnoment: 'Environment',
  weather: 'Environment',
  weathers: 'Environment',
  weathering: 'Environment',
  weathered: 'Environment',
  lighting: 'Environment',
  lightings: 'Environment',
  lighted: 'Environment',
  unlighted: 'Environment',
  poorlighting: 'Environment',
  illumination: 'Environment',
  illuminated: 'Environment',
  ventilation: 'Environment',
  ventilated: 'Environment',
  unventilated: 'Environment',
  ventilating: 'Environment',
  poorventilation: 'Environment',
  temperature: 'Environment',
  temperatures: 'Environment',
  tempurature: 'Environment',
  temprature: 'Environment',
  humidity: 'Environment',
  humid: 'Environment',
  humidty: 'Environment',
  dusty: 'Environment',
  dustyness: 'Environment',
  dust: 'Environment',
  windy: 'Environment',
  windyness: 'Environment',
  rainy: 'Environment',
  raining: 'Environment',
  visibility: 'Environment',
  visability: 'Environment',
  poorvisibility: 'Environment',
  lowvisibility: 'Environment',
  workplace: 'Environment',
  workplaces: 'Environment',
  worksite: 'Environment',
  worksites: 'Environment',
  workarea: 'Environment',
  workareas: 'Environment',
  conditions: 'Environment',
  siteconditions: 'Environment',

  // Planning (50+)
  planning: 'Planning',
  plannings: 'Planning',
  planned: 'Planning',
  planner: 'Planning',
  planners: 'Planning',
  planing: 'Planning',
  planninng: 'Planning',
  unplanned: 'Planning',
  preplanning: 'Planning',
  preplanned: 'Planning',
  preplan: 'Planning',
  preplans: 'Planning',
  misplanned: 'Planning',
  replanned: 'Planning',
  replanning: 'Planning',
  schedule: 'Planning',
  schedules: 'Planning',
  scheduled: 'Planning',
  scheduling: 'Planning',
  unscheduled: 'Planning',
  rescheduled: 'Planning',
  rescheduling: 'Planning',
  scedule: 'Planning',
  schedual: 'Planning',
  schdule: 'Planning',
  coordination: 'Planning',
  coordinated: 'Planning',
  uncoordinated: 'Planning',
  coordinating: 'Planning',
  coordinator: 'Planning',
  coordinators: 'Planning',
  coordinaton: 'Planning',
  miscoordinated: 'Planning',
  preparation: 'Planning',
  preparations: 'Planning',
  prepared: 'Planning',
  unprepared: 'Planning',
  preparing: 'Planning',
  preparedness: 'Planning',
  illprepared: 'Planning',
  workplan: 'Planning',
  workplans: 'Planning',
  taskplan: 'Planning',
  taskplans: 'Planning',
  jobplan: 'Planning',
  jobplans: 'Planning',
  safetyplan: 'Planning',
  safetyplans: 'Planning',
  methodology: 'Planning',
  sequencing: 'Planning',
  // Geotechnical/Soil reports (excavation planning)
  geotechnical: 'Planning',
  geotechnicalreport: 'Planning',
  geotechnicalreports: 'Planning',
  geotechreport: 'Planning',
  geotechreports: 'Planning',
  soilreport: 'Planning',
  soilreports: 'Planning',
  soilsurvey: 'Planning',
  soilsurveys: 'Planning',
  soiltest: 'Planning',
  soiltests: 'Planning',
  soiltesting: 'Planning',
  soilanalysis: 'Planning',
  soilcondition: 'Planning',
  soilconditions: 'Planning',
  groundcondition: 'Planning',
  groundconditions: 'Planning',
  groundsurvey: 'Planning',
  groundsurveys: 'Planning',
  // Utility layouts and drawings (excavation planning)
  utilitylayout: 'Planning',
  utilitylayouts: 'Planning',
  utilitydrawing: 'Planning',
  utilitydrawings: 'Planning',
  utilitydiagram: 'Planning',
  utilitydiagrams: 'Planning',
  utilitymap: 'Planning',
  utilitymaps: 'Planning',
  utilitylocate: 'Planning',
  utilitylocating: 'Planning',
  utilitylocation: 'Planning',
  utilitylocations: 'Planning',
  asbuiltdrawing: 'Planning',
  asbuiltdrawings: 'Planning',
  asbuilt: 'Planning',
  asbuilts: 'Planning',
  layoutdrawing: 'Planning',
  layoutdrawings: 'Planning',
  // Expired documents
  expired: 'Planning',
  expiry: 'Planning',
  expiring: 'Planning',
  outofdate: 'Planning',
  outdated: 'Planning',
  lapsed: 'Planning',
  // Availability issues
  unavailability: 'Planning',
  unavailable: 'Planning',
  notavailable: 'Planning',
  missingdocument: 'Planning',
  missingdocuments: 'Planning',
  missingdrawing: 'Planning',
  missingdrawings: 'Planning',
  missinglayout: 'Planning',
  // Distance/spacing planning
  safedistance: 'Planning',
  safedistances: 'Planning',
  minimumdistance: 'Planning',
  clearance: 'Planning',
  clearances: 'Planning',
  setback: 'Planning',
  setbacks: 'Planning',

  // Signage (50+)
  signage: 'Signage',
  signages: 'Signage',
  sign: 'Signage',
  signs: 'Signage',
  signed: 'Signage',
  signboard: 'Signage',
  signboards: 'Signage',
  signeage: 'Signage',
  signege: 'Signage',
  signag: 'Signage',
  nosign: 'Signage',
  nosigns: 'Signage',
  missingsign: 'Signage',
  missingsigns: 'Signage',
  label: 'Signage',
  labels: 'Signage',
  labeled: 'Signage',
  labelled: 'Signage',
  labeling: 'Signage',
  labelling: 'Signage',
  unlabeled: 'Signage',
  unlabelled: 'Signage',
  mislabeled: 'Signage',
  mislabelled: 'Signage',
  relabeled: 'Signage',
  relabelled: 'Signage',
  marking: 'Signage',
  markings: 'Signage',
  marked: 'Signage',
  unmarked: 'Signage',
  mismarked: 'Signage',
  remarked: 'Signage',
  placard: 'Signage',
  placards: 'Signage',
  placarded: 'Signage',
  unplacarded: 'Signage',
  poster: 'Signage',
  posters: 'Signage',
  posted: 'Signage',
  unposted: 'Signage',
  caution: 'Signage',
  cautionary: 'Signage',
  cautiontape: 'Signage',
  warningsign: 'Signage',
  warningsigns: 'Signage',
  dangersign: 'Signage',
  dangersigns: 'Signage',
  safetysign: 'Signage',
  safetysigns: 'Signage',
  sticker: 'Signage',
  stickers: 'Signage',
  // Stop signs (traffic/excavation areas)
  stopsign: 'Signage',
  stopsigns: 'Signage',
  nostopsign: 'Signage',
  missingstopsign: 'Signage',
  // Excavation signage
  excavationsign: 'Signage',
  excavationsigns: 'Signage',
  excavationsignage: 'Signage',
  trenchsign: 'Signage',
  trenchsigns: 'Signage',
  digsign: 'Signage',
  digsigns: 'Signage',
  // Warning for excavations
  notclearlysigned: 'Signage',
  clearlysigned: 'Signage',
  notproperlysigned: 'Signage',
  properlysigned: 'Signage',
  lackofsignage: 'Signage',
  missingsignage: 'Signage',
  nosignage: 'Signage',
  // Hazard information signs
  hazardsign: 'Signage',
  hazardsigns: 'Signage',
  informationsign: 'Signage',
  informationsigns: 'Signage',

  // Barriers (50+)
  // Barriers (100+)
  barriers: 'Barriers',
  barrier: 'Barriers',
  barier: 'Barriers',
  bariers: 'Barriers',
  barriar: 'Barriers',
  barriars: 'Barriers',
  barior: 'Barriers',
  barricade: 'Barriers',
  barricades: 'Barriers',
  barricaded: 'Barriers',
  barricading: 'Barriers',
  unbarricaded: 'Barriers',
  baricade: 'Barriers',
  baricades: 'Barriers',
  baracade: 'Barriers',
  baracades: 'Barriers',
  barrikade: 'Barriers',
  barrikades: 'Barriers',
  barrricade: 'Barriers',
  hardbarricade: 'Barriers',
  softbarricade: 'Barriers',
  rigidbarricade: 'Barriers',
  // Guardrails/Handrails
  guardrail: 'Barriers',
  guardrails: 'Barriers',
  guardrial: 'Barriers',
  gaurdrial: 'Barriers',
  gaurdrail: 'Barriers',
  gaurdrails: 'Barriers',
  gaurdail: 'Barriers',
  guadrail: 'Barriers',
  guarail: 'Barriers',
  handrail: 'Barriers',
  handrails: 'Barriers',
  handrial: 'Barriers',
  handrals: 'Barriers',
  hanrail: 'Barriers',
  hanrails: 'Barriers',
  handral: 'Barriers',
  railing: 'Barriers',
  railings: 'Barriers',
  railling: 'Barriers',
  midrail: 'Barriers',
  midrial: 'Barriers',
  kneerail: 'Barriers',
  intermediaterail: 'Barriers',
  // Fencing
  fencing: 'Barriers',
  fenced: 'Barriers',
  unfenced: 'Barriers',
  fence: 'Barriers',
  fences: 'Barriers',
  fenceing: 'Barriers',
  fensing: 'Barriers',
  fense: 'Barriers',
  fenses: 'Barriers',
  hoarding: 'Barriers',
  hoardings: 'Barriers',
  chainlink: 'Barriers',
  wiremesh: 'Barriers',
  greenmesh: 'Barriers',
  // Bollards/Cones
  bollard: 'Barriers',
  bollards: 'Barriers',
  bollerd: 'Barriers',
  bolards: 'Barriers',
  cone: 'Barriers',
  cones: 'Barriers',
  trafficcone: 'Barriers',
  trafficcones: 'Barriers',
  safetycones: 'Barriers',
  // Delineators
  delineator: 'Barriers',
  delineators: 'Barriers',
  delinator: 'Barriers',
  delinators: 'Barriers',
  delinater: 'Barriers',
  delineaters: 'Barriers',
  // Demarcation
  demarcation: 'Barriers',
  demarcated: 'Barriers',
  demarcating: 'Barriers',
  undemarcated: 'Barriers',
  demaracation: 'Barriers',
  demarkation: 'Barriers',
  demarcaton: 'Barriers',
  // Zones
  exclusionzone: 'Barriers',
  exclusionzones: 'Barriers',
  dropzone: 'Barriers',
  dropzones: 'Barriers',
  dangerzone: 'Barriers',
  safezone: 'Barriers',
  redzone: 'Barriers',
  swingzone: 'Barriers',
  bufferzone: 'Barriers',
  // Edge protection
  edgeprotection: 'Barriers',
  unprotectededge: 'Barriers',
  leadingedge: 'Barriers',
  openedge: 'Barriers',
  exposededge: 'Barriers',
  perimeterprotection: 'Barriers',
  // Toe boards
  toeboard: 'Barriers',
  toeboards: 'Barriers',
  kickplate: 'Barriers',
  kickplates: 'Barriers',
  kickboard: 'Barriers',
  kickboards: 'Barriers',
  kickwall: 'Barriers',
  // Safety nets
  safetynet: 'Barriers',
  safetynets: 'Barriers',
  safetynetting: 'Barriers',
  catchnet: 'Barriers',
  catchnets: 'Barriers',
  catchnetting: 'Barriers',
  catchplatform: 'Barriers',
  debrisnet: 'Barriers',
  debrisnetting: 'Barriers',
  fallnet: 'Barriers',
  fallnets: 'Barriers',
  // Parapet
  parapet: 'Barriers',
  parapets: 'Barriers',
  parapetwall: 'Barriers',
  // Floor openings
  flooropening: 'Barriers',
  flooropenings: 'Barriers',
  holecover: 'Barriers',
  voidcover: 'Barriers',
  openingcover: 'Barriers',
  shaftopening: 'Barriers',
  // Tapes
  cautiontape: 'Barriers',
  warningtape: 'Barriers',
  barriertape: 'Barriers',
  hazardtape: 'Barriers',
  dangertape: 'Barriers',
  safetytape: 'Barriers',
  // Wheel chocks
  wheelchock: 'Barriers',
  wheelchocks: 'Barriers',
  chock: 'Barriers',
  chocks: 'Barriers',
  chok: 'Barriers',
  choks: 'Barriers',
  wheelstopper: 'Barriers',
  wheelstoppers: 'Barriers',
  stopper: 'Barriers',
  stoppers: 'Barriers',
  wheelchoker: 'Barriers',
  wheelchokers: 'Barriers',
  choker: 'Barriers',
  chokers: 'Barriers',
  wheelblock: 'Barriers',
  wheelblocks: 'Barriers',
  // Segregation
  segregation: 'Barriers',
  segregated: 'Barriers',
  unsegregated: 'Barriers',
  separation: 'Barriers',
  separated: 'Barriers',
  unseparated: 'Barriers',
  // Berms (excavation edge protection)
  berm: 'Barriers',
  berms: 'Barriers',
  sandberm: 'Barriers',
  sandberms: 'Barriers',
  soilberm: 'Barriers',
  soilberms: 'Barriers',
  earthberm: 'Barriers',
  earthberms: 'Barriers',
  bermwall: 'Barriers',
  bermwalls: 'Barriers',
  // Stop blocks (vehicle edge protection)
  stopblock: 'Barriers',
  stopblocks: 'Barriers',
  stoplog: 'Barriers',
  stoplogs: 'Barriers',
  vehiclestop: 'Barriers',
  vehiclestops: 'Barriers',
  // Unsecured excavations
  unsecuredexcavation: 'Barriers',
  unsecuredtrench: 'Barriers',
  unsecuredpit: 'Barriers',
  unprotectedexcavation: 'Barriers',
  unprotectedtrench: 'Barriers',
  openexcavation: 'Barriers',
  opentrench: 'Barriers',
  openpit: 'Barriers',

  // Inspections (50+)
  inspection: 'Inspections',
  inspections: 'Inspections',
  inspect: 'Inspections',
  inspected: 'Inspections',
  inspecting: 'Inspections',
  inspector: 'Inspections',
  inspectors: 'Inspections',
  uninspected: 'Inspections',
  reinspected: 'Inspections',
  reinspection: 'Inspections',
  preinspection: 'Inspections',
  preinspected: 'Inspections',
  inpection: 'Inspections',
  insepction: 'Inspections',
  inpsection: 'Inspections',
  ispection: 'Inspections',
  audit: 'Inspections',
  audits: 'Inspections',
  audited: 'Inspections',
  auditing: 'Inspections',
  auditor: 'Inspections',
  auditors: 'Inspections',
  unaudited: 'Inspections',
  preaudit: 'Inspections',
  reaudit: 'Inspections',
  reaudited: 'Inspections',
  walkthrough: 'Inspections',
  walkthroughs: 'Inspections',
  walkdown: 'Inspections',
  walkdowns: 'Inspections',
  walkaround: 'Inspections',
  walkarounds: 'Inspections',
  verify: 'Inspections',
  verified: 'Inspections',
  verification: 'Inspections',
  verifications: 'Inspections',
  unverified: 'Inspections',
  reverified: 'Inspections',
  examine: 'Inspections',
  examined: 'Inspections',
  examination: 'Inspections',
  examinations: 'Inspections',
  examining: 'Inspections',
  review: 'Inspections',
  reviewed: 'Inspections',
  reviewing: 'Inspections',
  safetyinspection: 'Inspections',
  siteinspection: 'Inspections',
  dailyinspection: 'Inspections',
  weeklyinspection: 'Inspections',

  // Interfaces (50+)
  interfaces: 'Interfaces',
  interface: 'Interfaces',
  interfacing: 'Interfaces',
  interfaced: 'Interfaces',
  interphase: 'Interfaces',
  interphases: 'Interfaces',
  handover: 'Interfaces',
  handovers: 'Interfaces',
  handedover: 'Interfaces',
  handingover: 'Interfaces',
  handovr: 'Interfaces',
  handoff: 'Interfaces',
  handoffs: 'Interfaces',
  handedoff: 'Interfaces',
  changeover: 'Interfaces',
  changeovers: 'Interfaces',
  changedover: 'Interfaces',
  changingover: 'Interfaces',
  transition: 'Interfaces',
  transitions: 'Interfaces',
  transitioning: 'Interfaces',
  transitioned: 'Interfaces',
  turnover: 'Interfaces',
  turnovers: 'Interfaces',
  turnedover: 'Interfaces',
  turningover: 'Interfaces',
  shiftchange: 'Interfaces',
  shiftchanges: 'Interfaces',
  shifthandover: 'Interfaces',
  shifthandovers: 'Interfaces',
  crewchange: 'Interfaces',
  crewchanges: 'Interfaces',
  crewhandover: 'Interfaces',
  reliefchange: 'Interfaces',
  reliefchanges: 'Interfaces',
  interchange: 'Interfaces',
  interchanges: 'Interfaces',
  crossover: 'Interfaces',
  crossovers: 'Interfaces',
  interteam: 'Interfaces',
  interdepartment: 'Interfaces',
  interdepartmental: 'Interfaces',
  intercompany: 'Interfaces',
  intercontractor: 'Interfaces',
  multiparty: 'Interfaces',
  simultaneousops: 'Interfaces',
  simops: 'Interfaces',
  coactivity: 'Interfaces',
  coactivities: 'Interfaces',
  overlap: 'Interfaces',
  overlapping: 'Interfaces',

  // Housekeeping (50+)
  housekeeping: 'Housekeeping',
  houskeeping: 'Housekeeping',
  houskepping: 'Housekeeping',
  housekeepng: 'Housekeeping',
  housekkeping: 'Housekeeping',
  poorhousekeeping: 'Housekeeping',
  goodhousekeeping: 'Housekeeping',
  cleanliness: 'Housekeeping',
  cleaniness: 'Housekeeping',
  cleanlness: 'Housekeeping',
  cleaner: 'Housekeeping',
  cleaners: 'Housekeeping',
  cleaning: 'Housekeeping',
  cleaned: 'Housekeeping',
  uncleaned: 'Housekeeping',
  unclean: 'Housekeeping',
  dirty: 'Housekeeping',
  dirtiness: 'Housekeeping',
  dirtyness: 'Housekeeping',
  clutter: 'Housekeeping',
  cluttered: 'Housekeeping',
  uncluttered: 'Housekeeping',
  cluttering: 'Housekeeping',
  declutter: 'Housekeeping',
  decluttered: 'Housekeeping',
  debris: 'Housekeeping',
  debri: 'Housekeeping',
  debries: 'Housekeeping',
  trash: 'Housekeeping',
  trashed: 'Housekeeping',
  trashes: 'Housekeeping',
  rubbish: 'Housekeeping',
  rubish: 'Housekeeping',
  garbage: 'Housekeeping',
  garbages: 'Housekeeping',
  waste: 'Housekeeping',
  wastes: 'Housekeeping',
  wasted: 'Housekeeping',
  messy: 'Housekeeping',
  messiness: 'Housekeeping',
  mess: 'Housekeeping',
  tidy: 'Housekeeping',
  tidiness: 'Housekeeping',
  untidy: 'Housekeeping',
  tidied: 'Housekeeping',
  orderly: 'Housekeeping',
  disorderly: 'Housekeeping',
  organized: 'Housekeeping',
  disorganized: 'Housekeeping',
  spillage: 'Housekeeping',
  spillages: 'Housekeeping',

  // Behavioural (50+)
  bbs: 'Behavioural',
  bbss: 'Behavioural',
  behavior: 'Behavioural',
  behaviors: 'Behavioural',
  behaviour: 'Behavioural',
  behaviours: 'Behavioural',
  behavioral: 'Behavioural',
  behavioural: 'Behavioural',
  behavor: 'Behavioural',
  behavors: 'Behavioural',
  behavour: 'Behavioural',
  behavours: 'Behavioural',
  behavier: 'Behavioural',
  behaviers: 'Behavioural',
  behaviorbased: 'Behavioural',
  behaviourbased: 'Behavioural',
  behaviorsafety: 'Behavioural',
  behavioursafety: 'Behavioural',
  safebehavior: 'Behavioural',
  safebehaviour: 'Behavioural',
  safebehaviors: 'Behavioural',
  safebehaviours: 'Behavioural',
  unsafebehavior: 'Behavioural',
  unsafebehaviour: 'Behavioural',
  unsafebehaviors: 'Behavioural',
  unsafebehaviours: 'Behavioural',
  atrisk: 'Behavioural',
  atrisks: 'Behavioural',
  atriskbehavior: 'Behavioural',
  atriskbehaviour: 'Behavioural',
  riskybehavior: 'Behavioural',
  riskybehaviour: 'Behavioural',
  safeact: 'Behavioural',
  safeacts: 'Behavioural',
  unsafeact: 'Behavioural',
  unsafeacts: 'Behavioural',
  safecondition: 'Behavioural',
  safeconditions: 'Behavioural',
  unsafecondition: 'Behavioural',
  unsafeconditions: 'Behavioural',
  nearmiss: 'Behavioural',
  nearmisses: 'Behavioural',
  nearmis: 'Behavioural',
  goodcatch: 'Behavioural',
  goodcatches: 'Behavioural',
  stopwork: 'Behavioural',
  stopworks: 'Behavioural',
  stopworkauthority: 'Behavioural',
  swa: 'Behavioural',
  safetyobservation: 'Behavioural',
  safetyobservations: 'Behavioural',

  // Communication (50+)
  communication: 'Communication',
  communications: 'Communication',
  communicate: 'Communication',
  communicated: 'Communication',
  communicating: 'Communication',
  communicator: 'Communication',
  communicators: 'Communication',
  comunication: 'Communication',
  communcation: 'Communication',
  communicaton: 'Communication',
  communiation: 'Communication',
  comminication: 'Communication',
  miscommunication: 'Communication',
  miscommunicated: 'Communication',
  miscommunications: 'Communication',
  poorcommunication: 'Communication',
  lackcommunication: 'Communication',
  briefing: 'Communication',
  briefings: 'Communication',
  briefed: 'Communication',
  unbriefed: 'Communication',
  rebriefed: 'Communication',
  rebriefing: 'Communication',
  debriefing: 'Communication',
  debriefed: 'Communication',
  debriefings: 'Communication',
  prebriefing: 'Communication',
  prebriefed: 'Communication',
  toolbox: 'Communication',
  toolboxes: 'Communication',
  toolboxtalk: 'Communication',
  toolboxtalks: 'Communication',
  toolboxmeeting: 'Communication',
  tbt: 'Communication',
  tbts: 'Communication',
  tailgate: 'Communication',
  tailgates: 'Communication',
  tailgatemeeting: 'Communication',
  prestart: 'Communication',
  prestarts: 'Communication',
  prestartmeeting: 'Communication',
  prejob: 'Communication',
  prejobs: 'Communication',
  prejobmeeting: 'Communication',
  informed: 'Communication',
  uninformed: 'Communication',
  misinformed: 'Communication',
  notinformed: 'Communication',
  radio: 'Communication',
  radios: 'Communication',
  twowayradio: 'Communication',

  // PPE (50+)
  ppe: 'PPE',
  ppes: 'PPE',
  ppee: 'PPE',
  pppe: 'PPE',
  noppe: 'PPE',
  lackppe: 'PPE',
  missingppe: 'PPE',
  incorrectppe: 'PPE',
  wrongppe: 'PPE',
  helmet: 'PPE',
  helmets: 'PPE',
  helment: 'PPE',
  helments: 'PPE',
  hardhat: 'PPE',
  hardhats: 'PPE',
  hardhet: 'PPE',
  safetyhelmet: 'PPE',
  safetyhelmets: 'PPE',
  gloves: 'PPE',
  glove: 'PPE',
  glovs: 'PPE',
  glovess: 'PPE',
  safetygloves: 'PPE',
  workgloves: 'PPE',
  goggles: 'PPE',
  goggle: 'PPE',
  gogle: 'PPE',
  gogles: 'PPE',
  safetygoggles: 'PPE',
  glasses: 'PPE',
  safetyglasses: 'PPE',
  safetyglass: 'PPE',
  eyewear: 'PPE',
  eyeware: 'PPE',
  eyeprotection: 'PPE',
  harness: 'PPE',
  harnesses: 'PPE',
  harnes: 'PPE',
  harneses: 'PPE',
  fullharness: 'PPE',
  bodyharness: 'PPE',
  safetyharness: 'PPE',
  lanyard: 'PPE',
  lanyards: 'PPE',
  laniard: 'PPE',
  laniards: 'PPE',
  vest: 'PPE',
  vests: 'PPE',
  safetyvest: 'PPE',
  safetyvests: 'PPE',
  hiviz: 'PPE',
  hivizs: 'PPE',
  highvis: 'PPE',
  hivis: 'PPE',
  reflective: 'PPE',
  reflectives: 'PPE',
  respirator: 'PPE',
  respirators: 'PPE',
  resprator: 'PPE',
  faceshield: 'PPE',
  faceshields: 'PPE',
  earplugs: 'PPE',
  earplug: 'PPE',
  earmuffs: 'PPE',
  earmuff: 'PPE',
  hearingprotection: 'PPE',
  boots: 'PPE',
  safetyboots: 'PPE',
  steelcap: 'PPE',
  steelcaps: 'PPE',
  steeltoe: 'PPE',
  steeltoes: 'PPE',

  // Safety Devices (50+)
  safetydevice: 'Safety Devices',
  safetydevices: 'Safety Devices',
  safetydevise: 'Safety Devices',
  safetydevises: 'Safety Devices',
  safeguard: 'Safety Devices',
  safeguards: 'Safety Devices',
  safeguarded: 'Safety Devices',
  unsafeguarded: 'Safety Devices',
  safeguarding: 'Safety Devices',
  safegaurd: 'Safety Devices',
  safegaurds: 'Safety Devices',
  alarm: 'Safety Devices',
  alarms: 'Safety Devices',
  alarmed: 'Safety Devices',
  unalarmed: 'Safety Devices',
  alarming: 'Safety Devices',
  firealarm: 'Safety Devices',
  firealarms: 'Safety Devices',
  gasalarm: 'Safety Devices',
  gasalarms: 'Safety Devices',
  detector: 'Safety Devices',
  detectors: 'Safety Devices',
  detecting: 'Safety Devices',
  detected: 'Safety Devices',
  gasdetector: 'Safety Devices',
  gasdetectors: 'Safety Devices',
  smokedetector: 'Safety Devices',
  smokedetectors: 'Safety Devices',
  sensor: 'Safety Devices',
  sensors: 'Safety Devices',
  sensing: 'Safety Devices',
  sensored: 'Safety Devices',
  interlock: 'Safety Devices',
  interlocks: 'Safety Devices',
  interlocked: 'Safety Devices',
  interlocking: 'Safety Devices',
  interlocker: 'Safety Devices',
  safetyinterlock: 'Safety Devices',
  failsafe: 'Safety Devices',
  failsafes: 'Safety Devices',
  failsafed: 'Safety Devices',
  estop: 'Safety Devices',
  estops: 'Safety Devices',
  emergencystop: 'Safety Devices',
  emergencystops: 'Safety Devices',
  shutoff: 'Safety Devices',
  shutoffs: 'Safety Devices',
  autoshutoff: 'Safety Devices',
  cutoff: 'Safety Devices',
  cutoffs: 'Safety Devices',
  tripwire: 'Safety Devices',
  tripwires: 'Safety Devices',
  lightcurtain: 'Safety Devices',
  lightcurtains: 'Safety Devices',
  pressuremat: 'Safety Devices',
  pressuremats: 'Safety Devices',

  // Emergency Preparedness (50+)
  emergency: 'Emergency Preparedness',
  emergencies: 'Emergency Preparedness',
  emergancy: 'Emergency Preparedness',
  emergancys: 'Emergency Preparedness',
  emergencys: 'Emergency Preparedness',
  emergncy: 'Emergency Preparedness',
  emergeny: 'Emergency Preparedness',
  nonemergency: 'Emergency Preparedness',
  evacuation: 'Emergency Preparedness',
  evacuations: 'Emergency Preparedness',
  evacuate: 'Emergency Preparedness',
  evacuated: 'Emergency Preparedness',
  evacuating: 'Emergency Preparedness',
  evacuee: 'Emergency Preparedness',
  evacuees: 'Emergency Preparedness',
  evacation: 'Emergency Preparedness',
  evaucation: 'Emergency Preparedness',
  muster: 'Emergency Preparedness',
  musters: 'Emergency Preparedness',
  mustering: 'Emergency Preparedness',
  mustered: 'Emergency Preparedness',
  musterpoint: 'Emergency Preparedness',
  musterpoints: 'Emergency Preparedness',
  musterstation: 'Emergency Preparedness',
  musterstations: 'Emergency Preparedness',
  assembly: 'Emergency Preparedness',
  assemblys: 'Emergency Preparedness',
  assemblypoint: 'Emergency Preparedness',
  assemblypoints: 'Emergency Preparedness',
  assemblyarea: 'Emergency Preparedness',
  assemblyareas: 'Emergency Preparedness',
  firstaid: 'Emergency Preparedness',
  firstaids: 'Emergency Preparedness',
  firstaider: 'Emergency Preparedness',
  firstaiders: 'Emergency Preparedness',
  firstaidkit: 'Emergency Preparedness',
  firstaidkits: 'Emergency Preparedness',
  extinguisher: 'Emergency Preparedness',
  extinguishers: 'Emergency Preparedness',
  extinguisher: 'Emergency Preparedness',
  extingusher: 'Emergency Preparedness',
  fireextinguisher: 'Emergency Preparedness',
  fireextinguishers: 'Emergency Preparedness',
  rescue: 'Emergency Preparedness',
  rescues: 'Emergency Preparedness',
  rescuer: 'Emergency Preparedness',
  rescuers: 'Emergency Preparedness',
  rescuing: 'Emergency Preparedness',
  rescued: 'Emergency Preparedness',
  rescueteam: 'Emergency Preparedness',
  rescueteams: 'Emergency Preparedness',
  ert: 'Emergency Preparedness',
  emergencyresponse: 'Emergency Preparedness',
  emergencyresponseteam: 'Emergency Preparedness',
  drill: 'Emergency Preparedness',
  drills: 'Emergency Preparedness',
  firedrill: 'Emergency Preparedness',
  firedrills: 'Emergency Preparedness',

  // Leadership (50+)
  leadership: 'Leadership',
  leaderships: 'Leadership',
  leader: 'Leadership',
  leaders: 'Leadership',
  leading: 'Leadership',
  leadrship: 'Leadership',
  leadeship: 'Leadership',
  leardership: 'Leadership',
  poorleadership: 'Leadership',
  lackleadership: 'Leadership',
  management: 'Leadership',
  managements: 'Leadership',
  manager: 'Leadership',
  managers: 'Leadership',
  managing: 'Leadership',
  managment: 'Leadership',
  managemnt: 'Leadership',
  managerial: 'Leadership',
  mismanagement: 'Leadership',
  mismanaged: 'Leadership',
  accountability: 'Leadership',
  accountabilities: 'Leadership',
  accountable: 'Leadership',
  unaccountable: 'Leadership',
  accountablity: 'Leadership',
  responsible: 'Leadership',
  responsibility: 'Leadership',
  responsibilities: 'Leadership',
  irresponsible: 'Leadership',
  responsibilty: 'Leadership',
  responsable: 'Leadership',
  superintendent: 'Leadership',
  superintendents: 'Leadership',
  superintendant: 'Leadership',
  superintendants: 'Leadership',
  director: 'Leadership',
  directors: 'Leadership',
  directorship: 'Leadership',
  executive: 'Leadership',
  executives: 'Leadership',
  ownership: 'Leadership',
  ownerships: 'Leadership',
  commitment: 'Leadership',
  commitments: 'Leadership',
  committed: 'Leadership',
  uncommitted: 'Leadership',
  comitment: 'Leadership',
  commitent: 'Leadership',
  governance: 'Leadership',
  governances: 'Leadership',
  stewardship: 'Leadership',

  // Maintenance (50+)
  maintenance: 'Maintenance',
  maintenace: 'Maintenance',
  maintainance: 'Maintenance',
  maintainence: 'Maintenance',
  maintenence: 'Maintenance',
  maintanance: 'Maintenance',
  maintnance: 'Maintenance',
  maintain: 'Maintenance',
  maintained: 'Maintenance',
  unmaintained: 'Maintenance',
  maintaining: 'Maintenance',
  maintainer: 'Maintenance',
  maintainers: 'Maintenance',
  poorlymaintained: 'Maintenance',
  wellmaintained: 'Maintenance',
  repair: 'Maintenance',
  repairs: 'Maintenance',
  repaired: 'Maintenance',
  repairing: 'Maintenance',
  unrepaired: 'Maintenance',
  repairable: 'Maintenance',
  unrepairable: 'Maintenance',
  repairman: 'Maintenance',
  repairmen: 'Maintenance',
  broken: 'Maintenance',
  brokenn: 'Maintenance',
  broked: 'Maintenance',
  defective: 'Maintenance',
  defect: 'Maintenance',
  defects: 'Maintenance',
  defected: 'Maintenance',
  nondefective: 'Maintenance',
  malfunction: 'Maintenance',
  malfunctions: 'Maintenance',
  malfunctioned: 'Maintenance',
  malfunctioning: 'Maintenance',
  malfonction: 'Maintenance',
  faulty: 'Maintenance',
  faultiness: 'Maintenance',
  fault: 'Maintenance',
  faults: 'Maintenance',
  faulted: 'Maintenance',
  nonfaulty: 'Maintenance',
  preventive: 'Maintenance',
  preventative: 'Maintenance',
  corrective: 'Maintenance',
  predictive: 'Maintenance',
  scheduled: 'Maintenance',
  unscheduled: 'Maintenance',
  breakdown: 'Maintenance',
  breakdowns: 'Maintenance',

  // Material Handling (50+)
  material: 'Material Handling',
  materials: 'Material Handling',
  materialhandling: 'Material Handling',
  materialshandling: 'Material Handling',
  matrial: 'Material Handling',
  matrials: 'Material Handling',
  handling: 'Material Handling',
  handled: 'Material Handling',
  handler: 'Material Handling',
  handlers: 'Material Handling',
  mishandled: 'Material Handling',
  mishandling: 'Material Handling',
  manualhandling: 'Material Handling',
  safehandling: 'Material Handling',
  lifting: 'Material Handling',
  lifted: 'Material Handling',
  lifts: 'Material Handling',
  lifter: 'Material Handling',
  lifters: 'Material Handling',
  heavylifting: 'Material Handling',
  manuallifting: 'Material Handling',
  rigging: 'Material Handling',
  rigged: 'Material Handling',
  rigger: 'Material Handling',
  riggers: 'Material Handling',
  riging: 'Material Handling',
  sling: 'Material Handling',
  slings: 'Material Handling',
  slinging: 'Material Handling',
  slinged: 'Material Handling',
  slinger: 'Material Handling',
  slingers: 'Material Handling',
  load: 'Material Handling',
  loads: 'Material Handling',
  loaded: 'Material Handling',
  loading: 'Material Handling',
  loader: 'Material Handling',
  loaders: 'Material Handling',
  unloading: 'Material Handling',
  unloaded: 'Material Handling',
  overloaded: 'Material Handling',
  overloading: 'Material Handling',
  underloaded: 'Material Handling',
  stacking: 'Material Handling',
  stacked: 'Material Handling',
  stacker: 'Material Handling',
  stackers: 'Material Handling',
  unstacking: 'Material Handling',
  storage: 'Material Handling',
  storages: 'Material Handling',
  stored: 'Material Handling',
  storing: 'Material Handling',
  hoist: 'Material Handling',
  hoists: 'Material Handling',
  hoisting: 'Material Handling',
  hoisted: 'Material Handling',

  // No Authorization (50+)
  authorization: 'No Authorization',
  authorizations: 'No Authorization',
  authorize: 'No Authorization',
  authorized: 'No Authorization',
  unauthorized: 'No Authorization',
  authorizing: 'No Authorization',
  authorisation: 'No Authorization',
  authorisations: 'No Authorization',
  authorising: 'No Authorization',
  authorised: 'No Authorization',
  unauthorised: 'No Authorization',
  authorise: 'No Authorization',
  authorizaton: 'No Authorization',
  authoriztion: 'No Authorization',
  autherization: 'No Authorization',
  reauthorized: 'No Authorization',
  reauthorised: 'No Authorization',
  preauthorized: 'No Authorization',
  preauthorised: 'No Authorization',
  permission: 'No Authorization',
  permissions: 'No Authorization',
  permitted: 'No Authorization',
  unpermitted: 'No Authorization',
  permissible: 'No Authorization',
  impermissible: 'No Authorization',
  permision: 'No Authorization',
  permisions: 'No Authorization',
  nopermission: 'No Authorization',
  withoutpermission: 'No Authorization',
  restricted: 'No Authorization',
  restriction: 'No Authorization',
  restrictions: 'No Authorization',
  unrestricted: 'No Authorization',
  restricting: 'No Authorization',
  access: 'No Authorization',
  accessed: 'No Authorization',
  accessing: 'No Authorization',
  accessible: 'No Authorization',
  inaccessible: 'No Authorization',
  noaccess: 'No Authorization',
  accessdenied: 'No Authorization',
  approval: 'No Authorization',
  approvals: 'No Authorization',
  approved: 'No Authorization',
  unapproved: 'No Authorization',
  disapproved: 'No Authorization',
  approving: 'No Authorization',
  reapproved: 'No Authorization',
  preapproved: 'No Authorization',
  noapproval: 'No Authorization',
  withoutapproval: 'No Authorization',

  // Machine Guarding (50+)
  guarding: 'Machine Guarding',
  guard: 'Machine Guarding',
  guards: 'Machine Guarding',
  guarded: 'Machine Guarding',
  unguarded: 'Machine Guarding',
  guardings: 'Machine Guarding',
  reguarded: 'Machine Guarding',
  safetygaurd: 'Machine Guarding',
  safetygaurds: 'Machine Guarding',
  safetyguard: 'Machine Guarding',
  safetyguards: 'Machine Guarding',
  machineguard: 'Machine Guarding',
  machineguards: 'Machine Guarding',
  machineguarding: 'Machine Guarding',
  beltguard: 'Machine Guarding',
  beltguards: 'Machine Guarding',
  shaftguard: 'Machine Guarding',
  shaftguards: 'Machine Guarding',
  machinery: 'Machine Guarding',
  machinerys: 'Machine Guarding',
  machinary: 'Machine Guarding',
  machine: 'Machine Guarding',
  machines: 'Machine Guarding',
  machining: 'Machine Guarding',
  machinry: 'Machine Guarding',
  rotating: 'Machine Guarding',
  rotational: 'Machine Guarding',
  rotation: 'Machine Guarding',
  rotations: 'Machine Guarding',
  rotatingparts: 'Machine Guarding',
  pinchpoint: 'Machine Guarding',
  pinchpoints: 'Machine Guarding',
  pinch: 'Machine Guarding',
  pinched: 'Machine Guarding',
  nippoint: 'Machine Guarding',
  nippoints: 'Machine Guarding',
  nip: 'Machine Guarding',
  nipped: 'Machine Guarding',
  crushpoint: 'Machine Guarding',
  crushpoints: 'Machine Guarding',
  crush: 'Machine Guarding',
  crushed: 'Machine Guarding',
  crushing: 'Machine Guarding',
  entanglement: 'Machine Guarding',
  entanglements: 'Machine Guarding',
  entangled: 'Machine Guarding',
  entangling: 'Machine Guarding',
  movingparts: 'Machine Guarding',
  movingpart: 'Machine Guarding',
  exposedparts: 'Machine Guarding',
  exposedpart: 'Machine Guarding',

  // Procurement (50+)
  procurement: 'Procurement',
  procurements: 'Procurement',
  procure: 'Procurement',
  procured: 'Procurement',
  procuring: 'Procurement',
  procurment: 'Procurement',
  procuremnt: 'Procurement',
  procurment: 'Procurement',
  purchase: 'Procurement',
  purchases: 'Procurement',
  purchased: 'Procurement',
  purchasing: 'Procurement',
  purchaser: 'Procurement',
  purchasers: 'Procurement',
  purchace: 'Procurement',
  purchaces: 'Procurement',
  supplier: 'Procurement',
  suppliers: 'Procurement',
  supplying: 'Procurement',
  supplied: 'Procurement',
  supply: 'Procurement',
  supplies: 'Procurement',
  supplychain: 'Procurement',
  supplychains: 'Procurement',
  vendor: 'Procurement',
  vendors: 'Procurement',
  vendoring: 'Procurement',
  vendored: 'Procurement',
  vender: 'Procurement',
  venders: 'Procurement',
  contractor: 'Procurement',
  contractors: 'Procurement',
  contracting: 'Procurement',
  contracted: 'Procurement',
  contractr: 'Procurement',
  subcontractor: 'Procurement',
  subcontractors: 'Procurement',
  subcontracting: 'Procurement',
  subcontracted: 'Procurement',
  subbie: 'Procurement',
  subbies: 'Procurement',
  sourcing: 'Procurement',
  sourced: 'Procurement',
  outsourcing: 'Procurement',
  outsourced: 'Procurement',
  specification: 'Procurement',
  specifications: 'Procurement',
  specs: 'Procurement',
  tender: 'Procurement',
  tenders: 'Procurement',
  tendering: 'Procurement',

  // Testing (50+)
  testing: 'Testing',
  test: 'Testing',
  tests: 'Testing',
  tested: 'Testing',
  untested: 'Testing',
  tester: 'Testing',
  testers: 'Testing',
  testng: 'Testing',
  testin: 'Testing',
  retest: 'Testing',
  retested: 'Testing',
  retesting: 'Testing',
  retests: 'Testing',
  pretest: 'Testing',
  pretested: 'Testing',
  pretesting: 'Testing',
  pretests: 'Testing',
  posttest: 'Testing',
  posttested: 'Testing',
  calibration: 'Testing',
  calibrations: 'Testing',
  calibrate: 'Testing',
  calibrated: 'Testing',
  uncalibrated: 'Testing',
  calibrating: 'Testing',
  recalibrated: 'Testing',
  recalibration: 'Testing',
  recalibrating: 'Testing',
  miscalibrated: 'Testing',
  miscalibration: 'Testing',
  calibraton: 'Testing',
  calibrater: 'Testing',
  validation: 'Testing',
  validations: 'Testing',
  validate: 'Testing',
  validated: 'Testing',
  unvalidated: 'Testing',
  validating: 'Testing',
  revalidated: 'Testing',
  revalidation: 'Testing',
  invalidated: 'Testing',
  commissioning: 'Testing',
  commissioned: 'Testing',
  decommissioned: 'Testing',
  decommissioning: 'Testing',
  recommissioned: 'Testing',
  recommissioning: 'Testing',
  precommissioning: 'Testing',
  precommissioned: 'Testing',
  functiontest: 'Testing',
  functiontests: 'Testing',
  functiontesting: 'Testing',

  // Excavation & Trenching (100+)
  // Shoring and support
  // Slope and benching
  // Cave-in and collapse
  // Trench walls and sides
  // Spoil and material piles
  // Dewatering
  // Access to excavation
  // Soil types and conditions
  // Excavation depth
  // Edge and perimeter
  // Protective measures

  // Traffic Management (additional keywords)
  // Pedestrian
  // Speed limits
  // Traffic signals
  // Bunds and berms for traffic
  // Tower lights
  // Safety poles
  // Parking
  // Road conditions

  // Electrical Safety (additional keywords)
  // Power tools and disconnection
  // Wires and cables
  // Switches
  // Electric shock
  // Damaged electrical
  // Compressor hoses and whip

  // Confined Space (additional keywords)
  // Manholes
  // Fall prevention
  // Entry and exclusion
  // Covers

  // Access (additional keywords)
  // Stairs and steps
  // Bridges and improvised access
  // Blocked access
  // Egress
  // Pits and openings
  // Anchor bolts and trip hazards
  // Material blocking
  blockingaccessways: 'Access'
}

// ============================================================================
// OBSERVATION TYPE CONSTANTS
// ============================================================================

// Match the actual types after settingsReader.js type mapping is applied
export const NEGATIVE_TYPES = [
  'Near Miss',        // Note: space, not hyphen (mapped from 'Near-Miss', 'Near Hit')
  'Near-Miss',        // Keep for backwards compatibility with unmapped data
  'FAC',              // First Aid Case (mapped from 'First Aid', 'First Aid Case')
  'MTI',              // Medical Treatment Injury (mapped from 'Medical Treatment')
  'LTI',              // Lost Time Injury (mapped from 'Lost Time', 'Lost Time Injury')
  'Unsafe Act',       // Mapped from 'Unsafe Action', 'Unsafe Behavior'
  'Unsafe Condition', // Mapped from 'Hazard'
  'Environmental',
  'Property Damage',
  'Incident',         // Common type in raw data
  'Accident',         // Common type in raw data
  'Injury',           // Common type in raw data
  'Hazard',           // Before mapping
  'Near Hit'          // Before mapping
]

export const POSITIVE_TYPES = [
  'Positive Observation', // Primary positive type (mapped from 'Good Catch', 'Positive', 'Safe Act')
  'Safe Act',             // Before mapping
  'Safe Condition',
  'Good Practice',
  'Good Catch',           // Before mapping
  'Positive',             // Before mapping
  'Commendation',
  'Recognition',
  'Best Practice'
]

/**
 * Check if a type is a positive observation type
 * Uses case-insensitive partial matching for robustness
 * @param {string} type - The observation type to check
 * @returns {boolean} True if the type is positive
 */
export const isPositiveType = (type) => {
  if (!type) return false
  const typeLower = type.toLowerCase().trim()

  // Check exact matches first
  if (POSITIVE_TYPES.some(pt => pt.toLowerCase() === typeLower)) {
    return true
  }

  // Check partial matches for common positive indicators
  const positiveIndicators = ['positive', 'safe act', 'safe condition', 'good practice', 'good catch', 'commend', 'recognition', 'best practice']
  return positiveIndicators.some(indicator => typeLower.includes(indicator))
}

// ============================================================================
// OBSERVATION TYPE STATISTICS
// ============================================================================

/**
 * Get observation type statistics for a specific hazard
 * @param {Array} incidents - Array of incident objects
 * @param {string} hazardName - Name of the hazard to filter by
 * @returns {Object} Statistics object with positive/negative counts
 */
export const getObservationTypeStats = (incidents, hazardName) => {
  if (!incidents || !hazardName) {
    return { total: 0, positive: { count: 0, percentage: '0' }, negative: { count: 0, percentage: '0' } }
  }

  const hazardIncidents = filterByHazard(incidents, hazardName)
  const total = hazardIncidents.length

  if (total === 0) {
    return { total: 0, positive: { count: 0, percentage: '0' }, negative: { count: 0, percentage: '0' } }
  }

  const positiveCount = hazardIncidents.filter(i => POSITIVE_TYPES.includes(i.type)).length
  const negativeCount = hazardIncidents.filter(i => NEGATIVE_TYPES.includes(i.type)).length

  return {
    total,
    positive: {
      count: positiveCount,
      percentage: ((positiveCount / total) * 100).toFixed(1)
    },
    negative: {
      count: negativeCount,
      percentage: ((negativeCount / total) * 100).toFixed(1)
    }
  }
}

/**
 * Aggregate root causes for a specific hazard (simplified version)
 * Returns basic counts without factor detection
 * @param {Array} incidents - Array of incident objects
 * @param {string} hazardName - Name of the hazard
 * @param {string} observationType - 'positive' or 'negative'
 * @returns {Object} Aggregated data
 */
export const aggregateRootCausesForHazard = (incidents, hazardName, observationType = 'negative') => {
  if (!incidents || !hazardName) {
    return { total: 0, breakdown: [] }
  }

  const hazardIncidents = filterByHazard(incidents, hazardName)
  const typeList = observationType === 'positive' ? POSITIVE_TYPES : NEGATIVE_TYPES
  const filteredIncidents = hazardIncidents.filter(i => typeList.includes(i.type))

  return {
    total: filteredIncidents.length,
    breakdown: [],
    incidents: filteredIncidents
  }
}

// ============================================================================
// PHRASE-BASED DETECTION FUNCTIONS
// ============================================================================

/**
 * Calculate factor score by matching phrases in text
 * @param {string} text - Normalized text (lowercase)
 * @param {Object} config - Factor configuration from FACTOR_PHRASE_CONFIG
 * @returns {Object} { score: number, strongMatches: string[], moderateMatches: string[], exclusionMatches: string[] }
 */
const calculateFactorScore = (text, config) => {
  let score = 0
  const strongMatches = []
  const moderateMatches = []
  const exclusionMatches = []

  // Check strong patterns (+10 each)
  if (config.strongPatterns) {
    for (const pattern of config.strongPatterns) {
      if (text.includes(pattern)) {
        score += 10
        strongMatches.push(pattern)
      }
    }
  }

  // Check moderate patterns (+5 each) - only if no strong matches to avoid double counting
  if (config.moderatePatterns && strongMatches.length === 0) {
    for (const pattern of config.moderatePatterns) {
      if (text.includes(pattern)) {
        score += 5
        moderateMatches.push(pattern)
      }
    }
  }

  // Check exclusion patterns (-5 each, requires 2+ to significantly impact score)
  // Reduced from -15 to -5 to prevent single false-positive exclusion from hiding valid factors
  if (config.exclusionPatterns) {
    for (const pattern of config.exclusionPatterns) {
      if (text.includes(pattern)) {
        score -= 5
        exclusionMatches.push(pattern)
      }
    }
  }

  return { score, strongMatches, moderateMatches, exclusionMatches }
}

/**
 * Check if text matches any global exclusion patterns
 * @param {string} text - Normalized text (lowercase)
 * @returns {string[]} Array of matched exclusion patterns
 */
const checkGlobalExclusions = (text) => {
  const matches = []
  for (const pattern of GLOBAL_EXCLUSIONS) {
    if (text.includes(pattern)) {
      matches.push(pattern)
    }
  }
  return matches
}

/**
 * Detect contributing factors from description text using phrase-based matching
 * Scans the FULL text (not just first N words) for meaningful phrases
 *
 * @param {string} description - Observation description
 * @param {string} hazardCategory - Optional: hazard category (used for context, not filtering)
 * @param {Object} options - Optional configuration
 * @param {boolean} options.returnScores - Return detailed scores (default: false)
 * @returns {Array} Array of matched factor display names
 */
export const detectContributingFactors = (description, hazardCategory = null, options = {}) => {
  if (!description || typeof description !== 'string') {
    return []
  }

  // Normalize text for matching (lowercase, trim extra spaces)
  const normalizedText = description.toLowerCase().replace(/\s+/g, ' ').trim()

  // Check global exclusions first - if matched, return empty (not a valid observation for any factor)
  const globalExclusions = checkGlobalExclusions(normalizedText)
  if (globalExclusions.length > 0) {
    return []
  }

  const matchedFactors = []

  // Check each factor against the text
  for (const [factorName, config] of Object.entries(FACTOR_PHRASE_CONFIG)) {
    const result = calculateFactorScore(normalizedText, config)
    const threshold = config.minimumScore || 5

    if (result.score >= threshold) {
      matchedFactors.push({
        name: factorName,
        score: result.score,
        strongMatches: result.strongMatches,
        moderateMatches: result.moderateMatches,
        exclusionMatches: result.exclusionMatches
      })
    }
  }

  // Sort by score (highest first) and return names
  matchedFactors.sort((a, b) => b.score - a.score)

  if (options.returnScores) {
    return matchedFactors
  }

  return matchedFactors.map(f => f.name)
}

/**
 * Detect contributing factors with detailed scoring results
 * Useful for debugging and understanding why factors were included/excluded
 *
 * @param {string} description - Observation description
 * @param {string} hazardCategory - Hazard category (used for context)
 * @returns {Object} { factors: string[], candidates: Object[], excluded: Object[], globalExclusions: string[] }
 */
export const detectContributingFactorsWithDetails = (description, hazardCategory = null) => {
  if (!description || typeof description !== 'string') {
    return { factors: [], candidates: [], excluded: [], globalExclusions: [] }
  }

  // Normalize text for matching
  const normalizedText = description.toLowerCase().replace(/\s+/g, ' ').trim()

  // Check global exclusions
  const globalExclusions = checkGlobalExclusions(normalizedText)
  if (globalExclusions.length > 0) {
    return {
      factors: [],
      candidates: [],
      excluded: Object.keys(FACTOR_PHRASE_CONFIG).map(f => ({
        factor: f,
        score: 0,
        reason: 'global_exclusion',
        exclusionMatches: globalExclusions
      })),
      globalExclusions
    }
  }

  const validated = []
  const excluded = []

  // Check each factor
  for (const [factorName, config] of Object.entries(FACTOR_PHRASE_CONFIG)) {
    const result = calculateFactorScore(normalizedText, config)
    const threshold = config.minimumScore || 5

    const factorResult = {
      factor: factorName,
      score: result.score,
      threshold,
      strongMatches: result.strongMatches,
      moderateMatches: result.moderateMatches,
      exclusionMatches: result.exclusionMatches
    }

    if (result.score >= threshold) {
      factorResult.reason = 'score_met_threshold'
      validated.push(factorResult)
    } else if (result.score > 0) {
      factorResult.reason = 'score_below_threshold'
      excluded.push(factorResult)
    } else if (result.exclusionMatches.length > 0) {
      factorResult.reason = 'excluded_by_pattern'
      excluded.push(factorResult)
    }
    // Skip factors with score 0 and no exclusions (no match at all)
  }

  // Sort validated by score
  validated.sort((a, b) => b.score - a.score)

  return {
    factors: validated.map(v => v.factor),
    candidates: validated,
    excluded: excluded,
    globalExclusions: []
  }
}

/**
 * Detect phrases in text and return matched phrases with their positions
 * Used for highlighting matched phrases in drill-down views
 *
 * @param {string} description - Observation description
 * @param {string} factorName - Optional: filter to only phrases for this factor
 * @param {string} hazardCategory - Optional: hazard category (for context)
 * @returns {Object} { factors: string[], matches: Array<{phrase: string, factor: string, type: string, start: number, end: number}>, validatedFactors: string[] }
 */
export const detectKeywordsInText = (description, factorName = null, hazardCategory = null) => {
  if (!description || typeof description !== 'string') {
    return { factors: [], matches: [], validatedFactors: [] }
  }

  const matches = []
  const factors = new Set()
  const normalizedText = description.toLowerCase()

  // Get factors to check
  const factorsToCheck = factorName
    ? { [factorName]: FACTOR_PHRASE_CONFIG[factorName] }
    : FACTOR_PHRASE_CONFIG

  // Find all phrase matches
  for (const [factor, config] of Object.entries(factorsToCheck)) {
    if (!config) continue

    // Check strong patterns
    if (config.strongPatterns) {
      for (const phrase of config.strongPatterns) {
        let searchIndex = 0
        let foundIndex
        while ((foundIndex = normalizedText.indexOf(phrase, searchIndex)) !== -1) {
          factors.add(factor)
          matches.push({
            phrase: description.substring(foundIndex, foundIndex + phrase.length),
            normalizedPhrase: phrase,
            factor: factor,
            type: 'strong',
            start: foundIndex,
            end: foundIndex + phrase.length
          })
          searchIndex = foundIndex + 1
        }
      }
    }

    // Check moderate patterns (only if we want to highlight them too)
    if (config.moderatePatterns) {
      for (const phrase of config.moderatePatterns) {
        // Skip single-word patterns that are too generic
        if (phrase.length < 4) continue
        let searchIndex = 0
        let foundIndex
        while ((foundIndex = normalizedText.indexOf(phrase, searchIndex)) !== -1) {
          // Check if not already matched by strong pattern
          const alreadyMatched = matches.some(m =>
            m.factor === factor && foundIndex >= m.start && foundIndex < m.end
          )
          if (!alreadyMatched) {
            factors.add(factor)
            matches.push({
              phrase: description.substring(foundIndex, foundIndex + phrase.length),
              normalizedPhrase: phrase,
              factor: factor,
              type: 'moderate',
              start: foundIndex,
              end: foundIndex + phrase.length
            })
          }
          searchIndex = foundIndex + 1
        }
      }
    }
  }

  // Get validated factors using phrase-based detection
  const validatedFactors = detectContributingFactors(description, hazardCategory)

  // Mark matches as valid based on factor validation
  for (const m of matches) {
    m.isValid = validatedFactors.includes(m.factor)
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start)

  return {
    factors: Array.from(factors),
    validatedFactors: validatedFactors,
    matches: matches
  }
}

/**
 * Get all phrases/keywords for a specific factor
 * Returns both strong and moderate patterns for highlighting
 * @param {string} factorName - Factor name (e.g., "PPE", "Training")
 * @returns {string[]} Array of phrases that indicate this factor
 */
export const getKeywordsForFactor = (factorName) => {
  if (!factorName) return []

  const config = FACTOR_PHRASE_CONFIG[factorName]
  if (!config) {
    // Fallback to legacy keywords if factor not in phrase config
    return Object.entries(FACTOR_KEYWORDS)
      .filter(([_, factor]) => factor === factorName)
      .map(([keyword, _]) => keyword)
  }

  // Combine strong and moderate patterns
  const phrases = []
  if (config.strongPatterns) {
    phrases.push(...config.strongPatterns)
  }
  if (config.moderatePatterns) {
    phrases.push(...config.moderatePatterns)
  }

  // Return unique phrases
  return [...new Set(phrases)]
}

/**
 * Aggregate contributing factors across all incidents
 * Uses hazard-specific validation rules for accurate factor detection
 *
 * @param {Array} incidents - Array of incidents
 * @param {string} observationType - 'positive', 'negative', or null (optional filter)
 * @param {Object} options - Optional configuration
 * @param {boolean} options.useValidation - Apply hazard-specific validation (default: true)
 * @param {boolean} options.trackExcluded - Track excluded factors for debugging (default: false)
 * @returns {Object} Aggregated factor data with counts and hazard breakdowns
 */
export const aggregateContributingFactors = (incidents, observationType = null, options = {}) => {
  if (!incidents || incidents.length === 0) {
    return {
      byFactor: [],
      analyzed: 0,
      total: 0
    }
  }

  const { useValidation = true, trackExcluded = false } = options

  // Optionally filter by observation type
  // For 'negative': EXCLUDE positive types (more inclusive approach)
  // For 'positive': INCLUDE only positive types
  let filteredIncidents = incidents
  if (observationType === 'negative') {
    // Exclude positive observations - this is more inclusive than requiring specific negative types
    filteredIncidents = incidents.filter(i => !isPositiveType(i.type))
  } else if (observationType === 'positive') {
    filteredIncidents = incidents.filter(i => isPositiveType(i.type))
  }

  // Track factors with counts and hazard breakdowns
  const factorMap = {}
  const excludedMap = trackExcluded ? {} : null

  // Track unclassified incidents (no factors detected)
  const unclassifiedIncidents = []

  for (const incident of filteredIncidents) {
    // Get hazard category for validation
    const hazardCategory = useValidation ? getHazardCategory(incident) : null

    // Detect factors with hazard-specific validation
    const factors = detectContributingFactors(incident.description, hazardCategory)

    // Track incidents with no factors detected as "Unclassified"
    if (factors.length === 0) {
      unclassifiedIncidents.push(incident)
    }

    for (const factor of factors) {
      if (!factorMap[factor]) {
        factorMap[factor] = {
          name: factor,
          count: 0,
          hazards: {},
          incidents: []
        }
      }

      factorMap[factor].count++
      factorMap[factor].incidents.push(incident)

      // Track hazard distribution
      const hazard = incident.location || 'Unknown'
      if (!factorMap[factor].hazards[hazard]) {
        factorMap[factor].hazards[hazard] = 0
      }
      factorMap[factor].hazards[hazard]++
    }

    // Optionally track excluded factors for debugging
    if (trackExcluded) {
      const details = detectContributingFactorsWithDetails(incident.description, hazardCategory)
      for (const excluded of details.excluded) {
        if (!excludedMap[excluded.factor]) {
          excludedMap[excluded.factor] = {
            name: excluded.factor,
            count: 0,
            reasons: {},
            examples: []
          }
        }
        excludedMap[excluded.factor].count++
        const reason = excluded.reason || 'score_below_threshold'
        excludedMap[excluded.factor].reasons[reason] = (excludedMap[excluded.factor].reasons[reason] || 0) + 1
        if (excludedMap[excluded.factor].examples.length < 3) {
          excludedMap[excluded.factor].examples.push({
            description: incident.description.substring(0, 100) + '...',
            reason: reason,
            score: excluded.score,
            threshold: excluded.threshold,
            exclusionMatches: excluded.exclusionMatches
          })
        }
      }
    }
  }

  // Convert to array and sort by count
  const byFactor = Object.values(factorMap)
    .map(f => ({
      ...f,
      // Calculate percentage of total analyzed incidents
      percentage: filteredIncidents.length > 0
        ? (f.count / filteredIncidents.length) * 100
        : 0,
      hazardBreakdown: Object.entries(f.hazards)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    }))
    .sort((a, b) => b.count - a.count)

  // Add "Unclassified" factor for observations with no detected factors
  if (unclassifiedIncidents.length > 0) {
    // Build hazard breakdown for unclassified incidents
    const unclassifiedHazards = {}
    for (const incident of unclassifiedIncidents) {
      const hazard = incident.location || 'Unknown'
      unclassifiedHazards[hazard] = (unclassifiedHazards[hazard] || 0) + 1
    }

    byFactor.push({
      name: 'Unclassified',
      count: unclassifiedIncidents.length,
      percentage: filteredIncidents.length > 0
        ? (unclassifiedIncidents.length / filteredIncidents.length) * 100
        : 0,
      hazards: unclassifiedHazards,
      incidents: unclassifiedIncidents,
      hazardBreakdown: Object.entries(unclassifiedHazards)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      isUnclassified: true // Flag to identify this special factor
    })
  }

  const result = {
    byFactor,
    analyzed: filteredIncidents.length,
    total: incidents.length,
    unclassifiedCount: unclassifiedIncidents.length
  }

  // Include excluded factors if tracking enabled
  if (trackExcluded && excludedMap) {
    result.excludedFactors = Object.values(excludedMap).sort((a, b) => b.count - a.count)
  }

  return result
}

/**
 * Detect contributing factors for a specific hazard
 * Uses hazard-specific validation rules for the specified hazard
 *
 * @param {Array} incidents - Array of incidents
 * @param {string} hazardName - Name of the hazard to filter by
 * @param {Object} options - Optional configuration
 * @param {boolean} options.useValidation - Apply hazard-specific validation (default: true)
 * @returns {Array} Array of factor objects with name and count
 */
export const detectFactorsForHazard = (incidents, hazardName, options = {}) => {
  if (!incidents || !hazardName) {
    return []
  }

  const { useValidation = true } = options

  // Filter incidents for this hazard
  const hazardIncidents = filterByHazard(incidents, hazardName)

  if (hazardIncidents.length === 0) {
    return []
  }

  // Track factor counts
  const factorCounts = {}

  for (const incident of hazardIncidents) {
    // Use hazard-specific validation when enabled
    const hazardCategory = useValidation ? hazardName : null
    const factors = detectContributingFactors(incident.description, hazardCategory)

    for (const factor of factors) {
      if (!factorCounts[factor]) {
        factorCounts[factor] = 0
      }
      factorCounts[factor]++
    }
  }

  // Convert to array and sort by count
  return Object.entries(factorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get incidents for a specific factor within a hazard category
 * Applies hazard-specific validation to ensure accurate results
 *
 * @param {Array} incidents - Array of incidents
 * @param {string} hazardName - Name of the hazard to filter by
 * @param {string} factorName - Name of the factor to filter by
 * @param {Object} options - Optional configuration
 * @param {boolean} options.useValidation - Apply hazard-specific validation (default: true)
 * @returns {Array} Array of incident objects matching the criteria
 */
export const getIncidentsForHazardFactor = (incidents, hazardName, factorName, options = {}) => {
  if (!incidents || !hazardName || !factorName) {
    return []
  }

  const { useValidation = true } = options

  // Filter incidents for this hazard
  const hazardIncidents = filterByHazard(incidents, hazardName)

  // Filter to incidents with this factor (with validation)
  return hazardIncidents.filter(incident => {
    const hazardCategory = useValidation ? hazardName : null
    const factors = detectContributingFactors(incident.description, hazardCategory)
    return factors.includes(factorName)
  })
}

/**
 * Debug utility: Analyze why observations are being included/excluded for a factor
 * Useful for tuning validation rules
 *
 * @param {Array} incidents - Array of incidents
 * @param {string} hazardName - Name of the hazard
 * @param {string} factorName - Name of the factor to analyze
 * @returns {Object} Analysis results with included, excluded, and statistics
 */
export const analyzeFactorDetection = (incidents, hazardName, factorName) => {
  if (!incidents || !hazardName || !factorName) {
    return { included: [], excluded: [], stats: {} }
  }

  const hazardIncidents = filterByHazard(incidents, hazardName)
  const included = []
  const excluded = []

  for (const incident of hazardIncidents) {
    const details = detectContributingFactorsWithDetails(incident.description, hazardName)

    // Check if this factor was detected at all (before validation)
    const wasCandidate = details.candidates.some(c => c.factor === factorName) ||
                         details.excluded.some(e => e.factor === factorName)

    if (!wasCandidate) continue

    const isIncluded = details.factors.includes(factorName)
    const excludedInfo = details.excluded.find(e => e.factor === factorName)

    if (isIncluded) {
      included.push({
        description: incident.description,
        id: incident.id || incident._id
      })
    } else if (excludedInfo) {
      excluded.push({
        description: incident.description,
        id: incident.id || incident._id,
        reason: excludedInfo.validation.reason,
        matchedPattern: excludedInfo.validation.matchedPattern
      })
    }
  }

  // Group excluded by reason
  const excludedByReason = {}
  for (const ex of excluded) {
    const reason = ex.reason
    if (!excludedByReason[reason]) {
      excludedByReason[reason] = []
    }
    excludedByReason[reason].push(ex)
  }

  return {
    included,
    excluded,
    stats: {
      totalCandidates: included.length + excluded.length,
      includedCount: included.length,
      excludedCount: excluded.length,
      inclusionRate: included.length > 0 ?
        ((included.length / (included.length + excluded.length)) * 100).toFixed(1) + '%' : '0%'
    },
    excludedByReason
  }
}

export default {
  // Constants
  FACTOR_KEYWORDS,
  NEGATIVE_TYPES,
  POSITIVE_TYPES,
  HAZARD_FACTOR_RULES,

  // Observation type helpers
  isPositiveType,
  getObservationTypeStats,
  aggregateRootCausesForHazard,

  // Factor detection - Core functions
  detectContributingFactors,
  detectContributingFactorsWithDetails,
  detectKeywordsInText,
  getKeywordsForFactor,

  // Factor detection - Hazard-specific
  validateFactorMatch,
  getHazardCategory,

  // Aggregation functions
  aggregateContributingFactors,
  detectFactorsForHazard,
  getIncidentsForHazardFactor,

  // Debug utilities
  analyzeFactorDetection
}
