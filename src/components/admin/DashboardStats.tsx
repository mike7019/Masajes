"use client"

import { Calendar, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

interface DashboardStatsProps {
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
  isLoading?: boolean
}

export function DashboardStats({
  reservasHoy,
  reservasDelMes,
  totalClientes,
  ingresosMes,
  tendencias,
  isLoading = false
}: DashboardStatsProps) {
  const calcularCambio = (actual: number, anterior: number) => {
    if (anterior === 0) return { porcentaje: 0, tipo: 'neutral' as const }
    const cambio = ((actual - anterior) / anterior) * 100
    return {
      porcentaje: Math.abs(cambio),
      tipo: cambio > 0 ? 'positive' as const : cambio < 0 ? 'negative' as const : 'neutral' as const
    }
  }

  const formatearCambio = (cambio: { porcentaje: number; tipo: 'positive' | 'negative' | 'neutral' }) => {
    const signo = cambio.tipo === 'positive' ? '+' : cambio.tipo === 'negative' ? '-' : ''
    return `${signo}${cambio.porcentaje.toFixed(1)}%`
  }

  const stats = [
    {
      name: 'Reservas de Hoy',
      value: reservasHoy,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: tendencias ? calcularCambio(reservasHoy, tendencias.reservasHoy) : null,
    },
    {
      name: 'Reservas del Mes',
      value: reservasDelMes,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: tendencias ? calcularCambio(reservasDelMes, tendencias.reservasDelMes) : null,
    },
    {
      name: 'Total Clientes',
      value: totalClientes,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: tendencias ? calcularCambio(totalClientes, tendencias.totalClientes) : null,
    },
    {
      name: 'Ingresos del Mes',
      value: `$${ingresosMes.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: tendencias ? calcularCambio(ingresosMes, tendencias.ingresosMes) : null,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.change?.tipo === 'positive' ? TrendingUp : 
                          stat.change?.tipo === 'negative' ? TrendingDown : null
        
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            {stat.change && (
              <div className="mt-4 flex items-center text-sm">
                {TrendIcon && (
                  <TrendIcon className={`h-4 w-4 mr-1 ${
                    stat.change.tipo === 'positive' ? 'text-green-600' : 
                    stat.change.tipo === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                )}
                <span className={`font-medium ${
                  stat.change.tipo === 'positive' ? 'text-green-600' : 
                  stat.change.tipo === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {formatearCambio(stat.change)}
                </span>
                <span className="text-gray-500 ml-1">vs mes anterior</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}