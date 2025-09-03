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

// Mock location - check if it already exists and delete it first
delete (window as unknown as Record<string, unknown>)['location'];
(window as unknown as Record<string, unknown>)['location'] = {
  href: 'http://localhost:3000/',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
} as unknown as Location;

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