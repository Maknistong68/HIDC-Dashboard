const PptxGenJS = require('pptxgenjs');

// Color palette matching HTML
const COLORS = {
  slate900: '0f172a',
  slate800: '1e293b',
  slate700: '334155',
  slate600: '475569',
  slate500: '64748b',
  slate400: '94a3b8',
  slate200: 'e2e8f0',
  slate100: 'f1f5f9',
  slate50: 'f8fafc',
  teal600: '0d9488',
  teal500: '14b8a6',
  teal400: '2dd4bf',
  emerald500: '10b981',
  red500: 'ef4444',
  amber500: 'f59e0b',
  white: 'FFFFFF',
};

function generatePitch() {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'Mark Ronnel Nieva';
  pptx.title = 'HIDC Dashboard - Management Proposal';
  pptx.subject = 'Safety Intelligence Made Simple';
  pptx.company = 'KION GROUP';

  // Define layout - 16:9
  pptx.defineLayout({ name: 'CUSTOM', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM';

  // ===== SLIDE 1: Title Slide =====
  let slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.12,
    fill: { color: COLORS.teal500 },
  });

  // Logo icon
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.8, y: 1.8, w: 0.7, h: 0.7,
    fill: { color: COLORS.teal500 },
    rectRadius: 0.1,
  });
  slide.addText('H', {
    x: 5.8, y: 1.8, w: 0.7, h: 0.7,
    fontSize: 28, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Main title
  slide.addText('HIDC Dashboard', {
    x: 0.5, y: 2.6, w: '95%', h: 0.8,
    fontSize: 44, bold: true, color: COLORS.slate900,
    align: 'center', fontFace: 'Arial',
  });

  // Subtitle
  slide.addText('Management Proposal', {
    x: 0.5, y: 3.3, w: '95%', h: 0.5,
    fontSize: 24, color: COLORS.slate500,
    align: 'center', fontFace: 'Arial',
  });

  // Tagline
  slide.addText('Safety Intelligence Made Simple', {
    x: 0.5, y: 4.2, w: '95%', h: 0.5,
    fontSize: 18, color: COLORS.teal600, bold: true,
    align: 'center', fontFace: 'Arial',
  });

  // Key stats box
  slide.addShape(pptx.ShapeType.rect, {
    x: 2.5, y: 5.2, w: 8.3, h: 1.2,
    fill: { color: COLORS.slate50 },
    line: { color: COLORS.slate200, pt: 1 },
  });

  // Stats
  const stats = [
    { value: '29', label: 'Hazard Categories' },
    { value: '<2m', label: 'To Dashboard' },
    { value: '$0', label: 'Total Cost' },
  ];

  stats.forEach((stat, i) => {
    const xPos = 3.0 + (i * 2.7);
    slide.addText(stat.value, {
      x: xPos, y: 5.3, w: 2.2, h: 0.5,
      fontSize: 28, bold: true, color: COLORS.teal600,
      align: 'center', fontFace: 'Arial',
    });
    slide.addText(stat.label, {
      x: xPos, y: 5.8, w: 2.2, h: 0.4,
      fontSize: 11, color: COLORS.slate500,
      align: 'center', fontFace: 'Arial',
    });
  });

  // ===== SLIDE 2: The Challenge =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.slate900 };

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.5, y: 0.6, w: 2.3, h: 0.4,
    fill: { color: COLORS.teal500 },
    rectRadius: 0.2,
  });
  slide.addText('THE CHALLENGE', {
    x: 5.5, y: 0.6, w: 2.3, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Why Our Team Struggles Today', {
    x: 0.5, y: 1.2, w: '95%', h: 0.8,
    fontSize: 36, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Current tools create friction that slows down safety reporting and decision-making.', {
    x: 1.5, y: 2.0, w: 10.3, h: 0.5,
    fontSize: 16, color: COLORS.slate400,
    align: 'center', fontFace: 'Arial',
  });

  // Problem cards
  const problems = [
    { icon: '🐌', title: 'Remote Desktop Lag', desc: 'Slow, frustrating experience that kills productivity every single day.' },
    { icon: '📊', title: 'Excel Complexity', desc: 'Creating dashboards requires expertise most team members don\'t have.' },
    { icon: '🔒', title: 'Power BI Blocked', desc: 'NEOM policy prevents account integration with external BI tools.' },
    { icon: '📁', title: 'Raw Data Overload', desc: 'Enablon exports are spreadsheets - hard to visualize and present.' },
  ];

  problems.forEach((problem, i) => {
    const xPos = 0.8 + (i * 3.1);

    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 2.8, w: 2.9, h: 3.5,
      fill: { color: COLORS.slate800 },
      line: { color: COLORS.slate700, pt: 1 },
      rectRadius: 0.1,
    });

    // Icon
    slide.addText(problem.icon, {
      x: xPos, y: 3.0, w: 2.9, h: 0.8,
      fontSize: 36, align: 'center', fontFace: 'Arial',
    });

    // Title
    slide.addText(problem.title, {
      x: xPos + 0.2, y: 3.9, w: 2.5, h: 0.5,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', fontFace: 'Arial',
    });

    // Description
    slide.addText(problem.desc, {
      x: xPos + 0.2, y: 4.5, w: 2.5, h: 1.4,
      fontSize: 11, color: COLORS.slate400,
      align: 'center', fontFace: 'Arial', valign: 'top',
    });
  });

  // ===== SLIDE 3: Hazard Identification =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.12,
    fill: { color: COLORS.teal500 },
  });

  // Star feature tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 0.4, w: 2.9, h: 0.4,
    fill: { type: 'solid', color: COLORS.amber500 },
    rectRadius: 0.2,
  });
  slide.addText('⭐ STAR FEATURE', {
    x: 5.2, y: 0.4, w: 2.9, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Hazard Identification', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.slate900,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('From Reactive to Proactive Safety Intelligence', {
    x: 0.5, y: 1.6, w: '95%', h: 0.4,
    fontSize: 16, color: COLORS.slate500,
    align: 'center', fontFace: 'Arial',
  });

  // Left side - Features
  const features = [
    { title: '29 Hazard Categories', desc: 'Expanded from Enablon\'s 12' },
    { title: 'Auto-Classification', desc: 'Pattern-based from descriptions' },
    { title: 'Trend Detection', desc: '12-month visualization' },
    { title: 'Priority Ranking', desc: 'Focus on highest-risk areas' },
  ];

  features.forEach((feat, i) => {
    const yPos = 2.4 + (i * 0.9);

    // Checkmark
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: yPos, w: 0.4, h: 0.4,
      fill: { color: COLORS.teal500 },
      rectRadius: 0.05,
    });
    slide.addText('✓', {
      x: 0.8, y: yPos, w: 0.4, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', valign: 'middle', fontFace: 'Arial',
    });

    // Feature text
    slide.addText(feat.title, {
      x: 1.4, y: yPos - 0.05, w: 4.5, h: 0.3,
      fontSize: 14, bold: true, color: COLORS.slate800,
      fontFace: 'Arial',
    });
    slide.addText(feat.desc, {
      x: 1.4, y: yPos + 0.25, w: 4.5, h: 0.3,
      fontSize: 12, color: COLORS.slate500,
      fontFace: 'Arial',
    });
  });

  // Right side - Visual bars
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 2.2, w: 5.8, h: 4.3,
    fill: { color: COLORS.slate50 },
    line: { color: COLORS.slate200, pt: 1 },
    rectRadius: 0.1,
  });

  const hazards = [
    { name: 'Working at Height', value: 85 },
    { name: 'Housekeeping', value: 72 },
    { name: 'PPE Compliance', value: 65 },
    { name: 'Hot Work', value: 48 },
    { name: 'Excavation', value: 35 },
  ];

  hazards.forEach((hazard, i) => {
    const yPos = 2.5 + (i * 0.78);

    slide.addText(hazard.name, {
      x: 7.0, y: yPos, w: 3.5, h: 0.3,
      fontSize: 11, color: COLORS.slate700,
      fontFace: 'Arial',
    });
    slide.addText(`${hazard.value}%`, {
      x: 11.3, y: yPos, w: 1.0, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.teal600,
      align: 'right', fontFace: 'Arial',
    });

    // Bar track
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.0, y: yPos + 0.32, w: 5.3, h: 0.2,
      fill: { color: COLORS.slate200 },
      rectRadius: 0.1,
    });

    // Bar fill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.0, y: yPos + 0.32, w: 5.3 * (hazard.value / 100), h: 0.2,
      fill: { color: COLORS.teal500 },
      rectRadius: 0.1,
    });
  });

  // ===== SLIDE 4: Data Control =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.slate50 };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.12,
    fill: { color: COLORS.teal500 },
  });

  // Star feature tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 0.4, w: 2.9, h: 0.4,
    fill: { type: 'solid', color: COLORS.amber500 },
    rectRadius: 0.2,
  });
  slide.addText('⭐ STAR FEATURE', {
    x: 5.2, y: 0.4, w: 2.9, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Data Control', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.slate900,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Centralized Intelligence for Informed Decision-Making', {
    x: 0.5, y: 1.6, w: '95%', h: 0.4,
    fontSize: 16, color: COLORS.slate500,
    align: 'center', fontFace: 'Arial',
  });

  // Left side - KPI Cards
  const kpis = [
    { value: '94%', label: 'Close-out Rate', color: COLORS.teal600 },
    { value: '12', label: 'Overdue Actions', color: COLORS.red500 },
    { value: '1,247', label: 'Total Observations', color: COLORS.teal600 },
    { value: '78%', label: 'Positive Rate', color: COLORS.teal600 },
  ];

  kpis.forEach((kpi, i) => {
    const xPos = 0.8 + ((i % 2) * 2.6);
    const yPos = 2.4 + (Math.floor(i / 2) * 2.0);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: yPos, w: 2.4, h: 1.7,
      fill: { color: COLORS.white },
      line: { color: COLORS.slate200, pt: 1 },
      rectRadius: 0.1,
    });

    slide.addText(kpi.value, {
      x: xPos, y: yPos + 0.3, w: 2.4, h: 0.7,
      fontSize: 32, bold: true, color: kpi.color,
      align: 'center', fontFace: 'Arial',
    });

    slide.addText(kpi.label, {
      x: xPos, y: yPos + 1.1, w: 2.4, h: 0.4,
      fontSize: 11, color: COLORS.slate500,
      align: 'center', fontFace: 'Arial',
    });
  });

  // Right side - Features
  const dataFeatures = [
    { title: 'Single Source View', desc: 'All metrics in one dashboard' },
    { title: 'Real-time Tracking', desc: 'Monitor close-out rates live' },
    { title: 'Audit Trail', desc: 'Complete data lineage' },
    { title: 'One-click Export', desc: 'PDF, PPT, JSON backup' },
  ];

  dataFeatures.forEach((feat, i) => {
    const yPos = 2.4 + (i * 0.9);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: yPos, w: 0.4, h: 0.4,
      fill: { color: COLORS.teal500 },
      rectRadius: 0.05,
    });
    slide.addText('✓', {
      x: 6.8, y: yPos, w: 0.4, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', valign: 'middle', fontFace: 'Arial',
    });

    slide.addText(feat.title, {
      x: 7.4, y: yPos - 0.05, w: 5.0, h: 0.3,
      fontSize: 14, bold: true, color: COLORS.slate800,
      fontFace: 'Arial',
    });
    slide.addText(feat.desc, {
      x: 7.4, y: yPos + 0.25, w: 5.0, h: 0.3,
      fontSize: 12, color: COLORS.slate500,
      fontFace: 'Arial',
    });
  });

  // ===== SLIDE 5: Comparison =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.slate50 };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.12,
    fill: { color: COLORS.teal500 },
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.5, y: 0.4, w: 2.3, h: 0.4,
    fill: { color: COLORS.teal500 },
    rectRadius: 0.2,
  });
  slide.addText('SIDE BY SIDE', {
    x: 5.5, y: 0.4, w: 2.3, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Current Workflow vs HIDC', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.slate900,
    align: 'center', fontFace: 'Arial',
  });

  // Comparison table
  const tableRows = [
    ['Capability', 'Excel + Remote Desktop', 'HIDC Dashboard'],
    ['Performance', 'Slow - Remote Desktop lag', 'Fast - Runs locally ✓'],
    ['Skills Required', 'Advanced Excel expertise', 'No technical skills ✓'],
    ['Hazard Categories', '12 (manual classification)', '29 (automatic) ✓'],
    ['Report Generation', 'Hours of manual work', 'One-click export ✓'],
    ['Trend Analysis', 'Complex formulas required', 'Built-in visualization ✓'],
    ['Cost', 'Existing tools', '$0 - Free forever ✓'],
  ];

  slide.addTable(tableRows, {
    x: 1.2, y: 1.9, w: 10.9,
    fontSize: 11,
    fontFace: 'Arial',
    border: { pt: 0.5, color: COLORS.slate200 },
    colW: [2.8, 3.8, 4.3],
    rowH: 0.6,
    fill: { color: COLORS.white },
    color: COLORS.slate700,
    valign: 'middle',
    align: 'left',
    autoPage: false,
  });

  // Style header row
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.2, y: 1.9, w: 10.9, h: 0.6,
    fill: { color: COLORS.slate800 },
  });

  slide.addText('Capability', {
    x: 1.3, y: 1.9, w: 2.7, h: 0.6,
    fontSize: 12, bold: true, color: COLORS.white,
    valign: 'middle', fontFace: 'Arial',
  });
  slide.addText('Excel + Remote Desktop', {
    x: 4.0, y: 1.9, w: 3.7, h: 0.6,
    fontSize: 12, bold: true, color: COLORS.white,
    valign: 'middle', fontFace: 'Arial',
  });
  slide.addText('HIDC Dashboard', {
    x: 7.9, y: 1.9, w: 4.2, h: 0.6,
    fontSize: 12, bold: true, color: COLORS.white,
    valign: 'middle', fontFace: 'Arial',
  });

  // ===== SLIDE 6: Why Approve? =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.12,
    fill: { color: COLORS.teal500 },
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.8, y: 0.4, w: 3.7, h: 0.4,
    fill: { color: COLORS.teal500 },
    rectRadius: 0.2,
  });
  slide.addText('FOR DECISION MAKERS', {
    x: 4.8, y: 0.4, w: 3.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Why Approve This Tool?', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.slate900,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Clear value with zero implementation risk.', {
    x: 0.5, y: 1.6, w: '95%', h: 0.4,
    fontSize: 16, color: COLORS.slate500,
    align: 'center', fontFace: 'Arial',
  });

  // Value cards
  const values = [
    { icon: '🛡️', title: 'Reduced Risk', desc: 'Proactive hazard detection catches issues before incidents occur.' },
    { icon: '👁️', title: 'Full Visibility', desc: 'See all safety metrics instantly without waiting for reports.' },
    { icon: '💰', title: 'Zero Cost', desc: 'No licensing, no procurement, no IT involvement required.' },
    { icon: '⚡', title: 'Instant Value', desc: 'From import to insights in under 2 minutes. Ready now.' },
  ];

  values.forEach((value, i) => {
    const xPos = 0.7 + (i * 3.15);

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 2.3, w: 2.95, h: 4.0,
      fill: { color: COLORS.white },
      line: { color: COLORS.slate200, pt: 1 },
      rectRadius: 0.1,
      shadow: { type: 'outer', blur: 8, offset: 2, angle: 90, opacity: 0.1 },
    });

    // Icon background
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.9, y: 2.6, w: 1.15, h: 1.15,
      fill: { color: COLORS.teal500 },
      rectRadius: 0.15,
    });

    // Icon
    slide.addText(value.icon, {
      x: xPos + 0.9, y: 2.65, w: 1.15, h: 1.1,
      fontSize: 36, align: 'center', valign: 'middle',
    });

    // Title
    slide.addText(value.title, {
      x: xPos + 0.2, y: 4.0, w: 2.55, h: 0.5,
      fontSize: 16, bold: true, color: COLORS.slate900,
      align: 'center', fontFace: 'Arial',
    });

    // Description
    slide.addText(value.desc, {
      x: xPos + 0.2, y: 4.5, w: 2.55, h: 1.3,
      fontSize: 12, color: COLORS.slate500,
      align: 'center', fontFace: 'Arial', valign: 'top',
    });
  });

  // ===== SLIDE 7: CTA =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.slate900 };

  // Title
  slide.addText('Ready to Get Started?', {
    x: 0.5, y: 2.0, w: '95%', h: 0.8,
    fontSize: 40, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('The tool is built, tested, and ready for immediate use.', {
    x: 0.5, y: 2.8, w: '95%', h: 0.5,
    fontSize: 18, color: COLORS.slate400,
    align: 'center', fontFace: 'Arial',
  });

  // CTA Box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.5, y: 3.8, w: 6.3, h: 2.5,
    fill: { color: COLORS.white },
    rectRadius: 0.15,
  });

  slide.addText('Launch HIDC Dashboard', {
    x: 3.5, y: 4.1, w: 6.3, h: 0.6,
    fontSize: 22, bold: true, color: COLORS.slate900,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Transform your Enablon data into actionable insights today.', {
    x: 3.5, y: 4.6, w: 6.3, h: 0.5,
    fontSize: 13, color: COLORS.slate500,
    align: 'center', fontFace: 'Arial',
  });

  // Button
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.9, y: 5.3, w: 3.5, h: 0.7,
    fill: { color: COLORS.teal500 },
    rectRadius: 0.08,
  });

  slide.addText('Open Dashboard →', {
    x: 4.9, y: 5.3, w: 3.5, h: 0.7,
    fontSize: 14, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
    hyperlink: { url: 'https://hidc-dashboard.vercel.app' },
  });

  // Footer
  slide.addText('HIDC Dashboard - A productivity tool that complements existing Enablon workflow.', {
    x: 0.5, y: 6.8, w: '95%', h: 0.4,
    fontSize: 10, color: COLORS.slate500,
    align: 'center', fontFace: 'Arial',
  });

  // Save
  const filename = 'HIDC-Executive-Pitch.pptx';
  pptx.writeFile({ fileName: `C:\\Users\\Mark Ronnel Nieva\\Desktop\\${filename}` })
    .then(() => {
      console.log(`✓ Presentation saved: ${filename}`);
      console.log(`  Location: C:\\Users\\Mark Ronnel Nieva\\Desktop\\${filename}`);
    })
    .catch(err => {
      console.error('Error saving presentation:', err);
    });
}

generatePitch();
