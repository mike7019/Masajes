import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
}

export function ErrorState({ 
  title = 'Algo salió mal',
  message = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
  onRetry,
  retryText = 'Intentar de nuevo'
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-600 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryText}
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ 
  title = 'No hay datos',
  message = 'No se encontraron elementos para mostrar.',
  icon
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3">
        {icon || (
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 max-w-md">{message}</p>
    </div>
  )
}