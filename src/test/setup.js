import '@testing-library/jest-dom/vitest'

// Mock matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {
    this.observe = () => {}
    this.unobserve = () => {}
    this.disconnect = () => {}
  }
}
window.IntersectionObserver = MockIntersectionObserver

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {
    this.observe = () => {}
    this.unobserve = () => {}
    this.disconnect = () => {}
  }
}
window.ResizeObserver = MockResizeObserver
