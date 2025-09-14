import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { validateReservaData } from '@/lib/validation/reserva'
import { reservationRateLimit, generalApiRateLimit } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = reservationRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    
    // Validate input data
    const validation = validateReservaData(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues.map(e => e.message)
        },
        { status: 400 }
      )
    }

    const { clienteNombre, clienteEmail, clienteTelefono, servicioId, fechaHora, notas } = validation.data

    // Check if service exists
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId, activo: true }
    })

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado o no disponible' },
        { status: 404 }
      )
    }

    // Check if the time slot is available
    const existingReserva = await prisma.reserva.findFirst({
      where: {
        fechaHora: fechaHora,
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        }
      }
    })

    if (existingReserva) {
      return NextResponse.json(
        { error: 'Este horario ya está ocupado. Por favor selecciona otro.' },
        { status: 409 }
      )
    }

    // Check availability for the day
    const dayOfWeek = fechaHora.getDay()
    const disponibilidad = await prisma.disponibilidad.findFirst({
      where: {
        diaSemana: dayOfWeek,
        activo: true
      }
    })

    if (!disponibilidad) {
      return NextResponse.json(
        { error: 'No hay disponibilidad para este día' },
        { status: 400 }
      )
    }

    // Validate time is within business hours
    const reservaHour = fechaHora.getHours()
    const reservaMinute = fechaHora.getMinutes()
    const reservaTimeInMinutes = reservaHour * 60 + reservaMinute

    const [startHour, startMinute] = disponibilidad.horaInicio.split(':').map(Number)
    const [endHour, endMinute] = disponibilidad.horaFin.split(':').map(Number)
    const startTimeInMinutes = startHour * 60 + startMinute
    const endTimeInMinutes = endHour * 60 + endMinute

    if (reservaTimeInMinutes < startTimeInMinutes || 
        reservaTimeInMinutes + servicio.duracion > endTimeInMinutes) {
      return NextResponse.json(
        { error: 'El horario seleccionado está fuera del horario de atención' },
        { status: 400 }
      )
    }

    // Create the reservation
    const reserva = await prisma.reserva.create({
      data: {
        clienteNombre,
        clienteEmail,
        clienteTelefono,
        servicioId,
        fechaHora,
        notas: notas || null,
        estado: 'PENDIENTE'
      },
      include: {
        servicio: true
      }
    })

    // Send email notifications
    try {
      const { sendReservaNotifications } = await import('@/lib/email/notifications')
      const emailResults = await sendReservaNotifications(reserva)
      
      console.log('Email notifications sent:', emailResults)
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError)
      // Don't fail the reservation if email fails
    }

    return NextResponse.json(reserva, { status: 201 })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = generalApiRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        servicio: true
      },
      orderBy: {
        fechaHora: 'desc'
      }
    })

    return NextResponse.json(reservas)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}