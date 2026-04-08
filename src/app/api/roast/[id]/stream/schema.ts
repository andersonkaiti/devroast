import { z } from 'zod'

export const roastSchema = z.object({
  score: z.number().min(1).max(10),
  quote: z.string(),
  findings: z
    .array(
      z.object({
        severity: z.enum(['critical', 'warning', 'good']),
        title: z.string(),
        description: z.string(),
      }),
    )
    .length(4),
  suggestedCode: z.string(),
})

export type RoastObject = z.infer<typeof roastSchema>
