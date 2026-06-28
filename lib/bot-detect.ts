const BOT_AGENTS = [
  "Googlebot",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baidu",
  "YandexBot",
  "Sogou",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "TelegramBot",
  "Applebot",
  "AhrefsBot",
  "SemrushBot",
  "bot",
  "crawler",
  "spider",
]

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true
  const ua = userAgent.toLowerCase()
  return BOT_AGENTS.some((bot) => ua.includes(bot.toLowerCase()))
}
