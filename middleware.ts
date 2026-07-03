import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { sessionOptions, type SessionData } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) return NextResponse.next()

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  const isLoginPage = pathname === "/admin/login"

  if (!session.isLoggedIn || session.userId !== "admin") {
    if (isLoginPage) return response
    const loginUrl = new URL("/admin/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Already authenticated: keep them out of the login page.
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
