'use client'

import { ReactNode, useEffect } from 'react'

interface MeetingsLayoutProps {
  children: ReactNode
}

export default function MeetingsLayout({ children }: MeetingsLayoutProps) {
  useEffect(() => {
    // Hide navigation and footer on this page
    const style = document.createElement('style')
    style.textContent = `
      nav, header, footer {
        display: none !important;
      }
      main {
        padding-top: 0 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return <>{children}</>
}
