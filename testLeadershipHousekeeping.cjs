const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "During our site visit, it was observed a huge number of waste materials were scattered at the work location.",
  "Poor housekeeping observed: During our site visit poor housekeeping was observed beside the walkway.",
  "During the site visit, it was observed, waste materials were scattered on the site.",
  "During site inspection, the waste bin polythene bag was found full.",
  "During the morning site inspection, it was observed that a cement bag was placed directly on the ground.",
  "During the site inspection, it was observed that a waste bin had fallen on the ground.",
  "During the site inspection, it was observed that some materials were found scratched in the storage area",
  "During the site inspection, it was observed that garbage was found near chamber #15.",
  "Poor housekeeping notes during our site inspection near the control building.",
  "During our site inspection, construction waste found at control building area.",
  "During site inspection found poor housekeeping in the temporary materials storage area.",
  "During our site inspection we found plastic sheet along with construction waste scattering.",
  "During the random site inspection, poor housekeeping found near the control building.",
  "Poor housekeeping found during site inspection, poor housekeeping on the access may trip hazard.",
  "During our site inspection it was found that the fence foundation located at other contractor area and poor housekeeping observed.",
  "during random site inspection found poor housekeeping near the control building.",
  "During site inspection, scattered concrete waste found which was not removed from workplace.",
  "During the site inspection, it was noted that there was a lack of safety coverage and supervision at the workplace.",
  "During the site inspection, it was observed that housekeeping practices were not being consistently followed.",
  "During the site inspection, concrete waste was found scattered in the work area.",
  "During morning site inspection it was observed that after grouting activity the empty cement bags was not removed from site",
  "During the site inspection, it was noted that unwanted materials have accumulated near the site security gate.",
  "During the site inspection, it was observed that the safety officer was not present at the workplace.",
  "During a routine site inspection, poor housekeeping practices were observed.",
  "During a routine site inspection, it was observed that cement bags were placed directly on the ground.",
  "On the site during site inspection the Empty oil can found left in open area.",
  "During a site inspection, it was observed that housekeeping was not conducted properly.",
  "During site inspection, it was observed that the DG was placed directly on the ground without a drip tray.",
  "During site inspection, it was observed that the accumulated waste was not removed by the team.",
  "During the site inspection, sharp steel rebars were found exposed.",
  "During the site inspection, wooden planks and other unwanted materials were found scattered.",
  "During the site inspection, observed poor housekeeping at the security gate area.",
  "During the morning site inspection, a fire extinguisher was found placed directly on the ground.",
  "During the site inspection, it was observed that the waste bin polythene bag had not been changed.",
  "During the site inspection, it was observed that a safety signage had fallen down.",
  "During the site inspection, it was observed that steel rebar was placed directly on the ground.",
  "During a site visit, It has been observed the contractor is not preforming any housekeeping practices.",
  "During site visit found some poor housekeeping behind office area.",
  "During a walkthrough, it has been observed unwanted wooden material which can catch on fire are been left on site.",
  "During a site visit, It has been observed scattered materials around working place.",
  "During a site visit, it has been observed poor housekeeping.",
  "During site inspection, observed that the construction material was scattered throughout the earth face."
];

console.log('=== Leadership in Housekeeping Test (' + observations.length + ' observations) ===\n');

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
