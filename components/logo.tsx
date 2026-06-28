interface LogoProps {
  className?: string
}

export function Logo({ className = "h-10 w-auto" }: LogoProps) {
  return (
    <>
      {/* Light mode logo */}
      <img
        src="/logo-light.svg"
        alt="Udecoupe"
        className={`${className} block dark:hidden`}
      />
      {/* Dark mode logo */}
      <img
        src="/logo-dark.svg"
        alt="Udecoupe"
        className={`${className} hidden dark:block`}
        aria-hidden="true"
      />
    </>
  )
}
