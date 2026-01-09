const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join('C:', 'Users', 'Mark Ronnel Nieva', 'Downloads', 'Event report-HIDC-tk-23122025-6.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('=== COLUMN HEADERS ===');
  if (data[0]) {
    data[0].forEach((header, idx) => {
      console.log(`  [${idx}] ${header}`);
    });
  }

  console.log('\n=== SAMPLE DATA (Row 2) ===');
  if (data[1]) {
    data[0].forEach((header, idx) => {
      console.log(`  ${header}: ${data[1][idx]}`);
    });
  }

  console.log('\n=== SAMPLE DATA (Row 3) ===');
  if (data[2]) {
    data[0].forEach((header, idx) => {
      console.log(`  ${header}: ${data[2][idx]}`);
    });
  }

  console.log('\n=== DATA STATS ===');
  console.log(`Total rows: ${data.length - 1} (excluding header)`);
  console.log(`Total columns: ${data[0] ? data[0].length : 0}`);

  // Analyze unique values for key columns
  const typeCol = data[0].findIndex(h => h && h.toLowerCase().includes('type'));
  const classCol = data[0].findIndex(h => h && h.toLowerCase().includes('classification'));
  const hazardCol = data[0].findIndex(h => h && h.toLowerCase().includes('hazard'));
  const statusCol = data[0].findIndex(h => h && h.toLowerCase().includes('status') || (h && h.toLowerCase().includes('approval')));

  if (typeCol >= 0) {
    const types = [...new Set(data.slice(1).map(r => r[typeCol]).filter(Boolean))];
    console.log(`\n=== UNIQUE TYPES (col ${typeCol}) ===`);
    types.forEach(t => console.log(`  - ${t}`));
  }

  if (classCol >= 0) {
    const classes = [...new Set(data.slice(1).map(r => r[classCol]).filter(Boolean))];
    console.log(`\n=== UNIQUE CLASSIFICATIONS (col ${classCol}) ===`);
    classes.forEach(c => console.log(`  - ${c}`));
  }

  if (hazardCol >= 0) {
    const hazards = [...new Set(data.slice(1).map(r => r[hazardCol]).filter(Boolean))];
    console.log(`\n=== UNIQUE HAZARDS (col ${hazardCol}) - showing first 15 ===`);
    hazards.slice(0, 15).forEach(h => console.log(`  - ${h}`));
    if (hazards.length > 15) console.log(`  ... and ${hazards.length - 15} more`);
  }

  if (statusCol >= 0) {
    const statuses = [...new Set(data.slice(1).map(r => r[statusCol]).filter(Boolean))];
    console.log(`\n=== UNIQUE STATUSES (col ${statusCol}) ===`);
    statuses.forEach(s => console.log(`  - ${s}`));
  }

} catch (err) {
  console.error('Error:', err.message);
}
