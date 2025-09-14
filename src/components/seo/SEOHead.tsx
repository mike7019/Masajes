import { Metadata } from 'next'
import { 
  getOrganizationStructuredData,
  getWebsiteStructuredData,
  combineStructuredData
} from '@/lib/seo/structured-data'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  structuredData?: object
  noIndex?: boolean
  noFollow?: boolean
}

export function generateSEOMetadata({
  title = "Spa & Masajes Relajación - Masajes Terapéuticos Profesionales",
  description = "Servicios profesionales de masajes terapéuticos, relajantes y deportivos. Reserva tu cita online. Más de 10 años cuidando tu bienestar en un ambiente de tranquilidad.",
  keywords = [
    "masajes terapéuticos",
    "spa",
    "relajación", 
    "masajes deportivos",
    "bienestar",
    "reservas online",
    "masajes profesionales",
    "terapia muscular",
    "piedras calientes",
    "masajes relajantes"
  ],
  canonical,
  ogImage = "/og-image.jpg",
  noIndex = false,
  noFollow = false
}: SEOProps = {}): Metadata {
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: "Spa & Masajes Relajación" }],
    creator: "Spa & Masajes Relajación",
    publisher: "Spa & Masajes Relajación",
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: fullCanonical,
      siteName: "Spa & Masajes Relajación",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: 'es_ES',
      type: 'website',
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@spamasajes',
    },

    // Additional meta tags
    alternates: {
      canonical: fullCanonical,
    },

    // Robots
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: 'google-site-verification-code',
      // yandex: 'yandex-verification-code',
      // yahoo: 'yahoo-verification-code',
    },
  }
}

export function generateLocalBusinessStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://tumasajes.com/#business",
    "name": "Spa & Masajes Relajación",
    "description": "Servicios profesionales de masajes terapéuticos, relajantes y deportivos en un ambiente de tranquilidad y bienestar.",
    "url": "https://tumasajes.com",
    "telephone": "+1234567890",
    "email": "info@tumasajes.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Principal 123",
      "addressLocality": "Ciudad",
      "addressRegion": "Región",
      "postalCode": "12345",
      "addressCountry": "País"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-16:00"
    ],
    "priceRange": "$80-$140",
    "image": [
      "https://tumasajes.com/images/spa-exterior.jpg",
      "https://tumasajes.com/images/massage-room.jpg"
    ],
    "sameAs": [
      "https://www.facebook.com/spamasajes",
      "https://www.instagram.com/spamasajes",
      "https://www.twitter.com/spamasajes"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios de Masajes",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Masaje Relajante",
            "description": "Masaje suave y relajante para aliviar el estrés y la tensión muscular"
          },
          "price": "80",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Masaje Terapéutico",
            "description": "Masaje profundo para tratar dolores musculares y contracturas"
          },
          "price": "120",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Masaje Deportivo",
            "description": "Masaje especializado para deportistas, ideal para recuperación muscular"
          },
          "price": "100",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Masaje de Piedras Calientes",
            "description": "Relajante masaje con piedras volcánicas calientes"
          },
          "price": "140",
          "priceCurrency": "USD"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  }
}

export function StructuredDataScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0)
      }}
    />
  )
}

// Enhanced structured data for homepage
export function getHomepageStructuredData() {
  const organizationData = getOrganizationStructuredData()
  const websiteData = getWebsiteStructuredData()
  
  return combineStructuredData(organizationData, websiteData)
}

// Performance-optimized meta tags
export function getPerformanceMetaTags(): Metadata {
  return {
    other: {
      // DNS prefetch for external resources
      'dns-prefetch': 'https://fonts.googleapis.com',
      // Preconnect to critical resources
      'preconnect': 'https://fonts.gstatic.com',
      // Resource hints
      'resource-hints': 'preload',
      // Viewport optimization
      'viewport-fit': 'cover',
      // Theme color for mobile browsers
      'theme-color': '#10b981',
      'msapplication-TileColor': '#10b981',
      // Apple touch icon
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'Spa & Masajes',
      // Microsoft tiles
      'msapplication-config': '/browserconfig.xml',
      // Manifest
      'manifest': '/manifest.json',
    }
  }
}