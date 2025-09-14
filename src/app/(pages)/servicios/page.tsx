'use client'

import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Loading, ErrorState } from '@/components/ui'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import Link from 'next/link'
import { Servicio } from '@/types'

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios' }
]

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])
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
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Loading size="lg" text="Cargando servicios..." />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <ErrorState 
            title="Error al cargar servicios"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="spa-gradient-hero text-white py-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} className="mb-8 text-white/80" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nuestros Servicios de Masajes
            </h1>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">
              Descubre nuestra amplia gama de <strong>tratamientos terapéuticos profesionales</strong>, 
              diseñados para restaurar tu energía, aliviar el estrés y promover tu bienestar integral.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {servicios.map((servicio) => (
              <ServiceCard key={servicio.id} servicio={servicio} />
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-spa-neutral rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold spa-text-primary text-center mb-8">
              ¿Por Qué Elegir Nuestros Servicios?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-spa-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🎓</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Terapeutas Certificados</h3>
                <p className="text-gray-600">
                  Nuestro equipo cuenta con certificaciones profesionales y más de 10 años de experiencia.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spa-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🌿</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Productos Naturales</h3>
                <p className="text-gray-600">
                  Utilizamos aceites esenciales y productos 100% naturales para tu máximo bienestar.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-spa-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🏠</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Ambiente Relajante</h3>
                <p className="text-gray-600">
                  Espacios diseñados especialmente para crear una atmósfera de paz y tranquilidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 spa-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Tu Sesión de Relajación?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Reserva tu cita hoy mismo y experimenta la diferencia que puede hacer 
            un masaje profesional en tu bienestar físico y mental.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/reservas" className="text-lg px-8 py-4">
                📅 Reservar Mi Cita
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contacto" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-spa-primary">
                💬 Consultar Dudas
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function ServiceCard({ servicio }: { servicio: Servicio }) {
  const benefits = getServiceBenefits(servicio.nombre)
  
  return (
    <Card className="card-hover h-full overflow-hidden">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-spa-primary to-spa-secondary flex items-center justify-center">
          <span className="text-6xl">{getServiceIcon(servicio.nombre)}</span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-semibold spa-text-primary">
            {servicio.duracion} min
          </span>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl">{servicio.nombre}</CardTitle>
        <CardDescription className="text-base">
          {servicio.descripcion}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Beneficios principales:</h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span className="text-gray-600 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-3xl font-bold spa-text-primary">
                ${servicio.precio.toString()}
              </span>
              <span className="text-gray-500 ml-1">/ sesión</span>
            </div>
          </div>
          
          <Button size="lg" className="w-full" asChild>
            <Link href={`/reservas?servicio=${servicio.id}`}>
              Reservar {servicio.nombre}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getServiceIcon(serviceName: string): string {
  const icons: Record<string, string> = {
    'Masaje Relajante': '🧘‍♀️',
    'Masaje Terapéutico': '💆‍♂️',
    'Masaje Deportivo': '🏃‍♂️',
    'Masaje de Piedras Calientes': '🔥'
  }
  return icons[serviceName] || '💆‍♀️'
}

function getServiceBenefits(serviceName: string): string[] {
  const benefits: Record<string, string[]> = {
    'Masaje Relajante': [
      'Reduce el estrés y la ansiedad',
      'Mejora la calidad del sueño',
      'Alivia la tensión muscular leve',
      'Promueve la relajación profunda'
    ],
    'Masaje Terapéutico': [
      'Trata dolores musculares crónicos',
      'Mejora la circulación sanguínea',
      'Reduce contracturas y nudos',
      'Acelera la recuperación muscular'
    ],
    'Masaje Deportivo': [
      'Previene lesiones deportivas',
      'Mejora el rendimiento atlético',
      'Acelera la recuperación post-ejercicio',
      'Aumenta la flexibilidad muscular'
    ],
    'Masaje de Piedras Calientes': [
      'Relajación profunda y duradera',
      'Mejora la circulación sanguínea',
      'Alivia dolores articulares',
      'Experiencia sensorial única'
    ]
  }
  return benefits[serviceName] || ['Bienestar general', 'Relajación', 'Alivio del estrés']
}