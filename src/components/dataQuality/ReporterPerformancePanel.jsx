import { useState, useMemo, memo } from 'react'
import {
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Target,
  Search,
  X
} from 'lucide-react'
import { InfoTooltip } from '../ui/Tooltip'

const ReporterPerformancePanel = memo(({ reporters, onReporterClick, isMobile }) => {
  const [reporterSort, setReporterSort] = useState('total')
  const [reporterSearch, setReporterSearch] = useState('')

  const sortedReporters = useMemo(() => {
    if (!reporters) return []
    let filtered = [...reporters]
    if (reporterSearch.trim()) {
      const searchLower = reporterSearch.toLowerCase().trim()
      filtered = filtered.filter(r => r.name.toLowerCase().includes(searchLower))
    }
    return filtered.sort((a, b) => {
      if (reporterSort === 'total') return b.total - a.total
      if (reporterSort === 'nearMiss') return b.nearMiss - a.nearMiss
      if (reporterSort === 'quality') return parseFloat(b.qualityRate) - parseFloat(a.qualityRate)
      return 0
    })
  }, [reporters, reporterSort, reporterSearch])

  if (!reporters || reporters.length === 0) return null

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
      <div className={isMobile ? 'space-y-3 mb-4' : 'flex items-center justify-between mb-4'}>
        <div className="flex items-center justify-between">
          <h3 className={`font-medium text-surface-500 uppercase tracking-wide flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Users size={16} />
            Reporter Performance
            <InfoTooltip text="HOW REPORTER METRICS ARE CALCULATED: For each individual reporter, we analyze: TOTAL OBSERVATIONS: How many they've submitted. POSITIVE %: What percentage of their reports are positive observations (recognizing safe behaviors). AVG QUALITY: Average quality score of their descriptions. FLAGS: Special indicators like 'Top Reporter' (high volume), 'Quality Star' (consistently detailed), or concerns like 'Declining' (fewer reports recently) or 'Low Quality' (brief descriptions). Click any row to see detailed analytics for that reporter. WHY THIS MATTERS: Helps identify your safety champions (high reporters), people who may need coaching (low quality), and concerning trends (declining activity) so you can provide targeted support and recognition." />
          </h3>
          {isMobile && (
            <select
              value={reporterSort}
              onChange={(e) => setReporterSort(e.target.value)}
              className="text-xs border border-surface-200 rounded px-2 py-1 h-9"
            >
              <option value="total">By Total</option>
              <option value="nearMiss">By Near Miss</option>
              <option value="quality">By Quality</option>
            </select>
          )}
        </div>
        <div className={isMobile ? 'flex items-center gap-2 flex-wrap' : 'flex items-center gap-3'}>
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-surface-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search reporters..."
              value={reporterSearch}
              onChange={(e) => setReporterSearch(e.target.value)}
              className={`pl-8 pr-8 py-1.5 text-xs border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                isMobile ? 'w-36' : 'w-44'
              }`}
            />
            {reporterSearch && (
              <button
                onClick={() => setReporterSearch('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {reporterSearch && (
            <span className="text-xs text-surface-500">
              Showing {sortedReporters.length} of {reporters.length}
            </span>
          )}
          {/* Performance Flags Summary */}
          <div className={`flex items-center gap-2 text-xs ${isMobile ? 'flex-wrap' : ''}`}>
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
              <AlertTriangle size={12} />
              {reporters.filter(r => r.nearMiss === 0 && r.total >= 5).length} {isMobile ? 'NM' : 'Zero NM'}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
              <AlertCircle size={12} />
              {reporters.filter(r => parseFloat(r.qualityRate) < 50).length} {isMobile ? 'Low' : 'Low Quality'}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
              <Target size={12} />
              {reporters.filter(r => parseFloat(r.classificationAccuracy) < 85).length} {isMobile ? 'Acc' : 'Low Accuracy'}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
              <CheckCircle size={12} />
              {reporters.filter(r => r.nearMiss > 0 && parseFloat(r.qualityRate) >= 75).length} {isMobile ? 'Top' : 'Top Performers'}
            </span>
          </div>
          {!isMobile && (
            <select
              value={reporterSort}
              onChange={(e) => setReporterSort(e.target.value)}
              className="text-xs border border-surface-200 rounded px-2 py-1"
            >
              <option value="total">Sort by Total</option>
              <option value="nearMiss">Sort by Near Miss</option>
              <option value="quality">Sort by Quality</option>
            </select>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className={`grid gap-3 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <div className="bg-surface-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-surface-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{reporters.length}</div>
          <div className="text-xs text-surface-500">Total Reporters</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-blue-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {reporters.filter(r => r.total >= 10).length}
          </div>
          <div className="text-xs text-surface-500">Active (10+ obs)</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-green-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {reporters.length > 0 ? (reporters.reduce((sum, r) => sum + parseFloat(r.qualityRate), 0) / reporters.length).toFixed(0) : 0}%
          </div>
          <div className="text-xs text-surface-500">Avg Quality Rate</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-amber-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {reporters.length > 0 ? (reporters.reduce((sum, r) => sum + r.nearMiss, 0) / reporters.length).toFixed(1) : 0}
          </div>
          <div className="text-xs text-surface-500">Avg NM/Reporter</div>
        </div>
      </div>

      {/* Reporter Table with Flags */}
      {isMobile ? (
        <div className="space-y-2 max-h-80 overflow-auto">
          {sortedReporters.map((reporter) => {
            const hasZeroNM = reporter.nearMiss === 0 && reporter.total >= 5
            const lowQuality = parseFloat(reporter.qualityRate) < 50
            const topPerformer = reporter.nearMiss > 0 && parseFloat(reporter.qualityRate) >= 75 && reporter.total >= 10
            const lowAccuracy = parseFloat(reporter.classificationAccuracy) < 85
            return (
              <div
                key={reporter.name}
                onClick={() => onReporterClick(reporter.name)}
                className="p-3 bg-surface-50 rounded-lg cursor-pointer active:bg-surface-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-600 truncate flex-1">{reporter.name}</span>
                  <div className="flex gap-1 ml-2">
                    {hasZeroNM && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">0 NM</span>}
                    {lowQuality && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]">Low Q</span>}
                    {lowAccuracy && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Low Acc</span>}
                    {topPerformer && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">Star</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-500">
                  <span><strong>{reporter.total}</strong> total</span>
                  <span className={reporter.nearMiss === 0 ? 'text-red-600' : 'text-green-600'}>
                    <strong>{reporter.nearMiss}</strong> NM
                  </span>
                  <span className={
                    parseFloat(reporter.qualityRate) >= 75 ? 'text-green-600' :
                    parseFloat(reporter.qualityRate) >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    <strong>{reporter.qualityRate}%</strong> quality
                  </span>
                  <span className={
                    parseFloat(reporter.classificationAccuracy) >= 95 ? 'text-green-600' :
                    parseFloat(reporter.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    <strong>{reporter.classificationAccuracy}%</strong> acc
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="overflow-auto max-h-80">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-50">
              <tr>
                <th className="text-left p-2 font-medium text-surface-600">Reporter</th>
                <th className="text-center p-2 font-medium text-surface-600">Total</th>
                <th className="text-center p-2 font-medium text-surface-600">Near Miss</th>
                <th className="text-center p-2 font-medium text-surface-600">Quality Rate</th>
                <th className="text-center p-2 font-medium text-surface-600">Accuracy</th>
                <th className="text-center p-2 font-medium text-surface-600">NM Rate</th>
                <th className="text-center p-2 font-medium text-surface-600">Flags</th>
              </tr>
            </thead>
            <tbody>
              {sortedReporters.map((reporter, idx) => {
                const nmRate = reporter.total > 0 ? ((reporter.nearMiss / reporter.total) * 100).toFixed(1) : 0
                const hasZeroNM = reporter.nearMiss === 0 && reporter.total >= 5
                const lowQuality = parseFloat(reporter.qualityRate) < 50
                const topPerformer = reporter.nearMiss > 0 && parseFloat(reporter.qualityRate) >= 75 && reporter.total >= 10
                const lowAccuracy = parseFloat(reporter.classificationAccuracy) < 85
                return (
                  <tr
                    key={reporter.name}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} cursor-pointer hover:bg-blue-50 transition-colors`}
                    onClick={() => onReporterClick(reporter.name)}
                    title="Click to view detailed analytics"
                  >
                    <td className="p-2">
                      <span className="text-blue-600 hover:underline font-medium">{reporter.name}</span>
                    </td>
                    <td className="p-2 text-center font-bold">{reporter.total}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded ${
                        reporter.nearMiss === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {reporter.nearMiss}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`font-medium ${
                        parseFloat(reporter.qualityRate) >= 75 ? 'text-green-600' :
                        parseFloat(reporter.qualityRate) >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {reporter.qualityRate}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`font-medium ${
                        parseFloat(reporter.classificationAccuracy) >= 95 ? 'text-green-600' :
                        parseFloat(reporter.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {reporter.classificationAccuracy}%
                      </span>
                    </td>
                    <td className="p-2 text-center text-surface-500">{nmRate}%</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {hasZeroNM && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="No near misses reported - training needed">
                            0 NM
                          </span>
                        )}
                        {lowQuality && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]" title="Low description quality">
                            Low Q
                          </span>
                        )}
                        {lowAccuracy && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="Low classification accuracy">
                            Low Acc
                          </span>
                        )}
                        {topPerformer && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]" title="Top performer">
                            Star
                          </span>
                        )}
                        {!hasZeroNM && !lowQuality && !lowAccuracy && !topPerformer && (
                          <span className="text-surface-300">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with training suggestion */}
      {reporters.some(r => r.nearMiss === 0 && r.total >= 10) && (
        <div className="mt-3 pt-3 border-t border-surface-200 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
          <AlertTriangle size={14} />
          <span className="font-medium">Training Recommended:</span>
          <span>{reporters.filter(r => r.nearMiss === 0 && r.total >= 10).length} reporters with 10+ observations have reported 0 near misses - this may indicate a need for hazard recognition training.</span>
        </div>
      )}
    </div>
  )
})

ReporterPerformancePanel.displayName = 'ReporterPerformancePanel'

export default ReporterPerformancePanel
