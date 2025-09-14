import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth/utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      }
    })
  } catch (error) {
    console.error("Error checking auth status:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}