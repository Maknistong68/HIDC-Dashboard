import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { captureElement, getImageDimensions } from './captureCharts'

/**
 * Generates a PDF document by capturing the entire dashboard as one image
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
  const margin = 10
  const contentWidth = pageWidth - (margin * 2)

  // Add header (centered)
  addHeader(pdf, filterInfo, margin, margin, pageWidth, contentWidth)
  let currentY = margin + 20 // After header

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

      // Calculate scaled dimensions to fit A3
      const aspectRatio = imgW / imgH
      const availableHeight = pageHeight - margin - headerHeight - margin - 10 // 10 for footer

      let finalWidth = contentWidth
      let finalHeight = contentWidth / aspectRatio

      // If image is too tall, scale by height instead
      if (finalHeight > availableHeight) {
        finalHeight = availableHeight
        finalWidth = availableHeight * aspectRatio
      }

      // Center horizontally if width is less than content width
      const xOffset = margin + (contentWidth - finalWidth) / 2

      // Add the dashboard image
      pdf.addImage(imageDataUrl, 'PNG', xOffset, margin + headerHeight, finalWidth, finalHeight)

    } catch (error) {
      console.error('Failed to capture dashboard:', error)
      throw error
    }
  }

  // Add footer
  addFooter(pdf, pageWidth, pageHeight, margin)

  // Save PDF
  onProgress?.('Saving PDF...')
  const filename = `HSE-Dashboard-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`
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
    const contractor = incident.contractor || 'Unassigned'
    const site = incident.site || 'Unassigned'
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
 * Add summary section to PDF
 */
const addSummarySection = (pdf, incidents, x, y, contentWidth, pageWidth) => {
  const summary = calculateSummary(incidents)

  // Summary title
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(31, 41, 55)
  pdf.text('Summary', pageWidth / 2, y, { align: 'center' })
  y += 6

  // Total observations
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(107, 114, 128)
  pdf.text(`Total Observations: ${incidents.length}`, pageWidth / 2, y, { align: 'center' })
  y += 5

  // Only show breakdown if there's meaningful data (not all Unassigned)
  const hasContractors = summary.byContractor.length > 0 &&
    !(summary.byContractor.length === 1 && summary.byContractor[0][0] === 'Unassigned')
  const hasSites = summary.bySite.length > 0 &&
    !(summary.bySite.length === 1 && summary.bySite[0][0] === 'Unassigned')

  if (hasContractors || hasSites) {
    // Two-column layout for contractor and site breakdown
    const leftX = x + 20
    const rightX = pageWidth / 2 + 20
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
        const displayName = name.length > 20 ? name.substring(0, 20) + '...' : name
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
        const displayName = name.length > 20 ? name.substring(0, 20) + '...' : name
        pdf.text(`${displayName}: ${data.total} (${data.open} open, ${data.closed} closed)`, rightX, rightY)
        rightY += 4
      })
    }

    y = Math.max(leftY, rightY) + 3
  }

  pdf.setTextColor(0, 0, 0)
  return y
}

/**
 * Add header to PDF (centered)
 */
const addHeader = (pdf, filterInfo, x, y, pageWidth, contentWidth) => {
  // Center the title
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(31, 41, 55)
  pdf.text('HSE Safety Dashboard Report', pageWidth / 2, y + 5, { align: 'center' })

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(107, 114, 128)

  const parts = [`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`]
  if (filterInfo.company) parts.push(`Company: ${filterInfo.company}`)
  if (filterInfo.contractor) parts.push(`Contractor: ${filterInfo.contractor}`)
  if (filterInfo.site) parts.push(`Site: ${filterInfo.site}`)
  if (filterInfo.dateFrom || filterInfo.dateTo) {
    const from = filterInfo.dateFrom || 'Start'
    const to = filterInfo.dateTo || 'Present'
    parts.push(`Date Range: ${from} to ${to}`)
  }

  // Center the filter info line
  pdf.text(parts.join('  |  '), pageWidth / 2, y + 10, { align: 'center' })
  pdf.setTextColor(0, 0, 0)
}

/**
 * Add footer to PDF
 */
const addFooter = (pdf, pageWidth, pageHeight, margin) => {
  pdf.setFontSize(8)
  pdf.setTextColor(156, 163, 175)
  pdf.text(
    'HSE Safety Dashboard - Confidential',
    pageWidth / 2,
    pageHeight - margin + 5,
    { align: 'center' }
  )
  pdf.text(
    'Page 1 of 1',
    pageWidth - margin,
    pageHeight - margin + 5,
    { align: 'right' }
  )
}
