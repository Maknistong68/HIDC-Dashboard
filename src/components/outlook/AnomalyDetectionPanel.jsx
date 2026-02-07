import React, { useMemo, useState } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { detectZScoreAnomalies, detectIQRAnomalies, detectChangePoints } from '../../utils/insightsCalculations'

/**
 * AnomalyDetectionPanel - Displays Z-Score, IQR anomalies and change points
 * For the Predictive & Simulation tab
 */
const ANOMALY_DISPLAY_LIMIT = 8
const CHANGEPOINT_DISPLAY_LIMIT = 5

const AnomalyDetectionPanel = ({ negativeIncidents }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(ANOMALY_DISPLAY_LIMIT)

  const zScoreData = useMemo(() => {
    if (!negativeIncidents?.length) return { anomalies: [], stats: null }
    return detectZScoreAnomalies(negativeIncidents)
  }, [negativeIncidents])

  const iqrData = useMemo(() => {
    if (!negativeIncidents?.length) return { anomalies: [], stats: null }
    return detectIQRAnomalies(negativeIncidents)
  }, [negativeIncidents])

  const changePointData = useMemo(() => {
    if (!negativeIncidents?.length) return { changePoints: [], windows: [] }
    return detectChangePoints(negativeIncidents)
  }, [negativeIncidents])

  // Merge and deduplicate anomalies
  const allAnomalies = useMemo(() => {
    const anomalyMap = new Map()

    zScoreData.anomalies?.forEach(a => {
      anomalyMap.set(a.date, {
        ...a,
        methods: ['Z-Score'],
        zScore: a.zScore
      })
    })

    iqrData.anomalies?.forEach(a => {
      if (anomalyMap.has(a.date)) {
        const existing = anomalyMap.get(a.date)
        existing.methods.push('IQR')
      } else {
        anomalyMap.set(a.date, {
          ...a,
          methods: ['IQR']
        })
      }
    })

    return Array.from(anomalyMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [zScoreData, iqrData])

  const totalAnomalies = allAnomalies.length
  const totalChangePoints = changePointData.changePoints?.length || 0
  const spikes = allAnomalies.filter(a => a.type === 'spike').length
  const drops = allAnomalies.filter(a => a.type === 'drop').length

  if (totalAnomalies === 0 && totalChangePoints === 0) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-surface-400" />
          <h3 className="text-sm font-semibold text-surface-700">Anomaly Detection</h3>
        </div>
        <p className="text-xs text-surface-500">No significant anomalies detected in the current data.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="anomaly-details"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-surface-800">Anomaly Detection</h3>
          <div className="flex items-center gap-1.5">
            {spikes > 0 && (
              <span className="text-2xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp size={10} /> {spikes} spike{spikes > 1 ? 's' : ''}
              </span>
            )}
            {drops > 0 && (
              <span className="text-2xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingDown size={10} /> {drops} drop{drops > 1 ? 's' : ''}
              </span>
            )}
            {totalChangePoints > 0 && (
              <span className="text-2xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                {totalChangePoints} change point{totalChangePoints > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
      </button>

      {isExpanded && (
        <div id="anomaly-details" className="border-t border-surface-200 p-4 space-y-4">
          {/* Anomaly Timeline */}
          {allAnomalies.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wide mb-2">
                Anomalies ({allAnomalies.length})
              </h4>
              <div className="space-y-2 max-h-[30vh] md:max-h-48 overflow-y-auto">
                {allAnomalies.slice(0, displayLimit).map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 border ${
                      anomaly.type === 'spike'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {anomaly.type === 'spike'
                        ? <TrendingUp size={14} className="text-red-500" />
                        : <TrendingDown size={14} className="text-blue-500" />
                      }
                      <div>
                        <span className="font-medium text-surface-700">{anomaly.dateLabel}</span>
                        <span className="text-surface-400 ml-2">{anomaly.value} incidents</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {anomaly.methods.map(m => (
                        <span key={m} className="text-2xs bg-white px-1.5 py-0.5 rounded border border-surface-200">
                          {m}
                        </span>
                      ))}
                      <span className={`font-semibold ${
                        anomaly.severity === 'high' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {allAnomalies.length > displayLimit && (
                <button
                  onClick={() => setDisplayLimit(prev => prev + ANOMALY_DISPLAY_LIMIT)}
                  className="w-full text-center text-xs text-primary-600 py-2 mt-1 hover:bg-surface-50 rounded transition-colors"
                >
                  Show {Math.min(ANOMALY_DISPLAY_LIMIT, allAnomalies.length - displayLimit)} more of {allAnomalies.length} total
                </button>
              )}
            </div>
          )}

          {/* Change Points */}
          {changePointData.changePoints?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wide mb-2">
                Significant Change Points
              </h4>
              <div className="space-y-2">
                {changePointData.changePoints.slice(0, 5).map((cp, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 border ${
                      cp.type === 'increase'
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-green-50 border-green-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className={cp.type === 'increase' ? 'text-amber-500' : 'text-green-500'} />
                      <span className="font-medium text-surface-700">{cp.dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-surface-500">
                      <span>{cp.before}/day</span>
                      <span className="text-surface-300">&rarr;</span>
                      <span>{cp.after}/day</span>
                      <span className={`font-semibold ${cp.type === 'increase' ? 'text-red-600' : 'text-green-600'}`}>
                        {cp.type === 'increase' ? '+' : '-'}{cp.magnitude}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {zScoreData.stats && (
            <div className="flex items-center gap-4 text-2xs text-surface-400 pt-2 border-t border-surface-100">
              <span>Daily avg: {zScoreData.stats.mean}</span>
              <span>Std dev: {zScoreData.stats.stdDev}</span>
              <span>Z-threshold: {zScoreData.stats.threshold}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(AnomalyDetectionPanel)
