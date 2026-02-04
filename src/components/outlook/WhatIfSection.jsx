import React from 'react'
import { Sparkles } from 'lucide-react'
import HazardWhatIfSimulator from './HazardWhatIfSimulator'

/**
 * WhatIfSection - Compact What-If simulation panel at bottom of detail panel
 * Shows context-specific simulation based on selected hazard
 */
const WhatIfSection = ({
  hazard = null,
  incidents,
  timePeriod
}) => {
  // Don't render if no hazard context
  if (!hazard) {
    return null
  }

  return (
    <div className="flex-shrink-0 border-t border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white">
      {/* Compact Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-100/50">
        <div className="p-1 rounded bg-emerald-100">
          <Sparkles size={12} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-emerald-800">
            What-If Simulation
          </span>
          <span className="text-[10px] text-emerald-600 ml-2">
            Adjust interventions to see projected impact
          </span>
        </div>
      </div>

      {/* Simulator Content */}
      <div className="p-3">
        <HazardWhatIfSimulator
          hazard={hazard}
          incidents={incidents}
          timePeriod={timePeriod}
        />
      </div>
    </div>
  )
}

export default React.memo(WhatIfSection)
