# Spec: tRPC + TanStack React Query

## Contexto

O devroast não tem nenhuma camada de API ainda. Toda a UI consome dados estáticos/mock. O tRPC vai ser a camada de backend tipada que conecta o banco de dados (Drizzle + PostgreSQL) às páginas Next.js, com suporte a prefetch em Server Components e consumo reativamente em Client Components.

---

## Decisões

| Decisão | Escolha | Racional |
| --- | --- | --- |
| Versão do tRPC | v11 | Compatível com TanStack React Query v5 e React 19 |
| Adapter Next.js | `fetchRequestHandler` | Padrão para App Router (não usa `createNextApiHandler`) |
| Integração React Query | `@trpc/tanstack-react-query` | Permite prefetch em RSC + consumo em Client Components |
| Contexto tRPC | `React.cache()` | Cria contexto por request de forma segura no App Router |
| Transformador de dados | Nenhum por agora | `superjson` só será adicionado se precisarmos de `Date`/`Map` no wire |
| Zod | Já instalado | Usado para validação de inputs em todos os procedures |

**Rejeitado**: Server Actions — tRPC dá tipagem end-to-end mais rica e é mais fácil de escalar com vários routers.

---

## Arquitetura

### Estrutura de arquivos

```txt
src/
  trpc/
    init.ts              # initTRPC + contexto (server-only)
    query-client.ts      # makeQueryClient() — fábrica de QueryClient
    server.tsx           # createCaller, HydrateClient, prefetch (server-only)
    client.tsx           # TRPCProvider ('use client')
    routers/
      _app.ts            # AppRouter raiz (exporta type AppRouter)
      submissions.ts     # procedures de submissions
      leaderboard.ts     # procedures do leaderboard
  app/
    api/trpc/[trpc]/
      route.ts           # fetchRequestHandler — handler HTTP
    layout.tsx           # ← adicionar TRPCProvider aqui
```

### Data flow

```txt
Server Component (RSC)
  └─ prefetch(trpc.leaderboard.list.queryOptions())
       └─ HydrateClient envia cache para o cliente
            └─ Client Component
                 └─ trpc.leaderboard.list.useQuery()  ← já hidratado, sem loading
```

Para chamadas server-only (ex: página de resultado que não precisa de reatividade):

```txt
Server Component
  └─ caller.submissions.getById({ id })  ← direto, sem passar pelo cache do React Query
```

### Procedures planejadas

**`submissions`**

| Procedure | Tipo | Input | Uso |
| --- | --- | --- | --- |
| `getById` | query | `{ id: uuid }` | Página `/roast/[id]` |
| `create` | mutation | `{ code, lang, roastMode }` | `CodeInput` ao clicar "roast" |

**`leaderboard`**

| Procedure | Tipo | Input | Uso |
| --- | --- | --- | --- |
| `list` | query | `{ limit?: number }` | Leaderboard e preview da home |
| `stats` | query | — | `StatsHint` (total, avg score) |

---

## Implementação

### 1. Dependências

```bash
pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query server-only client-only
```

### 2. `src/trpc/init.ts`

Inicializa o tRPC com contexto tipado. O contexto expõe o `db` (Drizzle) para todos os procedures.

```ts
import 'server-only'
import { db } from '@db'
import { initTRPC } from '@trpc/server'
import { cache } from 'react'
import { ZodError } from 'zod'

export const createTRPCContext = cache(async () => {
  return { db }
})

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const baseProcedure = t.procedure
```

### 3. `src/trpc/routers/_app.ts`

```ts
import { createTRPCRouter } from '../init'
import { leaderboardRouter } from './leaderboard'
import { submissionsRouter } from './submissions'

export const appRouter = createTRPCRouter({
  submissions: submissionsRouter,
  leaderboard: leaderboardRouter,
})

export type AppRouter = typeof appRouter
```

### 4. `src/trpc/routers/submissions.ts` e `leaderboard.ts`

Implementar com Drizzle queries usando `ctx.db`.

```ts
// submissions.ts
import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'

export const submissionsRouter = createTRPCRouter({
  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.submissions.findFirst({
        where: (s, { eq }) => eq(s.id, input.id),
        with: { findings: { orderBy: (f, { asc }) => asc(f.sortOrder) } },
      })
    }),

  create: baseProcedure
    .input(z.object({
      code: z.string().min(1).max(2000),
      lang: z.string(),
      roastMode: z.enum(['honest', 'roast']),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: chamar IA e persistir resultado
    }),
})
```

### 5. `src/app/api/trpc/[trpc]/route.ts`

```ts
import { appRouter } from '@trpc/routers/_app'
import { createTRPCContext } from '@trpc/init'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { NextRequest } from 'next/server'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
```

### 6. `src/trpc/query-client.ts`

```ts
import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}
```

### 7. `src/trpc/server.tsx`

```ts
import 'server-only'
import { createTRPCContext } from './init'
import { appRouter } from './routers/_app'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { cache } from 'react'
import { getQueryClient } from './query-client'

const getContext = cache(createTRPCContext)

export const trpc = createTRPCOptionsProxy({
  ctx: getContext,
  router: appRouter,
  queryClient: getQueryClient,
})

export function HydrateClient({ children }: { children: React.ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {children}
    </HydrationBoundary>
  )
}

export async function prefetch<T>(queryOptions: { queryKey: unknown; queryFn: () => Promise<T> }) {
  return getQueryClient().prefetchQuery(queryOptions)
}
```

### 8. `src/trpc/client.tsx`

```tsx
'use client'
import type { AppRouter } from './routers/_app'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { getQueryClient } from './query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'

const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
export { useTRPC }

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const trpcClient = trpc.createClient({
    links: [httpBatchLink({ url: '/api/trpc' })],
  })
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
```

### 9. `src/app/layout.tsx`

Envolver `{children}` com `<TRPCReactProvider>`.

### 10. Path alias `@trpc/*`

Adicionar em `tsconfig.json`:

```json
"@trpc/*": ["./src/trpc/*"]
```

### 11. Integrar nas páginas

- [ ] `src/app/roast/[id]/page.tsx` — trocar dados estáticos por `caller.submissions.getById({ id })`
- [ ] `src/app/leaderboard/page.tsx` — prefetch + `trpc.leaderboard.list.useQuery()`
- [ ] `src/app/_components/leaderboard-preview.tsx` — prefetch + `useSuspenseQuery`
- [ ] `src/app/_components/stats-hint.tsx` — prefetch + `trpc.leaderboard.stats.useQuery()`
- [ ] `src/app/_components/code-input.tsx` — `trpc.submissions.create.useMutation()`

---

## Non-Goals

- Autenticação/autorização nos procedures (sem auth por enquanto)
- WebSockets / subscriptions
- `superjson` (só adicionar se necessário)
- tRPC middleware (logger, rate-limit) na v1

---

## Checklist de Aceitação

- [ ] `GET /api/trpc/leaderboard.list` responde com JSON tipado
- [ ] Server Component consegue prefetchar e hidratar Client Component sem flash de loading
- [ ] `CodeInput` dispara mutation e redireciona para `/roast/[id]` com dados reais
- [ ] Página `/roast/[id]` exibe dados vindos do banco (não mais estáticos)
- [ ] Leaderboard e stats-hint exibem dados reais
- [ ] TypeScript não tem erros (`pnpm build` passa)
- [ ] `pnpm check` passa sem erros
