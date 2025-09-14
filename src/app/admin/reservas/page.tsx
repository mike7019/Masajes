"use client"

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAuth'
import { ReservasTable } from '@/components/admin/ReservasTable'
import { ReservaModal } from '@/components/admin/ReservaModal'
import { NuevaReservaModal } from '@/components/admin/NuevaReservaModal'
import { ReservasBulkActions } from '@/components/admin/ReservasBulkActions'
import { FiltrosReservas } from '@/components/admin/FiltrosReservas'
import { Search, Plus, Filter, Download } from 'lucide-react'

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
    usuario: string
  }>
}

export default function ReservasAdmin() {
  const { session, isLoading: authLoading } = useAdminAuth()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarNuevaReserva, setMostrarNuevaReserva] = useState(false)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'TODOS',
    fechaInicio: '',
    fechaFin: '',
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [selectedReservas, setSelectedReservas] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  const fetchReservas = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda)
      if (filtros.estado !== 'TODOS') params.append('estado', filtros.estado)
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)

      const response = await fetch(`/api/admin/reservas?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar las reservas')
      }

      const data = await response.json()
      // Handle both array response and paginated response
      const reservasData = Array.isArray(data) ? data : data.reservas || []
      setReservas(reservasData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchReservas()
    }
  }, [authLoading, filtros])

  const handleVerDetalles = (reserva: Reserva) => {
    setReservaSeleccionada(reserva)
    setMostrarModal(true)
  }

  const handleActualizarReserva = async (reservaId: string, datos: any) => {
    try {
      const response = await fetch(`/api/admin/reservas/${reservaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la reserva')
      }

      await fetchReservas() // Recargar la lista
      setMostrarModal(false)
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Error al actualizar la reserva')
    }
  }

  const handleCancelarReserva = async (reservaId: string, motivo?: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/reservas/${reservaId}/cancelar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo }),
      })

      if (!response.ok) {
        throw new Error('Error al cancelar la reserva')
      }

      await fetchReservas()
      setMostrarModal(false)
    } catch (error) {
      console.error('Error canceling reservation:', error)
      alert('Error al cancelar la reserva')
    }
  }

  const handleCompletarReserva = async (reservaId: string, notas?: string) => {
    try {
      const response = await fetch(`/api/admin/reservas/${reservaId}/completar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notas }),
      })

      if (!response.ok) {
        throw new Error('Error al completar la reserva')
      }

      await fetchReservas()
      setMostrarModal(false)
    } catch (error) {
      console.error('Error completing reservation:', error)
      alert('Error al completar la reserva')
    }
  }

  const handleCrearReserva = async (datos: any) => {
    try {
      const response = await fetch('/api/admin/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la reserva')
      }

      await fetchReservas()
      setMostrarNuevaReserva(false)
      alert('Reserva creada exitosamente')
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert(error instanceof Error ? error.message : 'Error al crear la reserva')
      throw error
    }
  }

  const handleBulkAction = async (action: string, data?: any) => {
    setIsBulkLoading(true)
    try {
      const promises = selectedReservas.map(async (reservaId) => {
        switch (action) {
          case 'confirm':
            return fetch(`/api/admin/reservas/${reservaId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: 'CONFIRMADA' }),
            })
          case 'complete':
            return fetch(`/api/admin/reservas/${reservaId}/completar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notas: 'Completada en lote' }),
            })
          case 'cancel':
            return fetch(`/api/admin/reservas/${reservaId}/cancelar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ motivo: 'Cancelada en lote' }),
            })
          case 'sendReminder':
            return fetch(`/api/admin/send-reminders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reservaIds: [reservaId] }),
            })
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(promises)
      await fetchReservas()
      setSelectedReservas([])
      alert(`Acción "${action}" completada exitosamente`)
    } catch (error) {
      console.error('Error in bulk action:', error)
      alert('Error al realizar la acción en lote')
    } finally {
      setIsBulkLoading(false)
    }
  }

  const exportarReservas = async () => {
    try {
      const params = new URLSearchParams()
      if (filtros.estado !== 'TODOS') params.append('estado', filtros.estado)
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)

      const response = await fetch(`/api/admin/reservas/exportar?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al exportar las reservas')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting reservations:', error)
      alert('Error al exportar las reservas')
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="text-gray-600">Administra todas las reservas del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportarReservas}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button 
            onClick={() => setMostrarNuevaReserva(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>

        {mostrarFiltros && (
          <FiltrosReservas
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />
        )}
      </div>

      {/* Bulk Actions */}
      <ReservasBulkActions
        selectedReservas={selectedReservas}
        onClearSelection={() => setSelectedReservas([])}
        onBulkAction={handleBulkAction}
        isLoading={isBulkLoading}
      />

      {/* Tabla de reservas */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <ReservasTable
          reservas={reservas}
          isLoading={isLoading}
          onVerDetalles={handleVerDetalles}
          onActualizar={fetchReservas}
          selectedReservas={selectedReservas}
          onSelectionChange={setSelectedReservas}
        />
      )}

      {/* Modal de detalles */}
      {mostrarModal && reservaSeleccionada && (
        <ReservaModal
          reserva={reservaSeleccionada}
          onClose={() => setMostrarModal(false)}
          onActualizar={handleActualizarReserva}
          onCancelar={handleCancelarReserva}
          onCompletar={handleCompletarReserva}
        />
      )}

      {/* Modal de nueva reserva */}
      {mostrarNuevaReserva && (
        <NuevaReservaModal
          onClose={() => setMostrarNuevaReserva(false)}
          onCrear={handleCrearReserva}
        />
      )}
    </div>
  )
}