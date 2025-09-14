import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function GET() {
  try {
    // Contar registros en cada tabla
    const serviciosCount = await prisma.servicio.count()
    const reservasCount = await prisma.reserva.count()
    const disponibilidadCount = await prisma.disponibilidad.count()

    // Obtener algunos datos de ejemplo
    const servicios = await prisma.servicio.findMany({ take: 3 })
    const disponibilidad = await prisma.disponibilidad.findMany({ take: 3 })

    return NextResponse.json({
      status: 'success',
      message: 'Conexión a base de datos exitosa',
      counts: {
        servicios: serviciosCount,
        reservas: reservasCount,
        disponibilidad: disponibilidadCount
      },
      sampleData: {
        servicios,
        disponibilidad
      }
    })
  } catch (error) {
    console.error('Error de conexión a base de datos:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error de conexión a base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}