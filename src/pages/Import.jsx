import React from 'react'
import { useNavigate } from 'react-router-dom'
import ImportWizard from '../components/import/ImportWizard'

const Import = () => {
  const navigate = useNavigate()

  const handleComplete = () => {
    navigate('/')
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <ImportWizard
      mode="inline"
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

export default Import
