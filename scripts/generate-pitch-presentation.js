import PptxGenJS from 'pptxgenjs'
import { format } from 'date-fns'
import path from 'path'
import os from 'os'

// Color scheme - Professional Blue
const COLORS = {
  primary: '1e3a5f',      // Dark blue - headers
  accent: '3b82f6',       // Light blue - highlights
  text: '1f2937',         // Dark gray - body
  muted: '6b7280',        // Gray - secondary
  light: '9ca3af',        // Light gray
  white: 'FFFFFF',
  success: '10b981',      // Green for positive items
  warning: 'f59e0b',      // Orange for warnings
  border: 'e5e7eb',       // Light border
  tableBg: 'f3f4f6',      // Table header background
}

const generatePresentation = async () => {
  console.log('Creating HIDC Dashboard Pitch Presentation...')

  const pptx = new PptxGenJS()

  // Set presentation properties
  pptx.author = 'HIDC Dashboard'
  pptx.title = 'HIDC Dashboard - Pitch Presentation'
  pptx.subject = `Generated on ${format(new Date(), 'MMMM d, yyyy')}`
  pptx.company = 'Applus+'

  // Slide 1: Title
  addTitleSlide(pptx)

  // Slide 2: The Challenge
  addChallengeSlide(pptx)

  // Slide 3: The Solution
  addSolutionSlide(pptx)

  // Slide 4: NEOM Compliance
  addComplianceSlide(pptx)

  // Slide 5: Key Features
  addFeaturesSlide(pptx)

  // Slide 6: Dashboard Analytics
  addAnalyticsSlide(pptx)

  // Slide 7: Smart Hazard Classification
  addHazardClassificationSlide(pptx)

  // Slide 8: Comparison Table
  addComparisonSlide(pptx)

  // Slide 9: Workflow
  addWorkflowSlide(pptx)

  // Slide 10: Export Capabilities
  addExportSlide(pptx)

  // Slide 11: Quick Start
  addQuickStartSlide(pptx)

  // Slide 12: Summary
  addSummarySlide(pptx)

  // Save to Desktop
  const desktopPath = path.join(os.homedir(), 'Desktop')
  const filename = 'HIDC-Dashboard-Pitch.pptx'
  const fullPath = path.join(desktopPath, filename)

  await pptx.writeFile({ fileName: fullPath })
  console.log(`\nPresentation saved to: ${fullPath}`)
  console.log('\nDone! You can now open the presentation and add your screenshots.')
}

// Slide 1: Title Slide
const addTitleSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.primary }

  slide.addText('HIDC Dashboard', {
    x: 0.5, y: 1.8, w: '90%', h: 1,
    fontSize: 44, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  })

  slide.addText('A Compliant HSE Management Solution for NEOM', {
    x: 0.5, y: 2.8, w: '90%', h: 0.6,
    fontSize: 24, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 3.5, y: 3.6, w: 3, h: 0.02,
    fill: { color: COLORS.accent },
  })

  slide.addText('Personal Productivity Tool for Safety Professionals', {
    x: 0.5, y: 3.9, w: '90%', h: 0.5,
    fontSize: 16, color: COLORS.light,
    align: 'center', fontFace: 'Arial', italic: true,
  })

  slide.addText(`${format(new Date(), 'MMMM yyyy')}`, {
    x: 0.5, y: 5, w: '90%', h: 0.3,
    fontSize: 12, color: COLORS.light,
    align: 'center', fontFace: 'Arial',
  })
}

// Slide 2: The Challenge
const addChallengeSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('The Challenge', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  const challenges = [
    { icon: '🔒', text: 'NEOM policy restricts connecting accounts to external systems' },
    { icon: '📊', text: 'Power BI requires account integration - not an option' },
    { icon: '📁', text: 'Enablon data exports are in Excel format - hard to visualize' },
    { icon: '🐌', text: 'Applus team relies on Remote Desktop - often laggy and slow' },
    { icon: '📈', text: 'Not everyone is an Excel expert - creating dashboards is difficult' },
    { icon: '❌', text: 'Excel spreadsheets lack proper visualization capabilities' },
  ]

  let yPos = 1.2
  challenges.forEach((item) => {
    slide.addText(`${item.icon}  ${item.text}`, {
      x: 0.7, y: yPos, w: 8.6, h: 0.55,
      fontSize: 16, color: COLORS.text,
      fontFace: 'Arial', valign: 'middle',
    })
    yPos += 0.6
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.8, w: 9, h: 0.5,
    fill: { color: 'fef3c7' },
    line: { color: COLORS.warning, pt: 1 },
  })

  slide.addText('Need: A tool that works within NEOM\'s security constraints AND is easy to use', {
    x: 0.6, y: 4.85, w: 8.8, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.text,
    fontFace: 'Arial', valign: 'middle',
  })

  addFooter(slide)
}

// Slide 3: The Solution
const addSolutionSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('The Solution: HIDC Dashboard', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  const solutions = [
    { icon: '🌐', text: '100% offline, browser-based dashboard', highlight: false },
    { icon: '🔓', text: 'No login or account required', highlight: false },
    { icon: '💾', text: 'Data stays local on your machine', highlight: false },
    { icon: '🚫', text: 'Zero IT involvement needed', highlight: false },
    { icon: '⚡', text: 'Runs on your local PC - no Remote Desktop lag', highlight: true },
    { icon: '✨', text: 'No Excel skills required - just import and view', highlight: true },
  ]

  let yPos = 1.2
  solutions.forEach((item) => {
    if (item.highlight) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: yPos - 0.05, w: 9, h: 0.55,
        fill: { color: 'dcfce7' },
      })
    }
    slide.addText(`${item.icon}  ${item.text}`, {
      x: 0.7, y: yPos, w: 8.6, h: 0.5,
      fontSize: 18, color: COLORS.text,
      fontFace: 'Arial', valign: 'middle',
      bold: item.highlight,
    })
    yPos += 0.65
  })

  addFooter(slide)
}

// Slide 4: NEOM Compliance
const addComplianceSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('NEOM Compliance Benefits', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  slide.addText('Compliant by Design', {
    x: 0.5, y: 1, w: '90%', h: 0.4,
    fontSize: 18, italic: true, color: COLORS.muted,
    fontFace: 'Arial',
  })

  const benefits = [
    { icon: '✓', text: 'No NEOM account integration required' },
    { icon: '✓', text: 'No external server connections' },
    { icon: '✓', text: 'No data leaves your machine' },
    { icon: '✓', text: 'No procurement or licensing required' },
    { icon: '✓', text: 'Free to use - zero cost' },
  ]

  let yPos = 1.6
  benefits.forEach((item) => {
    slide.addText(item.icon, {
      x: 1, y: yPos, w: 0.4, h: 0.5,
      fontSize: 20, color: COLORS.success, bold: true,
      fontFace: 'Arial', valign: 'middle',
    })
    slide.addText(item.text, {
      x: 1.5, y: yPos, w: 7.5, h: 0.5,
      fontSize: 18, color: COLORS.text,
      fontFace: 'Arial', valign: 'middle',
    })
    yPos += 0.6
  })

  // Box at bottom
  slide.addShape(pptx.ShapeType.rect, {
    x: 1, y: 4.5, w: 8, h: 0.7,
    fill: { color: COLORS.primary },
  })
  slide.addText('Your data. Your machine. Your control.', {
    x: 1, y: 4.55, w: 8, h: 0.6,
    fontSize: 18, color: COLORS.white, bold: true,
    fontFace: 'Arial', align: 'center', valign: 'middle',
  })

  addFooter(slide)
}

// Slide 5: Key Features
const addFeaturesSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('Key Features Overview', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  // Feature boxes in 2x3 grid
  const features = [
    { title: 'Enablon Excel Import', desc: 'Direct import from Enablon exports', icon: '📥' },
    { title: 'Interactive KPI Dashboard', desc: 'Real-time metrics at a glance', icon: '📊' },
    { title: 'Incident Pyramid', desc: 'Visual breakdown of incident types', icon: '🔺' },
    { title: 'Hazard Trend Analysis', desc: '12-month trend visualization', icon: '📈' },
    { title: 'Auto Classification', desc: '29 hazard categories - automatic', icon: '🏷️' },
    { title: 'PDF & PPT Export', desc: 'One-click report generation', icon: '📄' },
  ]

  const positions = [
    { x: 0.5, y: 1.2 }, { x: 3.5, y: 1.2 }, { x: 6.5, y: 1.2 },
    { x: 0.5, y: 3.0 }, { x: 3.5, y: 3.0 }, { x: 6.5, y: 3.0 },
  ]

  features.forEach((feature, i) => {
    const pos = positions[i]

    slide.addShape(pptx.ShapeType.rect, {
      x: pos.x, y: pos.y, w: 2.8, h: 1.5,
      fill: { color: 'f8fafc' },
      line: { color: COLORS.border, pt: 1 },
    })

    slide.addText(feature.icon, {
      x: pos.x, y: pos.y + 0.1, w: 2.8, h: 0.5,
      fontSize: 28, align: 'center', fontFace: 'Arial',
    })

    slide.addText(feature.title, {
      x: pos.x + 0.1, y: pos.y + 0.6, w: 2.6, h: 0.4,
      fontSize: 12, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Arial',
    })

    slide.addText(feature.desc, {
      x: pos.x + 0.1, y: pos.y + 1, w: 2.6, h: 0.4,
      fontSize: 10, color: COLORS.muted,
      align: 'center', fontFace: 'Arial',
    })
  })

  addFooter(slide)
}

// Slide 6: Dashboard Analytics
const addAnalyticsSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('Dashboard Analytics', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  const items = [
    'KPI Cards: Total Observations, Close Out Rate, Positive Rate, Overdue Actions',
    'Approval Status Tracking: Closed, Contractor Review, Review, Investigation',
    'Interactive charts: Pyramid, Trend, Top Hazards, Heatmap',
    'Drill-down capability for detailed analysis',
  ]

  let yPos = 1.1
  items.forEach((item) => {
    slide.addText(`•  ${item}`, {
      x: 0.7, y: yPos, w: 4, h: 0.45,
      fontSize: 13, color: COLORS.text,
      fontFace: 'Arial', valign: 'middle',
    })
    yPos += 0.5
  })

  // Screenshot placeholder
  slide.addShape(pptx.ShapeType.rect, {
    x: 5, y: 1.1, w: 4.5, h: 3.2,
    fill: { color: 'f1f5f9' },
    line: { color: COLORS.border, pt: 2, dashType: 'dash' },
  })

  slide.addText('[Insert Dashboard Screenshot Here]', {
    x: 5, y: 2.4, w: 4.5, h: 0.5,
    fontSize: 14, color: COLORS.muted,
    align: 'center', fontFace: 'Arial', italic: true,
  })

  addFooter(slide)
}

// Slide 7: Hazard Classification
const addHazardClassificationSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('Smart Hazard Classification', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  const items = [
    '29 approved significant hazard categories',
    'Auto-classification from descriptions',
    'Priority-based pattern matching',
    'Reduces manual data entry errors',
    'Consistent categorization across all data',
  ]

  let yPos = 1.1
  items.forEach((item) => {
    slide.addText(`•  ${item}`, {
      x: 0.7, y: yPos, w: 4, h: 0.4,
      fontSize: 14, color: COLORS.text,
      fontFace: 'Arial', valign: 'middle',
    })
    yPos += 0.45
  })

  // Example categories box
  slide.addShape(pptx.ShapeType.rect, {
    x: 5, y: 1.1, w: 4.5, h: 2.5,
    fill: { color: 'f8fafc' },
    line: { color: COLORS.border, pt: 1 },
  })

  slide.addText('Example Categories:', {
    x: 5.1, y: 1.2, w: 4.3, h: 0.35,
    fontSize: 12, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  const categories = [
    'Working at Height', 'Confined Spaces', 'Energized Systems',
    'Hot Work', 'Lifting Operations', 'Excavation',
    'PPE', 'Housekeeping', 'Access/Egress',
  ]

  slide.addText(categories.join('  |  '), {
    x: 5.1, y: 1.6, w: 4.3, h: 1.8,
    fontSize: 11, color: COLORS.text,
    fontFace: 'Arial', valign: 'top',
  })

  // Screenshot placeholder
  slide.addShape(pptx.ShapeType.rect, {
    x: 5, y: 3.8, w: 4.5, h: 1.2,
    fill: { color: 'f1f5f9' },
    line: { color: COLORS.border, pt: 2, dashType: 'dash' },
  })

  slide.addText('[Insert Hazard List Screenshot]', {
    x: 5, y: 4.2, w: 4.5, h: 0.5,
    fontSize: 12, color: COLORS.muted,
    align: 'center', fontFace: 'Arial', italic: true,
  })

  addFooter(slide)
}

// Slide 8: Comparison Table
const addComparisonSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('Excel + Remote Desktop vs HIDC Dashboard', {
    x: 0.5, y: 0.3, w: '90%', h: 0.6,
    fontSize: 28, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  const tableData = [
    [
      { text: 'Feature', options: { bold: true, fill: COLORS.primary, color: COLORS.white } },
      { text: 'Excel + Remote Desktop', options: { bold: true, fill: COLORS.primary, color: COLORS.white } },
      { text: 'HIDC Dashboard', options: { bold: true, fill: COLORS.primary, color: COLORS.white } },
    ],
    [
      { text: 'Performance' },
      { text: '🐌 Laggy via Remote Desktop', options: { color: 'dc2626' } },
      { text: '⚡ Fast - runs locally', options: { color: '16a34a' } },
    ],
    [
      { text: 'Skill Required' },
      { text: '📚 Excel expertise needed', options: { color: 'dc2626' } },
      { text: '✨ No Excel skills required', options: { color: '16a34a' } },
    ],
    [
      { text: 'Data Entry' },
      { text: 'Manual' },
      { text: 'Import from Enablon', options: { color: '16a34a' } },
    ],
    [
      { text: 'Visualization' },
      { text: 'Basic charts (manual setup)' },
      { text: 'Interactive dashboards (auto)', options: { color: '16a34a' } },
    ],
    [
      { text: 'Hazard Classification' },
      { text: 'Manual' },
      { text: 'Automatic (29 categories)', options: { color: '16a34a' } },
    ],
    [
      { text: 'Trend Analysis' },
      { text: 'Complex formulas' },
      { text: 'Built-in', options: { color: '16a34a' } },
    ],
    [
      { text: 'Report Generation' },
      { text: 'Manual formatting' },
      { text: 'One-click PDF/PPT', options: { color: '16a34a' } },
    ],
  ]

  slide.addTable(tableData, {
    x: 0.5, y: 1, w: 9, h: 3.8,
    fontSize: 11,
    fontFace: 'Arial',
    border: { pt: 0.5, color: COLORS.border },
    colW: [2.2, 3.4, 3.4],
    rowH: 0.45,
    valign: 'middle',
  })

  addFooter(slide)
}

// Slide 9: Workflow
const addWorkflowSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('Workflow Integration', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  slide.addText('Data Source: Enablon Excel Exports Only', {
    x: 0.5, y: 0.9, w: '90%', h: 0.4,
    fontSize: 16, italic: true, color: COLORS.accent,
    fontFace: 'Arial',
  })

  // Workflow boxes
  const steps = [
    { label: 'Enablon', icon: '🗄️', desc: 'Source of Truth' },
    { label: 'Export Excel', icon: '📊', desc: 'Download data' },
    { label: 'Import to HIDC', icon: '📥', desc: 'One-click import' },
    { label: 'Analyze', icon: '📈', desc: 'View dashboards' },
    { label: 'Export Reports', icon: '📄', desc: 'PDF / PPT' },
  ]

  const startX = 0.5
  const boxWidth = 1.6
  const gap = 0.4

  steps.forEach((step, i) => {
    const x = startX + i * (boxWidth + gap)

    slide.addShape(pptx.ShapeType.rect, {
      x: x, y: 1.6, w: boxWidth, h: 1.4,
      fill: { color: 'f8fafc' },
      line: { color: COLORS.accent, pt: 2 },
    })

    slide.addText(step.icon, {
      x: x, y: 1.7, w: boxWidth, h: 0.5,
      fontSize: 24, align: 'center', fontFace: 'Arial',
    })

    slide.addText(step.label, {
      x: x, y: 2.2, w: boxWidth, h: 0.35,
      fontSize: 11, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Arial',
    })

    slide.addText(step.desc, {
      x: x, y: 2.5, w: boxWidth, h: 0.3,
      fontSize: 9, color: COLORS.muted,
      align: 'center', fontFace: 'Arial',
    })

    // Arrow between boxes
    if (i < steps.length - 1) {
      slide.addText('→', {
        x: x + boxWidth, y: 2, w: gap, h: 0.5,
        fontSize: 20, color: COLORS.accent,
        align: 'center', fontFace: 'Arial',
      })
    }
  })

  // Key points
  slide.addText('Key Points:', {
    x: 0.5, y: 3.4, w: 9, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.text,
    fontFace: 'Arial',
  })

  const points = [
    '• Works with your existing Enablon data extracts',
    '• Enhances visualization - doesn\'t replace Enablon as source of truth',
    '• No duplicate data entry required',
  ]

  let yPos = 3.8
  points.forEach((point) => {
    slide.addText(point, {
      x: 0.7, y: yPos, w: 8.6, h: 0.35,
      fontSize: 13, color: COLORS.text,
      fontFace: 'Arial',
    })
    yPos += 0.4
  })

  addFooter(slide)
}

// Slide 10: Export Capabilities
const addExportSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('Export Capabilities', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  // Export options
  const exports = [
    { icon: '📄', title: 'PDF Export', desc: 'Full dashboard capture - A3 format' },
    { icon: '📊', title: 'PowerPoint Export', desc: 'Individual charts on slides' },
    { icon: '💾', title: 'JSON Backup', desc: 'Complete data preservation' },
  ]

  exports.forEach((exp, i) => {
    const x = 0.7 + i * 3

    slide.addShape(pptx.ShapeType.rect, {
      x: x, y: 1.2, w: 2.8, h: 1.8,
      fill: { color: 'f8fafc' },
      line: { color: COLORS.border, pt: 1 },
    })

    slide.addText(exp.icon, {
      x: x, y: 1.3, w: 2.8, h: 0.6,
      fontSize: 36, align: 'center', fontFace: 'Arial',
    })

    slide.addText(exp.title, {
      x: x + 0.1, y: 2, w: 2.6, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Arial',
    })

    slide.addText(exp.desc, {
      x: x + 0.1, y: 2.4, w: 2.6, h: 0.4,
      fontSize: 11, color: COLORS.muted,
      align: 'center', fontFace: 'Arial',
    })
  })

  slide.addText('Ready for presentations and reports - one click away!', {
    x: 0.5, y: 3.3, w: 9, h: 0.4,
    fontSize: 16, color: COLORS.text, italic: true,
    align: 'center', fontFace: 'Arial',
  })

  // Screenshot placeholder
  slide.addShape(pptx.ShapeType.rect, {
    x: 2.5, y: 3.8, w: 5, h: 1.2,
    fill: { color: 'f1f5f9' },
    line: { color: COLORS.border, pt: 2, dashType: 'dash' },
  })

  slide.addText('[Insert Export Menu Screenshot]', {
    x: 2.5, y: 4.2, w: 5, h: 0.5,
    fontSize: 12, color: COLORS.muted,
    align: 'center', fontFace: 'Arial', italic: true,
  })

  addFooter(slide)
}

// Slide 11: Quick Start
const addQuickStartSlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.white }

  slide.addText('Quick Start Guide', {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 32, bold: true, color: COLORS.primary,
    fontFace: 'Arial',
  })

  const steps = [
    { num: '1', text: 'Export your data from Enablon (Excel format)' },
    { num: '2', text: 'Open HIDC Dashboard in browser (no installation needed)' },
    { num: '3', text: 'Import your Enablon Excel file' },
    { num: '4', text: 'View instant dashboards & analytics' },
    { num: '5', text: 'Export reports as PDF/PPT' },
  ]

  let yPos = 1.1
  steps.forEach((step) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.7, y: yPos, w: 0.45, h: 0.45,
      fill: { color: COLORS.accent },
    })

    slide.addText(step.num, {
      x: 0.7, y: yPos, w: 0.45, h: 0.45,
      fontSize: 14, bold: true, color: COLORS.white,
      align: 'center', valign: 'middle', fontFace: 'Arial',
    })

    slide.addText(step.text, {
      x: 1.3, y: yPos, w: 4, h: 0.45,
      fontSize: 15, color: COLORS.text,
      fontFace: 'Arial', valign: 'middle',
    })

    yPos += 0.6
  })

  // Screenshot placeholder
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.3, y: 1.1, w: 4.2, h: 3,
    fill: { color: 'f1f5f9' },
    line: { color: COLORS.border, pt: 2, dashType: 'dash' },
  })

  slide.addText('[Insert Import Wizard Screenshot]', {
    x: 5.3, y: 2.4, w: 4.2, h: 0.5,
    fontSize: 12, color: COLORS.muted,
    align: 'center', fontFace: 'Arial', italic: true,
  })

  // Time estimate
  slide.addShape(pptx.ShapeType.rect, {
    x: 2, y: 4.5, w: 6, h: 0.6,
    fill: { color: 'dcfce7' },
    line: { color: COLORS.success, pt: 1 },
  })

  slide.addText('⏱️ From Enablon export to dashboard: < 2 minutes', {
    x: 2, y: 4.55, w: 6, h: 0.5,
    fontSize: 14, bold: true, color: COLORS.text,
    align: 'center', fontFace: 'Arial', valign: 'middle',
  })

  addFooter(slide)
}

// Slide 12: Summary
const addSummarySlide = (pptx) => {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.primary }

  slide.addText('Why HIDC Dashboard?', {
    x: 0.5, y: 0.5, w: '90%', h: 0.7,
    fontSize: 36, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Arial',
  })

  const points = [
    '✓ Free to use - no licensing costs',
    '✓ NEOM compliant - no account integration',
    '✓ Uses your existing Enablon data - no new data entry',
    '✓ Runs locally - no Remote Desktop lag',
    '✓ No Excel skills required',
    '✓ Better visualization than raw Excel exports',
  ]

  let yPos = 1.5
  points.forEach((point) => {
    slide.addText(point, {
      x: 1.5, y: yPos, w: 7, h: 0.5,
      fontSize: 18, color: COLORS.white,
      fontFace: 'Arial', valign: 'middle',
    })
    yPos += 0.55
  })

  // CTA Box
  slide.addShape(pptx.ShapeType.rect, {
    x: 2, y: 4.5, w: 6, h: 0.7,
    fill: { color: COLORS.accent },
  })

  slide.addText('Try it today!', {
    x: 2, y: 4.5, w: 6, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.white,
    align: 'center', valign: 'middle', fontFace: 'Arial',
  })
}

// Helper: Add footer to slide
const addFooter = (slide) => {
  slide.addText('HIDC Dashboard | Applus+', {
    x: 0.5, y: 5.2, w: 4, h: 0.3,
    fontSize: 8, color: COLORS.light,
    fontFace: 'Arial',
  })
}

// Run the generator
generatePresentation().catch(console.error)
