import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAMES, ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import type {
  SessionValidationResult,
  MiddlewareContext,
  MiddlewareResult,
} from "@/types/middleware";

/**
 * Extracts session token from request cookies
 */
export function getSessionToken(req: NextRequest): string | undefined {
  return SESSION_COOKIE_NAMES.map((name) => req.cookies.get(name)?.value).find(
    Boolean
  );
}

/**
 * Checks if the route is public and doesn't require authentication
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname as any);
}

/**
 * Checks if the route is the password setup page
 */
export function isPasswordSetupRoute(pathname: string): boolean {
  return pathname === ROUTES.SET_PASSWORD;
}

/**
 * Validates session with the database
 */
export async function validateSessionWithDatabase(
  req: NextRequest
): Promise<SessionValidationResult> {
  try {
    const sessionResponse = await fetch(new URL(ROUTES.API_SESSION, req.url), {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    if (!sessionResponse.ok) {
      return {
        isValid: false,
        session: null,
        error: `HTTP ${sessionResponse.status}: Failed to fetch session`,
      };
    }

    const session = await sessionResponse.json();

    if (!session || !session.user) {
      return {
        isValid: false,
        session: null,
        error: "Invalid or expired session",
      };
    }

    return {
      isValid: true,
      session,
      error: undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      session: null,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during session validation",
    };
  }
}

/**
 * Determines the middleware action based on context
 *
 * FLOW:
 * 1. Public routes → Allow access
 * 2. No session token → Redirect to login
 * 3. Invalid session → Redirect to login
 * 4. Valid session + no password set → Redirect to set-password
 * 5. Valid session + password set → Allow access
 * 6. Default → Allow access to protected routes
 */
export function determineMiddlewareAction(
  context: MiddlewareContext
): MiddlewareResult {
  const { pathname, sessionToken, session } = context;

  // If session token exists but session is invalid, clear cookies and redirect to login
  if (sessionToken && !session) return "clear_cookies_and_redirect_login";

  // Check if route is public (no authentication required)
  if (isPublicRoute(pathname)) return "allow";

  // Check if user has session token
  if (!sessionToken) return "redirect_login";

  // Check if session is valid
  if (!session) return "redirect_login";

  // Check if user is on home page without password set
  if (pathname === "/" && !session.user.hasSetPassword)
    return "redirect_set_password";

  // Check if user is on home page with password already set
  if (pathname === "/" && session.user.hasSetPassword) return "allow";

  // Check if user is on set-password page without password set
  if (pathname === "/set-password" && !session.user.hasSetPassword)
    return "allow";

  // Check if user has no password set (redirect to set password)
  if (!session.user.hasSetPassword) return "redirect_set_password";

  // Check if user with password is trying to access set-password page
  if (pathname === "/set-password" && session.user.hasSetPassword)
    return "redirect_home";

  return "allow";
}

/**
 * Creates middleware context from request
 * the context includes:
 * - pathname: The request path
 * - userAgent: The user agent string from request headers
 * - sessionToken: The session token extracted from cookies
 * - session: The validated session object (if available)
 */
export function createMiddlewareContext(req: NextRequest): MiddlewareContext {
  return {
    pathname: req.nextUrl.pathname,
    userAgent: req.headers.get("user-agent") || undefined,
  };
}

/**
 * Logs middleware events in a structured way
 */
export function logMiddlewareEvent(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  context: Partial<MiddlewareContext> & { [key: string]: any } = {}
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  // In development, use console with emojis for better readability
  if (process.env.NODE_ENV === "development") {
    const emoji = {
      info: "🔵",
      warn: "🟡",
      error: "🔴",
      debug: "🔍",
    }[level];

    console.log(`${emoji} [MIDDLEWARE] ${message}`, context);
  } else {
    // In production, use structured logging
    console.log(JSON.stringify(logData));
  }
}
