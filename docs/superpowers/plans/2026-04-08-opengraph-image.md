# OpenGraph Image for Roast Result Links — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-generate a 1200×630 OG image for each roast result page so shared links unfurl with a visual card.

**Architecture:** A native Next.js `opengraph-image.tsx` file co-located with the roast page queries the DB directly, renders a React component via Takumi (`takumi-js`), and returns a PNG. `generateMetadata` in `page.tsx` wires up the `<meta>` tags. No DB changes.

**Tech Stack:** `takumi-js`, Next.js 16 App Router, Drizzle ORM, Google Fonts API (for font ArrayBuffers)

---

## File Map

| File | Action | Responsibility |
| ------ | -------- | ---------------- |
| `src/lib/og-image.tsx` | Create | Pure React component — the OG image layout (inline styles only) |
| `src/app/roast/[id]/opengraph-image.tsx` | Create | Data fetching + Takumi ImageResponse |
| `src/app/roast/[id]/page.tsx` | Modify | Add `generateMetadata` export |

---

### Task 1: Install takumi-js

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
pnpm add takumi-js
```

Expected output: `packages/links` updated, no errors.

- [ ] **Step 2: Verify import resolves**

```bash
node -e "require('takumi-js/response')" 2>&1 || echo "CJS not supported, ESM only — OK"
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "📦 build(deps): add takumi-js for og image generation"
```

---

### Task 2: Create the OG image React component

**Files:**

- Create: `src/lib/og-image.tsx`

- [ ] **Step 1: Create the component**

Create `src/lib/og-image.tsx`:

```tsx
type Severity = 'critical' | 'warning' | 'good'

const verdictColors: Record<Severity, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  good: '#10B981',
}

interface OgImageProps {
  score: number
  lang: string
  lineCount: number
  roastQuote: string
  verdictSlug: string
  severity: Severity
}

export function OgImage({
  score,
  lang,
  lineCount,
  roastQuote,
  verdictSlug,
  severity,
}: OgImageProps) {
  const verdictColor = verdictColors[severity]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#0A0A0A',
        border: '1px solid #1f1f1f',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '64px',
          gap: '28px',
        }}
      >
        {/* logoRow */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 28, color: '#10B981' }}>{'>'}</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 28, color: '#FAFAFA' }}>devroast</span>
        </div>

        {/* scoreRow */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '4px' }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 160,
              fontWeight: 900,
              lineHeight: 1,
              color: '#F59E0B',
            }}
          >
            {score.toFixed(1)}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 56,
              color: '#8B8B8B',
              paddingBottom: '16px',
            }}
          >
            /10
          </span>
        </div>

        {/* verdictRow */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: verdictColor,
            }}
          />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, color: verdictColor }}>
            {verdictSlug}
          </span>
        </div>

        {/* langInfo */}
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 18, color: '#8B8B8B' }}>
          lang: {lang} · {lineCount} lines
        </span>

        {/* roastQuote */}
        <span
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 22,
            color: '#FAFAFA',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '900px',
          }}
        >
          &ldquo;{roastQuote}&rdquo;
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/og-image.tsx
git commit -m "✨ feat(og): add og image react component"
```

---

### Task 3: Create the opengraph-image route

**Files:**

- Create: `src/app/roast/[id]/opengraph-image.tsx`

- [ ] **Step 1: Create the file**

Create `src/app/roast/[id]/opengraph-image.tsx`:

```tsx
import { db } from '@db/index'
import { submissions } from '@db/schemas'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ImageResponse } from 'takumi-js/response'
import { getVerdict } from './_components/get-verdict'
import { OgImage } from '@/lib/og-image'

export const runtime = 'edge'
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

  if (!submission) notFound()

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
        { name: 'JetBrains Mono', data: jetbrainsRegular, weight: 400 },
        { name: 'JetBrains Mono', data: jetbrainsBold, weight: 900 },
        { name: 'IBM Plex Mono', data: ibmPlexMono, weight: 400 },
      ],
    },
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/roast/[id]/opengraph-image.tsx
git commit -m "✨ feat(og): add opengraph-image route for roast results"
```

---

### Task 4: Add generateMetadata to the roast page

**Files:**

- Modify: `src/app/roast/[id]/page.tsx`

- [ ] **Step 1: Add generateMetadata export**

The full updated `src/app/roast/[id]/page.tsx`:

```tsx
import { CodeBlock } from '@components/ui'
import { db } from '@db/index'
import { submissions } from '@db/schemas'
import { eq } from 'drizzle-orm'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { BundledLanguage } from 'shiki'
import { RoastStreamContent } from './_components/roast-stream-content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  return {
    openGraph: {
      images: [{ url: `/roast/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/roast/${id}/opengraph-image`],
    },
  }
}

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
      <div>
        <CodeBlock
          code={submission.code}
          lang={submission.lang as BundledLanguage}
        />
      </div>
    </RoastStreamContent>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/roast/[id]/page.tsx
git commit -m "✨ feat(og): add generateMetadata with opengraph image to roast page"
```

---

### Task 5: Verify

- [ ] **Step 1: Run build to check for type errors**

```bash
pnpm build
```

Expected: build completes with no TypeScript errors. The OG route is pre-rendered as edge.

- [ ] **Step 2: Test the image endpoint manually**

Start dev server (`pnpm dev`) and open in browser:
`http://localhost:3000/roast/<a-valid-id>/opengraph-image`

Expected: a 1200×630 PNG renders with score, verdict, lang, and quote.
