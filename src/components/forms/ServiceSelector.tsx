'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { ServicioConPromociones } from '@/types'
import { calculateDiscountedPrice, formatPrice } from '@/components/ui/PromotionBadge'

interface ServiceSelectorProps {
  servicios: ServicioConPromociones[]
  selectedService: ServicioConPromociones | null
  onServiceSelect: (servicio: ServicioConPromociones) => void
  loading?: boolean
}

export function ServiceSelector({ 
  servicios, 
  selectedService, 
  onServiceSelect, 
  loading = false 
}: ServiceSelectorProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const getServicePrice = (servicio: ServicioConPromociones) => {
    if (servicio.promociones.length > 0) {
      return calculateDiscountedPrice(Number(servicio.precio), Number(servicio.promociones[0].descuento))
    }
    return Number(servicio.precio)
  }

  const getServiceFeatures = (servicio: ServicioConPromociones) => {
    // Default features based on service type
    const baseFeatures = [
      'Profesional certificado',
      'Aceites aromáticos incluidos',
      'Ambiente relajante'
    ]

    // Add specific features based on service name/type
    if (servicio.nombre.toLowerCase().includes('deportivo')) {
      return [...baseFeatures, 'Técnicas de recuperación muscular', 'Ideal para atletas']
    }
    
    if (servicio.nombre.toLowerCase().includes('relajante')) {
      return [...baseFeatures, 'Música relajante', 'Aromaterapia incluida']
    }
    
    if (servicio.nombre.toLowerCase().includes('terapéutico')) {
      return [...baseFeatures, 'Evaluación postural', 'Técnicas especializadas']
    }

    return baseFeatures
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="w-8 h-8 bg-spa-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
              1
            </span>
            Selecciona tu Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <span className="w-8 h-8 bg-spa-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
              1
            </span>
            Selecciona tu Servicio
          </CardTitle>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-spa-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-spa-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Elige el tipo de masaje que mejor se adapte a tus necesidades
        </p>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}>
          {servicios.map(servicio => (
            <div
              key={servicio.id}
              onClick={() => onServiceSelect(servicio)}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedService?.id === servicio.id
                  ? 'border-spa-primary bg-spa-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-spa-primary/50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{servicio.nombre}</h3>
                    {servicio.promociones.length > 0 && (
                      <Badge variant="error" size="sm" className="ml-2">
                        {servicio.promociones[0].descuento.toString()}% OFF
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {servicio.duracion} minutos
                  </div>
                </div>
                <div className="text-right">
                  {servicio.promociones.length > 0 ? (
                    <>
                      <div className="text-sm text-gray-500 line-through">
                        ${servicio.precio.toString()}
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        {formatPrice(getServicePrice(servicio))}
                      </div>
                    </>
                  ) : (
                    <div className="text-xl font-bold spa-text-primary">
                      ${servicio.precio.toString()}
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{servicio.descripcion}</p>
              
              {/* Service features */}
              <div className="space-y-2 mb-4">
                {getServiceFeatures(servicio).slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-spa-sage mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Selection indicator */}
              {selectedService?.id === servicio.id && (
                <div className="flex items-center justify-center mt-4 pt-4 border-t border-spa-primary/20">
                  <div className="flex items-center text-spa-primary font-medium text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Servicio seleccionado
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Service comparison */}
        {selectedService && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              ¿Por qué elegir {selectedService.nombre}?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>Duración:</strong> {selectedService.duracion} minutos de relajación completa
              </div>
              <div>
                <strong>Precio:</strong> {formatPrice(getServicePrice(selectedService))}
                {selectedService.promociones.length > 0 && (
                  <span className="text-red-600 ml-1">
                    (¡Ahorra ${(Number(selectedService.precio) - getServicePrice(selectedService)).toFixed(2)}!)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}