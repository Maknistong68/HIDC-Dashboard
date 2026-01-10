import React, { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { INCIDENT_TYPES } from '../../utils/constants'

const MAPPING_OPTIONS = [
  { value: 'unsafe-condition', label: 'Unsafe Condition', color: '#6366f1' },
  { value: 'unsafe-act', label: 'Unsafe Act', color: '#8b5cf6' },
  { value: 'near-miss', label: 'Near Miss', color: '#3b82f6' },
  { value: 'fac', label: 'First Aid Case', color: '#eab308' },
  { value: 'skip', label: 'Skip (Don\'t Import)', color: '#6b7280' },
]

const CategoryMapper = ({ items, mappedItems, onMappingChange }) => {
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [bulkMapping, setBulkMapping] = useState('')

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const handleBulkMapping = () => {
    if (!bulkMapping) return

    const newMappings = { ...mappedItems }
    items.forEach((item, index) => {
      if (!mappedItems[index]) {
        newMappings[index] = bulkMapping
      }
    })
    onMappingChange(newMappings)
  }

  const handleSingleMapping = (index, value) => {
    onMappingChange({
      ...mappedItems,
      [index]: value
    })
  }

  const unmappedCount = items.filter((_, i) => !mappedItems[i]).length
  const mappedCount = items.length - unmappedCount

  // Group items by classification
  const groupedByClassification = items.reduce((acc, item, index) => {
    const key = item.classification || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push({ ...item, originalIndex: index })
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-orange-800">
              {items.length} items need manual categorization
            </p>
            <p className="text-sm text-orange-700 mt-1">
              These observations have classifications that couldn't be automatically mapped.
              Please assign each to the appropriate category.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between bg-surface-50 rounded-lg p-4">
        <div>
          <span className="text-sm text-surface-600">Progress: </span>
          <span className="font-medium text-surface-900">{mappedCount} of {items.length} mapped</span>
        </div>
        <div className="w-48 h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${(mappedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Bulk Mapping */}
      {unmappedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-lg">
          <span className="text-sm text-surface-600">Bulk assign all unmapped ({unmappedCount}) to:</span>
          <select
            value={bulkMapping}
            onChange={(e) => setBulkMapping(e.target.value)}
            className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm"
          >
            <option value="">Select category...</option>
            {MAPPING_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleBulkMapping}
            disabled={!bulkMapping}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
          >
            Apply to All
          </button>
        </div>
      )}

      {/* Grouped Items */}
      <div className="space-y-4">
        {Object.entries(groupedByClassification).map(([classification, groupItems]) => (
          <div key={classification} className="border border-surface-200 rounded-lg overflow-hidden">
            <div className="bg-surface-50 px-4 py-3 flex items-center justify-between">
              <span className="font-medium text-surface-900">
                {classification} ({groupItems.length} items)
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const newMappings = { ...mappedItems }
                    groupItems.forEach(item => {
                      newMappings[item.originalIndex] = e.target.value
                    })
                    onMappingChange(newMappings)
                  }
                }}
                className="px-2 py-1 border border-surface-200 rounded text-sm"
              >
                <option value="">Assign all in group...</option>
                {MAPPING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="divide-y divide-surface-100">
              {groupItems.map((item) => (
                <div key={item.originalIndex} className="bg-white">
                  <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-50"
                    onClick={() => toggleExpand(item.originalIndex)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-surface-500">
                          {item.eventId ? item.eventId.substring(0, 20) + '...' : 'No ID'}
                        </span>
                        {mappedItems[item.originalIndex] && (
                          <span
                            className="px-2 py-0.5 text-xs rounded-full text-white"
                            style={{
                              backgroundColor: MAPPING_OPTIONS.find(o => o.value === mappedItems[item.originalIndex])?.color
                            }}
                          >
                            {MAPPING_OPTIONS.find(o => o.value === mappedItems[item.originalIndex])?.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-surface-700 mt-1 truncate">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={mappedItems[item.originalIndex] || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleSingleMapping(item.originalIndex, e.target.value)}
                        className="px-2 py-1 border border-surface-200 rounded text-sm"
                      >
                        <option value="">Select...</option>
                        {MAPPING_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {expandedItems.has(item.originalIndex) ? (
                        <ChevronUp size={18} className="text-surface-400" />
                      ) : (
                        <ChevronDown size={18} className="text-surface-400" />
                      )}
                    </div>
                  </div>

                  {expandedItems.has(item.originalIndex) && (
                    <div className="px-4 py-3 bg-surface-50 border-t border-surface-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-surface-500">Date:</span>
                          <span className="ml-2 text-surface-900">{item.date}</span>
                        </div>
                        <div>
                          <span className="text-surface-500">Type:</span>
                          <span className="ml-2 text-surface-900">{item.type}</span>
                        </div>
                        <div>
                          <span className="text-surface-500">Status:</span>
                          <span className="ml-2 text-surface-900">{item.status}</span>
                        </div>
                        <div>
                          <span className="text-surface-500">Reported By:</span>
                          <span className="ml-2 text-surface-900">{item.reportedBy}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-surface-500 text-sm">Full Description:</span>
                        <p className="text-sm text-surface-900 mt-1 whitespace-pre-wrap">
                          {item.fullDescription || item.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryMapper
