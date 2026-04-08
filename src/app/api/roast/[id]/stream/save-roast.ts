import { db } from '@db/index'
import { analysisFindings, submissions } from '@db/schemas'
import { eq } from 'drizzle-orm'
import type { RoastObject } from './schema'

export async function saveRoast(submissionId: string, object: RoastObject) {
  await db
    .update(submissions)
    .set({
      score: object.score.toFixed(1),
      roastText: object.quote,
      suggestedCode: object.suggestedCode,
    })
    .where(eq(submissions.id, submissionId))

  if (object.findings.length > 0) {
    await db.insert(analysisFindings).values(
      object.findings.map((f, idx) => ({
        submissionId,
        severity: f.severity,
        title: f.title,
        description: f.description,
        sortOrder: idx,
      })),
    )
  }
}
