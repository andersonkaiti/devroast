# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version

This project uses **Next.js 16**, which may have breaking changes from earlier versions. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` for current API and conventions.

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm check      # lint + format (Biome, auto-fixes)
pnpm lint       # lint only
pnpm format     # format only
```

## Stack

- **Next.js 16** — App Router, React Compiler enabled (`reactCompiler: true`)
- **Tailwind CSS v4** — CSS-first config via `@import "tailwindcss"` in `globals.css`; no `tailwind.config.ts`
- **Biome 2** — replaces ESLint + Prettier; config in `biome.json`
- **TypeScript** — strict mode, path alias `@/*` → `src/*`
- **pnpm** — package manager
- **tRPC v11** — end-to-end type-safe API; routers in `src/trpc/routers/`, API route at `/api/trpc`
- **TanStack Query v5** — server-side dehydration + client-side cache; integrated via `@trpc/tanstack-react-query`
- **Drizzle ORM** — PostgreSQL ORM; schemas in `src/db/schemas/`, migrations via `drizzle-kit`
- **Zod v4** — schema validation; used for env vars (`src/lib/env.ts`) and tRPC input validation
- **Shiki v4** — syntax highlighting with the `vesper` theme; singleton in `src/lib/shiki-highlighter.ts`

## Architecture

All application code lives under `src/`:

- `src/app/` — Next.js App Router: layouts, pages, and route segments go here
- `src/app/layout.tsx` — root layout; wraps app in `TRPCReactProvider`; loads JetBrains Mono as `--font-jetbrains`
- `src/app/globals.css` — Tailwind entry point; overrides `--font-mono` via `@theme inline`
- `src/app/_components/` — page-specific components (not shared)
- `src/app/api/trpc/[trpc]/route.ts` — tRPC fetch adapter; handles GET + POST
- `src/components/ui/` — generic UI components; import from `@/components/ui` (barrel)
- `src/trpc/` — tRPC + TanStack Query wiring (see tRPC section below)
- `src/db/` — Drizzle ORM: `index.ts` (connection), `schemas/`, `migrations/`, `seed.ts`
- `src/lib/` — shared utilities: `utils.ts` (`cn()`), `env.ts` (Zod env), `shiki-highlighter.ts`, `language-utils.ts`
- `src/hooks/` — custom React hooks
- `src/context/` — React context providers

## tRPC + TanStack Query

### File layout

| File | Purpose |
| --- | --- |
| `src/trpc/init.ts` | tRPC context (DB via `cache()`), error formatting, `createTRPCRouter`, `baseProcedure` |
| `src/trpc/routers/_app.ts` | Root router; re-exports `AppRouter` type |
| `src/trpc/routers/<name>.ts` | Feature routers (one file per domain) |
| `src/trpc/query-client.ts` | `QueryClient` factory — 30 s stale time, dehydrates pending queries |
| `src/trpc/server.tsx` | Server-side helpers: `HydrateClient`, `prefetch()` for RSC hydration |
| `src/trpc/client.tsx` | `TRPCReactProvider`, `useTRPC()` hook for client components |

### Usage patterns

**Server Component (prefetch + hydrate):**

```tsx
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default async function Page() {
  void prefetch(trpc.leaderboard.stats.queryOptions())
  return <HydrateClient><ClientComponent /></HydrateClient>
}
```

**Client Component:**

```tsx
'use client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'

export function ClientComponent() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.leaderboard.stats.queryOptions())
}
```

**Adding a new router:** create `src/trpc/routers/<name>.ts` and register it in `src/trpc/routers/_app.ts`.

## Database (Drizzle ORM)

- Connection: `src/db/index.ts` — reads `DATABASE_URL` from `src/lib/env.ts`
- Schemas: `src/db/schemas/` — one file per table, barrel re-exported from `src/db/schemas/index.ts`
- Migrations: managed by `drizzle-kit`; output in `src/db/migrations/`
- Seeding: `src/db/seed.ts` — run with `tsx` via the `seed` script in `package.json`

## Commit conventions

Follows [Conventional Commits](https://www.conventionalcommits.org/) combined with [iuricode/padroes-de-commits](https://github.com/iuricode/padroes-de-commits).

**Format:** `<emoji> <type>: <description>`

- Single line only — no body, no footer, no blank lines
- Description in **imperative mood**, lowercase, no period at the end
- Be descriptive but concise — explain what changed and why in one line
- No `Co-authored-by`, `Co-Authored-By`, or any AI attribution

| Type | Emoji | When to use |
| --- | --- | --- |
| `feat` | ✨ | New feature |
| `fix` | 🐛 | Bug fix |
| `docs` | 📚 | Documentation only |
| `style` | 👌 | Formatting, no logic change |
| `refactor` | ♻️ | Restructure without behavior change |
| `perf` | ⚡ | Performance improvement |
| `test` | ✅ | Add or update tests |
| `build` | 📦 | Dependencies or build config |
| `ci` | 🧱 | CI/CD configuration |
| `chore` | 🔧 | Tooling, config, scripts |
| `raw` | 🗃️ | Data or config files |
| `cleanup` | 🧹 | Remove unused code |

**Special cases:**

| Emoji | When to use |
| --- | --- |
| 🎉 | Initial commit |
| 🚧 | Work in progress |
| 💥 | Revert changes |
| 🔒 | Security fix |

**Examples:**

```
🎉 feat(core): initial project setup with next.js and tailwind
✨ feat(auth): add google oauth flow with session persistence
🐛 fix(auth): resolve token expiry causing silent logout on refresh
♻️ refactor(forms): extract validation logic into reusable hook
📦 build(deps): add radix-ui for accessible dialog and tooltip primitives
```

## Typography

Two font utilities only — no custom font classes:

| Class | Font | Use for |
| --- | --- | --- |
| `font-mono` | JetBrains Mono | All code, labels, UI text |
| `font-sans` | System default | Descriptive / body text |

**How it works:** `next/font/google` loads JetBrains Mono and injects `--font-jetbrains` on `<html>`. `globals.css` maps it to Tailwind's built-in `--font-mono` via `@theme inline`, so the standard `font-mono` utility resolves to JetBrains Mono. `font-sans` is untouched and falls back to the OS system font stack.

**Never** create custom font utilities (e.g. `font-primary`, `font-ibm`). Override `--font-mono` or `--font-sans` in `@theme inline` if the font source changes.

## Tailwind class conventions

- Always use **canonical class names** — prefer `text-white` over `text-(--color-white)`, `bg-black` over `bg-(--color-black)`, etc.
- Inline CSS variable syntax (`text-(--var)`) is only valid when there is no canonical equivalent.
- `useSortedClasses` (Biome nursery) auto-sorts classes — run `pnpm check` to apply.

## Biome config highlights

- 2-space indent, single quotes, semicolons only when required (`asNeeded`)
- CSS parser: `tailwindDirectives: true` — understands `@theme`, `@layer`, `@apply`
- CSS linter: `noUnknownAtRules` disabled — Tailwind v4 at-rules are intentional
- `useSortedClasses` (nursery) auto-sorts Tailwind utility classes in `className`, `clsx`, `cn`, `cva`, `twMerge`
- Scoped to `src/**` only
