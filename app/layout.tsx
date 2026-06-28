import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Udecoupe — Free Udemy Courses with Active Coupons",
    template: "%s — Udecoupe",
  },
  description:
    "Discover free Udemy courses with active coupon codes. Hand-picked, verified, and updated daily across development, design, business, and more.",
  keywords: ["free udemy courses", "udemy coupons", "free online courses", "udemy discount codes"],
  openGraph: {
    title: "Udecoupe — Free Udemy Courses with Active Coupons",
    description:
      "Discover free Udemy courses with active coupon codes. Verified and updated daily.",
    url: baseUrl,
    siteName: "Udecoupe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Udecoupe — Free Udemy Courses with Active Coupons",
    description: "Discover free Udemy courses with active coupon codes.",
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#3a2f9e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`bg-background ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
