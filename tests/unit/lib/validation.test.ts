import { reservaSchema } from '@/lib/validation/reserva'
import { contactoSchema } from '@/lib/validation/contacto'

describe('Validation Schemas', () => {
  describe('reservaSchema', () => {
    const validReservaData = {
      clienteNombre: 'Juan Pérez',
      clienteEmail: 'juan@test.com',
      clienteTelefono: '123456789',
      servicioId: '1',
      fechaHora: new Date('2024-12-25T10:00:00Z'),
      notas: 'Primera vez',
    }

    it('validates correct reserva data', () => {
      const result = reservaSchema.safeParse(validReservaData)
      expect(result.success).toBe(true)
    })

    it('requires clienteNombre', () => {
      const invalidData = { ...validReservaData, clienteNombre: '' }
      const result = reservaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requerido')
      }
    })

    it('validates email format', () => {
      const invalidData = { ...validReservaData, clienteEmail: 'invalid-email' }
      const result = reservaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email')
      }
    })

    it('validates phone number length', () => {
      const invalidData = { ...validReservaData, clienteTelefono: '123' }
      const result = reservaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('9')
      }
    })

    it('requires servicioId', () => {
      const invalidData = { ...validReservaData, servicioId: '' }
      const result = reservaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requerido')
      }
    })

    it('validates fechaHora is a valid date', () => {
      const invalidData = { ...validReservaData, fechaHora: 'invalid-date' }
      const result = reservaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('allows optional notas', () => {
      const dataWithoutNotas = { ...validReservaData }
      delete dataWithoutNotas.notas
      const result = reservaSchema.safeParse(dataWithoutNotas)
      expect(result.success).toBe(true)
    })

    it('trims whitespace from string fields', () => {
      const dataWithWhitespace = {
        ...validReservaData,
        clienteNombre: '  Juan Pérez  ',
        clienteEmail: '  juan@test.com  ',
      }
      const result = reservaSchema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.clienteNombre).toBe('Juan Pérez')
        expect(result.data.clienteEmail).toBe('juan@test.com')
      }
    })
  })

  describe('contactoSchema', () => {
    const validContactoData = {
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      telefono: '123456789',
      mensaje: 'Hola, me interesa un masaje',
    }

    it('validates correct contacto data', () => {
      const result = contactoSchema.safeParse(validContactoData)
      expect(result.success).toBe(true)
    })

    it('requires nombre', () => {
      const invalidData = { ...validContactoData, nombre: '' }
      const result = contactoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requerido')
      }
    })

    it('validates email format', () => {
      const invalidData = { ...validContactoData, email: 'invalid-email' }
      const result = contactoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email')
      }
    })

    it('validates phone number length', () => {
      const invalidData = { ...validContactoData, telefono: '123' }
      const result = contactoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('9')
      }
    })

    it('requires mensaje', () => {
      const invalidData = { ...validContactoData, mensaje: '' }
      const result = contactoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requerido')
      }
    })

    it('validates mensaje minimum length', () => {
      const invalidData = { ...validContactoData, mensaje: 'Hi' }
      const result = contactoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10')
      }
    })

    it('allows optional telefono', () => {
      const dataWithoutTelefono = { ...validContactoData }
      delete dataWithoutTelefono.telefono
      const result = contactoSchema.safeParse(dataWithoutTelefono)
      expect(result.success).toBe(true)
    })

    it('trims whitespace from string fields', () => {
      const dataWithWhitespace = {
        ...validContactoData,
        nombre: '  Juan Pérez  ',
        email: '  juan@test.com  ',
        mensaje: '  Hola, me interesa un masaje  ',
      }
      const result = contactoSchema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nombre).toBe('Juan Pérez')
        expect(result.data.email).toBe('juan@test.com')
        expect(result.data.mensaje).toBe('Hola, me interesa un masaje')
      }
    })
  })
})