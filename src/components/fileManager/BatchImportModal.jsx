import React, { useState, useCallback, useRef, useMemo } from 'react'
import { Upload, X, FileSpreadsheet, Check, AlertTriangle, Play, CheckCircle2, FolderOpen } from 'lucide-react'
import { useData } from '../../context/DataContext'
import {
  parseExcelFile,
  validateNEOMFormat,
  mapNEOMColumns,
  transformRows,
} from '../../utils/excelParser'

/**
 * BatchImportModal - Import multiple files at once
 *
 * Features:
 * - Multi-file drag & drop
 * - Progress for each file
 * - Summary of results
 */
const BatchImportModal = ({ onClose }) => {
  const { addIncidentsWithFile, incidents } = useData()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFileIndex, setCurrentFileIndex] = useState(-1)
  const [results, setResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  // Check if folder selection is supported (Chrome/Edge only)
  const isFolderSelectSupported = useMemo(() => {
    return 'webkitdirectory' in document.createElement('input')
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(f =>
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    )

    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const newFiles = validFiles.filter(f => !existingNames.has(f.name))
      return [...prev, ...newFiles.map(f => ({
        file: f,
        status: 'pending', // pending | processing | success | error
        recordCount: null,
        error: null
      }))]
    })

    // Reset input
    event.target.value = ''
  }, [])

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files || [])
    const event = { target: { files } }
    handleFileSelect(event)
  }, [handleFileSelect])

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Remove file from list
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Process all files
  const processFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    const newResults = []

    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentFileIndex(i)

      // Update status to processing
      setSelectedFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'processing' } : f
      ))

      const { file } = selectedFiles[i]

      try {
        // Parse file
        const data = await parseExcelFile(file)

        // Validate format
        const validation = validateNEOMFormat(data.headers)
        if (!validation.valid) {
          throw new Error(`Invalid format: missing ${validation.missing.join(', ')}`)
        }

        // Map columns
        const mappings = mapNEOMColumns(data.headers)

        // Transform rows
        const { incidents: transformedIncidents, warnings } = transformRows(
          data.rows,
          data.headers,
          mappings,
          null,
          incidents,
          { classificationMode: 'trust-excel' }
        )

        // Save to database
        const result = await addIncidentsWithFile(
          transformedIncidents,
          { fileName: file.name, fileSize: file.size },
          { classificationMode: 'trust-excel' }
        )

        // Update status to success
        setSelectedFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'success',
            recordCount: result.recordCount
          } : f
        ))

        newResults.push({
          fileName: file.name,
          success: true,
          recordCount: result.recordCount,
          warnings
        })
      } catch (error) {
        // Update status to error
        setSelectedFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'error',
            error: error.message
          } : f
        ))

        newResults.push({
          fileName: file.name,
          success: false,
          error: error.message
        })
      }
    }

    setResults(newResults)
    setIsProcessing(false)
    setIsComplete(true)
    setCurrentFileIndex(-1)
  }, [selectedFiles, incidents, addIncidentsWithFile])

  // Trigger file input
  const handleBrowse = () => {
    fileInputRef.current?.click()
  }

  // Trigger folder input
  const handleFolderBrowse = () => {
    folderInputRef.current?.click()
  }

  // Handle folder selection
  const handleFolderSelect = useCallback((event) => {
    const files = Array.from(event.target.files || [])
    // Filter only Excel files from the folder
    const validFiles = files.filter(f =>
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    )

    if (validFiles.length === 0) {
      alert('No Excel files found in the selected folder')
      event.target.value = ''
      return
    }

    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const newFiles = validFiles.filter(f => !existingNames.has(f.name))
      return [...prev, ...newFiles.map(f => ({
        file: f,
        status: 'pending',
        recordCount: null,
        error: null
      }))]
    })

    event.target.value = ''
  }, [])

  // Summary stats
  const successCount = results.filter(r => r.success).length
  const totalRecords = results.reduce((sum, r) => sum + (r.recordCount || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Upload size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">
                {isComplete ? 'Import Complete' : 'Batch Import'}
              </h2>
              <p className="text-sm text-surface-500">
                {isComplete ?
                  `${successCount} of ${results.length} files imported` :
                  'Import multiple Excel files at once'
                }
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-surface-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isComplete ? (
            <>
              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-surface-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-colors mb-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload size={36} className="mx-auto text-surface-400 mb-3" />
                <p className="text-surface-700 font-medium mb-1">
                  Drop Excel files here
                </p>
                <p className="text-sm text-surface-500 mb-4">
                  or use the buttons below
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleBrowse}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                  >
                    <FileSpreadsheet size={16} />
                    Select Files
                  </button>

                  {isFolderSelectSupported && (
                    <button
                      type="button"
                      onClick={handleFolderBrowse}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors text-sm font-medium"
                    >
                      <FolderOpen size={16} />
                      Select Folder
                    </button>
                  )}
                </div>

                <p className="text-xs text-surface-400 mt-3">
                  Supports .xlsx and .xls files
                  {isFolderSelectSupported && ' • Folder selection imports all Excel files'}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Folder input (Chrome/Edge only) */}
              {isFolderSelectSupported && (
                <input
                  ref={folderInputRef}
                  type="file"
                  webkitdirectory=""
                  onChange={handleFolderSelect}
                  className="hidden"
                />
              )}

              {/* File list */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-surface-700 mb-2">
                    Selected Files ({selectedFiles.length})
                  </p>
                  {selectedFiles.map((item, index) => (
                    <div
                      key={item.file.name}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.status === 'processing' ? 'bg-blue-50 border border-blue-200' :
                        item.status === 'success' ? 'bg-green-50 border border-green-200' :
                        item.status === 'error' ? 'bg-red-50 border border-red-200' :
                        'bg-surface-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileSpreadsheet
                          size={20}
                          className={
                            item.status === 'success' ? 'text-green-600' :
                            item.status === 'error' ? 'text-red-600' :
                            item.status === 'processing' ? 'text-blue-600' :
                            'text-surface-400'
                          }
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-surface-800 truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-surface-500">
                            {item.status === 'success' && item.recordCount ?
                              `${item.recordCount.toLocaleString()} records imported` :
                            item.status === 'error' ?
                              <span className="text-red-600">{item.error}</span> :
                            item.status === 'processing' ?
                              'Processing...' :
                              `${(item.file.size / 1024).toFixed(1)} KB`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'processing' && (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {item.status === 'success' && (
                          <Check size={20} className="text-green-600" />
                        )}
                        {item.status === 'error' && (
                          <AlertTriangle size={20} className="text-red-600" />
                        )}
                        {item.status === 'pending' && !isProcessing && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-surface-200 rounded transition-colors"
                          >
                            <X size={16} className="text-surface-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Results summary */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>

              <h3 className="text-xl font-semibold text-surface-900 mb-2">
                Import Complete
              </h3>

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                  <p className="text-sm text-green-700">Files imported</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary-600">{totalRecords.toLocaleString()}</p>
                  <p className="text-sm text-primary-700">Records added</p>
                </div>
              </div>

              {/* Individual results */}
              <div className="text-left space-y-2 max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.success ? (
                      <Check size={18} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-surface-800 truncate">{result.fileName}</p>
                      <p className="text-xs text-surface-600">
                        {result.success ?
                          `${result.recordCount?.toLocaleString()} records` :
                          result.error
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-surface-200 bg-surface-50 rounded-b-xl">
          {!isComplete ? (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-surface-700 font-medium hover:bg-surface-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={processFiles}
                disabled={isProcessing || selectedFiles.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importing ({currentFileIndex + 1}/{selectedFiles.length})
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Import {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BatchImportModal
