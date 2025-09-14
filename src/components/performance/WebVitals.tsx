'use client'

import { useEffect } from 'react'

// Web Vitals monitoring component
export function WebVitals() {
  useEffect(() => {
    // Only run in production and if web vitals are supported
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return
    }

    // Dynamic import to avoid loading in development
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // Core Web Vitals
      onCLS(sendToAnalytics)
      onFID(sendToAnalytics)
      onLCP(sendToAnalytics)
      
      // Other important metrics
      onFCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error)
    })
  }, [])

  return null // This component doesn't render anything
}

// Send metrics to analytics service
function sendToAnalytics(metric: { name: string; value: number; id: string }) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
    return
  }

  // Send to Google Analytics 4 if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      custom_map: { metric_id: 'custom_metric' },
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Send to custom analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      url: window.location.href,
      timestamp: Date.now(),
    }),
  }).catch((error) => {
    console.warn('Failed to send web vitals:', error)
  })
}

// Performance observer for custom metrics
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration, 'ms')
            
            // Send to analytics
            sendToAnalytics({
              name: 'long-task',
              value: entry.duration,
              id: `long-task-${Date.now()}`,
            })
          }
        }
      })

      longTaskObserver.observe({ entryTypes: ['longtask'] })

      return () => {
        longTaskObserver.disconnect()
      }
    } catch (error) {
      console.warn('Long task observer not supported:', error)
    }
  }, [])
}

// Component to measure specific interactions
export function PerformanceMarker({ name, children }: { name: string; children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
      
      return () => {
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
        
        const measure = performance.getEntriesByName(name, 'measure')[0]
        if (measure) {
          console.log(`${name} took ${measure.duration}ms`)
          
          // Send to analytics if it's a significant duration
          if (measure.duration > 100) {
            sendToAnalytics({
              name: 'custom-timing',
              value: measure.duration,
              id: `${name}-${Date.now()}`,
            })
          }
        }
      }
    }
  }, [name])

  return <>{children}</>
}