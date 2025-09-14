"use client"

import { useState, useEffect } from 'react'
import { Bell, X, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notificacion {
  id: string
  tipo: 'nueva_reserva' | 'cancelacion' | 'confirmacion'
  titulo: string
  mensaje: string
  fechaHora: Date
  leida: boolean
  datos?: any
}

export function NotificacionesRealTime() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [mostrarPanel, setMostrarPanel] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)

  // Cargar notificaciones iniciales
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Verificar nuevas notificaciones periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewNotifications()
    }, 30000) // Verificar cada 30 segundos

    return () => clearInterval(interval)
  }, [notificaciones])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notificaciones?limite=10')
      if (response.ok) {
        const nuevasNotificaciones = await response.json()
        setNotificaciones(nuevasNotificaciones)
        setNoLeidas(nuevasNotificaciones.filter((n: Notificacion) => !n.leida).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const checkForNewNotifications = async () => {
    try {
      const ultimaNotificacion = notificaciones[0]
      const desde = ultimaNotificacion ? ultimaNotificacion.fechaHora : new Date(Date.now() - 60000)
      
      const response = await fetch(`/api/admin/notificaciones?desde=${desde.toISOString()}&limite=5`)
      if (response.ok) {
        const nuevasNotificaciones = await response.json()
        
        // Filtrar solo las notificaciones realmente nuevas
        const notificacionesNuevas = nuevasNotificaciones.filter((nueva: Notificacion) => 
          !notificaciones.some(existente => existente.id === nueva.id)
        )

        if (notificacionesNuevas.length > 0) {
          setNotificaciones(prev => [...notificacionesNuevas, ...prev.slice(0, 9)])
          setNoLeidas(prev => prev + notificacionesNuevas.length)
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error)
    }
  }

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, leida: true } : notif
      )
    )
    setNoLeidas(prev => Math.max(0, prev - 1))
  }

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev =>
      prev.map(notif => ({ ...notif, leida: true }))
    )
    setNoLeidas(0)
  }

  const eliminarNotificacion = (id: string) => {
    const notificacion = notificaciones.find(n => n.id === id)
    if (notificacion && !notificacion.leida) {
      setNoLeidas(prev => Math.max(0, prev - 1))
    }
    setNotificaciones(prev => prev.filter(notif => notif.id !== id))
  }

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'nueva_reserva':
        return <Calendar className="h-5 w-5 text-green-600" />
      case 'cancelacion':
        return <X className="h-5 w-5 text-red-600" />
      case 'confirmacion':
        return <User className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
      >
        <Bell className="h-6 w-6" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrarPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
              {noLeidas > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notificaciones.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notificacion.leida ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => marcarComoLeida(notificacion.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getIconoTipo(notificacion.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          !notificacion.leida ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notificacion.titulo}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notificacion.mensaje}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(notificacion.fechaHora, "PPP 'a las' p", { locale: es })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          eliminarNotificacion(notificacion.id)
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar el panel */}
      {mostrarPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMostrarPanel(false)}
        />
      )}
    </div>
  )
}