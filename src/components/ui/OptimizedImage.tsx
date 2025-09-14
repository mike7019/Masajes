'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  loading?: 'lazy' | 'eager'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  loading = 'lazy',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Error al cargar imagen</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes || (fill ? '100vw' : undefined)}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        loading={loading}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        {...props}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        />
      )}
    </div>
  )
}

// Preset configurations for common use cases
export const HeroImage = (props: Omit<OptimizedImageProps, 'priority' | 'sizes'>) => (
  <OptimizedImage
    priority
    sizes="100vw"
    quality={90}
    {...props}
  />
)

export const ServiceImage = (props: Omit<OptimizedImageProps, 'sizes' | 'quality'>) => (
  <OptimizedImage
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    quality={80}
    {...props}
  />
)

export const ThumbnailImage = (props: Omit<OptimizedImageProps, 'sizes' | 'quality'>) => (
  <OptimizedImage
    sizes="(max-width: 768px) 50vw, 25vw"
    quality={75}
    {...props}
  />
)