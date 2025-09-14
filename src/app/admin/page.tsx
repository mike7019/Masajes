"use client"

import { useState } from "react"
import { Calendar, Users, Settings, RefreshCw, Filter } from "lucide-react"
import { useAdminAuth } from "@/hooks/useAuth"
import { useDashboard } from "@/hooks/useDashboard"
import { DashboardStats } from "@/components/admin/DashboardStats"
import { ProximasReservas } from "@/components/admin/ProximasReservas"
import { ServiciosPopulares } from "@/components/admin/ServiciosPopulares"
import { CalendarioAdmin } from "@/components/admin/CalendarioAdmin"
import { FiltrosReservas } from "@/components/admin/FiltrosReservas"
import { ActividadReciente } from "@/components/admin/ActividadReciente"
import { ResumenRapido } from "@/components/admin/ResumenRapido"

export default function AdminDashboard() {
  const { session, isLoading: authLoading } = useAdminAuth()
  const { data, isLoading: dashboardLoading, error, refetch } = useDashboard()
  const [vistaActual, setVistaActual] = useState<'resumen' | 'calendario'>('resumen')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'TODOS',
    fechaInicio: '',
    fechaFin: '',
  })

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error al cargar el dashboard: {error}</div>
        <button
          onClick={refetch}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setVistaActual('resumen')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                vistaActual === 'resumen'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setVistaActual('calendario')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                vistaActual === 'calendario'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendario
            </button>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              mostrarFiltros
                ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={refetch}
            disabled={dashboardLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white rounded-lg shadow p-6">
          <FiltrosReservas
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />
        </div>
      )}

      {vistaActual === 'resumen' ? (
        <>
          {/* Estadísticas */}
          <DashboardStats
            reservasHoy={data?.reservasHoy || 0}
            reservasDelMes={data?.reservasDelMes || 0}
            totalClientes={data?.totalClientes || 0}
            ingresosMes={data?.ingresosMes || 0}
            tendencias={data?.tendencias}
            isLoading={dashboardLoading}
          />

          {/* Resumen rápido */}
          <ResumenRapido
            reservasHoy={data?.reservasHoy || 0}
            reservasPendientes={data?.estadisticasHoy?.reservasPendientes || 0}
            reservasConfirmadas={data?.estadisticasHoy?.reservasConfirmadas || 0}
            reservasCanceladas={data?.estadisticasHoy?.reservasCanceladas || 0}
            isLoading={dashboardLoading}
          />

          {/* Grid de contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Próximas reservas */}
            <ProximasReservas
              reservas={data?.proximasReservas || []}
              isLoading={dashboardLoading}
            />

            {/* Servicios populares */}
            <ServiciosPopulares
              servicios={data?.serviciosPopulares || []}
              isLoading={dashboardLoading}
            />

            {/* Actividad reciente */}
            <ActividadReciente
              isLoading={dashboardLoading}
            />
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => window.location.href = '/admin/reservas'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-8 w-8 text-indigo-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Nueva Reserva</div>
                <div className="text-xs text-gray-500 text-center">Crear reserva manual</div>
              </button>
              
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Gestionar Clientes</div>
                <div className="text-xs text-gray-500 text-center">Ver lista de clientes</div>
              </button>
              
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-8 w-8 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Configurar Horarios</div>
                <div className="text-xs text-gray-500 text-center">Gestionar disponibilidad</div>
              </button>
              
              <button 
                onClick={() => setVistaActual('calendario')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-8 w-8 text-orange-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Ver Calendario</div>
                <div className="text-xs text-gray-500 text-center">Agenda completa</div>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Vista de calendario */
        <CalendarioAdmin />
      )}
    </div>
  )
}