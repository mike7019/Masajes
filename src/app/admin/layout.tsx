"use client"

import { SessionProvider } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { AdminNavigation } from "@/components/admin/AdminNavigation"
import { ToastProvider } from "@/components/ui/Toast"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <AdminNavigation />
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </ToastProvider>
      </ProtectedRoute>
    </SessionProvider>
  )
}