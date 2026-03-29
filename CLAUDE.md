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

## Architecture

All application code lives under `src/`:

- `src/app/` — Next.js App Router: layouts, pages, and route segments go here
- `src/app/layout.tsx` — root layout; loads JetBrains Mono via `next/font/google` as `--font-jetbrains`
- `src/app/globals.css` — Tailwind entry point; overrides `--font-mono` via `@theme inline`
- `src/components/ui/` — generic UI components; import from `@/components/ui` (barrel)

## Commit conventions

Follows [Conventional Commits](https://www.conventionalcommits.org/) combined with [iuricode/padroes-de-commits](https://github.com/iuricode/padroes-de-commits).

**Format:** `<emoji> <type>: <description>`

- Single line only — no body, no footer, no blank lines
- Description in **imperative mood**, lowercase, no period at the end
- Subject line: max **4 words** after the type prefix
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
🎉 feat(core): initial project setup
✨ feat(auth): add auth flow
🐛 fix(auth): resolve token expiry
♻️ refactor(forms): extract form logic
📦 build(deps): add radix-ui deps
```

## Typography

Two font utilities only — no custom font classes:

| Class | Font | Use for |
|---|---|---|
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
