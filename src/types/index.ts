import { Servicio as PrismaServicio, Reserva as PrismaReserva, Disponibilidad as PrismaDisponibilidad, Promocion as PrismaPromocion, HorarioBloqueado as PrismaHorarioBloqueado, EstadoReserva } from '@prisma/client'

// Exportar tipos de Prisma
export type Servicio = PrismaServicio
export type Reserva = PrismaReserva
export type DisponibilidadConfig = PrismaDisponibilidad
export type Promocion = PrismaPromocion
export type HorarioBloqueado = PrismaHorarioBloqueado
export { EstadoReserva }

// Tipos adicionales para la aplicación
export interface ServicioConReservas extends Servicio {
  reservas: Reserva[]
}

export interface ServicioConPromociones extends Servicio {
  promociones: Promocion[]
}

export interface ReservaConServicio extends Reserva {
  servicio: Servicio
}

export enum ErrorCodes {
  HORARIO_NO_DISPONIBLE = 'HORARIO_NO_DISPONIBLE',
  SERVICIO_NO_ENCONTRADO = 'SERVICIO_NO_ENCONTRADO',
  EMAIL_INVALIDO = 'EMAIL_INVALIDO',
  RESERVA_DUPLICADA = 'RESERVA_DUPLICADA'
}