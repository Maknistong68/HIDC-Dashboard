import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BatchImportModal from '../components/fileManager/BatchImportModal'

const Import = () => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(true)

  const handleClose = () => {
    setShowModal(false)
    navigate('/')
  }

  // Show modal on mount
  useEffect(() => {
    setShowModal(true)
  }, [])

  return showModal ? <BatchImportModal onClose={handleClose} /> : null
}

export default Import
