"use client"

import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ResumenRapidoProps {
  reservasHoy: number
  reservasPendientes: number
  reservasConfirmadas: number
  reservasCanceladas: number
  isLoading?: boolean
}

export function ResumenRapido({
  reservasHoy,
  reservasPendientes,
  reservasConfirmadas,
  reservasCanceladas,
  isLoading = false
}: ResumenRapidoProps) {
  const items = [
    {
      label: 'Reservas Hoy',
      value: reservasHoy,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Pendientes',
      value: reservasPendientes,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Confirmadas',
      value: reservasConfirmadas,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Canceladas',
      value: reservasCanceladas,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Hoy</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="text-center">
              <div className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}