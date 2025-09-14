import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function GET() {
  try {
    const servicios = await prisma.servicio.findMany({
      where: {
        activo: true
      },
      include: {
        promociones: {
          where: {
            activa: true,
            fechaInicio: {
              lte: new Date()
            },
            fechaFin: {
              gte: new Date()
            }
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json(servicios)
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}