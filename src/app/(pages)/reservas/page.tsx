'use client'

import { useState, useEffect } from 'react'
import { CalendarView, TimeSlotPicker } from '@/components/calendar'
import { ServiceSelector, BookingProgress } from '@/components/forms'
import { Button, Card, CardContent, CardHeader, CardTitle, Loading, ErrorState } from '@/components/ui'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { ServicioConPromociones } from '@/types'
import { calculateDiscountedPrice, formatPrice } from '@/components/ui/PromotionBadge'
import Link from 'next/link'

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Reservas' }
]

export default function ReservasPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServicioConPromociones | null>(null)
  const [servicios, setServicios] = useState<ServicioConPromociones[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServicios()
  }, [])

  const fetchServicios = async () => {
    try {
      const response = await fetch('/api/servicios')
      if (!response.ok) {
        throw new Error('Error al cargar servicios')
      }
      const data = await response.json()
      setServicios(data)
      
      // Auto-select first service if none selected
      if (data.length > 0 && !selectedService) {
        setSelectedService(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null) // Reset time when date changes
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleServiceSelect = (servicio: ServicioConPromociones) => {
    setSelectedService(servicio)
    setSelectedTime(null) // Reset time when service changes
  }

  const getServicePrice = (servicio: ServicioConPromociones) => {
    if (servicio.promociones.length > 0) {
      return calculateDiscountedPrice(Number(servicio.precio), Number(servicio.promociones[0].descuento))
    }
    return Number(servicio.precio)
  }

  const canProceed = selectedDate && selectedTime && selectedService

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Loading size="lg" text="Cargando sistema de reservas..." />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <ErrorState 
            title="Error al cargar el sistema de reservas"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold spa-text-primary mb-4">
              Reservar Tu Cita
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Selecciona tu servicio preferido, elige la fecha y hora que mejor te convenga. 
              ¡Es fácil y rápido!
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <BookingProgress 
          currentStep={!selectedService ? 1 : !selectedDate || !selectedTime ? 2 : 3} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Select Service */}
            <ServiceSelector
              servicios={servicios}
              selectedService={selectedService}
              onServiceSelect={handleServiceSelect}
              loading={loading}
            />

            {/* Step 2: Select Date and Time */}
            {selectedService && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="w-8 h-8 bg-spa-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                      2
                    </span>
                    Selecciona Fecha y Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarView
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onTimeSelect={handleTimeSelect}
                    selectedTime={selectedTime}
                    serviceDuration={selectedService.duracion}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumen de tu Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService ? (
                  <>
                    <div className="border-b pb-4">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {selectedService.nombre}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Duración: {selectedService.duracion} minutos
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Precio:</span>
                        <div className="text-right">
                          {selectedService.promociones.length > 0 ? (
                            <>
                              <div className="text-sm text-gray-500 line-through">
                                ${selectedService.precio.toString()}
                              </div>
                              <div className="text-lg font-bold text-red-600">
                                {formatPrice(getServicePrice(selectedService))}
                              </div>
                            </>
                          ) : (
                            <div className="text-lg font-bold spa-text-primary">
                              ${selectedService.precio.toString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedDate && (
                      <div className="border-b pb-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Fecha</h4>
                        <p className="text-gray-600">
                          {selectedDate.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    {selectedTime && (
                      <div className="border-b pb-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Hora</h4>
                        <p className="text-gray-600">{selectedTime}</p>
                      </div>
                    )}

                    <div className="pt-4">
                      {canProceed ? (
                        <Button size="lg" className="w-full" asChild>
                          <Link href={`/reservas/confirmar?servicio=${selectedService.id}&fecha=${selectedDate?.toISOString()}&hora=${selectedTime}`}>
                            Continuar con la Reserva
                          </Link>
                        </Button>
                      ) : (
                        <Button size="lg" className="w-full" disabled>
                          {!selectedService && 'Selecciona un servicio'}
                          {selectedService && !selectedDate && 'Selecciona una fecha'}
                          {selectedService && selectedDate && !selectedTime && 'Selecciona una hora'}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Selecciona un servicio para continuar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Necesitas Ayuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <span className="text-spa-primary mr-3">📞</span>
                  <div>
                    <p className="font-medium">Llámanos</p>
                    <a href="tel:+1234567890" className="text-sm text-gray-600 hover:text-spa-primary">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-spa-primary mr-3">💬</span>
                  <div>
                    <p className="font-medium">Envía un mensaje</p>
                    <Link href="/contacto" className="text-sm text-gray-600 hover:text-spa-primary">
                      Formulario de contacto
                    </Link>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-spa-primary mr-3 mt-1">🕒</span>
                  <div>
                    <p className="font-medium">Horarios</p>
                    <div className="text-sm text-gray-600">
                      <div>Lun - Vie: 9:00 - 18:00</div>
                      <div>Sáb: 10:00 - 16:00</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}