import React, { useState, useMemo } from 'react'
import { Plus, Edit, Trash2, CalendarCheck, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../context/DataContext'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import DataTable from '../components/common/DataTable'
import FilterBar from '../components/common/FilterBar'
import { ENGAGEMENT_TYPES } from '../utils/constants'
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, getWeek, getYear, isWithinInterval } from 'date-fns'

const EngagementForm = ({ engagement, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    engagement || {
      projectId: projects[0]?.id || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'site-inspection',
      duration: 60,
      attendees: 10,
      topics: [],
      findings: '',
      actionsRaised: 0,
      conductedBy: '',
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleTopicsChange = (e) => {
    const topics = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
    setFormData({ ...formData, topics })
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
            Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Activity Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {ENGAGEMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Duration (minutes) *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Number of Attendees *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.attendees}
            onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Conducted By *
          </label>
          <input
            type="text"
            required
            value={formData.conductedBy}
            onChange={(e) => setFormData({ ...formData, conductedBy: e.target.value })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Name of conductor"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1">
          Topics Covered
        </label>
        <input
          type="text"
          value={formData.topics?.join(', ') || ''}
          onChange={handleTopicsChange}
          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="Separate topics with commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1">
          Findings / Notes
        </label>
        <textarea
          value={formData.findings}
          onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="Any findings or observations..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1">
          Actions Raised
        </label>
        <input
          type="number"
          min="0"
          value={formData.actionsRaised}
          onChange={(e) => setFormData({ ...formData, actionsRaised: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
          {engagement ? 'Update' : 'Add Engagement'}
        </button>
      </div>
    </form>
  )
}

const WeeklyTracker = ({ projects, engagements, currentWeekStart }) => {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 })
  const weekNum = getWeek(currentWeekStart)
  const year = getYear(currentWeekStart)

  const weeklyData = useMemo(() => {
    return projects.map((project) => {
      const projectEngagements = engagements.filter((e) => {
        const eDate = parseISO(e.date)
        return e.projectId === project.id && isWithinInterval(eDate, { start: currentWeekStart, end: weekEnd })
      })

      const inspections = projectEngagements.filter((e) => e.type === 'site-inspection').length
      const toolboxTalks = projectEngagements.filter((e) => e.type === 'toolbox-talk').length
      const audits = projectEngagements.filter((e) => e.type === 'internal-audit' || e.type === 'external-audit').length
      const trainings = projectEngagements.filter((e) => e.type === 'training').length
      const total = projectEngagements.length

      const target = project.targetEngagements?.weekly || 10
      const score = Math.min(Math.round((total / target) * 100), 100)

      return {
        project,
        inspections,
        toolboxTalks,
        audits,
        trainings,
        total,
        target,
        score,
      }
    })
  }, [projects, engagements, currentWeekStart, weekEnd])

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <div className="p-4 border-b border-surface-200">
        <h3 className="font-semibold text-surface-900">
          Week {weekNum} ({format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Project</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase">Inspections</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase">Toolbox Talks</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase">Audits</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase">Trainings</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {weeklyData.map((row) => (
              <tr key={row.project.id} className="hover:bg-surface-50">
                <td className="px-4 py-3 text-sm font-medium text-surface-900">{row.project.name}</td>
                <td className="px-4 py-3 text-center text-sm text-surface-600">{row.inspections}</td>
                <td className="px-4 py-3 text-center text-sm text-surface-600">{row.toolboxTalks}</td>
                <td className="px-4 py-3 text-center text-sm text-surface-600">{row.audits}</td>
                <td className="px-4 py-3 text-center text-sm text-surface-600">{row.trainings}</td>
                <td className="px-4 py-3 text-center text-sm font-medium text-surface-900">{row.total}/{row.target}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(row.score)}`}>
                    {row.score}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Engagements = () => {
  const { projects, engagements, addEngagement, updateEngagement, deleteEngagement, getProjectById } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEngagement, setEditingEngagement] = useState(null)
  const [deletingEngagement, setDeletingEngagement] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [filters, setFilters] = useState({
    projectId: '',
    type: '',
  })

  const activeProjects = projects.filter((p) => p.status === 'active')

  const filteredEngagements = useMemo(() => {
    return engagements.filter((engagement) => {
      if (filters.projectId && engagement.projectId !== filters.projectId) return false
      if (filters.type && engagement.type !== filters.type) return false
      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [engagements, filters])

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
      options: ENGAGEMENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
    },
  ]

  const columns = [
    {
      key: 'date',
      header: 'Date',
      accessor: (row) => row.date,
      render: (row) => format(parseISO(row.date), 'MMM d, yyyy'),
      width: '100px',
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => ENGAGEMENT_TYPES.find((t) => t.value === row.type)?.label || row.type,
      width: '180px',
    },
    {
      key: 'project',
      header: 'Project',
      accessor: (row) => getProjectById(row.projectId)?.name || 'Unknown',
      width: '150px',
    },
    {
      key: 'duration',
      header: 'Duration',
      accessor: (row) => row.duration,
      render: (row) => (
        <div className="flex items-center gap-1 text-sm text-surface-600">
          <Clock size={14} />
          {row.duration} min
        </div>
      ),
      width: '100px',
    },
    {
      key: 'attendees',
      header: 'Attendees',
      accessor: (row) => row.attendees,
      render: (row) => (
        <div className="flex items-center gap-1 text-sm text-surface-600">
          <Users size={14} />
          {row.attendees}
        </div>
      ),
      width: '100px',
    },
    {
      key: 'conductedBy',
      header: 'Conducted By',
      accessor: (row) => row.conductedBy,
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
              setDeletingEngagement(row)
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
    if (editingEngagement) {
      updateEngagement(editingEngagement.id, formData)
    } else {
      addEngagement(formData)
    }
    setIsModalOpen(false)
    setEditingEngagement(null)
  }

  const handleEdit = (engagement) => {
    setEditingEngagement(engagement)
    setIsModalOpen(true)
  }

  const confirmDelete = () => {
    if (deletingEngagement) {
      deleteEngagement(deletingEngagement.id)
      setDeletingEngagement(null)
    }
  }

  // Stats
  const thisWeekEngagements = engagements.filter((e) => {
    const eDate = parseISO(e.date)
    return isWithinInterval(eDate, { start: currentWeekStart, end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }) })
  }).length

  const totalEngagements = engagements.length
  const totalAttendees = engagements.reduce((sum, e) => sum + (e.attendees || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Engagements</h2>
          <p className="text-surface-500">Track safety engagement activities</p>
        </div>
        <button
          onClick={() => {
            setEditingEngagement(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
        >
          <Plus size={20} />
          Add Engagement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">{thisWeekEngagements}</p>
              <p className="text-sm text-primary-600">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalEngagements}</p>
              <p className="text-sm text-green-600">Total Engagements</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalAttendees.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Total Attendees</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Week Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'weekly'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            Weekly Tracker
          </button>
        </div>

        {viewMode === 'weekly' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              className="p-2 hover:bg-surface-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-surface-700">
              Week {getWeek(currentWeekStart)}, {getYear(currentWeekStart)}
            </span>
            <button
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              className="p-2 hover:bg-surface-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
              className="ml-2 px-3 py-1 text-sm bg-surface-100 hover:bg-surface-200 rounded-lg"
            >
              Today
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <>
          <FilterBar
            filters={filterConfig}
            activeFilters={filters}
            onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
            onClearFilters={() => setFilters({ projectId: '', type: '' })}
          />
          <DataTable
            data={filteredEngagements}
            columns={columns}
            searchPlaceholder="Search engagements..."
            emptyMessage="No engagements found"
            onRowClick={handleEdit}
          />
        </>
      ) : (
        <WeeklyTracker
          projects={activeProjects}
          engagements={engagements}
          currentWeekStart={currentWeekStart}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEngagement(null)
        }}
        title={editingEngagement ? 'Edit Engagement' : 'Add New Engagement'}
        size="lg"
      >
        <EngagementForm
          engagement={editingEngagement}
          projects={activeProjects}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingEngagement(null)
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingEngagement}
        onClose={() => setDeletingEngagement(null)}
        onConfirm={confirmDelete}
        title="Delete Engagement"
        message="Are you sure you want to delete this engagement record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default Engagements
