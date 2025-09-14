'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Modal, Loading } from '@/components/ui'
import { HorarioBloqueado } from '@/types'
import { useToast } from '@/components/ui'

interface BlockedHoursManagerProps {
  onBlockedHoursChange?: () => void
}

export function BlockedHoursManager({ onBlockedHoursChange }: BlockedHoursManagerProps) {
  const [blockedHours, setBlockedHours] = useState<HorarioBloqueado[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<HorarioBloqueado | null>(null)
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
    descripcion: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    fetchBlockedHours()
  }, [])

  const fetchBlockedHours = async () => {
    try {
      const response = await fetch('/api/admin/horarios-bloqueados?activo=true')
      if (response.ok) {
        const data = await response.json()
        setBlockedHours(data)
      }
    } catch (error) {
      console.error('Error fetching blocked hours:', error)
      addToast({
        type: 'error',
        message: 'Error al cargar los horarios bloqueados'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlock = () => {
    setFormData({
      fechaInicio: '',
      fechaFin: '',
      motivo: '',
      descripcion: ''
    })
    setEditingBlock(null)
    setShowCreateModal(true)
  }

  const handleEditBlock = (block: HorarioBloqueado) => {
    setFormData({
      fechaInicio: format(parseISO(block.fechaInicio.toString()), "yyyy-MM-dd'T'HH:mm"),
      fechaFin: format(parseISO(block.fechaFin.toString()), "yyyy-MM-dd'T'HH:mm"),
      motivo: block.motivo,
      descripcion: block.descripcion || ''
    })
    setEditingBlock(block)
    setShowCreateModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingBlock 
        ? '/api/admin/horarios-bloqueados'
        : '/api/admin/horarios-bloqueados'
      
      const method = editingBlock ? 'PUT' : 'POST'
      
      const body = editingBlock
        ? { id: editingBlock.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        addToast({
          type: 'success',
          message: editingBlock 
            ? 'Horario bloqueado actualizado correctamente'
            : 'Horario bloqueado creado correctamente'
        })
        setShowCreateModal(false)
        await fetchBlockedHours()
        onBlockedHoursChange?.()
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          message: error.error || 'Error al guardar el horario bloqueado'
        })
      }
    } catch (error) {
      console.error('Error submitting blocked hour:', error)
      addToast({
        type: 'error',
        message: 'Error al guardar el horario bloqueado'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario bloqueado?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/horarios-bloqueados?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addToast({
          type: 'success',
          message: 'Horario bloqueado eliminado correctamente'
        })
        await fetchBlockedHours()
        onBlockedHoursChange?.()
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          message: error.error || 'Error al eliminar el horario bloqueado'
        })
      }
    } catch (error) {
      console.error('Error deleting blocked hour:', error)
      addToast({
        type: 'error',
        message: 'Error al eliminar el horario bloqueado'
      })
    }
  }

  const handleToggleActive = async (block: HorarioBloqueado) => {
    try {
      const response = await fetch('/api/admin/horarios-bloqueados', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: block.id,
          activo: !block.activo
        })
      })

      if (response.ok) {
        addToast({
          type: 'success',
          message: `Horario bloqueado ${!block.activo ? 'activado' : 'desactivado'} correctamente`
        })
        await fetchBlockedHours()
        onBlockedHoursChange?.()
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          message: error.error || 'Error al actualizar el horario bloqueado'
        })
      }
    } catch (error) {
      console.error('Error toggling blocked hour:', error)
      addToast({
        type: 'error',
        message: 'Error al actualizar el horario bloqueado'
      })
    }
  }

  if (loading) {
    return <Loading text="Cargando horarios bloqueados..." />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <span className="mr-2">🚫</span>
              Horarios Bloqueados
            </CardTitle>
            <Button onClick={handleCreateBlock}>
              Bloquear Horario
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Gestiona los períodos de tiempo bloqueados para mantenimiento, vacaciones, etc.
          </p>
        </CardHeader>
        <CardContent>
          {blockedHours.length > 0 ? (
            <div className="space-y-4">
              {blockedHours.map(block => (
                <div key={block.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{block.motivo}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        block.activo 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {block.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Desde:</strong> {format(parseISO(block.fechaInicio.toString()), 'PPpp', { locale: es })}
                      </p>
                      <p>
                        <strong>Hasta:</strong> {format(parseISO(block.fechaFin.toString()), 'PPpp', { locale: es })}
                      </p>
                      {block.descripcion && (
                        <p className="mt-1">
                          <strong>Descripción:</strong> {block.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(block)}
                    >
                      {block.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBlock(block)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold mb-2">No hay horarios bloqueados</h3>
              <p className="mb-4">Crea bloqueos de horario para mantenimiento, vacaciones o eventos especiales.</p>
              <Button onClick={handleCreateBlock}>
                Crear primer bloqueo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingBlock ? 'Editar Horario Bloqueado' : 'Bloquear Horario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora de inicio *
            </label>
            <Input
              type="datetime-local"
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora de fin *
            </label>
            <Input
              type="datetime-local"
              value={formData.fechaFin}
              onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo *
            </label>
            <Input
              type="text"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="ej. Mantenimiento, Vacaciones, Evento especial"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Detalles adicionales sobre el bloqueo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : (editingBlock ? 'Actualizar' : 'Crear Bloqueo')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}