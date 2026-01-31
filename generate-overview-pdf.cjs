/**
 * HIDC Application Overview PDF Generator
 * Creates a professional PDF document with screenshots for manager presentation
 *
 * Usage: node generate-overview-pdf.cjs
 * Requires: npm run dev (app must be running on localhost:5173)
 */

const puppeteer = require('puppeteer');
const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:3001';
const OUTPUT_PATH = 'C:\\Users\\Mark Ronnel Nieva\\Desktop\\HIDC_Application_Overview.pdf';
const SCREENSHOT_DIR = path.join(__dirname, 'temp_screenshots');

// Colors (matching OXAGON/NEOM branding)
const COLORS = {
  primary: [0, 156, 189],      // #009CBD - Oxagon Cyan
  dark: [19, 16, 13],          // #13100D - Almost black
  white: [255, 255, 255],
  darkGray: [55, 66, 74],      // #37424A
  medGray: [129, 138, 143],    // #818A8F
  lightGray: [209, 212, 211],  // #D1D4D3
  green: [0, 107, 68],         // #006B44
  orange: [241, 136, 37],      // #F18825
  red: [224, 64, 63],          // #E0403F
};

// Page dimensions (A4)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

/**
 * Ensure screenshot directory exists
 */
function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

/**
 * Clean up screenshot directory
 */
function cleanupScreenshots() {
  if (fs.existsSync(SCREENSHOT_DIR)) {
    const files = fs.readdirSync(SCREENSHOT_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(SCREENSHOT_DIR, file));
    });
    fs.rmdirSync(SCREENSHOT_DIR);
  }
}

/**
 * Wait helper function
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Capture screenshots of the application
 */
async function captureScreenshots() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const screenshots = {};

  try {
    // 1. Dashboard Overview
    console.log('Capturing Dashboard...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);
    screenshots.dashboard = path.join(SCREENSHOT_DIR, 'dashboard.png');
    await page.screenshot({ path: screenshots.dashboard, fullPage: false });
    console.log('  - Dashboard captured');

    // 2. Data Quality Page
    console.log('Capturing Data Quality...');
    await page.goto(`${APP_URL}/data-control`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);
    screenshots.dataQuality = path.join(SCREENSHOT_DIR, 'data-quality.png');
    await page.screenshot({ path: screenshots.dataQuality, fullPage: false });
    console.log('  - Data Quality captured');

    // 3. Safety Outlook Page
    console.log('Capturing Safety Outlook...');
    await page.goto(`${APP_URL}/safety-outlook`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);
    screenshots.safetyOutlook = path.join(SCREENSHOT_DIR, 'safety-outlook.png');
    await page.screenshot({ path: screenshots.safetyOutlook, fullPage: false });
    console.log('  - Safety Outlook captured');

    // 4. Import Wizard
    console.log('Capturing Import Wizard...');
    await page.goto(`${APP_URL}/import`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);
    screenshots.importWizard = path.join(SCREENSHOT_DIR, 'import-wizard.png');
    await page.screenshot({ path: screenshots.importWizard, fullPage: false });
    console.log('  - Import Wizard captured');

    // 5. Insights Page (What-If Simulator)
    console.log('Capturing What-If Simulator...');
    await page.goto(`${APP_URL}/insights`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);
    screenshots.whatIf = path.join(SCREENSHOT_DIR, 'what-if.png');
    await page.screenshot({ path: screenshots.whatIf, fullPage: false });
    console.log('  - What-If Simulator captured');

  } catch (error) {
    console.log('Note: Some pages may not be accessible. Using available screenshots.');
    console.log('Error:', error.message);
  }

  await browser.close();
  console.log('Screenshots captured successfully.');

  return screenshots;
}

/**
 * Add a page header with accent bar
 */
function addPageHeader(doc, title, pageNum) {
  // Cyan accent bar at top
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_WIDTH, 8, 'F');

  // Page title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.dark);
  doc.text(title, MARGIN, 28);

  // Page number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.medGray);
  doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: 'right' });

  // Footer line
  doc.setDrawColor(...COLORS.lightGray);
  doc.line(MARGIN, PAGE_HEIGHT - 15, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15);
}

/**
 * Add a bullet point
 */
function addBullet(doc, text, x, y, bulletColor = COLORS.primary) {
  doc.setFillColor(...bulletColor);
  doc.circle(x + 2, y - 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text(text, x + 8, y);
  return y + 8;
}

/**
 * Add a section header
 */
function addSectionHeader(doc, text, y, color = COLORS.primary) {
  doc.setFillColor(...color);
  doc.roundedRect(MARGIN, y, 4, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.text(text, MARGIN + 10, y + 11);
  return y + 24;
}

/**
 * Add a feature card
 */
function addFeatureCard(doc, x, y, width, height, title, description, icon) {
  // Card background
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(x, y, width, height, 3, 3, 'F');

  // Accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(x, y, width, 3, 'F');

  // Icon circle
  doc.setFillColor(...COLORS.primary);
  doc.circle(x + width/2, y + 20, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.white);
  doc.text(icon, x + width/2, y + 24, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text(title, x + width/2, y + 42, { align: 'center' });

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.medGray);
  const lines = doc.splitTextToSize(description, width - 10);
  doc.text(lines, x + width/2, y + 52, { align: 'center' });
}

/**
 * Add screenshot with caption
 */
function addScreenshot(doc, imagePath, y, caption, maxHeight = 100) {
  if (!fs.existsSync(imagePath)) {
    // Show placeholder if screenshot not available
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 60, 3, 3, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.medGray);
    doc.text('Screenshot not available - run app to capture', PAGE_WIDTH/2, y + 30, { align: 'center' });
    return y + 70;
  }

  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    // Add border
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.5);

    // Calculate aspect ratio (screenshots are 1920x1080)
    const aspectRatio = 1920 / 1080;
    const imageWidth = CONTENT_WIDTH;
    let imageHeight = imageWidth / aspectRatio;

    if (imageHeight > maxHeight) {
      imageHeight = maxHeight;
    }

    doc.addImage(`data:image/png;base64,${base64Image}`, 'PNG', MARGIN, y, imageWidth, imageHeight);
    doc.roundedRect(MARGIN, y, imageWidth, imageHeight, 2, 2, 'S');

    // Caption
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.medGray);
    doc.text(caption, PAGE_WIDTH/2, y + imageHeight + 6, { align: 'center' });

    return y + imageHeight + 14;
  } catch (error) {
    console.log(`Could not add image: ${imagePath}`);
    return y + 10;
  }
}

/**
 * Generate the PDF document
 */
async function generatePDF(screenshots) {
  console.log('Generating PDF document...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let pageNum = 1;

  // ===== PAGE 1: Title Page =====
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Cyan accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_WIDTH, 10, 'F');

  // Logo box
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(PAGE_WIDTH/2 - 25, 80, 50, 50, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.text('HIDC', PAGE_WIDTH/2, 112, { align: 'center' });

  // Main title
  doc.setFontSize(36);
  doc.setTextColor(...COLORS.white);
  doc.text('HIDC Dashboard', PAGE_WIDTH/2, 160, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.medGray);
  doc.text('Hazard Identification & Data Control', PAGE_WIDTH/2, 175, { align: 'center' });

  // Tagline
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text('Transforming Safety Data into Actionable Insights', PAGE_WIDTH/2, 195, { align: 'center' });

  // Divider
  doc.setDrawColor(...COLORS.darkGray);
  doc.setLineWidth(0.5);
  doc.line(60, 210, PAGE_WIDTH - 60, 210);

  // Application Overview label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text('APPLICATION OVERVIEW', PAGE_WIDTH/2, 225, { align: 'center' });

  // For: Safety Management Teams
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.medGray);
  doc.text('For Safety Managers & HSE Teams', PAGE_WIDTH/2, 238, { align: 'center' });

  // Date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateStr, PAGE_WIDTH/2, 250, { align: 'center' });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.darkGray);
  doc.text('NEOM - OXAGON EHSS', PAGE_WIDTH/2, PAGE_HEIGHT - 15, { align: 'center' });

  // ===== PAGE 2: Executive Summary =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'Executive Summary', pageNum);

  let y = 45;

  // What is HIDC?
  y = addSectionHeader(doc, 'What is HIDC?', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  const introText = 'HIDC (Hazard Identification and Data Control) is a safety observation tracking and analysis tool designed for HSE management teams. It transforms raw Enablon exports into visual, actionable insights.';
  const introLines = doc.splitTextToSize(introText, CONTENT_WIDTH);
  doc.text(introLines, MARGIN, y);
  y += introLines.length * 6 + 10;

  // Key Capabilities
  y = addSectionHeader(doc, 'Key Capabilities', y);

  const capabilities = [
    'Import and track safety observations from Excel files (NEOM Enablon format)',
    'Automatically classify hazards into 30 approved categories using AI pattern matching',
    'Monitor critical KPIs: Close-out Rate, Positive Observation Rate, Overdue Actions',
    'Identify data quality issues and records requiring attention',
    'Run "What-If" scenarios to model intervention impact'
  ];

  capabilities.forEach(cap => {
    y = addBullet(doc, cap, MARGIN, y);
  });

  y += 10;

  // Key Benefits Box
  doc.setFillColor(240, 248, 250);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 55, 4, 4, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.rect(MARGIN, y, 4, 55, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text('Key Benefits', MARGIN + 12, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);

  let benefitY = y + 22;
  const benefits = [
    ['Offline Operation', 'Works without internet - no connectivity issues'],
    ['Data Security', 'All data stays on your computer - nothing sent to external servers'],
    ['Zero Cost', 'Free to use - no licensing fees or IT infrastructure needed'],
    ['Instant Setup', 'Browser-based - no installation required']
  ];

  benefits.forEach(([title, desc]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(title + ': ', MARGIN + 12, benefitY);
    const titleWidth = doc.getTextWidth(title + ': ');
    doc.setFont('helvetica', 'normal');
    doc.text(desc, MARGIN + 12 + titleWidth, benefitY);
    benefitY += 8;
  });

  y += 65;

  // Who is it for?
  y = addSectionHeader(doc, 'Who Is It For?', y);

  const users = [
    'Safety Managers - Track team performance and identify risk areas',
    'HSE Coordinators - Monitor observation trends and close-out rates',
    'Site Supervisors - Review hazard patterns for their work areas',
    'Leadership - Get quick visibility into safety culture metrics'
  ];

  users.forEach(user => {
    y = addBullet(doc, user, MARGIN, y, COLORS.green);
  });

  // ===== PAGE 3: Dashboard Features =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'Dashboard Overview', pageNum);

  y = 45;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('The main dashboard provides a comprehensive view of safety performance at a glance.', MARGIN, y);
  y += 12;

  // Add dashboard screenshot
  if (screenshots.dashboard) {
    y = addScreenshot(doc, screenshots.dashboard, y, 'Figure 1: Main Dashboard with KPIs and Incident Pyramid', 85);
  }

  y += 5;
  y = addSectionHeader(doc, 'Dashboard Components', y);

  // KPI Cards description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('KPI Cards', MARGIN, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const kpiDesc = [
    'Total Observations - Complete count of all safety observations imported',
    'Close Out Rate - Percentage of observations with completed actions',
    'Positive Rate - Ratio of positive to negative observations',
    'Overdue Actions - Count of actions past their due date'
  ];
  kpiDesc.forEach(item => {
    y = addBullet(doc, item, MARGIN + 5, y, COLORS.primary);
    y -= 2;
  });

  y += 5;

  // Incident Pyramid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Incident Pyramid', MARGIN, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Visual hierarchy showing observation severity distribution (Positive > At-Risk > First Aid > Critical).', MARGIN, y);
  y += 10;

  // Charts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Interactive Charts', MARGIN, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  const chartDesc = [
    'Trend Chart - 12-month view of positive vs negative observations',
    'Top Hazards - Bar chart ranking hazard categories by frequency',
    'Top Observers - Recognition of most active safety reporters',
    'Time Analysis - Patterns by hour of day and day of week'
  ];
  chartDesc.forEach(item => {
    y = addBullet(doc, item, MARGIN + 5, y, COLORS.primary);
    y -= 2;
  });

  // ===== PAGE 4: Data Control =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'Data Control (Quality Analysis)', pageNum);

  y = 45;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  const dataControlIntro = 'The Data Control page helps identify data quality issues and provides detailed analytics on reporter and contractor performance.';
  doc.text(dataControlIntro, MARGIN, y);
  y += 12;

  // Add data quality screenshot
  if (screenshots.dataQuality) {
    y = addScreenshot(doc, screenshots.dataQuality, y, 'Figure 2: Data Quality Dashboard', 85);
  }

  y += 5;
  y = addSectionHeader(doc, 'Quality Metrics', y);

  const qualityFeatures = [
    'Data Quality Score - Overall health metric for your observation data',
    'Categorization Rate - Percentage of observations successfully classified',
    'Missing Fields Analysis - Identifies records with incomplete information',
    'Duplicate Detection - Flags potential duplicate entries',
    'Reporter Analytics - Track individual reporter performance and patterns',
    'Contractor Breakdown - Compare safety performance across contractors'
  ];

  qualityFeatures.forEach(item => {
    y = addBullet(doc, item, MARGIN, y, COLORS.orange);
  });

  y += 10;

  // Records Requiring Attention box
  doc.setFillColor(255, 248, 240);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 35, 4, 4, 'F');
  doc.setFillColor(...COLORS.orange);
  doc.rect(MARGIN, y, 4, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.orange);
  doc.text('Records Requiring Attention', MARGIN + 12, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text('The system highlights observations that need review:', MARGIN + 12, y + 22);
  doc.text('uncategorized records, overdue actions, and entries with missing critical fields.', MARGIN + 12, y + 30);

  // ===== PAGE 5: Safety Outlook =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'Safety Outlook', pageNum);

  y = 45;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('Safety Outlook provides predictive insights and trend analysis for proactive safety management.', MARGIN, y);
  y += 12;

  // Add safety outlook screenshot
  if (screenshots.safetyOutlook) {
    y = addScreenshot(doc, screenshots.safetyOutlook, y, 'Figure 3: Safety Outlook with Trend Analysis', 85);
  }

  y += 5;
  y = addSectionHeader(doc, 'Trend Analysis Features', y);

  const outlookFeatures = [
    'Rising Hazards - Categories showing increasing frequency (requires attention)',
    'Stable Trends - Categories maintaining consistent levels',
    'Declining Hazards - Categories showing improvement over time',
    'Seasonal Patterns - Identify time-based variations in observation types',
    'Predictive Insights - AI-powered projections based on historical data'
  ];

  outlookFeatures.forEach(item => {
    y = addBullet(doc, item, MARGIN, y, COLORS.green);
  });

  // ===== PAGE 6: What-If Simulator =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'What-If Simulator', pageNum);

  y = 45;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  const whatIfIntro = 'The What-If Simulator allows you to model the impact of safety interventions before implementing them.';
  doc.text(whatIfIntro, MARGIN, y);
  y += 12;

  // Add what-if screenshot
  if (screenshots.whatIf) {
    y = addScreenshot(doc, screenshots.whatIf, y, 'Figure 4: What-If Scenario Simulator', 85);
  }

  y += 5;
  y = addSectionHeader(doc, 'Simulation Capabilities', y);

  const simFeatures = [
    'Intervention Modeling - Adjust parameters to see projected outcomes',
    'Impact Projections - Visual charts showing expected improvements',
    'Scenario Comparison - Test multiple approaches side by side',
    'Risk Reduction Estimates - Calculate potential incident prevention'
  ];

  simFeatures.forEach(item => {
    y = addBullet(doc, item, MARGIN, y, COLORS.primary);
  });

  y += 10;

  // Example use case
  doc.setFillColor(240, 248, 250);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 40, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('Example Use Case', MARGIN + 8, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  const exampleText = '"If we increase Working at Height inspections by 20%, what impact would that have on incident rates?" The simulator models this scenario using historical data patterns.';
  const exampleLines = doc.splitTextToSize(exampleText, CONTENT_WIDTH - 16);
  doc.text(exampleLines, MARGIN + 8, y + 22);

  // ===== PAGE 7: How to Use =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'How to Use HIDC', pageNum);

  y = 45;

  // Workflow steps
  const steps = [
    {
      num: '1',
      title: 'Import Your Data',
      desc: 'Export your observation data from Enablon as an Excel file (.xlsx or .xls). Click "Import Data" and select your file. The system supports up to 2,000 records per import.'
    },
    {
      num: '2',
      title: 'Review Auto-Classification',
      desc: 'HIDC automatically analyzes observation descriptions and assigns hazard categories. Review the categorization rate on the Data Control page and address any uncategorized records.'
    },
    {
      num: '3',
      title: 'Analyze Dashboard Metrics',
      desc: 'The main dashboard shows your key safety KPIs. Click on any chart or metric to drill down into the underlying records.'
    },
    {
      num: '4',
      title: 'Drill Down for Details',
      desc: 'Click on hazard categories, time periods, or specific metrics to see the actual observation records. Use this to investigate patterns and identify specific issues.'
    },
    {
      num: '5',
      title: 'Export Reports',
      desc: 'Use the Export menu to generate PDF reports or PowerPoint presentations for meetings. All charts and data are included automatically.'
    }
  ];

  steps.forEach(step => {
    // Step number circle
    doc.setFillColor(...COLORS.primary);
    doc.circle(MARGIN + 8, y + 6, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.white);
    doc.text(step.num, MARGIN + 8, y + 10, { align: 'center' });

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.text(step.title, MARGIN + 22, y + 6);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.medGray);
    const descLines = doc.splitTextToSize(step.desc, CONTENT_WIDTH - 25);
    doc.text(descLines, MARGIN + 22, y + 14);

    y += 14 + (descLines.length * 5) + 12;
  });

  // Add import wizard screenshot
  if (screenshots.importWizard) {
    y = addScreenshot(doc, screenshots.importWizard, y, 'Figure 5: File Import Interface', 70);
  }

  // ===== PAGE 8: Key Benefits =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'Key Benefits', pageNum);

  y = 50;

  // Benefit cards in 2x3 grid
  const benefitCards = [
    { title: 'Works Offline', desc: 'No internet required. Use anywhere, anytime.', icon: '1' },
    { title: 'Data Security', desc: 'All data stays on your computer. Nothing uploaded.', icon: '2' },
    { title: 'Auto Classification', desc: '30 hazard categories assigned automatically.', icon: '3' },
    { title: 'Interactive Drilldown', desc: 'Click any metric to see underlying records.', icon: '4' },
    { title: 'Export Ready', desc: 'PDF and PowerPoint export for presentations.', icon: '5' },
    { title: 'Zero Cost', desc: 'Free forever. No licenses or subscriptions.', icon: '6' }
  ];

  const cardWidth = (CONTENT_WIDTH - 10) / 2;
  const cardHeight = 55;

  benefitCards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + (col * (cardWidth + 10));
    const cardY = y + (row * (cardHeight + 10));

    addFeatureCard(doc, x, cardY, cardWidth, cardHeight, card.title, card.desc, card.icon);
  });

  y += (cardHeight + 10) * 3 + 10;

  // Technical highlights box
  doc.setFillColor(...COLORS.dark);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 50, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text('Technical Highlights', MARGIN + 10, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.lightGray);

  const techPoints = [
    'Browser-based application - works in Chrome, Edge, Firefox',
    'Supports Excel files (.xlsx, .xls) - standard Enablon export format',
    'Handles up to 2,000 records per import',
    'Progressive Web App - can be installed on desktop for quick access'
  ];

  let techY = y + 25;
  techPoints.forEach(point => {
    doc.text('• ' + point, MARGIN + 10, techY);
    techY += 7;
  });

  // ===== PAGE 9: Getting Started =====
  doc.addPage();
  pageNum++;
  addPageHeader(doc, 'Getting Started', pageNum);

  y = 50;

  // Quick start box
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 60, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.white);
  doc.text('Quick Start Guide', PAGE_WIDTH/2, y + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('1. Open your browser and navigate to the HIDC Dashboard', PAGE_WIDTH/2, y + 35, { align: 'center' });
  doc.text('2. Click "Import Data" and select your Enablon export file', PAGE_WIDTH/2, y + 47, { align: 'center' });

  y += 75;

  // Requirements
  y = addSectionHeader(doc, 'Requirements', y);

  const requirements = [
    'Modern web browser (Chrome, Edge, or Firefox recommended)',
    'Excel file exported from Enablon in NEOM format',
    'No installation or software download required'
  ];

  requirements.forEach(req => {
    y = addBullet(doc, req, MARGIN, y);
  });

  y += 15;

  // Support
  y = addSectionHeader(doc, 'Need Help?', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('For questions or support, contact your local HSE team or the application developer.', MARGIN, y);

  y += 25;

  // Final message
  doc.setFillColor(240, 248, 250);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 40, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text('Transform Your Safety Data Today', PAGE_WIDTH/2, y + 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('From raw Enablon exports to actionable insights in under 2 minutes.', PAGE_WIDTH/2, y + 30, { align: 'center' });

  // Save the PDF
  doc.save(OUTPUT_PATH);
  console.log(`\nPDF saved to: ${OUTPUT_PATH}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(50));
  console.log('HIDC Application Overview PDF Generator');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Ensure screenshot directory exists
    ensureScreenshotDir();

    // Check if app is running
    console.log(`Checking if app is running at ${APP_URL}...`);

    let screenshots = {};

    try {
      // Attempt to capture screenshots
      screenshots = await captureScreenshots();
    } catch (error) {
      console.log('');
      console.log('Warning: Could not capture screenshots.');
      console.log('The PDF will be generated without application screenshots.');
      console.log('To include screenshots, ensure the app is running:');
      console.log('  1. Run: npm run dev');
      console.log('  2. Wait for the app to start');
      console.log('  3. Run this script again');
      console.log('');
    }

    // Generate PDF (with or without screenshots)
    await generatePDF(screenshots);

    // Cleanup
    cleanupScreenshots();

    console.log('');
    console.log('Done! The PDF has been saved to your desktop.');
    console.log('');

  } catch (error) {
    console.error('Error generating PDF:', error);
    cleanupScreenshots();
    process.exit(1);
  }
}

main();
