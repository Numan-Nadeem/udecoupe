import { z } from "zod"

export interface EnrichedData {
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Unknown"
  descriptionEnriched: string
  isFlagged: boolean
  flagReason: string | null
}

const enrichmentResponseSchema = z.object({
  category: z.string().trim().min(1).max(100),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "Unknown"]).catch("Unknown"),
  description_enriched: z.string().trim().max(3000).catch(""),
  is_flagged: z.boolean().catch(false),
  flag_reason: z.string().max(500).nullable().catch(null),
})

const ENRICH_TIMEOUT_MS = 45_000

export async function enrichCourse(input: {
  title: string
  description: string
  instructor?: string
}): Promise<EnrichedData> {
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not set")
  }

  // Truncate inputs to keep prompt size bounded
  const title = input.title.slice(0, 300)
  const description = input.description.slice(0, 2000)
  const instructor = (input.instructor || "Unknown").slice(0, 150)

  const prompt = `You are a course metadata enrichment agent. Given raw course data from an RSS feed, return ONLY a valid JSON object with no preamble or markdown.

Input:
Title: ${title}
Description: ${description}
Instructor: ${instructor}

Return ONLY this JSON structure, nothing else:
{
  "category": "string (e.g., Web Development, Data Science, Business)",
  "difficulty": "Beginner | Intermediate | Advanced | Unknown",
  "description_enriched": "string (80-120 words, rewritten for SEO)",
  "is_flagged": boolean,
  "flag_reason": "string or null"
}

Flag as true if any of:
- Title is generic, vague, or spammy
- Description is under 50 words or empty
- No instructor name or "Unknown"
- Content appears low quality or off-topic`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ENRICH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        "X-Title": "Udecoupe",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 700,
        temperature: 0.4,
      }),
    })
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const errBody = (await response.text()).slice(0, 300)
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errBody}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content || ""

  if (!text) {
    throw new Error("Empty response from OpenRouter")
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse enrichment response as JSON")
  }

  let rawParsed: unknown
  try {
    rawParsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error("Enrichment response contained invalid JSON")
  }

  const validated = enrichmentResponseSchema.safeParse(rawParsed)
  if (!validated.success) {
    throw new Error(`Enrichment response failed validation: ${validated.error.message}`)
  }

  return {
    category: validated.data.category,
    difficulty: validated.data.difficulty,
    descriptionEnriched: validated.data.description_enriched,
    isFlagged: validated.data.is_flagged,
    flagReason: validated.data.flag_reason,
  }
}
