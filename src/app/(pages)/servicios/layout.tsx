import { generateSEOMetadata } from '@/components/seo/SEOHead'
import { Metadata } from 'next'

export const metadata: Metadata = generateSEOMetadata({
  title: "Servicios de Masajes Terapéuticos - Relajantes, Deportivos y Piedras Calientes",
  description: "🌟 Descubre nuestros servicios profesionales de masajes: relajantes ($80), terapéuticos ($120), deportivos ($100) y piedras calientes ($140). 👨‍⚕️ Terapeutas certificados con +10 años de experiencia.",
  keywords: [
    "servicios masajes",
    "masaje relajante precio",
    "masaje terapéutico profesional", 
    "masaje deportivo",
    "masaje piedras calientes",
    "precios masajes",
    "terapeutas certificados",
    "masajes profesionales",
    "tratamientos spa",
    "bienestar corporal",
    "relajación muscular",
    "alivio dolor espalda"
  ],
  canonical: "/servicios"
})

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}