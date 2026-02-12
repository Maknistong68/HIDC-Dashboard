import React, { useState, useMemo, useTransition, useCallback } from 'react'
import DrillDownModal from '../common/DrillDownModal'
import { InfoTooltip } from '../ui/Tooltip'
import { Card } from '../ui'
import { PYRAMID_SECTIONS } from '../../utils/constants'

/**
 * IncidentPyramid - Safety pyramid visualization as a true centered triangle
 *
 * All 18 levels are always shown (zero-count rows appear dimmed).
 * Sections separated by compact centered line dividers.
 * Click any level → Modal with Records table.
 */

// Pre-compute flat list of all types with their global index
const ALL_TYPES = PYRAMID_SECTIONS.flatMap(s => s.types)
const TOTAL_LEVELS = ALL_TYPES.length

const IncidentPyramid = ({ data, pyramidData, showOpenClosed, incidents = [] }) => {
  const [selectedType, setSelectedType] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [workRelatedOnly, setWorkRelatedOnly] = useState(true)
  const [, startTransition] = useTransition()

  const handleTypeClick = useCallback((typeKey) => {
    startTransition(() => {
      setSelectedType(typeKey)
      setModalOpen(true)
    })
  }, [])

  const handleClose = useCallback(() => {
    startTransition(() => {
      setModalOpen(false)
      setSelectedType(null)
    })
  }, [])

  // Filter incidents based on work-related toggle
  const displayIncidents = useMemo(() => {
    if (!workRelatedOnly) return incidents
    return incidents.filter(i => i.workRelated !== false)
  }, [incidents, workRelatedOnly])

  // Re-compute pyramid counts based on filtered incidents
  const localPyramidData = useMemo(() => {
    if (!workRelatedOnly) return pyramidData
    const result = {}
    PYRAMID_SECTIONS.forEach(section => {
      section.types.forEach(t => {
        result[t.key] = { open: 0, closed: 0 }
      })
    })
    displayIncidents.forEach(incident => {
      const typeKey = incident.type
      if (result[typeKey]) {
        if (incident.actionStatus === 'closed') {
          result[typeKey].closed++
        } else {
          result[typeKey].open++
        }
      }
    })
    return result
  }, [displayIncidents, pyramidData, workRelatedOnly])

  // Get all incidents for selected type
  const filteredIncidents = useMemo(() => {
    if (!selectedType || !displayIncidents.length) return []
    return displayIncidents.filter(i => i.type === selectedType)
  }, [selectedType, displayIncidents])

  // Get type label from PYRAMID_SECTIONS
  const getTypeLabel = useCallback((type) => {
    for (const section of PYRAMID_SECTIONS) {
      const found = section.types.find(t => t.key === type)
      if (found) return found.label
    }
    return type?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown'
  }, [])

  // Records-only modal (no insights charts)
  const modalTitle = selectedType
    ? `${getTypeLabel(selectedType)} - ${filteredIncidents.length} Records`
    : ''
  const breadcrumb = selectedType ? ['Safety Pyramid', getTypeLabel(selectedType)] : []

  // Track global index across sections
  let globalIdx = 0

  return (
    <Card padding="default" className="h-full">
      <Card.Header>
        <Card.Title>
          Safety Pyramid
          <InfoTooltip text="HOW THIS PYRAMID IS BUILT: Each observation is categorized by its Type and Consequence columns. The pyramid is organized by severity from top (most critical) to bottom (proactive). INJURY/ILLNESS: Fatality, Lost Time, Medical Treatment, First Aid. ENVIRONMENTAL: Major (P1), Moderate (P2), Minor (P3). PROPERTY DAMAGE: Light Vehicle, Heavy Plant, Truck & Trailer, Static Equipment. OBSERVATIONS: Near Miss, Non-Conformance, Unsafe Act, Unsafe Condition. PROACTIVE: Positive Observations, Leadership Events, Emergency Drills. Click any level to see records." />
        </Card.Title>
        {/* Work-Related Only slide toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
          <span className={`text-[11px] font-medium transition-colors ${workRelatedOnly ? 'text-amber-600' : 'text-surface-400'}`}>
            Work-Related Only
          </span>
          <button
            role="switch"
            aria-checked={workRelatedOnly}
            onClick={() => setWorkRelatedOnly(!workRelatedOnly)}
            className={`
              relative inline-flex h-5 w-9 items-center rounded-full
              transition-colors duration-200 ease-in-out
              focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              ${workRelatedOnly ? 'bg-amber-600/80' : 'bg-surface-300'}
            `}
          >
            <span
              className={`
                inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
                transition-transform duration-200 ease-in-out
                ${workRelatedOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'}
              `}
            />
          </button>
        </label>
      </Card.Header>

      {/* Centered Triangle Pyramid */}
      <div className="flex flex-col">
        {PYRAMID_SECTIONS.map((section, sectionIdx) => {
          const sectionRows = section.types.map((level) => {
            const idx = globalIdx
            globalIdx++

            const statusData = localPyramidData?.[level.key] || { open: 0, closed: 0 }
            const total = statusData.open + statusData.closed
            const openPercent = total > 0 ? (statusData.open / total) * 100 : 0
            const closedPercent = total > 0 ? (statusData.closed / total) * 100 : 0
            const isEmpty = total === 0

            // True triangle: centered, 15% at top → 100% at bottom
            const widthPercent = TOTAL_LEVELS > 1
              ? 15 + (idx / (TOTAL_LEVELS - 1)) * 85
              : 60

            return (
              <div key={level.key} className="flex justify-center">
                <button
                  className={`
                    relative flex items-center justify-between
                    transition-all duration-200 ease-out
                    hover:ring-1 hover:ring-surface-400 hover:ring-offset-1
                    active:scale-[0.99]
                    focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                    rounded-sm overflow-hidden
                    ${isEmpty ? 'opacity-40' : ''}
                  `}
                  style={{
                    width: `${widthPercent}%`,
                    minHeight: '28px',
                    backgroundColor: showOpenClosed && !isEmpty ? '#f1f5f9' : level.bgColor,
                    borderLeft: `3px solid ${level.color}`,
                  }}
                  onClick={() => handleTypeClick(level.key)}
                  aria-label={`${level.label}: ${total} observations. Tap to view details.`}
                >
                  {/* Open/Closed bars */}
                  {showOpenClosed && total > 0 && (
                    <div className="absolute inset-0 flex" aria-hidden="true">
                      {statusData.open > 0 && (
                        <div
                          className="h-full bg-safety-critical/30 transition-all duration-500"
                          style={{ width: `${openPercent}%` }}
                        />
                      )}
                      {statusData.closed > 0 && (
                        <div
                          className="h-full bg-safety-success/30 transition-all duration-500"
                          style={{ width: `${closedPercent}%` }}
                        />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 w-full flex items-center justify-between px-2 py-0.5">
                    <span
                      className="font-medium text-[11px] truncate"
                      style={{ color: isEmpty ? '#9ca3af' : level.color }}
                    >
                      {level.label}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {showOpenClosed && total > 0 && (
                        <span className="text-[9px] text-surface-500">
                          {statusData.open}o/{statusData.closed}c
                        </span>
                      )}
                      <span
                        className="font-bold text-xs tabular-nums"
                        style={{ color: isEmpty ? '#d1d5db' : level.color }}
                      >
                        {total}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            )
          })

          return (
            <div key={section.id}>
              {/* Section divider - compact centered line with label */}
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px bg-surface-200" />
                <span className="text-[9px] font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap">
                  {section.label}
                </span>
                <div className="flex-1 h-px bg-surface-200" />
              </div>

              {/* Section rows - no gaps between rows for tight triangle */}
              <div className="flex flex-col">
                {sectionRows}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-surface-400 text-center mt-2">
        Tap any level to drill down
      </p>

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={modalOpen && selectedType !== null}
        onClose={handleClose}
        title={modalTitle}
        data={filteredIncidents}
        type="records"
        breadcrumb={breadcrumb}
        source="Safety Pyramid"
        showInsights={true}
        insightsMode="category"
        insightsData={{
          categoryType: selectedType,
          categoryIncidents: filteredIncidents,
          allIncidents: displayIncidents
        }}
      />
    </Card>
  )
}

export default React.memo(IncidentPyramid)
