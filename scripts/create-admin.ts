import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Verificar si ya existe un usuario admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('Ya existe un usuario administrador:', existingAdmin.email)
      return
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@masajes.com',
        password: hashedPassword,
        role: 'ADMIN',
        activo: true,
      }
    })

    console.log('Usuario administrador creado exitosamente:')
    console.log('Email:', admin.email)
    console.log('Contraseña: admin123')
    console.log('¡IMPORTANTE: Cambia la contraseña después del primer login!')
    
  } catch (error) {
    console.error('Error al crear usuario administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()