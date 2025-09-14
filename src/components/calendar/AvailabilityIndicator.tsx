import { cn } from '@/lib/utils/cn'

interface AvailabilityIndicatorProps {
  available: boolean
  reserved?: boolean
  selected?: boolean
  className?: string
  showText?: boolean
}

export function AvailabilityIndicator({ 
  available, 
  reserved = false, 
  selected = false, 
  className,
  showText = false 
}: AvailabilityIndicatorProps) {
  const getIndicatorClass = () => {
    if (selected) return 'bg-spa-primary text-white'
    if (reserved) return 'bg-red-100 text-red-800 border-red-200'
    if (available) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-gray-100 text-gray-500 border-gray-200'
  }

  const getStatusText = () => {
    if (selected) return 'Seleccionado'
    if (reserved) return 'Ocupado'
    if (available) return 'Disponible'
    return 'No disponible'
  }

  const getStatusIcon = () => {
    if (selected) return '✓'
    if (reserved) return '✕'
    if (available) return '○'
    return '●'
  }

  return (
    <div className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      getIndicatorClass(),
      className
    )}>
      <span className="mr-1">{getStatusIcon()}</span>
      {showText && <span>{getStatusText()}</span>}
    </div>
  )
}

export function AvailabilityLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-sm', className)}>
      <div className="flex items-center">
        <AvailabilityIndicator available={true} className="mr-2" />
        <span className="text-gray-600">Disponible</span>
      </div>
      <div className="flex items-center">
        <AvailabilityIndicator available={false} reserved={true} className="mr-2" />
        <span className="text-gray-600">Ocupado</span>
      </div>
      <div className="flex items-center">
        <AvailabilityIndicator available={true} selected={true} className="mr-2" />
        <span className="text-gray-600">Seleccionado</span>
      </div>
      <div className="flex items-center">
        <AvailabilityIndicator available={false} className="mr-2" />
        <span className="text-gray-600">No disponible</span>
      </div>
    </div>
  )
}