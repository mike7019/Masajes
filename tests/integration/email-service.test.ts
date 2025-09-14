import { sendReservationConfirmation, sendContactNotification } from '@/lib/email'
import { Resend } from 'resend'

// Mock Resend
jest.mock('resend')

const mockResend = {
  emails: {
    send: jest.fn()
  }
}

;(Resend as jest.Mock).mockImplementation(() => mockResend)

describe('Email Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockResend.emails.send.mockResolvedValue({ id: 'test-email-id' })
  })

  describe('sendReservationConfirmation', () => {
    const mockReservation = {
      id: 'reservation-123',
      clienteNombre: 'María García',
      clienteEmail: 'maria@example.com',
      clienteTelefono: '+1234567890',
      fechaHora: new Date('2024-12-15T14:00:00'),
      servicio: {
        nombre: 'Masaje Relajante',
        duracion: 60,
        precio: 80
      },
      notas: 'Primera vez'
    }

    it('sends confirmation email to client', async () => {
      await sendReservationConfirmation(mockReservation)

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: expect.any(String),
        to: 'maria@example.com',
        subject: expect.stringContaining('Confirmación'),
        html: expect.stringContaining('María García'),
      })
    })

    it('sends notification email to business', async () => {
      await sendReservationConfirmation(mockReservation)

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: expect.any(String),
        to: expect.any(String), // Business email
        subject: expect.stringContaining('Nueva reserva'),
        html: expect.stringContaining('María García'),
      })
    })

    it('includes reservation details in email', async () => {
      await sendReservationConfirmation(mockReservation)

      const clientEmailCall = mockResend.emails.send.mock.calls.find(
        call => call[0].to === 'maria@example.com'
      )

      expect(clientEmailCall[0].html).toContain('Masaje Relajante')
      expect(clientEmailCall[0].html).toContain('60 minutos')
      expect(clientEmailCall[0].html).toContain('$80')
      expect(clientEmailCall[0].html).toContain('15 de diciembre')
      expect(clientEmailCall[0].html).toContain('14:00')
    })

    it('handles email service errors gracefully', async () => {
      mockResend.emails.send.mockRejectedValue(new Error('Email service error'))

      await expect(sendReservationConfirmation(mockReservation))
        .rejects.toThrow('Email service error')
    })

    it('includes cancellation policy in client email', async () => {
      await sendReservationConfirmation(mockReservation)

      const clientEmailCall = mockResend.emails.send.mock.calls.find(
        call => call[0].to === 'maria@example.com'
      )

      expect(clientEmailCall[0].html).toContain('24 horas')
      expect(clientEmailCall[0].html).toContain('cancelar')
    })

    it('includes contact information in email', async () => {
      await sendReservationConfirmation(mockReservation)

      const clientEmailCall = mockResend.emails.send.mock.calls.find(
        call => call[0].to === 'maria@example.com'
      )

      expect(clientEmailCall[0].html).toContain('teléfono')
      expect(clientEmailCall[0].html).toContain('dirección')
    })
  })

  describe('sendContactNotification', () => {
    const mockContactData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '+1234567890',
      asunto: 'Consulta sobre masajes',
      mensaje: 'Me gustaría información sobre sus servicios',
      tipoConsulta: 'general' as const
    }

    it('sends contact notification to business', async () => {
      await sendContactNotification(mockContactData)

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: expect.any(String),
        to: expect.any(String), // Business email
        subject: expect.stringContaining('Nuevo mensaje'),
        html: expect.stringContaining('Juan Pérez'),
      })
    })

    it('sends confirmation email to client', async () => {
      await sendContactNotification(mockContactData)

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: expect.any(String),
        to: 'juan@example.com',
        subject: expect.stringContaining('Hemos recibido'),
        html: expect.stringContaining('Juan Pérez'),
      })
    })

    it('includes contact details in business notification', async () => {
      await sendContactNotification(mockContactData)

      const businessEmailCall = mockResend.emails.send.mock.calls.find(
        call => call[0].subject.includes('Nuevo mensaje')
      )

      expect(businessEmailCall[0].html).toContain('Juan Pérez')
      expect(businessEmailCall[0].html).toContain('juan@example.com')
      expect(businessEmailCall[0].html).toContain('+1234567890')
      expect(businessEmailCall[0].html).toContain('Consulta sobre masajes')
      expect(businessEmailCall[0].html).toContain('Me gustaría información')
      expect(businessEmailCall[0].html).toContain('general')
    })

    it('includes response time expectation in client confirmation', async () => {
      await sendContactNotification(mockContactData)

      const clientEmailCall = mockResend.emails.send.mock.calls.find(
        call => call[0].to === 'juan@example.com'
      )

      expect(clientEmailCall[0].html).toContain('24 horas')
      expect(clientEmailCall[0].html).toContain('responder')
    })

    it('handles missing optional fields gracefully', async () => {
      const minimalContactData = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        asunto: 'Consulta',
        mensaje: 'Mensaje de prueba',
        tipoConsulta: 'general' as const
      }

      await expect(sendContactNotification(minimalContactData))
        .resolves.not.toThrow()

      expect(mockResend.emails.send).toHaveBeenCalled()
    })

    it('formats different consultation types correctly', async () => {
      const consultationTypes = ['general', 'reserva', 'servicio', 'precio', 'cancelacion', 'otro']

      for (const tipo of consultationTypes) {
        const contactData = {
          ...mockContactData,
          tipoConsulta: tipo as any
        }

        await sendContactNotification(contactData)

        const businessEmailCall = mockResend.emails.send.mock.calls.find(
          call => call[0].subject.includes('Nuevo mensaje')
        )

        expect(businessEmailCall[0].html).toContain(tipo)
      }
    })
  })

  describe('email templates', () => {
    it('generates valid HTML templates', async () => {
      const mockReservation = {
        id: 'reservation-123',
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        clienteTelefono: '+1234567890',
        fechaHora: new Date('2024-12-15T14:00:00'),
        servicio: {
          nombre: 'Masaje Relajante',
          duracion: 60,
          precio: 80
        }
      }

      await sendReservationConfirmation(mockReservation)

      const emailCall = mockResend.emails.send.mock.calls[0]
      const htmlContent = emailCall[0].html

      // Should be valid HTML structure
      expect(htmlContent).toContain('<html')
      expect(htmlContent).toContain('</html>')
      expect(htmlContent).toContain('<body')
      expect(htmlContent).toContain('</body>')

      // Should not contain template variables
      expect(htmlContent).not.toContain('{{')
      expect(htmlContent).not.toContain('}}')
    })

    it('includes proper email headers', async () => {
      const mockReservation = {
        id: 'reservation-123',
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        fechaHora: new Date('2024-12-15T14:00:00'),
        servicio: { nombre: 'Masaje Relajante', duracion: 60, precio: 80 }
      }

      await sendReservationConfirmation(mockReservation)

      const emailCall = mockResend.emails.send.mock.calls[0]

      expect(emailCall[0].from).toBeDefined()
      expect(emailCall[0].to).toBeDefined()
      expect(emailCall[0].subject).toBeDefined()
      expect(emailCall[0].html).toBeDefined()
    })

    it('uses consistent branding in emails', async () => {
      const mockReservation = {
        id: 'reservation-123',
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        fechaHora: new Date('2024-12-15T14:00:00'),
        servicio: { nombre: 'Masaje Relajante', duracion: 60, precio: 80 }
      }

      await sendReservationConfirmation(mockReservation)

      const emailCall = mockResend.emails.send.mock.calls[0]
      const htmlContent = emailCall[0].html

      // Should include business branding
      expect(htmlContent).toContain('Spa') // Business name
      expect(htmlContent).toMatch(/#[0-9a-fA-F]{6}/) // Should have brand colors
    })
  })

  describe('error handling', () => {
    it('retries failed email sends', async () => {
      mockResend.emails.send
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({ id: 'success-id' })

      const mockReservation = {
        id: 'reservation-123',
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        fechaHora: new Date('2024-12-15T14:00:00'),
        servicio: { nombre: 'Masaje Relajante', duracion: 60, precio: 80 }
      }

      await sendReservationConfirmation(mockReservation)

      expect(mockResend.emails.send).toHaveBeenCalledTimes(2)
    })

    it('logs email failures appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockResend.emails.send.mockRejectedValue(new Error('Email service down'))

      const mockReservation = {
        id: 'reservation-123',
        clienteNombre: 'María García',
        clienteEmail: 'maria@example.com',
        fechaHora: new Date('2024-12-15T14:00:00'),
        servicio: { nombre: 'Masaje Relajante', duracion: 60, precio: 80 }
      }

      await expect(sendReservationConfirmation(mockReservation))
        .rejects.toThrow('Email service down')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error sending email'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
})