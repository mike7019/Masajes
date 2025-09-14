import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"
import { subDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const limite = parseInt(searchParams.get('limite') || '10')
    const dias = parseInt(searchParams.get('dias') || '7')

    const fechaDesde = subDays(new Date(), dias)

    // Obtener reservas recientes
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

    // Obtener mensajes de contacto recientes (si la tabla existe)
    let contactosRecientes: any[] = []
    try {
      // Verificar si la tabla contacto existe
      contactosRecientes = await prisma.$queryRaw`
        SELECT id, nombre, email, "creadoEn" 
        FROM contacto 
        WHERE "creadoEn" >= ${fechaDesde}
        ORDER BY "creadoEn" DESC 
        LIMIT ${limite}
      `
    } catch (error) {
      // La tabla no existe aún, continuar sin contactos
      contactosRecientes = []
    }

    // Combinar y formatear actividades
    const actividades = [
      ...reservasRecientes.map(reserva => ({
        id: `reserva_${reserva.id}`,
        tipo: 'reserva_creada' as const,
        titulo: 'Nueva reserva creada',
        descripcion: `${reserva.clienteNombre} reservó ${reserva.servicio.nombre}`,
        fechaHora: reserva.creadaEn,
        datos: {
          reservaId: reserva.id,
          clienteNombre: reserva.clienteNombre,
          servicio: reserva.servicio.nombre,
          fechaReserva: reserva.fechaHora,
        },
      })),
      ...contactosRecientes.map((contacto: { id: string; nombre: string; email: string; creadoEn: Date }) => ({
        id: `contacto_${contacto.id}`,
        tipo: 'contacto_recibido' as const,
        titulo: 'Nuevo mensaje de contacto',
        descripcion: `${contacto.nombre} envió un mensaje`,
        fechaHora: contacto.creadoEn,
        datos: {
          contactoId: contacto.id,
          nombre: contacto.nombre,
          email: contacto.email,
        },
      })),
    ]

    // Ordenar por fecha y limitar
    const actividadesOrdenadas = actividades
      .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
      .slice(0, limite)

    return NextResponse.json(actividadesOrdenadas)
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}