import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth()
    const { notas } = await request.json()
    const { id } = await params

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        servicio: true,
      },
    })

    if (!reserva) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    if (reserva.estado === 'COMPLETADA') {
      return NextResponse.json(
        { error: "La reserva ya está completada" },
        { status: 400 }
      )
    }

    if (reserva.estado === 'CANCELADA') {
      return NextResponse.json(
        { error: "No se puede completar una reserva cancelada" },
        { status: 400 }
      )
    }

    // Actualizar estado de la reserva
    const reservaActualizada = await prisma.reserva.update({
      where: { id },
      data: {
        estado: 'COMPLETADA',
        notas: notas ? `${reserva.notas || ''}\n\nNotas de finalización: ${notas}`.trim() : reserva.notas,
      },
      include: {
        servicio: true,
      },
    })

    // Registrar en el historial
    await prisma.reservaHistorial.create({
      data: {
        reservaId: id,
        accion: 'COMPLETADA',
        detalles: notas ? `Reserva completada. Notas: ${notas}` : 'Reserva marcada como completada',
        usuario: session.user.email || 'Admin',
      },
    })

    return NextResponse.json({
      message: "Reserva completada exitosamente",
      reserva: reservaActualizada,
    })
  } catch (error) {
    console.error("Error completing reservation:", error)
    return NextResponse.json(
      { error: "Error al completar la reserva" },
      { status: 500 }
    )
  }
}