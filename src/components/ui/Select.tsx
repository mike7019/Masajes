'use client'

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  children: ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, placeholder, children, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-spa-primary focus:outline-none focus:ring-2 focus:ring-spa-primary/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            ref={ref}
            id={selectId}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }