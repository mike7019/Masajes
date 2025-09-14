import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/forms/BookingForm'
import { useToast } from '@/components/ui'

// Mock the toast hook
jest.mock('@/components/ui', () => ({
  ...jest.requireActual('@/components/ui'),
  useToast: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

const mockAddToast = jest.fn()

const mockServicio = {
  id: '1',
  nombre: 'Masaje Relajante',
  descripcion: 'Un masaje para relajar cuerpo y mente',
  duracion: 60,
  precio: 80,
  activo: true,
  promociones: []
}

const mockFechaHora = new Date('2024-12-15T14:00:00')

const mockProps = {
  servicio: mockServicio,
  fechaHora: mockFechaHora,
  onSuccess: jest.fn(),
  onCancel: jest.fn()
}

describe('BookingForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    })
    
    // Mock successful availability check
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/disponibilidad')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ available: true }),
        })
      }
      if (url.includes('/api/reservas')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: '123', success: true }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    })
  })

  it('renders booking form with service summary', () => {
    render(<BookingForm {...mockProps} />)
    
    expect(screen.getByText('Completa tus Datos')).toBeInTheDocument()
    expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
    expect(screen.getByText('60 minutos')).toBeInTheDocument()
    expect(screen.getByText('$80')).toBeInTheDocument()
  })

  it('renders all required form fields', () => {
    render(<BookingForm {...mockProps} />)
    
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notas adicionales/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirmar reserva/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument()
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...mockProps} />)
    
    const submitButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(submitButton)
    
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Por favor corrige los errores en el formulario'
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...mockProps} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/nombre completo/i), 'María García')
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+1234567890')
    await user.type(screen.getByLabelText(/notas adicionales/i), 'Primera vez')
    
    const submitButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(submitButton)
    
    // Should show confirmation modal
    await waitFor(() => {
      expect(screen.getByText(/confirmar tu reserva/i)).toBeInTheDocument()
    })
  })

  it('handles API errors during submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/reservas')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Horario no disponible' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ available: true }),
      })
    })
    
    render(<BookingForm {...mockProps} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/nombre completo/i), 'María García')
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+1234567890')
    
    const submitButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(submitButton)
    
    // Confirm in modal
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /sí, confirmar/i })
      return user.click(confirmButton)
    })
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error al crear la reserva',
        message: 'Horario no disponible'
      })
    })
  })

  it('shows discounted price when promotion is available', () => {
    const servicioConPromocion = {
      ...mockServicio,
      promociones: [{ descuento: 20 }]
    }
    
    render(<BookingForm {...mockProps} servicio={servicioConPromocion} />)
    
    expect(screen.getByText('$80')).toHaveClass('line-through')
    expect(screen.getByText('$64')).toBeInTheDocument()
  })

  it('calls onCancel when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...mockProps} />)
    
    const backButton = screen.getByRole('button', { name: /volver/i })
    await user.click(backButton)
    
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onSuccess after successful reservation', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...mockProps} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/nombre completo/i), 'María García')
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+1234567890')
    
    const submitButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(submitButton)
    
    // Confirm in modal
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /sí, confirmar/i })
      return user.click(confirmButton)
    })
    
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...mockProps} />)
    
    await user.type(screen.getByLabelText(/nombre completo/i), 'María García')
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/teléfono/i), '+1234567890')
    
    const submitButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(submitButton)
    
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Por favor corrige los errores en el formulario'
    })
  })

  it('shows character count for notes field', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...mockProps} />)
    
    const notesField = screen.getByLabelText(/notas adicionales/i)
    await user.type(notesField, 'Test notes')
    
    expect(screen.getByText('10/500 caracteres')).toBeInTheDocument()
  })
})