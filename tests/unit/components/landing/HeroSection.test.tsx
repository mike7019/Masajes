import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroSection } from '@/components/landing/HeroSection'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('HeroSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders hero content', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/renueva tu bienestar/i)).toBeInTheDocument()
    expect(screen.getByText(/experimenta la relajación/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reservar ahora/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ver servicios/i })).toBeInTheDocument()
  })

  it('navigates to booking page when "Reservar Ahora" is clicked', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const reservarButton = screen.getByRole('button', { name: /reservar ahora/i })
    await user.click(reservarButton)
    
    expect(mockPush).toHaveBeenCalledWith('/reservas')
  })

  it('navigates to services page when "Ver Servicios" is clicked', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const serviciosButton = screen.getByRole('button', { name: /ver servicios/i })
    await user.click(serviciosButton)
    
    expect(mockPush).toHaveBeenCalledWith('/servicios')
  })

  it('displays key benefits', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/profesionales certificados/i)).toBeInTheDocument()
    expect(screen.getByText(/ambiente relajante/i)).toBeInTheDocument()
    expect(screen.getByText(/reservas online/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<HeroSection />)
    
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeEnabled()
    })
  })

  it('renders background image with proper alt text', () => {
    render(<HeroSection />)
    
    const backgroundImage = screen.getByAltText(/spa ambiente relajante/i)
    expect(backgroundImage).toBeInTheDocument()
  })
})