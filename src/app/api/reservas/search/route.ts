import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const email = searchParams.get('email')
    const telefono = searchParams.get('telefono')
    const estado = searchParams.get('estado')
    const servicioId = searchParams.get('servicioId')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}

    if (email) {
      where.clienteEmail = {
        contains: email,
        mode: 'insensitive'
      }
    }

    if (telefono) {
      where.clienteTelefono = {
        contains: telefono
      }
    }

    if (estado) {
      if (['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'].includes(estado)) {
        where.estado = estado
      }
    }

    if (servicioId) {
      where.servicioId = servicioId
    }

    if (fechaDesde || fechaHasta) {
      where.fechaHora = {}
      
      if (fechaDesde) {
        const desde = new Date(fechaDesde)
        if (!isNaN(desde.getTime())) {
          where.fechaHora.gte = desde
        }
      }
      
      if (fechaHasta) {
        const hasta = new Date(fechaHasta)
        if (!isNaN(hasta.getTime())) {
          // Add 23:59:59 to include the entire day
          hasta.setHours(23, 59, 59, 999)
          where.fechaHora.lte = hasta
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.reserva.count({ where })

    // Get reservations
    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        servicio: true
      },
      orderBy: {
        fechaHora: 'desc'
      },
      skip,
      take: limit
    })

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      reservas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        email,
        telefono,
        estado,
        servicioId,
        fechaDesde,
        fechaHasta
      }
    })

  } catch (error) {
    console.error('Error searching reservations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}