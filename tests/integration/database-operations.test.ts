import { prisma } from '@/lib/database/prisma'
import { 
  createReservation, 
  getAvailableTimeSlots, 
  updateReservationStatus,
  getReservationsByDate 
} from '@/lib/database/queries'

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    servicio: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    reserva: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    disponibilidad: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Database Operations Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createReservation', () => {
    const mockReservationData = {
      clienteNombre: 'María García',
      clienteEmail: 'maria@example.com',
      clienteTelefono: '+1234567890',
      servicioId: 'service-1',
      fechaHora: new Date('2024-12-15T14:00:00'),
      notas: 'Primera vez'
    }

    const mockServicio = {
      id: 'service-1',
      nombre: 'Masaje Relajante',
      duracion: 60,
      precio: 80,
      activo: true
    }

    it('creates reservation successfully', async () => {
      const mockCreatedReservation = {
        id: 'reservation-123',
        ...mockReservationData,
        estado: 'PENDIENTE',
        creadaEn: new Date()
      }

      ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(mockServicio)
      ;(prisma.reserva.create as jest.Mock).mockResolvedValue(mockCreatedReservation)

      const result = await createReservation(mockReservationData)

      expect(prisma.servicio.findUnique).toHaveBeenCalledWith({
        where: { id: 'service-1' }
      })

      expect(prisma.reserva.create).toHaveBeenCalledWith({
        data: {
          clienteNombre: 'María García',
          clienteEmail: 'maria@example.com',
          clienteTelefono: '+1234567890',
          servicioId: 'service-1',
          fechaHora: mockReservationData.fechaHora,
          notas: 'Primera vez',
          estado: 'PENDIENTE'
        },
        include: {
          servicio: true
        }
      })

      expect(result).toEqual(mockCreatedReservation)
    })

    it('throws error when service not found', async () => {
      ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(createReservation(mockReservationData))
        .rejects.toThrow('Servicio no encontrado')

      expect(prisma.reserva.create).not.toHaveBeenCalled()
    })

    it('throws error when service is inactive', async () => {
      const inactiveService = { ...mockServicio, activo: false }
      ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(inactiveService)

      await expect(createReservation(mockReservationData))
        .rejects.toThrow('Servicio no disponible')

      expect(prisma.reserva.create).not.toHaveBeenCalled()
    })

    it('handles database errors gracefully', async () => {
      ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(mockServicio)
      ;(prisma.reserva.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      await expect(createReservation(mockReservationData))
        .rejects.toThrow('Database error')
    })
  })

  describe('getAvailableTimeSlots', () => {
    const testDate = new Date('2024-12-16') // Monday

    const mockDisponibilidad = [
      {
        diaSemana: 1, // Monday
        horaInicio: '09:00',
        horaFin: '18:00',
        activo: true
      }
    ]

    it('returns available time slots for a date', async () => {
      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue([])

      const result = await getAvailableTimeSlots(testDate)

      expect(prisma.disponibilidad.findMany).toHaveBeenCalledWith({
        where: {
          diaSemana: 1,
          activo: true
        }
      })

      expect(prisma.reserva.findMany).toHaveBeenCalledWith({
        where: {
          fechaHora: {
            gte: expect.any(Date),
            lt: expect.any(Date)
          },
          estado: {
            in: ['PENDIENTE', 'CONFIRMADA']
          }
        },
        include: {
          servicio: true
        }
      })

      expect(result).toContain('09:00')
      expect(result).toContain('10:00')
      expect(result).toContain('17:00')
      expect(result).not.toContain('18:00') // End time not included
    })

    it('excludes reserved time slots', async () => {
      const mockReservas = [
        {
          fechaHora: new Date('2024-12-16T14:00:00'),
          servicio: { duracion: 60 },
          estado: 'CONFIRMADA'
        }
      ]

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservas)

      const result = await getAvailableTimeSlots(testDate)

      expect(result).not.toContain('14:00')
      expect(result).toContain('13:00')
      expect(result).toContain('15:00')
    })

    it('returns empty array for days without availability', async () => {
      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue([])

      const result = await getAvailableTimeSlots(testDate)

      expect(result).toEqual([])
    })

    it('handles overlapping reservations correctly', async () => {
      const mockReservas = [
        {
          fechaHora: new Date('2024-12-16T14:00:00'),
          servicio: { duracion: 90 }, // 1.5 hours
          estado: 'CONFIRMADA'
        }
      ]

      ;(prisma.disponibilidad.findMany as jest.Mock).mockResolvedValue(mockDisponibilidad)
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservas)

      const result = await getAvailableTimeSlots(testDate)

      // Should exclude 14:00 and 15:00 (90 minutes)
      expect(result).not.toContain('14:00')
      expect(result).not.toContain('15:00')
      expect(result).toContain('13:00')
      expect(result).toContain('16:00')
    })
  })

  describe('updateReservationStatus', () => {
    it('updates reservation status successfully', async () => {
      const mockUpdatedReservation = {
        id: 'reservation-123',
        estado: 'CONFIRMADA',
        clienteNombre: 'María García'
      }

      ;(prisma.reserva.update as jest.Mock).mockResolvedValue(mockUpdatedReservation)

      const result = await updateReservationStatus('reservation-123', 'CONFIRMADA')

      expect(prisma.reserva.update).toHaveBeenCalledWith({
        where: { id: 'reservation-123' },
        data: { estado: 'CONFIRMADA' },
        include: {
          servicio: true
        }
      })

      expect(result).toEqual(mockUpdatedReservation)
    })

    it('throws error when reservation not found', async () => {
      ;(prisma.reserva.update as jest.Mock).mockRejectedValue(
        new Error('Record to update not found')
      )

      await expect(updateReservationStatus('nonexistent', 'CONFIRMADA'))
        .rejects.toThrow('Record to update not found')
    })

    it('validates status values', async () => {
      const validStatuses = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA']

      for (const status of validStatuses) {
        ;(prisma.reserva.update as jest.Mock).mockResolvedValue({
          id: 'reservation-123',
          estado: status
        })

        await expect(updateReservationStatus('reservation-123', status as any))
          .resolves.not.toThrow()
      }
    })
  })

  describe('getReservationsByDate', () => {
    const testDate = new Date('2024-12-16')

    it('returns reservations for a specific date', async () => {
      const mockReservations = [
        {
          id: 'reservation-1',
          clienteNombre: 'María García',
          fechaHora: new Date('2024-12-16T14:00:00'),
          estado: 'CONFIRMADA',
          servicio: { nombre: 'Masaje Relajante' }
        },
        {
          id: 'reservation-2',
          clienteNombre: 'Juan Pérez',
          fechaHora: new Date('2024-12-16T16:00:00'),
          estado: 'PENDIENTE',
          servicio: { nombre: 'Masaje Deportivo' }
        }
      ]

      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue(mockReservations)

      const result = await getReservationsByDate(testDate)

      expect(prisma.reserva.findMany).toHaveBeenCalledWith({
        where: {
          fechaHora: {
            gte: expect.any(Date),
            lt: expect.any(Date)
          }
        },
        include: {
          servicio: true
        },
        orderBy: {
          fechaHora: 'asc'
        }
      })

      expect(result).toEqual(mockReservations)
    })

    it('returns empty array when no reservations found', async () => {
      ;(prisma.reserva.findMany as jest.Mock).mockResolvedValue([])

      const result = await getReservationsByDate(testDate)

      expect(result).toEqual([])
    })

    it('filters by date range correctly', async () => {
      await getReservationsByDate(testDate)

      const callArgs = (prisma.reserva.findMany as jest.Mock).mock.calls[0][0]
      const whereClause = callArgs.where.fechaHora

      // Should query for the entire day
      expect(whereClause.gte.getDate()).toBe(testDate.getDate())
      expect(whereClause.gte.getHours()).toBe(0)
      expect(whereClause.gte.getMinutes()).toBe(0)

      expect(whereClause.lt.getDate()).toBe(testDate.getDate() + 1)
      expect(whereClause.lt.getHours()).toBe(0)
      expect(whereClause.lt.getMinutes()).toBe(0)
    })
  })

  describe('transaction handling', () => {
    it('handles database transactions correctly', async () => {
      // Mock transaction
      const mockTransaction = {
        servicio: { findUnique: jest.fn() },
        reserva: { create: jest.fn() }
      }

      ;(prisma as any).$transaction = jest.fn().mockImplementation(async (callback) => {
        return callback(mockTransaction)
      })

      const mockReservationData = {
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        clienteTelefono: '+1234567890',
        servicioId: 'service-1',
        fechaHora: new Date('2024-12-15T14:00:00')
      }

      const mockServicio = {
        id: 'service-1',
        nombre: 'Masaje Relajante',
        activo: true
      }

      const mockCreatedReservation = {
        id: 'reservation-123',
        ...mockReservationData,
        estado: 'PENDIENTE'
      }

      mockTransaction.servicio.findUnique.mockResolvedValue(mockServicio)
      mockTransaction.reserva.create.mockResolvedValue(mockCreatedReservation)

      const result = await createReservation(mockReservationData)

      expect((prisma as any).$transaction).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedReservation)
    })

    it('rolls back transaction on error', async () => {
      ;(prisma as any).$transaction = jest.fn().mockRejectedValue(new Error('Transaction failed'))

      const mockReservationData = {
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        clienteTelefono: '+1234567890',
        servicioId: 'service-1',
        fechaHora: new Date('2024-12-15T14:00:00')
      }

      await expect(createReservation(mockReservationData))
        .rejects.toThrow('Transaction failed')
    })
  })

  describe('data validation', () => {
    it('validates required fields before database operations', async () => {
      const invalidReservationData = {
        clienteNombre: '',
        clienteEmail: 'invalid-email',
        servicioId: '',
        fechaHora: new Date('2024-12-15T14:00:00')
      }

      await expect(createReservation(invalidReservationData as any))
        .rejects.toThrow()

      expect(prisma.reserva.create).not.toHaveBeenCalled()
    })

    it('sanitizes input data', async () => {
      const reservationDataWithWhitespace = {
        clienteNombre: '  María García  ',
        clienteEmail: '  maria@example.com  ',
        clienteTelefono: '  +1234567890  ',
        servicioId: 'service-1',
        fechaHora: new Date('2024-12-15T14:00:00')
      }

      const mockServicio = {
        id: 'service-1',
        nombre: 'Masaje Relajante',
        activo: true
      }

      ;(prisma.servicio.findUnique as jest.Mock).mockResolvedValue(mockServicio)
      ;(prisma.reserva.create as jest.Mock).mockResolvedValue({
        id: 'reservation-123',
        ...reservationDataWithWhitespace,
        estado: 'PENDIENTE'
      })

      await createReservation(reservationDataWithWhitespace)

      const createCall = (prisma.reserva.create as jest.Mock).mock.calls[0][0]
      
      expect(createCall.data.clienteNombre).toBe('María García')
      expect(createCall.data.clienteEmail).toBe('maria@example.com')
      expect(createCall.data.clienteTelefono).toBe('+1234567890')
    })
  })
})