import './globals.css'

/**
 * Root Layout - Minimal wrapper for locale-specific layouts
 * Language, direction, and fonts are configured in [locale]/layout.tsx
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}