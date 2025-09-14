import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { addDays, startOfDay, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const servicioId = searchParams.get('servicioId')
    const fromDate = searchParams.get('fromDate')
    
    if (!servicioId) {
      return NextResponse.json(
        { error: 'ID de servicio requerido' },
        { status: 400 }
      )
    }

    // Get service details
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId, activo: true }
    })

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Start from provided date or tomorrow
    const startDate = fromDate ? new Date(fromDate) : addDays(new Date(), 1)
    const maxDaysToCheck = 30 // Check up to 30 days ahead

    // Get availability configuration
    const disponibilidad = await prisma.disponibilidad.findMany({
      where: { activo: true },
      orderBy: { diaSemana: 'asc' }
    })

    if (disponibilidad.length === 0) {
      return NextResponse.json({
        available: false,
        message: 'No hay horarios de atención configurados'
      })
    }

    // Check each day
    for (let dayOffset = 0; dayOffset < maxDaysToCheck; dayOffset++) {
      const checkDate = addDays(startOfDay(startDate), dayOffset)
      const dayOfWeek = checkDate.getDay()
      
      // Find availability for this day of week
      const dayAvailability = disponibilidad.find(d => d.diaSemana === dayOfWeek)
      if (!dayAvailability) continue

      // Get existing reservations for this day
      const dayStart = new Date(checkDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(checkDate)
      dayEnd.setHours(23, 59, 59, 999)

      const existingReservas = await prisma.reserva.findMany({
        where: {
          fechaHora: {
            gte: dayStart,
            lte: dayEnd
          },
          estado: {
            in: ['PENDIENTE', 'CONFIRMADA']
          }
        },
        include: {
          servicio: true
        },
        orderBy: {
          fechaHora: 'asc'
        }
      })

      // Generate time slots for this day
      const [startHour, startMinute] = dayAvailability.horaInicio.split(':').map(Number)
      const [endHour, endMinute] = dayAvailability.horaFin.split(':').map(Number)
      
      const startTimeInMinutes = startHour * 60 + startMinute
      const endTimeInMinutes = endHour * 60 + endMinute

      // Check every 30-minute slot
      for (let timeInMinutes = startTimeInMinutes; timeInMinutes + servicio.duracion <= endTimeInMinutes; timeInMinutes += 30) {
        const hour = Math.floor(timeInMinutes / 60)
        const minute = timeInMinutes % 60
        
        const slotDateTime = new Date(checkDate)
        slotDateTime.setHours(hour, minute, 0, 0)

        // Skip if in the past
        if (slotDateTime <= new Date()) continue

        // Check if this slot conflicts with existing reservations
        const slotEndTime = new Date(slotDateTime.getTime() + servicio.duracion * 60000)
        
        let hasConflict = false
        for (const reserva of existingReservas) {
          const reservaEndTime = new Date(reserva.fechaHora.getTime() + reserva.servicio.duracion * 60000)
          
          // Check for overlap
          if (
            (slotDateTime >= reserva.fechaHora && slotDateTime < reservaEndTime) ||
            (slotEndTime > reserva.fechaHora && slotEndTime <= reservaEndTime) ||
            (slotDateTime <= reserva.fechaHora && slotEndTime >= reservaEndTime)
          ) {
            hasConflict = true
            break
          }
        }

        if (!hasConflict) {
          // Found available slot!
          return NextResponse.json({
            available: true,
            nextAvailable: {
              fechaHora: slotDateTime,
              fecha: format(slotDateTime, 'yyyy-MM-dd'),
              hora: format(slotDateTime, 'HH:mm'),
              diaSemana: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][slotDateTime.getDay()],
              servicio: {
                id: servicio.id,
                nombre: servicio.nombre,
                duracion: servicio.duracion,
                precio: servicio.precio
              }
            },
            daysFromNow: dayOffset
          })
        }
      }
    }

    // No availability found in the next 30 days
    return NextResponse.json({
      available: false,
      message: `No hay disponibilidad en los próximos ${maxDaysToCheck} días`,
      suggestion: 'Contacta directamente al spa para horarios especiales'
    })

  } catch (error) {
    console.error('Error finding next available slot:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}