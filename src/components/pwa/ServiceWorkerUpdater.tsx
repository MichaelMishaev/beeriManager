'use client'

import { useEffect } from 'react'

// next-pwa registers with skipWaiting so a new service worker activates
// immediately, but that alone never refreshes an already-open tab/PWA —
// it keeps running the old JS until the next full navigation. On an
// installed Android PWA that stays resumed across deploys, this can leave
// users stuck on a very old build indefinitely. Reload once when the new
// worker takes control so the open page actually picks up the new build.
export function ServiceWorkerUpdater() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let reloaded = false
    function handleControllerChange() {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  return null
}
