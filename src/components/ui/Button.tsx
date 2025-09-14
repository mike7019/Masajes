import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage' | 'warm'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  asChild?: boolean
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, asChild = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-spa-primary text-white hover:bg-spa-primary/90 focus-visible:ring-spa-primary',
      secondary: 'bg-spa-secondary text-white hover:bg-spa-secondary/90 focus-visible:ring-spa-secondary',
      outline: 'border border-spa-primary text-spa-primary hover:bg-spa-primary hover:text-white focus-visible:ring-spa-primary',
      ghost: 'text-spa-primary hover:bg-spa-neutral focus-visible:ring-spa-primary',
      sage: 'bg-spa-sage text-white hover:bg-spa-sage/90 focus-visible:ring-spa-sage',
      warm: 'bg-spa-warm text-white hover:bg-spa-warm/90 focus-visible:ring-spa-warm'
    }
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-lg'
    }

    const classes = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      className
    )

    if (asChild) {
      // Si asChild es true, clonamos el children y le agregamos las clases
      const child = children as React.ReactElement
      return React.cloneElement(child, {
        ...props,
        className: cn(classes, (child.props as any)?.className),
      } as any)
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }