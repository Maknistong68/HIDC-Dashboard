import React, { useState, useCallback, useRef } from 'react'
import { RefreshCw, FileSpreadsheet, Upload, X, Check, AlertTriangle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import {
  parseExcelFile,
  validateNEOMFormat,
  mapNEOMColumns,
  transformRows,
} from '../../utils/excelParser'

/**
 * FileReplaceModal - Replace an existing file with an updated version
 *
 * Useful for:
 * - Updating data with corrected records
 * - Importing newer exports from the source system
 */
const FileReplaceModal = ({ file, onClose }) => {
  const { replaceFile, incidents } = useData()

  const [step, setStep] = useState('upload') // upload | confirm | complete
  const [newFile, setNewFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const fileInputRef = useRef(null)

  // Current record count for this file
  const currentRecordCount = incidents.filter(i => i.fileId === file.id).length

  // Handle file selection
  const handleFileSelect = useCallback(async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)

    try {
      // Parse the file
      const data = await parseExcelFile(selectedFile)

      // Validate format
      const validation = validateNEOMFormat(data.headers)
      if (!validation.valid) {
        setError(`Invalid format. Missing columns: ${validation.missing.join(', ')}`)
        setIsProcessing(false)
        return
      }

      // Store the file and data
      setNewFile(selectedFile)
      setParsedData(data)
      setStep('confirm')
    } catch (err) {
      setError('Error parsing file: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Execute replacement
  const handleReplace = useCallback(async () => {
    if (!parsedData) return

    setIsProcessing(true)
    setError(null)

    try {
      // Map columns
      const mappings = mapNEOMColumns(parsedData.headers)

      // Transform rows
      const { incidents: transformedIncidents, warnings } = transformRows(
        parsedData.rows,
        parsedData.headers,
        mappings,
        null,
        incidents.filter(i => i.fileId !== file.id), // Existing records excluding this file
        { classificationMode: 'trust-excel' }
      )

      // Execute replacement
      const replaceResult = await replaceFile(file.id, transformedIncidents)

      setResult({
        deleted: replaceResult.deleted,
        added: replaceResult.added,
        warnings
      })
      setStep('complete')
    } catch (err) {
      setError('Error replacing file: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }, [parsedData, file.id, incidents, replaceFile])

  // Trigger file input
  const handleBrowse = () => {
    fileInputRef.current?.click()
  }

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      const event = { target: { files: [droppedFile] } }
      handleFileSelect(event)
    }
  }, [handleFileSelect])

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <RefreshCw size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Replace File</h2>
              <p className="text-sm text-surface-500 truncate max-w-xs">{file.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-surface-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Upload */}
          {step === 'upload' && (
            <>
              <div
                className="border-2 border-dashed border-surface-300 rounded-lg p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-colors cursor-pointer"
                onClick={handleBrowse}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload size={40} className="mx-auto text-surface-400 mb-4" />
                <p className="text-surface-700 font-medium mb-1">
                  Drop your replacement file here
                </p>
                <p className="text-sm text-surface-500 mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-surface-400">
                  Excel files only (.xlsx, .xls)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Current file info */}
              <div className="mt-4 p-3 bg-surface-50 rounded-lg">
                <p className="text-sm text-surface-600">
                  Current file has <strong>{currentRecordCount.toLocaleString()}</strong> records
                </p>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-surface-600">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Parsing file...
                </div>
              )}
            </>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && parsedData && (
            <>
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg mb-4">
                <FileSpreadsheet size={24} className="text-green-600" />
                <div>
                  <p className="font-medium text-surface-800">{newFile.name}</p>
                  <p className="text-sm text-surface-500">
                    {parsedData.totalRows.toLocaleString()} records
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium">Confirm replacement</p>
                    <p className="text-amber-700 text-sm mt-1">
                      This will replace all <strong>{currentRecordCount.toLocaleString()}</strong> existing
                      records with <strong>{parsedData.totalRows.toLocaleString()}</strong> new records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-surface-600">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Existing records will be permanently deleted
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  New records will be imported and categorized
                </p>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </>
          )}

          {/* Step: Complete */}
          {step === 'complete' && result && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">
                File Replaced Successfully
              </h3>
              <div className="space-y-2 text-surface-600">
                <p>{result.deleted.toLocaleString()} records removed</p>
                <p>{result.added.toLocaleString()} records added</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-surface-200 bg-surface-50 rounded-b-xl">
          {step === 'upload' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-surface-700 font-medium hover:bg-surface-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {step === 'confirm' && (
            <>
              <button
                onClick={() => {
                  setStep('upload')
                  setNewFile(null)
                  setParsedData(null)
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-surface-700 font-medium hover:bg-surface-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleReplace}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Replacing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Replace File
                  </>
                )}
              </button>
            </>
          )}

          {step === 'complete' && (
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

export default FileReplaceModal
