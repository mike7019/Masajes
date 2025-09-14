'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookingForm, BookingErrorBoundary, BookingProgress } from '@/components/forms'
import { Loading, ErrorState } from '@/components/ui'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { ServicioConPromociones } from '@/types'

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Reservas', href: '/reservas' },
  { label: 'Confirmar' }
]

function ConfirmarReservaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [servicio, setServicio] = useState<ServicioConPromociones | null>(null)
  const [fechaHora, setFechaHora] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const servicioId = searchParams.get('servicio')
    const fecha = searchParams.get('fecha')
    const hora = searchParams.get('hora')

    if (!servicioId || !fecha || !hora) {
      setError('Parámetros de reserva incompletos')
      setLoading(false)
      return
    }

    // Parse fecha y hora
    try {
      const fechaObj = new Date(fecha)
      const [hours, minutes] = hora.split(':').map(Number)
      fechaObj.setHours(hours, minutes, 0, 0)
      
      if (isNaN(fechaObj.getTime())) {
        throw new Error('Fecha u hora inválida')
      }
      
      setFechaHora(fechaObj)
    } catch (err) {
      setError('Fecha u hora inválida')
      setLoading(false)
      return
    }

    // Fetch servicio
    fetchServicio(servicioId)
  }, [searchParams])

  const fetchServicio = async (servicioId: string) => {
    try {
      const response = await fetch('/api/servicios')
      if (!response.ok) {
        throw new Error('Error al cargar servicios')
      }
      
      const servicios = await response.json()
      const foundServicio = servicios.find((s: ServicioConPromociones) => s.id === servicioId)
      
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

  const handleSuccess = () => {
    router.push('/reservas/exito')
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Loading size="lg" text="Cargando información de la reserva..." />
        </div>
      </main>
    )
  }

  if (error || !servicio || !fechaHora) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <ErrorState 
            title="Error en la reserva"
            message={error || "Información de reserva incompleta"}
            onRetry={() => router.push('/reservas')}
            retryText="Volver a Reservas"
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold spa-text-primary mb-4">
              Confirmar tu Reserva
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estás a un paso de completar tu reserva. Verifica los detalles y 
              completa tu información de contacto.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <BookingProgress currentStep={3} />
        
        <BookingErrorBoundary>
          <BookingForm
            servicio={servicio}
            fechaHora={fechaHora}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </BookingErrorBoundary>
      </div>
    </main>
  )
}

export default function ConfirmarReservaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Loading size="lg" text="Cargando..." />
        </div>
      </main>
    }>
      <ConfirmarReservaContent />
    </Suspense>
  )
}