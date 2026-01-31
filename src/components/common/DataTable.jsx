import React, { useState, useMemo, useCallback, useRef } from 'react'
import { List } from 'react-window'
import { AutoSizer } from 'react-virtualized-auto-sizer'
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Eye, ChevronsLeft, ChevronsRight, Building2, MapPin, Calendar } from 'lucide-react'
import { IconButton } from '../ui'
import useIsMobile, { MOBILE_BREAKPOINT } from '../../hooks/useIsMobile'
import { getStatusColor, getTypeColor } from '../../utils/statusColors'

/**
 * DataTable - Virtualized, accessible, sortable, searchable data table
 *
 * Performance optimizations:
 * - Virtual scrolling with react-window (only renders ~30 visible rows)
 * - Handles 60,000+ records smoothly
 * - Mobile-optimized: Card view on small screens
 */

// Row height for virtual scrolling
const ROW_HEIGHT = 48

// Threshold for enabling virtual scrolling
const VIRTUALIZATION_THRESHOLD = 100

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
  mobileCardConfig = null,
  enableVirtualization = true, // New prop to control virtualization
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const isMobile = useIsMobile(MOBILE_BREAKPOINT)
  const tableRef = useRef(null)

  // Determine if we should virtualize based on data size
  const shouldVirtualize = enableVirtualization && data.length > VIRTUALIZATION_THRESHOLD

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

  // For non-virtualized mode, paginate data
  const paginatedData = useMemo(() => {
    if (shouldVirtualize) return sortedData // No pagination needed for virtual scrolling
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, shouldVirtualize])

  const totalPages = shouldVirtualize ? 1 : Math.ceil(sortedData.length / pageSize)

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

  // Virtual row renderer
  const VirtualRow = useCallback(({ index, style }) => {
    const row = sortedData[index]
    if (!row) return null

    return (
      <div
        style={style}
        className={`
          flex items-center border-b border-surface-100 hover:bg-surface-50 transition-colors
          ${onRowClick ? 'cursor-pointer' : ''}
        `}
        onClick={() => onRowClick && onRowClick(row)}
        role="row"
      >
        {displayColumns.map((column) => (
          <div
            key={column.key}
            className="px-3 py-2 text-sm text-surface-700 truncate"
            style={{
              width: column.width || 'auto',
              flex: column.width ? 'none' : 1,
              minWidth: column.minWidth || 80
            }}
            role="cell"
          >
            {column.render ? column.render(row) : column.accessor(row)}
          </div>
        ))}
      </div>
    )
  }, [sortedData, displayColumns, onRowClick])

  // Mobile Card View
  const MobileCardView = () => (
    <div className="p-3 space-y-3">
      {paginatedData.length === 0 ? (
        <div className="py-8 text-center text-sm text-surface-500">
          {emptyMessage}
        </div>
      ) : (
        paginatedData.map((row, index) => (
          <MobileCard
            key={row.id || row.externalId || index}
            row={row}
            columns={columns}
            onView={onViewClick}
            onClick={onRowClick}
            config={mobileCardConfig}
          />
        ))
      )}
    </div>
  )

  // Mobile Pagination
  const MobilePagination = () => (
    <div className="px-3 py-3 border-t border-surface-200 flex items-center justify-between bg-surface-50">
      <p className="text-xs text-surface-500">
        {shouldVirtualize ?
          `${sortedData.length.toLocaleString()} records` :
          `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedData.length)} of ${sortedData.length}`
        }
      </p>
      {!shouldVirtualize && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-100 hover:bg-surface-200 active:bg-surface-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-surface-700 min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-100 hover:bg-surface-200 active:bg-surface-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className={`bg-white rounded-lg border border-surface-200 overflow-hidden shadow-soft ${className}`}>
      {/* Search - Larger on mobile */}
      {searchable && (
        <div className={`border-b border-surface-200 ${isMobile ? 'p-3' : 'p-3'}`}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400"
              size={isMobile ? 18 : 16}
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
              className={`
                w-full pr-4 bg-surface-50 border border-surface-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                transition-all duration-200
                ${isMobile ? 'pl-10 py-3 text-base' : 'pl-9 py-2 text-sm'}
              `}
              aria-label="Search table"
            />
          </div>
          {/* Show record count when virtualized */}
          {shouldVirtualize && (
            <p className="text-xs text-surface-500 mt-2">
              {sortedData.length.toLocaleString()} records {searchTerm && `matching "${searchTerm}"`}
            </p>
          )}
        </div>
      )}

      {/* Mobile Card View - Hidden on sm+ screens */}
      <div className="sm:hidden" data-mobile-view>
        <MobileCardView />
      </div>

      {/* Desktop Table View - Hidden on mobile, shown on sm+ screens */}
      <div className="hidden sm:block" data-desktop-view ref={tableRef}>
        {/* Table Header */}
        <div className="bg-surface-50 border-b border-surface-200 overflow-x-auto">
          <div className="flex min-w-max" role="row">
            {displayColumns.map((column) => (
              <div
                key={column.key}
                className={`
                  px-3 py-2.5 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider
                  ${column.sortable !== false ? 'cursor-pointer hover:bg-surface-100 transition-colors' : ''}
                `}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                style={{
                  width: column.width || 'auto',
                  flex: column.width ? 'none' : 1,
                  minWidth: column.minWidth || 80
                }}
                role="columnheader"
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
              </div>
            ))}
          </div>
        </div>

        {/* Table Body - Virtual or Standard */}
        {sortedData.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-surface-500">
            {emptyMessage}
          </div>
        ) : shouldVirtualize ? (
          /* Virtualized Body */
          <div style={{ height: Math.min(sortedData.length * ROW_HEIGHT, 600) }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={sortedData.length}
                  itemSize={ROW_HEIGHT}
                  overscanCount={10}
                >
                  {VirtualRow}
                </List>
              )}
            </AutoSizer>
          </div>
        ) : (
          /* Standard Body */
          <div className="divide-y divide-surface-100">
            {paginatedData.map((row, index) => (
              <div
                key={row.id || index}
                className={`
                  flex items-center hover:bg-surface-50 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRowClick && onRowClick(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                role="row"
              >
                {displayColumns.map((column) => (
                  <div
                    key={column.key}
                    className="px-3 py-2 text-sm text-surface-700"
                    style={{
                      width: column.width || 'auto',
                      flex: column.width ? 'none' : 1,
                      minWidth: column.minWidth || 80
                    }}
                    role="cell"
                  >
                    {column.render ? column.render(row) : column.accessor(row)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination - Only for non-virtualized mode */}
      {!shouldVirtualize && totalPages > 1 && (
        <>
          {/* Mobile Pagination */}
          <div className="sm:hidden" data-mobile-view>
            <MobilePagination />
          </div>

          {/* Desktop Pagination */}
          <div className="hidden sm:block" data-desktop-view>
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
          </div>
        </>
      )}

      {/* Virtual scroll info */}
      {shouldVirtualize && sortedData.length > 0 && (
        <div className="hidden sm:block px-3 py-2.5 border-t border-surface-200 bg-surface-50">
          <p className="text-xs text-surface-500">
            Showing{' '}
            <span className="font-medium text-surface-700">
              {sortedData.length.toLocaleString()}
            </span>
            {' '}records (scroll to view all)
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * MobileCard - Card layout for table rows on mobile
 */
const MobileCard = ({ row, columns, onView, onClick, config }) => {
  const date = row.date || ''
  const description = row.description || 'No description'
  const contractor = row.contractor || ''
  const site = row.site || ''
  const type = row.type || 'observation'
  const status = row.actionStatus || 'open'

  // Status and type colors imported from shared utility

  return (
    <div
      className={`
        p-3 rounded-lg bg-surface-50 border border-surface-200
        hover:bg-white hover:border-surface-300 active:bg-surface-100
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onClick?.(row)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header: Date + Type + Status */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-sm font-medium text-surface-900 flex items-center gap-1">
          <Calendar size={14} className="text-surface-400" />
          {date}
        </span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(type)}`}>
          {type}
        </span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-surface-600 line-clamp-2 mb-2 leading-relaxed">
        {description}
      </p>

      {/* Meta: Contractor + Site */}
      <div className="flex items-center gap-3 text-xs text-surface-500 flex-wrap mb-3">
        {contractor && (
          <span className="flex items-center gap-1">
            <Building2 size={12} />
            <span className="truncate max-w-[100px]">{contractor}</span>
          </span>
        )}
        {site && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{site}</span>
          </span>
        )}
      </div>

      {/* View Button - Full width, 44px height */}
      {onView && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onView(row)
          }}
          className="w-full h-11 flex items-center justify-center gap-2 bg-primary-50 text-primary-600 hover:bg-primary-100 active:bg-primary-200 rounded-lg font-medium text-sm transition-colors"
        >
          <Eye size={18} />
          View Details
        </button>
      )}
    </div>
  )
}

export default React.memo(DataTable)
