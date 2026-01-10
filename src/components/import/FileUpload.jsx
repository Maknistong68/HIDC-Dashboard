import React, { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X, AlertCircle, ShieldCheck } from 'lucide-react'

const FileUpload = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragOut = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    const validExtensions = ['.xlsx', '.xls']

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      return 'Please select an Excel file (.xlsx or .xls)'
    }

    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const validationError = validateFile(file)

      if (validationError) {
        setError(validationError)
        return
      }

      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleFileInput = (e) => {
    setError(null)
    const file = e.target.files[0]

    if (file) {
      const validationError = validateFile(file)

      if (validationError) {
        setError(validationError)
        return
      }

      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-surface-200 hover:border-surface-400'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-medium text-surface-900">{selectedFile.name}</p>
            <p className="text-sm text-surface-500 mt-1">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            {!isLoading && (
              <button
                onClick={clearFile}
                className="mt-3 flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X size={16} />
                Remove file
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-lg font-medium text-surface-700">
              Drag and drop your Excel file here
            </p>
            <p className="text-sm text-surface-500 mt-1">
              or click to browse
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span className="text-surface-600">Processing file...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="text-sm text-surface-500">
        <p>Supported formats: .xlsx, .xls (Excel files)</p>
        <p>Maximum file size: 10MB</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-surface-400 mt-2">
        <ShieldCheck size={14} className="text-green-500" />
        <span>Your data stays local. No data is collected or sent to any server.</span>
      </div>
    </div>
  )
}

export default FileUpload
