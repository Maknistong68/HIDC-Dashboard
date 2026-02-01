import React, { useState, useCallback, useRef } from 'react'
import { Upload, FileSpreadsheet, X, AlertCircle, ShieldCheck, Plus } from 'lucide-react'

const FileUpload = ({ onFileSelect, isLoading, multiple = true }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const addMoreInputRef = useRef(null)

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

    const files = Array.from(e.dataTransfer.files)
    if (files && files.length > 0) {
      // If not multiple mode, only take first file
      const filesToProcess = multiple ? files : [files[0]]
      const validFiles = []

      for (const file of filesToProcess) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
        validFiles.push(file)
      }

      setSelectedFiles(validFiles)
      onFileSelect(validFiles)
    }
  }, [onFileSelect, multiple])

  const handleFileInput = (e) => {
    setError(null)
    const files = Array.from(e.target.files)

    if (files.length > 0) {
      const validFiles = []

      for (const file of files) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
        validFiles.push(file)
      }

      setSelectedFiles(validFiles)
      onFileSelect(validFiles)
    }
  }

  const clearFiles = () => {
    setSelectedFiles([])
    setError(null)
  }

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    if (newFiles.length > 0) {
      onFileSelect(newFiles)
    }
  }

  const handleAddMoreFiles = (e) => {
    setError(null)
    const newFiles = Array.from(e.target.files)

    if (newFiles.length > 0) {
      for (const file of newFiles) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
      }

      // Combine with existing files (avoid duplicates by name)
      const existingNames = new Set(selectedFiles.map(f => f.name))
      const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name))
      const combinedFiles = [...selectedFiles, ...uniqueNewFiles]

      setSelectedFiles(combinedFiles)
      onFileSelect(combinedFiles)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0)

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
            : selectedFiles.length > 0
              ? 'border-green-500 bg-green-50'
              : 'border-surface-200 hover:border-surface-400'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {selectedFiles.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
            </div>
            {selectedFiles.length === 1 ? (
              <>
                <p className="font-medium text-surface-900">{selectedFiles[0].name}</p>
                <p className="text-sm text-surface-500 mt-1">
                  {(selectedFiles[0].size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-surface-900">{selectedFiles.length} files selected</p>
                <p className="text-sm text-surface-500 mt-1">
                  Total: {(totalSize / 1024).toFixed(1)} KB
                </p>
                <div className="mt-3 max-h-32 overflow-y-auto w-full">
                  {selectedFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between text-sm py-1 px-2 hover:bg-green-100 rounded">
                      <span className="text-surface-700 truncate flex-1">{file.name}</span>
                      {!isLoading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(selectedFiles.indexOf(file)); }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            {!isLoading && (
              <div className="mt-3 flex items-center gap-4">
                {multiple && (
                  <>
                    <button
                      onClick={() => addMoreInputRef.current?.click()}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={16} />
                      Add more files
                    </button>
                    <input
                      ref={addMoreInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleAddMoreFiles}
                      multiple
                      className="hidden"
                    />
                  </>
                )}
                <button
                  onClick={clearFiles}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                  {selectedFiles.length === 1 ? 'Remove file' : 'Remove all'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-lg font-medium text-surface-700">
              Drag and drop your Excel {multiple ? 'files' : 'file'} here
            </p>
            <p className="text-sm text-surface-500 mt-1">
              or click to browse
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              multiple={multiple}
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
        <p>Maximum file size: 10MB {multiple && '• Multiple files supported'}</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-surface-400 mt-2">
        <ShieldCheck size={14} className="text-green-500" />
        <span>Your data stays local. No data is collected or sent to any server.</span>
      </div>
    </div>
  )
}

export default FileUpload
