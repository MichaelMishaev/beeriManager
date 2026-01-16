'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { GroceryCreateForm } from '@/components/features/grocery'
import { ShareButton } from '@/components/ui/share-button'
import { X } from 'lucide-react'

const PRODUCTION_URL = 'https://beeri.online'

export default function GroceryCreatePage() {
  const router = useRouter()
  const t = useTranslations('grocery')

  const handleSuccess = (token: string) => {
    router.push(`/he/grocery/${token}/items`)
  }

  const shareData = {
    title: t('shareTitle'),
    text: t('shareText'),
    url: `${PRODUCTION_URL}/he/grocery`
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f8f7] dark:bg-[#102219] max-w-[430px] mx-auto shadow-2xl font-[family-name:var(--font-jakarta)]">
      {/* Header - iOS Style */}
      <header className="sticky top-0 z-50 flex items-center bg-[#f6f8f7]/80 dark:bg-[#102219]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="text-[#0d1b14] dark:text-white flex size-12 shrink-0 items-center cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {t('newList')}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <ShareButton
            shareData={shareData}
            variant="ghost"
            size="icon"
            className="text-[#0d1b14] dark:text-white hover:bg-[#e7f3ed] dark:hover:bg-[#1e3a2c]"
            iconSize="h-5 w-5"
          />
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 pb-24">
        <GroceryCreateForm onSuccess={handleSuccess} />
      </main>
    </div>
  )
}
