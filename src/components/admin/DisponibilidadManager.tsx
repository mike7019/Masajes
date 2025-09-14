'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HorariosTrabajoManager } from './HorariosTrabajoManager'
import { FechasBloqueadasManager } from './FechasBloqueadasManager'
import { CalendarioDisponibilidad } from './CalendarioDisponibilidad'

export function DisponibilidadManager() {
  const [activeTab, setActiveTab] = useState('horarios')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="horarios">Horarios de Trabajo</TabsTrigger>
          <TabsTrigger value="bloqueos">Fechas Bloqueadas</TabsTrigger>
          <TabsTrigger value="calendario">Vista de Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="horarios" className="space-y-6">
          <HorariosTrabajoManager />
        </TabsContent>

        <TabsContent value="bloqueos" className="space-y-6">
          <FechasBloqueadasManager />
        </TabsContent>

        <TabsContent value="calendario" className="space-y-6">
          <CalendarioDisponibilidad />
        </TabsContent>
      </Tabs>
    </div>
  )
}