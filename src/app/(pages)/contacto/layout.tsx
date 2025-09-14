import { generateSEOMetadata } from '@/components/seo/SEOHead'
import { Metadata } from 'next'

export const metadata: Metadata = generateSEOMetadata({
  title: "Contacto - Spa & Masajes Relajación | Llámanos o Envía un Mensaje",
  description: "📞 Contáctanos para reservas, consultas o información. ✉️ Formulario de contacto, teléfono +1 (234) 567-890. 📍 Calle Principal 123. ⏰ Lun-Vie 9:00-18:00, Sáb 10:00-16:00.",
  keywords: [
    "contacto spa masajes",
    "teléfono spa relajación",
    "dirección spa masajes", 
    "horarios spa",
    "formulario contacto masajes",
    "consultas spa",
    "información reservas",
    "ubicación spa",
    "contactar masajista",
    "preguntas spa",
    "cita spa teléfono",
    "email spa masajes"
  ],
  canonical: "/contacto"
})

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}