const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "In reinforcement area, there are not rebar caps on the extended rebars, moreover, there is not arrangement for timber storage properly that can lead to a severe trip, slip and fall.",
  "Wood waste with protruding nail scattered on ground",
  "Rebar caps are missing on rebars that is causing a serious hazard to the workers and passer byers.",
  "Missing the rebar caps",
  "Unprotected protruding rebars installed as survey points with workers around it preparing the foundation block setup.",
  "Protruding rebars without protection have been left erected in the work area by surveyors and shuttering carpenters at multiple locations having serious potential risk of impalement.",
  "Too many rebars used for the shuttering work and left erected without any protection posing continues risk of impalement for the workers.",
  "Rebar being used as split off pin in shaft.",
  "Protruding rebars without protection by surveyors and shuttering carpenters at multiple locations having serious potential of impalement hazard.",
  "Rebar caps are missing in the site over the protruding rebars.",
  "Provide the rebar caps",
  "Rebars are fixed in the concrete and are without rebar caps that may cause injury to the workers.",
  "Worker are working on steel rebar without access and egress.",
  "No edge protection with protruding rebar below behind the retaining wall with workers at height involved in repair and cleaning.",
  "Missing Rebar caps @ F16",
  "Reba caps are missing in protruding rebars",
  "Hand railing provided along the entrance edge was broken. Sharp edge of the broken handrailing potential to impalement.",
  "Rebar caps are missing in rebar, provide the rebar caps",
  "Protect the rebar through rebar caps or any other way.",
  "A sharp steel rebar was observed in the Chamber #15 area.",
  "Several pieces of timber with protruding nails were found in the work area.",
  "Timber with protruding nails was found at the site, creating a potential injury hazard for workers",
  "It was observed in C15 hand tools were stored in broken plastic bottle was sharp edges",
  "Accumulated wooden scraps with protruding nails to be dispose properly and remove from the site.",
  "Timbers with exposed/protruding nails have been left scattered in the workplace.",
  "Protruding nails were found on the plywood placed at the site near Chamber 18.",
  "It was observed that protruding rebars not protected at excavated area.",
  "Septic tank edges not adequately protected, barriers not placed and chances of falling.",
  "during site inspection found Prominence rebar without cap",
  "Found protruding rebar at workplace.",
  "found many protruding rebar at workplace in the operation building",
  "Protruding rebar at workplace",
  "During our safety inspection we found a protruding rebar at retaining wall type 2",
  "Some of head rebars found not protected by (Rebar Cap).",
  "It was observed that protruding rebars not protected, rebar scrap not removed from workplace.",
  "It is observed that exposed rebars are not adequately protected with rebar caps or wood.",
  "the rebar with control building found protruding, need to cover the protruding rebar.",
  "found protruding rebar at site",
  "During site inspection found protruding rebar with shuttering work.",
  "Injuries could occur due to the emergence of rebar.",
  "the tie rod sharp edges are not protected by rebar caps or wooden covers.",
  "no rebar caps provided for the exposed rabras at area 1",
  "Several exposed protruding rebars were left without any protective measures.",
  "The backfilling work and rebar activity are too close to each other.",
  "Exposed rebar on the site has not been adequately protected.",
  "A steel bar was found without a safety cap, posing a potential injury hazard.",
  "Protruding rebars were observed in Area 1 without rebar caps.",
  "Remove or hammer down the protruding nails immediately.",
  "Exposed tie rods pose a safety hazard, risking worker injuries from protruding steel."
];

console.log('=== Safety Devices in Physical Hazard Test (' + observations.length + ' observations) ===\n');

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

if (failures.length > 0 && failures.length <= 20) {
  console.log('\n=== STILL UNCLASSIFIED (' + failures.length + ') ===');
  failures.forEach(f => {
    console.log(f.num + '. "' + f.obs + '..."');
  });
}
