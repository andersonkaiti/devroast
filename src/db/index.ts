import { env } from '@lib/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schemas'

const globalForDb = globalThis as unknown as {
  _db?: ReturnType<typeof drizzle>
}

const client = postgres(env.DATABASE_URL)
export const db =
  globalForDb._db ??
  drizzle(client, {
    schema,
    casing: 'snake_case',
  })

if (process.env.NODE_ENV !== 'production') globalForDb._db = db
