import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { Upload, X, FileSpreadsheet, Check, AlertTriangle, Play, CheckCircle2, FolderOpen } from 'lucide-react'
import { useData } from '../../context/DataContext'
import {
  parseExcelFile,
  validateNEOMFormat,
  mapNEOMColumns,
  transformRows,
  checkDuplicates,
} from '../../utils/excelParser'
import { calculateFileHash } from '../../utils/fileHashUtils'
import { checkFileHashExists } from '../../utils/storage'

/**
 * BatchImportModal - Import multiple files at once
 *
 * Features:
 * - Multi-file drag & drop
 * - Progress for each file
 * - Summary of results
 */
const BatchImportModal = ({ onClose }) => {
  const { addIncidentsWithFile, incidents, reloadFiles } = useData()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFileIndex, setCurrentFileIndex] = useState(-1)
  const [results, setResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [processingDetails, setProcessingDetails] = useState({
    step: '',
    progress: 0,
  })

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const isProcessingRef = useRef(false)  // Ref to track processing state (survives re-renders)
  const abortControllerRef = useRef(null)  // For cancelling async operations
  const isMountedRef = useRef(true)  // Track if component is still mounted

  // Cleanup on unmount - abort any pending operations
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Check if folder selection is supported (Chrome/Edge only)
  const isFolderSelectSupported = useMemo(() => {
    return 'webkitdirectory' in document.createElement('input')
  }, [])

  // Safe close handler - prevents closing during processing with user warning
  const handleClose = useCallback(() => {
    if (isProcessingRef.current || isProcessing) {
      console.warn('[BatchImport] Cannot close while processing')
      alert('Import in progress. Please wait for all files to complete.')
      return
    }
    onClose()
  }, [onClose, isProcessing])

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
    if (isProcessingRef.current) return  // Prevent double-processing

    // Create new AbortController for this batch
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    isProcessingRef.current = true
    setIsProcessing(true)
    const newResults = []

    // Track Event IDs imported in this batch session (across all files)
    const batchImportedIds = new Set()

    for (let i = 0; i < selectedFiles.length; i++) {
      // Check if aborted before each file
      if (signal.aborted || !isMountedRef.current) {
        console.log('[BatchImport] Processing aborted')
        break
      }

      // Safe state update - check if still mounted
      if (!isMountedRef.current) break
      setCurrentFileIndex(i)

      // Update status to processing
      if (!isMountedRef.current) break
      setSelectedFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'processing' } : f
      ))

      const { file } = selectedFiles[i]

      try {
        // Step 1: Calculate file hash
        setProcessingDetails({ step: 'Calculating file hash...', progress: 5 })
        const fileHash = await calculateFileHash(file)

        // Step 2: Check for duplicate files
        setProcessingDetails({ step: 'Checking if file already imported...', progress: 10 })
        const existingFile = await checkFileHashExists(fileHash)

        if (existingFile) {
          // File already imported - skip with informative message
          const importDate = existingFile.importedAt
            ? new Date(existingFile.importedAt).toLocaleDateString()
            : 'unknown date'

          setSelectedFiles(prev => prev.map((f, idx) =>
            idx === i ? {
              ...f,
              status: 'duplicate',
              error: `Already imported on ${importDate}`,
              originalFileName: existingFile.fileName
            } : f
          ))

          newResults.push({
            fileName: file.name,
            success: false,
            isFileDuplicate: true,
            error: `Already imported on ${importDate}`,
            originalFileName: existingFile.fileName
          })

          continue // Skip to next file
        }

        // Step 3: Parse Excel file
        setProcessingDetails({ step: 'Reading Excel file...', progress: 20 })
        const data = await parseExcelFile(file)

        // Step 4: Validate format
        setProcessingDetails({ step: 'Validating NEOM format...', progress: 30 })
        const validation = validateNEOMFormat(data.headers)
        if (!validation.valid) {
          throw new Error(`Invalid format: missing ${validation.missing.join(', ')}`)
        }

        // Step 5: Map columns
        setProcessingDetails({ step: 'Mapping columns...', progress: 35 })
        const mappings = mapNEOMColumns(data.headers)

        // Step 6: Transform rows (bulk work)
        setProcessingDetails({ step: 'Cleaning and categorizing data...', progress: 50 })
        const { incidents: transformedIncidents, warnings } = transformRows(
          data.rows,
          data.headers,
          mappings,
          null,
          incidents,
          { classificationMode: 'trust-excel' }
        )

        // Step 7: Check for duplicates within batch
        setProcessingDetails({ step: 'Checking for duplicate records...', progress: 90 })
        const withinBatchSkipped = []
        const filteredIncidents = transformedIncidents.filter(item => {
          if (item.externalId && batchImportedIds.has(item.externalId)) {
            withinBatchSkipped.push({
              ...item,
              _duplicateOf: item.externalId,
              _matchType: 'within_batch'
            })
            return false
          }
          return true
        })

        // Check against existing data (only items not already in this batch)
        const duplicateResults = checkDuplicates(
          filteredIncidents,
          incidents,
          'externalId',
          'skip'
        )

        // Step 8: Save to database
        setProcessingDetails({ step: 'Saving to database...', progress: 95 })
        let result = { recordCount: 0 }
        if (duplicateResults.newRecords.length > 0) {
          result = await addIncidentsWithFile(
            duplicateResults.newRecords,
            { fileName: file.name, fileSize: file.size, fileHash },
            { classificationMode: 'trust-excel', skipReload: true }  // Skip reload during batch to prevent overlapping transactions
          )

          // After successful import, add Event IDs to batch tracker
          duplicateResults.newRecords.forEach(record => {
            if (record.externalId) {
              batchImportedIds.add(record.externalId)
            }
          })
        }

        // Total skipped includes both within-batch and existing data duplicates
        const withinBatchSkippedCount = withinBatchSkipped.length
        const existingDataSkippedCount = duplicateResults.skipped.length
        const skippedCount = existingDataSkippedCount + withinBatchSkippedCount

        // Update status to success
        setSelectedFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'success',
            recordCount: result.recordCount,
            skippedCount,
            withinBatchSkippedCount,
            existingDataSkippedCount
          } : f
        ))

        newResults.push({
          fileName: file.name,
          success: true,
          recordCount: result.recordCount,
          skippedCount,
          withinBatchSkippedCount,
          existingDataSkippedCount,
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

    // Verify completion before showing results
    console.log(`[BatchImport] Batch complete: ${newResults.filter(r => r.success).length} files imported, ${newResults.reduce((sum, r) => sum + (r.recordCount || 0), 0)} total records`)

    // Safe state updates - only if still mounted
    if (isMountedRef.current) {
      setResults(newResults)
      isProcessingRef.current = false
      setIsProcessing(false)
      setIsComplete(true)
      setCurrentFileIndex(-1)
    } else {
      isProcessingRef.current = false
    }

    // Reload files list once at the end of batch import (avoids overlapping transactions)
    // Use silent: true to prevent showing global overlay over the modal
    try {
      if (isMountedRef.current) {
        await reloadFiles({ silent: true })
        console.log('[BatchImport] Files reloaded successfully')
      }
    } catch (error) {
      console.error('[BatchImport] Error reloading files after batch:', error)
    }
  }, [selectedFiles, incidents, addIncidentsWithFile, reloadFiles])

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
  const fileDuplicateCount = results.filter(r => r.isFileDuplicate).length
  const totalRecords = results.reduce((sum, r) => sum + (r.recordCount || 0), 0)
  const totalSkipped = results.reduce((sum, r) => sum + (r.skippedCount || 0), 0)
  const totalWithinBatchSkipped = results.reduce((sum, r) => sum + (r.withinBatchSkippedCount || 0), 0)
  const totalExistingDataSkipped = results.reduce((sum, r) => sum + (r.existingDataSkippedCount || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-processing={isProcessing}>
      {/* Backdrop - disable pointer events during processing */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          isProcessing ? 'pointer-events-none' : ''
        }`}
        onClick={isProcessing ? undefined : handleClose}
      />

      {/* Modal - stop propagation to prevent backdrop clicks */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="flex items-center gap-2">
            {/* Processing lock indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-blue-700">
                  Processing... Do not close
                </span>
              </div>
            )}
            {!isProcessing && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-surface-500" />
              </button>
            )}
          </div>
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
                        item.status === 'duplicate' ? 'bg-amber-50 border border-amber-200' :
                        'bg-surface-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileSpreadsheet
                          size={20}
                          className={
                            item.status === 'success' ? 'text-green-600' :
                            item.status === 'error' ? 'text-red-600' :
                            item.status === 'duplicate' ? 'text-amber-600' :
                            item.status === 'processing' ? 'text-blue-600' :
                            'text-surface-400'
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-surface-800 truncate">
                            {item.file.name}
                          </p>
                          {item.status === 'processing' ? (
                            <div className="mt-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                <span className="text-xs text-blue-700 font-medium truncate">
                                  {processingDetails.step || 'Processing...'}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-200"
                                  style={{ width: `${processingDetails.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-surface-500">
                              {item.status === 'success' ?
                                <>
                                  {item.recordCount?.toLocaleString() || 0} records imported
                                  {item.skippedCount > 0 && (
                                    <span className="text-amber-600 ml-1">
                                      ({item.existingDataSkippedCount > 0 ? `${item.existingDataSkippedCount} existing` : ''}
                                      {item.existingDataSkippedCount > 0 && item.withinBatchSkippedCount > 0 ? ', ' : ''}
                                      {item.withinBatchSkippedCount > 0 ? `${item.withinBatchSkippedCount} in batch` : ''} skipped)
                                    </span>
                                  )}
                                </> :
                              item.status === 'error' ?
                                <span className="text-red-600">{item.error}</span> :
                              item.status === 'duplicate' ?
                                <span className="text-amber-600">{item.error}</span> :
                                `${(item.file.size / 1024).toFixed(1)} KB`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.status === 'success' && (
                          <Check size={20} className="text-green-600" />
                        )}
                        {item.status === 'error' && (
                          <AlertTriangle size={20} className="text-red-600" />
                        )}
                        {item.status === 'duplicate' && (
                          <AlertTriangle size={20} className="text-amber-600" />
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

              <div className="grid gap-4 max-w-lg mx-auto mb-6 grid-cols-2">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                  <p className="text-sm text-green-700">Files imported</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary-600">{totalRecords.toLocaleString()}</p>
                  <p className="text-sm text-primary-700">Records added</p>
                </div>
                {fileDuplicateCount > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-amber-600">{fileDuplicateCount}</p>
                    <p className="text-sm text-amber-700">Files already imported</p>
                  </div>
                )}
                {totalExistingDataSkipped > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-amber-600">{totalExistingDataSkipped.toLocaleString()}</p>
                    <p className="text-sm text-amber-700">Duplicates (existing)</p>
                  </div>
                )}
                {totalWithinBatchSkipped > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-orange-600">{totalWithinBatchSkipped.toLocaleString()}</p>
                    <p className="text-sm text-orange-700">Duplicates (within batch)</p>
                  </div>
                )}
              </div>

              {/* Individual results */}
              <div className="text-left space-y-2 max-h-60 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.fileName}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.success ? 'bg-green-50' :
                      result.isFileDuplicate ? 'bg-amber-50' :
                      'bg-red-50'
                    }`}
                  >
                    {result.success ? (
                      <Check size={18} className="text-green-600 flex-shrink-0" />
                    ) : result.isFileDuplicate ? (
                      <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-surface-800 truncate">{result.fileName}</p>
                      <p className="text-xs text-surface-600">
                        {result.success ? (
                          <>
                            {result.recordCount?.toLocaleString() || 0} records added
                            {result.skippedCount > 0 && (
                              <span className="text-amber-600 ml-1">
                                ({result.existingDataSkippedCount > 0 ? `${result.existingDataSkippedCount} existing` : ''}
                                {result.existingDataSkippedCount > 0 && result.withinBatchSkippedCount > 0 ? ', ' : ''}
                                {result.withinBatchSkippedCount > 0 ? `${result.withinBatchSkippedCount} in batch` : ''} skipped)
                              </span>
                            )}
                          </>
                        ) : result.isFileDuplicate ? (
                          <span className="text-amber-600">{result.error}</span>
                        ) : (
                          <span className="text-red-600">{result.error}</span>
                        )}
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
                onClick={handleClose}
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
              onClick={handleClose}
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
