import { useId } from "react"

function Star({ fill, gid }: { fill: number; gid: string }) {
  // fill: 0..1
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="inline-block shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gid}>
          <stop offset={`${fill * 100}%`} stopColor="oklch(0.78 0.15 75)" />
          <stop offset={`${fill * 100}%`} stopColor="oklch(0.88 0.01 260)" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid})`}
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  )
}

export function StarRating({
  rating,
  showNumber = true,
}: {
  rating: number | string | null
  showNumber?: boolean
}) {
  const baseId = useId()
  const value = rating ? Number(rating) : 0
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" aria-label={`Rated ${value} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, value - i))} gid={`${baseId}-${i}`} />
        ))}
      </span>
      {showNumber && value > 0 && (
        <span className="text-sm font-semibold text-foreground">{value.toFixed(1)}</span>
      )}
    </span>
  )
}
