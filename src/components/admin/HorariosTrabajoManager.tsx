'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/Toast'

interface HorarioTrabajo {
  id: string
  diaSemana: number
  horaInicio: string
  horaFin: string
  activo: boolean
}

const DIAS_SEMANA = [
  'Domingo',
  'Lunes', 
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
]

export function HorariosTrabajoManager() {
  const [horarios, setHorarios] = useState<HorarioTrabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    cargarHorarios()
  }, [])

  const cargarHorarios = async () => {
    try {
      const response = await fetch('/api/admin/disponibilidad/horarios')
      if (response.ok) {
        const data = await response.json()
        setHorarios(data)
      } else {
        addToast({ message: 'Error al cargar los horarios', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      addToast({ message: 'Error al cargar los horarios', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const actualizarHorario = (diaSemana: number, campo: keyof HorarioTrabajo, valor: any) => {
    setHorarios(prev => {
      const horarioExistente = prev.find(h => h.diaSemana === diaSemana)
      
      if (horarioExistente) {
        return prev.map(h => 
          h.diaSemana === diaSemana 
            ? { ...h, [campo]: valor }
            : h
        )
      } else {
        // Crear nuevo horario
        const nuevoHorario: HorarioTrabajo = {
          id: `temp-${diaSemana}`,
          diaSemana,
          horaInicio: '09:00',
          horaFin: '18:00',
          activo: false,
          [campo]: valor
        }
        return [...prev, nuevoHorario]
      }
    })
  }

  const guardarHorarios = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/disponibilidad/horarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ horarios }),
      })

      if (response.ok) {
        addToast({ message: 'Horarios guardados correctamente', type: 'success' })
        await cargarHorarios() // Recargar para obtener IDs actualizados
      } else {
        const error = await response.json()
        addToast({ message: error.message || 'Error al guardar los horarios', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      addToast({ message: 'Error al guardar los horarios', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const validarHorarios = () => {
    const errores: string[] = []
    
    horarios.forEach(horario => {
      if (horario.activo) {
        if (!horario.horaInicio || !horario.horaFin) {
          errores.push(`${DIAS_SEMANA[horario.diaSemana]}: Debe especificar hora de inicio y fin`)
        } else if (horario.horaInicio >= horario.horaFin) {
          errores.push(`${DIAS_SEMANA[horario.diaSemana]}: La hora de inicio debe ser anterior a la hora de fin`)
        }
      }
    })

    return errores
  }

  const manejarGuardar = () => {
    const errores = validarHorarios()
    if (errores.length > 0) {
      errores.forEach(error => addToast({ message: error, type: 'error' }))
      return
    }
    guardarHorarios()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spa-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Horarios de Trabajo</CardTitle>
        <CardDescription>
          Define los horarios de atención para cada día de la semana. Los horarios desactivados no estarán disponibles para reservas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {DIAS_SEMANA.map((dia, index) => {
            const horario = horarios.find(h => h.diaSemana === index) || {
              id: `temp-${index}`,
              diaSemana: index,
              horaInicio: '09:00',
              horaFin: '18:00',
              activo: false
            }

            return (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="font-medium">{dia}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={horario.activo}
                    onCheckedChange={(checked) => actualizarHorario(index, 'activo', checked)}
                  />
                  <Label className="text-sm text-gray-600">Activo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Desde:</Label>
                  <Input
                    type="time"
                    value={horario.horaInicio}
                    onChange={(e) => actualizarHorario(index, 'horaInicio', e.target.value)}
                    disabled={!horario.activo}
                    className="w-32"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Hasta:</Label>
                  <Input
                    type="time"
                    value={horario.horaFin}
                    onChange={(e) => actualizarHorario(index, 'horaFin', e.target.value)}
                    disabled={!horario.activo}
                    className="w-32"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={cargarHorarios} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={manejarGuardar} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Horarios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}