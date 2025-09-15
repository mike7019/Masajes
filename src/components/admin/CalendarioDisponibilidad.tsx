'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

interface DisponibilidadDia {
  fecha: Date
  disponible: boolean
  motivo?: string
  reservas: number
}

export function CalendarioDisponibilidad() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDia[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    cargarDisponibilidad()
  }, [currentDate])

  const cargarDisponibilidad = async () => {
    setLoading(true)
    try {
      const inicio = startOfMonth(currentDate)
      const fin = endOfMonth(currentDate)
      
      const response = await fetch(
        `/api/admin/disponibilidad/calendario?inicio=${inicio.toISOString()}&fin=${fin.toISOString()}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setDisponibilidad(data)
      } else {
        addToast({ message: 'Error al cargar la disponibilidad del calendario', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      addToast({ message: 'Error al cargar la disponibilidad del calendario', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior') {
      setCurrentDate(prev => subMonths(prev, 1))
    } else {
      setCurrentDate(prev => addMonths(prev, 1))
    }
  }

  const obtenerDisponibilidadDia = (fecha: Date): DisponibilidadDia | undefined => {
    return disponibilidad.find(d => 
      format(d.fecha, 'yyyy-MM-dd') === format(fecha, 'yyyy-MM-dd')
    )
  }

  const obtenerClaseDia = (fecha: Date, disponibilidadDia?: DisponibilidadDia) => {
    let clases = 'p-2 text-center border rounded-lg cursor-pointer transition-colors '
    
    if (!isSameMonth(fecha, currentDate)) {
      clases += 'text-gray-300 bg-gray-50 '
    } else if (isToday(fecha)) {
      clases += 'ring-2 ring-spa-primary '
    }

    if (disponibilidadDia) {
      if (disponibilidadDia.disponible) {
        clases += 'bg-green-50 text-green-800 hover:bg-green-100 '
      } else {
        clases += 'bg-red-50 text-red-800 hover:bg-red-100 '
      }
    } else {
      clases += 'bg-gray-100 text-gray-500 hover:bg-gray-200 '
    }

    return clases
  }

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const diasMes = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  // Agregar días del mes anterior para completar la primera semana
  const primerDia = startOfMonth(currentDate)
  const diasAnteriores = []
  for (let i = primerDia.getDay(); i > 0; i--) {
    const dia = new Date(primerDia)
    dia.setDate(dia.getDate() - i)
    diasAnteriores.push(dia)
  }

  // Agregar días del mes siguiente para completar la última semana
  const ultimoDia = endOfMonth(currentDate)
  const diasSiguientes = []
  for (let i = 1; i <= (6 - ultimoDia.getDay()); i++) {
    const dia = new Date(ultimoDia)
    dia.setDate(dia.getDate() + i)
    diasSiguientes.push(dia)
  }

  const todosDias = [...diasAnteriores, ...diasMes, ...diasSiguientes]

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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Vista de Calendario - Disponibilidad</CardTitle>
            <CardDescription>
              Visualiza la disponibilidad por día. Verde = disponible, Rojo = bloqueado, Gris = sin configurar.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navegarMes('anterior')}>
              ← Anterior
            </Button>
            <span className="font-medium px-4">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navegarMes('siguiente')}>
              Siguiente →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Bloqueado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Sin configurar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-spa-primary rounded"></div>
              <span>Hoy</span>
            </div>
          </div>

          {/* Calendario */}
          <div className="grid grid-cols-7 gap-1">
            {/* Encabezados de días */}
            {diasSemana.map(dia => (
              <div key={dia} className="p-2 text-center font-medium text-gray-600 bg-gray-50">
                {dia}
              </div>
            ))}

            {/* Días del calendario */}
            {todosDias.map((fecha, index) => {
              const disponibilidadDia = obtenerDisponibilidadDia(fecha)
              
              return (
                <div
                  key={index}
                  className={obtenerClaseDia(fecha, disponibilidadDia)}
                  title={
                    disponibilidadDia 
                      ? `${format(fecha, 'dd/MM/yyyy')} - ${disponibilidadDia.disponible ? 'Disponible' : disponibilidadDia.motivo || 'Bloqueado'} - ${disponibilidadDia.reservas} reservas`
                      : format(fecha, 'dd/MM/yyyy')
                  }
                >
                  <div className="font-medium">
                    {format(fecha, 'd')}
                  </div>
                  {disponibilidadDia && disponibilidadDia.reservas > 0 && (
                    <div className="text-xs mt-1">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {disponibilidadDia.reservas}
                      </Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Resumen del mes */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {disponibilidad.filter(d => d.disponible).length}
              </div>
              <div className="text-sm text-gray-600">Días disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {disponibilidad.filter(d => !d.disponible).length}
              </div>
              <div className="text-sm text-gray-600">Días bloqueados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {disponibilidad.reduce((total, d) => total + d.reservas, 0)}
              </div>
              <div className="text-sm text-gray-600">Total reservas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}