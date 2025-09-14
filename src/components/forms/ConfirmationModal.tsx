'use client'

import { Modal, Button } from '@/components/ui'
import { ServicioConPromociones } from '@/types'
import { ReservaFormData } from '@/lib/validation/reserva'
import { calculateDiscountedPrice, formatPrice } from '@/components/ui/PromotionBadge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  servicio: ServicioConPromociones
  formData: Partial<ReservaFormData>
  fechaHora: Date
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  servicio,
  formData,
  fechaHora,
  isLoading = false
}: ConfirmationModalProps) {
  const getServicePrice = () => {
    if (servicio.promociones.length > 0) {
      return calculateDiscountedPrice(Number(servicio.precio), Number(servicio.promociones[0].descuento))
    }
    return Number(servicio.precio)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : () => {}}
      title="Confirmar Reserva"
      size="md"
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-amber-600 mr-3 mt-0.5">⚠️</span>
            <div>
              <h4 className="font-medium text-amber-800 mb-1">
                Confirma los detalles de tu reserva
              </h4>
              <p className="text-sm text-amber-700">
                Una vez confirmada, recibirás un email con los detalles. 
                Podrás cancelar hasta 24 horas antes sin costo.
              </p>
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Detalles de la Reserva
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-900">{servicio.nombre}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duración:</span>
              <span className="font-medium text-gray-900">{servicio.duracion} minutos</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-900">
                {format(fechaHora, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium text-gray-900">
                {format(fechaHora, 'HH:mm')} - {format(new Date(fechaHora.getTime() + servicio.duracion * 60000), 'HH:mm')}
              </span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium text-gray-900">{formData.clienteNombre}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{formData.clienteEmail}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium text-gray-900">{formData.clienteTelefono}</span>
              </div>
            </div>
            
            {formData.notas && (
              <div className="border-t pt-3">
                <span className="text-gray-600 block mb-1">Notas:</span>
                <p className="text-sm text-gray-900 bg-white rounded p-2 border">
                  {formData.notas}
                </p>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total a pagar:</span>
                <div className="text-right">
                  {servicio.promociones.length > 0 ? (
                    <>
                      <div className="text-sm text-gray-500 line-through">
                        ${servicio.precio.toString()}
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        {formatPrice(getServicePrice())}
                      </div>
                      <div className="text-xs text-red-600">
                        Descuento: {servicio.promociones[0].descuento.toString()}%
                      </div>
                    </>
                  ) : (
                    <div className="text-xl font-bold spa-text-primary">
                      ${servicio.precio.toString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-600 mr-3 mt-0.5">💳</span>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">
                Información de Pago
              </h4>
              <p className="text-sm text-blue-700">
                El pago se realiza directamente en el spa al momento de tu cita. 
                Aceptamos efectivo y tarjetas de crédito/débito.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Revisar Datos
          </Button>
          <Button
            onClick={onConfirm}
            loading={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar Reserva'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}