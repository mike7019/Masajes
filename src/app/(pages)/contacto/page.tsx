import { ContactForm } from '@/components/forms/ContactForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

const breadcrumbItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Contacto' }
]

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold spa-text-primary mb-4">
              Contáctanos
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto, 
              o visítanos en nuestro spa para una experiencia personalizada.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">📍</span>
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <span className="text-spa-primary mr-3 mt-1">🏢</span>
                  <div>
                    <p className="font-medium text-gray-900">Dirección</p>
                    <p className="text-gray-600">
                      Calle Principal 123<br />
                      Centro de la Ciudad<br />
                      Ciudad, País 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-spa-primary mr-3 mt-1">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">Teléfono</p>
                    <a 
                      href="tel:+1234567890" 
                      className="text-gray-600 hover:text-spa-primary transition-colors"
                    >
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-spa-primary mr-3 mt-1">📧</span>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a 
                      href="mailto:info@tumasajes.com" 
                      className="text-gray-600 hover:text-spa-primary transition-colors"
                    >
                      info@tumasajes.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-spa-primary mr-3 mt-1">🕒</span>
                  <div>
                    <p className="font-medium text-gray-900">Horarios de Atención</p>
                    <div className="text-gray-600 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Lunes - Viernes:</span>
                        <span>9:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábados:</span>
                        <span>10:00 - 16:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domingos:</span>
                        <span className="text-red-600">Cerrado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">⚡</span>
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="tel:+1234567890"
                  className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <span className="text-green-600 mr-3 text-xl">📞</span>
                  <div>
                    <p className="font-medium text-green-800 group-hover:text-green-900">
                      Llamar Ahora
                    </p>
                    <p className="text-sm text-green-600">
                      Para consultas urgentes
                    </p>
                  </div>
                </a>

                <a
                  href="/reservas"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <span className="text-blue-600 mr-3 text-xl">📅</span>
                  <div>
                    <p className="font-medium text-blue-800 group-hover:text-blue-900">
                      Reservar Cita
                    </p>
                    <p className="text-sm text-blue-600">
                      Sistema de reservas online
                    </p>
                  </div>
                </a>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <span className="text-purple-600 mr-3 text-xl">🗺️</span>
                  <div>
                    <p className="font-medium text-purple-800 group-hover:text-purple-900">
                      Ver Ubicación
                    </p>
                    <p className="text-sm text-purple-600">
                      Cómo llegar al spa
                    </p>
                  </div>
                </a>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">❓</span>
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">¿Necesito reservar con anticipación?</p>
                    <p className="text-gray-600">Sí, recomendamos reservar al menos 24 horas antes.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">¿Qué debo traer?</p>
                    <p className="text-gray-600">Solo ven con ropa cómoda. Nosotros proporcionamos todo lo demás.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">¿Aceptan tarjetas?</p>
                    <p className="text-gray-600">Sí, aceptamos efectivo y todas las tarjetas principales.</p>
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