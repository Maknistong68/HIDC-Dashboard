import React from 'react'
import { FileSpreadsheet, Info } from 'lucide-react'
import ImportWizard from '../import/ImportWizard'

const EmptyState = ({ onImportComplete }) => {
  return (
    <div className="space-y-4">
      {/* Minimal Tip */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
        <Info size={16} className="text-gray-400" />
        <span>Tip: Format dates as <strong>DD/MM/YYYY</strong> before importing for best results</span>
      </div>

      {/* Import Wizard */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">Import Excel Data</h2>
            <p className="text-xs text-gray-500">Upload your HSE observation data to get started</p>
          </div>
        </div>

        <ImportWizard
          mode="inline"
          showHeader={false}
          onComplete={onImportComplete}
          onCancel={null}
        />
      </div>
    </div>
  )
}

export default EmptyState
