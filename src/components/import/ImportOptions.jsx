import React, { useState, useEffect } from 'react'
import { CheckCircle, FileSpreadsheet, ArrowRight } from 'lucide-react'

// Import options storage key
const IMPORT_OPTIONS_KEY = 'hse_import_options'

// Default import options
const DEFAULT_OPTIONS = {
  classificationMode: 'trust-excel',
  duplicateHandling: 'skip'
}

/**
 * Get saved import options from localStorage
 */
export const getImportOptions = () => {
  try {
    const stored = localStorage.getItem(IMPORT_OPTIONS_KEY)
    if (stored) {
      return { ...DEFAULT_OPTIONS, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('Error reading import options:', error)
  }
  return DEFAULT_OPTIONS
}

/**
 * Save import options to localStorage
 */
export const saveImportOptions = (options) => {
  try {
    localStorage.setItem(IMPORT_OPTIONS_KEY, JSON.stringify(options))
  } catch (error) {
    console.error('Error saving import options:', error)
  }
}

/**
 * ImportOptions - Simple import options screen
 * Shows file info, classification mode, and duplicate handling options
 */
const ImportOptions = ({
  fileName,
  recordCount,
  onImport,
  onCancel,
  isProcessing = false
}) => {
  const [options, setOptions] = useState(getImportOptions())

  // Save options when they change
  useEffect(() => {
    saveImportOptions(options)
  }, [options])

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleImport = () => {
    onImport(options)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
        <div className="flex-1 min-w-0">
          <h3 className="text-green-800 font-semibold">Ready to Import</h3>
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <FileSpreadsheet size={16} className="flex-shrink-0" />
            <span className="truncate">{fileName}</span>
            <span className="text-green-600">•</span>
            <span className="font-medium">{recordCount.toLocaleString()} records</span>
          </div>
        </div>
      </div>

      {/* Classification Mode */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide mb-3">
          Classification Mode
        </h4>
        <div className="space-y-2">
          <RadioOption
            name="classificationMode"
            value="trust-excel"
            checked={options.classificationMode === 'trust-excel'}
            onChange={() => handleOptionChange('classificationMode', 'trust-excel')}
            title="Trust Excel Categories"
            description="Use hazard categories from your file. Only classify blanks."
          />
          <RadioOption
            name="classificationMode"
            value="reclassify-all"
            checked={options.classificationMode === 'reclassify-all'}
            onChange={() => handleOptionChange('classificationMode', 'reclassify-all')}
            title="Re-classify Everything"
            description="Ignore Excel categories. Classify all by description."
          />
          <RadioOption
            name="classificationMode"
            value="fill-blanks"
            checked={options.classificationMode === 'fill-blanks'}
            onChange={() => handleOptionChange('classificationMode', 'fill-blanks')}
            title="Fill Blanks & 'Other' Only"
            description="Keep manual categories. Only classify empty, 'Other', or 'Not Specified' entries."
          />
        </div>
      </div>

      {/* Duplicate Handling */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide mb-3">
          Duplicate Handling
        </h4>
        <div className="space-y-2">
          <RadioOption
            name="duplicateHandling"
            value="skip"
            checked={options.duplicateHandling === 'skip'}
            onChange={() => handleOptionChange('duplicateHandling', 'skip')}
            title="Skip duplicates"
            description="Don't import records that already exist."
          />
          <RadioOption
            name="duplicateHandling"
            value="update"
            checked={options.duplicateHandling === 'update'}
            onChange={() => handleOptionChange('duplicateHandling', 'update')}
            title="Update existing records"
            description="Overwrite existing records with new data."
          />
          <RadioOption
            name="duplicateHandling"
            value="allow"
            checked={options.duplicateHandling === 'allow'}
            onChange={() => handleOptionChange('duplicateHandling', 'allow')}
            title="Import anyway (allow duplicates)"
            description="Import all records even if duplicates exist."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-surface-200">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 text-surface-600 hover:text-surface-800 hover:bg-surface-100 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Importing...
            </>
          ) : (
            <>
              Import
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * RadioOption - Styled radio button option
 */
const RadioOption = ({ name, value, checked, onChange, title, description }) => {
  return (
    <label
      className={`
        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
        ${checked
          ? 'border-blue-300 bg-blue-50'
          : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
        }
      `}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
      />
      <div>
        <div className={`font-medium ${checked ? 'text-blue-900' : 'text-surface-800'}`}>
          {title}
        </div>
        <div className={`text-sm ${checked ? 'text-blue-700' : 'text-surface-500'}`}>
          {description}
        </div>
      </div>
    </label>
  )
}

export default ImportOptions
