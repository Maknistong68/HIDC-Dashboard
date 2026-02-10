import React, { useState, useMemo, useTransition, useCallback } from 'react'
import DrillDownModal from '../common/DrillDownModal'
import { InfoTooltip } from '../ui/Tooltip'
import { Card } from '../ui'
import { RECORDABLE_INCIDENT_TYPES } from '../../utils/constants'

/**
 * IncidentPyramid - Safety pyramid visualization with drill-down
 * Click any level → Insights tab with all records for that type (like hazards/observers)
 */
const IncidentPyramid = ({ data, pyramidData, showOpenClosed, incidents = [] }) => {
  const [selectedType, setSelectedType] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [, startTransition] = useTransition()

  // Safety pyramid levels (severity gradient) - Triangle shape: narrower at top, wider at bottom
  const pyramidLevels = [
    {
      key: 'incident',
      label: 'Incident (LTI/MTI/FAC/Property Damage)',
      color: 'var(--color-critical)',
      bgColor: 'var(--color-critical-light)',
      colorClass: 'text-safety-critical',
      bgClass: 'bg-safety-critical-light',
    },
    {
      key: 'near-miss',
      label: 'Near Miss',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-light)',
      colorClass: 'text-safety-warning',
      bgClass: 'bg-safety-warning-light',
    },
    {
      key: 'ncr',
      label: 'Non-Conformance',
      color: '#9333ea',
      bgColor: '#f3e8ff',
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-100',
    },
    {
      key: 'unsafe-act',
      label: 'Unsafe Act',
      color: 'var(--color-caution)',
      bgColor: 'var(--color-caution-light)',
      colorClass: 'text-safety-caution',
      bgClass: 'bg-safety-caution-light',
    },
    {
      key: 'unsafe-condition',
      label: 'Unsafe Condition',
      color: '#65a30d',
      bgColor: '#ecfccb',
      colorClass: 'text-lime-600',
      bgClass: 'bg-lime-100',
    },
    {
      key: 'positive',
      label: 'Positive Observation',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      colorClass: 'text-safety-success',
      bgClass: 'bg-safety-success-light',
    },
    {
      key: 'leadership',
      label: 'Leadership Event',
      color: '#0891b2',
      bgColor: '#cffafe',
      colorClass: 'text-cyan-600',
      bgClass: 'bg-cyan-100',
    },
  ]

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

  // Get all incidents for selected type
  const filteredIncidents = useMemo(() => {
    if (!selectedType || !incidents.length) return []
    if (selectedType === 'incident') {
      return incidents.filter(i => RECORDABLE_INCIDENT_TYPES.includes(i.type))
    }
    return incidents.filter(i => i.type === selectedType)
  }, [selectedType, incidents])

  const getTypeLabel = (type) => {
    return pyramidLevels.find(l => l.key === type)?.label || type
  }

  // Only show insights for negative observation types (not positive/leadership)
  const negativeTypes = ['unsafe-condition', 'unsafe-act', 'near-miss', 'ncr', 'incident']
  const shouldShowInsights = negativeTypes.includes(selectedType) && filteredIncidents.length > 0

  const modalTitle = selectedType
    ? shouldShowInsights
      ? `${getTypeLabel(selectedType)} Insights`
      : `${getTypeLabel(selectedType)} - ${filteredIncidents.length} Records`
    : ''
  const breadcrumb = selectedType ? ['Observation Categories', getTypeLabel(selectedType)] : []

  return (
    <Card padding="default" className="h-full">
      <Card.Header>
        <Card.Title>
          Observation Categories
          <InfoTooltip text="HOW THIS PYRAMID IS BUILT: We look at the 'Type' field of each observation and count how many fall into each category. The pyramid shape represents severity - most serious at the top, least serious at the bottom. INCIDENT (top, red): Actual injuries or property damage (LTI, MTI, FAC, Property Damage, Environmental, Security). Click to see breakdown. NEAR MISS: Something almost happened but didn't cause harm. NCR: Non-conformance to safety rules. UNSAFE ACT: A person doing something dangerous. UNSAFE CONDITION: A dangerous situation in the environment. POSITIVE: Someone spotted doing something SAFELY. LEADERSHIP: Management safety activities. Click any level to see the actual observations. The numbers show open/closed status if enabled." />
        </Card.Title>
      </Card.Header>

      {/* Pyramid Levels */}
      <div className="flex flex-col justify-center space-y-2">
        {pyramidLevels.map((level, index) => {
          const count = data[level.key] || 0
          const statusData = pyramidData?.[level.key] || { open: 0, closed: 0 }
          const total = statusData.open + statusData.closed
          const openPercent = total > 0 ? (statusData.open / total) * 100 : 0
          const closedPercent = total > 0 ? (statusData.closed / total) * 100 : 0
          const widthPercent = 35 + (index * 10)

          return (
            <div key={level.key} className="flex justify-center">
              <button
                className={`
                  relative flex items-center justify-between
                  transition-all duration-200 ease-out
                  hover:ring-2 hover:ring-surface-400 hover:ring-offset-2
                  active:ring-2 active:ring-surface-500 active:ring-offset-2
                  active:scale-[0.99]
                  focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                  rounded-sm overflow-hidden touch-target
                `}
                style={{
                  width: `${widthPercent}%`,
                  minHeight: '52px',
                  backgroundColor: showOpenClosed ? '#f1f5f9' : level.bgColor,
                  borderLeft: `4px solid ${level.color}`,
                }}
                onClick={() => handleTypeClick(level.key)}
                aria-label={`${level.label}: ${total || count} observations. Tap to view details.`}
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
                <div className="relative z-10 w-full flex items-center justify-between px-3 py-2">
                  <span
                    className="font-medium text-sm"
                    style={{ color: level.color }}
                  >
                    {level.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {showOpenClosed && total > 0 && (
                      <span className="text-xs text-surface-500">
                        {statusData.open}o / {statusData.closed}c
                      </span>
                    )}
                    <span
                      className="font-bold text-lg tabular-nums"
                      style={{ color: level.color }}
                    >
                      {total || count}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-surface-400 text-center mt-3">
        Tap any level to drill down
      </p>

      {/* Drill-Down Modal - Shows insights for negative types only */}
      <DrillDownModal
        isOpen={modalOpen && selectedType !== null}
        onClose={handleClose}
        title={modalTitle}
        data={filteredIncidents}
        type="records"
        breadcrumb={breadcrumb}
        source="Observation Categories"
        showInsights={shouldShowInsights}
        insightsMode="category"
        insightsData={shouldShowInsights ? {
          categoryType: selectedType,
          categoryIncidents: filteredIncidents,
          allIncidents: incidents
        } : null}
      />
    </Card>
  )
}

export default React.memo(IncidentPyramid)
