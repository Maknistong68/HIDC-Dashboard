const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "It is observed Al- Harabi contractor assigned around 20 electrician for installing power cable and all site electrical work without certified and no evidence that all electrician attend competent training.",
  "Improperly spliced power cable connecting portable generator and HDPE pipe jointing tool.",
  "Appliance's bare cable strands directly inserted into power outlet as means of tapping power supply.",
  "unsafe electrical cable",
  "Cables coiled and trailed across the access",
  "it was observed live cables were scattered on the walkway and directly connected with the metal which result in electrocution.",
  "Plugless power cable wire strand directly inserted into power source.",
  "unsafe electrical connection was observed near swimming pool area. All damaged electrical cables should be removed from site.",
  "Exposed and unprotected power cable from Tamimi Global generator to it dining cabin.",
  "unsafe electrical cable",
  "During camp inspection of Al- Harbi camp #3 observed open electrical socket and using improper cable plug at Room # L13",
  "During the inspection, it was observed that unsafe electrical cables were in use.",
  "Welding generator with damaged power cords and cable extension drums used on site",
  "Earthing (grounding) cable of tower light generator not connected whist being used for power supply",
  "During the inspection, it was observed that unsafe electrical cables were in use.",
  "Electrical cables with taped joint of exhaust fan was observed inside clinic bathroom",
  "Non IP rated power outlets without built in fuse and cables without secondary insulation sleeve trailed between table legs in use as extension for office electronic devices.",
  "Tower light generator's Earth cable coiled around earth rod instead of fastening using earthing clamps and end protection caps for sharp earth rod.",
  "Tower light generator operated on site without connection earthing cable (Generator not grounded).",
  "Electrical DB has been provided at site but without cement board protection to avoid any fire risk in wooden DBs. Moreover, trailing cables have been observed at site at multiple locations causing tripping hazards as well posing risk of damage to electrical cables.",
  "Improper electrical connection to switch board. The AC cable was connected to switch board unsafely.",
  "Electrical cable without plug in (Bare cable) connected to power outlet and cable drum with \"Don't Use\" tag used on site",
  "Unsafe cable splicing. Cables with different gauge connected without proper connectors and no external sleeves",
  "Improper earthing provided to Genset. Earthing cable was not sufficiently dug into the ground.",
  "Loose connection in Tower Light Cables as well there is no earthing and bonding provided in Toer Light Generators.",
  "It was observed that for the tower light the electrical cables had a joints and these are wrapped with tapes, Contractor to rectify this issues there shall not be any joints as leakage current can cause injury or electrical shock.",
  "Poor cable management at the work locations. Electrical cables found trailing through walkways and work areas with risk of slip trip and fall.",
  "During the inspection, it was observed that the damaged electrical cables and unsafe extension cords were maintained on the site.",
  "During the inspection, it was observed that the damaged electrical cables and unsafe extension cords were maintained on the site.",
  "During our site visit, t was evident live electrical cables are scattered beside the walkway. which may result in slip/trip hazards.",
  "Bare electrical cables without plugins directly connected to power source",
  "Three ways industrial plug is being used for the work, that heating up the electric cables that may cause to fire and explode.",
  "Unsafe electrical joints to draw electricity to operate grinders, no electrical safety device in the circuit to prevent earth leakage or overload. domestic plugs and socket in use. Electrical cable Joints covered with polythene sheet and insulation tape. Angle grinders in use not subjected to PAT testing and periodical inspections by authorized electrician.",
  "Generator earthing (Grounding) not connected and power supply cables without external weather protection sleeve being used on site.",
  "Electric cables are lying on the reinforcement area and may cause trip & slip hazard for workers.",
  "Electrical cables with taped joints used on site",
  "Unsafe electrical DB for the crusher with live electric circuits exposed. Live cables joined with insulation tape touching the sharp metal edge without protection.",
  "observed live electrical cable laying on the water blader",
  "Poor cable management.",
  "Poor cables management, arrange it in proper way.",
  "Poor cables management, it may cause to slip, trip fall, electrocution and fire.",
  "Cable is laying on ground.",
  "Improper electrical cable joint. The power cable was joined by tape.",
  "Poor cable management- Cables are laying on earth.",
  "Observe electrical cable connected with distribution board was not insulated & overloaded.",
  "Electrical DB is damaged and is lying on the ground while earthing rod is also just not properly fixed. This can lead to electric shock and may lead to fire as well.",
  "Power hand tools in use with damaged cables protected with shuttering tape.",
  "Cable are in laying in ground",
  "Poor cable management",
  "Electrical cables are laying on ground",
  "Poor cable management,",
  "Poor cable management, arrange it in proper way.",
  "It was observed that an electrical cable buried in the ground was not properly grounded, posing a risk of trip hazards and potential electric shock if the cable becomes damaged.",
  "It was observed that the cable was not properly fixed to the industrial plug, posing a potential electrical hazard.",
  "Electrical Safety - Power tools without evidence of inspection and power supply cables with taped joints and missing plugs",
  "Electrical Safety - Electrical cables with taped joints used for CF pump power supply",
  "Electrical safety - No earthing for portable generator, domestic electrical accessories and bare cable without plug directly connected to power outlet",
  "Electrical safety - Electrical power cables with taped joints in use for CF pump",
  "During the weekly project management walkthrough it was observed that all the toilets including the common toilets the electrical prong wire is directly inserted into the main supply. Contractor is advised that all electrical cables to have proper sockets and this to be inspected by electrican",
  "Electrical Safety - Electrical power cables with taped joints an without secondary sleeve protection in use for air conditioning system power supply",
  "During the mock drill held on the site near the security gate Monday 26th of August (Fire in the Generator), a trip hazard was identified, posing a potential risk to participants. The hazard was located in front area of the diesel generator (A loose cable was found on the floor, creating a tripping risk for individuals that responding to the incident). No injuries were reported, but the potential for an accident was significant.",
  "It was observed that electrical cables not protected adequately from the stones and exposed. This will lead to damage cables insulation at ISF working area. Contractor shall ensure that all temporary electrical cables shall protect flexible conduct to prevent damage to the cable insulation and ensure that buried where possible to prevent damage.",
  "During our site inspection we found electrical cables distributed at site.",
  "found Electrical cable without any inspection",
  "poor cable management at site",
  "Damage power cable found at warehouse ,using angle grinder with damage power cable",
  "It has been observed damage industrial socket extension board using for power cable",
  "Electric cables are lying on metal scaffolds and fences, which can pose electrical hazards such as shocks, short circuits, or fire risks.",
  "Observed poor electric cable management at the site.",
  "On January 5, 2025, at approximately 03:03 PM, near the old highway by the seaside, the excavator operator began excavation for a trial pit for the thrust boring. During the operation, the operator accidentally cut an underground STC cable. The damaged cable was reported to STC and repaired by the STC maintenance team. No injuries were sustained related to the incident.",
  "Poor cable management observed, with cables lying on the ground, creating tripping and electrical hazards.",
  "The electric cable was observed placed on the rebar and not properly elevated, which poses a risk of damage to the cable or electrical hazards.",
  "A damaged cable was found with the inner wire exposed, in contact with the fence.",
  "An electric cable was observed lying directly on the fence without an insulated hook, which could damage the cable and cause an electric current hazard.",
  "The cord cable was observed on-site without the required inspection color code, indicating it may not have undergone proper safety checks.",
  "An exposed live electrical cable coming from the generator. This presents a serious electrical shock hazard to workers and anyone else in the area. The exposed cable can also lead to fires or equipment damage if it comes into contact with other objects or surfaces.",
  "Wood debris was observed near the generator, posing potential fire and safety hazards.",
  "The electric cables and distribution board have not been inspected or color-coded for the quarterly safety check.",
  "the electric cable was not properly arranged.",
  "The cable was placed on the scaffold platform, which can hinder safe movement and pose electrical hazards.",
  "The electric cable was found lying on a wet surface and was not properly elevated.",
  "Several electrical cables are lying on the scaffold and fence. If a damaged cable comes into contact with a conductor, it could pose a risk of electrocution to workers who may come into contact with the metal structures.",
  "Damaged electrical tools were stored on-site without clear identification signs to restrict their reuse, potentially leading to safety hazards.",
  "The electrical cable was elevated using a bending wire, which could cause damage to the cable and pose an electrical hazard.",
  "Remove the damaged cables from the site immediately and replace them with new, properly insulated cables.",
  "Observed damaged cable with taped insulation being used on-site.",
  "damaged cable was found on the site.",
  "The electric cable was lying on the ground on-site, posing a risk of tripping and electrical hazards.",
  "Cables used for chipping activity not hanging properly",
  "Poor arrangement of the office in the storage, cables and water cattle next to the electricity",
  "It has been repeatedly observed that a live electrical socket powering a filtered water cooler is directly connected to the cooler's steel body without any form of insulated protection. This creates a significant electrical hazard, especially given the proximity of water and the conductive metal surface.",
  "Tangled and unnecessary cables, along with improper storage of gas cylinders. Electrical wires are in contact with metal or conductive materials and not elevated to the required height.",
  "Several damaged and spliced electrical cables and switches have been observed inside the security cabin. The splicing appears to be done without proper insulation or protective casings, exposing conductors and increasing the risk of accidental contact.",
  "Found a damaged electrical cable.",
  "An electrical distribution panel and its associated cables were found installed in close proximity to a water source. This positioning presents a potential risk of exposure to moisture and electrocution.",
  "A live electrical socket was found in direct contact with a portable cold water cooler. The cooler was placed in a manner that exposed the plug and socket to possible condensation or water leakage, creating an unsafe condition with potential for electrical shock, short-circuiting, or fire.",
  "It was observed that some operatives were using electrical cables with exposed conductors connected directly to a generator, bypassing the use of industrial plugs or appropriate connectors. The connection lacked proper insulation and was not protected from environmental exposure.",
  "Observed that the electrical distribution board was not grounded and had improper cable management.",
  "Electrical cables were found poorly managed—tangled, loosely hanging, and unsecured—creating trip hazards and making rerouting or maintenance difficult and unsafe.",
  "During a routine site inspection, it was observed that there were no proper caution signs displayed on the electrical panels. This poses a serious safety hazard as it may lead to unauthorized access, electric shock, or accidents due to unawareness of the danger.",
  "An electrical cable connected to the generator was found exposed, lacking proper cable gland and without double insulation.",
  "Live electrical cables are in contact with any metal surfaces, especially on manlifts which could lead to electrocution. Please install insulation on railings where the cables are attached.",
  "Several electrical cables are used on site, but there is no evidence of inspection, such as color codes, to indicate they have been checked and deemed safe for use.",
  "1. Electrical cables are poorly managed, tangled, hanging loosely, and not secured, posing trip hazards, complicating the rerouting. 2. Some cables are draped over scaffolding components and sharp edges, increasing the risk of insulation damage, electric shock to the workers on thr platform. 3. Argon hose also mixed with tangled electrical cables.",
  "A loose cable connection was observed at an electrical industrial socket, posing a risk of electrical shock, fire, or equipment malfunction.",
  "An electrical panel was observed without any restriction or preventive measures in place, as no barrier was installed to prevent unauthorized access by workers, posing a potential safety hazard.",
  "Initially, the wire cable connected to the generator was found without an industrial plug, creating a potential electrical hazard due to improper termination.",
  "A loose electrical cable connection was observed at the industrial plug, posing risks of electric shock, short circuit, or equipment malfunction.",
  "An electrical cable was found with an outdated inspection color code, indicating it may not have undergone current safety verification and posing a potential electrical hazard.",
  "An energized electrical connection supplying power to the security cabin and a portable water cooler was found to be exposed, with no proper distribution board in place. Power was being drawn via a single jointed connection from the generator, which was used for multiple loads simultaneously without appropriate electrical safety controls or segregation.",
  "observed poor cable management at site.",
  "observed improper cable management at work site which could lead to risk of slip and trip to personnel.",
  "Improper electrical cable management was observed at the site.",
  "Energized and Power Tools: Use of domestic type outlet/electrical connections - Domestic type cabling, connectors and sockets are prohibited in construction areas and power Tools not inspected and color coded. Advice to contractor management to conduct \"Call to action Campaign\" regarding the \"Energized system and power tools.\"",
  "An electrical joint was found in the grinder's power cable. This poses a potential risk of electrical shock or equipment failure.",
  "Trailing cables from cutting and grinding are laid on the ground without any control measures in the offices areas. Workshop shall be setup immediately to avoid personnel working in any given area for the sheet and form works. All trailing cables shall be removed and recurrence shall be avoided in the future.",
  "During a site walkthrough, It has been observed worn electrical cable used around the generators area. The contractor was requested to replace it immediately.",
  "During a random inspection an electrical extension cable was found improper routed.",
  "unsafe electrical connection and overloading observed on the car wash steel structure asset as two cables are connected together on the same socket. furthermore, there is no protection of the exposed areas on the cables. SHAR should remove any substandard or wrong connections from site. SHAR TO CONTROL the site tools from the site entrance by inspection of all tools and equi0ment before let it to enter the site.",
  "During site inspection observed a portable generator using at site without grounding, and not provided fire extinguisher and spill tray",
  "Observed a portable generator is using for surface preparation group and not provided adequate ground and no fire extinguisher and Improper cable connection observed inner core wire without double insulated.",
  "Found the workers was using damaged cable at workplace. Immediately need to be removed from the site.",
  "Poor electrical management system, observed an electrical cable crossing from the pedestrian walkways at a very low height near the F17 Area, electrical cables shall be managed safely.",
  "It was observed that the electrical cable was connected with the generator in wrong method. Ensure that all the electrical cables must be connected with portable generator at site through industrial socket.",
  "Observed that the cable was left unattended at ground, need to remove.",
  "Electrical cable was laying on the floor without conduit and hanging stand it may cause falling and tripping hazards. To prevent the falling hazards must be removed from the floor or hanged on the wooden stand.",
  "It was observed that electrical cable was lying on the ground with contact of metal. It should be at height hanged on stand to prevent the fire and electrocution hazards.",
  "Observed that electrical cable laying on the floor without conduit protection. Need to be removed and hanged on stand.",
  "Observed that the electrical cable was hanged on the steel rebars.",
  "It has observed that terminal block connector was using instead of industrial socket. All the live electrical cable must be used by industrial socket.",
  "It has observed that the live electrical cable was laying with the contact of metal. It must be hanged on the wooden stand.",
  "Damaged Electrical DB was observed in use at site, upon inspection of ELCB it was notice that ELCB was not operational, and no internal periodic inspection was carried out by the contractor as well all cables were observed trailing on the steel cages having potential risk of electrocution.",
  "UNIMAC- Poor electrical management system- low heighted extended electrical cables observed, causing obstruction, the contractor is advised to safely arrange the electrical cable to avoid the risk of damage/electrocution.",
  "Live electrical cables are laying on the ground and may cause any electrical shocks or a trip, slip hazard.",
  "Electrical cable laying on the floor without any conduit protection and hanging stand. Electrical cable shall be protected and hanged on wooden stand.",
  "Temporary live electrical cable found on the steel cage.",
  "Electrical cables are lying in the pathway and may cause trip, slip and electrical hazards.",
  "It was observed that the electrical cable was lying on the floor without any protection. It may cause fall, slip, and trip hazards. It must be hanged on the wooden stand.",
  "Damaged electrical cables concealed with tapes found in use to operate power hand tools. Flexible electrical cables found trailing through steel structures with risk of electrical short circuit and electrocution.",
  "It has observed that the electrical cable was lying on the floor without protection. It may cause trip and fall hazards.",
  "Temporary electrical DBs found with unserviceable ELCBs. The flexible cables are trailing through erected steel and scaffolds for construction of retaining wall and has a high potential of risk due to electrical short circuit and electrocution.",
  "It was noticed that live electrical cable was lying on the bundle of steel rebars at workplace.",
  "It was observed that the electrical cable placed on the steel was causing tripping and short circuit hazards.",
  "A live electrical cable was found draped over the scaffolding, posing a risk of electrocution.",
  "An electrical cable was found placed on the scaffold material with risk of electrocution to workers.",
  "It was noticed that live electrical cable in contact with the protruding steel rebars.",
  "Live electric flexible cables found training to cup lock scaffolds with risk of short circuit and electrocution.",
  "Electrical cable was found damaged in F 14 area",
  "Found unsecured electrical cable risk of fire, electrocution, and tripping hazards.",
  "An electric cable was observed lying across the pathway.",
  "An electrical cable was found on a scaffolding structure, posing a risk of electrocution."
];

console.log('=== Energized System Factor Detection Test (151 observations) ===\n');

let housekeepingDetected = 0;
let maintenanceDetected = 0;
let trainingDetected = 0;
let otherFactors = 0;
let noFactors = 0;
const failures = [];

observations.forEach((obs, i) => {
  const factors = detectContributingFactors(obs);
  const hasHousekeeping = factors.includes('Housekeeping');
  const hasMaintenance = factors.includes('Maintenance');
  const hasTraining = factors.includes('Training');

  if (hasHousekeeping) housekeepingDetected++;
  if (hasMaintenance) maintenanceDetected++;
  if (hasTraining) trainingDetected++;

  if (!hasHousekeeping && !hasMaintenance && factors.length > 0) {
    otherFactors++;
  } else if (factors.length === 0) {
    noFactors++;
    failures.push({ num: i + 1, obs: obs.substring(0, 80), factors });
  }
});

console.log('=== RESULTS ===');
console.log('Housekeeping detected:', housekeepingDetected, '(' + Math.round(housekeepingDetected/observations.length*100) + '%)');
console.log('Maintenance detected:', maintenanceDetected, '(' + Math.round(maintenanceDetected/observations.length*100) + '%)');
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
