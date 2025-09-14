import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/database/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth()
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

    return NextResponse.json(reserva)
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth()
    const datos = await request.json()
    const { id } = await params

    const reservaAnterior = await prisma.reserva.findUnique({
      where: { id },
    })

    if (!reservaAnterior) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    const reservaActualizada = await prisma.reserva.update({
      where: { id },
      data: {
        clienteNombre: datos.clienteNombre,
        clienteEmail: datos.clienteEmail,
        clienteTelefono: datos.clienteTelefono,
        fechaHora: datos.fechaHora ? new Date(datos.fechaHora) : undefined,
        estado: datos.estado,
        notas: datos.notas,
      },
      include: {
        servicio: true,
      },
    })

    // Registrar cambios en el historial
    const cambios = []
    if (datos.clienteNombre && datos.clienteNombre !== reservaAnterior.clienteNombre) {
      cambios.push(`Nombre: ${reservaAnterior.clienteNombre} → ${datos.clienteNombre}`)
    }
    if (datos.clienteEmail && datos.clienteEmail !== reservaAnterior.clienteEmail) {
      cambios.push(`Email: ${reservaAnterior.clienteEmail} → ${datos.clienteEmail}`)
    }
    if (datos.clienteTelefono && datos.clienteTelefono !== reservaAnterior.clienteTelefono) {
      cambios.push(`Teléfono: ${reservaAnterior.clienteTelefono} → ${datos.clienteTelefono}`)
    }
    if (datos.fechaHora && new Date(datos.fechaHora).getTime() !== reservaAnterior.fechaHora.getTime()) {
      cambios.push(`Fecha: ${reservaAnterior.fechaHora.toLocaleString()} → ${new Date(datos.fechaHora).toLocaleString()}`)
    }
    if (datos.estado && datos.estado !== reservaAnterior.estado) {
      cambios.push(`Estado: ${reservaAnterior.estado} → ${datos.estado}`)
    }

    if (cambios.length > 0) {
      await prisma.reservaHistorial.create({
        data: {
          reservaId: id,
          accion: 'EDITADA',
          detalles: `Cambios realizados: ${cambios.join(', ')}`,
          usuario: session.user.email || 'Admin',
        },
      })
    }

    return NextResponse.json(reservaActualizada)
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json(
      { error: "Error al actualizar la reserva" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth()
    const { id } = await params

    const reserva = await prisma.reserva.findUnique({
      where: { id },
    })

    if (!reserva) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    // Registrar en el historial antes de eliminar
    await prisma.reservaHistorial.create({
      data: {
        reservaId: id,
        accion: 'ELIMINADA',
        detalles: 'Reserva eliminada por administrador',
        usuario: session.user.email || 'Admin',
      },
    })

    await prisma.reserva.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Reserva eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return NextResponse.json(
      { error: "Error al eliminar la reserva" },
      { status: 500 }
    )
  }
}