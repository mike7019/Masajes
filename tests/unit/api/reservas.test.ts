import { NextRequest } from 'next/server'
import { POST } from '@/app/api/reservas/route'
import { prisma } from '@/lib/database/prisma'

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    servicio: {
      findUnique: jest.fn(),
    },
    reserva: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

// Mock email service
jest.mock('@/lib/email', () => ({
  sendReservationConfirmation: jest.fn().mockResolvedValue({ success: true }),
}))

describe('/api/reservas POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const validReservaData = {
    clienteNombre: 'María García',
    clienteEmail: 'maria@example.com',
    clienteTelefono: '+1234567890',
    servicioId: 'service-1',
    fechaHora: '2024-12-15T14:00:00.000Z',
    notas: 'Primera vez'
  }

  const mockServicio = {
    id: 'service-1',
    nombre: 'Masaje Relajante',
    duracion: 60,
    precio: 80,
    activo: true
  }

  it('creates a reservation successfully', async () => {
    const mockReserva = {
      id: 'reservation-1',
      ...validReservaData,
      estado: 'PENDIENTE',
      creadaEn: new Date()
    }

    ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(mockServicio)
    ;(prisma.reserva.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.reserva.create as jest.Mock).mockResolvedValue(mockReserva)

    const request = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      body: JSON.stringify(validReservaData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('reservation-1')
    expect(prisma.reserva.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        servicioId: 'service-1',
      })
    })
  })

  it('returns 400 for invalid data', async () => {
    const invalidData = {
      clienteNombre: '', // Empty name
      clienteEmail: 'invalid-email',
      servicioId: 'service-1',
    }

    const request = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Datos inválidos')
  })

  it('returns 404 for non-existent service', async () => {
    ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      body: JSON.stringify(validReservaData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Servicio no encontrado')
  })

  it('returns 409 for conflicting reservation', async () => {
    const existingReserva = {
      id: 'existing-reservation',
      fechaHora: new Date(validReservaData.fechaHora),
      estado: 'CONFIRMADA'
    }

    ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(mockServicio)
    ;(prisma.reserva.findFirst as jest.Mock).mockResolvedValue(existingReserva)

    const request = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      body: JSON.stringify(validReservaData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Horario no disponible')
  })

  it('returns 400 for past date', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)

    const pastReservaData = {
      ...validReservaData,
      fechaHora: pastDate.toISOString()
    }

    const request = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      body: JSON.stringify(pastReservaData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('fecha debe ser futura')
  })

  it('returns 400 for business hours validation', async () => {
    const outsideBusinessHours = new Date('2024-12-15T22:00:00.000Z') // 10 PM

    const invalidTimeData = {
      ...validReservaData,
      fechaHora: outsideBusinessHours.toISOString()
    }

    const request = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      body: JSON.stringify(invalidTimeData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('horario de atención')
  })

  it('handles database errors gracefully', async () => {
    ;(prisma.servicio.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      body: JSON.stringify(validReservaData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Error interno del servidor')
  })
})