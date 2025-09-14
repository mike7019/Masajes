import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import Link from 'next/link'

export function ContactInfo() {
  return (
    <section className="py-16 bg-white" id="contacto">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold spa-text-primary mb-4">
            Visítanos o Contáctanos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Estamos ubicados en el corazón de la ciudad, fácil acceso y 
            estacionamiento disponible. ¡Te esperamos!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Información de contacto */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-6 h-6 mr-3 spa-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-gray-600">
                  Calle Principal 123<br />
                  Centro de la Ciudad<br />
                  Ciudad, País 12345
                </address>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-6 h-6 mr-3 spa-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Teléfono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href="tel:+1234567890" className="text-gray-600 hover:spa-text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-6 h-6 mr-3 spa-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Horarios de Atención
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes:</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados:</span>
                    <span className="font-medium">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos:</span>
                    <span className="font-medium text-red-600">Cerrado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="flex-1">
                <Link href="/reservas">
                  📅 Reservar Cita
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="flex-1">
                <Link href="/contacto">
                  💬 Enviar Mensaje
                </Link>
              </Button>
            </div>
          </div>

          {/* Mapa placeholder */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg font-medium">Mapa Interactivo</p>
              <p className="text-sm">Próximamente disponible</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}