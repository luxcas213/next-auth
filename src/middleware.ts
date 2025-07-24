import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(req: NextRequest) {
  console.log("🔥 Middleware ejecutado para:", req.nextUrl.pathname)
  
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token"
    })
    
    console.log("Token encontrado:", !!token)
    console.log("NEXTAUTH_SECRET existe:", !!process.env.NEXTAUTH_SECRET)

    if (!token) {
      console.log("❌ Sin token, redirigiendo a login")
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", req.url)
      return NextResponse.redirect(loginUrl)
    }

    console.log("✅ Token válido, continuando con la solicitud")
    return NextResponse.next()
  } catch (error) {
    console.error("💥 Error en middleware:", error)
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ['/secure']
}
