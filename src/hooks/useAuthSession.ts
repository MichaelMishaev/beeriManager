// useAuthSession Hook
// Shared React Query cache for the current admin session, so components that
// mount together (Navigation + page content) share one /api/auth/session
// request instead of each firing their own fetch on mount.

import { useQuery } from '@tanstack/react-query'

interface AuthSession {
  authenticated: boolean
  user: { role: string } | null
}

async function fetchAuthSession(): Promise<AuthSession> {
  const response = await fetch('/api/auth/session')
  return response.json()
}

export function useAuthSession() {
  const query = useQuery({
    queryKey: ['auth-session'],
    queryFn: fetchAuthSession,
    staleTime: 1000 * 60, // 1 minute - avoid refetching on every remount
  })

  const isAdmin = query.data?.authenticated === true && query.data?.user?.role === 'admin'

  return {
    isAdmin,
    isLoading: query.isLoading,
    session: query.data
  }
}
