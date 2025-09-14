import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reservas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    // Get all active services for dynamic pages
    const servicios = await prisma.servicio.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, creadoEn: true }
    })

    // Generate service pages
    const servicePages: MetadataRoute.Sitemap = servicios.map((servicio) => ({
      url: `${baseUrl}/servicios/${generateSlug(servicio.nombre)}`,
      lastModified: servicio.creadoEn,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...servicePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if database is not available
    return staticPages
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to generate URL-friendly slugs
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}