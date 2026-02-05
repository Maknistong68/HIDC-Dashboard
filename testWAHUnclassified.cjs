const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "Scaffold crew jack extended more than 45 cms and kicker lift erected at 50 cms.",
  "An employees using A frame ladder with wide angle to climb on manhole.",
  "It was observed a rigger climb on A' frame using as straight ladder with wide angle.",
  "No drop bar installed at scaffold platform entrance.",
  "Incomplete scaffold without any tag No sole board No top rail Improperly installed access ladder",
  "Double lanyard without shock absorber was being used while working at height less than 6 meters height.",
  "It is observed almost tower light boom kept upright position after night shift, it might fall while heavy wind.",
  "It is observed access close with materials to enter the scaffolding at swimming pool",
  "It has been observed the contractor let the workers to work from height without using the safety harness.",
  "walking/working surfaces shall be protected from falling through holes covers.",
  "Crew working at height failing hook at acceptable anchor poin.",
  "It has been observed the scaffold was built poorly: 1- Longitudinal bracing was not placed correctly. 2- Transverse (sectional) Bracing is missing. 4- The ladder should be erected properly. 3- No easy access after claiming the ladder.",
  "Incomplete scaffold access tower without clamped and secured landing platform in use as access to roof",
  "Unsecured straight ladder leaned against building wall in use as access to roof top",
  "Unsecured 6 meter straight ladder leaned against wall and left unattended",
  "5 meter scaffold without enough base width (4:1 ratio not adhered), missing ledgers, bracings and vertical connection pin locks",
  "Unsecured scaffolding platform without any board clamps and open gaps on platform as not fully boarded",
  "Incomplete scaffold without secured full boarded platform left unattended and no tagging done",
  "Poorly installed ring lock scaffold with risk of turning over.",
  "Access egress arrangements for the workers toilet water tank found unsafe and no edge protection provided at the roof whilst workers at height for filling water, cleaning tank or for repair/ maintenance. UNIMAC to ensure that safe working at height platform is provided for the water tanks being installed in the laydown area.",
  "Unsecured makeshift wooden access connected to scaffold access tower to reach roof top",
  "Improper scaffold access without adequate drop bar protection",
  "Unsecured makeshift wooden access connected to scaffold access tower to reach roof top",
  "Improper fall protection.",
  "Straight ladder of insufficient height in use as access to scaffolding platform. Ladder not extended 01 meter above of the platform",
  "Inadequate and ladder is being used as a platform to work at height. Workers are exposed to risk of fall from height of 1.5 feet approximately.",
  "No Exclusive zone in the scaffolding area.",
  "Bolt pin is not fitted properly in spigot pin and it may cause scaffolding collapse",
  "Bolt pin is not fitted properly in spigot pin and it may cause scaffolding collapse and fatal injuries to the workers.",
  "People walking below whilst work at height (Scaffold erection) ongoing at height.",
  "Worker are working on scaffold with red rag.",
  "Remover of boulder from the edge.",
  "Fall protection to be provided in work place.",
  "observed that no send berm was installed at the edge of road.",
  "Uncontrolled soil materials falling near another activities below it at zone 2B.",
  "Only one narrow/ inappropriate opening provided for the works inside the foundation steel reinforcement for underpass wall construction.",
  "Excavation fall protection- unprotected ramp access along excavation",
  "Tower light boom stand upward, it lead to fall.",
  "Improper fall protection.",
  "No Fall Protection, it can lead to major incident.",
  "It was observed that an operative was engaged in manual digging activities in an excavation area without proper safe access and egress. There were no visible ladders, steps, or other means provided to safely enter or exit the excavation.",
  "Welfare - Shaded rest area with tilted roof was observed on site",
  "Fall protection - No means of safe access to shaded rest area installed at higher ground level. Inadequate fall protection around welfare to prevent accidental fall from height.",
  "Plywood installed to provide shade at the steel cutting area found not adequately secured and is loose, increasing the risk of falling and potentially causing injury.",
  "Found there is no midtrial at the platform using for internal access to control building",
  "The scaffold was not erected on a leveled surface and wooden supports were used instead of planks at the retaining wall area.",
  "The front and backhoe loader (JCB) was left unattended and used a scaffold tube to support the bucket hydraulics at the office storage area.",
  "The internal access entry ,exit for the control building ,access scaffolding plank mislocated ,",
  "Carpenters were observed working on an incomplete scaffold at the retaining wall area. The scaffold with several deficiencies, including missing ledgers, improper ladder positioning relative to the platform, and top rail not installed.",
  "During our site tour we found one scaffolding uncompleted messing the med rail.",
  "A worker dismantling the scaffolding ,without using proper safety harness",
  "Uncompleted scaffold found at site for shattering installation (Upright is missing)",
  "It was observed that loose planks not removed from the scaffold platform at retaining wall area near entrance gate.",
  "nut& bolt is missing for the scaffolding platform with reattaining wall",
  "Scaffolding with retaining wall 1 without ladder and operative working on the platform",
  "It has been observed scatted materials on access into scaffolding erection area, scaffolders may trip and fall.",
  "observed Improper material management and inadequate scaffold structure without tag.",
  "Opening without cover",
  "Found a scaffolding at Septic without any tag.",
  "Found carpenters using man made ladder to entering inside the septic tank enclosed area",
  "No fall protection of worker working at height",
  "Found a worker who was working at height on the ladder for De-shuttering without any standby person for supporting the ladder purpose. Immediately stopped the activity and educate him how to use of ladder.",
  "Missing Parts of the scaffold such as entry gate (ledger installed as a fall protection) at front of Access Ladder.",
  "Observed that the ladder access of scaffold was blocked with shuttering jack. All the scaffold access must be cleared from obstruction.",
  "It was observed at multiple locations that scaffold was missing diagonal bracing that may effect the structural stability of scaffold.",
  "Fall Protection is missing at F16",
  "An Hiab Operator found driving at site while worker sitting in the back of the truck in open area posing his life in risk of falling from running truck.",
  "Fall protection to be provided @ F16",
  "Base plate is not inserted by the scaffolders while erection of structure. It may lead to collapse of scaffolding structure.",
  "Scaffolding lock pins are missing in the scaffolding structure , being built in the F17 under pass. If a scaffolding structure is not sound , it can be collapsed.",
  "Scaffold components received on site found rusted and unsuitable for working at height.",
  "scaffold ledgers and scaffold boards installed in-between the vertical steel reinforcement for working at height found not secured.",
  "It was observed that the scaffolding sole board was not properly adjusted with the scaffolding.",
  "A worker found working at height on an unsecured straight ladder",
  "Timbers installed on scaffold ledgers inserted through the reinforcement for working at height.",
  "It was observed that the scaffolding material was inadequately placed at site. Action needs to be taken to remove or segregate the material in proper way.",
  "It was observed that the material was stacked on the scaffolding platform. Immediately need to be removed or stacked as per the calculation of scaffolding.",
  "Some workers working on elevated were observed of the following; Not securing 100% anchorage while sitting over the retaining wall (exposed to fall). Worker was tying off incorrectly, refer to the photo attached.",
  "found that the operatives were using the scaffold steel ladder during the working at height for shutter fixing.",
  "Carpenter from concreting team No.2 found walking on the suspended wailing beam with the crane. He was also found not anchoring his harness lanyard to a suitable anchoring point.",
  "It was observed that top rail was missing in the scaffolding.",
  "Found a worker working at height with the support of shutter plywood instead using of ladder.",
  "Scaffold erection sequence not followed, Light weight scaffold loaded with scaffold boards.",
  "Missing Parts of the scaffold such as entry gate (ledger installed as a fall protection) at front of Access Ladder.",
  "FBH lanyard not tie off during the working on the scaffold platform.",
  "Scaffold boards installed found not secured with BRC.",
  "Diagonal Bracing in the scaffold has not been installed as per the requirements where coupler was observed missing at many points particularly in the middle of the bracing pipe.",
  "It has been observed that the pedestrian walkway was blocked due to scaffold scattered material.",
  "A worker found working on top of the construction retaining wall without PFAS removing the plastic caps installed on the starter bars",
  "It has been observed that the loose material was stored on the incomplete scaffolding platform.",
  "Scaffold & Shuttering material was observed scattered underneath the scaffold in UP 15. Any accidental fall from height will increase the severity of injury.",
  "It has been observed that the wire is in contact with the scaffold standard.",
  "Scaffold materials were observed scattered along the way.",
  "A worker was exposed to a fall hazard due to the use of inappropriate PPE (full body safety harness).",
  "It was observed that loose material was placed on the scaffolding platform.",
  "It was observed that the scaffold was lacking its top rail.",
  "It has been observed that the scaffold access was blocked due to the timbers were placed there.",
  "It was observed that the gap between the standards (vertical posts) on the top rail of the scaffolding exceeds 4 meters.",
  "Scaffold erection ongoing at the third lift and right below steel fixer found erecting steel at the second lift.",
  "An electric wire has been observed in contact with a scaffold.",
  "A clamp that was not properly fitted and secured to the scaffold plank and ledger was discovered, which can affect the rigidity of the scaffold.",
  "Carpenters involved in installing ACROW form works for construction of retaining wall found using unsecured straight scaffold ladders without hooks.",
  "Scaffold materials were observed scattered along the pathway.",
  "Work at height violation was observed where carpenters were found working on the top rung of ladder without installing cantilever platform.",
  "Found steel fixers were working at height on the inappropriate scaffolding platform.",
  "It has been observed that several wood was placed on top of the scaffold.",
  "It has been observed that an excessive amount of wood was placed on the scaffold platform.",
  "It was observed that the worker was use of unsecure and damage ladder.",
  "A potentially dangerous and unsuitable platform has been identified in the F 14 area.",
  "Steel fixers were using an unsuitable ladder (a straight ladder).",
  "It has been observed that the scaffold board clamp was open.",
  "Carpenter was observed using ladder above the platform to reach on height instead of scaffold platform.",
  "It has been observed that scaffold materials are dispersed across the work zone, including at access and egress points.",
  "Scaffold inspector found on site with long boots with no steel toe and sole.",
  "It was observed that the lifting crew were loaded the material on the scaffolding platform.",
  "Found inappropriate scaffolding platform in F01 area.",
  "Poor access egress with loose steps that my lead to fall of the personnel that will lead to injuries.",
  "Scaffolds tagged green (safe to use) found with inappropriately installed ladders (Not complying to 1:4 ratio) and missing scaffold boards on the cantilever platform leading to working at height on single unsecured board.",
  "It has been observed that the wire was in contact with the scaffold standard.",
  "It was observed that the scaffolding platform clamps were not secured.",
  "It was observed that scaffolding ledgers were positioned on the scaffold platform.",
  "It has been observed that the wire is in contact with the scaffold standard.",
  "An electric wire was observed in contact with a scaffold standard, posing a risk of a short circuit."
];

console.log('=== Working at Height UNCLASSIFIED Factor Detection Test (123 observations) ===\n');

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

if (failures.length > 0) {
  console.log('\n=== STILL UNCLASSIFIED (' + failures.length + ') ===');
  failures.forEach(f => {
    console.log(f.num + '. "' + f.obs + '..."');
  });
}
