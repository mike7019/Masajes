'use client'

import { useState } from 'react'
import { BigCalendarView, AvailabilityManager, BlockedHoursManager } from '@/components/calendar'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { useAdminAuth } from '@/hooks/useAuth'

export default function AdminCalendarioPage() {
  const { session, isLoading } = useAdminAuth()
  const [currentView, setCurrentView] = useState<'calendar' | 'availability' | 'blocked'>('calendar')
  const [showAvailableSlots, setShowAvailableSlots] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event)
    // Here you could open a modal with event details
    console.log('Selected event:', event)
  }

  const handleBlockedHoursChange = () => {
    // Refresh calendar when blocked hours change
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Calendario</h1>
          <p className="text-gray-600">
            Administra reservas, disponibilidad y horarios bloqueados
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Calendario
            </button>
            <button
              onClick={() => setCurrentView('availability')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'availability'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⏰ Disponibilidad
            </button>
            <button
              onClick={() => setCurrentView('blocked')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'blocked'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚫 Bloqueos
            </button>
          </div>
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === 'calendar' && (
        <div className="space-y-6">
          {/* Calendar Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Controles del Calendario</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={showAvailableSlots ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowAvailableSlots(!showAvailableSlots)}
                  >
                    {showAvailableSlots ? 'Ocultar' : 'Mostrar'} Disponibilidad
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>Reservas Confirmadas</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
                  <span>Reservas Pendientes</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Horarios Bloqueados</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Reservas Canceladas</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-500 rounded mr-2"></div>
                  <span>Reservas Completadas</span>
                </div>
                {showAvailableSlots && (
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded mr-2"></div>
                    <span>Horarios Disponibles</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Big Calendar */}
          <BigCalendarView
            onEventSelect={handleEventSelect}
            showAvailableSlots={showAvailableSlots}
            view="month"
          />

          {/* Event Details Modal would go here */}
          {selectedEvent && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detalles del Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-4 rounded">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentView === 'availability' && (
        <AvailabilityManager />
      )}

      {currentView === 'blocked' && (
        <BlockedHoursManager onBlockedHoursChange={handleBlockedHoursChange} />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reservas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <span className="text-amber-600 text-xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">🚫</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bloqueados</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}