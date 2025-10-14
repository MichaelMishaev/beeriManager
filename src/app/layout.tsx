import './globals.css'

/**
 * Root Layout - Only renders html/body wrapper
 * All locale-specific content is in [locale]/layout.tsx
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}