const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "Improperly spliced power cable connecting portable generator and HDPE pipe jointing tool.",
  "Appliance's bare cable strands directly inserted into power outlet as means of tapping power supply.",
  "unsafe electrical cable",
  "unsafe electrical joint on the site",
  "it was observed live cables were scattered on the walkway and directly connected with the metal which result in electrocution.",
  "Torn/broken mesh of perimeter security fence.",
  "Plugless power cable wire strand directly inserted into power source.",
  "During our site visit, the highly unsafe electrical connection was evident, which could result in an electrocution or fire incident.",
  "unsafe electrical connection was observed near swimming pool area. All damaged electrical cables should be removed from site.",
  "unsafe electrical cable",
  "During camp inspection of Al- Harbi camp #3 observed open electrical socket and using improper cable plug at Room # L13",
  "recently inspected the IT building site and discovered that the contractor is using unsafe electrical connections.",
  "Contractor failed to provide power supply on all entrance gates. Due to unavailability of power, AC, floodlights, CCTV cameras and electrical accessories are not functioning.",
  "Earthing was not provided to generator. Neutral of the generator was not grounded.",
  "During the inspection, it was observed that unsafe electrical cables were in use.",
  "Improper earthing provided to Genset. Earthing rod was not sufficiently dug into the ground.",
  "Welding generator with damaged power cords and cable extension drums used on site",
  "Earthing (grounding) cable of tower light generator not connected whist being used for power supply",
  "Control panel board on generator was not fixed properly on the generator. Loose control panel board was observed flapping due to vibration of generator.",
  "During the inspection, it was observed that unsafe electrical cables were in use.",
  "Electrical cables with taped joint of exhaust fan was observed inside clinic bathroom",
  "Non IP rated power outlets without built in fuse and cables without secondary insulation sleeve trailed between table legs in use as extension for office electronic devices.",
  "Damaged domestic electrical extension cord with Don't Operate tag by safety team used on site by MEP crew",
  "Tower light generator's Earth cable coiled around earth rod instead of fastening using earthing clamps and end protection caps for sharp earth rod.",
  "During the weekly project management walkthrough it was observed that a worker was doing repair works for the tower lights. Contractor was advised that only trained and competent electrician are allowed",
  "Portable generator without earthing, drip tray and domestic power supply outlet being used on site",
  "Electrical panel board was not fixed properly on the generator. The panel board was loosely installed and shaking severely during operation.",
  "Electrical plug point was broken Live electrical connection was exposed.",
  "Tower light generator operated on site without connection earthing cable (Generator not grounded).",
  "Multiple electrical connection with industrial socket, its lead to fire.",
  "6mm steel rebar in use as for earthing instead of copper earthing rod",
  "No proper earth clamp for earthing connection. Earth wire coiled around earth rod",
  "Electrical DB has been provided at site but without cement board protection to avoid any fire risk in wooden DBs.",
  "Unsafe electrical connection - Y connectors for power distribution",
  "Improper electrical connection to switch board. The AC cable was connected to switch board unsafely.",
  "No earthing (grounding) for tower light generator",
  "Multiple power cords connected to single power outlet using single female connector",
  "Defective non-IP rated domestic plugin used for power supply",
  "Electrical cable without plug in (Bare cable) connected to power outlet and cable drum with Don't Use tag used on site",
  "Air compressor without whiplash arrestor and safety guard being used on site. One air compressor was having oil leakage.",
  "Overloading of electrical connection with tower light generator without installing any safety devices to get the circuit tripped in case of any current leakage.",
  "Unsafe cable splicing. Cables with different gauge connected without proper connectors and no external sleeves",
  "Improper earthing provided to Genset. Earthing cable was not sufficiently dug into the ground.",
  "Loose connection in Tower Light Cables as well there is no earthing and bonding provided in Toer Light Generators.",
  "Electrical cord with taped joint in use for power supply",
  "It was observed that for the tower light the electrical cables had a joints and these are wrapped with tapes",
  "During the inspection, it was observed that the damaged electrical cables and unsafe extension cords were maintained on the site.",
  "No earthing (grounding) provided for tower light generator used for power supply",
  "No earthing (grounding) and drip tray for portable welding generator",
  "During the inspection, it was observed that the damaged electrical cables and unsafe extension cords were maintained on the site.",
  "Defective non IP rated domestic electrical plugins in use for extension power supply",
  "Bare electrical cables without plugins directly connected to power source",
  "Three ways industrial plug is being used for the work, that heating up the electric cables that may cause to fire and explode.",
  "Unsafe electrical joints to draw electricity to operate grinders, no electrical safety device in the circuit to prevent earth leakage or overload.",
  "During inspection it was observed, an unsafe electrical connection being used- should be rectified.",
  "Improper earthing.",
  "Generator earthing (Grounding) not connected and power supply cables without external weather protection sleeve being used on site.",
  "Bare wire inserted into the electrical outlet.",
  "Defective wheels of portable generator and no drip tray available",
  "Recently conducted an inspection and observed one portable generator with a faulty electrical wire connection.",
  "No periodical maintenance records posted for the electrical generator.",
  "Electrical cables with taped joints used on site",
  "Unsafe electrical DB for the crusher with live electric circuits exposed. Live cables joined with insulation tape touching the sharp metal edge without protection.",
  "The temporary electrical distribution panel was open- Non-availability of signages or isolation is evident.",
  "Unsafe electrical connections with no periodical inspections carried out even after repeated notifications.",
  "Locking device installed for the electrical generator and Electrical DB to ensure LOTO pad locks can be installed during repair and maintenance of crushers.",
  "Inappropriate periodical maintenance records maintained for the crusher electrical generator.",
  "Improper electrical cable joint. The power cable was joined by tape.",
  "Electrical DB is damaged and is lying on the ground while earthing rod is also just not properly fixed.",
  "Power hand tools in use with damaged cables protected with shuttering tape.",
  "Repair and maintenance operation was continued on one of the crushers without following isolation (LOTO) procedure. Generator was running, no breaker was off, No LOTO PTW implemented, No supervision.",
  "Observed that earthing rod clamp is not installed with plant lead.",
  "Well maintained generator checklist",
  "During site inspection, it was observed that an industrial plug was placed in an open area.",
  "It was observed that an electrical cable buried in the ground was not properly grounded.",
  "It was observed that the cable was not properly fixed to the industrial plug, posing a potential electrical hazard.",
  "Distribution panel has been installed on the generator to prevent direct connections between main power source and equipment.",
  "Electrical appliances, including the portable generator and exhaust fan, are not being inspected regularly by a competent person.",
  "It was observed that power tools were being connected using non-industrial plugs and extension cords.",
  "Electrical Safety - Power tools without evidence of inspection and power supply cables with taped joints and missing plugs",
  "Electrical Safety - Electrical cables with taped joints used for CF pump power supply",
  "Electrical safety - No earthing for portable generator, domestic electrical accessories and bare cable without plug directly connected to power outlet",
  "Electrical safety - Electrical power cables with taped joints in use for CF pump",
  "During the weekly project management walkthrough it was observed that all the toilets including the common toilets the electrical prong wire is directly inserted into the main supply.",
  "Electrical Safety - Electrical power cables with taped joints an without secondary sleeve protection in use for air conditioning system power supply",
  "Generator found near security cabin with damaged drip tray where there is chance of oil leakage to occur.",
  "electrical competent person with safety manager inspecting the earthing of generator and fuel tank",
  "electrical competent person detail, inspection tag and single line diagram updated on main distribution panel",
  "Generator found at control building with damaged drip tray where there is chance of oil leakage to occur. Grounding not provided.",
  "It was noticed that rebar cutting machine having oil leakage, drip tray and fire extinguisher not provided.",
  "proper Earthing to generator has been provided and rod is properly attached with earthing cable through earthing clamp",
  "found operative using open wire without industrial socket at work place",
  "Earthing rods with clamps installed in proper way to release the static electricity and protect our workers from electrical shock.",
  "The air compressor's third-party certificate was found expired, and internal maintenance inspection records were not updated.",
  "found The air compressor without drip tray",
  "during the safety inspection observed The air compressor at workplace without grounding.",
  "It was observed that earthing rod clamps not installed which causing provided earthing ineffective at offices area.",
  "It has been observed damage industrial socket extension board using for power cable",
  "During our safety inspection we found one of the industrial sockets damaged that may pose electrical hazard.",
  "Replace or repair the damaged junction box at the TSF area immediately to eliminate the electrical hazard.",
  "On January 5, 2025, the excavator operator began excavation for a trial pit for the thrust boring. During the operation, the operator accidentally cut an underground STC cable.",
  "improper electrical connection of kettle was found inside the store office",
  "An unsafe and unsecured electrical connection was found near the site security cabin area.",
  "A damaged cable was found with the inner wire exposed, in contact with the fence.",
  "An exposed live electrical cable coming from the generator. This presents a serious electrical shock hazard.",
  "The daily checklist for the electrical panel was not updated regularly.",
  "The electric panels on-site were observed not properly locked, exposing them to unauthorized access.",
  "Several electrical cables are lying on the scaffold and fence.",
  "Damaged electrical tools were stored on-site without clear identification signs to restrict their reuse.",
  "Remove the damaged cables from the site immediately and replace them with new, properly insulated cables.",
  "Observed damaged cable with taped insulation being used on-site.",
  "damaged cable was found on the site.",
  "The electrical panel was observed unlocked and left open, allowing access to all workers.",
  "It was observed that a DG was available with the updated checklist, with the installation of soft barriers, signages and earthing grounding installed",
  "A loose connection was noticed in the electrical panel, which can lead to electrical faults, fires, or equipment failure.",
  "It was observed that the generators in Area 3 were not properly shaded, which can lead to overheating.",
  "The electrical panel located in Area 3 lacks proper protection and stability.",
  "It has been repeatedly observed that a live electrical socket powering a filtered water cooler is directly connected to the cooler's steel body without any form of insulated protection.",
  "Tangled and unnecessary cables, along with improper storage of gas cylinders.",
  "Several damaged and spliced electrical cables and switches have been observed inside the security cabin.",
  "Found a damaged electrical cable.",
  "An electrical distribution panel and its associated cables were found installed in close proximity to a water source.",
  "An electrical panel in Area 2 was found unsecured and not yet properly fixed.",
  "An exposed and damaged live electrical extension was found in use inside the site security cabin.",
  "A live electrical socket was found in direct contact with a portable cold water cooler.",
  "It was observed that some operatives were using electrical cables with exposed conductors connected directly to a generator.",
  "Observed that the electrical distribution board was not grounded and had improper cable management.",
  "Electrical panel on the new container in A2 kept open and no signages installed.",
  "Electrical cables were found poorly managed—tangled, loosely hanging, and unsecured.",
  "A steel cutting and binding machine was found in use without any internal inspection record available.",
  "During a routine site inspection, it was observed that there were no proper caution signs displayed on the electrical panels.",
  "An electrical cable connected to the generator was found exposed, lacking proper cable gland and without double insulation.",
  "improper non effective earthing on concrete for the small panel on A1-C06",
  "Several electrical cables are used on site, but there is no evidence of inspection, such as color codes.",
  "During the site inspection, it was observed that the earthing wire of a steel cutting machine was not connected to the ground.",
  "A loose cable connection was observed at an electrical industrial socket.",
  "An electrical panel was observed without any restriction or preventive measures in place.",
  "Initially, the wire cable connected to the generator was found without an industrial plug.",
  "A/C water leaking on electrical wire in security cabin",
  "A loose electrical cable connection was observed at the industrial plug.",
  "An electrical cable was found with an outdated inspection color code.",
  "During the morning site inspection, it was observed that the earthing rod was not properly driven into the ground.",
  "During site inspection, it was observed that color coding was missing on several power tools.",
  "Improper electrical cable management was observed at the site.",
  "Energized and Power Tools: Use of domestic type outlet/electrical connections",
  "Found a portable generator working at site without grounding, Drip Tay and Fire Extinguisher.",
  "It has been observed a portable generator using at site without grounding and rotating parts not covered properly.",
  "During a site walkthrough, It has been observed worn electrical cable used around the generators area.",
  "It has been observed the contractor is using an electrical panel with out an automatic electric breaker.",
  "Found domestic socket and plug using at site construction purpose.",
  "unsafe electrical connection and overloading observed on the car wash steel structure asset",
  "During site inspection observed a portable generator using at site without grounding, and not provided fire extinguisher and spill tray",
  "Observed a portable generator is using for surface preparation group and not provided adequate ground and no fire extinguisher",
  "LOTO has been implemented on all electrical panels at site.",
  "Found a tower light genarator using at site without grounding.",
  "Found the workers was using damaged cable at workplace. Immediately need to be removed from the site.",
  "It was observed that the electrical cable was connected with the generator in wrong method.",
  "Tower lights in use at site for drawing electricity to operate power hand tools found without grounding.",
  "Unserviceable ELCB installed for the temporary electrical DBs continue even after repeated notification.",
  "It was observed that the earthing rod was missing with the tower light mast.",
  "It has observed that terminal block connector was using instead of industrial socket.",
  "Unsafe electrical generator for crusher No.2 Emergency stop button found unserviceable. No periodical preventive maintenance posted.",
  "Unsafe electrical connections for the industrial socket in shutter fabrication are by the new concreting team.",
  "Damaged Electrical DB was observed in use at site, upon inspection of ELCB it was notice that ELCB was not operational.",
  "Electrical DB is broken and kept over the generator and causing a serious hazard of electrification and fire.",
  "Observed that the drip tray, earthing rod connected and fire point was provided with the tower light generator.",
  "Poor/ No grounding for the tower lights in use to draw electrical power to operate power hand tools.",
  "A maintenance operation was in progress in the crusher machine where poor safety controls were implemented.",
  "At Shuttering area – Two workers were found doing electrical installation works and they were not trained.",
  "Crusher operator found involved in crusher repair works with no LOTO permit or its compliance.",
  "ELCB installed for the 04 electrical distribution boards continues unserviceable.",
  "It was observed that the tower light mast was being used without earthing/bonding.",
  "Damaged electrical cables concealed with tapes found in use to operate power hand tools.",
  "Found that the worker was using the power tool with damaged wire.",
  "Temporary electrical DBs found with unserviceable ELCBs.",
  "Damaged electrical wire was found in the carpenter workshop area.",
  "The electrical cable was observed properly maintained at the workplace.",
  "The tower lights were found to be adequately earthed, and the distribution boards were equipped with serviceable (ELCBs).",
  "The wire of the circular saw was found to be damaged in the carpenter workshop area.",
  "Electrical cable was found damaged in F 14 area",
  "The electrical wire of the grinder was found damaged and exposed",
  "Tower lights have been adequately earthed, the fire extinguisher has been updated for June, a drip tray was available.",
  "Tower light generator equipped with a drip tray, fire extinguisher, and earthing rod was available.",
  "Third party certificate for the air compressor in use at site found expired. Air hose joints found not secured with whip latch.",
  "A tower light was found without a drip tray and an earthing rod.",
  "It was noticed that the circular saw wire was damaged and in use.",
  "Electrical DBs and tower lights not subjected to monthly inspections.",
  "Tower lights used for drawing electric power to operate power hand tools continue without earthing/ grounding."
];

console.log('=== Energized System MAINTENANCE Factor Detection Test (188 observations) ===\n');

let maintenanceDetected = 0;
let housekeepingDetected = 0;
let inspectionsDetected = 0;
let permitDetected = 0;
let trainingDetected = 0;
let otherFactors = 0;
let noFactors = 0;
const failures = [];
const missingMaintenance = [];

observations.forEach((obs, i) => {
  const factors = detectContributingFactors(obs);
  const hasMaintenance = factors.includes('Maintenance');
  const hasHousekeeping = factors.includes('Housekeeping');
  const hasInspections = factors.includes('Inspections');
  const hasPermit = factors.includes('Permit');
  const hasTraining = factors.includes('Training');

  if (hasMaintenance) maintenanceDetected++;
  if (hasHousekeeping) housekeepingDetected++;
  if (hasInspections) inspectionsDetected++;
  if (hasPermit) permitDetected++;
  if (hasTraining) trainingDetected++;

  if (!hasMaintenance) {
    missingMaintenance.push({ num: i + 1, obs: obs.substring(0, 100), factors });
  }

  if (!hasMaintenance && !hasHousekeeping && factors.length > 0) {
    otherFactors++;
  } else if (factors.length === 0) {
    noFactors++;
    failures.push({ num: i + 1, obs: obs.substring(0, 80), factors });
  }
});

console.log('=== RESULTS ===');
console.log('Maintenance detected:', maintenanceDetected, '(' + Math.round(maintenanceDetected/observations.length*100) + '%)');
console.log('Housekeeping detected:', housekeepingDetected, '(' + Math.round(housekeepingDetected/observations.length*100) + '%)');
console.log('Inspections detected:', inspectionsDetected, '(' + Math.round(inspectionsDetected/observations.length*100) + '%)');
console.log('Permit detected:', permitDetected, '(' + Math.round(permitDetected/observations.length*100) + '%)');
console.log('Training detected:', trainingDetected, '(' + Math.round(trainingDetected/observations.length*100) + '%)');
console.log('Other factors only:', otherFactors);
console.log('No factors:', noFactors);
console.log('Total coverage:', (observations.length - noFactors), '(' + Math.round((observations.length - noFactors)/observations.length*100) + '%)');

if (failures.length > 0 && failures.length <= 20) {
  console.log('\n=== OBSERVATIONS WITH NO FACTORS ===');
  failures.forEach(f => {
    console.log(f.num + '. "' + f.obs + '..."');
  });
}

if (missingMaintenance.length > 0) {
  console.log('\n=== OBSERVATIONS MISSING MAINTENANCE FACTOR (' + missingMaintenance.length + ') ===');
  missingMaintenance.forEach(f => {
    console.log(f.num + '. "' + f.obs + '..." => [' + f.factors.join(', ') + ']');
  });
}
