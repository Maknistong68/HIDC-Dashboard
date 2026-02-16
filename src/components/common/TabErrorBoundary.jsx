import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Lightweight error boundary for individual tabs/panels.
 * Catches errors in child components and shows inline recovery UI
 * instead of crashing the entire page.
 */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error(`[TabErrorBoundary${this.props.label ? ` - ${this.props.label}` : ''}]`, error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center" role="alert">
          <AlertTriangle size={24} className="text-red-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            {this.props.label ? `${this.props.label} encountered an error` : 'Something went wrong'}
          </h3>
          <p className="text-xs text-red-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred in this section.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={12} />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default TabErrorBoundary
