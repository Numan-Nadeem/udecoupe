import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { sessionOptions, type SessionData } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) return NextResponse.next()

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  const isLoginPage = pathname === "/admin/login"
  const isPublicAdminPage =
    isLoginPage ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password"

  if (!session.isLoggedIn || session.userId !== "admin") {
    if (isPublicAdminPage) return response
    const loginUrl = new URL("/admin/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Already authenticated: keep them out of the login/reset pages.
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
