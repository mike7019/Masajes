'use client'

import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Loading, ErrorState } from '@/components/ui'
import { PromotionBadge, calculateDiscountedPrice, formatPrice } from '@/components/ui/PromotionBadge'
import Link from 'next/link'
import { ServicioConPromociones } from '@/types'

export function ServicesPreview() {
  const [servicios, setServicios] = useState<ServicioConPromociones[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchServicios() {
      try {
        const response = await fetch('/api/servicios')
        if (!response.ok) {
          throw new Error('Error al cargar servicios')
        }
        const data = await response.json()
        setServicios(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchServicios()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Loading size="lg" text="Cargando servicios..." />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ErrorState 
            title="Error al cargar servicios"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white" id="servicios">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold spa-text-primary mb-4">
            Nuestros Servicios de Masajes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Ofrecemos una amplia gama de <strong>tratamientos terapéuticos</strong> diseñados 
            para restaurar tu energía y promover tu <em>bienestar integral</em>. 
            Cada sesión está personalizada según tus necesidades específicas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {servicios.map((servicio) => (
            <Card key={servicio.id} className="card-hover h-full relative overflow-hidden">
              {servicio.promociones.length > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <PromotionBadge promocion={servicio.promociones[0]} />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{servicio.nombre}</CardTitle>
                <CardDescription>{servicio.duracion} minutos</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 mb-4 flex-1">
                  {servicio.descripcion}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    {servicio.promociones.length > 0 ? (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ${servicio.precio.toString()}
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(calculateDiscountedPrice(Number(servicio.precio), Number(servicio.promociones[0].descuento)))}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold spa-text-primary">
                        ${servicio.precio.toString()}
                      </span>
                    )}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/reservas?servicio=${servicio.id}`}>
                      Reservar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/servicios">
              Ver Todos los Servicios
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}