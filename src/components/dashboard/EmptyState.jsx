import { memo, useState } from 'react'
import { FileSpreadsheet, Lightbulb, Upload } from 'lucide-react'
import BatchImportModal from '../fileManager/BatchImportModal'
import { Card } from '../ui'

/**
 * EmptyState - Dashboard placeholder when no data is loaded
 * Wrapped in React.memo to prevent unnecessary re-renders
 */
const EmptyState = memo(({ onImportComplete }) => {
  const [showImportModal, setShowImportModal] = useState(false)

  const handleClose = () => {
    setShowImportModal(false)
    if (onImportComplete) {
      onImportComplete()
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Helpful Tip */}
      <div className="flex items-center gap-3 text-sm text-surface-600 bg-primary-50/50 border border-primary-100 px-4 py-3 rounded-lg">
        <div className="flex-shrink-0 p-1.5 bg-primary-100 rounded-full">
          <Lightbulb size={16} className="text-primary-600" aria-hidden="true" />
        </div>
        <p>
          <span className="font-medium">Tip:</span> Format dates as{' '}
          <code className="px-1.5 py-0.5 bg-white rounded text-primary-700 font-mono text-xs">
            DD/MM/YYYY
          </code>{' '}
          before importing for best results
        </p>
      </div>

      {/* Import Card */}
      <Card padding="large" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-surface-200">
          <div className="p-2.5 bg-primary-50 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-800">Import Excel Data</h2>
            <p className="text-sm text-surface-500">Upload your HSE observation data to get started</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-primary-500" />
          </div>
          <p className="text-surface-600 mb-6">
            Import Excel files containing your HSE observation data
          </p>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Upload size={20} />
            Import Files
          </button>
          <p className="text-xs text-surface-400 mt-4">
            Supports .xlsx and .xls files. Drag-drop multiple files or select a folder.
          </p>
        </div>
      </Card>

      {showImportModal && (
        <BatchImportModal onClose={handleClose} />
      )}
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState
