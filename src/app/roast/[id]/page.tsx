import { CodeBlock } from '@components/ui'
import { db } from '@db/index'
import { submissions } from '@db/schemas'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { BundledLanguage } from 'shiki'
import { RoastStreamContent } from './_components/roast-stream-content'

export default async function RoastResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [submission] = await db
    .select({
      id: submissions.id,
      code: submissions.code,
      lang: submissions.lang,
    })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)

  if (!submission) {
    notFound()
  }

  const lineCount = submission.code.split('\n').length

  return (
    <RoastStreamContent
      id={submission.id}
      lang={submission.lang}
      lineCount={lineCount}
    >
      <CodeBlock
        code={submission.code}
        lang={submission.lang as BundledLanguage}
      />
    </RoastStreamContent>
  )
}
