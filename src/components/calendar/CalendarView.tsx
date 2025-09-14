'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth, isSameDay, isToday, isBefore, startOfDay, parseISO, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button, Card, CardContent, CardHeader, CardTitle, Loading } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { DisponibilidadConfig, Reserva } from '@/types'

// Configure moment for Spanish locale
moment.locale('es')
const localizer = momentLocalizer(moment)

interface CalendarViewProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
  selectedTime: string | null
  serviceDuration: number
  className?: string
}

export function CalendarView({ 
  selectedDate, 
  onDateSelect, 
  onTimeSelect, 
  selectedTime, 
  serviceDuration,
  className 
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadConfig[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDisponibilidad()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchReservas(selectedDate)
    }
  }, [selectedDate])

  const fetchDisponibilidad = async () => {
    try {
      const response = await fetch('/api/disponibilidad')
      if (response.ok) {
        const data = await response.json()
        setDisponibilidad(data)
      }
    } catch (error) {
      console.error('Error fetching disponibilidad:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReservas = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/reservas/fecha/${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setReservas(data)
      }
    } catch (error) {
      console.error('Error fetching reservas:', error)
    }
  }

  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay()
    const config = disponibilidad.find(d => d.diaSemana === dayOfWeek && d.activo)
    return !!config && !isBefore(date, startOfDay(new Date()))
  }

  const getAvailableTimeSlots = (date: Date): string[] => {
    if (!selectedDate || !isSameDay(date, selectedDate)) return []
    
    const dayOfWeek = date.getDay()
    const config = disponibilidad.find(d => d.diaSemana === dayOfWeek && d.activo)
    
    if (!config) return []

    const slots: string[] = []
    const [startHour, startMinute] = config.horaInicio.split(':').map(Number)
    const [endHour, endMinute] = config.horaFin.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    // Generate slots every 30 minutes
    for (let time = startTime; time + serviceDuration <= endTime; time += 30) {
      const hour = Math.floor(time / 60)
      const minute = time % 60
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      // Check if this time slot conflicts with existing reservations
      const isReserved = reservas.some(reserva => {
        const reservaTime = new Date(reserva.fechaHora)
        const reservaHour = reservaTime.getHours()
        const reservaMinute = reservaTime.getMinutes()
        const reservaTimeInMinutes = reservaHour * 60 + reservaMinute
        
        return time < reservaTimeInMinutes + serviceDuration && time + serviceDuration > reservaTimeInMinutes
      })
      
      if (!isReserved) {
        slots.push(timeStr)
      }
    }
    
    return slots
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let day = startDate

    while (day <= endDate) {
      const currentDay = day
      const isCurrentMonth = isSameMonth(currentDay, monthStart)
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate)
      const isAvailable = isDateAvailable(currentDay)
      const isTodayDate = isToday(currentDay)

      days.push(
        <button
          key={currentDay.toString()}
          onClick={() => isAvailable && onDateSelect(currentDay)}
          disabled={!isAvailable}
          className={cn(
            'h-10 w-10 rounded-lg text-sm font-medium transition-colors',
            'hover:bg-spa-neutral focus:outline-none focus:ring-2 focus:ring-spa-primary',
            {
              'text-gray-300': !isCurrentMonth,
              'text-gray-900': isCurrentMonth && !isSelected && !isTodayDate,
              'bg-spa-primary text-white': isSelected,
              'bg-blue-100 text-blue-900 font-bold': isTodayDate && !isSelected,
              'cursor-not-allowed opacity-50': !isAvailable,
              'hover:bg-spa-primary/10': isAvailable && !isSelected
            }
          )}
        >
          {format(currentDay, 'd')}
        </button>
      )
      day = addDays(day, 1)
    }

    return days
  }

  const timeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : []

  if (loading) {
    return <Loading text="Cargando calendario..." />
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              >
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-spa-primary rounded mr-2"></div>
                <span>Fecha seleccionada</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span>Hoy</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                <span>No disponible</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Horarios disponibles - {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onTimeSelect(time)}
                    className="h-10"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">😔 No hay horarios disponibles</p>
                <p className="text-sm">
                  Por favor selecciona otra fecha o contacta directamente al spa.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}