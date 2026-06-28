"use client"

import { useTheme } from "next-themes"

interface LogoProps {
  className?: string
}

export function Logo({ className = "h-10 w-auto" }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const src = isDark ? "/logo-dark.svg" : "/logo-light.svg"

  return (
    <img
      key={src}
      src={src}
      alt="Udecoupe"
      className={className}
      style={{ display: "block" }}
    />
  )
}
