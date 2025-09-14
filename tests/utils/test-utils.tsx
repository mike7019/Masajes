import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

// Mock session data
const mockSession = {
  user: {
    id: '1',
    email: 'admin@test.com',
    name: 'Test Admin',
  },
  expires: '2024-12-31',
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const mockServicio = {
  id: '1',
  nombre: 'Masaje Relajante',
  descripcion: 'Un masaje para relajar todo el cuerpo',
  duracion: 60,
  precio: 50.00,
  activo: true,
  creadoEn: new Date('2024-01-01'),
}

export const mockReserva = {
  id: '1',
  clienteNombre: 'Juan Pérez',
  clienteEmail: 'juan@test.com',
  clienteTelefono: '123456789',
  servicioId: '1',
  fechaHora: new Date('2024-12-25T10:00:00Z'),
  estado: 'PENDIENTE' as const,
  notas: 'Primera vez',
  creadaEn: new Date('2024-01-01'),
  servicio: mockServicio,
}

export const mockDisponibilidad = {
  id: '1',
  diaSemana: 1, // Monday
  horaInicio: '09:00',
  horaFin: '18:00',
  activo: true,
}

// Helper functions for testing
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const createMockFormData = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}