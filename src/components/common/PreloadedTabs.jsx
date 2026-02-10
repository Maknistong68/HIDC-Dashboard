import { memo, useMemo, useState, useEffect, startTransition } from 'react'
import { useLocation } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'
import DataQuality from '../../pages/DataQuality'
import SafetyOutlook from '../../pages/SafetyOutlook'

const MAIN_TAB_ROUTES = ['/', '/data-control', '/outlook']

const PreloadedTabs = memo(() => {
  const location = useLocation()
  const [mountedTabs, setMountedTabs] = useState({
    dashboard: false,
    dataQuality: false,
    outlook: false
  })

  const activeTab = useMemo(() => {
    switch (location.pathname) {
      case '/data-control': return 'dataQuality'
      case '/outlook': return 'outlook'
      case '/': return 'dashboard'
      default: return null
    }
  }, [location.pathname])

  // Mount active tab immediately, defer others with startTransition
  useEffect(() => {
    const currentTab = location.pathname === '/data-control' ? 'dataQuality'
                     : location.pathname === '/outlook' ? 'outlook'
                     : 'dashboard'

    // Mount active tab immediately
    setMountedTabs(prev => ({ ...prev, [currentTab]: true }))

    // Mount remaining tabs deferred (non-blocking)
    startTransition(() => {
      setMountedTabs({ dashboard: true, dataQuality: true, outlook: true })
    })
  }, []) // Only on initial mount

  // Hide entire container when not on a main tab route
  const isVisible = MAIN_TAB_ROUTES.includes(location.pathname)

  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
        {mountedTabs.dashboard && <Dashboard />}
      </div>
      <div style={{ display: activeTab === 'dataQuality' ? 'block' : 'none' }}>
        {mountedTabs.dataQuality && <DataQuality />}
      </div>
      <div style={{ display: activeTab === 'outlook' ? 'block' : 'none' }}>
        {mountedTabs.outlook && <SafetyOutlook />}
      </div>
    </div>
  )
})

PreloadedTabs.displayName = 'PreloadedTabs'

export default PreloadedTabs
