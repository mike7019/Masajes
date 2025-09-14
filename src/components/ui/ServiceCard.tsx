import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Card, CardContent, CardFooter } from './Card'
import { Button } from './Button'
import { Badge } from './Badge'

interface ServiceCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  duration: number
  price: number
  originalPrice?: number
  image?: string
  features?: string[]
  onReserve?: () => void
  reserveText?: string
  isPopular?: boolean
}

const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ 
    className, 
    title, 
    description, 
    duration, 
    price, 
    originalPrice,
    image,
    features = [],
    onReserve,
    reserveText = 'Reservar',
    isPopular = false,
    ...props 
  }, ref) => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const formatDuration = (minutes: number) => {
      if (minutes < 60) {
        return `${minutes} min`
      }
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes === 0) {
        return `${hours}h`
      }
      return `${hours}h ${remainingMinutes}min`
    }

    return (
      <Card 
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300 hover:shadow-lg group',
          isPopular && 'ring-2 ring-spa-primary ring-opacity-50',
          className
        )}
        {...props}
      >
        {isPopular && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="default" size="sm">
              Popular
            </Badge>
          </div>
        )}

        {image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-spa-primary transition-colors">
              {title}
            </h3>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                {originalPrice && originalPrice > price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="text-lg font-bold text-spa-primary">
                  {formatPrice(price)}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>

          {features.length > 0 && (
            <div className="space-y-2 mb-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-spa-sage mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {onReserve && (
          <CardFooter className="p-6 pt-0">
            <Button 
              onClick={onReserve}
              className="w-full"
              variant="primary"
            >
              {reserveText}
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }
)

ServiceCard.displayName = 'ServiceCard'

export { ServiceCard }