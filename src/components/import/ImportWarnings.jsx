import React, { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, X, Calendar, Tag } from 'lucide-react'

const ImportWarnings = ({ warnings, onDismiss }) => {
  const [expanded, setExpanded] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)

  if (!warnings) return null

  const dateCount = warnings.dateIssues?.length || 0
  const hazardCount = warnings.hazardIssues?.length || 0
  const totalCount = dateCount + hazardCount

  if (totalCount === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-amber-900">
              {totalCount} import warning{totalCount !== 1 ? 's' : ''}
            </span>
            {dateCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full">
                {dateCount} date
              </span>
            )}
            {hazardCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full">
                {hazardCount} hazard
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900"
          >
            {expanded ? 'Hide' : 'Details'}
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-amber-200 space-y-3">
          {/* Date Issues */}
          {dateCount > 0 && (
            <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'date' ? null : 'date')}
                className="w-full flex items-center justify-between p-3 hover:bg-amber-50"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm text-surface-900">
                    Date Parsing Issues ({dateCount})
                  </span>
                </div>
                {expandedSection === 'date' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection === 'date' && (
                <div className="border-t border-amber-200 max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-amber-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium text-surface-600">Row</th>
                        <th className="text-left p-2 font-medium text-surface-600">Original</th>
                        <th className="text-left p-2 font-medium text-surface-600">Parsed As</th>
                        <th className="text-left p-2 font-medium text-surface-600">Event ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warnings.dateIssues.slice(0, 50).map((issue, idx) => (
                        <tr key={idx} className="border-t border-amber-100">
                          <td className="p-2 text-surface-700">{issue.row}</td>
                          <td className="p-2 text-red-600 font-mono">{issue.original}</td>
                          <td className="p-2 text-amber-600 font-mono">{issue.parsedAs}</td>
                          <td className="p-2 text-surface-500 truncate max-w-[150px]">{issue.eventId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dateCount > 50 && (
                    <div className="p-2 text-xs text-center text-surface-500 bg-amber-50">
                      Showing first 50 of {dateCount} issues
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hazard Issues */}
          {hazardCount > 0 && (
            <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'hazard' ? null : 'hazard')}
                className="w-full flex items-center justify-between p-3 hover:bg-amber-50"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm text-surface-900">
                    Auto-Classified Hazards ({hazardCount})
                  </span>
                </div>
                {expandedSection === 'hazard' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection === 'hazard' && (
                <div className="border-t border-amber-200 max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-amber-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium text-surface-600">Row</th>
                        <th className="text-left p-2 font-medium text-surface-600">Original</th>
                        <th className="text-left p-2 font-medium text-surface-600">Classified As</th>
                        <th className="text-left p-2 font-medium text-surface-600">Event ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warnings.hazardIssues.slice(0, 50).map((issue, idx) => (
                        <tr key={idx} className="border-t border-amber-100">
                          <td className="p-2 text-surface-700">{issue.row}</td>
                          <td className="p-2 text-surface-500 italic">{issue.original}</td>
                          <td className="p-2 text-blue-600">{issue.autoClassified}</td>
                          <td className="p-2 text-surface-500 truncate max-w-[150px]">{issue.eventId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {hazardCount > 50 && (
                    <div className="p-2 text-xs text-center text-surface-500 bg-amber-50">
                      Showing first 50 of {hazardCount} issues
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-amber-700">
            These records were imported but may need review. Date issues used today's date as fallback.
          </p>
        </div>
      )}
    </div>
  )
}

export default ImportWarnings
