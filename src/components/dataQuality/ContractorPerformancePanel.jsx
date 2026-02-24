import { useState, useMemo, memo } from 'react'
import {
  Building2,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Target,
  Search,
  X
} from 'lucide-react'
import { InfoTooltip } from '../ui/Tooltip'

const ContractorPerformancePanel = memo(({ contractors, onContractorClick, isMobile }) => {
  const [contractorSort, setContractorSort] = useState('totalObs')
  const [contractorSearch, setContractorSearch] = useState('')

  const sortedContractors = useMemo(() => {
    if (!contractors) return []
    let filtered = [...contractors]
    if (contractorSearch.trim()) {
      const searchLower = contractorSearch.toLowerCase().trim()
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchLower))
    }
    return filtered.sort((a, b) => {
      if (contractorSort === 'totalObs') return b.totalObs - a.totalObs
      if (contractorSort === 'qualityScore') return b.qualityScore - a.qualityScore
      return 0
    })
  }, [contractors, contractorSort, contractorSearch])

  const handleContractorDrillDown = (contractor) => {
    onContractorClick(contractor.name)
  }

  if (!contractors || contractors.length === 0) return null

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
      <div className={isMobile ? 'space-y-3 mb-4' : 'flex items-center justify-between mb-4'}>
        <div className="flex items-center justify-between">
          <h3 className={`font-medium text-surface-500 uppercase tracking-wide flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Building2 size={16} />
            Contractor Performance
            <InfoTooltip text="HOW CONTRACTOR METRICS ARE CALCULATED: For each contractor, we analyze all their observations to calculate: TOTAL OBS: How many observations they've submitted. REPORTERS: Number of unique reporters from that contractor. QUALITY RATE: Average quality of their descriptions. NM RATE: Near-miss reporting rate. SCORE: Composite quality score. FLAGS: Low Quality (quality rate < 30%), Zero NM (no near-misses with 10+ obs), Top Performer (score >= 70 with 10+ obs). Click any row to see detailed analytics for that contractor." />
          </h3>
          {isMobile && (
            <select
              value={contractorSort}
              onChange={(e) => setContractorSort(e.target.value)}
              className="text-xs border border-surface-200 rounded px-2 py-1 h-9"
            >
              <option value="totalObs">By Total</option>
              <option value="qualityScore">By Score</option>
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
              placeholder="Search contractors..."
              value={contractorSearch}
              onChange={(e) => setContractorSearch(e.target.value)}
              className={`pl-8 pr-8 py-1.5 text-xs border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                isMobile ? 'w-36' : 'w-44'
              }`}
            />
            {contractorSearch && (
              <button
                onClick={() => setContractorSearch('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {contractorSearch && (
            <span className="text-xs text-surface-500">
              Showing {sortedContractors.length} of {contractors.length}
            </span>
          )}
          {/* Performance Flags Summary */}
          <div className={`flex items-center gap-2 text-xs ${isMobile ? 'flex-wrap' : ''}`}>
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
              <AlertTriangle size={12} />
              {contractors.filter(c => parseFloat(c.qualityRate || 0) < 30).length} {isMobile ? 'Low' : 'Low Quality'}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
              <Target size={12} />
              {contractors.filter(c => parseFloat(c.classificationAccuracy) < 85).length} {isMobile ? 'Acc' : 'Low Accuracy'}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
              <AlertCircle size={12} />
              {contractors.filter(c => c.nearMissRate === 0 && c.totalObs >= 10).length} {isMobile ? 'NM' : 'Zero NM'}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
              <CheckCircle size={12} />
              {contractors.filter(c => c.qualityScore >= 70 && c.totalObs >= 10).length} {isMobile ? 'Top' : 'Top Performers'}
            </span>
          </div>
          {!isMobile && (
            <select
              value={contractorSort}
              onChange={(e) => setContractorSort(e.target.value)}
              className="text-xs border border-surface-200 rounded px-2 py-1"
            >
              <option value="totalObs">Sort by Total</option>
              <option value="qualityScore">Sort by Score</option>
            </select>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-3 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <div className="bg-surface-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-surface-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{contractors.length}</div>
          <div className="text-xs text-surface-500">Total Contractors</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-blue-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {contractors.filter(c => c.totalObs >= 10).length}
          </div>
          <div className="text-xs text-surface-500">Active (10+ obs)</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-green-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {contractors.length > 0 ? (contractors.reduce((sum, c) => sum + parseFloat(c.qualityRate || 0), 0) / contractors.length).toFixed(0) : 0}%
          </div>
          <div className="text-xs text-surface-500">Avg Quality Rate</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <div className={`font-bold text-amber-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {contractors.length > 0 ? (contractors.reduce((sum, c) => sum + c.totalObs, 0) / contractors.length).toFixed(0) : 0}
          </div>
          <div className="text-xs text-surface-500">Avg Obs/Contractor</div>
        </div>
      </div>

      {/* Contractor Table */}
      {isMobile ? (
        <div className="space-y-2 max-h-80 overflow-auto">
          {sortedContractors.map((contractor) => {
            const lowQuality = parseFloat(contractor.qualityRate || 0) < 30
            const zeroNM = contractor.nearMissRate === 0 && contractor.totalObs >= 10
            const topPerformer = contractor.qualityScore >= 70 && contractor.totalObs >= 10
            const lowAccuracy = parseFloat(contractor.classificationAccuracy) < 85
            return (
              <div
                key={contractor.name}
                onClick={() => handleContractorDrillDown(contractor)}
                className="p-3 bg-surface-50 rounded-lg cursor-pointer active:bg-surface-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-600 truncate flex-1">{contractor.name}</span>
                  <div className="flex gap-1 ml-2">
                    {lowQuality && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Low Q</span>}
                    {lowAccuracy && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Low Acc</span>}
                    {zeroNM && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]">0 NM</span>}
                    {topPerformer && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">Star</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-500">
                  <span><strong>{contractor.totalObs}</strong> obs</span>
                  <span className={
                    contractor.qualityScore >= 70 ? 'text-green-600' :
                    contractor.qualityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    Score: <strong>{contractor.qualityScore}</strong>
                  </span>
                  <span className={
                    parseFloat(contractor.classificationAccuracy) >= 95 ? 'text-green-600' :
                    parseFloat(contractor.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    Acc: <strong>{contractor.classificationAccuracy}%</strong>
                  </span>
                  <span>{contractor.activeReporters} reporters</span>
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
                <th className="text-left p-2 font-medium text-surface-600">Contractor</th>
                <th className="text-center p-2 font-medium text-surface-600">Total</th>
                <th className="text-center p-2 font-medium text-surface-600">Reporters</th>
                <th className="text-center p-2 font-medium text-surface-600">Quality Rate</th>
                <th className="text-center p-2 font-medium text-surface-600">Accuracy</th>
                <th className="text-center p-2 font-medium text-surface-600">NM Rate</th>
                <th className="text-center p-2 font-medium text-surface-600">Score</th>
                <th className="text-center p-2 font-medium text-surface-600">Flags</th>
              </tr>
            </thead>
            <tbody>
              {sortedContractors.map((contractor, idx) => {
                const lowQuality = parseFloat(contractor.qualityRate || 0) < 30
                const zeroNM = contractor.nearMissRate === 0 && contractor.totalObs >= 10
                const topPerformer = contractor.qualityScore >= 70 && contractor.totalObs >= 10
                const lowAccuracy = parseFloat(contractor.classificationAccuracy) < 85
                return (
                  <tr
                    key={contractor.name}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} cursor-pointer hover:bg-blue-50 transition-colors`}
                    onClick={() => handleContractorDrillDown(contractor)}
                    title="Click to view detailed analytics"
                  >
                    <td className="p-2">
                      <span className="text-blue-600 hover:underline font-medium">{contractor.name}</span>
                    </td>
                    <td className="p-2 text-center font-bold">{contractor.totalObs}</td>
                    <td className="p-2 text-center text-surface-600">{contractor.activeReporters}</td>
                    <td className="p-2 text-center">
                      <span className={`font-medium ${
                        parseFloat(contractor.qualityRate || 0) >= 75 ? 'text-green-600' :
                        parseFloat(contractor.qualityRate || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {contractor.qualityRate || 0}%
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`font-medium ${
                        parseFloat(contractor.classificationAccuracy) >= 95 ? 'text-green-600' :
                        parseFloat(contractor.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {contractor.classificationAccuracy}%
                      </span>
                    </td>
                    <td className="p-2 text-center text-surface-500">{contractor.nearMissRate || 0}%</td>
                    <td className="p-2 text-center">
                      <span className={
                        contractor.qualityScore >= 70 ? 'text-green-600' :
                        contractor.qualityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {contractor.qualityScore}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {lowQuality && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="Low quality rate">
                            Low Q
                          </span>
                        )}
                        {lowAccuracy && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="Low classification accuracy">
                            Low Acc
                          </span>
                        )}
                        {zeroNM && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]" title="No near misses reported">
                            0 NM
                          </span>
                        )}
                        {topPerformer && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]" title="Top performer">
                            Star
                          </span>
                        )}
                        {!lowQuality && !lowAccuracy && !zeroNM && !topPerformer && (
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

      {/* Footer with quality review recommendation */}
      {contractors.some(c => parseFloat(c.qualityRate || 0) < 30 && c.totalObs >= 10) && (
        <div className="mt-3 pt-3 border-t border-surface-200 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
          <AlertTriangle size={14} />
          <span className="font-medium">Quality Review Recommended:</span>
          <span>{contractors.filter(c => parseFloat(c.qualityRate || 0) < 30 && c.totalObs >= 10).length} contractors with 10+ observations have quality rates below 30% - consider a quality improvement discussion.</span>
        </div>
      )}
    </div>
  )
})

ContractorPerformancePanel.displayName = 'ContractorPerformancePanel'

export default ContractorPerformancePanel
