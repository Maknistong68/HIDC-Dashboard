import React, { useState, useMemo } from 'react'
import { Plus, Edit, Trash2, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import DataTable from '../components/common/DataTable'
import FilterBar from '../components/common/FilterBar'
import { COMPLIANCE_TYPES } from '../utils/constants'
import { format, parseISO, differenceInDays } from 'date-fns'

const ComplianceForm = ({ item, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    item || {
      projectId: projects[0]?.id || '',
      type: 'crane-inspection',
      itemName: '',
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      expiryDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      responsiblePerson: '',
      documentRef: '',
      notes: '',
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Project *
          </label>
          <select
            required
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Compliance Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {COMPLIANCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Item Name / Description *
          </label>
          <input
            type="text"
            required
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="e.g., Tower Crane TC-001, John Smith - Rigger"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Issue Date *
          </label>
          <input
            type="date"
            required
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Expiry Date *
          </label>
          <input
            type="date"
            required
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Responsible Person *
          </label>
          <input
            type="text"
            required
            value={formData.responsiblePerson}
            onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Person responsible for renewal"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Document Reference
          </label>
          <input
            type="text"
            value={formData.documentRef}
            onChange={(e) => setFormData({ ...formData, documentRef: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="e.g., CERT-2024-001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-surface-200 text-surface-700 rounded-lg hover:bg-surface-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          {item ? 'Update' : 'Add Item'}
        </button>
      </div>
    </form>
  )
}

const Compliance = () => {
  const { projects, compliance, addCompliance, updateCompliance, deleteCompliance, getProjectById } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [filters, setFilters] = useState({
    projectId: '',
    type: '',
  })

  const activeProjects = projects.filter((p) => p.status === 'active')

  const getStatus = (expiryDate) => {
    const today = new Date()
    const expiry = parseISO(expiryDate)
    const daysUntil = differenceInDays(expiry, today)

    if (daysUntil < 0) return { status: 'expired', label: 'Expired', color: '#dc2626', bgColor: '#fee2e2' }
    if (daysUntil <= 7) return { status: 'critical', label: `${daysUntil}d left`, color: '#dc2626', bgColor: '#fee2e2' }
    if (daysUntil <= 30) return { status: 'warning', label: `${daysUntil}d left`, color: '#f97316', bgColor: '#ffedd5' }
    return { status: 'valid', label: 'Valid', color: '#22c55e', bgColor: '#dcfce7' }
  }

  const filteredCompliance = useMemo(() => {
    return compliance.filter((item) => {
      if (filters.projectId && item.projectId !== filters.projectId) return false
      if (filters.type && item.type !== filters.type) return false

      if (statusFilter !== 'all') {
        const itemStatus = getStatus(item.expiryDate).status
        if (statusFilter === 'expired' && itemStatus !== 'expired') return false
        if (statusFilter === 'expiring' && !['critical', 'warning'].includes(itemStatus)) return false
        if (statusFilter === 'valid' && itemStatus !== 'valid') return false
      }

      return true
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
  }, [compliance, filters, statusFilter])

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
      options: COMPLIANCE_TYPES.map((t) => ({ value: t.value, label: t.label })),
    },
  ]

  const columns = [
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => getStatus(row.expiryDate).status,
      render: (row) => {
        const statusInfo = getStatus(row.expiryDate)
        return (
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        )
      },
      width: '100px',
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => COMPLIANCE_TYPES.find((t) => t.value === row.type)?.label || row.type,
      width: '150px',
    },
    {
      key: 'itemName',
      header: 'Item',
      accessor: (row) => row.itemName,
    },
    {
      key: 'project',
      header: 'Project',
      accessor: (row) => getProjectById(row.projectId)?.name || 'Unknown',
      width: '150px',
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      accessor: (row) => row.expiryDate,
      render: (row) => format(parseISO(row.expiryDate), 'MMM d, yyyy'),
      width: '120px',
    },
    {
      key: 'responsiblePerson',
      header: 'Responsible',
      accessor: (row) => row.responsiblePerson,
      width: '150px',
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: () => null,
      render: (row) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(row)
            }}
            className="p-1.5 text-surface-500 hover:bg-surface-100 rounded-lg"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeletingItem(row)
            }}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '80px',
    },
  ]

  const handleSubmit = (formData) => {
    if (editingItem) {
      updateCompliance(editingItem.id, formData)
    } else {
      addCompliance(formData)
    }
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const confirmDelete = () => {
    if (deletingItem) {
      deleteCompliance(deletingItem.id)
      setDeletingItem(null)
    }
  }

  // Stats
  const expiredCount = compliance.filter((c) => getStatus(c.expiryDate).status === 'expired').length
  const expiringCount = compliance.filter((c) => ['critical', 'warning'].includes(getStatus(c.expiryDate).status)).length
  const validCount = compliance.filter((c) => getStatus(c.expiryDate).status === 'valid').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Compliance</h2>
          <p className="text-surface-500">Track permits, certifications, and inspections</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 cursor-pointer hover:bg-red-100 transition-colors"
             onClick={() => setStatusFilter('expired')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
              <p className="text-sm text-red-600">Expired</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 cursor-pointer hover:bg-orange-100 transition-colors"
             onClick={() => setStatusFilter('expiring')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{expiringCount}</p>
              <p className="text-sm text-orange-600">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 cursor-pointer hover:bg-green-100 transition-colors"
             onClick={() => setStatusFilter('valid')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
              <p className="text-sm text-green-600">Valid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          All ({compliance.length})
        </button>
        <button
          onClick={() => setStatusFilter('expired')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'expired'
              ? 'bg-red-100 text-red-700'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          Expired ({expiredCount})
        </button>
        <button
          onClick={() => setStatusFilter('expiring')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'expiring'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          Expiring ({expiringCount})
        </button>
        <button
          onClick={() => setStatusFilter('valid')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'valid'
              ? 'bg-green-100 text-green-700'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          Valid ({validCount})
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfig}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onClearFilters={() => setFilters({ projectId: '', type: '' })}
      />

      {/* Table */}
      <DataTable
        data={filteredCompliance}
        columns={columns}
        searchPlaceholder="Search compliance items..."
        emptyMessage="No compliance items found"
        onRowClick={handleEdit}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        title={editingItem ? 'Edit Compliance Item' : 'Add Compliance Item'}
        size="lg"
      >
        <ComplianceForm
          item={editingItem}
          projects={activeProjects}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="Delete Compliance Item"
        message="Are you sure you want to delete this compliance record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default Compliance
