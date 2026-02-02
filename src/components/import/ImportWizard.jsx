import React, { useState, useCallback, useRef } from 'react'
import { Check, Upload, Settings, CheckCircle, AlertTriangle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import FileUpload from './FileUpload'
import ImportOptions, { getImportOptions } from './ImportOptions'
import ImportSummary from './ImportSummary'
import {
  parseExcelFile,
  validateNEOMFormat,
  mapNEOMColumns,
  transformRows,
  checkDuplicates,
  deduplicateWithinBatch,
  NEOM_REQUIRED_COLUMNS,
} from '../../utils/excelParser'

// Simplified 3-step flow: Upload → Options → Complete
const STEPS = [
  { id: 1, name: 'Upload', icon: Upload },
  { id: 2, name: 'Options', icon: Settings },
  { id: 3, name: 'Complete', icon: CheckCircle },
]

const ImportWizard = ({ onComplete, onCancel, mode = 'inline', showHeader = true }) => {
  const {
    incidents,
    addIncidentsWithFile,
    updateIncident,
    recordImportWarnings,
    recordImportStats
  } = useData()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Step 1: File data (combined from all files)
  const [fileData, setFileData] = useState(null)
  const [fileNames, setFileNames] = useState([])
  const fileSizeRef = useRef(0)

  // NEOM format validation
  const [formatValidation, setFormatValidation] = useState(null)
  const [columnMappings, setColumnMappings] = useState({})

  // Transformed data ready for import
  const [transformedData, setTransformedData] = useState(null)

  // Step 3: Import results
  const [importResults, setImportResults] = useState(null)

  // Track warnings from transformation
  const [importWarnings, setImportWarnings] = useState(null)

  // Handle file selection - validates NEOM format and auto-maps columns
  // Now accepts array of files for bulk import
  const handleFileSelect = useCallback(async (files) => {
    setIsProcessing(true)
    setFormatValidation(null)

    // Ensure files is an array
    const fileArray = Array.isArray(files) ? files : [files]
    setFileNames(fileArray.map(f => f.name))
    fileSizeRef.current = fileArray.reduce((sum, f) => sum + f.size, 0)

    try {
      // Parse all files
      const allParsedData = await Promise.all(fileArray.map(file => parseExcelFile(file)))

      // Validate first file for NEOM format (all files should have same format)
      const validation = validateNEOMFormat(allParsedData[0].headers)
      setFormatValidation(validation)

      if (!validation.valid) {
        setIsProcessing(false)
        return
      }

      // Validate all files have compatible headers
      for (let i = 1; i < allParsedData.length; i++) {
        const otherValidation = validateNEOMFormat(allParsedData[i].headers)
        if (!otherValidation.valid) {
          setFormatValidation({
            valid: false,
            missing: otherValidation.missing,
            message: `File "${fileArray[i].name}" has invalid format`
          })
          setIsProcessing(false)
          return
        }
      }

      // Combine all rows from all files
      const combinedHeaders = allParsedData[0].headers
      const combinedRows = allParsedData.flatMap(data => data.rows)

      const combinedData = {
        headers: combinedHeaders,
        rows: combinedRows,
        totalRows: combinedRows.length,
        fileCount: fileArray.length
      }

      setFileData(combinedData)

      // Auto-map NEOM columns by header name
      const mappings = mapNEOMColumns(combinedHeaders)
      setColumnMappings(mappings)

      // Go to step 2 (Options)
      setCurrentStep(2)
    } catch (error) {
      console.error('Error parsing files:', error)
      alert('Error parsing files: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Execute import with selected options - now uses file tracking
  const executeImport = useCallback(async (importOptions) => {
    if (!fileData || !columnMappings) return

    setIsProcessing(true)

    try {
      // Transform rows using import options for classification mode
      const { incidents: transformedIncidents, warnings } =
        transformRows(fileData.rows, fileData.headers, columnMappings, null, incidents, importOptions)

      // Store warnings for later
      setImportWarnings(warnings)
      setTransformedData(transformedIncidents)

      // Step 1: Deduplicate within batch first (removes duplicates across files in same import)
      const { unique: uniqueIncidents, withinBatchDuplicates, withinBatchDuplicateCount } =
        deduplicateWithinBatch(transformedIncidents, 'externalId')

      // Step 2: Check against existing data (only unique items from batch)
      const duplicateResults = checkDuplicates(
        uniqueIncidents,
        incidents,
        'externalId',
        importOptions.duplicateHandling
      )

      // Combine skip counts from both within-batch and existing data duplicates
      const allSkippedRecords = [...duplicateResults.skipped, ...withinBatchDuplicates]

      let incidentsAdded = 0
      let incidentsUpdated = 0
      let failed = 0

      // Add new incidents with file tracking
      if (duplicateResults.newRecords.length > 0) {
        try {
          const displayFileName = fileNames.length > 1
            ? `${fileNames.length} files (${fileNames.join(', ')})`
            : fileNames[0]
          const result = await addIncidentsWithFile(
            duplicateResults.newRecords,
            {
              fileName: displayFileName,
              fileSize: fileSizeRef.current
            },
            importOptions
          )
          incidentsAdded = result.recordCount
        } catch (error) {
          console.error('Error adding incidents:', error)
          failed = duplicateResults.newRecords.length
        }
      }

      // Update existing incidents (when duplicateHandling is 'update')
      for (const update of duplicateResults.updates) {
        try {
          await updateIncident(update.existing.id, update.changes)
          incidentsUpdated++
        } catch {
          failed++
        }
      }

      const displayFileName = fileNames.length > 1
        ? `${fileNames.length} files`
        : fileNames[0]

      // Total skipped includes both within-batch and existing data duplicates
      const totalSkipped = duplicateResults.skipped.length + withinBatchDuplicateCount

      const results = {
        incidentsAdded,
        incidentsUpdated,
        skipped: totalSkipped,
        skippedRecords: allSkippedRecords, // Pass full skipped records with duplicate info
        duplicateDetails: duplicateResults.duplicateDetails || [], // Pass detailed duplicate info
        withinBatchDuplicateCount, // Track within-batch duplicates separately
        failed,
        fileName: displayFileName,
        fileNames, // Include all file names
        fileCount: fileNames.length,
      }

      setImportResults(results)

      // Record warnings and stats in context
      if (warnings) {
        recordImportWarnings(warnings)
      }
      recordImportStats({
        added: incidentsAdded,
        updated: incidentsUpdated,
        skipped: totalSkipped,
        failed,
        warningCount: (warnings?.dateIssues?.length || 0) + (warnings?.hazardIssues?.length || 0),
        fileName: displayFileName,
      })

      setCurrentStep(3) // Go to Complete
    } catch (error) {
      console.error('Error during import:', error)
      alert('Error during import: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [fileData, columnMappings, incidents, fileNames, addIncidentsWithFile, updateIncident, recordImportWarnings, recordImportStats])

  const resetWizard = () => {
    setCurrentStep(1)
    setFileData(null)
    setFileNames([])
    fileSizeRef.current = 0
    setColumnMappings({})
    setTransformedData(null)
    setImportResults(null)
    setImportWarnings(null)
    setFormatValidation(null)
  }

  const handleGoToDashboard = () => {
    if (onComplete) {
      onComplete({ results: importResults, warnings: importWarnings })
    }
  }

  const handleImportMore = () => {
    resetWizard()
  }

  const handleCancelFromOptions = () => {
    // Go back to step 1
    setCurrentStep(1)
    setFileData(null)
    setFileNames([])
    fileSizeRef.current = 0
    setFormatValidation(null)
  }

  // Container styling based on mode
  const containerClass = mode === 'modal' ? '' : 'max-w-4xl mx-auto'

  return (
    <div className={containerClass}>
      {/* Header - only show in inline mode when showHeader is true */}
      {mode === 'inline' && showHeader && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-surface-900">Import Excel Data</h2>
          <p className="text-surface-500">Import observations from your official HSE system</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-colors
                  ${currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-surface-200 text-surface-500'
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check size={20} />
                  ) : (
                    <step.icon size={20} />
                  )}
                </div>
                <span className={`text-xs mt-2 ${
                  currentStep >= step.id ? 'text-surface-900' : 'text-surface-500'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-surface-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 min-h-[400px]">
        {/* Step 1: Upload File */}
        {currentStep === 1 && (
          <>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isProcessing} />

            {/* NEOM Format Validation Error */}
            {formatValidation && !formatValidation.valid && (
              <div className="mt-6 bg-red-50 border border-red-300 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-red-800 font-bold text-sm">Invalid File Format</h4>
                    <p className="text-red-700 text-sm mt-1">
                      This file does not match the NEOM Event Report format.
                    </p>
                    <p className="text-red-600 text-xs mt-3 font-medium">Missing columns:</p>
                    <ul className="text-red-600 text-xs mt-1 space-y-0.5">
                      {formatValidation.missing.map(col => (
                        <li key={col}>• {col}</li>
                      ))}
                    </ul>
                    <p className="text-red-600 text-xs mt-3 font-medium">Required NEOM columns:</p>
                    <ul className="text-red-500 text-xs mt-1 space-y-0.5">
                      {NEOM_REQUIRED_COLUMNS.map(col => (
                        <li key={col}>• {col}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Import Options */}
        {currentStep === 2 && fileData && (
          <ImportOptions
            fileName={fileNames.length > 1 ? `${fileNames.length} files` : fileNames[0]}
            fileNames={fileNames}
            recordCount={fileData.totalRows}
            onImport={executeImport}
            onCancel={handleCancelFromOptions}
            isProcessing={isProcessing}
          />
        )}

        {/* Step 3: Complete */}
        {currentStep === 3 && importResults && (
          <ImportSummary
            results={importResults}
            warnings={importWarnings}
            onGoToDashboard={handleGoToDashboard}
            onImportMore={handleImportMore}
          />
        )}
      </div>

      {/* Navigation Buttons - Only show on Step 1 if there's a cancel handler */}
      {currentStep === 1 && onCancel && (
        <div className="flex justify-start mt-6">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-surface-200 text-surface-700 rounded-lg hover:bg-surface-50 font-medium"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default ImportWizard
