import 'server-only'
import type { FetchQueryOptions } from '@tanstack/react-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { createTRPCContext } from './init'
import { getQueryClient } from './query-client'
import { appRouter } from './routers/_app'

export { getQueryClient }

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
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

export function prefetch(queryOptions: FetchQueryOptions) {
  return getQueryClient().prefetchQuery(queryOptions)
}
