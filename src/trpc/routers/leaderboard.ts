import { submissions } from '@db/schemas'
import { asc, avg, count, eq } from 'drizzle-orm'
import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'

export const leaderboardRouter = createTRPCRouter({
  stats: baseProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({
        total: count(),
        avgScore: avg(submissions.score),
      })
      .from(submissions)
      .where(eq(submissions.isPublic, true))

    return {
      total: result?.total ?? 0,
      avgScore: Number(result?.avgScore ?? 0),
    }
  }),

  top3: baseProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: submissions.id,
        code: submissions.code,
        codePreview: submissions.codePreview,
        lang: submissions.lang,
        score: submissions.score,
      })
      .from(submissions)
      .where(eq(submissions.isPublic, true))
      .orderBy(asc(submissions.score))
      .limit(3)
  }),

  top20: baseProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: submissions.id,
          code: submissions.code,
          lang: submissions.lang,
          score: submissions.score,
        })
        .from(submissions)
        .where(eq(submissions.isPublic, true))
        .orderBy(asc(submissions.score))
        .limit(input.limit)
    }),
})
