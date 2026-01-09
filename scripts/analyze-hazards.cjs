const XLSX = require('xlsx');

const CONTEXT_REDIRECTS = {
  'fire extinguisher': 'Emergency Preparedness', 'fire alarm': 'Emergency Preparedness',
  'fire drill': 'Emergency Preparedness', 'fire point': 'Fire', 'fire protection:': 'Fire',
  'fire blanket': 'Hot Work', 'line of fire': 'Mobile Plant & Equipment',
  'welfare facility:': 'Site Welfare', 'confined space:': 'Confined Spaces',
  'work environment:': 'Work Environment', 'work enironment;': 'Work Environment',
  'equipment:': 'Mobile Plant & Equipment', 'housekeeping:': 'Housekeeping',
  'housekeeping;': 'Housekeeping', 'barricades:': 'Barricades',
  'electrical:': 'Energized System', 'safety signs:': 'Safety Sign',
  'hotwork:': 'Hot Work', 'hotwork;': 'Hot Work', 'hot work:': 'Hot Work',
  'toilet flush': 'Site Welfare', 'toilet checklist': 'Site Welfare',
  'toilets not clean': 'Site Welfare', 'toiltes': 'Site Welfare',
  'water cooler': 'Site Welfare', 'igloo cooler': 'Site Welfare',
  'drinking water': 'Site Welfare', 'drinking bottle': 'Site Welfare',
  'poor housekeeping': 'Housekeeping', 'waste skip': 'Housekeeping',
  'garbage accumulated': 'Housekeeping', 'unwanted materials': 'Housekeeping',
  'concrete waste': 'Housekeeping', 'not properly stored': 'Housekeeping',
  'electric motor': 'Energized System', 'electrical cable': 'Energized System',
  'electrical panel': 'Energized System', 'damaged cable': 'Energized System',
  'extension cord': 'Energized System', 'power tool': 'Tools',
  'colour code': 'Tools', 'color code': 'Tools',
  'open pit': 'Barricades', 'without barricad': 'Barricades',
  'not properly barricaded': 'Barricades', 'excavation edge': 'Barricades',
  'no exclusion zone': 'Barricades', 'unprotected edge': 'Barricades',
  'welding machine': 'Hot Work', 'welder performing': 'Hot Work',
  'hot work activity': 'Hot Work', 'bulletin board': 'Safety Sign',
  'hsse bulletin': 'Safety Sign', 'signage missing': 'Safety Sign',
  'missing sign': 'Safety Sign', 'first aid box': 'Emergency Preparedness',
  'spill kit': 'Emergency Preparedness', 'chemical stored': 'COSHH',
  'drip tray': 'COSHH', 'floor is open': 'Access', 'access stair': 'Access',
  'slip, trip': 'Access', 'trip hazard': 'Access', 'tripping': 'Access',
  'vvs inspection': 'Mobile Plant & Equipment', 'moving equipment': 'Mobile Plant & Equipment',
  'heavy equipment': 'Mobile Plant & Equipment', 'deep excavation': 'Breaking Ground & Excavation',
  'bucket to access': 'Working at Height', 'dust is being generated': 'Dust Control',
  'un authorized': 'Site Security', 'traffic signage': 'Traffic Management'
};

const HAZARD_KEYWORDS = {
  'Fire': ['fire', 'flame', 'burning', 'combustible', 'flammable'],
  'Working at Height': ['height', 'ladder', 'roof', 'scaffold', 'elevated', 'harness'],
  'Mobile Plant & Equipment': ['excavator', 'crane', 'loader', 'equipment', 'vehicle', 'plant', 'machinery'],
  'Hot Work': ['welding', 'cutting', 'grinding', 'welder', 'spark'],
  'Breaking Ground & Excavation': ['excavation', 'trench', 'digging'],
  'Confined Spaces': ['confined space', 'manhole', 'tank entry'],
  'Energized System': ['electrical', 'voltage', 'cable', 'wire', 'power'],
  'Lifting': ['hoist', 'rigging', 'lifting', 'sling'],
  'Temporary Works': ['scaffold', 'formwork', 'shoring'],
  'COSHH': ['chemical', 'toxic', 'hazardous substance', 'paint'],
  'Housekeeping': ['waste', 'debris', 'clutter', 'rubbish', 'garbage'],
  'PPE': ['ppe', 'helmet', 'gloves', 'goggles', 'safety boots', 'hi-vis'],
  'Safety Sign': ['signage', 'sign'],
  'Access': ['access', 'egress', 'stair', 'walkway', 'slip', 'trip'],
  'Site Welfare': ['toilet', 'welfare', 'canteen', 'rest area'],
  'Barricades': ['barricade', 'barrier', 'fencing'],
  'Traffic Management': ['traffic', 'pedestrian'],
  'Tools': ['tool', 'drill', 'grinder'],
  'Emergency Preparedness': ['emergency', 'evacuation', 'first aid'],
  'Training and Competency': ['training', 'competency', 'untrained'],
  'Dust Control': ['dust', 'silica'],
  'Site Security': ['security', 'unauthorized'],
  'Safety Supervision': ['supervision', 'supervisor', 'toolbox talk'],
  'Permit and RAMS': ['permit', 'risk assessment'],
  'BBS': ['behavior', 'behaviour'],
  'Work Environment': ['environment', 'weather', 'lighting'],
  'Working in Heat': ['heat stress', 'hot weather'],
  'Working on or Near Live Roads': ['live road', 'highway'],
  'Driving': ['driver', 'driving', 'speeding']
};

function normalizeCategory(cat) {
  if (!cat) return null;
  const n = cat.trim().toLowerCase();
  if (n.includes('work at height')) return 'Working at Height';
  if (n.includes('breaking ground & excavations')) return 'Breaking Ground & Excavation';
  if (n.includes('energised system')) return 'Energized System';
  if (n.includes('hot works')) return 'Hot Work';
  if (n.includes('working in the heat') || n.includes('working on heat')) return 'Working in Heat';
  return cat.trim();
}

function categorize(desc, existingCat) {
  const text = (desc || '').toLowerCase();

  for (const [phrase, category] of Object.entries(CONTEXT_REDIRECTS)) {
    if (text.includes(phrase.toLowerCase())) return category;
  }

  if (existingCat && existingCat.trim()) return normalizeCategory(existingCat);

  for (const [category, keywords] of Object.entries(HAZARD_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) return category;
    }
  }

  return 'Work Environment';
}

const filePath = process.argv[2] || 'C:\\Users\\Mark Ronnel Nieva\\Downloads\\TK Observation Tracker.xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const hazardCounts = {};
let total = 0;

for (let i = 1; i < data.length; i++) {
  const desc = data[i][4] || '';
  const existingHazard = (data[i][8] || '').trim();
  const classification = data[i][2] || '';

  if (classification === 'Positive Observation') continue;

  total++;
  const result = categorize(desc, existingHazard);
  hazardCounts[result] = (hazardCounts[result] || 0) + 1;
}

console.log('=== TOP HAZARDS (My Calculation) ===');
console.log('Total non-positive observations:', total);
console.log('');

const sorted = Object.entries(hazardCounts).sort((a, b) => b[1] - a[1]);
sorted.forEach(([hazard, count], i) => {
  const pct = ((count / total) * 100).toFixed(1);
  console.log((i+1).toString().padStart(2) + '. ' + hazard.padEnd(30) + count.toString().padStart(4) + ' (' + pct + '%)');
});
