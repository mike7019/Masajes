import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

// Mock session data
export const mockSession = {
  user: {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin'
  },
  expires: '2024-12-31'
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any
}

export function renderWithProviders(
  ui: ReactElement,
  { session = null, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const Provider = SessionProvider as any
    return (
      <Provider session={session}>
        {children}
      </Provider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data generators
export const createMockServicio = (overrides = {}) => ({
  id: 'service-1',
  nombre: 'Masaje Relajante',
  descripcion: 'Un masaje para relajar cuerpo y mente',
  duracion: 60,
  precio: 80,
  activo: true,
  promociones: [],
  creadoEn: new Date('2024-01-01'),
  ...overrides
})

export const createMockReserva = (overrides = {}) => ({
  id: 'reservation-1',
  clienteNombre: 'María García',
  clienteEmail: 'maria@example.com',
  clienteTelefono: '+1234567890',
  servicioId: 'service-1',
  fechaHora: new Date('2024-12-15T14:00:00'),
  estado: 'PENDIENTE' as const,
  notas: 'Primera vez',
  creadaEn: new Date('2024-12-01'),
  servicio: createMockServicio(),
  ...overrides
})

export const createMockContacto = (overrides = {}) => ({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  telefono: '+1234567890',
  asunto: 'Consulta sobre masajes',
  mensaje: 'Me gustaría información sobre sus servicios',
  tipoConsulta: 'general' as const,
  ...overrides
})

export const createMockDisponibilidad = (overrides = {}) => ({
  id: 'availability-1',
  diaSemana: 1, // Monday
  horaInicio: '09:00',
  horaFin: '18:00',
  activo: true,
  ...overrides
})

// Date utilities for tests
export const getNextWeekday = (dayOfWeek: number): Date => {
  const date = new Date()
  const currentDay = date.getDay()
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7
  date.setDate(date.getDate() + daysUntilTarget)
  return date
}

export const getNextMonday = (): Date => getNextWeekday(1)
export const getNextFriday = (): Date => getNextWeekday(5)
export const getNextSaturday = (): Date => getNextWeekday(6)

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const setTimeOnDate = (date: Date, hours: number, minutes: number = 0): Date => {
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

// Form testing utilities
export const fillForm = async (
  getByLabelText: any,
  formData: Record<string, string>
) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = getByLabelText(new RegExp(field, 'i'))
    await input.clear()
    await input.type(value)
  }
}

// API response mocks
export const createMockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  headers: new Headers(),
  statusText: status === 200 ? 'OK' : 'Error'
})

export const mockFetch = (responses: Array<{ url: string; response: any; status?: number }>) => {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    const mockResponse = responses.find(r => url.includes(r.url))
    if (mockResponse) {
      return Promise.resolve(createMockApiResponse(mockResponse.response, mockResponse.status))
    }
    return Promise.resolve(createMockApiResponse({ error: 'Not found' }, 404))
  })
}

// Wait utilities
export const waitForElement = async (getElement: () => any, timeout = 5000) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      const element = getElement()
      if (element) return element
    } catch (error) {
      // Element not found yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  throw new Error(`Element not found within ${timeout}ms`)
}

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe')
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Performance testing utilities
export const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

// Local storage mocks
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      }),
      length: Object.keys(store).length,
      key: jest.fn((index: number) => Object.keys(store)[index] || null)
    },
    writable: true
  })
  
  return store
}

// Session storage mocks
export const mockSessionStorage = () => {
  const store: Record<string, string> = {}
  
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      }),
      length: Object.keys(store).length,
      key: jest.fn((index: number) => Object.keys(store)[index] || null)
    },
    writable: true
  })
  
  return store
}

// Error boundary testing
export const TestErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>
  } catch (error) {
    return <div data-testid="error-boundary">Something went wrong</div>
  }
}

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}

// Console utilities for testing
export const suppressConsoleErrors = () => {
  const originalError = console.error
  console.error = jest.fn()
  return () => {
    console.error = originalError
  }
}

export const suppressConsoleWarnings = () => {
  const originalWarn = console.warn
  console.warn = jest.fn()
  return () => {
    console.warn = originalWarn
  }
}

// Test data cleanup
export const cleanupTestData = () => {
  // Clear all mocks
  jest.clearAllMocks()
  
  // Clear local storage
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
    window.sessionStorage.clear()
  }
  
  // Reset fetch mock
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockReset()
  }
}

// Export all utilities
export * from '@testing-library/react'
export * from '@testing-library/user-event'