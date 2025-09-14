import { z } from 'zod'

export const contactoSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z
    .string()
    .email('Ingresa un email válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  telefono: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .optional(),
  
  asunto: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres'),
  
  mensaje: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
  
  tipoConsulta: z
    .enum(['general', 'reserva', 'servicio', 'precio', 'cancelacion', 'otro'])
    .default('general')
})

export type ContactoFormData = z.infer<typeof contactoSchema>

export const validateContactoData = (data: unknown) => {
  return contactoSchema.safeParse(data)
}