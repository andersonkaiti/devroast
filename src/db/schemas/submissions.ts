import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { roastModeEnum } from './enums'

export const submissions = pgTable(
  'submissions',
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull(),
    codePreview: varchar({ length: 160 }).notNull(),
    lang: text().notNull(),
    roastMode: roastModeEnum().notNull(),
    score: numeric({ precision: 3, scale: 1 }).notNull(),
    roastText: text().notNull(),
    isPublic: boolean().default(true).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_submissions_score').on(table.score),
    index('idx_submissions_created_at').on(table.createdAt),
  ],
)
