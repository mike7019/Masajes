import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const horarioSchema = z.object({
  diaSemana: z.number().min(0).max(6),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  activo: z.boolean()
})

const horariosArraySchema = z.object({
  horarios: z.array(horarioSchema)
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const horarios = await prisma.disponibilidad.findMany({
      orderBy: {
        diaSemana: 'asc'
      }
    })

    return NextResponse.json(horarios)
  } catch (error) {
    console.error('Error al obtener horarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { horarios } = horariosArraySchema.parse(body)

    // Validar que las horas de inicio sean menores que las de fin
    for (const horario of horarios) {
      if (horario.activo && horario.horaInicio >= horario.horaFin) {
        return NextResponse.json(
          { error: `Día ${horario.diaSemana}: La hora de inicio debe ser anterior a la hora de fin` },
          { status: 400 }
        )
      }
    }

    // Usar transacción para actualizar todos los horarios
    await prisma.$transaction(async (tx) => {
      // Eliminar horarios existentes
      await tx.disponibilidad.deleteMany({})

      // Crear nuevos horarios (solo los activos)
      const horariosActivos = horarios.filter(h => h.activo)
      if (horariosActivos.length > 0) {
        await tx.disponibilidad.createMany({
          data: horariosActivos.map(h => ({
            diaSemana: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            activo: h.activo
          }))
        })
      }
    })

    return NextResponse.json({ message: 'Horarios actualizados correctamente' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar horarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}