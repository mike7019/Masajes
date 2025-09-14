'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Loading } from '@/components/ui'

interface ContactStats {
  totalMensajes: number
  mensajesHoy: number
  mensajesSemana: number
  tiposConsulta: Array<{
    tipo: string
    count: number
    label: string
  }>
  promedioRespuesta: number
}

export function ContactStats() {
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/contact-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching contact stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Cargando estadísticas de contacto..." />
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No se pudieron cargar las estadísticas
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalMensajes}
            </div>
            <div className="text-sm text-gray-600">Total Mensajes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.mensajesHoy}
            </div>
            <div className="text-sm text-gray-600">Mensajes Hoy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.mensajesSemana}
            </div>
            <div className="text-sm text-gray-600">Esta Semana</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.promedioRespuesta}h
            </div>
            <div className="text-sm text-gray-600">Tiempo Promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Types of Inquiries */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.tiposConsulta.map((tipo) => (
              <div key={tipo.tipo} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="font-medium">{tipo.label}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">{tipo.count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(tipo.count / Math.max(...stats.tiposConsulta.map(t => t.count))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}