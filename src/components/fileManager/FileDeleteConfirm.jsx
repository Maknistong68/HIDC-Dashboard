import { useState } from 'react'
import { AlertTriangle, FileSpreadsheet, Trash2, X } from 'lucide-react'

/**
 * FileDeleteConfirm - Confirmation modal for file deletion
 *
 * Shows impact (number of records that will be deleted) and requires
 * confirmation before proceeding.
 */
const FileDeleteConfirm = ({ file, recordCount, onConfirm, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Delete failed:', error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-surface-900">Delete File</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-surface-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg mb-4">
            <FileSpreadsheet size={24} className="text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-surface-800 truncate">{file.fileName}</p>
              <p className="text-sm text-surface-500">
                {recordCount.toLocaleString()} observation{recordCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium mb-2">This action cannot be undone</p>
            <p className="text-red-700 text-sm">
              Deleting this file will permanently remove{' '}
              <strong>{recordCount.toLocaleString()}</strong> observation record
              {recordCount !== 1 ? 's' : ''} from the dashboard.
            </p>
          </div>

          {/* Impact summary */}
          <div className="space-y-2 text-sm text-surface-600">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              All chart data from this file will be removed
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Historical trends will be updated
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              File metadata will be deleted
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-surface-200 bg-surface-50 rounded-b-xl">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-surface-700 font-medium hover:bg-surface-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileDeleteConfirm
