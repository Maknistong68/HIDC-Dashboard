import React from 'react'
import { FileWarning, ShieldAlert, CheckCircle2 } from 'lucide-react'
import Modal from './Modal'
import { Button } from '../ui'

/**
 * ExportConfirmDialog - Pre-export confirmation dialog
 * Reminds users to verify data accuracy before exporting and sharing
 */
const ExportConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  exportType = 'PDF', // 'PDF', 'PowerPoint', 'Report'
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getExportTypeInfo = () => {
    switch (exportType) {
      case 'PowerPoint':
        return {
          icon: FileWarning,
          title: 'Export PowerPoint Presentation',
          description: 'presentation',
        }
      case 'Report':
        return {
          icon: FileWarning,
          title: 'Export Event Report',
          description: 'report',
        }
      default:
        return {
          icon: FileWarning,
          title: 'Export PDF Report',
          description: 'report',
        }
    }
  }

  const info = getExportTypeInfo()
  const Icon = info.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={info.title}
      size="sm"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <div className="py-4">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-amber-50 animate-scale-in">
          <ShieldAlert className="w-8 h-8 text-amber-600" aria-hidden="true" />
        </div>

        {/* Main Message */}
        <h3 className="text-center text-lg font-semibold text-surface-800 mb-3">
          Review Before Exporting
        </h3>

        <p className="text-center text-surface-600 text-sm leading-relaxed mb-4">
          Please review the data in this {info.description} before exporting and sharing.
        </p>

        {/* Checklist */}
        <div className="bg-surface-50 rounded-lg p-4 space-y-2.5 mb-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-surface-600">
              Review all data for accuracy before sharing
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-surface-600">
              Use Event IDs to verify against source records
            </span>
          </div>
        </div>

        {/* Info Note */}
        <p className="text-xs text-surface-500 text-center italic">
          A review reminder will be included in the exported file.
        </p>
      </div>

      {/* Actions */}
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          loading={loading}
          className="flex-1"
        >
          I Understand, Export
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ExportConfirmDialog
