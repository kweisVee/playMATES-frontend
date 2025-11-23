import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/browse-all-meetups",
  "/create-meetup",
  "/profile",
  "/my-meetups",
  "/meetup",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user has authentication cookie
  const token = request.cookies.get("token")?.value
  
  console.log("Middleware: Path:", pathname, "| Token exists:", !!token)
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  )
  
  // If accessing a protected route without token, redirect to home
  if (isProtectedRoute && !token) {
    console.log("Middleware: Protected route without token, redirecting to /")
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }
  
  console.log("Middleware: Allowing access to", pathname)
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}

