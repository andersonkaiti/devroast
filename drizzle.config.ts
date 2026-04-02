import { defineConfig } from 'drizzle-kit'
import { env } from './src/lib/env'

export default defineConfig({
  schema: './src/db/schemas/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
