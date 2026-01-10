import React, { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, Upload, GitCompare, CheckCircle, AlertTriangle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import FileUpload from './FileUpload'
import DuplicateReview from './DuplicateReview'
import ImportSummary from './ImportSummary'
import {
  parseExcelFile,
  validateNEOMFormat,
  mapNEOMColumns,
  transformRows,
  checkDuplicates,
  NEOM_REQUIRED_COLUMNS,
} from '../../utils/excelParser'

// Simplified steps - no column mapping needed
const STEPS = [
  { id: 1, name: 'Upload File', icon: Upload },
  { id: 2, name: 'Review', icon: GitCompare },
  { id: 3, name: 'Complete', icon: CheckCircle },
]

const ImportWizard = ({ onComplete, onCancel, mode = 'inline', showHeader = true }) => {
  const { incidents, addIncident, updateIncident, recordImportWarnings, recordImportStats } = useData()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Step 1: File data
  const [fileData, setFileData] = useState(null)

  // NEOM format validation
  const [formatValidation, setFormatValidation] = useState(null)
  const [columnMappings, setColumnMappings] = useState({})

  // Step 2: Duplicate check results
  const [duplicateResults, setDuplicateResults] = useState(null)

  // Step 3: Import results
  const [importResults, setImportResults] = useState(null)

  // Track warnings from transformation
  const [importWarnings, setImportWarnings] = useState(null)

  // Handle file selection - validates NEOM format and auto-maps columns
  const handleFileSelect = useCallback(async (file) => {
    setIsProcessing(true)
    setFormatValidation(null)
    try {
      const data = await parseExcelFile(file)
      setFileData(data)

      // Validate NEOM format
      const validation = validateNEOMFormat(data.headers)
      setFormatValidation(validation)

      if (validation.valid) {
        // Auto-map NEOM columns by header name
        const mappings = mapNEOMColumns(data.headers)
        setColumnMappings(mappings)

        // Process data immediately and go to review step
        processDataWithMappings(data, mappings)
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Process data with auto-mapped NEOM columns
  const processDataWithMappings = useCallback((data, mappings) => {
    try {
      // Transform rows using NEOM column mappings
      const { incidents: transformedIncidents, warnings } =
        transformRows(data.rows, data.headers, mappings, null)

      // Store warnings for later
      setImportWarnings(warnings)

      // Go directly to duplicate check (step 2)
      performDuplicateCheck(transformedIncidents)
    } catch (error) {
      console.error('Error processing data:', error)
      alert('Error processing data: ' + error.message)
    }
  }, [])

  // Perform duplicate check
  const performDuplicateCheck = useCallback((incidentsToCheck) => {
    // Check for duplicates against existing incidents
    const incidentResults = checkDuplicates(incidentsToCheck, incidents, 'externalId')

    setDuplicateResults({
      incidents: incidentResults,
      newRecords: incidentResults.newRecords,
      updates: incidentResults.updates,
      skipped: incidentResults.skipped
    })

    setCurrentStep(2) // Step 2 is now Review (was step 3)
  }, [incidents])

  // Execute import
  const executeImport = useCallback(async () => {
    if (!duplicateResults) return

    setIsProcessing(true)

    try {
      let incidentsAdded = 0
      let incidentsUpdated = 0
      let failed = 0

      // Add new incidents
      for (const incident of duplicateResults.incidents.newRecords) {
        try {
          addIncident({
            ...incident,
            id: undefined // Let the system generate ID
          })
          incidentsAdded++
        } catch {
          failed++
        }
      }

      // Update existing incidents
      for (const update of duplicateResults.incidents.updates) {
        try {
          updateIncident(update.existing.id, update.changes)
          incidentsUpdated++
        } catch {
          failed++
        }
      }

      const results = {
        incidentsAdded,
        incidentsUpdated,
        skipped: duplicateResults.skipped.length,
        failed,
      }

      setImportResults(results)

      // Record warnings and stats in context
      if (importWarnings) {
        recordImportWarnings(importWarnings)
      }
      recordImportStats({
        added: incidentsAdded,
        updated: incidentsUpdated,
        skipped: duplicateResults.skipped.length,
        failed,
        warningCount: (importWarnings?.dateIssues?.length || 0) + (importWarnings?.hazardIssues?.length || 0)
      })

      setCurrentStep(3) // Step 3 is now Complete (was step 4)
    } catch (error) {
      console.error('Error during import:', error)
      alert('Error during import: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [duplicateResults, addIncident, updateIncident, importWarnings, recordImportWarnings, recordImportStats])

  // Navigation (3-step flow: Upload → Review → Complete)
  const canProceed = () => {
    switch (currentStep) {
      case 1: return formatValidation?.valid && duplicateResults // File uploaded and validated
      case 2: return duplicateResults && (duplicateResults.newRecords.length > 0 || duplicateResults.updates.length > 0)
      default: return true
    }
  }

  const handleNext = () => {
    if (currentStep === 2) {
      executeImport()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setFileData(null)
    setColumnMappings({})
    setDuplicateResults(null)
    setImportResults(null)
    setImportWarnings(null)
  }

  const handleGoToDashboard = () => {
    if (onComplete) {
      onComplete({ results: importResults, warnings: importWarnings })
    }
  }

  const handleImportMore = () => {
    resetWizard()
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
        {currentStep === 1 && (
          <>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isProcessing} />

            {/* NEOM Format Validation Result */}
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

            {/* NEOM Format Detected Success */}
            {formatValidation?.valid && duplicateResults && (
              <div className="mt-6 bg-green-50 border border-green-300 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <h4 className="text-green-800 font-bold text-sm">NEOM Format Detected</h4>
                    <p className="text-green-700 text-sm">
                      {fileData?.totalRows || 0} records ready to import. Click "Next" to review.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {currentStep === 2 && duplicateResults && (
          <DuplicateReview results={duplicateResults} />
        )}

        {currentStep === 3 && importResults && (
          <ImportSummary
            results={importResults}
            warnings={importWarnings}
            onGoToDashboard={handleGoToDashboard}
            onImportMore={handleImportMore}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={currentStep === 1 && onCancel ? onCancel : handleBack}
            disabled={currentStep === 1 && !onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-surface-200 text-surface-700 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ChevronLeft size={20} />
            {currentStep === 1 && onCancel ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isProcessing}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : currentStep === 2 ? (
              <>
                Import Data
                <Check size={20} />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ImportWizard
