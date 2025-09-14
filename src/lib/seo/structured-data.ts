import { Servicio } from '@prisma/client'

// Base URL for the site
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Organization structured data
export function getOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#organization`,
    name: 'Spa & Masajes Relajación',
    description: 'Servicios profesionales de masajes terapéuticos, relajantes y deportivos. Más de 10 años cuidando tu bienestar.',
    url: baseUrl,
    telephone: '+1-555-0123',
    email: 'info@spamasajes.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Principal 123',
      addressLocality: 'Ciudad',
      addressRegion: 'Región',
      postalCode: '12345',
      addressCountry: 'ES'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '40.4168',
      longitude: '-3.7038'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '18:00'
      }
    ],
    priceRange: '€€',
    image: `${baseUrl}/images/spa-exterior.jpg`,
    logo: `${baseUrl}/images/logo.png`,
    sameAs: [
      'https://www.facebook.com/spamasajes',
      'https://www.instagram.com/spamasajes',
      'https://www.twitter.com/spamasajes'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de Masajes',
      itemListElement: []
    }
  }
}

// Service structured data
export function getServiceStructuredData(servicio: Servicio) {
  const slug = generateSlug(servicio.nombre)
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/servicios/${slug}#service`,
    name: servicio.nombre,
    description: servicio.descripcion,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Spa & Masajes Relajación',
      '@id': `${baseUrl}/#organization`
    },
    areaServed: {
      '@type': 'City',
      name: 'Ciudad'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: servicio.nombre,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: servicio.nombre,
            description: servicio.descripcion
          },
          price: servicio.precio.toString(),
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString(),
          url: `${baseUrl}/servicios/${slug}`
        }
      ]
    },
    url: `${baseUrl}/servicios/${slug}`,
    image: `${baseUrl}/images/servicios/${slug}.jpg`
  }
}

// Website structured data
export function getWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Spa & Masajes Relajación',
    description: 'Servicios profesionales de masajes terapéuticos, relajantes y deportivos.',
    publisher: {
      '@id': `${baseUrl}/#organization`
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/servicios?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    ],
    inLanguage: 'es-ES'
  }
}

// Breadcrumb structured data
export function getBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

// FAQ structured data
export function getFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Review/Rating structured data
export function getReviewStructuredData(reviews: Array<{
  author: string
  rating: number
  text: string
  date: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#organization`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1
    },
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      reviewBody: review.text,
      datePublished: review.date
    }))
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

// Combine multiple structured data objects
export function combineStructuredData(...data: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': data
  }
}