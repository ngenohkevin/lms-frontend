import '@testing-library/jest-dom'

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock environment variables for testing
process.env.NEXT_PUBLIC_APP_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1'
process.env.NEXT_PUBLIC_ENABLE_MOCK_API = 'true'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock window.requestAnimationFrame
global.requestAnimationFrame = callback => {
  setTimeout(callback, 0)
}