import React, { useState, useMemo } from 'react'
import { Search, Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Card } from '../ui'

const SUB_REGIONS = [
  { value: '', label: 'Unassigned' },
  { value: 'SUB REGION 1', label: 'Sub Region 1' },
  { value: 'SUB REGION 2', label: 'Sub Region 2' },
  { value: 'SUB REGION 3', label: 'Sub Region 3' },
  { value: 'SUB REGION 4', label: 'Sub Region 4' },
  { value: 'SUB REGION 5', label: 'Sub Region 5' },
]

const ITEMS_PER_PAGE = 25

const ContractorClassificationPanel = () => {
  const { getEnrichedContractors, updateContractorClassification } = useData()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterMode, setFilterMode] = useState('all') // 'all', 'classified', 'unclassified'
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingContractor, setUpdatingContractor] = useState(null)

  // Get all contractors with their data
  const contractors = useMemo(() => {
    return getEnrichedContractors()
  }, [getEnrichedContractors])

  // Filter and search contractors
  const filteredContractors = useMemo(() => {
    let result = [...contractors]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(search))
    }

    // Classification filter
    if (filterMode === 'classified') {
      result = result.filter(c => c.subRegion)
    } else if (filterMode === 'unclassified') {
      result = result.filter(c => !c.subRegion)
    }

    // Sort alphabetically by name
    result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [contractors, searchTerm, filterMode])

  // Pagination
  const totalPages = Math.ceil(filteredContractors.length / ITEMS_PER_PAGE)
  const paginatedContractors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredContractors.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredContractors, currentPage])

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, filterMode])

  // Handle sub-region change
  const handleSubRegionChange = async (contractorName, newSubRegion) => {
    setUpdatingContractor(contractorName)
    try {
      await updateContractorClassification(contractorName, newSubRegion)
    } catch (error) {
      console.error('Error updating contractor classification:', error)
    } finally {
      setUpdatingContractor(null)
    }
  }

  // Summary stats
  const stats = useMemo(() => {
    const classified = contractors.filter(c => c.subRegion).length
    return {
      total: contractors.length,
      classified,
      unclassified: contractors.length - classified
    }
  }, [contractors])

  if (contractors.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <div className="p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 rounded-2xl flex items-center justify-center">
            <Users size={36} className="text-surface-400" />
          </div>
          <h3 className="text-xl font-semibold text-surface-800 mb-2">
            No Contractors Found
          </h3>
          <p className="text-surface-500 max-w-sm mx-auto">
            Import data files to see contractors that can be classified.
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
              placeholder="Search contractors..."
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
        </div>
      </div>

      {/* Table */}
      {filteredContractors.length === 0 ? (
        <div className="p-12 text-center">
          <Filter size={32} className="mx-auto mb-4 text-surface-300" />
          <p className="text-surface-500">No contractors match your search criteria</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-surface-50 to-surface-100/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-surface-600 uppercase tracking-wider">
                  Contractor Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-surface-600 uppercase tracking-wider w-56">
                  Sub-Region
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-surface-600 uppercase tracking-wider w-32">
                  Records
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {paginatedContractors.map((contractor, idx) => (
                <tr
                  key={contractor.name}
                  className={`hover:bg-primary-50/30 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-surface-50/30'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        contractor.subRegion
                          ? 'bg-emerald-100'
                          : 'bg-surface-100'
                      }`}>
                        <Users size={18} className={
                          contractor.subRegion
                            ? 'text-emerald-600'
                            : 'text-surface-400'
                        } />
                      </div>
                      <span className="font-medium text-surface-800">
                        {contractor.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={contractor.subRegion}
                      onChange={(e) => handleSubRegionChange(contractor.name, e.target.value)}
                      disabled={updatingContractor === contractor.name}
                      className={`w-full px-3 py-2 border rounded-lg text-sm font-medium transition-all
                        ${contractor.subRegion
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-surface-200 bg-white text-surface-600'
                        }
                        ${updatingContractor === contractor.name
                          ? 'opacity-50 cursor-wait'
                          : 'hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'
                        }
                      `}
                    >
                      {SUB_REGIONS.map(region => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                      {contractor.recordCount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination footer */}
      {filteredContractors.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-surface-50 to-white border-t border-surface-100 flex items-center justify-between">
          <span className="text-sm text-surface-600">
            Showing{' '}
            <span className="font-semibold text-surface-800">
              {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
            </span>
            -
            <span className="font-semibold text-surface-800">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredContractors.length)}
            </span>
            {' '}of{' '}
            <span className="font-semibold text-surface-800">
              {filteredContractors.length}
            </span>
            {' '}contractors
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

export default ContractorClassificationPanel
