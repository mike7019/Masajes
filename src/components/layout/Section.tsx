import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Container } from './Container'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  background?: 'white' | 'light' | 'neutral' | 'gradient' | 'sage-gradient'
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ 
    className, 
    children, 
    containerSize = 'lg',
    padding = 'lg',
    background = 'white',
    ...props 
  }, ref) => {
    const paddings = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24'
    }

    const backgrounds = {
      white: 'bg-white',
      light: 'spa-bg-light',
      neutral: 'spa-bg-neutral',
      gradient: 'spa-gradient',
      'sage-gradient': 'spa-gradient-sage'
    }

    return (
      <section
        ref={ref}
        className={cn(
          backgrounds[background],
          paddings[padding],
          className
        )}
        {...props}
      >
        <Container size={containerSize}>
          {children}
        </Container>
      </section>
    )
  }
)

Section.displayName = 'Section'

export { Section }