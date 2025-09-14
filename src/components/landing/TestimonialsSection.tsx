import { Card, CardContent } from '@/components/ui'

const testimonials = [
  {
    id: 1,
    name: "María González",
    rating: 5,
    comment: "Increíble experiencia. El masaje terapéutico me ayudó muchísimo con mis dolores de espalda. El ambiente es muy relajante y profesional.",
    service: "Masaje Terapéutico"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    rating: 5,
    comment: "Como deportista, necesito recuperación muscular constante. El masaje deportivo aquí es excepcional. Muy recomendado.",
    service: "Masaje Deportivo"
  },
  {
    id: 3,
    name: "Ana Martínez",
    rating: 5,
    comment: "El masaje de piedras calientes fue una experiencia única. Me sentí completamente renovada. Definitivamente volveré.",
    service: "Piedras Calientes"
  },
  {
    id: 4,
    name: "Luis Fernández",
    rating: 5,
    comment: "Excelente atención y profesionalismo. El masaje relajante fue justo lo que necesitaba después de una semana estresante.",
    service: "Masaje Relajante"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-16 spa-bg-neutral" id="testimonios">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold spa-text-primary mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            La satisfacción de nuestros clientes es nuestra mayor recompensa. 
            Lee las experiencias reales de quienes han confiado en nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="card-hover">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-gray-600 mb-4 italic">
                  "{testimonial.comment}"
                </blockquote>

                {/* Author */}
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.service}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold spa-text-primary">500+</div>
              <div className="text-sm text-gray-600">Clientes Satisfechos</div>
            </div>
            <div>
              <div className="text-3xl font-bold spa-text-primary">10+</div>
              <div className="text-sm text-gray-600">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-3xl font-bold spa-text-primary">4.9</div>
              <div className="text-sm text-gray-600">Calificación Promedio</div>
            </div>
            <div>
              <div className="text-3xl font-bold spa-text-primary">100%</div>
              <div className="text-sm text-gray-600">Profesionales Certificados</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}