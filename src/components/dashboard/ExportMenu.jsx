import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, FileText, Presentation, Loader2 } from 'lucide-react'

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

  const handlePDFClick = () => {
    setIsOpen(false)
    onExportPDF()
  }

  const handlePPTXClick = () => {
    setIsOpen(false)
    onExportPPTX()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* 3-dot vertical button */}
      <button
        onClick={() => !isExporting && setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg transition-colors
          ${isExporting
            ? 'bg-gray-100 cursor-wait'
            : 'bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer'
          }
        `}
        title={isExporting ? 'Exporting...' : 'Export options'}
      >
        {isExporting ? (
          <Loader2 size={18} className="animate-spin text-gray-500" />
        ) : (
          <MoreVertical size={18} className="text-gray-600" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && !isExporting && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handlePDFClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText size={16} className="text-red-500" />
            <span>Export as PDF (A3)</span>
          </button>
          <button
            onClick={handlePPTXClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Presentation size={16} className="text-orange-500" />
            <span>Export as PowerPoint</span>
          </button>
        </div>
      )}

      {/* Progress indicator (shown when exporting) */}
      {isExporting && exportProgress && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-blue-500 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate">{exportProgress}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportMenu
