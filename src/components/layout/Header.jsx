import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Download, Upload, RefreshCw } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { downloadJSON, exportAllData } from '../../utils/storage'
import { format } from 'date-fns'

const pageTitles = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/incidents': 'Incidents',
  '/engagements': 'Engagements',
  '/compliance': 'Compliance',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

const Header = () => {
  const location = useLocation()
  const { incidents, compliance, exportData } = useData()

  const title = pageTitles[location.pathname] || 'HSE Dashboard'

  // Calculate alerts
  const openActions = incidents.filter(
    (i) => i.actionStatus === 'open' || i.actionStatus === 'in-progress'
  ).length

  const today = new Date()
  const expiringCompliance = compliance.filter((c) => {
    const expiryDate = new Date(c.expiryDate)
    const daysUntilExpiry = Math.ceil(
      (expiryDate - today) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }).length

  const expiredCompliance = compliance.filter((c) => {
    return new Date(c.expiryDate) < today
  }).length

  const totalAlerts = openActions + expiringCompliance + expiredCompliance

  const handleExport = () => {
    const data = exportData()
    const filename = `hse-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
    downloadJSON(data, filename)
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Export Data"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {totalAlerts > 99 ? '99+' : totalAlerts}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
