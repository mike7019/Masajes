import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { diaSemana, horaInicio, horaFin, activo } = body

    // Validate input
    if (typeof diaSemana !== 'number' || diaSemana < 0 || diaSemana > 6) {
      return NextResponse.json(
        { error: 'Día de semana inválido' },
        { status: 400 }
      )
    }

    // Check if record exists
    const existing = await prisma.disponibilidad.findFirst({
      where: { diaSemana }
    })

    let result
    if (existing) {
      // Update existing record
      result = await prisma.disponibilidad.update({
        where: { id: existing.id },
        data: {
          ...(horaInicio && { horaInicio }),
          ...(horaFin && { horaFin }),
          ...(typeof activo === 'boolean' && { activo })
        }
      })
    } else {
      // Create new record
      result = await prisma.disponibilidad.create({
        data: {
          diaSemana,
          horaInicio: horaInicio || '09:00',
          horaFin: horaFin || '18:00',
          activo: activo !== undefined ? activo : true
        }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const disponibilidad = await prisma.disponibilidad.findMany({
      orderBy: { diaSemana: 'asc' }
    })

    return NextResponse.json(disponibilidad)
  } catch (error) {
    console.error('Error fetching disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}