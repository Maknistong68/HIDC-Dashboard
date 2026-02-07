import React from 'react'
import { X, Calendar, MapPin, User, Building2, AlertCircle, CheckCircle, Clock, ShieldCheck, ShieldAlert, AlertTriangle, ChevronDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { INCIDENT_TYPES, ACTION_STATUSES } from '../../utils/constants'

const ReportModal = ({ record, onClose }) => {
  if (!record) return null

  const typeInfo = INCIDENT_TYPES.find(t => t.value === record.type)
  const statusInfo = ACTION_STATUSES.find(s => s.value === record.actionStatus)

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
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white shadow-xl w-full max-w-2xl transform transition-all rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-200 bg-surface-50">
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 text-xs font-semibold rounded"
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
              <button
                onClick={onClose}
                className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded"
              >
                <X size={18} />
              </button>
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
                      className="px-2 py-0.5 text-xs font-medium rounded"
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
                <div className="bg-surface-50 p-3 border border-surface-200 rounded text-sm text-surface-700 whitespace-pre-wrap leading-relaxed">
                  {record.description || 'No description provided.'}
                </div>
              </div>

              {/* Additional Fields (if any) */}
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
                      <div key={`${item.date}-${item.action}-${index}`} className="flex gap-3 text-sm">
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
                  <span className="text-xs text-surface-400">Reference ID: </span>
                  <span className="text-xs font-mono text-blue-600">{record.externalId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
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
        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors rounded ${badge.bg} hover:opacity-80`}
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
        <div className="mt-1 p-2 bg-surface-50 border border-surface-200 rounded text-xs space-y-1">
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
