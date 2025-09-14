import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/servicios/',
          '/reservas',
          '/contacto',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/*.json$',
          '/ui-demo/',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/servicios/',
          '/reservas',
          '/contacto',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/ui-demo/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/servicios/',
          '/reservas',
          '/contacto',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/ui-demo/',
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}