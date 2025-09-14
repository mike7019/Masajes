import { HeroSection, ServicesPreview, TestimonialsSection, ContactInfo, FAQSection } from '@/components/landing'
import { generateLocalBusinessStructuredData, StructuredDataScript, generateSEOMetadata } from '@/components/seo/SEOHead'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = generateSEOMetadata({
  title: "Spa & Masajes Relajación - Masajes Terapéuticos Profesionales | Reserva Online",
  description: "✨ Servicios profesionales de masajes terapéuticos, relajantes y deportivos. 🧘‍♀️ Más de 10 años cuidando tu bienestar. 📅 Reserva tu cita online. ⭐ 4.9/5 estrellas.",
  keywords: [
    "masajes terapéuticos",
    "spa relajación", 
    "masajes deportivos",
    "piedras calientes",
    "bienestar",
    "reservas online masajes",
    "masajes profesionales",
    "terapia muscular",
    "alivio estrés",
    "masajes cerca de mi",
    "spa profesional",
    "masajista certificado"
  ],
  canonical: "/"
})

export default function HomePage() {
  const structuredData = generateLocalBusinessStructuredData()

  return (
    <>
      <StructuredDataScript data={structuredData} />
      
      <div className="min-h-screen">
        <HeroSection />
        <ServicesPreview />
        <TestimonialsSection />
        <FAQSection />
        <ContactInfo />
        
        {/* Final CTA Section */}
        <section className="py-16 spa-gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comienza Tu Viaje Hacia el Bienestar
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              No esperes más para cuidar de ti mismo. Reserva tu primera sesión 
              y descubre por qué somos la elección preferida para el bienestar y la relajación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/reservas" className="text-lg px-8 py-4">
                  🎯 Reservar Primera Cita
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="tel:+1234567890" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-spa-primary">
                  📞 Llamar Ahora
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}