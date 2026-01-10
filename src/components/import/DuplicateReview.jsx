import React from 'react'
import { Plus, RefreshCw, SkipForward, ArrowRight } from 'lucide-react'

const DuplicateReview = ({ results, onProceed }) => {
  const { newRecords, updates, skipped } = results

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{newRecords.length}</p>
              <p className="text-sm text-green-700">New Records</p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Will be added to the database</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{updates.length}</p>
              <p className="text-sm text-blue-700">Status Updates</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">Existing records with status changes</p>
        </div>

        <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center">
              <SkipForward className="w-5 h-5 text-surface-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-600">{skipped.length}</p>
              <p className="text-sm text-surface-700">Skipped</p>
            </div>
          </div>
          <p className="text-xs text-surface-600 mt-2">Already exist with no changes</p>
        </div>
      </div>

      {/* Status Updates Preview */}
      {updates.length > 0 && (
        <div className="border border-surface-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-surface-200">
            <h4 className="font-medium text-surface-900">Status Updates Preview</h4>
            <p className="text-sm text-surface-600">These records will have their status updated</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-surface-600">Event ID</th>
                  <th className="px-4 py-2 text-left font-medium text-surface-600">Current Status</th>
                  <th className="px-4 py-2 text-center font-medium text-surface-600"></th>
                  <th className="px-4 py-2 text-left font-medium text-surface-600">New Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {updates.slice(0, 20).map((update, index) => (
                  <tr key={index} className="hover:bg-surface-50">
                    <td className="px-4 py-2 font-mono text-surface-700">
                      {update.existing.externalId?.substring(0, 30) || update.existing.id}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        update.existing.actionStatus === 'closed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {update.existing.actionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <ArrowRight className="w-4 h-4 text-surface-400 mx-auto" />
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        update.changes.actionStatus === 'closed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {update.changes.actionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {updates.length > 20 && (
              <p className="px-4 py-2 text-sm text-surface-500 bg-surface-50">
                And {updates.length - 20} more...
              </p>
            )}
          </div>
        </div>
      )}

      {/* New Records Preview */}
      {newRecords.length > 0 && (
        <div className="border border-surface-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-surface-200">
            <h4 className="font-medium text-surface-900">New Records Preview</h4>
            <p className="text-sm text-surface-600">These records will be added</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-surface-600">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-surface-600">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-surface-600">Description</th>
                  <th className="px-4 py-2 text-left font-medium text-surface-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {newRecords.slice(0, 20).map((record, index) => (
                  <tr key={index} className="hover:bg-surface-50">
                    <td className="px-4 py-2 text-surface-700">{record.date}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 text-xs bg-surface-100 text-surface-700 rounded">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-surface-700 max-w-xs truncate">
                      {record.description?.substring(0, 50)}...
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        record.actionStatus === 'closed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {record.actionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {newRecords.length > 20 && (
              <p className="px-4 py-2 text-sm text-surface-500 bg-surface-50">
                And {newRecords.length - 20} more...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {newRecords.length === 0 && updates.length === 0 && (
        <div className="text-center py-8 bg-surface-50 rounded-lg border border-surface-200">
          <SkipForward className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-600">No changes to make</p>
          <p className="text-sm text-surface-500 mt-1">
            All {skipped.length} records already exist with the same status
          </p>
        </div>
      )}
    </div>
  )
}

export default DuplicateReview
