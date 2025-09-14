"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Activity, Calendar, User, Mail, Phone } from 'lucide-react'

interface ActividadItem {
  id: string
  tipo: 'reserva_creada' | 'reserva_cancelada' | 'reserva_confirmada' | 'contacto_recibido'
  titulo: string
  descripcion: string
  fechaHora: Date
  datos?: any
}

interface ActividadRecienteProps {
  isLoading?: boolean
}

export function ActividadReciente({ isLoading = false }: ActividadRecienteProps) {
  const [actividades, setActividades] = useState<ActividadItem[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetchActividades()
  }, [])

  const fetchActividades = async () => {
    try {
      setCargando(true)
      const response = await fetch('/api/admin/actividad-reciente')
      if (response.ok) {
        const data = await response.json()
        setActividades(data)
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setCargando(false)
    }
  }

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'reserva_creada':
        return <Calendar className="h-4 w-4 text-green-600" />
      case 'reserva_cancelada':
        return <Calendar className="h-4 w-4 text-red-600" />
      case 'reserva_confirmada':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'contacto_recibido':
        return <Mail className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getColorFondo = (tipo: string) => {
    switch (tipo) {
      case 'reserva_creada':
        return 'bg-green-50'
      case 'reserva_cancelada':
        return 'bg-red-50'
      case 'reserva_confirmada':
        return 'bg-blue-50'
      case 'contacto_recibido':
        return 'bg-purple-50'
      default:
        return 'bg-gray-50'
    }
  }

  if (isLoading || cargando) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
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
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <p className="text-sm text-gray-500">Últimas acciones en el sistema</p>
      </div>
      <div className="p-6">
        {actividades.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {actividades.map((actividad) => (
              <div key={actividad.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getColorFondo(actividad.tipo)}`}>
                  {getIconoTipo(actividad.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {actividad.titulo}
                  </p>
                  <p className="text-sm text-gray-500">
                    {actividad.descripcion}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(actividad.fechaHora), "PPP 'a las' p", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {actividades.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Ver toda la actividad →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}