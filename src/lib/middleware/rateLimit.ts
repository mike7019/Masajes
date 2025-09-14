import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
}

// In-memory store for rate limiting (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest): NextResponse | null {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    
    // Clean up expired entries
    for (const [k, v] of requestCounts.entries()) {
      if (now > v.resetTime) {
        requestCounts.delete(k)
      }
    }
    
    const current = requestCounts.get(key)
    
    if (!current) {
      // First request from this IP for this endpoint
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Allow request
    }
    
    if (now > current.resetTime) {
      // Window has expired, reset
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Allow request
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: config.message || 'Demasiadas solicitudes. Inténtalo más tarde.',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.maxRequests - current.count).toString(),
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      )
    }
    
    // Increment counter
    current.count++
    return null // Allow request
  }
}

// Predefined rate limiters
export const reservationRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 reservations per 15 minutes per IP
  message: 'Demasiadas reservas en poco tiempo. Espera 15 minutos antes de intentar nuevamente.'
})

export const generalApiRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute per IP
  message: 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.'
})

export const searchRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30, // 30 searches per minute per IP
  message: 'Demasiadas búsquedas. Espera un momento antes de intentar nuevamente.'
})