import React, { memo } from 'react'
import ModalPortal from './ModalPortal'
import { X, Calendar, MapPin, User, Building2, AlertCircle, CheckCircle, Clock, AlertTriangle, FileText, Briefcase, FileSpreadsheet } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { INCIDENT_TYPES } from '../../utils/constants'

const ReportModal = ({ record, onClose }) => {
  if (!record) return null

  const typeInfo = INCIDENT_TYPES.find(t => t.value === record.type)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <ModalPortal isOpen={true}>
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
              {/* All Fields */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="field">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                    <Calendar size={12} />
                    Date
                  </div>
                  <div className="text-sm text-surface-900">{formatDate(record.date)}</div>
                </div>

                {record.eventTime && (
                  <div className="field">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                      <Clock size={12} />
                      Time
                    </div>
                    <div className="text-sm text-surface-900">{record.eventTime}</div>
                  </div>
                )}

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

                {record.company && (
                  <div className="field">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                      <Briefcase size={12} />
                      Company
                    </div>
                    <div className="text-sm text-surface-900">{record.company}</div>
                  </div>
                )}

                <div className="field">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                    <AlertCircle size={12} />
                    Hazard Category
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-surface-900">{record.location || '-'}</span>
                    {record.hazardCategorySource && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${record.hazardCategorySource === 'excel' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {record.hazardCategorySource === 'excel' ? 'Excel' : 'Auto'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="field">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                    <User size={12} />
                    Reported By
                  </div>
                  <div className="text-sm text-surface-900">{record.reportedBy || '-'}</div>
                </div>

                <div className="field">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                    <CheckCircle size={12} />
                    Approval
                  </div>
                  <div className="text-sm text-surface-900">{record.approvalStatus || '-'}</div>
                </div>

                {record.consequence && (
                  <div className="field">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                      <AlertTriangle size={12} />
                      Consequence
                    </div>
                    <div className="text-sm text-surface-900">{record.consequence}</div>
                  </div>
                )}

                {record.workRelated != null && (
                  <div className="field">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                      <Briefcase size={12} />
                      Work-Related
                    </div>
                    <div className="text-sm text-surface-900">{record.workRelated ? 'Yes' : 'No'}</div>
                  </div>
                )}

                {record.bodyPart && (
                  <div className="field">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                      <User size={12} />
                      Body Part
                    </div>
                    <div className="text-sm text-surface-900">{record.bodyPart}</div>
                  </div>
                )}

                <div className="field">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                    <FileSpreadsheet size={12} />
                    Original Type
                  </div>
                  <div className="text-sm text-surface-900">{record.originalType || record.type || '-'}</div>
                </div>

                {record.originalClassification && (
                  <div className="field">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                      <FileText size={12} />
                      Original Classification
                    </div>
                    <div className="text-sm text-surface-900">{record.originalClassification}</div>
                  </div>
                )}

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
    </ModalPortal>
  )
}

export default memo(ReportModal)
