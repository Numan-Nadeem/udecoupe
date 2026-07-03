"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { verifyPassword, checkLoginRateLimit } from "@/lib/admin-auth"
import { getClientIp } from "@/lib/ip"

const loginSchema = z.object({
  password: z.string().min(8).max(200),
})

export interface LoginState {
  error: string | null
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: "Password must be at least 8 characters." }
  }

  const hdrs = await headers()
  const ip = getClientIp(hdrs)

  const allowed = await checkLoginRateLimit(ip)
  if (!allowed) {
    return { error: "Too many login attempts. Try again in 15 minutes." }
  }

  const valid = await verifyPassword(parsed.data.password)
  if (!valid) {
    // Constant generic message — do not leak whether config or password failed.
    return { error: "Incorrect password." }
  }

  const session = await getSession()
  session.isLoggedIn = true
  session.userId = "admin"
  session.loginTime = Date.now()
  await session.save()

  redirect("/admin/dashboard")
}

export async function logoutAction(): Promise<void> {
  const session = await getSession()
  session.destroy()
  redirect("/admin/login")
}
