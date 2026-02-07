import React, { useMemo } from 'react'
import { Shield, TrendingUp, TrendingDown, Minus, Activity, Clock, BarChart3 } from 'lucide-react'
import {
  calculateSafetyCultureScore,
  calculateProactiveReactiveRatio,
  calculateObservationVelocity,
  getOverdueActionAlerts
} from '../../utils/insightsCalculations'

/**
 * KPI Card - Individual metric display
 */
const KPICard = ({ icon: Icon, iconColor, label, value, subtitle, status, statusColor, badge }) => (
  <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon size={16} className="text-white" />
        </div>
        <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">{label}</span>
      </div>
      {badge && (
        <span className={`text-2xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
          {badge.text}
        </span>
      )}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-surface-800">{value}</span>
      {subtitle && <span className="text-xs text-surface-500">{subtitle}</span>}
    </div>
    {status && (
      <div className={`flex items-center gap-1 text-xs ${statusColor || 'text-surface-500'}`}>
        {status.icon}
        <span>{status.text}</span>
      </div>
    )}
  </div>
)

/**
 * ExecutiveKPIRow - 4 executive KPI cards for Risk & Performance tab
 */
const ExecutiveKPIRow = ({ filteredIncidents, cultureWeights }) => {
  const cultureScore = useMemo(() => {
    if (!filteredIncidents?.length) return null
    return calculateSafetyCultureScore(filteredIncidents, cultureWeights)
  }, [filteredIncidents, cultureWeights])

  const proactiveRatio = useMemo(() => {
    if (!filteredIncidents?.length) return null
    return calculateProactiveReactiveRatio(filteredIncidents)
  }, [filteredIncidents])

  const velocity = useMemo(() => {
    if (!filteredIncidents?.length) return null
    return calculateObservationVelocity(filteredIncidents)
  }, [filteredIncidents])

  const overdueAlerts = useMemo(() => {
    if (!filteredIncidents?.length) return []
    return getOverdueActionAlerts(filteredIncidents)
  }, [filteredIncidents])

  const overdueStats = useMemo(() => {
    const critical = overdueAlerts.find(a => a.id === 'overdue-critical')
    const warning = overdueAlerts.find(a => a.id === 'overdue-warning')
    const attention = overdueAlerts.find(a => a.id === 'overdue-attention')
    return {
      critical: critical?.metric || 0,
      warning: warning?.metric || 0,
      attention: attention?.metric || 0,
      total: (critical?.metric || 0) + (warning?.metric || 0) + (attention?.metric || 0)
    }
  }, [overdueAlerts])

  if (!filteredIncidents?.length) {
    return (
      <div className="text-center py-6 text-sm text-surface-500">
        No data available for executive metrics.
      </div>
    )
  }

  const getCultureBadge = () => {
    if (!cultureScore) return null
    switch (cultureScore.level) {
      case 'good': return { text: 'Good', className: 'bg-green-100 text-green-700' }
      case 'warning': return { text: 'Warning', className: 'bg-amber-100 text-amber-700' }
      case 'critical': return { text: 'Critical', className: 'bg-red-100 text-red-700' }
      default: return null
    }
  }

  const getVelocityTrend = () => {
    if (!velocity) return null
    if (velocity.trend === 'increasing') return {
      icon: <TrendingUp size={12} />,
      text: `+${velocity.percentChange}% this period`
    }
    if (velocity.trend === 'decreasing') return {
      icon: <TrendingDown size={12} />,
      text: `${velocity.percentChange}% this period`
    }
    return {
      icon: <Minus size={12} />,
      text: 'Stable'
    }
  }

  const getVelocityColor = () => {
    if (!velocity) return 'text-surface-500'
    if (velocity.trend === 'increasing') return 'text-green-600'
    if (velocity.trend === 'decreasing') return 'text-amber-600'
    return 'text-surface-500'
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Safety Culture Score */}
      <KPICard
        icon={Shield}
        iconColor="bg-primary-500"
        label="Safety Culture"
        value={cultureScore ? `${cultureScore.score}/100` : '-'}
        badge={getCultureBadge()}
      />

      {/* Leading vs Lagging */}
      <KPICard
        icon={BarChart3}
        iconColor="bg-blue-500"
        label="Leading vs Lagging"
        value={proactiveRatio ? `${proactiveRatio.ratio}:1` : '-'}
        subtitle={`Target: ${proactiveRatio?.target || 10}:1`}
        status={proactiveRatio ? {
          icon: proactiveRatio.targetMet ? <TrendingUp size={12} /> : <TrendingDown size={12} />,
          text: proactiveRatio.targetMet ? 'Target met' : `Need ${proactiveRatio.gap} more proactive`
        } : null}
        statusColor={proactiveRatio?.targetMet ? 'text-green-600' : 'text-amber-600'}
      />

      {/* Observation Velocity */}
      <KPICard
        icon={Activity}
        iconColor="bg-emerald-500"
        label="Obs Velocity"
        value={velocity ? `${velocity.currentPeriod}` : '-'}
        subtitle={velocity ? `/ ${velocity.windowDays}d` : ''}
        status={getVelocityTrend()}
        statusColor={getVelocityColor()}
      />

      {/* Overdue Actions */}
      <KPICard
        icon={Clock}
        iconColor={overdueStats.critical > 0 ? 'bg-red-500' : overdueStats.warning > 0 ? 'bg-amber-500' : 'bg-green-500'}
        label="Overdue Actions"
        value={overdueStats.total}
        status={overdueStats.critical > 0 ? {
          icon: <Clock size={12} />,
          text: `${overdueStats.critical} critical (>60d)`
        } : overdueStats.warning > 0 ? {
          icon: <Clock size={12} />,
          text: `${overdueStats.warning} warning (30-60d)`
        } : {
          icon: <Shield size={12} />,
          text: 'All current'
        }}
        statusColor={overdueStats.critical > 0 ? 'text-red-600' : overdueStats.warning > 0 ? 'text-amber-600' : 'text-green-600'}
      />
    </div>
  )
}

export default React.memo(ExecutiveKPIRow)
