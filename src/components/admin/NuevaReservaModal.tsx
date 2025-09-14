"use client"

import { useState, useEffect } from 'react'
import { X, Calendar, User, Phone, Mail, Clock, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Servicio {
  id: string
  nombre: string
  precio: number
  duracion: number
  descripcion: string
  activo: boolean
}

interface NuevaReservaModalProps {
  onClose: () => void
  onCrear: (datos: any) => void
  fechaInicial?: Date
}

export function NuevaReservaModal({ onClose, onCrear, fechaInicial }: NuevaReservaModalProps) {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [datos, setDatos] = useState({
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    servicioId: '',
    fechaHora: fechaInicial ? format(fechaInicial, "yyyy-MM-dd'T'HH:mm") : '',
    estado: 'CONFIRMADA' as const,
    notas: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchServicios()
  }, [])

  const fetchServicios = async () => {
    try {
      const response = await fetch('/api/servicios')
      if (response.ok) {
        const data = await response.json()
        setServicios(data.filter((s: Servicio) => s.activo))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!datos.clienteNombre.trim()) {
      newErrors.clienteNombre = 'El nombre es requerido'
    }

    if (!datos.clienteEmail.trim()) {
      newErrors.clienteEmail = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(datos.clienteEmail)) {
      newErrors.clienteEmail = 'El email no es válido'
    }

    if (!datos.clienteTelefono.trim()) {
      newErrors.clienteTelefono = 'El teléfono es requerido'
    }

    if (!datos.servicioId) {
      newErrors.servicioId = 'Debe seleccionar un servicio'
    }

    if (!datos.fechaHora) {
      newErrors.fechaHora = 'La fecha y hora son requeridas'
    } else {
      const fechaSeleccionada = new Date(datos.fechaHora)
      if (fechaSeleccionada < new Date()) {
        newErrors.fechaHora = 'La fecha no puede ser en el pasado'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onCrear(datos)
    } catch (error) {
      console.error('Error creating reservation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const servicioSeleccionado = servicios.find(s => s.id === datos.servicioId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Reserva</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información del Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={datos.clienteNombre}
                  onChange={(e) => setDatos({ ...datos, clienteNombre: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.clienteNombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del cliente"
                />
                {errors.clienteNombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.clienteNombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={datos.clienteTelefono}
                  onChange={(e) => setDatos({ ...datos, clienteTelefono: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.clienteTelefono ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+56 9 1234 5678"
                />
                {errors.clienteTelefono && (
                  <p className="text-red-500 text-xs mt-1">{errors.clienteTelefono}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={datos.clienteEmail}
                onChange={(e) => setDatos({ ...datos, clienteEmail: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.clienteEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="cliente@email.com"
              />
              {errors.clienteEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.clienteEmail}</p>
              )}
            </div>
          </div>

          {/* Información de la reserva */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Detalles de la Reserva
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio *
                </label>
                <select
                  value={datos.servicioId}
                  onChange={(e) => setDatos({ ...datos, servicioId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.servicioId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} - ${servicio.precio.toLocaleString()} ({servicio.duracion} min)
                    </option>
                  ))}
                </select>
                {errors.servicioId && (
                  <p className="text-red-500 text-xs mt-1">{errors.servicioId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={datos.estado}
                  onChange={(e) => setDatos({ ...datos, estado: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CONFIRMADA">Confirmada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                value={datos.fechaHora}
                onChange={(e) => setDatos({ ...datos, fechaHora: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.fechaHora ? 'border-red-300' : 'border-gray-300'
                }`}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              />
              {errors.fechaHora && (
                <p className="text-red-500 text-xs mt-1">{errors.fechaHora}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                value={datos.notas}
                onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Notas o comentarios especiales..."
              />
            </div>
          </div>

          {/* Resumen */}
          {servicioSeleccionado && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de la Reserva</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Servicio:</span>
                  <span className="font-medium">{servicioSeleccionado.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span>{servicioSeleccionado.duracion} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio:</span>
                  <span className="font-medium">${servicioSeleccionado.precio.toLocaleString()}</span>
                </div>
                {datos.fechaHora && (
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{format(new Date(datos.fechaHora), "PPP 'a las' p", { locale: es })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}