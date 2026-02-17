import React, { useMemo, useState } from 'react'
import { Info, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

const DataConfidenceFooter = ({ negativeIncidents, weekly }) => {
  const [showCaveats, setShowCaveats] = useState(false)

  const stats = useMemo(() => {
    if (!negativeIncidents?.length) return { observations: 0, days: 0, confidence: 'Low', color: 'red', small: true }
    const dates = new Set()
    for (const inc of negativeIncidents) {
      const d = inc.date?.substring(0, 10)
      if (d) dates.add(d)
    }
    const observations = negativeIncidents.length
    const days = dates.size
    let confidence = 'Moderate', color = 'amber'
    if (days >= 60 && observations >= 100) { confidence = 'High'; color = 'green' }
    else if (days < 30 || observations < 30) { confidence = 'Low'; color = 'red' }
    return { observations, days, confidence, color, small: days < 30 }
  }, [negativeIncidents])

  const badgeClass = { High: 'bg-green-100 text-green-700', Moderate: 'bg-amber-100 text-amber-700', Low: 'bg-red-100 text-red-700' }

  return (
    <div className="bg-surface-50 rounded-lg border border-surface-200 px-4 py-2.5">
      {stats.small && stats.days > 0 && (
        <div className="flex items-center gap-1.5 text-2xs text-amber-600 mb-1.5">
          <AlertTriangle size={12} />
          <span>Small sample: {stats.days} days of data. Predictions may be less reliable.</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-surface-500">
        <span className="flex items-center gap-1">
          <Info size={12} className="text-surface-400" />
          Based on <span className="font-semibold text-surface-700">{stats.observations.toLocaleString()}</span> observations over <span className="font-semibold text-surface-700">{stats.days}</span> days
        </span>
        <span className="text-surface-300 hidden sm:inline">&middot;</span>
        <span>Confidence: <span className={`px-1 py-0.5 rounded text-2xs font-semibold ${badgeClass[stats.confidence]}`}>{stats.confidence}</span></span>
        <span className="text-surface-300 hidden sm:inline">&middot;</span>
        <button onClick={() => setShowCaveats(!showCaveats)} className="text-primary-500 hover:text-primary-700 flex items-center gap-0.5">
          Caveats {showCaveats ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>
      {showCaveats && (
        <ul className="mt-2 pt-2 border-t border-surface-200 space-y-1 text-2xs text-surface-500 list-disc list-inside">
          <li>Predictions assume current trends continue. Operational changes may alter outcomes.</li>
          <li>Control effectiveness (75%/50%/30%) are industry benchmarks, not site-calibrated.</li>
          <li>Simulation uses {stats.observations} data points. Results may vary with new data.</li>
        </ul>
      )}
    </div>
  )
}

export default React.memo(DataConfidenceFooter)
