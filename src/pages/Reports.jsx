import React, { useState, useMemo } from 'react'
import { FileBarChart, Download, Printer, Calendar, Building2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import {
  calculateTRIR,
  calculateLTIR,
  calculateDaysWithoutLTI,
  getIncidentCountsByType,
  getEngagementsByType,
  calculateProjectSafetyScore,
  getOpenActionsCount,
  getOverdueComplianceCount,
} from '../utils/calculations'
import { INCIDENT_TYPES, ENGAGEMENT_TYPES } from '../utils/constants'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

const ReportCard = ({ title, description, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md cursor-pointer transition-shadow"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </div>
)

const MonthlyReport = ({ projects, incidents, engagements, compliance, month }) => {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)

  const monthIncidents = incidents.filter((i) => {
    const date = parseISO(i.date)
    return isWithinInterval(date, { start: monthStart, end: monthEnd })
  })

  const monthEngagements = engagements.filter((e) => {
    const date = parseISO(e.date)
    return isWithinInterval(date, { start: monthStart, end: monthEnd })
  })

  const totalManHours = projects.reduce((sum, p) => sum + (p.manHours || 0), 0)
  const incidentCounts = getIncidentCountsByType(monthIncidents)
  const engagementCounts = getEngagementsByType(monthEngagements)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 print:border-none print:p-0">
      <div className="text-center mb-8 print:mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Monthly HSE Summary Report
        </h1>
        <p className="text-gray-500">{format(month, 'MMMM yyyy')}</p>
      </div>

      {/* Key Metrics */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {calculateTRIR(monthIncidents, totalManHours / 12)}
            </p>
            <p className="text-sm text-gray-500">TRIR</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {calculateDaysWithoutLTI(incidents)}
            </p>
            <p className="text-sm text-gray-500">Days Without LTI</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{monthIncidents.length}</p>
            <p className="text-sm text-gray-500">Total Incidents</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{monthEngagements.length}</p>
            <p className="text-sm text-gray-500">Total Engagements</p>
          </div>
        </div>
      </section>

      {/* Incident Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          Incident Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENT_TYPES.map((type) => (
                <tr key={type.value} className="border-b">
                  <td className="py-2">{type.label}</td>
                  <td className="text-right py-2 font-medium">{incidentCounts[type.value] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Engagement Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          Engagement Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Activity Type</th>
                <th className="text-right py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {ENGAGEMENT_TYPES.map((type) => (
                <tr key={type.value} className="border-b">
                  <td className="py-2">{type.label}</td>
                  <td className="text-right py-2 font-medium">{engagementCounts[type.value] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Project Safety Scores */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          Project Safety Scores
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Project</th>
                <th className="text-right py-2">Incidents</th>
                <th className="text-right py-2">Engagements</th>
                <th className="text-right py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {projects.filter(p => p.status === 'active').map((project) => {
                const projectIncidents = monthIncidents.filter(i => i.projectId === project.id)
                const projectEngagements = monthEngagements.filter(e => e.projectId === project.id)
                const score = calculateProjectSafetyScore(project, incidents, engagements)
                return (
                  <tr key={project.id} className="border-b">
                    <td className="py-2">{project.name}</td>
                    <td className="text-right py-2">{projectIncidents.length}</td>
                    <td className="text-right py-2">{projectEngagements.length}</td>
                    <td className="text-right py-2 font-medium">{score}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        Generated on {format(new Date(), 'MMMM d, yyyy HH:mm')}
      </div>
    </div>
  )
}

const Reports = () => {
  const { projects, incidents, engagements, compliance, exportData } = useData()
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [selectedProject, setSelectedProject] = useState('all')

  const reportMonth = parseISO(`${selectedMonth}-01`)

  const handlePrint = () => {
    window.print()
  }

  const handleExportJSON = () => {
    const data = exportData()
    const filename = `hse-report-${format(new Date(), 'yyyy-MM-dd')}.json`
    downloadJSON(data, filename)
  }

  const reportTypes = [
    {
      id: 'monthly',
      title: 'Monthly HSE Summary',
      description: 'Comprehensive monthly overview of safety performance',
      icon: Calendar,
    },
    {
      id: 'project',
      title: 'Project Performance',
      description: 'Detailed safety performance by project',
      icon: Building2,
    },
    {
      id: 'incident',
      title: 'Incident Analysis',
      description: 'In-depth incident trends and root cause analysis',
      icon: FileBarChart,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500">Generate and export safety reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            <Download size={20} />
            Export All Data
          </button>
          {selectedReport && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              <Printer size={20} />
              Print Report
            </button>
          )}
        </div>
      </div>

      {/* Report Selection */}
      {!selectedReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <ReportCard
                key={report.id}
                title={report.title}
                description={report.description}
                icon={report.icon}
                onClick={() => setSelectedReport(report.id)}
              />
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'active').length}</p>
                <p className="text-sm text-gray-500">Active Projects</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{incidents.length}</p>
                <p className="text-sm text-gray-500">Total Incidents</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{engagements.length}</p>
                <p className="text-sm text-gray-500">Total Engagements</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{compliance.length}</p>
                <p className="text-sm text-gray-500">Compliance Items</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Report Controls */}
          <div className="flex flex-wrap items-center gap-4 no-print">
            <button
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back to Reports
            </button>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            {selectedReport === 'project' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Project:</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Report Content */}
          <MonthlyReport
            projects={projects}
            incidents={incidents}
            engagements={engagements}
            compliance={compliance}
            month={reportMonth}
          />
        </>
      )}
    </div>
  )
}

export default Reports
