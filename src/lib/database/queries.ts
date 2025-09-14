import { prisma } from './prisma'
import { EstadoReserva } from '@prisma/client'

// Servicios
export async function getServiciosActivos() {
  return await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  })
}

export async function getServicioById(id: string) {
  return await prisma.servicio.findUnique({
    where: { id }
  })
}

// Reservas
export async function createReserva(data: {
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  servicioId: string
  fechaHora: Date
  notas?: string
}) {
  return await prisma.reserva.create({
    data,
    include: {
      servicio: true
    }
  })
}

export async function getReservasByFecha(fecha: Date) {
  const startOfDay = new Date(fecha)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(fecha)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.reserva.findMany({
    where: {
      fechaHora: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      servicio: true
    },
    orderBy: {
      fechaHora: 'asc'
    }
  })
}

export async function updateReservaEstado(id: string, estado: EstadoReserva) {
  return await prisma.reserva.update({
    where: { id },
    data: { estado }
  })
}

// Disponibilidad
export async function getDisponibilidad() {
  return await prisma.disponibilidad.findMany({
    where: { activo: true },
    orderBy: { diaSemana: 'asc' }
  })
}

export async function getDisponibilidadByDia(diaSemana: number) {
  return await prisma.disponibilidad.findFirst({
    where: {
      diaSemana,
      activo: true
    }
  })
}