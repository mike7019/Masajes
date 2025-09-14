import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const estado = searchParams.get('estado')

    let whereClause: any = {}

    if (start && end) {
      whereClause.fechaHora = {
        gte: new Date(start),
        lte: new Date(end),
      }
    }

    if (estado && estado !== 'TODOS') {
      whereClause.estado = estado
    }

    const reservas = await prisma.reserva.findMany({
      where: whereClause,
      include: {
        servicio: true,
      },
      orderBy: {
        fechaHora: 'asc',
      },
    })

    // Formatear para React Big Calendar
    const eventos = reservas.map(reserva => ({
      id: reserva.id,
      title: `${reserva.clienteNombre} - ${reserva.servicio.nombre}`,
      start: reserva.fechaHora,
      end: new Date(reserva.fechaHora.getTime() + reserva.servicio.duracion * 60000),
      resource: {
        reservaId: reserva.id,
        clienteNombre: reserva.clienteNombre,
        clienteEmail: reserva.clienteEmail,
        clienteTelefono: reserva.clienteTelefono,
        servicio: reserva.servicio.nombre,
        estado: reserva.estado,
        precio: reserva.servicio.precio,
        duracion: reserva.servicio.duracion,
        notas: reserva.notas,
      },
    }))

    return NextResponse.json(eventos)
  } catch (error) {
    console.error("Error fetching calendar data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}