import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronRight, ChevronLeft, Eye, Calendar, Building2, MapPin, User, AlertCircle, CheckCircle, Clock, Copy, Check, AlertTriangle, FileText, Flag, BarChart3, List, Briefcase, FileSpreadsheet } from 'lucide-react'
import { List as VirtualList } from 'react-window'
import { AutoSizer } from 'react-virtualized-auto-sizer'
import { format, parseISO } from 'date-fns'
import { useDataActions } from '../../context/DataContext'
import { getStatusColor } from '../../utils/statusColors'
import useResizable from '../../hooks/useResizable.jsx'
import HighlightedText from './HighlightedText'
import { HazardInsightsTab, CategoryInsightsTab, ObserverInsightsTab } from '../drilldown'

const VIRTUAL_ROW_HEIGHT = 110 // px per record row (matches padding + content)
const VIRTUAL_THRESHOLD = 50  // only virtualize above this count

/**
 * Glassmorphism Drill-Down Modal
 * Centered on screen with Apple-style blur effect
 * Supports: Chart → Months/Weeks → Observations hierarchy
 * With optional Insights tab for hazard drill-downs
 */
const DrillDownModal = ({
  isOpen,
  onClose,
  title,
  data = [],
  type = 'monthly', // 'monthly' | 'records' | 'insights'
  onDrillDown,
  onBack,
  canGoBack = false,
  breadcrumb = [],
  highlightKeywords = [],  // Keywords to highlight in descriptions
  source = 'Unknown',  // Source page: 'Hazards Identification', 'Safety Outlook', etc.
  // New props for insights tab
  showInsights = false,  // Whether to show the Insights/Records tab bar
  insightsMode = 'hazard', // 'hazard' | 'category' | 'observer' - which insights component to use
  insightsData = null,   // Data shape depends on insightsMode
  factorData = null      // Pre-calculated factors from aggregateContributingFactors (hazard mode only)
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [activeTab, setActiveTab] = useState(showInsights ? 'insights' : 'records')
  const [filteredRecords, setFilteredRecords] = useState(null)
  const [filterTitle, setFilterTitle] = useState('')
  const [filterKeywords, setFilterKeywords] = useState([])

  // Reset tab when modal opens with insights
  useEffect(() => {
    if (isOpen && showInsights) {
      setActiveTab('insights')
      setFilteredRecords(null)
      setFilterTitle('')
      setFilterKeywords([])
    }
  }, [isOpen, showInsights])

  // Handle filter from insights tab (root cause click)
  const handleFilterByRootCause = useCallback((records, factorName, keywords) => {
    setFilteredRecords(records)
    setFilterTitle(`${factorName} Observations`)
    setFilterKeywords(keywords || [])
    setActiveTab('records')
  }, [])

  // Handle view all records from insights tab
  const handleViewRecords = useCallback(() => {
    setFilteredRecords(null)
    setFilterTitle('')
    setFilterKeywords([])
    setActiveTab('records')
  }, [])

  // Handle filter by hazard (for category/observer insights)
  const handleFilterByHazard = useCallback((records, hazardName) => {
    setFilteredRecords(records)
    setFilterTitle(`${hazardName} Observations`)
    setFilterKeywords([])
    setActiveTab('records')
  }, [])

  // Resizable functionality
  const {
    containerRef,
    containerStyle,
    isResizing,
    ResizeHandles,
    isMobile
  } = useResizable({
    minWidth: 500,
    minHeight: 400,
    maxWidthPercent: 95,
    maxHeightPercent: 95
  })

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${isMobile ? 'p-0' : 'p-4'}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Container - Bottom sheet on mobile, centered glassmorphism on desktop */}
      <div
        ref={containerRef}
        className={`
          relative w-full flex flex-col
          ${isMobile
            ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl animate-slide-up'
            : 'max-w-5xl max-h-[90vh] rounded-2xl animate-modal-in'
          }
          ${isResizing ? 'select-none' : ''}
        `}
        style={isMobile ? {} : containerStyle}
      >
        {/* Resize Handles - Only on desktop */}
        <ResizeHandles />

        {/* Glass Card */}
        <div className={`
          bg-white/95 sm:bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden h-full flex flex-col
          ${isMobile ? 'border-0 rounded-t-2xl' : 'border rounded-2xl'}
        `}>
          {/* Header - Larger touch targets on mobile */}
          <div className={`
            border-b border-surface-200/50 bg-white/50 safe-area-top
            ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {canGoBack && (
                  <button
                    onClick={onBack}
                    className="p-2 sm:p-1.5 rounded-lg hover:bg-surface-100/80 active:bg-surface-200/80 text-surface-500 hover:text-surface-700 transition-colors flex-shrink-0"
                    aria-label="Go back"
                  >
                    <ChevronLeft size={isMobile ? 24 : 20} />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold text-surface-900 truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {title}
                  </h3>
                  {breadcrumb.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5 overflow-x-auto scrollbar-hide">
                      {breadcrumb.map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1 whitespace-nowrap">
                          {idx > 0 && <ChevronRight size={12} />}
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`
                  rounded-xl hover:bg-surface-100/80 active:bg-surface-200/80 text-surface-400 hover:text-surface-600 transition-colors flex-shrink-0
                  ${isMobile ? 'p-3 -mr-1' : 'p-2'}
                `}
                aria-label="Close modal"
              >
                <X size={isMobile ? 24 : 20} />
              </button>
            </div>
          </div>

          {/* Tab Bar for Insights/Records - Only when showInsights is true */}
          {showInsights && type === 'records' && (
            <div className={`border-b border-surface-200/50 bg-surface-50/80 ${isMobile ? 'px-4 py-2' : 'px-6 py-2'}`}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveTab('insights')
                    setFilteredRecords(null)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'insights'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-100'
                  }`}
                >
                  <BarChart3 size={14} />
                  Insights
                </button>
                <button
                  onClick={() => {
                    setActiveTab('records')
                    setFilteredRecords(null)
                    setFilterTitle('')
                    setFilterKeywords([])
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'records'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-100'
                  }`}
                >
                  <List size={14} />
                  Records
                  <span className="text-xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded-full ml-1">
                    {filteredRecords ? filteredRecords.length : data.length}
                  </span>
                </button>
                {filteredRecords && filterTitle && (
                  <span className="text-xs text-surface-500 ml-2">
                    Filtered: {filterTitle}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Content - Responsive padding */}
          <div className={`overflow-y-auto flex-1 touch-scroll ${isMobile ? 'p-4' : 'p-6'}`}>
            {type === 'monthly' && (
              <MonthlyBreakdown
                data={data}
                onSelect={onDrillDown}
                isMobile={isMobile}
              />
            )}

            {type === 'monthly-breakdown' && (
              <MonthlyQualityBreakdown
                data={data}
                onViewObservations={() => onDrillDown && onDrillDown(data.observations)}
                isMobile={isMobile}
              />
            )}

            {type === 'records' && !showInsights && (
              <RecordsTable
                data={data}
                onViewDetails={setSelectedRecord}
                breadcrumb={breadcrumb}
                title={title}
                isMobile={isMobile}
                highlightKeywords={highlightKeywords}
                copyContext={{
                  source: source,
                  title: title,
                  breadcrumb: breadcrumb,
                  count: data.length
                }}
              />
            )}

            {type === 'records' && showInsights && activeTab === 'insights' && insightsData && insightsMode === 'hazard' && (
              <HazardInsightsTab
                hazardName={insightsData.hazardName}
                hazardIncidents={insightsData.hazardIncidents || data}
                allIncidents={insightsData.allIncidents || []}
                factorData={factorData}
                filterMonth={insightsData.filterMonth}
                onViewRecords={handleViewRecords}
                onFilterByRootCause={handleFilterByRootCause}
                isMobile={isMobile}
              />
            )}

            {type === 'records' && showInsights && activeTab === 'insights' && insightsData && insightsMode === 'category' && (
              <CategoryInsightsTab
                categoryType={insightsData.categoryType}
                categoryIncidents={insightsData.categoryIncidents || data}
                allIncidents={insightsData.allIncidents || []}
                onViewRecords={handleViewRecords}
                onFilterByHazard={handleFilterByHazard}
                onFilterByRootCause={handleFilterByRootCause}
                isMobile={isMobile}
              />
            )}

            {type === 'records' && showInsights && activeTab === 'insights' && insightsData && insightsMode === 'observer' && (
              <ObserverInsightsTab
                observerName={insightsData.observerName}
                observerIncidents={insightsData.observerIncidents || data}
                allIncidents={insightsData.allIncidents || []}
                onViewRecords={handleViewRecords}
                onFilterByHazard={handleFilterByHazard}
                isMobile={isMobile}
              />
            )}

            {type === 'records' && showInsights && activeTab === 'records' && (
              <RecordsTable
                data={filteredRecords || data}
                onViewDetails={setSelectedRecord}
                breadcrumb={filterTitle ? [...breadcrumb, filterTitle] : breadcrumb}
                title={filterTitle || title}
                isMobile={isMobile}
                highlightKeywords={filterKeywords.length > 0 ? filterKeywords : highlightKeywords}
                copyContext={{
                  source: source,
                  title: filterTitle || title,
                  breadcrumb: filterTitle ? [...breadcrumb, filterTitle] : breadcrumb,
                  count: filteredRecords ? filteredRecords.length : data.length
                }}
              />
            )}
          </div>

          {/* Footer hint - Safe area for mobile */}
          <div className={`
            border-t border-surface-200/50 bg-white/30 safe-area-bottom
            ${isMobile ? 'px-4 py-2' : 'px-6 py-3'}
          `}>
            <p className={`text-surface-400 text-center ${isMobile ? 'text-xs' : 'text-xs'}`}>
              {type === 'monthly' ? (isMobile ? 'Tap a period to view' : 'Click a period to view observations') :
               type === 'monthly-breakdown' ? (isMobile ? 'Tap metrics to see observations' : 'Click metrics to see contributing observations') :
               showInsights && activeTab === 'insights' ? 'Click chart elements to explore data' :
               `${filteredRecords ? filteredRecords.length : data.length} observation${(filteredRecords ? filteredRecords.length : data.length) !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out forwards;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .touch-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      `}</style>
    </div>,
    document.body
  )
}

/**
 * Monthly Breakdown View
 */
const MonthlyBreakdown = ({ data, onSelect, isMobile = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-surface-500">
        No data available for this selection
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className={`space-y-2 ${isMobile ? 'space-y-1' : ''}`}>
      {data.map((item, idx) => (
        <div
          key={item.period || idx}
          onClick={() => onSelect(item)}
          className={`
            group flex items-center gap-3 sm:gap-4 rounded-xl cursor-pointer
            hover:bg-white/60 active:bg-white/80 transition-all duration-200
            border border-transparent hover:border-surface-200/50 active:border-surface-300/50
            ${isMobile ? 'p-3 min-h-[56px]' : 'p-3'}
          `}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
        >
          <div className={`font-medium text-surface-700 flex-shrink-0 ${isMobile ? 'w-16 text-sm' : 'w-20 text-sm'}`}>
            {item.label}
          </div>
          <div className={`flex-1 bg-surface-100/80 rounded-lg overflow-hidden ${isMobile ? 'h-6' : 'h-8'}`}>
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700 group-active:from-blue-700 group-active:to-blue-800"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-10 sm:w-12 text-right flex-shrink-0">
            <span className={`font-bold text-surface-900 ${isMobile ? 'text-base' : 'text-lg'}`}>{item.count}</span>
          </div>
          <ChevronRight size={isMobile ? 20 : 16} className="text-surface-400 group-hover:text-surface-600 group-active:text-surface-700 transition-colors flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

/**
 * Monthly Quality Breakdown View
 * Shows detailed metric breakdown with formulas for a specific month
 */
const MonthlyQualityBreakdown = ({ data, onViewObservations, isMobile = false }) => {
  if (!data) {
    return (
      <div className="text-center py-12 text-surface-500">
        No data available
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const MetricCard = ({ title, score, formula, details, icon: Icon }) => (
    <div className="p-3 rounded-xl bg-white/60 border border-surface-200/50 hover:bg-white/80 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-surface-500" />}
          <span className="text-sm font-medium text-surface-700">{title}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-sm font-bold border ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      <div className="text-xs text-surface-500 font-mono bg-surface-100/80 px-2 py-1 rounded">
        {formula}
      </div>
      {details && (
        <div className="mt-2 text-xs text-surface-600">
          {details}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <div className="text-3xl font-bold text-surface-900">{data.qualityScore}%</div>
        <div className="text-sm text-surface-600">Overall Quality Score</div>
        <div className="text-xs text-surface-500 mt-1">Based on {data.totalObservations} observations</div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-3">
        <MetricCard
          title="Categorization"
          score={data.categorization?.score || 0}
          formula={data.categorization?.formula || '-'}
          details={`${data.categorization?.proper || 0} proper, ${data.categorization?.blank || 0} blank, ${data.categorization?.other || 0} other`}
          icon={CheckCircle}
        />

        <MetricCard
          title="Coverage"
          score={data.coverage?.score || 0}
          formula={data.coverage?.formula || '-'}
          details={`${data.coverage?.activeDays || 0} days with observations out of ${data.coverage?.totalDays || 0} total days`}
          icon={Calendar}
        />

        <MetricCard
          title="Data Integrity"
          score={data.dataIntegrity?.score || 0}
          formula={data.dataIntegrity?.formula || '-'}
          details={`${data.dataIntegrity?.duplicateCount || 0} duplicates found (${data.dataIntegrity?.duplicateRate || 0}% rate)`}
          icon={Database}
        />

        <MetricCard
          title="Description Quality"
          score={data.description?.score || 0}
          formula={data.description?.formula || '-'}
          details={`Average ${data.description?.avgWordCount || 0} words per description`}
          icon={AlertCircle}
        />

        <MetricCard
          title="Near Miss Rate"
          score={data.nearMiss?.score || 0}
          formula={data.nearMiss?.formula || '-'}
          details={`${data.nearMiss?.count || 0} near misses out of ${data.nearMiss?.nonPositiveCount || 0} non-positive observations`}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Reporter Engagement"
          score={data.reporters?.score || 0}
          formula={data.reporters?.formula || '-'}
          details={`${data.reporters?.active || 0} active reporters (5+ observations) out of ${data.reporters?.total || 0} total`}
          icon={User}
        />
      </div>

      {/* View Observations Button */}
      {onViewObservations && data.observations?.length > 0 && (
        <button
          onClick={onViewObservations}
          className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View {data.totalObservations} Observations
        </button>
      )}
    </div>
  )
}

/**
 * Records Table View
 */
const RecordsTable = ({ data, onViewDetails, isMobile = false, highlightKeywords = [], copyContext = {} }) => {
  const [copied, setCopied] = React.useState(false)
  const copyTimerRef = useRef(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-surface-500">
        No events found
      </div>
    )
  }

  /**
   * Copy all observations with CONTEXT HEADER for classification tuning
   * Format includes:
   * - Source: Safety Outlook
   * - Type: Other/Site Issues/Positives
   * - Hazard Category: Mobile Plant & Equipment
   * - Count: Number of observations
   * - Numbered list of descriptions
   */
  const handleCopyAll = async () => {
    // Build context header
    const contextLines = []
    const sourceName = (copyContext.source || 'DRILL-DOWN').toUpperCase().replace(/\s+/g, ' ')
    contextLines.push(`=== ${sourceName} DRILL-DOWN COPY ===`)

    // Extract type and category from title/breadcrumb
    const title = copyContext.title || 'Observations'
    const breadcrumb = copyContext.breadcrumb || []

    // Determine observation type (Other, Site Issues, Positives)
    let observationType = 'Unknown'
    if (title.includes('Other')) {
      observationType = 'Other (Misclassified/Uncategorized)'
    } else if (title.includes('Site Issues') || title.includes('Negative')) {
      observationType = 'Site Issues (Negative Observations)'
    } else if (title.includes('Positive')) {
      observationType = 'Positives (Good Observations)'
    } else {
      observationType = title
    }

    // Extract hazard category from breadcrumb or title
    let hazardCategory = 'Unknown'
    const categoryMatch = title.match(/from\s+(.+)$/i)
    if (categoryMatch) {
      hazardCategory = categoryMatch[1].trim()
    } else if (breadcrumb.length > 0) {
      // Look for category in breadcrumb (usually the first item after "Safety Outlook")
      for (const crumb of breadcrumb) {
        if (crumb && !crumb.includes('Safety') && !crumb.includes('Outlook')) {
          hazardCategory = crumb
          break
        }
      }
    }

    contextLines.push(`Source: ${copyContext.source || 'Unknown'}`)
    contextLines.push(`Type: ${observationType}`)
    contextLines.push(`Hazard Category: ${hazardCategory}`)
    contextLines.push(`Count: ${data.length} observations`)
    contextLines.push(`Breadcrumb: ${breadcrumb.length > 0 ? breadcrumb.join(' > ') : 'N/A'}`)
    contextLines.push('')
    contextLines.push('=== OBSERVATIONS ===')
    contextLines.push('')

    // Add numbered observations with classification context
    const observations = data.map((record, idx) => {
      const lines = [`${idx + 1}. "${record.description || 'No description'}"`]

      // Classification source tag
      const source = record.hazardCategorySource
      const method = record.classificationMethod

      if (source === 'excel') {
        lines.push('   [Source: Excel]')
      } else if (source === 'auto-classified') {
        lines.push(`   [Source: Auto-classified | Method: ${method || 'unknown'}]`)

        // Score breakdown (top 3, only for scoring method)
        const scores = record.classificationScores
        if (scores && method === 'scoring') {
          const sorted = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
          if (sorted.length > 0) {
            const scoreStr = sorted.map(([cat, pts]) => `${cat}: ${pts}`).join(' > ')
            lines.push(`   [Scores: ${scoreStr}]`)
          }
        }

        // Ensemble voting summary from contextAnalysis
        const ctx = record.contextAnalysis
        if (ctx?.votes) {
          const consensus = ctx.consensusLevel || '?'
          const conf = ctx.confidence != null ? `${Math.round(ctx.confidence)}%` : '?'
          const strategyNames = ['keyword', 'sentence', 'cleanText', 'controlLink']
          const voteDetails = strategyNames.map(name => {
            const vote = ctx.votes[name]
            if (!vote?.category) return `${name}→N/A`
            const voteConf = vote.confidence != null ? `(${Math.round(vote.confidence)}%)` : ''
            // Abbreviate long category names for readability
            const cat = vote.category.length > 20
              ? vote.category.split(/\s+/).map(w => w[0]).join('').toUpperCase()
              : vote.category
            return `${name}→${cat}${voteConf}`
          }).join(', ')
          lines.push(`   [Votes: ${consensus} @ ${conf} — ${voteDetails}]`)
        }
      }

      return lines.join('\n')
    })

    const fullText = contextLines.join('\n') + observations.join('\n\n')

    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Copy failed silently
    }
  }

  // Status color imported from shared utility

  return (
    <div className={`space-y-2 ${isMobile ? 'space-y-3' : ''}`}>
      {/* Copy All Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleCopyAll}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied All!' : `Copy All (${data.length})`}
        </button>
      </div>
      {data.length > VIRTUAL_THRESHOLD ? (
        /* Virtualized list for large datasets - smooth scrolling for 500+ records */
        <div style={{ height: Math.min(data.length * VIRTUAL_ROW_HEIGHT, 600), width: '100%' }}>
          <AutoSizer>
            {({ height, width }) => (
              <VirtualList
                height={height}
                width={width}
                itemCount={data.length}
                itemSize={VIRTUAL_ROW_HEIGHT}
                overscanCount={5}
              >
                {({ index, style }) => {
                  const record = data[index]
                  return (
                    <div style={{ ...style, paddingBottom: 8 }}>
                      <RecordCard
                        record={record}
                        isMobile={isMobile}
                        highlightKeywords={highlightKeywords}
                        onViewDetails={onViewDetails}
                      />
                    </div>
                  )
                }}
              </VirtualList>
            )}
          </AutoSizer>
        </div>
      ) : (
        /* Direct render for small datasets (no virtualization overhead) */
        data.map((record, idx) => (
          <RecordCard
            key={record.externalId || idx}
            record={record}
            isMobile={isMobile}
            highlightKeywords={highlightKeywords}
            onViewDetails={onViewDetails}
          />
        ))
      )}
    </div>
  )
}

/**
 * Single record card - extracted for use in both virtualized and direct rendering
 */
const RecordCard = React.memo(({ record, isMobile, highlightKeywords = [], onViewDetails }) => (
  <div
    className={`
      group rounded-xl bg-white/60 border border-surface-200/50
      hover:bg-white/80 active:bg-white/90 hover:border-surface-300/50 active:border-surface-400/50
      transition-all duration-200
      ${isMobile ? 'p-3' : 'p-4'}
    `}
  >
    <div className={`${isMobile ? 'space-y-3' : 'flex items-start justify-between gap-4'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`font-medium text-surface-900 ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {record.date}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(record.actionStatus)}`}>
            {record.actionStatus || 'open'}
          </span>
        </div>
        <p className={`text-surface-600 line-clamp-2 ${isMobile ? 'text-sm leading-relaxed' : 'text-sm'}`}>
          {highlightKeywords.length > 0 ? (
            <HighlightedText
              text={record.description || 'No description'}
              keywords={highlightKeywords}
            />
          ) : (
            record.description || 'No description'
          )}
        </p>
        <div className={`flex items-center gap-3 sm:gap-4 mt-2 text-xs text-surface-500 flex-wrap`}>
          {record.contractor && (
            <span className="flex items-center gap-1">
              <Building2 size={12} />
              <span className="truncate max-w-[120px]">{record.contractor}</span>
            </span>
          )}
          {record.site && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="truncate max-w-[100px]">{record.site}</span>
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onViewDetails(record)}
        className={`
          flex items-center justify-center gap-1.5 font-medium text-blue-600
          hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors
          ${isMobile
            ? 'w-full h-11 text-sm bg-blue-50 mt-1'
            : 'px-3 py-1.5 text-sm'
          }
        `}
      >
        <Eye size={isMobile ? 18 : 14} />
        View Details
      </button>
    </div>
  </div>
))

/**
 * Record Details Modal (Glassmorphism)
 */
const RecordDetailsModal = ({ record, onClose }) => {
  const [copied, setCopied] = useState(false)
  const { updateIncident } = useDataActions()
  const copyTimerRef = useRef(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  // Flag for miscategorization
  const isFlagged = record._flaggedMiscategorized

  const handleToggleFlag = () => {
    updateIncident(record.id, {
      _flaggedMiscategorized: !isFlagged,
      _flaggedMiscategorizedAt: !isFlagged ? new Date().toISOString() : null
    })
  }

  // Resizable functionality
  const {
    containerRef: detailsContainerRef,
    containerStyle: detailsContainerStyle,
    isResizing: isDetailsResizing,
    ResizeHandles: DetailsResizeHandles,
    isMobile
  } = useResizable({
    minWidth: 450,
    minHeight: 350,
    maxWidthPercent: 90,
    maxHeightPercent: 90
  })

  if (!record) return null

  const handleCopyEventId = () => {
    navigator.clipboard.writeText(record.externalId)
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }


  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center ${isMobile ? 'p-0' : 'p-4'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Darker backdrop for nested modal */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Modal - Bottom sheet on mobile */}
      <div
        ref={detailsContainerRef}
        className={`
          relative w-full flex flex-col
          ${isMobile
            ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl animate-slide-up'
            : 'max-w-3xl max-h-[90vh] rounded-2xl animate-modal-in'
          }
          ${isDetailsResizing ? 'select-none' : ''}
        `}
        style={isMobile ? {} : detailsContainerStyle}
      >
        <DetailsResizeHandles />
        <div className={`
          bg-white/95 sm:bg-white/90 backdrop-blur-2xl border-white/30 shadow-2xl overflow-hidden h-full flex flex-col
          ${isMobile ? 'border-0 rounded-t-2xl' : 'border rounded-2xl'}
        `}>
          {/* Header - Larger touch targets on mobile */}
          <div className={`
            border-b border-surface-200/50 bg-gradient-to-r from-surface-50/80 to-white/80 safe-area-top
            ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}
          `}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
                <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 ${isMobile ? 'order-1' : ''}`}>
                  {record.type?.toUpperCase() || 'OBSERVATION'}
                </span>
                <span className={`text-surface-500 ${isMobile ? 'text-xs order-2' : 'text-sm'}`}>{formatDate(record.date)}</span>
              </div>
              <button
                onClick={onClose}
                className={`
                  rounded-xl hover:bg-surface-100/80 active:bg-surface-200/80
                  text-surface-400 hover:text-surface-600 transition-colors
                  ${isMobile ? 'p-3 -mr-1' : 'p-2'}
                `}
                aria-label="Close modal"
              >
                <X size={isMobile ? 24 : 20} />
              </button>
            </div>
          </div>

          {/* Content - Responsive padding */}
          <div className={`space-y-4 sm:space-y-6 flex-1 overflow-y-auto touch-scroll ${isMobile ? 'p-4' : 'p-6'}`}>
            {/* All Fields */}
            <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <DetailField icon={Calendar} label="Date" value={formatDate(record.date)} />
              {record.eventTime && (
                <DetailField icon={Clock} label="Time" value={record.eventTime} />
              )}
              <DetailField icon={Building2} label="Contractor" value={record.contractor} />
              <DetailField icon={MapPin} label="Site" value={record.site} />
              {record.company && (
                <DetailField icon={Briefcase} label="Company" value={record.company} />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 uppercase tracking-wide">
                  <AlertCircle size={12} />
                  Hazard Category
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-surface-900">{record.location || '-'}</span>
                  {record.hazardCategorySource && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${record.hazardCategorySource === 'excel' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {record.hazardCategorySource === 'excel' ? 'Excel' : 'Auto'}
                    </span>
                  )}
                  <button
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isFlagged
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    <Flag size={12} />
                    {isFlagged ? 'Flagged' : 'Flag'}
                  </button>
                </div>
              </div>
              <DetailField icon={User} label="Reported By" value={record.reportedBy} />
              <DetailField icon={CheckCircle} label="Approval" value={record.approvalStatus || '-'} />
              {record.consequence && (
                <DetailField icon={AlertTriangle} label="Consequence" value={record.consequence} />
              )}
              {record.workRelated != null && (
                <DetailField icon={Briefcase} label="Work-Related" value={record.workRelated ? 'Yes' : 'No'} />
              )}
              {record.bodyPart && (
                <DetailField icon={User} label="Body Part" value={record.bodyPart} />
              )}
              <DetailField icon={FileSpreadsheet} label="Original Type" value={record.originalType || record.type || '-'} />
              {record.originalClassification && (
                <DetailField icon={FileText} label="Original Classification" value={record.originalClassification} />
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                Description
              </div>
              <div className="p-4 bg-surface-50/80 rounded-xl border border-surface-200/50 text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">
                {record.description || 'No description provided.'}
              </div>
            </div>

            {/* Reference ID with Copy Button */}
            {record.externalId && (
              <div className="pt-4 border-t border-surface-200/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400">Reference: {record.externalId}</span>
                  <button
                    onClick={handleCopyEventId}
                    className={`p-1.5 rounded transition-all ${
                      copied
                        ? 'text-green-600 bg-green-50'
                        : 'text-surface-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={copied ? 'Copied!' : 'Copy Event ID'}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  {copied && (
                    <span className="text-xs text-green-600 font-medium">Copied!</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * Detail Field Component
 */
const DetailField = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 uppercase tracking-wide">
      {Icon && <Icon size={12} />}
      {label}
    </div>
    <div className="text-sm text-surface-900">{value || '-'}</div>
  </div>
)

export default DrillDownModal
