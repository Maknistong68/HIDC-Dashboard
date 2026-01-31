const PptxGenJS = require('pptxgenjs');

// OXAGON/NEOM Color Palette from template
const COLORS = {
  // Primary Oxagon colors
  primary: '009CBD',      // Oxagon Cyan - accent1
  dark: '13100D',         // Almost black - dk1
  white: 'FFFFFF',

  // Grays
  darkGray: '37424A',     // accent4
  medGray: '818A8F',      // accent5
  lightGray: 'D1D4D3',    // accent6
  blueGray: '44546A',     // dk2

  // Custom brand colors
  darkBlue: '003865',
  darkBlue50: '94BDDB',
  darkBlue25: 'CADEED',
  green: '006B44',
  green50: '84B6A2',
  green25: 'C2DBD0',
  orange: 'F18825',
  orange50: 'F9C496',
  orange25: 'FBE2CB',
  lightBlue: '007BB5',
  lightBlue50: '85BEDB',
  lightBlue25: 'C3DEEC',
  red: 'E0403F',
  red50: 'F1A1A1',
  red25: 'F7D0D0',
};

function generateOxagonPitch() {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'Mark Ronnel Nieva';
  pptx.title = 'HIDC Dashboard - OXAGON EHSS Proposal';
  pptx.subject = 'Safety Intelligence Made Simple';
  pptx.company = 'NEOM - OXAGON';

  // Define layout - 16:9
  pptx.defineLayout({ name: 'CUSTOM', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM';

  // ===== SLIDE 1: Title Slide =====
  let slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.primary },
  });

  // OXAGON branding text
  slide.addText('OXAGON', {
    x: 0.5, y: 0.4, w: 3, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  });

  // Logo icon
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.0, y: 2.0, w: 1.3, h: 1.3,
    fill: { color: COLORS.primary },
    rectRadius: 0.15,
  });
  slide.addText('HIDC', {
    x: 6.0, y: 2.0, w: 1.3, h: 1.3,
    fontSize: 24, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Main title
  slide.addText('HIDC Dashboard', {
    x: 0.5, y: 3.4, w: '95%', h: 0.9,
    fontSize: 48, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  // Subtitle
  slide.addText('Hazard Identification & Data Control', {
    x: 0.5, y: 4.2, w: '95%', h: 0.5,
    fontSize: 20, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // Tagline with accent
  slide.addText('Safety Intelligence Made Simple', {
    x: 0.5, y: 5.0, w: '95%', h: 0.5,
    fontSize: 18, color: COLORS.primary, bold: true,
    align: 'center', fontFace: 'Arial',
  });

  // Key stats box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 2.5, y: 5.8, w: 8.3, h: 1.0,
    fill: { color: COLORS.darkGray },
    rectRadius: 0.08,
  });

  // Stats
  const stats = [
    { value: '29', label: 'Hazard Categories' },
    { value: '<2min', label: 'To Dashboard' },
    { value: '$0', label: 'Total Cost' },
  ];

  stats.forEach((stat, i) => {
    const xPos = 3.0 + (i * 2.7);
    slide.addText(stat.value, {
      x: xPos, y: 5.85, w: 2.2, h: 0.45,
      fontSize: 24, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Arial',
    });
    slide.addText(stat.label, {
      x: xPos, y: 6.3, w: 2.2, h: 0.35,
      fontSize: 10, color: COLORS.medGray,
      align: 'center', fontFace: 'Arial',
    });
  });

  // ===== SLIDE 2: The Challenge =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.primary },
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.3, y: 0.4, w: 2.7, h: 0.4,
    fill: { color: COLORS.dark },
    rectRadius: 0.2,
  });
  slide.addText('THE CHALLENGE', {
    x: 5.3, y: 0.4, w: 2.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Why Our Team Struggles Today', {
    x: 0.5, y: 1.1, w: '95%', h: 0.8,
    fontSize: 32, bold: true, color: COLORS.dark,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Current tools create friction that slows down safety reporting and decision-making.', {
    x: 1.5, y: 1.85, w: 10.3, h: 0.5,
    fontSize: 14, color: COLORS.medGray,
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
    const xPos = 0.7 + (i * 3.15);

    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 2.6, w: 2.95, h: 4.0,
      fill: { color: COLORS.dark },
      rectRadius: 0.1,
    });

    // Red top accent
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 2.6, w: 2.95, h: 0.06,
      fill: { color: COLORS.red },
    });

    // Icon
    slide.addText(problem.icon, {
      x: xPos, y: 2.9, w: 2.95, h: 0.9,
      fontSize: 40, align: 'center', fontFace: 'Arial',
    });

    // Title
    slide.addText(problem.title, {
      x: xPos + 0.15, y: 3.9, w: 2.65, h: 0.5,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', fontFace: 'Arial',
    });

    // Description
    slide.addText(problem.desc, {
      x: xPos + 0.15, y: 4.5, w: 2.65, h: 1.8,
      fontSize: 11, color: COLORS.medGray,
      align: 'center', fontFace: 'Arial', valign: 'top',
    });
  });

  // ===== SLIDE 3: Hazard Identification =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.primary },
  });

  // Star feature tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.0, y: 0.35, w: 3.3, h: 0.45,
    fill: { color: COLORS.orange },
    rectRadius: 0.22,
  });
  slide.addText('★ STAR FEATURE', {
    x: 5.0, y: 0.35, w: 3.3, h: 0.45,
    fontSize: 11, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Hazard Identification', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.dark,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('From Reactive to Proactive Safety Intelligence', {
    x: 0.5, y: 1.6, w: '95%', h: 0.4,
    fontSize: 14, color: COLORS.medGray,
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
    const yPos = 2.3 + (i * 1.05);

    // Checkmark circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.7, y: yPos, w: 0.45, h: 0.45,
      fill: { color: COLORS.primary },
    });
    slide.addText('✓', {
      x: 0.7, y: yPos, w: 0.45, h: 0.45,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', valign: 'middle', fontFace: 'Arial',
    });

    // Feature text
    slide.addText(feat.title, {
      x: 1.35, y: yPos - 0.05, w: 4.8, h: 0.35,
      fontSize: 14, bold: true, color: COLORS.dark,
      fontFace: 'Arial',
    });
    slide.addText(feat.desc, {
      x: 1.35, y: yPos + 0.3, w: 4.8, h: 0.35,
      fontSize: 12, color: COLORS.medGray,
      fontFace: 'Arial',
    });
  });

  // Right side - Visual bars
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.6, y: 2.1, w: 6.0, h: 4.6,
    fill: { color: COLORS.dark },
    rectRadius: 0.12,
  });

  slide.addText('Top Hazards Identified', {
    x: 6.8, y: 2.3, w: 5.6, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  });

  const hazards = [
    { name: 'Working at Height', value: 85 },
    { name: 'Housekeeping', value: 72 },
    { name: 'PPE Compliance', value: 65 },
    { name: 'Hot Work', value: 48 },
    { name: 'Excavation', value: 35 },
  ];

  hazards.forEach((hazard, i) => {
    const yPos = 2.85 + (i * 0.82);

    slide.addText(hazard.name, {
      x: 6.9, y: yPos, w: 3.8, h: 0.3,
      fontSize: 11, color: COLORS.lightGray,
      fontFace: 'Arial',
    });
    slide.addText(`${hazard.value}%`, {
      x: 11.3, y: yPos, w: 1.1, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.primary,
      align: 'right', fontFace: 'Arial',
    });

    // Bar track
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.9, y: yPos + 0.35, w: 5.5, h: 0.22,
      fill: { color: COLORS.darkGray },
      rectRadius: 0.11,
    });

    // Bar fill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.9, y: yPos + 0.35, w: 5.5 * (hazard.value / 100), h: 0.22,
      fill: { color: COLORS.primary },
      rectRadius: 0.11,
    });
  });

  // ===== SLIDE 4: Data Control =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.primary },
  });

  // Star feature tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.0, y: 0.35, w: 3.3, h: 0.45,
    fill: { color: COLORS.orange },
    rectRadius: 0.22,
  });
  slide.addText('★ STAR FEATURE', {
    x: 5.0, y: 0.35, w: 3.3, h: 0.45,
    fontSize: 11, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Data Control', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Centralized Intelligence for Informed Decision-Making', {
    x: 0.5, y: 1.6, w: '95%', h: 0.4,
    fontSize: 14, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // Left side - KPI Cards
  const kpis = [
    { value: '94%', label: 'Close-out Rate', color: COLORS.green },
    { value: '12', label: 'Overdue Actions', color: COLORS.red },
    { value: '1,247', label: 'Total Observations', color: COLORS.primary },
    { value: '78%', label: 'Positive Rate', color: COLORS.green },
  ];

  kpis.forEach((kpi, i) => {
    const xPos = 0.7 + ((i % 2) * 2.7);
    const yPos = 2.3 + (Math.floor(i / 2) * 2.1);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: yPos, w: 2.5, h: 1.85,
      fill: { color: COLORS.darkGray },
      rectRadius: 0.1,
    });

    // Color accent line at top
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 2.5, h: 0.05,
      fill: { color: kpi.color },
    });

    slide.addText(kpi.value, {
      x: xPos, y: yPos + 0.35, w: 2.5, h: 0.7,
      fontSize: 32, bold: true, color: kpi.color,
      align: 'center', fontFace: 'Arial',
    });

    slide.addText(kpi.label, {
      x: xPos, y: yPos + 1.15, w: 2.5, h: 0.45,
      fontSize: 11, color: COLORS.lightGray,
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
    const yPos = 2.3 + (i * 1.05);

    slide.addShape(pptx.ShapeType.ellipse, {
      x: 6.6, y: yPos, w: 0.45, h: 0.45,
      fill: { color: COLORS.primary },
    });
    slide.addText('✓', {
      x: 6.6, y: yPos, w: 0.45, h: 0.45,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', valign: 'middle', fontFace: 'Arial',
    });

    slide.addText(feat.title, {
      x: 7.25, y: yPos - 0.05, w: 5.0, h: 0.35,
      fontSize: 14, bold: true, color: COLORS.white,
      fontFace: 'Arial',
    });
    slide.addText(feat.desc, {
      x: 7.25, y: yPos + 0.3, w: 5.0, h: 0.35,
      fontSize: 12, color: COLORS.medGray,
      fontFace: 'Arial',
    });
  });

  // ===== SLIDE 5: Comparison =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.primary },
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.3, y: 0.35, w: 2.7, h: 0.4,
    fill: { color: COLORS.dark },
    rectRadius: 0.2,
  });
  slide.addText('COMPARISON', {
    x: 5.3, y: 0.35, w: 2.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Current Workflow vs HIDC', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.dark,
    align: 'center', fontFace: 'Arial',
  });

  // Table header
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.9, w: 11.7, h: 0.65,
    fill: { color: COLORS.dark },
  });

  slide.addText('Capability', {
    x: 0.9, y: 1.9, w: 3.0, h: 0.65,
    fontSize: 12, bold: true, color: COLORS.white,
    valign: 'middle', fontFace: 'Arial',
  });
  slide.addText('Excel + Remote Desktop', {
    x: 4.0, y: 1.9, w: 4.0, h: 0.65,
    fontSize: 12, bold: true, color: COLORS.white,
    valign: 'middle', fontFace: 'Arial',
  });
  slide.addText('HIDC Dashboard', {
    x: 8.2, y: 1.9, w: 4.2, h: 0.65,
    fontSize: 12, bold: true, color: COLORS.primary,
    valign: 'middle', fontFace: 'Arial',
  });

  // Table rows
  const comparisons = [
    ['Performance', 'Slow - Remote Desktop lag', 'Fast - Runs locally'],
    ['Skills Required', 'Advanced Excel expertise', 'No technical skills'],
    ['Hazard Categories', '12 (manual classification)', '29 (automatic)'],
    ['Report Generation', 'Hours of manual work', 'One-click export'],
    ['Trend Analysis', 'Complex formulas required', 'Built-in visualization'],
    ['Cost', 'Existing tools', '$0 - Free forever'],
  ];

  comparisons.forEach((row, i) => {
    const yPos = 2.55 + (i * 0.7);
    const bgColor = i % 2 === 0 ? 'F8F9FA' : COLORS.white;

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: yPos, w: 11.7, h: 0.7,
      fill: { color: bgColor },
      line: { color: COLORS.lightGray, pt: 0.5 },
    });

    slide.addText(row[0], {
      x: 0.9, y: yPos, w: 3.0, h: 0.7,
      fontSize: 11, bold: true, color: COLORS.dark,
      valign: 'middle', fontFace: 'Arial',
    });
    slide.addText(row[1], {
      x: 4.0, y: yPos, w: 4.0, h: 0.7,
      fontSize: 11, color: COLORS.red,
      valign: 'middle', fontFace: 'Arial',
    });
    slide.addText('✓ ' + row[2], {
      x: 8.2, y: yPos, w: 4.2, h: 0.7,
      fontSize: 11, color: COLORS.green, bold: true,
      valign: 'middle', fontFace: 'Arial',
    });
  });

  // ===== SLIDE 6: Why Approve? =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.primary },
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.5, y: 0.35, w: 4.3, h: 0.4,
    fill: { color: COLORS.primary },
    rectRadius: 0.2,
  });
  slide.addText('FOR DECISION MAKERS', {
    x: 4.5, y: 0.35, w: 4.3, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('Why Approve This Tool?', {
    x: 0.5, y: 1.0, w: '95%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Clear value with zero implementation risk.', {
    x: 0.5, y: 1.6, w: '95%', h: 0.4,
    fontSize: 14, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // Value cards
  const values = [
    { icon: '🛡️', title: 'Reduced Risk', desc: 'Proactive hazard detection catches issues before incidents occur.', color: COLORS.green },
    { icon: '👁️', title: 'Full Visibility', desc: 'See all safety metrics instantly without waiting for reports.', color: COLORS.primary },
    { icon: '💰', title: 'Zero Cost', desc: 'No licensing, no procurement, no IT involvement required.', color: COLORS.orange },
    { icon: '⚡', title: 'Instant Value', desc: 'From import to insights in under 2 minutes. Ready now.', color: COLORS.primary },
  ];

  values.forEach((value, i) => {
    const xPos = 0.6 + (i * 3.2);

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 2.2, w: 3.0, h: 4.4,
      fill: { color: COLORS.darkGray },
      rectRadius: 0.1,
    });

    // Top accent
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 2.2, w: 3.0, h: 0.06,
      fill: { color: value.color },
    });

    // Icon background
    slide.addShape(pptx.ShapeType.ellipse, {
      x: xPos + 0.85, y: 2.6, w: 1.3, h: 1.3,
      fill: { color: value.color },
    });

    // Icon
    slide.addText(value.icon, {
      x: xPos + 0.85, y: 2.6, w: 1.3, h: 1.3,
      fontSize: 40, align: 'center', valign: 'middle',
    });

    // Title
    slide.addText(value.title, {
      x: xPos + 0.15, y: 4.15, w: 2.7, h: 0.5,
      fontSize: 16, bold: true, color: COLORS.white,
      align: 'center', fontFace: 'Arial',
    });

    // Description
    slide.addText(value.desc, {
      x: xPos + 0.15, y: 4.7, w: 2.7, h: 1.5,
      fontSize: 11, color: COLORS.lightGray,
      align: 'center', fontFace: 'Arial', valign: 'top',
    });
  });

  // ===== SLIDE 7: CTA =====
  slide = pptx.addSlide();
  slide.background = { color: COLORS.dark };

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.primary },
  });

  // OXAGON branding
  slide.addText('OXAGON', {
    x: 0.5, y: 0.4, w: 3, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  });

  // Title
  slide.addText('Ready to Get Started?', {
    x: 0.5, y: 2.3, w: '95%', h: 0.9,
    fontSize: 40, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('The tool is built, tested, and ready for immediate use.', {
    x: 0.5, y: 3.1, w: '95%', h: 0.5,
    fontSize: 16, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // CTA Box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.2, y: 4.0, w: 6.9, h: 2.5,
    fill: { color: COLORS.darkGray },
    rectRadius: 0.12,
  });

  slide.addText('Launch HIDC Dashboard', {
    x: 3.2, y: 4.35, w: 6.9, h: 0.6,
    fontSize: 22, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Transform your Enablon data into actionable insights today.', {
    x: 3.2, y: 4.9, w: 6.9, h: 0.5,
    fontSize: 12, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // Button
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.7, y: 5.5, w: 3.9, h: 0.7,
    fill: { color: COLORS.primary },
    rectRadius: 0.08,
  });

  slide.addText('Open Dashboard  →', {
    x: 4.7, y: 5.5, w: 3.9, h: 0.7,
    fontSize: 14, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
    hyperlink: { url: 'https://hidc-dashboard.vercel.app' },
  });

  // Footer
  slide.addText('HIDC Dashboard  •  A productivity tool that complements existing Enablon workflow', {
    x: 0.5, y: 6.9, w: '95%', h: 0.35,
    fontSize: 9, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // Save
  const filename = 'HIDC-OXAGON-Pitch.pptx';
  pptx.writeFile({ fileName: `C:\\Users\\Mark Ronnel Nieva\\Desktop\\${filename}` })
    .then(() => {
      console.log(`✓ Presentation saved: ${filename}`);
      console.log(`  Location: C:\\Users\\Mark Ronnel Nieva\\Desktop\\${filename}`);
      console.log('');
      console.log('  Color scheme: OXAGON/NEOM branding');
      console.log('  Primary color: #009CBD (Oxagon Cyan)');
      console.log('  Dark background: #13100D');
    })
    .catch(err => {
      console.error('Error saving presentation:', err);
    });
}

generateOxagonPitch();
