import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { eachDayOfInterval, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const inicioParam = searchParams.get('inicio')
    const finParam = searchParams.get('fin')

    if (!inicioParam || !finParam) {
      return NextResponse.json(
        { error: 'Se requieren parámetros inicio y fin' },
        { status: 400 }
      )
    }

    const fechaInicio = new Date(inicioParam)
    const fechaFin = new Date(finParam)

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return NextResponse.json(
        { error: 'Fechas inválidas' },
        { status: 400 }
      )
    }

    // Obtener configuración de horarios de trabajo
    const horariosTrabajoConfig = await prisma.disponibilidad.findMany({
      where: { activo: true }
    })

    // Obtener bloqueos activos en el período
    const bloqueos = await prisma.horarioBloqueado.findMany({
      where: {
        activo: true,
        OR: [
          {
            AND: [
              { fechaInicio: { lte: fechaFin } },
              { fechaFin: { gte: fechaInicio } }
            ]
          }
        ]
      }
    })

    // Obtener reservas en el período
    const reservas = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: fechaInicio,
          lte: fechaFin
        },
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        }
      }
    })

    // Generar disponibilidad para cada día
    const dias = eachDayOfInterval({ start: fechaInicio, end: fechaFin })
    const disponibilidad = dias.map(fecha => {
      const diaSemana = fecha.getDay()
      const fechaStr = format(fecha, 'yyyy-MM-dd')
      
      // Verificar si hay configuración de horario para este día
      const tieneHorarioTrabajo = horariosTrabajoConfig.some(h => h.diaSemana === diaSemana)
      
      // Verificar si está bloqueado
      const estaBloqueado = bloqueos.some(bloqueo => {
        const inicioBloqueo = format(bloqueo.fechaInicio, 'yyyy-MM-dd')
        const finBloqueo = format(bloqueo.fechaFin, 'yyyy-MM-dd')
        return fechaStr >= inicioBloqueo && fechaStr <= finBloqueo
      })

      // Contar reservas del día
      const reservasDelDia = reservas.filter(reserva => 
        format(reserva.fechaHora, 'yyyy-MM-dd') === fechaStr
      ).length

      let disponible = false
      let motivo = ''

      if (estaBloqueado) {
        const bloqueo = bloqueos.find(b => {
          const inicioBloqueo = format(b.fechaInicio, 'yyyy-MM-dd')
          const finBloqueo = format(b.fechaFin, 'yyyy-MM-dd')
          return fechaStr >= inicioBloqueo && fechaStr <= finBloqueo
        })
        disponible = false
        motivo = bloqueo?.motivo || 'Bloqueado'
      } else if (!tieneHorarioTrabajo) {
        disponible = false
        motivo = 'Sin horario configurado'
      } else {
        disponible = true
        motivo = 'Disponible'
      }

      return {
        fecha,
        disponible,
        motivo,
        reservas: reservasDelDia
      }
    })

    return NextResponse.json(disponibilidad)
  } catch (error) {
    console.error('Error al obtener disponibilidad del calendario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}