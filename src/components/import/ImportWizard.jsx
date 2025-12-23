import React, { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, Upload, Columns, GitCompare, CheckCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import FileUpload from './FileUpload'
import ColumnMapper from './ColumnMapper'
import DuplicateReview from './DuplicateReview'
import ImportSummary from './ImportSummary'
import {
  parseExcelFile,
  autoDetectColumns,
  transformRows,
  checkDuplicates,
} from '../../utils/excelParser'

const STEPS = [
  { id: 1, name: 'Upload File', icon: Upload },
  { id: 2, name: 'Map Columns', icon: Columns },
  { id: 3, name: 'Review', icon: GitCompare },
  { id: 4, name: 'Complete', icon: CheckCircle },
]

const ImportWizard = ({ onComplete, onCancel, mode = 'inline' }) => {
  const { incidents, addIncident, updateIncident, recordImportWarnings, recordImportStats } = useData()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Step 1: File data
  const [fileData, setFileData] = useState(null)

  // Step 2: Column mappings
  const [columnMappings, setColumnMappings] = useState({})

  // Step 3: Duplicate check results
  const [duplicateResults, setDuplicateResults] = useState(null)

  // Step 4: Import results
  const [importResults, setImportResults] = useState(null)

  // Track warnings from transformation
  const [importWarnings, setImportWarnings] = useState(null)

  // Handle file selection
  const handleFileSelect = useCallback(async (file) => {
    setIsProcessing(true)
    try {
      const data = await parseExcelFile(file)
      setFileData(data)

      // Auto-detect column mappings
      const autoMappings = autoDetectColumns(data.headers)
      setColumnMappings(autoMappings)

      setCurrentStep(2)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Handle column mapping change
  const handleMappingChange = (field, columnIndex) => {
    setColumnMappings(prev => ({
      ...prev,
      [field]: columnIndex
    }))
  }

  // Process data after column mapping
  const processData = useCallback(() => {
    if (!fileData) return

    setIsProcessing(true)

    try {
      // Transform rows - now returns warnings too
      const { incidents: transformedIncidents, warnings } =
        transformRows(fileData.rows, fileData.headers, columnMappings, null)

      // Store warnings for later
      setImportWarnings(warnings)

      // Go directly to duplicate check (step 3)
      performDuplicateCheck(transformedIncidents)
    } catch (error) {
      console.error('Error processing data:', error)
      alert('Error processing data: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [fileData, columnMappings])

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

    setCurrentStep(3)
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

      setCurrentStep(4)
    } catch (error) {
      console.error('Error during import:', error)
      alert('Error during import: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }, [duplicateResults, addIncident, updateIncident, importWarnings, recordImportWarnings, recordImportStats])

  // Navigation
  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!fileData
      case 2: return columnMappings.date !== undefined && columnMappings.description !== undefined
      case 3: return duplicateResults && (duplicateResults.newRecords.length > 0 || duplicateResults.updates.length > 0)
      default: return true
    }
  }

  const handleNext = () => {
    if (currentStep === 2) {
      processData()
    } else if (currentStep === 3) {
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
      {/* Header - only show in inline mode */}
      {mode === 'inline' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Import Excel Data</h2>
          <p className="text-gray-500">Import observations from your official HSE system</p>
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
                      : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check size={20} />
                  ) : (
                    <step.icon size={20} />
                  )}
                </div>
                <span className={`text-xs mt-2 ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[400px]">
        {currentStep === 1 && (
          <FileUpload onFileSelect={handleFileSelect} isLoading={isProcessing} />
        )}

        {currentStep === 2 && fileData && (
          <>
            {fileData.headerRowIndex > 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Header row auto-detected at row {fileData.headerRowIndex + 1} (skipped {fileData.headerRowIndex} row{fileData.headerRowIndex > 1 ? 's' : ''} at top)
                </p>
              </div>
            )}
            <ColumnMapper
              headers={fileData.headers}
              mappings={columnMappings}
              onMappingChange={handleMappingChange}
              previewData={fileData.rows}
            />
          </>
        )}

        {currentStep === 3 && duplicateResults && (
          <DuplicateReview results={duplicateResults} />
        )}

        {currentStep === 4 && importResults && (
          <ImportSummary
            results={importResults}
            warnings={importWarnings}
            onGoToDashboard={handleGoToDashboard}
            onImportMore={handleImportMore}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={currentStep === 1 && onCancel ? onCancel : handleBack}
            disabled={currentStep === 1 && !onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
            ) : currentStep === 3 ? (
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
