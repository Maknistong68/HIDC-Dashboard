import { useMemo, memo } from 'react'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

const formatTypeName = (type) => {
  if (!type) return 'Unknown'
  switch (type.toLowerCase()) {
    case 'near-miss': return 'Near-Miss'
    case 'fac': return 'FAC'
    case 'mti': return 'MTI'
    case 'lti': return 'LTI'
    case 'positive': return 'Positive'
    case 'unsafe-act': return 'Unsafe Act'
    case 'unsafe-condition': return 'Unsafe Cond.'
    case 'ncr': return 'NCR'
    default: return type
  }
}

const TrendArrow = ({ trend }) => {
  if (trend === 'increasing') return <TrendingUp size={10} className="text-red-500" />
  if (trend === 'decreasing') return <TrendingDown size={10} className="text-green-500" />
  return <Minus size={10} className="text-surface-400" />
}

const TYPE_COLORS = {
  'near-miss': '#3b82f6', 'fac': '#f59e0b', 'mti': '#f97316', 'lti': '#ef4444',
  'unsafe-act': '#8b5cf6', 'unsafe-condition': '#ec4899', 'ncr': '#6366f1', 'positive': '#22c55e'
}

const IncidentTypeOutlook = ({ typeProbability, onShowBreakdown }) => {
  const types = useMemo(() => {
    return typeProbability?.types?.map(t => ({
      type: t.type, name: formatTypeName(t.type),
      probability: t.probability,
      color: t.color || TYPE_COLORS[t.type?.toLowerCase()] || '#94a3b8',
      trend: t.trend
    })).filter(t => t.probability > 0) || []
  }, [typeProbability])

  const summaryText = useMemo(() => {
    if (!types.length) return null
    const sorted = [...types].sort((a, b) => b.probability - a.probability)
    const top = sorted.slice(0, 2).map(t => `${t.name} (${Math.round(t.probability)}%)`)
    const lti = types.find(t => t.type?.toLowerCase() === 'lti')
    let note = ''
    if (lti && lti.probability > 2) note = ` LTI risk is ${Math.round(lti.probability)}%${lti.trend === 'increasing' ? ' and trending upward' : ''}.`
    return `Most likely: ${top.join(' or ')}.${note}`
  }, [types])

  if (!typeProbability?.hasData) return null

  return (
    <div className="bg-surface-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-surface-600">What Types Are Most Likely?</h4>
        {onShowBreakdown && (
          <button onClick={() => onShowBreakdown('typeProbability')} className="text-2xs text-primary-500 hover:text-primary-700 flex items-center gap-0.5">
            <Info size={10} /> Details
          </button>
        )}
      </div>
      {summaryText && <p className="text-2xs text-surface-500 mb-2 italic">{summaryText}</p>}
      <div className="h-5 flex rounded-full overflow-hidden mb-2">
        {types.map(t => (
          <div key={t.type} className="h-full relative group" style={{ width: `${Math.max(t.probability, 1)}%`, backgroundColor: t.color }}
            title={`${t.name}: ${Math.round(t.probability)}%`}>
            {t.probability >= 12 && <span className="absolute inset-0 flex items-center justify-center text-white text-2xs font-bold">{Math.round(t.probability)}%</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {types.map(t => (
          <div key={t.type} className="flex items-center gap-1 text-2xs">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
            <span className="text-surface-600">{t.name}</span>
            <span className="font-semibold text-surface-700">{Math.round(t.probability)}%</span>
            <TrendArrow trend={t.trend} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(IncidentTypeOutlook)
