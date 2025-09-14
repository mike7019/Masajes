import { Button } from '@/components/ui'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="spa-gradient-hero text-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Tu Oasis de <span className="text-yellow-200">Relajación</span> y Bienestar
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto">
            Descubre el equilibrio perfecto entre cuerpo y mente con nuestros 
            <strong> masajes terapéuticos profesionales</strong>. Más de 10 años 
            cuidando tu bienestar en un ambiente de tranquilidad absoluta.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/reservas" className="text-lg px-8 py-4">
                🗓️ Reservar Mi Cita
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/servicios" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-spa-primary">
                📋 Ver Servicios
              </Link>
            </Button>
          </div>

          {/* Beneficios destacados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧘‍♀️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Relajación Profunda</h3>
              <p className="text-sm opacity-80">Libera el estrés y encuentra tu paz interior</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💆‍♂️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Terapia Profesional</h3>
              <p className="text-sm opacity-80">Masajistas certificados con años de experiencia</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Ambiente Natural</h3>
              <p className="text-sm opacity-80">Espacio diseñado para tu máximo confort</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}