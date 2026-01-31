/**
 * HIDC Technical Architecture - Minimal Design
 * Accurate diagrams based on actual codebase
 * Minimal colors: Black, White, One Accent
 */

const { jsPDF } = require('jspdf');

const OUTPUT_PATH = 'C:\\Users\\Mark Ronnel Nieva\\Desktop\\HIDC_Technical_Architecture.pdf';

// Minimal color palette - just black, white, and one accent
const C = {
  black: [30, 30, 30],
  white: [255, 255, 255],
  gray1: [250, 250, 250],
  gray2: [230, 230, 230],
  gray3: [180, 180, 180],
  gray4: [120, 120, 120],
  gray5: [80, 80, 80],
  accent: [0, 156, 189],  // Teal - single accent color
};

const W = 297;
const H = 210;

// Simple arrow
function arrow(doc, x1, y1, x2, y2) {
  doc.setDrawColor(...C.gray4);
  doc.setLineWidth(0.8);
  doc.line(x1, y1, x2, y2);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 3;
  doc.setFillColor(...C.gray4);
  doc.triangle(
    x2, y2,
    x2 - len * Math.cos(angle - 0.4), y2 - len * Math.sin(angle - 0.4),
    x2 - len * Math.cos(angle + 0.4), y2 - len * Math.sin(angle + 0.4),
    'F'
  );
}

// Simple box
function box(doc, x, y, w, h, text, filled = false) {
  if (filled) {
    doc.setFillColor(...C.accent);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
    doc.setTextColor(...C.white);
  } else {
    doc.setDrawColor(...C.gray4);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, w, h, 2, 2, 'S');
    doc.setTextColor(...C.black);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  if (text.includes('\n')) {
    const lines = text.split('\n');
    const lh = 4;
    const startY = y + h/2 - (lines.length - 1) * lh / 2;
    lines.forEach((line, i) => {
      doc.text(line, x + w/2, startY + i * lh, { align: 'center' });
    });
  } else {
    doc.text(text, x + w/2, y + h/2 + 3, { align: 'center' });
  }
}

// Database cylinder
function db(doc, x, y, w, h, text) {
  const ell = 4;
  doc.setFillColor(...C.gray2);
  doc.rect(x, y + ell/2, w, h - ell, 'F');
  doc.ellipse(x + w/2, y + ell/2, w/2, ell/2, 'F');
  doc.ellipse(x + w/2, y + h - ell/2, w/2, ell/2, 'F');

  doc.setDrawColor(...C.gray4);
  doc.setLineWidth(0.5);
  doc.ellipse(x + w/2, y + ell/2, w/2, ell/2, 'S');
  doc.line(x, y + ell/2, x, y + h - ell/2);
  doc.line(x + w, y + ell/2, x + w, y + h - ell/2);
  doc.ellipse(x + w/2, y + h - ell/2, w/2, ell/2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.black);
  doc.text(text, x + w/2, y + h/2 + 2, { align: 'center' });
}

// Page header
function header(doc, title, page) {
  doc.setFillColor(...C.accent);
  doc.rect(0, 0, W, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...C.black);
  doc.text(title, 20, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray4);
  doc.text(`${page}/7`, W - 15, H - 8, { align: 'right' });
}

// Section title
function section(doc, title, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.black);
  doc.text(title, 20, y);
  return y + 8;
}

function generatePDF() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ===== PAGE 1: TITLE =====
  doc.setFillColor(...C.black);
  doc.rect(0, 0, W, H, 'F');

  doc.setFillColor(...C.accent);
  doc.rect(0, 0, W, 4, 'F');

  // Logo
  doc.setFillColor(...C.accent);
  doc.roundedRect(W/2 - 18, 50, 36, 36, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...C.white);
  doc.text('HIDC', W/2, 73, { align: 'center' });

  // Title
  doc.setFontSize(28);
  doc.text('Technical Architecture', W/2, 110, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...C.gray3);
  doc.text('How the Classification Engine Works', W/2, 125, { align: 'center' });

  // Simple pipeline
  const steps = ['Excel', 'Parse', 'Classify', 'Store', 'Display'];
  const sw = 35;
  const sx = (W - steps.length * sw - (steps.length - 1) * 6) / 2;

  steps.forEach((s, i) => {
    const x = sx + i * (sw + 6);
    doc.setFillColor(...C.gray5);
    doc.roundedRect(x, 150, sw, 20, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text(s, x + sw/2, 163, { align: 'center' });

    if (i < steps.length - 1) {
      doc.setDrawColor(...C.accent);
      doc.setLineWidth(1);
      doc.line(x + sw + 1, 160, x + sw + 5, 160);
    }
  });

  // ===== PAGE 2: DATA FLOW =====
  doc.addPage();
  header(doc, 'Data Flow Overview', 2);

  let y = 35;

  // Row 1: Import pipeline
  box(doc, 25, y, 40, 22, 'Excel File\n.xlsx', true);
  arrow(doc, 65, y + 11, 80, y + 11);

  box(doc, 80, y, 50, 22, 'XLSX Parser\nSheetJS');
  arrow(doc, 130, y + 11, 145, y + 11);

  box(doc, 145, y, 55, 22, '4-Strategy\nClassifier');
  arrow(doc, 200, y + 11, 215, y + 11);

  db(doc, 215, y - 3, 40, 28, 'IndexedDB');

  // Labels
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.gray4);
  doc.text('Enablon Export', 45, y + 28, { align: 'center' });
  doc.text('Column mapping', 105, y + 28, { align: 'center' });
  doc.text('Ensemble voting', 172, y + 28, { align: 'center' });
  doc.text('Browser storage', 235, y + 28, { align: 'center' });

  // Row 2: Output pipeline
  y = 100;

  db(doc, 215, y - 3, 40, 28, 'IndexedDB');
  arrow(doc, 215, y + 11, 200, y + 11);

  box(doc, 145, y, 55, 22, 'Analytics\nEngine');
  arrow(doc, 145, y + 11, 130, y + 11);

  box(doc, 80, y, 50, 22, 'React\nComponents');
  arrow(doc, 80, y + 11, 65, y + 11);

  box(doc, 25, y, 40, 22, 'Dashboard\nUI', true);

  // Labels
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.gray4);
  doc.text('KPI calculations', 172, y + 28, { align: 'center' });
  doc.text('Charts & cards', 105, y + 28, { align: 'center' });

  // Key point
  y = 150;
  doc.setFillColor(...C.gray1);
  doc.roundedRect(25, y, W - 50, 20, 2, 2, 'F');
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1);
  doc.line(25, y, 25, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.accent);
  doc.text('Key:', 32, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.black);
  doc.text('All processing happens in the browser. No server. No cloud. Data never leaves your computer.', 50, y + 12);

  // ===== PAGE 3: EXCEL PARSING =====
  doc.addPage();
  header(doc, 'Excel Parsing', 3);

  y = 35;

  // Excel table visual
  const exX = 20;

  // Header row
  doc.setFillColor(...C.accent);
  doc.rect(exX, y, 90, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  ['Event ID', 'Date', 'Description', 'Type', 'Contractor'].forEach((h, i) => {
    doc.text(h, exX + 5 + i * 18, y + 7);
  });

  // Data rows
  const rows = [
    ['OBS-001', '01/24', 'Height work...', 'Incident', 'ABC Co'],
    ['OBS-002', '01/24', 'PPE correct', 'Positive', 'XYZ Ltd'],
  ];

  rows.forEach((r, ri) => {
    const ry = y + 10 + ri * 8;
    doc.setFillColor(ri % 2 === 0 ? 250 : 245, ri % 2 === 0 ? 250 : 245, ri % 2 === 0 ? 250 : 245);
    doc.rect(exX, ry, 90, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.black);
    r.forEach((c, ci) => {
      doc.text(c, exX + 5 + ci * 18, ry + 5);
    });
  });

  doc.setDrawColor(...C.gray3);
  doc.rect(exX, y, 90, 26, 'S');

  // Arrow
  arrow(doc, 115, y + 13, 135, y + 13);

  // Parser steps
  doc.setFillColor(...C.gray1);
  doc.roundedRect(135, y - 5, 70, 40, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.black);
  doc.text('XLSX Parser', 170, y + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.gray5);
  const steps2 = [
    '1. Auto-detect header row',
    '2. Map column names',
    '3. Parse dates (DD/MM/YYYY)',
    '4. Validate required fields',
  ];
  steps2.forEach((s, i) => {
    doc.text(s, 140, y + 15 + i * 5);
  });

  // Arrow
  arrow(doc, 205, y + 13, 225, y + 13);

  // Output
  doc.setFillColor(...C.gray1);
  doc.roundedRect(225, y - 5, 55, 40, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.black);
  doc.text('JS Objects', 252, y + 5, { align: 'center' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.gray5);
  ['{ eventId,', '  date,', '  description,', '  type,', '  contractor }'].forEach((l, i) => {
    doc.text(l, 230, y + 14 + i * 5);
  });

  // Column mapping section
  y = 90;
  y = section(doc, 'NEOM Column Mapping', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray5);
  doc.text('The parser automatically maps these Enablon column names to internal fields:', 20, y);
  y += 10;

  const maps = [
    ['"Event ID"', 'eventId'],
    ['"Event Date"', 'date'],
    ['"Event Description"', 'description'],
    ['"Type"', 'type'],
    ['"Classification"', 'classification'],
    ['"Reported by"', 'reportedBy'],
    ['"Significant Hazard"', 'hazardCategory'],
    ['"Contractor"', 'contractor'],
  ];

  maps.forEach((m, i) => {
    const mx = 25 + (i % 4) * 65;
    const my = y + Math.floor(i / 4) * 12;

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gray5);
    doc.text(m[0], mx, my);

    doc.setTextColor(...C.accent);
    doc.text('→', mx + 38, my);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(m[1], mx + 43, my);
  });

  // Limits
  y = 145;
  y = section(doc, 'Processing Limits', y);

  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y, W - 40, 25, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.black);
  doc.text('Maximum 2,000 rows per import (source system typically adds footer rows beyond this)', 30, y + 10);
  doc.text('Supports .xlsx and .xls formats • Validates required fields before processing', 30, y + 18);

  // ===== PAGE 4: CLASSIFICATION ENGINE =====
  doc.addPage();
  header(doc, 'Classification Engine', 4);

  y = 35;

  // Input
  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y, 100, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray5);
  doc.text('INPUT: Observation Description', 25, y + 7);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('"Worker without harness on scaffold"', 25, y + 14);

  arrow(doc, 70, y + 18, 70, y + 30);

  // Ensemble voting box
  y = y + 30;
  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y, 180, 70, 3, 3, 'F');
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1);
  doc.roundedRect(20, y, 180, 70, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.accent);
  doc.text('ENSEMBLE VOTING SYSTEM', 110, y + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.gray5);
  doc.text('4 independent strategies vote on each observation. Majority wins.', 110, y + 20, { align: 'center' });

  // 4 strategies
  const strategies = [
    { name: 'KEYWORD', desc: 'Object + Action\nmatching' },
    { name: 'SENTENCE', desc: 'WHO/WHAT/WHERE\nparsing' },
    { name: 'CLEAN TEXT', desc: 'Strip references\nre-classify' },
    { name: 'CONTROL-LINK', desc: 'Link controls\nto hazards' },
  ];

  strategies.forEach((s, i) => {
    const sx = 30 + i * 42;
    const sy = y + 30;

    doc.setFillColor(...C.white);
    doc.roundedRect(sx, sy, 38, 30, 2, 2, 'F');
    doc.setDrawColor(...C.gray3);
    doc.roundedRect(sx, sy, 38, 30, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.accent);
    doc.text(s.name, sx + 19, sy + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.gray5);
    const lines = s.desc.split('\n');
    lines.forEach((l, li) => {
      doc.text(l, sx + 19, sy + 16 + li * 5, { align: 'center' });
    });
  });

  // Voting rules
  const votingY = y + 75;
  arrow(doc, 110, y + 70, 110, votingY);

  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, votingY, 180, 25, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.black);
  doc.text('Voting Rules:', 30, votingY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.gray5);
  doc.text('4/4 unanimous = 95%   |   3/4 consensus = 85%   |   2/4 split = 70%   |   1/4 = 50%', 70, votingY + 10);
  doc.text('Ties resolved by hazard severity ranking (life-threatening hazards win)', 30, votingY + 18);

  // Output
  arrow(doc, 110, votingY + 25, 110, votingY + 38);

  box(doc, 60, votingY + 38, 100, 18, 'OUTPUT: Working at Height', true);

  // Right side - categories
  const catX = 215;
  y = 35;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.black);
  doc.text('30 Hazard Categories', catX, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.accent);
  doc.text('13 Major Hazards', catX, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.gray5);
  const majors = [
    'Working at Height', 'Confined Spaces', 'Energized System',
    'Hot Work', 'Lifting', 'Excavation', 'Mobile Plant',
    'Fire', 'Temporary Works', 'Live Roads', 'Driving',
    'Working in Heat', 'Near Water'
  ];
  majors.forEach((m, i) => {
    doc.text('• ' + m, catX, y + i * 4);
  });

  y += majors.length * 4 + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray4);
  doc.text('17 Sub-Significant', catX, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  const subs = [
    'Housekeeping', 'PPE', 'Access', 'Traffic Mgmt',
    'Tools', 'COSHH', 'Slip/Trip', 'Physical Hazard',
    'Mechanical Hazard', 'Respiratory', '...'
  ];
  subs.forEach((s, i) => {
    doc.text('• ' + s, catX, y + i * 4);
  });

  // ===== PAGE 5: STRATEGY DETAILS =====
  doc.addPage();
  header(doc, 'Classification Strategies', 5);

  y = 35;

  // Strategy 1: KEYWORD
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.accent);
  doc.text('1. KEYWORD Strategy', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray5);
  doc.text('Matches hazard objects, actions, and outcomes from predefined dictionaries.', 20, y + 8);

  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y + 12, 120, 30, 2, 2, 'F');

  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.gray5);
  doc.text('HAZARD_OBJECTS = {', 25, y + 20);
  doc.text('  "Working at Height": ["scaffold", "ladder", "harness"]', 25, y + 26);
  doc.text('  "Hot Work": ["welding", "grinding", "cutting"]', 25, y + 32);
  doc.text('}', 25, y + 38);

  // Strategy 2: SENTENCE
  y += 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.accent);
  doc.text('2. SENTENCE Strategy', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray5);
  doc.text('Parses grammatical structure: WHO did WHAT, WHERE, HOW.', 20, y + 8);

  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y + 12, 120, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Example: "Scaffolder working without harness"', 25, y + 20);
  doc.text('WHO: Scaffolder → Working at Height (80% conf)', 25, y + 28);

  // Strategy 3: CLEAN TEXT
  y += 45;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.accent);
  doc.text('3. CLEAN TEXT Strategy', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray5);
  doc.text('Strips NEOM/PHSAS references, then re-classifies the core observation.', 20, y + 8);

  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y + 12, 120, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Before: "No harness. Ref: NEOM-PHSAS-001..."', 25, y + 20);
  doc.text('After: "No harness" → cleaner classification', 25, y + 28);

  // Strategy 4: CONTROL-LINK
  y += 45;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.accent);
  doc.text('4. CONTROL-LINK Strategy', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray5);
  doc.text('Links control issues (signage, PPE, permit) to underlying hazards.', 20, y + 8);

  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y + 12, 120, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('"Missing signage at excavation site"', 25, y + 20);
  doc.text('Control: signage → Hazard: Excavation', 25, y + 28);

  // Right side - additional features
  const rx = 155;
  y = 35;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.black);
  doc.text('Additional Features', rx, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.gray5);
  doc.text('Abbreviation Expansion', rx, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('WAH → Working at Height', rx, y + 6);
  doc.text('COSHH → Control of Substances...', rx, y + 11);

  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Disambiguation Rules', rx, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('"fire extinguisher" → General, not Fire', rx, y + 6);
  doc.text('"line of fire" → Mobile Plant, not Fire', rx, y + 11);

  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Context Redirects', rx, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('"chemical spill" → COSHH', rx, y + 6);
  doc.text('"fuel storage" → Fire', rx, y + 11);

  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Fuzzy Matching', rx, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Handles typos: "scafold" → scaffold', rx, y + 6);
  doc.text('Levenshtein distance ≤ 2', rx, y + 11);

  // ===== PAGE 6: STORAGE & ANALYTICS =====
  doc.addPage();
  header(doc, 'Storage & Analytics', 6);

  // Left side - Storage
  y = 35;
  y = section(doc, 'Browser Storage', y);

  // Browser frame
  doc.setFillColor(...C.gray5);
  doc.roundedRect(20, y, 100, 70, 4, 4, 'F');

  doc.setFillColor(...C.gray3);
  doc.roundedRect(24, y + 4, 92, 10, 2, 2, 'F');

  // Traffic lights
  doc.setFillColor(255, 95, 86);
  doc.circle(30, y + 9, 2, 'F');
  doc.setFillColor(255, 189, 46);
  doc.circle(36, y + 9, 2, 'F');
  doc.setFillColor(39, 201, 63);
  doc.circle(42, y + 9, 2, 'F');

  // Content
  doc.setFillColor(...C.white);
  doc.rect(24, y + 16, 92, 50, 'F');

  db(doc, 32, y + 22, 35, 22, 'IndexedDB');
  db(doc, 72, y + 22, 35, 22, 'LocalStorage');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.gray5);
  doc.text('Observations', 49, y + 50, { align: 'center' });
  doc.text('Settings', 89, y + 50, { align: 'center' });

  // Security box
  y += 80;
  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y, 100, 30, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.accent);
  doc.text('Security', 25, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.gray5);
  doc.text('✓ No data sent to servers', 25, y + 18);
  doc.text('✓ Works offline', 75, y + 18);
  doc.text('✓ No cloud sync', 25, y + 25);
  doc.text('✓ No external APIs', 75, y + 25);

  // Right side - Analytics
  const ax = 140;
  y = 35;
  y = section(doc, 'Analytics Calculations', y);

  const kpis = [
    { name: 'Total Observations', formula: 'COUNT(all)' },
    { name: 'Close Out Rate', formula: 'closed ÷ total × 100' },
    { name: 'Positive Rate', formula: 'positive ÷ total × 100' },
    { name: 'Overdue Actions', formula: 'COUNT(due < today)' },
    { name: 'TRIR', formula: '(recordable × 200K) ÷ hours' },
  ];

  kpis.forEach((k, i) => {
    const ky = y + i * 16;

    doc.setFillColor(...C.gray1);
    doc.roundedRect(ax, ky, 130, 13, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.black);
    doc.text(k.name, ax + 5, ky + 9);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gray4);
    doc.text(k.formula, ax + 125, ky + 9, { align: 'right' });
  });

  y += kpis.length * 16 + 15;
  y = section(doc, 'Grouping & Aggregation', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.gray5);

  const aggs = [
    '• Group by Hazard Category → Top Hazards chart',
    '• Group by Reporter → Top Observers chart',
    '• Group by Date → Trend line chart',
    '• Group by Hour → Time-of-day heatmap',
    '• Group by Contractor → Contractor breakdown',
  ];

  aggs.forEach((a, i) => {
    doc.text(a, ax, y + i * 6);
  });

  // ===== PAGE 7: SUMMARY =====
  doc.addPage();
  header(doc, 'System Summary', 7);

  y = 40;

  // Architecture diagram
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.black);
  doc.text('Complete Architecture', 20, y);

  y += 10;

  // Full pipeline
  box(doc, 20, y, 35, 20, 'Excel\nImport');
  arrow(doc, 55, y + 10, 65, y + 10);

  box(doc, 65, y, 40, 20, 'Parser');
  arrow(doc, 105, y + 10, 115, y + 10);

  box(doc, 115, y, 50, 20, '4-Strategy\nClassifier', true);
  arrow(doc, 165, y + 10, 175, y + 10);

  db(doc, 175, y - 2, 35, 24, 'IndexedDB');
  arrow(doc, 210, y + 10, 220, y + 10);

  box(doc, 220, y, 40, 20, 'Analytics');
  arrow(doc, 260, y + 10, 270, y + 10);

  box(doc, 270, y, 15, 20, 'UI');

  // Tech stack
  y = 95;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.black);
  doc.text('Technology Stack', 20, y);

  y += 10;

  const techs = [
    { name: 'React 18', role: 'UI Framework' },
    { name: 'Vite', role: 'Build Tool' },
    { name: 'TailwindCSS', role: 'Styling' },
    { name: 'Recharts', role: 'Charts' },
    { name: 'SheetJS', role: 'Excel Parsing' },
    { name: 'jsPDF', role: 'PDF Export' },
    { name: 'idb', role: 'IndexedDB' },
  ];

  techs.forEach((t, i) => {
    const tx = 20 + i * 38;

    doc.setFillColor(...C.gray2);
    doc.roundedRect(tx, y, 35, 18, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.black);
    doc.text(t.name, tx + 17, y + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.gray4);
    doc.text(t.role, tx + 17, y + 13, { align: 'center' });
  });

  // Key points
  y = 135;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.black);
  doc.text('Key Technical Points', 20, y);

  y += 10;
  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, y, W - 40, 50, 3, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.black);

  const points = [
    '• 4-strategy ensemble voting for classification (KEYWORD, SENTENCE, CLEAN TEXT, CONTROL-LINK)',
    '• 30 hazard categories (13 Major + 17 Sub-Significant) - never returns "Others"',
    '• Automatic column mapping from Enablon Excel format',
    '• All processing in browser - zero server dependencies',
    '• Maximum 2,000 records per import',
    '• IndexedDB for persistent storage, LocalStorage for settings',
  ];

  points.forEach((p, i) => {
    doc.text(p, 28, y + 10 + i * 7);
  });

  // Save
  doc.save(OUTPUT_PATH);
  console.log(`Saved: ${OUTPUT_PATH}`);
}

console.log('Generating Technical Architecture PDF...\n');
generatePDF();
console.log('\nDone!');
