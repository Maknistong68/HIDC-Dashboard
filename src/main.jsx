import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { DateProvider } from './context/DateContext.jsx'
import { LoadingProvider } from './context/LoadingContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { FilterProvider } from './context/FilterContext.jsx'
import { reportError } from './utils/errorReporter.js'
import './index.css'

// Catch unhandled promise rejections globally
window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, { context: 'unhandledrejection' })
  if (import.meta.env.DEV) {
    console.error('[Unhandled Rejection]', event.reason)
  }
})

// Catch uncaught errors globally
window.addEventListener('error', (event) => {
  reportError(event.error, { context: 'window.onerror', message: event.message })
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DateProvider>
        <LoadingProvider>
          <DataProvider>
            <FilterProvider>
              <App />
            </FilterProvider>
          </DataProvider>
        </LoadingProvider>
      </DateProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
