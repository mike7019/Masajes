"use client"

import { useState } from 'react'
import { CheckCircle, XCircle, Mail, Download, Trash2 } from 'lucide-react'

interface ReservasBulkActionsProps {
  selectedReservas: string[]
  onClearSelection: () => void
  onBulkAction: (action: string, data?: any) => void
  isLoading: boolean
}

export function ReservasBulkActions({ 
  selectedReservas, 
  onClearSelection, 
  onBulkAction,
  isLoading 
}: ReservasBulkActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ action: string; data?: any } | null>(null)

  const handleBulkAction = (action: string, data?: any) => {
    setPendingAction({ action, data })
    setShowConfirmDialog(true)
  }

  const confirmAction = () => {
    if (pendingAction) {
      onBulkAction(pendingAction.action, pendingAction.data)
    }
    setShowConfirmDialog(false)
    setPendingAction(null)
  }

  const getActionMessage = () => {
    if (!pendingAction) return ''
    
    const count = selectedReservas.length
    switch (pendingAction.action) {
      case 'confirm':
        return `¿Confirmar ${count} reserva${count > 1 ? 's' : ''}?`
      case 'cancel':
        return `¿Cancelar ${count} reserva${count > 1 ? 's' : ''}?`
      case 'complete':
        return `¿Marcar como completada${count > 1 ? 's' : ''} ${count} reserva${count > 1 ? 's' : ''}?`
      case 'delete':
        return `¿Eliminar ${count} reserva${count > 1 ? 's' : ''}? Esta acción no se puede deshacer.`
      case 'sendReminder':
        return `¿Enviar recordatorio a ${count} cliente${count > 1 ? 's' : ''}?`
      default:
        return `¿Realizar esta acción en ${count} reserva${count > 1 ? 's' : ''}?`
    }
  }

  if (selectedReservas.length === 0) {
    return null
  }

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-indigo-900">
              {selectedReservas.length} reserva{selectedReservas.length > 1 ? 's' : ''} seleccionada{selectedReservas.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Limpiar selección
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('confirm')}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmar
            </button>
            
            <button
              onClick={() => handleBulkAction('complete')}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Completar
            </button>
            
            <button
              onClick={() => handleBulkAction('sendReminder')}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <Mail className="h-3 w-3 mr-1" />
              Recordatorio
            </button>
            
            <button
              onClick={() => handleBulkAction('export')}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </button>
            
            <button
              onClick={() => handleBulkAction('cancel')}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Acción
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {getActionMessage()}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 ${
                  pendingAction?.action === 'delete' || pendingAction?.action === 'cancel'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}