import { Button } from '@/components/ui'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>
        
        <p className="text-gray-600 mb-8">
          No tienes permisos suficientes para acceder a esta área. 
          Solo los administradores pueden acceder al panel administrativo.
        </p>
        
        <div className="space-y-4">
          <Button asChild>
            <Link href="/">
              Volver al Inicio
            </Link>
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>¿Crees que esto es un error?</p>
            <a 
              href="mailto:soporte@tumasajes.com" 
              className="text-spa-primary hover:underline"
            >
              Contacta al soporte técnico
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}