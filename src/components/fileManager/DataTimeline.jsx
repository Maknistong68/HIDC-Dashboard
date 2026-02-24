import React, { useState, useRef, useEffect, useMemo } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Calendar, FileSpreadsheet, Clock, Info, TrendingUp, Database, BarChart3 } from 'lucide-react'
import { Card } from '../ui'
import useFileTimelineData from './useFileTimelineData'

/**
 * DataTimeline - Enhanced Gantt-style visualization of file data coverage
 *
 * Features:
 * - Horizontal bars for each file's data date range
 * - Import date markers (green circles)
 * - Color intensity based on record density
 * - Interactive tooltips with file details
 * - Mobile-responsive card-based alternative view
 * - Clear axis labels and legend
 */
const DataTimelineComponent = ({ files = [], incidents = [] }) => {
  const { fileData, timelineStart, timelineEnd, totalDays } = useFileTimelineData(files, incidents)
  const [tooltip, setTooltip] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredFile, setHoveredFile] = useState(null)
  const containerRef = useRef(null)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    if (!fileData.length) return null
    const totalRecords = fileData.reduce((sum, f) => sum + f.recordCount, 0)
    const avgDensity = fileData.reduce((sum, f) => sum + f.density, 0) / fileData.length
    return {
      totalRecords,
      avgDensity: avgDensity.toFixed(1),
      totalFiles: fileData.length,
      totalDays
    }
  }, [fileData, totalDays])

  // Calculate max density for normalization
  const maxDensity = fileData.length ? Math.max(...fileData.map(f => f.density)) : 0

  // Get color based on density
  const getDensityColor = (density) => {
    const normalized = Math.min(density / (maxDensity || 1), 1)
    if (normalized < 0.25) return { bg: 'bg-blue-200', color: '#bfdbfe', label: 'Low' }
    if (normalized < 0.5) return { bg: 'bg-blue-300', color: '#93c5fd', label: 'Medium' }
    if (normalized < 0.75) return { bg: 'bg-blue-400', color: '#60a5fa', label: 'High' }
    return { bg: 'bg-blue-500', color: '#3b82f6', label: 'Very High' }
  }

  // Convert date to percentage position
  const dateToPercent = (date) => {
    if (!timelineStart || !timelineEnd || !date) return 0
    const totalMs = timelineEnd.getTime() - timelineStart.getTime()
    if (totalMs === 0) return 0
    return ((date.getTime() - timelineStart.getTime()) / totalMs) * 100
  }

  // Generate smart markers for the timeline based on span length
  const monthMarkers = useMemo(() => {
    if (!timelineStart || !timelineEnd) return []

    const totalMonths = differenceInDays(timelineEnd, timelineStart) / 30
    const markers = []
    const current = new Date(timelineStart)
    current.setDate(1)
    current.setHours(0, 0, 0, 0)

    // Determine interval based on timeline span
    let interval = 1 // months
    let labelFormat = 'MMM yyyy'

    if (totalMonths > 36) {
      // More than 3 years: show yearly markers
      interval = 12
      labelFormat = 'yyyy'
      current.setMonth(0) // Start from January
    } else if (totalMonths > 18) {
      // More than 1.5 years: show quarterly markers
      interval = 3
      labelFormat = "MMM ''yy"
      // Align to quarter start
      const quarter = Math.floor(current.getMonth() / 3)
      current.setMonth(quarter * 3)
    } else if (totalMonths > 8) {
      // More than 8 months: show bi-monthly
      interval = 2
      labelFormat = "MMM ''yy"
    } else {
      labelFormat = "MMM ''yy"
    }

    // Move to first valid marker position
    while (current < timelineStart) {
      current.setMonth(current.getMonth() + interval)
    }

    while (current <= timelineEnd) {
      const percent = dateToPercent(current)
      if (percent >= 2 && percent <= 98) { // Give some padding
        markers.push({
          date: new Date(current),
          percent,
          label: format(current, labelFormat)
        })
      }
      current.setMonth(current.getMonth() + interval)
    }

    return markers
  }, [timelineStart, timelineEnd]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sort files by start date for better visualization
  const sortedFileData = useMemo(() => {
    return [...fileData].sort((a, b) => a.dataStartDate - b.dataStartDate)
  }, [fileData])

  // Show empty state if no valid data
  if (!fileData.length) {
    return (
      <Card className="border-0 shadow-lg">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Calendar size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900">Data Timeline</h2>
              <p className="text-sm text-surface-500">Visualize your data coverage over time</p>
            </div>
          </div>
          <div className="py-12 text-center bg-surface-50/50 rounded-2xl border-2 border-dashed border-surface-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 rounded-2xl flex items-center justify-center">
              <Clock size={28} className="text-surface-400" />
            </div>
            <p className="text-surface-600 font-medium">No timeline data available</p>
            <p className="text-sm text-surface-400 mt-1">Import files with date information to see coverage</p>
          </div>
        </div>
      </Card>
    )
  }

  // Mobile card view
  if (isMobile) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-500 rounded-xl shadow-md">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">Data Timeline</h2>
              <p className="text-xs text-surface-500">{stats?.totalFiles} files, {stats?.totalDays} days coverage</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {sortedFileData.map(file => {
            const startPercent = dateToPercent(file.dataStartDate)
            const endPercent = dateToPercent(file.dataEndDate)
            const widthPercent = Math.max(endPercent - startPercent, 3)
            const colorInfo = getDensityColor(file.density)

            return (
              <div key={file.fileId} className="bg-surface-50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-emerald-100 rounded-lg flex-shrink-0">
                      <FileSpreadsheet size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-surface-800 truncate">
                      {file.fileName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold flex-shrink-0">
                    {file.recordCount.toLocaleString()}
                  </span>
                </div>

                {/* Mini timeline bar */}
                <div className="relative h-2.5 bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full transition-all"
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: colorInfo.color
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-surface-500">
                  <span>{format(file.dataStartDate, 'MMM d, yyyy')}</span>
                  <span className="text-surface-400">{file.coverageDays} days</span>
                  <span>{format(file.dataEndDate, 'MMM d, yyyy')}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="p-4 bg-surface-50 border-t border-surface-100">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-2.5 rounded-full bg-blue-200" />
              Low density
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-2.5 rounded-full bg-blue-500" />
              High density
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow" />
              Import date
            </span>
          </div>
        </div>
      </Card>
    )
  }

  // Desktop view
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      {/* Header with stats */}
      <div className="p-6 bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 border-b border-primary-100">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900">Data Timeline</h2>
              <p className="text-sm text-surface-500 mt-0.5">
                {timelineStart && timelineEnd && (
                  <>
                    {format(timelineStart, 'MMM d, yyyy')} - {format(timelineEnd, 'MMM d, yyyy')}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          {stats && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-surface-900">{stats.totalFiles}</p>
                <p className="text-xs text-surface-500 font-medium">Files</p>
              </div>
              <div className="w-px h-10 bg-surface-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-surface-900">{stats.totalRecords.toLocaleString()}</p>
                <p className="text-xs text-surface-500 font-medium">Records</p>
              </div>
              <div className="w-px h-10 bg-surface-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-surface-900">{stats.totalDays}</p>
                <p className="text-xs text-surface-500 font-medium">Days</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline content */}
      <div className="p-6" ref={containerRef}>
        {/* X-axis labels */}
        <div className="relative h-10 mb-4 ml-56 mr-20 border-b border-surface-200">
          {monthMarkers.map((marker) => (
            <div
              key={marker.label}
              className="absolute transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${marker.percent}%` }}
            >
              <span className="text-sm font-bold text-surface-700 whitespace-nowrap bg-white px-1">
                {marker.label}
              </span>
              <div className="w-px h-2 bg-surface-300 mt-1" />
            </div>
          ))}
        </div>

        {/* Grid lines - rendered ONCE as overlay */}
        <div className="absolute inset-0 ml-56 mr-20 pointer-events-none" style={{ top: '160px' }}>
          {monthMarkers.map((marker) => (
            <div
              key={`grid-${marker.label}`}
              className="absolute top-0 bottom-0 w-px bg-surface-200"
              style={{ left: `${marker.percent}%` }}
            />
          ))}
        </div>

        {/* Timeline rows */}
        <div className="space-y-1">
          {sortedFileData.map((file, index) => {
            const startPercent = dateToPercent(file.dataStartDate)
            const endPercent = dateToPercent(file.dataEndDate)
            const widthPercent = Math.max(endPercent - startPercent, 1)
            const importPercent = file.importedAt ? dateToPercent(file.importedAt) : null
            const colorInfo = getDensityColor(file.density)
            const isHovered = hoveredFile === file.fileId

            return (
              <div
                key={file.fileId}
                className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all ${
                  isHovered ? 'bg-primary-50' : index % 2 === 0 ? 'bg-surface-50/50' : ''
                }`}
                onMouseEnter={() => setHoveredFile(file.fileId)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                {/* File name */}
                <div className="w-48 flex-shrink-0 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileSpreadsheet size={18} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold text-surface-800 truncate"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </p>
                    <p className="text-xs text-surface-400">
                      {file.coverageDays} days
                    </p>
                  </div>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 relative h-10">
                  {/* Data bar */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-7 rounded-lg shadow-sm transition-all cursor-pointer ${
                      isHovered ? 'ring-2 ring-primary-400 ring-offset-1' : ''
                    }`}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      minWidth: '8px',
                      backgroundColor: colorInfo.color
                    }}
                    onMouseEnter={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect()
                      if (rect) {
                        setTooltip({
                          file,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        })
                      }
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) {
                        const rect = containerRef.current?.getBoundingClientRect()
                        if (rect) {
                          setTooltip(prev => ({
                            ...prev,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                          }))
                        }
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />

                  {/* Import date marker */}
                  {importPercent !== null && importPercent >= 0 && importPercent <= 100 && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                      style={{ left: `${importPercent}%` }}
                    >
                      <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
                      <div
                        className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-emerald-400"
                        style={{ opacity: 0.5 }}
                      />
                    </div>
                  )}
                </div>

                {/* Record count */}
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                    {file.recordCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tooltip */}
        {tooltip && tooltip.file && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: tooltip.x > 400 ? tooltip.x - 260 : tooltip.x + 20,
              top: Math.max(tooltip.y - 20, 10)
            }}
          >
            <div className="bg-white border border-surface-200 rounded-xl shadow-xl p-4 w-64">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-surface-100">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet size={18} className="text-emerald-600" />
                </div>
                <p className="font-bold text-surface-900 text-sm truncate">
                  {tooltip.file.fileName}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Date Range
                  </span>
                  <span className="text-xs font-semibold text-surface-800">
                    {format(tooltip.file.dataStartDate, 'MMM d')} - {format(tooltip.file.dataEndDate, 'MMM d, yyyy')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500 flex items-center gap-1.5">
                    <Database size={12} />
                    Records
                  </span>
                  <span className="text-xs font-semibold text-surface-800">
                    {tooltip.file.recordCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500 flex items-center gap-1.5">
                    <Clock size={12} />
                    Coverage
                  </span>
                  <span className="text-xs font-semibold text-surface-800">
                    {tooltip.file.coverageDays} days
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500 flex items-center gap-1.5">
                    <BarChart3 size={12} />
                    Density
                  </span>
                  <span className="text-xs font-semibold text-surface-800">
                    {tooltip.file.density.toFixed(1)} records/day
                  </span>
                </div>

                {tooltip.file.importedAt && (
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-surface-100">
                    <span className="text-xs text-surface-500 flex items-center gap-1.5">
                      <TrendingUp size={12} />
                      Imported
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {format(tooltip.file.importedAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gradient-to-r from-surface-50 to-white border-t border-surface-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-surface-500">
            <span className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <span className="w-3 h-3 rounded bg-blue-200" />
                <span className="w-3 h-3 rounded bg-blue-300" />
                <span className="w-3 h-3 rounded bg-blue-400" />
                <span className="w-3 h-3 rounded bg-blue-500" />
              </div>
              <span className="font-medium">Record density (low to high)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
              <span className="font-medium">Import date</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <Info size={12} />
            <span>Hover over bars for details</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Memoize to prevent re-renders when parent state changes
const DataTimeline = React.memo(DataTimelineComponent)

export default DataTimeline
