'use client'

import { useEffect, useState } from 'react'

export type AdminCounts = {
  events: { upcoming: number; drafts: number }
  highlights: { active: number }
  tickets: { active: number }
  inbox: { feedback: number; ideas: number; survey: number }
}

// The bottom bar and the hub both ask for counts on the same page load.
// Share one in-flight request and reuse the answer for a few seconds.
const CACHE_TTL_MS = 5000
let inflight: Promise<AdminCounts | null> | null = null
let cached: { at: number; value: AdminCounts | null } | null = null

async function fetchCounts(): Promise<AdminCounts | null> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const res = await fetch(`/api/dashboard/admin-counts?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (!res.ok) return null
      const json = (await res.json()) as { success: boolean; data?: AdminCounts }
      return json.success && json.data ? json.data : null
    } catch {
      return null
    }
  })()

  const value = await inflight
  inflight = null
  // Failures are not cached, so the next mount retries.
  cached = value ? { at: Date.now(), value } : null
  return value
}

/**
 * Admin-only counts for the hub and the bottom bar.
 * On failure `counts` stays null and `isLoading` becomes false: callers omit the numbers.
 */
export function useAdminCounts(): { counts: AdminCounts | null; isLoading: boolean } {
  const [counts, setCounts] = useState<AdminCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchCounts().then((value) => {
      if (!active) return
      setCounts(value)
      setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return { counts, isLoading }
}
