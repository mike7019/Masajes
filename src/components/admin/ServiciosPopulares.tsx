"use client"

import { TrendingUp, Star } from "lucide-react"

interface ServicioPopular {
  nombre: string
  cantidad: number
}

interface ServiciosPopularesProps {
  servicios: ServicioPopular[]
  isLoading?: boolean
}

export function ServiciosPopulares({ servicios, isLoading = false }: ServiciosPopularesProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Servicios Populares</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const maxCantidad = Math.max(...servicios.map(s => s.cantidad), 1)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Servicios Populares</h3>
        </div>
        <p className="text-sm text-gray-500">Más solicitados este mes</p>
      </div>
      <div className="p-6">
        {servicios.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay datos de servicios</p>
          </div>
        ) : (
          <div className="space-y-4">
            {servicios.map((servicio, index) => {
              const porcentaje = (servicio.cantidad / maxCantidad) * 100
              return (
                <div key={servicio.nombre} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{servicio.nombre}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {servicio.cantidad}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}