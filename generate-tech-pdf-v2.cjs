/**
 * HIDC Technical Architecture PDF - Clean Modern Design
 * Focused technical diagrams with clear typography
 */

const { jsPDF } = require('jspdf');

const OUTPUT_PATH = 'C:\\Users\\Mark Ronnel Nieva\\Desktop\\HIDC_Technical_Guide.pdf';

// Clean color palette
const C = {
  black: [20, 20, 20],
  white: [255, 255, 255],
  gray1: [245, 245, 247],    // lightest
  gray2: [229, 229, 234],
  gray3: [174, 174, 178],
  gray4: [99, 99, 102],
  gray5: [72, 72, 74],

  blue: [0, 122, 255],
  green: [52, 199, 89],
  orange: [255, 149, 0],
  red: [255, 59, 48],
  purple: [175, 82, 222],
  teal: [0, 156, 189],
};

const W = 297;  // A4 landscape width
const H = 210;  // A4 landscape height

function arrow(doc, x1, y1, x2, y2, color = C.gray4) {
  doc.setDrawColor(...color);
  doc.setLineWidth(1.2);
  doc.line(x1, y1, x2, y2);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 4;
  doc.setFillColor(...color);
  doc.triangle(
    x2, y2,
    x2 - len * Math.cos(angle - 0.4), y2 - len * Math.sin(angle - 0.4),
    x2 - len * Math.cos(angle + 0.4), y2 - len * Math.sin(angle + 0.4),
    'F'
  );
}

function box(doc, x, y, w, h, text, bg, fg = C.white, size = 11) {
  doc.setFillColor(...bg);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(...fg);

  if (text.includes('\n')) {
    const lines = text.split('\n');
    const lh = size * 0.45;
    const startY = y + h/2 - (lines.length - 1) * lh / 2;
    lines.forEach((line, i) => {
      doc.text(line, x + w/2, startY + i * lh, { align: 'center' });
    });
  } else {
    doc.text(text, x + w/2, y + h/2 + size * 0.12, { align: 'center' });
  }
}

function cylinder(doc, x, y, w, h, text, bg) {
  const ell = 5;
  doc.setFillColor(...bg);
  doc.rect(x, y + ell/2, w, h - ell, 'F');
  doc.ellipse(x + w/2, y + ell/2, w/2, ell/2, 'F');
  doc.ellipse(x + w/2, y + h - ell/2, w/2, ell/2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text(text, x + w/2, y + h/2 + 2, { align: 'center' });
}

function header(doc, title, page) {
  // Top bar
  doc.setFillColor(...C.teal);
  doc.rect(0, 0, W, 6, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.black);
  doc.text(title, 20, 22);

  // Page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray4);
  doc.text(`${page}`, W - 20, H - 8, { align: 'right' });
}

function label(doc, x, y, text, size = 8) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...C.gray4);
  doc.text(text, x, y, { align: 'center' });
}

function generatePDF() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ========== PAGE 1: TITLE ==========
  doc.setFillColor(...C.black);
  doc.rect(0, 0, W, H, 'F');

  doc.setFillColor(...C.teal);
  doc.rect(0, 0, W, 5, 'F');

  // Logo
  doc.setFillColor(...C.teal);
  doc.roundedRect(W/2 - 22, 55, 44, 44, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...C.white);
  doc.text('HIDC', W/2, 82, { align: 'center' });

  // Title
  doc.setFontSize(36);
  doc.text('Technical Architecture', W/2, 125, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...C.gray3);
  doc.text('How the system processes safety observations', W/2, 140, { align: 'center' });

  // Pipeline preview
  const steps = ['PARSE', 'CLASSIFY', 'STORE', 'ANALYZE', 'RENDER'];
  const stepW = 38;
  const startX = (W - steps.length * stepW - (steps.length - 1) * 8) / 2;

  steps.forEach((s, i) => {
    const x = startX + i * (stepW + 8);
    box(doc, x, 160, stepW, 22, s, C.gray5, C.white, 10);
    if (i < steps.length - 1) {
      arrow(doc, x + stepW + 2, 171, x + stepW + 6, 171, C.teal);
    }
  });

  // ========== PAGE 2: DATA FLOW ==========
  doc.addPage();
  header(doc, 'Data Flow Pipeline', 2);

  const y1 = 50;

  // Row 1: Input to Storage
  box(doc, 20, y1, 45, 28, 'Excel File\n.xlsx', C.green);
  label(doc, 42, y1 + 35, 'Enablon Export');

  arrow(doc, 65, y1 + 14, 82, y1 + 14, C.teal);

  box(doc, 82, y1, 50, 28, 'XLSX Parser', C.orange);
  label(doc, 107, y1 + 35, 'SheetJS Library');

  arrow(doc, 132, y1 + 14, 149, y1 + 14, C.teal);

  box(doc, 149, y1, 50, 28, 'Classifier', C.purple);
  label(doc, 174, y1 + 35, 'Pattern Matching');

  arrow(doc, 199, y1 + 14, 216, y1 + 14, C.teal);

  cylinder(doc, 216, y1 - 5, 45, 38, 'IndexedDB', C.blue);
  label(doc, 238, y1 + 40, 'Browser Storage');

  // Row 2: Storage to Output
  const y2 = 110;

  arrow(doc, 238, y1 + 33, 238, y2 - 8, C.teal);

  box(doc, 195, y2, 55, 28, 'Analytics\nEngine', C.orange);
  label(doc, 222, y2 + 35, 'Calculations');

  arrow(doc, 195, y2 + 14, 175, y2 + 14, C.teal);

  box(doc, 125, y2, 50, 28, 'Memoization', C.purple);
  label(doc, 150, y2 + 35, 'Performance Cache');

  arrow(doc, 125, y2 + 14, 105, y2 + 14, C.teal);

  box(doc, 55, y2, 50, 28, 'React\nContext', C.blue);
  label(doc, 80, y2 + 35, 'State Management');

  arrow(doc, 55, y2 + 14, 35, y2 + 14, C.teal);

  // User icon
  doc.setFillColor(...C.teal);
  doc.circle(22, y2 + 14, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  doc.text('USER', 22, y2 + 17, { align: 'center' });

  // Key points
  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, 165, W - 40, 30, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.teal);
  doc.text('Key Points', 30, 178);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.black);
  doc.text('•  All processing happens in the browser  •  No server calls  •  Works offline  •  Data never leaves your computer', 75, 183);

  // ========== PAGE 3: EXCEL PARSING ==========
  doc.addPage();
  header(doc, 'Excel Parsing', 3);

  // Left: Excel visual
  const exX = 25, exY = 45;

  // Excel header
  doc.setFillColor(...C.green);
  doc.rect(exX, exY, 95, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  ['Ref', 'Date', 'Description', 'Type', 'Contractor'].forEach((h, i) => {
    doc.text(h, exX + 10 + i * 19, exY + 9);
  });

  // Excel rows
  const rows = [
    ['001', '01/24', 'Height work...', 'Neg', 'ABC Co'],
    ['002', '01/24', 'PPE correct', 'Pos', 'XYZ Ltd'],
    ['003', '02/24', 'Spill found', 'Neg', 'ABC Co'],
  ];
  rows.forEach((r, ri) => {
    const ry = exY + 14 + ri * 11;
    doc.setFillColor(ri % 2 === 0 ? 248 : 255, ri % 2 === 0 ? 248 : 255, ri % 2 === 0 ? 250 : 255);
    doc.rect(exX, ry, 95, 11, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.black);
    r.forEach((c, ci) => {
      doc.text(c, exX + 10 + ci * 19, ry + 7);
    });
  });
  doc.setDrawColor(...C.gray3);
  doc.rect(exX, exY, 95, 47, 'S');

  label(doc, exX + 47, exY + 55, 'Raw Excel Data', 9);

  // Arrow
  arrow(doc, 125, exY + 23, 145, exY + 23, C.teal);

  // Parser box
  doc.setFillColor(...C.orange);
  doc.roundedRect(145, exY - 8, 60, 65, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text('XLSX Parser', 175, exY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  ['1. Read workbook', '2. Find headers', '3. Map columns', '4. Extract rows', '5. Validate data'].forEach((s, i) => {
    doc.text(s, 152, exY + 16 + i * 8);
  });

  // Arrow
  arrow(doc, 205, exY + 23, 225, exY + 23, C.teal);

  // Output JSON
  doc.setFillColor(...C.blue);
  doc.roundedRect(225, exY - 5, 55, 58, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text('JS Objects', 252, exY + 8, { align: 'center' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  ['{', '  ref: "001",', '  date: Date,', '  desc: "...",', '  type: "Neg",', '  contractor:', '    "ABC Co"', '}'].forEach((l, i) => {
    doc.text(l, 230, exY + 18 + i * 5);
  });

  // Column mapping section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.black);
  doc.text('Column Mapping', 25, 115);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray4);
  doc.text('Enablon columns are mapped to internal field names:', 25, 125);

  const maps = [
    ['"Reference Number"', 'ref'],
    ['"Observation Date"', 'date'],
    ['"Description of Observation"', 'description'],
    ['"Observation Type"', 'type'],
    ['"Responsible Contractor"', 'contractor'],
  ];

  maps.forEach((m, i) => {
    const mx = 30 + (i % 3) * 90;
    const my = 135 + Math.floor(i / 3) * 16;

    doc.setFillColor(...C.gray1);
    doc.roundedRect(mx, my, 80, 12, 2, 2, 'F');

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gray5);
    doc.text(m[0], mx + 3, my + 5);

    doc.setTextColor(...C.teal);
    doc.text('→', mx + 52, my + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(m[1], mx + 58, my + 8);
  });

  // Validation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.black);
  doc.text('Validation', 25, 180);

  const checks = [
    ['Required fields', C.green],
    ['Date format', C.green],
    ['Max 2000 rows', C.green],
    ['Duplicates', C.orange],
  ];

  checks.forEach((ch, i) => {
    const cx = 30 + i * 60;
    doc.setFillColor(...ch[1]);
    doc.circle(cx, 190, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text('✓', cx, 192, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.black);
    doc.text(ch[0], cx + 8, 192);
  });

  // ========== PAGE 4: CLASSIFICATION ==========
  doc.addPage();
  header(doc, 'Hazard Classification', 4);

  // Input
  doc.setFillColor(...C.gray1);
  doc.roundedRect(20, 45, 110, 25, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray5);
  doc.text('INPUT', 25, 54);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...C.black);
  doc.text('"Worker without harness on scaffolding at 15m"', 25, 64);

  arrow(doc, 75, 70, 75, 85, C.teal);

  // Classifier engine
  doc.setFillColor(...C.purple);
  doc.roundedRect(20, 85, 110, 70, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text('Classification Engine', 75, 100, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const classSteps = [
    '1. Tokenize → split into words',
    '2. Check CRITICAL keywords first',
    '3. Match against 30 patterns',
    '4. Score each match (0-100)',
    '5. Return highest score category'
  ];
  classSteps.forEach((s, i) => {
    doc.text(s, 28, 112 + i * 9);
  });

  arrow(doc, 75, 155, 75, 170, C.teal);

  // Output
  doc.setFillColor(...C.green);
  doc.roundedRect(20, 170, 110, 25, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text('OUTPUT: Working at Height', 75, 186, { align: 'center' });

  // Right side - patterns
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.black);
  doc.text('Pattern Library (30 Categories)', 150, 50);

  const patterns = [
    { cat: 'Working at Height', keys: 'height, ladder, scaffold, harness, fall', color: C.red },
    { cat: 'Housekeeping', keys: 'clean, debris, clutter, tidy, mess', color: C.orange },
    { cat: 'PPE Compliance', keys: 'helmet, gloves, vest, boots, goggles', color: C.blue },
    { cat: 'Hot Work', keys: 'weld, cutting, spark, flame, grind', color: C.orange },
    { cat: 'Excavation', keys: 'dig, trench, pit, buried, ground', color: C.green },
    { cat: 'Electrical', keys: 'wire, cable, shock, power, voltage', color: C.red },
  ];

  patterns.forEach((p, i) => {
    const py = 60 + i * 24;

    // Category badge
    doc.setFillColor(...p.color);
    doc.roundedRect(150, py, 55, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text(p.cat, 177, py + 10, { align: 'center' });

    // Keywords
    doc.setFillColor(...C.gray1);
    doc.roundedRect(210, py, 70, 16, 2, 2, 'F');
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.gray5);
    doc.text(p.keys, 215, py + 10);
  });

  // Bottom note
  doc.setFillColor(...C.teal);
  doc.roundedRect(150, 170, 130, 25, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text('30 Categories', 215, 180, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Expanded from Enablon\'s 12', 215, 190, { align: 'center' });

  // ========== PAGE 5: STORAGE ==========
  doc.addPage();
  header(doc, 'Local Storage', 5);

  // Browser frame
  doc.setFillColor(...C.gray5);
  doc.roundedRect(30, 45, 120, 100, 6, 6, 'F');

  // Browser bar
  doc.setFillColor(...C.gray3);
  doc.roundedRect(34, 49, 112, 14, 3, 3, 'F');

  // Traffic lights
  doc.setFillColor(255, 95, 86);
  doc.circle(42, 56, 3, 'F');
  doc.setFillColor(255, 189, 46);
  doc.circle(52, 56, 3, 'F');
  doc.setFillColor(39, 201, 63);
  doc.circle(62, 56, 3, 'F');

  // URL
  doc.setFillColor(...C.white);
  doc.roundedRect(75, 51, 65, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.gray5);
  doc.text('hidc-dashboard.app', 78, 58);

  // Content area
  doc.setFillColor(...C.white);
  doc.rect(34, 66, 112, 75, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.black);
  doc.text('Browser Storage', 90, 82, { align: 'center' });

  // Storage icons
  cylinder(doc, 42, 90, 45, 40, 'IndexedDB', C.blue);
  cylinder(doc, 95, 90, 45, 40, 'LocalStorage', C.green);

  // Security boundary
  doc.setDrawColor(...C.teal);
  doc.setLineWidth(2);
  doc.roundedRect(20, 38, 140, 115, 8, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.teal);
  doc.text('YOUR COMPUTER', 90, 48, { align: 'center' });

  // Lock badge
  doc.setFillColor(...C.green);
  doc.circle(152, 45, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text('🔒', 152, 48, { align: 'center' });

  // Right side - details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.black);
  doc.text('What\'s Stored', 180, 50);

  const stored = [
    { where: 'IndexedDB', what: 'Observation records', size: '~1KB/record' },
    { where: 'IndexedDB', what: 'Hazard mappings', size: '~50KB' },
    { where: 'LocalStorage', what: 'User preferences', size: '<1KB' },
    { where: 'LocalStorage', what: 'Filter settings', size: '<1KB' },
  ];

  stored.forEach((s, i) => {
    const sy = 60 + i * 18;
    const scolor = s.where === 'IndexedDB' ? C.blue : C.green;

    doc.setFillColor(...scolor);
    doc.roundedRect(180, sy, 10, 10, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.black);
    doc.text(s.what, 195, sy + 7);

    doc.setTextColor(...C.gray4);
    doc.text(s.size, 270, sy + 7, { align: 'right' });
  });

  // Security box
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(180, 140, 95, 55, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.green);
  doc.text('Security', 190, 155);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.black);
  const secItems = ['✓ No server uploads', '✓ No cloud sync', '✓ No external APIs', '✓ 100% offline capable'];
  secItems.forEach((s, i) => {
    doc.text(s, 188, 167 + i * 9);
  });

  // ========== PAGE 6: ANALYTICS ==========
  doc.addPage();
  header(doc, 'Analytics Engine', 6);

  const ay = 55;

  // Pipeline
  cylinder(doc, 25, ay, 35, 35, 'Data', C.gray5);
  label(doc, 42, ay + 42, 'IndexedDB');

  arrow(doc, 60, ay + 17, 75, ay + 17, C.teal);

  box(doc, 75, ay + 2, 40, 30, 'Filter', C.blue);
  label(doc, 95, ay + 38, 'Date Range');

  arrow(doc, 115, ay + 17, 130, ay + 17, C.teal);

  box(doc, 130, ay - 5, 55, 45, 'Calculate\n\nKPIs', C.orange);
  label(doc, 157, ay + 47, 'Aggregations');

  arrow(doc, 185, ay + 17, 200, ay + 17, C.teal);

  box(doc, 200, ay + 2, 40, 30, 'Cache', C.purple);
  label(doc, 220, ay + 38, 'Memoize');

  arrow(doc, 240, ay + 17, 255, ay + 17, C.teal);

  doc.setFillColor(...C.teal);
  doc.roundedRect(255, ay - 3, 25, 40, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text('UI', 267, ay + 20, { align: 'center' });

  // KPI formulas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.black);
  doc.text('KPI Calculations', 25, 115);

  const kpis = [
    { name: 'Total Observations', formula: 'COUNT(all records)', result: '1,247' },
    { name: 'Close Out Rate', formula: 'closed ÷ total × 100', result: '94%' },
    { name: 'Positive Rate', formula: 'positive ÷ total × 100', result: '78%' },
    { name: 'Overdue Actions', formula: 'COUNT(due < today)', result: '12' },
  ];

  kpis.forEach((k, i) => {
    const kx = 25 + (i % 2) * 135;
    const ky = 125 + Math.floor(i / 2) * 35;

    doc.setFillColor(...C.gray1);
    doc.roundedRect(kx, ky, 125, 28, 3, 3, 'F');
    doc.setFillColor(...C.teal);
    doc.rect(kx, ky, 3, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.black);
    doc.text(k.name, kx + 10, ky + 11);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.gray4);
    doc.text(k.formula, kx + 10, ky + 21);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...C.teal);
    doc.text(k.result, kx + 115, ky + 16, { align: 'right' });
  });

  // ========== PAGE 7: EXPORT ==========
  doc.addPage();
  header(doc, 'Export System', 7);

  // Center: Dashboard
  box(doc, 115, 55, 65, 35, 'Dashboard\nData + Charts', C.teal);

  // PDF branch
  arrow(doc, 115, 72, 55, 50, C.red);
  box(doc, 20, 40, 50, 30, 'PDF', C.red);
  label(doc, 45, 78, 'jsPDF library');

  // PPTX branch
  arrow(doc, 180, 72, 240, 50, C.orange);
  box(doc, 225, 40, 50, 30, 'PowerPoint', C.orange);
  label(doc, 250, 78, 'PptxGenJS');

  // JSON branch
  arrow(doc, 147, 90, 147, 115, C.blue);
  box(doc, 122, 115, 50, 30, 'JSON', C.blue);
  label(doc, 147, 152, 'Native JS');

  // Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.black);
  doc.text('Export Details', 25, 170);

  const exports = [
    { type: 'PDF', format: 'A3 Portrait', includes: 'KPIs, Pyramid, Charts', color: C.red },
    { type: 'PPTX', format: '16:9 Slides', includes: 'Branded slides, tables', color: C.orange },
    { type: 'JSON', format: 'UTF-8 File', includes: 'All data, settings', color: C.blue },
  ];

  exports.forEach((e, i) => {
    const ex = 30 + i * 90;

    doc.setFillColor(...e.color);
    doc.roundedRect(ex, 178, 75, 20, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text(e.type + ' • ' + e.format, ex + 37, 186, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(e.includes, ex + 37, 194, { align: 'center' });
  });

  // ========== PAGE 8: FULL ARCHITECTURE ==========
  doc.addPage();
  header(doc, 'System Architecture', 8);

  const sysY = 50;

  // User
  doc.setFillColor(...C.gray5);
  doc.circle(30, sysY + 35, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  doc.text('USER', 30, sysY + 38, { align: 'center' });

  arrow(doc, 42, sysY + 35, 55, sysY + 35, C.teal);

  // Import
  box(doc, 55, sysY + 22, 40, 26, 'IMPORT', C.green);

  arrow(doc, 95, sysY + 35, 108, sysY + 35, C.teal);

  // Process
  box(doc, 108, sysY + 22, 45, 26, 'PROCESS', C.purple);

  arrow(doc, 153, sysY + 35, 166, sysY + 35, C.teal);

  // Store
  cylinder(doc, 166, sysY + 17, 35, 36, 'STORE', C.blue);

  arrow(doc, 201, sysY + 35, 214, sysY + 35, C.teal);

  // Analyze
  box(doc, 214, sysY + 22, 40, 26, 'ANALYZE', C.orange);

  arrow(doc, 254, sysY + 35, 267, sysY + 35, C.teal);

  // Render
  box(doc, 267, sysY + 22, 18, 26, 'UI', C.teal);

  // Back to user
  arrow(doc, 276, sysY + 48, 276, sysY + 65, C.gray3);
  arrow(doc, 276, sysY + 65, 42, sysY + 65, C.gray3);
  arrow(doc, 42, sysY + 65, 42, sysY + 47, C.gray3);

  // Export branch
  arrow(doc, 276, sysY + 48, 276, sysY + 85, C.teal);
  box(doc, 245, sysY + 85, 50, 20, 'EXPORT', C.gray5);

  // Tech stack
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.black);
  doc.text('Technology Stack', 25, 150);

  const techs = [
    { name: 'React 18', cat: 'UI', color: C.teal },
    { name: 'Vite', cat: 'Build', color: C.purple },
    { name: 'TailwindCSS', cat: 'Style', color: C.blue },
    { name: 'Recharts', cat: 'Charts', color: C.green },
    { name: 'SheetJS', cat: 'Excel', color: C.orange },
    { name: 'jsPDF', cat: 'PDF', color: C.red },
    { name: 'idb', cat: 'Storage', color: C.blue },
  ];

  techs.forEach((t, i) => {
    const tx = 25 + i * 38;

    doc.setFillColor(...t.color);
    doc.roundedRect(tx, 158, 34, 22, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text(t.name, tx + 17, 167, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(t.cat, tx + 17, 175, { align: 'center' });
  });

  // Summary box
  doc.setFillColor(...C.gray1);
  doc.roundedRect(25, 188, W - 50, 14, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.teal);
  doc.text('Summary:', 32, 197);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.black);
  doc.text('Browser-based  •  Offline capable  •  Zero server dependencies  •  All data stays local  •  Under 2MB bundle', 60, 197);

  // Save
  doc.save(OUTPUT_PATH);
  console.log(`Saved: ${OUTPUT_PATH}`);
}

console.log('Generating Technical Guide PDF...\n');
generatePDF();
console.log('\nDone!');
