import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

// Suppress React error boundary console output during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Error Boundary')) return
    if (typeof args[0] === 'string' && args[0].includes('The above error')) return
    originalError.call(console, ...args)
  }
})
afterAll(() => {
  console.error = originalError
})

function ThrowingComponent({ message }) {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('catches render errors and shows error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="test render error" />
      </ErrorBoundary>
    )
    // "render" in the message triggers Display Error category
    expect(screen.getByText('Display Error')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
  })

  it('shows data error UI for JSON parse errors', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Failed to parse JSON from localStorage" />
      </ErrorBoundary>
    )
    expect(screen.getByText('Data Loading Error')).toBeInTheDocument()
    expect(screen.getByText('Clear All Data (Last Resort)')).toBeInTheDocument()
  })
})
