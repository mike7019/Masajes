'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal, useToast, Select, Textarea, Loading } from '@/components/ui'
import { ServicioConPromociones } from '@/types'
import { ReservaFormData, reservaSchema, validateBusinessHours } from '@/lib/validation/reserva'
import { calculateDiscountedPrice, formatPrice } from '@/components/ui/PromotionBadge'
import { ConfirmationModal } from './ConfirmationModal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BookingFormProps {
  servicio: ServicioConPromociones
  fechaHora: Date
  onSuccess: () => void
  onCancel: () => void
}

export function BookingForm({ servicio, fechaHora, onSuccess, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState<Partial<ReservaFormData>>({
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    servicioId: servicio.id,
    fechaHora: fechaHora,
    notas: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { addToast } = useToast()

  // Validate business hours when component mounts
  useEffect(() => {
    const businessHoursValidation = validateBusinessHours(fechaHora)
    if (!businessHoursValidation.valid) {
      setErrors(prev => ({ ...prev, fechaHora: businessHoursValidation.message }))
    }
  }, [fechaHora])

  const handleInputChange = (field: keyof ReservaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = async (): Promise<boolean> => {
    setIsValidating(true)
    
    try {
      // Validate with Zod schema
      const result = reservaSchema.safeParse(formData)
      
      if (!result.success) {
        const newErrors: Record<string, string> = {}
        result.error.issues.forEach(error => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message
          }
        })
        setErrors(newErrors)
        return false
      }

      // Additional business hours validation
      const businessHoursValidation = validateBusinessHours(fechaHora)
      if (!businessHoursValidation.valid) {
        setErrors(prev => ({ ...prev, fechaHora: businessHoursValidation.message }))
        return false
      }

      // Check availability (simulate API call)
      try {
        const availabilityResponse = await fetch('/api/disponibilidad', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fecha: fechaHora.toISOString(),
            servicioId: formData.servicioId,
            duracion: servicio.duracion
          })
        })

        if (!availabilityResponse.ok) {
          const errorData = await availabilityResponse.json()
          setErrors(prev => ({ ...prev, fechaHora: errorData.error || 'Horario no disponible' }))
          return false
        }
      } catch (error) {
        console.warn('Could not validate availability:', error)
        // Continue without availability check if API fails
      }
      
      setErrors({})
      return true
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validateForm()
    if (!isValid) {
      addToast({
        type: 'error',
        message: 'Por favor corrige los errores en el formulario'
      })
      return
    }

    setShowConfirmation(true)
  }

  const confirmReservation = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la reserva')
      }

      const reserva = await response.json()
      
      addToast({
        type: 'success',
        title: '¡Reserva confirmada!',
        message: 'Te hemos enviado un email con los detalles de tu cita'
      })
      
      onSuccess()
    } catch (error) {
      console.error('Error creating reservation:', error)
      addToast({
        type: 'error',
        title: 'Error al crear la reserva',
        message: error instanceof Error ? error.message : 'Inténtalo de nuevo más tarde'
      })
    } finally {
      setIsSubmitting(false)
      setShowConfirmation(false)
    }
  }

  const getServicePrice = () => {
    if (servicio.promociones.length > 0) {
      return calculateDiscountedPrice(Number(servicio.precio), Number(servicio.promociones[0].descuento))
    }
    return Number(servicio.precio)
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="w-8 h-8 bg-spa-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
              3
            </span>
            Completa tus Datos
          </CardTitle>
          <p className="text-gray-600">
            Ingresa tu información para confirmar la reserva
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Summary */}
            <div className="bg-spa-neutral rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Resumen de tu reserva</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Servicio:</span>
                  <span className="font-medium">{servicio.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-medium">
                    {format(fechaHora, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hora:</span>
                  <span className="font-medium">{format(fechaHora, 'HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span className="font-medium">{servicio.duracion} minutos</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <div className="text-right">
                    {servicio.promociones.length > 0 ? (
                      <>
                        <div className="text-sm text-gray-500 line-through">
                          ${servicio.precio.toString()}
                        </div>
                        <div className="text-lg font-bold text-red-600">
                          {formatPrice(getServicePrice())}
                        </div>
                      </>
                    ) : (
                      <div className="text-lg font-bold spa-text-primary">
                        ${servicio.precio.toString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre completo *"
                value={formData.clienteNombre || ''}
                onChange={(e) => handleInputChange('clienteNombre', e.target.value)}
                error={errors.clienteNombre}
                placeholder="Ej: María García"
                required
                autoComplete="name"
              />
              
              <Input
                label="Teléfono *"
                type="tel"
                value={formData.clienteTelefono || ''}
                onChange={(e) => handleInputChange('clienteTelefono', e.target.value)}
                error={errors.clienteTelefono}
                placeholder="Ej: +1 234 567 890"
                required
                autoComplete="tel"
              />
            </div>

            <Input
              label="Email *"
              type="email"
              value={formData.clienteEmail || ''}
              onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
              error={errors.clienteEmail}
              placeholder="Ej: maria@email.com"
              helperText="Te enviaremos la confirmación a este email"
              required
              autoComplete="email"
            />

            <Textarea
              label="Notas adicionales (opcional)"
              value={formData.notas || ''}
              onChange={(e) => handleInputChange('notas', e.target.value)}
              placeholder="¿Alguna preferencia especial o información que debamos saber?"
              rows={4}
              maxLength={500}
              error={errors.notas}
              helperText={`${(formData.notas || '').length}/500 caracteres`}
            />

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Política de cancelación</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Puedes cancelar o reprogramar hasta 24 horas antes sin costo</li>
                <li>• Cancelaciones con menos de 24 horas pueden tener una tarifa</li>
                <li>• Te enviaremos un recordatorio 24 horas antes de tu cita</li>
                <li>• Por favor llega 10 minutos antes de tu hora programada</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Volver
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || isValidating}
                loading={isSubmitting || isValidating}
              >
                {isValidating ? 'Validando...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmReservation}
        servicio={servicio}
        formData={formData}
        fechaHora={fechaHora}
        isLoading={isSubmitting}
      />
    </>
  )
}