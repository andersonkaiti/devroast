import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })

// React.cache memoizes per server request.
// On the client, TRPCReactProvider uses useState to keep the instance stable.
export const getQueryClient = cache(makeQueryClient)
