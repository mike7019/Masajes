import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: ReactNode
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8',
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

export { Container }