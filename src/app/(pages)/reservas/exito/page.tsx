import { Button, Card, CardContent } from '@/components/ui'
import Link from 'next/link'

export default function ReservaExitoPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="p-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¡Reserva Confirmada! 🎉
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Tu cita ha sido reservada exitosamente. Te hemos enviado un email 
              con todos los detalles de tu reserva.
            </p>

            {/* Next Steps */}
            <div className="bg-spa-neutral rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Próximos pasos:
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <span>Revisa tu email para ver los detalles de la reserva</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-0.5">📅</span>
                  <span>Te enviaremos un recordatorio 24 horas antes de tu cita</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 mt-0.5">🕒</span>
                  <span>Llega 10 minutos antes de tu hora programada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3 mt-0.5">📞</span>
                  <span>Si necesitas cambios, contáctanos al +1 (234) 567-890</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-white border rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                📍 Información del Spa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Dirección:</p>
                  <p>Calle Principal 123<br />Centro de la Ciudad</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contacto:</p>
                  <p>📞 +1 (234) 567-890</p>
                  <p>📧 info@tumasajes.com</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/">
                  🏠 Volver al Inicio
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/reservas">
                  📅 Hacer Otra Reserva
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/contacto">
                  💬 Contactar Spa
                </Link>
              </Button>
            </div>

            {/* Social Sharing */}
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-500 mb-4">
                ¡Comparte tu experiencia con nosotros!
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label="Compartir en Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                  aria-label="Compartir en Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-pink-600 hover:text-pink-800 transition-colors"
                  aria-label="Compartir en Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}