import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const createBlockedHourSchema = z.object({
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  motivo: z.string().min(1, 'El motivo es requerido'),
  descripcion: z.string().optional()
})

const updateBlockedHourSchema = z.object({
  id: z.string(),
  fechaInicio: z.string().datetime().optional(),
  fechaFin: z.string().datetime().optional(),
  motivo: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  activo: z.boolean().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const activo = searchParams.get('activo')

    const where: any = {}

    if (startDate && endDate) {
      where.OR = [
        {
          fechaInicio: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        {
          fechaFin: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        {
          AND: [
            { fechaInicio: { lte: new Date(startDate) } },
            { fechaFin: { gte: new Date(endDate) } }
          ]
        }
      ]
    }

    if (activo !== null) {
      where.activo = activo === 'true'
    }

    const horariosBloquedos = await prisma.horarioBloqueado.findMany({
      where,
      orderBy: { fechaInicio: 'asc' }
    })

    return NextResponse.json(horariosBloquedos)
  } catch (error) {
    console.error('Error fetching blocked hours:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBlockedHourSchema.parse(body)

    // Validate that end date is after start date
    const startDate = new Date(validatedData.fechaInicio)
    const endDate = new Date(validatedData.fechaFin)

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      )
    }

    // Check for overlapping blocked hours
    const overlapping = await prisma.horarioBloqueado.findFirst({
      where: {
        activo: true,
        OR: [
          {
            AND: [
              { fechaInicio: { lte: startDate } },
              { fechaFin: { gt: startDate } }
            ]
          },
          {
            AND: [
              { fechaInicio: { lt: endDate } },
              { fechaFin: { gte: endDate } }
            ]
          },
          {
            AND: [
              { fechaInicio: { gte: startDate } },
              { fechaFin: { lte: endDate } }
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json(
        { error: 'Ya existe un bloqueo de horario que se superpone con el período seleccionado' },
        { status: 400 }
      )
    }

    const horarioBloqueado = await prisma.horarioBloqueado.create({
      data: {
        fechaInicio: startDate,
        fechaFin: endDate,
        motivo: validatedData.motivo,
        descripcion: validatedData.descripcion
      }
    })

    return NextResponse.json(horarioBloqueado, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating blocked hour:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateBlockedHourSchema.parse(body)

    const { id, ...updateData } = validatedData

    // Check if the blocked hour exists
    const existing = await prisma.horarioBloqueado.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Horario bloqueado no encontrado' },
        { status: 404 }
      )
    }

    // If updating dates, validate them
    if (updateData.fechaInicio || updateData.fechaFin) {
      const startDate = updateData.fechaInicio ? new Date(updateData.fechaInicio) : existing.fechaInicio
      const endDate = updateData.fechaFin ? new Date(updateData.fechaFin) : existing.fechaFin

      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
          { status: 400 }
        )
      }

      // Check for overlapping blocked hours (excluding current one)
      const overlapping = await prisma.horarioBloqueado.findFirst({
        where: {
          id: { not: id },
          activo: true,
          OR: [
            {
              AND: [
                { fechaInicio: { lte: startDate } },
                { fechaFin: { gt: startDate } }
              ]
            },
            {
              AND: [
                { fechaInicio: { lt: endDate } },
                { fechaFin: { gte: endDate } }
              ]
            },
            {
              AND: [
                { fechaInicio: { gte: startDate } },
                { fechaFin: { lte: endDate } }
              ]
            }
          ]
        }
      })

      if (overlapping) {
        return NextResponse.json(
          { error: 'Ya existe un bloqueo de horario que se superpone con el período seleccionado' },
          { status: 400 }
        )
      }
    }

    const updatedData: any = {}
    if (updateData.fechaInicio) updatedData.fechaInicio = new Date(updateData.fechaInicio)
    if (updateData.fechaFin) updatedData.fechaFin = new Date(updateData.fechaFin)
    if (updateData.motivo) updatedData.motivo = updateData.motivo
    if (updateData.descripcion !== undefined) updatedData.descripcion = updateData.descripcion
    if (updateData.activo !== undefined) updatedData.activo = updateData.activo

    const horarioBloqueado = await prisma.horarioBloqueado.update({
      where: { id },
      data: updatedData
    })

    return NextResponse.json(horarioBloqueado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating blocked hour:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const existing = await prisma.horarioBloqueado.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Horario bloqueado no encontrado' },
        { status: 404 }
      )
    }

    await prisma.horarioBloqueado.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Horario bloqueado eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting blocked hour:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}