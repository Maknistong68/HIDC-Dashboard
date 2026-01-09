import React, { useState, useMemo } from 'react'
import { X, ChevronRight, ChevronLeft, Eye, Calendar, Building2, MapPin, User, AlertCircle, CheckCircle, Clock, Download, Copy, Check, AlertTriangle, Database, Sparkles, ShieldCheck, ShieldAlert, Brain, Target, Zap, HelpCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import jsPDF from 'jspdf'
import { analyzeObservation } from '../../utils/contextClassifier'

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
  breadcrumb = []
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null)

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Container - Glassmorphism */}
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col animate-modal-in">
        {/* Glass Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200/50 bg-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {canGoBack && (
                  <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-gray-100/80 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  {breadcrumb.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      {breadcrumb.map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1">
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
                className="p-2 rounded-xl hover:bg-gray-100/80 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {type === 'monthly' && (
              <MonthlyBreakdown
                data={data}
                onSelect={onDrillDown}
              />
            )}

            {type === 'monthly-breakdown' && (
              <MonthlyQualityBreakdown
                data={data}
                onViewObservations={() => onDrillDown && onDrillDown(data.observations)}
              />
            )}

            {type === 'records' && (
              <RecordsTable
                data={data}
                onViewDetails={setSelectedRecord}
              />
            )}
          </div>

          {/* Footer hint */}
          <div className="px-6 py-3 border-t border-gray-200/50 bg-white/30">
            <p className="text-xs text-gray-400 text-center">
              {type === 'monthly' ? 'Click a period to view observations' :
               type === 'monthly-breakdown' ? 'Click metrics to see contributing observations' :
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
      `}</style>
    </div>
  )
}

/**
 * Monthly Breakdown View
 */
const MonthlyBreakdown = ({ data, onSelect }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data available for this selection
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div
          key={item.period || idx}
          onClick={() => onSelect(item)}
          className="group flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-gray-200/50"
        >
          <div className="w-20 text-sm font-medium text-gray-700">
            {item.label}
          </div>
          <div className="flex-1 h-8 bg-gray-100/80 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-12 text-right">
            <span className="text-lg font-bold text-gray-900">{item.count}</span>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      ))}
    </div>
  )
}

/**
 * Monthly Quality Breakdown View
 * Shows detailed metric breakdown with formulas for a specific month
 */
const MonthlyQualityBreakdown = ({ data, onViewObservations }) => {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
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
    <div className="p-3 rounded-xl bg-white/60 border border-gray-200/50 hover:bg-white/80 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-500" />}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-sm font-bold border ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      <div className="text-xs text-gray-500 font-mono bg-gray-100/80 px-2 py-1 rounded">
        {formula}
      </div>
      {details && (
        <div className="mt-2 text-xs text-gray-600">
          {details}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <div className="text-3xl font-bold text-gray-900">{data.qualityScore}%</div>
        <div className="text-sm text-gray-600">Overall Quality Score</div>
        <div className="text-xs text-gray-500 mt-1">Based on {data.totalObservations} observations</div>
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
const RecordsTable = ({ data, onViewDetails }) => {
  const [copied, setCopied] = useState(false)

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No observations found
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'in-progress':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  // Export data for analysis - formats records for Claude to analyze
  const handleCopyForAnalysis = () => {
    const exportData = data.slice(0, 50).map((record, idx) => {
      // Calculate confidence for each record
      const analysis = analyzeObservation(record.description, record.originalHazardCategory || record.location)
      return `${idx + 1}. [${analysis.confidence}%] ${record.location || 'Unknown'}\n   "${record.description || 'No description'}"`
    }).join('\n\n')

    const header = `=== LOW CONFIDENCE OBSERVATIONS (${Math.min(50, data.length)} of ${data.length}) ===\nFormat: [Confidence%] Category\n"Description"\n\n`

    navigator.clipboard.writeText(header + exportData)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-2">
      {/* Copy for Analysis Button */}
      <div className="flex justify-end mb-3">
        <button
          onClick={handleCopyForAnalysis}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied! Paste to Claude' : `Copy ${Math.min(50, data.length)} for Analysis`}
        </button>
      </div>
      {data.map((record, idx) => (
        <div
          key={record.externalId || idx}
          className="group p-4 rounded-xl bg-white/60 border border-gray-200/50 hover:bg-white/80 hover:border-gray-300/50 transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {record.date}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(record.actionStatus)}`}>
                  {record.actionStatus || 'open'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {record.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {record.contractor && (
                  <span className="flex items-center gap-1">
                    <Building2 size={12} />
                    {record.contractor}
                  </span>
                )}
                {record.site && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {record.site}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onViewDetails(record)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye size={14} />
              View
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
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let y = margin

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
    pdf.setFontSize(9)
    pdf.setTextColor(107, 114, 128)
    pdf.text(formatDate(record.date), pageWidth - margin, 12, { align: 'right' })

    // Type badge
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(59, 130, 246)
    pdf.text((record.type || 'observation').toUpperCase(), margin, 20)
    y = 28

    // Contractor/Site subheader
    if (record.contractor || record.site) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(55, 65, 81)
      const subParts = [record.contractor, record.site].filter(Boolean)
      pdf.text(subParts.join(' - '), pageWidth / 2, y, { align: 'center' })
      y = 38
    } else {
      y = 35
    }

    // Divider
    pdf.setDrawColor(229, 231, 235)
    pdf.setLineWidth(0.5)
    pdf.line(margin, y - 5, pageWidth - margin, y - 5)

    // Details Section
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(55, 65, 81)
    pdf.text('DETAILS', margin, y)
    y += 8

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

    // Description
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(55, 65, 81)
    pdf.text('DESCRIPTION', margin, y)
    y += 6
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(55, 65, 81)
    y = addWrappedText(record.description || 'No description provided.', margin, y, contentWidth, 5)
    y += 8

    // Additional Info
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
    }

    // Footer
    const footerY = 280
    pdf.setDrawColor(229, 231, 235)
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5)
    pdf.setFontSize(8)
    pdf.setTextColor(156, 163, 175)
    pdf.text('HIDC Dashboard Export', margin, footerY)
    pdf.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth - margin, footerY, { align: 'right' })
    if (record.externalId) {
      pdf.text(`Reference: ${record.externalId}`, margin, footerY + 4)
    }

    pdf.save(`Observation-${record.date || 'report'}.pdf`)
  }

  const statusInfo = getStatusInfo(record.actionStatus)
  const StatusIcon = statusInfo.icon

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Darker backdrop for nested modal */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto animate-modal-in">
        <div className="bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  {record.type?.toUpperCase() || 'OBSERVATION'}
                </span>
                <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download size={14} />
                  PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100/80 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <DetailField icon={Calendar} label="Date" value={formatDate(record.date)} />
              <DetailField icon={Building2} label="Contractor" value={record.contractor} />
              <DetailField icon={MapPin} label="Site" value={record.site} />
              <DetailField icon={AlertCircle} label="Hazard Category" value={record.location} />
              <DetailField icon={User} label="Reported By" value={record.reportedBy} />

              {/* Status with icon */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Description
              </div>
              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {record.description || 'No description provided.'}
              </div>
            </div>

            {/* Additional Info - excluding root cause */}
            {(record.bodyPart || record.correctiveAction) && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Additional Information
                </div>
                <div className="space-y-2">
                  {record.bodyPart && (
                    <div className="flex gap-2 text-sm">
                      <span className="font-medium text-gray-500">Body Part:</span>
                      <span className="text-gray-900">{record.bodyPart}</span>
                    </div>
                  )}
                  {record.correctiveAction && (
                    <div className="flex gap-2 text-sm">
                      <span className="font-medium text-gray-500">Corrective Action:</span>
                      <span className="text-gray-900">{record.correctiveAction}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data Quality Section */}
            <DataQualitySection record={record} />

            {/* Context Analysis Section - Classification Reasoning */}
            <ContextAnalysisSection record={record} />

            {/* Reference ID with Copy Button */}
            {record.externalId && (
              <div className="pt-4 border-t border-gray-200/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Reference: {record.externalId}</span>
                  <button
                    onClick={handleCopyEventId}
                    className={`p-1.5 rounded transition-all ${
                      copied
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
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
    </div>
  )
}

/**
 * Detail Field Component
 */
const DetailField = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
      {Icon && <Icon size={12} />}
      {label}
    </div>
    <div className="text-sm text-gray-900">{value || '-'}</div>
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

  // Compact status indicator
  const getStatusBadge = () => {
    if (hasIssue) {
      return { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Review Needed' }
    }
    if (!isValidated) {
      return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Unverified' }
    }
    return { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', label: 'Verified' }
  }

  const badge = getStatusBadge()
  const BadgeIcon = badge.icon

  return (
    <div className="pt-3 border-t border-gray-200/50">
      {/* Compact Header - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${badge.bg} hover:opacity-80`}
      >
        <div className="flex items-center gap-2">
          <BadgeIcon size={12} className={badge.color} />
          <span className={`font-medium ${badge.color}`}>{badge.label}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">
            {isFromExcel ? 'From Excel' : 'Auto-classified'}
            {record.originalHazardCategory && record.originalHazardCategory !== record.location &&
              ` (was "${record.originalHazardCategory}")`
            }
          </span>
        </div>
        <ChevronRight size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-2 bg-gray-50/80 rounded-lg text-xs space-y-1">
          {record.dataQualityIssue && (
            <p className="text-gray-600">{record.dataQualityIssue}</p>
          )}
          <p className="text-gray-500">
            {isValidated
              ? `Description contains "${record.location}" keywords`
              : `No "${record.location}" keywords found in description`
            }
          </p>
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
    <div className="pt-3 border-t border-gray-200/50">
      {/* Compact Header - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors bg-blue-50 hover:bg-blue-100/80`}
      >
        <div className="flex items-center gap-2">
          <Brain size={12} className="text-blue-600" />
          <span className="font-medium text-blue-700">Classification Reasoning</span>
          <span className="text-gray-400">•</span>
          <span className={`font-medium ${confidenceStyle.color}`}>
            {analysis.confidence}% {confidenceStyle.label}
          </span>
        </div>
        <ChevronRight size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50/80 rounded-lg text-xs space-y-3">
          {/* Reasoning text */}
          <div className="flex items-start gap-2">
            <HelpCircle size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 leading-relaxed">{analysis.reasoning}</p>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-2 gap-2">
            {analysis.hazardObject && (
              <div className="flex items-center gap-1.5">
                <Target size={11} className="text-purple-500" />
                <span className="text-gray-500">Object:</span>
                <span className="text-gray-800 font-medium">{analysis.hazardObject}</span>
              </div>
            )}
            {analysis.action && (
              <div className="flex items-center gap-1.5">
                <Zap size={11} className="text-orange-500" />
                <span className="text-gray-500">Action:</span>
                <span className="text-gray-800 font-medium">{analysis.action}</span>
              </div>
            )}
          </div>

          {/* Potential Outcome */}
          {analysis.potentialOutcome && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-200/50">
              <AlertTriangle size={11} className="text-red-500" />
              <span className="text-gray-500">Potential Outcome:</span>
              <span className="text-gray-800 font-medium">{analysis.potentialOutcome}</span>
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
          <div className="pt-2 border-t border-gray-200/50">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>Confidence Level</span>
              <span className={confidenceStyle.color}>{analysis.confidence}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
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

export default DrillDownModal
