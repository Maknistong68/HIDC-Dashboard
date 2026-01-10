import React from 'react'
import { X, Download, Calendar, MapPin, User, Building2, AlertCircle, CheckCircle, Clock, Database, Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, ChevronDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import jsPDF from 'jspdf'
import { INCIDENT_TYPES, ACTION_STATUSES } from '../../utils/constants'

const ReportModal = ({ record, onClose }) => {
  if (!record) return null

  const typeInfo = INCIDENT_TYPES.find(t => t.value === record.type)
  const statusInfo = ACTION_STATUSES.find(s => s.value === record.actionStatus)

  const handleDownloadPDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = 210
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let y = margin

    // Helper function to add wrapped text
    const addWrappedText = (text, x, startY, maxWidth, lineHeight = 5) => {
      const lines = pdf.splitTextToSize(text || '-', maxWidth)
      pdf.text(lines, x, startY)
      return startY + lines.length * lineHeight
    }

    // Header
    pdf.setFillColor(249, 250, 251)
    pdf.rect(0, 0, pageWidth, 25, 'F')

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(31, 41, 55)
    pdf.text('OBSERVATION REPORT', margin, 12)

    // Type badge
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    const typeLabel = typeInfo?.label || record.type || 'Unknown'
    pdf.setTextColor(typeInfo?.color ? parseInt(typeInfo.color.slice(1, 3), 16) : 0,
                     typeInfo?.color ? parseInt(typeInfo.color.slice(3, 5), 16) : 0,
                     typeInfo?.color ? parseInt(typeInfo.color.slice(5, 7), 16) : 0)
    pdf.text(typeLabel, margin, 20)

    // Date on right
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(107, 114, 128)
    pdf.text(formatDate(record.date), pageWidth - margin, 20, { align: 'right' })

    y = 28

    // Contractor/Site subheader (centered) if available
    if (record.contractor || record.site) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(55, 65, 81)
      const subParts = []
      if (record.contractor) subParts.push(record.contractor)
      if (record.site) subParts.push(record.site)
      pdf.text(subParts.join(' - '), pageWidth / 2, y, { align: 'center' })
      y = 38
    } else {
      y = 35
    }

    // Divider line
    pdf.setDrawColor(229, 231, 235)
    pdf.setLineWidth(0.5)
    pdf.line(margin, y - 5, pageWidth - margin, y - 5)

    // Details Section
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(55, 65, 81)
    pdf.text('DETAILS', margin, y)
    y += 8

    // Details grid (2 columns)
    const col1X = margin
    const col2X = margin + contentWidth / 2 + 5
    const labelColor = [107, 114, 128]
    const valueColor = [31, 41, 55]

    // Row 1: Date & Contractor
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...labelColor)
    pdf.text('DATE', col1X, y)
    pdf.text('CONTRACTOR', col2X, y)
    y += 4

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...valueColor)
    pdf.text(formatDate(record.date), col1X, y)
    pdf.text(record.contractor || '-', col2X, y)
    y += 8

    // Row 1.5: Site
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...labelColor)
    pdf.text('SITE', col1X, y)
    y += 4

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...valueColor)
    pdf.text(record.site || '-', col1X, y)
    y += 8

    // Row 2: Hazard & Reporter
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...labelColor)
    pdf.text('HAZARD/LOCATION', col1X, y)
    pdf.text('REPORTED BY', col2X, y)
    y += 4

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...valueColor)
    pdf.text(record.location || '-', col1X, y)
    pdf.text(record.reportedBy || '-', col2X, y)
    y += 8

    // Row 3: Status & Approval
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...labelColor)
    pdf.text('ACTION STATUS', col1X, y)
    pdf.text('APPROVAL STATUS', col2X, y)
    y += 4

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...valueColor)
    pdf.text(statusInfo?.label || record.actionStatus || 'Open', col1X, y)
    pdf.text(record.approvalStatus || '-', col2X, y)
    y += 12

    // Divider
    pdf.setDrawColor(229, 231, 235)
    pdf.line(margin, y - 3, pageWidth - margin, y - 3)

    // Description Section
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(55, 65, 81)
    pdf.text('DESCRIPTION', margin, y)
    y += 6

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(55, 65, 81)
    const description = record.description || 'No description provided.'
    y = addWrappedText(description, margin, y, contentWidth, 5)
    y += 8

    // Additional Info (if any) - excluding root cause
    if (record.bodyPart || record.correctiveAction) {
      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, y - 3, pageWidth - margin, y - 3)

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(55, 65, 81)
      pdf.text('ADDITIONAL INFORMATION', margin, y)
      y += 6

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      if (record.bodyPart) {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...labelColor)
        pdf.text('Body Part:', margin, y)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...valueColor)
        pdf.text(record.bodyPart, margin + 25, y)
        y += 6
      }

      if (record.correctiveAction) {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...labelColor)
        pdf.text('Corrective Action:', margin, y)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...valueColor)
        y = addWrappedText(record.correctiveAction, margin, y + 5, contentWidth, 5)
      }
      y += 5
    }

    // History (if any)
    if (record.history && record.history.length > 0) {
      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, y - 3, pageWidth - margin, y - 3)

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(55, 65, 81)
      pdf.text('ACTION HISTORY', margin, y)
      y += 6

      pdf.setFontSize(9)
      record.history.forEach(item => {
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...labelColor)
        pdf.text(item.date || '', margin, y)
        pdf.setTextColor(...valueColor)
        const historyText = `${item.action || ''}${item.by ? ` by ${item.by}` : ''}`
        pdf.text(historyText, margin + 25, y)
        y += 5
      })
    }

    // Footer
    const footerY = 280
    pdf.setDrawColor(229, 231, 235)
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(156, 163, 175)
    pdf.text('HSE Safety Dashboard', margin, footerY)
    pdf.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth - margin, footerY, { align: 'right' })

    if (record.externalId) {
      pdf.text(`Reference ID: ${record.externalId}`, margin, footerY + 4)
    }

    // Save PDF
    const filename = `Observation-Report-${record.date || 'unknown'}.pdf`
    pdf.save(filename)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'closed':
        return <CheckCircle size={14} className="text-green-600" />
      case 'in-progress':
        return <Clock size={14} className="text-orange-500" />
      default:
        return <AlertCircle size={14} className="text-red-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white shadow-xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-200 bg-surface-50">
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: typeInfo?.color + '20',
                  color: typeInfo?.color,
                }}
              >
                {typeInfo?.label || record.type}
              </span>
              <span className="text-sm text-surface-500">
                {formatDate(record.date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                title="Download PDF"
              >
                <Download size={14} />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="field">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                  <Calendar size={12} />
                  Date
                </div>
                <div className="text-sm text-surface-900">{formatDate(record.date)}</div>
              </div>

              <div className="field">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                  <Building2 size={12} />
                  Contractor
                </div>
                <div className="text-sm text-surface-900">{record.contractor || '-'}</div>
              </div>

              <div className="field">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                  <MapPin size={12} />
                  Site
                </div>
                <div className="text-sm text-surface-900">{record.site || '-'}</div>
              </div>

              <div className="field">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                  <AlertCircle size={12} />
                  Hazard Category
                </div>
                <div className="text-sm text-surface-900">{record.location || '-'}</div>
              </div>

              <div className="field">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                  <User size={12} />
                  Reported By
                </div>
                <div className="text-sm text-surface-900">{record.reportedBy || '-'}</div>
              </div>

              <div className="field">
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                  Action Status
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={record.actionStatus} />
                  <span
                    className="px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: statusInfo?.color + '20',
                      color: statusInfo?.color,
                    }}
                  >
                    {statusInfo?.label || record.actionStatus || 'Open'}
                  </span>
                </div>
              </div>

              <div className="field">
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                  Approval Status
                </div>
                <div className="text-sm text-surface-900">{record.approvalStatus || '-'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2 border-b border-surface-200 pb-1">
                Description
              </div>
              <div className="bg-surface-50 p-3 border border-surface-200 text-sm text-surface-700 whitespace-pre-wrap leading-relaxed">
                {record.description || 'No description provided.'}
              </div>
            </div>

            {/* Additional Fields (if any) - excluding root cause */}
            {(record.bodyPart || record.correctiveAction) && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2 border-b border-surface-200 pb-1">
                  Additional Information
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {record.bodyPart && (
                    <div>
                      <span className="text-xs font-medium text-surface-500">Body Part Affected: </span>
                      <span className="text-sm text-surface-900">{record.bodyPart}</span>
                    </div>
                  )}
                  {record.correctiveAction && (
                    <div>
                      <span className="text-xs font-medium text-surface-500">Corrective Action: </span>
                      <span className="text-sm text-surface-900">{record.correctiveAction}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data Quality Section */}
            <DataQualitySection record={record} />

            {/* History/Timeline (if available) */}
            {record.history && record.history.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2 border-b border-surface-200 pb-1">
                  Action History
                </div>
                <div className="space-y-2">
                  {record.history.map((item, index) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <div className="text-xs text-surface-400 w-24 flex-shrink-0">
                        {item.date}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-surface-700">{item.action}</span>
                        {item.by && <span className="text-surface-500"> by {item.by}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reference ID */}
            {record.externalId && (
              <div className="mt-4 pt-3 border-t border-surface-200">
                <span className="text-xs text-surface-400">Reference ID: {record.externalId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Data Quality Section Component - Compact & Collapsible
 * Shows whether hazard category was from Excel or auto-classified
 */
const DataQualitySection = ({ record }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Check if data quality fields exist (only for newly imported records)
  const hasDataQualityInfo = record.hazardCategorySource !== undefined
  if (!hasDataQualityInfo) return null

  const isFromExcel = record.hazardCategorySource === 'excel'
  const isValidated = record.hazardCategoryValidated
  const hasIssue = record.dataQualityIssue && !isValidated

  // Check if there's a meaningful description to validate against
  const description = record.description || ''
  const hasDescription = description.trim().length > 10 &&
    !description.toLowerCase().includes('no description provided')

  // Compact status indicator - adjusted logic for missing descriptions
  const getStatusBadge = () => {
    if (hasIssue) {
      return { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Review Needed' }
    }
    if (isValidated) {
      return { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', label: 'Verified' }
    }
    // No validation but also no issue - could be missing description
    if (isFromExcel && !hasDescription) {
      // Excel category trusted, no description to validate - show neutral status
      return { icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', label: 'From Source' }
    }
    // Has description but no keywords match
    return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Unverified' }
  }

  const badge = getStatusBadge()
  const BadgeIcon = badge.icon

  // Generate appropriate explanation text
  const getExplanationText = () => {
    if (isValidated) {
      return `Description contains "${record.location}" keywords`
    }
    if (isFromExcel && !hasDescription) {
      return 'Category from source data (no description to verify against)'
    }
    return `No "${record.location}" keywords found in description`
  }

  return (
    <div className="mb-4">
      {/* Compact Header - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${badge.bg} hover:opacity-80`}
      >
        <div className="flex items-center gap-2">
          <BadgeIcon size={12} className={badge.color} />
          <span className={`font-medium ${badge.color}`}>{badge.label}</span>
          <span className="text-surface-400">•</span>
          <span className="text-surface-500">
            {isFromExcel ? 'From Excel' : 'Auto-classified'}
            {record.originalHazardCategory && record.originalHazardCategory !== record.location &&
              ` (was "${record.originalHazardCategory}")`
            }
          </span>
        </div>
        <ChevronDown size={14} className={`text-surface-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-1 p-2 bg-surface-50 border border-surface-200 text-xs space-y-1">
          {record.dataQualityIssue && (
            <p className="text-surface-600">{record.dataQualityIssue}</p>
          )}
          <p className="text-surface-500">{getExplanationText()}</p>
        </div>
      )}
    </div>
  )
}

export default ReportModal
