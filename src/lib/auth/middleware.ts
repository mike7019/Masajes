import { getServerSession } from 'next-auth'
import { authOptions } from './config'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autorizado. Inicia sesión para continuar.' },
      { status: 401 }
    )
  }

  return session
}

export async function requireAdminAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autorizado. Inicia sesión para continuar.' },
      { status: 401 }
    )
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
    return NextResponse.json(
      { error: 'Acceso denegado. Se requieren permisos de administrador.' },
      { status: 403 }
    )
  }

  return session
}

export function withAuth(handler: Function) {
  return async function(request: NextRequest, context: any) {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Add session to context
    context.session = authResult
    return handler(request, context)
  }
}

export function withAdminAuth(handler: Function) {
  return async function(request: NextRequest, context: any) {
    const authResult = await requireAdminAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Add session to context
    context.session = authResult
    return handler(request, context)
  }
}