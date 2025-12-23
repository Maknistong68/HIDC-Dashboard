import React, { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'

const IncidentPyramid = ({ data, pyramidData, showOpenClosed, incidents = [] }) => {
  // Internal state for drill-down
  const [selectedType, setSelectedType] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)

  // Colors gradient: Red at top → Green at bottom (safety pyramid)
  const pyramidLevels = [
    { key: 'incident', label: 'Incident (LTI/MTI/FAC)', color: '#dc2626', bgColor: '#fecaca' },
    { key: 'near-miss', label: 'Near Miss', color: '#ea580c', bgColor: '#fed7aa' },
    { key: 'unsafe-act', label: 'Unsafe Act', color: '#ca8a04', bgColor: '#fef08a' },
    { key: 'unsafe-condition', label: 'Unsafe Condition', color: '#65a30d', bgColor: '#d9f99d' },
    { key: 'positive', label: 'Positive Observation', color: '#16a34a', bgColor: '#bbf7d0' },
  ]

  // Handle pyramid level click
  const handleTypeClick = (typeKey) => {
    if (selectedType === typeKey) {
      // Toggle off
      setSelectedType(null)
      setSelectedMonth(null)
    } else {
      // Select new type
      setSelectedType(typeKey)
      setSelectedMonth(null)
    }
  }

  // Close drill-down
  const handleClose = () => {
    setSelectedType(null)
    setSelectedMonth(null)
  }

  // Back to monthly view
  const handleBack = () => {
    setSelectedMonth(null)
  }

  // Get filtered incidents for selected type
  const filteredIncidents = useMemo(() => {
    if (!selectedType || !incidents.length) return []

    const incidentTypes = ['lti', 'mti', 'fac']
    if (selectedType === 'incident') {
      return incidents.filter(i => incidentTypes.includes(i.type))
    }
    return incidents.filter(i => i.type === selectedType)
  }, [selectedType, incidents])

  // Monthly breakdown data
  const monthlyBreakdown = useMemo(() => {
    if (!selectedType || filteredIncidents.length === 0) return []

    const byMonth = {}
    filteredIncidents.forEach(incident => {
      const month = incident.date?.substring(0, 7) || 'Unknown'
      byMonth[month] = (byMonth[month] || 0) + 1
    })

    return Object.entries(byMonth)
      .map(([period, count]) => ({
        period,
        label: period !== 'Unknown' ? format(parseISO(period + '-01'), 'MMM yyyy') : 'Unknown',
        count
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [selectedType, filteredIncidents])

  // Incidents for selected month
  const monthIncidents = useMemo(() => {
    if (!selectedMonth) return []
    return filteredIncidents.filter(i => i.date?.substring(0, 7) === selectedMonth)
  }, [selectedMonth, filteredIncidents])

  // Get display label for selected type
  const getTypeLabel = (type) => {
    const level = pyramidLevels.find(l => l.key === type)
    return level?.label || type
  }

  // Calculate max total for bar scaling
  const maxTotal = Math.max(
    ...pyramidLevels.map(level => {
      const statusData = pyramidData?.[level.key] || { open: 0, closed: 0 }
      return statusData.open + statusData.closed
    }),
    1
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Observation Categories
      </h3>

      {/* Pyramid Levels */}
      <div className="flex flex-col justify-center space-y-2">
        {pyramidLevels.map((level, index) => {
          const count = data[level.key] || 0
          const statusData = pyramidData?.[level.key] || { open: 0, closed: 0 }
          const total = statusData.open + statusData.closed
          const openPercent = total > 0 ? (statusData.open / total) * 100 : 0
          const closedPercent = total > 0 ? (statusData.closed / total) * 100 : 0
          const widthPercent = 40 + (index * 15)
          const isActive = selectedType === level.key

          return (
            <div key={level.key} className="flex justify-center">
              <div
                className={`relative flex items-center justify-between transition-all cursor-pointer rounded ${
                  isActive ? 'ring-2 ring-gray-800 ring-offset-1' : 'hover:ring-1 hover:ring-gray-300'
                }`}
                style={{
                  width: `${widthPercent}%`,
                  minHeight: '44px',
                  opacity: selectedType && !isActive ? 0.5 : 1,
                  backgroundColor: showOpenClosed ? '#f3f4f6' : level.bgColor,
                  borderLeft: `4px solid ${level.color}`,
                  overflow: 'hidden',
                }}
                onClick={() => handleTypeClick(level.key)}
              >
                {showOpenClosed && total > 0 && (
                  <div className="absolute inset-0 flex">
                    {statusData.open > 0 && (
                      <div className="h-full bg-red-300" style={{ width: `${openPercent}%` }} />
                    )}
                    {statusData.closed > 0 && (
                      <div className="h-full bg-green-300" style={{ width: `${closedPercent}%` }} />
                    )}
                  </div>
                )}
                <div className="relative z-10 w-full flex items-center justify-between px-3 py-2">
                  <span className="font-medium text-sm" style={{ color: level.color }}>
                    {level.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {showOpenClosed && total > 0 && (
                      <span className="text-xs text-gray-500">
                        {statusData.open}o / {statusData.closed}c
                      </span>
                    )}
                    <span className="font-bold text-lg" style={{ color: level.color }}>
                      {total || count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Click to drill down
      </p>

      {/* Drill-Down Panel - Monthly Breakdown */}
      {selectedType && !selectedMonth && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-gray-800 uppercase">
              {getTypeLabel(selectedType)} - Monthly Breakdown
            </h4>
            <button
              onClick={handleClose}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Close
            </button>
          </div>

          {monthlyBreakdown.length > 0 ? (
            <>
              <div className="space-y-1">
                {monthlyBreakdown.map(month => {
                  const maxCount = Math.max(...monthlyBreakdown.map(m => m.count))
                  return (
                    <div
                      key={month.period}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => setSelectedMonth(month.period)}
                    >
                      <span className="text-xs w-16 text-gray-600">{month.label}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{ width: `${(month.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold w-8 text-right text-gray-900">
                        {month.count}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Click a month to view details
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              No records found for this category
            </p>
          )}
        </div>
      )}

      {/* Drill-Down Panel - Month Details */}
      {selectedType && selectedMonth && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-gray-800 uppercase">
              {getTypeLabel(selectedType)} - {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}
              <span className="ml-2 font-normal text-gray-500">
                ({monthIncidents.length} record{monthIncidents.length !== 1 ? 's' : ''})
              </span>
            </h4>
            <button
              onClick={handleBack}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Back
            </button>
          </div>

          {monthIncidents.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium text-gray-600">Date</th>
                    <th className="text-left p-2 font-medium text-gray-600">Description</th>
                    <th className="text-left p-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthIncidents.map((incident, idx) => (
                    <tr key={incident.externalId || idx} className="border-t border-gray-100">
                      <td className="p-2 text-gray-700 whitespace-nowrap">{incident.date}</td>
                      <td className="p-2 text-gray-700 truncate max-w-[200px]" title={incident.description}>
                        {incident.description?.substring(0, 60)}...
                      </td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          incident.actionStatus === 'closed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {incident.actionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              No records found
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default IncidentPyramid
