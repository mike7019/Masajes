import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Si el usuario no tiene rol de ADMIN o MANAGER, redirigir al login
    if (req.nextUrl.pathname.startsWith("/admin") && 
        req.nextauth.token?.role !== "ADMIN" && 
        req.nextauth.token?.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a la página de login sin autenticación
        if (req.nextUrl.pathname === "/admin/login") {
          return true
        }
        
        // Para otras rutas admin, requerir token válido
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        
        // Permitir acceso a todas las demás rutas
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}