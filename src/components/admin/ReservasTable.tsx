"use client"

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye, Edit, Trash2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

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
}

interface ReservasTableProps {
  reservas: Reserva[]
  isLoading: boolean
  onVerDetalles: (reserva: Reserva) => void
  onActualizar: () => void
  selectedReservas?: string[]
  onSelectionChange?: (selected: string[]) => void
}

const estadoConfig = {
  PENDIENTE: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  CONFIRMADA: {
    label: 'Confirmada',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  CANCELADA: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  COMPLETADA: {
    label: 'Completada',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
}

export function ReservasTable({ 
  reservas, 
  isLoading, 
  onVerDetalles, 
  onActualizar,
  selectedReservas = [],
  onSelectionChange
}: ReservasTableProps) {
  const cambiarEstado = async (reservaId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/admin/reservas/${reservaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!response.ok) {
        throw new Error('Error al cambiar el estado')
      }

      onActualizar()
    } catch (error) {
      console.error('Error changing status:', error)
      alert('Error al cambiar el estado de la reserva')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange(reservas.map(r => r.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectReserva = (reservaId: string, checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange([...selectedReservas, reservaId])
    } else {
      onSelectionChange(selectedReservas.filter(id => id !== reservaId))
    }
  }

  const isAllSelected = reservas.length > 0 && selectedReservas.length === reservas.length
  const isPartiallySelected = selectedReservas.length > 0 && selectedReservas.length < reservas.length

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                <div className="h-4 bg-gray-200 rounded w-1/8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Reservas ({reservas.length})
        </h3>
      </div>
      
      {reservas.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron reservas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {onSelectionChange && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservas.map((reserva) => {
                const estadoInfo = estadoConfig[reserva.estado]
                const IconoEstado = estadoInfo.icon
                
                return (
                  <tr key={reserva.id} className="hover:bg-gray-50">
                    {onSelectionChange && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReservas.includes(reserva.id)}
                          onChange={(e) => handleSelectReserva(reserva.id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reserva.clienteNombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reserva.clienteEmail}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reserva.clienteTelefono}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reserva.servicio.nombre}</div>
                      <div className="text-sm text-gray-500">{reserva.servicio.duracion} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(reserva.fechaHora), 'PPP', { locale: es })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(reserva.fechaHora), 'p', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <select
                          value={reserva.estado}
                          onChange={(e) => cambiarEstado(reserva.id, e.target.value)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${estadoInfo.color}`}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="CONFIRMADA">Confirmada</option>
                          <option value="COMPLETADA">Completada</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${reserva.servicio.precio.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onVerDetalles(reserva)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {reserva.estado !== 'CANCELADA' && reserva.estado !== 'COMPLETADA' && (
                          <>
                            <button
                              onClick={() => onVerDetalles(reserva)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => cambiarEstado(reserva.id, 'CANCELADA')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Cancelar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}