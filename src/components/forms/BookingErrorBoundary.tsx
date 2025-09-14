'use client'

import { Component, ReactNode } from 'react'
import { ErrorState, Button } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class BookingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Booking form error:', error, errorInfo)
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="space-y-4">
            <ErrorState
              title="Error en el formulario de reservas"
              message="Ha ocurrido un error inesperado. Por favor, recarga la página e intenta nuevamente."
              onRetry={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
              retryText="Recargar página"
            />
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Volver atrás
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/contacto'}
                className="w-full"
              >
                Contactar por teléfono
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}