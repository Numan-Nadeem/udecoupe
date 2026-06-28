import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

// Cache limiter instances by their config so we don't recreate per request.
const limiters = new Map<string, Ratelimit>()

/**
 * Check a sliding-window rate limit.
 * @param identifier unique key (e.g. `subscribe:<ip>`)
 * @param limit max requests allowed in the window
 * @param windowSeconds window size in seconds
 * @returns true if the request is allowed, false if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const client = getRedis()
  // Fail open if Redis is not configured — never block users on misconfig.
  if (!client) return true

  const cacheKey = `${limit}:${windowSeconds}`
  let limiter = limiters.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: "udecoupe-rl",
    })
    limiters.set(cacheKey, limiter)
  }

  try {
    const { success } = await limiter.limit(identifier)
    return success
  } catch (err) {
    console.error("[v0] Rate limit error:", err)
    return true // fail open
  }
}
