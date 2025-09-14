'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

const faqs = [
  {
    question: "¿Qué tipos de masajes ofrecen?",
    answer: "Ofrecemos masajes relajantes, terapéuticos, deportivos y de piedras calientes. Cada tratamiento está diseñado para necesidades específicas, desde alivio del estrés hasta recuperación muscular."
  },
  {
    question: "¿Necesito experiencia previa para recibir un masaje?",
    answer: "No, nuestros masajes son para todos. Nuestros terapeutas profesionales se adaptan a tu nivel de comodidad y necesidades específicas, ya sea tu primera vez o seas un cliente regular."
  },
  {
    question: "¿Cuánto tiempo duran las sesiones?",
    answer: "Las sesiones varían entre 60 y 90 minutos dependiendo del tipo de masaje. El masaje relajante dura 60 minutos, mientras que el terapéutico y de piedras calientes duran 90 minutos."
  },
  {
    question: "¿Puedo reservar online?",
    answer: "Sí, puedes reservar fácilmente a través de nuestro sistema online las 24 horas. También puedes llamarnos directamente al +1 (234) 567-890 para hacer tu reserva."
  },
  {
    question: "¿Qué debo traer a mi cita?",
    answer: "No necesitas traer nada. Proporcionamos toallas limpias, batas y todo lo necesario para tu sesión. Solo ven con ropa cómoda y prepárate para relajarte."
  },
  {
    question: "¿Cuál es su política de cancelación?",
    answer: "Puedes cancelar o reprogramar tu cita hasta 24 horas antes sin costo. Las cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a una tarifa."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <section className="py-16 bg-white" id="faq">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold spa-text-primary mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Resolvemos las dudas más comunes sobre nuestros servicios de masajes 
              para que tengas toda la información que necesitas.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className={cn(
                        "w-5 h-5 text-gray-500 transition-transform flex-shrink-0",
                        openIndex === index && "transform rotate-180"
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>
                
                {openIndex === index && (
                  <CardContent className="pt-0 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}