import { describe, it, expect } from 'vitest'
import {
  calculatePoissonProbability,
  calculateLikelihoodLevel,
  calculateConsequenceLevel,
  calculateMatrixRiskScore,
  plotHazardsOnMatrix,
  getRiskZone,
  getDescriptionSeveritySignal,
  countRecentFatalities,
  ASSESSMENT_PERIOD_DAYS,
  LIKELIHOOD_PROBABILITY_THRESHOLDS,
  CONSEQUENCE_TYPE_MAP,
  DESCRIPTION_SEVERITY_SIGNALS,
} from './riskMatrix'

// ============================================================================
// Poisson Probability — mathematical correctness
// ============================================================================

describe('calculatePoissonProbability', () => {
  it('returns 0 for zero incidents', () => {
    expect(calculatePoissonProbability(0, 365)).toBe(0)
  })

  it('returns 0 for zero days', () => {
    expect(calculatePoissonProbability(5, 0)).toBe(0)
  })

  it('returns 0 for negative inputs', () => {
    expect(calculatePoissonProbability(-1, 365)).toBe(0)
    expect(calculatePoissonProbability(5, -10)).toBe(0)
  })

  it('matches manual calculation: 1 incident over 365 days', () => {
    // λ = 1/365, P = 1 - e^(-1) ≈ 0.6321
    const p = calculatePoissonProbability(1, 365)
    expect(p).toBeCloseTo(1 - Math.exp(-1), 4)
    expect(p).toBeCloseTo(0.6321, 3)
  })

  it('matches manual calculation: 10 incidents over 365 days', () => {
    // λ = 10/365, P = 1 - e^(-10) ≈ 0.99995
    const p = calculatePoissonProbability(10, 365)
    expect(p).toBeCloseTo(1 - Math.exp(-10), 4)
    expect(p).toBeGreaterThan(0.999)
  })

  it('matches manual calculation: 1 incident over 3650 days (10 years)', () => {
    // λ = 1/3650, P = 1 - e^(-365/3650) = 1 - e^(-0.1) ≈ 0.0952
    const p = calculatePoissonProbability(1, 3650)
    expect(p).toBeCloseTo(1 - Math.exp(-0.1), 4)
    expect(p).toBeCloseTo(0.0952, 3)
  })

  it('matches manual calculation: 1 incident over 730 days (2 years)', () => {
    // λ = 1/730, P = 1 - e^(-0.5) ≈ 0.3935
    const p = calculatePoissonProbability(1, 730)
    expect(p).toBeCloseTo(1 - Math.exp(-0.5), 4)
    expect(p).toBeCloseTo(0.3935, 3)
  })

  it('probability increases with more incidents', () => {
    const p1 = calculatePoissonProbability(1, 365)
    const p5 = calculatePoissonProbability(5, 365)
    const p10 = calculatePoissonProbability(10, 365)
    expect(p5).toBeGreaterThan(p1)
    expect(p10).toBeGreaterThan(p5)
  })

  it('probability never exceeds 1', () => {
    const p = calculatePoissonProbability(10000, 30)
    expect(p).toBeLessThanOrEqual(1)
  })

  it('uses 365-day assessment period', () => {
    expect(ASSESSMENT_PERIOD_DAYS).toBe(365)
  })
})

// ============================================================================
// Likelihood Level — ISO 31000 alignment
// ============================================================================

describe('calculateLikelihoodLevel', () => {
  it('returns 1 (Rare) for zero incidents', () => {
    expect(calculateLikelihoodLevel(0, 365)).toBe(1)
  })

  it('returns 1 (Rare) for zero days', () => {
    expect(calculateLikelihoodLevel(5, 0)).toBe(1)
  })

  // --- Frequency-to-level alignment with ISO 31000 standard ---

  it('Level 1 (Rare): once in 10+ years → <10% probability', () => {
    // 1 incident over 3650 days (10 years) → P ≈ 9.5%
    expect(calculateLikelihoodLevel(1, 3650)).toBe(1)
  })

  it('Level 2 (Unlikely): once in 7 years → 10-30% probability', () => {
    // 1 incident over 2555 days (7 years) → P ≈ 13.4%
    expect(calculateLikelihoodLevel(1, 2555)).toBe(2)
  })

  it('Level 3 (Possible): once in 2 years → 31-70% probability', () => {
    // 5 incidents over 3650 days (10 years, rate = 0.5/yr) → P ≈ 39.3%
    // Uses 5 incidents to avoid <3 sample cap
    expect(calculateLikelihoodLevel(5, 3650)).toBe(3)
  })

  it('Level 3 (Possible): once per year → 63.2% probability', () => {
    // 1 incident over 365 days → P ≈ 63.2%
    // But sample cap: <3 incidents → max Unlikely (2)
    // So this is capped at 2
    expect(calculateLikelihoodLevel(1, 365)).toBe(2) // capped by <3 incidents
  })

  it('Level 4 (Likely): ~1.5 per year → ~77.7% probability', () => {
    // 6 incidents over 1460 days (4 years) → λ=6/1460, P = 1-e^(-6*365/1460) = 1-e^(-1.5) ≈ 77.7%
    expect(calculateLikelihoodLevel(6, 1460)).toBe(4)
  })

  it('Level 5 (Almost Certain): 3+ per year → >95% probability', () => {
    // 12 incidents over 1460 days (4 years) → λ=12/1460, P = 1-e^(-3) ≈ 95.0%
    expect(calculateLikelihoodLevel(12, 1460)).toBe(5)
  })

  it('Level 5 (Almost Certain): 10 per year → >99.99% probability', () => {
    // 10 incidents over 365 days → P ≈ 99.995%
    expect(calculateLikelihoodLevel(10, 365)).toBe(5)
  })

  // --- Confidence caps ---

  it('caps at Unlikely (2) when <3 incidents regardless of rate', () => {
    // 2 incidents in 30 days → very high rate, but <3 incidents
    expect(calculateLikelihoodLevel(2, 30)).toBe(2)
  })

  it('caps at Possible (3) when <5 incidents', () => {
    // 4 incidents in 30 days → very high rate, but <5 incidents
    expect(calculateLikelihoodLevel(4, 30)).toBe(3)
  })

  it('caps at Unlikely (2) when dataset <14 days', () => {
    // 10 incidents in 10 days → enormous rate, but too short
    expect(calculateLikelihoodLevel(10, 10)).toBe(2)
  })

  it('caps at Possible (3) when dataset 14-29 days', () => {
    // 10 incidents in 20 days → enormous rate, but short dataset
    expect(calculateLikelihoodLevel(10, 20)).toBe(3)
  })

  it('no cap when ≥5 incidents and ≥30 days', () => {
    // 5 incidents in 30 days → λ=5/30, P = 1-e^(-5*365/30) ≈ 100% → Level 5
    expect(calculateLikelihoodLevel(5, 30)).toBe(5)
  })

  // --- Threshold boundary tests ---

  it('thresholds are ordered: 90% > 71% > 31% > 10% > 0%', () => {
    const thresholds = LIKELIHOOD_PROBABILITY_THRESHOLDS
    for (let i = 0; i < thresholds.length - 1; i++) {
      expect(thresholds[i].minProbability).toBeGreaterThan(thresholds[i + 1].minProbability)
      expect(thresholds[i].level).toBeGreaterThan(thresholds[i + 1].level)
    }
  })
})

// ============================================================================
// Consequence Level — time-decay
// ============================================================================

describe('calculateConsequenceLevel', () => {
  const today = new Date('2026-02-16')

  it('returns 1 for empty incidents', () => {
    expect(calculateConsequenceLevel([], today)).toBe(1)
    expect(calculateConsequenceLevel(null, today)).toBe(1)
  })

  it('returns 4 for recent fatality (single fatality = High per NEOM standard)', () => {
    const incidents = [{ type: 'fatality', date: '2026-02-01' }]
    expect(calculateConsequenceLevel(incidents, today)).toBe(4)
  })

  it('returns 4 for recent fire', () => {
    const incidents = [{ type: 'fire', date: '2026-02-01' }]
    expect(calculateConsequenceLevel(incidents, today)).toBe(4)
  })

  it('returns 3 for recent LTI', () => {
    const incidents = [{ type: 'lti', date: '2026-02-01' }]
    expect(calculateConsequenceLevel(incidents, today)).toBe(3)
  })

  it('returns 2 for recent MTI', () => {
    const incidents = [{ type: 'mti', date: '2026-02-01' }]
    expect(calculateConsequenceLevel(incidents, today)).toBe(2)
  })

  it('returns 1 for recent near-miss', () => {
    const incidents = [{ type: 'near-miss', date: '2026-02-01' }]
    expect(calculateConsequenceLevel(incidents, today)).toBe(1)
  })

  it('decays old fatality (>1 year) to level 1', () => {
    // Fatality severity=4, weight=0.1 for >1yr → 4×0.1 = 0.4 → rounds to 1
    const incidents = [{ type: 'fatality', date: '2024-01-01' }]
    expect(calculateConsequenceLevel(incidents, today)).toBe(1)
  })

  it('decays 6-12 month old fatality to level 1', () => {
    // Fatality severity=4, weight=0.3 for 6-12mo → 4×0.3 = 1.2 → rounds to 1
    const incidents = [{ type: 'fatality', date: '2025-06-01' }]
    expect(calculateConsequenceLevel(incidents, today)).toBe(1)
  })

  it('picks worst recent severity among mixed incidents', () => {
    const incidents = [
      { type: 'near-miss', date: '2026-02-10' },
      { type: 'lti', date: '2026-02-05' },
      { type: 'mti', date: '2026-02-01' },
    ]
    expect(calculateConsequenceLevel(incidents, today)).toBe(3) // LTI = 3
  })

  it('treats missing date as recent (full weight)', () => {
    const incidents = [{ type: 'fire' }] // no date
    expect(calculateConsequenceLevel(incidents, today)).toBe(4)
  })
})

// ============================================================================
// Description Severity Signal — keyword detection
// ============================================================================

describe('getDescriptionSeveritySignal', () => {
  it('returns null for empty/missing description', () => {
    expect(getDescriptionSeveritySignal(null)).toBeNull()
    expect(getDescriptionSeveritySignal(undefined)).toBeNull()
    expect(getDescriptionSeveritySignal('')).toBeNull()
  })

  it('returns null when no keywords match', () => {
    expect(getDescriptionSeveritySignal('Worker tripped on cable')).toBeNull()
  })

  it('detects level 5 phrases (multiple fatalities)', () => {
    const signal = getDescriptionSeveritySignal('Multiple fatalities reported at site')
    expect(signal.minSeverity).toBe(5)
    expect(signal.bypassMaxBoost).toBe(true)
  })

  it('detects level 4 phrases (permanent disability)', () => {
    const signal = getDescriptionSeveritySignal('Worker suffered permanent disability')
    expect(signal.minSeverity).toBe(4)
    expect(signal.bypassMaxBoost).toBe(false)
  })

  it('detects level 3 phrases (hospitalized)', () => {
    const signal = getDescriptionSeveritySignal('Worker was hospitalized after fall')
    expect(signal.minSeverity).toBe(3)
    expect(signal.bypassMaxBoost).toBe(false)
  })

  it('returns highest match when multiple phrases present', () => {
    const signal = getDescriptionSeveritySignal('Hospitalized with permanent disability')
    // Level 4 (permanent disability) is checked before level 3 (hospitalized)
    expect(signal.minSeverity).toBe(4)
  })

  it('is case insensitive', () => {
    expect(getDescriptionSeveritySignal('HOSPITALIZED')).not.toBeNull()
    expect(getDescriptionSeveritySignal('Multiple Fatalities')).not.toBeNull()
  })
})

// ============================================================================
// countRecentFatalities — multiple fatalities detection
// ============================================================================

describe('countRecentFatalities', () => {
  const today = new Date('2026-02-16')

  it('returns 0 for empty incidents', () => {
    expect(countRecentFatalities([], today)).toBe(0)
    expect(countRecentFatalities(null, today)).toBe(0)
  })

  it('counts recent fatalities (within 6 months)', () => {
    const incidents = [
      { type: 'fatality', date: '2026-01-15' },
      { type: 'fatality', date: '2026-02-01' },
    ]
    expect(countRecentFatalities(incidents, today)).toBe(2)
  })

  it('excludes old fatalities (>6 months, weight < 0.6)', () => {
    const incidents = [
      { type: 'fatality', date: '2026-02-01' }, // recent → weight 1.0
      { type: 'fatality', date: '2025-01-01' }, // >1 year → weight 0.1
    ]
    expect(countRecentFatalities(incidents, today)).toBe(1)
  })

  it('ignores non-fatality types', () => {
    const incidents = [
      { type: 'fatality', date: '2026-02-01' },
      { type: 'lti', date: '2026-02-01' },
      { type: 'mti', date: '2026-02-01' },
    ]
    expect(countRecentFatalities(incidents, today)).toBe(1)
  })

  it('treats missing date as recent', () => {
    const incidents = [
      { type: 'fatality' },
      { type: 'fatality' },
    ]
    expect(countRecentFatalities(incidents, today)).toBe(2)
  })
})

// ============================================================================
// Consequence Level — description-based severity boost
// ============================================================================

describe('calculateConsequenceLevel — description boost', () => {
  const today = new Date('2026-02-16')

  it('returns 5 for 2+ recent fatalities (Path A)', () => {
    const incidents = [
      { type: 'fatality', date: '2026-01-15' },
      { type: 'fatality', date: '2026-02-01' },
    ]
    expect(calculateConsequenceLevel(incidents, today)).toBe(5)
  })

  it('returns 5 for description containing "multiple fatalities" (bypass)', () => {
    const incidents = [
      { type: 'fatality', date: '2026-02-01', description: 'Multiple fatalities at worksite' },
    ]
    expect(calculateConsequenceLevel(incidents, today)).toBe(5)
  })

  it('does not return 5 for old fatalities even if multiple', () => {
    const incidents = [
      { type: 'fatality', date: '2024-06-01' }, // >1 year → weight 0.1
      { type: 'fatality', date: '2024-07-01' }, // >1 year → weight 0.1
    ]
    // countRecentFatalities = 0, each: severity 4 × 0.1 = 0.4 → rounds to 1
    expect(calculateConsequenceLevel(incidents, today)).toBe(1)
  })

  it('boosts MTI + "hospitalized" to level 3 (+1 cap)', () => {
    const incidents = [
      { type: 'mti', date: '2026-02-01', description: 'Worker was hospitalized after fall' },
    ]
    // MTI = 2, hospitalized signal = 3, min(2+1, 3) = 3
    expect(calculateConsequenceLevel(incidents, today)).toBe(3)
  })

  it('boosts LTI + "permanent disability" to level 4 (+1 cap)', () => {
    const incidents = [
      { type: 'lti', date: '2026-02-01', description: 'Worker suffered permanent disability' },
    ]
    // LTI = 3, permanent disability signal = 4, min(3+1, 4) = 4
    expect(calculateConsequenceLevel(incidents, today)).toBe(4)
  })

  it('caps near-miss + high severity keyword to +1 only (no inflation)', () => {
    const incidents = [
      { type: 'near-miss', date: '2026-02-01', description: 'Near miss but worker had permanent disability from previous' },
    ]
    // near-miss = 1, permanent disability signal = 4, min(1+1, 4) = 2
    expect(calculateConsequenceLevel(incidents, today)).toBe(2)
  })

  it('caps near-miss + "hospitalized" to +1 only', () => {
    const incidents = [
      { type: 'near-miss', date: '2026-02-01', description: 'Worker nearly hospitalized' },
    ]
    // near-miss = 1, hospitalized signal = 3, min(1+1, 3) = 2
    expect(calculateConsequenceLevel(incidents, today)).toBe(2)
  })

  it('does not boost when no description present (unchanged behavior)', () => {
    const incidents = [
      { type: 'mti', date: '2026-02-01' },
    ]
    expect(calculateConsequenceLevel(incidents, today)).toBe(2)
  })

  it('does not boost when description has no keywords', () => {
    const incidents = [
      { type: 'mti', date: '2026-02-01', description: 'Worker twisted ankle on uneven ground' },
    ]
    expect(calculateConsequenceLevel(incidents, today)).toBe(2)
  })

  it('applies time decay to boosted severity', () => {
    const incidents = [
      { type: 'mti', date: '2025-06-01', description: 'Worker was hospitalized' },
    ]
    // MTI=2, boosted to 3, but 8+ months old → weight 0.3
    // 3 × 0.3 = 0.9 → rounds to 1
    expect(calculateConsequenceLevel(incidents, today)).toBe(1)
  })

  it('boosts MTI + "amputation" to level 3 (+1 cap)', () => {
    const incidents = [
      { type: 'mti', date: '2026-02-01', description: 'Worker suffered amputation of finger' },
    ]
    // MTI = 2, amputation signal = 4, min(2+1, 4) = 3
    expect(calculateConsequenceLevel(incidents, today)).toBe(3)
  })

  it('boosts FAC + "intensive care" to level 3 (+1 cap)', () => {
    const incidents = [
      { type: 'fac', date: '2026-02-01', description: 'Worker taken to intensive care unit' },
    ]
    // FAC = 2, intensive care signal = 3, min(2+1, 3) = 3
    expect(calculateConsequenceLevel(incidents, today)).toBe(3)
  })

  it('single fatality without keywords stays at 4 (not 5)', () => {
    const incidents = [
      { type: 'fatality', date: '2026-02-01', description: 'Worker fell from height' },
    ]
    expect(calculateConsequenceLevel(incidents, today)).toBe(4)
  })

  it('result never exceeds 5', () => {
    const incidents = [
      { type: 'fatality', date: '2026-02-01', description: 'Multiple fatalities reported' },
    ]
    expect(calculateConsequenceLevel(incidents, today)).toBeLessThanOrEqual(5)
  })
})

// ============================================================================
// Risk Score & Risk Zones
// ============================================================================

describe('calculateMatrixRiskScore', () => {
  it('returns L × C product', () => {
    expect(calculateMatrixRiskScore(1, 1)).toBe(1)
    expect(calculateMatrixRiskScore(5, 5)).toBe(25)
    expect(calculateMatrixRiskScore(3, 4)).toBe(12)
  })
})

describe('getRiskZone', () => {
  it('Very High for score 20-25', () => {
    expect(getRiskZone(5, 4).label).toBe('Very High') // 20
    expect(getRiskZone(5, 5).label).toBe('Very High') // 25
  })

  it('High for score 10-19', () => {
    expect(getRiskZone(5, 2).label).toBe('High') // 10
    expect(getRiskZone(4, 4).label).toBe('High') // 16
  })

  it('Medium for score 5-9', () => {
    expect(getRiskZone(5, 1).label).toBe('Medium') // 5
    expect(getRiskZone(3, 3).label).toBe('Medium') // 9
  })

  it('Low for score 3-4', () => {
    expect(getRiskZone(2, 2).label).toBe('Low') // 4
    expect(getRiskZone(3, 1).label).toBe('Low') // 3
  })

  it('Very Low for score 1-2', () => {
    expect(getRiskZone(1, 1).label).toBe('Very Low') // 1
    expect(getRiskZone(2, 1).label).toBe('Very Low') // 2
  })

  it('clamps out-of-range inputs', () => {
    expect(getRiskZone(0, 0).label).toBe('Very Low')
    expect(getRiskZone(10, 10).label).toBe('Very High')
  })
})

// ============================================================================
// plotHazardsOnMatrix — integration
// ============================================================================

describe('plotHazardsOnMatrix', () => {
  const makeIncident = (location, type, date) => ({
    id: `${location}-${type}-${date}`,
    location,
    type,
    date,
  })

  it('returns empty for no data', () => {
    const result = plotHazardsOnMatrix([], [])
    expect(result.hazards).toEqual([])
    expect(result.totalDays).toBe(0)
  })

  it('calculates correct probability and likelihood for a hazard', () => {
    // 10 incidents over ~1 year for "Working At Height"
    const incidents = Array.from({ length: 10 }, (_, i) =>
      makeIncident('Working At Height', 'near-miss', `2025-${String(i + 1).padStart(2, '0')}-15`)
    )
    const hazards = [{ name: 'Working At Height', totalCount: 10, hasNoData: false }]

    const result = plotHazardsOnMatrix(incidents, hazards)
    expect(result.hazards).toHaveLength(1)

    const h = result.hazards[0]
    expect(h.name).toBe('Working At Height')
    expect(h.negativeCount).toBe(10)
    expect(h.probability).toBeGreaterThan(0.99) // 10/year → >99%
    expect(h.likelihood).toBe(5) // Almost Certain
    expect(h.consequence).toBe(1) // near-miss = 1
    expect(h.riskScore).toBe(5) // 5 × 1
  })

  it('assigns higher likelihood to more frequent hazards', () => {
    const baseDate = '2025-01-01'
    const endDate = '2025-12-31'
    // Hazard A: 20 incidents (frequent)
    const incidentsA = Array.from({ length: 20 }, (_, i) =>
      makeIncident('Hazard A', 'mti', `2025-${String((i % 12) + 1).padStart(2, '0')}-10`)
    )
    // Hazard B: 1 incident (rare) — but need ≥ data span
    const incidentsB = [
      makeIncident('Hazard B', 'mti', '2025-06-15'),
    ]
    const allIncidents = [...incidentsA, ...incidentsB]
    const hazards = [
      { name: 'Hazard A', totalCount: 20, hasNoData: false },
      { name: 'Hazard B', totalCount: 1, hasNoData: false },
    ]

    const result = plotHazardsOnMatrix(allIncidents, hazards)
    const hA = result.hazards.find(h => h.name === 'Hazard A')
    const hB = result.hazards.find(h => h.name === 'Hazard B')

    expect(hA.likelihood).toBeGreaterThan(hB.likelihood)
  })

  it('no longer returns isAdaptive flag', () => {
    const incidents = [makeIncident('Test', 'mti', '2025-01-01')]
    const hazards = [{ name: 'Test', totalCount: 1, hasNoData: false }]
    const result = plotHazardsOnMatrix(incidents, hazards)
    expect(result).not.toHaveProperty('isAdaptive')
  })

  it('returns standard probability thresholds', () => {
    const incidents = [makeIncident('Test', 'mti', '2025-01-01')]
    const hazards = [{ name: 'Test', totalCount: 1, hasNoData: false }]
    const result = plotHazardsOnMatrix(incidents, hazards)
    expect(result.thresholds).toEqual(LIKELIHOOD_PROBABILITY_THRESHOLDS)
  })
})

// ============================================================================
// Standard alignment verification — the "proof table"
// ============================================================================

describe('ISO 31000 Standard Alignment', () => {
  // These verify the Poisson model maps frequency descriptions to the correct levels
  // using realistic sample sizes that won't trigger confidence caps

  it('once in 20 years → Rare (≤10%)', () => {
    // 1 incident over 7300 days → P ≈ 4.9%
    const p = calculatePoissonProbability(1, 7300)
    expect(p).toBeLessThan(0.10)
  })

  it('once in 10 years → Rare (≤10%)', () => {
    // 1 incident over 3650 days → P ≈ 9.5%
    const p = calculatePoissonProbability(1, 3650)
    expect(p).toBeLessThan(0.10)
  })

  it('once in 7 years → Unlikely (10-30%)', () => {
    // 1 incident over 2555 days → P ≈ 13.4%
    const p = calculatePoissonProbability(1, 2555)
    expect(p).toBeGreaterThanOrEqual(0.10)
    expect(p).toBeLessThan(0.31)
  })

  it('once in 5 years → Unlikely (10-30%)', () => {
    // 1 incident over 1825 days → P ≈ 18.1%
    const p = calculatePoissonProbability(1, 1825)
    expect(p).toBeGreaterThanOrEqual(0.10)
    expect(p).toBeLessThan(0.31)
  })

  it('once in 2 years → Possible (31-70%)', () => {
    // 1 incident over 730 days → P ≈ 39.3%
    const p = calculatePoissonProbability(1, 730)
    expect(p).toBeGreaterThanOrEqual(0.31)
    expect(p).toBeLessThan(0.71)
  })

  it('once per year → Possible (31-70%)', () => {
    // 1 incident over 365 days → P ≈ 63.2%
    const p = calculatePoissonProbability(1, 365)
    expect(p).toBeGreaterThanOrEqual(0.31)
    expect(p).toBeLessThan(0.71)
  })

  it('1.5 per year → Likely (71-90%)', () => {
    // 3 incidents over 730 days → λ=3/730, P = 1-e^(-1.5) ≈ 77.7%
    const p = calculatePoissonProbability(3, 730)
    expect(p).toBeGreaterThanOrEqual(0.71)
    expect(p).toBeLessThan(0.90)
  })

  it('2 per year → Likely (71-90%)', () => {
    // 4 incidents over 730 days → P = 1-e^(-2) ≈ 86.5%
    const p = calculatePoissonProbability(4, 730)
    expect(p).toBeGreaterThanOrEqual(0.71)
    expect(p).toBeLessThan(0.90)
  })

  it('3+ per year → Almost Certain (>90%)', () => {
    // 6 incidents over 730 days → P = 1-e^(-3) ≈ 95.0%
    const p = calculatePoissonProbability(6, 730)
    expect(p).toBeGreaterThanOrEqual(0.90)
  })
})
