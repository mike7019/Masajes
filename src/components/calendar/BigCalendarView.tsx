'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, momentLocalizer, View, Views, Event } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format, parseISO, addMinutes, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, Loading, Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { DisponibilidadConfig, Reserva, ReservaConServicio } from '@/types'

// Configure moment for Spanish locale
moment.locale('es')
const localizer = momentLocalizer(moment)

interface CalendarEvent extends Event {
  id: string
  type: 'reserva' | 'blocked' | 'available'
  reserva?: ReservaConServicio
  status?: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'
}

interface BigCalendarViewProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onEventSelect?: (event: CalendarEvent) => void
  view?: 'month' | 'week' | 'day'
  showAvailableSlots?: boolean
  className?: string
}

export function BigCalendarView({
  selectedDate,
  onDateSelect,
  onEventSelect,
  view = 'month',
  showAvailableSlots = false,
  className
}: BigCalendarViewProps) {
  const [currentView, setCurrentView] = useState<View>(view as View)
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [currentDate, currentView])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch availability configuration
      const availabilityResponse = await fetch('/api/disponibilidad')
      const availabilityData = await availabilityResponse.json()
      setDisponibilidad(availabilityData)

      // Fetch reservations for the current view period
      const startDate = getViewStartDate()
      const endDate = getViewEndDate()
      
      const reservationsResponse = await fetch(
        `/api/reservas/search?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      )
      const reservationsData = await reservationsResponse.json()

      // Fetch blocked hours for the current view period
      const blockedHoursResponse = await fetch(
        `/api/admin/horarios-bloqueados?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&activo=true`
      )
      const blockedHoursData = await blockedHoursResponse.json()

      // Convert reservations to calendar events
      const reservationEvents: CalendarEvent[] = reservationsData.map((reserva: ReservaConServicio) => ({
        id: reserva.id,
        title: `${reserva.servicio.nombre} - ${reserva.clienteNombre}`,
        start: new Date(reserva.fechaHora),
        end: addMinutes(new Date(reserva.fechaHora), reserva.servicio.duracion),
        type: 'reserva',
        reserva,
        status: reserva.estado,
        resource: {
          backgroundColor: getEventColor(reserva.estado),
          textColor: '#fff'
        }
      }))

      // Convert blocked hours to calendar events
      const blockedEvents: CalendarEvent[] = blockedHoursData.map((blocked: any) => ({
        id: `blocked-${blocked.id}`,
        title: `🚫 ${blocked.motivo}`,
        start: parseISO(blocked.fechaInicio),
        end: parseISO(blocked.fechaFin),
        type: 'blocked',
        resource: {
          backgroundColor: '#ef4444',
          textColor: '#fff',
          borderColor: '#dc2626'
        }
      }))

      let allEvents = [...reservationEvents, ...blockedEvents]

      // Add available slots if requested
      if (showAvailableSlots) {
        const availableSlots = generateAvailableSlots(availabilityData, reservationsData, startDate, endDate, blockedHoursData)
        allEvents = [...allEvents, ...availableSlots]
      }

      setEvents(allEvents)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getViewStartDate = () => {
    switch (currentView) {
      case Views.MONTH:
        return startOfDay(moment(currentDate).startOf('month').startOf('week').toDate())
      case Views.WEEK:
        return startOfDay(moment(currentDate).startOf('week').toDate())
      case Views.DAY:
        return startOfDay(currentDate)
      default:
        return startOfDay(currentDate)
    }
  }

  const getViewEndDate = () => {
    switch (currentView) {
      case Views.MONTH:
        return endOfDay(moment(currentDate).endOf('month').endOf('week').toDate())
      case Views.WEEK:
        return endOfDay(moment(currentDate).endOf('week').toDate())
      case Views.DAY:
        return endOfDay(currentDate)
      default:
        return endOfDay(currentDate)
    }
  }

  const generateAvailableSlots = (
    availability: DisponibilidadConfig[],
    reservations: ReservaConServicio[],
    startDate: Date,
    endDate: Date,
    blockedHours: any[] = []
  ): CalendarEvent[] => {
    const slots: CalendarEvent[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      const dayConfig = availability.find(d => d.diaSemana === dayOfWeek && d.activo)

      if (dayConfig) {
        const [startHour, startMinute] = dayConfig.horaInicio.split(':').map(Number)
        const [endHour, endMinute] = dayConfig.horaFin.split(':').map(Number)
        
        const startTime = startHour * 60 + startMinute
        const endTime = endHour * 60 + endMinute
        
        // Generate 30-minute slots
        for (let time = startTime; time < endTime; time += 30) {
          const hour = Math.floor(time / 60)
          const minute = time % 60
          
          const slotStart = new Date(current)
          slotStart.setHours(hour, minute, 0, 0)
          
          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotEnd.getMinutes() + 30)

          // Check if slot conflicts with existing reservations
          const hasReservationConflict = reservations.some(reserva => {
            const reservaStart = new Date(reserva.fechaHora)
            const reservaEnd = addMinutes(reservaStart, reserva.servicio.duracion)
            
            return isWithinInterval(slotStart, { start: reservaStart, end: reservaEnd }) ||
                   isWithinInterval(slotEnd, { start: reservaStart, end: reservaEnd }) ||
                   (slotStart <= reservaStart && slotEnd >= reservaEnd)
          })

          // Check if slot conflicts with blocked hours
          const hasBlockedConflict = blockedHours.some(blocked => {
            const blockedStart = parseISO(blocked.fechaInicio)
            const blockedEnd = parseISO(blocked.fechaFin)
            
            return isWithinInterval(slotStart, { start: blockedStart, end: blockedEnd }) ||
                   isWithinInterval(slotEnd, { start: blockedStart, end: blockedEnd }) ||
                   (slotStart <= blockedStart && slotEnd >= blockedEnd)
          })

          const hasConflict = hasReservationConflict || hasBlockedConflict

          if (!hasConflict) {
            slots.push({
              id: `available-${slotStart.getTime()}`,
              title: 'Disponible',
              start: slotStart,
              end: slotEnd,
              type: 'available',
              resource: {
                backgroundColor: '#e5f7e5',
                textColor: '#2d5a2d',
                borderColor: '#4ade80'
              }
            })
          }
        }
      }

      current.setDate(current.getDate() + 1)
    }

    return slots
  }

  const getEventColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADA':
        return '#10b981' // green
      case 'PENDIENTE':
        return '#f59e0b' // amber
      case 'CANCELADA':
        return '#ef4444' // red
      case 'COMPLETADA':
        return '#6366f1' // indigo
      default:
        return '#6b7280' // gray
    }
  }

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onEventSelect?.(event)
  }, [onEventSelect])

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    onDateSelect?.(start)
  }, [onDateSelect])

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view)
  }, [])

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const style: any = {
      backgroundColor: event.resource?.backgroundColor || '#3174ad',
      borderRadius: '4px',
      opacity: 0.8,
      color: event.resource?.textColor || 'white',
      border: event.resource?.borderColor ? `2px solid ${event.resource.borderColor}` : 'none',
      fontSize: '12px',
      padding: '2px 4px'
    }

    if (event.type === 'available') {
      style.opacity = 0.6
      style.fontWeight = 'normal'
    } else if (event.type === 'reserva') {
      style.fontWeight = 'bold'
    }

    return { style }
  }, [])

  const dayPropGetter = useCallback((date: Date) => {
    const dayOfWeek = date.getDay()
    const dayConfig = disponibilidad.find(d => d.diaSemana === dayOfWeek && d.activo)
    
    if (!dayConfig) {
      return {
        style: {
          backgroundColor: '#f3f4f6',
          color: '#9ca3af'
        }
      }
    }

    return {}
  }, [disponibilidad])

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+ Ver más (${total})`
  }

  if (loading) {
    return <Loading text="Cargando calendario..." />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <span className="mr-2">📅</span>
            Calendario de Reservas
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={showAvailableSlots ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                // This would be controlled by parent component
                // For now, we'll just refresh
                fetchData()
              }}
            >
              {showAvailableSlots ? 'Ocultar disponibilidad' : 'Mostrar disponibilidad'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={currentView}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            messages={messages}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              agendaTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              dayFormat: 'dddd DD/MM',
              dayHeaderFormat: 'dddd DD/MM',
              dayRangeHeaderFormat: ({ start, end }) => 
                `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`,
              monthHeaderFormat: 'MMMM YYYY',
              weekdayFormat: 'dddd'
            }}
            min={new Date(2024, 0, 1, 8, 0)} // 8:00 AM
            max={new Date(2024, 0, 1, 22, 0)} // 10:00 PM
            step={30}
            timeslots={2}
            className="rbc-calendar-custom"
          />
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Leyenda:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Confirmada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
              <span>Pendiente</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Cancelada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-indigo-500 rounded mr-2"></div>
              <span>Completada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Bloqueado</span>
            </div>
            {showAvailableSlots && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded mr-2"></div>
                <span>Disponible</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}