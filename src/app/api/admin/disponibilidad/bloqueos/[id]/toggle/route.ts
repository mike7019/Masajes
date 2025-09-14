import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const toggleSchema = z.object({
  activo: z.boolean()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { activo } = toggleSchema.parse(body)

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

    // Si se está activando, verificar conflictos
    if (activo) {
      const conflictos = await prisma.horarioBloqueado.findMany({
        where: {
          id: { not: id },
          activo: true,
          OR: [
            {
              AND: [
                { fechaInicio: { lte: bloqueoExistente.fechaFin } },
                { fechaFin: { gte: bloqueoExistente.fechaInicio } }
              ]
            }
          ]
        }
      })

      if (conflictos.length > 0) {
        return NextResponse.json(
          { error: 'No se puede activar: ya existe un bloqueo activo en el período seleccionado' },
          { status: 400 }
        )
      }
    }

    const bloqueoActualizado = await prisma.horarioBloqueado.update({
      where: { id },
      data: { activo }
    })

    return NextResponse.json(bloqueoActualizado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al cambiar estado del bloqueo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}