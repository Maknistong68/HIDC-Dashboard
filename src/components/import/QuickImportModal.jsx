import React from 'react'
import Modal from '../common/Modal'
import ImportWizard from './ImportWizard'

const QuickImportModal = ({ isOpen, onClose }) => {
  const handleComplete = () => {
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Excel Data"
      size="xl"
    >
      <ImportWizard
        mode="modal"
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </Modal>
  )
}

export default QuickImportModal
