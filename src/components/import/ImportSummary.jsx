import React from 'react'
import { CheckCircle, Plus, RefreshCw, SkipForward, AlertTriangle, Calendar, Copy } from 'lucide-react'
import { format } from 'date-fns'

const ImportSummary = ({ results, onGoToDashboard, onImportMore }) => {
  const {
    incidentsAdded = 0,
    incidentsUpdated = 0,
    skipped = 0,
    skippedRecords = [],
    duplicateDetails = [],
    failed = 0,
  } = results

  const totalProcessed = incidentsAdded + incidentsUpdated + skipped
  const hasErrors = failed > 0

  return (
    <div className="space-y-6">
      {/* Success/Warning Banner */}
      <div className={`p-6 rounded-xl text-center ${hasErrors ? 'bg-orange-50' : 'bg-green-50'}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          hasErrors ? 'bg-orange-100' : 'bg-green-100'
        }`}>
          {hasErrors ? (
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-600" />
          )}
        </div>
        <h2 className={`text-2xl font-bold ${hasErrors ? 'text-orange-800' : 'text-green-800'}`}>
          {hasErrors ? 'Import Completed with Warnings' : 'Import Successful!'}
        </h2>
        <p className={`mt-2 ${hasErrors ? 'text-orange-600' : 'text-green-600'}`}>
          {totalProcessed} records processed
        </p>
        <p className="text-sm text-surface-500 mt-1">
          <Calendar className="w-4 h-4 inline mr-1" />
          {format(new Date(), 'MMMM d, yyyy HH:mm')}
        </p>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{incidentsAdded}</p>
          <p className="text-sm text-green-700">Records Added</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{incidentsUpdated}</p>
          <p className="text-sm text-blue-700">Status Updated</p>
        </div>

        <div className="bg-surface-50 border border-surface-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <SkipForward className="w-5 h-5 text-surface-600" />
          </div>
          <p className="text-2xl font-bold text-surface-600">{skipped}</p>
          <p className="text-sm text-surface-700">Skipped</p>
        </div>
      </div>

      {/* Errors Section */}
      {failed > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">{failed} records failed to import</p>
              <p className="text-sm text-red-600 mt-1">
                Some records could not be imported due to invalid data or errors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What's Next */}
      <div className="bg-surface-50 rounded-lg p-6">
        <h3 className="font-semibold text-surface-900 mb-4">What's Next?</h3>
        <ul className="space-y-3 text-sm text-surface-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Review imported data in the All Data page</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Check if any corrective actions need attention</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Dashboard has been updated with the latest data</span>
          </li>
        </ul>
      </div>

      {/* Skipped Duplicates Section - Full View */}
      {skipped > 0 && (skippedRecords.length > 0 || duplicateDetails.length > 0) && (
        <div className="border border-surface-200 rounded-xl overflow-hidden">
          {/* Section Header */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Copy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-lg">
                    Skipped Duplicates
                  </h3>
                  <p className="text-sm text-amber-700">
                    {skipped} records matched existing data and were not imported
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-600">{skipped}</span>
                <p className="text-xs text-amber-600">duplicates</p>
              </div>
            </div>
          </div>

          {/* Detection Method Info */}
          <div className="bg-amber-50/50 px-6 py-3 border-b border-amber-100">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Detection method:</span> Records matched by{' '}
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">Exact ID</span>{' '}
              or by{' '}
              <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs font-medium">Similarity</span>{' '}
              (date ±1 day + contractor 70% + description 85%)
            </p>
          </div>

          {/* Table */}
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-surface-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider">
                    Record from File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider">
                    Match Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider">
                    Existing Record ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 bg-white">
                {(skippedRecords.length > 0 ? skippedRecords : duplicateDetails.filter(d => d.action === 'skipped').map(d => d.item))
                  .slice(0, 100)
                  .map((record) => (
                    <tr key={record.externalId || record.id || `${record.date}-${record.contractor}`} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-sm text-surface-800 truncate max-w-md">
                            {record.externalId || 'No ID'}
                          </span>
                          <span className="text-xs text-surface-500">
                            {record.date} • {record.contractor || 'Unknown contractor'}
                          </span>
                          {record.description && (
                            <span className="text-xs text-surface-400 truncate max-w-md">
                              {record.description.substring(0, 80)}...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          record._matchType === 'exact_id'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {record._matchType === 'exact_id' ? (
                            'Exact ID Match'
                          ) : (
                            <>{Math.round((record._similarity || 0.85) * 100)}% Similar</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-surface-600">
                          {record._duplicateOf || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {skipped > 100 && (
            <div className="bg-surface-50 px-6 py-3 border-t border-surface-200">
              <p className="text-sm text-surface-600 text-center">
                Showing 100 of {skipped} skipped records
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onGoToDashboard}
          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
        >
          Go to Dashboard
        </button>
        <button
          onClick={onImportMore}
          className="flex-1 px-6 py-3 border border-surface-200 text-surface-700 rounded-lg hover:bg-surface-50 font-medium transition-colors"
        >
          Import More Data
        </button>
      </div>
    </div>
  )
}

export default ImportSummary
