import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
  logger: {
    log: (...args) => console.log('React Query:', ...args),
    warn: (...args) => console.warn('React Query:', ...args),
    error: (...args) => console.error('React Query:', ...args),
  },
}); 