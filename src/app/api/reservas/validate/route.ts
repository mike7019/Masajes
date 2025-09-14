import { NextRequest, NextResponse } from 'next/server'
import { validateReservaData } from '@/lib/validation/reserva'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate basic data structure
    const validation = validateReservaData(body)
    if (!validation.success) {
      return NextResponse.json({
        valid: false,
        errors: validation.error.issues.map(e => ({
          field: e.path[0],
          message: e.message
        }))
      })
    }

    const { clienteNombre, clienteEmail, clienteTelefono, servicioId, fechaHora } = validation.data
    const warnings = []
    const suggestions = []

    // Check if service exists and is active
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId }
    })

    if (!servicio) {
      return NextResponse.json({
        valid: false,
        errors: [{ field: 'servicioId', message: 'Servicio no encontrado' }]
      })
    }

    if (!servicio.activo) {
      return NextResponse.json({
        valid: false,
        errors: [{ field: 'servicioId', message: 'Servicio no disponible actualmente' }]
      })
    }

    // Check availability
    const dayOfWeek = fechaHora.getDay()
    const disponibilidad = await prisma.disponibilidad.findFirst({
      where: {
        diaSemana: dayOfWeek,
        activo: true
      }
    })

    if (!disponibilidad) {
      return NextResponse.json({
        valid: false,
        errors: [{ field: 'fechaHora', message: 'No hay atención este día de la semana' }]
      })
    }

    // Check business hours
    const requestedHour = fechaHora.getHours()
    const requestedMinute = fechaHora.getMinutes()
    const requestedTimeInMinutes = requestedHour * 60 + requestedMinute

    const [startHour, startMinute] = disponibilidad.horaInicio.split(':').map(Number)
    const [endHour, endMinute] = disponibilidad.horaFin.split(':').map(Number)
    const startTimeInMinutes = startHour * 60 + startMinute
    const endTimeInMinutes = endHour * 60 + endMinute

    if (requestedTimeInMinutes < startTimeInMinutes) {
      return NextResponse.json({
        valid: false,
        errors: [{ 
          field: 'fechaHora', 
          message: `El horario de atención inicia a las ${disponibilidad.horaInicio}` 
        }]
      })
    }

    if (requestedTimeInMinutes + servicio.duracion > endTimeInMinutes) {
      return NextResponse.json({
        valid: false,
        errors: [{ 
          field: 'fechaHora', 
          message: `No hay tiempo suficiente antes del cierre (${disponibilidad.horaFin})` 
        }]
      })
    }

    // Check for conflicts
    const conflictingReserva = await prisma.reserva.findFirst({
      where: {
        fechaHora: fechaHora,
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        }
      }
    })

    if (conflictingReserva) {
      return NextResponse.json({
        valid: false,
        errors: [{ 
          field: 'fechaHora', 
          message: 'Este horario ya está ocupado' 
        }]
      })
    }

    // Check for existing customer
    const existingCustomer = await prisma.reserva.findFirst({
      where: {
        OR: [
          { clienteEmail: clienteEmail },
          { clienteTelefono: clienteTelefono }
        ]
      },
      orderBy: {
        creadaEn: 'desc'
      }
    })

    if (existingCustomer) {
      suggestions.push('Cliente recurrente detectado - datos pre-llenados disponibles')
    }

    // Check if it's a peak time
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isPeakHour = requestedHour >= 17 || (requestedHour >= 12 && requestedHour <= 14)
    
    if (isWeekend || isPeakHour) {
      warnings.push('Horario de alta demanda - se recomienda reservar con anticipación')
    }

    // Check if it's very soon
    const hoursUntilAppointment = (fechaHora.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    if (hoursUntilAppointment < 2) {
      warnings.push('Reserva con poca anticipación - confirmaremos disponibilidad por teléfono')
    }

    return NextResponse.json({
      valid: true,
      data: {
        servicio: {
          nombre: servicio.nombre,
          duracion: servicio.duracion,
          precio: servicio.precio
        },
        horarioNegocio: {
          inicio: disponibilidad.horaInicio,
          fin: disponibilidad.horaFin
        }
      },
      warnings,
      suggestions
    })

  } catch (error) {
    console.error('Error validating reservation data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}