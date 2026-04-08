import { submissions } from '@db/schemas'
import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(10).max(2000),
        lang: z.string().min(1),
        roastMode: z.enum(['honest', 'roast']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [submission] = await ctx.db
        .insert(submissions)
        .values({
          code: input.code,
          codePreview: input.code.trim().slice(0, 160),
          lang: input.lang,
          roastMode: input.roastMode,
          score: '0',
          roastText: '',
          isPublic: true,
        })
        .returning({ id: submissions.id })

      return { id: submission.id }
    }),
})
