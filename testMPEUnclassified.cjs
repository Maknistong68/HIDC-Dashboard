const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const observations = [
  "Crew on top of pre-cast concrete foundation from trailer bed for offliading in awkward position and without protection from falling.",
  "It is observed a loader operator cover his wind sheild with curtain.",
  "It has been observed the contractor is allowing the JCB operator to transport another worker on the JCB cabin from the site to the laydown area.",
  "It has been observed there was no lights available during a JCB operation. Lux reading was 2.",
  "It is observed a 360 Excavator oeprator covered his wind sceeen with curtain at Zone - C",
  "Loose items stored inside grader operator cabin",
  "It has been observed the contractor is allowing the JCB to work in site with no Backshield protection.",
  "Cardboards and packing materials left in heavy equipment parking area.",
  "Whip lash arrestor was not between compressor and air hose.",
  "Damage of disk in grader machine.",
  "Soil stockpile not isolated with sand berms leading to the boulders rolling from the top of the stockpile towards the vehicle and people movement area below whilst being pushed by the wheel loader/ dozer from the top.",
  "Adequate numbers of Humps are not provided along the dump truck operating route in working area.",
  "The back of the trucks/dump trucks did not fix with retro reflective tape.",
  "Welfare facilities are not protected from moving vehicles and plant. Provided light vehicle parking areas inside welfare areas.",
  "Backhoe operator allowed fellow worker to sit inside operator cabin while the backhoe was in motion.",
  "Dump trucks carrying spoil in heap shape to dumping yard.",
  "Few workers were sitting under a wheel loader shade, taking the rest during lunch break. No Rest shelter was available in the dumping area.",
  "Road was contaminated by spoil during hauling operation.",
  "At 3:43 AM on a Saturday night in 2023, two tipper trucks collided at Zone 2A roundabout. The driver was fatigued & feeling tired.",
  "GFCI was not installed in power distribution system to crusher plant operator cabin.",
  "Rear View mirror and side view mirror are not installed on the compact roller",
  "Tipper trucks, equipment and plants are not keeping safe distance at the time of dumping.",
  "Employees transportation bus (Plate no-7814 KLA) does not have Neom QR Veri fi.",
  "Road was contaminated by spoil during hauling operation.",
  "Electrician name and contact number was not displayed in Crusher plant operator cabin.",
  "The rear view glass of the wheel loader was covered by a cloth.",
  "Electrician Contact number was not displayed in Crusher plant operator room.",
  "Dumper trucks dumping material in stockpiles area when they are parked side by side with another equipment and plants.",
  "Curtains used to cover operator cabin window panes",
  "Pick up truck plate number (7285 SNA) does not have QR CODE.",
  "Internal lights were not installed in tarping station . Install internal lights to ensure safe tarping operation.",
  "Observed two workers violating the No boots on ground policy",
  "Observed one person moving around mobile plant equipment working area",
  "No electrician available on site at crusher plant operation area.",
  "Tarping task not done at established tarping station.",
  "The truck was not on a level surface when dumping. A large amount of materials was in the upper position of the raised box.",
  "Incoming and out going lane was not provided in houling operation. Ticket counter post was not provided. Car parking place was not provided.",
  "Seating provision to be made in tarping station",
  "Observed that worker was standing behind the truck at tarping station.",
  "Seating provision was not provided in tarping station.",
  "Inadequate width of road for tipper truck.",
  "No Whip Check @ air hose compressor.",
  "Excavator cabin rear window pane is covered using thick film (Vision Obstruction)",
  "Access steps to operator cabin were missing.",
  "restricted vision was observed with one of the excavator due to dirt on windscreens and side window glasses.",
  "Seating provision was not provided in De-Tarping station.",
  "it was observed that a freelancer driver was driving dump truck",
  "It was observed that the JCB was parked near the edge while engaged in backfilling around the Chamber 16 area.",
  "Curtains used to cover window pane of dumper truck 5986 VDA",
  "PPE - Improper storage of face shield against rough metal surface",
  "During loading timep tipper trucks found not maintaining safe distance.",
  "Dump truck Driver found wearing seat belt and wearing safety shoes.",
  "Found a trailer (7782 - HKA) with red status operating on the site",
  "It was observed that the trailer (5534 DJA) was in red status",
  "One operator doing mentince it's no allow if any one have problem go parking area",
  "one bldozer find black smoke",
  "Excavator operator without full ppe doing mentince",
  "Found a trailer (7782 - HKA) with red status operating on the site",
  "One dump truck door no moving during Dumping",
  "Find excavator baar code expired",
  "It was observed on the zone 5 that a bulldozer was emitting black smoke while operating",
  "During check a tipper truck driver found violating seat belt compliance.",
  "While driving in new stuckpile I see black smoke was observed and responsible person was told",
  "Found a roller compactor operator in a full PPE on the stockpile area",
  "oil spil dump truck",
  "One new trailer come on side without neom baar code",
  "Dump truck moving but front cabnet open",
  "Dump trucks stop due to water tanker put more water on the way",
  "Electrical safety - Excavators observed operated under high tension overhead power lines.",
  "During our recent site inspection, we identified a critical issue at Zone 04. The inspection revealed a significant number of loose rocks in this area, which poses a serious threat to the safety of workers and equipment.",
  "With out permission and Baar code expired inter in work location",
  "loose rocks are evident at zone 5- due to heavy equipment movements may fall. The TDP team has been advised to remove all loose rocks from the mountain.",
  "One dump truck back door no open during Dumping",
  "Some drivers sitting under heavy equipment",
  "Find bldozer make black smoke",
  "Electrical safety - Dumper truck tipping operations carried out directly under overhead high voltage power lines.",
  "loader changer tairs rim and keep on side",
  "one trailer stuck in soil",
  "Dump truck driver found in traditional dress kurta pajama",
  "Equipment - Dumper truck (6934) with makeshift welded locking system in place of factory fitted counter pin lock",
  "It was observed that bulldozer was emitting black smoke which was located in the new stock pile area",
  "1089KRA Trailer immediately brake fail",
  "One trailer sluf problem suddenly",
  "One excavator doing loading near by live electricity",
  "one dump truck no good working during Dumping",
  "Some dump truck doing work but Neom Baar code expired",
  "During our recent site inspection, we identified a critical issue at Zone 04. loose rocks in this area, poses a serious threat to safety.",
  "one trailer catch without Nambr plate",
  "Found a trailer (3738-rzd) with red status operating on the site",
  "Found a trailer with the red status operating on the zone 6 access",
  "Blodozer to much smoke",
  "Equipment - Grader GR-U2340 was operated with the cabin doors kept open",
  "loose rocks are evident at zone 5- due to heavy equipment movements may fall.",
  "It was observed on the zone 06 loading point trailers where being overloaded by an excavator.",
  "Tipper truck driver found using a curtain on a window glass which causes an obstructive view.",
  "It has been observed that the Wheel Loader Operator was using hand-free during Wheel Loader Operation which was resulting in distraction of the Wheel Loader Operator.",
  "An operator at zone 4 access was seen praying outside the equipment violating both safety and Neom standards",
  "It was observed that substandard bottles were being used for fuel storage. equipment was observed without drip try.",
  "Dedicated parking area was not set up for parking staff bus and construction mobile plant.",
  "During equipment verify found Red category dump truck working inside site.",
  "A dump operator found de-trapping by himself on his truck.",
  "Tipper truck drivers and construction plant operators not in a habit of fastening their seat belt whilst driving/ operating in site.",
  "Two workers found travelling in the backhoe loader operator cabin",
  "Imtiaz concrete truck drivers and tipper truck drivers not fastening their seat belts whilst driving in site.",
  "It has observed that the tipper truck operator not using a seat belt while driving. All the drivers must follow the rules of site traffic.",
  "It was noted that the skid steer loader operator did not fasten the seat belt while operating the bobcat.",
  "Tipper truck drivers found not fastening their seat belts whilst driving in site. All found bypassing the seat belts.",
  "Construction plant operators not inspecting the plants daily and records not being updated on daily basis.",
  "Steer skid loader without registration.",
  "Tipper truck driver without fastening his seatbelt and no mandatory PPE with him.",
  "Compressor air hose joints found without whip lash arrester.",
  "Tipper truck drivers found either not fastening their seat belts or by-passing it whilst driving in the site",
  "Tipper truck drivers found bypassing the seat belts whilst driving in site.",
  "Concrete Pump Operator was observed working with concrete pump with helmet.",
  "Even after repeated notifications and discussions red status equipment/ vehicles are still operating in site.",
  "A grader Operator from EBC was found walking at ground while the grader was parked in start position.",
  "It was noted that the whip lash arrestor was not attached to the hose pipe.",
  "A worker was seen seated on the rear of a moving boom truck.",
  "Found a tipper truck operator without fastening of seat belt while driving.",
  "Workers involved in backfilling from EBC found using Bluetooth hearing devise whilst tipper truck are reversing to dump soil for back filling.",
  "A tipper truck driver found not fastening his seat belt whilst driving in site.",
  "Tipper truck drivers not fastening their seat belts or bypassing it whilst driving on site."
];

console.log('=== Mobile Plant & Equipment UNCLASSIFIED Test (122 observations) ===\n');

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
