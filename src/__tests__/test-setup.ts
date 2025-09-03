// Test setup utilities
import { afterEach, beforeAll, afterAll } from '@jest/globals';
import { cleanup } from '@testing-library/react';

// Mock browser APIs that don't exist in Node.js
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

// Mock location for jsdom
if (typeof window !== 'undefined') {
  // Check if location is already defined and can be modified
  try {
    if (window.location && typeof window.location.assign !== 'function') {
      // Location exists but needs mocking
      Object.defineProperty(window.location, 'assign', {
        value: jest.fn(),
        writable: true,
      });
      Object.defineProperty(window.location, 'replace', {
        value: jest.fn(),
        writable: true,
      });
      Object.defineProperty(window.location, 'reload', {
        value: jest.fn(),
        writable: true,
      });
    }
  } catch {
    // If we can't modify location, it's probably already properly set up
    // Location mock setup skipped - no console output needed in tests
  }
}

// Clean up after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  
  // Clear localStorage mock
  (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
  (window.localStorage.setItem as jest.Mock).mockClear();
  (window.localStorage.removeItem as jest.Mock).mockClear();
});

// Reset global state before all tests
beforeAll(() => {
  // Mock console methods in test environment
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  // Cleanup any global resources
  cleanup();
});