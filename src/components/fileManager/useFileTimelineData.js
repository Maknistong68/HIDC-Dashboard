import { useMemo } from 'react'

/**
 * useFileTimelineData - Transform file and incident data for timeline visualization
 *
 * Groups incidents by fileId and calculates:
 * - Date ranges (min/max event dates per file)
 * - Record counts and coverage days
 * - Record density (records per day)
 * - Overall timeline bounds
 */
const useFileTimelineData = (files, incidents) => {
  return useMemo(() => {
    if (!files?.length || !incidents?.length) {
      return {
        fileData: [],
        timelineStart: null,
        timelineEnd: null,
        totalDays: 0
      }
    }

    // Group incidents by fileId
    const incidentsByFile = new Map()
    for (const incident of incidents) {
      if (!incident.fileId) continue

      if (!incidentsByFile.has(incident.fileId)) {
        incidentsByFile.set(incident.fileId, [])
      }
      incidentsByFile.get(incident.fileId).push(incident)
    }

    // Calculate data for each file
    const fileData = files
      .map(file => {
        const fileIncidents = incidentsByFile.get(file.id) || []

        if (fileIncidents.length === 0) {
          return null
        }

        // Find min/max dates from incidents
        let minDate = null
        let maxDate = null

        for (const incident of fileIncidents) {
          // Support both 'date' and 'eventDate' field names
          const dateValue = incident.date || incident.eventDate
          const incidentDate = dateValue ? new Date(dateValue) : null

          if (incidentDate && !isNaN(incidentDate.getTime())) {
            if (!minDate || incidentDate < minDate) {
              minDate = incidentDate
            }
            if (!maxDate || incidentDate > maxDate) {
              maxDate = incidentDate
            }
          }
        }

        if (!minDate || !maxDate) {
          return null
        }

        // Calculate coverage
        const coverageDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1)
        const recordCount = fileIncidents.length
        const density = recordCount / coverageDays

        return {
          fileId: file.id,
          fileName: file.fileName || 'Unknown file',
          importedAt: file.importedAt ? new Date(file.importedAt) : null,
          dataStartDate: minDate,
          dataEndDate: maxDate,
          recordCount,
          coverageDays,
          density
        }
      })
      .filter(Boolean) // Remove nulls

    if (fileData.length === 0) {
      return {
        fileData: [],
        timelineStart: null,
        timelineEnd: null,
        totalDays: 0
      }
    }

    // Calculate overall timeline bounds (with some padding)
    let timelineStart = null
    let timelineEnd = null

    for (const file of fileData) {
      if (!timelineStart || file.dataStartDate < timelineStart) {
        timelineStart = file.dataStartDate
      }
      if (!timelineEnd || file.dataEndDate > timelineEnd) {
        timelineEnd = file.dataEndDate
      }
    }

    // Add 2% padding on each side for visual breathing room
    const totalMs = timelineEnd - timelineStart
    const padding = totalMs * 0.02
    timelineStart = new Date(timelineStart.getTime() - padding)
    timelineEnd = new Date(timelineEnd.getTime() + padding)

    const totalDays = Math.ceil((timelineEnd - timelineStart) / (1000 * 60 * 60 * 24))

    // Sort files by data start date
    fileData.sort((a, b) => a.dataStartDate - b.dataStartDate)

    return {
      fileData,
      timelineStart,
      timelineEnd,
      totalDays
    }
  }, [files, incidents])
}

export default useFileTimelineData
