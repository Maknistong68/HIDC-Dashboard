// Export configuration constants

export const EXPORT_CONFIG = {
  // A3 dimensions in mm
  A3: {
    width: 297,
    height: 420,
    orientation: 'portrait',
  },

  // Scale factor for high-resolution capture (2x for retina quality)
  SCALE: 2,

  // PDF margins in mm
  MARGINS: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  },

  // PowerPoint slide dimensions (16:9 standard) in inches
  PPTX: {
    width: 10,
    height: 5.625,
  },

  // Chart section titles for exports
  CHART_TITLES: {
    kpiCards1: 'Key Performance Indicators',
    kpiCards2: 'Approval Status',
    pyramid: 'Observation Categories',
    trendChart: 'Observation vs Incident Trend',
    topHazards: 'Top Significant Hazards',
    topObservers: 'Top Observers',
    hazardsHeatmap: 'Hazards Heatmap',
  },

  // Colors
  COLORS: {
    primary: '#1f2937',
    secondary: '#6b7280',
    muted: '#9ca3af',
  },
}
