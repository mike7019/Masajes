import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/disponibilidad/route'
import { prisma } from '@/lib/database/prisma'

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    disponibilidad: {
      findMany: jest.fn(),
    },
    reserva: {
      findMany: jest.fn(),
    },
  },
}))

describe('/api/disponibilidad', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns availability for a specific date', async () => {
      const mockDisponibilidad = [
        { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true }
      ]
      const mockReservas = []

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservas)

      const url = new URL('http://localhost:3000/api/disponibilidad?fecha=2024-12-16') // Monday
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.horariosDisponibles).toBeDefined()
      expect(Array.isArray(data.horariosDisponibles)).toBe(true)
    })

    it('returns empty array for days without availability', async () => {
      const mockDisponibilidad = []
      const mockReservas = []

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservas)

      const url = new URL('http://localhost:3000/api/disponibilidad?fecha=2024-12-15') // Sunday
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.horariosDisponibles).toEqual([])
    })

    it('excludes reserved time slots', async () => {
      const mockDisponibilidad = [
        { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true }
      ]
      const mockReservas = [
        {
          fechaHora: new Date('2024-12-16T14:00:00'),
          servicio: { duracion: 60 },
          estado: 'CONFIRMADA'
        }
      ]

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservas)

      const url = new URL('http://localhost:3000/api/disponibilidad?fecha=2024-12-16')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.horariosDisponibles).not.toContain('14:00')
    })

    it('returns 400 for invalid date format', async () => {
      const url = new URL('http://localhost:3000/api/disponibilidad?fecha=invalid-date')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Fecha inválida')
    })

    it('returns 400 for missing date parameter', async () => {
      const url = new URL('http://localhost:3000/api/disponibilidad')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Fecha requerida')
    })
  })

  describe('POST', () => {
    const validAvailabilityCheck = {
      fecha: '2024-12-16T14:00:00.000Z',
      servicioId: 'service-1',
      duracion: 60
    }

    it('returns available for valid time slot', async () => {
      const mockDisponibilidad = [
        { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true }
      ]
      const mockReservas = []

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservas)

      const request = new NextRequest('http://localhost:3000/api/disponibilidad', {
        method: 'POST',
        body: JSON.stringify(validAvailabilityCheck),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.available).toBe(true)
    })

    it('returns unavailable for conflicting reservation', async () => {
      const mockDisponibilidad = [
        { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true }
      ]
      const mockReservas = [
        {
          fechaHora: new Date('2024-12-16T14:00:00'),
          servicio: { duracion: 60 },
          estado: 'CONFIRMADA'
        }
      ]

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservas)

      const request = new NextRequest('http://localhost:3000/api/disponibilidad', {
        method: 'POST',
        body: JSON.stringify(validAvailabilityCheck),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.available).toBe(false)
      expect(data.error).toBe('Horario no disponible')
    })

    it('returns unavailable for outside business hours', async () => {
      const mockDisponibilidad = [
        { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true }
      ]

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)

      const outsideHoursCheck = {
        ...validAvailabilityCheck,
        fecha: '2024-12-16T20:00:00.000Z' // 8 PM
      }

      const request = new NextRequest('http://localhost:3000/api/disponibilidad', {
        method: 'POST',
        body: JSON.stringify(outsideHoursCheck),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.available).toBe(false)
      expect(data.error).toContain('horario de atención')
    })

    it('returns 400 for invalid request data', async () => {
      const invalidData = {
        fecha: 'invalid-date',
        servicioId: '',
        duracion: -1
      }

      const request = new NextRequest('http://localhost:3000/api/disponibilidad', {
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

    it('handles database errors gracefully', async () => {
      ;(prisma.disponibilidad.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/disponibilidad', {
        method: 'POST',
        body: JSON.stringify(validAvailabilityCheck),
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
})