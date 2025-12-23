import React, { useState, useMemo } from 'react'
import { Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import ConfirmDialog from '../components/common/ConfirmDialog'
import DataTable from '../components/common/DataTable'
import FilterBar from '../components/common/FilterBar'
import { INCIDENT_TYPES, ACTION_STATUSES } from '../utils/constants'
import { format, parseISO } from 'date-fns'

const Incidents = () => {
  const { projects, incidents, deleteIncident, getProjectById } = useData()
  const [deletingIncident, setDeletingIncident] = useState(null)
  const [filters, setFilters] = useState({
    projectId: '',
    type: '',
    actionStatus: '',
  })

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (filters.projectId && incident.projectId !== filters.projectId) return false
      if (filters.type && incident.type !== filters.type) return false
      if (filters.actionStatus && incident.actionStatus !== filters.actionStatus) return false
      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [incidents, filters])

  const filterConfig = [
    {
      key: 'projectId',
      label: 'Project',
      type: 'select',
      placeholder: 'All Projects',
      options: projects.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      placeholder: 'All Types',
      options: INCIDENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
    },
    {
      key: 'actionStatus',
      label: 'Status',
      type: 'select',
      placeholder: 'All Statuses',
      options: ACTION_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    },
  ]

  const columns = [
    {
      key: 'date',
      header: 'Date',
      accessor: (row) => row.date,
      render: (row) => {
        try {
          return format(parseISO(row.date), 'MMM d, yyyy')
        } catch {
          return row.date
        }
      },
      width: '100px',
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      render: (row) => {
        const type = INCIDENT_TYPES.find((t) => t.value === row.type)
        return (
          <span
            className="px-1.5 py-0.5 text-xs font-medium rounded-sm"
            style={{
              backgroundColor: `${type?.color}20`,
              color: type?.color,
            }}
          >
            {type?.label || row.type}
          </span>
        )
      },
      width: '120px',
    },
    {
      key: 'project',
      header: 'Project',
      accessor: (row) => getProjectById(row.projectId)?.name || row.projectId || '-',
      width: '150px',
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (row) => row.description,
      render: (row) => (
        <span className="line-clamp-2 text-xs">{row.description}</span>
      ),
    },
    {
      key: 'reportedBy',
      header: 'Reporter',
      accessor: (row) => row.reportedBy || '-',
      width: '120px',
    },
    {
      key: 'actionStatus',
      header: 'Status',
      accessor: (row) => row.actionStatus,
      render: (row) => {
        const status = ACTION_STATUSES.find((s) => s.value === row.actionStatus)
        const Icon = row.actionStatus === 'closed' ? CheckCircle : Clock
        return (
          <div className="flex items-center gap-1">
            <Icon size={12} style={{ color: status?.color }} />
            <span style={{ color: status?.color }} className="text-xs font-medium">
              {status?.label || row.actionStatus}
            </span>
          </div>
        )
      },
      width: '90px',
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      accessor: () => null,
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setDeletingIncident(row)
          }}
          className="p-1 text-red-500 hover:bg-red-50 rounded-sm"
        >
          <Trash2 size={14} />
        </button>
      ),
      width: '40px',
    },
  ]

  const confirmDelete = () => {
    if (deletingIncident) {
      deleteIncident(deletingIncident.id)
      setDeletingIncident(null)
    }
  }

  // Stats
  const openActions = incidents.filter((i) => i.actionStatus === 'open').length
  const inProgressActions = incidents.filter((i) => i.actionStatus === 'in-progress').length
  const closedActions = incidents.filter((i) => i.actionStatus === 'closed').length

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">All Observation Data</h2>
        <span className="text-xs text-gray-500">{incidents.length} total records</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-gray-300 rounded-sm p-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <div>
            <p className="text-lg font-bold text-red-600">{openActions}</p>
            <p className="text-xs text-gray-500">Open</p>
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-sm p-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-lg font-bold text-orange-600">{inProgressActions}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-sm p-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-lg font-bold text-green-600">{closedActions}</p>
            <p className="text-xs text-gray-500">Closed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfig}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onClearFilters={() => setFilters({ projectId: '', type: '', actionStatus: '' })}
      />

      {/* Table */}
      <DataTable
        data={filteredIncidents}
        columns={columns}
        searchPlaceholder="Search data..."
        emptyMessage="No data found. Import Excel to add observations."
        pageSize={20}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingIncident}
        onClose={() => setDeletingIncident(null)}
        onConfirm={confirmDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default Incidents
