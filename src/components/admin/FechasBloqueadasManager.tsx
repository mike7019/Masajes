'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/Toast'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface HorarioBloqueado {
  id: string
  fechaInicio: string
  fechaFin: string
  motivo: string
  descripcion?: string
  activo: boolean
  creadoEn: string
}

export function FechasBloqueadasManager() {
  const [bloqueos, setBloqueos] = useState<HorarioBloqueado[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
    descripcion: ''
  })

  useEffect(() => {
    cargarBloqueos()
  }, [])

  const cargarBloqueos = async () => {
    try {
      const response = await fetch('/api/admin/disponibilidad/bloqueos')
      if (response.ok) {
        const data = await response.json()
        setBloqueos(data)
      } else {
        addToast({ message: 'Error al cargar los bloqueos', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      addToast({ message: 'Error al cargar los bloqueos', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fechaInicio: '',
      fechaFin: '',
      motivo: '',
      descripcion: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.fechaInicio || !formData.fechaFin || !formData.motivo) {
      addToast({ message: 'Todos los campos obligatorios deben estar completos', type: 'error' })
      return
    }

    if (formData.fechaInicio > formData.fechaFin) {
      addToast({ message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin', type: 'error' })
      return
    }

    try {
      const url = editingId 
        ? `/api/admin/disponibilidad/bloqueos/${editingId}`
        : '/api/admin/disponibilidad/bloqueos'
      
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        addToast({ message: editingId ? 'Bloqueo actualizado correctamente' : 'Bloqueo creado correctamente', type: 'success' })
        await cargarBloqueos()
        resetForm()
      } else {
        const error = await response.json()
        addToast({ message: error.message || 'Error al guardar el bloqueo', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      addToast({ message: 'Error al guardar el bloqueo', type: 'error' })
    }
  }

  const editarBloqueo = (bloqueo: HorarioBloqueado) => {
    setFormData({
      fechaInicio: bloqueo.fechaInicio.split('T')[0],
      fechaFin: bloqueo.fechaFin.split('T')[0],
      motivo: bloqueo.motivo,
      descripcion: bloqueo.descripcion || ''
    })
    setEditingId(bloqueo.id)
    setShowForm(true)
  }

  const eliminarBloqueo = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este bloqueo?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/disponibilidad/bloqueos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        addToast({ message: 'Bloqueo eliminado correctamente', type: 'success' })
        await cargarBloqueos()
      } else {
        const error = await response.json()
        addToast({ message: error.message || 'Error al eliminar el bloqueo', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar el bloqueo')
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      const response = await fetch(`/api/admin/disponibilidad/bloqueos/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo }),
      })

      if (response.ok) {
        addToast({ message: `Bloqueo ${activo ? 'activado' : 'desactivado'} correctamente`, type: 'success' })
        await cargarBloqueos()
      } else {
        const error = await response.json()
        addToast({ message: error.message || 'Error al actualizar el bloqueo', type: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      addToast({ message: 'Error al actualizar el bloqueo', type: 'error' })
    }
  }

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Fechas Bloqueadas</CardTitle>
              <CardDescription>
                Gestiona los períodos en los que no se pueden hacer reservas (vacaciones, mantenimiento, etc.)
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              Nuevo Bloqueo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={manejarSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 mb-6">
              <h3 className="font-medium">
                {editingId ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha de Fin *</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo *</Label>
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Ej: Vacaciones, Mantenimiento, Evento especial"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Detalles adicionales sobre el bloqueo"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? 'Actualizar' : 'Crear'} Bloqueo
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {bloqueos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay fechas bloqueadas configuradas
              </p>
            ) : (
              bloqueos.map((bloqueo) => (
                <div key={bloqueo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{bloqueo.motivo}</h4>
                      <Badge variant={bloqueo.activo ? 'default' : 'secondary'}>
                        {bloqueo.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(bloqueo.fechaInicio), 'dd/MM/yyyy', { locale: es })} - {' '}
                      {format(parseISO(bloqueo.fechaFin), 'dd/MM/yyyy', { locale: es })}
                    </p>
                    {bloqueo.descripcion && (
                      <p className="text-sm text-gray-500 mt-1">{bloqueo.descripcion}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActivo(bloqueo.id, !bloqueo.activo)}
                    >
                      {bloqueo.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editarBloqueo(bloqueo)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarBloqueo(bloqueo.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}