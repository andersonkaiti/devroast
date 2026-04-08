import { db } from '@db/index'
import { submissions } from '@db/schemas'
import { eq } from 'drizzle-orm'
import { ImageResponse } from 'takumi-js/response'
import { OgImage } from '@/lib/og-image'
import { getVerdict } from './_components/get-verdict'

export const alt = 'DevRoast result'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } },
  ).then((r) => r.text())

  const match = css.match(/src: url\((.+?)\) format\('woff2'\)/)
  if (!match) throw new Error(`WOFF2 URL not found for ${family}:${weight}`)

  return fetch(match[1]).then((r) => r.arrayBuffer())
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [submission] = await db
    .select({
      score: submissions.score,
      lang: submissions.lang,
      roastText: submissions.roastText,
      code: submissions.code,
    })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)

  if (!submission) {
    return new Response('Not Found', { status: 404 })
  }

  const score = Number(submission.score)
  const lineCount = submission.code.split('\n').length
  const { label, severity } = getVerdict(score)
  const verdictSlug = label.replace('verdict: ', '')

  const [jetbrainsRegular, jetbrainsBold, ibmPlexMono] = await Promise.all([
    fetchFont('JetBrains Mono', 400),
    fetchFont('JetBrains Mono', 900),
    fetchFont('IBM Plex Mono', 400),
  ])

  return new ImageResponse(
    <OgImage
      score={score}
      lang={submission.lang}
      lineCount={lineCount}
      roastQuote={submission.roastText}
      verdictSlug={verdictSlug}
      severity={severity}
    />,
    {
      ...size,
      fonts: [
        { name: 'JetBrains Mono', weight: 400, data: jetbrainsRegular },
        { name: 'JetBrains Mono', weight: 900, data: jetbrainsBold },
        { name: 'IBM Plex Mono', weight: 400, data: ibmPlexMono },
      ],
    },
  )
}
