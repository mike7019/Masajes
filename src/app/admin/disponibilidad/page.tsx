import { Metadata } from 'next'
import { DisponibilidadManager } from '@/components/admin/DisponibilidadManager'

export const metadata: Metadata = {
  title: 'Gestión de Disponibilidad - Admin',
  description: 'Configurar horarios de trabajo y bloqueos de fechas',
}

export default function DisponibilidadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Disponibilidad
        </h1>
        <p className="text-gray-600">
          Configura los horarios de trabajo, bloquea fechas específicas y gestiona excepciones de horario.
        </p>
      </div>

      <DisponibilidadManager />
    </div>
  )
}