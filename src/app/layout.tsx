import './globals.css'

/**
 * Root Layout - Only renders html/body wrapper
 * All locale-specific content is in [locale]/layout.tsx
 *
 * Note: Fonts are loaded via:
 * - Material Symbols: Self-hosted in public/fonts/ (loaded via globals.css @font-face)
 * - Other fonts: next/font/google in [locale]/layout.tsx (Next.js self-hosts at build time)
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