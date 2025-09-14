import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fecha: string }> }
) {
  try {
    const { fecha } = await params
    
    // Parse the date and create start/end of day
    const startOfDay = new Date(fecha)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(fecha)
    endOfDay.setHours(23, 59, 59, 999)

    const reservas = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: startOfDay,
          lte: endOfDay
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

    return NextResponse.json(reservas)
  } catch (error) {
    console.error('Error al obtener reservas por fecha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}