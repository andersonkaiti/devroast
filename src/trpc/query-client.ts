import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

const STALE_TIME_MS = 30 * 1000

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_MS },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })

export const getQueryClient = cache(makeQueryClient)
