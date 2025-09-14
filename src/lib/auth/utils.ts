import { getServerSession } from "next-auth/next"
import { authOptions } from "./config"
import { redirect } from "next/navigation"

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getAuthSession()
  
  if (!session) {
    redirect("/admin/login")
  }
  
  return session
}

export async function requireAdminAuth() {
  const session = await requireAuth()
  
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    redirect("/admin/login")
  }
  
  return session
}