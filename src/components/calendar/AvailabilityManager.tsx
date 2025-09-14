'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Loading } from '@/components/ui'
import { DisponibilidadConfig } from '@/types'
import { useToast } from '@/components/ui'

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

export function AvailabilityManager() {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    fetchDisponibilidad()
  }, [])

  const fetchDisponibilidad = async () => {
    try {
      const response = await fetch('/api/disponibilidad')
      if (response.ok) {
        const data = await response.json()
        setDisponibilidad(data)
      }
    } catch (error) {
      console.error('Error fetching disponibilidad:', error)
      addToast({
        type: 'error',
        message: 'Error al cargar la disponibilidad'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateDisponibilidad = async (diaSemana: number, updates: Partial<DisponibilidadConfig>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/disponibilidad', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          diaSemana,
          ...updates
        })
      })

      if (response.ok) {
        await fetchDisponibilidad()
        addToast({
          type: 'success',
          message: 'Disponibilidad actualizada correctamente'
        })
      } else {
        throw new Error('Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating disponibilidad:', error)
      addToast({
        type: 'error',
        message: 'Error al actualizar la disponibilidad'
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleDayActive = (diaSemana: number) => {
    const current = disponibilidad.find(d => d.diaSemana === diaSemana)
    updateDisponibilidad(diaSemana, { activo: !current?.activo })
  }

  const updateTimeRange = (diaSemana: number, horaInicio: string, horaFin: string) => {
    updateDisponibilidad(diaSemana, { horaInicio, horaFin })
  }

  const getDayConfig = (diaSemana: number): DisponibilidadConfig | undefined => {
    return disponibilidad.find(d => d.diaSemana === diaSemana)
  }

  if (loading) {
    return <Loading text="Cargando configuración de disponibilidad..." />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">📅</span>
            Gestión de Disponibilidad
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configura los horarios de atención para cada día de la semana
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => {
              const config = getDayConfig(day.value)
              const isActive = config?.activo || false
              
              return (
                <div key={day.value} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-20">
                      <span className="font-medium">{day.label}</span>
                    </div>
                    
                    <Button
                      variant={isActive ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => toggleDayActive(day.value)}
                      disabled={saving}
                    >
                      {isActive ? 'Activo' : 'Inactivo'}
                    </Button>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={config?.horaInicio || '09:00'}
                        onChange={(e) => {
                          const horaFin = config?.horaFin || '18:00'
                          updateTimeRange(day.value, e.target.value, horaFin)
                        }}
                        className="w-32"
                        disabled={saving}
                      />
                      <span className="text-gray-500">a</span>
                      <Input
                        type="time"
                        value={config?.horaFin || '18:00'}
                        onChange={(e) => {
                          const horaInicio = config?.horaInicio || '09:00'
                          updateTimeRange(day.value, horaInicio, e.target.value)
                        }}
                        className="w-32"
                        disabled={saving}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejos:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los horarios se generan en intervalos de 30 minutos</li>
              <li>• Desactiva los días que no trabajas</li>
              <li>• Los cambios se aplican inmediatamente al calendario de reservas</li>
              <li>• Considera el tiempo de limpieza entre citas</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // Set standard business hours (Mon-Fri 9-18, Sat 10-16)
                DAYS_OF_WEEK.slice(0, 5).forEach(day => {
                  updateDisponibilidad(day.value, { 
                    activo: true, 
                    horaInicio: '09:00', 
                    horaFin: '18:00' 
                  })
                })
                updateDisponibilidad(6, { 
                  activo: true, 
                  horaInicio: '10:00', 
                  horaFin: '16:00' 
                })
                updateDisponibilidad(0, { activo: false })
              }}
              disabled={saving}
            >
              🏢 Horario Estándar
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Set extended hours
                DAYS_OF_WEEK.slice(0, 6).forEach(day => {
                  updateDisponibilidad(day.value, { 
                    activo: true, 
                    horaInicio: '08:00', 
                    horaFin: '20:00' 
                  })
                })
                updateDisponibilidad(0, { activo: false })
              }}
              disabled={saving}
            >
              ⏰ Horario Extendido
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Disable all days (vacation mode)
                DAYS_OF_WEEK.forEach(day => {
                  updateDisponibilidad(day.value, { activo: false })
                })
              }}
              disabled={saving}
            >
              🏖️ Modo Vacaciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}