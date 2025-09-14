import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function GET() {
  try {
    const disponibilidad = await prisma.disponibilidad.findMany({
      where: {
        activo: true
      },
      orderBy: {
        diaSemana: 'asc'
      }
    })

    return NextResponse.json(disponibilidad)
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}