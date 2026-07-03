import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { FetchProgressProvider } from "@/components/admin/fetch-progress-provider"
import { logoutAction } from "../login/actions"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Udecoupe Admin" },
  robots: { index: false, follow: false },
}

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Defense in depth: middleware already guards /admin, but verify again here.
  const session = await getSession()
  if (!session.isLoggedIn || session.userId !== "admin") {
    redirect("/admin/login")
  }

  const logoutButton = (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        Sign out
      </button>
    </form>
  )

  return (
    <FetchProgressProvider>
      <div className="flex min-h-screen flex-col bg-background md:flex-row">
        <AdminSidebar logoutSlot={logoutButton} />
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </FetchProgressProvider>
  )
}
