import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    let whereClause: any = {}

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
            nombre: true,
            precio: true,
            duracion: true,
          },
        },
      },
      orderBy: {
        fechaHora: 'desc',
      },
    })

    // Generar CSV
    const headers = [
      'ID',
      'Cliente',
      'Email',
      'Teléfono',
      'Servicio',
      'Fecha',
      'Hora',
      'Duración (min)',
      'Precio',
      'Estado',
      'Notas',
      'Fecha de Creación'
    ]

    const csvRows = [
      headers.join(','),
      ...reservas.map(reserva => [
        reserva.id,
        `"${reserva.clienteNombre}"`,
        reserva.clienteEmail,
        reserva.clienteTelefono,
        `"${reserva.servicio.nombre}"`,
        format(new Date(reserva.fechaHora), 'dd/MM/yyyy', { locale: es }),
        format(new Date(reserva.fechaHora), 'HH:mm', { locale: es }),
        reserva.servicio.duracion,
        reserva.servicio.precio,
        reserva.estado,
        `"${reserva.notas || ''}"`,
        format(new Date(reserva.creadaEn), 'dd/MM/yyyy HH:mm', { locale: es })
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reservas_${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting reservations:", error)
    return NextResponse.json(
      { error: "Error al exportar las reservas" },
      { status: 500 }
    )
  }
}