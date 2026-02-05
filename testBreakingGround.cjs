const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "Pedestal blocks supporting cabin module left partially hanging on air by underside manual excavation.",
  "workers are eating at the ground in the work area, no prober place for them in the break",
  "It has been observed unprotected open excavation.",
  "Employees shall be protected from open excavations that could pose a hazard by falling or rolling into it.",
  "Pre-casted concrete material resting/stored just beside loose edge of excavation.",
  "It is observed an excavation near to electrical foundation, it might be fall due to vibration or heavy wind.",
  "Some surveying steel rod markers inside trench without protective cap on top.",
  "Unstable boulders on the ramp of the excavation potential to roll down and harm to operatives and assets.",
  "There were no welfare facilities in zone 3C when there were excavation and cutting activities in the different parts of zone 3C.",
  "Unstable & Unsecured light post on top of excavation.",
  "It has been observed boots on the ground over the disposal area.",
  "Excavation or deep area without providing adequate access egress that may cause slip/ trip of the workers while using this area as an access egress to different elevation level, having serious potential risk of injuries.",
  "An excavator found excavating at site without NEOM inspection and QR Code violating NEOM requirements as mentioned in Chapter 17.5 of NEOM Health & Safety Assurance Standard, whereas Operator Saeed Ur Rehman was observed without wearing safety shoes. 3rd party Inspection for the excavator is expiring on 9th October, 2023.",
  "Unprotected deep trench edges adjacent to heavy truck movement area",
  "Soil berms are not provided on access route to contain rolling stones.",
  "Excavation - Heavy rock at excavation partially protruding out",
  "Contaminated water at stockpile.",
  "Observed no soil berm provided along with deep excavated area.",
  "Observed dum trucks are dupming at the edge of excavation at dumping area",
  "No speed humps for the temporary traffic below the surface, inside the excavation. No pedestrian walkways to segregate plant and people below.",
  "observed that bulldozer was working at the edge of excavation.",
  "Al Fahd Site in the Dumping Yard Overhead power line need to provide the Goalposts.",
  "It was observed that a boom truck was parked on unstable ground and near the edge of an excavation/embankment. This created a high risk of vehicle tilting, overturning, or ground collapse, which could result in serious accidents.",
  "Excavation - Undercutting of excavation wall, no sloping and lean unsecured wall where heavy vehicles and equipment",
  "it was observed that one of the workers was waking beside the equipment. No boot-on-the-ground policy should be implemented.",
  "stock pile area tickt person No wear face mask",
  "Observed the height of the soil berms provided at the corners of excavation at zone 6 area is too low, not meeting with the requirements.",
  "it was observed that one of the workers was waking beside the equipment. No boot-on-the-ground policy should be implemented.",
  "No have water in zone stockpile",
  "Found Smoking buds on the ground.",
  "It is observed some workers are working inside sceptic tanks excavation for form work, but one side of excavation vertical cutting without proper sloping or benching, chance of excavation collapse due to vibration acceess road.",
  "Access egress provided outside the wall foundation steel erection works however no means of access/ egress provided from inside the foundation wall shatter/ steel under erection.",
  "Steel fixers found walking on foundation steel reinforcement with not safe means of walkways.",
  "Access egress provided outside the wall foundation steel erection works however no means of access/ egress provided from inside the foundation wall shatter/ steel under erection.",
  "No safe means of access egress for the foundation steel erection in Phase 3.",
  "A tower light has been positioned at the edge of an excavation site.",
  "It has been observed that there are no means of access or egress provided at the footing of the retaining wall."
];

console.log('=== Breaking Ground & Excavation UNCLASSIFIED Factor Detection Test (' + observations.length + ' observations) ===\n');

const factorCounts = {};
let noFactors = 0;
const failures = [];

observations.forEach((obs, i) => {
  const factors = detectContributingFactors(obs);

  if (factors.length === 0) {
    noFactors++;
    failures.push({ num: i + 1, obs: obs.substring(0, 80) });
  }

  factors.forEach(f => {
    factorCounts[f] = (factorCounts[f] || 0) + 1;
  });
});

console.log('=== FACTOR BREAKDOWN ===');
const sortedFactors = Object.entries(factorCounts).sort((a, b) => b[1] - a[1]);
sortedFactors.forEach(([factor, count]) => {
  console.log(`${factor}: ${count} (${Math.round(count/observations.length*100)}%)`);
});

console.log('\n=== SUMMARY ===');
console.log('Total observations:', observations.length);
console.log('Observations with factors:', observations.length - noFactors, '(' + Math.round((observations.length - noFactors)/observations.length*100) + '%)');
console.log('Still unclassified:', noFactors);

if (failures.length > 0 && failures.length <= 30) {
  console.log('\n=== STILL UNCLASSIFIED (' + failures.length + ') ===');
  failures.forEach(f => {
    console.log(f.num + '. "' + f.obs + '..."');
  });
}
