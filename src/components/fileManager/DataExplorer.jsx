import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
  startTransition,
} from 'react'
import { format } from 'date-fns'
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
  Columns3,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  User,
  MapPin,
  Building2,
  Calendar,
  Tag,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
} from 'lucide-react'
import { List as VirtualList } from 'react-window'
import { useDebouncedValue } from '../../hooks/useDebouncedFilter'
import { getStatusColor, getTypeColor } from '../../utils/statusColors'
import { INCIDENT_TYPES } from '../../utils/constants'

// ─── Column Definitions ─────────────────────────────────────────────
const COLUMNS = [
  { id: 'externalId', label: 'Event ID', width: 120, visible: true, sortable: true, filterable: false },
  { id: 'date', label: 'Date', width: 110, visible: true, sortable: true, filterable: true },
  { id: 'eventTime', label: 'Time', width: 80, visible: false, sortable: true, filterable: false },
  { id: 'type', label: 'Type', width: 140, visible: true, sortable: true, filterable: true },
  { id: 'location', label: 'Hazard Category', width: 180, visible: true, sortable: true, filterable: true },
  { id: 'description', label: 'Description', width: 320, visible: true, sortable: false, filterable: false },
  { id: 'contractor', label: 'Contractor', width: 160, visible: true, sortable: true, filterable: true },
  { id: 'site', label: 'Site', width: 140, visible: true, sortable: true, filterable: true },
  { id: 'company', label: 'Company', width: 140, visible: false, sortable: true, filterable: true },
  { id: 'reportedBy', label: 'Reported By', width: 140, visible: false, sortable: true, filterable: true },
  { id: 'actionStatus', label: 'Action Status', width: 120, visible: true, sortable: true, filterable: true },
  { id: 'approvalStatus', label: 'Approval', width: 120, visible: false, sortable: true, filterable: true },
  { id: 'actionDueDate', label: 'Due Date', width: 110, visible: false, sortable: true, filterable: false },
  { id: 'consequence', label: 'Consequence', width: 140, visible: false, sortable: true, filterable: true },
  { id: 'originalType', label: 'Original Type', width: 140, visible: false, sortable: true, filterable: true },
  { id: 'hazardCategorySource', label: 'Classification Source', width: 140, visible: false, sortable: true, filterable: true },
  { id: 'confidence', label: 'Confidence', width: 100, visible: false, sortable: true, filterable: false },
  { id: 'needsReview', label: 'Needs Review', width: 110, visible: false, sortable: true, filterable: true },
  { id: 'dataQualityIssue', label: 'Quality Issue', width: 200, visible: false, sortable: false, filterable: true },
  { id: 'sourceFile', label: 'Source File', width: 140, visible: false, sortable: true, filterable: true },
]

const DEFAULT_VISIBLE = new Set(COLUMNS.filter(c => c.visible).map(c => c.id))

// ─── Preset Filter Definitions ──────────────────────────────────────
const PRESETS = [
  {
    id: 'incomplete',
    label: 'Incomplete Records',
    icon: AlertTriangle,
    color: 'amber',
    predicate: (r) =>
      !r.contractor || !r.site || !r.description || !r.reportedBy,
  },
  {
    id: 'autoClassified',
    label: 'Auto-Classified',
    icon: Tag,
    color: 'purple',
    predicate: (r) => r.hazardCategorySource === 'auto-classified',
  },
  {
    id: 'needsReview',
    label: 'Needs Review',
    icon: Eye,
    color: 'rose',
    predicate: (r) => r.contextAnalysis?.needsReview === true && !r._reviewedAt,
  },
  {
    id: 'reviewed',
    label: 'Reviewed',
    icon: CheckCircle2,
    color: 'green',
    predicate: (r) => !!r._reviewedAt,
  },
  {
    id: 'openActions',
    label: 'Open Actions',
    icon: Clock,
    color: 'blue',
    predicate: (r) =>
      r.actionStatus === 'open' || r.actionStatus === 'in-progress',
  },
  {
    id: 'qualityIssues',
    label: 'Quality Issues',
    icon: Shield,
    color: 'red',
    predicate: (r) => !!r.dataQualityIssue,
  },
]

const PRESET_COLORS = {
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
  rose: 'bg-rose-100 text-rose-700 border-rose-300',
  green: 'bg-green-100 text-green-700 border-green-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  red: 'bg-red-100 text-red-700 border-red-300',
}
const PRESET_COLORS_ACTIVE = {
  amber: 'bg-amber-500 text-white border-amber-600',
  purple: 'bg-purple-500 text-white border-purple-600',
  rose: 'bg-rose-500 text-white border-rose-600',
  green: 'bg-green-500 text-white border-green-600',
  blue: 'bg-blue-500 text-white border-blue-600',
  red: 'bg-red-500 text-white border-red-600',
}

// ─── Completeness Fields ────────────────────────────────────────────
const COMPLETENESS_FIELDS = [
  { key: 'contractor', label: 'Contractor' },
  { key: 'site', label: 'Site' },
  { key: 'description', label: 'Description' },
  { key: 'reportedBy', label: 'Reported By' },
  { key: 'company', label: 'Company' },
  { key: 'consequence', label: 'Consequence' },
]

// Type label lookup
const TYPE_LABEL_MAP = new Map(INCIDENT_TYPES.map(t => [t.value, t.label]))

// ─── Helper: Get cell display value ─────────────────────────────────
const getCellValue = (record, colId) => {
  switch (colId) {
    case 'externalId':
      return record.externalId || '—'
    case 'date':
      return record.date
        ? format(new Date(record.date), 'dd MMM yyyy')
        : '—'
    case 'eventTime':
      return record.eventTime || '—'
    case 'type':
      return TYPE_LABEL_MAP.get(record.type) || record.type || '—'
    case 'location':
      return record.location || '—'
    case 'description':
      return record.description || '—'
    case 'contractor':
      return record.contractor || '—'
    case 'site':
      return record.site || '—'
    case 'company':
      return record.company || '—'
    case 'reportedBy':
      return record.reportedBy || '—'
    case 'actionStatus':
      return record.actionStatus || '—'
    case 'approvalStatus':
      return record.approvalStatus || '—'
    case 'actionDueDate':
      return record.actionDueDate
        ? format(new Date(record.actionDueDate), 'dd MMM yyyy')
        : '—'
    case 'consequence':
      return record.consequence || '—'
    case 'originalType':
      return record.originalType || '—'
    case 'hazardCategorySource':
      return record.hazardCategorySource || '—'
    case 'confidence':
      return record.contextAnalysis?.confidence != null
        ? `${Math.round(record.contextAnalysis.confidence * 100)}%`
        : '—'
    case 'needsReview':
      return record.contextAnalysis?.needsReview ? 'Yes' : 'No'
    case 'dataQualityIssue':
      return record.dataQualityIssue || '—'
    case 'sourceFile':
      return record._sourceFileName || '—'
    default:
      return '—'
  }
}

// ─── Helper: Get raw sortable value ─────────────────────────────────
const getSortValue = (record, colId) => {
  switch (colId) {
    case 'date':
    case 'actionDueDate':
      return record[colId] || ''
    case 'confidence':
      return record.contextAnalysis?.confidence ?? -1
    case 'needsReview':
      return record.contextAnalysis?.needsReview ? 1 : 0
    case 'sourceFile':
      return record._sourceFileName || ''
    default:
      return record[colId] ?? ''
  }
}

// ─── Helper: Get raw filterable value ───────────────────────────────
const getFilterValue = (record, colId) => {
  switch (colId) {
    case 'type':
      return TYPE_LABEL_MAP.get(record.type) || record.type || ''
    case 'needsReview':
      return record.contextAnalysis?.needsReview ? 'Yes' : 'No'
    case 'dataQualityIssue':
      return record.dataQualityIssue ? 'Has Issue' : ''
    case 'sourceFile':
      return record._sourceFileName || ''
    default:
      return record[colId] ?? ''
  }
}

// ─── CompletenessBar ────────────────────────────────────────────────
const CompletenessBar = ({ incidents, onFieldClick }) => {
  const stats = useMemo(() => {
    const total = incidents.length
    if (total === 0) return { pct: 100, fields: [] }

    let filledSum = 0
    const fieldCounts = COMPLETENESS_FIELDS.map(f => {
      let missing = 0
      for (const inc of incidents) {
        if (!inc[f.key]) missing++
        else filledSum++
      }
      return { ...f, missing, total }
    })
    const totalCells = total * COMPLETENESS_FIELDS.length
    const pct = totalCells > 0 ? Math.round((filledSum / totalCells) * 100) : 100
    return { pct, fields: fieldCounts }
  }, [incidents])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 min-w-[180px]">
        <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-surface-600 whitespace-nowrap">
          {stats.pct}% complete
        </span>
      </div>
      {stats.fields
        .filter(f => f.missing > 0)
        .map(f => (
          <button
            key={f.key}
            onClick={() => onFieldClick(f.key)}
            className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
          >
            {f.label}: <span className="font-semibold">{f.missing.toLocaleString()}</span> missing
          </button>
        ))}
    </div>
  )
}

// ─── PresetFilters ──────────────────────────────────────────────────
const PresetFilters = ({ activePresets, onToggle, counts }) => (
  <div className="flex flex-wrap gap-2">
    {PRESETS.map(preset => {
      const Icon = preset.icon
      const active = activePresets.has(preset.id)
      const count = counts[preset.id] || 0
      return (
        <button
          key={preset.id}
          onClick={() => onToggle(preset.id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all
            ${active ? PRESET_COLORS_ACTIVE[preset.color] : PRESET_COLORS[preset.color]}
          `}
        >
          <Icon size={13} />
          {preset.label}
          <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-black/5'}`}>
            {count.toLocaleString()}
          </span>
        </button>
      )
    })}
  </div>
)

// ─── ColumnFilterDropdown ───────────────────────────────────────────
const ColumnFilterDropdown = ({ column, allValues, selectedValues, onChange, onClose }) => {
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const filtered = useMemo(() => {
    if (!search) return allValues
    const s = search.toLowerCase()
    return allValues.filter(v =>
      (v === '' ? '(blanks)' : String(v).toLowerCase()).includes(s)
    )
  }, [allValues, search])

  const allSelected = selectedValues === null
  const toggleAll = () => {
    onChange(column.id, allSelected ? new Set() : null)
  }
  const toggleValue = (val) => {
    const current = selectedValues || new Set(allValues)
    const next = new Set(current)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    // If all re-selected, clear filter
    if (next.size === allValues.length) {
      onChange(column.id, null)
    } else {
      onChange(column.id, next)
    }
  }

  const isChecked = (val) => selectedValues === null || selectedValues.has(val)

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-56 bg-white border border-surface-200 rounded-xl shadow-xl z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 border-b border-surface-100">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search observations"
          className="w-full px-2.5 py-1.5 text-xs border border-surface-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
          autoFocus
        />
      </div>
      <div className="px-2 py-1.5 border-b border-surface-100 flex gap-2">
        <button
          onClick={toggleAll}
          className="text-[10px] font-medium text-primary-600 hover:text-primary-800"
        >
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>
      <div className="max-h-52 overflow-y-auto p-1">
        {filtered.map((val, i) => (
          <label
            key={i}
            className="flex items-center gap-2 px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={isChecked(val)}
              onChange={() => toggleValue(val)}
              className="rounded border-surface-300 text-primary-500 focus:ring-primary-400"
            />
            <span className="truncate">
              {val === '' ? <span className="italic text-surface-400">(Blanks)</span> : String(val)}
            </span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-surface-400 px-2 py-3 text-center">No matches</p>
        )}
      </div>
    </div>
  )
}

// ─── ColumnVisibilityPicker ─────────────────────────────────────────
const ColumnVisibilityPicker = ({ visibleCols, onToggle, onClose }) => {
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-56 bg-white border border-surface-200 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-surface-100 text-xs font-semibold text-surface-600 uppercase tracking-wide">
        Show / Hide Columns
      </div>
      <div className="max-h-72 overflow-y-auto p-1">
        {COLUMNS.map(col => (
          <label
            key={col.id}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-surface-700 hover:bg-surface-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={visibleCols.has(col.id)}
              onChange={() => onToggle(col.id)}
              className="rounded border-surface-300 text-primary-500 focus:ring-primary-400"
            />
            {col.label}
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── HeaderCell ─────────────────────────────────────────────────────
const HeaderCell = ({ column, sortConfig, onSort, hasFilter, onFilterClick }) => (
  <div
    className={`
      flex items-center gap-1 px-3 py-2.5 text-[11px] font-bold text-surface-600 uppercase tracking-wider
      ${column.sortable ? 'cursor-pointer hover:text-surface-800 select-none' : ''}
    `}
    style={{ width: column.width, minWidth: column.width, flexShrink: 0 }}
    onClick={() => column.sortable && onSort(column.id)}
  >
    <span className="truncate">{column.label}</span>
    {column.sortable && sortConfig.key === column.id && (
      sortConfig.direction === 'asc'
        ? <ChevronUp size={12} className="flex-shrink-0" />
        : <ChevronDown size={12} className="flex-shrink-0" />
    )}
    {column.filterable && (
      <button
        onClick={(e) => { e.stopPropagation(); onFilterClick(column.id) }}
        className={`
          ml-auto p-0.5 rounded transition-colors flex-shrink-0
          ${hasFilter ? 'text-primary-500' : 'text-surface-300 hover:text-surface-500'}
        `}
      >
        <Filter size={11} />
      </button>
    )}
  </div>
)

// ─── Cell Renderer ──────────────────────────────────────────────────
const CellContent = ({ record, colId, width }) => {
  const value = getCellValue(record, colId)

  if (colId === 'type') {
    return (
      <div style={{ width, minWidth: width }} className="px-3 py-1.5 flex-shrink-0">
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getTypeColor(record.type)}`}>
          {value}
        </span>
      </div>
    )
  }

  if (colId === 'actionStatus') {
    return (
      <div style={{ width, minWidth: width }} className="px-3 py-1.5 flex-shrink-0">
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusColor(record.actionStatus)}`}>
          {value}
        </span>
      </div>
    )
  }

  if (colId === 'needsReview' && record.contextAnalysis?.needsReview) {
    return (
      <div style={{ width, minWidth: width }} className="px-3 py-1.5 flex-shrink-0">
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700">
          Yes
        </span>
      </div>
    )
  }

  if (colId === 'description') {
    return (
      <div
        style={{ width, minWidth: width }}
        className="px-3 py-1.5 flex-shrink-0 truncate text-xs text-surface-600"
        title={value}
      >
        {value}
      </div>
    )
  }

  return (
    <div
      style={{ width, minWidth: width }}
      className="px-3 py-1.5 flex-shrink-0 truncate text-xs text-surface-700"
      title={typeof value === 'string' ? value : undefined}
    >
      {value}
    </div>
  )
}

// ─── VirtualRow (react-window v2 API) ───────────────────────────────
// v2 rowComponent receives: { index, style, ariaAttributes, ...rowProps }
const VirtualRow = memo(({ index, style, rows, visibleColumns, onRowClick, selectedId }) => {
  const record = rows[index]
  if (!record) return null

  const isSelected = record.id === selectedId

  return (
    <div
      style={style}
      className={`
        flex items-center border-b border-surface-100 cursor-pointer transition-colors
        ${isSelected ? 'bg-primary-50' : index % 2 === 0 ? 'bg-white' : 'bg-surface-50/40'}
        hover:bg-primary-50/60
      `}
      onClick={() => onRowClick(record)}
    >
      {visibleColumns.map(col => (
        <CellContent key={col.id} record={record} colId={col.id} width={col.width} />
      ))}
    </div>
  )
})
VirtualRow.displayName = 'VirtualRow'

// ─── MobileCard (memoized) ──────────────────────────────────────────
const MobileCard = memo(({ record, onClick }) => (
  <div
    className="p-3 bg-white border border-surface-200 rounded-lg mb-2 cursor-pointer hover:border-primary-300 transition-colors"
    onClick={() => onClick(record)}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-mono text-surface-500">#{record.externalId || '—'}</span>
      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getTypeColor(record.type)}`}>
        {TYPE_LABEL_MAP.get(record.type) || record.type}
      </span>
    </div>
    <p className="text-sm text-surface-800 line-clamp-2 mb-2">
      {record.description || 'No description'}
    </p>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500">
      {record.date && <span>{format(new Date(record.date), 'dd MMM yyyy')}</span>}
      {record.contractor && <span>{record.contractor}</span>}
      {record.site && <span>{record.site}</span>}
      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${getStatusColor(record.actionStatus)}`}>
        {record.actionStatus}
      </span>
    </div>
  </div>
))
MobileCard.displayName = 'MobileCard'

// ─── DetailPanel ────────────────────────────────────────────────────
const DetailPanel = ({ record, onClose }) => {
  if (!record) return null

  const fields = [
    { icon: Tag, label: 'Event ID', value: record.externalId },
    { icon: Calendar, label: 'Date', value: record.date ? format(new Date(record.date), 'dd MMM yyyy') : null },
    { icon: Clock, label: 'Time', value: record.eventTime },
    { icon: FileText, label: 'Type', value: TYPE_LABEL_MAP.get(record.type) || record.type, badge: true, badgeClass: getTypeColor(record.type) },
    { icon: Shield, label: 'Hazard Category', value: record.location },
    { icon: Building2, label: 'Contractor', value: record.contractor },
    { icon: MapPin, label: 'Site', value: record.site },
    { icon: Building2, label: 'Company', value: record.company },
    { icon: User, label: 'Reported By', value: record.reportedBy },
    { icon: CheckCircle2, label: 'Action Status', value: record.actionStatus, badge: true, badgeClass: getStatusColor(record.actionStatus) },
    { icon: Tag, label: 'Approval', value: record.approvalStatus },
    { icon: Calendar, label: 'Due Date', value: record.actionDueDate ? format(new Date(record.actionDueDate), 'dd MMM yyyy') : null },
    { icon: AlertTriangle, label: 'Consequence', value: record.consequence },
    { icon: Tag, label: 'Original Type', value: record.originalType },
    { icon: Tag, label: 'Classification Source', value: record.hazardCategorySource },
    { icon: Tag, label: 'Confidence', value: record.contextAnalysis?.confidence != null ? `${Math.round(record.contextAnalysis.confidence * 100)}%` : null },
    { icon: FileSpreadsheet, label: 'Source File', value: record._sourceFileName },
  ]

  return (
    <div className="bg-white border-l border-surface-200 overflow-y-auto h-full">
      <div className="sticky top-0 bg-white border-b border-surface-100 px-4 py-3 flex items-center justify-between z-10">
        <h3 className="text-sm font-bold text-surface-800">Record Details</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Description block */}
        {record.description && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-surface-700 leading-relaxed bg-surface-50 p-3 rounded-lg">
              {record.description}
            </p>
          </div>
        )}

        {/* Fields */}
        {fields.map(({ icon: Icon, label, value, badge, badgeClass }) => {
          if (!value) return null
          return (
            <div key={label} className="flex items-start gap-3">
              <Icon size={14} className="text-surface-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{label}</p>
                {badge ? (
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
                    {value}
                  </span>
                ) : (
                  <p className="text-sm text-surface-800 break-words">{value}</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Quality issue */}
        {record.dataQualityIssue && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Quality Issue</p>
            <p className="text-xs text-amber-800">{record.dataQualityIssue}</p>
          </div>
        )}

        {/* Needs Review */}
        {record.contextAnalysis?.needsReview && !record._reviewedAt && (
          <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mb-1">Needs Review</p>
            <p className="text-xs text-rose-800">
              {record.contextAnalysis.reasoning || 'This record has been flagged for manual review.'}
            </p>
          </div>
        )}

        {/* Reviewed Status */}
        {record._reviewedAt && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-1.5">
              <CircleCheck size={14} className="text-green-600" />
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Reviewed</p>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Reviewed on {new Date(record._reviewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main DataExplorer Component ────────────────────────────────────
const DataExplorer = ({ incidents, files }) => {
  // State
  const [searchText, setSearchText] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE)
  const [activePresets, setActivePresets] = useState(new Set())
  const [columnFilters, setColumnFilters] = useState(new Map()) // Map<colId, Set<allowed>>
  const [openFilter, setOpenFilter] = useState(null)
  const [showColPicker, setShowColPicker] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const scrollRef = useRef(null)

  // Debounced search
  const { debounced: debouncedSearch } = useDebouncedValue(searchText, 200)

  // File name lookup map
  const fileNameMap = useMemo(() => {
    const map = new Map()
    for (const f of files) {
      map.set(f.id, f.fileName)
    }
    return map
  }, [files])

  // Enrich incidents with source file name
  const enriched = useMemo(() => {
    return incidents.map(inc => ({
      ...inc,
      _sourceFileName: fileNameMap.get(inc.fileId) || '—',
    }))
  }, [incidents, fileNameMap])

  // Search index (id -> concatenated lowercase text)
  const searchIndex = useMemo(() => {
    const idx = new Map()
    for (const r of enriched) {
      const parts = [
        r.externalId, r.description, r.contractor, r.site,
        r.company, r.reportedBy, r.location, r.type,
        r.originalType, r.approvalStatus, r.consequence,
        r._sourceFileName,
      ]
      idx.set(r.id, parts.filter(Boolean).join(' ').toLowerCase())
    }
    return idx
  }, [enriched])

  // Unique values per filterable column
  const uniqueValues = useMemo(() => {
    const map = new Map()
    const filterableCols = COLUMNS.filter(c => c.filterable)
    for (const col of filterableCols) {
      const vals = new Set()
      for (const r of enriched) {
        const v = getFilterValue(r, col.id)
        vals.add(v === null || v === undefined ? '' : String(v))
      }
      const sorted = [...vals].sort((a, b) => {
        if (a === '') return 1
        if (b === '') return -1
        return a.localeCompare(b)
      })
      map.set(col.id, sorted)
    }
    return map
  }, [enriched])

  // Preset counts (computed on full data)
  const presetCounts = useMemo(() => {
    const counts = {}
    for (const p of PRESETS) {
      let c = 0
      for (const r of enriched) {
        if (p.predicate(r)) c++
      }
      counts[p.id] = c
    }
    return counts
  }, [enriched])

  // ─── Three-Layer Filter Pipeline ────────────────────────────────
  const filteredData = useMemo(() => {
    let data = enriched

    // Layer 1: Preset filters (AND-combined)
    if (activePresets.size > 0) {
      const activePredicates = PRESETS.filter(p => activePresets.has(p.id)).map(p => p.predicate)
      data = data.filter(r => activePredicates.every(pred => pred(r)))
    }

    // Layer 2: Column filters
    if (columnFilters.size > 0) {
      data = data.filter(r => {
        for (const [colId, allowed] of columnFilters) {
          if (allowed === null) continue // no filter
          const val = String(getFilterValue(r, colId) ?? '')
          if (!allowed.has(val)) return false
        }
        return true
      })
    }

    // Layer 3: Global text search
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase()
      data = data.filter(r => {
        const text = searchIndex.get(r.id)
        return text && text.includes(term)
      })
    }

    return data
  }, [enriched, activePresets, columnFilters, debouncedSearch, searchIndex])

  // ─── Sort ───────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    const { key, direction } = sortConfig
    sorted.sort((a, b) => {
      const aVal = getSortValue(a, key)
      const bVal = getSortValue(b, key)
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredData, sortConfig])

  // Visible columns array
  const visibleColumns = useMemo(
    () => COLUMNS.filter(c => visibleCols.has(c.id)),
    [visibleCols]
  )

  const totalWidth = useMemo(
    () => visibleColumns.reduce((sum, c) => sum + c.width, 0),
    [visibleColumns]
  )

  // ─── Callbacks ──────────────────────────────────────────────────
  const handleSort = useCallback((colId) => {
    startTransition(() => {
      setSortConfig(prev => ({
        key: colId,
        direction: prev.key === colId && prev.direction === 'asc' ? 'desc' : 'asc',
      }))
    })
  }, [])

  const handlePresetToggle = useCallback((presetId) => {
    setActivePresets(prev => {
      const next = new Set(prev)
      if (next.has(presetId)) next.delete(presetId)
      else next.add(presetId)
      return next
    })
  }, [])

  const handleColumnFilterChange = useCallback((colId, allowed) => {
    setColumnFilters(prev => {
      const next = new Map(prev)
      if (allowed === null) next.delete(colId)
      else next.set(colId, allowed)
      return next
    })
  }, [])

  const handleColVisToggle = useCallback((colId) => {
    setVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(colId)) next.delete(colId)
      else next.add(colId)
      return next
    })
  }, [])

  const handleRowClick = useCallback((record) => {
    setSelectedRecord(prev => prev?.id === record.id ? null : record)
  }, [])

  const handleFieldClick = useCallback((fieldKey) => {
    // Find the column for this field
    const col = COLUMNS.find(c => c.id === fieldKey)
    if (!col || !col.filterable) {
      // For non-filterable columns, activate 'incomplete' preset
      setActivePresets(prev => {
        const next = new Set(prev)
        next.add('incomplete')
        return next
      })
      return
    }
    // Filter to blanks for this column
    handleColumnFilterChange(fieldKey, new Set(['']))
    // Make column visible
    setVisibleCols(prev => {
      const next = new Set(prev)
      next.add(fieldKey)
      return next
    })
  }, [handleColumnFilterChange])

  const clearAllFilters = useCallback(() => {
    setActivePresets(new Set())
    setColumnFilters(new Map())
    setSearchText('')
  }, [])

  // Check if any filters are active
  const hasActiveFilters = activePresets.size > 0 || columnFilters.size > 0 || debouncedSearch

  // ─── VirtualList row props (react-window v2 API) ─────────────────
  const rowProps = useMemo(() => ({
    rows: sortedData,
    visibleColumns,
    onRowClick: handleRowClick,
    selectedId: selectedRecord?.id,
  }), [sortedData, visibleColumns, handleRowClick, selectedRecord?.id])

  // ─── Pagination info ───────────────────────────────────────────
  const resultText = hasActiveFilters
    ? `${sortedData.length.toLocaleString()} of ${enriched.length.toLocaleString()} records`
    : `${enriched.length.toLocaleString()} records`

  // ─── Mobile detection ──────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ─── Render ─────────────────────────────────────────────────────
  if (enriched.length === 0) {
    return (
      <div className="p-16 text-center bg-white border border-surface-200 rounded-xl">
        <FileSpreadsheet size={36} className="mx-auto mb-4 text-surface-300" />
        <h3 className="text-lg font-semibold text-surface-700 mb-1">No Records</h3>
        <p className="text-sm text-surface-500">Import files to explore your data here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-surface-100 space-y-3">
        {/* Row 1: Search + Column Picker + Count */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <input
              type="text"
              placeholder="Search across all fields..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColPicker(p => !p)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-surface-600 bg-surface-50 border border-surface-200 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <Columns3 size={14} />
              Columns
              <span className="text-[10px] text-surface-400">({visibleCols.size})</span>
            </button>
            {showColPicker && (
              <ColumnVisibilityPicker
                visibleCols={visibleCols}
                onToggle={handleColVisToggle}
                onClose={() => setShowColPicker(false)}
              />
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary-600 hover:text-primary-800 font-medium"
              >
                Clear all filters
              </button>
            )}
            <span className="text-xs text-surface-500">{resultText}</span>
          </div>
        </div>

        {/* Row 2: Completeness Bar */}
        <CompletenessBar incidents={enriched} onFieldClick={handleFieldClick} />

        {/* Row 3: Preset Filters */}
        <PresetFilters
          activePresets={activePresets}
          onToggle={handlePresetToggle}
          counts={presetCounts}
        />
      </div>

      {/* Table */}
      <div className={`flex ${selectedRecord && !isMobile ? '' : ''}`}>
        <div className={`flex-1 min-w-0 ${selectedRecord && !isMobile ? 'w-2/3' : 'w-full'}`}>
          {isMobile ? (
            /* Mobile: Card Layout */
            <div className="p-3 max-h-[70vh] overflow-y-auto">
              {sortedData.length === 0 ? (
                <p className="text-center text-sm text-surface-400 py-8">
                  No records match your filters.
                </p>
              ) : (
                sortedData.slice(0, 200).map(record => (
                  <MobileCard
                    key={record.id}
                    record={record}
                    onClick={handleRowClick}
                  />
                ))
              )}
              {sortedData.length > 200 && (
                <p className="text-center text-xs text-surface-400 py-2">
                  Showing first 200 of {sortedData.length.toLocaleString()} records. Use filters to narrow results.
                </p>
              )}
            </div>
          ) : (
            /* Desktop: Virtualized Table */
            <>
              {sortedData.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Search size={28} className="mx-auto mb-3 text-surface-300" />
                    <p className="text-sm font-medium text-surface-600">No records match your filters</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto" ref={scrollRef}>
                  {/* Header */}
                  <div
                    className="flex border-b border-surface-200 bg-gradient-to-r from-surface-50 to-surface-100/50"
                    style={{ minWidth: totalWidth }}
                  >
                    {visibleColumns.map(col => (
                      <div key={col.id} className="relative">
                        <HeaderCell
                          column={col}
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          hasFilter={columnFilters.has(col.id)}
                          onFilterClick={(colId) => setOpenFilter(prev => prev === colId ? null : colId)}
                        />
                        {openFilter === col.id && col.filterable && (
                          <ColumnFilterDropdown
                            column={col}
                            allValues={uniqueValues.get(col.id) || []}
                            selectedValues={columnFilters.get(col.id) || null}
                            onChange={handleColumnFilterChange}
                            onClose={() => setOpenFilter(null)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Body - react-window v2 API */}
                  <VirtualList
                    rowComponent={VirtualRow}
                    rowCount={sortedData.length}
                    rowHeight={44}
                    rowProps={rowProps}
                    overscanCount={10}
                    style={{
                      height: Math.min(sortedData.length * 44, 44 * 18),
                      minWidth: totalWidth,
                      overflowX: 'hidden',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Panel */}
        {selectedRecord && (
          <div className={`${isMobile ? 'w-full border-t' : 'w-1/3 border-l'} border-surface-200`}>
            <div className={isMobile ? 'max-h-[50vh] overflow-y-auto' : ''} style={!isMobile ? { height: Math.min(sortedData.length * 44, 44 * 18) + 40, overflowY: 'auto' } : undefined}>
              <DetailPanel
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-surface-50 to-white border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
        <span>
          {hasActiveFilters ? (
            <>
              Showing <span className="font-semibold text-surface-700">{sortedData.length.toLocaleString()}</span> of {enriched.length.toLocaleString()} records
            </>
          ) : (
            <>
              <span className="font-semibold text-surface-700">{enriched.length.toLocaleString()}</span> total records
            </>
          )}
        </span>
        <span className="text-surface-400">
          {visibleCols.size} of {COLUMNS.length} columns visible
        </span>
      </div>
    </div>
  )
}

export default React.memo(DataExplorer)
