import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ServiceSelector } from '@/components/forms/ServiceSelector'
import { mockServicio } from '../../utils/test-utils'

// Mock the API call
jest.mock('@/lib/database/queries', () => ({
  getServicios: jest.fn().mockResolvedValue([mockServicio]),
}))

describe('ServiceSelector Component', () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<ServiceSelector onSelect={mockOnSelect} />)
    expect(screen.getByText(/cargando servicios/i)).toBeInTheDocument()
  })

  it('renders services after loading', async () => {
    render(<ServiceSelector onSelect={mockOnSelect} />)
    
    await waitFor(() => {
      expect(screen.getByText(mockServicio.nombre)).toBeInTheDocument()
    })
    
    expect(screen.getByText(mockServicio.descripcion)).toBeInTheDocument()
    expect(screen.getByText(`${mockServicio.duracion} min`)).toBeInTheDocument()
    expect(screen.getByText(`$${mockServicio.precio}`)).toBeInTheDocument()
  })

  it('calls onSelect when service is clicked', async () => {
    render(<ServiceSelector onSelect={mockOnSelect} />)
    
    await waitFor(() => {
      expect(screen.getByText(mockServicio.nombre)).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText(mockServicio.nombre))
    expect(mockOnSelect).toHaveBeenCalledWith(mockServicio)
  })

  it('highlights selected service', async () => {
    render(<ServiceSelector onSelect={mockOnSelect} selectedServiceId={mockServicio.id} />)
    
    await waitFor(() => {
      expect(screen.getByText(mockServicio.nombre)).toBeInTheDocument()
    })
    
    const serviceCard = screen.getByText(mockServicio.nombre).closest('div')
    expect(serviceCard).toHaveClass('ring-2', 'ring-blue-500')
  })

  it('handles error state', async () => {
    const { getServicios } = require('@/lib/database/queries')
    getServicios.mockRejectedValueOnce(new Error('Failed to load'))
    
    render(<ServiceSelector onSelect={mockOnSelect} />)
    
    await waitFor(() => {
      expect(screen.getByText(/error al cargar servicios/i)).toBeInTheDocument()
    })
  })

  it('filters inactive services', async () => {
    const inactiveService = { ...mockServicio, id: '2', activo: false }
    const { getServicios } = require('@/lib/database/queries')
    getServicios.mockResolvedValueOnce([mockServicio, inactiveService])
    
    render(<ServiceSelector onSelect={mockOnSelect} />)
    
    await waitFor(() => {
      expect(screen.getByText(mockServicio.nombre)).toBeInTheDocument()
    })
    
    expect(screen.queryByText(inactiveService.nombre)).not.toBeInTheDocument()
  })
})