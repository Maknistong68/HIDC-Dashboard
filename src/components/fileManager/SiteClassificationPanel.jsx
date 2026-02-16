import React, { useState, useMemo, useEffect } from 'react'
import { Search, MapPin, ChevronLeft, ChevronRight, Filter, X, Check, CheckSquare } from 'lucide-react'
import { useDataActions } from '../../context/DataContext'
import { Card } from '../ui'

const SUB_REGIONS = [
  { value: 'SUB REGION 1', label: '1', fullLabel: 'Sub Region 1' },
  { value: 'SUB REGION 2', label: '2', fullLabel: 'Sub Region 2' },
  { value: 'SUB REGION 3', label: '3', fullLabel: 'Sub Region 3' },
  { value: 'SUB REGION 4', label: '4', fullLabel: 'Sub Region 4' },
  { value: 'SUB REGION 5', label: '5', fullLabel: 'Sub Region 5' },
]

const ITEMS_PER_PAGE = 25

const SiteClassificationPanel = () => {
  const { getEnrichedSites, updateSiteClassification, updateSiteClassificationsBatch } = useDataActions()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterMode, setFilterMode] = useState('all') // 'all', 'classified', 'unclassified'
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingSite, setUpdatingSite] = useState(null)
  const [selectedSites, setSelectedSites] = useState(new Set())
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  // Get all sites with their data
  const sites = useMemo(() => {
    return getEnrichedSites()
  }, [getEnrichedSites])

  // Filter and search sites
  const filteredSites = useMemo(() => {
    let result = [...sites]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(s => s.name.toLowerCase().includes(search))
    }

    // Classification filter
    if (filterMode === 'classified') {
      result = result.filter(s => s.subRegion)
    } else if (filterMode === 'unclassified') {
      result = result.filter(s => !s.subRegion)
    }

    // Sort alphabetically by name
    result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [sites, searchTerm, filterMode])

  // Pagination
  const totalPages = Math.ceil(filteredSites.length / ITEMS_PER_PAGE)
  const paginatedSites = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSites.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSites, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterMode])

  // Clear selection when filters/search change (but NOT on page change)
  useEffect(() => {
    setSelectedSites(new Set())
  }, [searchTerm, filterMode])

  // Select all unassigned sites across all pages
  const handleSelectAllUnassigned = () => {
    const allUnassigned = sites.filter(s => !s.subRegion).map(s => s.name)
    setSelectedSites(new Set(allUnassigned))
  }

  // Handle single site sub-region change (quick click)
  const handleSubRegionChange = async (siteName, newSubRegion) => {
    setUpdatingSite(siteName)
    try {
      await updateSiteClassification(siteName, newSubRegion)
    } catch (error) {
      console.error('Error updating site classification:', error)
    } finally {
      setUpdatingSite(null)
    }
  }

  // Handle bulk sub-region assignment
  const handleBulkAssign = async (subRegion) => {
    if (selectedSites.size === 0) return

    setIsBulkUpdating(true)
    try {
      const assignments = Array.from(selectedSites).map(name => ({ name, subRegion }))
      await updateSiteClassificationsBatch(assignments)
      setSelectedSites(new Set())
    } catch (error) {
      console.error('Error bulk updating site classifications:', error)
    } finally {
      setIsBulkUpdating(false)
    }
  }

  // Handle checkbox toggle
  const toggleSiteSelection = (siteName) => {
    setSelectedSites(prev => {
      const next = new Set(prev)
      if (next.has(siteName)) {
        next.delete(siteName)
      } else {
        next.add(siteName)
      }
      return next
    })
  }

  // Handle select all on current page
  const handleSelectAll = () => {
    const allSelected = paginatedSites.every(s => selectedSites.has(s.name))
    if (allSelected) {
      // Deselect all on page
      setSelectedSites(prev => {
        const next = new Set(prev)
        paginatedSites.forEach(s => next.delete(s.name))
        return next
      })
    } else {
      // Select all on page
      setSelectedSites(prev => {
        const next = new Set(prev)
        paginatedSites.forEach(s => next.add(s.name))
        return next
      })
    }
  }

  // Summary stats
  const stats = useMemo(() => {
    const classified = sites.filter(s => s.subRegion).length
    return {
      total: sites.length,
      classified,
      unclassified: sites.length - classified
    }
  }, [sites])

  // Check if all on page are selected
  const allOnPageSelected = paginatedSites.length > 0 && paginatedSites.every(s => selectedSites.has(s.name))
  const someOnPageSelected = paginatedSites.some(s => selectedSites.has(s.name))

  if (sites.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <div className="p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 rounded-2xl flex items-center justify-center">
            <MapPin size={36} className="text-surface-400" />
          </div>
          <h3 className="text-xl font-semibold text-surface-800 mb-2">
            No Sites Found
          </h3>
          <p className="text-surface-500 max-w-sm mx-auto">
            Import data files to see sites that can be classified.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg" padding="none">
      {/* Header with search and filters */}
      <div className="p-5 bg-gradient-to-r from-surface-50 to-white border-b border-surface-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 shadow-sm"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-surface-600 hover:text-surface-800'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterMode('classified')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filterMode === 'classified'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-surface-600 hover:text-surface-800'
              }`}
            >
              Classified ({stats.classified})
            </button>
            <button
              onClick={() => setFilterMode('unclassified')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filterMode === 'unclassified'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-surface-600 hover:text-surface-800'
              }`}
            >
              Unclassified ({stats.unclassified})
            </button>
          </div>

          {/* Select All Unassigned button */}
          {stats.unclassified > 0 && (
            <button
              onClick={handleSelectAllUnassigned}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all"
            >
              <CheckSquare size={16} />
              Select All {stats.unclassified} Unassigned
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar - appears when sites selected */}
      {selectedSites.size > 0 && (
        <div className="px-5 py-3 bg-primary-50 border-b border-primary-100 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-primary-700">
            {selectedSites.size} site{selectedSites.size !== 1 ? 's' : ''} selected{selectedSites.size === stats.unclassified && stats.unclassified > 0 ? ' (all unassigned)' : ''}:
          </span>

          {/* Quick assign buttons */}
          <div className="flex items-center gap-1">
            {SUB_REGIONS.map(region => (
              <button
                key={region.value}
                onClick={() => handleBulkAssign(region.value)}
                disabled={isBulkUpdating}
                title={`Assign to ${region.fullLabel}`}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                  ${isBulkUpdating
                    ? 'bg-surface-200 text-surface-400 cursor-wait'
                    : 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-600 hover:text-white hover:border-primary-600'
                  }
                `}
              >
                {region.label}
              </button>
            ))}
            <button
              onClick={() => handleBulkAssign('')}
              disabled={isBulkUpdating}
              title="Clear assignment"
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg transition-all
                ${isBulkUpdating
                  ? 'bg-surface-200 text-surface-400 cursor-wait'
                  : 'bg-white text-red-500 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500'
                }
              `}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setSelectedSites(new Set())}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-100 rounded-lg transition-all"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Table */}
      {filteredSites.length === 0 ? (
        <div className="p-12 text-center">
          <Filter size={32} className="mx-auto mb-4 text-surface-300" />
          <p className="text-surface-500">No sites match your search criteria</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-surface-50 to-surface-100/50">
                <th className="px-4 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    ref={el => {
                      if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-surface-600 uppercase tracking-wider">
                  Site Name
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold text-surface-600 uppercase tracking-wider">
                  Sub-Region
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-surface-600 uppercase tracking-wider w-24">
                  Records
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {paginatedSites.map((site, idx) => (
                <tr
                  key={site.name}
                  className={`hover:bg-primary-50/30 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-surface-50/30'
                  } ${selectedSites.has(site.name) ? 'bg-primary-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSites.has(site.name)}
                      onChange={() => toggleSiteSelection(site.name)}
                      className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        site.subRegion
                          ? 'bg-emerald-100'
                          : 'bg-surface-100'
                      }`}>
                        <MapPin size={18} className={
                          site.subRegion
                            ? 'text-emerald-600'
                            : 'text-surface-400'
                        } />
                      </div>
                      <span className="font-medium text-surface-800">
                        {site.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {/* Quick-click sub-region buttons */}
                      {SUB_REGIONS.map(region => {
                        const isActive = site.subRegion === region.value
                        const isUpdating = updatingSite === site.name
                        return (
                          <button
                            key={region.value}
                            onClick={() => handleSubRegionChange(site.name, isActive ? '' : region.value)}
                            disabled={isUpdating}
                            title={isActive ? `Click to unassign from ${region.fullLabel}` : `Assign to ${region.fullLabel}`}
                            className={`
                              w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                              ${isUpdating ? 'opacity-50 cursor-wait' : ''}
                              ${isActive
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700'
                              }
                            `}
                          >
                            {region.label}
                          </button>
                        )
                      })}
                      {/* Clear button */}
                      <button
                        onClick={() => handleSubRegionChange(site.name, '')}
                        disabled={updatingSite === site.name || !site.subRegion}
                        title="Clear assignment"
                        className={`
                          w-8 h-8 flex items-center justify-center rounded-lg transition-all
                          ${updatingSite === site.name ? 'opacity-50 cursor-wait' : ''}
                          ${site.subRegion
                            ? 'bg-red-100 text-red-500 hover:bg-red-200'
                            : 'bg-surface-50 text-surface-300 cursor-not-allowed'
                          }
                        `}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                      {site.recordCount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination footer */}
      {filteredSites.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-surface-50 to-white border-t border-surface-100 flex items-center justify-between">
          <span className="text-sm text-surface-600">
            Showing{' '}
            <span className="font-semibold text-surface-800">
              {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
            </span>
            -
            <span className="font-semibold text-surface-800">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSites.length)}
            </span>
            {' '}of{' '}
            <span className="font-semibold text-surface-800">
              {filteredSites.length}
            </span>
            {' '}sites
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                  ${currentPage === 1
                    ? 'text-surface-300 cursor-not-allowed'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                  }
                `}
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <span className="px-3 py-1.5 text-sm text-surface-600">
                Page <span className="font-semibold">{currentPage}</span> of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                  ${currentPage === totalPages
                    ? 'text-surface-300 cursor-not-allowed'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                  }
                `}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default SiteClassificationPanel
