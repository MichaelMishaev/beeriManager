'use client'

import { useEffect } from 'react'

/**
 * MaterialSymbols - Loads Google Material Symbols Outlined font
 * Used for icons throughout the grocery list feature and other components
 */
export function MaterialSymbols() {
  useEffect(() => {
    // Check if the font is already loaded
    const existingLink = document.querySelector('link[href*="Material+Symbols+Outlined"]')
    if (existingLink) return

    // Create and append the link element to head
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap'
    document.head.appendChild(link)

    return () => {
      // Cleanup not needed as we want the font to persist
    }
  }, [])

  return null
}
