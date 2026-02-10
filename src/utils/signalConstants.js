import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import React from 'react'

/**
 * Signal Constants - Shared across EntityDetailPanel, SignalPriorityList, SignalDetailCard
 */

export const SIGNAL_LABELS = {
  severityMix: 'Injury Severity',
  trend: 'Trend (60d)',
  openActionRate: 'Open Actions',
  highRiskExposure: 'High-Risk Exposure',
  nearMissRate: 'Near-Miss Rate',
  positiveRate: 'Positive Rate'
}

export const SIGNAL_META = {
  severityMix: {
    tooltip:
      'HOW THIS IS CALCULATED: We look at the proportion of incidents classified as serious injuries (LTI — Lost Time Injury, or MTI — Medical Treatment Injury) relative to all incidents. A higher score means a larger share of incidents resulted in serious harm. For example, a score of 60 means roughly 60% of incidents were LTI or MTI. A low score means most incidents are minor — that is what you want to see.',
    inverted: false,
    interpret: (s) =>
      s === 0
        ? 'No severe injuries — good'
        : s <= 30
          ? 'Low severity ratio'
          : s <= 60
            ? 'Moderate severity — review needed'
            : 'High severity — immediate attention needed'
  },
  trend: {
    tooltip:
      'HOW THIS IS CALCULATED: We compare the number of incidents in the most recent 60-day window against the previous 60-day window. Using 60 days provides smoother trend detection that filters out short-term noise. A score of 0 means incidents dropped or stayed flat. A score above 60 means a significant increase. A "spike" indicator appears if the last 30 days are significantly higher than the 60-day average.',
    inverted: false,
    interpret: (s) =>
      s <= 30
        ? 'Declining or stable trend'
        : s <= 60
          ? 'Slightly increasing activity'
          : 'Significant increase in recent incidents'
  },
  openActionRate: {
    tooltip:
      'HOW THIS IS CALCULATED: We count how many incidents still have unresolved corrective actions (status "open" or "in-progress") as a percentage of total incidents. A score of 80 means 80% of incidents have outstanding actions that haven\'t been closed. High scores indicate follow-through problems — incidents are being reported but fixes aren\'t being completed.',
    inverted: false,
    interpret: (s) =>
      s <= 10
        ? 'Almost all actions closed — good'
        : s <= 30
          ? 'Some actions still open'
          : s <= 60
            ? 'Many unresolved actions — follow up needed'
            : 'Most actions unresolved — escalation needed'
  },
  highRiskExposure: {
    tooltip:
      'HOW THIS IS CALCULATED: We measure the percentage of incidents that involve major hazard categories — Working at Height, Lifting Operations, Confined Space, Electrical, Excavation, and Hot Work. These are activities with higher potential for fatality or serious injury. A high score means a large share of this entity\'s work involves inherently dangerous tasks, which demands stronger risk controls.',
    inverted: false,
    interpret: (s) =>
      s <= 30
        ? 'Low exposure to major hazards'
        : s <= 60
          ? 'Moderate exposure — ensure controls are in place'
          : 'High exposure to major hazards — verify risk controls'
  },
  nearMissRate: {
    tooltip:
      'HOW THIS IS CALCULATED: This is an INVERTED signal — a higher score means HIGHER risk. We measure what percentage of site-months meet the target of 2 near-misses per site per month. If few site-months meet this target, workers may not be reporting hazards before they cause harm. A high bar here means "most sites below target" which is a warning sign. Good teams consistently report 2+ near-misses per site per month — it shows hazard awareness.',
    inverted: true,
    invertedNote: 'Low reporting = higher risk',
    interpret: (s) =>
      s <= 30
        ? 'Good near-miss reporting (80%+ site-months meet target)'
        : s <= 60
          ? 'Moderate reporting — some sites below 2/month target'
          : 'Very low near-miss reporting — most sites below 2/month target'
  },
  positiveRate: {
    tooltip:
      'HOW THIS IS CALCULATED: This is an INVERTED signal — a higher score means HIGHER risk. We measure the rate of positive safety observations (good catches, safe behaviors) relative to total observations. When positive observations are rare, it suggests workers aren\'t engaged in proactive safety. A high bar here means "very few positive observations" — the workforce may only report when things go wrong, not when things go right.',
    inverted: true,
    invertedNote: 'Fewer positives = higher risk',
    interpret: (s) =>
      s <= 30
        ? 'Strong positive observation rate'
        : s <= 60
          ? 'Moderate — encourage more positive reporting'
          : 'Low positive observations — safety culture concern'
  }
}

export const INVERTED_EXPLANATIONS = {
  nearMissRate: {
    high: "Almost no near-miss reports are being filed. This is a red flag — it usually means workers are not identifying hazards before they cause harm, or they don't feel comfortable reporting. Healthy teams report many near-misses for every actual incident.",
    moderate:
      'Near-miss reporting is below what we\'d expect. It may indicate that some hazards are going unnoticed or unreported. Consider running a near-miss awareness campaign or making reporting easier.',
    smallSample:
      'Sample size too small for reliable culture assessment. With fewer than 20 incidents, low near-miss rates could reflect limited exposure rather than under-reporting. Collect more data before drawing conclusions.'
  },
  positiveRate: {
    high: 'Very few positive safety observations are being recorded. This suggests the safety culture may be reactive — people only report when something goes wrong, not when things go right. Encouraging positive observations helps reinforce safe behaviors.',
    moderate:
      "Positive observations are lower than ideal. Teams with strong safety cultures typically record more \"good catches\" and safe behavior observations. Consider recognizing and rewarding proactive safety reporting.",
    smallSample:
      'Sample size too small for reliable culture assessment. With fewer than 20 incidents, low positive observation rates may not indicate a culture problem. Continue monitoring as more data becomes available.'
  }
}

export const SIGNAL_ACTIONS = {
  severityMix: 'reviewing incident severity patterns',
  trend: 'investigating the recent increase in incidents',
  openActionRate: 'closing outstanding corrective actions',
  highRiskExposure: 'verifying risk controls for major hazards',
  nearMissRate: 'encouraging near-miss reporting',
  positiveRate: 'promoting positive safety observations'
}

/**
 * Get trend arrow info from detail string like "12 cur / 5 prev"
 */
export const getTrendArrow = (detail) => {
  if (!detail) return null
  const match = detail.match(/(\d+)\s*cur\s*\/\s*(\d+)\s*prev/i)
  if (!match) return null
  const cur = parseInt(match[1], 10)
  const prev = parseInt(match[2], 10)
  if (prev === 0 && cur === 0) {
    return {
      icon: React.createElement(Minus, { size: 12, className: 'text-surface-400' }),
      color: 'text-surface-500',
      text: 'Stable — no incidents in either period',
      direction: 'stable',
      percent: 0
    }
  }
  if (prev === 0) {
    return {
      icon: React.createElement(TrendingUp, { size: 12, className: 'text-red-500' }),
      color: 'text-red-600',
      text: `New activity: ${cur} incident${cur !== 1 ? 's' : ''} in recent 60 days (none prior)`,
      direction: 'up',
      percent: 100
    }
  }
  const pctChange = Math.round(((cur - prev) / prev) * 100)
  if (pctChange > 5) {
    return {
      icon: React.createElement(TrendingUp, { size: 12, className: 'text-red-500' }),
      color: 'text-red-600',
      text: `Incidents up ${pctChange}% (${cur} vs ${prev} in prior period)`,
      direction: 'up',
      percent: pctChange
    }
  }
  if (pctChange < -5) {
    return {
      icon: React.createElement(TrendingDown, { size: 12, className: 'text-green-500' }),
      color: 'text-green-600',
      text: `Incidents dropped ${Math.abs(pctChange)}% (${cur} vs ${prev} in prior period)`,
      direction: 'down',
      percent: pctChange
    }
  }
  return {
    icon: React.createElement(Minus, { size: 12, className: 'text-surface-400' }),
    color: 'text-surface-500',
    text: `Stable — similar volume both periods (${cur} vs ${prev})`,
    direction: 'stable',
    percent: pctChange
  }
}

/**
 * Get signal bar color based on score
 */
export const getSignalBarColor = (score) => {
  if (score > 60) return 'bg-red-500'
  if (score > 30) return 'bg-amber-500'
  return 'bg-emerald-500'
}

/**
 * Get signal dot color class for UI
 */
export const getSignalDotColor = (score) => {
  if (score > 60) return 'bg-red-500'
  if (score > 30) return 'bg-amber-500'
  return 'bg-emerald-500'
}

/**
 * Get signal text color class for UI
 */
export const getSignalTextColor = (score) => {
  if (score > 60) return 'text-red-600'
  if (score > 30) return 'text-amber-600'
  return 'text-emerald-600'
}

/**
 * Get signal border color class for UI
 */
export const getSignalBorderColor = (score) => {
  if (score > 60) return 'border-red-200'
  if (score > 30) return 'border-amber-200'
  return 'border-emerald-200'
}

/**
 * Get signal background color class for UI
 */
export const getSignalBgColor = (score) => {
  if (score > 60) return 'bg-red-50'
  if (score > 30) return 'bg-amber-50'
  return 'bg-emerald-50'
}
