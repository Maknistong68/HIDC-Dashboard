import React from 'react'

const IncidentPyramid = ({ data, pyramidData, showOpenClosed, onTypeClick, activeType }) => {
  // Colors gradient: Orange/Red at top → Green at bottom
  const pyramidLevels = [
    { key: 'near-miss', label: 'Near Miss', color: '#ea580c', bgColor: '#fed7aa' },           // Orange
    { key: 'unsafe-act', label: 'Unsafe Act', color: '#ca8a04', bgColor: '#fef08a' },         // Yellow
    { key: 'unsafe-condition', label: 'Unsafe Condition', color: '#65a30d', bgColor: '#d9f99d' }, // Lime
    { key: 'positive', label: 'Positive Observation', color: '#16a34a', bgColor: '#bbf7d0' }, // Green
  ]

  // Calculate max total for bar scaling
  const maxTotal = Math.max(
    ...pyramidLevels.map(level => {
      const statusData = pyramidData?.[level.key] || { open: 0, closed: 0 }
      return statusData.open + statusData.closed
    }),
    1
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Observation Categories
      </h3>
      <div className="flex-1 flex flex-col justify-center space-y-2">
        {pyramidLevels.map((level, index) => {
          const count = data[level.key] || 0
          const statusData = pyramidData?.[level.key] || { open: 0, closed: 0 }
          const total = statusData.open + statusData.closed
          const openPercent = total > 0 ? (statusData.open / total) * 100 : 0
          const closedPercent = total > 0 ? (statusData.closed / total) * 100 : 0

          // Pyramid widths: narrower at top, wider at bottom
          const widthPercent = 55 + (index * 15) // 55%, 70%, 85%, 100%
          const isActive = activeType === level.key

          return (
            <div
              key={level.key}
              className="flex justify-center"
            >
              <div
                className={`relative flex items-center justify-between transition-all cursor-pointer rounded ${
                  isActive ? 'ring-2 ring-gray-800 ring-offset-1' : 'hover:ring-1 hover:ring-gray-300'
                }`}
                style={{
                  width: `${widthPercent}%`,
                  minHeight: '44px',
                  opacity: activeType && !isActive ? 0.5 : 1,
                  backgroundColor: showOpenClosed ? '#f3f4f6' : level.bgColor,
                  borderLeft: `4px solid ${level.color}`,
                  overflow: 'hidden',
                }}
                onClick={() => onTypeClick?.(level.key)}
              >
                {/* Open/Closed background bars */}
                {showOpenClosed && total > 0 && (
                  <div className="absolute inset-0 flex">
                    {statusData.open > 0 && (
                      <div
                        className="h-full bg-red-300"
                        style={{ width: `${openPercent}%` }}
                        title={`Open: ${statusData.open}`}
                      />
                    )}
                    {statusData.closed > 0 && (
                      <div
                        className="h-full bg-green-300"
                        style={{ width: `${closedPercent}%` }}
                        title={`Closed: ${statusData.closed}`}
                      />
                    )}
                  </div>
                )}

                {/* Content */}
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
    </div>
  )
}

export default IncidentPyramid
