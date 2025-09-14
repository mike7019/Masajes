'use client'

import { useEffect, useCallback, useRef } from 'react'

// Performance monitoring hook
export function usePerformance() {
  const metricsRef = useRef<Map<string, number>>(new Map())

  // Mark performance timing
  const mark = useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
      metricsRef.current.set(`${name}-start`, performance.now())
    }
  }, [])

  // Measure performance timing
  const measure = useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const startTime = metricsRef.current.get(`${name}-start`)
      if (startTime) {
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
        
        const measure = performance.getEntriesByName(name, 'measure')[0]
        if (measure) {
          console.log(`${name}: ${measure.duration.toFixed(2)}ms`)
          
          // Send to analytics if duration is significant
          if (measure.duration > 100) {
            sendPerformanceMetric({
              name,
              duration: measure.duration,
              type: 'timing'
            })
          }
        }
        
        metricsRef.current.delete(`${name}-start`)
      }
    }
  }, [])

  // Monitor long tasks
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    let longTaskObserver: PerformanceObserver

    try {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`)
            
            sendPerformanceMetric({
              name: 'long-task',
              duration: entry.duration,
              type: 'longtask'
            })
          }
        }
      })

      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long task observer not supported:', error)
    }

    return () => {
      if (longTaskObserver) {
        longTaskObserver.disconnect()
      }
    }
  }, [])

  return { mark, measure }
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0)
  const { mark, measure } = usePerformance()

  useEffect(() => {
    renderCount.current += 1
    mark(`${componentName}-render-${renderCount.current}`)
    
    return () => {
      measure(`${componentName}-render-${renderCount.current}`)
    }
  })

  return renderCount.current
}

// Hook for monitoring API call performance
export function useAPIPerformance() {
  const trackAPICall = useCallback(async <T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      console.log(`API ${name}: ${duration.toFixed(2)}ms`)
      
      sendPerformanceMetric({
        name: `api-${name}`,
        duration,
        type: 'api'
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      sendPerformanceMetric({
        name: `api-${name}-error`,
        duration,
        type: 'api-error'
      })
      
      throw error
    }
  }, [])

  return { trackAPICall }
}

// Hook for monitoring resource loading
export function useResourcePerformance() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    let resourceObserver: PerformanceObserver

    try {
      resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          
          // Monitor slow resources
          if (resource.duration > 1000) {
            console.warn(`Slow resource: ${resource.name} took ${resource.duration.toFixed(2)}ms`)
            
            sendPerformanceMetric({
              name: 'slow-resource',
              duration: resource.duration,
              type: 'resource',
              url: resource.name
            })
          }
          
          // Monitor large resources
          if (resource.transferSize && resource.transferSize > 500000) { // 500KB
            console.warn(`Large resource: ${resource.name} is ${(resource.transferSize / 1024).toFixed(2)}KB`)
            
            sendPerformanceMetric({
              name: 'large-resource',
              duration: resource.duration,
              type: 'resource',
              url: resource.name,
              size: resource.transferSize
            })
          }
        }
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Resource observer not supported:', error)
    }

    return () => {
      if (resourceObserver) {
        resourceObserver.disconnect()
      }
    }
  }, [])
}

// Send performance metrics to analytics
function sendPerformanceMetric(metric: {
  name: string
  duration: number
  type: string
  url?: string
  size?: number
}) {
  // Only send in production
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...metric,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }),
  }).catch((error) => {
    console.warn('Failed to send performance metric:', error)
  })
}