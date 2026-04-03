import 'server-only'
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

// biome-ignore lint/suspicious/noExplicitAny: tRPC query options have narrower generic bounds than QueryClient.prefetchQuery expects
export function prefetch(queryOptions: any) {
  return getQueryClient().prefetchQuery(queryOptions)
}
