const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "Excavation edges without and/or fallen barricades at zones D & B. Lessons Learned = 1. All open edges that leads to personnel or equipment shall be secured. 2. Excavation shallower than 1.2meters can be provided with soft barricade and warning signage. 2. Excavation deeper than 1.2meters shall be protected by hard barricades and warning signages.",
  "DEEP EXCAVATION: The deep excavation was observed without any isolation. Non-availability of any signages was evident, which may result in a fall incident.",
  "A scaffold (free standing mobile tower) was observed erected without having any Scaff tag, inadequate and unsafe installation of access ladder.",
  "no warning signs posted, no watchman deployed and no entry was enforced whilst people working at height.",
  "A new system scaffold (Cup lock) was observed in use without any design specification and approval from PMC.",
  "Hard barricade, temporary cover & signage provided for floor opening",
  "A-type ladder fully extended as straight ladder. A-type with Don't Use marking used on site",
  "Call to action Working at Height banners and posters displayed on site",
  "No full body harness for supervisory staff working inside elevated MEWP and no demarcation & warning signage for exclusion zone",
  "the leading edges of the site access road was not protected, signs and notices were not provided.",
  "unprotected edges near the chamber area. No physical barriers, guardrails, or warning signs were in place",
  "a safety awareness signboard was found fallen, which reduces visibility of safety messages",
  "a safety sign board was found fallen on the ground",
  "unprotected edges of the chamber wall. No guardrails, edge protection, or warning signage were in place",
  "a safety signboard was loose and about to fall down",
  "The deep excavation was observed without any isolation. Non-availability of any signages was evident",
  "Some safety signs fall down",
  "Morning I chek all site some sign fall down",
  "Some sign fall down m",
  "Sign board Fall down",
  "Some sign fall down due to wind speed",
  "Due to sand stom some sign fall down",
  "No edge protection was observed. TDPCO has been advised to provide proper edge protection and warning signages.",
  "Leading edges of Excavation were not protected and signs were not provided",
  "a signage which was fallen due to high wind pressure which was later fixed by safety team.",
  "Big sign board of ELTIZAM poster installed work at height and breaking ground and excavation installed at site",
  "First aid signages installed at site which provided the basis knowledge of First Aid",
  "Excavated edge not adequately protected. Sufficient signage shall post in all areas.",
  "Full body harness monthly color-code, and inspection not updated and FBH not kept in designated storage area.",
  "Signage protection barriers are fall down , subject to be damaged.",
  "For the edge protection barricade and signages has been provided.",
  "the incomplete scaffolding with retaining wall has been barricaded with warning sign and posted red scaffolding tag.",
  "All the safety harnesses stored in designated area (protected from direct sunlight)",
  "for edge protection, barricade the area and posted alert signages.",
  "leading edge of the excavated area is not adequately protected, creating a significant risk",
  "A worker is replacing the Fallindown signage",
  "A worker was replacing the Fallindown signage",
  "Scaffolding access found with expired scaffolding tag.",
  "several locations around the site had unprotected edges of deep excavations.",
  "unprotected edges of the deep excavation and slopes. no barriers, guardrails, or warning signs in place",
  "the safety sign board was Fallindown",
  "the waker was replacing the Fallindown signage",
  "No awareness signage was placed on the scaffold access to the rebar work.",
  "There is a lack of communication signage indicating safe access to the scaffold access way.",
  "the worker was replacing the Fallindown signage.",
  "unprotected edges of deep trenches were observed. significant fall hazard to workers and vehicles.",
  "Formwork activity. General and emergency access routes must be clearly defined, signed, barricaded, and lit.",
  "The FBH has not been stored in the designated area and was left on the scaffold platform.",
  "Damaged or deformed scaffolding materials stored on-site pose a risk of being reused.",
  "Ladders are being stored with other scaffold materials, without a designated area for ladders specifically",
  "the safety signboard had fallen down on the surface. This presents a potential hazard",
  "Unprotected edges of a deep excavation. Also, there is a lack of caution signage around the excavation area.",
  "TDP#892 construction team is not adhering to NEOM safety protocols. Unprotected Edges: Workers standing at unprotected edges.",
  "Two operatives were found working at the edges of a culvert without the necessary fall arrest systems.",
  "Unprotected edges were found at several locations. edges were not properly safeguarded with barriers, guardrails, or warning signs.",
  "Activity for drilling of electrical grounding. not using proper and appropriate platform while drilling.",
  "the worker were replacing the Fallindown signages at the site",
  "The scaffold ladder was observed placed in an undesignated area at the workplace",
  "the safety signage was Fallindown down on the surface it should be replaced Asap",
  "lifting activities within the deep excavations. Lack of Safety Coverage. Risk of Falling or Falling Objects.",
  "No guardrail on the access as it can cause slip, trip and fall hazard. secondary distance barriers with appropriate signage.",
  "No identification signage was observed on the green-tagged scaffold to indicate that a full body harness is required.",
  "Excavation close to the vehicle access lacks demarcations, no signages, barricades and traffic devices.",
  "worker was walking on the edge of the platform which is not designed for walking",
  "Deep excavation close to the access road do not have a mean of preventing vehicles or equipment from falling.",
  "A scaffolder was observed working at height using an anchor point that is not rated to support 5,000 lbs.",
  "During the erection a worker was found standing on the platform without any safe or designated access/egress.",
  "operatives were observed carrying out chamber reinforcement and shuttering activities at height without safety precautions.",
  "Tools has been used in work at height but not secured by lanyard to prevent from falling, no color code.",
  "An incomplete structure is easily accessible to workers, with no physical barriers or warning signages in place.",
  "No safety signage has been installed at the access ladder to the hanging scaffolding.",
  "Several scaffold platform and structure does not have an updated scaffold tag.",
  "The guardrail is not properly installed; its height does not meet the required standards.",
  "Steel works are ongoing on top of the pit where the edges are open, posing a risk of workers falling from height.",
  "Scaffolders are using unapproved and unsafe anchor points (cable trays).",
  "During haulage operations, several significant safety concerns were observed.",
  "scaffold pipe has been stored on the site on the access way without barricades and signages for identification",
  "An incomplete structure is easily accessible to workers, with no physical barriers or warning signages in place.",
  "An operative was observed using unsafe access and egress methods.",
  "Unprotected edges were found around a deep trench. no physical barriers, guardrails, or warning signs in place.",
  "Dewatering activity. workers do not have proper access or a stable platform. access routes must be clearly defined, signed, barricaded.",
  "A designated Harness point in phase 1 has been created and proper signage has also been placed.",
  "Some of access ladders on scaffolding do not have signages related to WAH. 100% tie off, 3-point contact, FBH required.",
  "An incomplete structure with no physical barriers or warning signages in place.",
  "A green-tagged scaffolding structure was observed without a toprail. A worker was seen overreaching.",
  "scaffolding access is red tagged.",
  "A deep trench approximately 1.5 meters was observed without proper edge protection or barricading. No signage or warning indicators.",
  "Scaffolding erection is ongoing, but the tagging system is not being utilized.",
  "Scaffolding platform found with incomplete guardrail system.",
  "chamber preparations. lack of safe access and egress. Only one ladder was available.",
  "No Watch Your Step signage was placed on the extended scaffolding tubes.",
  "Scaffold access entrance is positioned directly on an active roadway. installation of protective traffic control measures (barriers, signage).",
  "Incomplete scaffold without a red-tag scaffolding.",
  "Worker is sitting beneath scaffolding activity area where materials could potentially fall. Warning signage must be posted.",
  "The scaffold ladder was found improperly stored on-site.",
  "Scaffolding activity was ongoing while permit to work was not filled 100%.",
  "worker was working on the edge of the roof without any fall protection equipment. ladder not secured at the top.",
  "A worker was observed standing on the top step of A type ladder.",
  "Excavation barricades (Sand Berms) has been found removed. riggers exposing himself to fall from height.",
  "all workers were equipped with full-body harnesses while working at heights.",
  "backfilling level reached almost equal to top of wall. risk of falling from height to 6-meter depth and no barricades or edge protection.",
  "scaffolding erectors were seen working on loose planks at a significant height.",
  "construction material accumulated at working zone. Immediately remove all the material.",
  "a worker was using unsafe access by standing on a loose wooden plank.",
  "rebar fixing activity. steel fixer climbed into and out of the cage using the rebar frame. No specific rescue plan.",
  "Incomplete unsafe scaffolds tagged green. The tag found without information regarding date, time, and signature.",
  "a crane rigger was standing at the edge of deep excavation without any protection. Contractor is advised to provide hard barricades.",
  "Excavation barricades has been found removed. riggers exposing himself to fall from height.",
  "competent scaffold erectors diligently working on the scaffold platform.",
  "Workers found on incomplete scaffolding platform working on edge without guardrail. Scaffold must be erected by 3rd party certified.",
  "Backfilling completed. leading edges left without rigid edge protections and warning signages as per approved RAMS.",
  "Inadequate and unsafe design of the cantilever platform.",
  "operatives were seen working on the scaffold marked with a red tag.",
  "the erected scaffolding tag has been updated with the time, date, and signed by the competent scaffold inspector.",
  "The working area has been provided with proper handrails, signage, and step access.",
  "An updated scaffold tag was installed on scaffolding located at panel 4.",
  "backfilling level reached almost equal to top of wall. risk of falling from height and no barricades or edge protection."
];

console.log('=== Signage Factor Detection Test (119 observations) ===\n');

let signageDetected = 0;
let inspectionsDetected = 0;
let barriersDetected = 0;
let otherFactors = 0;
let noFactors = 0;
const failures = [];

observations.forEach((obs, i) => {
  const factors = detectContributingFactors(obs);
  const hasSignage = factors.includes('Signage');
  const hasInspections = factors.includes('Inspections');
  const hasBarriers = factors.includes('Barriers');

  if (hasSignage) signageDetected++;
  if (hasInspections) inspectionsDetected++;
  if (hasBarriers) barriersDetected++;

  if (!hasSignage && !hasInspections && factors.length > 0) {
    otherFactors++;
  } else if (factors.length === 0) {
    noFactors++;
    failures.push({ num: i + 1, obs: obs.substring(0, 80), factors });
  }
});

console.log('=== RESULTS ===');
console.log('Signage detected:', signageDetected, '(' + Math.round(signageDetected/observations.length*100) + '%)');
console.log('Inspections detected:', inspectionsDetected, '(' + Math.round(inspectionsDetected/observations.length*100) + '%)');
console.log('Barriers detected:', barriersDetected, '(' + Math.round(barriersDetected/observations.length*100) + '%)');
console.log('Other factors only:', otherFactors);
console.log('No factors:', noFactors);
console.log('Total coverage:', (observations.length - noFactors), '(' + Math.round((observations.length - noFactors)/observations.length*100) + '%)');

if (failures.length > 0 && failures.length <= 10) {
  console.log('\n=== OBSERVATIONS WITH NO FACTORS ===');
  failures.forEach(f => {
    console.log(f.num + '. "' + f.obs + '..."');
  });
}
