"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "MANAGER"
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = "ADMIN" 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/admin/login")
      return
    }

    // Verificar si el usuario tiene el rol requerido
    if (requiredRole && session.user.role !== requiredRole && session.user.role !== "ADMIN") {
      router.push("/admin/login")
      return
    }
  }, [session, status, router, requiredRole])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}