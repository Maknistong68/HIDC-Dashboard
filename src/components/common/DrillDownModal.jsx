import React, { useState, useMemo } from 'react'
import { X, ChevronRight, ChevronLeft, Eye, Calendar, Building2, MapPin, User, AlertCircle, CheckCircle, Clock, Download, Copy, Check, AlertTriangle, Database, Sparkles, ShieldCheck, ShieldAlert, Brain, Target, Zap, HelpCircle, ClipboardCopy, FileText, Users, MapPinned, MessageSquare, Tag, Flag } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import jsPDF from 'jspdf'
import { analyzeObservation } from '../../utils/contextClassifier'
import { useData } from '../../context/DataContext'
import { parseSentence, filterNoiseWords } from '../../utils/sentenceParser'
import { getStatusColor } from '../../utils/statusColors'
import useResizable from '../../hooks/useResizable.jsx'
import ExportConfirmDialog from './ExportConfirmDialog'
import HighlightedText from './HighlightedText'

// Disclaimer text helper - includes Event ID for individual reports
const getDisclaimerText = (eventId) => {
  if (eventId) {
    return `Please review this report before sharing. Use Event ID: ${eventId} to verify against source records.`
  }
  return 'Please review this report before sharing.'
}

/**
 * Glassmorphism Drill-Down Modal
 * Centered on screen with Apple-style blur effect
 * Supports: Chart → Months/Weeks → Observations hierarchy
 */
const DrillDownModal = ({
  isOpen,
  onClose,
  title,
  data = [],
  type = 'monthly', // 'monthly' | 'records'
  onDrillDown,
  onBack,
  canGoBack = false,
  breadcrumb = [],
  highlightKeywords = [],  // Keywords to highlight in descriptions
  source = 'Unknown'  // Source page: 'Hazards Identification', 'Safety Outlook', etc.
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Resizable functionality
  const {
    containerRef,
    containerStyle,
    isResizing,
    ResizeHandles,
    isMobile
  } = useResizable({
    minWidth: 500,
    minHeight: 400,
    maxWidthPercent: 95,
    maxHeightPercent: 95
  })

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${isMobile ? 'p-0' : 'p-4'}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Container - Full screen on mobile, glassmorphism on desktop */}
      <div
        ref={containerRef}
        className={`
          relative w-full flex flex-col
          ${isMobile
            ? 'h-full max-h-full animate-slide-up'
            : 'max-w-5xl max-h-[90vh] animate-modal-in'
          }
          ${isResizing ? 'select-none' : ''}
        `}
        style={isMobile ? {} : containerStyle}
      >
        {/* Resize Handles - Only on desktop */}
        <ResizeHandles />

        {/* Glass Card */}
        <div className={`
          bg-white/95 sm:bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden h-full flex flex-col
          ${isMobile ? 'border-0 rounded-none' : 'border rounded-2xl'}
        `}>
          {/* Header - Larger touch targets on mobile */}
          <div className={`
            border-b border-surface-200/50 bg-white/50 safe-area-top
            ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {canGoBack && (
                  <button
                    onClick={onBack}
                    className="p-2 sm:p-1.5 rounded-lg hover:bg-surface-100/80 active:bg-surface-200/80 text-surface-500 hover:text-surface-700 transition-colors flex-shrink-0"
                    aria-label="Go back"
                  >
                    <ChevronLeft size={isMobile ? 24 : 20} />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold text-surface-900 truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {title}
                  </h3>
                  {breadcrumb.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5 overflow-x-auto scrollbar-hide">
                      {breadcrumb.map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1 whitespace-nowrap">
                          {idx > 0 && <ChevronRight size={12} />}
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`
                  rounded-xl hover:bg-surface-100/80 active:bg-surface-200/80 text-surface-400 hover:text-surface-600 transition-colors flex-shrink-0
                  ${isMobile ? 'p-3 -mr-1' : 'p-2'}
                `}
                aria-label="Close modal"
              >
                <X size={isMobile ? 24 : 20} />
              </button>
            </div>
          </div>

          {/* Content - Responsive padding */}
          <div className={`overflow-y-auto flex-1 touch-scroll ${isMobile ? 'p-4' : 'p-6'}`}>
            {type === 'monthly' && (
              <MonthlyBreakdown
                data={data}
                onSelect={onDrillDown}
                isMobile={isMobile}
              />
            )}

            {type === 'monthly-breakdown' && (
              <MonthlyQualityBreakdown
                data={data}
                onViewObservations={() => onDrillDown && onDrillDown(data.observations)}
                isMobile={isMobile}
              />
            )}

            {type === 'records' && (
              <RecordsTable
                data={data}
                onViewDetails={setSelectedRecord}
                breadcrumb={breadcrumb}
                title={title}
                isMobile={isMobile}
                highlightKeywords={highlightKeywords}
                copyContext={{
                  source: source,
                  title: title,
                  breadcrumb: breadcrumb,
                  count: data.length
                }}
              />
            )}
          </div>

          {/* Footer hint - Safe area for mobile */}
          <div className={`
            border-t border-surface-200/50 bg-white/30 safe-area-bottom
            ${isMobile ? 'px-4 py-2' : 'px-6 py-3'}
          `}>
            <p className={`text-surface-400 text-center ${isMobile ? 'text-xs' : 'text-xs'}`}>
              {type === 'monthly' ? (isMobile ? 'Tap a period to view' : 'Click a period to view observations') :
               type === 'monthly-breakdown' ? (isMobile ? 'Tap metrics to see observations' : 'Click metrics to see contributing observations') :
               `${data.length} observation${data.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out forwards;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .touch-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      `}</style>
    </div>
  )
}

/**
 * Monthly Breakdown View
 */
const MonthlyBreakdown = ({ data, onSelect, isMobile = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-surface-500">
        No data available for this selection
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className={`space-y-2 ${isMobile ? 'space-y-1' : ''}`}>
      {data.map((item, idx) => (
        <div
          key={item.period || idx}
          onClick={() => onSelect(item)}
          className={`
            group flex items-center gap-3 sm:gap-4 rounded-xl cursor-pointer
            hover:bg-white/60 active:bg-white/80 transition-all duration-200
            border border-transparent hover:border-surface-200/50 active:border-surface-300/50
            ${isMobile ? 'p-3 min-h-[56px]' : 'p-3'}
          `}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
        >
          <div className={`font-medium text-surface-700 flex-shrink-0 ${isMobile ? 'w-16 text-sm' : 'w-20 text-sm'}`}>
            {item.label}
          </div>
          <div className={`flex-1 bg-surface-100/80 rounded-lg overflow-hidden ${isMobile ? 'h-6' : 'h-8'}`}>
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700 group-active:from-blue-700 group-active:to-blue-800"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-10 sm:w-12 text-right flex-shrink-0">
            <span className={`font-bold text-surface-900 ${isMobile ? 'text-base' : 'text-lg'}`}>{item.count}</span>
          </div>
          <ChevronRight size={isMobile ? 20 : 16} className="text-surface-400 group-hover:text-surface-600 group-active:text-surface-700 transition-colors flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

/**
 * Monthly Quality Breakdown View
 * Shows detailed metric breakdown with formulas for a specific month
 */
const MonthlyQualityBreakdown = ({ data, onViewObservations, isMobile = false }) => {
  if (!data) {
    return (
      <div className="text-center py-12 text-surface-500">
        No data available
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const MetricCard = ({ title, score, formula, details, icon: Icon }) => (
    <div className="p-3 rounded-xl bg-white/60 border border-surface-200/50 hover:bg-white/80 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-surface-500" />}
          <span className="text-sm font-medium text-surface-700">{title}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-sm font-bold border ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      <div className="text-xs text-surface-500 font-mono bg-surface-100/80 px-2 py-1 rounded">
        {formula}
      </div>
      {details && (
        <div className="mt-2 text-xs text-surface-600">
          {details}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <div className="text-3xl font-bold text-surface-900">{data.qualityScore}%</div>
        <div className="text-sm text-surface-600">Overall Quality Score</div>
        <div className="text-xs text-surface-500 mt-1">Based on {data.totalObservations} observations</div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-3">
        <MetricCard
          title="Categorization"
          score={data.categorization?.score || 0}
          formula={data.categorization?.formula || '-'}
          details={`${data.categorization?.proper || 0} proper, ${data.categorization?.blank || 0} blank, ${data.categorization?.other || 0} other`}
          icon={CheckCircle}
        />

        <MetricCard
          title="Coverage"
          score={data.coverage?.score || 0}
          formula={data.coverage?.formula || '-'}
          details={`${data.coverage?.activeDays || 0} days with observations out of ${data.coverage?.totalDays || 0} total days`}
          icon={Calendar}
        />

        <MetricCard
          title="Data Integrity"
          score={data.dataIntegrity?.score || 0}
          formula={data.dataIntegrity?.formula || '-'}
          details={`${data.dataIntegrity?.duplicateCount || 0} duplicates found (${data.dataIntegrity?.duplicateRate || 0}% rate)`}
          icon={Database}
        />

        <MetricCard
          title="Description Quality"
          score={data.description?.score || 0}
          formula={data.description?.formula || '-'}
          details={`Average ${data.description?.avgWordCount || 0} words per description`}
          icon={AlertCircle}
        />

        <MetricCard
          title="Near Miss Rate"
          score={data.nearMiss?.score || 0}
          formula={data.nearMiss?.formula || '-'}
          details={`${data.nearMiss?.count || 0} near misses out of ${data.nearMiss?.nonPositiveCount || 0} non-positive observations`}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Reporter Engagement"
          score={data.reporters?.score || 0}
          formula={data.reporters?.formula || '-'}
          details={`${data.reporters?.active || 0} active reporters (5+ observations) out of ${data.reporters?.total || 0} total`}
          icon={User}
        />
      </div>

      {/* View Observations Button */}
      {onViewObservations && data.observations?.length > 0 && (
        <button
          onClick={onViewObservations}
          className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View {data.totalObservations} Observations
        </button>
      )}
    </div>
  )
}

/**
 * Records Table View
 */
const RecordsTable = ({ data, onViewDetails, isMobile = false, highlightKeywords = [], copyContext = {} }) => {
  const [copied, setCopied] = React.useState(false)

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-surface-500">
        No events found
      </div>
    )
  }

  /**
   * Copy all observations with CONTEXT HEADER for classification tuning
   * Format includes:
   * - Source: Safety Outlook
   * - Type: Other/Site Issues/Positives
   * - Hazard Category: Mobile Plant & Equipment
   * - Count: Number of observations
   * - Numbered list of descriptions
   */
  const handleCopyAll = async () => {
    // Build context header
    const contextLines = []
    const sourceName = (copyContext.source || 'DRILL-DOWN').toUpperCase().replace(/\s+/g, ' ')
    contextLines.push(`=== ${sourceName} DRILL-DOWN COPY ===`)

    // Extract type and category from title/breadcrumb
    const title = copyContext.title || 'Observations'
    const breadcrumb = copyContext.breadcrumb || []

    // Determine observation type (Other, Site Issues, Positives)
    let observationType = 'Unknown'
    if (title.includes('Other')) {
      observationType = 'Other (Misclassified/Uncategorized)'
    } else if (title.includes('Site Issues') || title.includes('Negative')) {
      observationType = 'Site Issues (Negative Observations)'
    } else if (title.includes('Positive')) {
      observationType = 'Positives (Good Observations)'
    } else {
      observationType = title
    }

    // Extract hazard category from breadcrumb or title
    let hazardCategory = 'Unknown'
    const categoryMatch = title.match(/from\s+(.+)$/i)
    if (categoryMatch) {
      hazardCategory = categoryMatch[1].trim()
    } else if (breadcrumb.length > 0) {
      // Look for category in breadcrumb (usually the first item after "Safety Outlook")
      for (const crumb of breadcrumb) {
        if (crumb && !crumb.includes('Safety') && !crumb.includes('Outlook')) {
          hazardCategory = crumb
          break
        }
      }
    }

    contextLines.push(`Source: ${copyContext.source || 'Unknown'}`)
    contextLines.push(`Type: ${observationType}`)
    contextLines.push(`Hazard Category: ${hazardCategory}`)
    contextLines.push(`Count: ${data.length} observations`)
    contextLines.push(`Breadcrumb: ${breadcrumb.length > 0 ? breadcrumb.join(' > ') : 'N/A'}`)
    contextLines.push('')
    contextLines.push('=== OBSERVATIONS ===')
    contextLines.push('')

    // Add numbered observations
    const observations = data.map((record, idx) => {
      return `${idx + 1}. "${record.description || 'No description'}"`
    })

    const fullText = contextLines.join('\n') + observations.join('\n')

    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // Status color imported from shared utility

  return (
    <div className={`space-y-2 ${isMobile ? 'space-y-3' : ''}`}>
      {/* Copy All Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleCopyAll}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied All!' : `Copy All (${data.length})`}
        </button>
      </div>
      {data.map((record, idx) => (
        <div
          key={record.externalId || idx}
          className={`
            group rounded-xl bg-white/60 border border-surface-200/50
            hover:bg-white/80 active:bg-white/90 hover:border-surface-300/50 active:border-surface-400/50
            transition-all duration-200
            ${isMobile ? 'p-3' : 'p-4'}
          `}
        >
          {/* Mobile: Stack layout, Desktop: Side by side */}
          <div className={`${isMobile ? 'space-y-3' : 'flex items-start justify-between gap-4'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`font-medium text-surface-900 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  {record.date}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(record.actionStatus)}`}>
                  {record.actionStatus || 'open'}
                </span>
              </div>
              <p className={`text-surface-600 line-clamp-2 ${isMobile ? 'text-sm leading-relaxed' : 'text-sm'}`}>
                {highlightKeywords.length > 0 ? (
                  <HighlightedText
                    text={record.description || 'No description'}
                    keywords={highlightKeywords}
                  />
                ) : (
                  record.description || 'No description'
                )}
              </p>
              <div className={`flex items-center gap-3 sm:gap-4 mt-2 text-xs text-surface-500 flex-wrap`}>
                {record.contractor && (
                  <span className="flex items-center gap-1">
                    <Building2 size={12} />
                    <span className="truncate max-w-[120px]">{record.contractor}</span>
                  </span>
                )}
                {record.site && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span className="truncate max-w-[100px]">{record.site}</span>
                  </span>
                )}
              </div>
            </div>
            {/* View button */}
            <button
              onClick={() => onViewDetails(record)}
              className={`
                flex items-center justify-center gap-1.5 font-medium text-blue-600
                hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors
                ${isMobile
                  ? 'w-full h-11 text-sm bg-blue-50 mt-1'
                  : 'px-3 py-1.5 text-sm'
                }
              `}
            >
              <Eye size={isMobile ? 18 : 14} />
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Record Details Modal (Glassmorphism) with PDF Export
 */
const RecordDetailsModal = ({ record, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [showExportConfirm, setShowExportConfirm] = useState(false)
  const { updateIncident } = useData()

  // Flag for miscategorization
  const isFlagged = record._flaggedMiscategorized

  const handleToggleFlag = () => {
    updateIncident(record.id, {
      _flaggedMiscategorized: !isFlagged,
      _flaggedMiscategorizedAt: !isFlagged ? new Date().toISOString() : null
    })
  }

  // Resizable functionality
  const {
    containerRef: detailsContainerRef,
    containerStyle: detailsContainerStyle,
    isResizing: isDetailsResizing,
    ResizeHandles: DetailsResizeHandles,
    isMobile
  } = useResizable({
    minWidth: 450,
    minHeight: 350,
    maxWidthPercent: 90,
    maxHeightPercent: 90
  })

  if (!record) return null

  const handleCopyEventId = () => {
    navigator.clipboard.writeText(record.externalId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'closed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Closed' }
      case 'in-progress':
        return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100', label: 'In Progress' }
      default:
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Open' }
    }
  }

  // PDF Export function
  const handleDownloadPDF = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = 210
    const pageHeight = 297
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let y = margin

    const addWrappedText = (text, x, startY, maxWidth, lineHeight = 5) => {
      const lines = pdf.splitTextToSize(text || '-', maxWidth)
      pdf.text(lines, x, startY)
      return startY + lines.length * lineHeight
    }

    // Top accent line
    pdf.setFillColor(59, 130, 246)
    pdf.rect(0, 0, pageWidth, 2.5, 'F')

    // Header background
    pdf.setFillColor(249, 250, 251)
    pdf.rect(0, 2.5, pageWidth, 22, 'F')

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(31, 41, 55)
    pdf.text('EVENT REPORT', margin, 14)
    pdf.setFontSize(9)
    pdf.setTextColor(107, 114, 128)
    pdf.text(formatDate(record.date), pageWidth - margin, 14, { align: 'right' })

    // Type badge
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(59, 130, 246)
    pdf.text((record.type || 'observation').toUpperCase(), margin, 21)
    y = 30

    // Contractor/Site subheader
    if (record.contractor || record.site) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(55, 65, 81)
      const subParts = [record.contractor, record.site].filter(Boolean)
      pdf.text(subParts.join(' - '), pageWidth / 2, y, { align: 'center' })
      y = 40
    } else {
      y = 37
    }

    // Divider
    pdf.setDrawColor(229, 231, 235)
    pdf.setLineWidth(0.3)
    pdf.line(margin, y - 5, pageWidth - margin, y - 5)

    // Details Section with background
    pdf.setFillColor(249, 250, 251)
    pdf.rect(margin, y - 2, contentWidth, 7, 'F')
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(31, 41, 55)
    pdf.text('DETAILS', margin + 2, y + 3)
    y += 10

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

    // Row 2: Site & Hazard
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...labelColor)
    pdf.text('SITE', col1X, y)
    pdf.text('HAZARD CATEGORY', col2X, y)
    y += 4
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...valueColor)
    pdf.text(record.site || '-', col1X, y)
    pdf.text(record.location || '-', col2X, y)
    y += 8

    // Row 3: Reporter & Status
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...labelColor)
    pdf.text('REPORTED BY', col1X, y)
    pdf.text('STATUS', col2X, y)
    y += 4
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...valueColor)
    pdf.text(record.reportedBy || '-', col1X, y)
    pdf.text(getStatusInfo(record.actionStatus).label, col2X, y)
    y += 12

    // Divider
    pdf.setDrawColor(229, 231, 235)
    pdf.line(margin, y - 3, pageWidth - margin, y - 3)

    // Description Section with background
    pdf.setFillColor(249, 250, 251)
    pdf.rect(margin, y - 2, contentWidth, 7, 'F')
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(31, 41, 55)
    pdf.text('DESCRIPTION', margin + 2, y + 3)
    y += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(55, 65, 81)
    y = addWrappedText(record.description || 'No description provided.', margin, y, contentWidth, 5)
    y += 8

    // Additional Info
    if (record.bodyPart || record.correctiveAction) {
      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, y - 3, pageWidth - margin, y - 3)

      pdf.setFillColor(249, 250, 251)
      pdf.rect(margin, y - 2, contentWidth, 7, 'F')
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(31, 41, 55)
      pdf.text('ADDITIONAL INFORMATION', margin + 2, y + 3)
      y += 10

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
    }

    // Footer with disclaimer
    const footerY = pageHeight - 28

    // Separator line
    pdf.setDrawColor(229, 231, 235)
    pdf.setLineWidth(0.3)
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    // Disclaimer text with Event ID
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(107, 114, 128)
    const disclaimerText = getDisclaimerText(record.externalId)
    const disclaimerLines = pdf.splitTextToSize(disclaimerText, contentWidth)
    pdf.text(disclaimerLines, margin, footerY)

    // Bottom footer bar
    pdf.setFillColor(249, 250, 251)
    pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F')

    // Reference ID (prominent)
    if (record.externalId) {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(59, 130, 246)
      pdf.text(`Reference ID: ${record.externalId}`, margin, pageHeight - 5)
    }

    // Branding and date
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(156, 163, 175)
    pdf.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth - margin, pageHeight - 5, { align: 'right' })

    pdf.save(`Event-Report-${record.date || 'report'}.pdf`)
  }

  // Handle export button click - show confirmation first
  const handleExportClick = () => {
    setShowExportConfirm(true)
  }

  // Handle confirmed export
  const handleConfirmExport = () => {
    handleDownloadPDF()
  }

  const statusInfo = getStatusInfo(record.actionStatus)
  const StatusIcon = statusInfo.icon

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center ${isMobile ? 'p-0' : 'p-4'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Darker backdrop for nested modal */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Modal - Full screen on mobile */}
      <div
        ref={detailsContainerRef}
        className={`
          relative w-full flex flex-col
          ${isMobile
            ? 'h-full max-h-full animate-slide-up'
            : 'max-w-3xl max-h-[90vh] animate-modal-in'
          }
          ${isDetailsResizing ? 'select-none' : ''}
        `}
        style={isMobile ? {} : detailsContainerStyle}
      >
        <DetailsResizeHandles />
        <div className={`
          bg-white/95 sm:bg-white/90 backdrop-blur-2xl border-white/30 shadow-2xl overflow-hidden h-full flex flex-col
          ${isMobile ? 'border-0 rounded-none' : 'border rounded-2xl'}
        `}>
          {/* Header - Larger touch targets on mobile */}
          <div className={`
            border-b border-surface-200/50 bg-gradient-to-r from-surface-50/80 to-white/80 safe-area-top
            ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}
          `}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
                <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 ${isMobile ? 'order-1' : ''}`}>
                  {record.type?.toUpperCase() || 'OBSERVATION'}
                </span>
                <span className={`text-surface-500 ${isMobile ? 'text-xs order-2' : 'text-sm'}`}>{formatDate(record.date)}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleExportClick}
                  className={`
                    flex items-center gap-1.5 font-medium text-white bg-blue-600
                    hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors
                    ${isMobile ? 'px-3 h-10 text-sm' : 'px-3 py-1.5 text-sm'}
                  `}
                  title="Download PDF"
                >
                  <Download size={isMobile ? 18 : 14} />
                  <span className={isMobile ? 'hidden xs:inline' : ''}>PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className={`
                    rounded-xl hover:bg-surface-100/80 active:bg-surface-200/80
                    text-surface-400 hover:text-surface-600 transition-colors
                    ${isMobile ? 'p-3 -mr-1' : 'p-2'}
                  `}
                  aria-label="Close modal"
                >
                  <X size={isMobile ? 24 : 20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Responsive padding */}
          <div className={`space-y-4 sm:space-y-6 flex-1 overflow-y-auto touch-scroll ${isMobile ? 'p-4' : 'p-6'}`}>
            {/* Key Details Grid - 1 column on mobile, 2 on desktop */}
            <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <DetailField icon={Calendar} label="Date" value={formatDate(record.date)} />
              <DetailField icon={Building2} label="Contractor" value={record.contractor} />
              <DetailField icon={MapPin} label="Site" value={record.site} />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 uppercase tracking-wide">
                  <AlertCircle size={12} />
                  Hazard Category
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-surface-900">{record.location || '-'}</span>
                  <button
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isFlagged
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    <Flag size={12} />
                    {isFlagged ? 'Flagged' : 'Flag'}
                  </button>
                </div>
              </div>
              <DetailField icon={User} label="Reported By" value={record.reportedBy} />

              {/* Status with icon */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Status
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon size={16} className={statusInfo.color} />
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                Description
              </div>
              <div className="p-4 bg-surface-50/80 rounded-xl border border-surface-200/50 text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">
                {record.description || 'No description provided.'}
              </div>
            </div>

            {/* Additional Info - excluding root cause */}
            {(record.bodyPart || record.correctiveAction) && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Additional Information
                </div>
                <div className="space-y-2">
                  {record.bodyPart && (
                    <div className="flex gap-2 text-sm">
                      <span className="font-medium text-surface-500">Body Part:</span>
                      <span className="text-surface-900">{record.bodyPart}</span>
                    </div>
                  )}
                  {record.correctiveAction && (
                    <div className="flex gap-2 text-sm">
                      <span className="font-medium text-surface-500">Corrective Action:</span>
                      <span className="text-surface-900">{record.correctiveAction}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data Quality Section */}
            <DataQualitySection record={record} />

            {/* Context Analysis Section - Classification Reasoning */}
            <ContextAnalysisSection record={record} />

            {/* Parsing Analysis Section - WHO/WHAT/WHERE breakdown */}
            <ParsingAnalysisSection record={record} />

            {/* Reference ID with Copy Button */}
            {record.externalId && (
              <div className="pt-4 border-t border-surface-200/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400">Reference: {record.externalId}</span>
                  <button
                    onClick={handleCopyEventId}
                    className={`p-1.5 rounded transition-all ${
                      copied
                        ? 'text-green-600 bg-green-50'
                        : 'text-surface-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={copied ? 'Copied!' : 'Copy Event ID'}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  {copied && (
                    <span className="text-xs text-green-600 font-medium">Copied!</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Confirmation Dialog */}
      <ExportConfirmDialog
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        onConfirm={handleConfirmExport}
        exportType="Report"
      />
    </div>
  )
}

/**
 * Detail Field Component
 */
const DetailField = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 uppercase tracking-wide">
      {Icon && <Icon size={12} />}
      {label}
    </div>
    <div className="text-sm text-surface-900">{value || '-'}</div>
  </div>
)

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
    <div className="pt-3 border-t border-surface-200/50">
      {/* Compact Header - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${badge.bg} hover:opacity-80`}
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
        <ChevronRight size={14} className={`text-surface-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-2 bg-surface-50/80 rounded-lg text-xs space-y-1">
          {record.dataQualityIssue && (
            <p className="text-surface-600">{record.dataQualityIssue}</p>
          )}
          <p className="text-surface-500">{getExplanationText()}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Context Analysis Section - Shows AI classification reasoning
 * Displays hazard object, action, outcome, and confidence
 * Calculates analysis on-the-fly for records that don't have it
 */
const ContextAnalysisSection = ({ record }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Use existing analysis or calculate on-the-fly
  const analysis = React.useMemo(() => {
    // If record already has contextAnalysis, use it
    if (record?.contextAnalysis?.confidence) {
      return record.contextAnalysis
    }
    // Otherwise, calculate it from the description
    if (record?.description) {
      return analyzeObservation(record.description, record.originalHazardCategory || record.location)
    }
    return null
  }, [record?.description, record?.contextAnalysis, record?.originalHazardCategory, record?.location])

  if (!analysis || !analysis.confidence) return null

  // Confidence level styling
  const getConfidenceStyle = (confidence) => {
    if (confidence >= 85) return { color: 'text-green-600', bg: 'bg-green-50', label: 'High' }
    if (confidence >= 65) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Medium' }
    return { color: 'text-red-500', bg: 'bg-red-50', label: 'Low' }
  }

  const confidenceStyle = getConfidenceStyle(analysis.confidence)

  return (
    <div className="pt-3 border-t border-surface-200/50">
      {/* Compact Header - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors bg-blue-50 hover:bg-blue-100/80`}
      >
        <div className="flex items-center gap-2">
          <Brain size={12} className="text-blue-600" />
          <span className="font-medium text-blue-700">Classification Reasoning</span>
          <span className="text-surface-400">•</span>
          <span className={`font-medium ${confidenceStyle.color}`}>
            {analysis.confidence}% {confidenceStyle.label}
          </span>
        </div>
        <ChevronRight size={14} className={`text-surface-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-surface-50/80 rounded-lg text-xs space-y-3">
          {/* Reasoning text */}
          <div className="flex items-start gap-2">
            <HelpCircle size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-surface-700 leading-relaxed">{analysis.reasoning}</p>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-2 gap-2">
            {analysis.hazardObject && (
              <div className="flex items-center gap-1.5">
                <Target size={11} className="text-purple-500" />
                <span className="text-surface-500">Object:</span>
                <span className="text-surface-800 font-medium">{analysis.hazardObject}</span>
              </div>
            )}
            {analysis.action && (
              <div className="flex items-center gap-1.5">
                <Zap size={11} className="text-orange-500" />
                <span className="text-surface-500">Action:</span>
                <span className="text-surface-800 font-medium">{analysis.action}</span>
              </div>
            )}
          </div>

          {/* Potential Outcome */}
          {analysis.potentialOutcome && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-surface-200/50">
              <AlertTriangle size={11} className="text-red-500" />
              <span className="text-surface-500">Potential Outcome:</span>
              <span className="text-surface-800 font-medium">{analysis.potentialOutcome}</span>
            </div>
          )}

          {/* Disambiguation note */}
          {analysis.disambiguation && (
            <div className="p-2 bg-amber-50 rounded border border-amber-200/50">
              <div className="flex items-start gap-1.5">
                <AlertCircle size={11} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800">
                  <span className="font-medium">Note:</span> "{analysis.disambiguation.pattern}" indicates{' '}
                  <span className="font-medium">{record.location}</span>
                  {analysis.disambiguation.wrongCategory && (
                    <>, not {analysis.disambiguation.wrongCategory}</>
                  )}.
                  {analysis.disambiguation.reason && (
                    <span className="text-amber-600"> ({analysis.disambiguation.reason})</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Confidence bar */}
          <div className="pt-2 border-t border-surface-200/50">
            <div className="flex items-center justify-between text-[10px] text-surface-500 mb-1">
              <span>Confidence Level</span>
              <span className={confidenceStyle.color}>{analysis.confidence}%</span>
            </div>
            <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  analysis.confidence >= 85 ? 'bg-green-500' :
                  analysis.confidence >= 65 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Parsing Analysis Section - Shows sentence parsing breakdown
 * WHO/WHAT/WHERE/ISSUE + main keyword extraction with copy functionality
 */
const ParsingAnalysisSection = ({ record }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [copiedField, setCopiedField] = React.useState(null)

  // Parse the description on-the-fly
  const parsing = React.useMemo(() => {
    if (!record?.description) return null
    try {
      return parseSentence(record.description)
    } catch {
      return null
    }
  }, [record?.description])

  if (!parsing) return null

  const handleCopy = async (text, field) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyAll = async () => {
    const summary = parsing.summary || {}
    const lines = [
      `Description: ${record.description}`,
      ``,
      `--- Parsing Results ---`,
      `WHO: ${summary.who || '-'}`,
      `WHAT: ${summary.what || '-'}`,
      `WHERE: ${summary.where || '-'}`,
      `ISSUE: ${summary.issue || '-'}`,
      `Main Keyword: ${parsing.mainKeyword || '-'} ${parsing.mainKeywordIsSignal ? '(signal word)' : ''}`,
      ``,
      `Filtered Keywords: ${(parsing.filteredKeywords || []).join(', ') || '-'}`,
      `Suggested Category: ${record.location || '-'}`,
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopiedField('all')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const summary = parsing.summary || {}

  const SummaryField = ({ icon: Icon, label, value, fieldKey, color = 'text-surface-600' }) => (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-100/50 transition-colors group">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={12} className={color} />
        <span className="text-xs font-medium text-surface-500 w-12">{label}:</span>
        <span className="text-xs text-surface-800 truncate">{value || '-'}</span>
      </div>
      {value && (
        <button
          onClick={() => handleCopy(value, fieldKey)}
          className={`p-1 rounded transition-all opacity-0 group-hover:opacity-100 ${
            copiedField === fieldKey
              ? 'text-green-600 bg-green-50'
              : 'text-surface-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title="Copy"
        >
          {copiedField === fieldKey ? <Check size={10} /> : <Copy size={10} />}
        </button>
      )}
    </div>
  )

  return (
    <div className="pt-3 border-t border-surface-200/50">
      {/* Compact Header - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors bg-purple-50 hover:bg-purple-100/80"
      >
        <div className="flex items-center gap-2">
          <FileText size={12} className="text-purple-600" />
          <span className="font-medium text-purple-700">Sentence Parsing</span>
          {parsing.mainKeyword && (
            <>
              <span className="text-surface-400">•</span>
              <span className="font-medium text-purple-600">
                "{parsing.mainKeyword}"
                {parsing.mainKeywordIsSignal && (
                  <span className="text-purple-400 ml-1">(signal)</span>
                )}
              </span>
            </>
          )}
        </div>
        <ChevronRight size={14} className={`text-surface-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-surface-50/80 rounded-lg text-xs space-y-3">
          {/* Copy All Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copiedField === 'all'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {copiedField === 'all' ? <Check size={12} /> : <ClipboardCopy size={12} />}
              {copiedField === 'all' ? 'Copied!' : 'Copy All'}
            </button>
          </div>

          {/* Summary Fields */}
          <div className="space-y-0.5 bg-white/60 rounded-lg py-1">
            <SummaryField icon={Users} label="WHO" value={summary.who} fieldKey="who" color="text-blue-500" />
            <SummaryField icon={Target} label="WHAT" value={summary.what} fieldKey="what" color="text-orange-500" />
            <SummaryField icon={MapPinned} label="WHERE" value={summary.where} fieldKey="where" color="text-green-500" />
            <SummaryField icon={AlertTriangle} label="ISSUE" value={summary.issue} fieldKey="issue" color="text-red-500" />
          </div>

          {/* Main Keyword */}
          {parsing.mainKeyword && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200/50">
              <Tag size={12} className="text-purple-600" />
              <span className="text-surface-500">Main Keyword:</span>
              <span className="font-bold text-purple-700">{parsing.mainKeyword}</span>
              {parsing.mainKeywordIsSignal && (
                <span className="px-1.5 py-0.5 bg-purple-200 text-purple-800 rounded text-[10px] font-medium">
                  SIGNAL
                </span>
              )}
            </div>
          )}

          {/* Filtered Keywords */}
          {parsing.filteredKeywords && parsing.filteredKeywords.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-surface-500">
                <MessageSquare size={11} />
                <span>Filtered Keywords (noise removed):</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {parsing.filteredKeywords.slice(0, 15).map((word, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      word === parsing.mainKeyword
                        ? 'bg-purple-200 text-purple-800 font-bold'
                        : 'bg-surface-100 text-surface-600'
                    }`}
                  >
                    {word}
                  </span>
                ))}
                {parsing.filteredKeywords.length > 15 && (
                  <span className="text-surface-400 text-[10px]">
                    +{parsing.filteredKeywords.length - 15} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ambiguity Resolutions */}
          {parsing.ambiguityResolutions && parsing.ambiguityResolutions.length > 0 && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/50">
              <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                <HelpCircle size={11} />
                <span className="font-medium">Ambiguity Resolved:</span>
              </div>
              <div className="space-y-1">
                {parsing.ambiguityResolutions.map((res, idx) => (
                  <p key={idx} className="text-amber-800 text-[10px]">
                    "{res.word}" → <span className="font-medium">{res.context}</span>
                    {res.reason && <span className="text-amber-600"> ({res.reason})</span>}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DrillDownModal
