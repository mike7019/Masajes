import { Promocion } from '@/types'
import { cn } from '@/lib/utils/cn'

interface PromotionBadgeProps {
  promocion: Promocion
  className?: string
  showDescription?: boolean
}

export function PromotionBadge({ promocion, className, showDescription = false }: PromotionBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
      "bg-red-100 text-red-800 border border-red-200",
      className
    )}>
      <span className="mr-1">🎯</span>
      <span>{promocion.descuento.toString()}% OFF</span>
      {showDescription && (
        <span className="ml-2 text-xs opacity-80">
          {promocion.nombre}
        </span>
      )}
    </div>
  )
}

export function calculateDiscountedPrice(originalPrice: number, descuento: number): number {
  return originalPrice * (1 - descuento / 100)
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`
}