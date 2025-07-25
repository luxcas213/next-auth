import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROUTES } from "@/lib/constants"

import {
  getSessionToken,
  validateSessionWithDatabase,
  determineMiddlewareAction,
  createMiddlewareContext,
  logMiddlewareEvent
} from "@/lib/middleware-utils"

import type { MiddlewareContext } from "@/types/middleware"

/**
 * Creates a redirect response to login page with callback URL
 */
function createRedirectToLogin(req: NextRequest): NextResponse {
  const loginUrl = new URL(ROUTES.LOGIN, req.url)
  loginUrl.searchParams.set("callbackUrl", req.url)
  return NextResponse.redirect(loginUrl)
}

/**
 * Creates a redirect response to login page and clears session cookies
 */
function createRedirectToLoginWithClearedCookies(req: NextRequest): NextResponse {
  const loginUrl = new URL(ROUTES.LOGIN, req.url)
  loginUrl.searchParams.set("callbackUrl", req.url)
  const response = NextResponse.redirect(loginUrl)
  
  // Clear all session cookies
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url'
  ]
  
  cookieNames.forEach(cookieName => {
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  })
  
  return response
}

/**
 * Creates a redirect response to home page
 */
function createRedirectToHome(req: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(ROUTES.HOME, req.url))
}

/**
 * Creates a redirect response to set password page
 */
function createRedirectToSetPassword(req: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(ROUTES.SET_PASSWORD, req.url))
}

/**
 * Main middleware function that handles authentication and routing
 */
export default async function middleware(req: NextRequest) {
  const startTime = performance.now()
  const context: MiddlewareContext = createMiddlewareContext(req)
  
  logMiddlewareEvent('info', 'Middleware execution started', { 
    pathname: context.pathname,
    userAgent: context.userAgent 
  })

  try {
    // 1. Extract session token from cookies
    context.sessionToken = getSessionToken(req)
    
    if (context.sessionToken) {
      logMiddlewareEvent('debug', 'Session token found', { pathname: context.pathname })
    } else {
      logMiddlewareEvent('debug', 'No session token found', { pathname: context.pathname })
    }

    // 2. Validate session with database if token exists
    if (context.sessionToken) {
      const validationResult = await validateSessionWithDatabase(req)
      
      if (!validationResult.isValid) {
        logMiddlewareEvent('warn', 'Session validation failed', { 
          pathname: context.pathname,
          error: validationResult.error 
        })
      } else {
        context.session = validationResult.session
        logMiddlewareEvent('debug', 'Session validated successfully', { 
          pathname: context.pathname,
          userId: context.session?.user.id,
          userEmail: context.session?.user.email,
          hasSetPassword: context.session?.user.hasSetPassword
        })
      }
    }

    // 3. Determine action based on context
    const action = determineMiddlewareAction(context)
    
    // 4. Execute action
    let response: NextResponse
    
    switch (action) {
      case 'allow':
        logMiddlewareEvent('debug', 'Access allowed', { pathname: context.pathname })
        response = NextResponse.next()
        break
        
      case 'redirect_login':
        logMiddlewareEvent('info', 'Redirecting to login', { 
          pathname: context.pathname,
          reason: !context.sessionToken ? 'no_token' : 'invalid_session'
        })
        response = createRedirectToLogin(req)
        break

      case 'clear_cookies_and_redirect_login':
        logMiddlewareEvent('info', 'Clearing cookies and redirecting to login', { 
          pathname: context.pathname,
          reason: 'invalid_session_with_token'
        })
        response = createRedirectToLoginWithClearedCookies(req)
        break
        
      case 'redirect_home':
        logMiddlewareEvent('info', 'Redirecting to home', { 
          pathname: context.pathname,
          reason: 'user_has_password'
        })
        response = createRedirectToHome(req)
        break
        
      case 'redirect_set_password':
        logMiddlewareEvent('info', 'Redirecting to set password', { 
          pathname: context.pathname,
          userId: context.session?.user.id
        })
        response = createRedirectToSetPassword(req)
        break
        
      default:
        logMiddlewareEvent('error', 'Unknown middleware action', { 
          pathname: context.pathname,
          action 
        })
        response = createRedirectToLogin(req)
    }

    const endTime = performance.now()
    logMiddlewareEvent('info', 'Middleware execution completed', {
      pathname: context.pathname,
      action,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    })

    return response

  } catch (error) {
    const endTime = performance.now()
    logMiddlewareEvent('error', 'Middleware execution failed', {
      pathname: context.pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    })
    
    return createRedirectToLogin(req)
  }
}

/**
 * Middleware configuration
 * Matches all routes except static assets and API routes
 */
export const config = {
  matcher: [
    // Include all routes except:
    // - API routes (handled by Next.js)
    // - Static files (_next/static)
    // - Images (_next/image)
    // - Favicon and other static assets
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
}
