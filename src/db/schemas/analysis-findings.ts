import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { severityEnum } from './enums'
import { submissions } from './submissions'

export const analysisFindings = pgTable(
  'analysis_findings',
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid()
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    severity: severityEnum().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    sortOrder: integer().default(0).notNull(),
  },
  (table) => [
    index('idx_analysis_findings_submission_id_sort_order').on(
      table.submissionId,
      table.sortOrder,
    ),
  ],
)
