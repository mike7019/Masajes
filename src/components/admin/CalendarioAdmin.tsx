"use client"

import { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCalendarData } from '@/hooks/useDashboard'
import { Filter, Calendar as CalendarIcon } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

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
  noEventsInRange: 'No hay reservas en este rango de fechas',
  showMore: (total: number) => `+ Ver más (${total})`,
}

interface CalendarioAdminProps {
  className?: string
}

export function CalendarioAdmin({ className = '' }: CalendarioAdminProps) {
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [fechaInicio, setFechaInicio] = useState<Date>()
  const [fechaFin, setFechaFin] = useState<Date>()
  
  const { eventos, isLoading, error } = useCalendarData(fechaInicio, fechaFin, filtroEstado)

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad'
    
    switch (event.resource?.estado) {
      case 'PENDIENTE':
        backgroundColor = '#f59e0b'
        break
      case 'CONFIRMADA':
        backgroundColor = '#10b981'
        break
      case 'CANCELADA':
        backgroundColor = '#ef4444'
        break
      case 'COMPLETADA':
        backgroundColor = '#6366f1'
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  const handleSelectEvent = (event: any) => {
    // Aquí puedes abrir un modal con los detalles de la reserva
    console.log('Reserva seleccionada:', event.resource)
    // TODO: Implementar modal de detalles de reserva
  }

  const handleSelectSlot = (slotInfo: any) => {
    // Permitir crear nueva reserva en el slot seleccionado
    console.log('Slot seleccionado:', slotInfo)
    // TODO: Implementar modal de nueva reserva
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">Error al cargar el calendario: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Calendario de Reservas</h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="CONFIRMADA">Confirmadas</option>
                <option value="CANCELADA">Canceladas</option>
                <option value="COMPLETADA">Completadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              culture="es"
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              popup
              showMultiDayTimes
              step={30}
              timeslots={2}
              min={new Date(2024, 0, 1, 8, 0)} // 8:00 AM
              max={new Date(2024, 0, 1, 20, 0)} // 8:00 PM
            />
          </div>
        )}
      </div>
      
      {/* Leyenda de colores */}
      <div className="px-6 pb-6">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Confirmada</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Cancelada</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded mr-2"></div>
            <span>Completada</span>
          </div>
        </div>
      </div>
    </div>
  )
}