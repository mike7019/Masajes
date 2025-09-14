import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const busqueda = searchParams.get('busqueda')
    const estado = searchParams.get('estado')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const limite = parseInt(searchParams.get('limite') || '50')
    const pagina = parseInt(searchParams.get('pagina') || '1')

    let whereClause: any = {}

    // Filtro de búsqueda
    if (busqueda) {
      whereClause.OR = [
        { clienteNombre: { contains: busqueda, mode: 'insensitive' } },
        { clienteEmail: { contains: busqueda, mode: 'insensitive' } },
        { clienteTelefono: { contains: busqueda } },
      ]
    }

    // Filtro de estado
    if (estado && estado !== 'TODOS') {
      whereClause.estado = estado
    }

    // Filtro de fechas
    if (fechaInicio || fechaFin) {
      whereClause.fechaHora = {}
      if (fechaInicio) {
        whereClause.fechaHora.gte = new Date(fechaInicio)
      }
      if (fechaFin) {
        whereClause.fechaHora.lte = new Date(fechaFin + 'T23:59:59')
      }
    }

    const reservas = await prisma.reserva.findMany({
      where: whereClause,
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            duracion: true,
          },
        },
      },
      orderBy: {
        fechaHora: 'desc',
      },
      take: limite,
      skip: (pagina - 1) * limite,
    })

    // Contar total para paginación
    const total = await prisma.reserva.count({ where: whereClause })

    return NextResponse.json({
      reservas,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    const datos = await request.json()

    const nuevaReserva = await prisma.reserva.create({
      data: {
        clienteNombre: datos.clienteNombre,
        clienteEmail: datos.clienteEmail,
        clienteTelefono: datos.clienteTelefono,
        servicioId: datos.servicioId,
        fechaHora: new Date(datos.fechaHora),
        estado: datos.estado || 'CONFIRMADA',
        notas: datos.notas,
      },
      include: {
        servicio: true,
      },
    })

    // Registrar en el historial
    await prisma.reservaHistorial.create({
      data: {
        reservaId: nuevaReserva.id,
        accion: 'CREADA',
        detalles: 'Reserva creada manualmente por administrador',
        usuario: session.user.email || 'Admin',
      },
    })

    return NextResponse.json(nuevaReserva, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    )
  }
}