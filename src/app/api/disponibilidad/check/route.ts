import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { addMinutes, parseISO, isWithinInterval } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fechaHora, duracion } = body

    if (!fechaHora || !duracion) {
      return NextResponse.json(
        { error: 'Fecha/hora y duración son requeridos' },
        { status: 400 }
      )
    }

    const startTime = parseISO(fechaHora)
    const endTime = addMinutes(startTime, duracion)
    const dayOfWeek = startTime.getDay()

    // Check if the day is available
    const dayConfig = await prisma.disponibilidad.findFirst({
      where: {
        diaSemana: dayOfWeek,
        activo: true
      }
    })

    if (!dayConfig) {
      return NextResponse.json({
        available: false,
        reason: 'Día no disponible'
      })
    }

    // Check if the time is within business hours
    const [startHour, startMinute] = dayConfig.horaInicio.split(':').map(Number)
    const [endHour, endMinute] = dayConfig.horaFin.split(':').map(Number)
    
    const businessStart = startHour * 60 + startMinute
    const businessEnd = endHour * 60 + endMinute
    const requestStart = startTime.getHours() * 60 + startTime.getMinutes()
    const requestEnd = endTime.getHours() * 60 + endTime.getMinutes()

    if (requestStart < businessStart || requestEnd > businessEnd) {
      return NextResponse.json({
        available: false,
        reason: 'Fuera del horario de atención'
      })
    }

    // Check for existing reservations
    const existingReservations = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: new Date(startTime.getTime() - (2 * 60 * 60 * 1000)), // 2 hours before
          lte: new Date(endTime.getTime() + (2 * 60 * 60 * 1000))    // 2 hours after
        },
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        }
      },
      include: {
        servicio: true
      }
    })

    const hasConflict = existingReservations.some(reserva => {
      const reservaStart = new Date(reserva.fechaHora)
      const reservaEnd = addMinutes(reservaStart, reserva.servicio.duracion)
      
      return isWithinInterval(startTime, { start: reservaStart, end: reservaEnd }) ||
             isWithinInterval(endTime, { start: reservaStart, end: reservaEnd }) ||
             (startTime <= reservaStart && endTime >= reservaEnd)
    })

    if (hasConflict) {
      return NextResponse.json({
        available: false,
        reason: 'Horario ya reservado'
      })
    }

    // Check for blocked hours
    const blockedHours = await prisma.horarioBloqueado.findMany({
      where: {
        activo: true,
        fechaInicio: {
          lte: endTime
        },
        fechaFin: {
          gte: startTime
        }
      }
    })

    if (blockedHours.length > 0) {
      const blockingReason = blockedHours[0].motivo
      return NextResponse.json({
        available: false,
        reason: `Horario bloqueado: ${blockingReason}`
      })
    }

    // Check if it's in the past
    const now = new Date()
    if (startTime <= now) {
      return NextResponse.json({
        available: false,
        reason: 'No se pueden hacer reservas en el pasado'
      })
    }

    return NextResponse.json({
      available: true,
      reason: 'Horario disponible'
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}