import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import Import from './pages/Import'
import Legal from './pages/Legal'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<Incidents />} />
          <Route path="/import" element={<Import />} />
          <Route path="/legal" element={<Legal />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
