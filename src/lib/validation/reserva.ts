import { z } from 'zod'

export const reservaSchema = z.object({
    clienteNombre: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
        .transform(val => val.trim()),

    clienteEmail: z
        .string()
        .min(1, 'El email es requerido')
        .email('Ingresa un email válido')
        .max(255, 'El email no puede exceder 255 caracteres')
        .toLowerCase()
        .refine(email => {
            // Additional email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(email)
        }, 'Formato de email inválido'),

    clienteTelefono: z
        .string()
        .min(10, 'El teléfono debe tener al menos 10 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono inválido')
        .transform(val => val.replace(/\s/g, '')), // Remove spaces

    servicioId: z
        .string()
        .min(1, 'Debes seleccionar un servicio')
        .cuid('ID de servicio inválido'),

    fechaHora: z
        .date()
        .refine(date => {
            const now = new Date()
            const minDate = new Date(now.getTime() + 60 * 60 * 1000) // At least 1 hour from now
            return date >= minDate
        }, 'La reserva debe ser al menos 1 hora en el futuro')
        .refine(date => {
            const maxDate = new Date()
            maxDate.setMonth(maxDate.getMonth() + 3) // Max 3 months in advance
            return date <= maxDate
        }, 'No se pueden hacer reservas con más de 3 meses de anticipación'),

    notas: z
        .string()
        .max(500, 'Las notas no pueden exceder 500 caracteres')
        .optional()
        .transform(val => val?.trim())
})

// Additional validation for business hours
export const validateBusinessHours = (date: Date) => {
    const hour = date.getHours()
    const day = date.getDay() // 0 = Sunday, 6 = Saturday
    
    // Business hours: Monday-Friday 9-18, Saturday 10-16, Sunday closed
    if (day === 0) { // Sunday
        return { valid: false, message: 'No atendemos los domingos' }
    }
    
    if (day >= 1 && day <= 5) { // Monday-Friday
        if (hour < 9 || hour >= 18) {
            return { valid: false, message: 'Horario de atención: Lunes a Viernes 9:00 - 18:00' }
        }
    }
    
    if (day === 6) { // Saturday
        if (hour < 10 || hour >= 16) {
            return { valid: false, message: 'Horario de atención: Sábados 10:00 - 16:00' }
        }
    }
    
    return { valid: true, message: '' }
}

export type ReservaFormData = z.infer<typeof reservaSchema>

export const validateReservaData = (data: unknown) => {
    return reservaSchema.safeParse(data)
}