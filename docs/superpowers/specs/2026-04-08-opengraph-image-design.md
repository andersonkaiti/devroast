# OG Image for Roast Result Links — Design Spec

**Date:** 2026-04-08  
**Status:** Approved

## Overview

Shareable links to roast results (`/roast/[id]`) will include an auto-generated OpenGraph image embedded in the page `<head>`. When shared on social platforms or messaging apps, the link unfurls showing a 1200×630 card with the roast score, verdict, language info, and a quote from the roast text.

## Architecture

Three new pieces, no DB changes:

### 1. `src/app/roast/[id]/opengraph-image.tsx`

Next.js 16 App Router OG image file. Exports the required edge runtime config and a default async function that:

- Receives `params: Promise<{ id: string }>`
- Queries the DB directly (no tRPC) for `score`, `lang`, `roastText`, `code` (to compute `lineCount`)
- Returns `notFound()` if the submission doesn't exist
- Loads JetBrains Mono and IBM Plex Mono font files as `ArrayBuffer` via `fetch`
- Renders using Takumi (`takumi-og`) which wraps Next.js `ImageResponse`

Exports:

```ts
export const runtime = 'edge'
export const alt = 'DevRoast result'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
```

Next.js serves this automatically at `GET /roast/[id]/opengraph-image`.

### 2. `generateMetadata` in `src/app/roast/[id]/page.tsx`

Adds an exported `generateMetadata` function that returns:

```ts
{
  openGraph: {
    images: [{ url: '/roast/[id]/opengraph-image', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/roast/[id]/opengraph-image']
  }
}
```

### 3. `src/lib/og-image.tsx`

A pure React component (no Tailwind — inline styles only, as required by `ImageResponse`). Accepts props:

```ts
type OgImageProps = {
  score: number
  lang: string
  lineCount: number
  roastQuote: string   // roastText truncated to ~150 chars at word boundary, wrapped in curly quotes
  verdict: string      // slug, e.g. "needs_serious_help"
  verdictColor: string // hex color based on severity
}
```

## Visual Design

Matches the "Screen 4 - OG Image" frame in `devroast.pen`.

**Frame:** 1200×630, background `#0A0A0A`, 1px inside border in dark border color, content clipped.

**Layout:** Single column, vertically centered, `padding: 64px`, `gap: 28px` between sections.

| Row | Content | Style |
| ----- | --------- | ------- |
| `logoRow` | `">"` + `"devroast"` | JetBrains Mono; `">"` in `#10B981` (green), `"devroast"` in near-white |
| `scoreRow` | `"3.5"` + `"/10"` | Score: 160px, weight 900, `#F59E0B` (amber, always fixed regardless of verdict); `/10`: 56px, `#8B8B8B` |
| `verdictRow` | 12×12 dot + verdict slug | Dot and text share `verdictColor` |
| `langInfo` | `"lang: javascript · 7 lines"` | JetBrains Mono, `#8B8B8B` |
| `roastQuote` | `"this code was written..."` | IBM Plex Mono, centered, `lineHeight: 1.5`, near-white |

**Verdict colors:**

- `critical` (score ≤ 4): `#EF4444`
- `warning` (score ≤ 8): `#F59E0B`
- `good` (score > 8): `#10B981`

The `getVerdict()` function in `src/app/roast/[id]/_components/get-verdict.ts` is reused to derive `verdict` and `severity`.

## Data Flow

```txt
GET /roast/[id]/opengraph-image
  → opengraph-image.tsx
  → DB query: score, lang, roastText, code
  → lineCount = code.split('\n').length
  → roastQuote = truncate(roastText, 150) wrapped in curly quotes
  → getVerdict(score) → { label, severity }
  → verdictColor from severity
  → OgImage component rendered via Takumi → PNG response
```

## Fonts

Loaded as `ArrayBuffer` inside `opengraph-image.tsx` via `fetch` from the Google Fonts API. No local font files needed.

- **JetBrains Mono** — logo, score, verdict, lang info
- **IBM Plex Mono** — roast quote

## Dependencies

- `takumi-og` — new package (`pnpm add takumi-og`)
- No DB migrations
- No new routes beyond the native OG file
- No changes to existing API or tRPC routers

## Out of Scope

- Caching the generated PNG (Next.js handles HTTP cache headers automatically via `ImageResponse`)
- Generating a separate AI summary for the quote
- OG images for other pages (home, leaderboard)
