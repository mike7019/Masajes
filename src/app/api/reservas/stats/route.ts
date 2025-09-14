import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // day, week, month

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'day':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
    }

    // Basic stats for the period
    const [
      totalReservas,
      reservasPendientes,
      reservasConfirmadas,
      reservasCanceladas,
      reservasCompletadas
    ] = await Promise.all([
      prisma.reserva.count({
        where: {
          fechaHora: { gte: startDate, lte: endDate }
        }
      }),
      prisma.reserva.count({
        where: {
          fechaHora: { gte: startDate, lte: endDate },
          estado: 'PENDIENTE'
        }
      }),
      prisma.reserva.count({
        where: {
          fechaHora: { gte: startDate, lte: endDate },
          estado: 'CONFIRMADA'
        }
      }),
      prisma.reserva.count({
        where: {
          fechaHora: { gte: startDate, lte: endDate },
          estado: 'CANCELADA'
        }
      }),
      prisma.reserva.count({
        where: {
          fechaHora: { gte: startDate, lte: endDate },
          estado: 'COMPLETADA'
        }
      })
    ])

    // Revenue calculation (only for completed reservations)
    const revenueData = await prisma.reserva.findMany({
      where: {
        fechaHora: { gte: startDate, lte: endDate },
        estado: 'COMPLETADA'
      },
      include: {
        servicio: true
      }
    })

    const totalRevenue = revenueData.reduce((sum, reserva) => {
      return sum + Number(reserva.servicio.precio)
    }, 0)

    // Most popular services
    const serviciosPopulares = await prisma.reserva.groupBy({
      by: ['servicioId'],
      where: {
        fechaHora: { gte: startDate, lte: endDate }
      },
      _count: {
        servicioId: true
      },
      orderBy: {
        _count: {
          servicioId: 'desc'
        }
      },
      take: 5
    })

    // Get service details for popular services
    const serviciosConDetalles = await Promise.all(
      serviciosPopulares.map(async (item) => {
        const servicio = await prisma.servicio.findUnique({
          where: { id: item.servicioId }
        })
        return {
          servicio,
          count: item._count.servicioId
        }
      })
    )

    // Daily breakdown for the period
    const dailyStats = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dayStart = startOfDay(currentDate)
      const dayEnd = endOfDay(currentDate)
      
      const dayReservas = await prisma.reserva.count({
        where: {
          fechaHora: { gte: dayStart, lte: dayEnd }
        }
      })
      
      dailyStats.push({
        date: new Date(currentDate),
        count: dayReservas
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Upcoming reservations (next 7 days)
    const upcomingReservas = await prisma.reserva.count({
      where: {
        fechaHora: {
          gte: now,
          lte: endOfDay(subDays(now, -7))
        },
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        }
      }
    })

    // Average reservations per day
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const avgReservasPerDay = daysInPeriod > 0 ? (totalReservas / daysInPeriod).toFixed(1) : 0

    // Cancellation rate
    const cancellationRate = totalReservas > 0 ? ((reservasCanceladas / totalReservas) * 100).toFixed(1) : 0

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalReservas,
        reservasPendientes,
        reservasConfirmadas,
        reservasCanceladas,
        reservasCompletadas,
        upcomingReservas,
        totalRevenue,
        avgReservasPerDay: parseFloat(avgReservasPerDay.toString()),
        cancellationRate: parseFloat(cancellationRate.toString())
      },
      serviciosPopulares: serviciosConDetalles,
      dailyStats,
      trends: {
        // Compare with previous period
        // This could be expanded to show growth rates
      }
    })

  } catch (error) {
    console.error('Error getting reservation stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}