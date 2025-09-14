'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Loading, ErrorState } from '@/components/ui'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import Link from 'next/link'
import { Servicio } from '@/types'

export default function ServicioDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchServicio() {
      try {
        const response = await fetch('/api/servicios')
        if (!response.ok) {
          throw new Error('Error al cargar servicio')
        }
        const servicios = await response.json()
        
        // Find service by slug (convert name to slug format)
        const foundServicio = servicios.find((s: Servicio) => 
          createSlug(s.nombre) === slug
        )
        
        if (!foundServicio) {
          throw new Error('Servicio no encontrado')
        }
        
        setServicio(foundServicio)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchServicio()
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Loading size="lg" text="Cargando servicio..." />
        </div>
      </main>
    )
  }

  if (error || !servicio) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <ErrorState 
            title="Servicio no encontrado"
            message={error || "El servicio que buscas no existe"}
            onRetry={() => window.location.href = '/servicios'}
            retryText="Ver Todos los Servicios"
          />
        </div>
      </main>
    )
  }

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/servicios' },
    { label: servicio.nombre }
  ]

  const serviceDetails = getServiceDetails(servicio.nombre)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="spa-gradient-hero text-white py-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} className="mb-8 text-white/80" />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <span className="text-6xl mr-4">{getServiceIcon(servicio.nombre)}</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {servicio.nombre}
                </h1>
                <p className="text-lg opacity-90">
                  {servicio.descripcion}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{servicio.duracion} min</div>
                <div className="text-sm opacity-80">Duración</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">${servicio.precio.toString()}</div>
                <div className="text-sm opacity-80">Precio por sesión</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">4.9⭐</div>
                <div className="text-sm opacity-80">Calificación promedio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">✨</span>
                    Beneficios Principales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviceDetails.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="text-green-500 mr-3 mt-1">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">🔄</span>
                    ¿Cómo es la Sesión?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceDetails.process.map((step: { title: string; description: string }, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="w-8 h-8 bg-spa-primary text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ideal For */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    Ideal Para
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviceDetails.idealFor.map((item: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <span className="text-spa-primary mr-3">•</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-center">Reservar Ahora</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold spa-text-primary mb-2">
                      ${servicio.precio.toString()}
                    </div>
                    <div className="text-gray-600">por sesión de {servicio.duracion} minutos</div>
                  </div>
                  
                  <Button size="lg" className="w-full" asChild>
                    <Link href={`/reservas?servicio=${servicio.id}`}>
                      📅 Reservar {servicio.nombre}
                    </Link>
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/contacto">
                        💬 Consultar Dudas
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4 text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Cancelación:</span>
                      <span>Hasta 24h antes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span>{servicio.duracion} minutos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Incluye:</span>
                      <span>Toallas y aceites</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">¿Tienes Preguntas?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-spa-primary mr-3">📞</span>
                    <a href="tel:+1234567890" className="text-gray-700 hover:text-spa-primary">
                      +1 (234) 567-890
                    </a>
                  </div>
                  <div className="flex items-center">
                    <span className="text-spa-primary mr-3">📧</span>
                    <a href="mailto:info@tumasajes.com" className="text-gray-700 hover:text-spa-primary">
                      info@tumasajes.com
                    </a>
                  </div>
                  <div className="flex items-start">
                    <span className="text-spa-primary mr-3 mt-1">🕒</span>
                    <div className="text-gray-700 text-sm">
                      <div>Lun - Vie: 9:00 - 18:00</div>
                      <div>Sáb: 10:00 - 16:00</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 spa-bg-neutral">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold spa-text-primary text-center mb-8">
            Otros Servicios que Te Pueden Interesar
          </h2>
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/servicios">
                Ver Todos los Servicios
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9-]/g, '')
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

function getServiceDetails(serviceName: string) {
  const details: Record<string, any> = {
    'Masaje Relajante': {
      benefits: [
        'Reduce significativamente el estrés y la ansiedad',
        'Mejora la calidad del sueño profundo',
        'Alivia la tensión muscular acumulada',
        'Promueve la relajación mental y física',
        'Estimula la liberación de endorfinas',
        'Mejora la circulación sanguínea'
      ],
      process: [
        {
          title: 'Consulta inicial',
          description: 'Evaluamos tus necesidades y preferencias para personalizar la sesión.'
        },
        {
          title: 'Preparación del ambiente',
          description: 'Creamos un ambiente relajante con música suave y aromaterapia.'
        },
        {
          title: 'Técnicas de relajación',
          description: 'Aplicamos movimientos suaves y fluidos para liberar la tensión.'
        },
        {
          title: 'Tiempo de integración',
          description: 'Momentos finales para que tu cuerpo integre los beneficios del masaje.'
        }
      ],
      idealFor: [
        'Personas con estrés laboral',
        'Quienes buscan relajación profunda',
        'Problemas de insomnio',
        'Tensión emocional',
        'Primera experiencia en masajes',
        'Mantenimiento del bienestar'
      ]
    },
    'Masaje Terapéutico': {
      benefits: [
        'Trata dolores musculares crónicos efectivamente',
        'Mejora significativamente la circulación',
        'Reduce contracturas y puntos de tensión',
        'Acelera la recuperación de lesiones',
        'Aumenta la flexibilidad y movilidad',
        'Alivia dolores de espalda y cuello'
      ],
      process: [
        {
          title: 'Evaluación postural',
          description: 'Analizamos tu postura y identificamos áreas problemáticas.'
        },
        {
          title: 'Técnicas de presión profunda',
          description: 'Aplicamos presión controlada para trabajar tejidos profundos.'
        },
        {
          title: 'Liberación de puntos gatillo',
          description: 'Tratamos específicamente nudos y contracturas musculares.'
        },
        {
          title: 'Ejercicios de estiramiento',
          description: 'Incluimos estiramientos para maximizar los beneficios.'
        }
      ],
      idealFor: [
        'Dolores musculares crónicos',
        'Contracturas y nudos musculares',
        'Problemas posturales',
        'Lesiones deportivas en recuperación',
        'Dolor de espalda y cuello',
        'Trabajadores de oficina'
      ]
    },
    'Masaje Deportivo': {
      benefits: [
        'Previene lesiones deportivas efectivamente',
        'Mejora el rendimiento atlético',
        'Acelera la recuperación post-ejercicio',
        'Aumenta la flexibilidad muscular',
        'Reduce la fatiga muscular',
        'Optimiza la preparación pre-competencia'
      ],
      process: [
        {
          title: 'Evaluación del deportista',
          description: 'Analizamos tu actividad deportiva y objetivos específicos.'
        },
        {
          title: 'Calentamiento muscular',
          description: 'Preparamos los músculos con técnicas de activación.'
        },
        {
          title: 'Técnicas deportivas específicas',
          description: 'Aplicamos métodos especializados según tu deporte.'
        },
        {
          title: 'Recuperación y prevención',
          description: 'Enfocamos en la recuperación y prevención de lesiones.'
        }
      ],
      idealFor: [
        'Atletas profesionales y amateur',
        'Personas muy activas físicamente',
        'Preparación pre-competencia',
        'Recuperación post-entrenamiento',
        'Prevención de lesiones',
        'Mejora del rendimiento deportivo'
      ]
    },
    'Masaje de Piedras Calientes': {
      benefits: [
        'Relajación profunda y duradera',
        'Mejora excepcional de la circulación',
        'Alivia dolores articulares profundos',
        'Experiencia sensorial única y placentera',
        'Desintoxicación natural del organismo',
        'Equilibrio energético y mental'
      ],
      process: [
        {
          title: 'Preparación de piedras',
          description: 'Calentamos piedras volcánicas a la temperatura perfecta.'
        },
        {
          title: 'Colocación estratégica',
          description: 'Ubicamos las piedras en puntos energéticos clave.'
        },
        {
          title: 'Masaje con piedras',
          description: 'Combinamos técnicas manuales con el calor terapéutico.'
        },
        {
          title: 'Integración final',
          description: 'Tiempo para que el calor penetre profundamente en los tejidos.'
        }
      ],
      idealFor: [
        'Búsqueda de experiencia única',
        'Estrés severo y agotamiento',
        'Problemas circulatorios',
        'Dolores articulares',
        'Ocasiones especiales',
        'Relajación profunda y duradera'
      ]
    }
  }
  
  return details[serviceName] || details['Masaje Relajante']
}