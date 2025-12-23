import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { EXPECTED_COLUMNS } from '../../utils/excelParser'

const REQUIRED_FIELDS = ['date', 'description']
const RECOMMENDED_FIELDS = ['eventId', 'type', 'classification', 'status']

const ColumnMapper = ({ headers, mappings, onMappingChange, previewData }) => {
  const fields = [
    { key: 'eventId', label: 'Event ID', description: 'Unique identifier for matching records' },
    { key: 'type', label: 'Type', description: 'Observation type (Hazard, Incident, etc.)' },
    { key: 'classification', label: 'Classification', description: 'Sub-category (Unsafe Act, Condition, etc.)' },
    { key: 'date', label: 'Date', description: 'Date of the observation', required: true },
    { key: 'description', label: 'Description', description: 'Details of the observation', required: true },
    { key: 'status', label: 'Status', description: 'Open/Closed status' },
    { key: 'reportedBy', label: 'Reported By', description: 'Person who reported' },
    { key: 'hazardCategory', label: 'Hazard Category', description: 'Type of hazard' },
    { key: 'company', label: 'Company/Site', description: 'Company, site, or project name' },
  ]

  const getMappingStatus = (fieldKey) => {
    if (mappings[fieldKey] !== undefined) return 'mapped'
    if (REQUIRED_FIELDS.includes(fieldKey)) return 'required'
    if (RECOMMENDED_FIELDS.includes(fieldKey)) return 'recommended'
    return 'optional'
  }

  const getPreviewValue = (fieldKey) => {
    if (mappings[fieldKey] === undefined || !previewData || previewData.length === 0) return null
    return previewData[0][mappings[fieldKey]]
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Map your Excel columns to the required fields. We've auto-detected some mappings based on column names.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const status = getMappingStatus(field.key)
          const previewValue = getPreviewValue(field.key)

          return (
            <div
              key={field.key}
              className={`p-4 rounded-lg border ${
                status === 'mapped'
                  ? 'border-green-200 bg-green-50'
                  : status === 'required'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{field.label}</span>
                    {field.required && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Required</span>
                    )}
                    {status === 'mapped' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{field.description}</p>

                  {previewValue && (
                    <p className="text-sm mt-2">
                      <span className="text-gray-500">Preview: </span>
                      <span className="text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {String(previewValue).substring(0, 50)}
                        {String(previewValue).length > 50 && '...'}
                      </span>
                    </p>
                  )}
                </div>

                <div className="w-64">
                  <select
                    value={mappings[field.key] ?? ''}
                    onChange={(e) => onMappingChange(field.key, e.target.value === '' ? undefined : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  >
                    <option value="">-- Select column --</option>
                    {headers.map((header, index) => (
                      <option key={index} value={index}>
                        {header || `Column ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview Table */}
      {previewData && previewData.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Data Preview (First 3 rows)</h4>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">
                      {header || `Col ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-gray-200">
                    {headers.map((_, colIndex) => (
                      <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {row[colIndex] ? String(row[colIndex]).substring(0, 30) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColumnMapper
