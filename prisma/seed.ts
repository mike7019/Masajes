import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear servicios de ejemplo
  const servicios = await Promise.all([
    prisma.servicio.create({
      data: {
        nombre: 'Masaje Relajante',
        descripcion: 'Masaje suave y relajante para aliviar el estrés y la tensión muscular.',
        duracion: 60,
        precio: 80.00,
        activo: true,
      },
    }),
    prisma.servicio.create({
      data: {
        nombre: 'Masaje Terapéutico',
        descripcion: 'Masaje profundo para tratar dolores musculares y contracturas.',
        duracion: 90,
        precio: 120.00,
        activo: true,
      },
    }),
    prisma.servicio.create({
      data: {
        nombre: 'Masaje Deportivo',
        descripcion: 'Masaje especializado para deportistas, ideal para recuperación muscular.',
        duracion: 75,
        precio: 100.00,
        activo: true,
      },
    }),
    prisma.servicio.create({
      data: {
        nombre: 'Masaje de Piedras Calientes',
        descripcion: 'Relajante masaje con piedras volcánicas calientes.',
        duracion: 90,
        precio: 140.00,
        activo: true,
      },
    }),
  ])

  // Crear configuración de disponibilidad (Lunes a Viernes 9:00-18:00)
  const disponibilidad = await Promise.all([
    // Lunes a Viernes
    ...Array.from({ length: 5 }, (_, i) =>
      prisma.disponibilidad.create({
        data: {
          diaSemana: i + 1, // 1-5 (Lunes-Viernes)
          horaInicio: '09:00',
          horaFin: '18:00',
          activo: true,
        },
      })
    ),
    // Sábado (horario reducido)
    prisma.disponibilidad.create({
      data: {
        diaSemana: 6, // Sábado
        horaInicio: '10:00',
        horaFin: '16:00',
        activo: true,
      },
    }),
  ])

  // Crear promociones de ejemplo
  const promociones = await Promise.all([
    prisma.promocion.create({
      data: {
        nombre: 'Descuento Primera Visita',
        descripcion: 'Descuento especial para nuevos clientes en su primera sesión',
        descuento: 20.00,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
        activa: true,
        servicios: {
          connect: servicios.slice(0, 2).map(s => ({ id: s.id }))
        }
      },
    }),
    prisma.promocion.create({
      data: {
        nombre: 'Paquete Relajación',
        descripcion: 'Descuento en masajes relajantes durante el mes',
        descuento: 15.00,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        activa: true,
        servicios: {
          connect: [{ id: servicios[0].id }] // Solo masaje relajante
        }
      },
    }),
  ])

  console.log('✅ Datos de ejemplo creados:')
  console.log(`📋 ${servicios.length} servicios creados`)
  console.log(`📅 ${disponibilidad.length} configuraciones de disponibilidad creadas`)
  console.log(`🎯 ${promociones.length} promociones creadas`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })