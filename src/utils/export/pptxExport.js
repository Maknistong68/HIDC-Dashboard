import PptxGenJS from 'pptxgenjs'
import { format } from 'date-fns'
import { captureAllCharts } from './captureCharts'

/**
 * Generates a PowerPoint presentation with one slide per chart
 */
export const exportToPPTX = async (chartRefs, filterInfo, incidents = [], onProgress) => {
  onProgress?.('Initializing PowerPoint...')

  const pptx = new PptxGenJS()

  // Set presentation properties
  pptx.author = 'HIDC'
  pptx.title = 'HIDC - Hazard Identification and Data Control Report'
  pptx.subject = `Generated on ${format(new Date(), 'MMMM d, yyyy')}`
  pptx.company = filterInfo.company || 'HIDC'

  // Capture all charts
  const images = await captureAllCharts(chartRefs, onProgress)

  onProgress?.('Building PowerPoint slides...')

  // Title slide
  addTitleSlide(pptx, filterInfo)

  // Summary slide (after title slide)
  if (incidents && incidents.length > 0) {
    onProgress?.('Adding slide: Summary...')
    addSummarySlide(pptx, incidents)
  }

  // Combined KPI Cards slide (both rows on one slide)
  if (images.kpiCards1 || images.kpiCards2) {
    onProgress?.('Adding slide: Key Performance Indicators...')
    addCombinedKPISlide(pptx, images.kpiCards1, images.kpiCards2)
  }

  // Other chart slides
  const chartOrder = [
    { key: 'pyramid', title: 'Observation Categories' },
    { key: 'trendChart', title: 'Observation vs Incident Trend' },
    { key: 'topHazards', title: 'Top Significant Hazards' },
    { key: 'topObservers', title: 'Top Observers' },
    { key: 'hazardsHeatmap', title: 'Hazards Heatmap' },
  ]

  // Create one slide per chart
  for (const { key, title } of chartOrder) {
    if (images[key]) {
      onProgress?.(`Adding slide: ${title}...`)
      addChartSlide(pptx, images[key], title)
    }
  }

  // Save PPTX
  onProgress?.('Saving PowerPoint...')
  const filename = `HIDC-Report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pptx`
  await pptx.writeFile({ fileName: filename })

  onProgress?.(null)
  return filename
}

/**
 * Add title slide with filter information
 */
const addTitleSlide = (pptx, filterInfo) => {
  const slide = pptx.addSlide()

  slide.background = { color: 'FFFFFF' }

  slide.addText('HIDC Report', {
    x: 0.5,
    y: 2,
    w: '90%',
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: '1f2937',
    align: 'center',
    fontFace: 'Arial',
  })

  slide.addText('Hazard Identification and Data Control', {
    x: 0.5,
    y: 2.6,
    w: '90%',
    h: 0.5,
    fontSize: 18,
    color: '6b7280',
    align: 'center',
    fontFace: 'Arial',
  })

  const filterParts = []
  if (filterInfo.company) filterParts.push(`Company: ${filterInfo.company}`)
  if (filterInfo.contractor) filterParts.push(`Contractor: ${filterInfo.contractor}`)
  if (filterInfo.site) filterParts.push(`Site: ${filterInfo.site}`)
  if (filterInfo.dateFrom) filterParts.push(`From: ${filterInfo.dateFrom}`)
  if (filterInfo.dateTo) filterParts.push(`To: ${filterInfo.dateTo}`)

  const filterText = filterParts.length > 0
    ? filterParts.join('  |  ')
    : 'All Data (No Filters Applied)'

  slide.addText(filterText, {
    x: 0.5,
    y: 3.3,
    w: '90%',
    h: 0.5,
    fontSize: 14,
    color: '6b7280',
    align: 'center',
    fontFace: 'Arial',
  })

  slide.addText(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, {
    x: 0.5,
    y: 3.9,
    w: '90%',
    h: 0.4,
    fontSize: 12,
    color: '9ca3af',
    align: 'center',
    fontFace: 'Arial',
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 3,
    y: 4.6,
    w: 4,
    h: 0.02,
    fill: { color: 'e5e7eb' },
  })
}

/**
 * Calculate summary statistics from incidents
 */
const calculateSummary = (incidents) => {
  const byContractor = {}
  const bySite = {}

  incidents.forEach(incident => {
    const contractor = incident.contractor || 'Unassigned'
    const site = incident.site || 'Unassigned'
    const isClosed = incident.actionStatus === 'closed'

    if (!byContractor[contractor]) {
      byContractor[contractor] = { total: 0, open: 0, closed: 0 }
    }
    byContractor[contractor].total++
    byContractor[contractor][isClosed ? 'closed' : 'open']++

    if (!bySite[site]) {
      bySite[site] = { total: 0, open: 0, closed: 0 }
    }
    bySite[site].total++
    bySite[site][isClosed ? 'closed' : 'open']++
  })

  return {
    byContractor: Object.entries(byContractor).sort((a, b) => b[1].total - a[1].total),
    bySite: Object.entries(bySite).sort((a, b) => b[1].total - a[1].total)
  }
}

/**
 * Add summary slide with contractor/site breakdown tables
 */
const addSummarySlide = (pptx, incidents) => {
  if (!incidents || incidents.length === 0) return

  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }

  // Slide title
  slide.addText('Summary', {
    x: 0.5,
    y: 0.2,
    w: '90%',
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: '1f2937',
    fontFace: 'Arial',
  })

  const summary = calculateSummary(incidents)

  // Total observations count
  slide.addText(`Total Observations: ${incidents.length}`, {
    x: 0.5,
    y: 0.7,
    w: '90%',
    h: 0.3,
    fontSize: 14,
    color: '6b7280',
    fontFace: 'Arial',
  })

  // Only show tables if there's meaningful data
  const hasContractors = summary.byContractor.length > 0 &&
    !(summary.byContractor.length === 1 && summary.byContractor[0][0] === 'Unassigned')
  const hasSites = summary.bySite.length > 0 &&
    !(summary.bySite.length === 1 && summary.bySite[0][0] === 'Unassigned')

  // Contractor breakdown table (left side)
  if (hasContractors) {
    slide.addText('By Contractor', {
      x: 0.5,
      y: 1.1,
      w: 4.5,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '1f2937',
      fontFace: 'Arial',
    })

    const contractorTableData = [
      [
        { text: 'Contractor', options: { bold: true, fill: 'f3f4f6' } },
        { text: 'Total', options: { bold: true, fill: 'f3f4f6' } },
        { text: 'Open', options: { bold: true, fill: 'f3f4f6' } },
        { text: 'Closed', options: { bold: true, fill: 'f3f4f6' } }
      ],
      ...summary.byContractor.slice(0, 8).map(([name, data]) => [
        { text: name.length > 25 ? name.substring(0, 25) + '...' : name },
        { text: String(data.total) },
        { text: String(data.open) },
        { text: String(data.closed) }
      ])
    ]

    slide.addTable(contractorTableData, {
      x: 0.5,
      y: 1.4,
      w: 4.3,
      fontSize: 9,
      fontFace: 'Arial',
      border: { pt: 0.5, color: 'e5e7eb' },
      colW: [2.2, 0.6, 0.6, 0.9],
    })
  }

  // Site breakdown table (right side)
  if (hasSites) {
    slide.addText('By Site', {
      x: 5.2,
      y: 1.1,
      w: 4.5,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '1f2937',
      fontFace: 'Arial',
    })

    const siteTableData = [
      [
        { text: 'Site', options: { bold: true, fill: 'f3f4f6' } },
        { text: 'Total', options: { bold: true, fill: 'f3f4f6' } },
        { text: 'Open', options: { bold: true, fill: 'f3f4f6' } },
        { text: 'Closed', options: { bold: true, fill: 'f3f4f6' } }
      ],
      ...summary.bySite.slice(0, 8).map(([name, data]) => [
        { text: name.length > 25 ? name.substring(0, 25) + '...' : name },
        { text: String(data.total) },
        { text: String(data.open) },
        { text: String(data.closed) }
      ])
    ]

    slide.addTable(siteTableData, {
      x: 5.2,
      y: 1.4,
      w: 4.3,
      fontSize: 9,
      fontFace: 'Arial',
      border: { pt: 0.5, color: 'e5e7eb' },
      colW: [2.2, 0.6, 0.6, 0.9],
    })
  }

  // Footer
  slide.addText('HIDC - Hazard Identification and Data Control', {
    x: 0.5,
    y: 5.2,
    w: 4,
    h: 0.3,
    fontSize: 8,
    color: '9ca3af',
    fontFace: 'Arial',
  })
}

/**
 * Add combined KPI slide with both KPI rows stacked vertically
 */
const addCombinedKPISlide = (pptx, kpiCards1Image, kpiCards2Image) => {
  const slide = pptx.addSlide()

  slide.background = { color: 'FFFFFF' }

  // Slide title
  slide.addText('Key Performance Indicators', {
    x: 0.5,
    y: 0.2,
    w: '90%',
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: '1f2937',
    fontFace: 'Arial',
  })

  // KPI Cards Row 1 (top half)
  if (kpiCards1Image) {
    slide.addImage({
      data: kpiCards1Image,
      x: 0.3,
      y: 0.8,
      w: 9.4,
      h: 2.0,
      sizing: {
        type: 'contain',
        w: 9.4,
        h: 2.0,
      },
    })
  }

  // KPI Cards Row 2 (bottom half)
  if (kpiCards2Image) {
    slide.addImage({
      data: kpiCards2Image,
      x: 0.3,
      y: 3.0,
      w: 9.4,
      h: 2.0,
      sizing: {
        type: 'contain',
        w: 9.4,
        h: 2.0,
      },
    })
  }

  // Footer
  slide.addText('HIDC - Hazard Identification and Data Control', {
    x: 0.5,
    y: 5.2,
    w: 4,
    h: 0.3,
    fontSize: 8,
    color: '9ca3af',
    fontFace: 'Arial',
  })
}

/**
 * Add a chart slide with title and centered image
 */
const addChartSlide = (pptx, imageDataUrl, title) => {
  const slide = pptx.addSlide()

  slide.background = { color: 'FFFFFF' }

  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: '1f2937',
    fontFace: 'Arial',
  })

  slide.addImage({
    data: imageDataUrl,
    x: 0.3,
    y: 1,
    w: 9.4,
    h: 4.3,
    sizing: {
      type: 'contain',
      w: 9.4,
      h: 4.3,
    },
  })

  slide.addText('HIDC - Hazard Identification and Data Control', {
    x: 0.5,
    y: 5.2,
    w: 4,
    h: 0.3,
    fontSize: 8,
    color: '9ca3af',
    fontFace: 'Arial',
  })
}
