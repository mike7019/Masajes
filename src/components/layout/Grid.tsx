import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    children, 
    cols = 3,
    gap = 'md',
    responsive = true,
    ...props 
  }, ref) => {
    const colsClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6'
    }

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12'
    }

    const responsiveClasses = responsive ? {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
    } : colsClasses

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          responsive ? responsiveClasses[cols] : colsClasses[cols],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'

export { Grid }