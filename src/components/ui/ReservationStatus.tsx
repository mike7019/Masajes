import { EstadoReserva } from '@/types'
import { cn } from '@/lib/utils/cn'

interface ReservationStatusProps {
  estado: EstadoReserva
  className?: string
  showText?: boolean
}

export function ReservationStatus({ estado, className, showText = true }: ReservationStatusProps) {
  const getStatusConfig = (estado: EstadoReserva) => {
    switch (estado) {
      case 'PENDIENTE':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
          text: 'Pendiente'
        }
      case 'CONFIRMADA':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅',
          text: 'Confirmada'
        }
      case 'CANCELADA':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌',
          text: 'Cancelada'
        }
      case 'COMPLETADA':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '🎉',
          text: 'Completada'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓',
          text: 'Desconocido'
        }
    }
  }

  const config = getStatusConfig(estado)

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.color,
      className
    )}>
      <span className="mr-1">{config.icon}</span>
      {showText && config.text}
    </span>
  )
}

export function getStatusDescription(estado: EstadoReserva): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'Tu reserva está pendiente de confirmación. Te contactaremos pronto.'
    case 'CONFIRMADA':
      return 'Tu reserva está confirmada. Te esperamos en la fecha y hora programada.'
    case 'CANCELADA':
      return 'Esta reserva ha sido cancelada.'
    case 'COMPLETADA':
      return 'Esta sesión ha sido completada. ¡Esperamos que hayas disfrutado!'
    default:
      return 'Estado de reserva desconocido.'
  }
}