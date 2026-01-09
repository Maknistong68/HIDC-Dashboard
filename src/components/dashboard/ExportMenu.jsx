import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Download, FileText, Presentation } from 'lucide-react'
import { LoadingSpinner, ProgressBar } from '../ui'

/**
 * ExportMenu - Export dropdown with PDF and PowerPoint options
 */
const ExportMenu = ({ onExportPDF, onExportPPTX, isExporting, exportProgress }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown when export starts
  useEffect(() => {
    if (isExporting) {
      setIsOpen(false)
    }
  }, [isExporting])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  const handlePDFClick = () => {
    setIsOpen(false)
    onExportPDF()
  }

  const handlePPTXClick = () => {
    setIsOpen(false)
    onExportPPTX()
  }

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      {/* Export button */}
      <button
        onClick={() => !isExporting && setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 ease-out
          ${isExporting
            ? 'bg-surface-100 text-surface-400 cursor-wait'
            : 'bg-white border border-surface-300 text-surface-700 hover:bg-surface-50 hover:border-surface-400 hover:shadow-sm'
          }
        `}
        aria-label={isExporting ? 'Exporting...' : 'Export options'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {isExporting ? (
          <LoadingSpinner size="xs" color="gray" />
        ) : (
          <Download size={16} aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && !isExporting && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-medium border border-surface-200 py-1.5 z-50 animate-fade-in-down"
          role="menu"
          aria-orientation="vertical"
        >
          <button
            onClick={handlePDFClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
            role="menuitem"
          >
            <div className="p-1.5 bg-red-50 rounded">
              <FileText size={16} className="text-safety-critical" aria-hidden="true" />
            </div>
            <div className="text-left">
              <span className="block font-medium">Export as PDF</span>
              <span className="block text-xs text-surface-500">A3 landscape format</span>
            </div>
          </button>
          <button
            onClick={handlePPTXClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
            role="menuitem"
          >
            <div className="p-1.5 bg-orange-50 rounded">
              <Presentation size={16} className="text-safety-warning" aria-hidden="true" />
            </div>
            <div className="text-left">
              <span className="block font-medium">Export as PowerPoint</span>
              <span className="block text-xs text-surface-500">Slide deck with charts</span>
            </div>
          </button>
        </div>
      )}

      {/* Progress indicator */}
      {isExporting && exportProgress && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-medium border border-surface-200 p-4 z-50 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <LoadingSpinner size="small" color="primary" />
            <div>
              <p className="text-sm font-medium text-surface-700">Exporting...</p>
              <p className="text-xs text-surface-500 truncate">{exportProgress}</p>
            </div>
          </div>
          <ProgressBar value={50} variant="primary" size="small" animate />
        </div>
      )}
    </div>
  )
}

export default ExportMenu
