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

    const historial = await prisma.reservaHistorial.findMany({
      where: { reservaId: id },
      orderBy: { creadoEn: 'desc' },
    })

    return NextResponse.json(historial)
  } catch (error) {
    console.error("Error fetching reservation history:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}