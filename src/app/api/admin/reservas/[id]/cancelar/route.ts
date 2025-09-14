import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"
import { enviarEmailCancelacion } from "@/lib/email/templates"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth()
    const { motivo } = await request.json()
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

    if (reserva.estado === 'CANCELADA') {
      return NextResponse.json(
        { error: "La reserva ya está cancelada" },
        { status: 400 }
      )
    }

    // Actualizar estado de la reserva
    const reservaActualizada = await prisma.reserva.update({
      where: { id },
      data: {
        estado: 'CANCELADA',
        notas: motivo ? `${reserva.notas || ''}\n\nMotivo de cancelación: ${motivo}`.trim() : reserva.notas,
      },
      include: {
        servicio: true,
      },
    })

    // Registrar en el historial
    await prisma.reservaHistorial.create({
      data: {
        reservaId: id,
        accion: 'CANCELADA',
        detalles: motivo ? `Reserva cancelada. Motivo: ${motivo}` : 'Reserva cancelada por administrador',
        usuario: session.user.email || 'Admin',
      },
    })

    // Enviar email de cancelación al cliente
    try {
      await enviarEmailCancelacion({
        clienteEmail: reserva.clienteEmail,
        clienteNombre: reserva.clienteNombre,
        servicio: reserva.servicio.nombre,
        fechaHora: reserva.fechaHora,
        motivo: motivo,
      })
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError)
      // No fallar la operación si el email falla
    }

    return NextResponse.json({
      message: "Reserva cancelada exitosamente",
      reserva: reservaActualizada,
    })
  } catch (error) {
    console.error("Error canceling reservation:", error)
    return NextResponse.json(
      { error: "Error al cancelar la reserva" },
      { status: 500 }
    )
  }
}