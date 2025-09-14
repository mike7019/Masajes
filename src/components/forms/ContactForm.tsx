'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui'
import { ContactoFormData, contactoSchema } from '@/lib/validation/contacto'

const tiposConsulta = [
  { value: 'general', label: 'Consulta General' },
  { value: 'reserva', label: 'Información sobre Reservas' },
  { value: 'servicio', label: 'Consulta sobre Servicios' },
  { value: 'precio', label: 'Información de Precios' },
  { value: 'cancelacion', label: 'Cancelación o Reprogramación' },
  { value: 'otro', label: 'Otro' }
]

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<ContactoFormData>>({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    tipoConsulta: 'general'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { addToast } = useToast()

  const handleInputChange = (field: keyof ContactoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const result = contactoSchema.safeParse(formData)
    
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
    
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      addToast({
        type: 'error',
        message: 'Por favor corrige los errores en el formulario'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al enviar el mensaje')
      }

      setIsSubmitted(true)
      addToast({
        type: 'success',
        title: '¡Mensaje enviado!',
        message: 'Te responderemos pronto. Revisa tu email.'
      })
      
      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        tipoConsulta: 'general'
      })
    } catch (error) {
      console.error('Error sending contact form:', error)
      addToast({
        type: 'error',
        title: 'Error al enviar mensaje',
        message: error instanceof Error ? error.message : 'Inténtalo de nuevo más tarde'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Mensaje Enviado! 📧
          </h3>
          
          <p className="text-gray-600 mb-6">
            Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos 
            en un plazo máximo de 24 horas.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
            >
              Enviar Otro Mensaje
            </Button>
            
            <div className="text-sm text-gray-500">
              <p>📞 Para consultas urgentes: +1 (234) 567-890</p>
              <p>🕒 Horario de atención: Lun-Vie 9:00-18:00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">💬</span>
          Envíanos un Mensaje
        </CardTitle>
        <p className="text-gray-600">
          Completa el formulario y te responderemos pronto
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consulta *
            </label>
            <select
              value={formData.tipoConsulta || 'general'}
              onChange={(e) => handleInputChange('tipoConsulta', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spa-primary/20 focus:border-spa-primary"
            >
              {tiposConsulta.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre completo *"
              value={formData.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              error={errors.nombre}
              placeholder="Ej: María García"
              required
            />
            
            <Input
              label="Teléfono (opcional)"
              type="tel"
              value={formData.telefono || ''}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              error={errors.telefono}
              placeholder="Ej: +1 234 567 890"
            />
          </div>

          <Input
            label="Email *"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            placeholder="Ej: maria@email.com"
            helperText="Te responderemos a este email"
            required
          />

          <Input
            label="Asunto *"
            value={formData.asunto || ''}
            onChange={(e) => handleInputChange('asunto', e.target.value)}
            error={errors.asunto}
            placeholder="Ej: Consulta sobre masaje terapéutico"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje *
            </label>
            <textarea
              value={formData.mensaje || ''}
              onChange={(e) => handleInputChange('mensaje', e.target.value)}
              placeholder="Escribe tu consulta o mensaje aquí..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spa-primary/20 focus:border-spa-primary resize-vertical"
              maxLength={1000}
              required
            />
            {errors.mensaje && (
              <p className="text-sm text-red-600 mt-1">{errors.mensaje}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {(formData.mensaje || '').length}/1000 caracteres
            </p>
          </div>

          {/* Información de Respuesta */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Información de Respuesta</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Respondemos en un máximo de 24 horas</li>
              <li>• Para consultas urgentes, llama al +1 (234) 567-890</li>
              <li>• Horario de atención: Lun-Vie 9:00-18:00, Sáb 10:00-16:00</li>
              <li>• También puedes visitarnos en Calle Principal 123</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}