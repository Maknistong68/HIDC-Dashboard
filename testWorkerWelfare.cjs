const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "It has been observed no proper rest areas provided to the night shift workers to eat and rest.",
  "Makeshift sub-standard shaded work area which can be blown by high wind",
  "Washing facility was not provided at rest area. Rest area was not sufficiently large enough to accommodate all operatives during lunch time.",
  "Contractor failed to provide welfare facilities in Zone 3C on top of hill. No access rout maintained.",
  "Contractor operatives were observed sleeping under fire water tank during lunch break hours",
  "Contractor failed to follow safe crusher operations, welfare facilities and operator cabins are set up in red zones. Equipment movement is observed in the amber zones.",
  "Inadequate provision of site welfare facilities where few workers were observed eating at floor in the porta cabin whereases other workers were eating at different location outside the dining area.",
  "Site clinic has not been established till date even after repeated notification.",
  "Smoke detector was not provided in medical clinic building.",
  "Site clinic not yet established.",
  "Contaminated stagnant water and algae formation around chilled water dispenser unit",
  "The floor carpet of medical clinic was not washable and was not as per NEOM requirement.",
  "observed that no smoke detector in clinic at zone 8",
  "Observed that adequately welfare facilities was not vailable in zone 2B.",
  "observed welfare facilites are not barricated in workin area zone 8",
  "observed that welfare facilities are not secured.",
  "observed clinic floor is slippery .",
  "It has been observed vehicle moving very close to the rest shelter- 3B Helel Najad Area.",
  "There was no provision of adequate welfare facilities close to the work area.",
  "Medical nurse was working while his MOH approval was not available",
  "it was observed that ambulance was not present during working hours",
  "It was observed that cigarette butts were found thrown by the team inside the rest shelter near the Chamber 15 area.",
  "A cement bag was found exposed inside the rest shelter.",
  "No medical clinic facilities available for TDP 892 cut and cover project",
  "In rest shelter new stockpile no available water",
  "Observed that the litter box was unchanged near the zone 4 rest shelter",
  "No available water in rest shelter zone 4",
  "Operatives were engaged for temporary works in site offices but not provided with minimum welfare facilities – advised to temporary suspend the work until provision of welfare",
  "Welfare - Toilet facilities are not operational",
  "The ambulance did not arrive on-site as the site the activities started at 6AM and the ambulance arrived to site by 7AM.",
  "During our safety walk we observed that the ambulance shelter is not protected at site.",
  "During the site inspection, it was observed that water was unavailable in the toilet facilities",
  "During ongoing site activities, it was observed that potable water in the toilet facilities was unavailable. Lack of potable water may lead to poor hygiene practices among workers, increasing the risk of health issues and non-compliance with welfare facility standards.",
  "No clinic established at site for occupational or health emergencies. Contractor is required to provide fully equipped clinic at site.",
  "Earlier this morning, June 15th, at approximately 08:30 one of the SHAR carpenters injured his left small finger. While building concrete form work the hammer slipped from his right hand and struck him on his left small finger causing minor laceration to the nail area of the small finger. The IP was taken to SHAR on-site clinic where the laceration was cleaned and bandaged. The nurse declared the IP fit to continue work and he returned to his normal duties at approximately 09:00. Investigation Team = Akmal Shah Investigation Reviewers = Irshad Magod",
  "Welfare facility",
  "welfare facilities",
  "Table and benches are not provided in rest shelter.",
  "It has been observed no male nurse available on site, and no backup nurse coverage on site.",
  "It has been observed the contractor has not provided a proper resting area near to the workplace ( shelter in place to be completed).",
  "The rest area at Underpass F01 where workers were engaged in steel fixing activity was not properly illuminated.",
  "It was observed that the water drinking bottles were accumulated at workplace. Immediately remove from the site.",
  "Workers observed eating at site in the open floor. No place available for additional workers in the mess hall.",
  "Corrective action should be taken for worker welfare facility."
];

console.log('=== Worker Welfare UNCLASSIFIED Factor Detection Test (' + observations.length + ' observations) ===\n');

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
