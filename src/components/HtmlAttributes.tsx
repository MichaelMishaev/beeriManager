'use client'

import { useEffect } from 'react'

interface HtmlAttributesProps {
  lang: string
  dir: 'ltr' | 'rtl'
  className?: string
}

export function HtmlAttributes({ lang, dir, className }: HtmlAttributesProps) {
  useEffect(() => {
    // Set attributes on <html> element
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    if (className) {
      document.documentElement.className = className
    }
  }, [lang, dir, className])

  return null // This component doesn't render anything
}
