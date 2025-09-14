// Image optimization utilities for better Core Web Vitals

export interface ImageOptimizationConfig {
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  sizes?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
}

// Predefined image configurations for different use cases
export const imageConfigs = {
  hero: {
    quality: 90,
    format: 'webp' as const,
    sizes: '100vw',
    priority: true,
    loading: 'eager' as const,
  },
  service: {
    quality: 80,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority: false,
    loading: 'lazy' as const,
  },
  thumbnail: {
    quality: 75,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 50vw, 25vw',
    priority: false,
    loading: 'lazy' as const,
  },
  gallery: {
    quality: 85,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, 50vw',
    priority: false,
    loading: 'lazy' as const,
  },
  avatar: {
    quality: 80,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 64px, 96px',
    priority: false,
    loading: 'lazy' as const,
  },
} as const

// Generate responsive image srcSet
export function generateSrcSet(
  baseSrc: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  return widths
    .map(width => {
      const url = new URL(baseSrc, window.location.origin)
      url.searchParams.set('w', width.toString())
      return `${url.toString()} ${width}w`
    })
    .join(', ')
}

// Calculate optimal image dimensions
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight
  
  let width = Math.min(originalWidth, maxWidth)
  let height = width / aspectRatio
  
  if (maxHeight && height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}

// Generate blur placeholder
export function generateBlurPlaceholder(
  width: number = 8,
  height: number = 8,
  color: string = '#f3f4f6'
): string {
  // Create a simple SVG blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <filter id="blur">
        <feGaussianBlur stdDeviation="2"/>
      </filter>
      <rect width="100%" height="100%" fill="${color}" filter="url(#blur)"/>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Preload critical images
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = src
  document.head.appendChild(link)
}

// Lazy load images with Intersection Observer
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }
  
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, defaultOptions)
}

// Image loading performance metrics
export function measureImageLoadTime(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now()
    const img = new Image()
    
    img.onload = () => {
      const loadTime = performance.now() - startTime
      resolve(loadTime)
    }
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`))
    }
    
    img.src = src
  })
}

// Optimize image loading order
export function prioritizeImageLoading(images: HTMLImageElement[]): void {
  // Sort images by their position in viewport and importance
  const sortedImages = images.sort((a, b) => {
    const aRect = a.getBoundingClientRect()
    const bRect = b.getBoundingClientRect()
    
    // Prioritize images in viewport
    const aInViewport = aRect.top < window.innerHeight && aRect.bottom > 0
    const bInViewport = bRect.top < window.innerHeight && bRect.bottom > 0
    
    if (aInViewport && !bInViewport) return -1
    if (!aInViewport && bInViewport) return 1
    
    // Then by vertical position
    return aRect.top - bRect.top
  })
  
  // Load images with staggered timing
  sortedImages.forEach((img, index) => {
    setTimeout(() => {
      if (img.dataset.src) {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      }
    }, index * 100) // 100ms delay between each image
  })
}