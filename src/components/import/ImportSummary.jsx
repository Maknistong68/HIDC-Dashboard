import React from 'react'
import { CheckCircle, Plus, RefreshCw, SkipForward, AlertTriangle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const ImportSummary = ({ results, onGoToDashboard, onImportMore }) => {
  const {
    incidentsAdded = 0,
    incidentsUpdated = 0,
    skipped = 0,
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
        <p className="text-sm text-gray-500 mt-1">
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

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <SkipForward className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-600">{skipped}</p>
          <p className="text-sm text-gray-700">Skipped</p>
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
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
        <ul className="space-y-3 text-sm text-gray-600">
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
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Import More Data
        </button>
      </div>
    </div>
  )
}

export default ImportSummary
