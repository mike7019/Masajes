'use client'

import { useState, useEffect } from 'react'
import { format, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface TimeSlot {
  time: string
  available: boolean
  reserved?: boolean
}

interface TimeSlotPickerProps {
  selectedDate: Date
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  serviceDuration: number
  className?: string
}

export function TimeSlotPicker({ 
  selectedDate, 
  selectedTime, 
  onTimeSelect, 
  serviceDuration,
  className 
}: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedDate, serviceDuration])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      // Get availability for the day
      const dayOfWeek = selectedDate.getDay()
      const availabilityResponse = await fetch('/api/disponibilidad')
      const availability = await availabilityResponse.json()
      
      const dayConfig = availability.find((d: any) => d.diaSemana === dayOfWeek && d.activo)
      
      if (!dayConfig) {
        setTimeSlots([])
        return
      }

      // Get existing reservations for the date
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const reservationsResponse = await fetch(`/api/reservas/fecha/${dateStr}`)
      const reservations = await reservationsResponse.json()

      // Get blocked hours for the date
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)
      
      const blockedHoursResponse = await fetch(
        `/api/admin/horarios-bloqueados?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}&activo=true`
      )
      const blockedHours = await blockedHoursResponse.json()

      // Generate time slots
      const slots = generateTimeSlots(dayConfig, reservations, serviceDuration, blockedHours)
      setTimeSlots(slots)
    } catch (error) {
      console.error('Error fetching time slots:', error)
      setTimeSlots([])
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = (dayConfig: any, reservations: any[], duration: number, blockedHours: any[] = []): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const [startHour, startMinute] = dayConfig.horaInicio.split(':').map(Number)
    const [endHour, endMinute] = dayConfig.horaFin.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    // Generate slots every 30 minutes
    for (let time = startTime; time + duration <= endTime; time += 30) {
      const hour = Math.floor(time / 60)
      const minute = time % 60
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      // Check if this time slot conflicts with existing reservations
      const isReserved = reservations.some(reserva => {
        const reservaTime = new Date(reserva.fechaHora)
        const reservaHour = reservaTime.getHours()
        const reservaMinute = reservaTime.getMinutes()
        const reservaTimeInMinutes = reservaHour * 60 + reservaMinute
        
        return time < reservaTimeInMinutes + duration && time + duration > reservaTimeInMinutes
      })
      
      // Check if it's in the past (for today)
      const now = new Date()
      const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes()
      const isPast = isToday && time <= currentTimeInMinutes

      // Check if this time slot conflicts with blocked hours
      const slotStart = new Date(selectedDate)
      slotStart.setHours(hour, minute, 0, 0)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + duration)

      const isBlocked = blockedHours.some(blocked => {
        const blockedStart = new Date(blocked.fechaInicio)
        const blockedEnd = new Date(blocked.fechaFin)
        
        return (slotStart >= blockedStart && slotStart < blockedEnd) ||
               (slotEnd > blockedStart && slotEnd <= blockedEnd) ||
               (slotStart <= blockedStart && slotEnd >= blockedEnd)
      })
      
      slots.push({
        time: timeStr,
        available: !isReserved && !isPast && !isBlocked,
        reserved: isReserved || isBlocked
      })
    }
    
    return slots
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spa-primary"></div>
            <span className="ml-2 text-gray-600">Cargando horarios...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <span className="mr-2">🕒</span>
          Horarios disponibles
        </CardTitle>
        <p className="text-sm text-gray-600">
          {format(selectedDate, 'EEEE, d \'de\' MMMM', { locale: es })} • Duración: {serviceDuration} min
        </p>
      </CardHeader>
      <CardContent>
        {timeSlots.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {timeSlots.map(slot => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => slot.available && onTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    'h-12 text-sm font-medium transition-all',
                    {
                      'opacity-50 cursor-not-allowed': !slot.available,
                      'hover:scale-105': slot.available && selectedTime !== slot.time,
                      'ring-2 ring-spa-primary ring-offset-2': selectedTime === slot.time
                    }
                  )}
                >
                  <div className="text-center">
                    <div className="font-semibold">{slot.time}</div>
                    {slot.reserved && (
                      <div className="text-xs opacity-75">Ocupado</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-spa-primary rounded mr-2"></div>
                  <span>Seleccionado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-gray-300 rounded mr-2"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                  <span>Ocupado</span>
                </div>
              </div>
              <div className="text-xs">
                Horarios cada 30 minutos
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">😔</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay horarios disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              Este día no tenemos disponibilidad o ya están todos los horarios reservados.
            </p>
            <div className="text-sm text-gray-500">
              <p>💡 Prueba seleccionando otra fecha</p>
              <p>📞 O contáctanos directamente: +1 (234) 567-890</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}