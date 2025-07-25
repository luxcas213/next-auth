export interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  hasSetPassword?: boolean
}

export interface Session {
  user: SessionUser
  expires: string
}

export interface SessionValidationResult {
  isValid: boolean
  session: Session | null
  error?: string
}

export interface MiddlewareContext {
  pathname: string
  sessionToken?: string
  session?: Session | null
  userAgent?: string
}

export interface MiddlewareConfig {
  publicRoutes: readonly string[]
  protectedRoutes: readonly string[]
  sessionCookieNames: readonly string[]
}

export type MiddlewareResult = 'allow' | 'redirect_login' | 'redirect_home' | 'redirect_set_password' | 'clear_cookies_and_redirect_login'
