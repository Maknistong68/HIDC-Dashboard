import React, { useMemo, useRef, useEffect, useState } from 'react'
import { AlertCircle, Database } from 'lucide-react'
import RiskForecastPanel from './RiskForecastPanel'
import ConfidenceBiasIndicator from './ConfidenceBiasIndicator'
import ThreeScenarioPanel from './ThreeScenarioPanel'
import SingleActionRecommendation from './SingleActionRecommendation'
import {
  runMonteCarloSimulation,
  computeHazardStats,
  getHazardExceedanceSummary
} from '../../utils/monteCarloEngine'
import {
  calculateDataSourceBreakdown,
  predictIncidentTypeProbability
} from '../../utils/insightsCalculations'
import {
  calculateThreeFixedScenarios,
  determineSingleBestAction,
  calculateFactorPrevalence
} from '../insights/ScenarioSimulatorEngine'

/**
 * ExecutivePredictiveView - Single-screen executive view for Tab 2
 * Answers 4 key questions instantly:
 * 1. When/Where is the next hazard most likely?
 * 2. How confident is this prediction (bias check)?
 * 3. What happens if nothing done vs controls applied?
 * 4. What single action gives biggest risk reduction?
 */
const ExecutivePredictiveView = ({
  filteredIncidents,
  negativeIncidents,
  sortedHazards,
  factorData,
  incidentPrediction,
  hazardTrendData,
  period
}) => {
  const [monteCarloResult, setMonteCarloResult] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const abortRef = useRef({ current: false })

  // Get top hazard names for Monte Carlo
  const hazardNames = useMemo(() => {
    if (!sortedHazards?.length) return []
    return sortedHazards.slice(0, 10).map(h => h.name)
  }, [sortedHazards])

  // Compute hazard stats for Monte Carlo
  const hazardStats = useMemo(() => {
    if (!negativeIncidents?.length || !hazardNames.length) return {}
    return computeHazardStats(negativeIncidents, hazardNames)
  }, [negativeIncidents, hazardNames])

  // Run Monte Carlo simulation
  useEffect(() => {
    if (!hazardNames.length || Object.keys(hazardStats).length === 0) {
      setMonteCarloResult(null)
      return
    }

    abortRef.current = false
    setIsSimulating(true)

    runMonteCarloSimulation({
      hazardStats,
      hazardNames,
      weeks: 6,
      iterations: 300,
      chunkSize: 50,
      abortRef
    }).then(result => {
      if (result && !abortRef.current) {
        setMonteCarloResult(result)
      }
      setIsSimulating(false)
    })

    return () => {
      abortRef.current = true
    }
  }, [hazardStats, hazardNames])

  // Get hazard risk summaries from Monte Carlo
  const hazardRiskSummaries = useMemo(() => {
    if (!monteCarloResult) return []
    return getHazardExceedanceSummary(monteCarloResult, hazardStats, sortedHazards)
  }, [monteCarloResult, hazardStats, sortedHazards])

  // Get top risk hazard (for main forecast)
  const topRiskHazard = useMemo(() => {
    if (!hazardRiskSummaries.length) return null
    return hazardRiskSummaries[0]
  }, [hazardRiskSummaries])

  // Data source breakdown for bias detection
  const dataSourceBreakdown = useMemo(() => {
    return calculateDataSourceBreakdown(filteredIncidents)
  }, [filteredIncidents])

  // Calculate factor prevalence for scenario calculations
  const prevalence = useMemo(() => {
    if (!factorData?.byFactor || !negativeIncidents?.length) return {}
    return calculateFactorPrevalence(factorData, negativeIncidents.length)
  }, [factorData, negativeIncidents])

  // Three fixed scenarios
  const scenarios = useMemo(() => {
    return calculateThreeFixedScenarios({
      incidentPrediction,
      factorData,
      negativeIncidents,
      prevalence,
      topRiskHazard,
      sortedHazards
    })
  }, [incidentPrediction, factorData, negativeIncidents, prevalence, topRiskHazard, sortedHazards])

  // Single best action
  const bestAction = useMemo(() => {
    return determineSingleBestAction({
      factorData,
      prevalence,
      topRiskHazard,
      sortedHazards,
      dataSourceBreakdown
    })
  }, [factorData, prevalence, topRiskHazard, sortedHazards, dataSourceBreakdown])

  // Incident type probabilities
  const typeProbability = useMemo(() => {
    return incidentPrediction?.typeProbability || predictIncidentTypeProbability(negativeIncidents || [], 6)
  }, [incidentPrediction, negativeIncidents])

  // Empty state
  if (!filteredIncidents?.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <Database size={28} className="text-surface-400" />
        </div>
        <h2 className="text-lg font-semibold text-surface-800 mb-2">No Predictive Data Available</h2>
        <p className="text-sm text-surface-500 max-w-md mx-auto">
          Import observation data to enable risk forecasting and simulation.
          At least 30 days of data is recommended for reliable predictions.
        </p>
      </div>
    )
  }

  // Sparse data warning
  const isSparseData = negativeIncidents?.length < 30

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Sparse data warning */}
      {isSparseData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Limited Data Available</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {negativeIncidents?.length || 0} observations detected. Predictions may have reduced accuracy.
              30+ observations recommended.
            </p>
          </div>
        </div>
      )}

      {/* Main 4-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Panel A: Risk Forecast (40% on desktop = 2/5 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <RiskForecastPanel
            topRiskHazard={topRiskHazard}
            hazardRiskSummaries={hazardRiskSummaries}
            isSimulating={isSimulating}
            typeProbability={typeProbability}
            period={period}
          />

          {/* Panel B: Confidence & Bias */}
          <ConfidenceBiasIndicator
            dataSourceBreakdown={dataSourceBreakdown}
            incidentCount={filteredIncidents?.length || 0}
            negativeCount={negativeIncidents?.length || 0}
            isSparseData={isSparseData}
          />
        </div>

        {/* Panel C: Three Scenarios (60% on desktop = 3/5 columns) */}
        <div className="lg:col-span-3">
          <ThreeScenarioPanel
            scenarios={scenarios}
            topRiskHazard={topRiskHazard}
            incidentPrediction={incidentPrediction}
            factorData={factorData}
            negativeIncidents={negativeIncidents}
          />
        </div>
      </div>

      {/* Panel D: CEO Button (full width) */}
      <SingleActionRecommendation
        bestAction={bestAction}
        topRiskHazard={topRiskHazard}
        dataSourceBreakdown={dataSourceBreakdown}
      />
    </div>
  )
}

export default React.memo(ExecutivePredictiveView)
