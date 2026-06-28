"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  className?: string
  height?: number
  width?: number
}

export function Logo({ className = "h-10 w-auto", height = 40, width = 200 }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — render nothing until mounted
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Reserve space so the header doesn't shift on mount
    return <div style={{ width, height }} aria-hidden="true" />
  }

  const src = resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"

  return (
    <Image
      src={src}
      alt="Udecoupe"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
