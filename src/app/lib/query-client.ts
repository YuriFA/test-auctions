import { isApiError } from '@shared/api'
import { QueryClient } from '@tanstack/react-query'

// NOTE: 404 and 422 are deterministic failures — retrying them wastes a round
// trip and delays showing the correct error state to the user.
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && (error.status === 404 || error.status === 422)) {
    return false
  }
  return failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
