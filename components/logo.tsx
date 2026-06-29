interface LogoProps {
  className?: string
}

export function Logo({ className = "h-7 w-auto" }: LogoProps) {
  return (
    <span className="flex items-center gap-1.5">
      <img src="/logo-icon.webp" alt="" aria-hidden="true" className={className} />
      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-primary">ude</span>
        <span className="text-foreground">coupe</span>
      </span>
      <span className="sr-only">Udecoupe</span>
    </span>
  )
}
