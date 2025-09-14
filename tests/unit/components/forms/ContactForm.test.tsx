import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/forms/ContactForm'
import { useToast } from '@/components/ui'

// Mock the toast hook
jest.mock('@/components/ui', () => ({
  ...jest.requireActual('@/components/ui'),
  useToast: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

const mockAddToast = jest.fn()

describe('ContactForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByLabelText(/tipo de consulta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Por favor corrige los errores en el formulario'
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/nombre completo/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+1234567890')
    await user.type(screen.getByLabelText(/asunto/i), 'Consulta sobre masajes')
    await user.type(screen.getByLabelText(/mensaje/i), 'Me gustaría información sobre sus servicios')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          telefono: '+1234567890',
          asunto: 'Consulta sobre masajes',
          mensaje: 'Me gustaría información sobre sus servicios',
          tipoConsulta: 'general'
        })
      })
    })
    
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'success',
      title: '¡Mensaje enviado!',
      message: 'Te responderemos pronto. Revisa tu email.'
    })
  })

  it('handles API errors', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    })
    
    render(<ContactForm />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/nombre completo/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com')
    await user.type(screen.getByLabelText(/asunto/i), 'Test')
    await user.type(screen.getByLabelText(/mensaje/i), 'Test message')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error al enviar mensaje',
        message: 'Server error'
      })
    })
  })

  it('shows success state after submission', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText(/nombre completo/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com')
    await user.type(screen.getByLabelText(/asunto/i), 'Test')
    await user.type(screen.getByLabelText(/mensaje/i), 'Test message')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/¡mensaje enviado!/i)).toBeInTheDocument()
      expect(screen.getByText(/gracias por contactarnos/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }))
    
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Por favor corrige los errores en el formulario'
    })
  })

  it('counts characters in message field', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const messageField = screen.getByLabelText(/mensaje/i)
    await user.type(messageField, 'Test message')
    
    expect(screen.getByText('12/1000 caracteres')).toBeInTheDocument()
  })

  it('allows selecting different consultation types', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const select = screen.getByLabelText(/tipo de consulta/i)
    await user.selectOptions(select, 'reserva')
    
    expect(screen.getByDisplayValue('Información sobre Reservas')).toBeInTheDocument()
  })
})