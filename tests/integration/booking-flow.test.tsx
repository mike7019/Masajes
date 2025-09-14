import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { handlers } from '../utils/mock-handlers'
import { BookingForm } from '@/components/forms/BookingForm'

// Setup MSW server
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Booking Flow Integration', () => {
  it('completes full booking flow successfully', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    // Step 1: Select service
    await waitFor(() => {
      expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Masaje Relajante'))
    
    // Step 2: Select date and time
    const nextButton = screen.getByRole('button', { name: /siguiente/i })
    await user.click(nextButton)
    
    // Wait for calendar to load
    await waitFor(() => {
      expect(screen.getByText(/selecciona fecha y hora/i)).toBeInTheDocument()
    })
    
    // Select a date (assuming calendar component is rendered)
    const dateButton = screen.getByRole('button', { name: /25/i })
    await user.click(dateButton)
    
    // Select a time slot
    const timeSlot = screen.getByRole('button', { name: /10:00/i })
    await user.click(timeSlot)
    
    await user.click(nextButton)
    
    // Step 3: Fill client information
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/teléfono/i), '123456789')
    await user.type(screen.getByLabelText(/notas/i), 'Primera vez')
    
    // Step 4: Confirm booking
    const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(confirmButton)
    
    // Wait for confirmation
    await waitFor(() => {
      expect(screen.getByText(/reserva confirmada/i)).toBeInTheDocument()
    })
    
    // Verify booking details are displayed
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('juan@test.com')).toBeInTheDocument()
    expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
  })

  it('handles service selection validation', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    // Try to proceed without selecting a service
    const nextButton = screen.getByRole('button', { name: /siguiente/i })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/selecciona un servicio/i)).toBeInTheDocument()
    })
  })

  it('handles date and time validation', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    // Select service first
    await waitFor(() => {
      expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Masaje Relajante'))
    
    // Go to date selection
    const nextButton = screen.getByRole('button', { name: /siguiente/i })
    await user.click(nextButton)
    
    // Try to proceed without selecting date/time
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/selecciona fecha y hora/i)).toBeInTheDocument()
    })
  })

  it('handles form validation errors', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    // Complete service and date selection
    await waitFor(() => {
      expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Masaje Relajante'))
    
    let nextButton = screen.getByRole('button', { name: /siguiente/i })
    await user.click(nextButton)
    
    // Select date and time (mocked)
    const dateButton = screen.getByRole('button', { name: /25/i })
    await user.click(dateButton)
    const timeSlot = screen.getByRole('button', { name: /10:00/i })
    await user.click(timeSlot)
    
    await user.click(nextButton)
    
    // Try to submit with invalid data
    await user.type(screen.getByLabelText(/nombre/i), '')
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/teléfono/i), '123')
    
    const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      expect(screen.getByText(/teléfono debe tener/i)).toBeInTheDocument()
    })
  })

  it('handles booking submission errors', async () => {
    // Mock API error
    server.use(
      rest.post('/api/reservas', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }))
      })
    )

    const user = userEvent.setup()
    render(<BookingForm />)

    // Complete the booking flow with valid data
    await waitFor(() => {
      expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Masaje Relajante'))
    
    let nextButton = screen.getByRole('button', { name: /siguiente/i })
    await user.click(nextButton)
    
    const dateButton = screen.getByRole('button', { name: /25/i })
    await user.click(dateButton)
    const timeSlot = screen.getByRole('button', { name: /10:00/i })
    await user.click(timeSlot)
    
    await user.click(nextButton)
    
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez')
    await user.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await user.type(screen.getByLabelText(/teléfono/i), '123456789')
    
    const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i })
    await user.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/error al crear la reserva/i)).toBeInTheDocument()
    })
  })

  it('allows going back to previous steps', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    // Select service
    await waitFor(() => {
      expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Masaje Relajante'))
    
    // Go to date selection
    const nextButton = screen.getByRole('button', { name: /siguiente/i })
    await user.click(nextButton)
    
    // Go back to service selection
    const backButton = screen.getByRole('button', { name: /anterior/i })
    await user.click(backButton)
    
    // Verify we're back at service selection
    expect(screen.getByText('Masaje Relajante')).toBeInTheDocument()
    expect(screen.getByText(/selecciona un servicio/i)).toBeInTheDocument()
  })
})