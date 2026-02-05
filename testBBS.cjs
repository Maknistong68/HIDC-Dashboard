const XLSX = require('xlsx');
const path = require('path');
const { detectContributingFactors } = require('./src/utils/rootCauseEngine.js');

const filePath = path.join('C:', 'Users', 'Mark Ronnel Nieva', 'Desktop', 'DATA SET', 'HIDC.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headerRowIdx = 2;
  const classIdx = 2;
  const descIdx = 4;

  console.log('=== BBS (Unsafe Act) Detection Test ===\n');

  const unsafeActs = [];
  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const cls = data[i][classIdx];
    if (cls && cls.toString().toLowerCase().includes('unsafe act')) {
      const desc = data[i][descIdx] || '';
      if (desc.trim()) unsafeActs.push(desc.toString());
    }
  }

  console.log('Total Unsafe Acts in Excel:', unsafeActs.length);

  let bbsDetected = 0;
  let otherFactorsDetected = 0;
  let noFactorsDetected = 0;
  const failures = [];

  unsafeActs.forEach((desc, i) => {
    const factors = detectContributingFactors(desc);
    const hasBBS = factors.includes('BBS');

    if (hasBBS) {
      bbsDetected++;
    } else if (factors.length > 0) {
      otherFactorsDetected++;
    } else {
      noFactorsDetected++;
      failures.push({ num: i + 1, desc: desc.substring(0, 100), factors });
    }
  });

  console.log('\n=== RESULTS ===');
  console.log('BBS detected:', bbsDetected, '(' + Math.round(bbsDetected/unsafeActs.length*100) + '%)');
  console.log('Other factors (not BBS):', otherFactorsDetected, '(' + Math.round(otherFactorsDetected/unsafeActs.length*100) + '%)');
  console.log('No factors detected:', noFactorsDetected, '(' + Math.round(noFactorsDetected/unsafeActs.length*100) + '%)');
  console.log('Total coverage:', (bbsDetected + otherFactorsDetected), '(' + Math.round((bbsDetected + otherFactorsDetected)/unsafeActs.length*100) + '%)');

  if (failures.length > 0) {
    console.log('\n=== OBSERVATIONS WITH NO FACTORS DETECTED ===');
    failures.forEach(f => {
      console.log(f.num + '. "' + f.desc + '..."');
    });
  }

} catch (err) {
  console.error('Error:', err.message);
}
