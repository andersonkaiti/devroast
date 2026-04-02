import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.url('DATABASE_URL must be a valid database connection URL'),
})

export const env = envSchema.parse(process.env)
