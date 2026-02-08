import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { captureElement, getImageDimensions } from './captureCharts'

// Disclaimer text constant for main dashboard report
const DISCLAIMER_TEXT = 'Please review all data in this report before sharing.'

/**
 * Generates a PDF document by capturing the entire dashboard as one image
 * with professional layout and disclaimer
 */
export const exportToPDF = async (dashboardRef, filterInfo, incidents = [], onProgress) => {
  onProgress?.('Initializing PDF...')

  // Create A3 PDF in portrait orientation
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a3',
  })

  const pageWidth = 297 // A3 width in mm
  const pageHeight = 420 // A3 height in mm
  const margin = 12
  const contentWidth = pageWidth - (margin * 2)

  // Add professional header with branding
  addHeader(pdf, filterInfo, margin, margin, pageWidth, contentWidth)
  let currentY = margin + 22 // After header

  // Add summary section if incidents data is available
  if (incidents && incidents.length > 0) {
    currentY = addSummarySection(pdf, incidents, margin, currentY, contentWidth, pageWidth)
  }

  const headerHeight = currentY - margin

  onProgress?.('Capturing dashboard...')

  // Capture the entire dashboard as one image
  if (dashboardRef?.current) {
    try {
      const imageDataUrl = await captureElement(dashboardRef.current)
      const { width: imgW, height: imgH } = await getImageDimensions(imageDataUrl)

      onProgress?.('Building PDF...')

      // Calculate scaled dimensions to fit A3 (leaving room for footer + disclaimer)
      const aspectRatio = imgW / imgH
      const footerSpace = 25 // Space for footer and disclaimer
      const availableHeight = pageHeight - margin - headerHeight - margin - footerSpace

      let finalWidth = contentWidth
      let finalHeight = contentWidth / aspectRatio

      // If image is too tall, scale by height instead
      if (finalHeight > availableHeight) {
        finalHeight = availableHeight
        finalWidth = availableHeight * aspectRatio
      }

      // Center horizontally if width is less than content width
      const xOffset = margin + (contentWidth - finalWidth) / 2

      // Add subtle border around dashboard image
      pdf.setDrawColor(229, 231, 235)
      pdf.setLineWidth(0.3)
      pdf.rect(xOffset - 1, margin + headerHeight - 1, finalWidth + 2, finalHeight + 2)

      // Add the dashboard image
      pdf.addImage(imageDataUrl, 'PNG', xOffset, margin + headerHeight, finalWidth, finalHeight)

    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to capture dashboard:', error)
      throw error
    }
  }

  // Add footer with disclaimer
  addFooter(pdf, pageWidth, pageHeight, margin)

  // Save PDF
  onProgress?.('Saving PDF...')
  const filename = `HIDC-Report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`
  pdf.save(filename)

  onProgress?.(null)
  return filename
}

/**
 * Calculate summary statistics from incidents
 */
const calculateSummary = (incidents) => {
  const byContractor = {}
  const bySite = {}

  incidents.forEach(incident => {
    const contractor = incident.contractor || 'Unknown'
    const site = incident.site || 'Unknown'
    const isClosed = incident.actionStatus === 'closed'

    // Contractor breakdown
    if (!byContractor[contractor]) {
      byContractor[contractor] = { total: 0, open: 0, closed: 0 }
    }
    byContractor[contractor].total++
    byContractor[contractor][isClosed ? 'closed' : 'open']++

    // Site breakdown
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
 * Add summary section to PDF with improved layout
 */
const addSummarySection = (pdf, incidents, x, y, contentWidth, pageWidth) => {
  const summary = calculateSummary(incidents)

  // Summary title with subtle background
  pdf.setFillColor(249, 250, 251)
  pdf.rect(x, y - 2, contentWidth, 8, 'F')

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(31, 41, 55)
  pdf.text('SUMMARY', pageWidth / 2, y + 3, { align: 'center' })
  y += 10

  // Total events with emphasis
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(59, 130, 246) // Blue color
  pdf.text(`Total Events: ${incidents.length.toLocaleString()}`, pageWidth / 2, y, { align: 'center' })
  y += 6

  // Only show breakdown if there's meaningful data (not all Unassigned)
  const hasContractors = summary.byContractor.length > 0 &&
    !(summary.byContractor.length === 1 && summary.byContractor[0][0] === 'Unassigned')
  const hasSites = summary.bySite.length > 0 &&
    !(summary.bySite.length === 1 && summary.bySite[0][0] === 'Unassigned')

  if (hasContractors || hasSites) {
    // Two-column layout for contractor and site breakdown
    const leftX = x + 15
    const rightX = pageWidth / 2 + 15
    let leftY = y
    let rightY = y

    // Contractor breakdown (left side)
    if (hasContractors) {
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(55, 65, 81)
      pdf.text('By Contractor:', leftX, leftY)
      leftY += 4
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(107, 114, 128)

      summary.byContractor.slice(0, 5).forEach(([name, data]) => {
        const displayName = name.length > 22 ? name.substring(0, 22) + '...' : name
        pdf.text(`${displayName}: ${data.total} (${data.open} open, ${data.closed} closed)`, leftX, leftY)
        leftY += 4
      })
    }

    // Site breakdown (right side)
    if (hasSites) {
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(55, 65, 81)
      pdf.text('By Site:', rightX, rightY)
      rightY += 4
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(107, 114, 128)

      summary.bySite.slice(0, 5).forEach(([name, data]) => {
        const displayName = name.length > 22 ? name.substring(0, 22) + '...' : name
        pdf.text(`${displayName}: ${data.total} (${data.open} open, ${data.closed} closed)`, rightX, rightY)
        rightY += 4
      })
    }

    y = Math.max(leftY, rightY) + 4
  }

  // Add divider line
  pdf.setDrawColor(229, 231, 235)
  pdf.setLineWidth(0.3)
  pdf.line(x + 20, y, pageWidth - x - 20, y)
  y += 4

  pdf.setTextColor(0, 0, 0)
  return y
}

/**
 * Add header to PDF (centered) - Professional design
 */
const addHeader = (pdf, filterInfo, x, y, pageWidth, contentWidth) => {
  // Top accent line
  pdf.setFillColor(59, 130, 246) // Blue accent
  pdf.rect(0, 0, pageWidth, 3, 'F')

  // Build dynamic title based on filters - prioritize data context
  let mainTitle = 'Event Report'
  const subtitleParts = []

  // Build meaningful title from filter context
  if (filterInfo.company) {
    mainTitle = `${filterInfo.company} - Event Report`
  }
  if (filterInfo.contractor) {
    subtitleParts.push(filterInfo.contractor)
  }
  if (filterInfo.site) {
    subtitleParts.push(filterInfo.site)
  }

  // Main title
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(31, 41, 55)
  pdf.text(mainTitle, pageWidth / 2, y + 8, { align: 'center' })

  // Subtitle with contractor/site if available
  if (subtitleParts.length > 0) {
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(55, 65, 81)
    pdf.text(subtitleParts.join(' | '), pageWidth / 2, y + 14, { align: 'center' })
  }

  // Date info on a separate line
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(107, 114, 128)

  const dateParts = []
  if (filterInfo.dateFrom || filterInfo.dateTo) {
    const from = filterInfo.dateFrom || 'Start'
    const to = filterInfo.dateTo || 'Present'
    dateParts.push(`Period: ${from} to ${to}`)
  }
  dateParts.push(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`)

  const yOffset = subtitleParts.length > 0 ? 19 : 14
  pdf.text(dateParts.join('  |  '), pageWidth / 2, y + yOffset, { align: 'center' })
  pdf.setTextColor(0, 0, 0)
}

/**
 * Add footer to PDF with disclaimer - Professional design
 */
const addFooter = (pdf, pageWidth, pageHeight, margin) => {
  const footerY = pageHeight - 22

  // Separator line
  pdf.setDrawColor(229, 231, 235)
  pdf.setLineWidth(0.3)
  pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8)

  // Disclaimer text (wrapped)
  pdf.setFontSize(6.5)
  pdf.setFont('helvetica', 'italic')
  pdf.setTextColor(156, 163, 175)
  const disclaimerLines = pdf.splitTextToSize(DISCLAIMER_TEXT, pageWidth - (margin * 2))
  pdf.text(disclaimerLines, margin, footerY - 4)

  // Bottom footer bar
  pdf.setFillColor(249, 250, 251)
  pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F')

  // Branding
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(107, 114, 128)
  pdf.text(
    'HIDC',
    margin,
    pageHeight - 4
  )
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(156, 163, 175)
  pdf.text(
    ' - Hazard Identification and Data Control',
    margin + 10,
    pageHeight - 4
  )

  // Page number
  pdf.text(
    'Page 1 of 1',
    pageWidth - margin,
    pageHeight - 4,
    { align: 'right' }
  )
}
