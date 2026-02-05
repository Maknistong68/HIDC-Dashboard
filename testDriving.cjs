const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "Observed some carpenters are not using safety glass",
  "Observed a carpenter working at site without using eye protection glass and hand gloves",
  "It has been observed a water tanker driver leave his vehicle without switched off the engine.",
  "Delivery truck of Tamimi global with long carriage sent inside site ancd having dificulty maneuvering and obstrucgting narrow portion of site access.",
  "Water tanker operator was on cell phone call while driving the the plant.",
  "Rear view glass of dozer covered by curtain.",
  "The workers transport buses are observed with poor conditions, not meeting NEOM assurance standards requirements.",
  "Crusher operations adjacent to live temporary site traffic roads.",
  "Poor quality helmet was observed under use by the Tanker Driver at rest area.",
  "Security checkpoint placed exposed to live vehicles and equipment movement at the north entry gate to Wadi Al BIDA.",
  "Passenger car was observed parked near to fire pump control room",
  "The worker was not maintaining a safe distance from the equipment.",
  "Mandatory PPE, it has been observed tanker driver wearing loose clothes during working hours",
  "Security vehicle was not available at zone A entrance gate.",
  "It has been observed that that the tree was not protected from the vehicles' movement.",
  "Observed that trucks were dumping very closely .",
  "A Surveyor was found over speeding and was counterflowing in no entry route, putting incoming vehicles in a risk of blind crash.",
  "Uncontrolled traffic route with multiple exit points from site",
  "Some driver no wear PPE",
  "Equipment operation - Dumper trucks were observed not following safe distance whilst tipping operations.",
  "Some drivers don't use seat belt during driving",
  "PPE - Majority of the drivers were observed wearing sub standard helmets.",
  "Some drivers doing over taking on work side",
  "Access routes towards zone 6 was not compacted.",
  "Driver out side without healmet",
  "Driver doing drive without driving linces",
  "Driver doing over taking",
  "TDP sub contractor's bus was driven in the wrong direction of the road.",
  "This trailer driver alwys use hand free",
  "one trailer driver don't fallow safety requirements alwys ignore",
  "Driver don't have safety glasses",
  "Some drivers don't wear proper PPE wearing home dresses",
  "Some drivers use handfee during driving",
  "It was observed that portable toilets not functional at laydown as main toilet facilities provided so it should permanently closed and signage must be installed.",
  "Delivery drivers found resting/sleeping at the ground beside parked trucks, potentially be run over by moving equipment/ vehicle if not adressed properly",
  "observed wrong parking cars on the office parking area not in reverse parking. SHAR should make sure that Reverse parking of vehicles at all times and should make controls over drivers using the parking area",
  "Ambulance driver was not available during extended hours work on 31-12-23.",
  "On 05th March 2024, approximately at 2:13 PM, a Nissan X-Trail Reg. # 7069-HTR whilst a driver who was attempting to reverse his vehicle to park. However, due to a sudden error, the driver mistakenly put the gear in forward mode instead of reverse and pressed the accelerator. As a result, the driver's vehicle collided with two other vehicles that were already parked in the UNIMAC Site Office parking in Zone F. Investigation Team = Parwez Anwar Investigation Reviewers = SURESH RAMAKRISHNAN",
  "COSHH was found on-site without any precautionary measures taken by the carpenter involved in the activity.",
  "Bus drivers found resting right in front of the bus using its shade."
];

console.log('=== Driving UNCLASSIFIED Factor Detection Test (' + observations.length + ' observations) ===\n');

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
