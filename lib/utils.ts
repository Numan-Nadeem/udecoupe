export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function formatStudents(n: number | null | undefined): string {
  if (!n) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

const CATEGORY_COLORS: Record<string, string> = {
  Development: "bg-[oklch(0.95_0.03_250)] text-[oklch(0.4_0.15_260)]",
  Design: "bg-[oklch(0.95_0.04_350)] text-[oklch(0.45_0.16_355)]",
  Business: "bg-[oklch(0.95_0.04_160)] text-[oklch(0.4_0.12_165)]",
  Marketing: "bg-[oklch(0.95_0.05_40)] text-[oklch(0.45_0.15_45)]",
  "IT & Software": "bg-[oklch(0.95_0.03_220)] text-[oklch(0.4_0.13_225)]",
  Photography: "bg-[oklch(0.95_0.03_300)] text-[oklch(0.42_0.13_305)]",
  Music: "bg-[oklch(0.95_0.04_20)] text-[oklch(0.45_0.16_25)]",
}

export function categoryBadgeClass(category: string | null | undefined): string {
  if (category && CATEGORY_COLORS[category]) return CATEGORY_COLORS[category]
  return "bg-secondary text-secondary-foreground"
}
