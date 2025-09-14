'use client'

import { useState } from 'react'
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Badge,
  Alert,
  AlertWithIcon,
  Separator,
  Loading,
  ErrorState,
  ServiceCard,
  useToast
} from '@/components/ui'
import { Container, Section, Grid } from '@/components/layout'

export default function UIDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToast } = useToast()

  const handleToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    addToast({
      type,
      title: `Toast ${type}`,
      message: `Este es un mensaje de ${type} para demostrar el componente Toast.`
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Section padding="xl" background="white">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold spa-text-primary mb-4">
            Sistema de Diseño - Spa & Masajes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Componentes UI diseñados específicamente para el tema de spa y masajes, 
            con colores cálidos y una estética relajante.
          </p>
        </div>

        {/* Botones */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Botones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button variant="primary">Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="sage">Sage</Button>
              <Button variant="warm">Cálido</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button size="sm">Pequeño</Button>
              <Button size="md">Mediano</Button>
              <Button size="lg">Grande</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button loading>Cargando...</Button>
              <Button disabled>Deshabilitado</Button>
            </div>
          </CardContent>
        </Card>

        {/* Formularios */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Elementos de Formulario</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={2} gap="md">
              <div>
                <Input 
                  label="Nombre completo" 
                  placeholder="Ingresa tu nombre"
                  helperText="Este campo es requerido"
                />
              </div>
              <div>
                <Input 
                  label="Email" 
                  type="email"
                  placeholder="tu@email.com"
                  error="Email inválido"
                />
              </div>
              <div>
                <Select label="Tipo de masaje" placeholder="Selecciona un servicio">
                  <option value="relajante">Masaje Relajante</option>
                  <option value="deportivo">Masaje Deportivo</option>
                  <option value="piedras">Piedras Calientes</option>
                </Select>
              </div>
              <div>
                <Textarea 
                  label="Comentarios adicionales"
                  placeholder="Cuéntanos sobre tus necesidades específicas..."
                  rows={3}
                />
              </div>
            </Grid>
          </CardContent>
        </Card>

        {/* Badges y Alertas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badges y Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Popular</Badge>
                <Badge variant="secondary">Nuevo</Badge>
                <Badge variant="success">Disponible</Badge>
                <Badge variant="warning">Pocas plazas</Badge>
                <Badge variant="error">Agotado</Badge>
                <Badge variant="outline">Promoción</Badge>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Alertas</h4>
              <Alert variant="success">
                <strong>¡Reserva confirmada!</strong> Tu cita ha sido agendada exitosamente.
              </Alert>
              <AlertWithIcon variant="warning" title="Atención">
                Por favor llega 15 minutos antes de tu cita para el check-in.
              </AlertWithIcon>
              <AlertWithIcon variant="error" title="Error">
                No se pudo procesar tu reserva. Por favor intenta nuevamente.
              </AlertWithIcon>
            </div>
          </CardContent>
        </Card>

        {/* Toast Demos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notificaciones Toast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => handleToast('success')} variant="sage">
                Toast Éxito
              </Button>
              <Button onClick={() => handleToast('error')} variant="outline">
                Toast Error
              </Button>
              <Button onClick={() => handleToast('warning')} variant="warm">
                Toast Advertencia
              </Button>
              <Button onClick={() => handleToast('info')} variant="secondary">
                Toast Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estados de Carga y Error */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Estados de Carga y Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={2} gap="lg">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Loading</h4>
                <Loading text="Cargando servicios..." />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Error State</h4>
                <ErrorState 
                  title="Error de conexión"
                  message="No se pudieron cargar los servicios disponibles."
                  onRetry={() => console.log('Retry clicked')}
                />
              </div>
            </Grid>
          </CardContent>
        </Card>

        {/* Service Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold spa-text-primary mb-6 text-center">
            Tarjetas de Servicios
          </h2>
          <Grid cols={3} gap="lg">
            <ServiceCard
              title="Masaje Relajante"
              description="Un masaje suave y relajante que alivia el estrés y la tensión muscular, perfecto para desconectar del día a día."
              duration={60}
              price={45}
              features={[
                "Aceites esenciales aromáticos",
                "Música relajante",
                "Ambiente tranquilo",
                "Técnicas de relajación profunda"
              ]}
              onReserve={() => addToast({ type: 'success', message: 'Redirigiendo a reservas...' })}
              isPopular
            />
            <ServiceCard
              title="Masaje Deportivo"
              description="Masaje terapéutico especializado para atletas y personas activas, enfocado en la recuperación muscular."
              duration={90}
              price={65}
              originalPrice={75}
              features={[
                "Técnicas de recuperación",
                "Tratamiento de lesiones menores",
                "Mejora del rendimiento",
                "Prevención de lesiones"
              ]}
              onReserve={() => addToast({ type: 'success', message: 'Redirigiendo a reservas...' })}
            />
            <ServiceCard
              title="Piedras Calientes"
              description="Terapia con piedras volcánicas calientes que proporciona relajación profunda y mejora la circulación."
              duration={75}
              price={55}
              features={[
                "Piedras volcánicas naturales",
                "Calor terapéutico",
                "Mejora la circulación",
                "Relajación profunda"
              ]}
              onReserve={() => addToast({ type: 'success', message: 'Redirigiendo a reservas...' })}
            />
          </Grid>
        </div>
      </Section>
    </div>
  )
}