import React from 'react'
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import AnomalyAlert from './AnomalyAlert'

/**
 * AnomalyDetectionPanel - Container for anomaly detection results
 */
const AnomalyDetectionPanel = ({ data, onAnomalyClick }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 bg-surface-50 rounded-lg border border-surface-200">
        <p className="text-sm text-surface-500">Loading anomaly detection...</p>
      </div>
    )
  }

  const { anomalies, changePoints, summary, stats } = data

  const hasAnomalies = anomalies && anomalies.length > 0
  const hasChangePoints = changePoints && changePoints.length > 0

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
          <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
            Total Anomalies
          </p>
          <p className="text-xl font-bold text-surface-800 mt-1">
            {summary?.totalAnomalies || 0}
          </p>
        </div>

        <div className="p-3 bg-safety-critical-light rounded-lg border border-safety-critical/20">
          <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
            Spikes Detected
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp size={18} className="text-safety-critical" />
            <span className="text-xl font-bold text-safety-critical">
              {summary?.spikes || 0}
            </span>
          </div>
        </div>

        <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
            Drops Detected
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingDown size={18} className="text-primary-600" />
            <span className="text-xl font-bold text-primary-600">
              {summary?.drops || 0}
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
            High Severity
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <AlertTriangle size={18} className="text-amber-600" />
            <span className="text-xl font-bold text-amber-600">
              {summary?.highSeverity || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Detection Parameters */}
      {stats && (
        <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
          <p className="text-xs font-semibold text-surface-600 mb-2">Detection Parameters</p>
          <div className="flex flex-wrap gap-4 text-xs text-surface-500">
            <span>Mean: <strong className="text-surface-700">{stats.mean}</strong> obs/day</span>
            <span>Std Dev: <strong className="text-surface-700">{stats.stdDev}</strong></span>
            <span>Threshold: <strong className="text-surface-700">±{stats.threshold}</strong> std devs</span>
          </div>
        </div>
      )}

      {/* No Anomalies State */}
      {!hasAnomalies && !hasChangePoints && (
        <div className="p-6 bg-safety-success-light rounded-lg border border-safety-success/20 text-center">
          <CheckCircle size={32} className="mx-auto mb-2 text-safety-success" />
          <p className="text-sm font-medium text-safety-success">No Anomalies Detected</p>
          <p className="text-xs text-surface-600 mt-1">
            All observation patterns are within normal statistical range
          </p>
        </div>
      )}

      {/* Anomaly List */}
      {hasAnomalies && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
            Statistical Outliers ({anomalies.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {anomalies.map((anomaly, index) => (
              <AnomalyAlert
                key={`${anomaly.date}-${index}`}
                anomaly={anomaly}
                onClick={() => onAnomalyClick && onAnomalyClick(anomaly)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Change Points */}
      {hasChangePoints && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
            Significant Change Points ({changePoints.length})
          </h4>
          <div className="space-y-2">
            {changePoints.map((cp, index) => (
              <div
                key={`cp-${index}`}
                className={`p-3 rounded-lg border ${
                  cp.type === 'increase'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity
                      size={16}
                      className={cp.type === 'increase' ? 'text-amber-600' : 'text-blue-600'}
                    />
                    <span className="text-sm font-medium text-surface-800">
                      {cp.dateLabel}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      cp.type === 'increase' ? 'text-amber-600' : 'text-blue-600'
                    }`}
                  >
                    {cp.type === 'increase' ? '+' : ''}{cp.magnitude}%
                  </span>
                </div>
                <p className="text-xs text-surface-600 mt-1">
                  Baseline shifted from {cp.before} to {cp.after} obs/day
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(AnomalyDetectionPanel)
