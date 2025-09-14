import { NextRequest } from 'next/server'
import { POST } from '@/app/api/contacto/route'

// Mock email service
jest.mock('@/lib/email', () => ({
  sendContactNotification: jest.fn().mockResolvedValue({ success: true }),
}))

describe('/api/contacto POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const validContactData = {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '+1234567890',
    asunto: 'Consulta sobre masajes',
    mensaje: 'Me gustaría información sobre sus servicios',
    tipoConsulta: 'general'
  }

  it('processes contact form successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/contacto', {
      method: 'POST',
      body: JSON.stringify(validContactData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Mensaje enviado correctamente')
  })

  it('returns 400 for invalid data', async () => {
    const invalidData = {
      nombre: '', // Empty name
      email: 'invalid-email',
      asunto: '',
      mensaje: ''
    }

    const request = new NextRequest('http://localhost:3000/api/contacto', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Datos inválidos')
  })

  it('validates email format', async () => {
    const invalidEmailData = {
      ...validContactData,
      email: 'not-an-email'
    }

    const request = new NextRequest('http://localhost:3000/api/contacto', {
      method: 'POST',
      body: JSON.stringify(invalidEmailData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Datos inválidos')
  })

  it('validates required fields', async () => {
    const missingFieldsData = {
      nombre: 'Juan Pérez',
      // Missing email, asunto, mensaje
    }

    const request = new NextRequest('http://localhost:3000/api/contacto', {
      method: 'POST',
      body: JSON.stringify(missingFieldsData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Datos inválidos')
  })

  it('handles email service errors gracefully', async () => {
    const { sendContactNotification } = require('@/lib/email')
    sendContactNotification.mockRejectedValue(new Error('Email service error'))

    const request = new NextRequest('http://localhost:3000/api/contacto', {
      method: 'POST',
      body: JSON.stringify(validContactData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Error al enviar el mensaje')
  })

  it('validates message length', async () => {
    const longMessageData = {
      ...validContactData,
      mensaje: 'a'.repeat(1001) // Exceeds 1000 character limit
    }

    const request = new NextRequest('http://localhost:3000/api/contacto', {
      method: 'POST',
      body: JSON.stringify(longMessageData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Datos inválidos')
  })

  it('accepts valid consultation types', async () => {
    const consultationTypes = ['general', 'reserva', 'servicio', 'precio', 'cancelacion', 'otro']
    
    for (const tipo of consultationTypes) {
      const dataWithType = {
        ...validContactData,
        tipoConsulta: tipo
      }

      const request = new NextRequest('http://localhost:3000/api/contacto', {
        method: 'POST',
        body: JSON.stringify(dataWithType),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    }
  })

  it('rejects invalid consultation types', async () => {
    const invalidTypeData = {
      ...validContactData,
      tipoConsulta: 'invalid-type'
    }

    const request = new NextRequest('http://localhost:3000/api/contacto', {
      method: 'POST',
      body: JSON.stringify(invalidTypeData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Datos inválidos')
  })
})