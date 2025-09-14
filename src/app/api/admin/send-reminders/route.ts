import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { sendBulkReminders } from '@/lib/email/notifications'
import { addDays, startOfDay, endOfDay } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservaIds } = body

    let reservas

    if (reservaIds && reservaIds.length > 0) {
      // Send reminders for specific reservations
      reservas = await prisma.reserva.findMany({
        where: {
          id: {
            in: reservaIds
          },
          estado: {
            in: ['PENDIENTE', 'CONFIRMADA']
          }
        },
        include: {
          servicio: true
        }
      })
    } else {
      // Get reservations for tomorrow (default behavior)
      const tomorrow = addDays(new Date(), 1)
      const startOfTomorrow = startOfDay(tomorrow)
      const endOfTomorrow = endOfDay(tomorrow)

      reservas = await prisma.reserva.findMany({
        where: {
          fechaHora: {
            gte: startOfTomorrow,
            lte: endOfTomorrow
          },
          estado: {
            in: ['PENDIENTE', 'CONFIRMADA']
          }
        },
        include: {
          servicio: true
        }
      })
    }

    if (reservas.length === 0) {
      return NextResponse.json({
        message: reservaIds ? 'No se encontraron reservas válidas' : 'No hay reservas para mañana',
        count: 0
      })
    }

    // Send reminder emails
    const results = await sendBulkReminders(reservas)
    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      message: `Recordatorios enviados: ${successCount}/${reservas.length}`,
      count: successCount,
      total: reservas.length,
      results
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get count of reservations that need reminders
    const tomorrow = addDays(new Date(), 1)
    const startOfTomorrow = startOfDay(tomorrow)
    const endOfTomorrow = endOfDay(tomorrow)

    const count = await prisma.reserva.count({
      where: {
        fechaHora: {
          gte: startOfTomorrow,
          lte: endOfTomorrow
        },
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        }
      }
    })

    return NextResponse.json({
      message: `${count} reservas necesitan recordatorio para mañana`,
      count
    })
  } catch (error) {
    console.error('Error checking reminders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}