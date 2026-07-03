import { getIronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"

export interface SessionData {
  isLoggedIn: boolean
  userId: string
  loginTime: number
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
  userId: "",
  loginTime: 0,
}

const isProd = process.env.NODE_ENV === "production"

export const sessionOptions: SessionOptions = {
  password:
    process.env.IRON_SESSION_SECRET ||
    // Fallback only so the build doesn't crash before env is set.
    // Login is refused at runtime when the real secret is missing (see admin-auth.ts).
    "insecure-dev-fallback-secret-please-set-env-32",
  cookieName: "admin_session",
  cookieOptions: {
    httpOnly: true,
    // The v0 / Vercel preview renders inside a cross-site iframe; strict
    // cookies would be dropped there. Production uses strict for max CSRF safety.
    secure: true,
    sameSite: isProd ? ("strict" as const) : ("none" as const),
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  },
}

export function hasSessionSecret(): boolean {
  const s = process.env.IRON_SESSION_SECRET
  return typeof s === "string" && s.length >= 32
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

/** Throws if there is no valid logged-in admin session. Use in every mutation. */
export async function requireAdmin(): Promise<SessionData> {
  const session = await getSession()
  if (!session.isLoggedIn || session.userId !== "admin") {
    throw new Error("Unauthorized")
  }
  return session
}
