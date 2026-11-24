import { Shield } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import AIFloatingButton from '@/components/features/ai-assistant/AIFloatingButton'
import { AdminBottomBar } from '@/components/features/admin'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Admin routes skip the next-intl middleware header, so the locale must be set explicitly
  setRequestLocale(params.locale)
  const t = await getTranslations({ locale: params.locale, namespace: 'admin.common' })

  // No client-side auth check needed - middleware already protects this route
  // If user reaches here, they're authenticated

  return (
    <div className="min-h-screen bg-[#f1f2f4]">
      {/* Admin indicator banner */}
      <div className="bg-primary text-white py-2 px-4 text-center text-sm">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" aria-hidden="true" />
          <span>{t('adminModeBanner')}</span>
        </div>
      </div>

      {/* Admin content: centred column, bottom padding clears the floating bar (bar ~76px + safe area) */}
      <div
        className="mx-auto w-full max-w-2xl px-4 pt-4"
        style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {children}
      </div>

      <AdminBottomBar />

      {/* AI Assistant Floating Button (raised above the bottom bar) */}
      <AIFloatingButton />
    </div>
  )
}
