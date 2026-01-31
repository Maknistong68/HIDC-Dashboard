const PptxGenJS = require('pptxgenjs');
const path = require('path');

// OXAGON/NEOM Color Palette from template
const COLORS = {
  primary: '009CBD',      // Oxagon Cyan
  dark: '13100D',         // Almost black
  white: 'FFFFFF',
  darkGray: '37424A',
  medGray: '818A8F',
  lightGray: 'D1D4D3',
  lightBg: 'F5F5F5',      // Light solid background
  darkBlue: '003865',
  green: '006B44',
  orange: 'F18825',
  lightBlue: '007BB5',
  red: 'E0403F',
};

// Asset paths - NOTE: Only using bg1 (ocean) and bg3 (desert), NOT bg2 (project map)
const ASSETS = {
  textLogo: path.join(__dirname, 'assets', 'oxagon-text-logo.png'),
  hexLogo: path.join(__dirname, 'assets', 'oxagon-hex-logo.png'),
  bgOcean: path.join(__dirname, 'assets', 'bg1.jpeg'),    // Ocean coastline - scenic
  bgDesert: path.join(__dirname, 'assets', 'bg3.jpeg'),   // Desert night - scenic
  // bg2.jpeg is NOT used - it's a project map/diagram, not a scenic background
};

function generatePresentation() {
  const pptx = new PptxGenJS();

  pptx.author = 'Mark Ronnel Nieva';
  pptx.title = 'HIDC Dashboard - OXAGON EHSS Comprehensive Pitch';
  pptx.subject = 'Safety Intelligence Made Simple';
  pptx.company = 'NEOM - OXAGON';

  // 16:9 layout
  pptx.defineLayout({ name: 'CUSTOM', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM';

  // ===== SLIDE 1: Title Slide =====
  createSlide1_Title(pptx);

  // ===== SLIDE 2: The Challenge =====
  createSlide2_Challenge(pptx);

  // ===== SLIDE 3: Solution Overview =====
  createSlide3_Solution(pptx);

  // ===== SLIDE 4: Dashboard at a Glance =====
  createSlide4_Dashboard(pptx);

  // ===== SLIDE 5: Hazard Intelligence =====
  createSlide5_HazardIntelligence(pptx);

  // ===== SLIDE 6: Interactive Analytics =====
  createSlide6_Analytics(pptx);

  // ===== SLIDE 7: Data Control =====
  createSlide7_DataControl(pptx);

  // ===== SLIDE 8: Smart Settings =====
  createSlide8_Settings(pptx);

  // ===== SLIDE 9: Export & Mobile =====
  createSlide9_ExportMobile(pptx);

  // ===== SLIDE 10: Comparison Table =====
  createSlide10_Comparison(pptx);

  // ===== SLIDE 11: Why Approve =====
  createSlide11_WhyApprove(pptx);

  // ===== SLIDE 12: Call to Action =====
  createSlide12_CTA(pptx);

  // Save
  const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const filename = `HIDC-OXAGON-Pitch-${timestamp}.pptx`;
  const outputPath = `C:\\Users\\Mark Ronnel Nieva\\Desktop\\${filename}`;

  pptx.writeFile({ fileName: outputPath })
    .then(() => {
      console.log('');
      console.log('  ╔══════════════════════════════════════════════════════════╗');
      console.log('  ║      HIDC OXAGON PITCH PRESENTATION CREATED              ║');
      console.log('  ╚══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`  📄 File: ${filename}`);
      console.log(`  📁 Location: Desktop`);
      console.log('');
      console.log('  ✓ 12 comprehensive slides');
      console.log('  ✓ OXAGON logos and branding');
      console.log('  ✓ Scenic backgrounds (ocean & desert)');
      console.log('  ✓ Accurate app feature content');
      console.log('  ✓ 3 star features highlighted');
      console.log('');
      console.log('  Run inject-animations.cjs next for slide transitions.');
      console.log('');
    })
    .catch(err => {
      console.error('Error:', err);
    });
}

// ===== SLIDE 1: Title Slide with Ocean Background =====
function createSlide1_Title(pptx) {
  const slide = pptx.addSlide();

  // Background image - Ocean
  slide.addImage({
    path: ASSETS.bgOcean,
    x: 0, y: 0, w: '100%', h: '100%',
    sizing: { type: 'cover', w: '100%', h: '100%' },
  });

  // Dark overlay for readability
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark, transparency: 50 },
  });

  // Cyan accent line at top
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON text logo (top left)
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.35, w: 1.5, h: 0.4,
  });

  // OXAGON hex logo (center)
  slide.addImage({
    path: ASSETS.hexLogo,
    x: 5.9, y: 1.5, w: 1.5, h: 1.5,
  });

  // Main title
  slide.addText('HIDC Dashboard', {
    x: 0.5, y: 3.2, w: '95%', h: 0.9,
    fontSize: 52, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  // Subtitle
  slide.addText('Hazard Identification & Data Control', {
    x: 0.5, y: 4.0, w: '95%', h: 0.5,
    fontSize: 20, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // Tagline with cyan accent
  slide.addText('Safety Intelligence Made Simple', {
    x: 0.5, y: 4.7, w: '95%', h: 0.5,
    fontSize: 18, color: COLORS.primary, bold: true,
    align: 'center', fontFace: 'Arial',
  });

  // Stats bar at bottom
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.9, w: '100%', h: 1.1,
    fill: { color: COLORS.dark, transparency: 30 },
  });

  const stats = [
    { value: '30', label: 'Hazard Categories' },
    { value: '3,000+', label: 'Keyword Patterns' },
    { value: '$0', label: 'Total Cost' },
  ];

  stats.forEach((stat, i) => {
    const xPos = 2.5 + (i * 3.0);
    slide.addText(stat.value, {
      x: xPos, y: 6.0, w: 2.5, h: 0.5,
      fontSize: 28, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Arial',
    });
    slide.addText(stat.label, {
      x: xPos, y: 6.5, w: 2.5, h: 0.35,
      fontSize: 11, color: COLORS.lightGray,
      align: 'center', fontFace: 'Arial',
    });
  });

  // Footer
  slide.addText('OXAGON EHSS  •  Internal', {
    x: 10.5, y: 7.1, w: 2.5, h: 0.25,
    fontSize: 8, color: COLORS.medGray,
    align: 'right', fontFace: 'Arial',
  });
}

// ===== SLIDE 2: The Challenge (Dark Solid Background) =====
function createSlide2_Challenge(pptx) {
  const slide = pptx.addSlide();

  // Solid dark background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.3, y: 0.5, w: 2.7, h: 0.4,
    fill: { color: COLORS.red },
    rectRadius: 0.2,
  });
  slide.addText('THE CHALLENGE', {
    x: 5.3, y: 0.5, w: 2.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('WHY OUR TEAM STRUGGLES TODAY', {
    x: 0.5, y: 1.1, w: '95%', h: 0.7,
    fontSize: 28, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Current tools create friction that slows down safety reporting and decision-making.', {
    x: 1.5, y: 1.75, w: 10.3, h: 0.4,
    fontSize: 13, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // Problem cards
  const problems = [
    { icon: '🐌', title: 'Remote Desktop Lag', desc: 'Slow, frustrating Enablon experience that kills productivity every day.' },
    { icon: '📊', title: 'Excel Complexity', desc: 'Creating reports and dashboards requires advanced Excel skills most team members lack.' },
    { icon: '🔒', title: 'Power BI Blocked', desc: 'NEOM policy prevents account integration with external BI tools like Power BI.' },
    { icon: '📁', title: 'Data Overload', desc: 'Raw Enablon exports are hard to visualize and require hours of manual processing.' },
  ];

  problems.forEach((problem, i) => {
    const xPos = 0.6 + (i * 3.15);

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 2.4, w: 3.0, h: 4.2,
      fill: { color: COLORS.darkGray },
      rectRadius: 0.08,
    });

    // Red top accent for problems
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 2.4, w: 3.0, h: 0.05,
      fill: { color: COLORS.red },
    });

    // Icon
    slide.addText(problem.icon, {
      x: xPos, y: 2.7, w: 3.0, h: 1.0,
      fontSize: 44, align: 'center',
    });

    // Title
    slide.addText(problem.title, {
      x: xPos + 0.15, y: 3.8, w: 2.7, h: 0.5,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', fontFace: 'Arial',
    });

    // Description
    slide.addText(problem.desc, {
      x: xPos + 0.15, y: 4.4, w: 2.7, h: 1.8,
      fontSize: 11, color: COLORS.lightGray,
      align: 'center', fontFace: 'Arial', valign: 'top',
    });
  });

  addFooter(slide, pptx, true);
}

// ===== SLIDE 3: Solution Overview (Desert Background) =====
function createSlide3_Solution(pptx) {
  const slide = pptx.addSlide();

  // Background image - Desert
  slide.addImage({
    path: ASSETS.bgDesert,
    x: 0, y: 0, w: '100%', h: '100%',
    sizing: { type: 'cover', w: '100%', h: '100%' },
  });

  // Dark overlay
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark, transparency: 40 },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.0, y: 0.5, w: 3.3, h: 0.4,
    fill: { color: COLORS.green },
    rectRadius: 0.2,
  });
  slide.addText('THE SOLUTION', {
    x: 5.0, y: 0.5, w: 3.3, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('INTRODUCING HIDC DASHBOARD', {
    x: 0.5, y: 1.1, w: '95%', h: 0.6,
    fontSize: 28, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('A purpose-built tool that transforms raw Enablon data into actionable safety intelligence.', {
    x: 1.0, y: 1.65, w: 11.3, h: 0.4,
    fontSize: 13, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // Solution points in 2 columns
  const solutions = [
    { icon: '📥', title: 'One-Click Import', desc: 'Load Enablon exports instantly with automatic column mapping' },
    { icon: '📊', title: 'Instant Visualization', desc: 'See all safety data in interactive charts and dashboards' },
    { icon: '🧠', title: 'Smart Classification', desc: '3-layer AI-powered hazard auto-classification system' },
    { icon: '📤', title: 'Export Anywhere', desc: 'Generate PDF reports or PowerPoint presentations' },
    { icon: '💻', title: 'Runs Locally', desc: 'No IT dependencies, no network required, works offline' },
    { icon: '✅', title: 'Data Quality', desc: 'Built-in spell check, duplicate detection, and quality scoring' },
  ];

  solutions.forEach((sol, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xPos = 0.8 + (col * 6.3);
    const yPos = 2.3 + (row * 1.55);

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: yPos, w: 5.9, h: 1.35,
      fill: { color: COLORS.darkGray, transparency: 20 },
      rectRadius: 0.08,
    });

    // Icon circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: xPos + 0.2, y: yPos + 0.25, w: 0.85, h: 0.85,
      fill: { color: COLORS.primary },
    });

    slide.addText(sol.icon, {
      x: xPos + 0.2, y: yPos + 0.25, w: 0.85, h: 0.85,
      fontSize: 28, align: 'center', valign: 'middle',
    });

    slide.addText(sol.title, {
      x: xPos + 1.2, y: yPos + 0.25, w: 4.5, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.white,
      fontFace: 'Arial',
    });

    slide.addText(sol.desc, {
      x: xPos + 1.2, y: yPos + 0.65, w: 4.5, h: 0.5,
      fontSize: 11, color: COLORS.lightGray,
      fontFace: 'Arial',
    });
  });

  addFooter(slide, pptx, true);
}

// ===== SLIDE 4: Dashboard at a Glance (Light Solid) =====
function createSlide4_Dashboard(pptx) {
  const slide = pptx.addSlide();

  // Light solid background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.lightBg },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.8, y: 0.5, w: 3.7, h: 0.4,
    fill: { color: COLORS.primary },
    rectRadius: 0.2,
  });
  slide.addText('DASHBOARD OVERVIEW', {
    x: 4.8, y: 0.5, w: 3.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('EVERYTHING AT A GLANCE', {
    x: 0.5, y: 1.05, w: '95%', h: 0.6,
    fontSize: 28, bold: true, color: COLORS.dark,
    align: 'center', fontFace: 'Arial',
  });

  // KPI Cards row
  const kpis = [
    { value: '1,247', label: 'Total Observations', color: COLORS.primary },
    { value: '94%', label: 'Close-out Rate', color: COLORS.green },
    { value: '78%', label: 'Positive Rate', color: COLORS.green },
    { value: '12', label: 'Open >1 Month', color: COLORS.orange },
  ];

  kpis.forEach((kpi, i) => {
    const xPos = 0.5 + (i * 3.15);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 1.85, w: 3.0, h: 1.3,
      fill: { color: COLORS.white },
      shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, opacity: 0.15 },
      rectRadius: 0.08,
    });

    // Color accent
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 1.85, w: 3.0, h: 0.05,
      fill: { color: kpi.color },
    });

    slide.addText(kpi.value, {
      x: xPos, y: 1.95, w: 3.0, h: 0.65,
      fontSize: 28, bold: true, color: kpi.color,
      align: 'center', fontFace: 'Arial',
    });

    slide.addText(kpi.label, {
      x: xPos, y: 2.6, w: 3.0, h: 0.4,
      fontSize: 10, color: COLORS.medGray,
      align: 'center', fontFace: 'Arial',
    });
  });

  // Left panel - Incident Pyramid
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.35, w: 6.2, h: 3.5,
    fill: { color: COLORS.white },
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, opacity: 0.15 },
    rectRadius: 0.08,
  });

  slide.addText('Incident Pyramid', {
    x: 0.7, y: 3.5, w: 5.8, h: 0.4,
    fontSize: 13, bold: true, color: COLORS.dark,
    fontFace: 'Arial',
  });

  const pyramidItems = [
    { label: 'LTI / MTI / FAC', value: '3', color: COLORS.red },
    { label: 'Near Miss', value: '28', color: COLORS.orange },
    { label: 'NCR', value: '45', color: COLORS.orange },
    { label: 'Unsafe Act/Condition', value: '156', color: 'F5A623' },
    { label: 'Positive Observation', value: '892', color: COLORS.green },
    { label: 'Leadership Event', value: '123', color: COLORS.primary },
  ];

  pyramidItems.forEach((item, i) => {
    const yPos = 4.0 + (i * 0.45);
    const barWidth = 1.5 + (i * 0.7);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 3.35 - (barWidth / 2), y: yPos, w: barWidth, h: 0.38,
      fill: { color: item.color },
      rectRadius: 0.04,
    });

    slide.addText(item.label, {
      x: 0.8, y: yPos, w: 2.2, h: 0.38,
      fontSize: 9, color: COLORS.darkGray,
      valign: 'middle', fontFace: 'Arial',
    });

    slide.addText(item.value, {
      x: 5.5, y: yPos, w: 1.0, h: 0.38,
      fontSize: 10, bold: true, color: item.color,
      align: 'right', valign: 'middle', fontFace: 'Arial',
    });
  });

  // Right panel - Trend Chart preview
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.85, y: 3.35, w: 6.0, h: 3.5,
    fill: { color: COLORS.white },
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, opacity: 0.15 },
    rectRadius: 0.08,
  });

  slide.addText('12-Month Trend Analysis', {
    x: 7.05, y: 3.5, w: 5.6, h: 0.4,
    fontSize: 13, bold: true, color: COLORS.dark,
    fontFace: 'Arial',
  });

  // Simplified trend line visualization
  slide.addText('Positive vs Negative Observations', {
    x: 7.05, y: 3.9, w: 5.6, h: 0.3,
    fontSize: 10, color: COLORS.medGray,
    fontFace: 'Arial',
  });

  // Legend
  slide.addShape(pptx.ShapeType.rect, {
    x: 7.2, y: 4.35, w: 0.4, h: 0.15,
    fill: { color: COLORS.green },
  });
  slide.addText('Positive', {
    x: 7.7, y: 4.3, w: 1.2, h: 0.25,
    fontSize: 9, color: COLORS.darkGray, fontFace: 'Arial',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 9.0, y: 4.35, w: 0.4, h: 0.15,
    fill: { color: COLORS.red },
  });
  slide.addText('Negative', {
    x: 9.5, y: 4.3, w: 1.2, h: 0.25,
    fontSize: 9, color: COLORS.darkGray, fontFace: 'Arial',
  });

  // Trend bars (simplified)
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const posValues = [65, 72, 68, 80, 85, 78, 82, 90, 88, 92, 95, 98];
  const negValues = [35, 28, 32, 20, 15, 22, 18, 10, 12, 8, 5, 2];

  months.forEach((m, i) => {
    const xPos = 7.3 + (i * 0.45);
    const posH = (posValues[i] / 100) * 1.8;
    const negH = (negValues[i] / 100) * 1.8;

    // Positive bar
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 6.5 - posH, w: 0.18, h: posH,
      fill: { color: COLORS.green },
    });

    // Negative bar
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos + 0.2, y: 6.5 - negH, w: 0.18, h: negH,
      fill: { color: COLORS.red },
    });

    // Month label
    slide.addText(m, {
      x: xPos, y: 6.55, w: 0.4, h: 0.25,
      fontSize: 7, color: COLORS.medGray,
      align: 'center', fontFace: 'Arial',
    });
  });

  addFooter(slide, pptx);
}

// ===== SLIDE 5: Hazard Intelligence (Ocean Background + Light Overlay) =====
function createSlide5_HazardIntelligence(pptx) {
  const slide = pptx.addSlide();

  // Background image - Ocean
  slide.addImage({
    path: ASSETS.bgOcean,
    x: 0, y: 0, w: '100%', h: '100%',
    sizing: { type: 'cover', w: '100%', h: '100%' },
  });

  // Light overlay
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.white, transparency: 15 },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Star feature tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.0, y: 0.45, w: 3.3, h: 0.4,
    fill: { color: COLORS.orange },
    rectRadius: 0.2,
  });
  slide.addText('★ STAR FEATURE', {
    x: 5.0, y: 0.45, w: 3.3, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('HAZARD INTELLIGENCE', {
    x: 0.5, y: 1.0, w: '95%', h: 0.55,
    fontSize: 28, bold: true, color: COLORS.dark,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Industry-Leading 3-Layer Auto-Classification System', {
    x: 0.5, y: 1.5, w: '95%', h: 0.35,
    fontSize: 13, color: COLORS.darkGray,
    align: 'center', fontFace: 'Arial',
  });

  // Left: 30 Hazard Categories
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 2.0, w: 6.2, h: 4.7,
    fill: { color: COLORS.dark },
    rectRadius: 0.1,
  });

  slide.addText('30 Approved Hazard Categories', {
    x: 0.7, y: 2.2, w: 5.8, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  });

  slide.addText('13 Major Hazards', {
    x: 0.7, y: 2.7, w: 5.8, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.white,
    fontFace: 'Arial',
  });

  const majorHazards = [
    'Working at Height', 'Hot Work', 'Confined Spaces',
    'Excavation', 'Lifting Operations', 'Electrical Safety',
    'Hazardous Materials', 'Mobile Equipment', 'Scaffolding',
  ];

  majorHazards.forEach((h, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    slide.addText('• ' + h, {
      x: 0.7 + (col * 2.0), y: 3.05 + (row * 0.32), w: 2.0, h: 0.3,
      fontSize: 9, color: COLORS.lightGray,
      fontFace: 'Arial',
    });
  });

  slide.addText('17 Sub-Significant Hazards', {
    x: 0.7, y: 4.1, w: 5.8, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.white,
    fontFace: 'Arial',
  });

  const subHazards = [
    'PPE Compliance', 'Housekeeping', 'Fire Safety',
    'Ergonomics', 'Traffic Management', 'Environmental',
  ];

  subHazards.forEach((h, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    slide.addText('• ' + h, {
      x: 0.7 + (col * 2.0), y: 4.45 + (row * 0.32), w: 2.0, h: 0.3,
      fontSize: 9, color: COLORS.lightGray,
      fontFace: 'Arial',
    });
  });

  slide.addText('+ 11 more categories...', {
    x: 0.7, y: 5.15, w: 5.8, h: 0.3,
    fontSize: 9, italic: true, color: COLORS.medGray,
    fontFace: 'Arial',
  });

  // Right: 3-Layer Classification
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.85, y: 2.0, w: 6.0, h: 4.7,
    fill: { color: COLORS.white },
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, opacity: 0.15 },
    rectRadius: 0.1,
  });

  slide.addText('3-Layer Auto-Classification', {
    x: 7.05, y: 2.2, w: 5.6, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.dark,
    fontFace: 'Arial',
  });

  const layers = [
    { num: '1', title: 'Context-Aware Redirects', value: '870+', desc: 'Phrase patterns that redirect to correct categories' },
    { num: '2', title: 'Multi-Word Patterns', value: '2,000+', desc: 'Compound phrases for precise matching' },
    { num: '3', title: 'Single Keywords', value: '3,000+', desc: 'Individual keyword detection fallback' },
  ];

  layers.forEach((layer, i) => {
    const yPos = 2.75 + (i * 1.25);

    // Number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 7.2, y: yPos, w: 0.5, h: 0.5,
      fill: { color: COLORS.primary },
    });
    slide.addText(layer.num, {
      x: 7.2, y: yPos, w: 0.5, h: 0.5,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', valign: 'middle', fontFace: 'Arial',
    });

    slide.addText(layer.title, {
      x: 7.85, y: yPos, w: 4.8, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.dark,
      fontFace: 'Arial',
    });

    slide.addText(layer.value + ' patterns', {
      x: 7.85, y: yPos + 0.35, w: 4.8, h: 0.3,
      fontSize: 18, bold: true, color: COLORS.primary,
      fontFace: 'Arial',
    });

    slide.addText(layer.desc, {
      x: 7.85, y: yPos + 0.7, w: 4.8, h: 0.35,
      fontSize: 10, color: COLORS.medGray,
      fontFace: 'Arial',
    });
  });

  // Smart exclusions note
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.1, y: 6.15, w: 5.5, h: 0.4,
    fill: { color: COLORS.green, transparency: 85 },
    rectRadius: 0.05,
  });
  slide.addText('✓ Smart Exclusions prevent misclassification', {
    x: 7.1, y: 6.15, w: 5.5, h: 0.4,
    fontSize: 10, color: COLORS.green, bold: true,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  addFooter(slide, pptx);
}

// ===== SLIDE 6: Interactive Analytics (Dark Solid) =====
function createSlide6_Analytics(pptx) {
  const slide = pptx.addSlide();

  // Solid dark background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.6, y: 0.5, w: 4.1, h: 0.4,
    fill: { color: COLORS.primary },
    rectRadius: 0.2,
  });
  slide.addText('INTERACTIVE ANALYTICS', {
    x: 4.6, y: 0.5, w: 4.1, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('DRILL DOWN INTO YOUR DATA', {
    x: 0.5, y: 1.05, w: '95%', h: 0.6,
    fontSize: 28, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Every chart is interactive - click to explore deeper insights', {
    x: 0.5, y: 1.55, w: '95%', h: 0.35,
    fontSize: 13, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // Analytics features grid
  const features = [
    { icon: '🔍', title: '3-Level Drill-Down', desc: 'Chart → Month → Individual Records with breadcrumb navigation' },
    { icon: '🗺️', title: 'Hazard Heatmap', desc: 'Categories × Months with color intensity showing concentration' },
    { icon: '📊', title: 'Top 10 Hazards', desc: 'Ranked list with open/closed breakdown and drill-down' },
    { icon: '👥', title: 'Top 10 Observers', desc: 'Track reporter activity and contribution patterns' },
    { icon: '📅', title: 'Day of Week Analysis', desc: 'See which days have highest observation activity' },
    { icon: '🕐', title: 'Hour of Day Patterns', desc: 'Identify peak hours for safety observations' },
  ];

  features.forEach((feat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xPos = 0.5 + (col * 4.2);
    const yPos = 2.15 + (row * 2.4);

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: yPos, w: 4.0, h: 2.2,
      fill: { color: COLORS.darkGray },
      rectRadius: 0.08,
    });

    // Cyan top accent
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 4.0, h: 0.04,
      fill: { color: COLORS.primary },
    });

    // Icon
    slide.addText(feat.icon, {
      x: xPos, y: yPos + 0.2, w: 4.0, h: 0.7,
      fontSize: 32, align: 'center',
    });

    // Title
    slide.addText(feat.title, {
      x: xPos + 0.15, y: yPos + 0.95, w: 3.7, h: 0.4,
      fontSize: 13, bold: true, color: COLORS.white,
      align: 'center', fontFace: 'Arial',
    });

    // Description
    slide.addText(feat.desc, {
      x: xPos + 0.15, y: yPos + 1.4, w: 3.7, h: 0.65,
      fontSize: 10, color: COLORS.lightGray,
      align: 'center', fontFace: 'Arial',
    });
  });

  addFooter(slide, pptx, true);
}

// ===== SLIDE 7: Data Control (Desert Background) =====
function createSlide7_DataControl(pptx) {
  const slide = pptx.addSlide();

  // Background image - Desert
  slide.addImage({
    path: ASSETS.bgDesert,
    x: 0, y: 0, w: '100%', h: '100%',
    sizing: { type: 'cover', w: '100%', h: '100%' },
  });

  // Dark overlay
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark, transparency: 35 },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Star feature tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.0, y: 0.45, w: 3.3, h: 0.4,
    fill: { color: COLORS.orange },
    rectRadius: 0.2,
  });
  slide.addText('★ STAR FEATURE', {
    x: 5.0, y: 0.45, w: 3.3, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('DATA CONTROL & QUALITY', {
    x: 0.5, y: 1.0, w: '95%', h: 0.55,
    fontSize: 28, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Ensure your safety data is accurate, complete, and actionable', {
    x: 0.5, y: 1.5, w: '95%', h: 0.35,
    fontSize: 13, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // Quality Score highlight
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 2.1, w: 3.8, h: 2.3,
    fill: { color: COLORS.darkGray },
    rectRadius: 0.1,
  });

  slide.addText('Overall Quality Score', {
    x: 0.5, y: 2.25, w: 3.8, h: 0.35,
    fontSize: 11, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('87%', {
    x: 0.5, y: 2.65, w: 3.8, h: 1.0,
    fontSize: 56, bold: true, color: COLORS.green,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('per record scoring', {
    x: 0.5, y: 3.7, w: 3.8, h: 0.35,
    fontSize: 10, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // Quality features
  const qualityFeatures = [
    { icon: '📝', title: 'Spell Checker', value: '800+', desc: 'Industry terms dictionary' },
    { icon: '🚫', title: 'Foul Language', value: '45+', desc: 'Flagged terms detection' },
    { icon: '📋', title: 'Duplicates', value: '3 modes', desc: 'Exact, fuzzy, date tolerance' },
    { icon: '✅', title: 'Completeness', value: '100%', desc: 'Required fields analysis' },
    { icon: '❓', title: 'Vague Language', value: 'Auto', desc: 'Flags unclear descriptions' },
    { icon: '📊', title: 'Auto-Classification', value: 'Metrics', desc: 'Track categorization accuracy' },
  ];

  qualityFeatures.forEach((feat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xPos = 4.5 + (col * 2.9);
    const yPos = 2.1 + (row * 2.35);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: yPos, w: 2.75, h: 2.15,
      fill: { color: COLORS.darkGray },
      rectRadius: 0.08,
    });

    slide.addText(feat.icon, {
      x: xPos, y: yPos + 0.15, w: 2.75, h: 0.5,
      fontSize: 24, align: 'center',
    });

    slide.addText(feat.title, {
      x: xPos + 0.1, y: yPos + 0.7, w: 2.55, h: 0.35,
      fontSize: 11, bold: true, color: COLORS.white,
      align: 'center', fontFace: 'Arial',
    });

    slide.addText(feat.value, {
      x: xPos + 0.1, y: yPos + 1.05, w: 2.55, h: 0.45,
      fontSize: 18, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Arial',
    });

    slide.addText(feat.desc, {
      x: xPos + 0.1, y: yPos + 1.55, w: 2.55, h: 0.4,
      fontSize: 9, color: COLORS.lightGray,
      align: 'center', fontFace: 'Arial',
    });
  });

  addFooter(slide, pptx, true);
}

// ===== SLIDE 8: Smart Settings (Light Solid) =====
function createSlide8_Settings(pptx) {
  const slide = pptx.addSlide();

  // Light solid background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.lightBg },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.0, y: 0.5, w: 3.3, h: 0.4,
    fill: { color: COLORS.darkGray },
    rectRadius: 0.2,
  });
  slide.addText('SMART SETTINGS', {
    x: 5.0, y: 0.5, w: 3.3, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('FULLY CONFIGURABLE', {
    x: 0.5, y: 1.05, w: '95%', h: 0.6,
    fontSize: 28, bold: true, color: COLORS.dark,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('40+ options across 8 configuration sections', {
    x: 0.5, y: 1.55, w: '95%', h: 0.35,
    fontSize: 13, color: COLORS.medGray,
    align: 'center', fontFace: 'Arial',
  });

  // Settings categories
  const settings = [
    { icon: '🧹', title: 'Data Cleanup', items: ['Text normalization', 'Date formatting', 'Name standardization'] },
    { icon: '✅', title: 'Validation Rules', items: ['Required fields', 'Format checking', 'Range validation'] },
    { icon: '🏷️', title: 'Auto-Categorization', items: ['Keyword matching', 'Confidence thresholds', 'Override rules'] },
    { icon: '📋', title: 'Duplicate Handling', items: ['Match sensitivity', 'Date tolerance', 'Auto-merge options'] },
    { icon: '📥', title: 'Import Wizard', items: ['Column mapping', 'Category mapping', 'Preview & validate'] },
    { icon: '📤', title: 'Export Config', items: ['PDF settings', 'PPT templates', 'JSON backup'] },
    { icon: '📝', title: 'Master Lists', items: ['Contractors', 'Sites/Locations', 'Hazard categories'] },
    { icon: '⚙️', title: 'System Preferences', items: ['Theme options', 'Default views', 'Performance tuning'] },
  ];

  settings.forEach((setting, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const xPos = 0.5 + (col * 3.15);
    const yPos = 2.1 + (row * 2.55);

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: yPos, w: 3.0, h: 2.35,
      fill: { color: COLORS.white },
      shadow: { type: 'outer', blur: 3, offset: 1, angle: 45, opacity: 0.12 },
      rectRadius: 0.08,
    });

    // Color accent
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: yPos, w: 3.0, h: 0.04,
      fill: { color: COLORS.primary },
    });

    slide.addText(setting.icon, {
      x: xPos, y: yPos + 0.15, w: 3.0, h: 0.5,
      fontSize: 22, align: 'center',
    });

    slide.addText(setting.title, {
      x: xPos + 0.1, y: yPos + 0.7, w: 2.8, h: 0.35,
      fontSize: 11, bold: true, color: COLORS.dark,
      align: 'center', fontFace: 'Arial',
    });

    setting.items.forEach((item, j) => {
      slide.addText('• ' + item, {
        x: xPos + 0.2, y: yPos + 1.1 + (j * 0.35), w: 2.6, h: 0.32,
        fontSize: 9, color: COLORS.medGray,
        fontFace: 'Arial',
      });
    });
  });

  addFooter(slide, pptx);
}

// ===== SLIDE 9: Export & Mobile (Ocean Background) =====
function createSlide9_ExportMobile(pptx) {
  const slide = pptx.addSlide();

  // Background image - Ocean
  slide.addImage({
    path: ASSETS.bgOcean,
    x: 0, y: 0, w: '100%', h: '100%',
    sizing: { type: 'cover', w: '100%', h: '100%' },
  });

  // Dark overlay
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark, transparency: 45 },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.8, y: 0.5, w: 3.7, h: 0.4,
    fill: { color: COLORS.primary },
    rectRadius: 0.2,
  });
  slide.addText('EXPORT & MOBILE', {
    x: 4.8, y: 0.5, w: 3.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('WORK ANYWHERE, SHARE EVERYWHERE', {
    x: 0.5, y: 1.05, w: '95%', h: 0.6,
    fontSize: 28, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  // Export features - Left side
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.9, w: 6.2, h: 4.8,
    fill: { color: COLORS.darkGray },
    rectRadius: 0.1,
  });

  slide.addText('Export Options', {
    x: 0.7, y: 2.1, w: 5.8, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  });

  const exportFeatures = [
    { icon: '📄', title: 'PDF Export', desc: 'Full dashboard capture with all charts and data tables' },
    { icon: '📊', title: 'PowerPoint Export', desc: 'Individual charts as presentation slides' },
    { icon: '💾', title: 'JSON Backup', desc: 'Complete data export for archiving and recovery' },
    { icon: '✅', title: 'Confirmation Dialog', desc: 'Review disclaimer before generating reports' },
  ];

  exportFeatures.forEach((feat, i) => {
    const yPos = 2.65 + (i * 1.05);

    slide.addText(feat.icon, {
      x: 0.8, y: yPos, w: 0.6, h: 0.5,
      fontSize: 22,
    });

    slide.addText(feat.title, {
      x: 1.5, y: yPos, w: 4.9, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.white,
      fontFace: 'Arial',
    });

    slide.addText(feat.desc, {
      x: 1.5, y: yPos + 0.38, w: 4.9, h: 0.45,
      fontSize: 10, color: COLORS.lightGray,
      fontFace: 'Arial',
    });
  });

  // Mobile features - Right side
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.85, y: 1.9, w: 6.0, h: 4.8,
    fill: { color: COLORS.darkGray },
    rectRadius: 0.1,
  });

  slide.addText('Mobile & PWA', {
    x: 7.05, y: 2.1, w: 5.6, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  });

  const mobileFeatures = [
    { icon: '📱', title: 'Responsive Design', desc: 'Works perfectly on phone, tablet, and desktop' },
    { icon: '⬇️', title: 'Install as App', desc: 'Add to home screen like a native application' },
    { icon: '📡', title: 'Offline Support', desc: 'Access your data even without internet' },
    { icon: '🔄', title: 'Auto-Sync', desc: 'Seamlessly sync when connection restored' },
  ];

  mobileFeatures.forEach((feat, i) => {
    const yPos = 2.65 + (i * 1.05);

    slide.addText(feat.icon, {
      x: 7.15, y: yPos, w: 0.6, h: 0.5,
      fontSize: 22,
    });

    slide.addText(feat.title, {
      x: 7.85, y: yPos, w: 4.7, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.white,
      fontFace: 'Arial',
    });

    slide.addText(feat.desc, {
      x: 7.85, y: yPos + 0.38, w: 4.7, h: 0.45,
      fontSize: 10, color: COLORS.lightGray,
      fontFace: 'Arial',
    });
  });

  addFooter(slide, pptx, true);
}

// ===== SLIDE 10: Comparison Table (Light Solid) =====
function createSlide10_Comparison(pptx) {
  const slide = pptx.addSlide();

  // Light solid background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.lightBg },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.3, y: 0.5, w: 2.7, h: 0.4,
    fill: { color: COLORS.dark },
    rectRadius: 0.2,
  });
  slide.addText('COMPARISON', {
    x: 5.3, y: 0.5, w: 2.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('CURRENT WORKFLOW VS HIDC DASHBOARD', {
    x: 0.5, y: 1.0, w: '95%', h: 0.55,
    fontSize: 26, bold: true, color: COLORS.dark,
    align: 'center', fontFace: 'Arial',
  });

  // Table header
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.65, w: 12.3, h: 0.55,
    fill: { color: COLORS.dark },
  });

  // Cyan left border accent
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.65, w: 0.05, h: 0.55,
    fill: { color: COLORS.primary },
  });

  slide.addText('Capability', {
    x: 0.7, y: 1.65, w: 3.0, h: 0.55,
    fontSize: 11, bold: true, color: COLORS.white,
    valign: 'middle', fontFace: 'Arial',
  });
  slide.addText('Excel + Remote Desktop', {
    x: 3.8, y: 1.65, w: 4.2, h: 0.55,
    fontSize: 11, bold: true, color: COLORS.white,
    valign: 'middle', fontFace: 'Arial',
  });
  slide.addText('HIDC Dashboard', {
    x: 8.2, y: 1.65, w: 4.4, h: 0.55,
    fontSize: 11, bold: true, color: COLORS.primary,
    valign: 'middle', fontFace: 'Arial',
  });

  // Expanded comparison rows
  const comparisons = [
    ['Performance', 'Slow - RDP lag', 'Fast - runs locally'],
    ['Skills Required', 'Advanced Excel expertise', 'No technical skills'],
    ['Hazard Categories', '12 (manual classification)', '30 (automatic)'],
    ['Classification', 'Manual keyword search', 'AI-powered 3-layer system'],
    ['Report Generation', 'Hours of manual work', 'One-click export'],
    ['Trend Analysis', 'Complex formulas needed', 'Built-in visualization'],
    ['Data Quality', 'No validation', 'Spell check, duplicates, scoring'],
    ['Mobile Access', 'Not supported', 'Fully responsive PWA'],
    ['Cost', 'Existing tools', '$0 - Free forever'],
  ];

  comparisons.forEach((row, i) => {
    const yPos = 2.2 + (i * 0.55);
    const bgColor = i % 2 === 0 ? 'F8F8F8' : COLORS.white;

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yPos, w: 12.3, h: 0.55,
      fill: { color: bgColor },
      line: { color: COLORS.lightGray, pt: 0.3 },
    });

    // Cyan left border accent
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yPos, w: 0.05, h: 0.55,
      fill: { color: COLORS.primary },
    });

    slide.addText(row[0], {
      x: 0.7, y: yPos, w: 3.0, h: 0.55,
      fontSize: 10, bold: true, color: COLORS.dark,
      valign: 'middle', fontFace: 'Arial',
    });

    // Red X for current workflow
    slide.addText('✗ ' + row[1], {
      x: 3.8, y: yPos, w: 4.2, h: 0.55,
      fontSize: 10, color: COLORS.red,
      valign: 'middle', fontFace: 'Arial',
    });

    // Green check for HIDC
    slide.addText('✓ ' + row[2], {
      x: 8.2, y: yPos, w: 4.4, h: 0.55,
      fontSize: 10, color: COLORS.green, bold: true,
      valign: 'middle', fontFace: 'Arial',
    });
  });

  addFooter(slide, pptx);
}

// ===== SLIDE 11: Why Approve (Desert Background) =====
function createSlide11_WhyApprove(pptx) {
  const slide = pptx.addSlide();

  // Background image - Desert
  slide.addImage({
    path: ASSETS.bgDesert,
    x: 0, y: 0, w: '100%', h: '100%',
    sizing: { type: 'cover', w: '100%', h: '100%' },
  });

  // Dark overlay
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark, transparency: 40 },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logo
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.25, w: 1.2, h: 0.32,
  });

  // Section tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.3, y: 0.5, w: 4.7, h: 0.4,
    fill: { color: COLORS.green },
    rectRadius: 0.2,
  });
  slide.addText('FOR DECISION MAKERS', {
    x: 4.3, y: 0.5, w: 4.7, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  // Title
  slide.addText('WHY APPROVE THIS TOOL?', {
    x: 0.5, y: 1.05, w: '95%', h: 0.6,
    fontSize: 28, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Clear value with zero implementation risk', {
    x: 0.5, y: 1.55, w: '95%', h: 0.35,
    fontSize: 13, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // Value proposition cards
  const values = [
    { icon: '🛡️', title: 'Reduced Risk', desc: 'Proactive hazard detection with 30 categories catches issues before incidents occur', color: COLORS.green },
    { icon: '👁️', title: 'Full Visibility', desc: '8 KPIs, incident pyramid, trends, heatmap - see everything at a glance', color: COLORS.primary },
    { icon: '💰', title: 'Zero Cost', desc: 'No licensing, no procurement process, no IT involvement required', color: COLORS.orange },
    { icon: '⚡', title: 'Instant Value', desc: 'From import to insights in under 2 minutes. Built, tested, ready now', color: COLORS.primary },
  ];

  values.forEach((value, i) => {
    const xPos = 0.4 + (i * 3.2);

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 2.1, w: 3.05, h: 4.5,
      fill: { color: COLORS.darkGray },
      rectRadius: 0.08,
    });

    // Color accent at top
    slide.addShape(pptx.ShapeType.rect, {
      x: xPos, y: 2.1, w: 3.05, h: 0.05,
      fill: { color: value.color },
    });

    // Icon circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: xPos + 0.75, y: 2.5, w: 1.55, h: 1.55,
      fill: { color: value.color },
    });

    // Icon
    slide.addText(value.icon, {
      x: xPos + 0.75, y: 2.55, w: 1.55, h: 1.5,
      fontSize: 44, align: 'center', valign: 'middle',
    });

    // Title
    slide.addText(value.title, {
      x: xPos + 0.1, y: 4.25, w: 2.85, h: 0.45,
      fontSize: 15, bold: true, color: COLORS.white,
      align: 'center', fontFace: 'Arial',
    });

    // Description
    slide.addText(value.desc, {
      x: xPos + 0.15, y: 4.8, w: 2.75, h: 1.5,
      fontSize: 11, color: COLORS.lightGray,
      align: 'center', fontFace: 'Arial', valign: 'top',
    });
  });

  // Bottom highlight
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 2.5, y: 6.75, w: 8.3, h: 0.5,
    fill: { color: COLORS.green, transparency: 80 },
    rectRadius: 0.05,
  });
  slide.addText('✓ Data Quality: Spell check, duplicate detection, completeness scoring built-in', {
    x: 2.5, y: 6.75, w: 8.3, h: 0.5,
    fontSize: 11, color: COLORS.white, bold: true,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  });

  addFooter(slide, pptx, true);
}

// ===== SLIDE 12: Call to Action (Ocean Background) =====
function createSlide12_CTA(pptx) {
  const slide = pptx.addSlide();

  // Background image - Ocean
  slide.addImage({
    path: ASSETS.bgOcean,
    x: 0, y: 0, w: '100%', h: '100%',
    sizing: { type: 'cover', w: '100%', h: '100%' },
  });

  // Dark overlay
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark, transparency: 50 },
  });

  // Cyan accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: COLORS.primary },
  });

  // OXAGON logos
  slide.addImage({
    path: ASSETS.textLogo,
    x: 0.5, y: 0.35, w: 1.5, h: 0.4,
  });

  slide.addImage({
    path: ASSETS.hexLogo,
    x: 11.5, y: 0.2, w: 0.9, h: 0.9,
  });

  // Title
  slide.addText('Ready to Transform', {
    x: 0.5, y: 2.0, w: '95%', h: 0.8,
    fontSize: 42, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Your Safety Data?', {
    x: 0.5, y: 2.7, w: '95%', h: 0.8,
    fontSize: 42, bold: true, color: COLORS.primary,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('The tool is built, tested, and ready for immediate use.', {
    x: 0.5, y: 3.6, w: '95%', h: 0.5,
    fontSize: 16, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // CTA Box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.2, y: 4.3, w: 6.9, h: 2.3,
    fill: { color: COLORS.darkGray, transparency: 20 },
    line: { color: COLORS.primary, pt: 2 },
    rectRadius: 0.1,
  });

  slide.addText('Launch HIDC Dashboard', {
    x: 3.2, y: 4.55, w: 6.9, h: 0.55,
    fontSize: 22, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  });

  slide.addText('Transform Enablon exports into actionable insights today', {
    x: 3.2, y: 5.1, w: 6.9, h: 0.4,
    fontSize: 12, color: COLORS.lightGray,
    align: 'center', fontFace: 'Arial',
  });

  // Button
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.7, y: 5.65, w: 3.9, h: 0.7,
    fill: { color: COLORS.primary },
    rectRadius: 0.06,
  });

  slide.addText('Open Dashboard  →', {
    x: 4.7, y: 5.65, w: 3.9, h: 0.7,
    fontSize: 15, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
    hyperlink: { url: 'https://hidc-dashboard.vercel.app' },
  });

  // Footer
  slide.addText('HIDC Dashboard  •  A productivity tool that complements existing Enablon workflow', {
    x: 0.5, y: 6.95, w: '75%', h: 0.3,
    fontSize: 9, color: COLORS.lightGray,
    fontFace: 'Arial',
  });

  slide.addText('OXAGON EHSS  •  Internal', {
    x: 10.0, y: 6.95, w: 2.8, h: 0.3,
    fontSize: 9, color: COLORS.medGray,
    align: 'right', fontFace: 'Arial',
  });
}

// Helper function to add consistent footer
function addFooter(slide, pptx, darkBg = false) {
  const textColor = COLORS.medGray;

  // Footer line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 6.85, w: 12.3, h: 0.01,
    fill: { color: darkBg ? COLORS.darkGray : COLORS.lightGray },
  });

  slide.addText('OXAGON EHSS  •  Internal', {
    x: 10.0, y: 6.95, w: 2.8, h: 0.3,
    fontSize: 8, color: textColor,
    align: 'right', fontFace: 'Arial',
  });
}

generatePresentation();
