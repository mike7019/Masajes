'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface LazyComponentProps {
  fallback?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

// Generic lazy loading wrapper
export function LazyComponent({ 
  fallback = <ComponentSkeleton />, 
  className,
  children 
}: LazyComponentProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  )
}

// Default loading skeleton
export function ComponentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-gray-200 rounded-lg h-48 w-full mb-4" />
      <div className="space-y-2">
        <div className="bg-gray-200 rounded h-4 w-3/4" />
        <div className="bg-gray-200 rounded h-4 w-1/2" />
      </div>
    </div>
  )
}

// Calendar skeleton for heavy calendar component
export function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-8 w-48 mb-4" />
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded h-8" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded h-12" />
        ))}
      </div>
    </div>
  )
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-gray-200 rounded h-10 w-full" />
      <div className="bg-gray-200 rounded h-10 w-full" />
      <div className="bg-gray-200 rounded h-24 w-full" />
      <div className="bg-gray-200 rounded h-10 w-32" />
    </div>
  )
}

// Chart/Stats skeleton
export function StatsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24" />
        ))}
      </div>
      <div className="bg-gray-200 rounded-lg h-64" />
    </div>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyWrappedComponent = lazy(() => Promise.resolve({ default: Component }))
  
  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <LazyWrappedComponent {...props} />
      </Suspense>
    )
  }
}

// Intersection Observer based lazy loading
export function LazyOnScroll({ 
  children, 
  fallback = <ComponentSkeleton />,
  rootMargin = '50px',
  className 
}: LazyComponentProps & { rootMargin?: string }) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  )
}