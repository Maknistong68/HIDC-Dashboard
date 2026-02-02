import React, { useState, useMemo } from 'react'
import { Target } from 'lucide-react'
import HazardTrendChart from './HazardTrendChart'
import RootCausePanel from './RootCausePanel'
import { getHazardDailyData } from '../../utils/insightsCalculations'
import { aggregateRootCausesForHazard, getObservationTypeStats } from '../../utils/rootCauseEngine'

/**
 * ObservationTypeIndicator - Simplified positive/negative display
 */
const ObservationTypeIndicator = ({ stats }) => {
  if (!stats || stats.total === 0) return null

  const positivePercent = parseFloat(stats.positive.percentage)
  const negativePercent = parseFloat(stats.negative.percentage)

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-surface-500">
        Positive: <span className="font-medium text-green-600">{stats.positive.count}</span>
      </span>
      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden flex max-w-[120px]">
        <div className="h-full bg-green-500" style={{ width: `${positivePercent}%` }} />
        <div className="h-full bg-red-400" style={{ width: `${negativePercent}%` }} />
      </div>
      <span className="text-xs text-surface-500">
        Negative: <span className="font-medium text-red-500">{stats.negative.count}</span>
      </span>
    </div>
  )
}

/**
 * HazardDetailPanel - Right panel with tabs for Trend Chart, Site Issues, and Good Practices
 * Note: incidents prop is already filtered by time period from parent component
 */
const HazardDetailPanel = ({ hazard, incidents, timePeriod }) => {
  const [activeTab, setActiveTab] = useState('chart')

  // Calculate chart data (daily)
  const chartData = useMemo(() => {
    if (!hazard || !incidents) return null
    return getHazardDailyData(incidents, hazard.name, timePeriod)
  }, [hazard, incidents, timePeriod])

  // Calculate observation type stats
  const obsTypeStats = useMemo(() => {
    if (!hazard || !incidents) return null
    return getObservationTypeStats(incidents, hazard.name)
  }, [hazard, incidents])

  // Calculate negative observations (Site Issues)
  const negativeData = useMemo(() => {
    if (!hazard || !incidents) return null
    return aggregateRootCausesForHazard(incidents, hazard.name, 'negative')
  }, [hazard, incidents])

  // Calculate positive observations (Good Practices)
  const positiveData = useMemo(() => {
    if (!hazard || !incidents) return null
    return aggregateRootCausesForHazard(incidents, hazard.name, 'positive')
  }, [hazard, incidents])

  const tabs = [
    { id: 'chart', label: 'Trend' },
    {
      id: 'negative',
      label: 'Factors',
      count: obsTypeStats?.negative?.count || 0
    },
    {
      id: 'positive',
      label: 'Positive',
      count: obsTypeStats?.positive?.count || 0
    }
  ]

  // Show placeholder when no hazard is selected
  if (!hazard) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <Target size={24} className="text-surface-400" />
          </div>
          <h3 className="text-base font-semibold text-surface-700 mb-1">No Hazard Selected</h3>
          <p className="text-sm text-surface-500">Select a hazard from the list to view details</p>
        </div>
      </div>
    )
  }

  // Check if sample size is low for reliability warning
  const hasLowSampleSize = hazard.totalCount < 5
  const hasMediumSampleSize = hazard.totalCount >= 5 && hazard.totalCount < 20

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-surface-200 overflow-hidden">
      {/* Header with observation type indicator and data quality warning */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        {obsTypeStats && obsTypeStats.total > 0 ? (
          <ObservationTypeIndicator stats={obsTypeStats} />
        ) : (
          <div />
        )}
        {/* Data quality warning for low sample sizes */}
        {hasLowSampleSize && (
          <span className="text-2xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1" title="Low sample size - trends may be unreliable">
            <span>⚠</span> Low data
          </span>
        )}
        {hasMediumSampleSize && (
          <span className="text-2xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded" title="Moderate sample size - trends should be verified">
            Moderate data
          </span>
        )}
      </div>

      {/* Cleaner tab buttons */}
      <div className="flex border-b border-surface-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-sm transition-all duration-150
                ${isActive
                  ? 'text-primary-600 border-b-2 border-primary-500 font-medium'
                  : 'text-surface-500 hover:text-surface-700'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs text-surface-400">
                  · {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-3 overflow-auto">
        {activeTab === 'chart' && (
          <HazardTrendChart
            data={chartData}
            hazardName={hazard?.name}
            timePeriod={timePeriod}
          />
        )}
        {activeTab === 'negative' && (
          <RootCausePanel
            data={negativeData}
            hazardName={hazard.name}
            incidents={incidents}
            observationType="negative"
            title="Factors"
            subtitle="Root causes identified"
            emptyMessage="No deficiencies found"
          />
        )}
        {activeTab === 'positive' && (
          <RootCausePanel
            data={positiveData}
            hazardName={hazard.name}
            incidents={incidents}
            observationType="positive"
            title="Good Practices"
            subtitle="Positive observations"
            emptyMessage="No positive observations recorded"
            colorScheme="green"
          />
        )}
      </div>
    </div>
  )
}

export default React.memo(HazardDetailPanel)
