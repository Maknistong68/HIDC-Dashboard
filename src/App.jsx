import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import DataQuality from './pages/DataQuality'
import Settings from './pages/Settings'
import Legal from './pages/Legal'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          {/* Main 3 tabs */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/data-control" element={<DataQuality />} />
          <Route path="/settings" element={<Settings />} />

          {/* Legacy redirects */}
          <Route path="/data-quality" element={<Navigate to="/data-control" replace />} />
          <Route path="/data" element={<Navigate to="/" replace />} />
          <Route path="/import" element={<Navigate to="/data-control" replace />} />

          {/* Legal */}
          <Route path="/legal" element={<Legal />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
