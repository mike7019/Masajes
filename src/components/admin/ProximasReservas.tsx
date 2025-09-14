"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, User, Phone, Mail } from "lucide-react"

interface Reserva {
  id: string
  clienteNombre: string
  servicio: string
  fechaHora: string
  estado: string
}

interface ProximasReservasProps {
  reservas: Reserva[]
  isLoading?: boolean
}

const estadoColors = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
  COMPLETADA: 'bg-blue-100 text-blue-800',
}

const estadoLabels = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
}

export function ProximasReservas({ reservas, isLoading = false }: ProximasReservasProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Próximas Reservas</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Próximas Reservas</h3>
        <p className="text-sm text-gray-500">Próximas citas programadas</p>
      </div>
      <div className="p-6">
        {reservas.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay reservas próximas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {reserva.clienteNombre}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {reserva.servicio}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(reserva.fechaHora), "PPP 'a las' p", { locale: es })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    estadoColors[reserva.estado as keyof typeof estadoColors]
                  }`}>
                    {estadoLabels[reserva.estado as keyof typeof estadoLabels]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {reservas.length > 0 && (
          <div className="mt-6 text-center">
            <a
              href="/admin/reservas"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ver todas las reservas →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}