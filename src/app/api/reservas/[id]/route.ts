import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { validateReservaData } from '@/lib/validation/reserva'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        servicio: true
      }
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(reserva)
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { estado, notas, fechaHora, servicioId } = body
    const { id } = await params

    // Check if reservation exists
    const existingReserva = await prisma.reserva.findUnique({
      where: { id },
      include: { servicio: true }
    })

    if (!existingReserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (estado !== undefined) {
      if (!['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'].includes(estado)) {
        return NextResponse.json(
          { error: 'Estado inválido' },
          { status: 400 }
        )
      }
      updateData.estado = estado
    }

    if (notas !== undefined) {
      updateData.notas = notas
    }

    if (fechaHora !== undefined) {
      const newFechaHora = new Date(fechaHora)
      
      if (isNaN(newFechaHora.getTime())) {
        return NextResponse.json(
          { error: 'Fecha y hora inválida' },
          { status: 400 }
        )
      }

      // Check if new time slot is available (if different from current)
      if (newFechaHora.getTime() !== existingReserva.fechaHora.getTime()) {
        const conflictingReserva = await prisma.reserva.findFirst({
          where: {
            fechaHora: newFechaHora,
            estado: {
              in: ['PENDIENTE', 'CONFIRMADA']
            },
            id: {
              not: id
            }
          }
        })

        if (conflictingReserva) {
          return NextResponse.json(
            { error: 'El nuevo horario ya está ocupado' },
            { status: 409 }
          )
        }
      }

      updateData.fechaHora = newFechaHora
    }

    if (servicioId !== undefined) {
      const servicio = await prisma.servicio.findUnique({
        where: { id: servicioId, activo: true }
      })

      if (!servicio) {
        return NextResponse.json(
          { error: 'Servicio no encontrado o no disponible' },
          { status: 404 }
        )
      }

      updateData.servicioId = servicioId
    }

    // Update reservation
    const updatedReserva = await prisma.reserva.update({
      where: { id },
      data: updateData,
      include: {
        servicio: true
      }
    })

    return NextResponse.json(updatedReserva)
  } catch (error) {
    console.error('Error updating reservation:', error)
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
    const { id } = await params
    // Check if reservation exists
    const existingReserva = await prisma.reserva.findUnique({
      where: { id }
    })

    if (!existingReserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Soft delete by updating status to CANCELADA
    const canceledReserva = await prisma.reserva.update({
      where: { id },
      data: { estado: 'CANCELADA' },
      include: {
        servicio: true
      }
    })

    return NextResponse.json({
      message: 'Reserva cancelada exitosamente',
      reserva: canceledReserva
    })
  } catch (error) {
    console.error('Error canceling reservation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}