import { useState, useCallback } from 'react'
import { exportToPDF } from '../utils/export/pdfExport'
import { exportToPPTX } from '../utils/export/pptxExport'

/**
 * Custom hook for managing export state and operations
 */
export const useExport = (dashboardRef, chartRefs, filters, incidents = []) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)
  const [exportError, setExportError] = useState(null)

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return

    setIsExporting(true)
    setExportError(null)

    try {
      // Use single dashboard ref for full page capture
      await exportToPDF(dashboardRef, filters, incidents, setExportProgress)
    } catch (error) {
      console.error('PDF export failed:', error)
      setExportError('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }, [dashboardRef, filters, incidents, isExporting])

  const handleExportPPTX = useCallback(async () => {
    if (isExporting) return

    setIsExporting(true)
    setExportError(null)

    try {
      // PowerPoint still uses individual chart refs
      await exportToPPTX(chartRefs, filters, incidents, setExportProgress)
    } catch (error) {
      console.error('PPTX export failed:', error)
      setExportError('Failed to export PowerPoint. Please try again.')
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }, [chartRefs, filters, incidents, isExporting])

  const clearError = useCallback(() => {
    setExportError(null)
  }, [])

  return {
    isExporting,
    exportProgress,
    exportError,
    handleExportPDF,
    handleExportPPTX,
    clearError,
  }
}
