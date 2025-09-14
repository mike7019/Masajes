import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/forms/ContactForm'

// Mock the API call
global.fetch = jest.fn()

describe('ContactForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/el mensaje es requerido/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })

  it('validates phone number format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const phoneInput = screen.getByLabelText(/teléfono/i)
    await user.type(phoneInput, '123')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/teléfono debe tener al menos 9 dígitos/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/teléfono/i), '123456789')
    await user.type(screen.getByLabelText(/mensaje/i), 'Hola, me interesa un masaje')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'Juan Pérez',
          email: 'juan@test.com',
          telefono: '123456789',
          mensaje: 'Hola, me interesa un masaje',
        }),
      })
    })
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/teléfono/i), '123456789')
    await user.type(screen.getByLabelText(/mensaje/i), 'Hola, me interesa un masaje')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/mensaje enviado correctamente/i)).toBeInTheDocument()
    })
  })

  it('shows error message on submission failure', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    
    const user = userEvent.setup()
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/teléfono/i), '123456789')
    await user.type(screen.getByLabelText(/mensaje/i), 'Hola, me interesa un masaje')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/error al enviar el mensaje/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/teléfono/i), '123456789')
    await user.type(screen.getByLabelText(/mensaje/i), 'Hola, me interesa un masaje')
    
    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/enviando/i)).toBeInTheDocument()
  })
})