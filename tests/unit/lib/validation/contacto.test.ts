import { contactoSchema } from '@/lib/validation/contacto'

describe('Contacto Validation', () => {
  const validContactoData = {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '+1234567890',
    asunto: 'Consulta sobre masajes',
    mensaje: 'Me gustaría información sobre sus servicios',
    tipoConsulta: 'general' as const
  }

  it('validates correct contact data', () => {
    const result = contactoSchema.safeParse(validContactoData)
    expect(result.success).toBe(true)
  })

  it('requires nombre', () => {
    const invalidData = { ...validContactoData, nombre: '' }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('nombre')
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

  it('requires asunto', () => {
    const invalidData = { ...validContactoData, asunto: '' }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('asunto')
    }
  })

  it('requires mensaje', () => {
    const invalidData = { ...validContactoData, mensaje: '' }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('mensaje')
    }
  })

  it('validates mensaje length limit', () => {
    const longMessage = 'a'.repeat(1001)
    const invalidData = { ...validContactoData, mensaje: longMessage }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('1000')
    }
  })

  it('allows optional telefono field', () => {
    const dataWithoutPhone = { ...validContactoData }
    delete dataWithoutPhone.telefono
    
    const result = contactoSchema.safeParse(dataWithoutPhone)
    expect(result.success).toBe(true)
  })

  it('validates telefono format when provided', () => {
    const invalidData = { ...validContactoData, telefono: '123' }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('teléfono')
    }
  })

  it('validates tipoConsulta enum values', () => {
    const validTypes = ['general', 'reserva', 'servicio', 'precio', 'cancelacion', 'otro']
    
    validTypes.forEach(tipo => {
      const data = { ...validContactoData, tipoConsulta: tipo as any }
      const result = contactoSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid tipoConsulta values', () => {
    const invalidData = { ...validContactoData, tipoConsulta: 'invalid-type' as any }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('tipo de consulta')
    }
  })

  it('trims whitespace from string fields', () => {
    const dataWithWhitespace = {
      ...validContactoData,
      nombre: '  Juan Pérez  ',
      email: '  juan@example.com  ',
      asunto: '  Consulta  ',
      mensaje: '  Mensaje de prueba  '
    }
    
    const result = contactoSchema.safeParse(dataWithWhitespace)
    expect(result.success).toBe(true)
    
    if (result.success) {
      expect(result.data.nombre).toBe('Juan Pérez')
      expect(result.data.email).toBe('juan@example.com')
      expect(result.data.asunto).toBe('Consulta')
      expect(result.data.mensaje).toBe('Mensaje de prueba')
    }
  })

  it('validates minimum message length', () => {
    const shortMessage = 'Hi'
    const invalidData = { ...validContactoData, mensaje: shortMessage }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('10')
    }
  })

  it('validates minimum nombre length', () => {
    const shortName = 'A'
    const invalidData = { ...validContactoData, nombre: shortName }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('2')
    }
  })

  it('validates minimum asunto length', () => {
    const shortSubject = 'Hi'
    const invalidData = { ...validContactoData, asunto: shortSubject }
    const result = contactoSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('5')
    }
  })

  it('accepts international phone number formats', () => {
    const phoneFormats = [
      '+1234567890',
      '+52 55 1234 5678',
      '+34 91 123 45 67',
      '(555) 123-4567',
      '555-123-4567'
    ]
    
    phoneFormats.forEach(phone => {
      const data = { ...validContactoData, telefono: phone }
      const result = contactoSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})