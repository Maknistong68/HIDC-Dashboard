const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  // Training in COSHH
  "COSHH Substances found stored in site without complying to NEOM requirements. No secondary containment, no MSDS, COSHH risk assessment, appropriate fire extinguisher.",
  "Substandard plastic bottles are being used for chemicals in the offices area, lacking proper labeling and SDS.",
  "Workers engaged in painting and touch-up activities were observed without an MSDS attached to the work permit for painting and sealant.",
  "During the inspection, observed that several white cement bags and a chemical container were stored near the security cabin.",
  "During inspection at site, workers seen using chemicals in unsafe manners, no SDS seen, no TBT conducted and no proper PPEs worn.",
  // Documentations in COSHH
  "Chemicals container used in concrete pouring activities on site without label and not sitting on secondary containment basin.",
  "Found unsecured compressed gas cylinders (Oxygen & Acetylene), no protective caps at its nozzle and without trolly for handling.",
  "Chemical containers with missing labels; no posted MSDS and standby chemicals graded PPE; no eyewash/shower station near its store.",
  "At several locations found Diesel fuel kept at site in an unsuitable container (Drinking water container and Re-used gallons)",
  "MSDS copy was not available for chemicals in storage area. Improper chemical storage.",
  "Hazardous Chemical storage area is set up close to fence. Improper chemical storage.",
  "Hazardous chemical containers are not labeled.",
  "Acrylic turf mixing chemicals stored directly on ground, open drum kept parallel to ground, drinking water igloo placed along with chemicals.",
  "A designated chemical storage area was not provided at the Plant & Equipment maintenance area.",
  "Improper storage of chemicals. Secondary containment was not provided to store chemical container.",
  "COSHH items stored (open epoxy paint buckets) directly on floor and MSDS not available at work location",
  "Burnt engine oil was stored in plastic container under the sunlight. Chemical containers are not labeled.",
  "Fire point was not set up at the chemical storage and maintenance workshop.",
  "COSHH items stored under direct sunlight. Non availability of fire extinguishers and MSDS on site.",
  "A copy of MSDS of chemicals in the workshop was not available. COSHH assessment of hazardous chemical was not done.",
  "Chemical containers are stored under the direct sunlight. Chemical containers are not labeled.",
  "It was observed that a water cooler was placed in the chemical storage area, creating a risk of contamination.",
  "During inspection of area C15, chemical storage was found to be non-compliant. One chemical container was left open. No drip tray was provided.",
  "During site inspection, it was observed that chemical containers and diesel-filled jerry cans were placed directly on the ground.",
  "It was observed that petrol was stored in a plastic bottle, which is unsafe.",
  "Chemical buckets and diesel jerry cans were found placed inside the storage area without drip trays.",
  "COSHH - Chemical drums directly placed on ground surface (no drip tray, MSDS & suitable fire fighting equipment nearby)",
  "COSHH - Chemical container without content label and HAZCHEM code observed adjacent to diesel storage tank",
  "Chemical containers found not stored in the designated storage area. Drip tray and SDS not available.",
  "Hazardous chemicals were observed on-site without drip trays, posing a risk of soil contamination.",
  "A chemical container was left on-site after job completion instead of being stored in the designated area.",
  "The cement bags were stacked on the ground without any protection and safety Data Sheets (SDS) being readily.",
  "It was observed that no cleanup procedure is available for the spill kit on-site.",
  "chemical has been used on the site without following the MSDS regarding specific PPE",
  "A chemical silicone sealant was found stored in an unauthorized location, contrary to MSDS requirements.",
  "A chemical container was found directly exposed to sunlight on site.",
  "During a site visit, It has been observed the contractor is not providing a segregated chemical storage.",
  "Observed highly flammable substances (HFS) not storage as per the SDS guidelines. Missing COSHH assessment.",
  "Not found fire extinguishers at chemical storage area",
  "Plastic drinking water container used as diesel fuel container at chemical storage area.",
  "Damaged drip tray observed full of oil leakage on SHAR site.",
  "painting chemicals substances observed being used in painting the porta-cabins walls and there is no COSHH assessment.",
  "Water proofing technician found using cotton gloves instead of Chemical gloves as per the approved RAMS.",
  "It has found that diesel Jerry can was left unattended without drip tray and fire extinguisher.",
  "Chemicals are kept at site without proper MSDS and COSHH. No fire extinguisher or signages are kept.",
  "Chemical used containers having flammable properties are disposed on the ground in the workplace.",
  "Some chemical containers including a Petrol Cane (without label) were observed in use at site without providing any secondary containment.",
  "Several chemical containers were found scattered behind panel number 61."
];

console.log('=== COSHH (Training + Documentations) Test (' + observations.length + ' observations) ===\n');

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
