import React, { useState, useMemo, useCallback } from 'react'
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Eye, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { IconButton } from '../ui'

/**
 * DataTable - Accessible, sortable, searchable data table
 */
const DataTable = ({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  onRowClick,
  onViewClick,
  emptyMessage = 'No data available',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((row) =>
      columns.some((column) => {
        const value = column.accessor(row)
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key)
      if (!column) return 0

      const aValue = column.accessor(a)
      const bValue = column.accessor(b)

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredData, sortConfig, columns])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  // Add view column if onViewClick is provided
  const displayColumns = useMemo(() => {
    if (!onViewClick) return columns
    return [
      ...columns,
      {
        key: '_view',
        header: '',
        width: '50px',
        sortable: false,
        accessor: () => null,
        render: (row) => (
          <IconButton
            icon={Eye}
            size="small"
            variant="ghost"
            label="View details"
            onClick={(e) => {
              e.stopPropagation()
              onViewClick(row)
            }}
          />
        ),
      },
    ]
  }, [columns, onViewClick])

  return (
    <div className={`bg-white rounded-lg border border-surface-200 overflow-hidden shadow-soft ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="p-3 border-b border-surface-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400"
              size={16}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200"
              aria-label="Search table"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>
              {displayColumns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-3 py-2.5 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider
                    ${column.sortable !== false ? 'cursor-pointer hover:bg-surface-100 transition-colors' : ''}
                  `}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ width: column.width }}
                  scope="col"
                  aria-sort={
                    sortConfig.key === column.key
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className="flex items-center gap-1.5">
                    <span>{column.header}</span>
                    {column.sortable !== false && sortConfig.key === column.key && (
                      <span className="text-primary-500">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={displayColumns.length}
                  className="px-3 py-8 text-center text-sm text-surface-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`
                    hover:bg-surface-50 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => onRowClick && onRowClick(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                >
                  {displayColumns.map((column) => (
                    <td key={column.key} className="px-3 py-2 text-sm text-surface-700">
                      {column.render ? column.render(row) : column.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 py-2.5 border-t border-surface-200 flex items-center justify-between bg-surface-50">
          <p className="text-xs text-surface-500">
            Showing{' '}
            <span className="font-medium text-surface-700">
              {(currentPage - 1) * pageSize + 1}
            </span>
            {' '}-{' '}
            <span className="font-medium text-surface-700">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>
            {' '}of{' '}
            <span className="font-medium text-surface-700">{sortedData.length}</span>
          </p>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`
                      min-w-[28px] h-7 px-2 rounded-md text-xs font-medium
                      transition-all duration-200
                      ${currentPage === pageNum
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'hover:bg-surface-200 text-surface-600'
                      }
                    `}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default DataTable
