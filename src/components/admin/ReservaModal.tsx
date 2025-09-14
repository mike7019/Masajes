"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Edit, 
  Save, 
  CheckCircle, 
  XCircle,
  History
} from 'lucide-react'

interface Reserva {
  id: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  servicio: {
    id: string
    nombre: string
    precio: number
    duracion: number
  }
  fechaHora: string
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'
  notas?: string
  creadaEn: string
  historial?: Array<{
    id: string
    accion: string
    detalles: string
    fechaHora: string
    creadoEn?: string
    usuario: string
  }>
}

interface ReservaModalProps {
  reserva: Reserva
  onClose: () => void
  onActualizar: (reservaId: string, datos: any) => void
  onCancelar: (reservaId: string, motivo?: string) => void
  onCompletar: (reservaId: string, notas?: string) => void
}

export function ReservaModal({ 
  reserva, 
  onClose, 
  onActualizar, 
  onCancelar, 
  onCompletar 
}: ReservaModalProps) {
  const [modoEdicion, setModoEdicion] = useState(false)
  const [datosEdicion, setDatosEdicion] = useState({
    clienteNombre: reserva.clienteNombre,
    clienteEmail: reserva.clienteEmail,
    clienteTelefono: reserva.clienteTelefono,
    fechaHora: reserva.fechaHora,
    notas: reserva.notas || '',
  })
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [notasCompletar, setNotasCompletar] = useState('')
  const [mostrarCancelacion, setMostrarCancelacion] = useState(false)
  const [mostrarCompletar, setMostrarCompletar] = useState(false)
  const [historial, setHistorial] = useState(reserva.historial || [])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Cargar historial de la reserva
    fetchHistorial()
  }, [reserva.id])

  const fetchHistorial = async () => {
    try {
      const response = await fetch(`/api/admin/reservas/${reserva.id}/historial`)
      if (response.ok) {
        const data = await response.json()
        setHistorial(data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleGuardarEdicion = async () => {
    setIsUpdating(true)
    try {
      await onActualizar(reserva.id, datosEdicion)
      setModoEdicion(false)
      setSuccessMessage('Reserva actualizada exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      await fetchHistorial() // Refresh history
    } catch (error) {
      console.error('Error updating reservation:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelarEdicion = () => {
    setDatosEdicion({
      clienteNombre: reserva.clienteNombre,
      clienteEmail: reserva.clienteEmail,
      clienteTelefono: reserva.clienteTelefono,
      fechaHora: reserva.fechaHora,
      notas: reserva.notas || '',
    })
    setModoEdicion(false)
  }

  const handleCancelarReserva = async () => {
    setIsUpdating(true)
    try {
      await onCancelar(reserva.id, motivoCancelacion)
      setMostrarCancelacion(false)
      setSuccessMessage('Reserva cancelada exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      await fetchHistorial() // Refresh history
    } catch (error) {
      console.error('Error canceling reservation:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCompletarReserva = async () => {
    setIsUpdating(true)
    try {
      await onCompletar(reserva.id, notasCompletar)
      setMostrarCompletar(false)
      setSuccessMessage('Reserva marcada como completada')
      setTimeout(() => setSuccessMessage(''), 3000)
      await fetchHistorial() // Refresh history
    } catch (error) {
      console.error('Error completing reservation:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const estadoConfig = {
    PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMADA: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
    CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    COMPLETADA: { label: 'Completada', color: 'bg-blue-100 text-blue-800' },
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles de Reserva
            </h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              estadoConfig[reserva.estado].color
            }`}>
              {estadoConfig[reserva.estado].label}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
              title="Ver historial"
            >
              <History className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del Cliente
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      value={datosEdicion.clienteNombre}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, clienteNombre: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{reserva.clienteNombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  {modoEdicion ? (
                    <input
                      type="email"
                      value={datosEdicion.clienteEmail}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, clienteEmail: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="mt-1 flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`mailto:${reserva.clienteEmail}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                        {reserva.clienteEmail}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  {modoEdicion ? (
                    <input
                      type="tel"
                      value={datosEdicion.clienteTelefono}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, clienteTelefono: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="mt-1 flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`tel:${reserva.clienteTelefono}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                        {reserva.clienteTelefono}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de la reserva */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Detalles de la Reserva
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Servicio</label>
                  <p className="mt-1 text-sm text-gray-900">{reserva.servicio.nombre}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                  {modoEdicion ? (
                    <input
                      type="datetime-local"
                      value={datosEdicion.fechaHora.slice(0, 16)}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, fechaHora: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {format(new Date(reserva.fechaHora), "PPP 'a las' p", { locale: es })}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duración</label>
                  <div className="mt-1 flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{reserva.servicio.duracion} minutos</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <div className="mt-1 flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">${reserva.servicio.precio.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  {modoEdicion ? (
                    <textarea
                      value={datosEdicion.notas}
                      onChange={(e) => setDatosEdicion({ ...datosEdicion, notas: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Notas adicionales..."
                    />
                  ) : (
                    <div className="mt-1 flex items-start">
                      <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-900">
                        {reserva.notas || 'Sin notas adicionales'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historial */}
          {mostrarHistorial && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Cambios</h3>
              {historial.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {historial.map((entrada) => (
                    <div key={entrada.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {entrada.accion === 'CREADA' && <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>}
                        {entrada.accion === 'EDITADA' && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                        {entrada.accion === 'CANCELADA' && <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>}
                        {entrada.accion === 'COMPLETADA' && <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{entrada.accion}</p>
                        <p className="text-sm text-gray-600">{entrada.detalles}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(entrada.creadoEn || entrada.fechaHora), "PPP 'a las' p", { locale: es })} - {entrada.usuario}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay cambios registrados</p>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {modoEdicion ? (
                  <>
                    <button
                      onClick={handleGuardarEdicion}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdating ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancelarEdicion}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {reserva.estado !== 'CANCELADA' && reserva.estado !== 'COMPLETADA' && (
                      <button
                        onClick={() => setModoEdicion(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {reserva.estado === 'CONFIRMADA' && (
                  <button
                    onClick={() => setMostrarCompletar(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Completada
                  </button>
                )}
                
                {reserva.estado !== 'CANCELADA' && reserva.estado !== 'COMPLETADA' && (
                  <button
                    onClick={() => setMostrarCancelacion(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Reserva
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de cancelación */}
        {mostrarCancelacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cancelar Reserva</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que quieres cancelar esta reserva? Se enviará una notificación al cliente.
              </p>
              <textarea
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Motivo de la cancelación (opcional)"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMostrarCancelacion(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCancelarReserva}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de completar */}
        {mostrarCompletar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Marcar como Completada</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Confirmas que esta reserva ha sido completada exitosamente?
              </p>
              <textarea
                value={notasCompletar}
                onChange={(e) => setNotasCompletar(e.target.value)}
                placeholder="Notas adicionales sobre el servicio (opcional)"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMostrarCompletar(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCompletarReserva}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Completando...' : 'Marcar Completada'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}