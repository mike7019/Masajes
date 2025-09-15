import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const bloqueoSchema = z.object({
  fechaInicio: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida"
  }),
  fechaFin: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de fin inválida"
  }),
  motivo: z.string().min(1, "El motivo es requerido"),
  descripcion: z.string().optional()
}).refine((data) => new Date(data.fechaInicio) <= new Date(data.fechaFin), {
  message: "La fecha de inicio debe ser anterior o igual a la fecha de fin"
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const bloqueos = await prisma.horarioBloqueado.findMany({
      orderBy: [
        { fechaInicio: 'desc' }
      ]
    })

    return NextResponse.json(bloqueos)
  } catch (error) {
    console.error('Error al obtener bloqueos:', error)
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
    const validatedData = bloqueoSchema.parse(body)

    // Verificar si hay conflictos con bloqueos existentes
    const conflictos = await prisma.horarioBloqueado.findMany({
      where: {
        activo: true,
        OR: [
          {
            AND: [
              { fechaInicio: { lte: new Date(validatedData.fechaFin) } },
              { fechaFin: { gte: new Date(validatedData.fechaInicio) } }
            ]
          }
        ]
      }
    })

    if (conflictos.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un bloqueo activo en el período seleccionado' },
        { status: 400 }
      )
    }

    const nuevoBloqueo = await prisma.horarioBloqueado.create({
      data: {
        fechaInicio: new Date(validatedData.fechaInicio),
        fechaFin: new Date(validatedData.fechaFin),
        motivo: validatedData.motivo,
        descripcion: validatedData.descripcion,
        activo: true
      }
    })

    return NextResponse.json(nuevoBloqueo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al crear bloqueo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}