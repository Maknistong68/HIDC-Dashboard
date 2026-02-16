import React from 'react'
import { AlertTriangle, RefreshCw, Home, Database } from 'lucide-react'
import { reportError } from '../../utils/errorReporter'

// Categorize errors for better user messaging
const getErrorInfo = (error) => {
  const errorString = error?.toString() || ''
  const errorMessage = error?.message || ''

  // Data-related errors
  if (errorMessage.includes('localStorage') || errorMessage.includes('JSON') || errorMessage.includes('parse')) {
    return {
      title: 'Data Loading Error',
      message: 'There was a problem loading your saved data. Your data may be corrupted or the browser storage is full.',
      suggestion: 'Try clearing your browser cache or exporting your data from a backup.',
      canClearData: true
    }
  }

  // Render/Component errors
  if (errorMessage.includes('render') || errorMessage.includes('undefined') || errorMessage.includes('null')) {
    return {
      title: 'Display Error',
      message: 'The dashboard encountered an error while displaying content.',
      suggestion: 'This is usually temporary. Refreshing the page should resolve the issue.',
      canClearData: false
    }
  }

  // Network errors (though this app is offline)
  if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
    return {
      title: 'Connection Error',
      message: 'There was a problem with the network connection.',
      suggestion: 'Check your internet connection and try again.',
      canClearData: false
    }
  }

  // Default fallback
  return {
    title: 'Unexpected Error',
    message: 'Something unexpected happened in the application.',
    suggestion: 'Refreshing the page usually resolves this issue. Your data is safe.',
    canClearData: false
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, { context: 'ErrorBoundary', componentStack: errorInfo?.componentStack })
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleClearData = () => {
    if (window.confirm('This will clear all your saved data. Are you sure? This cannot be undone.')) {
      try {
        localStorage.clear()
        window.location.reload()
      } catch (e) {
        console.error('Failed to clear localStorage:', e)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const errorInfo = getErrorInfo(this.state.error)

      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4" role="alert" aria-live="assertive">
          <div className="bg-white rounded-lg border border-surface-200 shadow-lg p-8 max-w-lg w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-surface-900 mb-2">
                {errorInfo.title}
              </h1>
              <p className="text-surface-600 mb-2">
                {errorInfo.message}
              </p>
              <p className="text-sm text-surface-500 mb-6">
                {errorInfo.suggestion}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw size={18} aria-hidden="true" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-2"
              >
                <Home size={18} aria-hidden="true" />
                Go to Dashboard
              </button>
            </div>

            {errorInfo.canClearData && (
              <div className="mt-4 pt-4 border-t border-surface-200 text-center">
                <button
                  onClick={this.handleClearData}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Database size={14} aria-hidden="true" />
                  Clear All Data (Last Resort)
                </button>
              </div>
            )}

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 p-4 bg-surface-100 rounded-lg text-left">
                <p className="text-xs font-semibold text-surface-700 mb-1">Error Details (Development Only):</p>
                <p className="text-xs font-mono text-red-600 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-xs font-mono text-surface-600 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
