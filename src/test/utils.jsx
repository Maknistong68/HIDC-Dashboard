import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

/**
 * Render wrapper with all required providers for component testing.
 */
export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { renderWithProviders as render }
