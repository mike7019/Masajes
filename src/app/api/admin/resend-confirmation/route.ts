import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { sendReservaConfirmation } from '@/lib/email/notifications'

export async function POST(request: NextRequest) {
  try {
    const { reservaId } = await request.json()

    if (!reservaId) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' },
        { status: 400 }
      )
    }

    // Get reservation with service details
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { servicio: true }
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Send confirmation email
    const result = await sendReservaConfirmation(reserva)

    if (result.success) {
      return NextResponse.json({
        message: 'Email de confirmación reenviado exitosamente',
        email: reserva.clienteEmail
      })
    } else {
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error resending confirmation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}