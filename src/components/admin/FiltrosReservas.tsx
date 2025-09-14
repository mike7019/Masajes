"use client"

import { Calendar, X } from 'lucide-react'

interface Filtros {
  busqueda: string
  estado: string
  fechaInicio: string
  fechaFin: string
}

interface FiltrosReservasProps {
  filtros: Filtros
  onFiltrosChange: (filtros: Filtros) => void
}

export function FiltrosReservas({ filtros, onFiltrosChange }: FiltrosReservasProps) {
  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      estado: 'TODOS',
      fechaInicio: '',
      fechaFin: '',
    })
  }

  const tienesFiltrosActivos = 
    filtros.estado !== 'TODOS' || 
    filtros.fechaInicio || 
    filtros.fechaFin

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => onFiltrosChange({ ...filtros, estado: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha desde
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => onFiltrosChange({ ...filtros, fechaInicio: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha hasta
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => onFiltrosChange({ ...filtros, fechaFin: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Botón limpiar */}
        <div className="flex items-end">
          {tienesFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full justify-center"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Filtros activos */}
      {tienesFiltrosActivos && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Filtros activos:</span>
          {filtros.estado !== 'TODOS' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Estado: {filtros.estado}
              <button
                onClick={() => onFiltrosChange({ ...filtros, estado: 'TODOS' })}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filtros.fechaInicio && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Desde: {filtros.fechaInicio}
              <button
                onClick={() => onFiltrosChange({ ...filtros, fechaInicio: '' })}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filtros.fechaFin && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Hasta: {filtros.fechaFin}
              <button
                onClick={() => onFiltrosChange({ ...filtros, fechaFin: '' })}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}