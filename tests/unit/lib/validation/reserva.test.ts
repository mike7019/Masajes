import { reservaSchema, validateBusinessHours } from '@/lib/validation/reserva'

describe('Reserva Validation', () => {
  describe('reservaSchema', () => {
    const validReservaData = {
      clienteNombre: 'María García',
      clienteEmail: 'maria@example.com',
      clienteTelefono: '+1234567890',
      servicioId: 'service-1',
      fechaHora: new Date('2024-12-15T14:00:00'),
      notas: 'Primera vez'
    }

    it('validates correct reservation data', () => {
      const result = reservaSchema.safeParse(validReservaData)
      expect(result.success).toBe(true)
    })

    it('requires clienteNombre', () => {
      const invalidData = { ...validReservaData, clienteNombre: '' }
      const result = reservaSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('nombre')
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

    it('validates phone number format', () => {
      const invalidData = { ...validReservaData, clienteTelefono: '123' }
      const result = reservaSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('teléfono')
      }
    })

    it('requires servicioId', () => {
      const invalidData = { ...validReservaData, servicioId: '' }
      const result = reservaSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('servicio')
      }
    })

    it('validates fechaHora is a valid date', () => {
      const invalidData = { ...validReservaData, fechaHora: 'invalid-date' }
      const result = reservaSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    it('validates fechaHora is in the future', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const invalidData = { ...validReservaData, fechaHora: pastDate }
      const result = reservaSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('futura')
      }
    })

    it('allows optional notas field', () => {
      const dataWithoutNotes = { ...validReservaData }
      delete dataWithoutNotes.notas
      
      const result = reservaSchema.safeParse(dataWithoutNotes)
      expect(result.success).toBe(true)
    })

    it('validates notas length limit', () => {
      const longNotes = 'a'.repeat(501)
      const invalidData = { ...validReservaData, notas: longNotes }
      const result = reservaSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('500')
      }
    })

    it('trims whitespace from string fields', () => {
      const dataWithWhitespace = {
        ...validReservaData,
        clienteNombre: '  María García  ',
        clienteEmail: '  maria@example.com  '
      }
      
      const result = reservaSchema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.clienteNombre).toBe('María García')
        expect(result.data.clienteEmail).toBe('maria@example.com')
      }
    })
  })

  describe('validateBusinessHours', () => {
    it('validates time within business hours', () => {
      const businessHourTime = new Date('2024-12-16T14:00:00') // Monday 2 PM
      const result = validateBusinessHours(businessHourTime)
      
      expect(result.valid).toBe(true)
    })

    it('rejects time before business hours', () => {
      const earlyTime = new Date('2024-12-16T07:00:00') // Monday 7 AM
      const result = validateBusinessHours(earlyTime)
      
      expect(result.valid).toBe(false)
      expect(result.message).toContain('horario de atención')
    })

    it('rejects time after business hours', () => {
      const lateTime = new Date('2024-12-16T20:00:00') // Monday 8 PM
      const result = validateBusinessHours(lateTime)
      
      expect(result.valid).toBe(false)
      expect(result.message).toContain('horario de atención')
    })

    it('rejects Sunday appointments', () => {
      const sundayTime = new Date('2024-12-15T14:00:00') // Sunday 2 PM
      const result = validateBusinessHours(sundayTime)
      
      expect(result.valid).toBe(false)
      expect(result.message).toContain('domingo')
    })

    it('validates Saturday appointments with different hours', () => {
      const saturdayTime = new Date('2024-12-14T12:00:00') // Saturday 12 PM
      const result = validateBusinessHours(saturdayTime)
      
      expect(result.valid).toBe(true)
    })

    it('rejects Saturday appointments outside reduced hours', () => {
      const lateSaturdayTime = new Date('2024-12-14T18:00:00') // Saturday 6 PM
      const result = validateBusinessHours(lateSaturdayTime)
      
      expect(result.valid).toBe(false)
      expect(result.message).toContain('horario de atención')
    })

    it('validates weekday appointments', () => {
      const weekdays = [1, 2, 3, 4, 5] // Monday to Friday
      
      weekdays.forEach(day => {
        const date = new Date('2024-12-16') // Start with Monday
        date.setDate(date.getDate() + (day - 1))
        date.setHours(14, 0, 0, 0) // 2 PM
        
        const result = validateBusinessHours(date)
        expect(result.valid).toBe(true)
      })
    })

    it('provides helpful error messages', () => {
      const sundayTime = new Date('2024-12-15T14:00:00')
      const result = validateBusinessHours(sundayTime)
      
      expect(result.message).toContain('Lunes a Viernes')
      expect(result.message).toContain('9:00')
      expect(result.message).toContain('18:00')
    })
  })
})