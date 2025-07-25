export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SET_PASSWORD: '/set-password',
  SECURE: '/secure',
  API_SESSION: '/api/auth/session'
} as const

export const SESSION_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token'
] as const

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN
] as const

export const PROTECTED_ROUTES = [
  ROUTES.SECURE,
  ROUTES.SET_PASSWORD
] as const
