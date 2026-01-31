/**
 * HIDC Technical Features - Visual Diagram PDF Generator
 * Creates a diagram-based PDF explaining how the app works technically
 *
 * Usage: node generate-technical-diagrams-pdf.cjs
 */

const { jsPDF } = require('jspdf');

// Output path
const OUTPUT_PATH = 'C:\\Users\\Mark Ronnel Nieva\\Desktop\\HIDC_Technical_Diagrams.pdf';

// Colors (matching OXAGON/NEOM branding)
const COLORS = {
  primary: [0, 156, 189],      // #009CBD - Cyan
  dark: [19, 16, 13],          // #13100D
  white: [255, 255, 255],
  darkGray: [55, 66, 74],      // #37424A
  medGray: [129, 138, 143],    // #818A8F
  lightGray: [209, 212, 211],  // #D1D4D3
  green: [0, 107, 68],         // #006B44
  orange: [241, 136, 37],      // #F18825
  red: [224, 64, 63],          // #E0403F
  blue: [0, 123, 181],         // #007BB5
  purple: [128, 0, 128],
  yellow: [255, 193, 7],
  lightBlue: [135, 190, 219],
  lightGreen: [132, 182, 162],
  lightOrange: [249, 196, 150],
};

// Page dimensions (A4 Landscape for diagrams)
const PAGE_WIDTH = 297;
const PAGE_HEIGHT = 210;
const MARGIN = 15;

/**
 * Draw an arrow between two points
 */
function drawArrow(doc, x1, y1, x2, y2, color = COLORS.darkGray, headSize = 3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(1.5);
  doc.line(x1, y1, x2, y2);

  // Arrow head
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headAngle = Math.PI / 6;

  doc.setFillColor(...color);
  doc.triangle(
    x2, y2,
    x2 - headSize * Math.cos(angle - headAngle), y2 - headSize * Math.sin(angle - headAngle),
    x2 - headSize * Math.cos(angle + headAngle), y2 - headSize * Math.sin(angle + headAngle),
    'F'
  );
}

/**
 * Draw a rounded box with label
 */
function drawBox(doc, x, y, w, h, label, bgColor, textColor = COLORS.white, fontSize = 10) {
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, w, h, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);
  doc.setTextColor(...textColor);

  // Handle multi-line labels
  const lines = label.split('\n');
  const lineHeight = fontSize * 0.4;
  const startY = y + (h / 2) - ((lines.length - 1) * lineHeight / 2);

  lines.forEach((line, i) => {
    doc.text(line, x + w/2, startY + (i * lineHeight), { align: 'center' });
  });
}

/**
 * Draw a cylinder (database shape)
 */
function drawCylinder(doc, x, y, w, h, label, bgColor) {
  const ellipseH = 6;

  doc.setFillColor(...bgColor);
  // Main body
  doc.rect(x, y + ellipseH/2, w, h - ellipseH, 'F');
  // Top ellipse
  doc.ellipse(x + w/2, y + ellipseH/2, w/2, ellipseH/2, 'F');
  // Bottom ellipse
  doc.ellipse(x + w/2, y + h - ellipseH/2, w/2, ellipseH/2, 'F');

  // Border
  doc.setDrawColor(...COLORS.darkGray);
  doc.setLineWidth(0.5);
  doc.ellipse(x + w/2, y + ellipseH/2, w/2, ellipseH/2, 'S');
  doc.line(x, y + ellipseH/2, x, y + h - ellipseH/2);
  doc.line(x + w, y + ellipseH/2, x + w, y + h - ellipseH/2);
  doc.ellipse(x + w/2, y + h - ellipseH/2, w/2, ellipseH/2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text(label, x + w/2, y + h/2 + 2, { align: 'center' });
}

/**
 * Draw a diamond (decision shape)
 */
function drawDiamond(doc, x, y, size, label, bgColor) {
  doc.setFillColor(...bgColor);

  const points = [
    [x + size/2, y],           // top
    [x + size, y + size/2],    // right
    [x + size/2, y + size],    // bottom
    [x, y + size/2]            // left
  ];

  doc.moveTo(points[0][0], points[0][1]);
  doc.lineTo(points[1][0], points[1][1]);
  doc.lineTo(points[2][0], points[2][1]);
  doc.lineTo(points[3][0], points[3][1]);
  doc.lineTo(points[0][0], points[0][1]);
  doc.fill();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text(label, x + size/2, y + size/2 + 2, { align: 'center' });
}

/**
 * Draw page header
 */
function drawPageHeader(doc, title, subtitle, pageNum) {
  // Cyan accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_WIDTH, 8, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.dark);
  doc.text(title, MARGIN, 22);

  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.medGray);
    doc.text(subtitle, MARGIN, 30);
  }

  // Page number
  doc.setFontSize(10);
  doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: 'right' });

  // Footer line
  doc.setDrawColor(...COLORS.lightGray);
  doc.line(MARGIN, PAGE_HEIGHT - 12, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 12);
}

/**
 * Draw a legend item
 */
function drawLegendItem(doc, x, y, color, label) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y - 3, 12, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dark);
  doc.text(label, x + 15, y + 1);
}

/**
 * Generate the PDF
 */
function generatePDF() {
  console.log('Generating Technical Diagrams PDF...');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  let pageNum = 1;

  // ===== PAGE 1: Title & Overview =====
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Cyan accent
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_WIDTH, 10, 'F');

  // Logo
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(PAGE_WIDTH/2 - 20, 40, 40, 40, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.white);
  doc.text('HIDC', PAGE_WIDTH/2, 65, { align: 'center' });

  // Title
  doc.setFontSize(32);
  doc.text('Technical Architecture', PAGE_WIDTH/2, 100, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.medGray);
  doc.text('How HIDC Works Under the Hood', PAGE_WIDTH/2, 115, { align: 'center' });

  // Simple overview boxes
  const overviewItems = [
    { icon: '1', label: 'Excel Parsing', desc: 'Read & validate data' },
    { icon: '2', label: 'Classification', desc: 'Auto-categorize hazards' },
    { icon: '3', label: 'Storage', desc: 'Save locally' },
    { icon: '4', label: 'Analytics', desc: 'Calculate metrics' },
    { icon: '5', label: 'Visualization', desc: 'Display charts' },
  ];

  const boxWidth = 45;
  const startX = (PAGE_WIDTH - (boxWidth * 5 + 10 * 4)) / 2;

  overviewItems.forEach((item, i) => {
    const x = startX + i * (boxWidth + 10);
    const y = 135;

    // Box
    doc.setFillColor(...COLORS.darkGray);
    doc.roundedRect(x, y, boxWidth, 45, 4, 4, 'F');

    // Number circle
    doc.setFillColor(...COLORS.primary);
    doc.circle(x + boxWidth/2, y + 12, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.white);
    doc.text(item.icon, x + boxWidth/2, y + 15, { align: 'center' });

    // Label
    doc.setFontSize(10);
    doc.text(item.label, x + boxWidth/2, y + 28, { align: 'center' });

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightGray);
    doc.text(item.desc, x + boxWidth/2, y + 38, { align: 'center' });

    // Arrow between boxes
    if (i < overviewItems.length - 1) {
      drawArrow(doc, x + boxWidth + 2, y + 22, x + boxWidth + 8, y + 22, COLORS.primary, 2);
    }
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.darkGray);
  doc.text('Visual Guide to HIDC Technical Features', PAGE_WIDTH/2, PAGE_HEIGHT - 15, { align: 'center' });

  // ===== PAGE 2: Data Flow Diagram =====
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, 'Complete Data Flow', 'From Excel file to Dashboard visualization', pageNum);

  // Main flow diagram
  const flowY = 50;

  // Step 1: Excel File
  drawBox(doc, 20, flowY, 40, 25, 'Excel File\n(.xlsx)', COLORS.green);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Enablon Export', 40, flowY + 32, { align: 'center' });

  drawArrow(doc, 60, flowY + 12, 75, flowY + 12, COLORS.primary);

  // Step 2: Parser
  drawBox(doc, 75, flowY, 45, 25, 'Excel Parser\n(xlsx library)', COLORS.orange);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Reads rows & columns', 97, flowY + 32, { align: 'center' });

  drawArrow(doc, 120, flowY + 12, 135, flowY + 12, COLORS.primary);

  // Step 3: Validator
  drawBox(doc, 135, flowY, 40, 25, 'Validator', COLORS.blue);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Checks required fields', 155, flowY + 32, { align: 'center' });

  drawArrow(doc, 175, flowY + 12, 190, flowY + 12, COLORS.primary);

  // Step 4: Classifier
  drawBox(doc, 190, flowY, 45, 25, 'Hazard\nClassifier', COLORS.purple);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Pattern matching', 212, flowY + 32, { align: 'center' });

  drawArrow(doc, 235, flowY + 12, 250, flowY + 12, COLORS.primary);

  // Step 5: Storage
  drawCylinder(doc, 250, flowY - 2, 35, 30, 'IndexedDB', COLORS.darkGray);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Browser storage', 267, flowY + 35, { align: 'center' });

  // Second row - Analytics
  const row2Y = flowY + 55;

  drawArrow(doc, 267, flowY + 28, 267, row2Y - 5, COLORS.primary);

  // Analytics Engine
  drawBox(doc, 230, row2Y, 50, 25, 'Analytics\nEngine', COLORS.primary);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('KPIs & calculations', 255, row2Y + 32, { align: 'center' });

  drawArrow(doc, 230, row2Y + 12, 215, row2Y + 12, COLORS.primary);

  // Memoization
  drawBox(doc, 170, row2Y, 45, 25, 'Memoization\nCache', COLORS.orange);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Performance boost', 192, row2Y + 32, { align: 'center' });

  drawArrow(doc, 170, row2Y + 12, 155, row2Y + 12, COLORS.primary);

  // React Context
  drawBox(doc, 110, row2Y, 45, 25, 'React\nContext', COLORS.blue);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('State management', 132, row2Y + 32, { align: 'center' });

  drawArrow(doc, 110, row2Y + 12, 95, row2Y + 12, COLORS.primary);

  // UI Components
  drawBox(doc, 50, row2Y, 45, 25, 'React\nComponents', COLORS.green);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Charts & cards', 72, row2Y + 32, { align: 'center' });

  drawArrow(doc, 50, row2Y + 12, 35, row2Y + 12, COLORS.primary);

  // Dashboard
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(15, row2Y - 5, 20, 35, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('USER', 25, row2Y + 10, { align: 'center' });
  doc.text('SEES', 25, row2Y + 18, { align: 'center' });
  doc.text('DATA', 25, row2Y + 26, { align: 'center' });

  // Legend
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text('Legend:', 20, 160);

  drawLegendItem(doc, 20, 170, COLORS.green, 'Input/Output');
  drawLegendItem(doc, 70, 170, COLORS.orange, 'Processing');
  drawLegendItem(doc, 120, 170, COLORS.blue, 'State');
  drawLegendItem(doc, 160, 170, COLORS.purple, 'AI/Logic');
  drawLegendItem(doc, 200, 170, COLORS.darkGray, 'Storage');

  // Key insight box
  doc.setFillColor(240, 248, 250);
  doc.roundedRect(20, 180, PAGE_WIDTH - 40, 18, 3, 3, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.rect(20, 180, 4, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.primary);
  doc.text('Key Insight:', 28, 188);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.dark);
  doc.text('All processing happens in your browser. No data leaves your computer. The entire pipeline runs offline.', 55, 188);

  // ===== PAGE 3: Excel Parsing Deep Dive =====
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, 'Excel Parsing Engine', 'How HIDC reads and validates your Enablon export', pageNum);

  // Left side - Excel structure
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Excel File Structure', 25, 48);

  // Excel visual representation
  const excelX = 20;
  const excelY = 55;

  // Header row
  doc.setFillColor(...COLORS.green);
  doc.rect(excelX, excelY, 100, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.white);

  const headers = ['Ref #', 'Date', 'Description', 'Type', 'Status'];
  headers.forEach((h, i) => {
    doc.text(h, excelX + 10 + i * 20, excelY + 8);
  });

  // Data rows
  const rows = [
    ['OBS-001', '2024-01', 'Working at height...', 'Negative', 'Open'],
    ['OBS-002', '2024-01', 'PPE worn correctly', 'Positive', 'Closed'],
    ['OBS-003', '2024-02', 'Housekeeping issue', 'Negative', 'Open'],
  ];

  rows.forEach((row, ri) => {
    const rowY = excelY + 12 + ri * 10;
    doc.setFillColor(ri % 2 === 0 ? 250 : 240, ri % 2 === 0 ? 250 : 240, ri % 2 === 0 ? 250 : 240);
    doc.rect(excelX, rowY, 100, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.dark);
    row.forEach((cell, ci) => {
      doc.text(cell.substring(0, 12), excelX + 10 + ci * 20, rowY + 7);
    });
  });

  // Border
  doc.setDrawColor(...COLORS.darkGray);
  doc.rect(excelX, excelY, 100, 42, 'S');

  // Arrow to parser
  drawArrow(doc, 125, excelY + 20, 145, excelY + 20, COLORS.primary, 4);

  // Parser box
  doc.setFillColor(...COLORS.orange);
  doc.roundedRect(145, excelY - 5, 55, 55, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('Excel Parser', 172, excelY + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const parserSteps = [
    '1. Read workbook',
    '2. Find header row',
    '3. Map column names',
    '4. Extract each row',
    '5. Convert to objects'
  ];
  parserSteps.forEach((step, i) => {
    doc.text(step, 150, excelY + 18 + i * 7);
  });

  // Arrow to output
  drawArrow(doc, 200, excelY + 20, 220, excelY + 20, COLORS.primary, 4);

  // Output structure
  doc.setFillColor(...COLORS.blue);
  doc.roundedRect(220, excelY - 5, 60, 55, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('JavaScript Objects', 250, excelY + 8, { align: 'center' });

  // JSON preview
  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  const jsonLines = [
    '{',
    '  ref: "OBS-001",',
    '  date: Date(...),',
    '  description: "...",',
    '  type: "Negative",',
    '  status: "Open"',
    '}'
  ];
  jsonLines.forEach((line, i) => {
    doc.text(line, 225, excelY + 18 + i * 6);
  });

  // Column mapping section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Smart Column Mapping', 25, 115);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.medGray);
  doc.text('HIDC automatically recognizes different column names from Enablon exports:', 25, 123);

  // Mapping table
  const mappings = [
    { from: '"Reference Number"', to: 'ref' },
    { from: '"Observation Date"', to: 'date' },
    { from: '"Description of Observation"', to: 'description' },
    { from: '"Observation Type"', to: 'type' },
    { from: '"Responsible Contractor"', to: 'contractor' },
  ];

  mappings.forEach((m, i) => {
    const mx = 30 + (i % 3) * 90;
    const my = 132 + Math.floor(i / 3) * 18;

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(mx, my, 80, 14, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.dark);
    doc.text(m.from, mx + 5, my + 6);

    doc.setFillColor(...COLORS.primary);
    doc.circle(mx + 40, my + 10, 2, 'F');
    doc.setTextColor(...COLORS.primary);
    doc.text('→ ' + m.to, mx + 45, my + 12);
  });

  // Validation section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Data Validation Checks', 25, 175);

  const checks = [
    { check: 'Required fields present', icon: '✓', color: COLORS.green },
    { check: 'Date format valid', icon: '✓', color: COLORS.green },
    { check: 'Max 2000 records', icon: '✓', color: COLORS.green },
    { check: 'Duplicate detection', icon: '!', color: COLORS.orange },
  ];

  checks.forEach((c, i) => {
    const cx = 30 + i * 65;
    doc.setFillColor(...c.color);
    doc.circle(cx, 185, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text(c.icon, cx, 188, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.dark);
    doc.text(c.check, cx + 8, 187);
  });

  // ===== PAGE 4: Classification Engine =====
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, 'Hazard Classification Engine', 'Pattern-matching AI that categorizes observations automatically', pageNum);

  // Input
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text('Input: Observation Description', 20, 48);

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, 52, 120, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.medGray);
  doc.text('"Worker observed without safety harness while', 25, 60);
  doc.text('working on scaffolding at 15m height"', 25, 68);

  // Arrow down
  drawArrow(doc, 80, 72, 80, 85, COLORS.primary, 4);

  // Classification engine
  doc.setFillColor(...COLORS.purple);
  doc.roundedRect(20, 85, 120, 70, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text('Classification Engine', 80, 98, { align: 'center' });

  // Steps inside
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const classSteps = [
    '1. Tokenize text into words',
    '2. Check CRITICAL keywords first',
    '3. Match against 30 hazard patterns',
    '4. Calculate confidence scores',
    '5. Apply context redirects',
    '6. Return best match'
  ];
  classSteps.forEach((step, i) => {
    doc.text(step, 30, 108 + i * 7);
  });

  // Arrow down
  drawArrow(doc, 80, 155, 80, 168, COLORS.primary, 4);

  // Output
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text('Output: Hazard Category', 20, 178);

  doc.setFillColor(...COLORS.green);
  doc.roundedRect(20, 182, 120, 15, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('Working at Height', 80, 192, { align: 'center' });

  // Right side - Pattern examples
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Pattern Matching Examples', 160, 48);

  const patterns = [
    {
      category: 'Working at Height',
      keywords: ['height', 'ladder', 'scaffold', 'harness', 'fall'],
      color: COLORS.red
    },
    {
      category: 'Housekeeping',
      keywords: ['clean', 'tidy', 'debris', 'clutter', 'organize'],
      color: COLORS.orange
    },
    {
      category: 'PPE Compliance',
      keywords: ['helmet', 'gloves', 'goggles', 'vest', 'boots'],
      color: COLORS.blue
    },
    {
      category: 'Hot Work',
      keywords: ['weld', 'cutting', 'spark', 'flame', 'burn'],
      color: COLORS.orange
    },
    {
      category: 'Excavation',
      keywords: ['dig', 'trench', 'pit', 'ground', 'buried'],
      color: COLORS.green
    },
  ];

  patterns.forEach((p, i) => {
    const py = 55 + i * 28;

    // Category box
    doc.setFillColor(...p.color);
    doc.roundedRect(160, py, 55, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.white);
    doc.text(p.category, 187, py + 8, { align: 'center' });

    // Arrow
    doc.setDrawColor(...COLORS.medGray);
    doc.line(215, py + 6, 225, py + 6);

    // Keywords
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(225, py - 2, 55, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.dark);
    doc.text(p.keywords.join(', '), 228, py + 8);
  });

  // 30 Categories summary
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(160, 170, 120, 25, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.text('30 Hazard Categories', 220, 180, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Expanded from Enablon\'s 12 categories', 220, 190, { align: 'center' });

  // ===== PAGE 5: Storage Architecture =====
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, 'Local Storage Architecture', 'How data is stored securely on your computer', pageNum);

  // Browser visual
  const browserX = 20;
  const browserY = 50;

  // Browser window frame
  doc.setFillColor(...COLORS.darkGray);
  doc.roundedRect(browserX, browserY, 120, 90, 5, 5, 'F');

  // Browser top bar
  doc.setFillColor(200, 200, 200);
  doc.roundedRect(browserX + 3, browserY + 3, 114, 12, 3, 3, 'F');

  // Traffic lights
  doc.setFillColor(255, 95, 86);
  doc.circle(browserX + 12, browserY + 9, 3, 'F');
  doc.setFillColor(255, 189, 46);
  doc.circle(browserX + 22, browserY + 9, 3, 'F');
  doc.setFillColor(39, 201, 63);
  doc.circle(browserX + 32, browserY + 9, 3, 'F');

  // URL bar
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(browserX + 45, browserY + 5, 68, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(...COLORS.dark);
  doc.text('hidc-dashboard.app', browserX + 48, browserY + 10);

  // Browser content area
  doc.setFillColor(255, 255, 255);
  doc.rect(browserX + 3, browserY + 18, 114, 69, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text('Your Browser', 80, browserY + 35, { align: 'center' });

  // Storage boxes inside browser
  drawCylinder(doc, browserX + 15, browserY + 45, 40, 35, 'IndexedDB', COLORS.blue);
  drawCylinder(doc, browserX + 65, browserY + 45, 40, 35, 'LocalStorage', COLORS.green);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Observations', browserX + 35, browserY + 85, { align: 'center' });
  doc.text('Settings', browserX + 85, browserY + 85, { align: 'center' });

  // Your Computer box
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(2);
  doc.roundedRect(browserX - 10, browserY - 15, 150, 120, 8, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text('YOUR COMPUTER', browserX + 65, browserY - 5, { align: 'center' });

  // Lock icon
  doc.setFillColor(...COLORS.green);
  doc.circle(browserX + 130, browserY - 5, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('🔒', browserX + 130, browserY - 2, { align: 'center' });

  // Right side - What's stored
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('What Gets Stored', 180, 50);

  const storageItems = [
    { db: 'IndexedDB', item: 'Observation records', size: '~1KB per record' },
    { db: 'IndexedDB', item: 'Hazard categories', size: '~50KB total' },
    { db: 'IndexedDB', item: 'Contractor data', size: '~10KB total' },
    { db: 'LocalStorage', item: 'Filter preferences', size: '<1KB' },
    { db: 'LocalStorage', item: 'Date range selection', size: '<1KB' },
    { db: 'LocalStorage', item: 'UI settings', size: '<1KB' },
  ];

  storageItems.forEach((item, i) => {
    const sy = 58 + i * 14;
    const itemColor = item.db === 'IndexedDB' ? COLORS.blue : COLORS.green;
    doc.setFillColor(...itemColor);
    doc.roundedRect(180, sy, 8, 8, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.dark);
    doc.text(item.item, 192, sy + 6);

    doc.setTextColor(...COLORS.medGray);
    doc.text(item.size, 260, sy + 6);
  });

  // Security features box
  doc.setFillColor(240, 255, 240);
  doc.roundedRect(180, 145, 100, 50, 4, 4, 'F');
  doc.setFillColor(...COLORS.green);
  doc.rect(180, 145, 4, 50, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.green);
  doc.text('Security Features', 188, 158);

  const securityItems = [
    '✓ No data sent to servers',
    '✓ No cloud storage',
    '✓ No external APIs called',
    '✓ Works completely offline'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dark);
  securityItems.forEach((item, i) => {
    doc.text(item, 188, 168 + i * 8);
  });

  // ===== PAGE 6: Analytics Pipeline =====
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, 'Analytics Calculation Pipeline', 'How KPIs and metrics are computed', pageNum);

  // Pipeline diagram
  const pipeY = 55;

  // Raw Data
  drawCylinder(doc, 20, pipeY, 35, 30, 'Raw Data', COLORS.darkGray);

  drawArrow(doc, 55, pipeY + 15, 70, pipeY + 15, COLORS.primary, 3);

  // Filter Stage
  drawBox(doc, 70, pipeY + 2, 40, 25, 'Date\nFilter', COLORS.blue);

  drawArrow(doc, 110, pipeY + 15, 125, pipeY + 15, COLORS.primary, 3);

  // Calculations
  doc.setFillColor(...COLORS.orange);
  doc.roundedRect(125, pipeY - 10, 70, 50, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text('Calculation Engine', 160, pipeY + 2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const calcs = ['• Count by type', '• Group by hazard', '• Sum actions', '• Avg by time'];
  calcs.forEach((c, i) => {
    doc.text(c, 130, pipeY + 12 + i * 7);
  });

  drawArrow(doc, 195, pipeY + 15, 210, pipeY + 15, COLORS.primary, 3);

  // Memoization
  drawBox(doc, 210, pipeY + 2, 35, 25, 'Memo\nCache', COLORS.purple);

  drawArrow(doc, 245, pipeY + 15, 260, pipeY + 15, COLORS.primary, 3);

  // Output KPIs
  doc.setFillColor(...COLORS.green);
  doc.roundedRect(260, pipeY - 5, 25, 40, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('KPIs', 272, pipeY + 18, { align: 'center' });

  // KPI Cards examples
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Output: Dashboard KPIs', 20, 110);

  const kpis = [
    { name: 'Total Observations', formula: 'COUNT(records)', example: '1,247' },
    { name: 'Close Out Rate', formula: 'closed / total × 100', example: '94%' },
    { name: 'Positive Rate', formula: 'positive / total × 100', example: '78%' },
    { name: 'Overdue Actions', formula: 'COUNT(dueDate < today)', example: '12' },
  ];

  kpis.forEach((kpi, i) => {
    const kx = 25 + (i % 2) * 130;
    const ky = 120 + Math.floor(i / 2) * 35;

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(kx, ky, 120, 28, 3, 3, 'F');
    doc.setFillColor(...COLORS.primary);
    doc.rect(kx, ky, 3, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    doc.text(kpi.name, kx + 8, ky + 10);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.medGray);
    doc.text(kpi.formula, kx + 8, ky + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.primary);
    doc.text(kpi.example, kx + 100, ky + 14, { align: 'right' });
  });

  // Performance note
  doc.setFillColor(255, 248, 240);
  doc.roundedRect(20, 190, PAGE_WIDTH - 40, 14, 3, 3, 'F');
  doc.setFillColor(...COLORS.orange);
  doc.rect(20, 190, 4, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.orange);
  doc.text('Performance:', 28, 198);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.dark);
  doc.text('Memoization caches results. Recalculates only when data or filters change. Handles 2000+ records smoothly.', 58, 198);

  // ===== PAGE 7: Export Pipeline =====
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, 'Export Pipeline', 'How reports are generated from dashboard data', pageNum);

  // Central diagram
  const exportY = 60;

  // Dashboard source
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(120, exportY, 60, 35, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text('Dashboard', 150, exportY + 15, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Charts + Data', 150, exportY + 27, { align: 'center' });

  // PDF Branch
  drawArrow(doc, 120, exportY + 17, 70, exportY - 10, COLORS.red);

  doc.setFillColor(...COLORS.red);
  doc.roundedRect(20, exportY - 30, 50, 35, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('PDF Export', 45, exportY - 15, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('jsPDF library', 45, exportY - 5, { align: 'center' });

  // PPTX Branch
  drawArrow(doc, 180, exportY + 17, 230, exportY - 10, COLORS.orange);

  doc.setFillColor(...COLORS.orange);
  doc.roundedRect(230, exportY - 30, 50, 35, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('PPTX Export', 255, exportY - 15, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('PptxGenJS', 255, exportY - 5, { align: 'center' });

  // JSON Branch
  drawArrow(doc, 150, exportY + 35, 150, exportY + 55, COLORS.blue);

  doc.setFillColor(...COLORS.blue);
  doc.roundedRect(125, exportY + 55, 50, 35, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('JSON Backup', 150, exportY + 70, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Raw data export', 150, exportY + 80, { align: 'center' });

  // Export details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Export Formats Explained', 20, 130);

  const exports = [
    {
      name: 'PDF Report',
      lib: 'jsPDF',
      includes: ['KPI summary cards', 'Incident pyramid', 'Trend charts', 'Top hazards list'],
      format: 'A3 Portrait',
      color: COLORS.red
    },
    {
      name: 'PowerPoint',
      lib: 'PptxGenJS',
      includes: ['Title slide', 'KPI slides', 'Chart slides', 'Data tables'],
      format: '16:9 Slides',
      color: COLORS.orange
    },
    {
      name: 'JSON Backup',
      lib: 'Native JS',
      includes: ['All observations', 'Categories', 'Settings', 'Timestamps'],
      format: 'UTF-8 file',
      color: COLORS.blue
    }
  ];

  exports.forEach((exp, i) => {
    const ex = 20 + i * 92;
    const ey = 140;

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(ex, ey, 85, 55, 3, 3, 'F');
    doc.setFillColor(...exp.color);
    doc.rect(ex, ey, 85, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    doc.text(exp.name, ex + 42, ey + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.medGray);
    doc.text('Library: ' + exp.lib, ex + 5, ey + 24);
    doc.text('Format: ' + exp.format, ex + 5, ey + 31);

    doc.setTextColor(...COLORS.dark);
    doc.text('Includes:', ex + 5, ey + 40);
    doc.setFontSize(6);
    exp.includes.forEach((inc, j) => {
      doc.text('• ' + inc, ex + 8, ey + 47 + j * 5);
    });
  });

  // ===== PAGE 8: Summary Diagram =====
  doc.addPage();
  pageNum++;
  drawPageHeader(doc, 'Complete System Architecture', 'All components working together', pageNum);

  // Large system diagram
  const sysY = 50;

  // User
  doc.setFillColor(...COLORS.darkGray);
  doc.circle(30, sysY + 40, 15, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text('USER', 30, sysY + 43, { align: 'center' });

  // Arrow to Import
  drawArrow(doc, 45, sysY + 40, 60, sysY + 40, COLORS.primary, 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.medGray);
  doc.text('uploads', 52, sysY + 36);

  // Import Layer
  doc.setFillColor(...COLORS.green);
  doc.roundedRect(60, sysY + 25, 50, 30, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('IMPORT', 85, sysY + 35, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Excel Parser', 85, sysY + 43, { align: 'center' });
  doc.text('Validator', 85, sysY + 49, { align: 'center' });

  // Arrow to Processing
  drawArrow(doc, 110, sysY + 40, 125, sysY + 40, COLORS.primary, 3);

  // Processing Layer
  doc.setFillColor(...COLORS.purple);
  doc.roundedRect(125, sysY + 15, 55, 50, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('PROCESSING', 152, sysY + 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Classifier', 152, sysY + 38, { align: 'center' });
  doc.text('Context Mapper', 152, sysY + 45, { align: 'center' });
  doc.text('Sentence Parser', 152, sysY + 52, { align: 'center' });

  // Arrow to Storage
  drawArrow(doc, 180, sysY + 40, 195, sysY + 40, COLORS.primary, 3);

  // Storage Layer
  drawCylinder(doc, 195, sysY + 20, 40, 40, 'STORAGE', COLORS.blue);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.white);
  doc.text('IndexedDB', 215, sysY + 50, { align: 'center' });

  // Arrow to Analytics
  drawArrow(doc, 235, sysY + 40, 250, sysY + 40, COLORS.primary, 3);

  // Analytics Layer
  doc.setFillColor(...COLORS.orange);
  doc.roundedRect(250, sysY + 20, 45, 40, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('ANALYTICS', 272, sysY + 32, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Calculations', 272, sysY + 42, { align: 'center' });
  doc.text('Memoization', 272, sysY + 49, { align: 'center' });

  // Arrow down to UI
  drawArrow(doc, 272, sysY + 60, 272, sysY + 80, COLORS.primary, 3);

  // UI Layer
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(200, sysY + 80, 90, 35, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text('USER INTERFACE', 245, sysY + 92, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('React Components • Recharts • TailwindCSS', 245, sysY + 102, { align: 'center' });

  // Arrow back to user
  drawArrow(doc, 200, sysY + 97, 45, sysY + 50, COLORS.primary, 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.medGray);
  doc.text('views', 120, sysY + 85);

  // Export branch
  drawArrow(doc, 245, sysY + 115, 245, sysY + 135, COLORS.primary, 3);

  doc.setFillColor(...COLORS.darkGray);
  doc.roundedRect(210, sysY + 135, 70, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('EXPORT: PDF | PPTX | JSON', 245, sysY + 148, { align: 'center' });

  // Technology stack
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Technology Stack', 20, 170);

  const techs = [
    { name: 'React 18', desc: 'UI Components', color: COLORS.primary },
    { name: 'Vite', desc: 'Build Tool', color: COLORS.purple },
    { name: 'TailwindCSS', desc: 'Styling', color: COLORS.blue },
    { name: 'Recharts', desc: 'Charts', color: COLORS.green },
    { name: 'xlsx', desc: 'Excel Parsing', color: COLORS.orange },
    { name: 'jsPDF', desc: 'PDF Generation', color: COLORS.red },
    { name: 'idb', desc: 'IndexedDB Wrapper', color: COLORS.darkGray },
  ];

  techs.forEach((tech, i) => {
    const tx = 20 + (i % 4) * 70;
    const ty = 178 + Math.floor(i / 4) * 18;

    doc.setFillColor(...tech.color);
    doc.roundedRect(tx, ty, 60, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.white);
    doc.text(tech.name, tx + 3, ty + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(tech.desc, tx + 3, ty + 10);
  });

  // Save
  doc.save(OUTPUT_PATH);
  console.log(`\nPDF saved to: ${OUTPUT_PATH}`);
}

// Main
console.log('='.repeat(50));
console.log('HIDC Technical Diagrams PDF Generator');
console.log('='.repeat(50));
console.log('');

try {
  generatePDF();
  console.log('');
  console.log('Done! The technical diagrams PDF has been saved to your desktop.');
  console.log('');
} catch (error) {
  console.error('Error generating PDF:', error);
  process.exit(1);
}
