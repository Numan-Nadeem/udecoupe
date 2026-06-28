interface LogoProps {
  className?: string
}

export function Logo({ className = "h-9 w-auto" }: LogoProps) {
  return (
    <span className="flex items-center gap-2">
      <img src="/logo-icon.png" alt="" aria-hidden="true" className={className} />
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-primary">ude</span>
        <span className="text-foreground">coupe</span>
      </span>
      <span className="sr-only">Udecoupe</span>
    </span>
  )
}
