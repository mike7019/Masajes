import { http, HttpResponse } from 'msw'
import { mockServicio, mockReserva, mockDisponibilidad } from './test-utils'

export const handlers = [
  // Servicios API
  http.get('/api/servicios', () => {
    return HttpResponse.json([mockServicio])
  }),

  http.get('/api/servicios/:id', ({ params }) => {
    return HttpResponse.json({ ...mockServicio, id: params.id })
  }),

  // Reservas API
  http.get('/api/reservas', () => {
    return HttpResponse.json([mockReserva])
  }),

  http.post('/api/reservas', async ({ request }) => {
    const data = await request.json() as Record<string, any>
    return HttpResponse.json({
      ...mockReserva,
      ...(data as object),
      id: 'new-reservation-id',
    }, { status: 201 })
  }),

  http.get('/api/reservas/:id', ({ params }) => {
    return HttpResponse.json({ ...mockReserva, id: params.id })
  }),

  http.put('/api/reservas/:id', async ({ params, request }) => {
    const data = await request.json() as Record<string, any>
    return HttpResponse.json({
      ...mockReserva,
      ...(data as object),
      id: params.id,
    })
  }),

  http.delete('/api/reservas/:id', ({ params }) => {
    return HttpResponse.json({ success: true })
  }),

  // Disponibilidad API
  http.get('/api/disponibilidad', () => {
    return HttpResponse.json([mockDisponibilidad])
  }),

  http.post('/api/disponibilidad', async ({ request }) => {
    const data = await request.json() as Record<string, any>
    return HttpResponse.json({
      ...mockDisponibilidad,
      ...(data as object),
      id: 'new-availability-id',
    }, { status: 201 })
  }),

  // Contacto API
  http.post('/api/contacto', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
    })
  }),

  // Admin API
  http.get('/api/admin/stats', () => {
    return HttpResponse.json({
      totalReservas: 10,
      reservasHoy: 2,
      reservasPendientes: 3,
      ingresosMes: 1500,
    })
  }),

  http.get('/api/admin/actividad-reciente', () => {
    return HttpResponse.json([
      {
        id: '1',
        tipo: 'reserva',
        descripcion: 'Nueva reserva de Juan Pérez',
        fecha: new Date().toISOString(),
      },
    ])
  }),

  // Auth API
  http.post('/api/auth/signin', async ({ request }) => {
    const data = await request.json() as { email?: string; password?: string } | null
    if (data?.email === 'admin@test.com' && data?.password === 'password') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Test Admin',
        },
      })
    }
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Error handlers for testing error states
  http.get('/api/error-test', () => {
    return HttpResponse.json(
      { error: 'Test error' },
      { status: 500 }
    )
  }),
]