"use client"

import { useState, useEffect } from 'react'

interface DashboardData {
  reservasHoy: number
  reservasDelMes: number
  totalClientes: number
  ingresosMes: number
  tendencias?: {
    reservasHoy: number
    reservasDelMes: number
    totalClientes: number
    ingresosMes: number
  }
  estadisticasHoy?: {
    reservasPendientes: number
    reservasConfirmadas: number
    reservasCanceladas: number
    reservasCompletadas: number
  }
  proximasReservas: Array<{
    id: string
    clienteNombre: string
    servicio: string
    fechaHora: string
    estado: string
  }>
  serviciosPopulares: Array<{
    nombre: string
    cantidad: number
  }>
  reservasDetalle: Array<{
    id: string
    clienteNombre: string
    clienteEmail: string
    clienteTelefono: string
    servicio: string
    fechaHora: string
    estado: string
    precio: number
  }>
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/dashboard')
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
  }
}

export function useCalendarData(start?: Date, end?: Date, estado?: string) {
  const [eventos, setEventos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (start) params.append('start', start.toISOString())
      if (end) params.append('end', end.toISOString())
      if (estado) params.append('estado', estado)

      const response = await fetch(`/api/admin/reservas/calendario?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del calendario')
      }

      const calendarData = await response.json()
      setEventos(calendarData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendarData()
  }, [start, end, estado])

  return {
    eventos,
    isLoading,
    error,
    refetch: fetchCalendarData,
  }
}