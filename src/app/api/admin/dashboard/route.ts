import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const today = new Date()
    const startToday = startOfDay(today)
    const endToday = endOfDay(today)
    const startMonth = startOfMonth(today)
    const endMonth = endOfMonth(today)

    // Reservas de hoy
    const reservasHoy = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: startToday,
          lte: endToday,
        },
      },
      include: {
        servicio: true,
      },
      orderBy: {
        fechaHora: 'asc',
      },
    })

    // Estadísticas por estado para hoy
    const reservasPorEstadoHoy = await prisma.reserva.groupBy({
      by: ['estado'],
      where: {
        fechaHora: {
          gte: startToday,
          lte: endToday,
        },
      },
      _count: {
        estado: true,
      },
    })

    const estadisticasHoy = reservasPorEstadoHoy.reduce((acc, item) => {
      acc[item.estado] = item._count.estado
      return acc
    }, {} as Record<string, number>)

    // Próximas reservas (próximos 7 días)
    const proximasReservas = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: today,
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        servicio: true,
      },
      orderBy: {
        fechaHora: 'asc',
      },
      take: 10,
    })

    // Estadísticas del mes
    const reservasDelMes = await prisma.reserva.count({
      where: {
        fechaHora: {
          gte: startMonth,
          lte: endMonth,
        },
      },
    })

    // Total de clientes únicos
    const totalClientes = await prisma.reserva.groupBy({
      by: ['clienteEmail'],
      _count: {
        clienteEmail: true,
      },
    })

    // Servicios más populares del mes
    const serviciosPopulares = await prisma.reserva.groupBy({
      by: ['servicioId'],
      where: {
        fechaHora: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      _count: {
        servicioId: true,
      },
      orderBy: {
        _count: {
          servicioId: 'desc',
        },
      },
      take: 5,
    })

    // Obtener nombres de servicios
    const serviciosConNombres = await Promise.all(
      serviciosPopulares.map(async (servicio) => {
        const servicioData = await prisma.servicio.findUnique({
          where: { id: servicio.servicioId },
          select: { nombre: true },
        })
        return {
          nombre: servicioData?.nombre || 'Servicio desconocido',
          cantidad: servicio._count.servicioId,
        }
      })
    )

    // Ingresos del mes (estimado)
    const reservasConPrecios = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: startMonth,
          lte: endMonth,
        },
        estado: {
          in: ['CONFIRMADA', 'COMPLETADA'],
        },
      },
      include: {
        servicio: true,
      },
    })

    const ingresosMes = reservasConPrecios.reduce((total, reserva) => {
      return total + Number(reserva.servicio.precio)
    }, 0)

    // Datos del mes anterior para comparación
    const mesAnterior = subMonths(today, 1)
    const startMesAnterior = startOfMonth(mesAnterior)
    const endMesAnterior = endOfMonth(mesAnterior)

    const reservasMesAnterior = await prisma.reserva.count({
      where: {
        fechaHora: {
          gte: startMesAnterior,
          lte: endMesAnterior,
        },
      },
    })

    const clientesMesAnterior = await prisma.reserva.groupBy({
      by: ['clienteEmail'],
      where: {
        fechaHora: {
          gte: startMesAnterior,
          lte: endMesAnterior,
        },
      },
      _count: {
        clienteEmail: true,
      },
    })

    const reservasConPreciosMesAnterior = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: startMesAnterior,
          lte: endMesAnterior,
        },
        estado: {
          in: ['CONFIRMADA', 'COMPLETADA'],
        },
      },
      include: {
        servicio: true,
      },
    })

    const ingresosMesAnterior = reservasConPreciosMesAnterior.reduce((total, reserva) => {
      return total + Number(reserva.servicio.precio)
    }, 0)

    // Reservas de ayer para comparación
    const ayer = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const startAyer = startOfDay(ayer)
    const endAyer = endOfDay(ayer)

    const reservasAyer = await prisma.reserva.count({
      where: {
        fechaHora: {
          gte: startAyer,
          lte: endAyer,
        },
      },
    })

    return NextResponse.json({
      reservasHoy: reservasHoy.length,
      reservasDelMes,
      totalClientes: totalClientes.length,
      ingresosMes,
      tendencias: {
        reservasHoy: reservasAyer,
        reservasDelMes: reservasMesAnterior,
        totalClientes: clientesMesAnterior.length,
        ingresosMes: ingresosMesAnterior,
      },
      estadisticasHoy: {
        reservasPendientes: estadisticasHoy.PENDIENTE || 0,
        reservasConfirmadas: estadisticasHoy.CONFIRMADA || 0,
        reservasCanceladas: estadisticasHoy.CANCELADA || 0,
        reservasCompletadas: estadisticasHoy.COMPLETADA || 0,
      },
      proximasReservas: proximasReservas.map(reserva => ({
        id: reserva.id,
        clienteNombre: reserva.clienteNombre,
        servicio: reserva.servicio.nombre,
        fechaHora: reserva.fechaHora,
        estado: reserva.estado,
      })),
      serviciosPopulares: serviciosConNombres,
      reservasDetalle: reservasHoy.map(reserva => ({
        id: reserva.id,
        clienteNombre: reserva.clienteNombre,
        clienteEmail: reserva.clienteEmail,
        clienteTelefono: reserva.clienteTelefono,
        servicio: reserva.servicio.nombre,
        fechaHora: reserva.fechaHora,
        estado: reserva.estado,
        precio: reserva.servicio.precio,
      })),
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}