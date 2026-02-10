import React, { useState, useCallback, useRef, useMemo } from 'react'
import { Upload, FileSpreadsheet, FolderOpen, Check, AlertTriangle, Play, CheckCircle2, X, MapPin } from 'lucide-react'
import { useData } from '../../context/DataContext'
import Logo from '../ui/Logo'
import Footer from '../layout/Footer'
import {
  parseExcelFile,
  validateNEOMFormat,
  mapNEOMColumns,
  transformRows,
  checkDuplicates,
} from '../../utils/excelParser'
import { calculateFileHash } from '../../utils/fileHashUtils'
import { checkFileHashExists } from '../../utils/storage'
import { validateFile, MAX_FILE_SIZE_MB } from '../../utils/fileValidator'

/**
 * OnboardingScreen - Full-page import UI for first-time users
 *
 * Displayed when no data exists in the app. Uses the same header/footer styling
 * as the main Layout, but without navigation tabs. Provides a clean, centered
 * import interface that guides users to import their first file.
 *
 * Once import completes and data exists, this screen is replaced by the normal Layout.
 */
const OnboardingScreen = () => {
  const { addIncidentsWithFile, incidents, reloadFiles, setIsImporting, setIsProcessingBatch, siteClassifications, updateSiteClassificationsBatch } = useData()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFileIndex, setCurrentFileIndex] = useState(-1)
  const [results, setResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [processingDetails, setProcessingDetails] = useState({
    step: '',
    progress: 0,
  })
  const [unassignedSites, setUnassignedSites] = useState([])
  const [assignedRegion, setAssignedRegion] = useState(null)
  const [isAssigning, setIsAssigning] = useState(false)

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const isProcessingRef = useRef(false)

  // Check if folder selection is supported (Chrome/Edge only)
  const isFolderSelectSupported = useMemo(() => {
    return 'webkitdirectory' in document.createElement('input')
  }, [])

  // Handle file selection with security validation
  const handleFileSelect = useCallback(async (event) => {
    const files = Array.from(event.target.files || [])

    // Filter by extension first (quick check)
    const extensionFiltered = files.filter(f =>
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    )

    // Validate each file (size + magic bytes)
    const validatedFiles = []
    for (const file of extensionFiltered) {
      const validation = await validateFile(file)
      if (validation.valid) {
        validatedFiles.push({
          file,
          status: 'pending',
          recordCount: null,
          error: null,
          warnings: validation.warnings
        })
      } else {
        // Add invalid files with error status
        validatedFiles.push({
          file,
          status: 'error',
          recordCount: null,
          error: validation.errors.join('; ')
        })
      }
    }

    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.file.name))
      const newFiles = validatedFiles.filter(f => !existingNames.has(f.file.name))
      return [...prev, ...newFiles]
    })

    event.target.value = ''
  }, [])

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    if (isProcessing) return
    const files = Array.from(e.dataTransfer.files || [])
    const event = { target: { files } }
    handleFileSelect(event)
  }, [handleFileSelect, isProcessing])

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Remove file from list
  const removeFile = (index) => {
    if (isProcessing) return
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle folder selection with security validation
  const handleFolderSelect = useCallback(async (event) => {
    const files = Array.from(event.target.files || [])
    const extensionFiltered = files.filter(f =>
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    )

    if (extensionFiltered.length === 0) {
      alert('No Excel files found in the selected folder')
      event.target.value = ''
      return
    }

    // Validate each file (size + magic bytes)
    const validatedFiles = []
    for (const file of extensionFiltered) {
      const validation = await validateFile(file)
      if (validation.valid) {
        validatedFiles.push({
          file,
          status: 'pending',
          recordCount: null,
          error: null,
          warnings: validation.warnings
        })
      } else {
        validatedFiles.push({
          file,
          status: 'error',
          recordCount: null,
          error: validation.errors.join('; ')
        })
      }
    }

    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.file.name))
      const newFiles = validatedFiles.filter(f => !existingNames.has(f.file.name))
      return [...prev, ...newFiles]
    })

    event.target.value = ''
  }, [])

  // Process all files
  const processFiles = useCallback(async (filesToProcess, existingIncidents) => {
    if (filesToProcess.length === 0) return
    if (isProcessingRef.current) return

    isProcessingRef.current = true
    setIsProcessing(true)
    setIsImporting(true)
    setIsProcessingBatch(true)

    const newResults = []
    const batchImportedIds = new Set()
    let batchAccumulatedIncidents = [...existingIncidents]

    for (let i = 0; i < filesToProcess.length; i++) {
      setCurrentFileIndex(i)

      setSelectedFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'processing' } : f
      ))

      const { file } = filesToProcess[i]

      try {
        setProcessingDetails({ step: 'Calculating file hash...', progress: 5 })
        const fileHash = await calculateFileHash(file)

        setProcessingDetails({ step: 'Checking if file already imported...', progress: 10 })
        const existingFile = await checkFileHashExists(fileHash)

        if (existingFile) {
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

          continue
        }

        setProcessingDetails({ step: 'Reading Excel file...', progress: 20 })
        const data = await parseExcelFile(file)

        setProcessingDetails({ step: 'Validating NEOM format...', progress: 30 })
        const validation = validateNEOMFormat(data.headers)
        if (!validation.valid) {
          throw new Error(`Invalid format: missing ${validation.missing.join(', ')}`)
        }

        setProcessingDetails({ step: 'Mapping columns...', progress: 35 })
        const mappings = mapNEOMColumns(data.headers)

        setProcessingDetails({ step: 'Cleaning and categorizing data...', progress: 50 })
        const { incidents: transformedIncidents, warnings } = transformRows(
          data.rows,
          data.headers,
          mappings,
          null,
          batchAccumulatedIncidents,
          { classificationMode: 'trust-excel' }
        )

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

        const duplicateResults = checkDuplicates(
          filteredIncidents,
          batchAccumulatedIncidents,
          'externalId',
          'skip'
        )

        setProcessingDetails({ step: 'Saving to database...', progress: 95 })
        let result = { recordCount: 0 }
        if (duplicateResults.newRecords.length > 0) {
          result = await addIncidentsWithFile(
            duplicateResults.newRecords,
            { fileName: file.name, fileSize: file.size, fileHash },
            { classificationMode: 'trust-excel', skipReload: true }
          )

          duplicateResults.newRecords.forEach(record => {
            if (record.externalId) {
              batchImportedIds.add(record.externalId)
            }
          })

          batchAccumulatedIncidents = [...batchAccumulatedIncidents, ...duplicateResults.newRecords]
        }

        const withinBatchSkippedCount = withinBatchSkipped.length
        const existingDataSkippedCount = duplicateResults.skipped.length
        const skippedCount = existingDataSkippedCount + withinBatchSkippedCount

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
          warnings,
          newRecords: duplicateResults.newRecords
        })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`[Onboarding] Error processing ${file.name}:`, error)
        }

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

    // Collect unique sites from all successfully imported records
    const importedSites = new Set()
    newResults.forEach(r => {
      if (r.success && r.newRecords) {
        r.newRecords.forEach(rec => {
          if (rec.site) importedSites.add(rec.site)
        })
      }
    })

    // Find sites without subregion assignment
    const unassigned = [...importedSites].filter(site => !siteClassifications[site])
    setUnassignedSites(unassigned)

    setResults(newResults)
    isProcessingRef.current = false
    setIsProcessing(false)
    // NOTE: Don't clear isProcessingBatch here - wait for handleDone
    setIsComplete(true)
    setCurrentFileIndex(-1)
  }, [addIncidentsWithFile, setIsImporting, setIsProcessingBatch, siteClassifications])

  // Handle Done button - reload data to trigger transition to main app
  const handleDone = useCallback(async () => {
    setIsReloading(true)
    try {
      await reloadFiles({ silent: true })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Onboarding] Error reloading files:', error)
      }
    } finally {
      setIsReloading(false)
      setIsImporting(false)
      setIsProcessingBatch(false)  // Only clear after Done - allows transition to Dashboard
    }
  }, [reloadFiles, setIsImporting, setIsProcessingBatch])

  // Handle subregion assignment for imported sites
  const handleAssignSubregion = useCallback(async (subRegion) => {
    setIsAssigning(true)
    try {
      const assignments = unassignedSites.map(name => ({ name, subRegion }))
      await updateSiteClassificationsBatch(assignments)
      setAssignedRegion(subRegion)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Onboarding] Error assigning subregion:', error)
      }
    } finally {
      setIsAssigning(false)
    }
  }, [unassignedSites, updateSiteClassificationsBatch])

  // Summary stats
  const successCount = results.filter(r => r.success).length
  const fileDuplicateCount = results.filter(r => r.isFileDuplicate).length
  const totalRecords = results.reduce((sum, r) => sum + (r.recordCount || 0), 0)
  const totalWithinBatchSkipped = results.reduce((sum, r) => sum + (r.withinBatchSkippedCount || 0), 0)
  const totalExistingDataSkipped = results.reduce((sum, r) => sum + (r.existingDataSkippedCount || 0), 0)

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Frosted Glass Header - matches Layout.jsx */}
      <header className="fixed top-0 left-0 right-0 h-14 glass border-b border-surface-200/50 shadow-soft z-50 safe-area-top">
        <div className="h-full px-4 flex items-center max-w-[1800px] mx-auto">
          <Logo size="default" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          {/* Import card */}
          <div className="bg-white rounded-xl shadow-lg border border-surface-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-surface-200 bg-surface-50/50">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Upload size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">
                {isComplete ? 'Import Complete' : 'Import Data'}
              </h2>
              <p className="text-sm text-surface-500">
                {isComplete
                  ? `${successCount} of ${results.length} files imported`
                  : 'Upload Excel files to begin'}
              </p>
            </div>
            {isProcessing && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-blue-700">Processing...</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {!isComplete ? (
              <>
                {/* Drop zone */}
                <div
                  className={`border-2 border-dashed border-surface-300 rounded-lg p-8 text-center transition-colors mb-4 ${
                    isProcessing
                      ? 'opacity-50 pointer-events-none'
                      : 'hover:border-primary-400 hover:bg-primary-50/30 cursor-pointer'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                >
                  <Upload size={40} className="mx-auto text-surface-400 mb-4" />
                  <p className="text-surface-700 font-medium mb-1">
                    Drop Excel files here
                  </p>
                  <p className="text-sm text-surface-500 mb-4">
                    or click to browse
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <FileSpreadsheet size={16} />
                      Select Files
                    </button>

                    {isFolderSelectSupported && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          folderInputRef.current?.click()
                        }}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <FolderOpen size={16} />
                        Select Folder
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-surface-400 mt-4">
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
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-surface-700">
                      Selected Files ({selectedFiles.length})
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
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
                              <p className="font-medium text-surface-800 truncate text-sm">
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
                                          ({item.skippedCount} skipped)
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
                            {item.status === 'success' && <Check size={18} className="text-green-600" />}
                            {item.status === 'error' && <AlertTriangle size={18} className="text-red-600" />}
                            {item.status === 'duplicate' && <AlertTriangle size={18} className="text-amber-600" />}
                            {item.status === 'pending' && !isProcessing && (
                              <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-surface-200 rounded transition-colors"
                              >
                                <X size={14} className="text-surface-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import button */}
                {selectedFiles.length > 0 && (
                  <button
                    onClick={() => processFiles(selectedFiles, incidents)}
                    disabled={isProcessing || selectedFiles.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
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
                )}
              </>
            ) : (
              /* Results summary */
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>

                <h3 className="text-xl font-semibold text-surface-900 mb-4">
                  You&apos;re all set!
                </h3>

                <div className="grid gap-3 mb-6 grid-cols-2">
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
                      <p className="text-sm text-amber-700">Already imported</p>
                    </div>
                  )}
                  {(totalExistingDataSkipped + totalWithinBatchSkipped) > 0 && (
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-amber-600">
                        {(totalExistingDataSkipped + totalWithinBatchSkipped).toLocaleString()}
                      </p>
                      <p className="text-sm text-amber-700">Duplicates skipped</p>
                    </div>
                  )}
                </div>

                {/* Subregion assignment - only show if unassigned sites exist */}
                {unassignedSites.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200 text-left">
                    {assignedRegion ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <Check size={18} />
                        <span>Assigned {unassignedSites.length} site{unassignedSites.length !== 1 ? 's' : ''} to Sub Region {assignedRegion.slice(-1)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={18} className="text-amber-600" />
                          <span className="font-medium text-amber-800">
                            Assign {unassignedSites.length} new site{unassignedSites.length !== 1 ? 's' : ''} to subregion:
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              onClick={() => handleAssignSubregion(`SUB REGION ${n}`)}
                              disabled={isAssigning}
                              className="w-10 h-10 rounded-lg bg-white border-2 border-amber-300
                                         hover:border-amber-500 hover:bg-amber-100 font-bold text-amber-700
                                         disabled:opacity-50 transition-colors"
                            >
                              {n}
                            </button>
                          ))}
                          <button
                            onClick={() => setUnassignedSites([])}
                            disabled={isAssigning}
                            className="px-3 py-2 text-surface-600 hover:text-surface-800 disabled:opacity-50"
                          >
                            Skip
                          </button>
                        </div>
                        <p className="text-xs text-amber-600 mt-2">
                          {unassignedSites.slice(0, 3).join(', ')}
                          {unassignedSites.length > 3 && ` +${unassignedSites.length - 3} more`}
                        </p>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={handleDone}
                  disabled={isReloading || isAssigning}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isReloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading dashboard...
                    </>
                  ) : (
                    'Go to Dashboard'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        </div>
      </main>

      {/* Footer - matches Layout.jsx */}
      <Footer />
    </div>
  )
}

export default OnboardingScreen
