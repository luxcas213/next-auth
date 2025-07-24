import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(req: NextRequest) {
  console.log("Middleware ejecutado para:", req.nextUrl.pathname)
  
  try {
    // Verificar si hay session en cookies
    console.log("🔍 Verificando session token en cookies")
    const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                        req.cookies.get('__Secure-next-auth.session-token')?.value


    // si no hay redirigir
    if (!sessionToken) {
      console.log("❌ Sin session token, redirigiendo a login")
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", req.url)
      return NextResponse.redirect(loginUrl)
    }

    
    try {
      // verificar la session con la db
      console.log("🔍 Verificando session en la base de datos")
      const sessionResponse = await fetch(new URL('/api/auth/session', req.url), {
        headers: {
          cookie: req.headers.get('cookie') || ''
        }
      })

      //si la respuesta no es ok, redirigir 
      if (!sessionResponse.ok) {
        console.log("❌ Error al verificar sesión, status:", sessionResponse.status)
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", req.url)
        return NextResponse.redirect(loginUrl)
      }

      const session = await sessionResponse.json()
      
      // si no hay session o user, redirigir
      if (!session || !session.user) {
        console.log("❌ Sesión inválida o expirada")
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", req.url)
        return NextResponse.redirect(loginUrl)
      }

      // si hay session, continuar
      console.log("✅ Sesión válida para usuario:", session.user.email)
      return NextResponse.next()
    } catch (fetchError) {

      //si hay error redirigir
      console.error("❌ Error al verificar sesión con la base de datos:", fetchError)
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", req.url)
      return NextResponse.redirect(loginUrl)
    }

  } catch (error) {
    console.error("💥 Error en middleware:", error)
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ['/secure', "/secure/:path*"]
}
