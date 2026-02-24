import { useMemo, memo } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Download } from 'lucide-react'
import { useDataState, useDataActions } from '../../context/DataContext'
import { useDate } from '../../context/DateContext'
import { downloadJSON } from '../../utils/storage'
import { format } from 'date-fns'
import { isOpenAction } from '../../utils/incidentHelpers'

const pageTitles = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/incidents': 'Incidents',
  '/engagements': 'Engagements',
  '/compliance': 'Compliance',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

const Header = memo(() => {
  const location = useLocation()
  const { incidents } = useDataState()
  const { exportData } = useDataActions()
  const { formatCurrentDate, getCurrentDate } = useDate()

  const title = pageTitles[location.pathname] || 'HSE Dashboard'

  // Memoize open actions count to prevent 3 array scans on every render
  const openActions = useMemo(() => {
    return incidents.filter(isOpenAction).length
  }, [incidents])

  const totalAlerts = openActions

  const handleExport = () => {
    const data = exportData()
    const filename = `hse-backup-${format(getCurrentDate(), 'yyyy-MM-dd-HHmmss')}.json`
    downloadJSON(data, filename)
  }

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold text-surface-800">{title}</h1>
        <p className="text-sm text-surface-500">
          {formatCurrentDate('EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-white/50 rounded-lg transition-colors backdrop-blur-sm"
          title="Export Data"
          aria-label="Export data"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 text-surface-600 hover:bg-white/50 rounded-lg transition-colors backdrop-blur-sm"
          title="Notifications"
          aria-label={`Notifications${totalAlerts > 0 ? `, ${totalAlerts} unread` : ''}`}
        >
          <Bell size={20} />
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center" aria-hidden="true">
              {totalAlerts > 99 ? '99+' : totalAlerts}
            </span>
          )}
        </button>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header
