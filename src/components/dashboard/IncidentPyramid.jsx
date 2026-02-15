import React, { useState, useMemo, useTransition, useCallback } from 'react'
import DrillDownModal from '../common/DrillDownModal'
import { InfoTooltip } from '../ui/Tooltip'
import { Card } from '../ui'
import { PYRAMID_SECTIONS, ENV_SUB_TYPES, DMG_SUB_TYPES } from '../../utils/constants'

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

  // Get all incidents for selected type (incidents are already globally filtered by work-related toggle)
  // For consolidated types, include all sub-types (e.g. environmental → env-major/moderate/minor)
  const filteredIncidents = useMemo(() => {
    if (!selectedType || !incidents.length) return []
    if (selectedType === 'environmental') {
      return incidents.filter(i => ENV_SUB_TYPES.has(i.type) || i.type === 'environmental')
    }
    if (selectedType === 'damage-to-property') {
      return incidents.filter(i => DMG_SUB_TYPES.has(i.type) || i.type === 'damage-to-property' || i.type === 'property-damage')
    }
    return incidents.filter(i => i.type === selectedType)
  }, [selectedType, incidents])

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
      </Card.Header>

      {/* Centered Triangle Pyramid */}
      <div className="flex flex-col">
        {PYRAMID_SECTIONS.map((section, sectionIdx) => {
          const sectionRows = section.types.map((level) => {
            const idx = globalIdx
            globalIdx++

            const statusData = pyramidData?.[level.key] || { open: 0, closed: 0 }
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
          allIncidents: incidents
        }}
      />
    </Card>
  )
}

export default React.memo(IncidentPyramid)
