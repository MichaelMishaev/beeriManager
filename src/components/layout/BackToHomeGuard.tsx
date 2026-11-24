'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from '@/i18n/navigation'

const STORAGE_PREFIX = 'bm-base-entry:'

// Reset by every hard load; flips once the first (landing) pathname has been seen.
let landingSeen = false

/**
 * Most visits start on a deep page (WhatsApp link, home-screen shortcut, reload), so the page
 * is the first history entry and the phone's Back button would exit the app. On such a landing
 * we slide a home entry underneath the current page, so Back always ends on the base screen.
 *
 * The home entry gets a plain `{}` state (no `__NA`): Next's popstate handler treats that as a
 * foreign entry and hard-loads the URL, which is exactly what we want for it.
 */
export function BackToHomeGuard() {
  const locale = useLocale()
  const pathname = usePathname()

  useEffect(() => {
    // Only the landing page of a hard load may get a home entry; later client-side
    // navigations keep this mounted, and the history below them is already ours.
    if (landingSeen) return
    landingSeen = true

    const homePath = `/${locale}`
    const isHome = pathname === '/' || pathname === homePath || pathname === `${homePath}/`
    if (isHome) return

    const storageKey = `${STORAGE_PREFIX}${window.location.pathname}${window.location.search}`
    try {
      if (sessionStorage.getItem(storageKey)) return
      // The tab already has an app page below this one (hard link inside the app): Back is safe.
      const ref = document.referrer ? new URL(document.referrer) : null
      if (ref && ref.origin === window.location.origin && ref.pathname !== window.location.pathname) return
      sessionStorage.setItem(storageKey, '1')
    } catch {
      return
    }

    const current = window.history.state
    const here = window.location.href
    // Use the browser's native methods, not `window.history.replaceState/pushState`: Next's App Router
    // patches those on the instance (14.x) to sync every URL change into its router and to copy its own
    // state (`__NA`) into plain objects. Going through the patch made the router believe the page was `/he`,
    // so its history updater rewrote the address bar to `/he` (refresh then loaded the home page), and the
    // home entry stopped being a plain `{}` entry.
    History.prototype.replaceState.call(window.history, {}, '', homePath)
    History.prototype.pushState.call(window.history, current, '', here)
  }, [locale, pathname])

  return null
}
