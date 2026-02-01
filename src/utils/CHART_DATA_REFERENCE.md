# HSE Dashboard - Chart Data Reference

This document explains how data flows from incidents to visualizations in the HSE Dashboard.

## Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Raw Incidents │ ──▶ │ Calculation Functions│ ──▶ │ Chart Components│
│   (IndexedDB)   │     │ (insightsCalculations│     │ (Recharts)      │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

## Data Source: Incident Record Structure

```javascript
{
  id: string,                    // Unique identifier (UUID)
  date: "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM", // Incident date/time
  type: string,                  // LTI|MTI|FAC|Near-Miss|Unsafe-Act|etc.
  description: string,           // Incident description
  location: string,              // Hazard category (27 categories)
  rootCause: string,             // Root cause category (13 categories)
  contractor: string,            // Contractor/company name
  actionStatus: string,          // open|in-progress|closed
  eventTime: "HH:MM",            // Time of incident (optional)
  // ... additional fields
}
```

---

## Chart Components & Their Data Sources

### 1. ForecastChart (Linear Regression Forecasting)

**File:** `src/components/insights/ForecastChart.jsx`
**Data Source:** `forecastIncidents(incidents, forecastDays)`

**Input:**
```javascript
incidents: Incident[]  // Array of incident records with dates
forecastDays: 30 | 60 | 90  // Days to forecast ahead
```

**Output Structure:**
```javascript
{
  historical: [
    { date: "2024-01-15", dateLabel: "Jan 15", value: 5, type: "historical" }
  ],
  forecast: [
    { date: "2024-04-15", dateLabel: "Apr 15", forecast: 6.2, upper: 8.1, lower: 4.3, type: "forecast" }
  ],
  model: {
    slope: 0.05,           // Daily change rate
    intercept: 4.2,        // Base value
    rSquared: 0.72,        // Model fit (0-1)
    trend: "increasing"    // increasing | decreasing | stable
  },
  summary: {
    avgHistorical: 4.8,    // Average incidents/day (past)
    avgForecast: 5.2,      // Average incidents/day (predicted)
    confidence: "high"     // high | medium | low
  }
}
```

**Calculation Method:**
1. Groups incidents by date (last 90 days)
2. Applies linear regression: `y = slope * x + intercept`
3. Calculates 95% confidence intervals using standard error
4. R² measures model fit quality

---

### 2. SeasonalPatternChart (Day/Hour/Month Patterns)

**File:** `src/components/insights/SeasonalPatternChart.jsx`
**Data Source:** `detectSeasonalPatterns(incidents)`

**Input:**
```javascript
incidents: Incident[]  // Minimum 30 incidents required
```

**Output Structure:**
```javascript
{
  hasData: true,
  dayOfWeek: {
    patterns: [
      { day: "Monday", shortName: "Mon", dayIndex: 1, count: 45, riskIndex: 125, riskLevel: "elevated" }
    ],
    insights: [{ type: "peak", message: "Monday has 25% more incidents than average" }],
    peakDay: "Monday",
    isSignificant: true,      // Chi-square test p < 0.05
    chiSquare: 15.2
  },
  hourOfDay: {
    patterns: [
      { hour: 10, hourLabel: "10:00", hour12: "10 AM", count: 30, riskIndex: 145, shift: "morning" }
    ],
    shifts: [
      { key: "morning", label: "Morning (6AM-12PM)", count: 120, riskIndex: 130 }
    ],
    peakHours: [10, 11, 14]
  },
  monthOfYear: {
    patterns: [
      { month: "Jul", fullName: "July", monthIndex: 6, count: 85, riskIndex: 140, season: "summer" }
    ],
    seasonPatterns: [
      { season: "summer", count: 250, riskIndex: 135 }
    ]
  },
  riskFactors: {
    current: {
      dayRisk: 125,        // Today's day-of-week risk
      hourRisk: 110,       // Current hour risk
      monthRisk: 105,      // Current month risk
      combinedRisk: 113,   // Geometric mean
      riskLevel: "elevated"
    }
  }
}
```

**Risk Index Calculation:**
```
riskIndex = (actual_count / expected_count) * 100

Where expected_count = total_incidents / number_of_periods
Example: 700 incidents / 7 days = 100 expected per day
If Monday has 125 incidents, riskIndex = 125%
```

**Chi-Square Significance Test:**
```
χ² = Σ((observed - expected)² / expected)
Significant if χ² > critical value (p < 0.05)
- Day of week: df=6, critical=12.59
- Month: df=11, critical=19.68
```

---

### 3. SeasonalRiskPrediction (7-Day Forecast)

**File:** `src/components/insights/SeasonalRiskPrediction.jsx`
**Data Source:** `predictSeasonalRisk(incidents, daysAhead)`

**Output Structure:**
```javascript
{
  predictions: [
    {
      date: "2024-01-15",
      dateLabel: "Mon, Jan 15",
      dayName: "Monday",
      dayRisk: 125,          // From day-of-week pattern
      monthRisk: 105,        // From month pattern
      combinedRisk: 115,     // sqrt(dayRisk * monthRisk)
      riskLevel: "elevated",
      isToday: true,
      isWeekend: false
    }
  ],
  highestRiskDay: { ... },
  summary: {
    highRiskDays: 2,
    elevatedDays: 3,
    averageRisk: 108
  }
}
```

---

### 4. HazardTrendingChart (Hazard Category Trends)

**File:** `src/components/insights/HazardTrendingChart.jsx`
**Data Source:** `getHazardTrending(incidents)`

**Calculation:**
1. Splits data into two periods: previous 2 months vs current month
2. Counts incidents per hazard category in each period
3. Calculates percentage change

**Output:**
```javascript
[
  {
    hazard: "Working at Height",
    previousCount: 25,
    currentCount: 35,
    trend: "up",           // up | down | stable
    changePercent: 40,     // +40% increase
    isMajor: true          // Major hazard flag
  }
]
```

---

### 5. RootCauseTrendChart (12-Month Root Cause Evolution)

**File:** `src/components/insights/RootCauseTrendChart.jsx`
**Data Source:** `getRootCauseTrends(incidents)`

**Output:**
```javascript
{
  trends: [
    { month: "Jan 24", monthKey: "2024-01", total: 150, "Human Error": 30, "Equipment Failure": 25 }
  ],
  rootCauses: ["Human Error", "Equipment Failure", "Poor Housekeeping"],  // Top 5
  hasData: true
}
```

---

### 6. IncidentTypeProbabilityChart (Type Prediction)

**File:** `src/components/insights/IncidentTypeProbabilityChart.jsx`
**Data Source:** `predictIncidentTypeProbability(incidents, lookbackMonths)`

**Calculation:**
1. Uses exponential decay weighting (α = 0.4)
2. Recent months weighted more heavily
3. Calculates probability distribution

**Output:**
```javascript
{
  types: [
    { type: "lti", label: "LTI", probability: 5.2, trend: "stable", severity: 10, color: "#dc2626" },
    { type: "mti", label: "MTI", probability: 12.8, trend: "increasing", severity: 5, color: "#f59e0b" },
    { type: "fac", label: "FAC", probability: 25.5, trend: "stable", severity: 2, color: "#3b82f6" },
    { type: "near-miss", label: "Near-Miss", probability: 56.5, trend: "decreasing", severity: 1, color: "#22c55e" }
  ],
  mostLikely: { type: "near-miss", probability: 56.5 },
  hasData: true
}
```

---

### 7. AnomalyDetectionPanel (Spike/Drop Detection)

**File:** `src/components/insights/AnomalyDetectionPanel.jsx`
**Data Source:** `getAnomalyAnalysis(incidents)`

**Methods Used:**

**Z-Score Method:**
```
zScore = (value - mean) / standardDeviation
Anomaly if |zScore| >= 2.5
```

**IQR Method:**
```
IQR = Q3 - Q1
Lower bound = Q1 - 1.5 * IQR
Upper bound = Q3 + 1.5 * IQR
Anomaly if value outside bounds
```

**Output:**
```javascript
{
  anomalies: [
    {
      date: "2024-01-15",
      value: 25,
      zScore: 3.2,
      type: "spike",
      severity: "high",
      method: "both"  // Confirmed by both methods
    }
  ],
  stats: {
    mean: 8.5,
    stdDev: 4.2,
    q1: 5, q3: 12, iqr: 7
  }
}
```

---

## Risk Level Thresholds

| Level | Risk Index | Description |
|-------|------------|-------------|
| High | > 130% | Significantly above average |
| Elevated | 115-130% | Above average |
| Normal | 70-115% | Within expected range |
| Low | < 70% | Below average |

---

## Data Requirements

| Function | Minimum Data |
|----------|--------------|
| `forecastIncidents` | 7 days of data |
| `detectSeasonalPatterns` | 30 incidents |
| `detectZScoreAnomalies` | 14 days of data |
| `predictIncidentTypeProbability` | 10 incidents |
| `identifyCorrelationPatterns` | 30 incidents |

---

## Performance Considerations

1. **Memoization**: All calculation functions use `useMemo` in components
2. **Lazy Loading**: Heavy calculations only run when data changes
3. **Pagination**: Large datasets use virtual scrolling
4. **Caching**: Results cached in component state

---

## Adding New Charts

1. Create calculation function in `insightsCalculations.js`
2. Create React component in `src/components/insights/`
3. Import calculation function and call with incidents data
4. Transform output to Recharts-compatible format
5. Add `React.memo` wrapper for performance
