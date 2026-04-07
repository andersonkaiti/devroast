import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.url('DATABASE_URL must be a valid database connection URL'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
})

export const env = envSchema.parse(process.env)
