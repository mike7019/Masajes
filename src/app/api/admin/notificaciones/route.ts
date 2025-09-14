import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"
import { subHours } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const limite = parseInt(searchParams.get('limite') || '10')
    const desde = searchParams.get('desde')

    // Obtener reservas recientes para generar notificaciones
    const fechaDesde = desde ? new Date(desde) : subHours(new Date(), 24)

    const reservasRecientes = await prisma.reserva.findMany({
      where: {
        creadaEn: {
          gte: fechaDesde,
        },
      },
      include: {
        servicio: true,
      },
      orderBy: {
        creadaEn: 'desc',
      },
      take: limite,
    })

    // Convertir reservas a notificaciones
    const notificaciones = reservasRecientes.map(reserva => ({
      id: `reserva_${reserva.id}`,
      tipo: 'nueva_reserva',
      titulo: 'Nueva reserva recibida',
      mensaje: `${reserva.clienteNombre} ha reservado ${reserva.servicio.nombre}`,
      fechaHora: reserva.creadaEn,
      leida: false,
      datos: {
        reservaId: reserva.id,
        clienteNombre: reserva.clienteNombre,
        servicio: reserva.servicio.nombre,
        fechaReserva: reserva.fechaHora,
      },
    }))

    return NextResponse.json(notificaciones)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { accion, notificacionId } = await request.json()

    // Aquí podrías implementar acciones como marcar como leída
    // Por ahora solo retornamos éxito
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}