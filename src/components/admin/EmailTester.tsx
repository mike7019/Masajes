'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, useToast } from '@/components/ui'

export function EmailTester() {
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(false)
  const { addToast } = useToast()

  const sendTestEmail = async () => {
    if (!testEmail) {
      addToast({
        type: 'error',
        message: 'Por favor ingresa un email'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: testEmail })
      })

      if (response.ok) {
        addToast({
          type: 'success',
          message: 'Email de prueba enviado correctamente'
        })
      } else {
        throw new Error('Error al enviar email')
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Error al enviar email de prueba'
      })
    } finally {
      setLoading(false)
    }
  }

  const sendReminders = async () => {
    setReminderLoading(true)
    try {
      const response = await fetch('/api/admin/send-reminders', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        addToast({
          type: 'success',
          message: data.message
        })
      } else {
        throw new Error(data.error || 'Error al enviar recordatorios')
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Error al enviar recordatorios'
      })
    } finally {
      setReminderLoading(false)
    }
  }

  const checkReminders = async () => {
    try {
      const response = await fetch('/api/admin/send-reminders')
      const data = await response.json()

      addToast({
        type: 'info',
        message: data.message
      })
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Error al verificar recordatorios'
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">📧</span>
            Pruebas de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Email */}
          <div>
            <h3 className="font-semibold mb-3">Enviar Email de Prueba</h3>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={sendTestEmail}
                loading={loading}
                disabled={!testEmail}
              >
                Enviar Prueba
              </Button>
            </div>
          </div>

          {/* Reminders */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Recordatorios Automáticos</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={checkReminders}
              >
                📊 Verificar Pendientes
              </Button>
              <Button
                onClick={sendReminders}
                loading={reminderLoading}
              >
                📤 Enviar Recordatorios
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Los recordatorios se envían automáticamente a las reservas de mañana
            </p>
          </div>

          {/* Email Configuration */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Configuración de Email</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Servicio:</span>
                <span className="font-medium">Resend</span>
              </div>
              <div className="flex justify-between">
                <span>Email de envío:</span>
                <span className="font-medium">{process.env.EMAIL_FROM || 'noreply@tumasajes.com'}</span>
              </div>
              <div className="flex justify-between">
                <span>Email del negocio:</span>
                <span className="font-medium">{process.env.BUSINESS_EMAIL || 'admin@tumasajes.com'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}