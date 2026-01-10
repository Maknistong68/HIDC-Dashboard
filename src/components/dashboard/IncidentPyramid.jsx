import React, { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import DrillDownModal from '../common/DrillDownModal'
import { InfoTooltip } from '../ui/Tooltip'
import { Card } from '../ui'

/**
 * IncidentPyramid - Safety pyramid visualization with drill-down
 */
const IncidentPyramid = ({ data, pyramidData, showOpenClosed, incidents = [] }) => {
  const [selectedType, setSelectedType] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  const handleTypeClick = (typeKey) => {
    setSelectedType(typeKey)
    setSelectedMonth(null)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setSelectedType(null)
    setSelectedMonth(null)
  }

  const handleBack = () => {
    setSelectedMonth(null)
  }

  const handleMonthSelect = (monthData) => {
    setSelectedMonth(monthData.period)
  }

  const filteredIncidents = useMemo(() => {
    if (!selectedType || !incidents.length) return []
    const incidentTypes = ['lti', 'mti', 'fac']
    if (selectedType === 'incident') {
      return incidents.filter(i => incidentTypes.includes(i.type))
    }
    return incidents.filter(i => i.type === selectedType)
  }, [selectedType, incidents])

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

  const monthIncidents = useMemo(() => {
    if (!selectedMonth) return []
    return filteredIncidents.filter(i => i.date?.substring(0, 7) === selectedMonth)
  }, [selectedMonth, filteredIncidents])

  const getTypeLabel = (type) => {
    return pyramidLevels.find(l => l.key === type)?.label || type
  }

  const breadcrumb = useMemo(() => {
    const crumbs = []
    if (selectedType) crumbs.push(getTypeLabel(selectedType))
    if (selectedMonth) {
      try {
        crumbs.push(format(parseISO(selectedMonth + '-01'), 'MMMM yyyy'))
      } catch {
        crumbs.push(selectedMonth)
      }
    }
    return crumbs
  }, [selectedType, selectedMonth])

  const modalTitle = selectedMonth
    ? `${getTypeLabel(selectedType)} - ${format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}`
    : `${getTypeLabel(selectedType)} - Monthly Breakdown`

  return (
    <Card padding="default" className="h-full">
      <Card.Header>
        <Card.Title>
          Observation Categories
          <InfoTooltip text="Safety pyramid showing observation distribution by severity. Click any level to drill down. Incidents (top) are most severe, Positive observations (bottom) indicate proactive safety culture." />
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
                  minHeight: '52px', // Slightly larger for touch
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

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={modalOpen && selectedType !== null}
        onClose={handleClose}
        title={selectedType ? modalTitle : ''}
        data={selectedMonth ? monthIncidents : monthlyBreakdown}
        type={selectedMonth ? 'records' : 'monthly'}
        onDrillDown={handleMonthSelect}
        onBack={handleBack}
        canGoBack={selectedMonth !== null}
        breadcrumb={breadcrumb}
      />
    </Card>
  )
}

export default IncidentPyramid
