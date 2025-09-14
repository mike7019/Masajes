"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/admin/login")
    }
  }, [status, requireAuth, router])

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
  }
}

export function useAdminAuth() {
  const { session, status, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
      router.push("/admin/login")
    }
  }, [isAuthenticated, session, router])

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER"

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    isAdmin,
    user: session?.user,
  }
}