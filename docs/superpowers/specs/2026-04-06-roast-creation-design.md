# Roast Creation Feature — Design Spec

**Date:** 2026-04-06  
**Status:** Approved

## Overview

Allow users to submit a code snippet and receive an AI-generated code review — either honest or sarcastic (roast mode) — streamed progressively to the result page. The analysis includes a score, a one-liner quote, detailed findings, and a suggested fix diff.

Share roast functionality is explicitly out of scope for this iteration.

---

## End-to-End Flow

```txt
[CodeInput] → tRPC: roast.create → creates submission (placeholders) → returns { id }
     ↓
router.push('/roast/[id]')
     ↓
[RoastResultPage] mounts → GET /api/roast/[id]/stream (SSE)
     ↓
Route Handler: fetches submission → calls Gemini (stream) → parses sections
     ↓
Emits SSE events: { type: 'score' | 'quote' | 'finding' | 'diff_line' | 'done' | 'error' }
     ↓
[RoastStreamContent] updates state progressively as events arrive
     ↓
On 'done': Route Handler saves final data to DB (score, roastText, findings, suggestedCode)
```

---

## New Files

| Path | Purpose |
| --- | --- |
| `src/trpc/routers/roast.ts` | tRPC router with `create` mutation |
| `src/app/api/roast/[id]/stream/route.ts` | SSE route handler; calls Gemini and streams parsed events |
| `src/app/roast/[id]/_components/roast-stream-content.tsx` | Client component that consumes SSE and renders progressively |

**Modified files:**

- `src/trpc/routers/_app.ts` — register `roastRouter`
- `src/lib/env.ts` — add `GEMINI_API_KEY`

**New packages:**

- `ai` — Vercel AI SDK
- `@ai-sdk/google` — Gemini provider

---

## AI Prompt

**System prompt by mode:**

- `honest`: "You are a senior engineer giving direct, constructive code review."
- `roast`: "You are a brutally sarcastic senior engineer. Roast this code with dark humor but still be technically accurate."

**Expected response format (tagged sections for progressive parsing):**

```html
<score>3.5</score>
<quote>"this code looks like it was written during a power outage... in 2005."</quote>
<finding severity="critical">
  <title>using var instead of const/let</title>
  <description>var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.</description>
</finding>
<finding severity="warning">...</finding>
<finding severity="good">...</finding>
<suggested_code>
const calculateTotal = (items) => items.reduce((sum, item) => sum + item.price, 0)
</suggested_code>
```

**Constraints instructed to the model:**

- Score: 1.0–10.0 with one decimal place
- Exactly 4 findings (mix of critical, warning, good)
- `suggested_code`: corrected snippet only, same language, no markdown fences
- Quote: single sentence, in double quotes, lowercase

**Parsing strategy:**

- Accumulate streamed text in a buffer
- Detect open/close tags via string matching as text arrives
- Emit SSE event when a closing tag is detected
- `diff_line` events are generated server-side by comparing original `code` with `suggested_code` line by line

---

## Client-Side Streaming UX

The `RoastStreamContent` component connects to the SSE endpoint on mount and updates state as events arrive. Sections appear progressively:

| Event received | What appears on screen |
| --- | --- |
| Connecting | Full-page skeleton |
| `score` + `quote` | Score ring, badge, quote (hero section) |
| `finding` (accumulates) | Analysis cards appear one by one |
| `suggested_code` | Diff section appears with lines |
| `done` | Share button visible (disabled — out of scope) |
| `error` | Error message with back-to-home button |

**CodeInput loading state:**

- On click, button changes to `"$ roasting..."` and disables while `roast.create` mutation runs
- On success, immediately `router.push('/roast/[id]')`

---

## Database

**On `roast.create` (tRPC mutation):** insert submission with placeholders:

- `code`, `lang`, `roastMode` from client input
- `codePreview`: first 160 chars of code (trimmed)
- `score`: `"0"` (placeholder)
- `roastText`: `""` (placeholder)
- `isPublic`: `true`

**On stream `done` (Route Handler):**

- Update submission with final `score` and `roastText` (the quote)
- Insert `analysis_findings` rows with `sortOrder` matching arrival order

**No migrations required** — existing `submissions` and `analysis_findings` schemas cover all fields.

---

## Validation (`roast.create` input via Zod)

| Field | Rule |
| --- | --- |
| `code` | string, min 10 chars, max 2000 chars |
| `lang` | any valid `BundledLanguage` string from Shiki (e.g. `"typescript"`, `"python"`, `"js"`) |
| `roastMode` | `"honest" \| "roast"` |

The 2000-char limit is already enforced in `CodeInput` client-side; the tRPC layer enforces it server-side as well.

---

## Out of Scope

- Share roast functionality
- Authentication / user accounts
- Private submissions (`isPublic: false`)
