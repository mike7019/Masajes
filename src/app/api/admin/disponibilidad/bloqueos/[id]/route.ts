import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const bloqueoUpdateSchema = z.object({
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = bloqueoUpdateSchema.parse(body)

    // Verificar que el bloqueo existe
    const bloqueoExistente = await prisma.horarioBloqueado.findUnique({
      where: { id }
    })

    if (!bloqueoExistente) {
      return NextResponse.json(
        { error: 'Bloqueo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar conflictos con otros bloqueos (excluyendo el actual)
    const conflictos = await prisma.horarioBloqueado.findMany({
      where: {
        id: { not: id },
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

    const bloqueoActualizado = await prisma.horarioBloqueado.update({
      where: { id },
      data: {
        fechaInicio: new Date(validatedData.fechaInicio),
        fechaFin: new Date(validatedData.fechaFin),
        motivo: validatedData.motivo,
        descripcion: validatedData.descripcion
      }
    })

    return NextResponse.json(bloqueoActualizado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar bloqueo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el bloqueo existe
    const bloqueoExistente = await prisma.horarioBloqueado.findUnique({
      where: { id }
    })

    if (!bloqueoExistente) {
      return NextResponse.json(
        { error: 'Bloqueo no encontrado' },
        { status: 404 }
      )
    }

    await prisma.horarioBloqueado.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Bloqueo eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar bloqueo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}